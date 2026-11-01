import { Context } from '@deepseek-ai/cordis';
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type {} from '@deepseek-ai/dsh-host-webserver';
import type {} from '@deepseek-ai/dsh-client-connection';
import type { AgentOptions } from '@deepseek-ai/dsh-agent';
import { readFile } from 'node:fs/promises';
import { DshAdapter } from './adapter.js';
import { Controller } from './controller.mjs';

import type { View, Control } from './types.js';
export interface Config { project: string; main: AgentOptions; exe: AgentOptions }
declare module '@deepseek-ai/cordis' { interface Context { nav27: NavRemote } }
declare module '@deepseek-ai/dsh-typert-protocol' { interface RemoteErrorDetailsMap { 'nav27/rejected': { current: View } } }

/** One project controller, accessed through the existing authenticated Gateway. */
export class NavRemote extends TypertRemoteService {
  constructor(ctx: Context, private controller: Controller) { super(ctx, 'nav27', { namespace: 'nav27' }); }
  private view(): View {
    const run = this.controller.snapshot();
    return { runId: run.id, revision: run.revision, phase: run.phase, hold: run.hold, taskId: run.taskId,
      mainSession: run.mainSession, childSession: run.operation?.childSession ?? null, blocker: run.blocker,
      verification: run.phase === 'done' ? 'skipped — no functional PASS' : 'not run (all reviews off)',
    };
  }
  /** Return a replacement snapshot; polling never admits work. */
  @Remote('snapshot')
  async snapshot(): Promise<View> { return this.view(); }
  /** Apply a control only to the current run revision. */
  @Remote('control')
  async control(request: Control): Promise<View> {
    try { await this.controller.control(request); return this.view(); }
    catch (error) { throw new RemoteError('nav27/rejected', (error as Error).message, { current: this.view() }); }
  }
}
export const name = 'devrails-nav27';
export const inject = ['agents', 'subagents', 'agentPresets', 'tools', 'connection', 'webServer'];
export async function apply(ctx: Context, config: Config) {
  if (!config.project || !config.main?.provider || !config.main.model || !config.exe?.provider || !config.exe.model) throw new Error('Nav requires project and explicit main/exe provider/model routes');
  const adapter = new DshAdapter(ctx);
  const controller = new Controller(config.project, adapter, { main: config.main, exe: config.exe });
  await controller.open();
  ctx.effect(() => () => controller.dispose());
  new NavRemote(ctx, controller);
  ctx.webServer.register({ kind: 'prefix', path: '/nav27', handler: async (request, response) => {
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
}
