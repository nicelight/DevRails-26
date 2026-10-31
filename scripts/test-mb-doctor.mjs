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
const doctor = join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-doctor.mjs');
const doctorModuleDir = join(repoRoot, 'skills', 'mb-garden', 'assets', 'mb-doctor');
const tempRoot = mkdtempSync(join(tmpdir(), 'devrails26-mb-doctor-'));

const FOUNDATION_GATE = 'TASK-001-T0-FT-000-W0';
const FOUNDATION_EXTRA = 'TASK-002-T0-FT-000-W0';
const PRODUCT_FIRST = 'TASK-101-T0-FT-001-W1';
const PRODUCT_SECOND = 'TASK-102-T0-FT-001-W1';
const PRODUCT_T2 = 'TASK-201-T2-FT-001-W1';
const PRODUCT_T3 = 'TASK-301-T3-FT-001-W1';
const PRODUCTION_ACCEPTANCE = 'TASK-401-T1-FT-001-W2';
const DONE_STATUSES = new Set(['done', 'done_for_prod']);

function fail(message, report = null) {
  const detail = report ? `\n\n${JSON.stringify(report, null, 2)}` : '';
  throw new Error(`${message}${detail}`);
}

function assert(condition, message, report = null) {
  if (!condition) fail(message, report);
}

function writeFixture(root, rel, content) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, 'utf8');
}

function writeJsonFixture(root, rel, value) {
  writeFixture(root, rel, `${JSON.stringify(value, null, 2)}\n`);
}

function task(id, {
  feature,
  wave,
  status = 'ready',
  dependsOn = [],
  reqs,
  sourceArtifacts,
  verificationTargets,
  evidenceRequired,
  verify,
  runtimeContext,
  title = 'Fixture task',
} = {}) {
  const idMatch = id.match(/-T([0-3])-FT-([0-9]{3,})-W([0-9]+)$/);
  const tier = `T${idMatch?.[1]}`;
  const taskFeature = feature ?? `FT-${idMatch?.[2]}`;
  const taskWave = wave ?? `W${idMatch?.[3]}`;
  const featureNumber = taskFeature.match(/^FT-([0-9]{3,})$/)?.[1];
  const acId = featureNumber && taskFeature !== 'FT-000'
    ? `${taskFeature}-AC-001`
    : null;
  const defaultSourceArtifacts = acId
    ? [
      `.memory-bank/features/${taskFeature}-fixture.md#${acId}`,
      '.memory-bank/contracts/fixture.md',
    ]
    : [];
  const defaultVerificationTargets = acId && (tier === 'T2' || tier === 'T3')
    ? [`${acId}: node --test test/fixture.test.mjs`]
    : [];
  const defaultEvidenceRequired = acId && (tier === 'T2' || tier === 'T3')
    ? [
      `${acId} RED: accepted fixture behavior is absent`,
      `${acId} GREEN: accepted fixture behavior is observed`,
    ]
    : [];
  return {
    id,
    title,
    tier,
    feature: taskFeature,
    wave: taskWave,
    status,
    depends_on: dependsOn,
    reqs: reqs ?? (featureNumber ? [`REQ-${featureNumber}`] : []),
    touched_files: ['src/fixture.mjs'],
    gates: [],
    verify: verify ?? (
      DONE_STATUSES.has(status)
        ? ['VERDICT: PASS\nEvidence: fixture success']
        : status === 'failed' ? ['VERDICT: FAIL\nEvidence: fixture failure'] : []
    ),
    docs: [],
    evidence_required: evidenceRequired ?? defaultEvidenceRequired,
    purpose: 'Exercise the doctor fixture.',
    success_outcome: 'The fixture behavior is observable.',
    source_artifacts: sourceArtifacts ?? defaultSourceArtifacts,
    normative_inputs: [],
    constraints: [],
    invariants: [],
    verification_targets: verificationTargets ?? defaultVerificationTargets,
    runtime_context: runtimeContext,
  };
}

function foundationMarkdown(required, gateTask) {
  return `# Foundation Dev Path

## Gate Anchors
- Foundation Required: ${required ? 'true' : 'false'}
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: ${gateTask}
`;
}

function featureMarkdown(criteria, { semanticPass = false } = {}) {
  return `---
description: Fixture feature.
---
# FT-001

## Acceptance Criteria

${criteria.map(({ id, req = 'REQ-001' }) => `### ${id} — Fixture outcome
- REQ: ${req}
- Criterion: the fixture outcome is observable
- Verification: run the fixture probe
`).join('\n')}
${semanticPass ? 'SEMANTIC_VERDICT: semantic-pass\n' : ''}`;
}

function createFixture(name, { foundation, tasks = [], directories = [], files = [], omit = [], realLint = false }) {
  const root = join(tempRoot, name);
  mkdirSync(root, { recursive: true });

  writeFixture(root, '.memory-bank/scripts/mb-lint.mjs', "#!/usr/bin/env node\nconsole.log('fixture lint passed');\n");
  writeFixture(root, '.memory-bank/constitution.md', '# Constitution\n');
  writeFixture(root, '.memory-bank/index.md', '# Memory Bank\n\n- constitution.md\n');
  writeFixture(root, '.memory-bank/spec-index.md', '# Spec Index\n\n| Constitution | constitution.md |\n');
  writeFixture(root, '.memory-bank/spec-backbone.md', `# Spec Backbone

## Global Backbone Status
- Status: minimal
- Not applicable areas:
  - fixture: not_applicable - Foundation validator isolation fixture
`);
  writeFixture(root, '.memory-bank/contracts/fixture.md', '# Fixture contract\n');

  if (foundation !== undefined) {
    writeFixture(root, '.memory-bank/foundation.md', foundation);
  }

  const indexEntries = tasks.map((record) => ({
    id: record.id,
    file: `${record.id}.task.json`,
  }));
  writeJsonFixture(root, '.memory-bank/tasks/index.json', { version: 1, tasks: indexEntries });

  const featureIds = new Set();
  tasks.forEach((record) => {
    writeJsonFixture(root, `.memory-bank/tasks/${record.id}.task.json`, record);
    if (/^FT-[0-9]{3,}$/.test(record.feature)) featureIds.add(record.feature);

    const nav = record.verify.some((entry) => entry?.stage === 'workflow');
    if (!nav && DONE_STATUSES.has(record.status) && (record.tier === 'T0' || record.tier === 'T1')) {
      writeFixture(
        root,
        `.protocols/${record.id}/run.md`,
        '# Compact run\n\n- Evidence: fixture result\n\nVERDICT: PASS\n',
      );
    }
    if (!nav && DONE_STATUSES.has(record.status) && (record.tier === 'T2' || record.tier === 'T3')) {
      const acId = record.source_artifacts
        .join('\n')
        .match(/FT-[0-9]{3,}-AC-[0-9]{3,}/)?.[0];
      writeFixture(root, `.protocols/${record.id}/context.md`, '# Context\n');
      writeFixture(root, `.protocols/${record.id}/plan.md`, '# Plan\n');
      writeFixture(root, `.protocols/${record.id}/progress.md`, `# Progress

## Claim-linked RED / GREEN (T2/T3)
- accepted claim locator(s): ${acId ?? 'legacy'}
- RED observation and evidence: fixture RED artifact
- GREEN observation and evidence: fixture GREEN artifact
`);
      writeFixture(root, `.protocols/${record.id}/verification.md`, `# Verification

- ${acId ?? 'legacy'}: verifier-owned fixture evidence

VERDICT: PASS
`);
      writeFixture(root, `.protocols/${record.id}/handoff.md`, '# Handoff\n');
    }
    if (record.status === 'failed') {
      writeFixture(root, `.memory-bank/bugs/${record.id}.md`, `# Fixture failure\n\n${record.id}\n`);
    }
  });

  featureIds.forEach((featureId) => {
    const slug = featureId === 'FT-000' ? 'foundation' : 'fixture';
    const featureNumber = featureId.match(/^FT-([0-9]{3,})$/)?.[1];
    const hasCompletedT2 = tasks.some((record) => (
      record.feature === featureId
      && record.tier === 'T2'
      && !record.verify.some((entry) => entry?.stage === 'workflow')
      && DONE_STATUSES.has(record.status)
    ));
    writeFixture(root, `.memory-bank/features/${featureId}-${slug}.md`, `---
description: Fixture feature.
---
# ${featureId}
${featureId === 'FT-000' ? '' : `
## Acceptance Criteria

### ${featureId}-AC-001 — Fixture outcome
- REQ: REQ-${featureNumber}
- Criterion: the fixture outcome is observable
- Verification: run the fixture probe
`}
${hasCompletedT2 ? 'SEMANTIC_VERDICT: semantic-pass\n' : ''}
`);
  });

  const requirementIds = new Set(['REQ-000']);
  tasks.forEach((record) => {
    (record.reqs ?? []).forEach((reqId) => requirementIds.add(reqId));
  });
  writeFixture(
    root,
    '.memory-bank/requirements.md',
    `# Requirements\n\n${[...requirementIds].sort().map((reqId) => `- ${reqId}: fixture requirement`).join('\n')}\n`,
  );

  directories.forEach((rel) => {
    mkdirSync(join(root, rel), { recursive: true });
  });
  files.forEach(({ rel, content }) => {
    writeFixture(root, rel, content);
  });

  if (realLint) {
    for (const rel of ['mbb/index.md', 'changelog.md', 'workflows/mb-sync.md', 'testing/index.md', 'skills/index.md']) {
      writeFixture(root, `.memory-bank/${rel}`, '# Fixture managed resource\n');
    }
    writeJsonFixture(root, '.memory-bank/schemas/task.schema.json', {});
    writeFixture(root, '.memory-bank/scripts/mb-lint.mjs', readFileSync(join(repoRoot, 'skills/mb-garden/assets/mb-lint.mjs'), 'utf8'));
    const addFrontmatter = (dir) => {
      for (const item of readdirSync(dir, { withFileTypes: true })) {
        const abs = join(dir, item.name);
        if (item.isDirectory()) addFrontmatter(abs);
        else if (item.name.endsWith('.md')) {
          let text = readFileSync(abs, 'utf8');
          if (!text.startsWith('---\n')) text = `---\ndescription: Nav fixture.\nstatus: draft\n---\n${text}`;
          else if (!/^status:/m.test(text)) text = text.replace('---\n', '---\nstatus: draft\n');
          writeFileSync(abs, text);
        }
      }
    };
    addFrontmatter(join(root, '.memory-bank'));
  }
  for (const rel of omit) rmSync(join(root, rel), { recursive: true, force: true });
  return root;
}

function runCase(name, fixture, flags = []) {
  const root = createFixture(name, fixture);
  const result = runDoctor(root, [...flags, '--json']);

  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    fail(`${name}: doctor did not emit valid JSON\n${result.stdout}\n${result.stderr}`);
  }

  const expectedExit = report.status === 'pass' ? 0 : 1;
  assert(result.status === expectedExit, `${name}: exit status does not match report status`, report);
  return report;
}

function runDoctor(root, flags = []) {
  const result = spawnSync(process.execPath, [doctor, ...flags], {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.error) fail(result.error.message);
  return result;
}

function findFinding(report, code, severity = undefined) {
  return report.findings.find((finding) => (
    finding.code === code && (severity === undefined || finding.severity === severity)
  ));
}

function expectFinding(report, code, severity) {
  assert(Boolean(findFinding(report, code, severity)), `Expected ${severity} ${code}`, report);
}

function expectNoFinding(report, code) {
  assert(!findFinding(report, code), `Did not expect ${code}`, report);
}

function expectPass(report, label) {
  assert(report.status === 'pass', `${label}: expected PASS`, report);
}

function assertModuleArchitecture() {
  const expectedModules = [
    'acceptance-trace.mjs',
    'cli-reporting.mjs',
    'foundation-backbone.mjs',
    'preflight.mjs',
    'readers.mjs',
    'task-readiness.mjs',
    'terminal-compat.mjs',
  ];
  const actualModules = readdirSync(doctorModuleDir)
    .filter((name) => name.endsWith('.mjs'))
    .sort();
  assert(
    JSON.stringify(actualModules) === JSON.stringify(expectedModules),
    'Canonical mb-doctor module inventory changed without updating its architecture contract.',
  );

  const entrySource = readFileSync(doctor, 'utf8');
  const moduleSources = new Map(
    expectedModules.map((name) => [name, readFileSync(join(doctorModuleDir, name), 'utf8')]),
  );
  expectedModules.forEach((name) => {
    assert(
      entrySource.includes(`from './mb-doctor/${name}'`),
      `Canonical entrypoint does not import ${name}.`,
    );
  });

  moduleSources.forEach((source, name) => {
    assert(
      source.includes('Owns ') && source.includes('Does not '),
      `${name} has no concise ownership boundary header.`,
    );
    if (name !== 'readers.mjs') {
      assert(
        !source.includes("node:fs") && !source.includes("node:path"),
        `${name} bypasses the filesystem reader boundary.`,
      );
    }
    if (name !== 'cli-reporting.mjs') {
      assert(
        !/\bconsole\./.test(source) && !/\bprocess\.exit\b/.test(source),
        `${name} bypasses the CLI/reporting boundary.`,
      );
    }

    const localImports = [...source.matchAll(/from '([^']+)'/g)]
      .map((match) => match[1])
      .filter((specifier) => specifier.startsWith('.'));
    assert(
      localImports.every((specifier) => specifier === './readers.mjs'),
      `${name} introduced a reverse or cyclic domain-module dependency.`,
    );
  });

  const orderedEntryCalls = [
    'runPreflight(context);',
    'foundation.checkConstitutionStructure();',
    'foundation.checkBackboneReadiness();',
    'taskReadiness.checkFeatureClarificationReadiness();',
    'taskReadiness.checkTaskReadiness();',
    'reporter.finish();',
  ];
  let previousOffset = -1;
  const callOffsets = orderedEntryCalls.map((call) => {
    previousOffset = entrySource.indexOf(call, previousOffset + 1);
    return previousOffset;
  });
  assert(
    callOffsets.every((offset) => offset >= 0),
    'Canonical entrypoint check/report order changed.',
  );

  const localGuide = readFileSync(join(doctorModuleDir, 'AGENTS.md'), 'utf8');
  expectedModules.forEach((name) => {
    assert(localGuide.includes(`\`${name}\``), `Local ownership guide does not route ${name}.`);
  });

  const initSource = readFileSync(join(repoRoot, 'skills', '_shared', 'scripts', 'init-mb.js'), 'utf8');
  expectedModules.forEach((name) => {
    assert(
      initSource.includes(`{ asset: 'mb-doctor/${name}', target: '.memory-bank/scripts/mb-doctor/${name}' }`),
      `Runtime asset manifest does not deploy ${name}.`,
    );
  });
}

try {
  assertModuleArchitecture();

  const cliRoot = createFixture('cli-contract', {});
  const help = runDoctor(cliRoot, ['--help', '--unknown']);
  assert(help.status === 0, 'Help must win over invalid arguments.');
  assert(help.stderr === '', 'Help unexpectedly wrote to stderr.');
  assert(
    help.stdout === `mb-doctor

Usage:
  node .memory-bank/scripts/mb-doctor.mjs [--strict] [--json]

Flags:
  --strict  Require an executable autonomous/autopilot task queue.
  --json    Emit stable machine-readable JSON findings.

`,
    'Help output changed.',
  );

  const invalidText = runDoctor(cliRoot, ['--unknown']);
  assert(invalidText.status === 1, 'Invalid text-mode arguments must fail.');
  assert(invalidText.stderr === '', 'Invalid text-mode arguments unexpectedly wrote to stderr.');
  assert(
    invalidText.stdout === `mb-doctor FAIL (1 errors, 0 warnings, 0 info)
[ERROR] CLI_INVALID_ARGUMENT: Unknown flag: --unknown
`,
    'Text report contract changed.',
  );

  const invalidJson = runDoctor(cliRoot, ['--strict', '--unknown', '--json']);
  assert(invalidJson.status === 1, 'Invalid JSON-mode arguments must fail.');
  assert(invalidJson.stderr === '', 'Invalid JSON-mode arguments unexpectedly wrote to stderr.');
  const invalidReport = JSON.parse(invalidJson.stdout);
  assert(
    JSON.stringify(invalidReport) === JSON.stringify({
      version: 1,
      tool: 'mb-doctor',
      strict: true,
      status: 'fail',
      summary: { errors: 1, warnings: 0, infos: 0 },
      counts: { error: 1, warning: 0, info: 0 },
      findings: [{
        severity: 'error',
        code: 'CLI_INVALID_ARGUMENT',
        message: 'Unknown flag: --unknown',
        suggested_fix: 'Use only --strict and/or --json.',
      }],
    }),
    'JSON report shape, payload, or key order changed.',
    invalidReport,
  );
  assert(invalidJson.stdout.endsWith('\n\n'), 'JSON output newline contract changed.');

  const emptyDefault = runCase('empty-default', {});
  expectPass(emptyDefault, 'empty default');
  expectFinding(emptyDefault, 'TASK_INDEX_EMPTY', 'info');
  assert(
    JSON.stringify(emptyDefault.findings.map(({ severity, code }) => ({ severity, code })))
      === JSON.stringify([
        { severity: 'info', code: 'MB_LINT_PASSED' },
        { severity: 'info', code: 'TASK_INDEX_EMPTY' },
        { severity: 'info', code: 'TASK_QUEUE_SUMMARY' },
      ]),
    'Default finding order changed.',
    emptyDefault,
  );

  const unselectedDesign = runCase('empty-unselected-design', { files: [{ rel: '.memory-bank/spec-backbone.md', content: '# Spec Backbone\n\n## Global Backbone Status\n- Status: blocked\n- Planning Revision: 0\n' }] });
  expectPass(unselectedDesign, 'fresh skeleton without selected design');
  expectNoFinding(unselectedDesign, 'SPEC_BACKBONE_NOT_READY');

  const emptyStrict = runCase('empty-strict', {}, ['--strict']);
  expectFinding(emptyStrict, 'TASK_INDEX_EMPTY', 'error');

  const noFoundationFixture = { tasks: [task(PRODUCT_FIRST)] };
  const noFoundationDefault = runCase('no-foundation-default', noFoundationFixture);
  expectPass(noFoundationDefault, 'missing foundation default');
  expectFinding(noFoundationDefault, 'FOUNDATION_ANCHORS_INVALID', 'warning');
  const noFoundationStrict = runCase('no-foundation-strict', noFoundationFixture, ['--strict']);
  expectFinding(noFoundationStrict, 'FOUNDATION_ANCHORS_INVALID', 'error');

  const optionalProof = runCase('optional-foundation-proof', {
    foundation: foundationMarkdown(true, 'not_required'),
    tasks: [task(FOUNDATION_GATE)],
  }, ['--strict']);
  expectPass(optionalProof, 'Foundation implementation without a selected integrated proof gate');

  const invalidAnchors = runCase('invalid-anchors', {
    foundation: foundationMarkdown(true, 'unrecognized_gate'),
    tasks: [task(PRODUCT_FIRST)],
  }, ['--strict']);
  expectFinding(invalidAnchors, 'FOUNDATION_ANCHORS_INVALID', 'error');

  const pendingGate = runCase('pending-gate', {
    foundation: foundationMarkdown(true, 'pending_foundation_to_tasks'),
    tasks: [task(FOUNDATION_GATE)],
  }, ['--strict']);
  expectFinding(pendingGate, 'FOUNDATION_GATE_TASK_INVALID', 'error');

  const openFoundationOnly = runCase('open-foundation-only', {
    foundation: foundationMarkdown(true, FOUNDATION_GATE),
    tasks: [task(FOUNDATION_GATE)],
  }, ['--strict']);
  expectPass(openFoundationOnly, 'open foundation-only queue');

  const unindexedGate = runCase('unindexed-gate', {
    foundation: foundationMarkdown(true, FOUNDATION_GATE),
    tasks: [task(FOUNDATION_EXTRA)],
  }, ['--strict']);
  expectFinding(unindexedGate, 'FOUNDATION_GATE_TASK_INVALID', 'error');

  const wrongFeatureGate = runCase('wrong-feature-gate', {
    foundation: foundationMarkdown(true, FOUNDATION_GATE),
    tasks: [task(FOUNDATION_GATE, { feature: 'FT-001' })],
  }, ['--strict']);
  expectFinding(wrongFeatureGate, 'FOUNDATION_GATE_TASK_INVALID', 'error');

  const openGateWithProduct = runCase('open-gate-with-product', {
    foundation: foundationMarkdown(true, FOUNDATION_GATE),
    tasks: [
      task(FOUNDATION_GATE),
      task(PRODUCT_FIRST, { status: 'planned', dependsOn: [FOUNDATION_GATE] }),
    ],
  }, ['--strict']);
  expectFinding(openGateWithProduct, 'FOUNDATION_GATE_TASK_INVALID', 'error');

  const missingGateDependency = runCase('missing-gate-dependency', {
    foundation: foundationMarkdown(true, FOUNDATION_GATE),
    tasks: [
      task(FOUNDATION_GATE, { status: 'done' }),
      task(PRODUCT_FIRST),
    ],
  }, ['--strict']);
  expectFinding(missingGateDependency, 'FOUNDATION_GATE_DEP_MISSING', 'error');

  const validTransitiveGate = runCase('valid-transitive-gate', {
    foundation: foundationMarkdown(true, FOUNDATION_GATE),
    tasks: [
      task(FOUNDATION_GATE, { status: 'done' }),
      task(PRODUCT_FIRST, { status: 'done', dependsOn: [FOUNDATION_GATE] }),
      task(PRODUCT_SECOND, { dependsOn: [PRODUCT_FIRST] }),
    ],
  }, ['--strict']);
  expectPass(validTransitiveGate, 'valid transitive Foundation dependency');

  const foundationNotRequired = runCase('foundation-not-required', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_FIRST)],
  }, ['--strict']);
  expectPass(foundationNotRequired, 'Foundation not required');

  const falseWithFoundationRecords = runCase('false-with-foundation-records', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(FOUNDATION_EXTRA), task(PRODUCT_FIRST)],
  }, ['--strict']);
  expectFinding(falseWithFoundationRecords, 'FOUNDATION_GATE_TASK_INVALID', 'error');

  const unresolvedFoundationWork = runCase('unresolved-foundation-work', {
    foundation: foundationMarkdown(true, FOUNDATION_GATE),
    tasks: [
      task(FOUNDATION_GATE, { status: 'done' }),
      task(FOUNDATION_EXTRA),
      task(PRODUCT_FIRST, { dependsOn: [FOUNDATION_GATE] }),
    ],
  }, ['--strict']);
  expectFinding(unresolvedFoundationWork, 'FOUNDATION_GATE_TASK_INVALID', 'error');

  const failedNamedGate = runCase('failed-named-gate', {
    foundation: foundationMarkdown(true, FOUNDATION_GATE),
    tasks: [task(FOUNDATION_GATE, { status: 'failed' })],
  }, ['--strict']);
  expectFinding(failedNamedGate, 'FOUNDATION_GATE_TASK_INVALID', 'error');

  const compactDirectoryOnly = runCase('compact-in-progress-directory-only', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_FIRST, { status: 'in_progress' })],
    directories: [`.protocols/${PRODUCT_FIRST}`],
  }, ['--strict']);
  expectFinding(compactDirectoryOnly, 'TASK_IN_PROGRESS_WITHOUT_PROTOCOL', 'error');

  const compactRunPresent = runCase('compact-in-progress-run-present', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_FIRST, { status: 'in_progress' })],
    files: [{
      rel: `.protocols/${PRODUCT_FIRST}/run.md`,
      content: '# Compact Run\n\n## Execution Attempt\n- attempt: attempt-1\n- started: fixture\n',
    }],
  }, ['--strict']);
  assert(
    !findFinding(compactRunPresent, 'TASK_IN_PROGRESS_WITHOUT_PROTOCOL'),
    'Compact in-progress task with run.md was rejected as missing protocol.',
    compactRunPresent,
  );

  const validAcceptanceTrace = runCase('valid-acceptance-trace', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2)],
  }, ['--strict']);
  expectPass(validAcceptanceTrace, 'valid acceptance trace');
  expectNoFinding(validAcceptanceTrace, 'TASK_ACCEPTANCE_PROOF_MISSING');

  const plannedProductionAcceptance = runCase('planned-production-acceptance', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [
      task(PRODUCT_T2, { status: 'done_for_prod' }),
      task(PRODUCT_FIRST, { status: 'ready', dependsOn: [PRODUCT_T2] }),
      task(PRODUCTION_ACCEPTANCE, {
        title: 'Production acceptance: fixture host checks',
        status: 'planned',
        dependsOn: [PRODUCT_T2],
      }),
    ],
  }, ['--strict']);
  expectPass(plannedProductionAcceptance, 'planned production acceptance is non-blocking');
  expectNoFinding(plannedProductionAcceptance, 'TASK_READY_DEP_NOT_DONE');
  expectNoFinding(plannedProductionAcceptance, 'TASK_QUEUE_DEADLOCK');
  expectNoFinding(plannedProductionAcceptance, 'TASK_PLANNED_READY_CANDIDATE');

  const fragmentSddLocator = runCase('fragment-sdd-locator', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, {
      sourceArtifacts: [
        '.memory-bank/features/FT-001-fixture.md#FT-001-AC-001',
        '.memory-bank/contracts/fixture.md#fixture-contract',
      ],
    })],
  }, ['--strict']);
  expectPass(fragmentSddLocator, 'fragment SDD locator');
  expectNoFinding(fragmentSddLocator, 'TASK_SDD_SPEC_LINK_MISSING');
  expectNoFinding(fragmentSddLocator, 'TASK_HANDOFF_INCOMPLETE');

  const hierarchicalAcceptanceTrace = runCase('hierarchical-acceptance-trace', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, { reqs: ['REQ-ING-001'] })],
    files: [{
      rel: '.memory-bank/features/FT-001-fixture.md',
      content: featureMarkdown([{ id: 'FT-001-AC-001', req: 'REQ-ING-001' }]),
    }],
  }, ['--strict']);
  expectPass(hierarchicalAcceptanceTrace, 'hierarchical acceptance trace');

  const multipleAcceptanceReqs = runCase('multiple-acceptance-reqs', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, { reqs: ['REQ-CAP-002'] })],
    files: [
      {
        rel: '.memory-bank/features/FT-001-fixture.md',
        content: featureMarkdown([{
          id: 'FT-001-AC-001',
          req: 'REQ-ING-001, REQ-CAP-002',
        }]),
      },
      {
        rel: '.memory-bank/requirements.md',
        content: '# Requirements\n\n- REQ-ING-001: ingestion behavior\n- REQ-CAP-002: capacity behavior\n',
      },
    ],
  }, ['--strict']);
  expectPass(multipleAcceptanceReqs, 'multiple governing requirements in one AC');

  const invalidHierarchicalReq = runCase('invalid-hierarchical-req', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, { reqs: ['REQ-ING-01'] })],
    files: [{
      rel: '.memory-bank/features/FT-001-fixture.md',
      content: featureMarkdown([{ id: 'FT-001-AC-001', req: 'REQ-ING-01' }]),
    }],
  }, ['--strict']);
  expectFinding(invalidHierarchicalReq, 'TASK_REQUIREMENT_LINK_MISSING', 'error');
  expectFinding(invalidHierarchicalReq, 'FEATURE_ACCEPTANCE_INVALID', 'error');

  const invalidAcceptanceReq = runCase('invalid-acceptance-req', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2)],
    files: [{
      rel: '.memory-bank/features/FT-001-fixture.md',
      content: featureMarkdown([{ id: 'FT-001-AC-001', req: 'REQ-999' }]),
    }],
  }, ['--strict']);
  expectFinding(invalidAcceptanceReq, 'FEATURE_ACCEPTANCE_INVALID', 'error');

  const duplicateAcceptance = runCase('duplicate-acceptance', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2)],
    files: [{
      rel: '.memory-bank/features/FT-001-fixture.md',
      content: featureMarkdown([
        { id: 'FT-001-AC-001' },
        { id: 'FT-001-AC-001' },
      ]),
    }],
  }, ['--strict']);
  expectFinding(duplicateAcceptance, 'FEATURE_ACCEPTANCE_DUPLICATE', 'error');

  const uncoveredAcceptance = runCase('uncovered-acceptance', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2)],
    files: [{
      rel: '.memory-bank/features/FT-001-fixture.md',
      content: featureMarkdown([
        { id: 'FT-001-AC-001' },
        { id: 'FT-001-AC-002' },
      ]),
    }],
  }, ['--strict']);
  expectFinding(uncoveredAcceptance, 'FEATURE_ACCEPTANCE_UNCOVERED', 'error');

  const danglingAcceptance = runCase('dangling-acceptance-link', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, {
      sourceArtifacts: [
        '.memory-bank/features/FT-001-fixture.md#FT-001-AC-999',
        '.memory-bank/contracts/fixture.md',
      ],
      verificationTargets: ['FT-001-AC-999: node --test test/fixture.test.mjs'],
      evidenceRequired: [
        'FT-001-AC-999 RED: accepted fixture behavior is absent',
        'FT-001-AC-999 GREEN: accepted fixture behavior is observed',
      ],
    })],
  }, ['--strict']);
  expectFinding(danglingAcceptance, 'TASK_ACCEPTANCE_LINK_INVALID', 'error');

  const suffixedAcceptance = runCase('suffixed-acceptance-link', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, {
      sourceArtifacts: [
        '.memory-bank/features/FT-001-fixture.md#FT-001-AC-001-typo',
        '.memory-bank/contracts/fixture.md',
      ],
    })],
  }, ['--strict']);
  expectFinding(suffixedAcceptance, 'TASK_ACCEPTANCE_LINK_INVALID', 'error');

  const mismatchedAcceptanceReq = runCase('mismatched-acceptance-req', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, { reqs: ['REQ-002'] })],
    files: [{
      rel: '.memory-bank/requirements.md',
      content: '# Requirements\n\n- REQ-001: accepted feature behavior\n- REQ-002: unrelated task requirement\n',
    }],
  }, ['--strict']);
  expectFinding(mismatchedAcceptanceReq, 'TASK_ACCEPTANCE_LINK_INVALID', 'error');

  const missingAcceptanceProof = runCase('missing-acceptance-proof', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, { evidenceRequired: [] })],
  }, ['--strict']);
  expectFinding(missingAcceptanceProof, 'TASK_ACCEPTANCE_PROOF_MISSING', 'error');
  const missingAcceptanceProofDefault = runCase('missing-acceptance-proof-default', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, { evidenceRequired: [] })],
  });
  expectPass(missingAcceptanceProofDefault, 'missing acceptance proof default mode');
  expectFinding(missingAcceptanceProofDefault, 'TASK_ACCEPTANCE_PROOF_MISSING', 'warning');

  const validNotApplicableProof = runCase('valid-not-applicable-proof', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, {
      evidenceRequired: [
        'FT-001-AC-001 RED_NOT_APPLICABLE: absence cannot be observed without falsifying the accepted static artifact; alternative proof: inspect the generated manifest',
      ],
    })],
  }, ['--strict']);
  expectPass(validNotApplicableProof, 'valid not-applicable acceptance proof');
  expectNoFinding(validNotApplicableProof, 'TASK_ACCEPTANCE_PROOF_MISSING');

  const validGroupedAcceptanceProof = runCase('valid-grouped-acceptance-proof', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, {
      sourceArtifacts: [
        '.memory-bank/features/FT-001-fixture.md#FT-001-AC-001',
        '.memory-bank/features/FT-001-fixture.md#FT-001-AC-002',
        '.memory-bank/contracts/fixture.md',
      ],
      verificationTargets: [
        'PROBE-1 claims: FT-001-AC-001, FT-001-AC-002; node --test test/fixture.test.mjs',
      ],
      evidenceRequired: [
        'PROBE-1 claims: FT-001-AC-001, FT-001-AC-002; RED: each claim is absent; GREEN: each claim is observed; artifact: fixture report',
      ],
    })],
    files: [{
      rel: '.memory-bank/features/FT-001-fixture.md',
      content: featureMarkdown([
        { id: 'FT-001-AC-001' },
        { id: 'FT-001-AC-002' },
      ]),
    }],
  }, ['--strict']);
  expectPass(validGroupedAcceptanceProof, 'valid grouped acceptance proof');
  expectNoFinding(validGroupedAcceptanceProof, 'TASK_ACCEPTANCE_PROOF_MISSING');

  const missingAcceptanceEvidence = runCase('missing-acceptance-evidence', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, { status: 'done' })],
    files: [{
      rel: `.protocols/${PRODUCT_T2}/progress.md`,
      content: `# Progress

## Claim-linked RED / GREEN (T2/T3)
- accepted claim locator(s): FT-001-AC-001
- RED observation and evidence:
- GREEN observation and evidence:
`,
    }],
  }, ['--strict']);
  expectFinding(missingAcceptanceEvidence, 'TASK_ACCEPTANCE_EVIDENCE_MISSING', 'error');

  const historicalSingularAcceptanceEvidence = runCase('historical-singular-acceptance-evidence', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, { status: 'done' })],
    files: [
      {
        rel: `.protocols/${PRODUCT_T2}/progress.md`,
        content: `# Progress

## Claim-linked RED / GREEN (T2/T3)
- accepted claim locator: FT-001-AC-001
- RED observation and evidence: fixture RED artifact
- GREEN observation and evidence: fixture GREEN artifact
`,
      },
      {
        rel: `.protocols/${PRODUCT_T2}/verification.md`,
        content: `# Verification

- FT-001-AC-001: verifier-owned fixture evidence

VERDICT: PASS
`,
      },
    ],
  }, ['--strict']);
  expectPass(historicalSingularAcceptanceEvidence, 'historical singular acceptance evidence');
  expectNoFinding(historicalSingularAcceptanceEvidence, 'TASK_ACCEPTANCE_EVIDENCE_MISSING');

  const misboundAcceptanceEvidence = runCase('misbound-acceptance-evidence', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, {
      status: 'done',
      sourceArtifacts: [
        '.memory-bank/features/FT-001-fixture.md#FT-001-AC-001',
        '.memory-bank/features/FT-001-fixture.md#FT-001-AC-002',
        '.memory-bank/contracts/fixture.md',
      ],
      verificationTargets: [
        'FT-001-AC-001: node --test test/fixture.test.mjs',
        'FT-001-AC-002: node --test test/fixture.test.mjs',
      ],
      evidenceRequired: [
        'FT-001-AC-001 RED: accepted fixture behavior A is absent',
        'FT-001-AC-001 GREEN: accepted fixture behavior A is observed',
        'FT-001-AC-002 RED: accepted fixture behavior B is absent',
        'FT-001-AC-002 GREEN: accepted fixture behavior B is observed',
      ],
    })],
    files: [
      {
        rel: '.memory-bank/features/FT-001-fixture.md',
        content: featureMarkdown([
          { id: 'FT-001-AC-001' },
          { id: 'FT-001-AC-002' },
        ], { semanticPass: true }),
      },
      {
        rel: `.protocols/${PRODUCT_T2}/progress.md`,
        content: `# Progress

## Claim-linked RED / GREEN (T2/T3)
- accepted claim locator(s): FT-001-AC-002
- RED observation and evidence: fixture RED artifact for FT-001-AC-002
- GREEN observation and evidence: fixture GREEN artifact for FT-001-AC-002

## Open issues / risks
- FT-001-AC-001 has no retained execution evidence.
`,
      },
      {
        rel: `.protocols/${PRODUCT_T2}/verification.md`,
        content: `# Verification

- FT-001-AC-001: verifier-owned fixture evidence
- FT-001-AC-002: verifier-owned fixture evidence

VERDICT: PASS
`,
      },
    ],
  }, ['--strict']);
  const misboundFinding = findFinding(
    misboundAcceptanceEvidence,
    'TASK_ACCEPTANCE_EVIDENCE_MISSING',
    'error',
  );
  assert(
    misboundFinding?.details?.acceptance?.includes('FT-001-AC-001')
      && !misboundFinding.details.acceptance.includes('FT-001-AC-002'),
    'Evidence for one AC was incorrectly accepted as terminal evidence for another AC.',
    misboundAcceptanceEvidence,
  );

  const historicalDoneWithoutProof = runCase('historical-done-without-proof', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T2, {
      status: 'done',
      verificationTargets: ['FT-001-AC-001: legacy verifier flow'],
      evidenceRequired: [],
    })],
  }, ['--strict']);
  expectPass(historicalDoneWithoutProof, 'historical done task without prospective proof');
  expectNoFinding(historicalDoneWithoutProof, 'TASK_ACCEPTANCE_EVIDENCE_MISSING');

  const currentT3ClosureGap = runCase('current-t3-closure-gap', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T3, { status: 'done' })],
  }, ['--strict']);
  expectFinding(currentT3ClosureGap, 'TASK_RED_VERIFY_EVIDENCE_MISSING', 'error');
  expectNoFinding(currentT3ClosureGap, 'TASK_LEGACY_TERMINAL_COMPATIBILITY');

  const currentT3Closure = runCase('current-t3-closure', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T3, { status: 'done' })],
    files: [{
      rel: `.protocols/${PRODUCT_T3}/red-verification.md`,
      content: '# Red verification\n\nSEMANTIC_VERDICT: semantic-pass\n',
    }],
  }, ['--strict']);
  expectPass(currentT3Closure, 'current T3 closure');

  const legacyT3ClosureGap = runCase('legacy-t3-closure-gap', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T3, {
      status: 'done',
      runtimeContext: { allowed_write_scope: ['src/fixture.mjs'] },
    })],
  }, ['--strict']);
  expectPass(legacyT3ClosureGap, 'legacy T3 terminal closure gaps');
  expectNoFinding(legacyT3ClosureGap, 'TASK_RED_VERIFY_EVIDENCE_MISSING');
  const legacySummary = findFinding(
    legacyT3ClosureGap,
    'TASK_LEGACY_TERMINAL_COMPATIBILITY',
    'info',
  );
  assert(
    legacySummary?.details?.records_with_preserved_gaps === 1
      && legacySummary.details.gap_types?.TASK_RED_VERIFY_EVIDENCE_MISSING === 1,
    'Legacy terminal compatibility summary does not retain exact gap counts.',
    legacyT3ClosureGap,
  );

  const activeLegacyAlias = runCase('active-legacy-alias', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T3, {
      status: 'in_progress',
      runtimeContext: { allowed_write_scope: ['src/fixture.mjs'] },
    })],
  }, ['--strict']);
  expectFinding(activeLegacyAlias, 'TASK_FULL_PROTOCOL_MISSING', 'error');
  expectNoFinding(activeLegacyAlias, 'TASK_LEGACY_TERMINAL_COMPATIBILITY');

  const ownerAcceptedClosure = {
    stage: 'owner_lifecycle_closure',
    mode: 'manual_explicit_owner',
    decision: 'done',
    gate_summary: {
      red_verification: 'OWNER-ACCEPTED semantic-fail as residual risk; no semantic-pass claim',
    },
    accepted_evidence: ['.protocols/TASK-301-T3-FT-001-W1/administrative-closure.md'],
    accepted_residual_risk: ['Fixture risk accepted by the explicit owner.'],
  };
  const ownerAcceptedSemanticFail = runCase('owner-accepted-semantic-fail', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T3, {
      status: 'done',
      verify: ['VERDICT: PASS\nEvidence: fixture success', ownerAcceptedClosure],
    })],
    files: [
      {
        rel: `.protocols/${PRODUCT_T3}/red-verification.md`,
        content: '# Red verification\n\nSEMANTIC_VERDICT: semantic-fail\n',
      },
      {
        rel: `.protocols/${PRODUCT_T3}/administrative-closure.md`,
        content: '# Administrative closure\n\nExplicit owner risk acceptance.\n',
      },
    ],
  }, ['--strict']);
  expectPass(ownerAcceptedSemanticFail, 'owner-accepted semantic findings');
  expectNoFinding(ownerAcceptedSemanticFail, 'TASK_RED_VERIFY_VERDICT_MISSING');

  const ownerAcceptedClosureWithoutExtraGate = runCase('owner-accepted-closure-without-extra-gate', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T3, {
      status: 'done',
      verify: ['VERDICT: PASS\nEvidence: fixture success', ownerAcceptedClosure],
    })],
    files: [{
      rel: `.protocols/${PRODUCT_T3}/red-verification.md`,
      content: '# Red verification\n\nSEMANTIC_VERDICT: semantic-fail\n',
    }],
  }, ['--strict']);
  expectPass(ownerAcceptedClosureWithoutExtraGate, 'owner-accepted closure without extra gate');
  expectNoFinding(ownerAcceptedClosureWithoutExtraGate, 'TASK_RED_VERIFY_VERDICT_MISSING');

  const incompleteOwnerAcceptance = runCase('incomplete-owner-acceptance', {
    foundation: foundationMarkdown(false, 'not_required'),
    tasks: [task(PRODUCT_T3, {
      status: 'done',
      verify: [
        'VERDICT: PASS\nEvidence: fixture success',
        { ...ownerAcceptedClosure, accepted_residual_risk: [] },
      ],
    })],
    files: [{
      rel: `.protocols/${PRODUCT_T3}/red-verification.md`,
      content: '# Red verification\n\nSEMANTIC_VERDICT: semantic-fail\n',
    }],
  }, ['--strict']);
  expectFinding(incompleteOwnerAcceptance, 'TASK_RED_VERIFY_VERDICT_MISSING', 'error');


  // Nav retains the selection with its actual result; no implicit protocol bundle.
  function navWorkflow(selected = {}, results = {}) {
    return {
      stage: 'workflow', attempt: '1',
      selected: { design: false, local_checks: false, verify: [], red_verify: false, feature_red_verify: false, protocols: [], ...selected },
      implementation: 'complete',
      evidence: ['FT-001-AC-001: implementation diff retained; no unresolved effects'],
      local_checks: 'skipped', verification: 'skipped', red_verification: 'skipped',
      ...results,
    };
  }
  function navTask(id = PRODUCT_T2, workflow = navWorkflow(), overrides = {}) {
    return task(id, {
      status: 'done', verify: [workflow],
      sourceArtifacts: ['.memory-bank/features/FT-001-fixture.md#FT-001-AC-001'],
      verificationTargets: [], evidenceRequired: [], ...overrides,
    });
  }
  const probe = (participant, verdict = 'PASS', disposition) => ({
    participant, verdict, evidence: ['FT-001-AC-001: independent outcome probe observed fixture behavior'],
    ...(disposition ? { disposition } : {}),
  });
  const continuation = { decision: 'continue', source: 'user', reason: 'Accept the recorded fixture limitation within this task.' };
  const navRun = (name, record, extra = {}) => runCase(name, { tasks: [record], ...extra }, ['--strict']);

  for (const id of [PRODUCT_FIRST, PRODUCTION_ACCEPTANCE, PRODUCT_T2, PRODUCT_T3]) {
    const record = navTask(id, navWorkflow());
    expectPass(navRun(`nav-all-off-${id}`, record), `all checks off ${id}`);
    const root = join(tempRoot, `nav-all-off-${id}`);
    assert(!existsSync(join(root, '.protocols', id)), 'All-off closure created or required a protocol report.');
    assert(!JSON.stringify(record.verify).includes('PASS'), 'All-off closure invented PASS.');
  }
  // Mutate only pending work in one deployed record/attempt while exe is active.
  const live = navTask(PRODUCT_T2, navWorkflow({
    local_checks: true, verify: ['main', 'secondary'], red_verify: true,
    protocols: ['verification.md', 'red-verification.md'],
  }, {
    implementation: 'partial', evidence: ['FT-001-AC-001: source edit retained; exe still running'],
    local_checks: undefined, verification: undefined, red_verification: undefined,
  }), { status: 'in_progress', verificationTargets: ['FT-001-AC-001: observable outcome'] });
  const liveRoot = createFixture('nav-live-pending-selection', { tasks: [live], realLint: true });
  const livePath = `.memory-bank/tasks/${live.id}.task.json`;
  const checkLive = (label) => {
    writeJsonFixture(liveRoot, livePath, live);
    const before = readFileSync(join(liveRoot, livePath), 'utf8');
    const report = JSON.parse(runDoctor(liveRoot, ['--strict', '--json']).stdout);
    assert(readFileSync(join(liveRoot, livePath), 'utf8') === before, `${label}: diagnostic rewrote task evidence`);
    return report;
  };
  expectPass(checkLive('active exe'), 'active exe with future selected verification');
  const liveEntry = live.verify[0];
  liveEntry.selected.verify = [];
  liveEntry.selected.red_verify = false;
  liveEntry.selected.protocols = [];
  expectPass(checkLive('future checks off'), 'pending verify/red can turn off during the same exe attempt');
  liveEntry.implementation = 'complete';
  liveEntry.evidence = ['FT-001-AC-001: implementation completed in the original exe attempt'];
  liveEntry.local_checks = { result: 'passed', evidence: ['FT-001-AC-001: embedded local probe passed'] };
  liveEntry.verification = 'skipped';
  liveEntry.red_verification = 'skipped';
  live.status = 'done';
  expectPass(checkLive('same attempt closure'), 'same attempt closes with retained exe checks and skipped future work');
  assert(live.verify.length === 1 && liveEntry.attempt === '1', 'Live selection fabricated an attempt.');
  assert(!existsSync(join(liveRoot, '.protocols')) && !JSON.stringify(live.verify).includes('PASS'), 'Live all-off created a report or functional PASS.');

  // One participant's retained failure is unaffected by disabling an unstarted peer.
  const peer = navTask(PRODUCT_T2, navWorkflow({ verify: ['main', 'secondary'] }, {
    verification: [probe('main', 'FAIL')],
  }), { status: 'in_progress', verificationTargets: ['FT-001-AC-001: observable outcome'] });
  const peerRoot = createFixture('nav-live-pending-peer', { tasks: [peer], realLint: true });
  expectPass(JSON.parse(runDoctor(peerRoot, ['--strict', '--json']).stdout), 'pending participant alongside retained main failure');
  peer.verify[0].selected.verify = ['main'];
  peer.status = 'done';
  writeJsonFixture(peerRoot, livePath, peer);
  expectFinding(JSON.parse(runDoctor(peerRoot, ['--strict', '--json']).stdout), 'TASK_WORKFLOW_RESULT_INCOMPLETE', 'error');

  const secondaryOnly = navWorkflow({ verify: ['secondary'] }, { verification: [probe('secondary')] });
  const selectedTask = navTask(PRODUCT_T3, secondaryOnly, {
    verificationTargets: ['FT-001-AC-001: independently observe the outcome'],
    evidenceRequired: ['FT-001-AC-001: outcome probe result'],
  });
  expectPass(navRun('nav-main-off-secondary-on-red-off', selectedTask), 'secondary-only verification without main or local checks');
  assert(!existsSync(join(tempRoot, 'nav-main-off-secondary-on-red-off', '.protocols')), 'Inline selected verification unexpectedly generated reports.');

  const codeOnly = navWorkflow({ verify: ['code-review'] }, {
    verification: [{ participant: 'code-review', candidate_findings: 'none', evidence: ['src/fixture.mjs inspected for task-scoped code quality'] }],
  });
  const codeOnlyTask = navTask(PRODUCT_T3, codeOnly, { verificationTargets: ['Review the actual task diff'] });
  expectPass(navRun('nav-main-off-code-review-only', codeOnlyTask), 'code-only review without functional PASS');
  expectPass(navRun('nav-code-only-planned', { ...codeOnlyTask, status: 'ready' }), 'planned code-only review without hidden functional proof');
  assert(!JSON.stringify(codeOnlyTask.verify).includes('PASS'), 'Candidate-only completion invented functional PASS.');
  codeOnly.verification[0].candidate_findings = ['src/fixture.mjs: material boundary bypass on the supported path'];
  expectFinding(navRun('nav-code-finding-needs-disposition', codeOnlyTask), 'TASK_WORKFLOW_RESULT_INCOMPLETE', 'error');
  codeOnly.verification[0].disposition = continuation;
  expectPass(navRun('nav-code-finding-disposed', codeOnlyTask), 'material code finding retains explicit disposition');

  const redAlone = navWorkflow({ red_verify: true }, {
    red_verification: { verdict: 'semantic-pass', evidence: ['FT-001-AC-001: hostile path inspected; functional proof absent'] },
  });
  expectPass(navRun('nav-red-alone', navTask(PRODUCT_T3, redAlone)), 'red alone without functional PASS');
  const localOn = navWorkflow({ local_checks: true }, {
    local_checks: { result: 'passed', evidence: ['FT-001-AC-001 RED: absent before change; GREEN: observed after change'] },
  });
  expectPass(navRun('nav-local-on-verify-off', navTask(PRODUCT_T2, localOn, {
    verificationTargets: ['FT-001-AC-001: outcome probe'],
    evidenceRequired: ['FT-001-AC-001 RED: absent before change', 'FT-001-AC-001 GREEN: observed after change'],
  })), 'local checks independently enabled');

  const failed = navWorkflow({ verify: ['secondary'] }, { verification: [probe('secondary', 'FAIL')] });
  expectFinding(navRun('nav-negative-without-disposition', navTask(PRODUCT_T3, failed, {
    verificationTargets: ['FT-001-AC-001: outcome probe'], evidenceRequired: ['FT-001-AC-001: observed failure'],
  })), 'TASK_WORKFLOW_RESULT_INCOMPLETE', 'error');
  for (const source of ['user', 'autonomous']) {
    const accepted = structuredClone(failed);
    accepted.verification[0].disposition = { ...continuation, source };
    expectPass(navRun(`nav-negative-disposition-${source}`, navTask(PRODUCT_T3, accepted, {
      verificationTargets: ['FT-001-AC-001: outcome probe'], evidenceRequired: ['FT-001-AC-001: observed failure'],
    })), `actual FAIL with ${source} disposition`);
    assert(accepted.verification[0].verdict === 'FAIL', 'Disposition changed the actual FAIL.');
  }
  const historyTask = navTask(PRODUCT_T3, navWorkflow());
  historyTask.verify = [structuredClone(failed), navWorkflow({}, { attempt: '2' })];
  expectFinding(navRun('nav-later-skip-does-not-hide-fail', historyTask), 'TASK_WORKFLOW_RESULT_INCOMPLETE', 'error');
  historyTask.verify[0].verification[0].disposition = { ...continuation, decision: 'repair' };
  expectFinding(navRun('nav-skipped-repair-is-not-success', historyTask), 'TASK_WORKFLOW_RESULT_INCOMPLETE', 'error');
  historyTask.verify[0].verification[0].disposition = continuation;
  expectPass(navRun('nav-history-preserved-with-disposition', historyTask), 'historical negative explicitly disposed before later skip');
  historyTask.verify[0].verification[0].disposition = { ...continuation, decision: 'repair' };
  historyTask.verify[1] = navWorkflow({ verify: ['secondary'] }, { attempt: '2', verification: [probe('secondary')] });
  historyTask.verification_targets = ['FT-001-AC-001: outcome probe'];
  expectPass(navRun('nav-repair-then-proof', historyTask), 'repair with later actual selected PASS');

  // A retained intermediate result cannot satisfy repair when that attempt did
  // not select the participant, even if the current attempt skips verification.
  const unselectedRepair = structuredClone(historyTask);
  unselectedRepair.verify[1].selected.verify = [];
  unselectedRepair.verify.push(navWorkflow({}, { attempt: '3' }));
  expectFinding(navRun('nav-unselected-historical-proof-cannot-close-repair', unselectedRepair), 'TASK_WORKFLOW_RESULT_INCOMPLETE', 'error');

  for (const [name, workflow] of [
    ['after-implementation', navWorkflow({}, { verification: undefined, red_verification: undefined })],
    ['after-review', secondaryOnly],
    ['partial-effects', navWorkflow({}, { implementation: 'partial', evidence: ['partial source edit retained; deployment not attempted'], local_checks: undefined, verification: undefined, red_verification: undefined })],
  ]) {
    const record = navTask(PRODUCT_T3, workflow, { status: 'in_progress', verificationTargets: ['FT-001-AC-001: outcome'] });
    const root = createFixture(`nav-recovery-${name}`, { tasks: [record] });
    const path = join(root, `.memory-bank/tasks/${record.id}.task.json`);
    const before = readFileSync(path, 'utf8');
    expectPass(JSON.parse(runDoctor(root, ['--strict', '--json']).stdout), `recovery ${name}`);
    assert(readFileSync(path, 'utf8') === before && !existsSync(join(root, '.protocols')), 'Read-only recovery diagnostic replayed or rewrote evidence.');
  }

  expectFinding(navRun('nav-missing-selected-result', navTask(PRODUCT_T3, navWorkflow({ verify: ['main'] }))), 'TASK_WORKFLOW_RESULT_INCOMPLETE', 'error');
  expectFinding(navRun('nav-invalid-selection', navTask(PRODUCT_T3, navWorkflow({ verify: ['main', 'main'] }))), 'TASK_WORKFLOW_EVIDENCE_INVALID', 'error');
  expectFinding(navRun('nav-missing-selected-report', navTask(PRODUCT_T3, navWorkflow({ protocols: ['handoff.md'] }))), 'TASK_SELECTED_PROTOCOL_MISSING', 'error');
  expectFinding(navRun('nav-incomplete-implementation', navTask(PRODUCT_T3, navWorkflow({}, { implementation: 'partial' }))), 'TASK_WORKFLOW_RESULT_INCOMPLETE', 'error');

  const noDesign = navTask(PRODUCT_T2, navWorkflow());
  expectPass(navRun('nav-design-without-optional-matrix', navTask(PRODUCT_FIRST, navWorkflow({ design: true })), {
    files: [{ rel: '.memory-bank/spec-backbone.md', content: '# Spec Backbone\n\n## Global Backbone Status\n- Status: complete\n- Planning Revision: 1\n\nAccepted fixture boundary is recorded in contracts/fixture.md.\n' }],
  }), 'selected Nav design does not require an optional area matrix');
  const absentDesign = ['.memory-bank/spec-backbone.md', '.memory-bank/spec-index.md', '.memory-bank/contracts/fixture.md'];
  expectPass(navRun('nav-no-design-bundle-real-lint', noDesign, { omit: absentDesign, realLint: true }), 'disabled design without backbone/revision/spec bundle under real lint');
  const badIdentity = structuredClone(noDesign); badIdentity.tier = 'T3';
  const badIdentityReport = navRun('nav-skips-do-not-fix-identity', badIdentity, { omit: absentDesign, realLint: true });
  expectFinding(badIdentityReport, 'MB_LINT_FAILED', 'error');
  assert(JSON.stringify(badIdentityReport).includes('tier'), 'Malformed identity failed for an unrelated reason.');
  const badDependency = structuredClone(noDesign); badDependency.depends_on = [PRODUCT_SECOND];
  const dependencyReport = navRun('nav-skips-do-not-fix-dependency', badDependency, { omit: absentDesign, realLint: true });
  expectFinding(dependencyReport, 'MB_LINT_FAILED', 'error');
  assert(JSON.stringify(dependencyReport).includes('unknown task'), 'Missing dependency failed for an unrelated reason.');

  const featureReview = navTask(PRODUCT_T2, navWorkflow({ feature_red_verify: true }));
  expectFinding(navRun('nav-feature-red-selected-missing', featureReview), 'FEATURE_RED_VERIFY_VERDICT_MISSING', 'error');
  featureReview.verify.push({ stage: 'feature_red_verify', feature: 'FT-001', verdict: 'semantic-pass', evidence: ['Feature outcome and integration inspected'] });
  expectPass(navRun('nav-feature-red-inline', featureReview), 'selected feature review with inline evidence');
  featureReview.verify[0].selected.feature_red_verify = false;
  featureReview.verify[1].verdict = 'semantic-fail';
  expectFinding(navRun('nav-feature-fail-not-hidden-by-disable', featureReview), 'FEATURE_RED_VERIFY_VERDICT_MISSING', 'error');
  featureReview.verify[1].disposition = continuation;
  expectPass(navRun('nav-feature-negative-disposition', featureReview), 'feature negative retained with explicit disposition');

  console.log('mb-doctor readiness, brownfield, and acceptance-trace regression passed');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
