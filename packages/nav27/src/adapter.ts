import type { Context } from '@deepseek-ai/cordis';
import type { AgentHandle, AgentOptions } from '@deepseek-ai/dsh-agent';
import type { SubagentActivation } from '@deepseek-ai/dsh-subagent';
import type {} from '@deepseek-ai/dsh-agent-preset-registry';
import type {} from '@deepseek-ai/dsh-workspace';
import { SessionId } from '@deepseek-ai/dsh-session';
import type { ObjectJsonSchema } from '@deepseek-ai/dsh-tools';
import { randomUUID } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { mountMainFeedback, assignmentMessage } from './main-feedback.js';
import type { MainHost, MainAssignment } from './main-feedback.js';

export class DshAdapter {
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
  async dispose() { await this.main?.dispose(); await this.mainPreset?.(); }
}
