import type { Context } from '@deepseek-ai/cordis';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import type { UserMessage } from '@deepseek-ai/dsh-llm';
import { ToolArgsError, validateJsonSchemaValue } from '@deepseek-ai/dsh-tools';
import type { ObjectJsonSchema, ToolExecution } from '@deepseek-ai/dsh-tools';

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap { 'nav27': { kind: 'nav27'; assignment: string } }
}
export interface MainAssignment {
  id: string;
  purpose: 'conversation' | 'proposal' | 'answer' | 'inspection' | 'inspection-result';
  schema: ObjectJsonSchema;
  prompt: string;
  resume: unknown;
  messageId?: string;
  userIds?: string[];
  captured?: boolean;
}
export const mainEnvelope: ObjectJsonSchema = {
  type: 'object', additionalProperties: false, required: ['feedback', 'subject'], properties: {
    feedback: { type: 'object', required: ['flow', 'message'], additionalProperties: false, properties: {
      flow: { type: 'string', enum: ['continue', 'needs_decision'] }, message: { type: 'string' }, detail: { type: 'object' },
    } }, subject: { type: 'object' },
  },
};
export function assignmentMessage(assignment: MainAssignment): UserMessage {
  return createUserMessage({ source: { kind: 'nav27', assignment: assignment.id }, content: [{ type: 'text', text: `${assignment.prompt}\nHOST ASSIGNMENT ${assignment.id}: ${assignment.purpose}. Return nav_feedback matching this current schema:\n${JSON.stringify(assignment.schema)}\nResume reference: ${JSON.stringify(assignment.resume)}` }] });
}
export interface MainHost {
  assignment(id?: string): MainAssignment | undefined;
  admit(assignment: MainAssignment): Promise<void>;
  user(messages: UserMessage[]): Promise<MainAssignment | undefined>;
  capture(assignment: MainAssignment, value: unknown, currentInput: () => boolean): Promise<void>;
  error(error: unknown): void;
}
/** One native step binding; queued steering never relabels an already running call. */
export function mountMainFeedback(ctx: Context, host: MainHost) {
  let admitted: MainAssignment | undefined;
  let latestUser: string | undefined;
  const staged = new Map<ToolExecution['token'], { assignment: MainAssignment; value: unknown }>();
  const captured = new Set<string>();
  ctx.on('agent/inbox/inserted', ({ message }) => { if (message.source.kind === 'user') latestUser = String(message.id); });
  ctx.on('agent/pre-step', async (payload, next) => {
    const decision = await next();
    if (decision.kind !== 'enter') return decision;
    const owned = decision.messages.filter(message => message.source.kind === 'nav27');
    const marker = owned.at(-1);
    let assignment = marker?.source.kind === 'nav27' ? host.assignment(marker.source.assignment) : undefined;
    if (assignment && assignment.messageId !== String(marker?.id)) assignment = undefined;
    const users = decision.messages.filter(message => message.source.kind === 'user');
    // H takes precedence for this step; actual user input is retained by the host.
    const answer = users.length ? await host.user(users) : undefined;
    assignment ??= answer ?? admitted ?? host.assignment();
    if (!assignment) return decision;
    admitted = structuredClone(assignment);
    await host.admit(admitted);
    return { ...decision, messages: [...decision.messages, assignmentMessage(admitted)] };
  });
  ctx.on('agent/error', ({ error }) => host.error(error));
  ctx.on('agent/turn-stopping', () => {
    if (admitted && admitted.purpose !== 'conversation' && !captured.has(admitted.id)) host.error(new Error(`Main ${admitted.purpose} ended without authoritative feedback`));
  });
  ctx.tools.register({ name: 'nav_feedback', description: 'Return the current host-assigned result. The current assignment supplies its exact detail/subject shape.', parameters: { ...mainEnvelope },
    output: { schema: { type: 'object', properties: { recorded: { type: 'boolean' }, message: { type: 'string' } }, required: ['recorded', 'message'], additionalProperties: false }, render: (_args, value) => [{ type: 'text', text: (value as { message: string }).message }] },
    execute: async (value: unknown, exec) => {
      const assignment = admitted;
      if (!assignment || assignment.captured || captured.has(assignment.id) || [...staged.values()].some(item => item.assignment.id === assignment.id)) throw new Error('No uncaptured main assignment');
      if (assignment.purpose === 'answer' && latestUser && !assignment.userIds?.includes(latestUser)) throw new Error('New main user input awaits interpretation');
      const strings = (item: unknown, key = ''): boolean => typeof item === 'string' ? key === 'target' || !!item.trim() : !item || typeof item !== 'object' || Object.entries(item).every(([name, child]) => strings(child, name));
      if (!strings(value)) throw new Error('Feedback requires concrete nonempty values');
      const violations = validateJsonSchemaValue(assignment.schema, value);
      if (violations.length) throw new ToolArgsError(violations);
      staged.set(exec.token, { assignment: structuredClone(assignment), value });
      exec.concludeTurn();
      const feedback = (value as { feedback: { message: string; detail?: { question?: string; action?: string } } }).feedback;
      return { recorded: true, message: feedback.detail?.question ? `${feedback.detail.question}\nAction: ${feedback.detail.action ?? assignment.purpose}` : feedback.message };
    },
  });
  ctx.on('tools/result', (exec, result) => {
    const capture = staged.get(exec.token); staged.delete(exec.token);
    if (!capture || result.isError) return;
    if (capture.assignment.purpose === 'answer' && latestUser && !capture.assignment.userIds?.includes(latestUser)) return;
    captured.add(capture.assignment.id);
    void host.capture(capture.assignment, capture.value, () => !latestUser || !!capture.assignment.userIds?.includes(latestUser)).catch(host.error);
  });
}
