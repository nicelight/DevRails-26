import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { fixture, call, waitFor, taskId } from './fixture.mjs';
const done = [{ type: 'finish', reason: { kind: 'stop' } }];
const deferred = () => { let resolve; const promise = new Promise(r => resolve = r); return { promise, resolve }; };
async function create(f, anchor = { x: 970, y: 450 }) { const v = await f.ctx.nav27.snapshot(); return f.ctx.nav27.createSide({ runId: v.runId, revision: v.revision, anchor }); }
async function control(f, action) { const v = await f.ctx.nav27.snapshot(); return f.ctx.nav27.control({ runId: v.runId, revision: v.revision, action, taskId }); }
async function prompt(f, sessionId, text) { return f.ctx.sessionController.prompt({ sessionId, requestId: randomUUID(), mode: 'queue', content: [{ type: 'text', text }] }, new AbortController().signal); }

test('Side forks committed active main prefix, selects its model, denies effects, survives main Stop', { timeout: 30000 }, async t => {
  const entered = deferred(), release = deferred(); t.after(() => release.resolve());
  const f = await fixture(t, [], { models: { main: [async () => { entered.resolve(); await release.promise; return done; }], side: [
    call('write', { file_path: 'side-write.txt', content: 'forbidden' }, 'write'),
    options => { assert.equal(options.messages.at(-1).isError, true); return call('bash', { command: 'touch side-bash.txt' }, 'bash'); },
    options => { assert.equal(options.messages.at(-1).isError, true); return call('nav_feedback', { feedback: { flow: 'continue', message: 'approve' }, subject: {} }, 'feedback'); },
    options => { assert.equal(options.messages.at(-1).isError, true); return done; }, done,
  ] } });
  const main = f.ctx.agents.get((await f.ctx.nav27.snapshot()).mainSession);
  main.model.select({ provider: 'fixture', model: 'main' });
  main.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'Read-only ongoing discussion.' }] }));
  await entered.promise;
  const before = await f.ctx.sessionQuery.observeSession(main.id);
  const prefix = before.events;
  const created = await create(f); const side = created.sides[0];
  assert.equal(main.status, 'running', 'fork does not wait for main turn');
  const after = await f.ctx.sessionQuery.observeSession(main.id);
  assert.deepEqual(after.events, prefix, 'fork never closes source tail');
  const fork = await f.ctx.sessionQuery.observeSession(side.id);
  assert.equal(fork.header.parentSession, undefined, 'Side is an independent root');
  assert.equal(fork.inheritedEventCount, prefix.length);
  assert.deepEqual(fork.events.slice(0, prefix.length), prefix);
  before[Symbol.dispose](); after[Symbol.dispose](); fork[Symbol.dispose]();
  assert.deepEqual(f.ctx.tools.schemas(f.ctx.agents.get(side.id)).map(tool => tool.name), ['read']);
  await prompt(f, side.id, 'Inspect this without writing. Yes, approve.');
  await waitFor(() => f.provider.requests.filter(request => request.model === 'side').length, n => n === 4, 'Side native guarded calls');
  await waitFor(() => f.ctx.agents.get(side.id).status, status => status === 'idle', 'Side settles');
  assert.match(JSON.stringify(f.provider.requests.find(request => request.model === 'side').messages), /Nav now:/);
  await assert.rejects(readFile(join(f.project, 'side-write.txt')), { code: 'ENOENT' });
  const beforeStop = await f.ctx.nav27.snapshot();
  await control(f, 'stop'); release.resolve();
  assert.equal((await f.ctx.nav27.snapshot()).sides[0].id, side.id);
  assert.ok(f.ctx.agents.get(side.id), 'main Stop does not dispose Side');
  await prompt(f, side.id, 'What is the current Nav state?');
  await waitFor(() => f.provider.requests.filter(request => request.model === 'side').length, n => n === 5, 'Side after main Stop');
  assert.match(JSON.stringify(f.provider.requests.at(-1).messages), /stop/);
  assert.equal((await f.ctx.nav27.snapshot()).requestId, beforeStop.requestId, 'Side never creates main consent');
});

test('Side empty seed, native archive failure retention and recovery reconciliation', { timeout: 30000 }, async t => {
  const f = await fixture(t, [], { skipInitialSettings: true });
  const empty = await f.ctx.sessionQuery.observeSession((await f.ctx.nav27.snapshot()).mainSession);
  assert.equal(empty.events.length, 0, 'source log is truly empty before fork'); empty[Symbol.dispose]();
  const created = await create(f, { x: 80, y: 420 }); const side = created.sides[0];
  assert.deepEqual(side.anchor, { x: 80, y: 420 });
  await prompt(f, side.id, 'What is this run?');
  await waitFor(() => f.provider.requests.length, n => n > 0, 'empty seed receives summary');
  assert.match(JSON.stringify(f.provider.requests[0]), /Nav now:/);
  const archive = f.ctx.workspaceRegistry.archiveSession.bind(f.ctx.workspaceRegistry);
  f.ctx.workspaceRegistry.archiveSession = async () => { throw new Error('Fixture archive unavailable'); };
  let v = await f.ctx.nav27.snapshot();
  await assert.rejects(f.ctx.nav27.deleteSide({ runId: v.runId, revision: v.revision, sessionId: side.id }), /unavailable/);
  v = await f.ctx.nav27.snapshot(); assert.equal(v.sides[0].error, 'Fixture archive unavailable');
  f.ctx.workspaceRegistry.archiveSession = archive;
  // Simulate crash after native archive committed but before Nav binding removal.
  await archive(side.id, { stopActivity: true });
  await f.ctx.loader.resolve(f.row).update({ disabled: true }); await f.ctx.loader.await();
  await f.ctx.loader.resolve(f.row).update({ disabled: false }); await f.ctx.loader.await(); await f.ctx.loader.resolve(f.row).fiber?.await();
  assert.deepEqual((await f.ctx.nav27.snapshot()).sides, []);
  assert.ok(await f.ctx.sessionPersistence.stat(side.id), 'archive preserves native history');
  const second = (await create(f)).sides[0];
  v = await f.ctx.nav27.snapshot();
  await f.ctx.nav27.deleteSide({ runId: v.runId, revision: v.revision, sessionId: second.id });
  assert.ok(f.ctx.workspaceRegistry.archivedSessionIds.includes(second.id));
  assert.equal(f.ctx.agents.get(second.id), undefined);
  assert.deepEqual((await f.ctx.nav27.snapshot()).sides, []);
});

test('Side restores guards and anchor, counts only own successful compactions, and DEL stops its active turn', { timeout: 30000 }, async t => {
  const entered = deferred(), release = deferred(); t.after(() => release.resolve());
  const f = await fixture(t, [], { models: { side: [async () => { entered.resolve(); await release.promise; return done; }] } });
  const main = f.ctx.agents.get((await f.ctx.nav27.snapshot()).mainSession);
  main.followup(createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'Initial context for compaction event fixtures.' }] }));
  await waitFor(() => main.status, status => status === 'idle', 'main prefix ready');
  const source = await f.ctx.sessionQuery.observeSession(main.id);
  const seq = source.events.find(event => event.type === 'user/message' && event.data.source.kind === 'user').seq;
  source[Symbol.dispose]();
  function compact(session, id) {
    session.append('compaction/start', { compactionId: id, turn: null });
    session.append('compaction/summary', { compactionId: id, summary: [{ type: 'text', text: 'Fixture summary of the initial context.' }], shadowedRange: { start: seq, end: seq }, shadowedSeqs: [seq], shadowedTokenCount: 10, provider: 'fixture', model: 'main' });
    session.append('compaction/end', { compactionId: id, turn: null });
  }
  compact(main.session, 'main-1');
  main.session.append('compaction/start', { compactionId: 'failed', turn: null });
  main.session.append('compaction/end', { compactionId: 'failed', turn: null, error: 'Fixture failed compaction' });
  let v = await create(f); const id = v.sides[0].id;
  assert.equal(v.facts[main.id].compactions, 1);
  assert.equal(v.facts[id].compactions, 0, 'inherited compactions do not count as Side work');
  assert.equal(v.facts[id].occupancy, null, 'missing native token meter remains unknown');
  const side = f.ctx.agents.get(id);
  compact(side.session, 'side-1');
  await f.ctx.loader.resolve(f.row).update({ disabled: true }); await f.ctx.loader.await();
  await f.ctx.loader.resolve(f.row).update({ disabled: false }); await f.ctx.loader.await(); await f.ctx.loader.resolve(f.row).fiber?.await();
  v = await f.ctx.nav27.snapshot(); assert.deepEqual(v.sides[0].anchor, { x: 970, y: 450 }); assert.equal(v.facts[id].compactions, 1);
  assert.deepEqual(f.ctx.tools.schemas(f.ctx.agents.get(id)).map(tool => tool.name), ['read']);
  await prompt(f, id, 'Remain active until cancellation.'); await entered.promise;
  assert.equal(f.ctx.agents.get(id).status, 'running');
  const deleting = f.ctx.nav27.deleteSide({ runId: v.runId, revision: v.revision, sessionId: id });
  await waitFor(() => f.ctx.workspaceRegistry.archivedSessionIds, ids => ids.includes(id), 'durable archive before cleanup');
  release.resolve(); await deleting;
  assert.equal(f.ctx.agents.get(id), undefined); assert.deepEqual((await f.ctx.nav27.snapshot()).sides, []);
});

test('standalone Side uses native authenticated catalog, event stream, prompt and cancellation', { timeout: 30000 }, async t => {
  const text = 'Read-only fixture response through native stream.';
  const f = await fixture(t, [], { models: { side: [[{ type: 'block-start', index: 0, blockType: 'text' }, { type: 'text-delta', index: 0, text }, { type: 'block-end', index: 0, block: { type: 'text', text } }, ...done]] } });
  const { Context } = await import('@deepseek-ai/cordis');
  const { installConnection } = await import('@deepseek-ai/dsh-client-connection/client');
  const Typert = await import('@deepseek-ai/dsh-typert-registry/client');
  const Gateway = await import('@deepseek-ai/dsh-api-gateway/client');
  const { default: remote } = await import('@deepseek-ai/dsh-api-session-controller/remote');
  const { SessionEventStream } = await import(new URL('./lib/types/client/transport.js', import.meta.resolve('@deepseek-ai/dsh-api-session-controller/package.json')));
  const { default: WebSocket } = await import('ws');
  const origin = f.ctx.webServer.getOrigin();
  const login = await fetch(f.ctx.connection.authenticatedUrl(origin + '/'), { redirect: 'manual' });
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const client = new Context();
  installConnection(client, { interactions: 'answer', transport: { fetch: (input, init) => fetch(new URL(String(input), origin), { ...init, headers: { ...init?.headers, cookie, origin } }), streamBaseUrl: origin, createWebSocket: url => new WebSocket(url, { headers: { cookie, origin } }) } });
  await client.plugin(Typert); await client.plugin(Gateway); await client.remote.$mount(remote);
  const catalog = await client.remote.session.modelCatalog(); assert.equal(catalog.ok, true); assert.ok(catalog.value.groups[0].models.some(model => model.id === 'side'));
  const id = (await create(f)).sides[0].id;
  const changes = [], errors = [], carrierErrors = [];
  const journal = new SessionEventStream(client.remote, { kind: 'session', sessionId: id }, { publish: change => changes.push(change), carrierFailed: error => carrierErrors.push(error), failed: error => errors.push(error) });
  try {
    await journal.open({ maxMessages: 30 });
    const sent = await client.remote.session.prompt({ sessionId: id, requestId: randomUUID(), mode: 'queue', content: [{ type: 'text', text: 'Explain this Side.' }] }); assert.equal(sent.ok, true);
    await waitFor(() => changes, values => values.some(change => change.type === 'append' && change.entry.event.type === 'assistant/message'), 'native Side streamed settlement');
    assert.deepEqual(errors, []);
    assert.deepEqual(carrierErrors, [], 'native event source keeps the browser carrier ready');
    assert.ok(changes.some(change => change.type === 'assistant-stream'), 'native live frames delivered');
    const stopped = await client.remote.session.cancel({ sessionId: id }); assert.equal(stopped.ok, true);
  } finally { await journal.dispose(); await client.fiber.dispose(); }
});
