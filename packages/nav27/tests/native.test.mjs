import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Context } from '@deepseek-ai/cordis';
import { fixture, call, waitFor, taskId } from './fixture.mjs';

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
  assert.equal(f.provider.requests.filter(r => r.model !== 'main').length, 2);
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
  const { runInNewContext } = await import('node:vm');
  let registration, changed, disposed;
  const location = { hash: `#nav27-main=${(await f.ctx.nav27.snapshot()).mainSession}`, pathname: '/', search: '' };
  const window = { __ModuleLoader__: { load: value => registration = value }, addEventListener() {}, removeEventListener() {} };
  runInNewContext(await readFile(join(f.installed, 'lib/client.js'), 'utf8'), { window, location, history: { replaceState() { location.hash = ''; } } });
  assert.equal(registration.id, 'devrails-nav27', 'packed addon uses native script registration');
  const manifest = JSON.parse(await readFile(join(f.installed, 'package.json'), 'utf8'));
  assert.deepEqual(manifest.dsh.client.inject, ['@deepseek-ai/dsh-client-ui-workspace'], 'client graph edges name packages, not Cordis service keys');
  const addon = registration.factory(() => { throw new Error('Unexpected external dependency'); });
  assert.equal(typeof addon.apply, 'function');
  assert.equal(addon.inject.join(','), 'uiWorkspace,sessions');
  let baseline = { phase: 'loading', byId: {} };
  const opened = [];
  addon.apply({ sessions: { list: { getSnapshot: () => baseline, subscribe: callback => { changed = callback; return () => changed = undefined; } } }, uiWorkspace: { openSession: id => { opened.push(id); changed(); } }, effect: setup => disposed = setup() });
  assert.equal(opened.length, 0, 'cold navigation waits for the native session baseline');
  const mainId = (await f.ctx.nav27.snapshot()).mainSession;
  baseline = { phase: 'ready', byId: { [mainId]: {} } }; changed(); changed();
  assert.deepEqual(opened, [mainId]); assert.equal(location.hash, '');
  disposed(); assert.equal(changed, undefined);


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
  assert.equal(f.provider.requests.filter(r => r.model !== 'main').length, 0);
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
  assert.equal(f.provider.requests.filter(r => r.model !== 'main').length, 0);
  assert.equal((await f.readTask()).status, 'ready');
});

const reviewed = (verdict, evidence = ['Read src/greeting.js and compared the exported value with the task-owned outcome.']) => ({ feedback: { flow: 'continue', message: 'Assigned inspection completed.' }, subject: { verdict, evidence } });
async function control(f, action, extra = {}) {
  for (let i = 0; i < 10; i++) {
    const v = await f.ctx.nav27.snapshot();
    try { return await f.ctx.nav27.control({ runId: v.runId, revision: v.revision, action, ...extra }); }
    catch (error) { if (!/Stale run\/revision/.test(error.message)) throw error; }
  }
  throw new Error('Snapshot never settled');
}
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
  assert.equal(f.provider.requests.filter(r => r.model !== 'main').length, 1);
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
    if (candidate) { assert.ok(final.proof.includes('verify: code 0 candidates (no functional verdict)')); assert.equal(e.verification[0].candidate_findings, 'none'); assert.equal(e.verification[0].verdict, undefined); }
    else { assert.equal(e.verification, 'skipped'); assert.equal(e.red_verification.verdict, 'semantic-pass'); }
    assert.equal(f.provider.requests.filter(r => r.model !== 'main').length, 2);
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
  assert.equal(f.provider.requests.filter(r => r.model !== 'main').length, 1);
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
  assert.equal(f.provider.requests.filter(r => r.model !== 'main').length, 3);
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
  assert.equal(f.provider.requests.filter(r => r.model !== 'main').length, 2); assert.equal((await f.readTask()).verify.length, 1);
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
  assert.equal(f.provider.requests.filter(r => r.model !== 'main').length, 2);
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
  assert.equal(f.provider.requests.filter(r => r.model !== 'main').length, 3);
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

const mainReply = (detail, flow = 'continue') => ({ feedback: { flow, message: 'Current assigned interpretation is complete.', ...(detail ? { detail } : {}) }, subject: { summary: 'Interpreted the actual current evidence.' } });
const propose = (overrides = {}) => mainReply({ question: 'Continue this task with the retained result?', action: 'continue', scope: 'current', target: '', missingFacts: [], ...overrides }, 'needs_decision');
const readRun = async f => JSON.parse(await readFile(join(f.project, '.memory-bank/nav27/run.json'), 'utf8'));

test('native main proposal and green authorize one request and preserve the child result', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', { ...completed, feedback: { flow: 'needs_decision', message: 'Owner must accept the task-local tradeoff.' } }, 'exe')], { models: { main: [call('nav_feedback', propose(), 'proposal')] } });
  await control(f, 'play', { taskId });
  const pending = await waitFor(() => f.ctx.nav27.snapshot(), v => !!v.requestId, 'main proposal');
  assert.equal((await f.readTask()).status, 'in_progress');
  await control(f, 'green', { requestId: pending.requestId });
  await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'done', 'approved closure');
  assert.equal((await readRun(f)).decision.origin, 'green');
  assert.equal((await f.readTask()).verify.length, 1);
  await assert.rejects(control(f, 'green', { requestId: pending.requestId }), /Stale pending/);
  assert.equal(f.provider.requests.filter(r => r.model === 'executor').length, 1);
});

test('H wakes idle main while child runs, duplicate reuses consultation and Judge cannot close its leg', { timeout: 30000 }, async t => {
  const child = deferred(); const entered = deferred(); const judge = deferred(); const inspecting = deferred();
  t.after(() => { child.resolve(); judge.resolve(); });
  const f = await fixture(t, [async () => { entered.resolve(); await child.promise; return call('structured_output', completed, 'exe'); }], { models: {
    main: [call('nav_feedback', mainReply({ question: 'Inspect whether my current scope follows the task.', scope: taskId, contextRefs: ['.memory-bank/tasks/index.json'] }), 'inspect'), call('nav_feedback', mainReply(), 'interpreted')],
    judge: [async () => { inspecting.resolve(); await judge.promise; return call('structured_output', { feedback: { flow: 'continue', message: 'Inspection complete.' }, subject: { summary: 'The assigned scope is consistent.', evidence: ['Read the indexed task and retained assignment.'] } }, 'judge'); }],
  } });
  await control(f, 'play', { taskId }); await entered.promise;
  const operation = (await readRun(f)).operation.id;
  await control(f, 'inspect'); await inspecting.promise;
  const first = (await readRun(f)).inspection.id;
  await control(f, 'inspect'); assert.equal((await readRun(f)).inspection.id, first);
  assert.equal((await f.readTask()).verify[0].implementation, undefined);
  judge.resolve(); await waitFor(() => f.ctx.nav27.snapshot(), v => v.inspection === 'complete', 'Judge completion');
  assert.equal((await readRun(f)).operation.id, operation); assert.equal((await f.ctx.nav27.snapshot()).phase, 'running');
  child.resolve(); await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'done', 'real child completion');
  assert.equal(f.provider.requests.filter(r => r.model === 'judge').length, 1);
});

test('H cannot relabel an already running main call and queued steering survives concludeTurn', { timeout: 30000 }, async t => {
  const started = deferred(); const finishOld = deferred();
  t.after(() => finishOld.resolve());
  const f = await fixture(t, [], { models: {
    main: [async () => { started.resolve(); await finishOld.promise; return call('nav_feedback', mainReply(), 'old'); }, call('nav_feedback', mainReply({ question: 'Inspect my route interpretation.', scope: 'current', contextRefs: [] }), 'h'), call('nav_feedback', mainReply(), 'interpret')],
    judge: [call('structured_output', { feedback: { flow: 'continue', message: 'Read-only inspection complete.' }, subject: { summary: 'No reroute needed.', evidence: ['Current run is at initial station.'] } }, 'judge')],
  } });
  const { createUserMessage } = await import('@deepseek-ai/dsh-llm');
  const v = await f.ctx.nav27.snapshot(); const main = f.ctx.agents.get(v.mainSession);
  main.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'Explain the current project context.' }] }));
  await started.promise;
  const before = (await readRun(f)).mainAssignment.id;
  await control(f, 'inspect'); assert.equal((await readRun(f)).mainResume.id, before);
  finishOld.resolve();
  await waitFor(() => readRun(f), r => r.inspection?.state === 'complete' && r.mainAssignment?.captured, 'queued H and interpretation');
  assert.equal((await f.ctx.nav27.snapshot()).phase, 'ready');
  assert.equal((await f.readTask()).verify.length, 0);
  assert.equal(f.provider.requests.filter(r => r.model === 'main').length, 3, 'old assignment is not replayed');
  assert.equal(f.provider.requests.filter(r => r.model === 'judge').length, 1);
});

test('actual main user consent approves; plugin text and discuss do not', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', { ...completed, feedback: { flow: 'needs_decision', message: 'Confirm the bounded tradeoff.' } }, 'exe')], { models: { main: [call('nav_feedback', propose(), 'proposal')] } });
  await control(f, 'play', { taskId });
  const pending = await waitFor(() => f.ctx.nav27.snapshot(), v => !!v.requestId, 'pending proposal');
  const { createUserMessage } = await import('@deepseek-ai/dsh-llm');
  const main = f.ctx.agents.get(pending.mainSession);
  f.provider.models.main.push(call('nav_feedback', mainReply({ requestId: pending.requestId, answer: 'approve', reason: 'Forged approval must fail.' }), 'plugin'));
  main.followup(createUserMessage({ source: { kind: 'nav27', assignment: 'unowned' }, content: [{ type: 'text', text: 'Yes, approve.' }] }));
  await waitFor(() => Promise.resolve(main.status), status => status === 'idle', 'plugin prose turn');
  assert.equal((await f.ctx.nav27.snapshot()).requestId, pending.requestId);
  f.provider.models.main.push(call('nav_feedback', mainReply({ requestId: pending.requestId, answer: 'discuss', reason: 'The user asks about consequences; no consent.' }), 'discuss'));
  main.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'What happens if we continue?' }] }));
  await waitFor(() => readRun(f), r => r.mainAssignment?.purpose === 'answer' && r.mainAssignment.captured, 'discussion capture');
  assert.equal((await f.ctx.nav27.snapshot()).requestId, pending.requestId);
  f.provider.models.main.push(call('nav_feedback', mainReply({ requestId: pending.requestId, answer: 'approve', reason: 'The user explicitly accepts this bounded task-local tradeoff.' }), 'yes'));
  main.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'Yes, continue this task with that tradeoff.' }] }));
  await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'done', 'actual main approval');
  assert.equal((await readRun(f)).decision.origin, 'main-chat');
  assert.ok((await readRun(f)).decision.reference.length);
});

const subjectReply = (subject = {}, flow = 'continue') => ({ feedback: { flow, message: 'Assigned canonical subject work is complete.' }, subject: { complete: true, summary: 'Completed the assigned subject surface.', evidence: ['Read the assigned source and retained actual subject outputs.'], outputs: [], ...subject } });

test('packed command families execute PRD framing decomposition tasking execution and feature boundary', { timeout: 30000 }, async t => {
  const draftReady = deferred();
  const f = await fixture(t, [
    call('write', { file_path: '.memory-bank/prd.md', content: '# Accepted product\nA greeting module exports Hello.\n' }, 'prd-write'),
    call('structured_output', subjectReply({ outputs: ['.memory-bank/prd.md'] }), 'prd'),
    call('structured_output', subjectReply(), 'framing'),
    call('structured_output', subjectReply({ features: ['FT-001'] }), 'features'),
    async () => call('structured_output', subjectReply({ tasks: [await draftReady.promise] }), 'tasking'),
    call('structured_output', completed, 'exe'),
    call('structured_output', subjectReply({ outputs: ['.memory-bank/tasks/index.json'] }), 'sync'),
  ], { selected: { feature_red_verify: true }, models: { main: [call('structured_output', subjectReply({ verdict: 'semantic-pass' }), 'feature-red')] } });
  const draft = await f.readTask(); draft.id = 'TASK-002-T1-FT-001-W1'; draft.status = 'done'; draft.verify = [{ must_not_survive: true }];
  draftReady.resolve(draft);
  await writeFile(join(f.project, '.memory-bank/tasks/index.json'), JSON.stringify({ version: 1, tasks: [] }));
  const initial = await f.ctx.nav27.snapshot(); assert.equal(initial.commands.length, 37);
  await control(f, 'start-command', { command: 'write-prd', inputs: { source: 'Implement an exported Hello greeting, accepted by the user.' } });
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => ['done', 'blocked', 'interrupted'].includes(v.phase), 'full subject chain');
  assert.equal(final.phase, 'done', final.blocker ?? '');
  const index = JSON.parse(await readFile(join(f.project, '.memory-bank/tasks/index.json')));
  assert.equal(index.tasks.length, 1); assert.equal(index.tasks[0].id, draft.id);
  const task = JSON.parse(await readFile(join(f.project, `.memory-bank/tasks/${draft.id}.task.json`)));
  assert.equal(task.status, 'done'); assert.equal(task.verify.length, 2);
  assert.equal(task.verify[0].stage, 'workflow'); assert.equal(task.verify[1].stage, 'feature_red_verify');
  assert.equal(task.verify[1].verdict, 'semantic-pass');
  assert.deepEqual((await readRun(f)).boundaries.map(item => item.command), ['write-prd', 'spec-init', 'prd-to-features', 'feature-to-tasks', 'red-verify', 'mb-sync']);
  assert.equal(f.provider.requests.filter(r => r.model === 'main').length, 1, 'ordinary transitions need no main semantic call');
});

test('native review rejection proposes owning repair, then re-reviews the same subject', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', subjectReply({ features: ['FT-001'] }), 'owner-repair')], { models: { main: [
    call('structured_output', subjectReply({ verdict: 'REJECT' }), 'reject'),
    async () => { const run = await readRun(f); return call('nav_feedback', propose({ action: 'route', scope: `subject:${run.operation.id}`, target: 'prd-to-features', question: 'Repair the feature decomposition at its owner, then re-review?' }), 'proposal'); },
    call('structured_output', subjectReply({ verdict: 'APPROVE' }), 'approve'),
  ] } });
  // A standalone review has a bounded return, not a newly authorized product pipeline.
  await control(f, 'start-command', { command: 'review-feat-plan', inputs: { feature: 'FT-001' } });
  const pending = await waitFor(() => f.ctx.nav27.snapshot(), v => !!v.requestId, 'review repair proposal');
  await control(f, 'green', { requestId: pending.requestId });
  await waitFor(() => readRun(f), run => run.boundaries?.length === 3, 'owner repair and re-review');
  const run = await readRun(f);
  assert.deepEqual(run.boundaries.map(b => b.command), ['review-feat-plan', 'prd-to-features', 'review-feat-plan']);
  assert.equal(run.boundaries[0].verdict, 'REJECT'); assert.equal(run.boundaries[0].disposition.decision, 'repair');
  assert.equal(run.boundaries[2].verdict, 'APPROVE');
});

test('a failed native tools/result never commits staged main feedback', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', { ...completed, feedback: { flow: 'needs_decision', message: 'Need a bounded owner decision.' } }, 'exe')], { models: { main: [call('nav_feedback', propose(), 'proposal')] } });
  const main = f.ctx.agents.get((await f.ctx.nav27.snapshot()).mainSession);
  main.ctx.on('tools/execute', async (exec, next) => {
    const result = await next();
    return exec.name === 'nav_feedback' ? { isError: true, error: { message: 'Fixture native result failure' }, content: [{ type: 'text', text: 'Fixture native result failure' }] } : result;
  });
  await control(f, 'play', { taskId });
  await waitFor(() => readRun(f), r => !!r.mainError, 'missing authoritative capture');
  assert.equal((await f.ctx.nav27.snapshot()).requestId, null);
  assert.equal((await readRun(f)).decision, undefined);
  assert.equal((await readRun(f)).mainAssignment.captured, undefined);
  assert.equal((await f.readTask()).status, 'in_progress');
});

test('new actual user input arriving after execute blocks an older approval at native result', { timeout: 30000 }, async t => {
  const staged = deferred(); const release = deferred(); t.after(() => release.resolve());
  const f = await fixture(t, [call('structured_output', { ...completed, feedback: { flow: 'needs_decision', message: 'Need bounded consent.' } }, 'exe')], { models: { main: [call('nav_feedback', propose(), 'proposal')] } });
  await control(f, 'play', { taskId });
  const pending = await waitFor(() => f.ctx.nav27.snapshot(), v => !!v.requestId, 'pending');
  const main = f.ctx.agents.get(pending.mainSession);
  main.ctx.on('tools/execute', async (exec, next) => {
    const result = await next();
    if (exec.name === 'nav_feedback' && exec.arguments.feedback?.detail?.answer === 'approve') { staged.resolve(); await release.promise; }
    return result;
  });
  const { createUserMessage } = await import('@deepseek-ai/dsh-llm');
  f.provider.models.main.push(call('nav_feedback', mainReply({ requestId: pending.requestId, answer: 'approve', reason: 'The earlier message approves.' }), 'old-yes'));
  f.provider.models.main.push(call('nav_feedback', mainReply({ requestId: pending.requestId, answer: 'reject', reason: 'The newer actual user message cancels permission.' }), 'new-no'));
  main.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'Yes, continue.' }] }));
  await staged.promise;
  main.steer(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'No, do not continue.' }] }));
  release.resolve();
  await waitFor(() => readRun(f), r => !!r.rejected, 'new rejection');
  assert.equal((await readRun(f)).decision, undefined); assert.equal((await f.readTask()).status, 'in_progress');
});

test('autonomous scoped negative disposition preserves Pause and actual FAIL', { timeout: 30000 }, async t => {
  const entered = deferred(); const finish = deferred(); t.after(() => finish.resolve());
  const f = await fixture(t, [call('structured_output', completed, 'exe'), async () => { entered.resolve(); await finish.promise; return call('structured_output', reviewed('FAIL'), 'fail'); }], { selected: { verify: ['main'] }, models: { main: [call('nav_feedback', propose({ scope: 'verify:main' }), 'proposal')] } });
  await control(f, 'autonomous'); await control(f, 'play', { taskId }); await entered.promise;
  await control(f, 'pause'); finish.resolve();
  await waitFor(() => readRun(f), r => r.decision?.source === 'autonomous', 'autonomous disposition');
  assert.match((await f.ctx.nav27.snapshot()).hold, /pause/);
  assert.equal((await f.ctx.nav27.snapshot()).phase, 'stopped');
  assert.equal((await f.readTask()).status, 'in_progress');
  assert.equal((await f.readTask()).verify[0].verification[0].verdict, 'FAIL');
  assert.equal((await f.readTask()).verify[0].verification[0].disposition.source, 'autonomous');
});

test('H Stop retains the owned late result without waking main or admitting work', { timeout: 30000 }, async t => {
  const entered = deferred(); const finish = deferred(); t.after(() => finish.resolve());
  const f = await fixture(t, [], { models: { main: [call('nav_feedback', mainReply({ question: 'Inspect initial route context.', scope: 'current', contextRefs: [] }), 'h')], judge: [async () => { entered.resolve(); await finish.promise; return call('structured_output', { feedback: { flow: 'continue', message: 'Inspection ended.' }, subject: { summary: 'No route change.', evidence: ['Read initial run context.'] } }, 'late'); }] } });
  await control(f, 'inspect'); await entered.promise; await control(f, 'stop'); finish.resolve();
  await waitFor(() => readRun(f), r => !!r.inspection?.result, 'owned result after Stop');
  assert.match((await f.ctx.nav27.snapshot()).hold, /stop/);
  assert.equal(f.provider.requests.filter(r => r.model === 'main').length, 1);
  assert.equal((await f.readTask()).verify.length, 0);
});

test('bundled bootstrap sync restores required resources and start resumes indexed work', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', completed, 'exe')]);
  await rm(join(f.project, '.memory-bank/workflows/autonomy-policy.md'));
  await control(f, 'start-command', { command: 'mb-init', inputs: { sync: true } });
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => ['done', 'blocked', 'interrupted'].includes(v.phase), 'generator and existing task');
  assert.equal(final.phase, 'done', final.blocker ?? '');
  assert.match(await readFile(join(f.project, '.memory-bank/workflows/autonomy-policy.md'), 'utf8'), /DSH/);
  assert.equal((await f.readTask()).status, 'done');
  assert.equal((await readRun(f)).boundaries[0].command, 'mb-init');
});

test('subject Stop/reload/Resume keeps actual outputs and the original operation', { timeout: 30000 }, async t => {
  const entered = deferred(); const finish = deferred(); t.after(() => finish.resolve());
  const f = await fixture(t, [
    call('write', { file_path: '.memory-bank/observed-baseline.md', content: '# Existing baseline\nRetain this partial result.\n' }, 'partial'),
    async () => { entered.resolve(); await finish.promise; return [{ type: 'finish', reason: { kind: 'stop' } }]; },
    call('read', { file_path: '.memory-bank/observed-baseline.md' }, 'inspect'),
    call('structured_output', subjectReply({ outputs: ['.memory-bank/observed-baseline.md'] }), 'resume'),
  ]);
  await control(f, 'start-command', { command: 'map-codebase', inputs: { source: 'Map only the current as-is baseline.' } });
  await entered.promise; const operation = (await readRun(f)).operation.id;
  await control(f, 'stop'); finish.resolve();
  await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'interrupted', 'subject interruption');
  await unload(f); await reload(f);
  await control(f, 'resume');
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'done', 'resumed subject');
  assert.equal((await readRun(f)).boundaries[0].operation, operation);
  assert.match(await readFile(join(f.project, '.memory-bank/observed-baseline.md'), 'utf8'), /Retain this partial result/);
  assert.equal((await f.readTask()).verify.length, 0);
  assert.equal(final.verification, 'map-codebase');
});

test('missing facts block green/autonomous and an actual sufficient main answer resolves them once', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', { ...completed, feedback: { flow: 'needs_decision', message: 'Need the actual accepted greeting language.' } }, 'exe')], { models: { main: [call('nav_feedback', propose({ missingFacts: ['Accepted greeting language'] }), 'proposal')] } });
  await control(f, 'autonomous'); await control(f, 'play', { taskId });
  const pending = await waitFor(() => f.ctx.nav27.snapshot(), v => !!v.requestId, 'missing facts proposal');
  await assert.rejects(control(f, 'green', { requestId: pending.requestId }), /Missing facts/);
  assert.equal((await readRun(f)).decision, undefined);
  const { createUserMessage } = await import('@deepseek-ai/dsh-llm');
  f.provider.models.main.push(call('nav_feedback', mainReply({ requestId: pending.requestId, answer: 'approve', reason: 'The actual user specifies English and explicitly approves the bounded continuation.', resolvedFacts: ['Accepted greeting language'] }), 'facts-and-yes'));
  f.ctx.agents.get(pending.mainSession).followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'English. Yes, continue this task.' }] }));
  await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'done', 'one sufficient actual answer');
  assert.equal((await readRun(f)).decision.origin, 'main-chat');
});

test('no-target current-owner question consumes actual facts and resumes only unfinished task work in the same attempt', { timeout: 30000 }, async t => {
  let resumedInput;
  const f = await fixture(t, [
    call('structured_output', { feedback: { flow: 'needs_decision', message: 'Which accepted greeting language should this task use?' }, subject: { implementation: 'partial', evidence: ['Inspected the task; the accepted language is not specified.'] } }, 'question'),
    async options => { resumedInput = JSON.stringify(options.messages); return call('structured_output', completed, 'resumed'); },
  ], { models: { main: [call('nav_feedback', propose({ action: 'consult', question: 'Which greeting language is accepted?', missingFacts: ['Accepted greeting language'] }), 'owner-question')] } });
  await control(f, 'play', { taskId });
  const pending = await waitFor(() => f.ctx.nav27.snapshot(), v => !!v.requestId, 'current-owner question');
  const attempt = (await f.readTask()).verify[0].attempt;
  await assert.rejects(control(f, 'green', { requestId: pending.requestId }), /Missing facts/);
  f.provider.models.main.push(call('nav_feedback', mainReply({ requestId: pending.requestId, answer: 'discuss', reason: 'The actual user specifies English; this resolves the current owner question without requesting a new route.', resolvedFacts: ['Accepted greeting language'] }), 'actual-facts'));
  f.provider.models.main.push(call('nav_feedback', { feedback: { flow: 'continue', message: 'The actual English answer resolves the unfinished task question.' }, subject: { summary: 'Resume the same task using the user-specified English greeting.' } }, 'interpret'));
  const { createUserMessage } = await import('@deepseek-ai/dsh-llm');
  f.ctx.agents.get(pending.mainSession).followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'English.' }] }));
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'done', 'same-owner resume');
  const task = await f.readTask(); assert.equal(task.verify.length, 1); assert.equal(task.verify[0].attempt, attempt);
  assert.equal(task.verify[0].implementation, 'complete');
  assert.equal((await readRun(f)).decision.action, 'consult');
  assert.match(resumedInput, /English/);
  assert.equal(final.taskId, taskId);
});

test('combined manual holds release independently without admitting work early', { timeout: 30000 }, async t => {
  const f = await fixture(t, [call('structured_output', completed, 'exe')]);
  for (const action of ['red', 'stop', 'pause']) await control(f, action);
  assert.equal((await control(f, 'green')).hold, 'stop');
  assert.equal((await f.ctx.nav27.snapshot()).hold, 'stop');
  assert.deepEqual(JSON.parse(await readFile(join(f.project, '.memory-bank/nav27/run.json'))).holds, ['stop']);
  assert.equal(f.provider.requests.length, 0, 'partial release cannot launch a leg');
  await control(f, 'play', { taskId });
  const final = await waitFor(() => f.ctx.nav27.snapshot(), v => v.phase === 'done', 'departure after independent releases');
  assert.equal(final.hold, null);
  assert.equal((await f.readTask()).verify.length, 1);
});
