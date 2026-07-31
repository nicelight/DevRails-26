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
const coldStartCommandSource = join(commandSourceDir, 'cold-start.md');
const mbInitCommandSource = join(commandSourceDir, 'mb-init.md');
const creatorVibeCommandSource = join(commandSourceDir, 'creator-vibe.md');
const technicalPremortemCommandSource = join(commandSourceDir, 'technical-premortem.md');
const debugCommandSource = join(commandSourceDir, 'debug.md');
const coldStartPackageSource = join(repoRoot, 'skills', 'cold-start', 'SKILL.md');
const mbInitPackageSource = join(repoRoot, 'skills', 'mb-init', 'SKILL.md');
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

function normalizeProse(content) {
  return content.replace(/\s+/g, ' ').trim();
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

  const coldStartSources = [coldStartCommandSource, coldStartPackageSource]
    .map((source) => readFileSync(source, 'utf8'));
  coldStartSources.forEach((source) => {
    assert(
      source.includes(fullBootstrapRoute)
        && !source.includes(skeletonBootstrapRoute)
        && source.includes('DevRails runtime command'),
      'A cold-start source does not expose the full command-set bootstrap recovery route.',
    );
  });

  const mbInitSources = [mbInitCommandSource, mbInitPackageSource]
    .map((source) => readFileSync(source, 'utf8'));
  mbInitSources.forEach((source) => {
    assert(
      source.includes(skeletonBootstrapRoute)
        && source.includes('only when its `SKILL.md` exists')
        && source.includes('do not claim `/cold-start` is available')
        && source.includes('Runtime command installation')
        && source.includes('explicit external installer action'),
      'An mb-init source lost skeleton-only bootstrap or its installed-skill handoff guard.',
    );
  });

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
      migratedSkill.includes('Generated by DevRails 26 install-framework.mjs')
        && migratedSkill.includes('Independently verify one task outcome'),
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
  const expectedExplorerRole = readTarget(explorerRoleRel);
  const expectedImplementerRole = readTarget(implementerRoleRel);
  const expectedReviewerRole = readTarget(reviewerRoleRel);
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
      && freshSkillIndex.includes('## Guidance for installed skills')
      && freshSkillIndex.includes('отмеченного как `yes` в активной runtime surface')
      && !freshSkillIndex.includes('## Installed\n- cold-start'),
    'Fresh skill registry is missing its managed inventory boundary or conditional guidance.',
  );
  const freshAgents = readTarget('AGENTS.md');
  const expectedDeployableAgents = readFileSync(deployableAgentsSource, 'utf8');
  const normalizedFreshAgents = normalizeProse(freshAgents);
  assert(
    freshAgents === expectedDeployableAgents,
    'Fresh bootstrap AGENTS.md differs from its canonical deployable source.',
  );
  assert(
    freshAgents.includes(
      'Treat `creator-vibe` as the persistent interpretive lens for every user message, before classifying the task or acting on its literal wording.',
    )
      && freshAgents.includes(
        'When success materially depends on taste, voice, human experience, or unstated choices, load and follow the installed `creator-vibe` skill before narrower skills.',
      )
      && freshAgents.includes(
        'Do not explain this interpretation back to the user unless asked. Let it show in the work.',
      ),
    'Fresh bootstrap AGENTS.md lost the persistent Creator Vibe Lens.',
  );
  assert(
    normalizedFreshAgents.includes(
      'Treat `package/workspace/code root + directories + complete filename` as one context surface for project-authored source.',
    )
      && normalizedFreshAgents.includes(
        'Filesystem paths, import/module paths, package exports, URLs/routes, and build targets are distinct executable identities',
      )
      && normalizedFreshAgents.includes(
        'Do not opportunistically rename brownfield source.',
      ),
    'Fresh bootstrap AGENTS.md does not expose the source-path semantics policy.',
  );
  const freshMemoryBankIndex = readTarget('.memory-bank/index.md');
  const deployedOrchestratorRole = readTarget('.memory-bank/roles/orchestrator.md');
  assert(
    expectedArchitectRole.includes('# ROLE: ARCHITECT')
      && expectedArchitectRole.includes('Every ARCHITECT response starts with `ROLE: ARCHITECT`.')
      && freshMemoryBankIndex.includes('(roles/architect.md): Architect role contract.'),
    'Fresh bootstrap did not deploy or index the Architect role.',
  );
  assert(
    expectedExplorerRole.includes('# ROLE: Explorer')
      && expectedImplementerRole.includes('# ROLE: Implementer')
      && expectedReviewerRole.includes('# ROLE: Reviewer')
      && freshMemoryBankIndex.includes('(roles/explorer.md): Explorer role contract.')
      && freshMemoryBankIndex.includes('(roles/implementer.md): Implementer role contract.')
      && freshMemoryBankIndex.includes('(roles/reviewer.md): Reviewer role contract.')
      && !existsSync(targetPath('.memory-bank/roles/worker.md')),
    'Fresh bootstrap did not deploy the independent delegated role contracts.',
  );
  assert(
    normalizedFreshAgents.includes(
      'serious problem is not covered by an accepted requirement: do not expand the target; ask the operator;',
    )
      && normalizedFreshAgents.includes(
        'Do not report speculative observations that were rejected before becoming real candidates. Always report evidenced defects and any issue affecting the requested verdict.',
      )
      && freshAgents.includes(
        'If ROLE: ARCHITECT, read `.memory-bank/roles/architect.md`.',
      )
      && freshAgents.includes('If ROLE: Explorer, read `.memory-bank/roles/explorer.md`.')
      && freshAgents.includes('If ROLE: Implementer, read `.memory-bank/roles/implementer.md`.')
      && freshAgents.includes('If ROLE: Reviewer, read `.memory-bank/roles/reviewer.md`.')
      && freshAgents.includes(
        'Delegated Explorer, Implementer, and Reviewer analyze the consequences of their\nwork and report potential or evident problems.',
      ),
    'Fresh AGENTS.md lost Architect priming or the general KISS gate.',
  );
  assert(
    deployedOrchestratorRole.includes(
      'ORCHESTRATOR may delegate Architect for architecture/specification design or dedicated proposal preflight of a material architecture finding, design element, or proposed correction.',
    )
      && deployedOrchestratorRole.includes('Read .memory-bank/roles/explorer.md')
      && deployedOrchestratorRole.includes('Read .memory-bank/roles/implementer.md')
      && deployedOrchestratorRole.includes('Read .memory-bank/roles/reviewer.md'),
    'Deployed Orchestrator role lost the explicit Architect delegation route.',
  );
  ['.agents/skills', '.claude/skills'].forEach((runtimeRoot) => {
    const deployedColdStart = readTarget(`${runtimeRoot}/cold-start/SKILL.md`);
    const deployedMbInit = readTarget(`${runtimeRoot}/mb-init/SKILL.md`);
    const deployedCreatorVibe = readTarget(`${runtimeRoot}/creator-vibe/SKILL.md`);
    const deployedTechnicalPremortem = readTarget(`${runtimeRoot}/technical-premortem/SKILL.md`);
    const deployedDebug = readTarget(`${runtimeRoot}/debug/SKILL.md`);
    const deployedArchitectureReview = readTarget(`${runtimeRoot}/architecture-review/SKILL.md`);
    const deployedKissArchitect = readTarget(`${runtimeRoot}/kiss-architect/SKILL.md`);
    const deployedReviewTasksPlan = readTarget(`${runtimeRoot}/review-tasks-plan/SKILL.md`);
    const normalizedKissArchitect = normalizeProse(deployedKissArchitect);
    assert(
      deployedColdStart.includes(fullBootstrapRoute)
        && !deployedColdStart.includes(skeletonBootstrapRoute),
      `${runtimeRoot}/cold-start lost the full bootstrap recovery route during deployment.`,
    );
    assert(
      deployedCreatorVibe.includes(readFileSync(creatorVibeCommandSource, 'utf8').trim()),
      `${runtimeRoot}/creator-vibe differs from its canonical project-level source.`,
    );
    assert(
      deployedTechnicalPremortem.includes(
        readFileSync(technicalPremortemCommandSource, 'utf8').trim(),
      )
        && deployedTechnicalPremortem.startsWith(
          '---\nname: technical-premortem\ndescription: "Технический pre-mortem запланированного изменения.',
        ),
      `${runtimeRoot}/technical-premortem differs from its canonical source or lost its semantic trigger.`,
    );
    assert(
      deployedDebug.includes(readFileSync(debugCommandSource, 'utf8').trim()),
      `${runtimeRoot}/debug differs from its canonical project-level source.`,
    );
    assert(
      deployedMbInit.includes(skeletonBootstrapRoute)
        && deployedMbInit.includes('only when its `SKILL.md` exists')
        && deployedMbInit.includes('do not claim `/cold-start` is available'),
      `${runtimeRoot}/mb-init lost skeleton-only bootstrap or its installed-skill handoff guard.`,
    );
    assert(
      normalizedKissArchitect.includes('.memory-bank/roles/architect.md')
        && normalizedKissArchitect.includes('Keep the active role, scope, permissions, and mutation authority unchanged.')
        && normalizedKissArchitect.includes(
          'every architecture finding, design element, or proposed correction entering an operator response or canonical artifact has passed the Architect proposal preflight',
        )
        && normalizedKissArchitect.includes('both supplied and agent-generated architecture candidates')
        && normalizedKissArchitect.includes('no correction was evaluated only as a local patch')
        && normalizedKissArchitect.includes('installed skill that owns those artifacts')
        && !deployedKissArchitect.includes('skills/_shared/'),
      `${runtimeRoot}/kiss-architect lost its proposal-preflight, authority, or owning-skill contract.`,
    );
    assert(
      deployedArchitectureReview.includes('1. C4 L1-L3')
        && deployedArchitectureReview.includes('product/system purpose and actors')
        && deployedArchitectureReview.includes('relevant epic/subsystem boundaries and value')
        && deployedArchitectureReview.includes('target feature/module responsibilities and dependencies')
        && deployedArchitectureReview.includes(
          'their absence is valid when canonical evidence shows none applies to the\nreviewed feature',
        )
        && deployedArchitectureReview.includes('verdict: APPROVE|REQUEST_CHANGES|OWNER_DECISION_NEEDED')
        && deployedArchitectureReview.includes('`/review-tasks-plan` owns its')
        && deployedArchitectureReview.includes('Create no separate report artifact.'),
      `${runtimeRoot}/architecture-review lost its bounded C4 or Reviewer-verdict contract.`,
    );
    assert(
      deployedReviewTasksPlan.includes('one bounded architecture review per reviewed feature from a fresh\n  Reviewer')
        && deployedReviewTasksPlan.includes('installed `/architecture-review` skill')
        && deployedReviewTasksPlan.includes('.memory-bank/roles/reviewer.md')
        && deployedReviewTasksPlan.includes('If fresh\n  delegation is unavailable or fails, perform the same review locally.')
        && deployedReviewTasksPlan.includes('Return exactly `APPROVE` or `REJECT` with evidence'),
      `${runtimeRoot}/review-tasks-plan lost its bounded Reviewer delegation or verdict ownership.`,
    );
  });
  assert(
    readTarget('.agents/skills/debug/SKILL.md')
      === readTarget('.claude/skills/debug/SKILL.md'),
    'Debug deployment differs between runtime surfaces.',
  );

  const structureTemplate = readFileSync(structureTemplateSource, 'utf8');
  assert(
    structureTemplate.includes(installedSkillsBeginMarker)
      && structureTemplate.includes(installedSkillsEndMarker)
      && structureTemplate.includes('explicit empty state')
      && structureTemplate.includes('deployable/AGENTS.md')
      && structureTemplate.includes('Use a subject spec only for a non-trivial\n  reproducible measurement method or expert rubric')
      && !structureTemplate.includes('```markdown\n# Agent Operating Guide'),
    'Structure reference does not document the generated skill inventory boundary.',
  );

  const emptyTarget = join(tempRoot, 'empty-target');
  runInstaller(['--bootstrap-only', '--target', emptyTarget, '--yes']);
  const emptySkillIndexPath = join(emptyTarget, skillIndexRel);
  const emptySkillIndex = readFileSync(emptySkillIndexPath, 'utf8');
  assert(
    installedSkillRows(emptySkillIndex).length === 0
      && emptySkillIndex.includes('No runtime skills detected')
      && !emptySkillIndex.includes('- cold-start')
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
  const deployedAutonomyPolicy = normalizeProse(readTarget(autonomyPolicyRel));
  assert(
    deployedAutonomyPolicy.includes(
      'Runtime observations, production code, and mapped baseline may establish current behavior, constraints, and compatibility or migration evidence; they do not authorize a new target architecture, contract, data ownership, or migration route.',
    )
      && deployedAutonomyPolicy.includes(
        'A difference between current state and an accepted target is a reconciliation delta, not an authority conflict.',
      )
      && !deployedAutonomyPolicy.includes(
        'accepted operator policy/decision, production baseline',
      ),
    'Deployed autonomy policy does not separate current evidence from target authority.',
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
      === JSON.stringify(['planned', 'ready', 'in_progress', 'blocked', 'done', 'failed'])
      && !expectedSchema.includes('"diagnose"'),
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
  const normalizedTierPolicy = normalizeProse(expectedTierPolicy);
  assert(
    normalizedTierPolicy.includes(
      '`max_retries_per_task: 2` permits the initial attempt plus two retries.',
    )
      && normalizedTierPolicy.includes(
        'Automatic `diagnose` applies only to `/autopilot` product tasks',
      )
      && normalizedTierPolicy.includes(
        'durable failure evidence supports neither a safe same-task correction nor an evidence-based disposition.',
      )
      && normalizedTierPolicy.includes(
        'an inconclusive mapping before the third unsuccessful attempt keeps `in_progress`',
      )
      && normalizedTierPolicy.includes(
        'For `/autopilot` product tasks, route task slicing, tier, or direct task spec to `/feature-to-tasks FT-<NNN>`',
      )
      && normalizedTierPolicy.includes(
        'After the third unsuccessful attempt no fourth is permitted.',
      )
      && !expectedTierPolicy.includes('Architect reassessment')
      && !expectedTierPolicy.includes('ARCHITECTURE_ASSESSMENT:'),
    'Deployed tier policy lost retry counting, diagnostic routing, or early disposition.',
  );
  assert(
    normalizedTierPolicy.includes(
      'After `ready -> in_progress`, the initial attempt obtains honest pre-implementation RED',
    )
      && normalizedTierPolicy.includes(
        'retains the original durable RED when one exists',
      )
      && normalizedTierPolicy.includes(
        'Pre-implementation GREEN preserves the evidence and avoids production changes for that claim',
      )
      && normalizedTierPolicy.includes(
        '`/exe` completes any remaining accepted task outcome, then returns the same ordinary `/exe` handoff to `/verify`.',
      )
      && normalizedTierPolicy.includes(
        '`/verify` independently proves the current task outcome.',
      )
      && normalizedTierPolicy.includes(
        'Pre-implementation GREEN alone is neither PASS nor `NEEDS-CLARIFICATION`.',
      )
      && normalizedTierPolicy.includes(
        '`/red-verify` keeps its hostile semantic role.',
      )
      && normalizedTierPolicy.includes(
        'No task field, status, scheduler stage, verdict, protocol family, queue, registry, or lifecycle is added.',
      ),
    'Deployed tier policy lost the in-stage RED/GREEN, independent verification, or no-new-lifecycle contract.',
  );
  assert(
    normalizedTierPolicy.includes(
      'Compact changes protocol depth, not task-scoped acceptance obligations.',
    )
      && normalizedTierPolicy.includes(
        'A newly created or reconciled `planned|ready` task that proves a material NFR has non-empty values in both',
      )
      && normalizedTierPolicy.includes(
        'Human/expert review is an evidence method, not a T3 human checkpoint.',
      ),
    'Deployed tier policy lost all-tier material-NFR evidence or compact-depth semantics.',
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
  const freshTestingStrategy = normalizeProse(
    readTarget('.memory-bank/testing/strategy.md'),
  );
  assert(
    specBackbone.includes('## Global Backbone Status')
      && specBackbone.includes('- Planning Revision: 0'),
    'Fresh bootstrap spec-backbone does not initialize Planning Revision at 0.',
  );
  assert(
    freshTestingStrategy.includes(
      'one project-level database contract owns dynamic checks for a single head, no branches, and intact ancestry',
    )
      && freshTestingStrategy.includes(
        'A feature migration test owns only its revision, direct `down_revision`, upgrade/downgrade, schema transition, and data preservation.',
      )
      && freshTestingStrategy.includes(
        'it does not require literal current-head consumers or historical feature-test updates',
      )
      && freshTestingStrategy.includes(
        'Keep product quality targets in requirements/features and simple verification methods in feature AC/task records.',
      )
      && freshTestingStrategy.includes(
        'Use a subject spec only for a non-trivial reproducible measurement method or expert rubric; it never supplies a missing product target.',
      ),
    'Fresh bootstrap testing strategy lost migration ownership or the material-quality measurement boundary.',
  );
  assert(
    readTarget('AGENTS.md').includes('Product execution requires task-plan `APPROVE` for the current positive Global')
      && readTarget('AGENTS.md').includes('`/feature-to-tasks --all` -> `/review-tasks-plan --all`'),
    'Fresh bootstrap AGENTS.md does not expose the global planning-revision invalidation route.',
  );

  ['.agents/skills', '.claude/skills'].forEach((runtimeRoot) => {
    const doctorSkill = readTarget(`${runtimeRoot}/mb-doctor/SKILL.md`);
    const redVerifySkill = readTarget(`${runtimeRoot}/red-verify/SKILL.md`);
    assert(
      doctorSkill.includes('Every non-empty indexed queue requires the current `.memory-bank/foundation.md`')
        && doctorSkill.includes('no other\n  `FT-000` record remains `planned|ready|in_progress|blocked`')
        && doctorSkill.includes('`FEATURE_ACCEPTANCE_UNCOVERED` in `--strict`')
        && doctorSkill.includes('`TASK_ACCEPTANCE_PROOF_MISSING` in `--strict`')
        && doctorSkill.includes('Historical terminal tasks without\n  the prospective contract remain exempt.'),
      `${runtimeRoot}/mb-doctor does not expose the complete Foundation readiness contract.`,
    );
    assert(
      redVerifySkill.includes('Zero reportable findings is a normal result')
        && redVerifySkill.includes('Generate and assess hostile hypotheses privately.')
        && redVerifySkill.includes('Direct DB/filesystem mutation is only setup for a reportable defect')
        && redVerifySkill.includes('`semantic-pass` requires no finding, risk list, or')
        && !redVerifySkill.includes('- independently generated hostile model and probes;'),
      `${runtimeRoot}/red-verify lost its KISS finding-admission or zero-finding contract.`,
    );
  });

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

    const autonomousSkill = readTarget(`${runtimeRoot}/autonomous/SKILL.md`);
    const debugSkill = readTarget(`${runtimeRoot}/debug/SKILL.md`);
    const exeSkill = readTarget(`${runtimeRoot}/exe/SKILL.md`);
    const autopilotSkill = readTarget(`${runtimeRoot}/autopilot/SKILL.md`);
    const writePrdSkill = readTarget(`${runtimeRoot}/write-prd/SKILL.md`);
    const prdToFeaturesSkill = readTarget(`${runtimeRoot}/prd-to-features/SKILL.md`);
    const featureDoctorSkill = readTarget(`${runtimeRoot}/feature-doctor/SKILL.md`);
    const reviewFeatPlanSkill = readTarget(`${runtimeRoot}/review-feat-plan/SKILL.md`);
    const mapCodebaseSkill = readTarget(`${runtimeRoot}/map-codebase/SKILL.md`);
    const specAutoSkill = readTarget(`${runtimeRoot}/spec-auto/SKILL.md`);
    const specDesignSkill = readTarget(`${runtimeRoot}/spec-design/SKILL.md`);
    const foundationToTasksSkill = readTarget(`${runtimeRoot}/foundation-to-tasks/SKILL.md`);
    const featureToTasksSkill = readTarget(`${runtimeRoot}/feature-to-tasks/SKILL.md`);
    const architectureReviewSkill = readTarget(`${runtimeRoot}/architecture-review/SKILL.md`);
    const reviewTasksPlanSkill = readTarget(`${runtimeRoot}/review-tasks-plan/SKILL.md`);
    const redVerifySkill = readTarget(`${runtimeRoot}/red-verify/SKILL.md`);
    const verifySkill = readTarget(`${runtimeRoot}/verify/SKILL.md`);
    const normalizedAutonomous = normalizeProse(autonomousSkill);
    const normalizedDebug = normalizeProse(debugSkill);
    const normalizedExe = normalizeProse(exeSkill);
    const normalizedAutopilot = normalizeProse(autopilotSkill);
    const normalizedWritePrd = normalizeProse(writePrdSkill);
    const normalizedPrdToFeatures = normalizeProse(prdToFeaturesSkill);
    const normalizedFeatureDoctor = normalizeProse(featureDoctorSkill);
    const normalizedReviewFeatPlan = normalizeProse(reviewFeatPlanSkill);
    const normalizedMapCodebase = normalizeProse(mapCodebaseSkill);
    const normalizedSpecAuto = normalizeProse(specAutoSkill);
    const normalizedSpecDesign = normalizeProse(specDesignSkill);
    const normalizedFoundationToTasks = normalizeProse(foundationToTasksSkill);
    const normalizedFeatureToTasks = normalizeProse(featureToTasksSkill);
    const normalizedArchitectureReview = normalizeProse(architectureReviewSkill);
    const normalizedReviewTasksPlan = normalizeProse(reviewTasksPlanSkill);
    const normalizedRedVerify = normalizeProse(redVerifySkill);
    const normalizedVerify = normalizeProse(verifySkill);
    assert(
      autonomousSkill.includes('return `HALT_POLICY_VIOLATION` in the command\nresponse only')
        && autonomousSkill.includes('leave any existing\n`.protocols/AUTONOMOUS-RUN/*` untouched')
        && autonomousSkill.includes('After required-workflow preflight passes and the run protocol exists')
        && autonomousSkill.includes('The missing-workflow branch above is response-only'),
      `${runtimeRoot}/autonomous does not preserve the response-only pre-protocol halt boundary.`,
    );
    assert(
      exeSkill.includes('The caller has already selected this task.')
        && exeSkill.includes('`/exe` owns `ready -> in_progress`')
        && normalizedExe.includes(
          'Do not add owner, invocation-basis, or mode metadata to the attempt.',
        ),
      `${runtimeRoot}/exe does not expose caller-selected, provenance-free task start ownership.`,
    );
    assert(
      autopilotSkill.includes('checkpoint the selected task at\n   `execute`')
        && autopilotSkill.includes('invoke `/exe`; `/exe`\n   prepares/reconciles the tier protocol and writes `ready -> in_progress`')
        && !autopilotSkill.includes('task at `selection`, then write `ready -> in_progress`'),
      `${runtimeRoot}/autopilot still owns the selected task start transition.`,
    );
    assert(
      normalizedDebug.includes(
        '.tasks/<TASK_ID>/<TASK_ID>-S-DEBUG-final-report-docs-01.md',
        )
        && normalizedDebug.includes('DIAGNOSIS: CONFIRMED|INCONCLUSIVE')
        && (debugSkill.match(/DIAGNOSIS: CONFIRMED\|INCONCLUSIVE/g) || []).length === 1
        && normalizedDebug.includes(
          "The only allowed write is this command's report under `.tasks/<TASK_ID>/`.",
        )
        && normalizedDebug.includes(
          'Read the indexed task card, direct task-linked specs, current-attempt protocol and handoff, functional/semantic verdict evidence, actual changes',
        )
        && normalizedDebug.includes(
          'Do not issue functional/semantic verdicts, accept product/spec/architecture decisions, implement a correction, or create BUG/follow-up work.',
        )
        && normalizedDebug.includes(
          'A probe may mutate only known local isolated or disposable state with safe rerun and cleanup.',
        )
        && normalizedDebug.includes(
          'A report for an older attempt does not satisfy the current-attempt output.',
        )
        && !/VERDICT: (?:PASS|FAIL|NEEDS-CLARIFICATION)/.test(debugSkill)
        && !debugSkill.includes('skills/_shared/'),
      `${runtimeRoot}/debug lost its report-only authority, safe-probe, marker, or resume contract.`,
    );
    assert(
      normalizedAutopilot.includes(
        '`selection|execute|verify|red-verify|diagnose|closure|wave-boundary`',
      )
        && normalizedAutopilot.includes(
          'Apply `## Scheduler Failure Handling` in `.memory-bank/workflows/tier-policy.md`.',
        )
        && normalizedAutopilot.includes(
          'failure evidence supports neither a safe task-local correction nor disposition',
        )
        && normalizedAutopilot.includes(
          '.tasks/<TASK_ID>/<TASK_ID>-S-DEBUG-final-report-docs-01.md',
        )
        && normalizedAutopilot.includes(
          'then invoke `/debug <TASK_ID>` in a fresh child context.',
        )
        && normalizedAutopilot.includes(
          'reuse only a matching current-attempt report; never replay an ambiguously completed mutating probe.',
        )
        && normalizedAutopilot.includes(
          'Then apply the policy-owned retry, disposition, or evidence-owner halt. `/debug` does not add retry capacity.',
        )
        && normalizedAutopilot.includes(
          'If count or child completion cannot be proved, preserve `in_progress`',
        )
        && !autopilotSkill.includes('S-ARCH-REASSESSMENT')
        && !autopilotSkill.includes('ARCHITECTURE_ASSESSMENT:')
        && !autopilotSkill.includes('Architect reassessment')
        && !autopilotSkill.includes('HALT_DEBUG_REQUIRED'),
      `${runtimeRoot}/autopilot lost compact diagnostic recovery or retained Architect escalation.`,
    );
    assert(
      normalizedExe.includes('may recommend a separate fresh `/debug <TASK_ID>`')
        && normalizedExe.includes('`/exe` never invokes `/debug`.')
        && normalizedVerify.includes('`/verify` never invokes `/debug`.')
        && normalizedVerify.includes('the debug report cannot replace verifier-owned functional proof'),
      `${runtimeRoot} execution or verification gained debug authority or lost evidence adequacy.`,
    );
    assert(
      normalizedFoundationToTasks.includes(
        'uses existing `evidence_required` and direct links to map `REQ-000` or an exact canonical spec claim to a prospective pre-implementation probe',
      )
        && normalizedFeatureToTasks.includes(
          'uses existing `evidence_required` plus direct task links to make one prospective claim-linked RED/GREEN path legible',
        )
        && normalizedReviewTasksPlan.includes(
          'a RED caused by absence of that claim rather than syntax/setup/artificial damage, and GREEN for the same claim',
        )
        && normalizedReviewTasksPlan.includes(
          'Do not reject historical `in_progress|done|failed` records solely because they predate this prospective RED/GREEN planning contract',
        ),
      `${runtimeRoot} planning or fresh review lost prospective claim-linked RED/GREEN coverage.`,
    );
    assert(
      normalizedPrdToFeatures.includes(
        'Product feature acceptance criteria use stable `FT-<NNN>-AC-<NNN>` IDs.',
      )
        && normalizedFeatureDoctor.includes(
          'Preserve stable `FT-<NNN>-AC-<NNN>` IDs when accepted behavior is unchanged.',
        )
        && normalizedReviewFeatPlan.includes(
          'stable unique `FT-<NNN>-AC-<NNN>` IDs under each feature',
        )
        && normalizedFeatureToTasks.includes(
          '.memory-bank/features/FT-<NNN>-<slug>.md#FT-<NNN>-AC-<NNN>',
        )
        && normalizedFeatureToTasks.includes(
          'repeats its exact `FT-<NNN>-AC-<NNN>` ID in a concrete `verification_targets` probe',
        )
        && normalizedReviewTasksPlan.includes(
          'every accepted product AC has one stable feature-matching `FT-<NNN>-AC-<NNN>` heading',
        ),
      `${runtimeRoot} stable acceptance identity or task trace was not deployed end to end.`,
    );
    assert(
      normalizedWritePrd.includes(
        'Never invent or silently interpret a material target or pass/fail parameter.',
      )
        && normalizedPrdToFeatures.includes(
          'acceptance closure for every material product outcome',
        )
        && normalizedFeatureToTasks.includes(
          'Before task emission or reconciliation, run one bounded acceptance-closure scan',
        )
        && normalizedFeatureToTasks.includes(
          'every newly created or reconciled `planned|ready` task at any tier that proves a material NFR',
        )
        && normalizedReviewTasksPlan.includes(
          'every newly created or reconciled `planned|ready` task at any tier that proves a material NFR',
        )
        && normalizedReviewTasksPlan.includes(
          '.memory-bank/workflows/execute-loop.md#principle-no-task-explosion',
        )
        && normalizedExe.includes(
          'Compact changes protocol depth, not acceptance-evidence obligations',
        ),
      `${runtimeRoot} lost an owning Acceptance Closure contract.`,
    );
    assert(
      normalizedExe.includes(
        'Before the first prospective T2/T3 probe, implementation, or external side effect',
      )
        && normalizedExe.includes(
          'on the initial attempt, a mapped claim receives honest claim-specific RED',
        )
        && normalizedExe.includes(
          'Pre-implementation GREEN preserves the evidence and avoids production changes for that claim',
        )
        && normalizedExe.includes(
          'retain the original durable RED when one exists, bind the new attempt to the failed gate evidence and correction',
        )
        && normalizedExe.includes(
          'complete any remaining accepted task outcome instead of routing early merely because no claim remains RED',
        )
        && normalizedExe.includes(
          'it grants no broader permission or lifecycle authority.',
        )
        && normalizedExe.includes(
          'These labels are execution evidence, not `VERDICT` or `SEMANTIC_VERDICT` markers.',
        )
        && normalizedVerify.includes(
          'Executor claim-path evidence linked by the current attempt is supporting',
        )
        && normalizedVerify.includes(
          'a pre-implementation GREEN claim records that the planned probe passed before its production behavior changed',
        )
        && normalizedVerify.includes(
          'These variants do not change verdict semantics. Independently prove the current task outcome.',
        )
        && normalizedVerify.includes(
          'Fresh verifier-owned outcome evidence remains required; executor GREEN alone cannot satisfy PASS.',
        )
        && normalizedAutopilot.includes(
          'current forward `/exe` handoff routing to `/verify` but no functional verdict',
        )
        && normalizedAutopilot.includes(
          'an `/exe` handoff naming a blocker or repair owner',
        )
        && normalizedRedVerify.includes(
          '`/verify` owns functional evidence. `/red-verify` owns semantic evidence',
        ),
      `${runtimeRoot} execution/verification lost honest RED, safe T3, or independent-verifier ownership.`,
    );
    assert(
      specDesignSkill.includes('- Planning Revision: <non-negative integer>')
        && specDesignSkill.includes('increment the revision exactly once')
        && specDesignSkill.includes('`/feature-to-tasks --all`, `/review-tasks-plan --all`'),
      `${runtimeRoot}/spec-design does not expose the global planning-revision rerun contract.`,
    );
    assert(
      normalizedSpecDesign.includes('Normative target authority is:')
        && normalizedSpecDesign.includes('As-is evidence strength is:')
        && normalizedSpecDesign.includes(
          'A current/target difference is a planning delta, not an authority conflict.',
        )
        && !normalizedSpecDesign.includes('Source precedence is:')
        && !normalizedSpecDesign.includes(
          'existing production code and authoritative brownfield baseline',
        ),
      `${runtimeRoot}/spec-design does not separate current evidence from target authority.`,
    );
    assert(
      normalizedSpecDesign.includes(
        'first recommend one deployable modular monolith whose primary change units are capability/vertical slices',
      )
        && normalizedSpecDesign.includes(
          'This recommendation order does not create target authority.',
        )
        && normalizedSpecDesign.includes('one coherent initial slice map')
        && normalizedSpecDesign.includes('An explicit alternative always wins.')
        && normalizedSpecDesign.includes(
          'A previously accepted operator/project policy may authorize this preferred style and an evidence-determined slice map only when the evidence yields one materially unambiguous decomposition',
        )
        && normalizedSpecDesign.includes(
          'Do not force this recommendation onto a library/package, CLI, firmware, data pipeline, plugin/protocol system, established brownfield boundary, or genuinely independently deployed services.',
        )
        && normalizedSpecDesign.includes(
          'Equivalent prose or tables are valid; no exact heading or table schema is required.',
        )
        && normalizedSpecDesign.includes(
          'A code root is a discovery location and is not a task hard write boundary.',
        )
        && normalizedSpecDesign.includes(
          'Business orchestration must not live in an HTTP/UI/bot handler, generic utility/shared helper, or the composition root',
        )
        && normalizedSpecDesign.includes(
          'A significant slice represents a complete user- or operator-observable capability, not a technical layer and not automatically one product feature.',
        )
        && normalizedSpecDesign.includes(
          'A shared database does not create shared business ownership.',
        )
        && normalizedSpecDesign.includes(
          'another slice\'s physical read access does not grant command authority or permission to duplicate the owner\'s business rules.',
        )
        && normalizedSpecDesign.includes(
          'Add shared code, event bus, mediator, DI/plugin registry, or similar cross-slice machinery only for a current evidenced requirement.',
        )
        && normalizedSpecDesign.includes(
          "Where the accepted target leaves domain-modeling style open, prefer the affected area's local style.",
        )
        && normalizedSpecDesign.includes(
          'A material translation boundary needs concrete semantic, ownership, compatibility, or representation-isolation pressure and follows the existing operator-decision route.',
        )
        && !normalizedSpecDesign.includes(
          'It is not a default, a separate mandatory question',
        ),
      `${runtimeRoot}/spec-design does not expose the preferred capability-sliced modular-monolith decision contract.`,
    );
    assert(
      normalizedMapCodebase.includes('`/map-codebase` владеет только as-is mapping.')
        && normalizedMapCodebase.includes(
          'не создавай и не изменяй target `AD-*`, normative rules или architecture decisions',
        )
        && normalizedMapCodebase.includes('Само отличие является delta, а не authority conflict'),
      `${runtimeRoot}/map-codebase does not preserve accepted target while mapping current state.`,
    );
    assert(
      normalizedSpecAuto.includes(
        'Runtime observations, production code, and mapped baseline establish current behavior, constraints, and compatibility or migration evidence only',
      )
        && normalizedSpecAuto.includes(
          'A difference between current state and an accepted target is not itself a blocking authority conflict.',
        )
        && !normalizedSpecAuto.includes(
          'accepted operator policy/decision, production baseline',
        ),
      `${runtimeRoot}/spec-auto does not separate current evidence from target authority.`,
    );
    assert(
      normalizedSpecAuto.includes(
        'inherit the accepted global architecture and material module/slice map',
      )
        && normalizedSpecAuto.includes(
          'preserve the applicable owning slice/code root, semantic and write ownership, public boundary, allowed/forbidden dependencies, cross-slice orchestration owner, and proof path',
        )
        && normalizedSpecAuto.includes(
          'mark the feature `blocked` and use the existing `/spec-design` resume route instead of choosing it',
        ),
      `${runtimeRoot}/spec-auto does not inherit the accepted slice target or preserve its blocker.`,
    );
    assert(
      normalizedFoundationToTasks.includes(
        'Apply the accepted architecture, composition, module/slice boundaries, and code roots that constrain the walking skeleton',
      )
        && normalizedFoundationToTasks.includes(
          'scaffold only the composition root and slice roots required by the walking skeleton',
        )
        && normalizedFoundationToTasks.includes(
          'link task-relevant substrate, architecture, and boundary specs through existing link-bearing fields',
        ),
      `${runtimeRoot}/foundation-to-tasks does not preserve accepted composition/slice boundaries.`,
    );
    assert(
      normalizedFeatureToTasks.includes(
        'Product feature, architecture slice/module, and task are distinct.',
      )
        && normalizedFeatureToTasks.includes(
          'A task normally has one primary owning slice/module, but a cohesive cross-slice outcome is valid when one orchestration owner and every crossed boundary are explicit.',
        )
        && normalizedFeatureToTasks.includes(
          'put the directly relevant architecture and boundary paths in existing `source_artifacts` and/or `normative_inputs`',
        )
        && normalizedFeatureToTasks.includes(
          'That owner must be one capability slice; do not place business orchestration in an HTTP/UI/bot handler, generic utility/shared helper, or the composition root.',
        )
        && normalizedFeatureToTasks.includes(
          'Use an owner already accepted in the global architecture; if none applies unambiguously, route the material boundary to `/spec-design` instead of creating an orchestration slice during task planning.',
        )
        && normalizedFeatureToTasks.includes(
          'make the owning capability and the prohibition on transport-handler, generic-util, and composition-root business orchestration directly legible through existing linked specs and constraint fields',
        )
        && normalizedFeatureToTasks.includes('do not add an `owning_slice` field')
        && normalizedFeatureToTasks.includes(
          'mechanically copy a slice code root into `write_boundary`',
        ),
      `${runtimeRoot}/feature-to-tasks does not propagate slice ownership through existing task fields.`,
    );
    assert(
      normalizedArchitectureReview.includes(
        'ownership, source of truth, public boundaries, dependency direction, cross-component orchestration, and required proof paths are preserved',
      )
        && normalizedArchitectureReview.includes(
          'a capability-sliced cross-slice outcome names one accepted capability slice as orchestration owner',
        )
        && normalizedArchitectureReview.includes(
          'business orchestration in transport handlers, generic utilities, or the composition root when accepted architecture forbids it',
        )
        && normalizedArchitectureReview.includes(
          'reject an orchestration slice invented in planning',
        )
        && !normalizedArchitectureReview.includes(
          'each affected task makes its primary owner and code root discoverable',
        )
        && normalizedReviewTasksPlan.includes(
          'each affected task card and its direct links make the primary owner/code root, public boundary, semantic/write owner, forbidden bypasses, eligible cross-slice orchestration owner when relevant, applicable forbidden technical placements, and proof path directly discoverable',
        )
        && normalizedReviewTasksPlan.includes(
          'do not require slices from an accepted architecture that uses another primary change unit',
        ),
      `${runtimeRoot} lost the separation between global architecture review and per-task boundary handoff review.`,
    );
    assert(
      normalizedSpecDesign.includes(
        'name an existing project-native mechanical check only for a recurring, high-blast-radius, security/safety, or cheap unambiguous violation',
      )
        && normalizedSpecDesign.includes(
          'Record a required missing check as accepted work, not a runnable gate; do not require a universal architecture validator.',
        )
        && normalizedSpecDesign.includes(
          'define known initial state, safe rerun, observable result, and cleanup or isolation; do not add this process to simple/stateless projects.',
        )
        && normalizedSpecAuto.includes(
          'put any required initial-state, safe-rerun, observable-result, and cleanup/isolation proof in the owning canonical spec; do not add it to simple/stateless features;',
        ),
      `${runtimeRoot} design skills do not keep architecture enforcement selective and runtime proof evidence-driven.`,
    );
    assert(
      normalizedSpecDesign.includes(
        'do not turn the mutable current head into a durable global or feature contract',
      )
        && normalizedSpecDesign.includes(
          'a new current head is current-state evidence and does not increment Planning Revision by itself',
        )
        && normalizedSpecAuto.includes(
          'keep head/branch/ancestry proof with the project-level database contract and revision-local proof with the feature',
        )
        && normalizedFoundationToTasks.includes(
          'reuse or create one project-level database contract owner that derives the single head and proves no branches plus intact ancestry',
        )
        && normalizedFeatureToTasks.includes(
          'Keep feature testing limited to its revision, direct `down_revision`, upgrade/downgrade, schema transition, and data preservation.',
        )
        && normalizedFeatureToTasks.includes(
          'must not make the mutable current head an exact-head requirement or require historical feature-test updates',
        )
        && normalizedExe.includes(
          'preflight may resolve the current head transiently to set or verify the new revision\'s direct `down_revision`',
        )
        && normalizedExe.includes(
          'run the existing project-level graph contract unchanged',
        ),
      `${runtimeRoot} lost the Alembic migration ownership or no-fan-out contract.`,
    );
    const generatedAlembicPlanningSurface = [
      freshTestingStrategy,
      normalizedSpecDesign,
      normalizedSpecAuto,
      normalizedFoundationToTasks,
      normalizedFeatureToTasks,
      normalizedExe,
    ].join(' ');
    [
      'advance every exact-head consumer',
      'advance all exact-head consumers',
      'update every historical feature test',
      'update all historical feature tests',
      'feature migration tests must assert the current head',
    ].forEach((forbiddenRequirement) => {
      assert(
        !generatedAlembicPlanningSurface.includes(forbiddenRequirement),
        `${runtimeRoot} generated project contains fan-out exact-head requirement: ${forbiddenRequirement}`,
      );
    });
    assert(
      normalizedSpecDesign.includes(
        'record in the existing `.memory-bank/architecture/system-architecture.md` beside the affected root or boundary only a non-obvious or material naming/path convention',
      )
        && normalizedSpecDesign.includes(
          'ordinary local naming remains execution discretion.',
        )
        && normalizedFoundationToTasks.includes(
          'When a Foundation plan or advisory expected change surface names a new, moved, or renamed project-authored source path',
        )
        && normalizedFoundationToTasks.includes(
          'Leave an immaterial exact filename choice to `/exe`; do not turn it into a task blocker or hard `write_boundary`.',
        )
        && normalizedFeatureToTasks.includes(
          'When the expected advisory change surface names a new, moved, or renamed project-authored source path',
        )
        && normalizedFeatureToTasks.includes(
          'leave an immaterial exact filename choice to `/exe` instead of turning it into a blocker, new task field, or hard `write_boundary`.',
        ),
      `${runtimeRoot} design/task-planning skills do not preserve source-path semantics and execution discretion.`,
    );
    assert(
      normalizedFeatureToTasks.includes(
        'carry an applicable existing project-native architecture check through `gates` or `verification_targets`',
        )
        && normalizedFeatureToTasks.includes(
          'plan that accepted work instead of emitting a nonexistent command',
        )
        && normalizedFeatureToTasks.includes(
          'when a linked runtime/state rule requires reproducibility, carry its known initial state, safe rerun, observable result, and cleanup/isolation proof',
        )
        && normalizedArchitectureReview.includes(
          'applicable linked rules retain existing mechanical gates and required runtime reproducibility proof; require neither without canonical evidence.',
        ),
      `${runtimeRoot} task planning does not preserve applicable architecture proof without inventing gates.`,
    );
    assert(
      normalizedExe.includes(
        'the tactic keeps state changes and cross-module orchestration with their accepted owners, uses required public boundaries, preserves source-of-truth and dependency direction, creates no unaccepted cross-module contract or forbidden command/write bypass',
      )
        && normalizedExe.includes(
          'Limit architecture checks to direct task links and the actual change surface; do not turn task execution into a broad repository architecture audit.',
        )
        && normalizedExe.includes(
          'Current implementation drift that the task can handle inside its accepted target and semantic boundary is evidence, not a new design choice.',
        )
        && normalizedExe.includes(
          "within an open domain-modeling choice, prefer the affected area's local style",
        )
        && normalizedExe.includes(
          'material boundary or ownership changes use the existing operator-decision routes',
        )
        && normalizedExe.includes(
          'If work requires changing accepted write authority, public boundary, source of truth, orchestration owner, or dependency direction, route it to `/spec-design`.',
        )
        && normalizedExe.includes(
          'before creating, moving, or renaming a project-authored source file, resolve its applicable ownership, reuse, or tooling boundary',
        )
        && normalizedExe.includes(
          'Do not opportunistically rename brownfield source.',
        ),
      `${runtimeRoot}/exe does not enforce accepted boundaries at point of use.`,
    );
    assert(
      normalizedVerify.includes(
        '`PASS` requires both the functional outcome and the allowed architectural path',
      )
        && normalizedVerify.includes(
          'accepted owners change state and retain cross-module orchestration, required public boundaries are used, no unaccepted cross-module contract, forbidden command/write path, or second source of truth appeared',
        )
        && normalizedVerify.includes(
          'An observed violation uses `VERDICT: FAIL`; missing, conflicting, or ambiguous canonical coverage uses `VERDICT: NEEDS-CLARIFICATION`.',
        )
        && normalizedVerify.includes(
          'Unrelated pre-existing drift is evidence unless it invalidates the task outcome or proof.',
        )
        && normalizedVerify.includes(
          'Do not introduce this proof process without task-scoped normative evidence.',
        ),
      `${runtimeRoot}/verify does not require the allowed task-scoped architectural path or preserve verdict semantics.`,
    );
    assert(
      normalizedVerify.includes(
        'Before relying on a test, probe, receipt, or artifact in the verdict, confirm that its observation materially supports the specific task/spec claim or observable outcome it is cited to prove, rather than merely executing code or checking an implementation detail.',
      )
        && normalizedVerify.includes(
          'Treat this as ordinary claim-to-evidence mapping, not a separate review phase or checklist.',
        ),
      `${runtimeRoot}/verify lost its evidence-adequacy or no-extra-review contract.`,
    );
    assert(
      normalizedAutonomous.includes(
        'Runtime observations, production code, and mapped baseline may establish current behavior, constraints, and compatibility or migration evidence; they do not authorize a new target architecture, contract, data ownership, or migration route.',
      )
        && normalizedAutonomous.includes(
          'A difference between current state and an accepted target is a reconciliation delta, not an authority conflict.',
        )
        && !normalizedAutonomous.includes(
          'accepted operator policy/decision, production baseline',
        ),
      `${runtimeRoot}/autonomous does not separate current evidence from target authority.`,
    );
    assert(
      foundationToTasksSkill.includes('positive integer\n  `Planning Revision`')
        && featureToTasksSkill.includes('positive\n  integer `Planning Revision`'),
      `${runtimeRoot} task generation does not require a positive Planning Revision.`,
    );
    assert(
      reviewTasksPlanSkill.includes('`REVIEWED_PLANNING_REVISION: <N>`')
        && reviewTasksPlanSkill.includes('valid only while this\nvalue equals the current positive Planning Revision'),
      `${runtimeRoot}/review-tasks-plan does not bind its verdict to Planning Revision.`,
    );
    assert(
      autopilotSkill.includes('`REVIEWED_PLANNING_REVISION: <N>` equal to the current Planning Revision')
        && autopilotSkill.includes('Do not mutate task statuses to represent this invalidation.')
        && exeSkill.includes('`REVIEWED_PLANNING_REVISION: <N>` equal to it')
        && exeSkill.includes('Leave all task statuses unchanged'),
      `${runtimeRoot} execution entrypoints do not reject stale planning approval without lifecycle mutation.`,
    );
    assert(
      autonomousSkill.includes('current positive\n     Global Backbone Planning Revision'),
      `${runtimeRoot}/autonomous does not require reviews for the current Planning Revision.`,
    );
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
      && progressTemplate.includes('pre-implementation GREEN')
      && handoffTemplate.includes('- claim-linked RED/GREEN evidence:')
      && verificationTemplate.includes('- Executor RED/GREEN path:')
      && verificationTemplate.includes('FT-001-AC-001 / REQ-001')
      && verificationTemplate.includes('Executor GREEN is supporting evidence only.'),
    'Full protocol templates lost claim-linked RED/GREEN planning, evidence, handoff, or verification shape.',
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
  assert(
    !lintOutput.includes('.memory-bank/templates/protocols: has'),
    'Framework-owned protocol templates incorrectly require an index router.',
    lintOutput,
  );
  const mbSyncWorkflow = readTarget('.memory-bank/workflows/mb-sync.md');
  assert(
    mbSyncWorkflow.includes('.memory-bank/templates/protocols/*')
      && mbSyncWorkflow.includes('must not edit'),
    'Deployed runtime mb-sync workflow does not protect framework-owned protocol templates.',
  );

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
