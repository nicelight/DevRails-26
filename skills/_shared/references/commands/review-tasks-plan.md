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
- target feature's indexed JSON task records and task index entries
- target feature waves, dependencies, readiness, gates, verification surface
- target feature implementation plan and linked SDD specs
- packet/runtime-context readiness for target T2/T3 tasks and explicit T0/T1
  packet-required tasks
- Foundation Dev Path dependency invariants for reviewed product tasks

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
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/tasks/index.json`
- `mb-doctor` output when available

For a feature-scoped review, read only the feature-relevant planning surface:
- target `.memory-bank/features/FT-<NNN>-*.md`
- `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`
- indexed `.memory-bank/tasks/*.task.json` records where `feature` is target
  `FT-<NNN>`
- indexed dependency records referenced by target tasks through `depends_on`
- packet files required by reviewed tasks
- other feature/spec docs only when linked by the reviewed tasks or needed to
  evaluate a dependency/blocker

For `--all`, repeat the feature-scoped input set for each product feature.

## 3) Review checks
Must check:
- `.memory-bank/tasks/index.json` contains references to the reviewed task
  records, and every reviewed record exists.
- Every reviewed task has valid `status`, `wave`, `feature`, `depends_on`,
  `touched_files`, `tier`, `gates`, `verify`, and richer context fields.
- Every reviewed task's `feature` matches the target feature.
- `ready` tasks have no unmet dependencies, blockers, blocking review rejects,
  or unresolved semantic concerns.
- Target feature task waves and dependencies are coherent and do not create
  deadlocks.
- Cross-feature dependencies referenced by target tasks exist and are compatible
  with the reviewed tasks' readiness.
- `tier` usage matches `.memory-bank/workflows/tier-policy.md`.
- T2/T3 tasks have relevant linked SDD specs through `source_artifacts`,
  `normative_inputs`, `constraints`, `invariants`, `verification_targets`, or
  feature `spec_design_links`.
- Every T2/T3 task can be implemented without guessing API, state, schema,
  message, storage, domain, agent I/O, or security contracts.
- If a T2/T3 task depends on a concrete boundary, a linked authoritative spec
  contains the minimum concrete block: `shape`, `rules`, `edge cases/errors`,
  and `verification target`.
- T2/T3 tasks do not depend on duplicated or conflicting concrete contract
  sources. If two docs both look authoritative for the same concrete contract,
  the verdict must not be `APPROVE`.
- Shared-boundary T2/T3 tasks have relevant Architecture Spine `AD-*`,
  boundary-map, contract, or ADR links when those decisions constrain
  implementation or verification. Feature-local T2/T3 tasks may rely on their
  narrower linked SDD specs.
- T2/T3 tasks and explicit packet-required T0/T1 tasks have usable canonical
  `.memory-bank/packets/<task.id>.packet.json`.
- Product tasks do not use `W0`; `W0` is reserved for `FT-000`.
- If foundation is required, every reviewed non-`FT-000` product task depends
  directly or transitively on the final foundation gate task, and that gate is
  `done` before product execution.
- `/mb-doctor --strict` findings from the reviewed surface are addressed before
  `APPROVE` for autonomous/autopilot execution.
- Constitution contradictions are blocking.

## 4) Decision rule
- `APPROVE`: the target feature's task planning surface is safe to hand to
  manual `/execute` subject to normal `/mb-doctor` passing when required.
- `APPROVE` for `/autopilot` / autonomous scheduler requires either:
  - `--all` completed with every product feature approved, or
  - a latest `APPROVE` report for every task-linked product feature.
- `REJECT`: task records, waves, dependencies, packets, tier routing,
  contract readiness, foundation dependencies, or verification surface have
  blocking gaps. Fix and rerun `/review-tasks-plan FT-<NNN>` for the rejected
  feature.
- Non-blocking notes may be reported with `APPROVE`; `REJECT` always means the
  gate is blocking.

Contract-readiness routing for `REJECT`:
- route back to `/prd-to-tasks FT-<NNN>` for feature-local spec repair,
  focused design questions, task-card reconciliation, and packet refresh;
- route to `/spec-design` when the duplicated/unclear owner or missing decision
  is shared/global.

## 5) Reviewer handoff
Use the active harness's configured fresh-context reviewer or a separate fresh
session. Do not pin a provider, CLI, or model in this command. Pass this payload:

```text
TASK_ID=TASK-MB-REVIEW-TASKS-PLAN. STAGE_ID=S-TASKS-FT-001.
TARGET_FEATURE=FT-001. Review .memory-bank/constitution.md,
.memory-bank/spec-backbone.md, .memory-bank/spec-index.md,
.memory-bank/workflows/tier-policy.md, .memory-bank/features/FT-001-*.md,
.memory-bank/tasks/index.json, indexed task records whose feature is FT-001,
dependency task records referenced by those tasks,
.memory-bank/tasks/plans/IMPL-FT-001.md, required packets for reviewed tasks,
and mb-doctor readiness findings relevant to FT-001. Check target feature
waves, dependencies, readiness, gates, verification surface, T2/T3 SDD links,
concrete contract readiness for API/state/schema/message/storage/domain/agent
I/O/security boundaries, duplicated/conflicting contract owners, Architecture
Spine/boundary link routing for shared-boundary work, packet readiness, and
Foundation Dev Path dependency invariants for reviewed tasks. Write report to
.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-001-final-report-docs-01.md.
VERDICT: APPROVE/REJECT; REJECT if any T2/T3 task requires guessing contract
details or if concrete contract ownership is duplicated/conflicting.
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
