import { randomUUID } from 'node:crypto';
import { commands } from './commands.mjs';

const text = { type: 'string' };
const object = properties => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const summary = object({ summary: text });
const proposal = object({ question: text, action: { type: 'string', enum: ['continue', 'repair', 'consult', 'route'] }, scope: text, target: { type: 'string' }, missingFacts: { type: 'array', items: text } });
const shapes = {
  conversation: null, proposal,
  answer: object({ requestId: text, answer: { type: 'string', enum: ['approve', 'reject', 'discuss'] }, reason: text }),
  inspection: object({ question: text, scope: text, contextRefs: { type: 'array', items: text } }),
  'inspection-result': proposal,
};
export function mainSchema(purpose) {
  const properties = { flow: { type: 'string', enum: ['continue', 'needs_decision'] }, message: text };
  if (shapes[purpose]) properties.detail = shapes[purpose];
  const feedback = object(properties);
  if (purpose === 'inspection-result') feedback.required = ['flow', 'message'];
  return object({ feedback, subject: summary });
}
export const judgeSchema = object({ feedback: object({ flow: { type: 'string', enum: ['continue', 'needs_decision'] }, message: text }), subject: object({ summary: text, evidence: { type: 'array', items: text } }) });

/** Semantic assignments share the controller's reducer and existing run record. */
export class SemanticMain {
  constructor(controller) { this.c = controller; }
  get run() { return this.c.run; }
  assignment(id) {
    if (id) return [this.run.mainAssignment, this.run.mainResume].find(a => a?.id === id);
    return this.run.mainAssignment;
  }
  make(purpose, prompt, resume = this.resume()) { return { id: randomUUID(), purpose, schema: mainSchema(purpose), prompt, resume }; }
  resume() { return { operation: this.run.operation?.id ?? null, taskId: this.run.taskId, attempt: this.run.operation?.attempt ?? null }; }
  async admit(assignment) {
    await this.c.serial(async () => {
      if (!this.assignment(assignment.id)) throw new Error('Stale main assignment');
      this.run.mainAdmitted = assignment.id; await this.c.save();
    });
  }
  async user(messages) {
    return this.c.serial(async () => {
      const ids = messages.map(message => String(message.id));
      this.run.mainUserInput = { ids, requestId: this.run.pending?.id ?? null };
      if (!this.run.pending?.proposal) {
        const conversation = this.make(this.run.pending ? 'proposal' : 'conversation', `Respond to the actual user message using current project context. ${this.run.pending ? 'Formulate one bounded proposal for: ' + this.run.pending.message : 'No child completion authority.'}`);
        if (this.run.inspection && ['requested', 'running'].includes(this.run.inspection.state)) this.run.mainResume = conversation;
        else this.run.mainAssignment = conversation;
        await this.c.save(); return conversation;
      }
      const answer = this.make('answer', `Interpret the actual new main user message for request ${this.run.pending.id}. Explicit unconditional consent alone approves. Questions, facts, conditional or unclear replies discuss. Pending: ${JSON.stringify(this.run.pending)}`);
      answer.userIds = ids;
      if (this.run.pending.proposal.missingFacts.length) {
        answer.schema.properties.feedback.properties.detail.properties.resolvedFacts = { type: 'array', items: { type: 'string', enum: this.run.pending.proposal.missingFacts } };
        answer.prompt += ' Optional resolvedFacts lists only the listed gaps actually answered by this native user input; record their meaning in reason. It does not imply approval.';
      }
      if (this.run.inspection && !['complete', 'error', 'interrupted'].includes(this.run.inspection.state)) this.run.mainResume = answer;
      else this.run.mainAssignment = answer;
      await this.c.save(); return answer;
    });
  }
  initialize() {
    if (this.run.inspection && ['requested', 'running'].includes(this.run.inspection.state)) {
      this.run.inspection.state = 'interrupted';
      this.run.inspection.diagnostic = 'Native consultation handle was lost; no result or permission inferred.';
      this.run.mainAssignment = this.run.mainResume ?? null; this.run.mainResume = null;
    }
    this.run.mainAssignment ??= this.make('conversation', 'Read context and discuss the current DevRails run. No operation is assigned.');
    this.c.adapter.mainHost = { assignment: id => this.assignment(id), admit: a => this.admit(a), user: messages => this.user(messages), capture: (a, value, currentInput) => this.capture(a, value, currentInput), error: error => { void this.c.serial(async () => { this.run.mainError = error instanceof Error ? error.message : String(error); await this.c.save(); }); } };
  }
  async requestProposal(message) {
    if (this.run.mainAssignment?.purpose === 'proposal' && !this.run.mainAssignment.captured) return;
    const assignment = this.make('proposal', `Resolve this workflow decision: ${message}. Read the retained actual results. Propose one bounded action and its scope, target command (empty for current owner), and missing facts. Actual negative requires continue or repair with specific scope; do not relabel the verdict. No launch authority. Available command owners: ${Object.keys(commands).join(', ')}. Current pending: ${JSON.stringify(this.run.pending)}`);
    if (this.run.inspection && !['complete', 'error', 'interrupted'].includes(this.run.inspection.state)) { this.run.mainResume = assignment; await this.c.save(); return; }
    this.run.mainAssignment = assignment; await this.c.save(); if (!this.run.holds.includes('stop')) this.c.adapter.sendMain(assignment);
  }
  async capture(assignment, value, currentInput = () => true) {
    value = structuredClone(value);
    let judge;
    await this.c.serial(async () => {
      if (assignment.purpose === 'answer' && !currentInput()) return;
      const stored = this.assignment(assignment.id);
      if (!stored || stored.captured) return;
      stored.captured = true; this.run.mainError = null;
      if (assignment.purpose === 'inspection') {
        const h = this.run.inspection;
        if (h?.assignment !== assignment.id || h.state !== 'requested') return;
        h.detail = value.feedback.detail;
        h.state = this.run.holds.includes('stop') ? 'interrupted' : 'running';
        if (h.state === 'running') judge = structuredClone(h);
      } else if (assignment.purpose === 'answer') {
        const detail = value.feedback.detail;
        if (detail.requestId !== this.run.pending?.id || this.run.mainUserInput?.requestId !== detail.requestId || JSON.stringify(this.run.mainUserInput.ids) !== JSON.stringify(assignment.userIds)) throw new Error('Stale or unattributed main answer');
        const answeredCurrentOwner = this.run.pending.proposal.action === 'consult' && !this.run.pending.proposal.target && !!detail.resolvedFacts?.length;
        if (detail.resolvedFacts?.length) this.run.pending.proposal.missingFacts = this.run.pending.proposal.missingFacts.filter(fact => !detail.resolvedFacts.includes(fact));
        if (detail.answer === 'approve' || detail.answer === 'discuss' && answeredCurrentOwner && !this.run.pending.proposal.missingFacts.length) await this.accept(detail.requestId, { source: 'user', origin: 'main-chat', reference: assignment.userIds, reason: detail.reason });
        else if (detail.answer === 'reject') { this.run.rejected = { ...this.run.pending, reason: detail.reason, userIds: assignment.userIds }; this.run.pending = null; this.run.blocker = 'Proposal rejected; owner resolution required'; }
      } else if (assignment.purpose === 'proposal' || value.feedback.flow === 'needs_decision' && value.feedback.detail) {
        const p = value.feedback.detail;
        if (!p) throw new Error('Proposal detail required');
        this.run.pending = { id: randomUUID(), operation: assignment.resume.operation, proposal: p, message: p.question, resume: assignment.resume };
        this.run.blocker = p.question;
        if (this.run.autonomous && !p.missingFacts.length) await this.accept(this.run.pending.id, { source: 'autonomous', reason: value.feedback.message });
      }
      if (assignment.id === this.run.decision?.consultAssignment && value.feedback.flow === 'continue') {
        const clarification = { source: this.run.decision.source, origin: this.run.decision.origin, reference: this.run.decision.reference, reason: this.run.decision.reason, interpretation: value.subject.summary };
        this.run.decision.admission = 'pending';
        const operation = this.run.operation;
        if (operation?.id !== assignment.resume.operation) throw new Error('Current-owner consultation lost its resume owner');
        if (operation.kind === 'subject') {
          this.run.flow.inputs = { ...operation.inputs, clarification };
          if (!operation.subjectComplete) { this.run.flow.after = null; this.run.flow.next = operation.command; }
          this.run.phase = 'stopped';
        } else {
          operation.inputs = { ...(operation.inputs ?? {}), clarification };
          this.run.blocker = null;
          await this.c.reconcile();
          if (this.run.phase === 'blocked') {
            this.run.pending = { id: randomUUID(), operation: operation.id, message: this.run.blocker };
            await this.requestProposal(this.run.blocker);
          } else this.run.blocker = null;
        }
        if (operation.kind === 'subject') this.run.blocker = null;
      }
      if (assignment.purpose === 'conversation' && value.feedback.flow === 'needs_decision' && !value.feedback.detail) await this.requestProposal(value.feedback.message);
      if (assignment.purpose === 'inspection-result') {
        const previous = this.run.mainResume; this.run.mainResume = null;
        if (previous && !previous.captured) { this.run.mainAssignment = previous; if (!this.run.holds.includes('stop')) this.c.adapter.sendMain(previous); }
      }
      await this.c.save();
    });
    if (judge) this.judgeWork = this.judge(judge).finally(() => { this.judgeWork = null; });
    await this.depart();
  }
  async accept(id, decision) {
    const pending = this.run.pending;
    if (!pending || pending.id !== id || !pending.proposal) throw new Error('Stale pending request');
    if (pending.proposal.missingFacts.length) throw new Error('Missing facts require an actual main answer');
    const action = pending.proposal.action;
    if (action === 'consult' && !pending.proposal.target) {
      const assignment = this.make('conversation', `Interpret the current owner's question using actual accepted context. Question: ${pending.proposal.question}. Actual answer/authorization: ${decision.reason}. Native origin/reference: ${JSON.stringify({ origin: decision.origin, reference: decision.reference })}. Read the unfinished owner's actual state. Return continue only when the question is resolved sufficiently to resume that owner; otherwise needs_decision. Do not authorize a new route or turn a negative verdict into success.`, pending.resume);
      this.run.decision = { id: pending.id, ...decision, action, scope: pending.proposal.scope, resume: pending.resume, admission: 'consulting', consultAssignment: assignment.id };
      this.run.pending = null;
      this.run.blocker = 'Current-owner answer awaits semantic interpretation';
      this.run.mainAssignment = assignment;
      if (!this.run.holds.includes('stop')) this.c.adapter.sendMain(assignment);
      return;
    }
    if (action === 'route' || action === 'consult') {
      if (!pending.proposal.target) throw new Error('Reroute requires a concrete target command');
      await this.c.routing.validateReroute(pending);
    }
    if (pending.proposal.scope.startsWith('subject:')) {
      const boundary = this.run.boundaries?.find(item => `subject:${item.operation}` === pending.proposal.scope);
      if (!boundary) throw new Error('Unknown subject evidence scope');
      boundary.disposition = { decision: action === 'continue' ? 'continue' : 'repair', source: decision.source, reason: decision.reason };
      if (boundary.evidenceOwner) {
        const record = await this.c.store.task(boundary.evidenceOwner.taskId);
        record.task.verify[boundary.evidenceOwner.index].disposition = boundary.disposition;
        await this.c.store.saveTask(record);
      }
      if (action === 'repair') await this.c.routing.reroute({ ...pending, proposal: { ...pending.proposal, target: pending.proposal.target || boundary.command } });
    } else if (pending.resume.taskId && !pending.proposal.scope.startsWith('subject:')) {
      const record = await this.c.store.task(pending.resume.taskId);
      const attempt = record.task.verify.find(item => item.attempt === pending.resume.attempt);
      const entries = [['local_checks', attempt?.local_checks], ['red_verify', attempt?.red_verification], ...(Array.isArray(attempt?.verification) ? attempt.verification.map(v => [`verify:${v.participant}`, v]) : [])];
      const scoped = entries.find(([scope, result]) => scope === pending.proposal.scope && result && typeof result === 'object');
      const adverse = result => result && typeof result === 'object' && (result.result === 'failed' || ['FAIL', 'NEEDS-CLARIFICATION', 'semantic-concern', 'semantic-fail'].includes(result.verdict) || Array.isArray(result.candidate_findings) && result.candidate_findings.length);
      if (pending.proposal.scope === 'current' && entries.some(([, result]) => adverse(result) && !result.disposition)) throw new Error('Negative evidence requires its concrete result scope');
      if (pending.proposal.scope !== 'current' && !scoped) throw new Error('Disposition scope does not identify retained evidence');
      if (action === 'repair' && !scoped) throw new Error('Repair requires a scoped retained result');
      for (const [scope, result] of entries) if (scope === pending.proposal.scope && result && typeof result === 'object') result.disposition = { decision: action === 'continue' ? 'continue' : 'repair', source: decision.source, reason: decision.reason };
      await this.c.store.saveTask(record);
    }
    if (action === 'route' || action === 'consult') await this.c.routing.reroute(pending);
    this.run.decision = { admission: 'pending', id: pending.id, ...decision, action, scope: pending.proposal.scope, resume: pending.resume };
    this.run.pending = null; this.run.blocker = null;
    if (this.run.phase === 'blocked') this.run.phase = this.run.operation?.peers?.some(p => p.state !== 'complete') ? 'interrupted' : 'stopped';
  }
  async approve(request) {
    await this.c.serial(async () => { this.c.assertRevision(request); await this.accept(request.requestId, { source: 'user', origin: 'green', reference: request.requestId, reason: this.run.pending?.proposal?.question ?? 'Approve current request' }); await this.c.save(); });
    await this.depart(); return this.c.snapshot();
  }
  async depart() {
    if (this.run.decision?.admission !== 'pending' || this.run.holds.length || this.run.pending || this.run.blocker || this.c.work || !['stopped', 'ready', 'interrupted'].includes(this.run.phase)) return;
    const action = this.run.phase === 'interrupted' && this.run.decision?.action === 'consult' ? 'resume' : this.run.decision?.action === 'repair' && !this.run.flow?.next ? 'repair' : 'play';
    await this.c.control({ runId: this.run.id, revision: this.run.revision, action });
  }
  async inspect(request) {
    return this.c.serial(async () => {
      this.c.assertRevision(request);
      if (this.run.inspection && (['requested', 'running'].includes(this.run.inspection.state) || this.run.mainAssignment?.purpose === 'inspection-result' && !this.run.mainAssignment.captured)) return this.c.snapshot();
      if (this.run.holds.includes('stop')) throw new Error('Nav Stop is held');
      const route = this.run.settings.routes.judge;
      await this.c.adapter.validateRoute(route);
      const assignment = this.make('inspection', 'Обратись сейчас к судье для инспекции своих действий. Formulate the bounded read-only inspection question, scope and contextRefs. This H click already authorizes this consultation. Do not ask for green.');
      this.run.mainResume = this.run.mainAssignment;
      this.run.mainAssignment = assignment;
      this.run.inspection = { id: randomUUID(), assignment: assignment.id, state: 'requested', route: structuredClone(route), resume: assignment.resume, origin: 'user-h' };
      await this.c.save(); this.c.adapter.sendMain(assignment, true); return this.c.snapshot();
    });
  }
  async judge(h) {
    let result;
    try { result = await this.c.adapter.inspect({ project: this.c.store.root, id: h.id, route: h.route, outputSchema: judgeSchema, prompt: `Read-only inspection; no lifecycle or route authority. ${JSON.stringify(h.detail)}\nResume context: ${JSON.stringify(h.resume)}` }); }
    catch (error) { result = { stopReason: 'error', diagnostic: error.message }; }
    await this.c.serial(async () => {
      if (this.run.inspection?.id !== h.id) return;
      this.run.inspection.state = result.stopReason === 'completed' ? 'complete' : 'error';
      this.run.inspection.result = result;
      if (!this.run.holds.includes('stop')) {
        const assignment = this.make('inspection-result', `Judge consultation result: ${JSON.stringify(result)}. Interpret it for the user, then resume the prior assignment with actual facts. A changed route needs an ordinary proposal; this result does not finish the child leg.`, h.resume);
        this.run.mainAssignment = assignment; await this.c.save(); if (!this.run.holds.includes('stop')) this.c.adapter.sendMain(assignment);
      } else await this.c.save();
    });
  }
}
