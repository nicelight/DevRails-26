#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const installer = join(repoRoot, 'scripts', 'install-framework.mjs');
const commandDir = join(repoRoot, 'skills', '_shared', 'references', 'commands');
const referenceRoot = join(repoRoot, 'skills', '_shared', 'references');
const runtimeRoots = ['.agents', '.claude'];
const expectedSkillNames = listFiles(commandDir)
  .filter((name) => name !== 'find-skill.md')
  .map((name) => name.replace(/\.md$/, ''));
const forbiddenMultiFeatureInvocations = [
  '/feature-to-tasks --all',
  '/review-tasks-plan --all',
  '/spec-auto --all',
  '/spec-design --all',
];
const singleFeatureSkills = [
  'feature-to-tasks',
  'review-tasks-plan',
  'spec-auto',
  'spec-design',
];
const resourceOwners = new Map([
  ['finding-adjudication.md', ['review-feat-plan', 'review-tasks-plan', 'verify', 'red-verify']],
  ['web-design-reviewer.md', ['verify', 'red-verify']],
]);
const tempRoot = mkdtempSync(join(tmpdir(), 'devrails26-install-sync-'));

function fail(message, output = '') {
  throw new Error(`${message}${output ? `\n\n${output}` : ''}`);
}

function assert(condition, message, output = '') {
  if (!condition) fail(message, output);
}

function listFiles(dir, extension = '.md') {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => entry.name)
    .sort();
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function targetPath(target, rel) {
  return join(target, rel);
}

function readTarget(target, rel) {
  return read(targetPath(target, rel));
}

function writeTarget(target, rel, content) {
  const path = targetPath(target, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

function runInstaller(args, { shouldFail = false } = {}) {
  const result = spawnSync(process.execPath, [installer, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.error) fail(result.error.message, output);
  if (shouldFail ? result.status === 0 : result.status !== 0) {
    fail(`Installer exited with unexpected status ${result.status}`, output);
  }
  return output;
}

function runTargetScript(target, rel, args = []) {
  const result = spawnSync(process.execPath, [targetPath(target, rel), ...args], {
    cwd: target,
    encoding: 'utf8',
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    output: `${result.stdout || ''}${result.stderr || ''}`,
  };
}

function runtimeSkillNames(target, runtimeRoot) {
  const skillsDir = targetPath(target, `${runtimeRoot}/skills`);
  if (!existsSync(skillsDir)) return [];
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => existsSync(join(skillsDir, entry.name, 'SKILL.md')))
    .map((entry) => entry.name)
    .sort();
}

function assertRuntimeInventory(target) {
  runtimeRoots.forEach((runtimeRoot) => {
    assert(
      JSON.stringify(runtimeSkillNames(target, runtimeRoot))
        === JSON.stringify(expectedSkillNames),
      `${runtimeRoot} runtime inventory differs from canonical commands.`,
    );
  });
}

function assertRuntimeParity(target) {
  expectedSkillNames.forEach((name) => {
    const source = read(join(commandDir, `${name}.md`)).trimEnd();
    const agents = readTarget(target, `.agents/skills/${name}/SKILL.md`);
    const claude = readTarget(target, `.claude/skills/${name}/SKILL.md`);
    assert(agents === claude, `Runtime surfaces differ for /${name}.`);
    assert(agents.endsWith(`${source}\n`), `Deployed /${name} differs from canonical source.`);
    forbiddenMultiFeatureInvocations.forEach((invocation) => {
      assert(!agents.includes(invocation), `Deployed /${name} contains retired ${invocation}.`);
    });
  });

  singleFeatureSkills.forEach((name) => {
    assert(
      !readTarget(target, `.agents/skills/${name}/SKILL.md`).includes('--all'),
      `Deployed /${name} still accepts --all.`,
    );
  });

  resourceOwners.forEach((owners, filename) => {
    const expected = read(join(referenceRoot, 'semantic-packs', filename));
    runtimeRoots.forEach((runtimeRoot) => {
      owners.forEach((owner) => {
        assert(
          readTarget(target, `${runtimeRoot}/skills/${owner}/references/${filename}`)
            === expected,
          `${runtimeRoot}/${owner} has stale ${filename}.`,
        );
      });
    });
  });
}

function installedSkillRows(content) {
  return [...content.matchAll(/^\| <code>([^<]+)<\/code> \| (yes|no) \| (yes|no) \|$/gm)]
    .map((match) => ({ name: match[1], agents: match[2], claude: match[3] }));
}

function canonicalCopies() {
  const copies = [
    [join(referenceRoot, 'deployable', 'AGENTS.md'), 'AGENTS.md'],
    [join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-lint.mjs'), 'scripts/mb-lint.mjs'],
    [join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-doctor.mjs'), 'scripts/mb-doctor.mjs'],
  ];
  [
    ['protocols', '.memory-bank/templates/protocols', listFiles(join(referenceRoot, 'protocols'))],
    [
      'workflows',
      '.memory-bank/workflows',
      [
        'autonomy-policy.md',
        'execute-loop.md',
        'mb-sync.md',
        'multiagents_with_judge.md',
        'sdd-design-contract.md',
        'tier-policy.md',
      ],
    ],
  ].forEach(([sourceDir, targetDir, filenames]) => {
    filenames.forEach((filename) => {
      copies.push([join(referenceRoot, sourceDir, filename), `${targetDir}/${filename}`]);
    });
  });
  listFiles(join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-doctor'), '.mjs')
    .forEach((filename) => {
      copies.push([
        join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-doctor', filename),
        `scripts/mb-doctor/${filename}`,
      ]);
    });
  return copies;
}

function assertCanonicalCopies(target) {
  canonicalCopies().forEach(([source, rel]) => {
    assert(readTarget(target, rel) === read(source), `Deployed canonical copy is stale: ${rel}`);
  });
}

function assertCollisionSafety() {
  const target = join(tempRoot, 'collision');
  const customSkill = '---\nname: verify\ndescription: User owned.\n---\n# Verify\n';
  runtimeRoots.forEach((runtimeRoot) => {
    writeTarget(target, `${runtimeRoot}/skills/verify/SKILL.md`, customSkill);
  });
  const output = runInstaller(
    ['--install-only', '--target', target, '--yes'],
    { shouldFail: true },
  );
  runtimeRoots.forEach((runtimeRoot) => {
    assert(
      readTarget(target, `${runtimeRoot}/skills/verify/SKILL.md`) === customSkill
        && !existsSync(targetPath(target, `${runtimeRoot}/skills/start`)),
      `Collision preflight partially changed ${runtimeRoot}.`,
      output,
    );
  });
  assert(output.includes('will not be overwritten'), 'Collision error is not actionable.', output);
}

function assertFreshBootstrap(target) {
  assertRuntimeInventory(target);
  assertRuntimeParity(target);
  assertCanonicalCopies(target);
  const sddContract = readTarget(target, '.memory-bank/workflows/sdd-design-contract.md');
  const specDesign = readTarget(target, '.agents/skills/spec-design/SKILL.md');
  const specRedesign = readTarget(target, '.agents/skills/spec-redesign/SKILL.md');
  const specAuto = readTarget(target, '.agents/skills/spec-auto/SKILL.md');
  const autonomous = readTarget(target, '.agents/skills/autonomous/SKILL.md');
  const autopilot = readTarget(target, '.agents/skills/autopilot/SKILL.md');
  const multiagentic = readTarget(target, '.agents/skills/multiagentic/SKILL.md');
  const exe = readTarget(target, '.agents/skills/exe/SKILL.md');
  const featureToTasks = readTarget(target, '.agents/skills/feature-to-tasks/SKILL.md');
  const reviewTasksPlan = readTarget(target, '.agents/skills/review-tasks-plan/SKILL.md');
  const autonomyPolicy = readTarget(target, '.memory-bank/workflows/autonomy-policy.md');
  const executeLoop = readTarget(target, '.memory-bank/workflows/execute-loop.md');
  const judgeOverlay = readTarget(target, '.memory-bank/workflows/multiagents_with_judge.md');
  assert(
    sddContract.includes('## Evidence and authority')
      && sddContract.includes('## Canonical ownership and coverage')
      && sddContract.includes('## Authoring and architecture integrity')
      && sddContract.includes('## Shared validation')
      && !sddContract.includes('Planning Revision increments')
      && [specDesign, specRedesign, specAuto]
        .every((skill) => skill.includes('.memory-bank/workflows/sdd-design-contract.md')),
    'Runtime SDD workflows lost their deployed shared authoring contract.',
  );
  assert(
    executeLoop.includes('only when both are proved')
      && executeLoop.includes('affects product-wide planning')
      && executeLoop.includes('`none` preserves revision and reviews')
      && executeLoop.includes('`bounded` preserves revision')
      && specRedesign.includes('Do not use revision mismatch as impact proof')
      && specRedesign.includes('Preserve task lifecycle, completed evidence')
      && specAuto.includes('feature design never owns revision'),
    'Runtime SDD workflows lost bounded redesign or Planning Revision ownership.',
  );
  assert(
    autopilot.includes('separate fresh Reviewer')
      && autopilot.includes('Never reuse or resume the `/verify` child for `/red-verify`'),
    'Runtime autopilot lost independent functional and semantic reviewer contexts.',
  );
  assert(
    multiagentic.includes('Load `/autopilot` and its Judge section')
      && multiagentic.includes('Delegate the queue to the installed')
      && multiagentic.includes('multiagents_with_judge.md#judge-consultation')
      && multiagentic.includes('#autonomous-with-judge')
      && multiagentic.includes('#autopilot-with-judge')
      && judgeOverlay.includes('## autonomous with judge')
      && judgeOverlay.includes('## autopilot with judge')
      && judgeOverlay.includes('whenever the operator explicitly requests consultation')
      && !autonomous.includes('multiagents_with_judge')
      && !autopilot.includes('multiagents_with_judge'),
    'Runtime multiagentic overlay is incomplete or leaked into a base skill.',
  );
  assert(
    executeLoop.includes('PLANNING_RECONCILIATION_REQUIRED')
      && specRedesign.includes('whose planning needs repair')
      && featureToTasks.includes('removes `PLANNING_RECONCILIATION_REQUIRED`')
      && reviewTasksPlan.includes('blocks review')
      && autopilot.includes('makes only that')
      && exe.includes('only the selected feature')
      && autonomyPolicy.includes('only that feature is withheld')
      && !autopilot.includes('every previous product task-plan approval is stale')
      && !exe.includes('every previous product task-plan approval is stale')
      && !autonomyPolicy.includes('makes every product task-plan approval stale'),
    'Runtime planning freshness lost bounded feature routing or retained blanket invalidation.',
  );
  assert(existsSync(targetPath(target, '.memory-bank/tasks/index.json')), 'Task index is missing.');
  assert(existsSync(targetPath(target, 'PAPERCUTS/TECHDEBTS')), 'Papercut directories are missing.');
  ['orchestrator', 'general', 'architect', 'explorer', 'implementer', 'reviewer', 'judge'].forEach((role) => {
    assert(existsSync(targetPath(target, `.memory-bank/roles/${role}.md`)), `Role is missing: ${role}`);
  });

  const rows = installedSkillRows(readTarget(target, '.memory-bank/skills/index.md'));
  assert(
    JSON.stringify(rows.map(({ name }) => name)) === JSON.stringify(expectedSkillNames)
      && rows.every(({ agents, claude }) => agents === 'yes' && claude === 'yes'),
    'Installed skill inventory differs from runtime surfaces.',
  );

  const lint = runTargetScript(target, 'scripts/mb-lint.mjs');
  assert(lint.status === 0, 'Fresh deployed mb-lint failed.', lint.output);
  const doctor = runTargetScript(target, 'scripts/mb-doctor.mjs', ['--json']);
  let report;
  try {
    report = JSON.parse(doctor.stdout);
  } catch {
    fail('Fresh deployed mb-doctor returned invalid JSON.', doctor.output);
  }
  assert(doctor.status === 0 && report.status === 'pass', 'Fresh mb-doctor failed.', doctor.output);
}

function assertSync(target) {
  const managed = [
    '.memory-bank/schemas/task.schema.json',
    '.memory-bank/workflows/execute-loop.md',
    '.memory-bank/workflows/sdd-design-contract.md',
    '.memory-bank/workflows/multiagents_with_judge.md',
    '.memory-bank/roles/architect.md',
    '.memory-bank/roles/judge.md',
    '.memory-bank/templates/protocols/compact-run-template.md',
    'scripts/mb-lint.mjs',
    'scripts/mb-doctor.mjs',
    'scripts/mb-doctor/readers.mjs',
    'AGENTS.md',
    '.agents/skills/start/SKILL.md',
    '.agents/skills/verify/references/finding-adjudication.md',
  ];
  const snapshots = new Map(managed.map((rel) => [rel, readTarget(target, rel)]));
  managed.forEach((rel) => writeTarget(target, rel, `${snapshots.get(rel).trimEnd()}\n<!-- stale -->\n`));

  const projectFiles = new Map([
    ['.memory-bank/tasks/index.json', '{"version":1,"tasks":[]}\n'],
    ['.memory-bank/contracts/boundary-map.md', '# Project boundary map\n'],
    ['.protocols/TASK-999-T1-FT-999-W1/run.md', '# Task-owned state\n'],
    ['.memory-bank/templates/protocols/project-notes.md', '# Project template\n'],
    ['PAPERCUTS/session.md', '# Session papercut\n'],
  ]);
  projectFiles.forEach((content, rel) => writeTarget(target, rel, content));
  const authoredMarker = '<!-- authored skill guidance -->';
  writeTarget(
    target,
    '.memory-bank/skills/index.md',
    `${readTarget(target, '.memory-bank/skills/index.md').trimEnd()}\n\n${authoredMarker}\n`,
  );
  rmSync(targetPath(target, 'PAPERCUTS/TECHDEBTS'), { recursive: true, force: true });

  const firstOutput = runInstaller(['--bootstrap', '--sync', '--target', target, '--yes']);
  snapshots.forEach((expected, rel) => {
    assert(readTarget(target, rel) === expected, `Full sync did not restore ${rel}.`, firstOutput);
  });
  projectFiles.forEach((expected, rel) => {
    assert(readTarget(target, rel) === expected, `Full sync overwrote ${rel}.`, firstOutput);
  });
  assert(
    readTarget(target, '.memory-bank/skills/index.md').includes(authoredMarker)
      && existsSync(targetPath(target, 'PAPERCUTS/TECHDEBTS')),
    'Full sync lost authored skill guidance or PAPERCUTS/TECHDEBTS.',
    firstOutput,
  );
  assert(firstOutput.includes('[Sync report]'), 'Full sync omitted its report.', firstOutput);

  const secondOutput = runInstaller(['--bootstrap', '--sync', '--target', target, '--yes']);
  snapshots.forEach((expected, rel) => {
    assert(readTarget(target, rel) === expected, `Idempotent sync changed ${rel}.`, secondOutput);
  });
  projectFiles.forEach((expected, rel) => {
    assert(readTarget(target, rel) === expected, `Idempotent sync changed ${rel}.`, secondOutput);
  });
  assert(
    secondOutput.includes('unchanged framework-owned'),
    'Idempotent sync did not report unchanged managed files.',
    secondOutput,
  );

  const schemaRel = '.memory-bank/schemas/task.schema.json';
  const protocolRel = '.memory-bank/templates/protocols/compact-run-template.md';
  const runtimeRel = '.agents/skills/start/SKILL.md';
  writeTarget(target, schemaRel, `${snapshots.get(schemaRel).trimEnd()}\n<!-- stale schema -->\n`);
  writeTarget(target, protocolRel, '# stale protocol\n');
  writeTarget(target, runtimeRel, `${snapshots.get(runtimeRel)}<!-- keep runtime -->\n`);
  const repairOutput = runInstaller([
    '--bootstrap-only',
    '--sync',
    '--target',
    target,
    '--yes',
  ]);
  assert(readTarget(target, schemaRel) === snapshots.get(schemaRel), 'Bootstrap-only did not repair schema.');
  assert(readTarget(target, protocolRel) === snapshots.get(protocolRel), 'Bootstrap-only did not repair protocol.');
  assert(readTarget(target, runtimeRel).includes('<!-- keep runtime -->'), 'Bootstrap-only changed runtime skills.');
  assert(
    repairOutput.includes('repairs Memory Bank managed assets only'),
    'Bootstrap-only omitted its runtime warning.',
    repairOutput,
  );
}

try {
  assertCollisionSafety();

  const target = join(tempRoot, 'target');
  runInstaller(['--install-only', '--target', target, '--yes']);
  assertRuntimeInventory(target);
  assertRuntimeParity(target);
  assert(!existsSync(targetPath(target, '.memory-bank')), 'Install-only created Memory Bank.');

  runInstaller(['--bootstrap', '--target', target, '--yes']);
  assertFreshBootstrap(target);
  assertSync(target);

  const skeletonOnlyTarget = join(tempRoot, 'skeleton-only');
  runInstaller(['--bootstrap-only', '--target', skeletonOnlyTarget, '--yes']);
  assert(existsSync(targetPath(skeletonOnlyTarget, '.memory-bank/tasks/index.json')), 'Bootstrap-only omitted Memory Bank.');
  runtimeRoots.forEach((runtimeRoot) => {
    assert(runtimeSkillNames(skeletonOnlyTarget, runtimeRoot).length === 0, 'Bootstrap-only installed runtime skills.');
  });

  console.log('install sync smoke passed');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
