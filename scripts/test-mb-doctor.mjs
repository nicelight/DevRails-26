#!/usr/bin/env node

import {
  mkdirSync,
  mkdtempSync,
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
const tempRoot = mkdtempSync(join(tmpdir(), 'devrails26-mb-doctor-'));

const FOUNDATION_GATE = 'TASK-001-T0-FT-000-W0';
const FOUNDATION_EXTRA = 'TASK-002-T0-FT-000-W0';
const PRODUCT_FIRST = 'TASK-101-T0-FT-001-W1';
const PRODUCT_SECOND = 'TASK-102-T0-FT-001-W1';
const PRODUCT_T2 = 'TASK-201-T2-FT-001-W1';

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
    title: 'Fixture task',
    tier,
    feature: taskFeature,
    wave: taskWave,
    status,
    depends_on: dependsOn,
    reqs: reqs ?? (featureNumber ? [`REQ-${featureNumber}`] : []),
    touched_files: ['src/fixture.mjs'],
    gates: [],
    verify: verify ?? (
      status === 'done'
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

  writeFixture(root, 'scripts/mb-lint.mjs', "#!/usr/bin/env node\nconsole.log('fixture lint passed');\n");
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

    if (record.status === 'done' && (record.tier === 'T0' || record.tier === 'T1')) {
      writeFixture(
        root,
        `.protocols/${record.id}/run.md`,
        '# Compact run\n\n- Evidence: fixture result\n\nVERDICT: PASS\n',
      );
    }
    if (record.status === 'done' && (record.tier === 'T2' || record.tier === 'T3')) {
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
      && record.status === 'done'
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
  const result = spawnSync(process.execPath, [doctor, ...flags, '--json'], {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.error) fail(`${name}: ${result.error.message}`);

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

try {
  const emptyDefault = runCase('empty-default', {});
  expectPass(emptyDefault, 'empty default');
  expectFinding(emptyDefault, 'TASK_INDEX_EMPTY', 'info');

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

  console.log('mb-doctor readiness and acceptance-trace regression passed');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
