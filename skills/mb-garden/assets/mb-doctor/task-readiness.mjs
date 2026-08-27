/**
 * Owns task records, tiers, dependencies, feature clarification, SDD linkage, handoff, and queue state.
 * Does not own Foundation rules, AC trace rules, protocol closure, or report rendering.
 * The order inside checkTaskReadiness is part of the finding-order contract.
 */

import { isPlainObject, nonEmptyString, normalizeRel } from './readers.mjs';

// Brownfield tech-specs remain readable; semantic hub-only rejection belongs to review-tasks-plan.
const TASK_INDEX_REL = '.memory-bank/tasks/index.json';
const TASK_ID_RE = /^TASK-[0-9]{3}-T[0-3]-FT-[0-9]{3}-W[0-9]+$/;
const VALID_STATUSES = new Set(['planned', 'ready', 'in_progress', 'blocked', 'done', 'done_for_prod', 'failed']);
const VALID_TIERS = new Set(['T0', 'T1', 'T2', 'T3']);
const VALID_CLARIFICATION_STATUSES = new Set(['pending', 'complete', 'blocked']);
const LINK_REQUIRED_TIERS = new Set(['T1', 'T2', 'T3']);
const DONE_STATUSES = new Set(['done', 'done_for_prod']);
const TERMINAL_STATUSES = new Set(['done', 'done_for_prod', 'failed']);
const FULL_PROTOCOL_TIERS = new Set(['T2', 'T3']);
const SDD_SPEC_REQUIRED_TIERS = new Set(['T2', 'T3']);
const PRODUCTION_ACCEPTANCE_TITLE_RE = /^\s*Production acceptance\s*:/i;
const REQ_ID_RE = /^REQ-(?:[A-Z]+-)?[0-9]{3,}$/;
const FT_ID_RE = /^FT-[0-9]{3,}$/;
const SDD_SPEC_DIRS = ['tech-specs', 'architecture', 'contracts', 'domains', 'states', 'adrs', 'testing', 'guides', 'runbooks'];
const SDD_SPEC_PATH_RE = /(?:\.\/)?\.memory-bank\/(?:tech-specs|architecture|contracts|domains|states|adrs|testing|guides|runbooks)\/[^\s"'`]+/i;
const ARCHITECTURE_CONTRACT_ADR_PATH_RE = /(?:\.\/)?\.memory-bank\/(?:architecture|contracts|adrs)\/[^\s"'`]+/i;
const RED_VERIFY_PASS_RE = /^\s*SEMANTIC_VERDICT: semantic-pass\s*$/im;

export function createTaskReadinessChecks(context) {
  const ROOT = context.root;
  const { options, addFinding } = context;
  const {
    absolute,
    basenameWithoutExtension,
    isFile,
    joinRelative,
    listFiles,
    readJson,
    readText,
    relativeFromRoot,
  } = context.readers;
  const {
    checkFoundationReadiness,
    checkFoundationWave,
  } = context.foundation;
  const { checkFeatureAcceptanceTrace } = context.acceptance;
  const {
    addLegacyTerminalCompatibilitySummary,
    checkCompactDoneProtocol,
    checkFailedTaskClosure,
    checkFullProtocolTask,
    checkTerminalEvidence,
  } = context.terminal;
  let featureClarificationCache;

  function checkTaskReadiness() {
    const indexRead = readJson(TASK_INDEX_REL);
    if (!indexRead.ok) {
      addFinding('error', 'TASK_INDEX_INVALID', indexRead.message, {
        path: TASK_INDEX_REL,
        suggested_fix: 'Create a valid JSON task index or run mb-init/feature-to-tasks.',
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
          ? 'Create task records via /feature-to-tasks FT-XXX after /write-prd and /prd-to-features.'
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
  
    checkFeatureAcceptanceTrace(orderedRecords);
    checkFailedTaskClosure(orderedRecords);
    checkT2FeatureSemanticCompletion(orderedRecords);
    checkFailedDependentsBlocked(orderedRecords);
    checkQueueState(orderedRecords, records, invalidEntries);
    addLegacyTerminalCompatibilitySummary(orderedRecords);
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
  
      const rel = normalizeRel(joinRelative('.memory-bank/tasks', file));
      if (!isFile(absolute(rel))) {
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
  
  function checkReadyDependencies(record, records) {
    const { id, rel, task } = record;
    if (task.status !== 'ready') return;
    if (!Array.isArray(task.depends_on)) return;
  
    const notDone = task.depends_on
      .map((depId) => records.get(depId))
      .filter((dep) => dep && !DONE_STATUSES.has(dep.task.status));
  
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
    const runRel = normalizeRel(joinRelative('.protocols', id, 'run.md'));
    if (isFile(absolute(runRel))) return;
  
    const severity = options.strict ? 'error' : 'warning';
    addFinding(severity, 'TASK_IN_PROGRESS_WITHOUT_PROTOCOL', `${rel}: in_progress task has no compact ${runRel}.`, {
      path: rel,
      task_id: id,
      suggested_fix: `Create ${runRel} from the framework template or move the task out of in_progress.`,
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
        suggested_fix: 'Add at least one real REQ-<NNN> or REQ-<DOMAIN>-<NNN> to task.reqs; placeholder REQ-XXX does not count.',
      });
    }
  
    const requirementsAbs = absolute('.memory-bank', 'requirements.md');
    if (reqIds.length && isFile(requirementsAbs)) {
      const requirementsText = readText(requirementsAbs);
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
      suggested_fix: `Rerun /feature-to-tasks ${featureId ?? 'FT-<NNN>'} to repair/reconcile feature specs and task cards, or run /spec-auto for autonomous design; then add relevant SDD spec links to source_artifacts, normative_inputs, constraints, invariants, or verification_targets.`,
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
    const writeBoundary = runtimeContext?.write_boundary ?? runtimeContext?.allowed_write_scope;
    const hasWriteBoundary =
      Array.isArray(writeBoundary)
      && writeBoundary.some((value) => nonEmptyString(value));
    if (!hasTouchedFiles && !hasWriteBoundary) {
      issues.push('touched_files or runtime_context.write_boundary must describe the expected change surface');
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
        'Repair the indexed task card through /feature-to-tasks or /foundation-to-tasks; use touched_files as advisory non-exhaustive hints and write_boundary only for a deliberate hard boundary.',
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
          suggested_fix: `Run /feature-doctor ${feature.id} until critical ambiguity is resolved before /feature-to-tasks.`,
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
          suggested_fix: `Complete /feature-doctor ${group.featureId} before generating or running task records for that feature.`,
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
      if (record.task.tier === 'T2' && !isProductionAcceptanceTask(record)) group.hasT2 = true;
    }
  
    const severity = options.strict ? 'error' : 'warning';
    for (const group of groups.values()) {
      if (!group.hasT2) continue;
      const implementationRecords = group.records.filter((record) => !isProductionAcceptanceTask(record));
      if (!implementationRecords.every((record) => DONE_STATUSES.has(record.task.status))) continue;
  
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
            tasks: implementationRecords.map((record) => ({ id: record.id, path: record.rel, tier: record.task.tier })),
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
        if (isProductionAcceptanceTask(record)) return false;
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

    const developmentRecords = records.filter((record) => !isProductionAcceptanceTask(record));

    const inProgress = developmentRecords.filter((record) => record.task.status === 'in_progress');
    const executableReady = developmentRecords.filter((record) => {
      if (record.task.status !== 'ready' || !Array.isArray(record.task.depends_on)) return false;
      return record.task.depends_on.every((depId) => DONE_STATUSES.has(recordsById.get(depId)?.task.status));
    });
  
    const unfinished = developmentRecords.filter((record) => !TERMINAL_STATUSES.has(record.task.status));
    const readyCandidates = developmentRecords.filter((record) => isPlannedReadyCandidate(record, recordsById));
    const blockedByUpstream = developmentRecords.filter((record) => hasBlockedOrFailedUpstream(record, recordsById));
  
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
    return record.task.depends_on.every((depId) => DONE_STATUSES.has(recordsById.get(depId)?.task.status));
  }

  function isProductionAcceptanceTask(record) {
    return PRODUCTION_ACCEPTANCE_TITLE_RE.test(
      typeof record?.task?.title === 'string' ? record.task.title : ''
    );
  }

  function hasBlockedOrFailedUpstream(record, recordsById) {
    if (!Array.isArray(record.task.depends_on)) return false;
    return record.task.depends_on.some((depId) => {
      const dep = recordsById.get(depId);
      return dep && (dep.task.status === 'failed' || dep.task.status === 'blocked');
    });
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
      const filePath = candidate.split('#', 1)[0];
      if (!isAllowedSddSpecPath(filePath)) continue;
      if (isFile(absolute(filePath))) {
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
        const fm = parseFrontmatter(readText(file));
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
    return listFiles(absolute('.memory-bank', 'features')).filter((file) => /\.md$/i.test(file));
  }
  
  function featureFileMatches(file, featureId) {
    const base = basenameWithoutExtension(file);
    return base === featureId || base.startsWith(`${featureId}-`) || base.startsWith(`${featureId}_`);
  }
  
  function featureSemanticPassFiles(featureId) {
    return featureMarkdownFiles()
      .filter((file) => featureFileMatches(file, featureId))
      .filter((file) => {
        try {
          return RED_VERIFY_PASS_RE.test(readText(file));
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
  
      const rel = normalizeRel(relativeFromRoot(file));
      let text = '';
      try {
        text = readText(file);
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
    const base = basenameWithoutExtension(filePath);
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
  
  function addQueueSummary(records, invalidEntries) {
    const counts = {
      total: records.length,
      planned: 0,
      ready: 0,
      in_progress: 0,
      blocked: 0,
      done: 0,
      done_for_prod: 0,
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

  return {
    checkFeatureClarificationReadiness,
    checkTaskReadiness,
  };
}
