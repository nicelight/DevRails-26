import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import Ajv from 'ajv';
import { Store, projectPath } from './store.mjs';
import { schemaFor, substantive } from './reply.mjs';
import { SemanticMain } from './semantic.mjs';
import { Routing } from './routing.mjs';

const protocols = ['run.md', 'context.md', 'plan.md', 'progress.md', 'verification.md', 'handoff.md', 'red-verification.md'];
const defaults = { design: false, local_checks: true, red_verify: false, feature_red_verify: false, verify: [], protocols: [] };
const disposition = (value, decision) => value?.disposition?.decision === decision && ['user', 'autonomous'].includes(value.disposition.source) && typeof value.disposition.reason === 'string' && value.disposition.reason.trim();
const adverse = value => value && typeof value === 'object' && (value.result === 'failed' || ['FAIL', 'REJECT', 'NEEDS-CLARIFICATION', 'semantic-concern', 'semantic-fail'].includes(value.verdict) || Array.isArray(value.candidate_findings) && value.candidate_findings.length > 0);
const results = entry => [
  ['local_checks', entry.local_checks], ['red_verify', entry.red_verification],
  ...(entry.stage !== 'workflow' ? [['legacy', entry]] : []),
  ...(Array.isArray(entry.verification) ? entry.verification.map(result => [`verify:${result.participant}`, result]) : []),
];
function negative(entries, closing = false) {
  const attempts = Array.isArray(entries) ? entries : [entries];
  return attempts.some((entry, index) => results(entry).some(([key, value]) => {
    if (!adverse(value) || disposition(value, 'continue')) return false;
    const later = attempts.slice(index + 1);
    if (disposition(value, 'repair') && later.length) {
      if (!closing) return false;
      return !later.some(attempt => attempt.implementation === 'complete' && results(attempt).some(([nextKey, result]) => nextKey === key && result && typeof result === 'object' && !adverse(result)));
    }
    return true;
  }));
}
const currentEvidence = (task, operation) => task.verify.find(item => item.stage === 'workflow' && item.attempt === operation?.attempt);
const finished = (evidence, command, participant) => command === 'exe' ? evidence?.implementation === 'complete' && evidence.local_checks !== undefined
  : command === 'red-verify' ? evidence?.red_verification !== undefined
  : Array.isArray(evidence?.verification) && evidence.verification.some(item => item.participant === participant);

export class Controller {
  constructor(project, adapter, routes, attemptLimit = 3) {
    if (!Number.isInteger(attemptLimit) || attemptLimit < 1) throw new Error('attemptLimit must be a positive integer');
    this.attemptLimit = attemptLimit;
    this.store = new Store(project); this.adapter = adapter; this.routes = structuredClone(routes);
    this.queue = Promise.resolve(); this.work = null; this.semantic = new SemanticMain(this); this.routing = new Routing(this);
  }
  serial(action) { const pending = this.queue.then(action); this.queue = pending.catch(() => {}); return pending; }
  async open() {
    await this.store.acquire();
    try {
      this.run = await this.store.readRun() ?? { version: 1, id: randomUUID(), revision: 0, phase: 'ready', holds: [], taskId: null, operation: null, mainSession: null,
        settings: { revision: 0, selected: defaults, routes: this.routes }, blocker: null, pending: null };
      this.run.holds ??= this.run.hold ? [this.run.hold] : [];
      if (this.run.operation) {
        this.run.operation.peers ??= [{ role: 'exe', session: this.run.operation.childSession, state: 'prepared' }];
        if (this.run.operation.kind === 'subject') {
          if (this.run.operation.peers.every(peer => peer.state === 'complete')) { this.run.phase = this.run.pending ? 'blocked' : 'stopped'; }
          else { this.run.phase = 'interrupted'; this.run.operation.unreconciled = true; this.run.blocker = 'Inspect subject outputs before resuming the unfinished owner'; }
        } else await this.reconcile();
      }
      this.semantic.initialize();
      this.run.mainSession = await this.adapter.openMain(this.store.root, this.run.mainSession, this.run.settings.routes.main);
      let launch;
      if (this.run.phase === 'stopped' && !this.run.holds.length && !this.run.pending && !this.run.blocker) launch = await this.advance();
      await this.save();
      if (launch) this.start(launch);
      return this.snapshot();
    } catch (error) { await this.store.release(); throw error; }
  }
  snapshot() { return structuredClone(this.published ?? this.run); }
  async save() { this.run.hold = this.run.holds.join(', ') || null; this.run.revision++; await this.store.saveRun(this.run); this.published = structuredClone(this.run); }
  assertRevision(request) {
    if (request.runId !== this.run.id || request.revision !== this.run.revision) throw new Error('Stale run/revision; refresh the snapshot');
  }
  async settings(request) {
    return this.serial(async () => {
      this.assertRevision(request);
      if (!['ready', 'stopped'].includes(this.run.phase) || this.run.pending || this.run.blocker || this.run.operation?.unreconciled) throw new Error('Settings require an initial or stopped-ready station');
      if (request.settingsRevision !== this.run.settings.revision) throw new Error('Stale settings revision');
      const next = structuredClone(request.settings);
      const s = next.selected;
      if (!s || ['design', 'local_checks', 'red_verify', 'feature_red_verify'].some(key => typeof s[key] !== 'boolean') || !Array.isArray(s.verify) || new Set(s.verify).size !== s.verify.length || !s.verify.every(id => ['main', 'secondary', 'code'].includes(id))) throw new Error('Invalid selected work');
      if (next.planning && Object.values(next.planning).some(value => typeof value !== 'boolean')) throw new Error('Invalid planning selection');
      if (!Array.isArray(s.protocols) || new Set(s.protocols).size !== s.protocols.length || s.protocols.some(name => !protocols.includes(name))) throw new Error('Invalid protocol selection');
      for (const role of new Set(['main', 'exe', ...s.verify.map(id => `verify_${id}`), ...(s.red_verify ? ['red'] : []), ...Object.keys(next.routes).filter(role => Object.values(next.routes[role] ?? {}).some(Boolean))])) await this.adapter.validateRoute(next.routes[role]);
      this.adapter.selectMain(next.routes.main);
      this.run.settings = { ...next, revision: this.run.settings.revision + 1 };
      await this.save(); return this.snapshot();
    });
  }
  async reconcile() {
    const { task } = await this.store.task(this.run.taskId);
    const op = this.run.operation, evidence = currentEvidence(task, op);
    if (!evidence) { this.run.phase = 'blocked'; this.run.blocker = 'Missing task-owned attempt evidence'; return; }
    for (const peer of op.peers ?? []) if (finished(evidence, op.command, peer.role)) peer.state = 'complete';
    const complete = op.peers ? op.peers.every(peer => peer.state === 'complete') : finished(evidence, op.command);
    op.unreconciled = !complete;
    if (complete) await this.store.reports(task, op);
    if (this.run.pending || negative(task.verify)) { this.run.phase = 'blocked'; this.run.blocker ??= 'Retained result requires scoped disposition'; }
    else if (complete) { this.run.phase = 'stopped'; this.run.blocker = null; }
    else { this.run.phase = 'interrupted'; this.run.blocker = 'Inspect actual effects and resume the unfinished work in this attempt'; }
  }
  async control(request) {
    if (request.action === 'start-command') return this.routing.start(request);
    if (request.action === 'green' && request.requestId) return this.semantic.approve(request);
    if (request.action === 'inspect') return this.semantic.inspect(request);
    if (request.action === 'autonomous') {
      const view = await this.serial(async () => { this.assertRevision(request); this.run.autonomous = !this.run.autonomous; if (this.run.autonomous && this.run.pending?.proposal && !this.run.pending.proposal.missingFacts.length) await this.semantic.accept(this.run.pending.id, { source: 'autonomous', reason: this.run.pending.proposal.question }); await this.save(); return this.snapshot(); });
      await this.semantic.depart(); return view;
    }
    let launch;
    const view = await this.serial(async () => {
      this.assertRevision(request);
      if (['pause', 'red', 'stop'].includes(request.action)) {
        if (!this.run.holds.includes(request.action)) this.run.holds.push(request.action);
        if (this.run.phase === 'ready') this.run.phase = 'stopped';
        if (request.action === 'stop' && this.run.mainAssignment && !this.run.mainAssignment.captured) this.run.mainAssignment.messageId = null;
        if (request.action === 'stop' && this.run.inspection?.state === 'requested') this.run.inspection.state = 'interrupted';
        if (request.action === 'stop' && this.run.phase === 'running') this.run.operation.unreconciled = true;
        await this.save();
        if (request.action === 'stop') void this.adapter.stop().catch(error => this.recordTechnicalError(error));
        return this.snapshot();
      }
      if (!['play', 'green', 'resume', 'repair'].includes(request.action)) throw new Error('Unknown Nav control');
      if (this.run.phase === 'running' || this.work) throw new Error('A leg is already admitted');
      if (request.action === 'repair') {
        if (this.run.pending || this.run.holds.length) throw new Error('Resolve pending decision and manual holds before repair');
        const record = await this.store.task(this.run.taskId);
        const attempts = record.task.verify.filter(item => item.stage === 'workflow');
        const previous = attempts.at(-1);
        const failed = results(previous).filter(([, value]) => adverse(value) && !disposition(value, 'continue'));
        if (!['partial', 'complete'].includes(previous.implementation) || !failed.length || failed.some(([, value]) => !disposition(value, 'repair'))) throw new Error('Repair requires a completed execution and scoped repair dispositions');
        if (attempts.filter(item => ['partial', 'complete'].includes(item.implementation) && results(item).some(([, value]) => adverse(value))).length >= this.attemptLimit) throw new Error('Execution attempt budget exhausted');
        const evidence = { stage: 'workflow', attempt: randomUUID(), selected: structuredClone(this.run.settings.selected) };
        record.task.verify.push(evidence);
        launch = await this.admit(record, evidence, 'exe');
        await this.save(); return this.snapshot();
      }
      if (this.run.phase === 'blocked' && !this.run.pending && this.run.taskId && this.run.operation?.kind !== 'subject') {
        const { task } = await this.store.task(this.run.taskId);
        if (!negative(task.verify) && this.run.operation.peers?.every(peer => peer.state === 'complete')) { this.run.phase = 'stopped'; this.run.blocker = null; }
      }
      if (this.run.pending || this.run.phase === 'blocked') {
        const holds = this.run.holds.filter(item => !(request.action === 'green' ? ['red', 'pause'] : ['pause', 'stop']).includes(item));
        if (holds.length !== this.run.holds.length) { this.run.holds = holds; await this.save(); }
        if (!this.run.holds.includes('stop') && this.run.mainAssignment && !this.run.mainAssignment.captured && !this.run.mainAssignment.messageId && (this.run.pending || this.run.decision?.admission === 'consulting')) {
          this.adapter.sendMain(this.run.mainAssignment); await this.save(); return this.snapshot();
        }
        throw new Error(this.run.blocker ?? 'Pending decision');
      }
      const holds = this.run.holds.filter(item => !(request.action === 'green' ? ['red', 'pause'] : ['pause', 'stop']).includes(item));
      if (holds.length) throw new Error(`Remaining hold: ${holds.join(', ')}`);
      if (this.run.phase === 'interrupted' && request.action !== 'resume') throw new Error('Use Resume to inspect and continue actual partial effects');
      this.run.holds = holds;
      if (this.run.phase === 'interrupted') {
        if (request.action !== 'resume') throw new Error('Use Resume to inspect and continue actual partial effects');
        const record = this.run.operation.kind === 'subject' ? { task: {} } : await this.store.task(this.run.taskId);
        const op = this.run.operation;
        op.resume = true; op.unreconciled = false;
        for (const peer of op.peers) if (peer.state !== 'complete') { peer.state = 'prepared'; peer.previousSessions = [...(peer.previousSessions ?? []), peer.session]; peer.session = randomUUID(); }
        this.run.blocker = null; this.run.phase = 'running'; launch = { operation: structuredClone(op), task: record.task };
      } else launch = await this.advance(request.taskId);
      if (this.run.decision?.admission === 'pending') this.run.decision.admission = this.run.operation?.id ?? 'complete';
      await this.save(); return this.snapshot();
    });
    if (launch) this.start(launch);
    return view;
  }
  start(launch) {
    this.work = this.execute(launch).catch(error => this.recordTechnicalError(error)).finally(() => { this.work = null; void this.semantic.depart().catch(error => this.recordTechnicalError(error)); });
  }
  async preflight(task) {
    if (!['ready', 'planned', 'in_progress'].includes(task.status)) throw new Error(`Task is not runnable: ${task.status}`);
    if (!task.purpose?.trim() || !task.success_outcome?.trim()) throw new Error('Task needs purpose and observable success_outcome');
    if (negative(task.verify)) throw new Error('Retained negative evidence requires scoped disposition');
    if (!this.run.settings.selected.local_checks && task.gates.some(gate => gate.required)) throw new Error('Required gates conflict with disabled local checks; owner resolution required');
    if (JSON.stringify(task).includes('PLANNING_RECONCILIATION_REQUIRED')) throw new Error('Task planning requires reconciliation');
    for (const id of task.depends_on) if (!['done', 'done_for_prod'].includes((await this.store.task(id)).task.status)) throw new Error(`Blocked dependency ${id}`);
    for (const path of task.normative_inputs) await projectPath(this.store.root, path.split('#')[0]);
    for (const path of ['.memory-bank/workflows/autonomy-policy.md', '.memory-bank/workflows/tier-policy.md']) await projectPath(this.store.root, path);
    if (['T2', 'T3'].includes(task.tier) && !task.normative_inputs.length) throw new Error('T2/T3 require direct canonical inputs');
  }
  async advance(requested) {
    if (this.run.flow && !this.run.flow.execution) return this.routing.advance();
    let record = this.run.taskId ? await this.store.task(this.run.taskId) : null;
    let evidence = record && currentEvidence(record.task, this.run.operation);
    if (!record || ['done', 'done_for_prod'].includes(record.task.status)) {
      record = requested ? await this.store.task(requested) : await this.store.runnable(this.run.flow?.inputs.feature);
      if (!record && this.run.flow?.execution) return this.routing.afterExecution();
      if (!record) { this.run.phase = 'done'; this.run.blocker = null; return; }
      if (this.run.settings.selected.feature_red_verify && (!this.run.flow || this.run.flow.execution && !this.run.flow.inputs.feature)) this.run.flow = { inputs: { ...(this.run.flow?.inputs ?? {}), feature: record.task.feature }, features: [], queue: true, pipeline: false, execution: true, next: null };
      if (record.task.status !== 'in_progress') await this.preflight(record.task);
      const existing = record.task.verify.filter(item => item.stage === 'workflow');
      if (existing.length) {
        evidence = existing.at(-1);
        this.run.taskId = record.task.id;
        const command = evidence.implementation !== 'complete' || evidence.local_checks === undefined ? 'exe'
          : evidence.selected.verify.some(role => !finished(evidence, 'verify', role)) ? 'verify'
          : evidence.selected.red_verify && evidence.red_verification === undefined ? 'red-verify' : null;
        if (command) {
          await this.admit(record, evidence, command);
          this.run.operation.peers.forEach(peer => { if (finished(evidence, command, peer.role)) peer.state = 'complete'; });
          this.run.operation.unreconciled = true;
          this.run.phase = 'interrupted'; this.run.blocker = 'Recovered unfinished task evidence: inspect and resume the same attempt';
          return;
        }
        this.run.operation = { attempt: evidence.attempt };
      } else {
      if (record.task.status === 'in_progress') throw new Error('Unfinished task lacks an owned workflow attempt; reconcile with its task owner');
      evidence = { stage: 'workflow', attempt: randomUUID(), selected: structuredClone(this.run.settings.selected) };
      evidence.selected.protocols = evidence.selected.protocols.filter(name => (name !== 'verification.md' || evidence.selected.verify.length) && (name !== 'red-verification.md' || evidence.selected.red_verify));
      record.task.verify.push(evidence); record.task.status = 'in_progress'; this.run.taskId = record.task.id;
      }
    }
    if (negative(record.task.verify)) { this.run.phase = 'blocked'; this.run.blocker = 'Retained result requires scoped disposition'; return; }
    let command;
    if (evidence.implementation !== 'complete') command = 'exe';
    else if (evidence.verification === undefined) {
      evidence.selected.verify = [...this.run.settings.selected.verify];
      evidence.selected.protocols = evidence.selected.protocols.filter(name => name !== 'verification.md');
      if (evidence.selected.verify.length && this.run.settings.selected.protocols.includes('verification.md')) evidence.selected.protocols.push('verification.md');
      if (evidence.selected.verify.length) command = 'verify'; else evidence.verification = 'skipped';
    }
    if (!command && evidence.red_verification === undefined) {
      evidence.selected.red_verify = this.run.settings.selected.red_verify;
      evidence.selected.protocols = evidence.selected.protocols.filter(name => name !== 'red-verification.md');
      if (evidence.selected.red_verify && this.run.settings.selected.protocols.includes('red-verification.md')) evidence.selected.protocols.push('red-verification.md');
      if (evidence.selected.red_verify) command = 'red-verify'; else evidence.red_verification = 'skipped';
    }
    if (!command) {
      if (negative(record.task.verify, true)) { this.run.phase = 'blocked'; this.run.blocker = 'Repair has not supplied the applicable later result'; await this.store.saveTask(record); return; }
      record.task.status = evidence.production_remainder ? 'done_for_prod' : 'done'; await this.store.saveTask(record);
      this.run.phase = 'done'; this.run.blocker = null;
      return this.advance();
    }
    return this.admit(record, evidence, command);
  }
  async admit(record, evidence, command) {
    const roles = command === 'verify' ? evidence.selected.verify : [command === 'exe' ? 'exe' : 'red'];
    const routes = structuredClone(this.run.settings.routes);
    for (const role of roles) await this.adapter.validateRoute(routes[command === 'verify' ? `verify_${role}` : role]);
    await readFile(this.adapter.commandPath(command), 'utf8');
    for (const filename of evidence.selected.protocols) await projectPath(this.store.root, `.memory-bank/templates/protocols/${filename === 'run.md' ? 'compact-run-template.md' : filename.replace('.md', '-template.md')}`);
    const operation = { id: randomUUID(), attempt: evidence.attempt, command, routes, selected: structuredClone(evidence.selected), peers: roles.map(role => ({ role, session: randomUUID(), state: 'prepared' })) };
    if (this.run.decision?.admission === 'pending') this.run.decision.admission = operation.id;
    this.run.operation = operation; this.run.phase = 'running'; this.run.blocker = null;
    await this.store.saveTask(record);
    return { operation: structuredClone(operation), task: record.task };
  }
  async execute(launch) {
    let next = launch;
    while (next) {
      if (next.operation.kind === 'subject') { next = await this.routing.execute(next); continue; }
      const { operation, task } = next;
      for (const peer of operation.peers) {
        if (peer.state === 'complete') continue;
        let result;
        const outputSchema = schemaFor(operation.command, operation.selected, peer.role === 'code');
        try {
          const contract = await readFile(this.adapter.commandPath(operation.command), 'utf8');
          result = await this.adapter.execute({ project: this.store.root, operation: { ...operation, childSession: peer.session, role: peer.role }, task: (await this.store.task(task.id)).task, contract, outputSchema });
        } catch (error) { result = { stopReason: 'error', diagnostic: error.message }; }
        await this.serial(async () => {
          const record = await this.store.task(task.id), evidence = currentEvidence(record.task, operation);
          if (!evidence || finished(evidence, operation.command, peer.role)) return;
          const current = this.run.operation?.id === operation.id;
          const binding = current && this.run.operation.peers.find(item => item.role === peer.role);
          if (result.stopReason !== 'completed' || (!new Ajv().compile(outputSchema)(result.structured) || !substantive(result.structured, operation.command, operation.selected))) {
            if (binding) { binding.state = 'interrupted'; binding.diagnostic = result.diagnostic ?? `Native ${result.stopReason}: missing valid subject result`; }
          } else {
            const { subject, feedback } = result.structured;
            if (operation.command === 'exe') {
              evidence.implementation = subject.implementation;
              evidence.evidence = [...new Set([...(evidence.evidence ?? []), ...subject.evidence])];
              if (!operation.selected.local_checks) evidence.local_checks = 'skipped';
              else if (subject.local_checks) evidence.local_checks = subject.local_checks;
              if (subject.production_remainder?.trim()) evidence.production_remainder = subject.production_remainder;
            } else if (operation.command === 'verify') {
              evidence.verification ??= [];
              evidence.verification.push({ participant: peer.role, ...subject });
            } else evidence.red_verification = subject;
            if (binding) binding.state = operation.command === 'exe' && subject.implementation !== 'complete' ? 'interrupted' : 'complete';
            if (feedback.flow === 'needs_decision' && current) {
              this.run.pending = { id: randomUUID(), operation: operation.id, participant: peer.role, owner: task.id, message: feedback.message };
              await this.save();
            }
            await this.store.saveTask(record);
          }
          if (current) await this.save();
        });
        if (this.run.holds.includes('stop')) {
          await this.serial(async () => {
            for (const remaining of this.run.operation.peers) if (remaining.state === 'prepared') { remaining.state = 'interrupted'; remaining.diagnostic = 'Not launched because Nav Stop is held'; }
            await this.save();
          });
          break;
        }
      }
      next = await this.serial(async () => {
        if (this.run.operation?.id !== operation.id) return;
        const { task: actual } = await this.store.task(task.id);
        await this.store.reports(actual, operation);
        if (this.run.pending || negative(actual.verify)) {
          this.run.phase = 'blocked'; this.run.blocker = this.run.pending?.message ?? 'Retained result requires scoped disposition';
        } else if (this.run.operation.peers.some(peer => peer.state !== 'complete')) {
          this.run.phase = 'interrupted'; this.run.operation.unreconciled = true; this.run.blocker = this.run.operation.peers.filter(peer => peer.state !== 'complete').map(peer => `${peer.role}: ${peer.diagnostic ?? 'partial effects require inspection'}`).join('; ');
        } else if (this.run.holds.length) { this.run.phase = 'stopped'; this.run.operation.unreconciled = false; }
        else { const launch = await this.advance(); await this.save(); return launch; }
        await this.save();
        if (this.run.phase === 'blocked') await this.semantic.requestProposal(this.run.blocker);
      });
    }
  }
  async recordTechnicalError(error) { await this.serial(async () => { this.run.phase = 'interrupted'; this.run.blocker = error.message; await this.save(); }); }
  async dispose() {
    await this.serial(async () => {
      if (this.run.phase === 'running' || ['requested', 'running'].includes(this.run.inspection?.state)) { if (!this.run.holds.includes('stop')) this.run.holds.push('stop'); await this.save(); }
    });
    await this.adapter.stop(); await this.work; await this.semantic.judgeWork; await this.adapter.dispose(); await this.queue; await this.store.release(); }
}
