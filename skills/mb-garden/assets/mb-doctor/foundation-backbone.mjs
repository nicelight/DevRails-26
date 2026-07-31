/**
 * Owns constitution, spec-index/backbone, and Foundation readiness checks.
 * Does not own generic task, acceptance, protocol, or report semantics.
 * Preserve Foundation gate decisions, severity, and finding order.
 */

import { escapeRegExp, normalizeRel } from './readers.mjs';

const TASK_INDEX_REL = '.memory-bank/tasks/index.json';
const CONSTITUTION_REL = '.memory-bank/constitution.md';
const MB_INDEX_REL = '.memory-bank/index.md';
const SPEC_INDEX_REL = '.memory-bank/spec-index.md';
const SPEC_BACKBONE_REL = '.memory-bank/spec-backbone.md';
const FOUNDATION_REL = '.memory-bank/foundation.md';
const TASK_ID_RE = /^TASK-[0-9]{3}-T[0-3]-FT-[0-9]{3}-W[0-9]+$/;
const FOUNDATION_TASK_ID_FORMAT = 'TASK-NNN-TN-FT-000-WN';
const FOUNDATION_TASK_ID_RE = /^TASK-[0-9]{3}-T[0-3]-FT-000-W[0-9]+$/;
const FOUNDATION_GATE_PENDING = 'pending_foundation_to_tasks';
const UNRESOLVED_FOUNDATION_STATUSES = new Set(['planned', 'ready', 'in_progress', 'blocked']);
const COMPLETE_BACKBONE_AREA_STATUSES = new Set(['authoritative', 'not_applicable']);
const FOUNDATION_ONLY_DEFERRED_BACKBONE_STATUSES = new Set(['needed_before_tasks']);

export function createFoundationBackboneChecks(context) {
  const ROOT = context.root;
  const { options, addFinding } = context;
  const {
    absolute,
    isFile,
    joinRelative,
    readJson,
    readText,
  } = context.readers;

  function checkConstitutionStructure() {
    if (!options.strict) return;
  
    const issues = [];
    const constitutionAbs = absolute(CONSTITUTION_REL);
    const indexAbs = absolute(MB_INDEX_REL);
    const specIndexAbs = absolute(SPEC_INDEX_REL);
    const specBackboneAbs = absolute(SPEC_BACKBONE_REL);
  
    if (!isFile(constitutionAbs)) {
      issues.push(`${CONSTITUTION_REL} missing`);
    }
  
    if (!isFile(indexAbs)) {
      issues.push(`${MB_INDEX_REL} missing`);
    } else {
      const text = readText(indexAbs);
      if (!text.includes('constitution.md')) issues.push(`${MB_INDEX_REL} does not mention constitution.md`);
    }
  
    if (!isFile(specIndexAbs)) {
      issues.push(`${SPEC_INDEX_REL} missing`);
    } else {
      const text = readText(specIndexAbs);
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
    const specBackboneAbs = absolute(SPEC_BACKBONE_REL);
    const specIndexAbs = absolute(SPEC_INDEX_REL);
    const severity = options.strict ? 'error' : 'warning';
  
    checkSpecIndexPurity(specIndexAbs, specBackboneAbs, severity);
  
    if (!isFile(specBackboneAbs)) {
      let migrationHint = undefined;
      if (isFile(specIndexAbs)) {
        const oldText = readText(specIndexAbs).replace(/\r\n/g, '\n');
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
            `Run /spec-init to create ${SPEC_BACKBONE_REL}, then /spec-design after /prd-to-features. Record Global Backbone Status complete, or minimal with explicit not_applicable areas; resolve blocked decisions before /feature-to-tasks.`,
        }
      );
      return;
    }
  
    const text = readText(specBackboneAbs).replace(/\r\n/g, '\n');
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
        `${SPEC_BACKBONE_REL}: pre-PRD framing is prepared for /prd-to-features; Global Backbone Status is intentionally pending until /spec-design.`,
        {
          path: SPEC_BACKBONE_REL,
          details,
          suggested_fix:
            'Continue with /prd-to-features, then run /spec-design before /feature-to-tasks, /autopilot, or autonomous scheduler mode.',
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
          'Run /spec-design after /prd-to-features. Record Global Backbone Status complete, or minimal with explicit not_applicable areas; resolve blocked decisions before /feature-to-tasks.',
      }
    );
  }
  
  function checkSpecIndexPurity(specIndexAbs, specBackboneAbs, severity) {
    if (!isFile(specIndexAbs) || !isFile(specBackboneAbs)) return;
  
    const text = readText(specIndexAbs).replace(/\r\n/g, '\n');
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
  
      const rel = normalizeRel(joinRelative('.memory-bank/tasks', entry.file));
      if (!isFile(absolute(rel))) return false;
  
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
    const foundationAbs = absolute(FOUNDATION_REL);
    const severity = options.strict ? 'error' : 'warning';
  
    if (!isFile(foundationAbs)) {
      addFinding(severity, 'FOUNDATION_ANCHORS_INVALID', `${FOUNDATION_REL}: a non-empty indexed task queue requires an explicit Foundation decision.`, {
        path: FOUNDATION_REL,
        details: { issue: 'foundation_file_missing' },
        suggested_fix: 'Run /spec-design to record the accepted Foundation decision and current Gate Anchors before unattended execution.',
      });
      return;
    }
  
    const text = readText(foundationAbs).replace(/\r\n/g, '\n');
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
  
    const foundationRecords = orderedRecords.filter((record) => record.task.feature === 'FT-000');
    const productRecords = orderedRecords.filter((record) => record.task.feature !== 'FT-000');
  
    if (anchors.required === false) {
      if (!foundationRecords.length) return;
  
      addFinding(severity, 'FOUNDATION_GATE_TASK_INVALID', `${FOUNDATION_REL}: Foundation is not required, but indexed FT-000 records still exist.`, {
        path: FOUNDATION_REL,
        details: {
          gate_task: anchors.gateTask,
          foundation_tasks: foundationRecords.map((record) => ({
            id: record.id,
            path: record.rel,
            status: record.task.status,
          })),
        },
        suggested_fix:
          'Reconcile the accepted Foundation decision through /spec-design; use /foundation-to-tasks --verify-existing only when existing-baseline evidence is the authoritative route.',
      });
      return;
    }
  
    if (anchors.gateTask === FOUNDATION_GATE_PENDING) {
      addFinding(severity, 'FOUNDATION_GATE_TASK_INVALID', `${FOUNDATION_REL}: required Foundation still has a pending final gate.`, {
        path: FOUNDATION_REL,
        details: { gate_task: anchors.gateTask },
        suggested_fix: 'Run /foundation-to-tasks to create/reconcile the FT-000 queue and replace the pending anchor with its concrete final gate task ID.',
      });
      return;
    }
  
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
  
    if (gate.task.status === 'failed') {
      addFinding(severity, 'FOUNDATION_GATE_TASK_INVALID', `${gate.rel}: the named final foundation gate has failed.`, {
        path: gate.rel,
        task_id: anchors.gateTask,
        details: { status: gate.task.status },
        suggested_fix:
          'Reconcile a valid replacement final gate through /foundation-to-tasks, then resume the /autonomous-owned FT-000 phase.',
      });
      return;
    }
  
    if (productRecords.length && gate.task.status !== 'done') {
      addFinding(severity, 'FOUNDATION_GATE_TASK_INVALID', `${gate.rel}: foundation gate task is not done.`, {
        path: gate.rel,
        task_id: anchors.gateTask,
        details: { status: gate.task.status },
        suggested_fix: 'Finish /exe, /verify, and /mb-sync for the foundation gate task before product feature execution.',
      });
    }
  
    if (productRecords.length && gate.task.status === 'done') {
      const unresolvedFoundationRecords = foundationRecords
        .filter((record) => record.id !== anchors.gateTask)
        .filter((record) => UNRESOLVED_FOUNDATION_STATUSES.has(record.task.status));
  
      if (unresolvedFoundationRecords.length) {
        addFinding(severity, 'FOUNDATION_GATE_TASK_INVALID', `${FOUNDATION_REL}: product tasks exist while FT-000 work remains unresolved.`, {
          path: FOUNDATION_REL,
          task_id: anchors.gateTask,
          details: {
            gate_task: anchors.gateTask,
            unresolved_foundation_tasks: unresolvedFoundationRecords.map((record) => ({
              id: record.id,
              path: record.rel,
              status: record.task.status,
            })),
          },
          suggested_fix:
            'Return to the /autonomous-owned Foundation phase and resolve planned, ready, in_progress, or blocked FT-000 work before /autopilot.',
        });
      }
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

  return {
    checkBackboneReadiness,
    checkConstitutionStructure,
    checkFoundationReadiness,
    checkFoundationWave,
  };
}
