---
description: Deterministic Memory Bank readiness gate over mb-lint for autonomous/autopilot execution.
status: active
---
# /mb-doctor — Memory Bank readiness doctor

## Objective
Answer one question:

```text
Can autonomous/autopilot execution continue safely from the current Memory Bank state?
```

`mb-doctor` is a readiness gate over `mb-lint`. It does not replace `/review-feat-plan`, `/review-tasks-plan`, `/verify`, or `/red-verify`.

## Command
Use the repository-provided script:

```bash
node scripts/mb-doctor.mjs
node scripts/mb-doctor.mjs --strict
node scripts/mb-doctor.mjs --json
node scripts/mb-doctor.mjs --strict --json
```

If the repository exposes another documented wrapper for the same script, use that wrapper.

Any argument other than `--strict`, `--json`, `--help`, or `-h` produces the
`CLI_INVALID_ARGUMENT` error before readiness checks run. When `--help` or `-h`
is present, the script prints help and exits without running readiness checks.

## Modes
- Default mode: health report for humans and interactive work. A fresh skeleton with an empty `.memory-bank/tasks/index.json` is valid and reports `TASK_INDEX_EMPTY` as `info`.
- Strict mode: post-queue executable-readiness gate for every `FT-000`
  foundation queue and for autonomous/autopilot product queues. Empty
  `.memory-bank/tasks/index.json` is an error because there is no executable task queue.
- JSON mode: machine-readable report for schedulers and agents.

Default mode may emit warnings for incomplete scheduler readiness evidence that should be fixed before unattended execution. These warnings do not invalidate KISS manual closure. Strict mode promotes those readiness gaps to errors where autonomous/autopilot progression would be unsafe.
Every non-empty indexed queue requires the current `.memory-bank/foundation.md`
decision; a missing or incomplete decision is a warning in default mode and an
error in `--strict`. Empty-index behavior is unchanged.

After `/spec-init` PASS, `.memory-bank/spec-backbone.md` may correctly have `Pre-PRD Spec Status: ready_for_prd` while Global Backbone Status is still absent, `blocked`, or otherwise incomplete. In default mode, report this as "prepared for `/prd-to-features`; Global Backbone Status intentionally pending until `/spec-design`" rather than a fix-now problem. The machine-readable finding code may remain `SPEC_BACKBONE_NOT_READY`; the meaning is downstream task/autonomous readiness, not failure of `/spec-init`.

Use `--strict` after `/foundation-to-tasks` before the `/autonomous`-owned
`FT-000` phase, before the product-only `/autopilot`, before each applicable
task-selection pass, and after each `/mb-sync` before promoting dependents or
declaring success. When the last task of a T2 product feature closes, the
scheduler must run feature-level `/red-verify --feature FT-<ID>` and record
semantic-pass before that wave-boundary sync/strict-doctor gate.

In manual greenfield, `/mb-doctor` is conditional readiness checking, not a
default gate for simple `T0` / `T1` execution. Skip it by default for local
manual `T0` / `T1` work. Run it for `T3`, autonomous/autopilot or handoff
freshness, and complex `T2`/foundation/dependency/stale-doc/risky-link
cases.

Status transitions have two modes. In scheduler mode, `/autonomous` owns only
FT-000 Foundation closure/failure/blocking decisions and `/autopilot` owns only
product-task decisions after the Foundation gate closes. T2 task closure
requires full protocol, applicable spec gates, and `VERDICT: PASS`; per-task
`/red-verify` is not required. T2 feature completion separately requires
feature-level `/red-verify --feature FT-<ID>` with
`SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc. T3 task closure
requires `VERDICT: PASS`, per-task `SEMANTIC_VERDICT: semantic-pass`, and exact
`HUMAN_CHECKPOINT: done`. In manual mode, T0/T1 may close in `/exe` with compact
evidence when explicit top-level owner fast-lane conditions are met, or through
`/verify PASS` when independent verification is requested; T2 may close when
full protocol plus applicable task/spec gates are satisfied, only with explicit
closure ownership; T3 requires per-task `/red-verify`
`SEMANTIC_VERDICT: semantic-pass` before final closure. Full `/mb-sync` runs at
the wave boundary.

## Required checks
`mb-doctor` must check only readiness-critical conditions:

- `mb-lint` passes first. A lint error is a doctor error.
- In `--strict`, `.memory-bank/constitution.md`, `.memory-bank/index.md`,
  `.memory-bank/spec-index.md`, and `.memory-bank/spec-backbone.md` exist, and
  both index files mention `constitution.md`. Any missing file or missing
  router mention is a `CONSTITUTION_STRUCTURE_INVALID` error.
- Feature docs under `.memory-bank/features/FT-*.md` may have optional clarification metadata: `clarification_status`, `last_clarified`, and `clarification_questions`. Absent optional clarification fields are allowed; missing feature frontmatter or invalid present metadata is not.
- Explicit `clarification_status: pending|blocked` is not allowed for autonomous/autopilot readiness or task-linked features.
- Indexed task records do not exist for features that are pending, missing, or otherwise not clarified.
- `.memory-bank/tasks/index.json` is valid JSON and has a valid task list.
- Every indexed `.memory-bank/tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>.task.json` exists and is valid JSON.
- Every indexed task record has `tier: T0|T1|T2|T3`.
- Authoritative routing uses only `task.tier`; legacy `risk` / `risk.level` is invalid.
- `FT-000` is the only allowed pseudo-feature for project foundation. It is not
  a product feature and does not participate in product feature-completion
  semantics.
- `W0` is valid only for tasks with `feature: "FT-000"`. Non-`FT-000` product
  tasks must not use `W0`.
- Every non-empty indexed queue has `.memory-bank/foundation.md` with a
  parseable current `## Gate Anchors` contract:
  - `Foundation Required: true|false`
  - `Foundation Requirement: REQ-000`
  - `Foundation Pseudo-Feature: FT-000`
  - `Foundation Gate Task: pending_foundation_to_tasks|TASK-<NNN>-T<N>-FT-000-W<N>|not_required`
- `Foundation Required: true` is not executable-ready while the gate anchor is
  `pending_foundation_to_tasks`; a concrete gate exists, is indexed, has
  `feature: "FT-000"`, and is not `failed`.
- A foundation-only queue may pass with an open concrete final gate when the
  normal queue/status checks permit continued FT-000 execution.
- Once product records exist, the concrete final gate is `done`, no other
  `FT-000` record remains `planned|ready|in_progress|blocked`, and every product
  task depends on the gate directly or transitively.
- `Foundation Required: false` uses `Foundation Gate Task: not_required` and has
  no indexed `FT-000` records.
- Task dependencies reference known task IDs and do not create cycles or execution deadlock.
- Task status, dependency, and tier policy allow safe scheduler decisions.
- `in_progress` `T0` / `T1` tasks have a `.protocols/<TASK_ID>/` directory.
- `T2` / `T3` `planned` / `ready` tasks do not require protocol files yet.
- `T2` / `T3` `in_progress` tasks have full protocol files: `context.md`, `plan.md`, `progress.md`, `verification.md`, and `handoff.md`.
- `T0` / `T1` `done` tasks have compact `.protocols/<TASK_ID>/run.md` evidence appropriate for their tier.
- In `--strict`, `T2` `done` tasks have full protocol files and `PASS` verification evidence/verdict in `task.verify` or protocol/artifacts; per-task red-verify evidence is not required.
- When every indexed task for a non-`FT-000` feature with at least one `T2`
  task is `done`, the matching feature doc records an exact standalone
  `SEMANTIC_VERDICT: semantic-pass` line from `/red-verify --feature FT-<ID>`.
  Until it does, `FEATURE_RED_VERIFY_VERDICT_MISSING` is a warning in default
  mode and an error in `--strict`.
- In `--strict`, `T3` `done` tasks have full protocol files, `PASS` verification evidence/verdict in `task.verify` or protocol/artifacts, closure-eligible per-task red-verify evidence with `SEMANTIC_VERDICT: semantic-pass`, and the exact standalone marker line `HUMAN_CHECKPOINT: done`.
- `T2` / `T3` `failed` tasks have full protocol files and `FAIL` / `error` evidence/verdict in `task.verify` or protocol/artifacts.
- In `--strict`, `.memory-bank/spec-backbone.md` records mandatory `/spec-design` status `complete`, or `minimal` with explicit `not_applicable` areas. `blocked`, `unknown`, or missing backbone status is not autonomous-ready.
- For `complete`, every `## Backbone Area Matrix` row in `.memory-bank/spec-backbone.md` has status `authoritative` or `not_applicable`; missing, `blocked`, `needed_before_tasks`, `unknown`, `planned`, `candidate`, or any other status is not product autonomous-ready.
- In `--strict`, a foundation-only task queue whose indexed records are all `feature: "FT-000"` may pass with product contract rows still `needed_before_tasks`. This exception exists only for the foundation/task-queue gate before product `/feature-to-tasks`; product task queues must resolve those rows first.
- For `minimal`, at least one real child item under `## Global Backbone Status` → `- Not applicable areas:` has `not_applicable` plus rationale. Other `not_applicable` text elsewhere does not satisfy readiness.
- If `.memory-bank/spec-backbone.md` is missing but an old `.memory-bank/spec-index.md` contains `## Global backbone status`, report a migration hint instead of treating the old index shape as ready.
- If `.memory-bank/spec-backbone.md` exists, `.memory-bank/spec-index.md` remains a pure registry and does not contain old non-index sections: `Feature Design Status Map`, `Global backbone status` / `Global Backbone Status`, or `Backbone Area Matrix`.
- Other `done` / `failed` tasks have the minimum evidence/protocol basis required by their tier and mode.
- `failed` tasks have either a bug doc in `.memory-bank/bugs/` mentioning the task id or an indexed follow-up task depending on/referencing the failed task.
- Direct dependents of failed tasks are marked `blocked`.
- `T1` / `T2` / `T3` tasks have concrete `REQ-*` and `FT-*` linkage. Placeholder values such as `REQ-XXX` and `FT-XXX` do not count.
- `T2` / `T3` tasks have direct task-relevant canonical SDD spec links in
  `source_artifacts`, `normative_inputs`, `constraints`, `invariants`, or
  `verification_targets`; feature links or `spec-index.md` alone do not count.
- `guides/*` may count as linked SDD specs when the guide is the normative source for frontend component behavior or operating procedure; guides alone do not replace required T2/T3 architecture/contract/domain/state/testing specs when those concerns are in scope.
- Default mode reports missing T2/T3 SDD spec links as warnings; `--strict` reports readiness errors.
- T2/T3 single-card handoff completeness is checked mechanically: non-empty
  `purpose` and scalar `success_outcome`, at least one existing direct task-linked canonical SDD
  spec path, non-empty `touched_files` and/or `runtime_context.write_boundary`,
  and at least one verification path through a real gate command and/or
  non-empty `verification_target`.
- Schema/index/ID/REQ/dependency existence and cycle checks remain covered by
  `mb-lint` and the normal doctor checks. `TASK_HANDOFF_INCOMPLETE` reports only
  missing structural/presence evidence.
- `/mb-doctor` does not judge whether a linked spec is semantically applicable,
  whether its concrete block is sufficient, or whether `success_outcome` is a
  good independent outcome. Fresh-context `/review-tasks-plan` owns those
  judgments.
- `/mb-doctor` checks scope-field presence only; `touched_files` remains advisory.
- In `--strict`, T2/T3 tasks with no architecture/contract/ADR reference in
  richer task fields may report `TASK_ARCH_SPINE_LINK_ABSENT` as a warning. It
  is advisory: add relevant Architecture Spine, boundary-map, contract, or ADR
  links when the task touches shared boundaries; no action is required for
  feature-level tasks where no such link is relevant.
- When `.memory-bank/requirements.md` exists, referenced `REQ-*` IDs appear in it.
- When `.memory-bank/features/` contains markdown files, referenced `FT-*` IDs have a matching `.memory-bank/features/FT-<NNN>*.md` file.
- Obsolete `.memory-bank/tasks/backlog.md` is absent. If present, report `TASK_BACKLOG_MD_PRESENT` as an error.

## Findings
Errors block autonomous/autopilot progression:

- `CLI_INVALID_ARGUMENT` for any unsupported CLI argument
- `MB_LINT_SCRIPT_MISSING` in `--strict`
- `MB_LINT_FAILED`
- `CONSTITUTION_STRUCTURE_INVALID` in `--strict` when the Constitution,
  Memory Bank index, spec index, or spec backbone is missing, or either index
  does not mention `constitution.md`
- `FEATURE_CLARIFICATION_METADATA_MISSING` in `--strict` when feature frontmatter is missing or present clarification metadata is invalid
- `FEATURE_CLARIFICATION_PENDING` in `--strict`
- `TASKS_FROM_UNCLARIFIED_FEATURE` in `--strict`
- `TASK_INDEX_INVALID`
- `TASK_INDEX_EMPTY` in `--strict`
- `TASK_RECORD_MISSING`
- `TASK_RECORD_INVALID`
- `TASK_W0_NON_FOUNDATION`
- `FOUNDATION_ANCHORS_INVALID`
- `FOUNDATION_GATE_TASK_INVALID`
- `FOUNDATION_GATE_DEP_MISSING`
- `TASK_READY_DEP_NOT_DONE`
- `TASK_QUEUE_DEADLOCK` in `--strict`
- `TASK_IN_PROGRESS_WITHOUT_PROTOCOL` in `--strict`
- `TASK_FULL_PROTOCOL_MISSING` in `--strict`
- `TASK_COMPACT_ONLY_PROTOCOL` in `--strict`
- `TASK_COMPACT_RUN_MISSING` for `T1` in default mode and for `T0` / `T1` in `--strict`
- `TASK_COMPACT_RUN_UNREADABLE`
- `TASK_COMPACT_VERDICT_MISSING` in `--strict`
- `TASK_COMPACT_EVIDENCE_MISSING` in `--strict`
- `TASK_DONE_EVIDENCE_MISSING` in `--strict`
- `TASK_FAILED_EVIDENCE_MISSING` in `--strict`
- `TASK_RED_VERIFY_EVIDENCE_MISSING` in `--strict`
- `TASK_RED_VERIFY_VERDICT_MISSING` in `--strict`
- `FEATURE_RED_VERIFY_VERDICT_MISSING` in `--strict`
- `TASK_T3_CHECKPOINT_MISSING` in `--strict`
- `FAILED_BUG_OR_FOLLOWUP_MISSING` in `--strict`
- `TASK_FAILED_DEPENDENTS_NOT_BLOCKED`
- `TASK_FEATURE_LINK_MISSING` in `--strict`
- `TASK_REQUIREMENT_LINK_MISSING` in `--strict`
- `TASK_REQUIREMENT_NOT_FOUND` in `--strict`
- `TASK_FEATURE_FILE_MISSING` in `--strict`
- `TASK_SDD_SPEC_LINK_MISSING` in `--strict`
- `TASK_SDD_SPEC_GUIDE_ONLY` in `--strict`
- `TASK_HANDOFF_INCOMPLETE` in `--strict`
- `TASK_BACKLOG_MD_PRESENT`
- `SPEC_BACKBONE_NOT_READY` in `--strict`
- `SPEC_BACKBONE_MATRIX_NOT_READY` in `--strict`
- `SPEC_INDEX_NOT_PURE` in `--strict`

Structural lint details such as invalid legacy `risk`, dependency cycles, and schema-level task field violations are surfaced through `MB_LINT_FAILED` with captured `mb-lint` output.

Warnings identify non-blocking quality risks in default mode:

- `MB_LINT_SCRIPT_MISSING`
- `FEATURE_CLARIFICATION_METADATA_MISSING` when feature frontmatter is missing or present clarification metadata is invalid
- `FEATURE_CLARIFICATION_PENDING`
- `TASKS_FROM_UNCLARIFIED_FEATURE`
- `TASK_W0_NON_FOUNDATION`
- `FOUNDATION_ANCHORS_INVALID`
- `FOUNDATION_GATE_TASK_INVALID`
- `FOUNDATION_GATE_DEP_MISSING`
- `TASK_IN_PROGRESS_WITHOUT_PROTOCOL`
- `TASK_FULL_PROTOCOL_MISSING`
- `TASK_COMPACT_ONLY_PROTOCOL`
- `TASK_COMPACT_RUN_MISSING` for `T0`
- `TASK_COMPACT_EVIDENCE_MISSING`
- `TASK_DONE_EVIDENCE_MISSING`
- `TASK_FAILED_EVIDENCE_MISSING`
- `TASK_RED_VERIFY_EVIDENCE_MISSING`
- `TASK_RED_VERIFY_VERDICT_MISSING`
- `FEATURE_RED_VERIFY_VERDICT_MISSING`
- `TASK_T3_CHECKPOINT_MISSING`
- `FAILED_BUG_OR_FOLLOWUP_MISSING`
- `TASK_FEATURE_LINK_MISSING`
- `TASK_REQUIREMENT_LINK_MISSING`
- `TASK_REQUIREMENT_NOT_FOUND`
- `TASK_FEATURE_FILE_MISSING`
- `TASK_SDD_SPEC_LINK_MISSING`
- `TASK_SDD_SPEC_GUIDE_ONLY`
- `TASK_ARCH_SPINE_LINK_ABSENT`
- `TASK_HANDOFF_INCOMPLETE`
- `SPEC_BACKBONE_NOT_READY`
- `SPEC_BACKBONE_MATRIX_NOT_READY`
- `SPEC_INDEX_NOT_PURE`
- `TASK_PLANNED_READY_CANDIDATE`
- `TASK_BLOCKED_BY_UPSTREAM`
- `TASK_QUEUE_NO_EXECUTABLE_READY`

Info findings may include `MB_LINT_PASSED`, fresh-skeleton state such as `TASK_INDEX_EMPTY` in default mode, and `TASK_QUEUE_SUMMARY`.

## JSON Output
JSON mode preserves this stable top-level shape:

```json
{
  "status": "pass",
  "summary": {
    "errors": 0,
    "warnings": 0,
    "infos": 0
  },
  "findings": []
}
```

Implementations may include extra metadata such as `version`, `tool`, `strict`, or legacy count fields, but schedulers should rely on `status`, `summary`, and `findings`.

## Out of scope
- No LLM semantic review.
- No markdown task-card parsing.
- No migration from old task models.
- No fallback to `.memory-bank/tasks/backlog.md`.
- No replacement for `/review-feat-plan`, `/review-tasks-plan`, `/verify`, or `/red-verify`.
