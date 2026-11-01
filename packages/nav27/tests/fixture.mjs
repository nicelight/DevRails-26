import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Context } from '@deepseek-ai/cordis';
import Loader from '@deepseek-ai/cordis-plugin-loader';
import Include from '@deepseek-ai/cordis-plugin-include';
import { mountAgentLoopTestDependencies } from '@deepseek-ai/dsh-agent-loop-testkit';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import AgentPresets from '@deepseek-ai/dsh-agent-preset-registry';
import Subagents from '@deepseek-ai/dsh-subagent';
import * as Spawn from '@deepseek-ai/dsh-subagent-spawn-in-process';
import * as Persistence from '@deepseek-ai/dsh-session-persistence-jsonl';
import { LlmAdapter, ToolCallId } from '@deepseek-ai/dsh-llm';
import WebServer from '@deepseek-ai/dsh-host-webserver';
import * as Connection from '@deepseek-ai/dsh-client-connection';
import Typert from '@deepseek-ai/dsh-typert-registry';
import RemoteAccess from '@deepseek-ai/dsh-api-remote-access';
import Subprocess from '@deepseek-ai/dsh-subprocess-local';
import BashLocal from '@deepseek-ai/dsh-bash-local';
import Gateway from '@deepseek-ai/dsh-api-gateway';
import SessionQueryEngine from '@deepseek-ai/dsh-session-query';
import Storage from '@deepseek-ai/dsh-storage';
import * as StorageJson from '@deepseek-ai/dsh-storage-json';
import * as StorageDomain from '@deepseek-ai/dsh-storage-domain';
import Workspace from '@deepseek-ai/dsh-workspace';
import SessionController from '@deepseek-ai/dsh-api-session-controller';
import AgentDefaultModel from '@deepseek-ai/dsh-agent-default-model';
class FixtureQuery extends SessionQueryEngine {
  async searchSessions() { throw new Error('Search is not part of this deterministic fixture'); }
  async searchEvents() { throw new Error('Search is not part of this deterministic fixture'); }
}


const packageRoot = fileURLToPath(new URL('../', import.meta.url));
export const taskId = 'TASK-001-T1-FT-001-W1';
export function call(name, args, id) {
  return [
    { type: 'block-start', index: 0, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 0, id: ToolCallId(id), name, argumentsDelta: JSON.stringify(args) },
    { type: 'block-end', index: 0, block: { type: 'tool-call', id: ToolCallId(id), name, arguments: JSON.stringify(args) } },
    { type: 'usage', usage: { inputTokens: 10, outputTokens: 5 } },
    { type: 'finish', reason: { kind: 'tool-calls' } },
  ];
}
export class FixtureProvider extends LlmAdapter {
  requests = [];
  constructor(script, models = {}) { super(); this.script = script; this.models = models; }
  async resolveModel(provider, model) { return { provider, id: model, name: model }; }
  async listModels(provider) { return ['main', 'executor', 'side', 'review-main', 'review-secondary', 'review-code', 'red', 'judge'].map(id => ({ provider, id, name: id })); }
  async *stream(options) {
    this.requests.push(options);
    const entry = (typeof this.models[options.model] === 'function' ? this.models[options.model] : this.models[options.model]?.shift()) ?? (options.model === 'main' ? [{ type: 'finish', reason: { kind: 'stop' } }] : this.script.shift());
    if (!entry) throw new Error('Fixture script exhausted');
    const chunks = typeof entry === 'function' ? await entry(options) : entry;
    yield* chunks;
  }
}
export async function waitFor(read, predicate, label) {
  const until = Date.now() + 15000;
  while (Date.now() < until) { const value = await read(); if (predicate(value)) return value; await new Promise(r => setTimeout(r, 25)); }
  throw new Error(`Timed out: ${label}; ${JSON.stringify(await read())}`);
}
export async function fixture(t, script, options = {}) {
  const root = await mkdtemp(join(tmpdir(), 'nav27-native-'));
  const project = join(root, 'project'); const installed = join(root, 'installed');
  await mkdir(project); await mkdir(installed);
  const [packed] = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', root], { cwd: packageRoot, encoding: 'utf8' }));
  execFileSync('tar', ['-xzf', join(root, packed.filename), '--strip-components=1', '-C', installed]);
  // Runtime dependencies are the single installed DSH baseline; no Nav source is in this installation.
  const { symlink } = await import('node:fs/promises');
  await symlink(resolve(packageRoot, '../../node_modules'), join(installed, 'node_modules'), 'dir');
  execFileSync(process.execPath, [join(installed, 'resources/skills/_shared/scripts/init-mb.js')], { cwd: project, stdio: 'pipe' });
  const task = {
    id: taskId, title: 'Create one greeting module', status: 'ready', wave: 'W1', feature: 'FT-001', tier: 'T1',
    purpose: 'Expose a reusable greeting', success_outcome: 'src/greeting.js exports greeting equal to Hello',
    reqs: [], depends_on: [], touched_files: ['src/greeting.js'], gates: [], verify: [], docs: [], evidence_required: [],
    source_artifacts: [], normative_inputs: [], constraints: [], invariants: [], verification_targets: [],
    runtime_context: { write_boundary: ['src'] },
  };
  await writeFile(join(project, '.memory-bank/tasks/index.json'), JSON.stringify({ version: 1, tasks: [{ id: taskId, file: `${taskId}.task.json` }] }));
  await writeFile(join(project, `.memory-bank/tasks/${taskId}.task.json`), JSON.stringify(task));
  const ctx = new Context();
  t.after(async () => { await ctx.fiber.dispose(); await rm(root, { recursive: true, force: true }); });
  ctx.baseUrl = pathToFileURL(installed + '/').href;
  await ctx.plugin(Loader); ctx.loader.builtins.include = Include;
  await mountAgentLoopTestDependencies(ctx, { workingDirectory: true });
  await ctx.plugin(Persistence, { root: join(root, 'sessions'), compression: 'none' });
  await ctx.plugin(Storage); await ctx.plugin(StorageJson, { root: join(root, 'storage') });
  await ctx.plugin(StorageDomain, { backend: 'json' }); await ctx.plugin(Workspace);
  await ctx.plugin(FixtureQuery);
  await ctx.plugin(Subagents); await ctx.plugin(Spawn, { providerName: 'spawn' });
  if (options.shell) { await ctx.plugin(Subprocess); await ctx.plugin(BashLocal, { cwd: project }); }
  await ctx.plugin(AgentLoop, { agents: [] });
  await ctx.plugin(AgentPresets, { default: 'nav-unused-default' });
  const provider = new FixtureProvider(script, options.models); ctx.llm.registerAdapter(['fixture'], provider);
  await ctx.plugin(WebServer, { host: '127.0.0.1', port: 0 });
  let credentials;
  ctx.provide('credentials', { readRecord: async () => credentials, modifyRecord: async (_key, mutate) => credentials = await mutate(credentials), deleteRecord: async () => { credentials = undefined; } });
  await ctx.plugin(Connection);
  await ctx.plugin(Typert); await ctx.plugin(RemoteAccess); await ctx.plugin(Gateway);
  await ctx.plugin(AgentDefaultModel, { provider: 'fixture', model: 'main' });
  // Text-only intake mirrors the upstream Session Remote test assembly. Session
  // prompt, history, stream, cancellation and archive gates remain native.
  ctx.provide('attachments', { imageLimits: { maxImageBytes: 20000000, maxImagesPerMessage: 1, maxMessageImageBytes: 20000000, maxImagePixels: 100000000, maxImageDimension: 10000, mediaTypes: ['image/png'] }, admitPromptContent: async content => { if (content.some(part => part.type !== 'text')) throw new Error('Preview supports text only'); return content; } });
  ctx.provide('fileUploads', { registerAgentResolver: () => () => {}, resolve: () => undefined, bindPrompt: () => ({ commit() {}, [Symbol.dispose]() {} }), retirePrompt() {} });
  await ctx.plugin(SessionController, { nativeOpen: false });
  ctx.webServer.register({ kind: 'exact', path: '/', handler(req, res) { if (ctx.connection.authorizeIndex(req, res)) res.writeHead(200).end('Native auth fixture'); } });
  const row = await ctx.loader.create({ name: pathToFileURL(join(installed, 'lib/index.js')).href, config: { project, attemptLimit: options.attemptLimit, main: { provider: 'fixture', model: 'main' }, exe: { provider: 'fixture', model: 'executor' } } });
  await ctx.loader.await();
  await ctx.loader.resolve(row).fiber?.await();
  assert.ok(ctx.get('nav27'), 'Nav host loaded through the native Loader');
  const initial = await ctx.nav27.snapshot();
  if (!options.skipInitialSettings) await ctx.nav27.settings({ runId: initial.runId, revision: initial.revision, settingsRevision: initial.settingsRevision, settings: { ...initial.settings, selected: { ...initial.settings.selected, local_checks: false, ...(options.selected ?? {}) }, routes: { ...initial.settings.routes, verify_main: { provider: 'fixture', model: 'review-main' }, verify_secondary: { provider: 'fixture', model: 'review-secondary' }, verify_code: { provider: 'fixture', model: 'review-code' }, red: { provider: 'fixture', model: 'red' }, judge: { provider: 'fixture', model: 'judge' }, side: { provider: 'fixture', model: 'side' } } } });
  return { ctx, root, project, installed, provider, row, readTask: async () => JSON.parse(await readFile(join(project, `.memory-bank/tasks/${taskId}.task.json`), 'utf8')) };
}
