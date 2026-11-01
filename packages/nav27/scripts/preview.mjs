#!/usr/bin/env node
// Isolated real native host/controller with a deterministic provider. No user profile.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fixture, call, taskId } from '../tests/fixture.mjs';
const cleanups = [];
let f;
const stopped = [{ type: 'finish', reason: { kind: 'stop' } }];
const text = value => [
  { type: 'block-start', index: 0, blockType: 'text' },
  { type: 'text-delta', index: 0, text: value },
  { type: 'block-end', index: 0, block: { type: 'text', text: value } },
  ...stopped,
];
async function delay(options, milliseconds) {
  if (options.signal?.aborted) return;
  await new Promise(resolve => {
    const finish = () => { clearTimeout(timer); options.signal?.removeEventListener('abort', finish); resolve(); };
    const timer = setTimeout(finish, milliseconds); options.signal?.addEventListener('abort', finish, { once: true });
  });
}
const reply = subject => ({ feedback: { flow: 'continue', message: 'Deterministic preview fixture returned the actual bounded result.' }, subject });
const nativeCall = (name, value) => call(name, value, randomUUID());
async function executor(options) {
  await delay(options, 7000); if (options.signal?.aborted) return stopped;
  const schema = options.tools.find(tool => tool.name === 'structured_output')?.parameters?.properties?.subject;
  if (!schema?.properties?.implementation) throw new Error('Preview provider supports the prepared task scenario; subject planning needs a real provider.');
  if (!options.messages.some(message => message.role === 'tool')) return nativeCall('write', { file_path: 'src/greeting.js', content: 'export const greeting = "Hello";\n' });
  if (schema.properties.local_checks && !options.messages.some(message => message.role === 'assistant' && message.content?.some(block => block.type === 'tool-call' && block.name === 'read'))) return nativeCall('read', { file_path: 'src/greeting.js' });
  return nativeCall('structured_output', reply({ implementation: 'complete', evidence: ['Native write created src/greeting.js exporting greeting = Hello.'], ...(schema.properties.local_checks ? { local_checks: { result: 'passed', evidence: ['Native read inspected the generated greeting export; no test runner is configured.'] } } : {}) }));
}
async function reviewer(options) {
  await delay(options, 4500); if (options.signal?.aborted) return stopped;
  if (!options.messages.some(message => message.role === 'tool')) return nativeCall('read', { file_path: 'src/greeting.js' });
  const evidence = ['Native read inspected src/greeting.js exporting greeting = Hello in the isolated preview.'];
  const subject = options.model === 'review-code' ? { candidate_findings: 'none', evidence } : { verdict: options.model === 'red' ? 'semantic-pass' : 'PASS', evidence };
  return nativeCall('structured_output', reply(subject));
}
async function main(options) {
  await delay(options, 800); if (options.signal?.aborted) return stopped;
  const run = JSON.parse(await readFile(join(f.project, '.memory-bank/nav27/run.json'), 'utf8'));
  const assignment = run.mainAssignment;
  if (options.tools.some(tool => tool.name === 'structured_output')) throw new Error('Preview command families are not simulated. Use the prepared task or a real provider.');
  const result = { feedback: { flow: 'continue', message: 'Preview main interpreted its current bounded assignment.' }, subject: { summary: 'This is deterministic provider output. Nav controller and native session execution are real.' } };
  if (assignment?.purpose === 'inspection') result.feedback.detail = { question: 'Inspect the current task scope and host control state.', scope: taskId, contextRefs: ['.memory-bank/nav27/run.json', '.memory-bank/tasks/index.json'] };
  else if (assignment?.purpose === 'proposal') result.feedback = { flow: 'needs_decision', message: 'Preview owner decision.', detail: { question: 'Continue with the retained preview result?', action: 'continue', scope: 'current', target: '', missingFacts: [] } };
  else if (assignment?.purpose === 'answer') result.feedback.detail = { requestId: run.pending.id, answer: 'discuss', reason: 'The deterministic provider does not infer consent from arbitrary chat text; use Green for this preview.' };
  return nativeCall('nav_feedback', result);
}
f = await fixture({ after: cleanup => cleanups.push(cleanup) }, [], { selected: { verify: ['main', 'secondary'] }, models: {
  main, executor, 'review-main': reviewer, 'review-secondary': reviewer, 'review-code': reviewer, red: reviewer,
  judge: async options => { await delay(options, 4500); return options.signal?.aborted ? stopped : nativeCall('structured_output', reply({ summary: 'The native Judge fixture observed the scoped inspection request; main retains route authority.', evidence: ['Inspection context names the prepared task and current Nav run.'] })); },
  side: async options => { await delay(options, 1200); if (options.signal?.aborted) return stopped; const summary = options.messages.filter(message => message.source?.kind === 'nav27' && message.source.assignment === 'side-summary').at(-1); return text(`Read-only Side preview. ${summary?.content?.[0]?.text ?? 'Current Nav context is supplied in the native request.'}\n\nThis response comes from a deterministic fixture, not an external model. I cannot grant main consent or change the project.`); },
} });
const origin = f.ctx.webServer.getOrigin();
const login = f.ctx.connection.authenticatedUrl(origin + '/');
console.log(`DevRails isolated native preview\nProject: ${f.project}\nLogin: ${login}\nMap: ${origin}/nav27/\nPrepared task: ${taskId}\nProvider: deterministic fixture (no API key). Play starts the prepared task; work pauses long enough to create Side / request H.\nNative full-chat root is not bundled in this fixture; that link is for a full DSH installation.\nCtrl+C disposes this host and removes its temporary project/profile.`);
let closing = false;
async function close() { if (closing) return; closing = true; for (const cleanup of cleanups) await cleanup(); process.exit(0); }
process.on('SIGINT', close); process.on('SIGTERM', close);
