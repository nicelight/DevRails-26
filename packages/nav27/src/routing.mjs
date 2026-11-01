import { randomUUID } from 'node:crypto';
import { readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import Ajv from 'ajv';
import { commands, commandSchema, ordinary, negativeVerdicts } from './commands.mjs';
import { projectPath, json } from './store.mjs';
const runFile = promisify(execFile);
const pipelines = ['grill-me', 'constitution', 'write-prd', 'spec-init', 'prd-to-features', 'spec-design', 'spec-auto', 'feature-to-tasks', 'foundation-to-tasks'];
const taskCommands = ['exe', 'autopilot', 'multipilot'];
const exists = path => access(path).then(() => true, () => false);

/** Non-task subject operations use the same admitted leg and native work loop. */
export class Routing {
  constructor(controller) { this.c = controller; }
  get run() { return this.c.run; }
  async start(request) {
    let launch;
    const view = await this.c.serial(async () => {
      this.c.assertRevision(request);
      if (this.c.work || this.run.phase === 'running' || this.run.pending || this.run.holds.length) throw new Error('Command start requires a free station without pending decisions or holds');
      if (!commands[request.command]) throw new Error('Unknown canonical command');
      if (this.run.blocker) throw new Error('Resolve the current blocker through its pending owner before starting another command');
      if (this.run.operation?.unreconciled) throw new Error('Reconcile unfinished operation before starting another command');
      const inputs = structuredClone(request.inputs ?? {});
      this.run.flow = { inputs, pipeline: pipelines.includes(request.command), next: request.command, features: inputs.feature ? [inputs.feature] : [], boundary: null };
      launch = await this.admit(request.command);
      await this.c.save(); return this.c.snapshot();
    });
    if (launch) this.c.start(launch);
    return view;
  }
  async resources(command) {
    const inventory = await json(this.c.adapter.resourcePath('commands.json'));
    if (inventory.length !== Object.keys(commands).length || inventory.some(item => !commands[item.name])) throw new Error('Canonical command inventory differs from host mapping');
    const spec = inventory.find(item => item.name === command);
    if (!spec) throw new Error(`Missing packaged command ${command}`);
    const contract = this.c.adapter.commandPath(command);
    for (const locator of spec.resources) await access(join(dirname(contract), locator));
    return readFile(contract, 'utf8');
  }
  async admit(command) {
    const flow = this.run.flow;
    if (command === 'autonomous' || command === 'multiagentic') { this.run.autonomous = command === 'autonomous' || this.run.autonomous; flow.pipeline = true; command = 'start'; }
    if (command === 'start') {
      if (!await exists(join(this.c.store.root, '.memory-bank/schemas/task.schema.json'))) return this.prepare('mb-init');
      if (this.run.taskId && !['done', 'done_for_prod'].includes((await this.c.store.task(this.run.taskId)).task.status)) { const id = this.run.taskId; flow.next = null; flow.execution = true; this.run.taskId = null; return this.c.advance(id); }
      const runnable = await this.c.store.runnable().catch(() => null);
      if (runnable) { flow.next = null; flow.execution = true; this.run.taskId = null; return this.c.advance(runnable.task.id); }
      // Product source must be explicit; existing code alone is never a product target.
      if (flow.inputs.source?.trim()) { flow.pipeline = true; return this.prepare('write-prd'); }
      this.run.phase = 'blocked'; this.run.blocker = 'Supply product source or choose the unfinished owner; existing code is not accepted product intent.';
      this.run.pending = { id: randomUUID(), message: this.run.blocker, operation: null };
      await this.c.semantic.requestProposal(this.run.blocker); return;
    }
    if (['verify', 'red-verify'].includes(command) && !flow.boundary) {
      if (command === 'red-verify' && flow.inputs.feature) flow.boundary = 'feature';
      else {
        const record = await this.c.store.task(flow.inputs.taskId ?? this.run.taskId);
        const evidence = record.task.verify.filter(item => item.stage === 'workflow').at(-1);
        const field = command === 'verify' ? 'verification' : 'red_verification';
        if (record.task.status !== 'in_progress' || !evidence || evidence[field] !== undefined) throw new Error('Verification requires an unfinished task attempt with this result still absent');
        if (command === 'verify' && !evidence.selected.verify.length || command === 'red-verify' && !evidence.selected.red_verify) throw new Error('Requested verification is not selected');
        flow.next = null; flow.execution = true; this.run.taskId = record.task.id;
        return this.c.admit(record, evidence, command);
      }
    }
    if (taskCommands.includes(command)) {
      flow.next = null; flow.execution = true;
      if (this.run.operation?.kind === 'subject') this.run.taskId = null;
      return this.c.advance(flow.inputs.taskId);
    }
    if (['feature-to-tasks', 'spec-auto'].includes(command)) {
      flow.inputs.feature ??= flow.features[0];
      if (!/^FT-\d{3}$/.test(flow.inputs.feature ?? '') || flow.inputs.feature === 'FT-000') throw new Error(`${command} requires one product feature`);
    }
    if (command === 'foundation-to-tasks') { flow.productFeature = flow.inputs.feature; flow.inputs.feature = 'FT-000'; }
    if (command === 'write-prd' && !flow.inputs.source?.trim() && !flow.inputs.sourceRef) throw new Error('write-prd requires accepted product source or sourceRef');
    for (const locator of flow.inputs.contextRefs ?? []) await projectPath(this.c.store.root, locator.split('#')[0]);
    if (flow.inputs.sourceRef) await projectPath(this.c.store.root, flow.inputs.sourceRef.split('#')[0]);
    return this.prepare(command);
  }
  async prepare(command) {
    await this.resources(command);
    const routes = structuredClone(this.run.settings.routes);
    const diagnostic = commands[command].family === 'review/diagnostics' || ['fill', 'context-manifest', 'creator-vibe', 'find-skills', 'discuss', 'kiss-architect'].includes(command);
    const role = diagnostic ? 'diagnostic' : 'subject';
    // The configured main route is the selected semantic/read-only family route.
    routes.review = routes.main;
    if (command !== 'mb-init') await this.c.adapter.validateRoute(routes[diagnostic ? 'review' : 'exe']);
    const operation = { id: randomUUID(), kind: 'subject', command, role, routes, selected: structuredClone(this.run.settings.selected), inputs: structuredClone(this.run.flow.inputs), peers: [{ role, session: randomUUID(), state: 'prepared' }] };
    this.run.flow.next = command; this.run.flow.after = null;
    this.run.operation = operation; this.run.phase = 'running'; this.run.blocker = null;
    if (this.run.decision?.admission === 'pending') this.run.decision.admission = operation.id;
    return { operation: structuredClone(operation), task: {} };
  }
  async execute(launch) {
    const { operation } = launch;
    let result;
    try {
      if (operation.command === 'mb-init') {
        await runFile(process.execPath, [this.c.adapter.resourcePath('skills/_shared/scripts/init-mb.js'), ...(operation.inputs.sync ? ['--sync'] : [])], { cwd: this.c.store.root });
        result = { stopReason: 'completed', structured: { feedback: { flow: 'continue', message: 'Existing Memory Bank generator completed.' }, subject: { complete: true, summary: 'Generated/synced framework resources.', evidence: ['Generator exit code 0.'], outputs: ['.memory-bank/schemas/task.schema.json'] } } };
      } else result = await this.c.adapter.execute({ project: this.c.store.root, operation: { ...operation, childSession: operation.peers[0].session }, task: {}, contract: `${await this.resources(operation.command)}\n\nInputs and prior accepted source:\n${JSON.stringify(operation.inputs)}\nsubject.complete states whether this owner's actual assigned work is finished; a native capture alone does not prove completion. The host owns ordinary next. Preserve command-specific ownership and verdicts. Subject.outputs lists actual project locators written/read as deliverables. Return planning drafts in subject.tasks instead of writing the host-owned registry.`, outputSchema: commandSchema(operation.command) });
    } catch (error) { result = { stopReason: 'error', diagnostic: error.message }; }
    return this.c.serial(async () => {
      if (this.run.operation?.id !== operation.id) return;
      const peer = this.run.operation.peers[0];
      if (result.stopReason !== 'completed' || !new Ajv().compile(commandSchema(operation.command))(result.structured)) {
        peer.state = 'interrupted'; peer.diagnostic = result.diagnostic ?? 'Missing native structured subject result'; this.run.operation.unreconciled = true;
        this.run.phase = 'interrupted'; this.run.blocker = peer.diagnostic; await this.c.save(); return;
      }
      const { feedback, subject } = result.structured;
      if (!subject.summary.trim() || !subject.evidence.length || subject.evidence.some(item => !item.trim())) throw new Error('Subject operation needs substantive evidence');
      for (const locator of subject.outputs) await projectPath(this.c.store.root, locator.split('#')[0]);
      if (subject.tasks && feedback.flow === 'continue') await this.c.store.importTasks(subject.tasks, operation.inputs.feature);
      if (subject.features) {
        if (!subject.features.length || subject.features.some(id => !/^FT-\d{3}$/.test(id) || id === 'FT-000')) throw new Error('Decomposition must identify actual product features');
        this.run.flow.features = [...new Set(subject.features)]; this.run.flow.inputs.feature ??= subject.features[0];
      }
      let evidenceOwner;
      if (operation.command === 'red-verify' && this.run.flow.boundary === 'feature') {
        const index = await json(join(this.c.store.root, '.memory-bank/tasks/index.json'));
        const records = await Promise.all(index.tasks.map(row => this.c.store.task(row.id)));
        const owner = records.find(row => row.task.feature === operation.inputs.feature);
        if (!owner) throw new Error('Feature review requires an indexed feature task evidence owner');
        owner.task.verify.push({ stage: 'feature_red_verify', feature: operation.inputs.feature, verdict: subject.verdict, evidence: subject.evidence });
        evidenceOwner = { taskId: owner.task.id, index: owner.task.verify.length - 1 };
        await this.c.store.saveTask(owner);
      }
      const accepted = { complete: subject.complete, evidenceOwner, operation: operation.id, command: operation.command, session: peer.session, outputs: subject.outputs, verdict: subject.verdict, impact: subject.impact, affectedFeatures: subject.affectedFeatures, feature: operation.inputs.feature, foundation: subject.foundation };
      this.run.boundaries ??= []; this.run.boundaries.push(accepted);
      peer.state = 'complete'; this.run.operation.subjectComplete = subject.complete; this.run.operation.unreconciled = false;
      this.run.flow.after = operation.id; this.run.flow.next = null;
      if (subject.impact) {
        this.run.flow.features = subject.affectedFeatures; this.run.flow.inputs.feature = subject.affectedFeatures[0];
      }
      if (!subject.complete || feedback.flow === 'needs_decision' || negativeVerdicts.has(subject.verdict)) {
        this.run.phase = 'blocked'; this.run.blocker = feedback.message; this.run.pending = { id: randomUUID(), operation: operation.id, message: feedback.message };
        await this.c.save(); await this.c.semantic.requestProposal(`${operation.command}: ${feedback.message}. Retained verdict ${subject.verdict ?? 'none'}. Scope subject:${operation.id}.`); return;
      }
      if (this.run.holds.length || this.run.pending) { this.run.phase = this.run.pending ? 'blocked' : 'stopped'; await this.c.save(); return; }
      const next = await this.advance(); await this.c.save(); return next;
    });
  }
  async advance() {
    const flow = this.run.flow;
    if (flow.after) {
      const boundary = this.run.boundaries.find(item => item.operation === flow.after);
      if (negativeVerdicts.has(boundary.verdict) && !boundary.disposition) {
        this.run.phase = 'blocked'; this.run.blocker = `Retained ${boundary.verdict} requires scoped disposition`;
        this.run.pending = { id: randomUUID(), operation: boundary.operation, message: this.run.blocker };
        await this.c.semantic.requestProposal(`${this.run.blocker}; scope subject:${boundary.operation}`); return;
      }
      flow.after = null;
      flow.next = flow.returnTo && !['feature-to-tasks', 'foundation-to-tasks', 'review-tasks-plan', 'mb-doctor', 'technical-premortem'].includes(boundary.command) ? null : ordinary(boundary.command, flow, this.run.settings, boundary);
      if (boundary.impact && boundary.impact !== 'none') flow.next = this.run.settings.selected.design ? 'spec-auto' : 'feature-to-tasks';
    }
    if (flow.next) return this.admit(flow.next);
    if (flow.returnTo) {
      const back = flow.returnTo; flow.returnTo = null;
      this.run.taskId = back.taskId;
      if (back.operation?.kind === 'subject') { flow.next = back.operation.command; flow.inputs = back.operation.inputs; return this.admit(flow.next); }
      if (back.operation) {
        this.run.operation = back.operation; flow.execution = true;
        await this.c.reconcile();
        if (this.run.phase === 'blocked') await this.c.semantic.requestProposal(this.run.blocker);
        if (this.run.phase === 'interrupted' || this.run.phase === 'blocked') return;
        return this.c.advance();
      }
    }
    if (flow.boundary === 'feature') {
      const completed = flow.inputs.feature;
      flow.features = flow.features.filter(id => id !== completed);
      flow.inputs.feature = flow.features[0]; flow.boundary = null;
      if (flow.features.length) return this.admit(this.run.settings.selected.design ? 'spec-auto' : 'feature-to-tasks');
    }
    if (flow.queue) { this.run.flow = null; this.run.taskId = null; return this.c.advance(); }
    this.run.phase = 'done'; this.run.blocker = null;
  }
  async afterExecution() {
    const flow = this.run.flow;
    flow.execution = false;
    if (flow.returnTo) { flow.next = null; return this.advance(); }
    if (flow.inputs.feature === 'FT-000') {
      flow.inputs.feature = flow.productFeature ?? flow.features[0];
      if (flow.inputs.feature) return this.admit(this.run.settings.selected.design ? 'spec-auto' : 'feature-to-tasks');
    }
    if (!flow.inputs.feature) { this.run.phase = 'done'; return; }
    flow.boundary = 'feature';
    return this.admit(this.run.settings.selected.feature_red_verify ? 'red-verify' : 'mb-sync');
  }
  async validateReroute(pending) {
    const target = pending.proposal.target;
    if (!commands[target]) throw new Error('Proposal target is not a canonical command');
    await this.resources(target);
    if (this.run.flow?.returnTo) throw new Error('Resolve the current bounded return before another reroute');
  }
  async reroute(pending) {
    await this.validateReroute(pending);
    const target = pending.proposal.target;
    this.run.flow ??= { inputs: {}, pipeline: false, features: [] };
    if (target !== this.run.operation?.command) this.run.flow.returnTo = { taskId: this.run.taskId, operation: structuredClone(this.run.operation) };
    this.run.flow.inputs = { ...this.run.flow.inputs, source: pending.proposal.question, scope: pending.proposal.scope, contextRefs: [], feature: this.run.flow.inputs.feature };
    this.run.flow.execution = false; this.run.flow.after = null; this.run.flow.next = target;
  }
}
