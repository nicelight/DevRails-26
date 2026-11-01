import test from 'node:test';
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
import Gateway from '@deepseek-ai/dsh-api-gateway';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const taskId = 'TASK-001-T1-FT-001-W1';
function call(name, args, id) {
  return [
    { type: 'block-start', index: 0, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 0, id: ToolCallId(id), name, argumentsDelta: JSON.stringify(args) },
    { type: 'block-end', index: 0, block: { type: 'tool-call', id: ToolCallId(id), name, arguments: JSON.stringify(args) } },
    { type: 'usage', usage: { inputTokens: 10, outputTokens: 5 } },
    { type: 'finish', reason: { kind: 'tool-calls' } },
  ];
}
class FixtureProvider extends LlmAdapter {
  requests = [];
  constructor(script) { super(); this.script = script; }
  async resolveModel(provider, model) { return { provider, id: model, name: model }; }
  async *stream(options) {
    this.requests.push(options);
    const entry = this.script.shift();
    if (!entry) throw new Error('Fixture script exhausted');
    const chunks = typeof entry === 'function' ? await entry(options) : entry;
    yield* chunks;
  }
}
async function waitFor(read, predicate, label) {
  const until = Date.now() + 15000;
  while (Date.now() < until) { const value = await read(); if (predicate(value)) return value; await new Promise(r => setTimeout(r, 25)); }
  throw new Error(`Timed out: ${label}; ${JSON.stringify(await read())}`);
}
async function fixture(t, script) {
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
  await ctx.plugin(Subagents); await ctx.plugin(Spawn, { providerName: 'spawn' });
  await ctx.plugin(AgentLoop, { agents: [] });
  await ctx.plugin(AgentPresets, { default: 'nav-unused-default' });
  const provider = new FixtureProvider(script); ctx.llm.registerAdapter(['fixture'], provider);
  await ctx.plugin(WebServer, { host: '127.0.0.1', port: 0 });
  let credentials;
  ctx.provide('credentials', { readRecord: async () => credentials, modifyRecord: async (_key, mutate) => credentials = await mutate(credentials), deleteRecord: async () => { credentials = undefined; } });
  await ctx.plugin(Connection);
  await ctx.plugin(Typert); await ctx.plugin(RemoteAccess); await ctx.plugin(Gateway);
  ctx.webServer.register({ kind: 'exact', path: '/', handler(req, res) { if (ctx.connection.authorizeIndex(req, res)) res.writeHead(200).end('Native auth fixture'); } });
  const row = await ctx.loader.create({ name: pathToFileURL(join(installed, 'lib/index.js')).href, config: { project, main: { provider: 'fixture', model: 'main' }, exe: { provider: 'fixture', model: 'executor' } } });
  await ctx.loader.await();
  await ctx.loader.resolve(row).fiber?.await();
  assert.ok(ctx.get('nav27'), 'Nav host loaded through the native Loader');
  return { ctx, root, project, installed, provider, row, readTask: async () => JSON.parse(await readFile(join(project, `.memory-bank/tasks/${taskId}.task.json`), 'utf8')) };
}
const completed = { feedback: { flow: 'continue', message: 'Implementation is complete; selected checks were off.' }, subject: { implementation: 'complete', evidence: ['Created src/greeting.js exporting greeting = Hello; no local checks executed.'] } };

test('external package uses native child lifecycle and retains truthful all-off closure', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('write', { file_path: 'src/greeting.js', content: 'export const greeting = "Hello";\n' }, 'write'), call('structured_output', completed, 'result')]);
  const initial = await f.ctx.nav27.snapshot();
  assert.equal(initial.phase, 'ready');
  const admitted = await f.ctx.nav27.control({ runId: initial.runId, revision: initial.revision, action: 'play', taskId });
  assert.equal(admitted.phase, 'running');
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => ['done', 'blocked'].includes(v.phase), 'native child settlement');
  assert.equal(final.phase, 'done', final.blocker ?? '');
  assert.equal(await readFile(join(f.project, 'src/greeting.js'), 'utf8'), 'export const greeting = "Hello";\n');
  const task = await f.readTask();
  assert.equal(task.status, 'done');
  assert.equal(task.verify[0].implementation, 'complete');
  for (const field of ['local_checks', 'verification', 'red_verification']) assert.equal(task.verify[0][field], 'skipped');
  assert.deepEqual(task.verify[0].selected.protocols, []);
  assert.equal(f.provider.requests.length, 2);
  assert.deepEqual(f.provider.requests[0].tools.map(tool => tool.name).sort(), ['edit', 'read', 'structured_output', 'write']);
  const main = f.ctx.agents.get(initial.mainSession);
  assert.deepEqual(f.ctx.tools.schemas(main).map(tool => tool.name).sort(), ['nav_feedback', 'read']);
  const childHeader = (await f.ctx.sessionPersistence.stat(final.childSession)).header;
  assert.equal(childHeader.parentSession, initial.mainSession);
});


test('authenticated HTTP page and generated typed Remote work from external delivery', { timeout: 30000 }, async t => {
  const f = await fixture(t, []);
  const origin = f.ctx.webServer.getOrigin();
  assert.equal((await fetch(origin + '/nav27/')).status, 401);
  const login = await fetch(f.ctx.connection.authenticatedUrl(origin + '/'), { redirect: 'manual' });
  const cookie = login.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie, 'Native authentication issues a browser cookie');
  const page = await fetch(origin + '/nav27/', { headers: { cookie } });
  assert.equal(page.status, 200);
  assert.match(await page.text(), /app.js/);
  assert.equal((await fetch(origin + '/nav27/app.js', { headers: { cookie } })).status, 200);
  const client = new Context();
  t.after(() => client.fiber.dispose());
  const { installConnection } = await import('@deepseek-ai/dsh-client-connection/client');
  const ClientTypert = await import('@deepseek-ai/dsh-typert-registry/client');
  const ClientGateway = await import('@deepseek-ai/dsh-api-gateway/client');
  const { default: remote } = await import(pathToFileURL(join(f.installed, 'lib/typert.remote-client.js')).href);
  installConnection(client, { transport: { fetch: (input, init) => fetch(new URL(String(input), origin), { ...init, headers: { ...init?.headers, cookie, origin } }), streamBaseUrl: origin } });
  await client.plugin(ClientTypert);
  await client.plugin(ClientGateway);
  await client.remote.$mount(remote);
  const reply = await client.remote.nav27.snapshot();
  assert.equal(reply.ok, true, JSON.stringify(reply));
  const snapshot = reply.value;
  assert.equal(snapshot.phase, 'ready');
  const stale = await client.remote.nav27.control({ runId: snapshot.runId, revision: snapshot.revision - 1, action: 'play', taskId });
  assert.equal(stale.ok, false);
  assert.equal(stale.error.code, 'nav27/rejected');
  assert.match(stale.error.message, /Stale run/);
  assert.equal(f.provider.requests.length, 0);
});

test('executor write boundary rejects effects and retains partial evidence', { timeout: 30000 }, async t => {
  const f = await fixture(t, [
    call('write', { file_path: 'outside.js', content: 'must not exist' }, 'outside'),
    options => {
      assert.equal(options.messages.at(-1).isError, true);
      return call('structured_output', { feedback: { flow: 'needs_decision', message: 'Write scope requires operator decision.' }, subject: { implementation: 'partial', evidence: ['Attempted write was denied; no implementation completed.'] } }, 'partial');
    },
  ]);
  const before = await f.ctx.nav27.snapshot();
  await f.ctx.nav27.control({ runId: before.runId, revision: before.revision, action: 'play', taskId });
  const after = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'blocked', 'scope refusal');
  assert.match(after.blocker, /scope/);
  await assert.rejects(readFile(join(f.project, 'outside.js')), { code: 'ENOENT' });
  const task = await f.readTask();
  assert.equal(task.status, 'in_progress');
  assert.equal(task.verify[0].implementation, 'partial');
});

test('required gates reject admission before native execution', { timeout: 30000 }, async t => {
  const f = await fixture(t, []);
  const task = await f.readTask();
  task.gates = [{ name: 'local', command: 'npm test', required: true }];
  await writeFile(join(f.project, `.memory-bank/tasks/${taskId}.task.json`), JSON.stringify(task));
  const before = await f.ctx.nav27.snapshot();
  await assert.rejects(() => f.ctx.nav27.control({ runId: before.runId, revision: before.revision, action: 'play', taskId }), /Required gates/);
  assert.equal(f.provider.requests.length, 0);
  assert.equal((await f.readTask()).status, 'ready');
});
