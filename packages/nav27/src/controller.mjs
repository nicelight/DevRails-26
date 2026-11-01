import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import Ajv from 'ajv';
import { Store, projectPath } from './store.mjs';
import { replySchema } from './reply.mjs';

const selected = { design: false, local_checks: false, red_verify: false, feature_red_verify: false, verify: [], protocols: [] };
const validateReply = new Ajv().compile(replySchema);
const negative = value => {
  if (!value || typeof value !== 'object') return false;
  if (value.result === 'failed' || ['FAIL', 'REJECT', 'semantic-fail', 'semantic-failure'].includes(value.verdict)) return true;
  if (Array.isArray(value.candidate_findings) && value.candidate_findings.length) return true;
  return Object.entries(value).some(([key, item]) => key !== 'disposition' && (Array.isArray(item) ? item.some(negative) : negative(item)));
};

export class Controller {
  constructor(project, adapter, routes) {
    this.store = new Store(project); this.adapter = adapter; this.routes = structuredClone(routes);
    this.queue = Promise.resolve(); this.work = null;
  }
  serial(action) {
    const pending = this.queue.then(action);
    this.queue = pending.catch(() => {});
    return pending;
  }
  async open() {
    await this.store.acquire();
    try {
      this.run = await this.store.readRun() ?? { version: 1, id: randomUUID(), revision: 0, phase: 'ready', hold: null, taskId: null, operation: null, mainSession: null, settings: { revision: 0, selected, routes: this.routes }, blocker: null };
      if (this.run.phase === 'running') {
        const record = await this.store.task(this.run.taskId);
        const evidence = record.task.verify.find(item => item.stage === 'workflow' && item.attempt === this.run.operation.attempt);
        if (evidence?.implementation === 'complete' && !this.run.blocker) {
          this.run.phase = 'stopped'; this.run.hold = 'pause'; this.run.blocker = null;
        } else {
          this.run.phase = 'blocked'; this.run.hold = 'stop';
          this.run.blocker = 'Interrupted execution: reconcile actual effects with the task owner before continuing. No automatic replay.';
        }
      }
      this.run.mainSession = await this.adapter.openMain(this.store.root, this.run.mainSession, this.run.settings.routes.main);
      await this.save(); return this.snapshot();
    } catch (error) { await this.store.release(); throw error; }
  }
  snapshot() { return structuredClone(this.run); }
  async save() { this.run.revision++; await this.store.saveRun(this.run); }
  async control(request) {
    let launch;
    const view = await this.serial(async () => {
      if (request.runId !== this.run.id || request.revision !== this.run.revision) throw new Error('Stale run/revision; refresh the snapshot');
      if (request.action === 'pause' || request.action === 'red') {
        this.run.hold = request.action;
        if (this.run.phase === 'ready') this.run.phase = 'stopped';
        await this.save(); return this.snapshot();
      }
      if (request.action === 'stop') {
        this.run.hold = 'stop';
        if (this.run.phase === 'ready') this.run.phase = 'stopped';
        await this.save();
        // The durable hold precedes cancellation; the await never occupies the reducer.
        void this.adapter.stop().catch(error => this.recordTechnicalError(error));
        return this.snapshot();
      }
      if (!['play', 'green'].includes(request.action)) throw new Error('Unknown Nav control');
      if (this.run.phase === 'running' || this.work) throw new Error('An execution is already admitted');
      if (this.run.phase === 'done' || this.run.phase === 'blocked') throw new Error(this.run.blocker ?? 'Run has completed');
      if (this.run.hold === 'red' && request.action !== 'green') throw new Error('Red requires green');
      if (request.action === 'green' && this.run.hold === 'stop') throw new Error('Stop requires Play reconciliation');
      const taskId = this.run.taskId ?? request.taskId;
      if (!taskId) throw new Error('Select one prepared indexed task');
      const record = await this.store.task(taskId);
      const previous = record.task.verify.find(item => item.stage === 'workflow' && item.attempt === this.run.operation?.attempt);
      if (previous?.implementation === 'complete') {
        this.run.hold = null;
        await this.closeTask(record, previous);
        await this.save(); return this.snapshot();
      }
      await this.preflight(record.task);
      this.run.hold = null;
      const operation = { id: randomUUID(), attempt: randomUUID(), command: 'exe', childSession: randomUUID(), routes: structuredClone(this.run.settings.routes), selected: structuredClone(this.run.settings.selected) };
      record.task.verify.push({ stage: 'workflow', attempt: operation.attempt, selected: operation.selected });
      record.task.status = 'in_progress';
      this.run.taskId = taskId; this.run.operation = operation; this.run.phase = 'running';
      // Prepare identity before any model/tool effects; evidence owner precedes position.
      await this.store.saveTask(record); await this.save();
      launch = { operation, task: record.task };
      return this.snapshot();
    });
    if (launch) {
      this.work = this.execute(launch).finally(() => { this.work = null; });
    }
    return view;
  }
  async preflight(task) {
    if (!['ready', 'planned'].includes(task.status)) throw new Error(`Task is not runnable: ${task.status}`);
    if (!task.purpose?.trim() || !task.success_outcome?.trim()) throw new Error('Task needs purpose and observable success_outcome');
    if (task.verify.some(negative)) throw new Error('Retained negative evidence requires owner disposition; this slice does not resolve it');
    if (task.gates.some(gate => gate.required)) throw new Error('Required gates need an execution-capable slice; file-only all-off execution cannot satisfy them');
    if (JSON.stringify(task).includes('PLANNING_RECONCILIATION_REQUIRED')) throw new Error('Task planning requires reconciliation');
    for (const id of task.depends_on) {
      const dependency = await this.store.task(id);
      if (!['done', 'done_for_prod'].includes(dependency.task.status)) throw new Error(`Blocked dependency ${id}`);
    }
    for (const path of task.normative_inputs) await projectPath(this.store.root, path);
    for (const path of ['.memory-bank/workflows/autonomy-policy.md', '.memory-bank/workflows/tier-policy.md']) await projectPath(this.store.root, path);
    if (['T2', 'T3'].includes(task.tier)) throw new Error('This first file-only slice admits T0/T1 tasks; T2/T3 admission is not implemented');
    // Existing initialized attempts require reconciliation, never a silent new attempt.
    if (task.verify.some(item => item?.stage === 'workflow')) throw new Error('Existing workflow attempt requires reconciliation');
  }
  async execute({ operation, task }) {
    let result;
    try {
      const contract = await readFile(this.adapter.commandPath('exe'), 'utf8');
      result = await this.adapter.execute({ project: this.store.root, operation, task, contract, outputSchema: replySchema });
    } catch (error) { result = { stopReason: 'error', diagnostic: error.message }; }
    await this.serial(async () => {
      const record = await this.store.task(task.id);
      const evidence = record.task.verify.find(item => item.stage === 'workflow' && item.attempt === operation.attempt);
      if (!evidence || evidence.implementation) return;
      if (result.stopReason !== 'completed' || !validateReply(result.structured) || !result.structured.feedback.message.trim() || !result.structured.subject.evidence.length || result.structured.subject.evidence.some(item => !item.trim())) {
        this.run.phase = 'blocked'; this.run.blocker = result.diagnostic ?? `Execution ${result.stopReason}: no valid structured result; reconcile partial effects`;
        await this.save(); return;
      }
      const reply = result.structured;
      evidence.implementation = reply.subject.implementation;
      evidence.evidence = reply.subject.evidence;
      evidence.local_checks = 'skipped';
      if (reply.feedback.flow === 'needs_decision') {
        this.run.blocker = reply.feedback.message;
        // Persist the unresolved decision before evidence, without advancing position.
        await this.save();
      }
      await this.store.saveTask(record);
      const current = this.run.operation?.id === operation.id;
      if (!current) return;
      if (reply.feedback.flow === 'needs_decision' || evidence.implementation !== 'complete' || negative(record.task.verify)) {
        this.run.phase = 'blocked'; this.run.blocker = reply.feedback.message;
      } else if (this.run.hold) {
        this.run.phase = 'stopped';
      } else {
        await this.closeTask(record, evidence);
      }
      await this.save();
    });
  }
  async closeTask(record, evidence) {
    if (record.task.verify.some(negative)) throw new Error('Negative evidence blocks closure');
    if (evidence.implementation !== 'complete') throw new Error('Implementation is not complete');
    evidence.verification = 'skipped'; evidence.red_verification = 'skipped';
    record.task.status = 'done'; await this.store.saveTask(record);
    this.run.phase = 'done'; this.run.blocker = null;
  }
  async recordTechnicalError(error) {
    await this.serial(async () => { this.run.blocker = error.message; await this.save(); });
  }
  async dispose() {
    await this.adapter.stop(); await this.work; await this.adapter.dispose(); await this.store.release();
  }
}
