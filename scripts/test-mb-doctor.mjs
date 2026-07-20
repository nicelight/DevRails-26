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
} = {}) {
  const idMatch = id.match(/-FT-([0-9]{3,})-W([0-9]+)$/);
  const taskFeature = feature ?? `FT-${idMatch?.[1]}`;
  const taskWave = wave ?? `W${idMatch?.[2]}`;
  return {
    id,
    tier: 'T0',
    feature: taskFeature,
    wave: taskWave,
    status,
    depends_on: dependsOn,
    verify: status === 'failed' ? ['VERDICT: FAIL\nEvidence: fixture failure'] : [],
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

    if (record.status === 'done') {
      writeFixture(
        root,
        `.protocols/${record.id}/run.md`,
        '# Compact run\n\n- Evidence: fixture result\n\nVERDICT: PASS\n',
      );
    }
    if (record.status === 'failed') {
      writeFixture(root, `.memory-bank/bugs/${record.id}.md`, `# Fixture failure\n\n${record.id}\n`);
    }
  });

  featureIds.forEach((featureId) => {
    const slug = featureId === 'FT-000' ? 'foundation' : 'fixture';
    writeFixture(root, `.memory-bank/features/${featureId}-${slug}.md`, `---
description: Fixture feature.
---
# ${featureId}
`);
  });

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

  console.log('mb-doctor Foundation readiness regression passed');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
