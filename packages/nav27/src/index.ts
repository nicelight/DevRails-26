import * as ShellEnv from '@deepseek-ai/dsh-shell-env';
import { Context } from '@deepseek-ai/cordis';
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type {} from '@deepseek-ai/dsh-host-webserver';
import type {} from '@deepseek-ai/dsh-client-connection';
import type { AgentOptions } from '@deepseek-ai/dsh-agent';
import { readFile } from 'node:fs/promises';
import { DshAdapter } from './adapter.js';
import { Controller } from './controller.mjs';
import { commands } from './commands.mjs';

import type { View, Control, SettingsRequest, SideRequest, DeleteSideRequest } from './types.js';
export interface Config { project: string; main: AgentOptions; exe: AgentOptions; verify_main?: AgentOptions; verify_secondary?: AgentOptions; verify_code?: AgentOptions; red?: AgentOptions; judge?: AgentOptions; attemptLimit?: number }
declare module '@deepseek-ai/cordis' { interface Context { nav27: NavRemote } }
declare module '@deepseek-ai/dsh-typert-protocol' { interface RemoteErrorDetailsMap { 'nav27/rejected': { current: View } } }

/** One project controller, accessed through the existing authenticated Gateway. */
export class NavRemote extends TypertRemoteService {
  constructor(ctx: Context, private controller: Controller) { super(ctx, 'nav27', { namespace: 'nav27' }); }
  private async view(): Promise<View> {
    const run = this.controller.snapshot();
    let evidence;
    if (run.taskId) { try { const { task } = await this.controller.store.task(run.taskId); evidence = task.verify.filter((entry: { stage: string }) => entry.stage === 'workflow').at(-1); } catch { /* snapshot retains the blocker; absent evidence remains unknown */ } }
    const proof = evidence ? [
      `implementation: ${evidence.implementation ?? 'not recorded'}`,
      `local checks: ${typeof evidence.local_checks === 'string' ? evidence.local_checks : evidence.local_checks?.result ?? 'not recorded'}`,
      `verify: ${typeof evidence.verification === 'string' ? evidence.verification : evidence.verification?.map((item: { participant: string; verdict?: string; candidate_findings?: unknown[] }) => `${item.participant} ${item.verdict ?? `${Array.isArray(item.candidate_findings) ? item.candidate_findings.length : 0} candidates (no functional verdict)`}`).join(', ') || 'not recorded'}`,
      `red: ${typeof evidence.red_verification === 'string' ? evidence.red_verification : evidence.red_verification?.verdict ?? 'not recorded'}`,
    ] : [];
    const facts = await this.controller.adapter.sessionFacts([run.mainSession, ...(run.operation?.peers ?? []).map((peer: { session: string }) => peer.session), ...run.sides.map((side: { id: string }) => side.id), ...(['running', 'complete'].includes(run.inspection?.state) ? [run.inspection.id] : [])].filter(Boolean));
    return { proof, facts, judgeSession: ['running', 'complete'].includes(run.inspection?.state) ? run.inspection.id : null, proposedTarget: run.pending?.proposal?.target ?? null, runId: run.id, revision: run.revision, phase: run.phase, hold: run.hold, taskId: run.taskId,
      sides: run.sides ?? [], mainSession: run.mainSession, childSession: run.operation?.peers?.at(-1)?.session ?? run.operation?.childSession ?? null, blocker: run.blocker,
      participants: (run.operation?.peers ?? []).map((peer: { role: string; session: string; state: string; diagnostic?: string }) => ({ role: peer.role, session: peer.session, state: peer.state === 'prepared' && facts[peer.session]?.state === 'running' ? 'running' : peer.state, diagnostic: peer.diagnostic ?? null })),
      verification: run.operation?.command ?? 'not started', settings: run.settings, settingsRevision: run.settings.revision,
      editable: ['ready', 'stopped'].includes(run.phase) && !run.blocker && !run.pending && !run.operation?.unreconciled, pending: run.pending?.message ?? null, requestId: run.pending?.proposal ? run.pending.id : null, autonomous: !!run.autonomous, inspection: run.inspection?.state === 'running' && facts[run.inspection.id]?.state !== 'running' ? 'delivered' : run.inspection?.state ?? null, commands: Object.keys(commands).sort(), mainError: run.mainError ?? null,
    };
  }
  /** Return a replacement snapshot; polling never admits work. */
  @Remote('snapshot')
  async snapshot(): Promise<View> { return this.view(); }
  @Remote('createSide')
  async createSide(request: SideRequest): Promise<View> {
    try { await this.controller.createSide(request); return this.view(); }
    catch (error) { throw new RemoteError('nav27/rejected', (error as Error).message, { current: await this.view() }); }
  }
  @Remote('deleteSide')
  async deleteSide(request: DeleteSideRequest): Promise<View> {
    try { await this.controller.deleteSide(request); return this.view(); }
    catch (error) { throw new RemoteError('nav27/rejected', (error as Error).message, { current: await this.view() }); }
  }
  @Remote('settings')
  async settings(request: SettingsRequest): Promise<View> {
    try { await this.controller.settings(request); return this.view(); }
    catch (error) { throw new RemoteError('nav27/rejected', (error as Error).message, { current: await this.view() }); }
  }
  /** Apply a control only to the current run revision. */
  @Remote('control')
  async control(request: Control): Promise<View> {
    try { await this.controller.control(request); return this.view(); }
    catch (error) { throw new RemoteError('nav27/rejected', (error as Error).message, { current: await this.view() }); }
  }
}
export const name = 'devrails-nav27';
export const inject = ['llm', 'agents', 'subagents', 'agentPresets', 'tools', 'connection', 'webServer', 'sessionQuery', 'workspaceRegistry', 'sessions'];
export async function apply(ctx: Context, config: Config) {
  if (!config.project || !config.main?.provider || !config.main.model || !config.exe?.provider || !config.exe.model) throw new Error('Nav requires project and explicit main/exe provider/model routes');
  if (ctx.get('shell') && !ctx.get('shellEnv')) await ctx.plugin(ShellEnv);
  const adapter = new DshAdapter(ctx);
  const controller = new Controller(config.project, adapter, { main: config.main, exe: config.exe, verify_main: config.verify_main, verify_secondary: config.verify_secondary, verify_code: config.verify_code, red: config.red, judge: config.judge }, config.attemptLimit);
  await controller.open();
  ctx.effect(() => () => controller.dispose());
  new NavRemote(ctx, controller);
  const removeRoute = ctx.webServer.register({ kind: 'prefix', path: '/nav27', handler: async (request, response) => {
    const admission = ctx.connection.admit(request);
    if ('rejection' in admission) { response.writeHead(admission.rejection).end('Sign in through the native DSH root first.'); return; }
    if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405).end(); return; }
    const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
    const filename = pathname.split('/').at(-1) || 'index.html';
    if (!['index.html', 'app.js', 'app.css'].includes(filename)) { response.writeHead(404).end(); return; }
    const content = await readFile(new URL(`./web/${filename}`, import.meta.url));
    const mime = filename.endsWith('.js') ? 'text/javascript' : filename.endsWith('.css') ? 'text/css' : 'text/html';
    response.writeHead(200, { 'content-type': `${mime}; charset=utf-8`, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } });
  ctx.effect(() => removeRoute);
}
