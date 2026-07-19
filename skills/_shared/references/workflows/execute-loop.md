---
description: Workflow: PRD → FT → TASK loop (interactive or autonomous).
status: active
---
# Execute loop (PRD → Feature → Tasks)

## Principle: no task explosion
- `/prd-to-features` creates L1–L3 only (product/requirements/epics/features) and does not
  write testing documentation.
- `/write-prd` = PRD-level ambiguity closure. `/feature-doctor` = optional feature-level ambiguity pass.
- `/spec-init` creates lightweight pre-PRD framing state in `.memory-bank/spec-backbone.md` after `/write-prd` and before `/prd-to-features`, while `.memory-bank/spec-index.md` remains a pure spec registry/index.
- `/spec-design` is mandatory after `/prd-to-features`; it records a minimal backbone for local/simple feature-set pressure or a full architecture scaffold for shared-boundary, contract, state/data/runtime/security, or strict pressure, and records `.memory-bank/foundation.md` when a Foundation Dev Path is needed.
- `/foundation-to-tasks` creates normal `FT-000` foundation JSON tasks and the final foundation gate when foundation is required; execute/verify that queue before product feature tasking.
- `/feature-to-tasks FT-<NNN>` closes applicable canonical concern coverage and
  creates the implementation plan plus complete JSON task records with direct
  relevant spec links. Discovery, concern-lens order, and slicing tactics are
  agent-selected inside the command contract.
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
   - T0/T1 manual: `/execute-task TASK`, compact evidence or no-runnable-check note, optional local closure by explicit owner
   - T2 manual: `/execute-task TASK -> /verify TASK`; sync at wave/feature boundary unless broader state must be reconciled earlier
   - T3 manual: `/execute-task TASK -> /verify TASK -> /red-verify TASK`, then the
     explicit owner records closure/status/evidence immediately and runs
     `/mb-sync` at the end of the current wave
   - after all tasks for a T2 feature are implemented, run `/red-verify --feature FT-<ID>` before treating the feature as complete
   - start `/execute-task` only after the current feature task set has been decomposed and any required/conditional feature/task-queue doctor gate has passed
   - `/execute-task` reads the indexed task card and direct task-linked canonical specs; structural single-card readiness is owned by `/mb-doctor`, while semantic contradictions remain implementer blockers
   - if `/execute-task` or `/verify` discovers a required higher tier, stop the
     current run and route the original task ID through
     `/feature-to-tasks FT-<NNN>` for controlled rebuild/split; rerun
     `/review-tasks-plan`, applicable `/mb-doctor`, and `/execute-task` with the
     replacement task ID
13) Rerun `/review-tasks-plan FT-<NNN>` after a wave only when execution changed
the planning surface: task cards, specs, dependencies, tier, scope, or
unresolved plan assumptions. Status/evidence-only closure does not
trigger another task-plan review.

## Autonomous end-to-end mode (start and leave)
1) `/autonomous`
2) command runs `/write-prd -> /spec-auto --init -> /prd-to-features -> /review-feat-plan -> /spec-design --all -> /foundation-to-tasks when required -> /mb-doctor --strict at foundation/task-queue boundary -> execute/verify FT-000 until the final foundation gate is done -> /spec-auto --all -> /feature-to-tasks --all -> /review-tasks-plan FT-<NNN> for each task-linked product feature`, then schedules ready TASKs
3) run `/mb-doctor --strict` again before product scheduler execution; T2/T3 tasks without SDD spec links are blockers
4) before `/execute-task`, scheduler requires `/mb-doctor --strict`; structurally incomplete T2/T3 task cards stop execution and require task-card repair
5) each TASK runs in a **fresh CLI session**, sequentially by default; parallel
execution is non-canonical and requires explicit `--experimental-parallel` plus
the autonomy-policy isolation and hard-scope gates
6) after each task, record status, closure decision, and evidence immediately;
when the last task of a T2 product feature closes, run feature-level
`/red-verify --feature FT-<ID>` before the wave-boundary `/mb-sync`; at the end
of the wave run `/mb-sync` once, then lint and `/mb-doctor --strict` before
promoting dependents. Early sync is allowed only for a real current-wave
RTM/index/spec/contract/changelog dependency or an explicit owner request
   - functional/semantic failures and blockers use tier-policy `Scheduler
     Failure Handling`: bounded safe same-task retry, otherwise durable
     `failed|blocked`, required bug/follow-up evidence, and dependent blocking
7) after a wave, rerun `/review-tasks-plan FT-<NNN>` only for product features
whose task/spec/dependency/tier/scope planning surface changed; do not
rerun it for status/evidence-only closure
8) final success only if every task-linked product feature has latest
`/review-tasks-plan FT-<NNN>` = `APPROVE`, `/mb-doctor --strict` passes, and no
blocking tasks remain

## Autonomous executor only
If JSON task records already exist and `/review-tasks-plan FT-<NNN>` already
approved every task-linked product feature, use:
- `/autopilot`

`/autopilot` must run `/mb-doctor --strict` before task selection and after the
wave-boundary `/mb-sync` before promotion.

Codex (manual execution, tier-routed minimal context):
~~~bash
codex exec --ephemeral --full-auto -m gpt-5.2-high \
  'TASK_ID=TASK-123-T2-FT-001-W1. Use the installed /execute-task project skill. Read AGENTS.md, the indexed task record, .memory-bank/workflows/tier-policy.md, and direct task-linked canonical specs. Do not load broad planning/global docs by default for T0/T1. Assume structural readiness was checked by the applicable boundary gate. Treat touched_files as advisory and non-exhaustive; confirm the actual write set during preflight, respect hard allowed/forbidden scope, and stop on material outcome/tier/design expansion. Use tier-appropriate .protocols/TASK-123-T2-FT-001-W1/ state. Implement only semantically scoped changes. Record evidence and actual changed files. For manual T0/T1, close only if explicit top-level owner fast-lane conditions are met; otherwise hand off. Report → .tasks/TASK-123-T2-FT-001-W1/TASK-123-T2-FT-001-W1-S-IMPL-final-report-code-01.md.'

codex exec --ephemeral --full-auto -m gpt-5.2-high \
  'TASK_ID=TASK-123-T2-FT-001-W1. Use the installed /verify project skill, and /red-verify when task.tier is T3. Read AGENTS.md, the indexed JSON task record including runtime_context, .memory-bank/workflows/tier-policy.md, tier-selected execution handoff/evidence, task-scoped acceptance/REQ basis, and direct task-linked canonical specs. Respect task gates, verification targets, evidence requirements, scope, and stop conditions. Task/spec are source of truth. Route only by task.tier: T0/T1 compact run.md; T2 functional PASS makes closure eligible without per-task red-verify; T3 functional PASS routes to per-task red-verify and exact HUMAN_CHECKPOINT: done. Run mb-doctor --strict before progression.'
~~~

Claude (manual execution, tier-routed minimal context):
~~~bash
claude -p --no-session-persistence --permission-mode acceptEdits --model opus \
  'TASK_ID=TASK-123-T2-FT-001-W1. Use the installed /execute-task project skill. Read AGENTS.md, the indexed task record, .memory-bank/workflows/tier-policy.md, and direct task-linked canonical specs. Do not load broad planning/global docs by default for T0/T1. Assume structural readiness was checked by the applicable boundary gate. Treat touched_files as advisory and non-exhaustive; confirm the actual write set during preflight, respect hard allowed/forbidden scope, and stop on material outcome/tier/design expansion. Use tier-appropriate .protocols/TASK-123-T2-FT-001-W1/ state. Implement only semantically scoped changes. Record evidence and actual changed files. For manual T0/T1, close only if explicit top-level owner fast-lane conditions are met; otherwise hand off. Report → .tasks/TASK-123-T2-FT-001-W1/TASK-123-T2-FT-001-W1-S-IMPL-final-report-code-01.md.'

claude -p --no-session-persistence --permission-mode acceptEdits --model opus \
  'TASK_ID=TASK-123-T2-FT-001-W1. Use the installed /verify project skill, and /red-verify when task.tier is T3. Read AGENTS.md, the indexed JSON task record including runtime_context, .memory-bank/workflows/tier-policy.md, tier-selected execution handoff/evidence, task-scoped acceptance/REQ basis, and direct task-linked canonical specs. Respect task gates, verification targets, evidence requirements, scope, and stop conditions. Task/spec are source of truth. Route only by task.tier: T0/T1 compact run.md; T2 functional PASS makes closure eligible without per-task red-verify; T3 functional PASS routes to per-task red-verify and exact HUMAN_CHECKPOINT: done. Run mb-doctor --strict before progression.'
~~~

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
