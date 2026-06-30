---
description: Fresh-context review of JSON task queue planning before execution or scheduler mode.
status: active
---
# /review-tasks-plan - Task planning review

<objective>
Проверить runnable planning surface после `/prd-to-tasks` и до `/execute`,
`/autopilot`, or scheduler execution.

Default scope is one product feature:
- `/review-tasks-plan FT-<NNN>` reviews only that feature's task planning surface
- `/review-tasks-plan` infers the latest decomposed product feature
- `/review-tasks-plan --all` expands to sequential per-feature reviews for all
  indexed product features, excluding `FT-000`

Feature-scoped review is the normal manual gate after `/prd-to-tasks FT-<NNN>`.
`--all` or an explicit review for every task-linked product feature
is required before `/autopilot` / autonomous scheduler execution.

Reviewed surface:
- structural integrity of the target feature's indexed task records
- feature acceptance/REQ coverage and task slicing
- final feature/design readiness and direct canonical spec links
- execution readiness: tiers, dependencies, single-card handoff, and Foundation Gate

This command does not validate PRD -> feature decomposition as the primary
surface. Use `/review-feat-plan` before `/spec-design` for that.
</objective>

<process>

## 0) Artifacts
Create:
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/`
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/REQUEST.md`

Reviewer reports go to:
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-<STAGE_ID>-final-report-docs-01.md`

Use a feature-specific stage id when reviewing one feature, for example
`S-TASKS-FT-001`.

## 1) Target selection
Inputs:
- `FT-<NNN>`: review this product feature
- no argument: infer the latest decomposed product feature
- `--all`: review every indexed product feature one by one, excluding `FT-000`

`FT-000` is reserved for Foundation Dev Path and is not a product feature target
for this command. Review its dependency effect only when it constrains product
tasks.

Latest decomposed feature heuristic, in order:
1. most recently modified `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`
2. if absent or tied, most recently modified indexed product task record
3. if still tied, highest numeric `TASK-<NNN>` among indexed product task records

Ignore `FT-000` in this heuristic. If no product feature can be inferred, stop
and ask for `FT-<NNN>` or `--all`.

For `--all`, resolve product feature ids from indexed task records and
`IMPL-FT-*.md`, exclude `FT-000`, then run the same review independently for
each feature. Do not collapse all features into one broad reviewer prompt.

## 2) Inputs
Read for every run:
- `.memory-bank/constitution.md`
- `.memory-bank/requirements.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/schemas/task.schema.json`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/tasks/index.json`
- `.memory-bank/foundation.md` when present
- `mb-doctor` output when available

For a feature-scoped review, read only the feature-relevant planning surface:
- target `.memory-bank/features/FT-<NNN>-*.md`
- `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`
- indexed `.memory-bank/tasks/*.task.json` records where `feature` is target
  `FT-<NNN>`
- indexed dependency records referenced by target tasks through `depends_on`
- other feature/spec docs only when linked by the reviewed tasks or needed to
  evaluate a dependency/blocker

For `--all`, repeat the feature-scoped input set for each product feature.

## 3) Review checks

Evaluate the planning surface through four groups. Do not create or repair
specs, plans, tasks, or lifecycle state from this command.

### 3.1 Structural integrity

- Parse `task.schema.json` and validate every target task record against it.
- Confirm every reviewed task is referenced exactly once by `tasks/index.json`
  and every index reference resolves to the matching file and task ID.
- Confirm task ID tier/feature/wave segments match record `tier`, `feature`, and
  `wave`; product tasks never use `W0`.
- Confirm every task belongs to the target feature. Every T1/T2/T3 task has
  concrete governing `REQ-*` entries present in `requirements.md`; placeholders
  are invalid.

### 3.2 Coverage and slicing

- Map every feature acceptance criterion and governing requirement to at least
  one task, and every task back to feature scope and requirements.
- Reject missing coverage, orphan tasks, duplicated outcomes, or task slicing
  that hides more than one independently verifiable outcome in one record.
- Confirm the implementation plan, task queue, touched files, gates, and
  verification targets describe one coherent implementation strategy.
- Confirm waves and dependencies are necessary, acyclic, and executable;
  referenced cross-feature dependencies exist and are compatible.

### 3.3 Design readiness

- Feature clarification is not explicitly `pending|blocked` and final
  `spec_design_status` is `complete`, or `not_required` with a truthful rationale
  for simple work and empty `spec_design_links`.
- No feature-relevant Backbone Area Matrix row remains `needed_before_tasks` or
  `blocked`; `spec-index.md` remains a registry and every linked canonical path
  resolves.
- T2/T3 tasks link the direct task-relevant subset of canonical SDD specs and
  can be implemented
  without guessing architecture, API, state, schema, message, storage, domain,
  agent I/O, security, or verification behavior.
- Reject a newly generated default `FT-*` design-spec hub or T2/T3 coverage that
  relies only on a multi-concern legacy `.memory-bank/tech-specs/FT-*.md` instead
  of direct subject-based canonical specs.
- Confirm each linked SDD spec is semantically applicable to the task and its
  concrete block is sufficient for the boundary or behavior in scope.
- Confirm each task `success_outcome` is independently verifiable and does not
  conflict semantically with the feature, implementation plan, or linked specs.
- Every changed/dependent concrete concern has exactly one canonical spec
  defining `shape`, `rules`, `edge cases/errors`, and `verification target`.
  Shared-boundary tasks link relevant Architecture Spine `AD-*`, boundary-map,
  contract, or ADR decisions when those decisions constrain the work.
- When mutable persistence is in scope, a task names the real runtime storage
  path and requires a read/write smoke or repository integration check.
- Constitution, feature, implementation plan, tasks, backbone, and linked specs
  do not contradict each other.

Behavior specs remain optional context examples. Their absence or non-gate
semantics must not cause `REJECT`.

### 3.4 Execution readiness

- Tier assignment follows `tier-policy.md`; `ready` tasks have no unmet
  dependencies, blockers, blocking review rejects, or unresolved semantic gaps.
- When foundation is required, the named indexed `FT-000` gate task is `done`
  and every reviewed product task depends on it directly or transitively.
- Every T2/T3 task satisfies the single-card handoff completeness contract:
  schema/index/ID/REQ linkage is valid; `purpose` and scalar `success_outcome`
  are non-empty; an existing task-linked canonical SDD spec path is present;
  scope is grounded by `touched_files` and/or
  `runtime_context.allowed_write_scope`; a real gate command and/or non-empty
  `verification_target` exists; dependencies exist and remain acyclic.
- Treat this structural surface as necessary but not sufficient: semantic spec
  applicability, concrete-block sufficiency, outcome quality, and task/spec
  conflicts remain review judgments, not deterministic doctor claims.
- Do not ignore available `mb-doctor` findings that contradict the review.
  Do not run or duplicate doctor here; autonomous readiness still requires the
  separate downstream `/mb-doctor --strict` gate.

## 4) Decision rule
- `APPROVE`: all four groups pass and the target feature's task planning surface
  is safe to hand to manual `/execute`, subject to normal `/mb-doctor` passing
  when required.
- `APPROVE` for `/autopilot` / autonomous scheduler requires either:
  - `--all` completed with every product feature approved, or
  - a latest `APPROVE` report for every task-linked product feature.
  This planning verdict is necessary but not sufficient; downstream
  `/mb-doctor --strict` must also pass.
- `REJECT`: any group has a blocking gap. Report the failed group, concrete
  evidence, and repair owner; then rerun `/review-tasks-plan FT-<NNN>` after the
  repair.
- Non-blocking notes may be reported with `APPROVE`; `REJECT` always means the
  gate is blocking.

Contract-readiness routing for `REJECT`:
- route back to `/prd-to-tasks FT-<NNN>` for feature-level canonical spec repair,
  focused design questions, and task-card reconciliation;
- route to `/spec-design` when competing/unclear canonical paths or a missing
  decision are shared/global.

## 5) Reviewer handoff
Use the active harness's configured fresh-context reviewer or a separate fresh
session. Do not pin a provider, CLI, or model in this command. Pass this payload:

```text
TASK_ID=TASK-MB-REVIEW-TASKS-PLAN. STAGE_ID=S-TASKS-FT-001.
TARGET_FEATURE=FT-001. Review .memory-bank/constitution.md,
.memory-bank/requirements.md, .memory-bank/spec-backbone.md,
.memory-bank/spec-index.md, .memory-bank/schemas/task.schema.json,
.memory-bank/workflows/tier-policy.md, .memory-bank/features/FT-001-*.md,
.memory-bank/tasks/index.json, indexed task records whose feature is FT-001,
dependency task records referenced by those tasks,
.memory-bank/tasks/plans/IMPL-FT-001.md,
.memory-bank/foundation.md when present, and mb-doctor findings relevant to
FT-001. Review four groups: structural integrity; acceptance/REQ coverage and
task slicing; final feature/design readiness; and execution readiness. Include
schema/index/ID consistency, implementation-plan alignment, final design status,
feature-relevant needed_before_tasks rows, canonical contract routing,
persistence verification when applicable, tier/dependency/foundation rules, and
T2/T3 single-card handoff completeness. Semantically assess linked-spec
applicability, concrete-block sufficiency, independent outcome verifiability,
and task/feature/spec conflicts. Write report to
.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-001-final-report-docs-01.md.
VERDICT: APPROVE/REJECT. APPROVE only when all four groups pass. For REJECT,
name the failed group, evidence, and repair owner.
```

For `--all`, run one fresh-context reviewer per feature. A synthesized summary
may list reviewed features and verdicts, but each feature verdict remains
independent.

## 6) Handoff
When approved:
- for manual `/execute TASK-<NNN>-T<N>-FT-<NNN>-W<N>`, run normal `/mb-doctor`
  when the feature/task-queue boundary requires it
- for `/autopilot` or autonomous scheduler execution, ensure every
  task-linked product feature has a latest `APPROVE`, then run
  `/mb-doctor --strict`
- then start the selected execution mode
</process>
