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
const sharedAgentRoot = join(repoRoot, 'skills', '_shared', 'agents');
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
const planningResources = [
  ['map-codebase', 'agents/repo-scanner.md', join(sharedAgentRoot, 'repo-scanner.md')],
  ['mb-garden', 'agents/mb-reviewer.md', join(sharedAgentRoot, 'mb-reviewer.md')],
  ['mb-garden', 'references/recovery-plan.md', join(referenceRoot, 'recovery-plan.md')],
  ['review-feat-plan', 'agents/review-scope.md', join(sharedAgentRoot, 'review-scope.md')],
  ['review-tasks-plan', 'agents/review-plan.md', join(sharedAgentRoot, 'review-plan.md')],
  ['review-tasks-plan', 'agents/review-security.md', join(sharedAgentRoot, 'review-security.md')],
  ...['adr-template.md', 'concept-architecture-template.md', 'concept-guide-template.md']
    .map((file) => ['spec-design', `references/${file}`, join(referenceRoot, file)]),
  ['spec-redesign', 'references/adr-template.md', join(referenceRoot, 'adr-template.md')],
];
const planningSkills = [
  'spec-init', 'prd-to-features', 'feature-doctor', 'spec-design', 'spec-redesign',
  'spec-auto', 'foundation-to-tasks', 'feature-to-tasks', 'review-feat-plan',
  'review-tasks-plan', 'architecture-review', 'kiss-architect',
];
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

  planningResources.forEach(([owner, rel, source]) => {
    runtimeRoots.forEach((runtimeRoot) => {
      assert(
        readTarget(target, `${runtimeRoot}/skills/${owner}/${rel}`) === read(source),
        `${runtimeRoot}/${owner} has missing or stale ${rel}.`,
      );
    });
    assert(read(join(commandDir, `${owner}.md`)).includes(rel),
      `Resource ${owner}/${rel} has no owning command route.`);
  });

  const expectedCodeReviewer = read(join(sharedAgentRoot, 'review-code.md'));
  runtimeRoots.forEach((runtimeRoot) => {
    assert(
      readTarget(target, `${runtimeRoot}/skills/verify/agents/review-code.md`)
        === expectedCodeReviewer,
      `${runtimeRoot}/verify has stale review-code.md.`,
    );
  });
}

function installedSkillRows(content) {
  return [...content.matchAll(/^\| <code>([^<]+)<\/code> \| (yes|no) \| (yes|no) \|$/gm)]
    .map((match) => ({ name: match[1], agents: match[2], claude: match[3] }));
}

function canonicalCopies() {
  const copies = [
    [join(referenceRoot, 'deployable', 'AGENTS.md'), 'AGENTS.md'],
    [join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-lint.mjs'), '.memory-bank/scripts/mb-lint.mjs'],
    [join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-doctor.mjs'), '.memory-bank/scripts/mb-doctor.mjs'],
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
        `.memory-bank/scripts/mb-doctor/${filename}`,
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


function legacyGeneratedRuntimeSkill(name) {
  return `---
name: ${name}
description: legacy generated command
---
<!-- Generated by DevRails 26 install-framework.mjs. Safe to overwrite with install-framework.mjs --sync. -->
# /${name}
`;
}

function assertDiscoveryCommandMigration() {
  const target = join(tempRoot, 'discovery-command-migration');
  runtimeRoots.forEach((runtimeRoot) => {
    writeTarget(
      target,
      `${runtimeRoot}/skills/brainstorm/SKILL.md`,
      legacyGeneratedRuntimeSkill('brainstorm'),
    );
    writeTarget(
      target,
      `${runtimeRoot}/skills/brief/SKILL.md`,
      legacyGeneratedRuntimeSkill('brief'),
    );
  });

  runInstaller(['--install-only', '--target', target, '--yes']);

  runtimeRoots.forEach((runtimeRoot) => {
    assert(
      !existsSync(targetPath(target, `${runtimeRoot}/skills/brainstorm`))
        && !existsSync(targetPath(target, `${runtimeRoot}/skills/brief`))
        && existsSync(targetPath(target, `${runtimeRoot}/skills/grill-me/SKILL.md`)),
      `${runtimeRoot} did not migrate discovery commands to /grill-me.`,
    );
  });
  assertRuntimeInventory(target);
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
  const multipilot = readTarget(target, '.agents/skills/multipilot/SKILL.md');
  const exe = readTarget(target, '.agents/skills/exe/SKILL.md');
  const featureDoctor = readTarget(target, '.agents/skills/feature-doctor/SKILL.md');
  const featureToTasks = readTarget(target, '.agents/skills/feature-to-tasks/SKILL.md');
  const reviewTasksPlan = readTarget(target, '.agents/skills/review-tasks-plan/SKILL.md');
  const verify = readTarget(target, '.agents/skills/verify/SKILL.md');
  const autonomyPolicy = readTarget(target, '.memory-bank/workflows/autonomy-policy.md');
  const executeLoop = readTarget(target, '.memory-bank/workflows/execute-loop.md');
  const grillMe = readTarget(target, '.agents/skills/grill-me/SKILL.md');
  const writePrd = readTarget(target, '.agents/skills/write-prd/SKILL.md');
  const constitution = readTarget(target, '.agents/skills/constitution/SKILL.md');
  const judgeOverlay = readTarget(target, '.memory-bank/workflows/multiagents_with_judge.md');
  const judgeRole = readTarget(target, '.memory-bank/roles/judge.md');

  assert(
    grillMe.includes('`.memory-bank/analysis/brief.md`')
      && grillMe.includes('common decision flow')
      && grillMe.includes('installed `creator-vibe`')
      && writePrd.includes('`.memory-bank/analysis/brief.md`')
      && writePrd.includes('propose `/grill-me`')
      && constitution.includes('`.memory-bank/analysis/brief.md`')
      && executeLoop.includes('`/grill-me` produces the durable brief')
      && !grillMe.includes('The **frontier**'),
    'Runtime discovery lost durable brief, intent, or shared decision routing.',
  );

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
    executeLoop.includes('only when durable planning semantics changed')
      && executeLoop.includes('with product-wide impact')
      && executeLoop.includes('`none` preserves revision/reviews')
      && executeLoop.includes('`bounded` preserves revision')
      && specRedesign.includes('Do not use revision mismatch as impact proof')
      && specRedesign.includes('Preserve task lifecycle, completed evidence')
      && specAuto.includes('feature design never owns revision'),
    'Runtime SDD workflows lost bounded redesign or Planning Revision ownership.',
  );
  const redVerify = readTarget(target, '.agents/skills/red-verify/SKILL.md');
  assert(
    verify.includes('independent functional PASS')
      && redVerify.includes('Use an independent verifier context')
      && autopilot.includes('secondary-only verification has no mandatory')
      && autopilot.includes('Red alone can inspect available implementation'),
    'Selected functional/semantic review lost independence or gained a hidden participant.',
  );
  assert(
    verify.includes('agents/review-code.md')
      && verify.includes('No fixed model/effort, mandatory co-review')
      && verify.includes('All off means `skipped`')
      && !/Codex Luna|xhigh/.test(verify),
    'Runtime /verify lost configurable participation or retained fixed co-review.',
  );
  assert(
    multiagentic.includes('Apply installed `/autonomous`')
      && multiagentic.includes('multiagents_with_judge.md')
      && multiagentic.includes('Only selected/requested consultation runs')
      && judgeOverlay.includes('optional DSH assignment')
      && judgeOverlay.includes('No fixed model')
      && judgeOverlay.includes('Disabled Judge adds no gate or report')
      && judgeRole.includes('SUPPORT|REDIRECT|ESCALATE_OPERATOR')
      && judgeRole.includes('Judge is read-only')
      && /common\s+decision flow/.test(judgeOverlay)
      && !autonomous.includes('multiagents_with_judge')
      && !autopilot.includes('multiagents_with_judge'),
    'Runtime Judge overlay lost conditional consultation or leaked into base skills.',
  );
  assert(
    multipilot.includes('Apply installed `/autopilot`')
      && multipilot.includes('host retains scheduling')
      && multipilot.includes('native DSH session')
      && !multipilot.includes('installed `/autonomous`'),
    'Runtime multipilot lost the product base contract or native host ownership.',
  );
  assert(
    executeLoop.includes('PLANNING_RECONCILIATION_REQUIRED')
      && specRedesign.includes('whose planning needs repair')
      && featureToTasks.includes('removes `PLANNING_RECONCILIATION_REQUIRED`')
      && reviewTasksPlan.includes('blocks review')
      && autopilot.includes('Preserve reconciliation')
      && exe.includes('PLANNING_RECONCILIATION_REQUIRED')
      && executeLoop.includes('names only\naffected features')
      && !autopilot.includes('every previous product task-plan approval is stale')
      && !exe.includes('every previous product task-plan approval is stale')
      && !autonomyPolicy.includes('makes every product task-plan approval stale'),
    'Runtime planning freshness lost bounded feature routing or retained blanket invalidation.',
  );
  assert(
    featureDoctor.includes('Validate the semantic basis')
      && featureDoctor.includes('Recommend only among options')
      && featureDoctor.includes('`/spec-redesign` owns')
      && reviewTasksPlan.includes('can triage unclear semantic ownership; it is not a mandatory intermediate gate')
      && verify.includes('Preserve\nactual negative results')
      && autonomous.includes('actual/partial effects')
      && autopilot.includes('evidence, owner and resume route')
      && executeLoop.includes('`/feature-doctor`\ncan triage unclear semantic ownership'),
    'Runtime feature-doctor triage or autonomous recommendation contract is incomplete.',
  );
  assert(
    autonomyPolicy.includes('The host owns queue selection')
      && autonomyPolicy.includes('Under the autonomous decision policy, the model makes the semantic decision')
      && autonomyPolicy.includes('shared compact structured flow feedback')
      && autonomyPolicy.includes('command phase ownership does not reset the decision policy')
      && autonomyPolicy.includes('feedback is not due\nafter each tool call')
      && autonomyPolicy.includes('Manual red, Pause, Stop, DSH permissions')
      && autonomyPolicy.includes('`skipped`, never `PASS`')
      && autonomyPolicy.includes('Disabling\nlater work does not erase findings')
      && autonomyPolicy.includes('Resume the first\nactually unfinished selected operation'),
    'Shared Nav policy lost host ownership, decision, skip, failure, or recovery semantics.',
  );
  planningSkills.forEach((name) => {
    const content = readTarget(target, `.agents/skills/${name}/SKILL.md`);
    assert(content.includes('.memory-bank/workflows/autonomy-policy.md')
      && content.includes('compact structured')
      && !/Codex Luna|reasoning effort `xhigh`|Establish two co-review|unattended mode, block|unattended flow records the exact question/i.test(content),
    `Planning /${name} lost shared feedback/settings or retained fixed execution policy.`);
    assert(!content.includes('skills/_shared/'), `Planning /${name} exposes a source-only path.`);
  });
  const executionSkills = ['exe', 'add-tests', 'verify', 'red-verify', 'debug',
    'technical-premortem', 'tech-debt', 'mb-sync', 'mb-garden', 'mb-doctor',
    'autonomous', 'autopilot', 'multiagentic', 'multipilot'];
  for (const name of executionSkills) {
    const content = readTarget(target, `.agents/skills/${name}/SKILL.md`);
    assert(content.includes('.memory-bank/workflows/autonomy-policy.md')
      && content.includes('compact structured flow feedback')
      && !/Codex Luna|reasoning effort `xhigh`|Unattended mode never answers|single Judge session|writes `ready -> in_progress`/.test(content),
    `Execution /${name} retained model-owned mechanics or lost the shared feedback contract.`);
    assert(!content.includes('skills/_shared/'), `Execution /${name} exposes a source-only reference.`);
  }
  const tierPolicy = readTarget(target, '.memory-bank/workflows/tier-policy.md');
  assert(tierPolicy.includes('## Selected Work And Retained Results')
    && tierPolicy.includes('No protocol bundle is selected by tier alone')
    && tierPolicy.includes('Legacy records without')
    && tierPolicy.includes('never current settings to reinterpret evidence')
    && exe.includes('independently disableable')
    && redVerify.includes('all functional\nverification is off'),
  'Selected work lost durable applicability, independent local checks or red-only semantics.');
  for (const name of ['compact-run', 'context', 'plan', 'progress', 'handoff', 'verification', 'red-verification']) {
    const content = readTarget(target, `.memory-bank/templates/protocols/${name}-template.md`);
    assert(content.includes('Use only when this artifact is selected') && content.includes('Host owns'),
      `Protocol ${name} reintroduced unconditional files or model lifecycle ownership.`);
  }
  const featureReview = readTarget(target, '.agents/skills/review-feat-plan/SKILL.md');
  const foundationTasking = readTarget(target, '.agents/skills/foundation-to-tasks/SKILL.md');
  const pack = readTarget(target, '.agents/skills/review-tasks-plan/references/finding-adjudication.md');
  assert(
    featureToTasks.includes('Disabled task review requires no APPROVE or report')
      && featureToTasks.includes('Missing artifacts\nfrom disabled design/framing/review stages do not block tasking')
      && featureToTasks.includes('Preserve ID, feature, wave')
      && featureToTasks.includes('`rebuild_required`')
      && foundationTasking.includes('Do not\n   create a proof-only gate for disabled checks')
      && foundationTasking.includes('host initializes or changes lifecycle')
      && reviewTasksPlan.includes('A disabled Architect/reviewer requires no')
      && reviewTasksPlan.includes('Separate request\nand report files are conditional')
      && featureReview.includes('Disabled review\n  requires no launch, verdict or report')
      && specAuto.includes('Resolve semantic choices with autonomous')
      && specAuto.includes('manual stops')
      && pack.includes('host performs DSH launches')
      && pack.includes('Disabled participants require no fallback, report or verdict')
      && !pack.includes('Codex Luna'),
    'Planning conditional stages, identity, decisions or host ownership regressed.',
  );
  assert(
    !readTarget(target, '.memory-bank/adrs/ADR-000-template.md')
      .includes('Каждое значимое архитектурное решение фиксируется как ADR'),
    'Fresh ADR skeleton restored a mandatory artifact cascade.',
  );
  assert(existsSync(targetPath(target, '.memory-bank/tasks/index.json')), 'Task index is missing.');
  assert(existsSync(targetPath(target, 'PAPERCUTS/TECHDEBTS')), 'Papercut directories are missing.');
  assert(!existsSync(targetPath(target, 'scripts')), 'Fresh bootstrap exposed runtime scripts in visible scripts/.');
  ['orchestrator', 'general', 'architect', 'explorer', 'implementer', 'reviewer', 'judge'].forEach((role) => {
    const deployedRole = readTarget(target, `.memory-bank/roles/${role}.md`);
    assert(
      deployedRole.replace('<!-- Generated by DevRails 26 init-mb.js. Safe to overwrite with init-mb.js --sync. -->\n', '')
        === read(join(referenceRoot, 'roles', `${role}.md`)),
      `Deployed role differs from canonical source: ${role}`,
    );
  });

  const rows = installedSkillRows(readTarget(target, '.memory-bank/skills/index.md'));
  assert(
    JSON.stringify(rows.map(({ name }) => name)) === JSON.stringify(expectedSkillNames)
      && rows.every(({ agents, claude }) => agents === 'yes' && claude === 'yes'),
    'Installed skill inventory differs from runtime surfaces.',
  );

  const lint = runTargetScript(target, '.memory-bank/scripts/mb-lint.mjs');
  assert(lint.status === 0, 'Fresh deployed mb-lint failed.', lint.output);
  const doctor = runTargetScript(target, '.memory-bank/scripts/mb-doctor.mjs', ['--json']);
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
    '.memory-bank/scripts/mb-lint.mjs',
    '.memory-bank/scripts/mb-doctor.mjs',
    '.memory-bank/scripts/mb-doctor/readers.mjs',
    'AGENTS.md',
    '.agents/skills/start/SKILL.md',
    '.agents/skills/verify/references/finding-adjudication.md',
    '.agents/skills/verify/agents/review-code.md',
    ...planningResources.map(([owner, rel]) => `.agents/skills/${owner}/${rel}`),
  ];
  const snapshots = new Map(managed.map((rel) => [rel, readTarget(target, rel)]));
  managed.forEach((rel) => writeTarget(target, rel, `${snapshots.get(rel).trimEnd()}\n<!-- stale -->\n`));

  const projectFiles = new Map([
    ['.memory-bank/tasks/index.json', '{"version":1,"tasks":[]}\n'],
    ['.memory-bank/contracts/boundary-map.md', '# Project boundary map\n'],
    ['.memory-bank/adrs/ADR-000-template.md', '# Project-owned ADR guidance\n'],
    ['.protocols/TASK-999-T1-FT-999-W1/run.md', '# Task-owned state\nVERDICT: FAIL\n'],
    ['.tasks/TASK-999-T1-FT-999-W1/review.md', '# User-owned historical review\nSEMANTIC_VERDICT: semantic-fail\n'],
    ['.memory-bank/tasks/TASK-999-T1-FT-999-W1.task.json', JSON.stringify({
      id: 'TASK-999-T1-FT-999-W1', status: 'done', verify: [
        'Historical failure retained without backfill',
        { stage: 'workflow', attempt: '1', selected: { design: false, local_checks: false, verify: [], red_verify: false, feature_red_verify: false, protocols: [] }, implementation: 'complete', evidence: ['Actual implementation retained'], local_checks: 'skipped', verification: 'skipped', red_verification: 'skipped' },
      ],
    }) + '\n'],
    ['.memory-bank/templates/protocols/project-notes.md', '# Project template\n'],
    ['PAPERCUTS/session.md', '# Session papercut\n'],
    ['scripts/mb-lint.mjs', '#!/usr/bin/env node\n// Legacy copy left for operator cleanup.\n'],
    ['scripts/mb-doctor.mjs', '#!/usr/bin/env node\n// Legacy copy left for operator cleanup.\n'],
    ['scripts/mb-doctor/readers.mjs', '// Legacy copy left for operator cleanup.\n'],
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
  assertDiscoveryCommandMigration();

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
