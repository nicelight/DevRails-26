import type { Context } from '@deepseek-ai/cordis';
import type { AgentHandle, AgentOptions } from '@deepseek-ai/dsh-agent';
import type { SubagentActivation } from '@deepseek-ai/dsh-subagent';
import type {} from '@deepseek-ai/dsh-agent-preset-registry';
import type {} from '@deepseek-ai/dsh-workspace';
import { SessionId } from '@deepseek-ai/dsh-session';
import { ToolArgsError, validateJsonSchemaValue } from '@deepseek-ai/dsh-tools';
import type { ObjectJsonSchema, ToolExecution } from '@deepseek-ai/dsh-tools';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const mainFeedback: ObjectJsonSchema = {
  type: 'object', additionalProperties: false, required: ['feedback', 'subject'], properties: {
    feedback: { type: 'object', required: ['flow', 'message'], additionalProperties: false, properties: {
      flow: { type: 'string', enum: ['continue', 'needs_decision'] }, message: { type: 'string' },
    } },
    subject: { type: 'object', required: ['summary'], additionalProperties: false, properties: { summary: { type: 'string' } } },
  },
};
export class DshAdapter {
  private main?: AgentHandle;
  private mainPreset?: () => Promise<void>;
  private active?: SubagentActivation;
  private starting?: AbortController;
  mainFeedback?: { session: string; value: unknown };
  constructor(private readonly ctx: Context) {}
  commandPath(command: string) { return fileURLToPath(new URL(`../resources/commands/${command}/SKILL.md`, import.meta.url)); }
  async openMain(project: string, previous: string | null, route: AgentOptions) {
    const preset = `nav27-main-${randomUUID()}`;
    this.mainPreset = await this.ctx.agentPresets.register({ id: preset, plugins: [{ name: new URL('./role.js', import.meta.url).href, config: { role: 'main', project } }] });
    const setup = async (ctx: Context) => {
      await this.ctx.agentPresets.mount(ctx, preset);
      const staged = new Map<ToolExecution, unknown>();
      ctx.get('tools')!.register({ name: 'nav_feedback', description: 'Return the current main conversation result. It cannot complete or control child work.', parameters: { ...mainFeedback },
        output: { schema: { type: 'object', properties: { recorded: { type: 'boolean' } }, required: ['recorded'], additionalProperties: false }, render: () => [{ type: 'text', text: 'Main feedback recorded; executor lifecycle is unchanged.' }] },
        execute: async (args: unknown, exec) => {
          const violations = validateJsonSchemaValue(mainFeedback, args);
          if (violations.length) throw new ToolArgsError(violations);
          staged.set(exec, args); exec.concludeTurn(); return { recorded: true };
        },
      });
      ctx.on('tools/result', (exec, result) => {
        const value = staged.get(exec);
        staged.delete(exec);
        if (value === undefined || result.isError) return;
        // No child completion or route authority is granted by a main capture.
        this.mainFeedback = { session: String(this.main?.agent.id ?? ''), value };
      });
    };
    if (previous) {
      // A failed resume is a surfaced technical blocker; do not silently replace history.
      this.main = await this.ctx.agents.resume({ resumeSessionId: SessionId(previous), agentOptions: route, setup });
    } else {
      this.main = await this.ctx.agents.create({ sessionId: SessionId(randomUUID()), meta: { cwd: project, agentPreset: preset }, agentOptions: route, setup });
    }
    const workspaces = this.ctx.get('workspaceRegistry');
    if (workspaces) await (await workspaces.create(project)).attachSession(this.main.agent.id);
    return this.main.agent.id;
  }
  async execute(input: { project: string; operation: { childSession: string; id: string; routes: { exe: AgentOptions } }; task: { runtime_context?: { write_boundary?: string[]; allowed_write_scope?: string[]; forbidden_scope?: string[] } }; contract: string; outputSchema: ObjectJsonSchema }) {
    if (!this.main) throw new Error('Main session unavailable');
    const preset = `nav27-exe-${input.operation.id}`;
    const removePreset = await this.ctx.agentPresets.register({ id: preset, plugins: [{ name: new URL('./role.js', import.meta.url).href, config: {
      role: 'exe', project: input.project,
      boundary: input.task.runtime_context?.write_boundary ?? input.task.runtime_context?.allowed_write_scope,
      forbidden: input.task.runtime_context?.forbidden_scope,
    } }] });
    this.starting = new AbortController();
    let activation: SubagentActivation | undefined;
    try {
      activation = await this.ctx.subagents.startActivation({ provider: 'spawn', delivery: 'caller', label: 'DevRails exe', childId: SessionId(input.operation.childSession), signal: this.starting.signal,
        request: { parent: this.main.agent, cwd: input.project, agentPreset: preset, agentOptions: input.operation.routes.exe, maxDepth: 1, outputSchema: input.outputSchema,
          prompt: [{ type: 'text', text: `${input.contract}\n\nHOST ASSIGNMENT\nLocal checks, verify, red and reports are OFF for this execution. Return actual implementation evidence; never claim PASS. Read applicable project context.\nTask:\n${JSON.stringify(input.task, null, 2)}` }],
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
  async stop() {
    this.starting?.abort();
    this.main?.agent.cancel({ kind: 'user' });
    await this.active?.dispose();
  }
  async dispose() { await this.main?.dispose(); await this.mainPreset?.(); }
}
