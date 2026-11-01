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
import Subprocess from '@deepseek-ai/dsh-subprocess-local';
import BashLocal from '@deepseek-ai/dsh-bash-local';
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
async function fixture(t, script, options = {}) {
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
  if (options.shell) { await ctx.plugin(Subprocess); await ctx.plugin(BashLocal, { cwd: project }); }
  await ctx.plugin(AgentLoop, { agents: [] });
  await ctx.plugin(AgentPresets, { default: 'nav-unused-default' });
  const provider = new FixtureProvider(script); ctx.llm.registerAdapter(['fixture'], provider);
  await ctx.plugin(WebServer, { host: '127.0.0.1', port: 0 });
  let credentials;
  ctx.provide('credentials', { readRecord: async () => credentials, modifyRecord: async (_key, mutate) => credentials = await mutate(credentials), deleteRecord: async () => { credentials = undefined; } });
  await ctx.plugin(Connection);
  await ctx.plugin(Typert); await ctx.plugin(RemoteAccess); await ctx.plugin(Gateway);
  ctx.webServer.register({ kind: 'exact', path: '/', handler(req, res) { if (ctx.connection.authorizeIndex(req, res)) res.writeHead(200).end('Native auth fixture'); } });
  const row = await ctx.loader.create({ name: pathToFileURL(join(installed, 'lib/index.js')).href, config: { project, attemptLimit: options.attemptLimit, main: { provider: 'fixture', model: 'main' }, exe: { provider: 'fixture', model: 'executor' } } });
  await ctx.loader.await();
  await ctx.loader.resolve(row).fiber?.await();
  assert.ok(ctx.get('nav27'), 'Nav host loaded through the native Loader');
  const initial = await ctx.nav27.snapshot();
  await ctx.nav27.settings({ runId: initial.runId, revision: initial.revision, settingsRevision: initial.settingsRevision, settings: { ...initial.settings, selected: { ...initial.settings.selected, local_checks: false, ...(options.selected ?? {}) }, routes: { ...initial.settings.routes, verify_main: { provider: 'fixture', model: 'review-main' }, verify_secondary: { provider: 'fixture', model: 'review-secondary' }, verify_code: { provider: 'fixture', model: 'review-code' }, red: { provider: 'fixture', model: 'red' } } } });
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

const reviewed = (verdict, evidence = ['Read src/greeting.js and compared the exported value with the task-owned outcome.']) => ({ feedback: { flow: 'continue', message: 'Assigned inspection completed.' }, subject: { verdict, evidence } });
async function control(f, action, extra = {}) { const v = await f.ctx.nav27.snapshot(); return f.ctx.nav27.control({ runId: v.runId, revision: v.revision, action, ...extra }); }
async function select(f, update) { const v = await f.ctx.nav27.snapshot(); return f.ctx.nav27.settings({ runId: v.runId, revision: v.revision, settingsRevision: v.settingsRevision, settings: update(structuredClone(v.settings)) }); }
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }

test('native bash performs selected local gate before independent read-only reviews', { timeout: 30000 }, async t => {
  const f = await fixture(t, [
    call('write', { file_path: 'src/greeting.js', content: 'export const greeting = "Hello";\n' }, 'write'),
    call('bash', { description: 'Check the exported greeting value', command: `node --input-type=module -e 'import { greeting } from "./src/greeting.js"; if (greeting !== "Hello") process.exit(1); console.log("greeting-ok")'` }, 'check'),
    options => {
      assert.match(JSON.stringify(options.messages.at(-1)), /greeting-ok/);
      return call('structured_output', { ...completed, subject: { ...completed.subject, local_checks: { result: 'passed', evidence: ['node imported src/greeting.js, asserted greeting equals Hello and exited 0 with greeting-ok.'] } } }, 'exe');
    },
    call('read', { file_path: 'src/greeting.js' }, 'read'),
    options => { assert.deepEqual(options.tools.map(tool => tool.name).sort(), ['read', 'structured_output']); return call('structured_output', reviewed('PASS'), 'verify'); },
    call('structured_output', reviewed('semantic-pass', ['Inspected src/greeting.js export and task scope; no semantic discrepancy found.']), 'red'),
  ], { shell: true, selected: { local_checks: true, verify: ['main'], red_verify: true } });
  const task = await f.readTask(); task.gates = [{ name: 'greeting', command: 'node greeting assertion', required: true }];
  await writeFile(join(f.project, `.memory-bank/tasks/${taskId}.task.json`), JSON.stringify(task));
  await control(f, 'play', { taskId });
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase !== 'running', 'selected native work');
  assert.equal(final.phase, 'done', final.blocker ?? '');
  const evidence = (await f.readTask()).verify[0];
  assert.equal(evidence.local_checks.result, 'passed');
  assert.equal(evidence.verification[0].verdict, 'PASS');
  assert.equal(evidence.red_verification.verdict, 'semantic-pass');
  await doctorAccepts(f);
  assert.deepEqual(f.provider.requests.map(r => r.model), ['executor', 'executor', 'executor', 'review-main', 'review-main', 'red']);
});

test('red waits for exe station; future verify/red can be disabled without another attempt', { timeout: 30000 }, async t => {
  const release = deferred(), entered = deferred();
  const f = await fixture(t, [async () => { entered.resolve(); await release.promise; return call('structured_output', completed, 'exe'); }], { selected: { verify: ['main'], red_verify: true } });
  await control(f, 'play', { taskId }); await entered.promise;
  await control(f, 'red');
  await assert.rejects(select(f, s => s), /station/);
  release.resolve();
  const station = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'stopped', 'exe station');
  assert.equal(station.editable, true);
  const attempt = (await f.readTask()).verify[0].attempt;
  await select(f, s => { s.selected.verify = []; s.selected.red_verify = false; return s; });
  await control(f, 'green');
  const task = await f.readTask();
  assert.equal(task.status, 'done'); assert.equal(task.verify.length, 1); assert.equal(task.verify[0].attempt, attempt);
  assert.equal(task.verify[0].verification, 'skipped'); assert.equal(task.verify[0].red_verification, 'skipped');
  assert.equal(f.provider.requests.length, 1);
});

test('all selected peers retain the whole-leg model snapshot and packed references are readable', { timeout: 30000 }, async t => {
  const release = deferred(), entered = deferred();
  let resource;
  const f = await fixture(t, [
    call('structured_output', completed, 'exe'),
    async () => { entered.resolve(); await release.promise; return call('structured_output', reviewed('PASS'), 'main'); },
    () => call('read', { file_path: resource }, 'reference'),
    options => { assert.notEqual(options.messages.at(-1).isError, true); assert.match(JSON.stringify(options.messages.at(-1)), /finding|adjudication/i); return call('structured_output', reviewed('PASS'), 'secondary'); },
  ], { selected: { verify: ['main', 'secondary'] } });
  resource = join(f.installed, 'resources/commands/verify/references/finding-adjudication.md');
  await control(f, 'play', { taskId }); await entered.promise;
  await control(f, 'pause');
  await assert.rejects(select(f, s => { s.routes.verify_secondary.model = 'changed'; return s; }), /station/);
  release.resolve();
  await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'stopped', 'whole review station');
  assert.deepEqual((await f.readTask()).verify[0].verification.map(v => v.participant), ['main', 'secondary']);
  assert.deepEqual(f.provider.requests.map(r => r.model), ['executor', 'review-main', 'review-secondary', 'review-secondary']);
  await control(f, 'green'); assert.equal((await f.readTask()).status, 'done');
});

test('candidate-only and red-alone remain distinct evidence without hidden functional proof', { timeout: 30000 }, async t => {
  for (const candidate of [true, false]) await t.test(candidate ? 'candidate-only' : 'red-alone', async t => {
    const subject = candidate ? { candidate_findings: 'none', evidence: ['Read src/greeting.js; no scoped code findings.'] } : { verdict: 'semantic-pass', evidence: ['Inspected task meaning and src/greeting.js; functional verification was not selected.'] };
    const f = await fixture(t, [call('structured_output', completed, 'exe'), call('structured_output', { feedback: { flow: 'continue', message: 'Review complete.' }, subject }, 'review')], { selected: { verify: candidate ? ['code'] : [], red_verify: !candidate } });
    await control(f, 'play', { taskId });
    const final = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase !== 'running', 'independent review');
    assert.equal(final.phase, 'done', final.blocker ?? '');
    const e = (await f.readTask()).verify[0];
    if (candidate) { assert.equal(e.verification[0].candidate_findings, 'none'); assert.equal(e.verification[0].verdict, undefined); }
    else { assert.equal(e.verification, 'skipped'); assert.equal(e.red_verification.verdict, 'semantic-pass'); }
    assert.equal(f.provider.requests.length, 2);
    await doctorAccepts(f);
  });
});

test('actual negative remains blocked pending scoped disposition', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', completed, 'exe'), call('structured_output', reviewed('FAIL', ['src/greeting.js exports a different value than the accepted Hello outcome.']), 'fail')], { selected: { verify: ['main'] } });
  await control(f, 'play', { taskId });
  await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'blocked', 'negative result');
  await assert.rejects(control(f, 'green'), /disposition/);
  assert.equal((await f.readTask()).verify[0].verification[0].verdict, 'FAIL');
  assert.equal((await f.readTask()).status, 'in_progress');
});

async function unload(f) { await f.ctx.loader.resolve(f.row).update({ disabled: true }); await f.ctx.loader.await(); }
async function reload(f) { await f.ctx.loader.resolve(f.row).update({ disabled: false }); await f.ctx.loader.await(); await f.ctx.loader.resolve(f.row).fiber?.await(); assert.ok(f.ctx.get('nav27')); }

test('recovery catches up task evidence ahead of run and retains a manual hold', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', completed, 'exe')]);
  await control(f, 'play', { taskId });
  await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'done', 'completed task');
  const before = await f.ctx.nav27.snapshot();
  await unload(f);
  const path = join(f.project, '.memory-bank/nav27/run.json');
  const run = JSON.parse(await readFile(path)); run.phase = 'running'; run.holds = ['red']; run.operation.peers[0].state = 'prepared';
  await writeFile(path, JSON.stringify(run));
  await reload(f);
  const recovered = await f.ctx.nav27.snapshot();
  assert.equal(recovered.phase, 'stopped'); assert.equal(recovered.hold, 'red'); assert.equal(recovered.mainSession, before.mainSession);
  assert.deepEqual(f.ctx.tools.schemas(f.ctx.agents.get(recovered.mainSession)).map(t => t.name).sort(), ['nav_feedback', 'read']);
  await control(f, 'green'); assert.equal((await f.ctx.nav27.snapshot()).phase, 'done');
  assert.equal(f.provider.requests.length, 1);
});

test('Stop persists before native cancellation and Resume inspects partial effects in the same attempt', { timeout: 30000 }, async t => {
  const f = await fixture(t, [
    call('bash', { description: 'Create partial marker then await cancellation', command: `mkdir -p src; printf 'partial' > src/partial.txt; sleep 30` }, 'partial'),
    call('read', { file_path: 'src/partial.txt' }, 'inspect'),
    options => { assert.match(JSON.stringify(options.messages.at(-1)), /partial/); return call('structured_output', { ...completed, subject: { implementation: 'complete', evidence: ['Inspected retained src/partial.txt after Stop and completed the same task attempt.'] } }, 'resumed'); },
  ], { shell: true });
  await control(f, 'play', { taskId });
  await waitFor(() => readFile(join(f.project, 'src/partial.txt'), 'utf8').catch(() => ''), v => v === 'partial', 'native partial effect');
  const before = (await f.readTask()).verify[0];
  const stopped = await control(f, 'stop'); assert.match(stopped.hold, /stop/);
  const persisted = JSON.parse(await readFile(join(f.project, '.memory-bank/nav27/run.json'))); assert.ok(persisted.holds.includes('stop'));
  await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'interrupted', 'native cancellation');
  await assert.rejects(select(f, s => s), /station/);
  await unload(f); await reload(f);
  assert.equal((await f.ctx.nav27.snapshot()).phase, 'interrupted');
  await control(f, 'resume');
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase !== 'running', 'same-attempt continuation');
  assert.equal(final.phase, 'done', final.blocker ?? '');
  const task = await f.readTask(); assert.equal(task.verify.length, 1); assert.equal(task.verify[0].attempt, before.attempt);
  assert.equal(task.verify[0].local_checks, 'skipped');
  assert.equal(f.provider.requests.length, 3);
});

async function doctorAccepts(f) {
  const { createTerminalCompatibilityChecks } = await import(pathToFileURL(join(f.installed, 'resources/skills/mb-garden/assets/mb-doctor/terminal-compat.mjs')));
  const { createReaders } = await import(pathToFileURL(join(f.installed, 'resources/skills/mb-garden/assets/mb-doctor/readers.mjs')));
  const findings = [];
  const checks = createTerminalCompatibilityChecks({ root: f.project, readers: createReaders(f.project), options: { strict: true }, addFinding: (...args) => findings.push(args) });
  checks.checkWorkflowEvidence({ id: taskId, rel: `.memory-bank/tasks/${taskId}.task.json`, task: await f.readTask() });
  assert.deepEqual(findings, [], JSON.stringify(findings));
}

test('selected reports retain native results and existing text; disabled review has no report', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', completed, 'exe'), call('structured_output', reviewed('PASS'), 'verify')], { selected: { verify: ['main'], protocols: ['run.md', 'verification.md'] } });
  await mkdir(join(f.project, `.protocols/${taskId}`), { recursive: true });
  await writeFile(join(f.project, `.protocols/${taskId}/run.md`), '# Existing task-owned note\nRetain this text.\n');
  await control(f, 'play', { taskId });
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase !== 'running', 'selected reports');
  assert.equal(final.phase, 'done', final.blocker ?? '');
  assert.match(await readFile(join(f.project, `.protocols/${taskId}/run.md`), 'utf8'), /Retain this text/);
  assert.match(await readFile(join(f.project, `.protocols/${taskId}/verification.md`), 'utf8'), /"verdict": "PASS"/);
  await assert.rejects(readFile(join(f.project, `.protocols/${taskId}/red-verification.md`)), { code: 'ENOENT' });
  await doctorAccepts(f);
});

test('scoped repair creates a new bounded execution attempt and preserves failed evidence', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', completed, 'exe'), call('structured_output', reviewed('FAIL'), 'fail'), call('structured_output', completed, 'repair'), call('structured_output', reviewed('PASS'), 'pass')], { selected: { verify: ['main'] } });
  await control(f, 'play', { taskId });
  await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'blocked', 'failed attempt');
  await assert.rejects(control(f, 'repair'), /disposition/);
  await control(f, 'red');
  const task = await f.readTask();
  task.verify[0].verification[0].disposition = { decision: 'repair', source: 'user', reason: 'Correct the observed greeting mismatch within the existing task scope.' };
  await writeFile(join(f.project, `.memory-bank/tasks/${taskId}.task.json`), JSON.stringify(task));
  await assert.rejects(control(f, 'repair'), /holds/);
  await assert.rejects(control(f, 'green'), /disposition/);
  assert.equal((await f.ctx.nav27.snapshot()).hold, null);
  await control(f, 'repair');
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase !== 'running', 'repaired task');
  assert.equal(final.phase, 'done', final.blocker ?? '');
  const after = await f.readTask(); assert.equal(after.verify.length, 2); assert.notEqual(after.verify[0].attempt, after.verify[1].attempt);
  assert.equal(after.verify[0].verification[0].verdict, 'FAIL'); assert.equal(after.verify[1].verification[0].verdict, 'PASS');
  await doctorAccepts(f);
});

test('configured unsuccessful-attempt budget prevents hidden repair execution', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', completed, 'exe'), call('structured_output', reviewed('FAIL'), 'fail')], { selected: { verify: ['main'] }, attemptLimit: 1 });
  await control(f, 'play', { taskId }); await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'blocked', 'budget');
  const task = await f.readTask(); task.verify[0].verification[0].disposition = { decision: 'repair', source: 'autonomous', reason: 'Repair the observed mismatch under the accepted task scope.' };
  await writeFile(join(f.project, `.memory-bank/tasks/${taskId}.task.json`), JSON.stringify(task));
  await assert.rejects(control(f, 'repair'), /budget exhausted/);
  assert.equal(f.provider.requests.length, 2); assert.equal((await f.readTask()).verify.length, 1);
});

test('host advances a ready dependency queue without replaying its completed predecessor', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', completed, 'first'), call('structured_output', completed, 'second')]);
  const second = await f.readTask(); second.id = 'TASK-002-T1-FT-001-W1'; second.depends_on = [taskId];
  await writeFile(join(f.project, `.memory-bank/tasks/${second.id}.task.json`), JSON.stringify(second));
  await writeFile(join(f.project, '.memory-bank/tasks/index.json'), JSON.stringify({ version: 1, tasks: [{ id: second.id, file: `${second.id}.task.json` }, { id: taskId, file: `${taskId}.task.json` }] }));
  await control(f, 'play');
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase !== 'running', 'dependency queue');
  assert.equal(final.phase, 'done', final.blocker ?? ''); assert.equal(final.taskId, second.id);
  assert.equal((await f.readTask()).status, 'done');
  assert.equal(JSON.parse(await readFile(join(f.project, `.memory-bank/tasks/${second.id}.task.json`))).status, 'done');
  assert.equal(f.provider.requests.length, 2);
});

test('accepted continue disposition permits closure without erasing the actual FAIL', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', completed, 'exe'), call('structured_output', reviewed('FAIL'), 'fail')], { selected: { verify: ['main'] } });
  await control(f, 'play', { taskId }); await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'blocked', 'failure');
  const task = await f.readTask(); task.verify[0].verification[0].disposition = { decision: 'continue', source: 'user', reason: 'Accept the observed task-local mismatch for this development closure.' };
  await writeFile(join(f.project, `.memory-bank/tasks/${taskId}.task.json`), JSON.stringify(task));
  await control(f, 'play');
  assert.equal((await f.readTask()).status, 'done'); assert.equal((await f.readTask()).verify[0].verification[0].verdict, 'FAIL');
  await doctorAccepts(f);
});

test('a decision-needed peer and an unfinished peer are both accounted without synthetic success', { timeout: 30000 }, async t => {
  const f = await fixture(t, [
    call('structured_output', completed, 'exe'),
    call('structured_output', { feedback: { flow: 'needs_decision', message: 'Accepted task outcome needs owner clarification.' }, subject: { verdict: 'NEEDS-CLARIFICATION', evidence: ['The accepted task outcome conflicts with the inspected src/greeting.js API contract.'] } }, 'unclear'),
    [{ type: 'finish', reason: { kind: 'stop' } }],
  ], { selected: { verify: ['main', 'secondary'], red_verify: true } });
  await control(f, 'play', { taskId });
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase !== 'running', 'accounted peers');
  assert.equal(final.phase, 'blocked'); assert.match(final.pending, /clarification/);
  assert.deepEqual(final.participants.map(p => p.state), ['complete', 'interrupted']);
  const evidence = (await f.readTask()).verify[0]; assert.equal(evidence.verification.length, 1); assert.equal(evidence.red_verification, undefined);
  await unload(f); await reload(f);
  assert.match((await f.ctx.nav27.snapshot()).pending, /clarification/);
  await assert.rejects(control(f, 'play'), /clarification/);
  assert.equal(f.provider.requests.length, 3);
});

test('partial execution leaves unfinished selected checks absent; production remainder stays explicit', { timeout: 30000 }, async t => {
  await t.test('partial', async t => {
    const f = await fixture(t, [call('structured_output', { feedback: { flow: 'needs_decision', message: 'Task owner must resolve the observed scope boundary.' }, subject: { implementation: 'partial', evidence: ['Inspected src/greeting.js; boundary prevents completing the requested change.'] } }, 'partial')], { selected: { local_checks: true } });
    await control(f, 'play', { taskId }); await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'blocked', 'partial check');
    const evidence = (await f.readTask()).verify[0]; assert.equal(evidence.implementation, 'partial'); assert.equal(evidence.local_checks, undefined);
  });
  await t.test('production remainder', async t => {
    const f = await fixture(t, [call('structured_output', { ...completed, subject: { ...completed.subject, production_remainder: 'Production deployment acceptance remains with the release owner; no deployment was performed.' } }, 'remainder')]);
    await control(f, 'play', { taskId }); await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'done', 'development completion');
    assert.equal((await f.readTask()).status, 'done_for_prod'); assert.match((await f.readTask()).verify[0].production_remainder, /release owner/);
    await doctorAccepts(f);
  });
});
