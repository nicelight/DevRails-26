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
- `/spec-design` is the mandatory initial post-`/prd-to-features` backbone and
  Foundation decision gate. Changes to an already accepted positive-revision
  backbone belong to `/spec-redesign`.
- Global Backbone `Planning Revision` starts at `0`, becomes `1` on the first
  successful `/spec-design`, and changes later only under
  `#planning-redesign-boundary`. Product task-plan `APPROVE` is valid only for
  the current revision.
- `/foundation-to-tasks` creates normal `FT-000` foundation JSON tasks and the final foundation gate when foundation is required; execute/verify that queue before product feature tasking.
- `/feature-to-tasks FT-<NNN>` closes applicable canonical concern coverage and
  creates the implementation plan plus complete JSON task records with direct
  relevant spec links. Discovery, concern-lens order, and slicing tactics are
  agent-selected inside the command contract.
- Simple material-quality methods stay in REQ/AC/task records; a subject spec
  owns only non-trivial reproducible measurement detail. Tasks proving a
  material NFR carry concrete `verification_targets` and `evidence_required`
  at every tier; compact T0/T1 protocol does not waive that evidence.
- Newly created or reconciled `planned|ready` T2/T3 cards map only task-owned
  outcomes and integration delta. Dependency proof is not inherited;
  `evidence_required` stays minimal while required probe method remains in the
  task package. `/review-tasks-plan` rejects missing and excess proof without a
  new workflow stage.
- Rerun `/feature-to-tasks FT-<NNN>` to reconcile subject-based canonical specs, task cards,
  and plans.
- After the current feature task set is decomposed, run
  `/review-tasks-plan FT-<NNN>` in a fresh-context reviewer / separate fresh
  session. Then run `/mb-doctor` at the feature/task-queue boundary when the
  queue has T3 work, autonomous/autopilot handoff, or complex
  T2/foundation/dependency/stale-doc/risky-link conditions. Simple manual
  T0/T1 queues do not require `/mb-doctor` by default.

## Planning Redesign Boundary

- `/spec-redesign` changes an already accepted positive-revision backbone or
  shared contract and returns one impact verdict: `none|bounded|global`.
- Planning Revision increments exactly once only when both are proved: durable
  planning semantics changed, and the change affects product-wide planning.
  Durable semantics are architecture units or ownership, accepted boundaries,
  feature acceptance, task slicing, dependencies, tiers, compatibility or
  rollout, verification obligations, or the Foundation path. Shared location,
  broad wording, schema/API/config text, or implementation detail alone is not
  proof of global impact.
- `none` preserves revision and reviews. `bounded` preserves revision and names
  only affected product features. `global` increments revision and affects all
  task-linked product features. Uncertain impact blocks for evidence; it does
  not default to `global`.
- For `bounded`, `/spec-redesign` writes the exact body marker
  `PLANNING_RECONCILIATION_REQUIRED` only in affected task-linked feature docs
  whose planning needs repair. It changes neither Global Backbone Status nor
  Planning Revision.
- Reconcile affected product features sequentially through
  `#fresh-feature-tasking-boundary`. Foundation planning is revisited only when
  its decision or executable baseline contract changed. Preserve task statuses,
  completed evidence, and unaffected approvals.
- Promotion, selection, and execution exclude only features with that marker or
  without a current-revision task-plan `APPROVE`; independent eligible features
  continue. Add no revision history, registry, lifecycle, schema, or parallel
  freshness system.

## Fresh Feature Tasking Boundary

- When feature design is due, run `/spec-auto FT-<NNN>` first in its own
  isolated one-feature Architect context; its successful handoff names the
  feature's tasking context.
- One fresh context owns exactly one `/feature-to-tasks FT-<NNN>` and ends at its
  durable handoff. Multi-feature owners process features sequentially, including
  during experimental-parallel execution.
- Before launch, the owner resumes its recorded current feature or selects one
  remaining, then records that feature and the exact next action in its existing
  orchestration plan.
- Unattended tasking uses an isolated `ROLE: ARCHITECT` child with only the target
  command and durable project state, not parent or previous-feature conversation.
  Success sets a separate fresh `ROLE: Reviewer` `/review-tasks-plan FT-<NNN>`
  child as the next action.
- `REJECT` invokes its named repair owner; only `/feature-to-tasks` repair uses a
  new isolated Architect child. Current-revision `APPROVE` clears the current
  feature; other halts preserve their owner and route.
- An unattended caller without isolated child contexts returns
  `HALT_POLICY_VIOLATION` with fresh tasking, review, and parent-resume routes for
  the current feature; it never tasks in the parent context. Add no tasking
  status or registry.

## Execution-Cohesive Task Boundary

A task is one grounded material unit that can reach an owner-valid useful
implementation-and-proof completion. That completion need not be
feature-visible, close a whole AC, or complete the surrounding command,
invariant, transaction, or end-to-end flow.

A unit reaches useful task-level completion when task closure leaves one
material owner-valid implementation result true and decisively proved. Later
work may compose or depend on it but is not required to make that result true.

Different exact task-owned claims or canonical semantic owners are split
signals. Keep independently completable implementation, proof,
failure/retry/rollout/rollback surfaces in sibling tasks unless accepted
contracts and, when available, the bounded code/change surface show that they
cannot complete separately. Shared product outcome, capability owner, tier,
transaction, AC, flow, or KISS is not merge evidence. Do not split solely by
files, layers, artifacts, tests, AC count, or modules without distinct semantic
ownership; task count is not an optimization target.

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
14) Apply `/spec-redesign` and `#planning-redesign-boundary` to accepted
backbone/contract changes after initial design.

## Autonomous end-to-end mode (start and leave)
1) `/autonomous`
2) after Product/Design and applicable Foundation planning, it applies
`#fresh-feature-tasking-boundary`
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
