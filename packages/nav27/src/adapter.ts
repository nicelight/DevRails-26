import type { Context } from '@deepseek-ai/cordis';
import type { AgentHandle, AgentOptions } from '@deepseek-ai/dsh-agent';
import type { SubagentActivation } from '@deepseek-ai/dsh-subagent';
import type {} from '@deepseek-ai/dsh-agent-preset-registry';
import type {} from '@deepseek-ai/dsh-workspace';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import type {} from '@deepseek-ai/dsh-session-query';
import { SessionId, SessionLogOffset, buildForkSeed } from '@deepseek-ai/dsh-session';
import type { ObjectJsonSchema } from '@deepseek-ai/dsh-tools';
import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { mountMainFeedback, assignmentMessage } from './main-feedback.js';
import type { MainHost, MainAssignment } from './main-feedback.js';

export class DshAdapter {
  private sides = new Map<string, { handle: AgentHandle; remove: () => Promise<void> }>();
  sideSummary: () => string = () => 'Nav context unavailable';
  private main?: AgentHandle;
  private mainPreset?: () => Promise<void>;
  private active?: SubagentActivation;
  private starting?: AbortController;
  mainHost?: MainHost;
  private judge?: SubagentActivation;
  private judgeStarting?: AbortController;
  constructor(private readonly ctx: Context) {}
  resourcePath(path: string) { return fileURLToPath(new URL(`../resources/${path}`, import.meta.url)); }
  commandPath(command: string) { return fileURLToPath(new URL(`../resources/commands/${command}/SKILL.md`, import.meta.url)); }
  async validateRoute(route: AgentOptions) {
    if (!route?.provider || !route.model) throw new Error('Explicit provider/model required for every selected role');
    await this.ctx.llm.resolveCallConfig({ provider: route.provider, model: route.model, ...(route.reasoningEffort ? { reasoningEffort: route.reasoningEffort } : {}) });
  }
  selectMain(route: AgentOptions) {
    this.main?.agent.model.select({ provider: route.provider!, model: route.model!, ...(route.reasoningEffort ? { reasoningEffort: route.reasoningEffort } : {}) });
  }
  async openMain(project: string, previous: string | null, route: AgentOptions) {
    const preset = `nav27-main-${randomUUID()}`;
    this.mainPreset = await this.ctx.agentPresets.register({ id: preset, plugins: [{ name: new URL('./role.js', import.meta.url).href, config: { role: 'main', project } }] });
    const setup = async (ctx: Context) => {
      await this.ctx.agentPresets.mount(ctx, preset);
      if (this.mainHost) mountMainFeedback(ctx, this.mainHost);
    };
    if (previous && this.ctx.get('sessionPersistence') && !await this.ctx.get('sessionPersistence')!.stat(SessionId(previous))) previous = null;
    if (previous) {
      this.main = await this.ctx.agents.resume({ resumeSessionId: SessionId(previous), agentOptions: route, setup });
    } else {
      this.main = await this.ctx.agents.create({ sessionId: SessionId(randomUUID()), meta: { cwd: project, agentPreset: preset }, agentOptions: route, setup });
    }
    const workspaces = this.ctx.get('workspaceRegistry');
    if (workspaces) await (await workspaces.create(project)).attachSession(this.main.agent.id);
    return this.main.agent.id;
  }
  async sessionFacts(ids: string[]) {
    return Object.fromEntries(await Promise.all([...new Set(ids)].map(async id => {
      try {
        using source = await this.ctx.sessionQuery.observeSession(SessionId(id));
        const pressure = (source.projections?.values as Record<string, unknown> | undefined)?.contextPressure as { projectedTokens?: number; pressureTokens?: number; contextWindow?: number } | undefined;
        const tokens = pressure?.projectedTokens ?? pressure?.pressureTokens;
        const occupancy = typeof tokens === 'number' && typeof pressure?.contextWindow === 'number' && pressure.contextWindow > 0 ? Math.min(1, tokens / pressure.contextWindow) : null;
        const compacted = new Set<string>();
        for (const event of source.events.slice(source.inheritedEventCount)) {
          const data = event.data as { compactionId?: string; error?: string };
          if ((event.type as string) === 'compaction/end' && data.error === undefined && data.compactionId) compacted.add(data.compactionId);
        }
        return [id, { occupancy, compactions: compacted.size, state: this.ctx.agents.get(SessionId(id))?.status ?? null }];
      } catch { return [id, { occupancy: null, compactions: null, state: null }]; }
    })));
  }
  sideArchived(id: string) { return this.ctx.workspaceRegistry.archivedSessionIds.includes(SessionId(id)); }
  private async sideSetup(project: string, route: AgentOptions) {
    const preset = `nav27-side-${randomUUID()}`;
    const remove = await this.ctx.agentPresets.register({ id: preset, plugins: [{ name: new URL('./role.js', import.meta.url).href, config: { role: 'side', project } }] });
    return { preset, remove, setup: async (ctx: Context, agent: AgentHandle['agent']) => {
      await this.ctx.agentPresets.mount(ctx, preset);
      // Seed model selection outranks fallback options; overwrite it before publication.
      agent.model.select({ provider: route.provider!, model: route.model!, ...(route.reasoningEffort ? { reasoningEffort: route.reasoningEffort } : {}) });
      ctx.on('agent/pre-step', async (_payload, next) => {
        const decision = await next();
        if (decision.kind !== 'enter' || !decision.messages.some(message => message.source.kind === 'user')) return decision;
        const summary = createUserMessage({ source: { kind: 'nav27', assignment: 'side-summary' }, content: [{ type: 'text', text: this.sideSummary() }] });
        return { ...decision, messages: [...decision.messages, summary] };
      });
      ctx.systemPrompt.section({ name: 'nav27-side-context', order: 11, text: this.sideSummary() });
    } };
  }
  async createSide(project: string, route: AgentOptions) {
    if (!this.main) throw new Error('Main session unavailable');
    const composition = await this.sideSetup(project, route);
    let handle: AgentHandle | undefined;
    try {
      using source = await this.ctx.sessionQuery.observeSession(this.main.agent.id, { projectionMode: 'none' });
      const boundary = source.events.at(-1)?.seq;
      const seed = boundary === undefined ? [] : buildForkSeed(source.events, boundary);
      const id = SessionId(randomUUID());
      handle = await this.ctx.agents.create({ sessionId: id, seed,
        ...(boundary === undefined ? {} : { inheritedEventCount: SessionLogOffset(boundary + 1) }),
        meta: { cwd: project, agentPreset: composition.preset, ...(boundary === undefined ? {} : { isSeeded: true }) }, agentOptions: route, setup: composition.setup });
      await (await this.ctx.workspaceRegistry.create(project)).attachSession(id);
      await this.ctx.sessions.flush(handle.agent.session);
      this.sides.set(id, { handle, remove: composition.remove });
      return id;
    } catch (error) { await handle?.dispose(); await composition.remove(); throw error; }
  }
  async openSide(project: string, id: string, route: AgentOptions) {
    if (this.sides.has(id)) return;
    const composition = await this.sideSetup(project, route);
    let handle: AgentHandle | undefined;
    try {
      handle = await this.ctx.agents.resume({ resumeSessionId: SessionId(id), agentOptions: route, setup: composition.setup });
      await (await this.ctx.workspaceRegistry.create(project)).attachSession(SessionId(id));
      this.sides.set(id, { handle, remove: composition.remove });
    } catch (error) { await handle?.dispose(); await composition.remove(); throw error; }
  }
  async releaseSide(id: string) {
    const owned = this.sides.get(id);
    if (owned) { await owned.handle.dispose(); await owned.remove(); this.sides.delete(id); }
  }
  async archiveSide(id: string) {
    await this.ctx.workspaceRegistry.archiveSession(SessionId(id), { stopActivity: true });
    if (!this.sideArchived(id)) throw new Error('Native archive was not confirmed');
    await this.releaseSide(id);
  }
  async execute(input: { project: string; operation: { childSession: string; id: string; command: string; role: string; resume?: boolean; inputs?: unknown; selected: unknown; routes: Record<string, AgentOptions> }; task: { runtime_context?: { write_boundary?: string[]; allowed_write_scope?: string[]; forbidden_scope?: string[] } }; contract: string; outputSchema: ObjectJsonSchema }) {
    if (!this.main) throw new Error('Main session unavailable');
    const preset = `nav27-exe-${input.operation.id}`;
    const removePreset = await this.ctx.agentPresets.register({ id: preset, plugins: [{ name: new URL('./role.js', import.meta.url).href, config: {
      role: input.operation.role === 'subject' || input.operation.command === 'exe' ? 'exe' : 'review', project: input.project, resources: dirname(this.commandPath(input.operation.command)),
      boundary: input.task.runtime_context?.write_boundary ?? input.task.runtime_context?.allowed_write_scope,
      forbidden: input.task.runtime_context?.forbidden_scope,
    } }] });
    this.starting = new AbortController();
    let activation: SubagentActivation | undefined;
    try {
      activation = await this.ctx.subagents.startActivation({ provider: 'spawn', delivery: 'caller', label: `DevRails ${input.operation.command}/${input.operation.role}`, childId: SessionId(input.operation.childSession), signal: this.starting.signal,
        request: { parent: this.main.agent, cwd: input.project, agentPreset: preset, agentOptions: input.operation.routes[input.operation.role === 'subject' ? 'exe' : input.operation.role === 'diagnostic' ? 'review' : input.operation.command === 'verify' ? `verify_${input.operation.role}` : input.operation.role], maxDepth: 1, outputSchema: input.outputSchema,
          prompt: [{ type: 'text', text: `${input.contract}\n\nHOST ASSIGNMENT\nInstalled contract resource root: ${dirname(this.commandPath(input.operation.command))}. Resolve agents/ and references/ below that directory. Role: ${input.operation.role}. Subject inputs: ${JSON.stringify(input.operation.inputs ?? {})}. For planning, return task drafts in subject.tasks: the host alone imports them into the existing indexed registry and sets initial lifecycle. Never write task metadata directly. Selected work: ${JSON.stringify(input.operation.selected)}. Return only this participant's actual subject result. The host owns lifecycle and subsequent operations. Read applicable project context. ${input.operation.resume ? 'RESUME: inspect existing changes and retained task evidence before continuing the same attempt. Do not replay completed or ambiguous unsafe effects; return needs_decision for unresolved ambiguity.' : ''}\nTask:\n${JSON.stringify(input.task, null, 2)}` }],
        },
      });
      this.active = activation;
      return await activation.result;
    } finally {
      await activation?.dispose();
      this.active = undefined; this.starting = undefined;
      await removePreset();
    }
  }
  sendMain(assignment: MainAssignment, steer = false) {
    if (!this.main) throw new Error('Main session unavailable');
    const message = assignmentMessage(assignment);
    assignment.messageId = String(message.id);
    if (steer) this.main.agent.steer(message); else this.main.agent.followup(message);
  }
  async inspect(input: { project: string; id: string; route: AgentOptions; prompt: string; outputSchema: ObjectJsonSchema }) {
    if (!this.main) throw new Error('Main session unavailable');
    const preset = `nav27-judge-${input.id}`;
    const remove = await this.ctx.agentPresets.register({ id: preset, plugins: [{ name: new URL('./role.js', import.meta.url).href, config: { role: 'review', project: input.project } }] });
    this.judgeStarting = new AbortController();
    let activation: SubagentActivation | undefined;
    try {
      activation = await this.ctx.subagents.startActivation({ provider: 'spawn', delivery: 'caller', label: 'DevRails Judge', childId: SessionId(input.id), signal: this.judgeStarting.signal,
        request: { parent: this.main.agent, cwd: input.project, agentPreset: preset, agentOptions: input.route, maxDepth: 1, outputSchema: input.outputSchema, prompt: [{ type: 'text', text: input.prompt }] } });
      this.judge = activation;
      return await activation.result;
    } finally { await activation?.dispose(); this.judge = undefined; this.judgeStarting = undefined; await remove(); }
  }
  async stop() {
    this.starting?.abort(); this.judgeStarting?.abort();
    if (this.main) {
      this.main.agent.cancel({ kind: 'user' }, { keepInbox: true });
      for (const message of [...this.main.agent.inbox.nextStep, ...this.main.agent.inbox.nextTurn]) if (message.source.kind === 'nav27') this.main.agent.inbox.remove(message.id);
    }
    await this.active?.dispose(); await this.judge?.dispose();
  }
  async dispose() { for (const id of this.sides.keys()) await this.releaseSide(id); await this.main?.dispose(); await this.mainPreset?.(); }
}
