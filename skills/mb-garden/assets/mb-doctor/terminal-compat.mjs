/**
 * Owns protocol evidence, terminal closure, RED/T3 gates, and brownfield compatibility.
 * Does not own task planning, Foundation, acceptance coverage, or reporting.
 * Preserve terminal gap suppression and aggregate finding order exactly.
 */

import { isPlainObject, normalizeRel } from './readers.mjs';

const TASK_INDEX_REL = '.memory-bank/tasks/index.json';
const COMPACT_TIERS = new Set(['T0', 'T1']);
const TERMINAL_STATUSES = new Set(['done', 'failed']);
const LEGACY_TERMINAL_GAP_CODES = new Set([
  'TASK_DONE_EVIDENCE_MISSING',
  'TASK_RED_VERIFY_EVIDENCE_MISSING',
  'TASK_RED_VERIFY_VERDICT_MISSING',
]);
const FULL_PROTOCOL_TIERS = new Set(['T2', 'T3']);
const FULL_PROTOCOL_STATUSES = new Set(['in_progress', 'done', 'failed']);
const FULL_PROTOCOL_FILES = ['context.md', 'plan.md', 'progress.md', 'verification.md', 'handoff.md'];
const EVIDENCE_WORD_RE = /\b(evidence|result|fail|failed|error|output|log|artifact|report)\b/i;
const PASS_EVIDENCE_RE = /^\s*VERDICT: PASS\s*$/im;
const FAIL_EVIDENCE_RE = /\bverdict\s*:?\s*fail(?:ed)?\b|\bfail(?:ed)?\b|\berror\b/i;
const RED_VERIFY_PASS_RE = /^\s*SEMANTIC_VERDICT: semantic-pass\s*$/im;
const PATH_MARKER_RE =
  /(?:^|[\s"`'])(?:\.{1,2}\/|\/|[A-Za-z]:\\)[^\s"`']+|\b[A-Za-z0-9_.-]+\/[A-Za-z0-9_.\/-]+\b|\b[\w.-]+\.(?:md|txt|log|json|xml|html|htm|png|jpg|jpeg|webm|mp4)\b/i;

export function createTerminalCompatibilityChecks(context) {
  const ROOT = context.root;
  const { options, addFinding } = context;
  const {
    absolute,
    basename,
    isFile,
    joinRelative,
    listFiles,
    readText,
    relativeFromRoot,
  } = context.readers;
  const legacyTerminalGaps = new Map();

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
          missing: missing.map((file) => normalizeRel(joinRelative('.protocols', id, file))),
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
      addTerminalClosureFinding(record, severity, code, `${rel}: ${task.tier} ${task.status} task has no ${expected} verification evidence/verdict.`, {
        path: rel,
        task_id: id,
        suggested_fix: `Record ${expected} evidence in task.verify, .protocols/${id}/, or .tasks/${id}/.`,
      });
    }
  
    if (task.status === 'done' && task.tier === 'T3') {
      const redFiles = redVerificationFiles(id);
      if (!redFiles.length) {
        addTerminalClosureFinding(record, severity, 'TASK_RED_VERIFY_EVIDENCE_MISSING', `${rel}: ${task.tier} done task has no red-verify evidence.`, {
          path: rel,
          task_id: id,
          suggested_fix: `Record red-verify evidence in .protocols/${id}/red-verification.md or .tasks/${id}/.`,
        });
      } else if (
        !hasClosureEligibleRedVerificationEvidence(redFiles)
        && !hasOwnerAcceptedSemanticFindings(task)
      ) {
        addTerminalClosureFinding(
          record,
          severity,
          'TASK_RED_VERIFY_VERDICT_MISSING',
          `${rel}: ${task.tier} done task has no closure-eligible red-verify semantic verdict.`,
          {
            path: rel,
            task_id: id,
            details: { files: redFiles.map((file) => normalizeRel(relativeFromRoot(file))) },
            suggested_fix: `Record SEMANTIC_VERDICT: semantic-pass in .protocols/${id}/red-verification.md or a red-verify artifact.`,
          }
        );
      }
  
    }
  }
  
  function checkCompactDoneProtocol(record) {
    const { id, rel, task } = record;
    if (task.status !== 'done' || !COMPACT_TIERS.has(task.tier)) return;
  
    const runRel = normalizeRel(joinRelative('.protocols', id, 'run.md'));
    const runAbs = absolute(runRel);
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
      text = readText(runAbs).replace(/\r\n/g, '\n');
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
  
  function isLegacyTerminalRecord(record) {
    const task = record?.task;
    return Boolean(
      task
      && TERMINAL_STATUSES.has(task.status)
      && isPlainObject(task.runtime_context)
      && Object.prototype.hasOwnProperty.call(task.runtime_context, 'allowed_write_scope')
    );
  }
  
  function addTerminalClosureFinding(record, severity, code, message, extra = {}) {
    if (!isLegacyTerminalRecord(record) || !LEGACY_TERMINAL_GAP_CODES.has(code)) {
      addFinding(severity, code, message, extra);
      return;
    }

    const gaps = legacyTerminalGaps.get(record.id) ?? new Set();
    gaps.add(code);
    legacyTerminalGaps.set(record.id, gaps);
  }
  
  function addLegacyTerminalCompatibilitySummary(records) {
    const legacyRecords = records.filter((record) => isLegacyTerminalRecord(record));
    if (!legacyRecords.length) return;
  
    const gapTypeCounts = {};
    for (const gaps of legacyTerminalGaps.values()) {
      for (const code of gaps) {
        gapTypeCounts[code] = (gapTypeCounts[code] ?? 0) + 1;
      }
    }
  
    addFinding(
      'info',
      'TASK_LEGACY_TERMINAL_COMPATIBILITY',
      `Accepted ${legacyRecords.length} legacy terminal task records; preserved historical closure gaps for ${legacyTerminalGaps.size} records without treating them as new acceptance evidence.`,
      {
        path: TASK_INDEX_REL,
        details: {
          legacy_terminal_records: legacyRecords.length,
          records_with_preserved_gaps: legacyTerminalGaps.size,
          gap_types: gapTypeCounts,
        },
      }
    );
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
    return FULL_PROTOCOL_FILES.filter((file) => !isFile(absolute('.protocols', id, file)));
  }
  
  function hasCompactOnlyProtocol(id) {
    const runAbs = absolute('.protocols', id, 'run.md');
    if (!isFile(runAbs)) return false;
    return missingFullProtocolFiles(id).length > 0;
  }
  
  function redVerificationFiles(id) {
    const protocolFile = absolute('.protocols', id, 'red-verification.md');
    const files = isFile(protocolFile) ? [protocolFile] : [];
    return [
      ...files,
      ...listFiles(absolute('.tasks', id)).filter((file) => isRedVerificationFile(file)),
    ];
  }
  
  function hasClosureEligibleRedVerificationEvidence(files) {
    return files.some((file) => {
      try {
        return RED_VERIFY_PASS_RE.test(readText(file).replace(/\r\n/g, '\n'));
      } catch {
        return false;
      }
    });
  }
  
  function hasOwnerAcceptedSemanticFindings(task) {
    const closure = Array.isArray(task?.verify)
      ? task.verify.find((entry) =>
        entry
        && entry.stage === 'owner_lifecycle_closure'
        && entry.mode === 'manual_explicit_owner'
        && entry.decision === 'done'
        && typeof entry.gate_summary?.red_verification === 'string'
        && entry.gate_summary.red_verification.startsWith('OWNER-ACCEPTED')
        && Array.isArray(entry.accepted_evidence)
        && entry.accepted_evidence.length > 0
        && Array.isArray(entry.accepted_residual_risk)
        && entry.accepted_residual_risk.length > 0)
      : undefined;
    return Boolean(closure);
  }
  
  function isRedVerificationFile(file) {
    return /red/i.test(basename(file));
  }
  
  function hasBugDocMentioningTask(taskId) {
    const bugDir = absolute('.memory-bank', 'bugs');
    return listFiles(bugDir)
      .filter((file) => /\.md$/i.test(file))
      .some((file) => {
        try {
          return readText(file).includes(taskId);
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
  
  function hasProtocolOrArtifactEvidence(taskId, status) {
    const files = [
      ...listFiles(absolute('.protocols', taskId)).filter((file) => /\.(md|txt|log|json)$/i.test(file)),
      ...listFiles(absolute('.tasks', taskId)).filter((file) => /\.(md|txt|log|json)$/i.test(file)),
    ];
  
    if (!files.length) return false;
  
    const statusRe = status === 'done' ? PASS_EVIDENCE_RE : /\bfail(?:ed)?\b|\berror\b|\bverdict\s*:\s*fail\b/i;
    return files.some((file) => {
      try {
        const text = readText(file);
        return statusRe.test(text) || EVIDENCE_WORD_RE.test(text) || PATH_MARKER_RE.test(text);
      } catch {
        return false;
      }
    });
  }
  
  function hasProtocolOrArtifactStatusEvidence(taskId, status) {
    const marker = status === 'done' ? PASS_EVIDENCE_RE : FAIL_EVIDENCE_RE;
    const files = [
      ...listFiles(absolute('.protocols', taskId)).filter((file) => /\.(md|txt|log|json)$/i.test(file)),
      ...listFiles(absolute('.tasks', taskId)).filter((file) => /\.(md|txt|log|json)$/i.test(file)),
    ].filter((file) => !isRedVerificationFile(file));
  
    return files.some((file) => {
      try {
        return marker.test(readText(file));
      } catch {
        return false;
      }
    });
  }

  return {
    addLegacyTerminalCompatibilitySummary,
    checkCompactDoneProtocol,
    checkFailedTaskClosure,
    checkFullProtocolTask,
    checkTerminalEvidence,
  };
}
