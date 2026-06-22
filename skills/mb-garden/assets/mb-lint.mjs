#!/usr/bin/env node
/**
 * mb-lint.mjs
 *
 * Deterministic lint for `.memory-bank/`.
 * Intentionally mechanical: structure + frontmatter + broken links.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MB = path.join(ROOT, '.memory-bank');

if (!fs.existsSync(MB)) {
  console.error('❌ .memory-bank/ not found. Run mb-init first.');
  process.exit(1);
}

const REQUIRED = [
  '.memory-bank/index.md',
  '.memory-bank/constitution.md',
  '.memory-bank/mbb/index.md',
  '.memory-bank/changelog.md',
  '.memory-bank/workflows/mb-sync.md',
  '.memory-bank/testing/index.md',
  '.memory-bank/schemas/task.schema.json',
  '.memory-bank/tasks/index.json',
  '.memory-bank/skills/index.md',
];

const ALLOWED_STATUS = new Set(['draft', 'active', 'deprecated', 'archived']);
const ALLOWED_LIFECYCLE = new Set(['planned', 'implemented', 'verified']);
const ALLOWED_CLARIFICATION_STATUS = new Set(['pending', 'complete', 'blocked']);
const ALLOWED_PRD_CLARIFICATION_STATUS = new Set(['pending', 'complete', 'blocked']);
const ANALYSIS_DIR_REL = '.memory-bank/analysis';
const ANALYSIS_PRODUCT_BRIEF_REL = '.memory-bank/analysis/product-brief.md';
const ANALYSIS_PRD_SOURCE_MARKER = '.memory-bank/analysis/product-brief.md';
const ALLOWED_TASK_STATUS = new Set(['planned', 'ready', 'in_progress', 'blocked', 'done', 'failed']);
const ALLOWED_TASK_TIER = new Set(['T0', 'T1', 'T2', 'T3']);
const TASK_ID_RE = /^TASK-[0-9]{3,}$/;
const TASK_FILE_RE = /^TASK-[0-9]{3,}\.task\.json$/;
const FEATURE_ID_RE = /^FT-[0-9]{3,}$/;
const INDEX_TOP_LEVEL_KEYS = new Set(['version', 'tasks']);
const INDEX_TASK_ENTRY_KEYS = new Set(['id', 'file']);
const FULL_PROTOCOL_FILES = ['context.md', 'plan.md', 'progress.md', 'verification.md', 'handoff.md'];
const GATE_KEYS = new Set(['name', 'command', 'required']);
const RUNTIME_CONTEXT_KEYS = new Set([
  'packet_required',
  'packet_ref',
  'allowed_write_scope',
  'forbidden_scope',
  'stop_conditions',
]);
const RUNTIME_CONTEXT_ARRAY_FIELDS = ['allowed_write_scope', 'forbidden_scope', 'stop_conditions'];
const LEGACY_TASK_RISK_KEYS = new Set(['risk', 'risk.level', 'risk_level', 'riskLevel']);
const FULL_PROTOCOL_TIERS = new Set(['T2', 'T3']);
const FULL_PROTOCOL_STATUSES = new Set(['in_progress', 'done', 'failed']);
const PASS_EVIDENCE_RE = /^\s*VERDICT: PASS\s*$/im;
const FAIL_EVIDENCE_RE = /\bverdict\s*:?\s*fail(?:ed)?\b|\bfail(?:ed)?\b|\berror\b/i;
const COMPACT_EVIDENCE_RE =
  /^(?:[-*]\s*)?(?:evidence|checks?|result|output|log|artifact|report)\s*:\s*(?!n\/a\b|none\b|tbd\b|todo\b|\.{3}$).+/im;
const REQUIRED_TASK_FIELDS = [
  'id',
  'title',
  'status',
  'wave',
  'feature',
  'reqs',
  'depends_on',
  'touched_files',
  'tier',
  'gates',
  'verify',
  'docs',
  'evidence_required',
  'source_artifacts',
  'normative_inputs',
  'constraints',
  'invariants',
  'verification_targets',
];
const OPTIONAL_TASK_FIELDS = [
  'purpose',
  'success_outcome',
  'anti_goals',
  'runtime_context',
];
const TASK_TOP_LEVEL_KEYS = new Set([...REQUIRED_TASK_FIELDS, ...OPTIONAL_TASK_FIELDS]);

const errors = [];
const warnings = [];

function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

function readJson(rel) {
  const p = path.join(ROOT, rel);
  try {
    return JSON.parse(readText(p));
  } catch (err) {
    errors.push(`${rel}: invalid JSON (${err.message})`);
    return undefined;
  }
}

function listMarkdownFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function hasFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  return normalized.startsWith('---\n') && normalized.includes('\n---\n');
}

function parseFrontmatter(text) {
  // Minimal YAML-ish parser for frontmatter block:
  // - key: value
  // - key: (then indented block, e.g. lists)
  const normalized = text.replace(/\r\n/g, '\n');
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const block = normalized.slice(4, end).trimEnd();
  const lines = block.split('\n');
  const kv = {};

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([A-Za-z0-9_\-]+):\s*(.*)$/);
    if (!m) {
      i += 1;
      continue;
    }

    const key = m[1];
    const rest = (m[2] ?? '').trimEnd();

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

function normalizeRel(p) {
  return p.replace(/\\/g, '/');
}

function isIndexDoc(rel) {
  const n = normalizeRel(rel);
  return n.endsWith('/index.md') || n === '.memory-bank/index.md';
}

function isLifecycleScopedDoc(rel) {
  const n = normalizeRel(rel);
  if (isIndexDoc(n)) return false;
  return (
    n.startsWith('.memory-bank/epics/') ||
    n.startsWith('.memory-bank/features/') ||
    n.startsWith('.memory-bank/requirements/')
  );
}

function isMetadataScopedDoc(rel) {
  const n = normalizeRel(rel);
  if (isIndexDoc(n)) return false;
  return (
    n === '.memory-bank/product.md' ||
    n === '.memory-bank/requirements.md' ||
    n === '.memory-bank/spec-index.md' ||
    n === '.memory-bank/glossary.md' ||
    n === '.memory-bank/invariants.md' ||
    n.startsWith('.memory-bank/architecture/') ||
    n.startsWith('.memory-bank/guides/') ||
    n.startsWith('.memory-bank/adrs/') ||
    n.startsWith('.memory-bank/tech-specs/') ||
    n.startsWith('.memory-bank/domains/') ||
    n.startsWith('.memory-bank/contracts/') ||
    n.startsWith('.memory-bank/states/') ||
    n.startsWith('.memory-bank/runbooks/') ||
    n.startsWith('.memory-bank/epics/') ||
    n.startsWith('.memory-bank/features/') ||
    n.startsWith('.memory-bank/requirements/') ||
    n.startsWith('.memory-bank/bugs/')
  );
}

function stripYamlQuotes(value) {
  const v = String(value ?? '').trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function hasSourceOfTruth(fm) {
  if (!fm) return false;
  if (!Object.prototype.hasOwnProperty.call(fm, 'source_of_truth')) return false;
  const raw = String(fm.source_of_truth ?? '').trim();
  if (!raw || raw === '[]') return false;
  if (raw.includes('\n') || raw.startsWith('-')) {
    return /^\s*-\s+\S+/m.test(raw);
  }
  return true;
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function isFeatureDoc(rel) {
  const n = normalizeRel(rel);
  return n.startsWith('.memory-bank/features/') && path.basename(n).startsWith('FT-') && n.endsWith('.md');
}

function isPrdDoc(rel) {
  return normalizeRel(rel) === '.memory-bank/prd.md';
}

function featureIdFromFile(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  const match = base.match(/^(FT-[0-9]{3,})(?:[-_].*)?$/);
  return match?.[1];
}

function hasClarificationCompletionMarker(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  return (
    /^## Clarifications\s*$/m.test(normalized) ||
    /(?:^|\n)Clarification: no critical ambiguity found(?:\n|$)/.test(normalized)
  );
}

function hasSectionHeading(text, title) {
  const normalized = text.replace(/\r\n/g, '\n');
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^#{2,6}\\s+${escapedTitle}\\s*$`, 'im').test(normalized);
}

function isAnalysisBrainstormingReport(rel) {
  const n = normalizeRel(rel);
  return n.startsWith(`${ANALYSIS_DIR_REL}/brainstorming/`) && path.basename(n) !== 'index.md' && n.endsWith('.md');
}

function prdFiles() {
  const candidates = [
    '.memory-bank/prd.md',
    '.memory-bank/PRD.md',
    '.memory-bank/product-requirements.md',
    '.memory-bank/product-requirements-document.md',
  ];
  return candidates.filter((rel) => hasFile(path.join(ROOT, rel)));
}

function checkAnalysisStructure() {
  const analysisDir = path.join(ROOT, ANALYSIS_DIR_REL);
  if (!fs.existsSync(analysisDir)) return;

  if (!hasFile(path.join(analysisDir, 'index.md'))) {
    errors.push(`${ANALYSIS_DIR_REL}: missing required index.md`);
  }

  const productBriefPath = path.join(ROOT, ANALYSIS_PRODUCT_BRIEF_REL);
  const productBriefExists = hasFile(productBriefPath);
  if (productBriefExists) {
    const text = readText(productBriefPath);
    const fm = parseFrontmatter(text);
    if (!fm || stripYamlQuotes(fm.type) !== 'product-brief') {
      errors.push(`${ANALYSIS_PRODUCT_BRIEF_REL}: frontmatter must include 'type: product-brief'`);
    }
    if (!fm || !hasOwn(fm, 'status') || !String(fm.status).trim()) {
      errors.push(`${ANALYSIS_PRODUCT_BRIEF_REL}: frontmatter must include non-empty 'status'`);
    }
    if (!hasSectionHeading(text, 'Decision')) {
      errors.push(`${ANALYSIS_PRODUCT_BRIEF_REL}: missing 'Decision' section`);
    }
  }

  for (const filePath of listMarkdownFiles(analysisDir)) {
    const rel = normalizeRel(path.relative(ROOT, filePath));
    if (!isAnalysisBrainstormingReport(rel)) continue;

    const text = readText(filePath);
    const fm = parseFrontmatter(text);
    if (!fm || stripYamlQuotes(fm.type) !== 'brainstorming-report') {
      errors.push(`${rel}: frontmatter must include 'type: brainstorming-report'`);
    }
    if (!fm || !hasOwn(fm, 'id') || !String(fm.id).trim()) {
      errors.push(`${rel}: frontmatter must include non-empty 'id'`);
    }
    if (!hasSectionHeading(text, 'Recommended next step')) {
      errors.push(`${rel}: missing 'Recommended next step' section`);
    }
  }

  if (productBriefExists) {
    for (const rel of prdFiles()) {
      const text = readText(path.join(ROOT, rel));
      if (!text.includes(ANALYSIS_PRD_SOURCE_MARKER)) {
        warnings.push(`${rel}: PRD exists but does not mention ${ANALYSIS_PRD_SOURCE_MARKER}`);
      }
    }
  }
}

function checkRequiredFiles() {
  for (const rel of REQUIRED) {
    const p = path.join(ROOT, rel);
    if (!fs.existsSync(p)) errors.push(`Missing required file: ${rel}`);
  }
}

function checkFrontmatter(filePath, text) {
  const rel = normalizeRel(path.relative(ROOT, filePath));
  if (!hasFrontmatter(text)) {
    errors.push(`${rel}: missing YAML frontmatter`);
    return;
  }
  const fm = parseFrontmatter(text);
  if (!fm || !fm.description) {
    errors.push(`${rel}: frontmatter must include 'description'`);
  }
  if (!fm || !fm.status) {
    errors.push(`${rel}: frontmatter must include 'status'`);
  } else {
    const status = stripYamlQuotes(fm.status);
    if (!ALLOWED_STATUS.has(status)) {
      errors.push(`${rel}: invalid status '${status}' (allowed: draft|active|deprecated|archived)`);
    }

    if (isMetadataScopedDoc(rel) && status === 'active') {
      if (!fm.owner || !String(fm.owner).trim()) warnings.push(`${rel}: missing 'owner' (recommended for active docs)`);
      if (!fm.last_updated || !String(fm.last_updated).trim()) {
        warnings.push(`${rel}: missing 'last_updated' (recommended for active docs, YYYY-MM-DD)`);
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(stripYamlQuotes(fm.last_updated))) {
        warnings.push(`${rel}: invalid 'last_updated' format (expected YYYY-MM-DD)`);
      }
      if (!hasSourceOfTruth(fm)) warnings.push(`${rel}: missing 'source_of_truth' (recommended for active docs)`);
    }
  }

  if (isLifecycleScopedDoc(rel)) {
    if (!fm || !fm.lifecycle) {
      warnings.push(`${rel}: missing 'lifecycle' (planned|implemented|verified)`);
    } else {
      const lifecycle = stripYamlQuotes(fm.lifecycle);
      if (!ALLOWED_LIFECYCLE.has(lifecycle)) {
        errors.push(
          `${rel}: invalid lifecycle '${lifecycle}' (allowed: planned|implemented|verified)`
        );
      }
    }
  }

  checkFeatureClarificationMetadata(rel, text, fm);
  checkPrdMetadata(rel, text, fm);
}

function checkFeatureClarificationMetadata(rel, text, fm) {
  if (!isFeatureDoc(rel)) return;
  if (!fm) return;

  let clarificationStatus;
  if (!hasOwn(fm, 'clarification_status')) {
    return;
  } else {
    clarificationStatus = stripYamlQuotes(fm.clarification_status);
    if (!ALLOWED_CLARIFICATION_STATUS.has(clarificationStatus)) {
      errors.push(`${rel}: invalid clarification_status '${clarificationStatus}' (allowed: pending|complete|blocked)`);
    }
  }

  if (hasOwn(fm, 'last_clarified')) {
    const lastClarified = stripYamlQuotes(fm.last_clarified);
    if (lastClarified !== 'null' && !/^\d{4}-\d{2}-\d{2}$/.test(lastClarified)) {
      errors.push(`${rel}: invalid last_clarified '${lastClarified}' (expected null or YYYY-MM-DD)`);
    }
  }

  if (hasOwn(fm, 'clarification_questions')) {
    const questionCount = stripYamlQuotes(fm.clarification_questions);
    if (!/^(0|[1-9][0-9]*)$/.test(questionCount)) {
      errors.push(`${rel}: invalid clarification_questions '${questionCount}' (expected integer >= 0)`);
    }
  }

  if (clarificationStatus === 'complete' && !hasClarificationCompletionMarker(text)) {
    errors.push(
      `${rel}: clarification_status complete requires '## Clarifications' or 'Clarification: no critical ambiguity found'`
    );
  }
}

function checkPrdMetadata(rel, text, fm) {
  if (!isPrdDoc(rel)) return;
  if (!fm) return;

  if (stripYamlQuotes(fm.type) !== 'prd') {
    errors.push(`${rel}: frontmatter must include 'type: prd'`);
  }

  if (!hasOwn(fm, 'constitution_checked') || stripYamlQuotes(fm.constitution_checked) !== 'true') {
    errors.push(`${rel}: frontmatter must include 'constitution_checked: true'`);
  }

  if (!hasOwn(fm, 'clarification_status')) {
    errors.push(`${rel}: frontmatter must include 'clarification_status' (pending|complete|blocked)`);
  } else {
    const status = stripYamlQuotes(fm.clarification_status);
    if (!ALLOWED_PRD_CLARIFICATION_STATUS.has(status)) {
      errors.push(`${rel}: invalid clarification_status '${status}' (allowed: pending|complete|blocked)`);
    }
  }

  if (stripYamlQuotes(fm.clarification_status) === 'complete' && !hasSectionHeading(text, 'Clarifications')) {
    errors.push(`${rel}: clarification_status complete requires a 'Clarifications' section`);
  }
}

function extractLinks(text) {
  // markdown links: [text](path)
  // Ignore anything inside code fences and inline code to avoid flagging examples/templates.
  const stripped = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '');
  const links = [];
  const re = /\[[^\]]+\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    links.push(m[1]);
  }
  return links;
}

function checkLinks(filePath, text) {
  const rel = normalizeRel(path.relative(ROOT, filePath));
  const dir = path.dirname(filePath);
  for (const link of extractLinks(text)) {
    if (/^(https?:|mailto:|#)/.test(link)) continue;
    if (link.startsWith('/')) continue;
    const target = path.normalize(path.join(dir, link));
    if (!target.startsWith(ROOT)) continue;
    if (!fs.existsSync(target)) {
      errors.push(`${rel}: broken link -> ${link}`);
    }
  }
}

function checkIndexRouters() {
  // For each folder inside .memory-bank with >3 md files, require index.md.
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const mdFiles = entries
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map((e) => e.name);

    const hasIndex = mdFiles.includes('index.md');
    const mdCount = mdFiles.length;

    const relDir = normalizeRel(path.relative(ROOT, dir));
    if (mdCount > 3 && !hasIndex) {
      warnings.push(`${relDir}: has ${mdCount} md files but no index.md router`);
    }

    for (const e of entries) {
      if (e.isDirectory()) walk(path.join(dir, e.name));
    }
  }

  walk(MB);
}

function checkFileSize(filePath, text) {
  const rel = normalizeRel(path.relative(ROOT, filePath));
  const lines = text.split(/\r?\n/).length;
  if (lines > 2000) {
    warnings.push(`${rel}: very large file (${lines} lines). Consider splitting.`);
  }
}

function hasDoneVerifyTextMarker(value) {
  const text = String(value ?? '').trim();
  if (!text) return false;
  return PASS_EVIDENCE_RE.test(text);
}

function hasDoneVerifyObjectMarker(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value).some(([key, raw]) => {
    const values = Array.isArray(raw) ? raw : [raw];
    const hasNonEmptyValue = values.some((item) => String(item ?? '').trim());
    if (!hasNonEmptyValue) return false;
    return PASS_EVIDENCE_RE.test(key) || values.some((item) => hasDoneVerifyTextMarker(item));
  });
}

function hasDoneVerifyEvidence(task) {
  if (!Array.isArray(task.verify) || task.verify.length === 0) return false;
  return task.verify.some((entry) => {
    if (typeof entry === 'string') return hasDoneVerifyTextMarker(entry);
    return hasDoneVerifyObjectMarker(entry);
  });
}

function hasNonEmptyEvidenceValue(value) {
  if (Array.isArray(value)) return value.some((item) => hasNonEmptyEvidenceValue(item));
  if (value && typeof value === 'object') return Object.values(value).some((item) => hasNonEmptyEvidenceValue(item));
  return String(value ?? '').trim().length > 0;
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

function hasTaskStatusEvidence(task, status) {
  if (!Array.isArray(task.verify) || task.verify.length === 0) return false;
  return task.verify.some((entry) => hasStatusEvidenceMarker(entry, status));
}

function hasCompactRunEvidence(id) {
  const runPath = path.join(protocolDirForTask(id), 'run.md');
  if (!hasFile(runPath)) return false;

  const text = readText(runPath).replace(/\r\n/g, '\n');
  return PASS_EVIDENCE_RE.test(text) || COMPACT_EVIDENCE_RE.test(text);
}

function checkDoneEvidence(rel, task) {
  if (task.status !== 'done') return;
  if (!ALLOWED_TASK_TIER.has(task.tier)) return;
  if (FULL_PROTOCOL_TIERS.has(task.tier)) return;

  if (!hasDoneVerifyEvidence(task) && !hasCompactRunEvidence(task.id)) {
    errors.push(
      `${rel}: ${task.tier} done task must include completed evidence in 'verify' or compact .protocols/${task.id}/run.md`
    );
  }
}

function checkArrayField(rel, task, field) {
  if (!Array.isArray(task[field])) {
    errors.push(`${rel}: '${field}' must be an array`);
  }
}

function checkOptionalStringField(rel, object, field) {
  if (!hasOwn(object, field)) return;
  if (typeof object[field] !== 'string') {
    errors.push(`${rel}: '${field}' must be a string when present`);
  }
}

function checkOptionalStringArrayField(rel, object, field, label = field) {
  if (!hasOwn(object, field)) return;
  if (!Array.isArray(object[field])) {
    errors.push(`${rel}: '${label}' must be an array when present`);
    return;
  }

  object[field].forEach((item, index) => {
    if (typeof item !== 'string') {
      errors.push(`${rel}: '${label}[${index}]' must be a string`);
    }
  });
}

function normalizePacketRef(value) {
  return normalizeRel(String(value ?? '').trim()).replace(/^\.\//, '');
}

function canonicalPacketRef(taskId) {
  return `.memory-bank/packets/${taskId}.packet.json`;
}

function checkOptionalTaskRuntimeContext(rel, task) {
  checkOptionalStringField(rel, task, 'purpose');
  checkOptionalStringField(rel, task, 'success_outcome');
  checkOptionalStringArrayField(rel, task, 'anti_goals');

  if (!hasOwn(task, 'runtime_context')) return;

  const runtimeContext = task.runtime_context;
  if (!runtimeContext || typeof runtimeContext !== 'object' || Array.isArray(runtimeContext)) {
    errors.push(`${rel}: 'runtime_context' must be an object when present`);
    return;
  }

  checkExactKeys(rel, runtimeContext, RUNTIME_CONTEXT_KEYS, 'runtime_context');

  if (hasOwn(runtimeContext, 'packet_required') && typeof runtimeContext.packet_required !== 'boolean') {
    errors.push(`${rel}: 'runtime_context.packet_required' must be a boolean when present`);
  }
  if (hasOwn(runtimeContext, 'packet_ref') && typeof runtimeContext.packet_ref !== 'string') {
    errors.push(`${rel}: 'runtime_context.packet_ref' must be a string when present`);
  }
  for (const field of RUNTIME_CONTEXT_ARRAY_FIELDS) {
    checkOptionalStringArrayField(rel, runtimeContext, field, `runtime_context.${field}`);
  }

  if (runtimeContext.packet_required !== true) return;

  if (typeof runtimeContext.packet_ref !== 'string' || !runtimeContext.packet_ref.trim()) {
    errors.push(`${rel}: runtime_context.packet_required true requires non-empty runtime_context.packet_ref`);
    return;
  }

  const packetRef = normalizePacketRef(runtimeContext.packet_ref);
  if (packetRef !== canonicalPacketRef(task.id)) {
    errors.push(
      `${rel}: runtime_context.packet_ref for required packet must be ${canonicalPacketRef(task.id)}`
    );
  }
}

function checkExactKeys(rel, object, allowedKeys, label) {
  const keys = Object.keys(object);
  const extraKeys = keys.filter((key) => !allowedKeys.has(key));
  if (extraKeys.length) {
    errors.push(`${rel}: ${label} must not contain extra keys: ${extraKeys.join(', ')}`);
  }
}

function checkGateItems(rel, task) {
  if (!Array.isArray(task.gates)) return;

  task.gates.forEach((gate, index) => {
    const label = `gates[${index}]`;
    if (!gate || typeof gate !== 'object' || Array.isArray(gate)) {
      errors.push(`${rel}: ${label} must be an object with name, command, and required`);
      return;
    }

    checkExactKeys(rel, gate, GATE_KEYS, label);

    if (typeof gate.name !== 'string' || !gate.name.trim()) {
      errors.push(`${rel}: ${label}.name must be a non-empty string`);
    }
    if (typeof gate.command !== 'string' || !gate.command.trim()) {
      errors.push(`${rel}: ${label}.command must be a non-empty string`);
    }
    if (typeof gate.required !== 'boolean') {
      errors.push(`${rel}: ${label}.required must be a boolean`);
    }
  });
}

function checkLegacyTaskRiskKeys(rel, task) {
  for (const key of LEGACY_TASK_RISK_KEYS) {
    if (hasOwn(task, key)) {
      errors.push(`${rel}: task record must not contain '${key}'; use 'tier' (T0|T1|T2|T3)`);
    }
  }
}

function featureDocsById() {
  const featureDir = path.join(ROOT, '.memory-bank', 'features');
  const byId = new Map();
  if (!fs.existsSync(featureDir)) return byId;

  for (const file of listMarkdownFiles(featureDir)) {
    const featureId = featureIdFromFile(file);
    if (!featureId) continue;

    const rel = normalizeRel(path.relative(ROOT, file));
    const fm = parseFrontmatter(readText(file));
    const status = fm && hasOwn(fm, 'clarification_status') ? stripYamlQuotes(fm.clarification_status) : undefined;
    const entry = { rel, status };
    if (!byId.has(featureId)) byId.set(featureId, []);
    byId.get(featureId).push(entry);
  }

  return byId;
}

function checkTaskFeatureClarification(rel, task, featuresById) {
  if (typeof task.feature !== 'string') return;
  const featureId = task.feature.trim();
  if (!FEATURE_ID_RE.test(featureId)) return;

  const featureDocs = featuresById.get(featureId);
  if (!featureDocs?.length) return;

  for (const feature of featureDocs) {
    if (feature.status !== 'pending' && feature.status !== 'blocked') continue;
    errors.push(
      `${rel}: indexed task '${task.id}' must not be generated from ${feature.status} clarification feature ${featureId} (${feature.rel})`
    );
  }
}

function walkJson(value, visitor, pathParts = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const childPath = [...pathParts, String(index)];
      visitor(String(index), item, childPath);
      walkJson(item, visitor, childPath);
    });
    return;
  }

  if (!value || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value)) {
    const childPath = [...pathParts, key];
    visitor(key, child, childPath);
    walkJson(child, visitor, childPath);
  }
}

function checkTaskSchemaDoesNotContainRisk(schemaRel, schema) {
  if (schema === undefined) return;

  const findings = new Set();
  walkJson(schema, (key, value, pathParts) => {
    const jsonPath = pathParts.join('.');
    if (key === 'risk' || key === 'risk.level') {
      findings.add(jsonPath);
    }
    if (typeof value === 'string' && /\brisk(?:\.level)?\b/i.test(value)) {
      findings.add(`${jsonPath}=${value}`);
    }
  });

  if (findings.size) {
    errors.push(`${schemaRel}: task schema must not contain risk or risk.level (${[...findings].join(', ')})`);
  }
}

function protocolDirForTask(id) {
  return path.join(ROOT, '.protocols', id);
}

function taskArtifactDirForTask(id) {
  return path.join(ROOT, '.tasks', id);
}

function hasFile(absPath) {
  return fs.existsSync(absPath) && fs.statSync(absPath).isFile();
}

function listFilesRecursive(absDir) {
  if (!fs.existsSync(absDir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const full = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function missingFullProtocolFiles(id) {
  const dir = protocolDirForTask(id);
  return FULL_PROTOCOL_FILES.filter((file) => !hasFile(path.join(dir, file)));
}

function hasCompactOnlyProtocol(id) {
  const dir = protocolDirForTask(id);
  const hasRun = hasFile(path.join(dir, 'run.md'));
  if (!hasRun) return false;
  return missingFullProtocolFiles(id).length > 0;
}

function isRedVerificationFile(file) {
  return /red/i.test(path.basename(file));
}

function hasProtocolOrArtifactStatusEvidence(id, status) {
  const marker = status === 'done' ? PASS_EVIDENCE_RE : FAIL_EVIDENCE_RE;
  const files = [
    ...listFilesRecursive(protocolDirForTask(id)).filter((file) => file.endsWith('.md')),
    ...listFilesRecursive(taskArtifactDirForTask(id)).filter((file) => /\.(md|txt|log|json)$/i.test(file)),
  ].filter((file) => !isRedVerificationFile(file));

  return files.some((file) => {
    try {
      return marker.test(readText(file));
    } catch {
      return false;
    }
  });
}

function checkTierProtocolRequirements(rel, task) {
  if (!ALLOWED_TASK_TIER.has(task.tier)) return;
  if (!FULL_PROTOCOL_TIERS.has(task.tier)) return;
  if (!FULL_PROTOCOL_STATUSES.has(task.status)) return;

  const missing = missingFullProtocolFiles(task.id);
  if (missing.length) {
    errors.push(`${rel}: ${task.tier} ${task.status} task must have full protocol files: ${missing.join(', ')}`);
  }

  if (hasCompactOnlyProtocol(task.id)) {
    errors.push(`${rel}: ${task.tier} ${task.status} task must not use compact-only protocol`);
  }

  if (task.status === 'in_progress') return;

  const hasStatusEvidence =
    hasTaskStatusEvidence(task, task.status) || hasProtocolOrArtifactStatusEvidence(task.id, task.status);

  if (task.status === 'done' && !hasStatusEvidence) {
    errors.push(
      `${rel}: ${task.tier} done task must have PASS verification evidence/verdict in task.verify, .protocols/${task.id}/, or .tasks/${task.id}/`
    );
  }

  if (task.status === 'failed' && !hasStatusEvidence) {
    errors.push(
      `${rel}: ${task.tier} failed task must have FAIL verification evidence/verdict in task.verify, .protocols/${task.id}/, or .tasks/${task.id}/`
    );
  }
}

function checkTaskRecords() {
  const schemaRel = '.memory-bank/schemas/task.schema.json';
  const indexRel = '.memory-bank/tasks/index.json';

  if (!fs.existsSync(path.join(ROOT, schemaRel))) {
    errors.push(`Missing required file: ${schemaRel}`);
  } else {
    checkTaskSchemaDoesNotContainRisk(schemaRel, readJson(schemaRel));
  }

  if (!fs.existsSync(path.join(ROOT, indexRel))) {
    errors.push(`Missing required file: ${indexRel}`);
    return;
  }

  const index = readJson(indexRel);
  if (index === undefined) return;

  if (!index || typeof index !== 'object' || Array.isArray(index)) {
    errors.push(`${indexRel}: index must be a JSON object`);
    return;
  }
  checkExactKeys(indexRel, index, INDEX_TOP_LEVEL_KEYS, 'top-level object');
  if (index.version !== 1) {
    errors.push(`${indexRel}: 'version' must be 1`);
  }
  if (!Array.isArray(index.tasks)) {
    errors.push(`${indexRel}: 'tasks' must be an array`);
    return;
  }

  const records = new Map();
  const dependencies = new Map();
  const featuresById = featureDocsById();

  for (const entry of index.tasks) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${indexRel}: each task index entry must be an object`);
      continue;
    }
    checkExactKeys(indexRel, entry, INDEX_TASK_ENTRY_KEYS, `task index entry '${entry.id ?? '<missing-id>'}'`);

    const id = entry.id;
    const file = entry.file;
    if (typeof id !== 'string' || !id.trim()) {
      errors.push(`${indexRel}: each task index entry needs a non-empty 'id'`);
      continue;
    }
    if (!TASK_ID_RE.test(id)) {
      errors.push(`${indexRel}: task id '${id}' must match TASK-[0-9]{3,}`);
      continue;
    }
    if (records.has(id)) {
      errors.push(`${indexRel}: duplicate task id '${id}'`);
      continue;
    }
    if (typeof file !== 'string' || !file.trim()) {
      errors.push(`${indexRel}: task '${id}' needs a non-empty 'file'`);
      continue;
    }
    if (path.isAbsolute(file) || file.includes('..') || !file.endsWith('.task.json')) {
      errors.push(`${indexRel}: task '${id}' has invalid file '${file}'`);
      continue;
    }
    if (!TASK_FILE_RE.test(file)) {
      errors.push(`${indexRel}: task '${id}' file '${file}' must match TASK-[0-9]{3,}.task.json`);
      continue;
    }
    if (file !== `${id}.task.json`) {
      errors.push(`${indexRel}: task '${id}' file must be '${id}.task.json'`);
      continue;
    }

    const rel = normalizeRel(path.join('.memory-bank/tasks', file));
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      errors.push(`${indexRel}: indexed task '${id}' file missing: ${rel}`);
      continue;
    }

    const task = readJson(rel);
    if (task === undefined) continue;
    records.set(id, { rel, task });
  }

  for (const [id, { rel, task }] of records) {
    if (!task || typeof task !== 'object' || Array.isArray(task)) {
      errors.push(`${rel}: task record must be a JSON object`);
      continue;
    }

    for (const field of REQUIRED_TASK_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(task, field)) {
        errors.push(`${rel}: missing required field '${field}'`);
      }
    }
    checkExactKeys(rel, task, TASK_TOP_LEVEL_KEYS, 'top-level task record');

    if (task.id !== id) {
      errors.push(`${rel}: task id '${task.id}' does not match index id '${id}'`);
    }
    if (typeof task.id !== 'string' || !TASK_ID_RE.test(task.id)) {
      errors.push(`${rel}: task id '${task.id}' must match TASK-[0-9]{3,}`);
    }
    if (!ALLOWED_TASK_STATUS.has(task.status)) {
      errors.push(
        `${rel}: invalid task status '${task.status}' (allowed: planned|ready|in_progress|blocked|done|failed)`
      );
    }
    if (!ALLOWED_TASK_TIER.has(task.tier)) {
      errors.push(`${rel}: invalid tier '${task.tier}' (allowed: T0|T1|T2|T3)`);
    }
    checkLegacyTaskRiskKeys(rel, task);
    checkOptionalTaskRuntimeContext(rel, task);

    for (const field of [
      'reqs',
      'depends_on',
      'touched_files',
      'gates',
      'verify',
      'docs',
      'evidence_required',
      'source_artifacts',
      'normative_inputs',
      'constraints',
      'invariants',
      'verification_targets',
    ]) {
      checkArrayField(rel, task, field);
    }
    checkGateItems(rel, task);

    checkDoneEvidence(rel, task);
    checkTierProtocolRequirements(rel, task);
    checkTaskFeatureClarification(rel, task, featuresById);

    dependencies.set(id, Array.isArray(task.depends_on) ? task.depends_on : []);
  }

  for (const [id, deps] of dependencies) {
    const rel = records.get(id)?.rel ?? indexRel;
    for (const dep of deps) {
      if (typeof dep !== 'string' || !TASK_ID_RE.test(dep)) {
        errors.push(`${rel}: depends_on value '${dep}' must match TASK-[0-9]{3,}`);
        continue;
      }
      if (!records.has(dep)) {
        errors.push(`${rel}: depends_on references unknown task '${dep}'`);
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();

  function visit(id, stack) {
    if (visiting.has(id)) {
      errors.push(`.memory-bank/tasks/index.json: dependency cycle detected: ${[...stack, id].join(' -> ')}`);
      return;
    }
    if (visited.has(id)) return;

    visiting.add(id);
    for (const dep of dependencies.get(id) ?? []) {
      if (records.has(dep)) visit(dep, [...stack, id]);
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const id of records.keys()) visit(id, []);
}

checkRequiredFiles();

const files = listMarkdownFiles(MB);
for (const f of files) {
  const text = readText(f);
  checkFrontmatter(f, text);
  checkLinks(f, text);
  checkFileSize(f, text);
}

checkIndexRouters();
checkAnalysisStructure();
checkTaskRecords();

if (warnings.length) {
  console.log('⚠️  WARNINGS');
  for (const w of warnings) console.log(`- ${w}`);
  console.log('');
}

if (errors.length) {
  console.error('❌ ERRORS');
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log(`✅ mb-lint passed (${files.length} files).`);
