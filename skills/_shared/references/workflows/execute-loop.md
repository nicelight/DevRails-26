---
description: Workflow: PRD → FT → TASK loop (interactive or autonomous).
status: active
---
# Execute loop (PRD → Feature → Tasks)

## Principle: no task explosion
- `/prd-to-features` creates L1–L3 only (product/requirements/epics/features) and does not
  write testing documentation.
- `/write-prd` = PRD-level ambiguity closure. `/feature-doctor` = optional feature-level ambiguity pass.
- Acceptance closure applies when an observable edge/failure outcome or
  non-functional quality can itself block acceptance or realize a significant
  accepted risk: it closes through an accepted REQ/feature AC or a sourced
  authoritative out-of-scope disposition, then exact task mapping, planned
  proof, and verified evidence. Missing product targets/scope decisions remain
  `/write-prd` blockers; agents do not invent them.
- `/spec-init` creates lightweight pre-PRD framing state in `.memory-bank/spec-backbone.md` after `/write-prd` and before `/prd-to-features`, while `.memory-bank/spec-index.md` remains a pure spec registry/index.
- `/spec-design` is mandatory after `/prd-to-features`; it records a minimal backbone for local/simple feature-set pressure or a full architecture scaffold for shared-boundary, contract, state/data/runtime/security, or strict pressure, and records `.memory-bank/foundation.md` when a Foundation Dev Path is needed.
- Global Backbone `Planning Revision` starts at `0`, becomes positive on the
  first successful `/spec-design`, and increments once for a material global
  planning-contract change. Product task-plan `APPROVE` is valid only for the
  current revision.
- `/foundation-to-tasks` creates normal `FT-000` foundation JSON tasks and the final foundation gate when foundation is required; execute/verify that queue before product feature tasking.
- `/feature-to-tasks FT-<NNN>` closes applicable canonical concern coverage and
  creates the implementation plan plus complete JSON task records with direct
  relevant spec links. Discovery, concern-lens order, and slicing tactics are
  agent-selected inside the command contract.
- Simple material-quality methods stay in REQ/AC/task records; a subject spec
  owns only non-trivial reproducible measurement detail. Tasks proving a
  material NFR carry concrete `verification_targets` and `evidence_required`
  at every tier; compact T0/T1 protocol does not waive that evidence.
- Newly created or reconciled `planned|ready` T2/T3 cards use existing
  `evidence_required` and direct links to plan claim-linked RED/GREEN, or one
  concrete accepted not-applicable reason; `/review-tasks-plan` evaluates this
  prospective path without adding a workflow stage.
- Rerun `/feature-to-tasks FT-<NNN>` to reconcile subject-based canonical specs, task cards,
  and plans.
- After the current feature task set is decomposed, run
  `/review-tasks-plan FT-<NNN>` in a fresh-context reviewer / separate fresh
  session. Then run `/mb-doctor` at the feature/task-queue boundary when the
  queue has T3 work, autonomous/autopilot handoff, or complex
  T2/foundation/dependency/stale-doc/risky-link conditions. Simple manual
  T0/T1 queues do not require `/mb-doctor` by default.

## Interactive mode (you stay)
1) `/brainstorm -> /brief` when raw idea discovery is needed, or `/brief` directly for clear concepts
2) `/constitution` for contextual governing principles when `.memory-bank/constitution.md` is missing or `project_principles` is framework-default|skipped|missing; if principles are already ratified/partial, continue to `/write-prd`; if explicitly skipped, continue with framework-default/skipped principles
3) `/write-prd` (creates clarified .memory-bank/prd.md)
4) `/spec-init` (updates .memory-bank/spec-backbone.md framing and .memory-bank/spec-index.md registry)
5) `/prd-to-features` (fills L1–L3)
6) `/review-feat-plan` for high-risk, large, or autonomous-boundary work; optional/recommended for small manual flows
7) `/spec-design` (mandatory; minimal is valid for local/simple feature-set pressure)
8) If foundation is required, run `/foundation-to-tasks`, `/mb-doctor --strict`, then execute/verify `FT-000` tasks until the final foundation gate is `done`
9) Pick one top feature; use `/feature-doctor FT-001` only for explicit feature blockers
10) `/feature-to-tasks FT-001` (resolves feature design concerns through subject-based canonical specs and creates IMPL plan + complete `TASK-NNN-TN-FT-NNN-WN` records for this feature)
11) Run `/review-tasks-plan FT-001`, then run `/mb-doctor` at the
feature/task-queue boundary only when T3, autonomous/autopilot handoff, or
complex T2/foundation/dependency/stale-doc/risky-link conditions apply;
use `/mb-doctor --strict` before autonomous handoff
12) Execute tasks from `.memory-bank/tasks/index.json` and indexed `*.task.json` records one-by-one:
   - run `/exe TASK`, then the verification, semantic, closure, and sync route
     in `tier-policy.md#tier-obligations` and
     `tier-policy.md#closure-authority`; `/exe` owns its detailed
     start/attempt/resume contract
   - start `/exe` only after the current feature task set has been decomposed and any required/conditional feature/task-queue doctor gate has passed
   - `/exe` reads the indexed task card and direct task-linked canonical specs; structural single-card readiness is owned by `/mb-doctor`, while semantic contradictions remain implementer blockers
   - a required higher tier follows
     `tier-policy.md#tier-classification-and-escalation`
13) Rerun `/review-tasks-plan FT-<NNN>` after a wave only when execution changed
the planning surface: task cards, specs, dependencies, tier, scope, or
unresolved plan assumptions. Status/evidence-only closure does not
trigger another task-plan review.
14) If `/spec-design` increases Planning Revision after task generation, keep
all task statuses unchanged and rerun `/feature-to-tasks --all`, then
`/review-tasks-plan --all`, before any product task execution resumes.

## Autonomous end-to-end mode (start and leave)
1) `/autonomous`
2) it completes Product/Design, applicable Foundation planning, product tasking,
and required fresh-context reviews through their installed child contracts
3) `/autonomous` directly owns the bounded FT-000 phase through the existing
`/foundation-to-tasks -> /mb-doctor --strict -> /exe + /verify -> /mb-sync`
workflow until the final gate is `done`; it never invokes `/autopilot` for
Foundation and never mutates product tasks in that phase
4) Foundation resume uses the outer run plan plus authoritative FT-000 task
records/protocols; `/autopilot` scheduler stages begin only at product handoff
5) after Foundation completion, delegate the reviewed strict-ready product queue
to canonical `/autopilot`; `/autonomous` does not copy its product-queue
recovery, selection, task-stage, wave-boundary, or no-ready algorithm
6) `/autopilot` owns product promotion, selection, final lifecycle decisions,
and queue recovery; selected-task `/exe` owns protocol preparation and
`ready -> in_progress`; `tier-policy.md` owns tier gates and closure authority;
`autonomy-policy.md` owns scheduler failure/retry semantics, the durable
checkpoint, budgets, hard stops, and terminal vocabulary; `mb-sync.md` owns
boundary reconciliation only
7) `/autonomous` preserves any scheduler halt unchanged and reports final
end-to-end `SUCCESS` only after the product queue and all outer gates pass

## Autonomous executor only
If JSON task records already exist and `/review-tasks-plan FT-<NNN>` already
approved every task-linked product feature for the current positive Planning
Revision, and the Foundation gate is already
`not_required` or its named gate task is `done`, use:
- `/autopilot`

`/autopilot` must run the strict doctor before task selection and
after the wave-boundary `/mb-sync` before promotion.

## Parallel vs sequential
- Canonical execution is sequential: finish one task's execute/verify/closure
  decision before selecting the next task.
- `touched_files` is advisory and must not be used to prove task independence.
- Experimental parallel execution is available only through explicit
  `--experimental-parallel`, pairwise-disjoint hard
  `runtime_context.write_boundary`, isolated worktrees/sandboxes, and the
  remaining autonomy-policy exclusions. If any proof is missing, fall back to
  sequential execution.
- Each task records its authoritative closure/evidence immediately; full
  `/mb-sync` remains a wave boundary unless TASK-B requires reconciled durable
  state or the owner requests an early sync.

## Operator-decision boundary
- Interactive task planning/execution asks the operator whenever a new material
  product/design/contract/state/data/security/task-boundary/tier/dependency/
  verification branch is not already settled by authoritative evidence.
- Unattended execution does not choose for the operator. It records the exact
  question and stops with the existing clarification/blocking terminal state
  and the owning interactive resume skill.
- A recommendation/default is not an accepted decision. Resume only after the
  answer is durably applied to the existing owning artifact and applicable
  review/readiness gates pass.
