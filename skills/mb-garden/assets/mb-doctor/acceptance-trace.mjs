/**
 * Owns feature AC identity, REQ linkage, task coverage, and retained proof.
 * Does not own task lifecycle, Foundation gates, or terminal compatibility.
 * Preserve AC matching rules and acceptance finding payload/order.
 */

import {
  escapeRegExp,
  nonEmptyString,
  normalizeRel,
  splitLines,
} from './readers.mjs';

const LINK_REQUIRED_TIERS = new Set(['T1', 'T2', 'T3']);
const FULL_PROTOCOL_TIERS = new Set(['T2', 'T3']);
const REQ_ID_RE = /^REQ-[0-9]{3,}$/;
const FT_ID_RE = /^FT-[0-9]{3,}$/;
const FEATURE_AC_ID_RE = /^FT-[0-9]{3,}-AC-[0-9]{3,}$/;
const FEATURE_AC_ID_SOURCE = 'FT-[0-9]{3,}-AC-[0-9]{3,}';
const FEATURE_AC_LOCATOR_RE = new RegExp(
  `(?:\\./)?(\\.memory-bank/features/[^#\\s"']+\\.md)#(${FEATURE_AC_ID_SOURCE})(?![A-Za-z0-9_-])`,
  'g',
);
const PASS_EVIDENCE_RE = /^\s*VERDICT: PASS\s*$/im;

export function createAcceptanceTraceChecks(context) {
  const ROOT = context.root;
  const { options, addFinding } = context;
  const {
    absolute,
    basenameWithoutExtension,
    isFile,
    joinRelative,
    listFiles,
    readText,
    relativeFromRoot,
  } = context.readers;
  let featureAcceptanceCache;

  function checkFeatureAcceptanceTrace(records) {
    const productRecords = records.filter((record) => (
      typeof record.task.feature === 'string'
      && FT_ID_RE.test(record.task.feature)
      && record.task.feature !== 'FT-000'
    ));
    if (!productRecords.length) return;
  
    const severity = options.strict ? 'error' : 'warning';
    const currentFeatureIds = new Set(
      productRecords
        .filter((record) => record.task.status === 'planned' || record.task.status === 'ready')
        .map((record) => record.task.feature),
    );
    const acceptance = getFeatureAcceptanceIndex();
    const requirementsAbs = absolute('.memory-bank', 'requirements.md');
    let requirementsText = '';
    if (isFile(requirementsAbs)) {
      try {
        requirementsText = readText(requirementsAbs);
      } catch {
        requirementsText = '';
      }
    }
  
    const enforcedFeatureIds = new Set();
    for (const featureId of new Set(productRecords.map((record) => record.task.feature))) {
      const docs = acceptance.byFeature.get(featureId) ?? [];
      const hasStableAcceptance = docs.some((doc) => doc.criteria.length > 0);
      if (!currentFeatureIds.has(featureId) && !hasStableAcceptance) continue;
      enforcedFeatureIds.add(featureId);
  
      for (const doc of docs) {
        const issues = [...doc.issues];
        for (const criterion of doc.criteria) {
          const missingReqs = criterion.reqs.filter((reqId) => !includesExactId(requirementsText, reqId));
          if (missingReqs.length) {
            issues.push({
              type: 'governing_requirement_missing',
              ac: criterion.id,
              requirements: missingReqs,
            });
          }
        }
        if (!issues.length) continue;
        addFinding(
          severity,
          'FEATURE_ACCEPTANCE_INVALID',
          `${doc.rel}: feature acceptance identity or REQ linkage is invalid.`,
          {
            path: doc.rel,
            details: { feature: featureId, issues },
            suggested_fix:
              `Repair ${doc.rel} through /prd-to-features or /feature-doctor ${featureId}; keep unique feature-matching FT-NNN-AC-NNN headings with existing governing REQ IDs.`,
          },
        );
      }
    }
  
    for (const [acId, criteria] of acceptance.byId.entries()) {
      const relevant = criteria.filter((criterion) => enforcedFeatureIds.has(criterion.featureId));
      if (relevant.length < 2) continue;
      addFinding(
        severity,
        'FEATURE_ACCEPTANCE_DUPLICATE',
        `${acId}: stable acceptance ID is declared more than once.`,
        {
          path: '.memory-bank/features/',
          details: {
            acceptance: acId,
            declarations: relevant.map((criterion) => criterion.rel),
          },
          suggested_fix: 'Keep one owning feature acceptance block per stable AC ID; do not renumber an unchanged accepted criterion.',
        },
      );
    }
  
    const coverage = new Map();
    const taskCriteria = new Map();
    for (const record of productRecords) {
      const analysis = analyzeTaskAcceptanceLinks(record, acceptance);
      taskCriteria.set(record.id, analysis.valid);
      for (const criterion of analysis.valid) {
        if (!coverage.has(criterion.id)) coverage.set(criterion.id, []);
        coverage.get(criterion.id).push(record.id);
      }
  
      if (analysis.issues.length) {
        addFinding(
          severity,
          'TASK_ACCEPTANCE_LINK_INVALID',
          `${record.rel}: task acceptance locator is missing, dangling, or inconsistent.`,
          {
            path: record.rel,
            task_id: record.id,
            details: { issues: analysis.issues },
            suggested_fix:
              `Repair the task through /feature-to-tasks ${record.task.feature}; use exact .memory-bank/features/FT-NNN-<slug>.md#FT-NNN-AC-NNN source_artifacts locators.`,
          },
        );
      }
    }
  
    for (const featureId of enforcedFeatureIds) {
      const criteria = acceptance.byFeature.get(featureId)?.flatMap((doc) => doc.criteria) ?? [];
      const uncovered = criteria
        .filter((criterion) => criterion.valid && !(coverage.get(criterion.id)?.length))
        .map((criterion) => criterion.id);
      if (!uncovered.length) continue;
      addFinding(
        severity,
        'FEATURE_ACCEPTANCE_UNCOVERED',
        `${featureId}: accepted criteria are not linked from any indexed task.`,
        {
          path: '.memory-bank/features/',
          details: { feature: featureId, acceptance: uncovered },
          suggested_fix:
            `Rerun /feature-to-tasks ${featureId} and link each accepted criterion from at least one task source_artifacts entry.`,
        },
      );
    }
  
    for (const record of productRecords) {
      const criteria = taskCriteria.get(record.id) ?? [];
      if (!FULL_PROTOCOL_TIERS.has(record.task.tier) || !criteria.length) continue;
  
      const proof = criteria.map((criterion) => ({
        ac: criterion.id,
        ...analyzeTaskAcceptanceProof(record.task, criterion.id),
      }));
  
      if (record.task.status === 'planned' || record.task.status === 'ready') {
        const invalid = proof.filter((entry) => !entry.valid);
        if (invalid.length) {
          addFinding(
            severity,
            'TASK_ACCEPTANCE_PROOF_MISSING',
            `${record.rel}: planned acceptance trace lacks a complete prospective proof path.`,
            {
              path: record.rel,
              task_id: record.id,
              details: {
                acceptance: invalid.map(({ ac, issues }) => ({ ac, issues })),
              },
              suggested_fix:
                `Rerun /feature-to-tasks ${record.task.feature}; repeat each linked AC ID in a concrete verification_target and evidence_required RED/GREEN observations, or RED_NOT_APPLICABLE reason plus alternative proof.`,
            },
          );
        }
      }
  
      if (record.task.status !== 'done') continue;
      const governed = proof.filter((entry) => entry.hasContract && entry.valid);
      if (!governed.length) continue;
  
      const missing = governed
        .filter((entry) => !hasAcceptanceExecutionEvidence(record.id, entry.ac, entry.notApplicable))
        .map((entry) => entry.ac);
      if (!missing.length) continue;
      addFinding(
        severity,
        'TASK_ACCEPTANCE_EVIDENCE_MISSING',
        `${record.rel}: done task does not retain claim-linked execution and verification evidence for its planned AC path.`,
        {
          path: record.rel,
          task_id: record.id,
          details: { acceptance: missing },
          suggested_fix:
            `Record the exact AC IDs and current-attempt RED/GREEN or accepted not-applicable evidence in .protocols/${record.id}/progress.md, then record verifier-owned PASS evidence for the same IDs in verification.md.`,
        },
      );
    }
  }
  
  function analyzeTaskAcceptanceLinks(record, acceptance) {
    const rawIds = collectFeatureAcIds(record.task.source_artifacts);
    const locators = collectFeatureAcLocators(record.task.source_artifacts);
    const locatedIds = new Set(locators.map((locator) => locator.id));
    const issues = rawIds
      .filter((acId) => !locatedIds.has(acId))
      .map((acId) => ({ type: 'exact_locator_missing', ac: acId }));
    const valid = [];
  
    for (const locator of locators) {
      const matches = acceptance.byLocator.get(`${locator.path}#${locator.id}`) ?? [];
      const criterionFeature = featureIdFromAcceptanceId(locator.id);
      const taskReqs = Array.isArray(record.task.reqs)
        ? record.task.reqs.filter((reqId) => typeof reqId === 'string' && REQ_ID_RE.test(reqId))
        : [];
  
      if (criterionFeature !== record.task.feature) {
        issues.push({
          type: 'feature_mismatch',
          ac: locator.id,
          task_feature: record.task.feature,
        });
        continue;
      }
      if (matches.length !== 1) {
        issues.push({
          type: matches.length ? 'ambiguous_locator' : 'target_missing',
          locator: `${locator.path}#${locator.id}`,
        });
        continue;
      }
  
      const criterion = matches[0];
      if (
        LINK_REQUIRED_TIERS.has(record.task.tier)
        && criterion.reqs.length
        && !criterion.reqs.some((reqId) => taskReqs.includes(reqId))
      ) {
        issues.push({
          type: 'governing_requirement_mismatch',
          ac: locator.id,
          criterion_reqs: criterion.reqs,
          task_reqs: taskReqs,
        });
        continue;
      }
      valid.push(criterion);
    }
  
    return {
      valid: [...new Map(valid.map((criterion) => [criterion.id, criterion])).values()],
      issues,
    };
  }
  
  function analyzeTaskAcceptanceProof(task, acId) {
    const verificationTargets = stringValues(task.verification_targets);
    const evidenceRequired = stringValues(task.evidence_required).filter((value) => includesExactId(value, acId));
    const targetLinked = verificationTargets.some((value) => includesExactId(value, acId));
    const red = evidenceRequired.some((value) => hasConcreteLabel(value, 'RED'));
    const green = evidenceRequired.some((value) => hasConcreteLabel(value, 'GREEN'));
    const notApplicable = evidenceRequired.some((value) => (
      hasConcreteLabel(value, 'RED_NOT_APPLICABLE')
      && hasConcreteLabel(value, 'alternative[_ ]proof')
    ));
    const hasContract = targetLinked && evidenceRequired.some((value) => (
      /\bRED\s*:/i.test(value)
      || /\bGREEN\s*:/i.test(value)
      || /\bRED_NOT_APPLICABLE\s*:/i.test(value)
    ));
    const issues = [];
    if (!targetLinked) issues.push('verification_target_missing');
    if (!((red && green) || notApplicable)) {
      issues.push('RED_and_GREEN_or_not_applicable_alternative_missing');
    }
  
    return {
      valid: issues.length === 0,
      hasContract,
      notApplicable,
      issues,
    };
  }
  
  function hasAcceptanceExecutionEvidence(taskId, acId, notApplicable) {
    const progressRel = normalizeRel(joinRelative('.protocols', taskId, 'progress.md'));
    const verificationRel = normalizeRel(joinRelative('.protocols', taskId, 'verification.md'));
    const progress = readTextIfFile(progressRel);
    const verification = readTextIfFile(verificationRel);
    if (
      !hasConcreteBulletFieldContainingId(progress, 'accepted claim locator(s)', acId)
      || !includesExactId(verification, acId)
    ) return false;
    if (!PASS_EVIDENCE_RE.test(verification)) return false;
  
    if (notApplicable) {
      return hasConcreteBulletField(progress, 'accepted not-applicable reason and alternative proof');
    }
    return (
      hasConcreteBulletField(progress, 'RED observation and evidence')
      && hasConcreteBulletField(progress, 'GREEN observation and evidence')
    );
  }
  
  function getFeatureAcceptanceIndex() {
    if (featureAcceptanceCache) return featureAcceptanceCache;
  
    const docs = [];
    const byFeature = new Map();
    const byId = new Map();
    const byLocator = new Map();
  
    for (const file of featureMarkdownFiles()) {
      const doc = analyzeFeatureAcceptance(file);
      if (!doc.featureId || doc.featureId === 'FT-000') continue;
      docs.push(doc);
      if (!byFeature.has(doc.featureId)) byFeature.set(doc.featureId, []);
      byFeature.get(doc.featureId).push(doc);
  
      for (const criterion of doc.criteria) {
        if (!byId.has(criterion.id)) byId.set(criterion.id, []);
        byId.get(criterion.id).push(criterion);
        const locator = `${criterion.rel}#${criterion.id}`;
        if (!byLocator.has(locator)) byLocator.set(locator, []);
        byLocator.get(locator).push(criterion);
      }
    }
  
    featureAcceptanceCache = { docs, byFeature, byId, byLocator };
    return featureAcceptanceCache;
  }
  
  function analyzeFeatureAcceptance(file) {
    const featureId = featureIdFromFile(file);
    const rel = normalizeRel(relativeFromRoot(file));
    const text = readTextIfFile(rel);
    const section = markdownSection(text, 'Acceptance Criteria');
    const issues = [];
    const criteria = [];
  
    if (!section) {
      issues.push({ type: 'acceptance_section_missing' });
      return { featureId, rel, criteria, issues };
    }
  
    const headings = [];
    section.lines.forEach((line, index) => {
      const heading = line.match(/^###\s+(.+?)\s*$/);
      if (!heading) return;
      const id = heading[1].match(new RegExp(`^(${FEATURE_AC_ID_SOURCE})(?:\\s+(?:[-—:]\\s*)?.*)?$`))?.[1];
      headings.push({ index, id, text: heading[1] });
    });
  
    if (!headings.length) {
      issues.push({ type: 'stable_acceptance_id_missing' });
      return { featureId, rel, criteria, issues };
    }
  
    headings.forEach((heading, index) => {
      if (!heading.id || !FEATURE_AC_ID_RE.test(heading.id)) {
        issues.push({ type: 'acceptance_heading_invalid', heading: heading.text });
        return;
      }
      const blockEnd = headings[index + 1]?.index ?? section.lines.length;
      const block = section.lines.slice(heading.index + 1, blockEnd).join('\n');
      const reqLine = block.match(/^-\s*REQ:\s*(.+)$/im)?.[1] ?? '';
      const reqs = [...new Set(reqLine.match(/REQ-[0-9]{3,}/g) ?? [])];
      const valid = featureIdFromAcceptanceId(heading.id) === featureId && reqs.length > 0;
      if (featureIdFromAcceptanceId(heading.id) !== featureId) {
        issues.push({ type: 'acceptance_feature_mismatch', ac: heading.id, feature: featureId });
      }
      if (!reqs.length) issues.push({ type: 'governing_requirement_missing', ac: heading.id });
      criteria.push({
        id: heading.id,
        featureId,
        rel,
        reqs,
        valid,
      });
    });
  
    return { featureId, rel, criteria, issues };
  }
  
  function markdownSection(text, title) {
    const lines = splitLines(String(text ?? '').replace(/\r\n/g, '\n'));
    const heading = new RegExp(`^##\\s+${escapeRegExp(title)}\\s*$`, 'i');
    const start = lines.findIndex((line) => heading.test(line));
    if (start === -1) return null;
    let end = lines.length;
    for (let index = start + 1; index < lines.length; index += 1) {
      if (/^##\s+/.test(lines[index])) {
        end = index;
        break;
      }
    }
    return { lines: lines.slice(start + 1, end) };
  }
  
  function collectFeatureAcLocators(value) {
    const locators = [];
    for (const text of stringValues(value)) {
      for (const match of text.matchAll(FEATURE_AC_LOCATOR_RE)) {
        locators.push({
          path: normalizeRel(match[1]),
          id: match[2],
        });
      }
    }
    return locators;
  }
  
  function collectFeatureAcIds(value) {
    const ids = [];
    const re = new RegExp(FEATURE_AC_ID_SOURCE, 'g');
    for (const text of stringValues(value)) ids.push(...(text.match(re) ?? []));
    return [...new Set(ids)];
  }
  
  function stringValues(value) {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.flatMap((item) => stringValues(item));
    if (!value || typeof value !== 'object') return [];
    return Object.values(value).flatMap((item) => stringValues(item));
  }
  
  function featureIdFromAcceptanceId(acId) {
    return String(acId ?? '').match(/^(FT-[0-9]{3,})-AC-[0-9]{3,}$/)?.[1];
  }
  
  function includesExactId(text, id) {
    return new RegExp(`(?:^|[^A-Za-z0-9-])${escapeRegExp(id)}(?:$|[^A-Za-z0-9-])`).test(String(text ?? ''));
  }
  
  function hasConcreteLabel(text, labelSource) {
    const match = String(text ?? '').match(new RegExp(`\\b${labelSource}\\s*:\\s*([^;\\n]+)`, 'i'));
    return Boolean(match && isConcreteHandoffValue(match[1]));
  }
  
  function hasConcreteBulletField(text, label) {
    const match = String(text ?? '').match(new RegExp(`^-\\s*${escapeRegExp(label)}:\\s*(.+)$`, 'im'));
    return Boolean(match && isConcreteHandoffValue(match[1]));
  }
  
  function hasConcreteBulletFieldContainingId(text, label, id) {
    const match = String(text ?? '').match(new RegExp(`^-\\s*${escapeRegExp(label)}:\\s*(.+)$`, 'im'));
    return Boolean(
      match
      && isConcreteHandoffValue(match[1])
      && includesExactId(match[1], id)
    );
  }
  
  function readTextIfFile(rel) {
    const abs = absolute(rel);
    if (!isFile(abs)) return '';
    try {
      return readText(abs).replace(/\r\n/g, '\n');
    } catch {
      return '';
    }
  }
  
  function isConcreteHandoffValue(value) {
    if (!nonEmptyString(value)) return false;
    return !/^(?:tbd|todo|none|n\/a|not[_ -]?applicable|<[^>]+>|\{\{[^}]+\}\})$/i.test(value.trim());
  }
  
  function featureMarkdownFiles() {
    return listFiles(absolute('.memory-bank', 'features')).filter((file) => /\.md$/i.test(file));
  }
  
  function featureIdFromFile(filePath) {
    const base = basenameWithoutExtension(filePath);
    const match = base.match(/^(FT-[0-9]{3,})(?:[-_].*)?$/);
    return match?.[1];
  }

  return { checkFeatureAcceptanceTrace };
}
