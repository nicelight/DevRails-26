#!/usr/bin/env node

import {
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

function createFixture(name, { foundation, tasks = [], directories = [], files = [] }) {
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

    if (DONE_STATUSES.has(record.status) && (record.tier === 'T0' || record.tier === 'T1')) {
      writeFixture(
        root,
        `.protocols/${record.id}/run.md`,
        '# Compact run\n\n- Evidence: fixture result\n\nVERDICT: PASS\n',
      );
    }
    if (DONE_STATUSES.has(record.status) && (record.tier === 'T2' || record.tier === 'T3')) {
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

  const emptyStrict = runCase('empty-strict', {}, ['--strict']);
  expectFinding(emptyStrict, 'TASK_INDEX_EMPTY', 'error');

  const noFoundationFixture = { tasks: [task(PRODUCT_FIRST)] };
  const noFoundationDefault = runCase('no-foundation-default', noFoundationFixture);
  expectPass(noFoundationDefault, 'missing foundation default');
  expectFinding(noFoundationDefault, 'FOUNDATION_ANCHORS_INVALID', 'warning');
  const noFoundationStrict = runCase('no-foundation-strict', noFoundationFixture, ['--strict']);
  expectFinding(noFoundationStrict, 'FOUNDATION_ANCHORS_INVALID', 'error');

  const invalidAnchors = runCase('invalid-anchors', {
    foundation: foundationMarkdown(true, 'not_required'),
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

  console.log('mb-doctor readiness, brownfield, and acceptance-trace regression passed');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
