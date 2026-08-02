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

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const installer = join(repoRoot, 'scripts', 'install-framework.mjs');
const commandSourceDir = join(repoRoot, 'skills', '_shared', 'references', 'commands');
const protocolSourceDir = join(repoRoot, 'skills', '_shared', 'references', 'protocols');
const deployableAgentsSource = join(repoRoot, 'skills', '_shared', 'references', 'deployable', 'AGENTS.md');
const structureTemplateSource = join(repoRoot, 'skills', '_shared', 'references', 'structure-template.md');
const executeLoopSource = join(repoRoot, 'skills', '_shared', 'references', 'workflows', 'execute-loop.md');
const tierPolicySource = join(repoRoot, 'skills', '_shared', 'references', 'workflows', 'tier-policy.md');
const autonomyPolicySource = join(repoRoot, 'skills', '_shared', 'references', 'workflows', 'autonomy-policy.md');
const architectRoleSource = join(repoRoot, 'skills', '_shared', 'references', 'roles', 'architect.md');
const retiredArchitectPrompt = join(repoRoot, 'skills', '_shared', 'agents', 'review-architect.md');
const lintSource = join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-lint.mjs');
const doctorSource = join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-doctor.mjs');
const doctorModuleSourceDir = join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-doctor');
const doctorModules = readdirSync(doctorModuleSourceDir)
  .filter((name) => name.endsWith('.mjs'))
  .sort()
  .map((name) => ({
    source: join(doctorModuleSourceDir, name),
    target: `scripts/mb-doctor/${name}`,
  }));
const tempRoot = mkdtempSync(join(tmpdir(), 'devrails26-install-sync-'));
const target = join(tempRoot, 'target');
const installedSkillsBeginMarker = '<!-- BEGIN DEVRAILS INSTALLED SKILLS -->';
const installedSkillsEndMarker = '<!-- END DEVRAILS INSTALLED SKILLS -->';
const fullBootstrapRoute = 'node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --target <target-repo> --yes';
const skeletonBootstrapRoute = 'node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --target <target-repo> --yes';
const expectedRuntimeSkillNames = readdirSync(commandSourceDir)
  .filter((name) => name.endsWith('.md') && name !== 'find-skill.md')
  .map((name) => name.replace(/\.md$/, ''))
  .sort();

function fail(message, output = '') {
  const detail = output ? `\n\n${output}` : '';
  throw new Error(`${message}${detail}`);
}

function assert(condition, message, output = '') {
  if (!condition) fail(message, output);
}

function runInstaller(installerArgs) {
  const result = spawnSync(process.execPath, [installer, ...installerArgs], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.error) fail(result.error.message, output);
  if (result.status !== 0) fail(`Installer exited with status ${result.status}`, output);
  return output;
}

function runInstallerFailure(installerArgs) {
  const result = spawnSync(process.execPath, [installer, ...installerArgs], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.error) fail(result.error.message, output);
  if (result.status === 0 || result.status === null) {
    fail(`Installer unexpectedly exited with status ${result.status}`, output);
  }
  return { status: result.status, output };
}

function targetPath(rel) {
  return join(target, rel);
}

function readTarget(rel) {
  return readFileSync(targetPath(rel), 'utf8');
}

function writeTarget(rel, content) {
  writeFileSync(targetPath(rel), content, 'utf8');
}

function writeJsonTarget(rel, value) {
  writeTarget(rel, `${JSON.stringify(value, null, 2)}\n`);
}

function runtimeSkillNames(targetRoot, runtimeRoot) {
  try {
    return readdirSync(join(targetRoot, runtimeRoot, 'skills'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => {
        try {
          readFileSync(join(targetRoot, runtimeRoot, 'skills', entry.name, 'SKILL.md'));
          return true;
        } catch {
          return false;
        }
      })
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }
}

function installedSkillRows(content) {
  return [...content.matchAll(/^\| <code>([^<]+)<\/code> \| (yes|no) \| (yes|no) \|$/gm)]
    .map((match) => ({ name: match[1], agents: match[2], claude: match[3] }));
}

function replaceInstalledBody(content, body) {
  const match = content.match(/^## Installed\r?\n[\s\S]*?(?=^## .+\r?$)/m);
  if (!match) fail('Fixture has no replaceable Installed section.');
  return `${content.slice(0, match.index)}## Installed\n${body}\n\n${content.slice(match.index + match[0].length)}`;
}

function runTargetLint() {
  const result = spawnSync(process.execPath, [targetPath('scripts/mb-lint.mjs')], {
    cwd: target,
    encoding: 'utf8',
  });
  return {
    status: result.status,
    output: `${result.stdout || ''}${result.stderr || ''}`,
  };
}

function runTargetDoctor(flags = ['--json']) {
  const result = spawnSync(process.execPath, [targetPath('scripts/mb-doctor.mjs'), ...flags], {
    cwd: target,
    encoding: 'utf8',
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.error) fail(result.error.message, output);
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, output };
}

const BOUNDARY_CASES = [
  { value: 'src', valid: true },
  { value: 'src/', valid: true },
  { value: 'src/a.js', valid: true },
  { value: '.github/workflows/ci.yml', valid: true },
  { value: 'app/[id]/page.tsx', valid: true },
  { value: 'docs/My File.md', valid: true },
  { value: 'docs/{literal}.md', valid: true },
  { value: '', valid: false },
  { value: ' ', valid: false },
  { value: './src', valid: false },
  { value: '../src', valid: false },
  { value: '/src', valid: false },
  { value: 'C:/src', valid: false },
  { value: 'src//a', valid: false },
  { value: 'src\\a', valid: false },
  { value: 'src/**', valid: false },
  { value: 'src/file?.js', valid: false },
  { value: 'src/ /a', valid: false },
  { value: 'src/a ', valid: false },
  { value: 'src/\u0000a', valid: false },
  { value: 'src/\na', valid: false },
];

const BOUNDARY_TASK_ID = 'TASK-001-T0-FT-001-W1';
const BOUNDARY_TASK_REL = `.memory-bank/tasks/${BOUNDARY_TASK_ID}.task.json`;

function boundaryTask(runtimeContext) {
  return {
    id: BOUNDARY_TASK_ID,
    title: 'Write boundary regression fixture',
    status: 'planned',
    wave: 'W1',
    feature: 'FT-001',
    reqs: ['REQ-001'],
    depends_on: [],
    touched_files: [],
    tier: 'T0',
    gates: [],
    verify: [],
    docs: [],
    evidence_required: [],
    runtime_context: runtimeContext,
    source_artifacts: [],
    normative_inputs: [],
    constraints: [],
    invariants: [],
    verification_targets: [],
  };
}

try {
  assert(existsSync(architectRoleSource), 'Canonical Architect role is missing.');
  assert(!existsSync(retiredArchitectPrompt), 'Retired review-architect agent prompt still exists.');

  const collisionTarget = join(tempRoot, 'runtime-skill-collision-target');
  const agentsCollisionDir = join(collisionTarget, '.agents', 'skills', 'verify');
  const claudeCollisionDir = join(collisionTarget, '.claude', 'skills', 'verify');
  const customAgentsSkill = [
    '---',
    'name: verify',
    'description: User-owned verification skill.',
    '---',
    '# User Verify',
    '',
  ].join('\n');
  mkdirSync(join(agentsCollisionDir, 'assets'), { recursive: true });
  mkdirSync(join(claudeCollisionDir, 'assets'), { recursive: true });
  writeFileSync(join(agentsCollisionDir, 'SKILL.md'), customAgentsSkill, 'utf8');
  writeFileSync(join(agentsCollisionDir, 'assets', 'keep.txt'), 'agents asset\n', 'utf8');
  writeFileSync(join(claudeCollisionDir, 'assets', 'keep.txt'), 'claude asset\n', 'utf8');

  const collisionResult = runInstallerFailure([
    '--install-only',
    '--target',
    collisionTarget,
    '--yes',
  ]);
  assert(
    collisionResult.status === 1
      && collisionResult.output.includes('.agents/skills/verify')
      && collisionResult.output.includes('.claude/skills/verify')
      && collisionResult.output.includes('will not be overwritten')
      && !collisionResult.output.includes('Установка завершена.'),
    'Runtime skill collision did not return the complete non-success report.',
    collisionResult.output,
  );
  assert(
    readFileSync(join(agentsCollisionDir, 'SKILL.md'), 'utf8') === customAgentsSkill
      && readFileSync(join(agentsCollisionDir, 'assets', 'keep.txt'), 'utf8') === 'agents asset\n'
      && readFileSync(join(claudeCollisionDir, 'assets', 'keep.txt'), 'utf8') === 'claude asset\n'
      && !existsSync(join(claudeCollisionDir, 'SKILL.md'))
      && !existsSync(join(collisionTarget, '.agents', 'skills', 'cold-start'))
      && !existsSync(join(collisionTarget, '.claude', 'skills', 'cold-start')),
    'Runtime skill collision changed user-owned state or allowed a partial install.',
    collisionResult.output,
  );

  const legacyProxyTarget = join(tempRoot, 'legacy-runtime-proxy-target');
  const legacyProxy = [
    '---',
    'name: verify',
    'description: Legacy generated proxy.',
    '---',
    '',
    'Read and follow the instructions in `.memory-bank/commands/verify.md`',
  ].join('\n');
  ['.agents', '.claude'].forEach((runtimeRoot) => {
    const legacySkillDir = join(legacyProxyTarget, runtimeRoot, 'skills', 'verify');
    mkdirSync(legacySkillDir, { recursive: true });
    writeFileSync(join(legacySkillDir, 'SKILL.md'), legacyProxy, 'utf8');
  });
  runInstaller([
    '--install-only',
    '--target',
    legacyProxyTarget,
    '--yes',
  ]);
  assert(
    JSON.stringify(runtimeSkillNames(legacyProxyTarget, '.agents'))
      === JSON.stringify(expectedRuntimeSkillNames)
      && JSON.stringify(runtimeSkillNames(legacyProxyTarget, '.claude'))
        === JSON.stringify(expectedRuntimeSkillNames),
    'Legacy runtime proxy migration did not install the complete runtime command set.',
  );
  ['.agents', '.claude'].forEach((runtimeRoot) => {
    const migratedSkill = readFileSync(
      join(legacyProxyTarget, runtimeRoot, 'skills', 'verify', 'SKILL.md'),
      'utf8',
    );
    assert(
      migratedSkill.includes('Generated by DevRails 26 install-framework.mjs'),
      `${runtimeRoot} legacy runtime proxy was not migrated.`,
    );
  });

  const installOnlyTarget = join(tempRoot, 'install-only-target');
  runInstaller(['--install-only', '--target', installOnlyTarget, '--yes']);
  const installOnlyAgentsSkillNames = runtimeSkillNames(installOnlyTarget, '.agents');
  const installOnlyClaudeSkillNames = runtimeSkillNames(installOnlyTarget, '.claude');
  assert(
    JSON.stringify(installOnlyAgentsSkillNames) === JSON.stringify(expectedRuntimeSkillNames)
      && JSON.stringify(installOnlyClaudeSkillNames) === JSON.stringify(expectedRuntimeSkillNames)
      && !existsSync(join(installOnlyTarget, '.memory-bank')),
    'Install-only did not deploy the complete runtime command set without Memory Bank.',
  );
  ['.agents', '.claude'].forEach((runtimeRoot) => {
    const installOnlyColdStart = readFileSync(
      join(installOnlyTarget, runtimeRoot, 'skills', 'cold-start', 'SKILL.md'),
      'utf8',
    );
    assert(
      installOnlyColdStart.includes(fullBootstrapRoute)
        && !installOnlyColdStart.includes(skeletonBootstrapRoute),
      `${runtimeRoot} install-only cold-start does not route missing skeleton to full bootstrap.`,
    );
  });

  runInstaller(['--bootstrap', '--target', installOnlyTarget, '--yes']);
  const bootstrappedAgentsSkillNames = runtimeSkillNames(installOnlyTarget, '.agents');
  const bootstrappedClaudeSkillNames = runtimeSkillNames(installOnlyTarget, '.claude');
  assert(
    existsSync(join(installOnlyTarget, '.memory-bank', 'tasks', 'index.json'))
      && JSON.stringify(bootstrappedAgentsSkillNames) === JSON.stringify(expectedRuntimeSkillNames)
      && JSON.stringify(bootstrappedClaudeSkillNames) === JSON.stringify(expectedRuntimeSkillNames),
    'Full bootstrap did not preserve the complete runtime set while adding the skeleton.',
  );
  ['brief', 'write-prd', 'map-codebase'].forEach((name) => {
    assert(
      existsSync(join(installOnlyTarget, '.agents', 'skills', name, 'SKILL.md'))
        && existsSync(join(installOnlyTarget, '.claude', 'skills', name, 'SKILL.md')),
      `Bootstrapped install-only target is missing runtime skill: ${name}`,
    );
  });
  const bootstrappedSkillIndex = readFileSync(
    join(installOnlyTarget, '.memory-bank', 'skills', 'index.md'),
    'utf8',
  );
  const bootstrappedSkillRows = installedSkillRows(bootstrappedSkillIndex);
  assert(
    JSON.stringify(bootstrappedSkillRows.map(({ name }) => name))
      === JSON.stringify(bootstrappedAgentsSkillNames)
      && bootstrappedSkillRows.every(({ agents, claude }) => agents === 'yes' && claude === 'yes'),
    'Bootstrapped install-only target skill registry does not match its runtime surfaces.',
  );

  runInstaller(['--bootstrap', '--target', target, '--yes']);

  const schemaRel = '.memory-bank/schemas/task.schema.json';
  const tierPolicyRel = '.memory-bank/workflows/tier-policy.md';
  const executeLoopRel = '.memory-bank/workflows/execute-loop.md';
  const autonomyPolicyRel = '.memory-bank/workflows/autonomy-policy.md';
  const architectRoleRel = '.memory-bank/roles/architect.md';
  const explorerRoleRel = '.memory-bank/roles/explorer.md';
  const implementerRoleRel = '.memory-bank/roles/implementer.md';
  const reviewerRoleRel = '.memory-bank/roles/reviewer.md';
  const lintRel = 'scripts/mb-lint.mjs';
  const doctorRel = 'scripts/mb-doctor.mjs';
  const runtimeSkillRel = '.agents/skills/cold-start/SKILL.md';
  const expectedSchema = readTarget(schemaRel);
  const expectedTierPolicy = readFileSync(tierPolicySource, 'utf8');
  const expectedExecuteLoop = readFileSync(executeLoopSource, 'utf8');
  const expectedAutonomyPolicy = readFileSync(autonomyPolicySource, 'utf8');
  const expectedArchitectRole = readTarget(architectRoleRel);
  const expectedLint = readFileSync(lintSource, 'utf8');
  const expectedDoctor = readFileSync(doctorSource, 'utf8');
  const expectedDoctorModules = new Map(
    doctorModules.map(({ source, target: rel }) => [rel, readFileSync(source, 'utf8')]),
  );
  const expectedRuntimeSkill = readTarget(runtimeSkillRel);
  const skillIndexRel = '.memory-bank/skills/index.md';
  const freshSkillIndex = readTarget(skillIndexRel);
  const agentsSkillNames = runtimeSkillNames(target, '.agents');
  const claudeSkillNames = runtimeSkillNames(target, '.claude');
  const freshSkillRows = installedSkillRows(freshSkillIndex);
  const expectedSkillNames = [...new Set([...agentsSkillNames, ...claudeSkillNames])].sort();
  assert(
    agentsSkillNames.length > 1
      && JSON.stringify(agentsSkillNames) === JSON.stringify(claudeSkillNames),
    'Fresh full bootstrap did not install the same runtime skill set into both surfaces.',
  );
  assert(
    agentsSkillNames.includes('creator-vibe')
      && claudeSkillNames.includes('creator-vibe'),
    'Fresh full bootstrap did not install creator-vibe into both runtime surfaces.',
  );
  assert(
    agentsSkillNames.includes('technical-premortem')
      && claudeSkillNames.includes('technical-premortem'),
    'Fresh full bootstrap did not install technical-premortem into both runtime surfaces.',
  );
  assert(
    JSON.stringify(bootstrappedAgentsSkillNames) === JSON.stringify(agentsSkillNames)
      && JSON.stringify(bootstrappedClaudeSkillNames) === JSON.stringify(claudeSkillNames),
    'Bootstrapped install-only target does not match a fresh full bootstrap runtime set.',
  );
  assert(
    JSON.stringify(freshSkillRows.map(({ name }) => name)) === JSON.stringify(expectedSkillNames)
      && freshSkillRows.every(({ agents, claude }) => agents === 'yes' && claude === 'yes'),
    'Fresh skill registry does not deterministically reflect both runtime surfaces.',
  );
  assert(
    freshSkillIndex.split(installedSkillsBeginMarker).length === 2
      && freshSkillIndex.split(installedSkillsEndMarker).length === 2
      && !freshSkillIndex.includes('## Installed\n- cold-start'),
    'Fresh skill registry is missing its managed inventory boundary.',
  );
  const freshAgents = readTarget('AGENTS.md');
  const expectedDeployableAgents = readFileSync(deployableAgentsSource, 'utf8');
  assert(
    freshAgents === expectedDeployableAgents,
    'Fresh bootstrap AGENTS.md differs from its canonical deployable source.',
  );
  const freshMemoryBankIndex = readTarget('.memory-bank/index.md');
  assert(
    [architectRoleRel, explorerRoleRel, implementerRoleRel, reviewerRoleRel]
      .every((rel) => existsSync(targetPath(rel)))
      && freshMemoryBankIndex.includes('(roles/architect.md)')
      && freshMemoryBankIndex.includes('(roles/explorer.md)')
      && freshMemoryBankIndex.includes('(roles/implementer.md)')
      && freshMemoryBankIndex.includes('(roles/reviewer.md)')
      && !existsSync(targetPath('.memory-bank/roles/worker.md')),
    'Fresh bootstrap did not deploy and index the role contracts.',
  );
  assert(
    readTarget('.agents/skills/debug/SKILL.md')
      === readTarget('.claude/skills/debug/SKILL.md'),
    'Debug deployment differs between runtime surfaces.',
  );

  const structureTemplate = readFileSync(structureTemplateSource, 'utf8');
  assert(
    structureTemplate.includes(installedSkillsBeginMarker)
      && structureTemplate.includes(installedSkillsEndMarker)
      && structureTemplate.includes('deployable/AGENTS.md')
      && !structureTemplate.includes('```markdown\n# Agent Operating Guide'),
    'Structure reference does not document the generated skill inventory boundary.',
  );

  const emptyTarget = join(tempRoot, 'empty-target');
  runInstaller(['--bootstrap-only', '--target', emptyTarget, '--yes']);
  const emptySkillIndexPath = join(emptyTarget, skillIndexRel);
  const emptySkillIndex = readFileSync(emptySkillIndexPath, 'utf8');
  assert(
    installedSkillRows(emptySkillIndex).length === 0
      && runtimeSkillNames(emptyTarget, '.agents').length === 0
      && runtimeSkillNames(emptyTarget, '.claude').length === 0,
    'Bootstrap-only fresh target invented an installed runtime skill.',
  );
  const modifiedLegacyIndex = replaceInstalledBody(
    emptySkillIndex,
    '- cold-start\n- project-only-skill',
  );
  writeFileSync(emptySkillIndexPath, modifiedLegacyIndex, 'utf8');
  const ambiguousSyncOutput = runInstaller([
    '--bootstrap-only',
    '--sync',
    '--target',
    emptyTarget,
    '--yes',
  ]);
  assert(
    readFileSync(emptySkillIndexPath, 'utf8') === modifiedLegacyIndex
      && ambiguousSyncOutput.includes('Installed inventory is unmarked or ambiguous'),
    'Sync overwrote a user-modified unmarked Installed block or omitted its warning.',
    ambiguousSyncOutput,
  );

  const driftTarget = join(tempRoot, 'drift-target');
  runInstaller(['--bootstrap', '--target', driftTarget, '--yes']);
  const driftSkillIndexPath = join(driftTarget, skillIndexRel);
  rmSync(join(driftTarget, '.claude/skills/cold-start/SKILL.md'), { force: true });
  const driftSyncOutput = runInstaller([
    '--bootstrap-only',
    '--sync',
    '--target',
    driftTarget,
    '--yes',
  ]);
  assert(
    readFileSync(driftSkillIndexPath, 'utf8').includes('| <code>cold-start</code> | yes | no |'),
    'Bootstrap-only sync did not expose asymmetric runtime-surface drift.',
    driftSyncOutput,
  );
  const authoredGuidance = '<!-- authored guidance survives legacy migration -->';
  writeFileSync(
    driftSkillIndexPath,
    `${replaceInstalledBody(readFileSync(driftSkillIndexPath, 'utf8'), '- cold-start').trimEnd()}\n\n${authoredGuidance}\n`,
    'utf8',
  );
  const legacySyncOutput = runInstaller(['--bootstrap', '--sync', '--target', driftTarget, '--yes']);
  const migratedSkillIndex = readFileSync(driftSkillIndexPath, 'utf8');
  assert(
    migratedSkillIndex.includes('| <code>cold-start</code> | yes | yes |')
      && migratedSkillIndex.includes(installedSkillsBeginMarker)
      && migratedSkillIndex.includes(authoredGuidance)
      && legacySyncOutput.includes('updated framework-owned block'),
    'Full sync did not migrate the exact legacy block or preserve authored guidance.',
    legacySyncOutput,
  );
  const protocolTemplateNames = readdirSync(protocolSourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const expectedProtocolTemplates = new Map(protocolTemplateNames.map((filename) => [
    filename,
    readFileSync(join(protocolSourceDir, filename), 'utf8'),
  ]));
  const protocolTemplateRel = (filename) => `.memory-bank/templates/protocols/${filename}`;
  const deployedProtocolTemplateNames = readdirSync(
    targetPath('.memory-bank/templates/protocols'),
    { withFileTypes: true },
  )
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  assert(protocolTemplateNames.length > 0, 'Canonical protocol template set is empty.');
  assert(
    JSON.stringify(deployedProtocolTemplateNames) === JSON.stringify(protocolTemplateNames),
    'Fresh bootstrap did not deploy exactly the canonical protocol template filenames.',
  );
  expectedProtocolTemplates.forEach((expected, filename) => {
    assert(
      readTarget(protocolTemplateRel(filename)) === expected,
      `Fresh bootstrap changed protocol template content: ${filename}`,
    );
  });
  assert(
    readTarget(tierPolicyRel) === expectedTierPolicy,
    'Fresh bootstrap did not deploy the canonical tier policy.',
  );
  assert(
    readTarget(executeLoopRel) === expectedExecuteLoop,
    'Fresh bootstrap did not deploy the canonical execute-loop policy.',
  );
  assert(
    readTarget(autonomyPolicyRel) === expectedAutonomyPolicy,
    'Fresh bootstrap did not deploy the canonical autonomy policy.',
  );
  assert(
    readTarget(lintRel) === expectedLint,
    'Fresh bootstrap did not deploy the canonical mb-lint asset.',
  );
  assert(
    readTarget(doctorRel) === expectedDoctor,
    'Fresh bootstrap did not deploy the canonical mb-doctor asset.',
  );
  expectedDoctorModules.forEach((expected, rel) => {
    assert(
      readTarget(rel) === expected,
      `Fresh bootstrap did not deploy the canonical mb-doctor module: ${rel}`,
    );
  });
  const freshDoctorRun = runTargetDoctor();
  let freshDoctorReport;
  try {
    freshDoctorReport = JSON.parse(freshDoctorRun.stdout);
  } catch {
    fail('Fresh deployed mb-doctor did not emit valid JSON.', freshDoctorRun.output);
  }
  assert(
    freshDoctorRun.status === 0
      && freshDoctorRun.stderr === ''
      && freshDoctorReport.status === 'pass'
      && freshDoctorReport.findings.some(({ code }) => code === 'TASK_INDEX_EMPTY'),
    'Fresh deployed mb-doctor did not execute successfully with its packaged modules.',
    freshDoctorRun.output,
  );

  const parsedSchema = JSON.parse(expectedSchema);
  assert(
    JSON.stringify(parsedSchema.properties.status.enum)
      === JSON.stringify(['planned', 'ready', 'in_progress', 'blocked', 'done', 'failed']),
    'Diagnostic recovery changed task lifecycle vocabulary.',
  );
  assert(
    !Object.prototype.hasOwnProperty.call(parsedSchema.properties, 'red_green')
      && !Object.prototype.hasOwnProperty.call(parsedSchema.properties, 'tdd')
      && !Object.prototype.hasOwnProperty.call(parsedSchema.properties, 'testing_queue'),
    'Claim-linked RED/GREEN introduced a task field or second testing model.',
  );
  assert(
    expectedAutonomyPolicy.includes('- max_retries_per_task: 2'),
    'Diagnostic recovery changed max_retries_per_task.',
  );
  assert(
    !Object.prototype.hasOwnProperty.call(parsedSchema.properties, 'owning_slice'),
    'Preferred architecture unexpectedly added owning_slice to the task schema.',
  );
  const runtimeContextSchema = parsedSchema.properties.runtime_context.properties;
  const writeBoundarySchema = runtimeContextSchema.write_boundary.items;
  const aliasBoundarySchema = runtimeContextSchema.allowed_write_scope.items;
  assert(
    writeBoundarySchema.minLength === 1
      && writeBoundarySchema.pattern === aliasBoundarySchema.pattern,
    'Generated task schema does not apply one non-empty path grammar to write_boundary and its alias.',
  );
  assert(
    !Object.prototype.hasOwnProperty.call(runtimeContextSchema.forbidden_scope.items, 'pattern')
      && !Object.prototype.hasOwnProperty.call(runtimeContextSchema.stop_conditions.items, 'pattern'),
    'Generated task schema incorrectly applies path grammar to prose-capable runtime constraints.',
  );

  const boundaryPattern = new RegExp(writeBoundarySchema.pattern, 'u');
  BOUNDARY_CASES.forEach(({ value, valid }) => {
    assert(
      boundaryPattern.test(value) === valid,
      `Generated task schema boundary pattern misclassified ${JSON.stringify(value)}.`,
    );
  });

  writeJsonTarget('.memory-bank/tasks/index.json', {
    version: 1,
    tasks: [{ id: BOUNDARY_TASK_ID, file: `${BOUNDARY_TASK_ID}.task.json` }],
  });
  for (const { value, valid } of BOUNDARY_CASES) {
    writeJsonTarget(BOUNDARY_TASK_REL, boundaryTask({
      write_boundary: [value],
      forbidden_scope: ['deployment and database-owned areas'],
      stop_conditions: ['A public contract decision becomes necessary.'],
    }));
    const result = runTargetLint();
    assert(
      valid ? result.status === 0 : result.status !== 0,
      `Deployed mb-lint boundary validation misclassified ${JSON.stringify(value)}.`,
      result.output,
    );
    if (!valid) {
      assert(
        result.output.includes('runtime_context.write_boundary[0]')
          && result.output.includes('literal project-root-relative POSIX path'),
        `Deployed mb-lint did not give an actionable boundary error for ${JSON.stringify(value)}.`,
        result.output,
      );
    }
  }

  writeJsonTarget(BOUNDARY_TASK_REL, boundaryTask({ allowed_write_scope: ['src/'] }));
  const validAliasLint = runTargetLint();
  assert(
    validAliasLint.status === 0
      && validAliasLint.output.includes('allowed_write_scope is deprecated'),
    'Deployed mb-lint did not preserve the valid deprecated alias with a warning.',
    validAliasLint.output,
  );
  writeJsonTarget(BOUNDARY_TASK_REL, boundaryTask({ allowed_write_scope: ['src/**'] }));
  const invalidAliasLint = runTargetLint();
  assert(
    invalidAliasLint.status !== 0
      && invalidAliasLint.output.includes('runtime_context.allowed_write_scope[0]'),
    'Deployed mb-lint did not apply boundary grammar to the deprecated alias.',
    invalidAliasLint.output,
  );

  writeJsonTarget(BOUNDARY_TASK_REL, boundaryTask({
    write_boundary: [],
    forbidden_scope: ['all deployment changes owned by release engineering'],
    stop_conditions: ['Stop when an operator decision is required.'],
  }));
  const emptyBoundaryLint = runTargetLint();
  assert(
    emptyBoundaryLint.status === 0,
    'Empty boundary or prose runtime constraints were incorrectly rejected.',
    emptyBoundaryLint.output,
  );
  writeJsonTarget('.memory-bank/tasks/index.json', { version: 1, tasks: [] });
  rmSync(targetPath(BOUNDARY_TASK_REL), { force: true });

  const specBackbone = readTarget('.memory-bank/spec-backbone.md');
  assert(
    specBackbone.includes('## Global Backbone Status')
      && specBackbone.includes('- Planning Revision: 0'),
    'Fresh bootstrap spec-backbone does not initialize Planning Revision at 0.',
  );

  const deployedRedVerificationTemplate = readTarget(
    protocolTemplateRel('red-verification-template.md'),
  );
  assert(
    deployedRedVerificationTemplate.includes('## Evidence and adversarial coverage')
      && deployedRedVerificationTemplate.includes('## Admitted findings')
      && deployedRedVerificationTemplate.includes('## Operator questions')
      && !deployedRedVerificationTemplate.includes('## Independently generated hostile model')
      && !deployedRedVerificationTemplate.includes('## Counterproposal / escalation'),
    'Deployed red-verification template still persists private brainstorming or lost its concise evidence shape.',
  );

  const stableTemplatePaths = {
    exe: [
      'compact-run-template.md',
      'context-template.md',
      'plan-template.md',
      'progress-template.md',
      'verification-template.md',
      'handoff-template.md',
    ],
    verify: ['verification-template.md'],
    'red-verify': ['red-verification-template.md'],
  };
  ['.agents/skills', '.claude/skills'].forEach((runtimeRoot) => {
    Object.entries(stableTemplatePaths).forEach(([skill, filenames]) => {
      const runtimeSkill = readTarget(`${runtimeRoot}/${skill}/SKILL.md`);
      filenames.forEach((filename) => {
        assert(
          runtimeSkill.includes(protocolTemplateRel(filename)),
          `${runtimeRoot}/${skill} does not name stable template path for ${filename}.`,
        );
      });
      assert(
        !runtimeSkill.includes('skills/_shared/references/protocols'),
        `${runtimeRoot}/${skill} references a source-only protocol path.`,
      );
    });

  });

  const compactTemplate = expectedProtocolTemplates.get('compact-run-template.md');
  const contextTemplate = expectedProtocolTemplates.get('context-template.md');
  const planTemplate = expectedProtocolTemplates.get('plan-template.md');
  const progressTemplate = expectedProtocolTemplates.get('progress-template.md');
  const handoffTemplate = expectedProtocolTemplates.get('handoff-template.md');
  const verificationTemplate = expectedProtocolTemplates.get('verification-template.md');
  const compactAttemptBlock = compactTemplate.split('## Execution Attempt')[1]?.split('## Goal')[0] || '';
  const contextAttemptBlock = contextTemplate.split('## Execution Attempt')[1]?.split('## Inputs')[0] || '';
  [compactAttemptBlock, contextAttemptBlock].forEach((attemptBlock) => {
    assert(
      attemptBlock.includes('- attempt:')
        && attemptBlock.includes('- started:')
        && !/owner|basis|mode|previous status/i.test(attemptBlock),
      'Tier protocol Execution Attempt is missing neutral metadata or contains provenance/mode fields.',
    );
  });
  const compactManualDecision = compactTemplate.match(/^- manual \/exe decision:.*$/m)?.[0] || '';
  const compactManualBranch = compactTemplate.split('### Manual `/exe`')[1]?.split('### Scheduler')[0] || '';
  const compactSchedulerBranch = compactTemplate.split('### Scheduler')[1] || '';
  assert(
    compactManualDecision.includes('status unchanged|status: done')
      && !/failed|blocked/.test(compactManualDecision)
      && !compactManualBranch.includes('`status: failed`')
      && !compactManualBranch.includes('`status: blocked`'),
    'Compact manual /exe branch still offers failed/blocked lifecycle transitions.',
  );
  assert(
    compactSchedulerBranch.includes('`status: failed`')
      && compactSchedulerBranch.includes('`status: blocked`'),
    'Compact scheduler branch lost failed/blocked lifecycle transitions.',
  );
  assert(
    planTemplate.includes('## Claim-linked RED / GREEN (T2/T3)')
      && planTemplate.includes('- accepted claim locator(s):')
      && progressTemplate.includes('- RED observation and evidence:')
      && progressTemplate.includes('- GREEN observation and evidence:')
      && handoffTemplate.includes('- claim-linked RED/GREEN evidence:')
      && verificationTemplate.includes('- Executor RED/GREEN path:'),
    'Full protocol templates lost claim-linked RED/GREEN fields.',
  );

  const initSource = readFileSync(join(repoRoot, 'skills', '_shared', 'scripts', 'init-mb.js'), 'utf8');
  assert(
    initSource.includes("resolveReferenceFile(AGENTS_TEMPLATE_CATEGORY, AGENTS_TEMPLATE_FILE)")
      && initSource.includes("writeFile('AGENTS.md', agentsGuide(), { ownership: 'framework-owned' })")
      && !initSource.includes("writeFile('AGENTS.md', `# Agent Operating Guide"),
    'AGENTS.md deployment is not sourced exclusively from the canonical Markdown file.',
  );
  assert(
    initSource.includes("listReferenceFilenames('protocols')")
      && !/copyProtocolReference\(['"]/.test(initSource),
    'Protocol template deployment is not driven by generic category enumeration.',
  );

  const lintResult = spawnSync(process.execPath, [targetPath('scripts/mb-lint.mjs')], {
    cwd: target,
    encoding: 'utf8',
  });
  const lintOutput = `${lintResult.stdout || ''}${lintResult.stderr || ''}`;
  assert(lintResult.status === 0, 'Fresh bootstrap mb-lint failed.', lintOutput);
  const staleSchema = JSON.parse(expectedSchema);
  staleSchema.title = 'STALE TARGET TASK SCHEMA';
  writeTarget(schemaRel, `${JSON.stringify(staleSchema, null, 2)}\n`);
  writeTarget(tierPolicyRel, '# stale tier policy\n');
  writeTarget(architectRoleRel, '# stale architect role\n');
  writeTarget(lintRel, '# stale lint asset\n');
  writeTarget(doctorRel, '# stale doctor asset\n');
  const staleDoctorModuleRel = 'scripts/mb-doctor/readers.mjs';
  writeTarget(staleDoctorModuleRel, '# stale doctor module\n');
  writeTarget('AGENTS.md', `${expectedDeployableAgents.trimEnd()}\n\n<!-- stale generated AGENTS.md -->\n`);

  const staleProtocolRel = protocolTemplateRel('compact-run-template.md');
  writeTarget(staleProtocolRel, `${expectedProtocolTemplates.get('compact-run-template.md')}\n<!-- stale protocol template -->\n`);

  const taskProtocolRel = '.protocols/TASK-999-T1-FT-999-W0/run.md';
  mkdirSync(dirname(targetPath(taskProtocolRel)), { recursive: true });
  const taskProtocolState = '# Task-owned resume state\n';
  writeTarget(taskProtocolRel, taskProtocolState);
  const redTaskProtocolRel = '.protocols/TASK-998-T3-FT-999-W0/red-verification.md';
  mkdirSync(dirname(targetPath(redTaskProtocolRel)), { recursive: true });
  const redTaskProtocolState = '# Existing task-owned red-verification state\n';
  writeTarget(redTaskProtocolRel, redTaskProtocolState);

  const projectTemplateRel = protocolTemplateRel('project-notes.md');
  const projectTemplateState = '# Project-owned protocol notes\n';
  writeTarget(projectTemplateRel, projectTemplateState);

  const preservedFiles = new Map();
  [
    '.memory-bank/mbb/index.md',
    '.memory-bank/skills/index.md',
    '.memory-bank/testing/strategy.md',
    '.memory-bank/workflows/index.md',
  ].forEach((rel) => {
    const customized = `${readTarget(rel).trimEnd()}\n\n<!-- project-owned sync smoke marker: ${rel} -->\n`;
    writeTarget(rel, customized);
    preservedFiles.set(rel, customized);
  });

  const customTaskIndex = '{"version":1,"tasks":[]}\n';
  writeTarget('.memory-bank/tasks/index.json', customTaskIndex);
  writeTarget(runtimeSkillRel, `${expectedRuntimeSkill}\n<!-- stale runtime command -->\n`);

  const syncOutput = runInstaller(['--bootstrap', '--sync', '--target', target, '--yes']);
  assert(readTarget(schemaRel) === expectedSchema, 'Full sync did not restore the canonical task schema.', syncOutput);
  assert(readTarget(tierPolicyRel) === expectedTierPolicy, 'Full sync did not restore the canonical tier policy.', syncOutput);
  assert(readTarget(architectRoleRel) === expectedArchitectRole, 'Full sync did not restore the Architect role.', syncOutput);
  assert(readTarget(lintRel) === expectedLint, 'Full sync did not restore the canonical mb-lint asset.', syncOutput);
  assert(readTarget(doctorRel) === expectedDoctor, 'Full sync did not restore the canonical mb-doctor asset.', syncOutput);
  expectedDoctorModules.forEach((expected, rel) => {
    assert(readTarget(rel) === expected, `Full sync did not restore the canonical mb-doctor module: ${rel}`, syncOutput);
  });
  assert(readTarget('AGENTS.md') === expectedDeployableAgents, 'Full sync did not restore the canonical deployable AGENTS.md.', syncOutput);
  assert(readTarget(runtimeSkillRel) === expectedRuntimeSkill, 'Full sync did not restore the canonical runtime command skill.', syncOutput);
  assert(
    readTarget(staleProtocolRel) === expectedProtocolTemplates.get('compact-run-template.md'),
    'Full sync did not restore the canonical protocol template.',
    syncOutput,
  );
  assert(readTarget(taskProtocolRel) === taskProtocolState, 'Full sync overwrote task-owned protocol state.', syncOutput);
  assert(
    readTarget(redTaskProtocolRel) === redTaskProtocolState,
    'Full sync overwrote task-owned red-verification resume state.',
    syncOutput,
  );
  assert(readTarget(projectTemplateRel) === projectTemplateState, 'Full sync pruned a non-canonical project template file.', syncOutput);
  preservedFiles.forEach((expected, rel) => {
    assert(readTarget(rel) === expected, `Full sync overwrote project/mixed file: ${rel}`, syncOutput);
  });
  assert(readTarget('.memory-bank/tasks/index.json') === customTaskIndex, 'Full sync overwrote the project-owned task index.', syncOutput);
  assert(syncOutput.includes('[Sync report]'), 'Full sync did not emit a sync report.', syncOutput);
  assert(syncOutput.includes('updated framework-owned'), 'Full sync did not classify the stale schema as framework-owned update.', syncOutput);
  assert(syncOutput.includes(schemaRel), 'Full sync report did not name the task schema.', syncOutput);
  assert(syncOutput.includes(tierPolicyRel), 'Full sync report did not name the tier policy.', syncOutput);
  assert(syncOutput.includes(architectRoleRel), 'Full sync report did not name the Architect role.', syncOutput);
  assert(syncOutput.includes(lintRel), 'Full sync report did not name the mb-lint asset.', syncOutput);
  assert(syncOutput.includes(doctorRel), 'Full sync report did not name the mb-doctor asset.', syncOutput);
  assert(syncOutput.includes(staleDoctorModuleRel), 'Full sync report did not name the stale mb-doctor module.', syncOutput);
  assert(syncOutput.includes(staleProtocolRel), 'Full sync report did not name the protocol template.', syncOutput);
  assert(syncOutput.includes('kept project/mixed'), 'Full sync did not report preserved project/mixed files.', syncOutput);

  const secondSyncOutput = runInstaller(['--bootstrap', '--sync', '--target', target, '--yes']);
  assert(secondSyncOutput.includes('unchanged framework-owned'), 'Idempotent sync did not classify identical framework assets as unchanged.', secondSyncOutput);
  assert(readTarget(schemaRel) === expectedSchema, 'Idempotent sync changed the canonical task schema.', secondSyncOutput);
  assert(readTarget(tierPolicyRel) === expectedTierPolicy, 'Idempotent sync changed the canonical tier policy.', secondSyncOutput);
  assert(readTarget(architectRoleRel) === expectedArchitectRole, 'Idempotent sync changed the Architect role.', secondSyncOutput);
  assert(readTarget(lintRel) === expectedLint, 'Idempotent sync changed the canonical mb-lint asset.', secondSyncOutput);
  assert(readTarget(doctorRel) === expectedDoctor, 'Idempotent sync changed the canonical mb-doctor asset.', secondSyncOutput);
  expectedDoctorModules.forEach((expected, rel) => {
    assert(readTarget(rel) === expected, `Idempotent sync changed the canonical mb-doctor module: ${rel}`, secondSyncOutput);
  });
  assert(readTarget('AGENTS.md') === expectedDeployableAgents, 'Idempotent sync changed the canonical deployable AGENTS.md.', secondSyncOutput);
  expectedProtocolTemplates.forEach((expected, filename) => {
    assert(
      readTarget(protocolTemplateRel(filename)) === expected,
      `Idempotent sync changed protocol template: ${filename}`,
      secondSyncOutput,
    );
  });
  assert(readTarget(taskProtocolRel) === taskProtocolState, 'Idempotent sync changed task-owned protocol state.', secondSyncOutput);
  assert(
    readTarget(redTaskProtocolRel) === redTaskProtocolState,
    'Idempotent sync changed task-owned red-verification resume state.',
    secondSyncOutput,
  );
  assert(readTarget(projectTemplateRel) === projectTemplateState, 'Idempotent sync changed a project template file.', secondSyncOutput);
  preservedFiles.forEach((expected, rel) => {
    assert(readTarget(rel) === expected, `Idempotent sync changed project/mixed file: ${rel}`, secondSyncOutput);
  });

  writeTarget(runtimeSkillRel, `${expectedRuntimeSkill}\n<!-- bootstrap-only repair must keep this -->\n`);
  writeTarget(schemaRel, `${JSON.stringify(staleSchema, null, 2)}\n`);
  const repairProtocolRel = protocolTemplateRel('red-verification-template.md');
  writeTarget(repairProtocolRel, '# stale red verification template\n');
  const repairOutput = runInstaller(['--bootstrap-only', '--sync', '--target', target, '--yes']);
  assert(readTarget(schemaRel) === expectedSchema, 'Bootstrap-only repair did not restore the framework-owned task schema.', repairOutput);
  assert(
    readTarget(repairProtocolRel) === expectedProtocolTemplates.get('red-verification-template.md'),
    'Bootstrap-only repair did not restore the framework-owned protocol template.',
    repairOutput,
  );
  assert(readTarget(runtimeSkillRel).includes('bootstrap-only repair must keep this'), 'Bootstrap-only repair unexpectedly updated runtime command skills.', repairOutput);
  assert(repairOutput.includes('repairs Memory Bank managed assets only'), 'Bootstrap-only repair did not warn that runtime command skills remain unchanged.', repairOutput);

  console.log('install sync regression smoke passed');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
