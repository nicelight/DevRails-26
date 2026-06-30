#!/usr/bin/env node
/**
 * mb-doctor.mjs
 *
 * Deterministic readiness gate for autonomous/autopilot Memory Bank runs.
 * Structural validation remains the responsibility of scripts/mb-lint.mjs.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TASK_INDEX_REL = '.memory-bank/tasks/index.json';
const TASK_BACKLOG_REL = '.memory-bank/tasks/backlog.md';
const LINT_REL = 'scripts/mb-lint.mjs';
const CONSTITUTION_REL = '.memory-bank/constitution.md';
const MB_INDEX_REL = '.memory-bank/index.md';
const SPEC_INDEX_REL = '.memory-bank/spec-index.md';
const SPEC_BACKBONE_REL = '.memory-bank/spec-backbone.md';
const FOUNDATION_REL = '.memory-bank/foundation.md';
const TASK_ID_FORMAT = 'TASK-NNN-TN-FT-NNN-WN';
const TASK_ID_RE = /^TASK-[0-9]{3}-T[0-3]-FT-[0-9]{3}-W[0-9]+$/;
const FOUNDATION_TASK_ID_FORMAT = 'TASK-NNN-TN-FT-000-WN';
const FOUNDATION_TASK_ID_RE = /^TASK-[0-9]{3}-T[0-3]-FT-000-W[0-9]+$/;
const FOUNDATION_GATE_PENDING = 'pending_foundation_to_tasks';
const VALID_STATUSES = new Set(['planned', 'ready', 'in_progress', 'blocked', 'done', 'failed']);
const VALID_TIERS = new Set(['T0', 'T1', 'T2', 'T3']);
const VALID_CLARIFICATION_STATUSES = new Set(['pending', 'complete', 'blocked']);
const COMPLETE_BACKBONE_AREA_STATUSES = new Set(['authoritative', 'not_applicable']);
const FOUNDATION_ONLY_DEFERRED_BACKBONE_STATUSES = new Set(['needed_before_tasks']);
const COMPACT_TIERS = new Set(['T0', 'T1']);
const LINK_REQUIRED_TIERS = new Set(['T1', 'T2', 'T3']);
const TERMINAL_STATUSES = new Set(['done', 'failed']);
const FULL_PROTOCOL_TIERS = new Set(['T2', 'T3']);
const SDD_SPEC_REQUIRED_TIERS = new Set(['T2', 'T3']);
const FULL_PROTOCOL_STATUSES = new Set(['in_progress', 'done', 'failed']);
const FULL_PROTOCOL_FILES = ['context.md', 'plan.md', 'progress.md', 'verification.md', 'handoff.md'];
const REQ_ID_RE = /^REQ-[0-9]{3,}$/;
const FT_ID_RE = /^FT-[0-9]{3,}$/;
// `tech-specs` remains readable for brownfield migration evidence. New planning
// uses subject-based canonical paths; semantic hub-only rejection belongs to
// /review-tasks-plan, not this mechanical doctor.
const SDD_SPEC_DIRS = ['tech-specs', 'architecture', 'contracts', 'domains', 'states', 'adrs', 'testing', 'guides', 'runbooks'];
const SDD_SPEC_PATH_RE = /(?:\.\/)?\.memory-bank\/(?:tech-specs|architecture|contracts|domains|states|adrs|testing|guides|runbooks)\/[^\s"'`]+/i;
const ARCHITECTURE_CONTRACT_ADR_PATH_RE = /(?:\.\/)?\.memory-bank\/(?:architecture|contracts|adrs)\/[^\s"'`]+/i;
const EVIDENCE_WORD_RE = /\b(evidence|result|fail|failed|error|output|log|artifact|report)\b/i;
const PASS_EVIDENCE_RE = /^\s*VERDICT: PASS\s*$/im;
const FAIL_EVIDENCE_RE = /\bverdict\s*:?\s*fail(?:ed)?\b|\bfail(?:ed)?\b|\berror\b/i;
const RED_VERIFY_PASS_RE = /^\s*SEMANTIC_VERDICT: semantic-pass\s*$/im;
const T3_HUMAN_CHECKPOINT_MARKER = 'HUMAN_CHECKPOINT: done';
const T3_ROLLBACK_RECOVERY_MARKER = 'ROLLBACK_RECOVERY_NOTE: present';
const PATH_MARKER_RE =
  /(?:^|[\s"`'])(?:\.{1,2}\/|\/|[A-Za-z]:\\)[^\s"`']+|\b[A-Za-z0-9_.-]+\/[A-Za-z0-9_.\/-]+\b|\b[\w.-]+\.(?:md|txt|log|json|xml|html|htm|png|jpg|jpeg|webm|mp4)\b/i;

const options = parseArgs(process.argv.slice(2));
const findings = [];
let featureClarificationCache;

if (options.help) {
  printHelp();
  process.exit(0);
}

if (options.errors.length) {
  for (const message of options.errors) {
    addFinding('error', 'CLI_INVALID_ARGUMENT', message, { suggested_fix: 'Use only --strict and/or --json.' });
  }
  finish();
}

runMbLint();
checkObsoleteBacklog();
checkConstitutionStructure();
checkBackboneReadiness();
checkFeatureClarificationReadiness();
checkTaskReadiness();
finish();

function parseArgs(args) {
  const parsed = {
    strict: false,
    json: false,
    help: false,
    errors: [],
  };

  for (const arg of args) {
    if (arg === '--strict') {
      parsed.strict = true;
    } else if (arg === '--json') {
      parsed.json = true;
    } else if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else {
      parsed.errors.push(`Unknown flag: ${arg}`);
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`mb-doctor

Usage:
  node scripts/mb-doctor.mjs [--strict] [--json]

Flags:
  --strict  Require an executable autonomous/autopilot task queue.
  --json    Emit stable machine-readable JSON findings.
`);
}

function runMbLint() {
  const lintAbs = path.join(ROOT, LINT_REL);
  if (!isFile(lintAbs)) {
    const severity = options.strict ? 'error' : 'warning';
    addFinding(severity, 'MB_LINT_SCRIPT_MISSING', `${LINT_REL} not found. Install/copy mb-lint before running mb-doctor.`, {
      path: LINT_REL,
      suggested_fix: 'Create scripts/mb-lint.mjs from the mb-garden asset and rerun mb-doctor.',
    });
    return;
  }

  const result = spawnSync(process.execPath, [lintAbs], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.error) {
    addFinding('error', 'MB_LINT_FAILED', `Failed to run ${LINT_REL}: ${result.error.message}`, {
      path: LINT_REL,
      details: { error: result.error.message },
    });
    return;
  }

  if (result.status !== 0) {
    addFinding('error', 'MB_LINT_FAILED', `${LINT_REL} failed. Fix lint errors before autonomous/autopilot execution.`, {
      path: LINT_REL,
      details: {
        exit_code: result.status,
        stdout: splitLines(result.stdout),
        stderr: splitLines(result.stderr),
      },
      suggested_fix: `Run node ${LINT_REL} and fix reported errors.`,
    });
    return;
  }

  addFinding('info', 'MB_LINT_PASSED', `${LINT_REL} passed.`, {
    path: LINT_REL,
  });
}

function checkObsoleteBacklog() {
  if (!isFile(path.join(ROOT, TASK_BACKLOG_REL))) return;

  addFinding(
    'error',
    'TASK_BACKLOG_MD_PRESENT',
    `${TASK_BACKLOG_REL} is obsolete. Task execution must use JSON task records only.`,
    {
      path: TASK_BACKLOG_REL,
      suggested_fix: `Remove ${TASK_BACKLOG_REL} and use ${TASK_INDEX_REL} plus indexed TASK-*.task.json records.`,
    }
  );
}

function checkConstitutionStructure() {
  if (!options.strict) return;

  const issues = [];
  const constitutionAbs = path.join(ROOT, CONSTITUTION_REL);
  const indexAbs = path.join(ROOT, MB_INDEX_REL);
  const specIndexAbs = path.join(ROOT, SPEC_INDEX_REL);
  const specBackboneAbs = path.join(ROOT, SPEC_BACKBONE_REL);

  if (!isFile(constitutionAbs)) {
    issues.push(`${CONSTITUTION_REL} missing`);
  }

  if (!isFile(indexAbs)) {
    issues.push(`${MB_INDEX_REL} missing`);
  } else {
    const text = fs.readFileSync(indexAbs, 'utf8');
    if (!text.includes('constitution.md')) issues.push(`${MB_INDEX_REL} does not mention constitution.md`);
  }

  if (!isFile(specIndexAbs)) {
    issues.push(`${SPEC_INDEX_REL} missing`);
  } else {
    const text = fs.readFileSync(specIndexAbs, 'utf8');
    if (!text.includes('constitution.md')) issues.push(`${SPEC_INDEX_REL} does not mention constitution.md`);
  }

  if (!isFile(specBackboneAbs)) {
    issues.push(`${SPEC_BACKBONE_REL} missing`);
  }

  if (!issues.length) return;

  addFinding('error', 'CONSTITUTION_STRUCTURE_INVALID', 'Strict mode requires Constitution file and router links.', {
    path: CONSTITUTION_REL,
    details: { issues },
    suggested_fix: `Create ${CONSTITUTION_REL}, ${SPEC_INDEX_REL}, and ${SPEC_BACKBONE_REL}; link constitution.md from ${MB_INDEX_REL} and ${SPEC_INDEX_REL}.`,
  });
}

function checkBackboneReadiness() {
  const specBackboneAbs = path.join(ROOT, SPEC_BACKBONE_REL);
  const specIndexAbs = path.join(ROOT, SPEC_INDEX_REL);
  const severity = options.strict ? 'error' : 'warning';

  checkSpecIndexPurity(specIndexAbs, specBackboneAbs, severity);

  if (!isFile(specBackboneAbs)) {
    let migrationHint = undefined;
    if (isFile(specIndexAbs)) {
      const oldText = fs.readFileSync(specIndexAbs, 'utf8').replace(/\r\n/g, '\n');
      if (extractBackboneStatusSection(oldText)) {
        migrationHint = `${SPEC_INDEX_REL} still contains old Global backbone status. Move readiness state to ${SPEC_BACKBONE_REL} and keep spec-index as a pure registry.`;
      }
    }

    addFinding(
      severity,
      'SPEC_BACKBONE_NOT_READY',
      `${SPEC_BACKBONE_REL}: mandatory /spec-design status is missing.`,
      {
        path: SPEC_BACKBONE_REL,
        details: { status: 'missing', migration_hint: migrationHint },
        suggested_fix:
          `Run /spec-init to create ${SPEC_BACKBONE_REL}, then /spec-design after /prd. Record Global Backbone Status complete, or minimal with explicit not_applicable areas; resolve blocked decisions before /prd-to-tasks.`,
      }
    );
    return;
  }

  const text = fs.readFileSync(specBackboneAbs, 'utf8').replace(/\r\n/g, '\n');
  const section = extractBackboneStatusSection(text);
  const status = extractBackboneStatusFromSection(section);
  const prePrdStatus = extractPrePrdStatus(text);
  if (status === 'complete') {
    const matrix = analyzeBackboneAreaMatrix(text);
    if (matrix.ready) return;
    if (matrixAllowsFoundationOnlyStrictGate(matrix) && isFoundationOnlyTaskQueue()) return;

    addFinding(
      severity,
      'SPEC_BACKBONE_MATRIX_NOT_READY',
      `${SPEC_BACKBONE_REL}: complete Global Backbone Status requires authoritative or not_applicable matrix rows.`,
      {
        path: SPEC_BACKBONE_REL,
        details: { issues: matrix.issues },
        suggested_fix:
          'Update ## Backbone Area Matrix so every row status is authoritative or not_applicable before marking Global Backbone Status complete.',
      }
    );
    return;
  }
  if (status === 'minimal' && hasExplicitBackboneNotApplicableAreas(section)) return;

  const details = { status: status ?? 'missing' };
  if (prePrdStatus) details.pre_prd_status = prePrdStatus;
  if (status === 'minimal') details.issue = 'minimal backbone must record not_applicable areas';
  if (prePrdStatus === 'ready_for_prd' && !options.strict) {
    details.phase = 'post_spec_init_pre_prd';
    details.downstream_task_readiness = false;

    addFinding(
      severity,
      'SPEC_BACKBONE_NOT_READY',
      `${SPEC_BACKBONE_REL}: pre-PRD framing is prepared for /prd; Global Backbone Status is intentionally pending until /spec-design.`,
      {
        path: SPEC_BACKBONE_REL,
        details,
        suggested_fix:
          'Continue with /prd, then run /spec-design before /prd-to-tasks, /autopilot, or autonomous scheduler mode.',
      }
    );
    return;
  }

  addFinding(
    severity,
    'SPEC_BACKBONE_NOT_READY',
    `${SPEC_BACKBONE_REL}: mandatory /spec-design status is not ready for downstream task execution.`,
    {
      path: SPEC_BACKBONE_REL,
      details,
      suggested_fix:
        'Run /spec-design after /prd. Record Global Backbone Status complete, or minimal with explicit not_applicable areas; resolve blocked decisions before /prd-to-tasks.',
    }
  );
}

function checkSpecIndexPurity(specIndexAbs, specBackboneAbs, severity) {
  if (!isFile(specIndexAbs) || !isFile(specBackboneAbs)) return;

  const text = fs.readFileSync(specIndexAbs, 'utf8').replace(/\r\n/g, '\n');
  const staleSections = findStaleSpecIndexSections(text);
  if (!staleSections.length) return;

  addFinding(severity, 'SPEC_INDEX_NOT_PURE', `${SPEC_INDEX_REL}: stale non-index sections remain after spec-backbone split.`, {
    path: SPEC_INDEX_REL,
    details: { sections: staleSections },
    suggested_fix:
      `Move backbone/status content to ${SPEC_BACKBONE_REL} and keep ${SPEC_INDEX_REL} as a pure registry/planned-spec index.`,
  });
}

function findStaleSpecIndexSections(text) {
  const stale = [];
  const sectionRe = /^##\s+(Feature Design Status Map|Global backbone status|Global Backbone Status|Backbone Area Matrix)\s*$/gim;
  for (const match of text.matchAll(sectionRe)) {
    stale.push(match[1]);
  }
  return [...new Set(stale)];
}

function extractBackboneStatusSection(text) {
  return text.match(/^##\s+Global Backbone Status\b([\s\S]*?)(?=^##\s+|(?![\s\S]))/im)?.[1]
    ?? text.match(/^##\s+Global backbone status\b([\s\S]*?)(?=^##\s+|(?![\s\S]))/im)?.[1]
    ?? '';
}

function extractBackboneStatusFromSection(section) {
  const statusMatch = section.match(/(?:^|\n)\s*[-*]?\s*Status\s*:\s*(complete|minimal|blocked|unknown)\b/i);
  return statusMatch?.[1]?.toLowerCase();
}

function extractPrePrdStatus(text) {
  const section = text.match(/^##\s+Pre-PRD Spec Status\b([\s\S]*?)(?=^##\s+|(?![\s\S]))/im)?.[1] ?? '';
  const statusMatch = section.match(/(?:^|\n)\s*[-*]?\s*Status\s*:\s*(ready_for_prd|blocked)\b/i);
  return statusMatch?.[1]?.toLowerCase();
}

function hasExplicitBackboneNotApplicableAreas(section) {
  const lines = section.split('\n');
  const markerIndex = lines.findIndex((rawLine) => /^\s*[-*]\s*Not applicable areas\s*:/i.test(rawLine));
  if (markerIndex === -1) return false;

  const markerIndent = leadingSpaceCount(lines[markerIndex]);
  for (const rawLine of lines.slice(markerIndex + 1)) {
    if (!rawLine.trim()) continue;

    const indent = leadingSpaceCount(rawLine);
    if (indent <= markerIndent && /^\s*[-*]\s+\S/.test(rawLine)) break;
    if (indent <= markerIndent) continue;

    const childMatch = rawLine.match(/^\s*[-*]\s+(.+)$/);
    if (!childMatch) continue;
    if (hasNotApplicableRationale(childMatch[1])) return true;
  }

  return false;
}

function hasNotApplicableRationale(text) {
  const normalized = String(text ?? '').trim();
  if (!normalized || /\b(?:TBD|TODO|none|n\/a)\b/i.test(normalized)) return false;
  return /\bnot_applicable\b\s*(?:-|:)\s*\S+/i.test(normalized);
}

function analyzeBackboneAreaMatrix(text) {
  const section = extractBackboneAreaMatrixSection(text);
  if (!section) {
    return { ready: false, issues: [{ issue: 'matrix_missing' }] };
  }

  const rows = parseMarkdownTableRows(section);
  if (!rows.length) {
    return { ready: false, issues: [{ issue: 'matrix_rows_missing' }] };
  }

  const issues = rows
    .map((row) => {
      const status = normalizeMatrixCell(row.status);
      if (COMPLETE_BACKBONE_AREA_STATUSES.has(status)) return null;
      return {
        area: row.area || 'unknown',
        status: status || 'missing',
        issue: status ? 'status_not_ready' : 'status_missing',
      };
    })
    .filter(Boolean);

  return { ready: issues.length === 0, issues };
}

function matrixAllowsFoundationOnlyStrictGate(matrix) {
  if (!options.strict) return false;
  if (!Array.isArray(matrix?.issues) || matrix.issues.length === 0) return false;
  return matrix.issues.every((issue) => FOUNDATION_ONLY_DEFERRED_BACKBONE_STATUSES.has(issue.status));
}

function isFoundationOnlyTaskQueue() {
  const indexRead = readJson(TASK_INDEX_REL);
  if (!indexRead.ok) return false;

  const index = indexRead.value;
  if (!index || typeof index !== 'object' || Array.isArray(index) || !Array.isArray(index.tasks)) return false;
  if (index.tasks.length === 0) return false;

  for (const entry of index.tasks) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    if (typeof entry.id !== 'string' || !TASK_ID_RE.test(entry.id)) return false;
    if (typeof entry.file !== 'string' || !entry.file.endsWith('.task.json')) return false;

    const rel = normalizeRel(path.join('.memory-bank/tasks', entry.file));
    if (!isFile(path.join(ROOT, rel))) return false;

    const taskRead = readJson(rel);
    if (!taskRead.ok || !taskRead.value || typeof taskRead.value !== 'object' || Array.isArray(taskRead.value)) return false;
    if (taskRead.value.id !== entry.id) return false;
    if (taskRead.value.feature !== 'FT-000') return false;
  }

  return true;
}

function extractBackboneAreaMatrixSection(text) {
  return text.match(/^##\s+Backbone Area Matrix\b([\s\S]*?)(?=^##\s+|(?![\s\S]))/im)?.[1] ?? '';
}

function parseMarkdownTableRows(section) {
  const tableLines = section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && line.includes('|', 1));

  if (tableLines.length < 2) return [];

  const header = splitMarkdownTableRow(tableLines[0]).map((cell) => cell.toLowerCase());
  const statusIndex = header.indexOf('status');
  const areaIndex = header.indexOf('area');
  if (statusIndex === -1) return [];

  return tableLines.slice(1).flatMap((line) => {
    const cells = splitMarkdownTableRow(line);
    if (isMarkdownSeparatorRow(cells)) return [];
    return [{
      area: cells[areaIndex] ?? '',
      status: cells[statusIndex] ?? '',
    }];
  });
}

function splitMarkdownTableRow(line) {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isMarkdownSeparatorRow(cells) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function normalizeMatrixCell(value) {
  return String(value ?? '')
    .trim()
    .replace(/^[`*_]+|[`*_]+$/g, '')
    .toLowerCase();
}

function leadingSpaceCount(value) {
  return String(value ?? '').match(/^\s*/)?.[0].length ?? 0;
}

function checkTaskReadiness() {
  const indexRead = readJson(TASK_INDEX_REL);
  if (!indexRead.ok) {
    addFinding('error', 'TASK_INDEX_INVALID', indexRead.message, {
      path: TASK_INDEX_REL,
      suggested_fix: 'Create a valid JSON task index or run mb-init/prd-to-tasks.',
    });
    return;
  }

  const index = indexRead.value;
  if (!index || typeof index !== 'object' || Array.isArray(index) || !Array.isArray(index.tasks)) {
    addFinding('error', 'TASK_INDEX_INVALID', `${TASK_INDEX_REL} must be a JSON object with a tasks array.`, {
      path: TASK_INDEX_REL,
      suggested_fix: 'Use { "version": 1, "tasks": [] } for a fresh skeleton.',
    });
    return;
  }

  if (index.tasks.length === 0) {
    const severity = options.strict ? 'error' : 'info';
    addFinding(severity, 'TASK_INDEX_EMPTY', 'No task records yet. This is valid for a fresh skeleton.', {
      path: TASK_INDEX_REL,
      suggested_fix: options.strict
        ? 'Create task records via /prd-to-tasks FT-XXX after /write-prd and /prd.'
        : undefined,
    });
    addQueueSummary([], []);
    return;
  }

  const { records, invalidEntries } = loadTaskRecords(index.tasks);
  const orderedRecords = [...records.values()];

  checkTasksFromUnclarifiedFeatures(orderedRecords);
  checkFoundationReadiness(orderedRecords, records);

  for (const record of orderedRecords) {
    checkFoundationWave(record);
    checkReadyDependencies(record, records);
    checkInProgressProtocol(record);
    checkFullProtocolTask(record);
    checkCompactDoneProtocol(record);
    checkTerminalEvidence(record);
    checkReqFeatureLinkage(record);
    checkSddSpecLinkage(record);
    checkArchitectureReferencePresence(record);
    checkSingleCardHandoffCompleteness(record);
  }

  checkFailedTaskClosure(orderedRecords);
  checkT2FeatureSemanticCompletion(orderedRecords);
  checkFailedDependentsBlocked(orderedRecords);
  checkQueueState(orderedRecords, records, invalidEntries);
  addQueueSummary(orderedRecords, invalidEntries);
}

function loadTaskRecords(entries) {
  const records = new Map();
  const invalidEntries = [];

  entries.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      invalidEntries.push({ index });
      addFinding('error', 'TASK_INDEX_INVALID', `${TASK_INDEX_REL}: tasks[${index}] must be an object.`, {
        path: TASK_INDEX_REL,
      });
      return;
    }

    const id = entry.id;
    const file = entry.file;
    if (typeof id !== 'string' || !TASK_ID_RE.test(id) || typeof file !== 'string' || !file.endsWith('.task.json')) {
      invalidEntries.push({ index, id });
      addFinding('error', 'TASK_INDEX_INVALID', `${TASK_INDEX_REL}: tasks[${index}] must contain valid id and file.`, {
        path: TASK_INDEX_REL,
        task_id: typeof id === 'string' ? id : undefined,
      });
      return;
    }

    const rel = normalizeRel(path.join('.memory-bank/tasks', file));
    if (!isFile(path.join(ROOT, rel))) {
      invalidEntries.push({ index, id });
      addFinding('error', 'TASK_RECORD_MISSING', `${rel} not found.`, {
        path: rel,
        task_id: id,
      });
      return;
    }

    const read = readJson(rel);
    if (!read.ok) {
      invalidEntries.push({ index, id });
      addFinding('error', 'TASK_RECORD_INVALID', read.message, {
        path: rel,
        task_id: id,
      });
      return;
    }

    const task = read.value;
    if (!task || typeof task !== 'object' || Array.isArray(task)) {
      invalidEntries.push({ index, id });
      addFinding('error', 'TASK_RECORD_INVALID', `${rel} must be a JSON object.`, {
        path: rel,
        task_id: id,
      });
      return;
    }

    if (typeof task.id !== 'string' || task.id !== id) {
      addFinding('error', 'TASK_RECORD_INVALID', `${rel}: task id must match index id ${id}.`, {
        path: rel,
        task_id: id,
      });
    }
    if (!VALID_STATUSES.has(task.status)) {
      addFinding('error', 'TASK_RECORD_INVALID', `${rel}: invalid or missing task status.`, {
        path: rel,
        task_id: id,
      });
    }
    if (!VALID_TIERS.has(task.tier)) {
      addFinding('error', 'TASK_RECORD_INVALID', `${rel}: invalid or missing task tier.`, {
        path: rel,
        task_id: id,
      });
    }
    if (!Array.isArray(task.depends_on)) {
      addFinding('error', 'TASK_RECORD_INVALID', `${rel}: depends_on must be an array.`, {
        path: rel,
        task_id: id,
      });
    }

    records.set(id, { id, rel, task });
  });

  return { records, invalidEntries };
}

function checkFoundationWave(record) {
  const { id, rel, task } = record;
  if (task.wave !== 'W0') return;
  if (task.feature === 'FT-000') return;

  const severity = options.strict ? 'error' : 'warning';
  addFinding(severity, 'TASK_W0_NON_FOUNDATION', `${rel}: W0 is reserved for FT-000 foundation tasks.`, {
    path: rel,
    task_id: id,
    details: { feature: task.feature, wave: task.wave },
    suggested_fix: 'Move product task work to W1/W2/W3, or create a real FT-000 foundation-extension task through /foundation-to-tasks.',
  });
}

function checkFoundationReadiness(orderedRecords, records) {
  const foundationAbs = path.join(ROOT, FOUNDATION_REL);
  if (!isFile(foundationAbs)) return;

  const severity = options.strict ? 'error' : 'warning';
  const text = fs.readFileSync(foundationAbs, 'utf8').replace(/\r\n/g, '\n');
  const anchors = parseFoundationAnchors(text);
  const issues = validateFoundationAnchors(anchors);

  if (issues.length) {
    addFinding(severity, 'FOUNDATION_ANCHORS_INVALID', `${FOUNDATION_REL}: Gate Anchors are missing or invalid.`, {
      path: FOUNDATION_REL,
      details: { anchors, issues },
      suggested_fix:
        `Record Gate Anchors with Foundation Required true|false, Foundation Requirement REQ-000, Foundation Pseudo-Feature FT-000, and Foundation Gate Task ${FOUNDATION_GATE_PENDING}|${FOUNDATION_TASK_ID_FORMAT}|not_required.`,
    });
    return;
  }

  if (anchors.required !== true) return;
  if (anchors.gateTask === FOUNDATION_GATE_PENDING) return;

  const gate = records.get(anchors.gateTask);
  if (!gate || gate.task.feature !== 'FT-000') {
    addFinding(severity, 'FOUNDATION_GATE_TASK_INVALID', `${FOUNDATION_REL}: foundation gate task is missing, unindexed, or not FT-000.`, {
      path: FOUNDATION_REL,
      task_id: anchors.gateTask,
      details: {
        gate_task: anchors.gateTask,
        indexed: Boolean(gate),
        feature: gate?.task?.feature,
        status: gate?.task?.status,
      },
      suggested_fix: 'Run /foundation-to-tasks, then execute/verify the FT-000 queue until the final foundation gate task is done.',
    });
    return;
  }

  const productRecords = orderedRecords.filter((record) => record.task.feature !== 'FT-000');

  if (productRecords.length && gate.task.status !== 'done') {
    addFinding(severity, 'FOUNDATION_GATE_TASK_INVALID', `${gate.rel}: foundation gate task is not done.`, {
      path: gate.rel,
      task_id: anchors.gateTask,
      details: { status: gate.task.status },
      suggested_fix: 'Finish /execute, /verify, and /mb-sync for the foundation gate task before product feature execution.',
    });
  }

  const missing = productRecords
    .filter((record) => !taskDependsOn(record.id, anchors.gateTask, records))
    .map((record) => ({ id: record.id, path: record.rel, feature: record.task.feature }));

  if (!missing.length) return;

  addFinding(severity, 'FOUNDATION_GATE_DEP_MISSING', `${FOUNDATION_REL}: product tasks are missing the required foundation gate dependency.`, {
    path: FOUNDATION_REL,
    task_id: anchors.gateTask,
    details: { gate_task: anchors.gateTask, tasks: missing },
    suggested_fix:
      'Update product task depends_on so every non-FT-000 task depends directly or transitively on the final foundation gate task.',
  });
}

function parseFoundationAnchors(text) {
  const section = text.match(/^##\s+Gate Anchors\b([\s\S]*?)(?=^##\s+|(?![\s\S]))/im)?.[1] ?? '';
  const value = (label) => {
    const match = section.match(new RegExp(`(?:^|\\n)\\s*[-*]\\s*${escapeRegExp(label)}\\s*:\\s*([^\\n]+)`, 'i'));
    return match?.[1]?.trim();
  };

  const requiredRaw = value('Foundation Required');
  const required = /^true$/i.test(requiredRaw ?? '')
    ? true
    : /^false$/i.test(requiredRaw ?? '')
      ? false
      : undefined;

  return {
    required,
    requirement: value('Foundation Requirement'),
    pseudoFeature: value('Foundation Pseudo-Feature'),
    gateTask: value('Foundation Gate Task'),
  };
}

function validateFoundationAnchors(anchors) {
  const issues = [];

  if (anchors.required !== true && anchors.required !== false) {
    issues.push('Foundation Required must be true or false');
  }
  if (anchors.requirement !== 'REQ-000') {
    issues.push('Foundation Requirement must be REQ-000');
  }
  if (anchors.pseudoFeature !== 'FT-000') {
    issues.push('Foundation Pseudo-Feature must be FT-000');
  }

  if (anchors.required === true) {
    if (anchors.gateTask !== FOUNDATION_GATE_PENDING && !FOUNDATION_TASK_ID_RE.test(anchors.gateTask ?? '')) {
      issues.push(`Foundation Gate Task must be ${FOUNDATION_GATE_PENDING} or ${FOUNDATION_TASK_ID_FORMAT} when foundation is required`);
    }
  } else if (anchors.required === false && anchors.gateTask !== 'not_required') {
    issues.push('Foundation Gate Task must be not_required when foundation is not required');
  }

  return issues;
}

function taskDependsOn(taskId, dependencyId, records, seen = new Set()) {
  if (taskId === dependencyId) return true;
  if (seen.has(taskId)) return false;
  seen.add(taskId);

  const record = records.get(taskId);
  const deps = Array.isArray(record?.task?.depends_on) ? record.task.depends_on : [];
  if (deps.includes(dependencyId)) return true;

  return deps.some((depId) => records.has(depId) && taskDependsOn(depId, dependencyId, records, seen));
}

function checkReadyDependencies(record, records) {
  const { id, rel, task } = record;
  if (task.status !== 'ready') return;
  if (!Array.isArray(task.depends_on)) return;

  const notDone = task.depends_on
    .map((depId) => records.get(depId))
    .filter((dep) => dep && dep.task.status !== 'done');

  if (!notDone.length) return;

  addFinding('error', 'TASK_READY_DEP_NOT_DONE', `${rel}: ready task has dependencies that are not done.`, {
    path: rel,
    task_id: id,
    details: {
      dependencies: notDone.map((dep) => ({ id: dep.id, status: dep.task.status })),
    },
    suggested_fix: 'Demote the task from ready or close its dependencies first.',
  });
}

function checkInProgressProtocol(record) {
  const { id, rel, task } = record;
  if (task.status !== 'in_progress') return;
  if (FULL_PROTOCOL_TIERS.has(task.tier)) return;
  if (isDirectory(path.join(ROOT, '.protocols', id))) return;

  const severity = options.strict ? 'error' : 'warning';
  addFinding(severity, 'TASK_IN_PROGRESS_WITHOUT_PROTOCOL', `${rel}: in_progress task has no .protocols/${id}/ directory.`, {
    path: rel,
    task_id: id,
    suggested_fix: `Create .protocols/${id}/ with the tier-appropriate protocol files or move the task out of in_progress.`,
  });
}

function checkFullProtocolTask(record) {
  const { id, rel, task } = record;
  if (!FULL_PROTOCOL_TIERS.has(task.tier)) return;
  if (!FULL_PROTOCOL_STATUSES.has(task.status)) return;

  const severity = options.strict ? 'error' : 'warning';
  const missing = missingFullProtocolFiles(id);
  if (missing.length) {
    addFinding(severity, 'TASK_FULL_PROTOCOL_MISSING', `${rel}: ${task.tier} ${task.status} task is missing full protocol files.`, {
      path: rel,
      task_id: id,
      details: {
        missing: missing.map((file) => normalizeRel(path.join('.protocols', id, file))),
      },
      suggested_fix: `Create .protocols/${id}/ with context.md, plan.md, progress.md, verification.md, and handoff.md.`,
    });
  }

  if (hasCompactOnlyProtocol(id)) {
    addFinding(severity, 'TASK_COMPACT_ONLY_PROTOCOL', `${rel}: ${task.tier} ${task.status} task uses compact-only protocol.`, {
      path: rel,
      task_id: id,
      suggested_fix: `Replace compact .protocols/${id}/run.md-only state with the full protocol file set.`,
    });
  }

  if (task.status === 'in_progress') return;

  if (!hasTaskStatusEvidence(task, task.status) && !hasProtocolOrArtifactStatusEvidence(id, task.status)) {
    const code = task.status === 'done' ? 'TASK_DONE_EVIDENCE_MISSING' : 'TASK_FAILED_EVIDENCE_MISSING';
    const expected = task.status === 'done' ? 'PASS' : 'FAIL/error';
    addFinding(severity, code, `${rel}: ${task.tier} ${task.status} task has no ${expected} verification evidence/verdict.`, {
      path: rel,
      task_id: id,
      suggested_fix: `Record ${expected} evidence in task.verify, .protocols/${id}/, or .tasks/${id}/.`,
    });
  }

  if (task.status === 'done' && task.tier === 'T3') {
    const redFiles = redVerificationFiles(id);
    if (!redFiles.length) {
      addFinding(severity, 'TASK_RED_VERIFY_EVIDENCE_MISSING', `${rel}: ${task.tier} done task has no red-verify evidence.`, {
        path: rel,
        task_id: id,
        suggested_fix: `Record red-verify evidence in .protocols/${id}/red-verification.md or .tasks/${id}/.`,
      });
    } else if (!hasClosureEligibleRedVerificationEvidence(redFiles)) {
      addFinding(
        severity,
        'TASK_RED_VERIFY_VERDICT_MISSING',
        `${rel}: ${task.tier} done task has no closure-eligible red-verify semantic verdict.`,
        {
          path: rel,
          task_id: id,
          details: { files: redFiles.map((file) => normalizeRel(path.relative(ROOT, file))) },
          suggested_fix: `Record SEMANTIC_VERDICT: semantic-pass in .protocols/${id}/red-verification.md or a red-verify artifact.`,
        }
      );
    }

    const text = protocolAndArtifactText(id);
    if (!hasExactMarker(text, T3_HUMAN_CHECKPOINT_MARKER)) {
      addFinding(severity, 'TASK_T3_CHECKPOINT_MISSING', `${rel}: T3 done task has no exact ${T3_HUMAN_CHECKPOINT_MARKER} marker.`, {
        path: rel,
        task_id: id,
        suggested_fix: `Record ${T3_HUMAN_CHECKPOINT_MARKER} as a standalone line in .protocols/${id}/handoff.md or another task protocol/artifact.`,
      });
    }
    if (!hasExactMarker(text, T3_ROLLBACK_RECOVERY_MARKER)) {
      addFinding(severity, 'TASK_T3_ROLLBACK_MISSING', `${rel}: T3 done task has no exact ${T3_ROLLBACK_RECOVERY_MARKER} marker.`, {
        path: rel,
        task_id: id,
        suggested_fix: `Record ${T3_ROLLBACK_RECOVERY_MARKER} as a standalone line in .protocols/${id}/handoff.md or another task protocol/artifact.`,
      });
    }
  }
}

function checkCompactDoneProtocol(record) {
  const { id, rel, task } = record;
  if (task.status !== 'done' || !COMPACT_TIERS.has(task.tier)) return;

  const runRel = normalizeRel(path.join('.protocols', id, 'run.md'));
  const runAbs = path.join(ROOT, runRel);
  if (!isFile(runAbs)) {
    const severity = options.strict || task.tier === 'T1' ? 'error' : 'warning';
    addFinding(severity, 'TASK_COMPACT_RUN_MISSING', `${rel}: ${task.tier} done task is missing compact ${runRel}.`, {
      path: rel,
      task_id: id,
      details: { expected: runRel },
      suggested_fix: `Create ${runRel} with checks, evidence, and VERDICT: PASS.`,
    });
    return;
  }

  let text = '';
  try {
    text = fs.readFileSync(runAbs, 'utf8').replace(/\r\n/g, '\n');
  } catch (err) {
    addFinding('error', 'TASK_COMPACT_RUN_UNREADABLE', `${runRel} could not be read: ${err.message}`, {
      path: runRel,
      task_id: id,
    });
    return;
  }

  const hasCompactPassVerdict = hasPassingVerdict(text);

  if (options.strict && !hasCompactPassVerdict) {
    addFinding('error', 'TASK_COMPACT_VERDICT_MISSING', `${runRel}: strict mode requires VERDICT: PASS for a done ${task.tier} task.`, {
      path: runRel,
      task_id: id,
      suggested_fix: 'Record a clear VERDICT: PASS after verification succeeds.',
    });
  }

  if (!hasCompactPassVerdict && !hasEvidenceContent(text) && !hasTaskEvidence(task)) {
    const severity = options.strict ? 'error' : 'warning';
    addFinding(severity, 'TASK_COMPACT_EVIDENCE_MISSING', `${runRel}: compact protocol has no concrete evidence marker.`, {
      path: runRel,
      task_id: id,
      suggested_fix: 'Record command output, artifact/log path, or a short result summary in the compact run.',
    });
  }
}

function checkTerminalEvidence(record) {
  const { id, rel, task } = record;
  if (task.status !== 'done' && task.status !== 'failed') return;
  if (task.status === 'done' && COMPACT_TIERS.has(task.tier)) return;
  if (FULL_PROTOCOL_TIERS.has(task.tier)) return;

  if (hasTaskEvidence(task) || hasProtocolOrArtifactEvidence(id, task.status)) return;

  const code = task.status === 'done' ? 'TASK_DONE_EVIDENCE_MISSING' : 'TASK_FAILED_EVIDENCE_MISSING';
  const expected = task.status === 'done' ? 'pass/result/verdict evidence' : 'failure/error/verdict evidence';
  const severity = options.strict ? 'error' : 'warning';
  addFinding(severity, code, `${rel}: ${task.status} task has no minimal ${expected}.`, {
    path: rel,
    task_id: id,
    suggested_fix: 'Record verification evidence in task.verify, .protocols/<TASK_ID>/run.md, or task artifacts.',
  });
}

function checkReqFeatureLinkage(record) {
  const { id, rel, task } = record;
  if (!LINK_REQUIRED_TIERS.has(task.tier)) return;

  const severity = options.strict ? 'error' : 'warning';
  const featureId = typeof task.feature === 'string' && FT_ID_RE.test(task.feature) ? task.feature : undefined;
  const reqIds = Array.isArray(task.reqs) ? task.reqs.filter((req) => typeof req === 'string' && REQ_ID_RE.test(req)) : [];

  if (!featureId) {
    addFinding(severity, 'TASK_FEATURE_LINK_MISSING', `${rel}: ${task.tier} task has no concrete FT-* feature link.`, {
      path: rel,
      task_id: id,
      suggested_fix: 'Set task.feature to a real FT-<NNN>; placeholder FT-XXX does not count.',
    });
  }

  if (!reqIds.length) {
    addFinding(severity, 'TASK_REQUIREMENT_LINK_MISSING', `${rel}: ${task.tier} task has no concrete REQ-* requirement link.`, {
      path: rel,
      task_id: id,
      suggested_fix: 'Add at least one real REQ-<NNN> to task.reqs; placeholder REQ-XXX does not count.',
    });
  }

  const requirementsAbs = path.join(ROOT, '.memory-bank', 'requirements.md');
  if (reqIds.length && isFile(requirementsAbs)) {
    const requirementsText = fs.readFileSync(requirementsAbs, 'utf8');
    const missingReqs = reqIds.filter((reqId) => !requirementsText.includes(reqId));
    if (missingReqs.length) {
      addFinding(severity, 'TASK_REQUIREMENT_NOT_FOUND', `${rel}: referenced requirements are absent from .memory-bank/requirements.md.`, {
        path: rel,
        task_id: id,
        details: { requirements: missingReqs },
        suggested_fix: 'Add the referenced REQ IDs to .memory-bank/requirements.md or correct task.reqs.',
      });
    }
  }

  if (featureId) {
    const featureFiles = featureMarkdownFiles();
    if (featureFiles.length && !featureFiles.some((file) => featureFileMatches(file, featureId))) {
      addFinding(severity, 'TASK_FEATURE_FILE_MISSING', `${rel}: referenced feature ${featureId} has no matching file in .memory-bank/features/.`, {
        path: rel,
        task_id: id,
        details: { feature: featureId },
        suggested_fix: `Create .memory-bank/features/${featureId}-<slug>.md or correct task.feature.`,
      });
    }
  }
}

function checkSddSpecLinkage(record) {
  const { id, rel, task } = record;
  if (!SDD_SPEC_REQUIRED_TIERS.has(task.tier)) return;

  const taskSpecLinks = sddSpecLinkStatusFromTask(task);
  const severity = options.strict ? 'error' : 'warning';
  const featureId = typeof task.feature === 'string' && FT_ID_RE.test(task.feature) ? task.feature : undefined;
  const featureSpec = featureId ? getFeatureSpecDesign(featureId) : null;
  if (taskSpecLinks.existing.length) {
    if (taskSpecLinks.existing.every((link) => isGuideSddSpecPath(link))) {
      addFinding(severity, 'TASK_SDD_SPEC_GUIDE_ONLY', `${rel}: ${task.tier} task links only guide SDD specs.`, {
        path: rel,
        task_id: id,
        details: {
          feature: featureId,
          guide_sdd_spec_links: taskSpecLinks.existing,
          feature_spec_design_status: featureSpec?.status,
          feature_spec_design_links: featureSpec?.links.existing ?? [],
        },
        suggested_fix:
          'Keep guides as supplemental links, but add direct task-relevant canonical architecture, contract, domain, state, testing, runbook, or ADR links for T2/T3 work.',
      });
    }
    return;
  }

  addFinding(severity, 'TASK_SDD_SPEC_LINK_MISSING', `${rel}: ${task.tier} task has no existing linked SDD spec paths in richer task fields.`, {
    path: rel,
    task_id: id,
    details: {
      feature: featureId,
      missing_sdd_spec_links: taskSpecLinks.missing,
      feature_spec_design_status: featureSpec?.status,
      feature_spec_design_links: featureSpec?.links.existing ?? [],
      missing_feature_spec_design_links: featureSpec?.links.missing ?? [],
    },
    suggested_fix: `Rerun /prd-to-tasks ${featureId ?? 'FT-<NNN>'} to repair/reconcile feature specs and task cards, or run /spec-auto for autonomous design; then add relevant SDD spec links to source_artifacts, normative_inputs, constraints, invariants, or verification_targets.`,
  });
}

function checkArchitectureReferencePresence(record) {
  const { id, rel, task } = record;
  if (!options.strict) return;
  if (!SDD_SPEC_REQUIRED_TIERS.has(task.tier)) return;
  if (hasArchitectureContractAdrReference(task)) return;

  addFinding('warning', 'TASK_ARCH_SPINE_LINK_ABSENT', `${rel}: ${task.tier} task has no architecture/contract/ADR reference in richer task fields.`, {
    path: rel,
    task_id: id,
    suggested_fix:
      'If this task touches shared boundaries, add relevant Architecture Spine, boundary-map, contract, or ADR links to normative_inputs/constraints/invariants/verification_targets. If it is task-local, no action is required.',
  });
}

function checkSingleCardHandoffCompleteness(record) {
  const { id, rel, task } = record;
  if (!SDD_SPEC_REQUIRED_TIERS.has(task.tier)) return;

  const issues = [];
  if (!nonEmptyString(task.purpose)) issues.push('purpose must be a non-empty string');
  if (!nonEmptyString(task.success_outcome)) issues.push('success_outcome must be a non-empty string');

  const taskSpecLinks = sddSpecLinkStatusFromTask(task);
  if (!taskSpecLinks.existing.length) {
    issues.push('at least one existing direct task-linked canonical SDD spec path is required');
  }

  const runtimeContext = isPlainObject(task.runtime_context) ? task.runtime_context : null;
  const hasTouchedFiles =
    Array.isArray(task.touched_files) && task.touched_files.some((value) => nonEmptyString(value));
  const hasAllowedWriteScope =
    Array.isArray(runtimeContext?.allowed_write_scope)
    && runtimeContext.allowed_write_scope.some((value) => nonEmptyString(value));
  if (!hasTouchedFiles && !hasAllowedWriteScope) {
    issues.push('touched_files or runtime_context.allowed_write_scope must ground execution scope');
  }

  const hasGateCommand =
    Array.isArray(task.gates)
    && task.gates.some((gate) => isPlainObject(gate) && isConcreteHandoffValue(gate.command));
  const hasVerificationTarget =
    Array.isArray(task.verification_targets)
    && task.verification_targets.some((value) => isConcreteHandoffValue(value));
  if (!hasGateCommand && !hasVerificationTarget) {
    issues.push('a gate with a real command or a non-empty verification_target is required');
  }

  if (!issues.length) return;

  const severity = options.strict ? 'error' : 'warning';
  addFinding(severity, 'TASK_HANDOFF_INCOMPLETE', `${rel}: ${task.tier} single-card handoff is structurally incomplete.`, {
    path: rel,
    task_id: id,
    details: { issues },
    suggested_fix:
      'Repair the indexed task card through /prd-to-tasks or /foundation-to-tasks; keep optional evidence-driven fields empty when no grounded value exists.',
  });
}

function isConcreteHandoffValue(value) {
  if (!nonEmptyString(value)) return false;
  return !/^(?:tbd|todo|none|n\/a|not[_ -]?applicable|<[^>]+>|\{\{[^}]+\}\})$/i.test(value.trim());
}
function checkFeatureClarificationReadiness() {
  const severity = options.strict ? 'error' : 'warning';
  const { features } = getFeatureClarificationIndex();

  for (const feature of features) {
    if (feature.metadataIssues.length) {
      addFinding(
        severity,
        'FEATURE_CLARIFICATION_METADATA_MISSING',
        `${feature.rel}: clarification metadata is missing or invalid.`,
        {
          path: feature.rel,
          details: {
            feature: feature.id,
            issues: feature.metadataIssues,
          },
          suggested_fix:
            'If feature clarification metadata is present, set clarification_status: pending|complete|blocked, last_clarified: null or YYYY-MM-DD, and clarification_questions: integer >= 0.',
        }
      );
    }

    if (feature.status === 'pending' || feature.status === 'blocked') {
      addFinding(severity, 'FEATURE_CLARIFICATION_PENDING', `${feature.rel}: feature clarification is ${feature.status}.`, {
        path: feature.rel,
        details: { feature: feature.id, status: feature.status },
        suggested_fix: `Run /clarify-feature ${feature.id} until critical ambiguity is resolved before /prd-to-tasks.`,
      });
    }
  }
}

function checkTasksFromUnclarifiedFeatures(records) {
  if (!records.length) return;

  const severity = options.strict ? 'error' : 'warning';
  const { byId } = getFeatureClarificationIndex();
  const grouped = new Map();

  for (const record of records) {
    const featureId = typeof record.task.feature === 'string' ? record.task.feature.trim() : '';
    if (!FT_ID_RE.test(featureId)) continue;

    const featureDocs = byId.get(featureId);
    let reason;
    let featurePaths = [];

    if (!featureDocs?.length) {
      reason = 'feature_doc_missing';
    } else {
      const unreadyDocs = featureDocs.filter((feature) => isBlockingFeatureClarification(feature));
      if (!unreadyDocs.length) continue;

      featurePaths = unreadyDocs.map((feature) => feature.rel);
      if (unreadyDocs.some((feature) => feature.status === 'blocked')) {
        reason = 'clarification_blocked';
      } else if (unreadyDocs.some((feature) => feature.status === 'pending')) {
        reason = 'clarification_pending';
      } else {
        reason = 'clarification_metadata_missing';
      }
    }

    const key = `${featureId}:${reason}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        featureId,
        reason,
        featurePaths,
        tasks: [],
      });
    }
    grouped.get(key).tasks.push({ id: record.id, path: record.rel, status: record.task.status });
  }

  for (const group of grouped.values()) {
    addFinding(
      severity,
      'TASKS_FROM_UNCLARIFIED_FEATURE',
      `Indexed tasks exist for unclarified feature ${group.featureId} (${group.reason}).`,
      {
        path: TASK_INDEX_REL,
        details: {
          feature: group.featureId,
          reason: group.reason,
          feature_paths: group.featurePaths,
          tasks: group.tasks,
        },
        suggested_fix: `Complete /clarify-feature ${group.featureId} before generating or running task records for that feature.`,
      }
    );
  }
}

function checkFailedTaskClosure(records) {
  const failedRecords = records.filter((record) => record.task.status === 'failed');
  if (!failedRecords.length) return;

  for (const failed of failedRecords) {
    if (hasBugDocMentioningTask(failed.id) || hasFollowUpReferencingTask(records, failed.id)) continue;

    const severity = options.strict ? 'error' : 'warning';
    addFinding(
      severity,
      'FAILED_BUG_OR_FOLLOWUP_MISSING',
      `${failed.rel}: failed task has no bug doc mentioning ${failed.id} and no follow-up task depending on or referencing it.`,
      {
        path: failed.rel,
        task_id: failed.id,
        suggested_fix: `Create a .memory-bank/bugs/ bug note mentioning ${failed.id} or add an indexed follow-up task that references it.`,
      }
    );
  }
}

function checkT2FeatureSemanticCompletion(records) {
  if (!records.length) return;

  const groups = new Map();
  for (const record of records) {
    const featureId = typeof record.task.feature === 'string' ? record.task.feature.trim() : '';
    if (!FT_ID_RE.test(featureId) || featureId === 'FT-000') continue;

    if (!groups.has(featureId)) {
      groups.set(featureId, { featureId, records: [], hasT2: false });
    }
    const group = groups.get(featureId);
    group.records.push(record);
    if (record.task.tier === 'T2') group.hasT2 = true;
  }

  const severity = options.strict ? 'error' : 'warning';
  for (const group of groups.values()) {
    if (!group.hasT2) continue;
    if (!group.records.every((record) => record.task.status === 'done')) continue;

    const passFiles = featureSemanticPassFiles(group.featureId);
    if (passFiles.length) continue;

    addFinding(
      severity,
      'FEATURE_RED_VERIFY_VERDICT_MISSING',
      `${group.featureId}: completed T2 feature has no feature-doc semantic-pass verdict.`,
      {
        path: '.memory-bank/features/',
        details: {
          feature: group.featureId,
          tasks: group.records.map((record) => ({ id: record.id, path: record.rel, tier: record.task.tier })),
        },
        suggested_fix: `Run /red-verify --feature ${group.featureId} and record SEMANTIC_VERDICT: semantic-pass in the matching .memory-bank/features/${group.featureId}-*.md file.`,
      }
    );
  }
}

function checkFailedDependentsBlocked(records) {
  const failedRecords = records.filter((record) => record.task.status === 'failed');
  if (!failedRecords.length) return;

  for (const failed of failedRecords) {
    const notBlocked = records.filter((record) => {
      if (record.id === failed.id || !Array.isArray(record.task.depends_on)) return false;
      return record.task.depends_on.includes(failed.id) && record.task.status !== 'blocked';
    });
    if (!notBlocked.length) continue;

    addFinding('error', 'TASK_FAILED_DEPENDENTS_NOT_BLOCKED', `${failed.rel}: direct dependents of failed task are not blocked.`, {
      path: failed.rel,
      task_id: failed.id,
      details: {
        dependents: notBlocked.map((record) => ({ id: record.id, status: record.task.status, path: record.rel })),
      },
      suggested_fix: 'Mark direct dependents of failed upstream tasks as blocked before continuing.',
    });
  }
}

function checkQueueState(records, recordsById, invalidEntries) {
  if (invalidEntries.length) return;

  const inProgress = records.filter((record) => record.task.status === 'in_progress');
  const executableReady = records.filter((record) => {
    if (record.task.status !== 'ready' || !Array.isArray(record.task.depends_on)) return false;
    return record.task.depends_on.every((depId) => recordsById.get(depId)?.task.status === 'done');
  });

  const unfinished = records.filter((record) => !TERMINAL_STATUSES.has(record.task.status));
  const readyCandidates = records.filter((record) => isPlannedReadyCandidate(record, recordsById));
  const blockedByUpstream = records.filter((record) => hasBlockedOrFailedUpstream(record, recordsById));

  for (const record of readyCandidates) {
    addFinding(
      'warning',
      'TASK_PLANNED_READY_CANDIDATE',
      `${record.rel}: planned task has all dependencies done and can be promoted to ready.`,
      {
        path: record.rel,
        task_id: record.id,
        suggested_fix: 'Run the scheduler promotion pass or update status to ready.',
      }
    );
  }

  for (const record of blockedByUpstream) {
    addFinding('warning', 'TASK_BLOCKED_BY_UPSTREAM', `${record.rel}: task is blocked by failed/blocked upstream dependencies.`, {
      path: record.rel,
      task_id: record.id,
      details: {
        dependencies: record.task.depends_on
          .map((depId) => recordsById.get(depId))
          .filter((dep) => dep && (dep.task.status === 'failed' || dep.task.status === 'blocked'))
          .map((dep) => ({ id: dep.id, status: dep.task.status })),
      },
    });
  }

  if (!unfinished.length) return;
  if (executableReady.length || inProgress.length || readyCandidates.length) return;

  const severity = options.strict ? 'error' : 'warning';
  const code = options.strict ? 'TASK_QUEUE_DEADLOCK' : 'TASK_QUEUE_NO_EXECUTABLE_READY';
  addFinding(severity, code, 'No executable ready task is available while unfinished tasks remain.', {
    path: TASK_INDEX_REL,
    details: {
      unfinished: unfinished.map((record) => ({
        id: record.id,
        status: record.task.status,
        depends_on: Array.isArray(record.task.depends_on) ? record.task.depends_on : [],
      })),
    },
    suggested_fix: 'Resolve blockers, close dependencies, or update task statuses before continuing autonomous/autopilot execution.',
  });
}

function isPlannedReadyCandidate(record, recordsById) {
  if (record.task.status !== 'planned' || !Array.isArray(record.task.depends_on)) return false;
  return record.task.depends_on.every((depId) => recordsById.get(depId)?.task.status === 'done');
}

function hasBlockedOrFailedUpstream(record, recordsById) {
  if (!Array.isArray(record.task.depends_on)) return false;
  return record.task.depends_on.some((depId) => {
    const dep = recordsById.get(depId);
    return dep && (dep.task.status === 'failed' || dep.task.status === 'blocked');
  });
}

function hasTaskEvidence(task) {
  if (!Array.isArray(task.verify)) return false;
  return task.verify.some((entry) => hasEvidenceMarker(entry));
}

function hasTaskStatusEvidence(task, status) {
  if (!Array.isArray(task.verify)) return false;
  return task.verify.some((entry) => hasStatusEvidenceMarker(entry, status));
}

function hasPassingVerdict(text) {
  return PASS_EVIDENCE_RE.test(String(text ?? '').replace(/\r\n/g, '\n'));
}

function hasEvidenceContent(text) {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n');
  if (PATH_MARKER_RE.test(normalized)) return true;

  return normalized.split('\n').some((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || /\bverdict\s*:/i.test(line)) return false;
    if (/^(?:[-*]\s*)?(?:evidence|checks?|result|output|log|artifact|report)\s*:\s*(?!n\/a\b|none\b|tbd\b|todo\b|\.{3}$).+/i.test(line)) {
      return true;
    }
    return /\b(fail(?:ed)?|error|output|log|artifact|report|result)\b/i.test(line);
  });
}

function hasEvidenceMarker(value) {
  if (typeof value === 'string') {
    return EVIDENCE_WORD_RE.test(value) || PATH_MARKER_RE.test(value);
  }
  if (Array.isArray(value)) {
    return value.some((item) => hasEvidenceMarker(item));
  }
  if (!value || typeof value !== 'object') {
    return false;
  }
  return Object.entries(value).some(([key, child]) => {
    return EVIDENCE_WORD_RE.test(key) || hasEvidenceMarker(child);
  });
}

function hasStatusEvidenceMarker(value, status) {
  const marker = status === 'done' ? PASS_EVIDENCE_RE : FAIL_EVIDENCE_RE;
  if (typeof value === 'string') return marker.test(value);
  if (Array.isArray(value)) return value.some((item) => hasStatusEvidenceMarker(item, status));
  if (!value || typeof value !== 'object') return false;

  return Object.entries(value).some(([key, child]) => {
    return (marker.test(key) && hasNonEmptyEvidenceValue(child)) || hasStatusEvidenceMarker(child, status);
  });
}

function hasNonEmptyEvidenceValue(value) {
  if (Array.isArray(value)) return value.some((item) => hasNonEmptyEvidenceValue(item));
  if (value && typeof value === 'object') return Object.values(value).some((item) => hasNonEmptyEvidenceValue(item));
  return String(value ?? '').trim().length > 0;
}

function missingFullProtocolFiles(id) {
  return FULL_PROTOCOL_FILES.filter((file) => !isFile(path.join(ROOT, '.protocols', id, file)));
}

function hasCompactOnlyProtocol(id) {
  const runAbs = path.join(ROOT, '.protocols', id, 'run.md');
  if (!isFile(runAbs)) return false;
  return missingFullProtocolFiles(id).length > 0;
}

function redVerificationFiles(id) {
  const protocolFile = path.join(ROOT, '.protocols', id, 'red-verification.md');
  const files = isFile(protocolFile) ? [protocolFile] : [];
  return [
    ...files,
    ...listFiles(path.join(ROOT, '.tasks', id)).filter((file) => isRedVerificationFile(file)),
  ];
}

function hasClosureEligibleRedVerificationEvidence(files) {
  return files.some((file) => {
    try {
      return RED_VERIFY_PASS_RE.test(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n'));
    } catch {
      return false;
    }
  });
}

function protocolAndArtifactText(id) {
  const files = [
    ...listFiles(path.join(ROOT, '.protocols', id)).filter((file) => file.endsWith('.md')),
    ...listFiles(path.join(ROOT, '.tasks', id)).filter((file) => /\.(md|txt|log|json)$/i.test(file)),
  ];

  return files
    .map((file) => {
      try {
        return fs.readFileSync(file, 'utf8');
      } catch {
        return '';
      }
    })
    .join('\n');
}

function hasExactMarker(text, marker) {
  return text.replace(/\r\n/g, '\n').split('\n').some((line) => line.trim() === marker);
}

function isRedVerificationFile(file) {
  return /red/i.test(path.basename(file));
}

function hasBugDocMentioningTask(taskId) {
  const bugDir = path.join(ROOT, '.memory-bank', 'bugs');
  return listFiles(bugDir)
    .filter((file) => /\.md$/i.test(file))
    .some((file) => {
      try {
        return fs.readFileSync(file, 'utf8').includes(taskId);
      } catch {
        return false;
      }
    });
}

function hasFollowUpReferencingTask(records, taskId) {
  return records.some((record) => {
    if (record.id === taskId) return false;
    if (Array.isArray(record.task.depends_on) && record.task.depends_on.includes(taskId)) return true;
    return taskReferencesId(record.task, taskId);
  });
}

function taskReferencesId(value, taskId) {
  if (typeof value === 'string') return value.includes(taskId);
  if (Array.isArray(value)) return value.some((item) => taskReferencesId(item, taskId));
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, child]) => key.includes(taskId) || taskReferencesId(child, taskId));
}

function sddSpecLinksFromTask(task) {
  const fields = [
    task.source_artifacts,
    task.normative_inputs,
    task.constraints,
    task.invariants,
    task.verification_targets,
  ];
  return collectSddSpecLinks(fields);
}

function hasArchitectureContractAdrReference(task) {
  const fields = [
    task.source_artifacts,
    task.normative_inputs,
    task.constraints,
    task.invariants,
    task.verification_targets,
  ];
  return fields.some((field) => ARCHITECTURE_CONTRACT_ADR_PATH_RE.test(JSON.stringify(field ?? '')));
}

function sddSpecLinkStatusFromTask(task) {
  return classifySddSpecLinks(sddSpecLinksFromTask(task));
}

function collectSddSpecLinks(value) {
  const links = [];
  collectSddSpecLinksInto(value, links);
  return [...new Set(links)];
}

function collectSddSpecLinksInto(value, links) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(new RegExp(SDD_SPEC_PATH_RE, 'ig'))) {
      const candidate = normalizeSddSpecCandidate(match[0]);
      if (candidate) links.push(candidate);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectSddSpecLinksInto(item, links));
    return;
  }
  if (!value || typeof value !== 'object') return;
  Object.values(value).forEach((child) => collectSddSpecLinksInto(child, links));
}

function classifySddSpecLinks(candidates) {
  const existing = [];
  const missing = [];

  for (const candidate of candidates) {
    if (!isAllowedSddSpecPath(candidate)) continue;
    if (isFile(path.join(ROOT, candidate))) {
      existing.push(candidate);
    } else {
      missing.push(candidate);
    }
  }

  return {
    existing: [...new Set(existing)],
    missing: [...new Set(missing)],
  };
}

function normalizeSddSpecCandidate(candidate) {
  const trimmed = String(candidate ?? '')
    .trim()
    .replace(/^[`'"]+/, '')
    .replace(/[`'".,;:)\]}]+$/g, '')
    .replace(/^\.\//, '');

  if (!trimmed.startsWith('.memory-bank/')) return null;

  return normalizeRel(trimmed);
}

function isAllowedSddSpecPath(candidate) {
  const rel = normalizeRel(candidate);
  if (rel.includes('..')) return false;
  return SDD_SPEC_DIRS.some((dir) => rel.startsWith(`.memory-bank/${dir}/`));
}

function isGuideSddSpecPath(candidate) {
  return normalizeRel(candidate).startsWith('.memory-bank/guides/');
}

function getFeatureSpecDesign(featureId) {
  const files = featureMarkdownFiles().filter((file) => featureFileMatches(file, featureId));
  if (!files.length) return null;

  const statuses = [];
  const links = [];
  for (const file of files) {
    try {
      const fm = parseFrontmatter(fs.readFileSync(file, 'utf8'));
      if (!fm) continue;
      if (hasOwn(fm, 'spec_design_status')) statuses.push(stripYamlQuotes(fm.spec_design_status));
      if (hasOwn(fm, 'spec_design_links')) links.push(...collectSddSpecLinks(fm.spec_design_links));
    } catch {
      // Ignore unreadable feature docs; other checks report missing/invalid docs.
    }
  }

  return {
    status: statuses.find(Boolean),
    links: classifySddSpecLinks([...new Set(links)]),
  };
}

function featureMarkdownFiles() {
  return listFiles(path.join(ROOT, '.memory-bank', 'features')).filter((file) => /\.md$/i.test(file));
}

function featureFileMatches(file, featureId) {
  const base = path.basename(file, path.extname(file));
  return base === featureId || base.startsWith(`${featureId}-`) || base.startsWith(`${featureId}_`);
}

function featureSemanticPassFiles(featureId) {
  return featureMarkdownFiles()
    .filter((file) => featureFileMatches(file, featureId))
    .filter((file) => {
      try {
        return RED_VERIFY_PASS_RE.test(fs.readFileSync(file, 'utf8'));
      } catch {
        return false;
      }
    });
}

function getFeatureClarificationIndex() {
  if (featureClarificationCache) return featureClarificationCache;

  const features = [];
  const byId = new Map();

  for (const file of featureMarkdownFiles()) {
    const featureId = featureIdFromFile(file);
    if (!featureId) continue;

    const rel = normalizeRel(path.relative(ROOT, file));
    let text = '';
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      text = '';
    }

    const fm = parseFrontmatter(text);
    const analysis = analyzeClarificationMetadata(fm, text);
    const feature = {
      id: featureId,
      rel,
      ...analysis,
    };

    features.push(feature);
    if (!byId.has(featureId)) byId.set(featureId, []);
    byId.get(featureId).push(feature);
  }

  featureClarificationCache = { features, byId };
  return featureClarificationCache;
}

function featureIdFromFile(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  const match = base.match(/^(FT-[0-9]{3,})(?:[-_].*)?$/);
  return match?.[1];
}

function analyzeClarificationMetadata(fm, text) {
  const metadataIssues = [];
  let status;

  if (!fm) {
    metadataIssues.push('frontmatter_missing');
    return { status, metadataIssues };
  }

  if (!hasOwn(fm, 'clarification_status')) {
    return { status, metadataIssues };
  } else {
    status = stripYamlQuotes(fm.clarification_status);
    if (!VALID_CLARIFICATION_STATUSES.has(status)) metadataIssues.push('clarification_status_invalid');
  }

  if (hasOwn(fm, 'last_clarified')) {
    const lastClarified = stripYamlQuotes(fm.last_clarified);
    if (lastClarified !== 'null' && !/^\d{4}-\d{2}-\d{2}$/.test(lastClarified)) {
      metadataIssues.push('last_clarified_invalid');
    }
  }

  if (hasOwn(fm, 'clarification_questions')) {
    const questionCount = stripYamlQuotes(fm.clarification_questions);
    if (!/^(0|[1-9][0-9]*)$/.test(questionCount)) metadataIssues.push('clarification_questions_invalid');
  }

  if (status === 'complete' && !hasClarificationCompletionMarker(text)) {
    metadataIssues.push('clarification_completion_marker_missing');
  }

  return { status, metadataIssues };
}

function isClarifiedFeature(feature) {
  return feature.status === 'complete' && feature.metadataIssues.length === 0;
}

function isBlockingFeatureClarification(feature) {
  return feature.status === 'pending' || feature.status === 'blocked';
}

function hasClarificationCompletionMarker(text) {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n');
  return (
    /^## Clarifications\s*$/m.test(normalized) ||
    /(?:^|\n)Clarification: no critical ambiguity found(?:\n|$)/.test(normalized)
  );
}

function parseFrontmatter(text) {
  const normalized = String(text ?? '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return null;

  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) return null;

  const lines = normalized.slice(4, end).trimEnd().split('\n');
  const kv = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if (!match) {
      i += 1;
      continue;
    }

    const key = match[1];
    const rest = (match[2] ?? '').trimEnd();
    if (rest === '') {
      const collected = [];
      i += 1;
      while (i < lines.length) {
        const next = lines[i];
        if (/^[A-Za-z0-9_\-]+:\s*/.test(next)) break;
        collected.push(next);
        i += 1;
      }
      kv[key] = collected.join('\n').trim();
      continue;
    }

    kv[key] = rest.trim();
    i += 1;
  }

  return kv;
}

function stripYamlQuotes(value) {
  const raw = String(value ?? '').trim();
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function hasProtocolOrArtifactEvidence(taskId, status) {
  const files = [
    ...listFiles(path.join(ROOT, '.protocols', taskId)).filter((file) => /\.(md|txt|log|json)$/i.test(file)),
    ...listFiles(path.join(ROOT, '.tasks', taskId)).filter((file) => /\.(md|txt|log|json)$/i.test(file)),
  ];

  if (!files.length) return false;

  const statusRe = status === 'done' ? PASS_EVIDENCE_RE : /\bfail(?:ed)?\b|\berror\b|\bverdict\s*:\s*fail\b/i;
  return files.some((file) => {
    try {
      const text = fs.readFileSync(file, 'utf8');
      return statusRe.test(text) || EVIDENCE_WORD_RE.test(text) || PATH_MARKER_RE.test(text);
    } catch {
      return false;
    }
  });
}

function hasProtocolOrArtifactStatusEvidence(taskId, status) {
  const marker = status === 'done' ? PASS_EVIDENCE_RE : FAIL_EVIDENCE_RE;
  const files = [
    ...listFiles(path.join(ROOT, '.protocols', taskId)).filter((file) => /\.(md|txt|log|json)$/i.test(file)),
    ...listFiles(path.join(ROOT, '.tasks', taskId)).filter((file) => /\.(md|txt|log|json)$/i.test(file)),
  ].filter((file) => !isRedVerificationFile(file));

  return files.some((file) => {
    try {
      return marker.test(fs.readFileSync(file, 'utf8'));
    } catch {
      return false;
    }
  });
}

function addQueueSummary(records, invalidEntries) {
  const counts = {
    total: records.length,
    planned: 0,
    ready: 0,
    in_progress: 0,
    blocked: 0,
    done: 0,
    failed: 0,
    invalid: invalidEntries.length,
  };

  for (const record of records) {
    if (Object.prototype.hasOwnProperty.call(counts, record.task.status)) {
      counts[record.task.status] += 1;
    } else {
      counts.invalid += 1;
    }
  }

  addFinding('info', 'TASK_QUEUE_SUMMARY', 'Task queue summary.', {
    path: TASK_INDEX_REL,
    details: counts,
  });
}

function readJson(rel) {
  const abs = path.join(ROOT, rel);
  if (!isFile(abs)) {
    return { ok: false, message: `${rel} not found.` };
  }
  try {
    return { ok: true, value: JSON.parse(fs.readFileSync(abs, 'utf8')) };
  } catch (err) {
    return { ok: false, message: `${rel}: invalid JSON (${err.message})` };
  }
}

function isFile(absPath) {
  try {
    return fs.statSync(absPath).isFile();
  } catch {
    return false;
  }
}

function isDirectory(absPath) {
  try {
    return fs.statSync(absPath).isDirectory();
  } catch {
    return false;
  }
}

function listFiles(absDir) {
  if (!fs.existsSync(absDir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const full = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function splitLines(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => line.length > 0);
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeRel(p) {
  return p.replace(/\\/g, '/');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addFinding(severity, code, message, extra = {}) {
  const finding = { severity, code, message };
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined) finding[key] = value;
  }
  findings.push(finding);
}

function finish() {
  const counts = findings.reduce(
    (acc, finding) => {
      acc[finding.severity] += 1;
      return acc;
    },
    { error: 0, warning: 0, info: 0 }
  );

  const status = counts.error > 0 ? 'fail' : 'pass';
  const summary = {
    errors: counts.error,
    warnings: counts.warning,
    infos: counts.info,
  };
  const report = {
    version: 1,
    tool: 'mb-doctor',
    strict: options.strict,
    status,
    summary,
    counts,
    findings,
  };

  if (options.json) {
    console.log(`${JSON.stringify(report, null, 2)}\n`);
  } else {
    printTextReport(report);
  }

  process.exit(status === 'pass' ? 0 : 1);
}

function printTextReport(report) {
  console.log(`mb-doctor ${report.status.toUpperCase()} (${report.counts.error} errors, ${report.counts.warning} warnings, ${report.counts.info} info)`);
  for (const finding of report.findings) {
    const location = finding.path ? ` ${finding.path}` : '';
    const task = finding.task_id ? ` ${finding.task_id}` : '';
    console.log(`[${finding.severity.toUpperCase()}] ${finding.code}${location}${task}: ${finding.message}`);
    printCapturedStream('stdout', finding.details?.stdout);
    printCapturedStream('stderr', finding.details?.stderr);
  }
}

function printCapturedStream(label, lines) {
  if (!Array.isArray(lines) || !lines.length) return;
  console.log(`  ${label}:`);
  for (const line of lines) {
    console.log(`    ${line}`);
  }
}
