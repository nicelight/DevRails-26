#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const installer = join(repoRoot, 'scripts', 'install-framework.mjs');
const tempRoot = mkdtempSync(join(tmpdir(), 'devrails26-agent-runtime-'));
const target = join(tempRoot, 'target');

const runtimeTemplateRel = 'skills/_shared/references/protocols/runtime-template.md';
const reviewerRoleRel = 'skills/_shared/references/roles/reviewer.md';
const executeLoopRel = 'skills/_shared/references/workflows/execute-loop.md';
const tierPolicyRel = 'skills/_shared/references/workflows/tier-policy.md';

function fail(message, output = '') {
  throw new Error(output ? `${message}\n\n${output}` : message);
}

function assert(condition, message, output = '') {
  if (!condition) fail(message, output);
}

function readRepo(rel) {
  return readFileSync(join(repoRoot, rel), 'utf8');
}

function readTarget(rel) {
  return readFileSync(join(target, rel), 'utf8');
}

function runInstaller(args) {
  const result = spawnSync(process.execPath, [installer, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.error) fail(result.error.message, output);
  assert(result.status === 0, `Installer exited with ${result.status}`, output);
  return output;
}

function extractRuntimeSeed(markdown) {
  const match = markdown.match(/Initialize the file from this object:\s*```json\s*([\s\S]*?)\s*```/);
  assert(match, 'runtime-template.md has no parseable seed JSON block.');
  return JSON.parse(match[1]);
}

function runtimeSkill(relRoot, name) {
  return readTarget(`${relRoot}/skills/${name}/SKILL.md`);
}

try {
  const runtimeTemplate = readRepo(runtimeTemplateRel);
  const seed = extractRuntimeSeed(runtimeTemplate);
  assert(seed.task_id === 'TASK-NNN-TN-FT-NNN-WN', 'Runtime seed task_id changed.');
  assert(seed.waiting_for === '', 'Runtime seed waiting_for must start empty.');
  assert(
    JSON.stringify(Object.keys(seed.agents))
      === JSON.stringify([
        'implementer',
        'bug_reviewer',
        'security_reviewer',
        'compliance_reviewer',
        'qa',
      ]),
    'Runtime seed agent slots changed.',
  );
  assert(
    Object.values(seed.agents).every((value) => value === null),
    'Runtime seed slots must initialize to null.',
  );
  [
    'running|waiting|completed|closed|failed',
    'persist `agent_id`',
    'late final notification',
    'never respawn',
    'At most one slot',
  ].forEach((marker) => {
    assert(runtimeTemplate.includes(marker), `Runtime template lost marker: ${marker}`);
  });

  const reviewerRole = readRepo(reviewerRoleRel);
  [
    '### Bug Reviewer',
    '### Security Reviewer',
    '### Compliance Reviewer',
    '### QA Reviewer',
    'REVIEW_FINDINGS',
    'result: NO_FINDINGS|FINDINGS|BLOCKED',
    'Do not change task status',
  ].forEach((marker) => {
    assert(reviewerRole.includes(marker), `Reviewer role lost marker: ${marker}`);
  });

  const executeLoop = readRepo(executeLoopRel);
  const tierPolicy = readRepo(tierPolicyRel);
  const autonomous = readRepo('skills/_shared/references/commands/autonomous.md');
  const redVerify = readRepo('skills/_shared/references/commands/red-verify.md');
  assert(
    executeLoop.includes('## Task-scoped delegated-agent runtime')
      && executeLoop.includes('consume late final notification before respawn'),
    'Execute loop does not expose task-scoped runtime recovery.',
  );
  assert(
    tierPolicy.includes('## Specialized Reviewer Routing')
      && tierPolicy.includes('Safe T0 work has no mandatory specialized reviewer procedure.'),
    'Tier policy does not keep specialized reviewers risk-selected.',
  );
  assert(
    autonomous.includes('optional task')
      && autonomous.includes('same opaque `agent_id`')
      && autonomous.includes('late final'),
    '/autonomous does not recover delegated Foundation agents.',
  );
  assert(
    redVerify.includes('Feature mode does not create `runtime.json`')
      && redVerify.includes('FT-<ID>-S-SECURITY-REVIEW-final-report-docs-01.md'),
    '/red-verify conflates feature review with task-scoped runtime state.',
  );

  runInstaller(['--bootstrap', '--target', target, '--yes']);

  const deployedRuntimeTemplateRel = '.memory-bank/templates/protocols/runtime-template.md';
  const deployedReviewerRoleRel = '.memory-bank/roles/reviewer.md';
  assert(existsSync(join(target, deployedRuntimeTemplateRel)), 'Runtime template was not deployed.');
  assert(
    readTarget(deployedRuntimeTemplateRel) === runtimeTemplate,
    'Deployed runtime template differs from canonical source.',
  );
  assert(
    readTarget(deployedReviewerRoleRel).replace('<!-- Generated by DevRails 26 init-mb.js. Safe to overwrite with init-mb.js --sync. -->\n', '') === reviewerRole,
    'Deployed Reviewer role differs from canonical source.',
  );

  for (const root of ['.agents', '.claude']) {
    const exe = runtimeSkill(root, 'exe');
    const verify = runtimeSkill(root, 'verify');
    const redVerify = runtimeSkill(root, 'red-verify');
    const autopilot = runtimeSkill(root, 'autopilot');

    assert(
      exe.includes('runtime-template.md') && exe.includes('implementer` slot'),
      `${root} /exe lost delegated Implementer runtime contract.`,
    );
    assert(
      verify.includes('<specialized_reviewers>')
        && verify.includes('Bug Reviewer then QA Reviewer sequentially'),
      `${root} /verify lost Bug/QA reviewer routing.`,
    );
    assert(
      redVerify.includes('<specialized_reviewers>')
        && redVerify.includes('Security Reviewer then Compliance Reviewer'),
      `${root} /red-verify lost Security/Compliance reviewer routing.`,
    );
    assert(
      autopilot.includes('delegated-agent runtime')
        && autopilot.includes('late final notification'),
      `${root} /autopilot lost interruption recovery contract.`,
    );
  }

  const taskId = 'TASK-901-T2-FT-901-W1';
  const protocolDir = join(target, '.protocols', taskId);
  mkdirSync(protocolDir, { recursive: true });
  const reportRel = `.tasks/${taskId}/${taskId}-S-BUG-REVIEW-final-report-docs-01.md`;
  const reportPath = join(target, reportRel);
  mkdirSync(dirname(reportPath), { recursive: true });
  const reportState = 'REVIEW_FINDINGS\nreviewer: bug\nresult: NO_FINDINGS\n';
  writeFileSync(reportPath, reportState, 'utf8');

  const runtimeState = {
    task_id: taskId,
    waiting_for: '',
    agents: {
      implementer: {
        agent_id: 'agent-impl-1',
        role: 'implementer',
        status: 'closed',
        waiting_for: '',
      },
      bug_reviewer: {
        agent_id: 'agent-bug-1',
        role: 'bug_reviewer',
        status: 'closed',
        waiting_for: '',
      },
      security_reviewer: null,
      compliance_reviewer: null,
      qa: null,
    },
  };
  const runtimePath = join(protocolDir, 'runtime.json');
  const runtimeStateText = `${JSON.stringify(runtimeState, null, 2)}\n`;
  writeFileSync(runtimePath, runtimeStateText, 'utf8');

  runInstaller(['--bootstrap', '--sync', '--target', target, '--yes']);
  assert(
    readFileSync(runtimePath, 'utf8') === runtimeStateText,
    'Framework sync overwrote task-owned runtime.json.',
  );
  assert(
    readFileSync(reportPath, 'utf8') === reportState,
    'Framework sync overwrote durable reviewer findings.',
  );

  console.log('agent runtime isolated install smoke passed');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
