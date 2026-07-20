---
description: Guardrails and terminal states for unattended autonomous runs.
status: active
---
# Autonomy policy

## Default mode
- Prefer interactive mode unless the user explicitly requested unattended execution.
- Canonical scheduler execution is sequential: select, execute, verify, and
  record one task before selecting the next.
- Parallel task execution is experimental and disabled unless the run was
  explicitly invoked with `--experimental-parallel`.

## Phase ownership
- `/autonomous` owns Product/Design sequencing and the bounded Foundation
  execution phase. During that phase it may promote/select/close only indexed
  `feature: "FT-000"` records; product records remain untouched.
- `/autopilot` owns only the reviewed, strict-ready product queue after the
  Foundation is `not_required` or its named gate task is `done`. It may read
  FT-000 gate/dependency evidence but must not execute or mutate an FT-000
  record.
- Foundation execution is not delegated to `/autopilot` and introduces no
  scope flag, persisted mode, second queue, registry, schema, lifecycle, or
  protocol family.
- Each active scheduler selects and checkpoints only tasks in its phase; the
  invoked `/exe` owns protocol preparation and `ready -> in_progress` for that
  concrete selected task.
- If product execution creates an approved FT-000 foundation-extension task,
  `/autopilot` halts with the existing exact evidence/owner/resume contract;
  `/autonomous` resumes its Foundation phase and returns to product execution
  only after the extension gate and readiness gates pass.

## Experimental parallel execution
- Record the opt-in in `.protocols/AUTONOMOUS-RUN/status.md`.
- Never use advisory `touched_files` as proof that tasks are disjoint.
- Parallel candidates require non-empty, deliberately hard, pairwise-disjoint
  `runtime_context.write_boundary` values under the normalized segment rule in
  `tier-policy.md`, plus isolated worktrees/sandboxes.
- Lexical disjointness is necessary, not sufficient. The opt-in does not
  require concurrency; if existing durable checkpoint/recovery, filesystem
  aliasing, or external-output isolation cannot be proved without new workflow
  state, keep the canonical sequential execution.
- T3 tasks and tasks that write shared/governing state, package manifests,
  lockfiles, CI, or global configuration remain sequential.
- If isolation or non-overlap cannot be proved, fall back to sequential without
  treating the fallback as an error.
- This option adds no task status, schema field, registry, or lifecycle.

## Durable run checkpoint
- `.protocols/AUTONOMOUS-RUN/status.md` is the resumable orchestration
  checkpoint for `/autonomous` and `/autopilot`; it is not authoritative task
  state or a second task registry.
- Keep the checkpoint compact and linked to authoritative indexed task records.
  When active, it records:
  - current task, or `none` during a run-level stage;
  - current stage, using the scheduler-owned vocabulary defined by
    `/autopilot`;
  - last durable child verdict or handoff path;
  - next action.
- The scheduler checkpoint becomes active when `/autopilot` queue execution
  begins. Before `/autonomous` enters its product scheduler phase,
  Product/Design/Foundation resume is owned by the existing run plan, review
  coverage/counters, decision log, authoritative artifacts, FT-000 task records,
  and their task protocols. The scheduler checkpoint block may be absent or
  explicitly inactive; do not invent non-scheduler stage values.
- Initialize the scheduler checkpoint only at the product handoff, after the
  Foundation gate is closed and product review/readiness gates pass.
- Update the checkpoint immediately before a child stage and again after its
  durable handoff or verdict is written. Do not advance it from transient
  conversation state alone.
- `next action` names the exact unfinished scheduler action. Set it to `none`
  only after the terminal result is durably recorded.
  Never overwrite an unfinished `red-verify`, `closure`, or `wave-boundary`
  checkpoint with `selection` merely because no task is currently
  `in_progress`.
- On resume, reconcile every checkpoint value with the indexed `.task.json`,
  task protocol, handoff, and verdict evidence before acting. Never trust the
  checkpoint alone or use it to override authoritative lifecycle state.
- Queue summaries in run status are derived snapshots or links. The lifecycle
  remains `planned|ready|in_progress|blocked|done|failed` only in indexed task
  records.

## Hard-stop categories
- security / compliance ambiguity
- external contracts or partner APIs with unknown behavior
- destructive data migrations
- secret reads / prod writes / deploys

## Operator decisions and local tactics
- Unattended runs apply only decisions already fixed by Constitution, clarified
  PRD, accepted operator policy/decision, production baseline, ADR, canonical
  spec, or another authoritative artifact.
- An unresolved material product, UX/acceptance, architecture, API/event/data/
  state/storage/security/compatibility, Foundation, task-boundary, tier,
  dependency, verification, or human-checkpoint branch is not an allowed
  assumption. Record the exact question and halt with
  `HALT_CLARIFICATION_REQUIRED` or `HALT_BLOCKING_QUESTIONS` plus the owning
  interactive resume skill.
- A recommendation, framework preference, reversible/conservative default,
  silence, or continued reasoning is not operator consent.
- Agents may choose low-impact implementation tactics, naming inside an
  accepted contract, exploration order, tools, and the cheapest sufficient
  checks when those choices do not change an operator-owned decision or expand
  the approved scope/tier.
- Record material applied authoritative decisions and any temporary
  implementation-only assumption that needs later verification in the existing
  `.protocols/AUTONOMOUS-RUN/decision-log.md`; do not create an assumption or
  interview registry.

## Required gates
- latest `/review-tasks-plan FT-<NNN>` verdict must be `APPROVE` for every
  task-linked product feature in the product queue, and its exact standalone
  `REVIEWED_PLANNING_REVISION: <N>` must equal the current positive Global
  Backbone Planning Revision; FT-000 uses its dedicated `/foundation-to-tasks`
  plus strict-doctor handoff instead
- missing, invalid, or mismatched planning revision evidence makes every product
  task-plan approval stale; keep task statuses unchanged and route
  `/feature-to-tasks --all` -> `/review-tasks-plan --all` before product
  promotion or selection
- mandatory `/mb-doctor --strict` before `/autonomous` selects/promotes FT-000
  work, before `/autopilot` selects/promotes product work, after `/mb-sync`
  before further promotion, and before final success
- tier-appropriate verification per TASK:
  - T0/T1: compact evidence may be enough
  - Scheduler mode T2: full protocol, applicable task/spec gates, and `/verify` PASS are required before scheduler marks the task done; per-task `/red-verify` is not required
  - T2 feature completion: feature-level `/red-verify --feature FT-<ID>` semantic-pass is required after all feature tasks are implemented and must be recorded in the feature doc
  - `FT-000`: foundation pseudo-feature; do not apply product feature-completion semantics
  - Scheduler mode T3: `/verify` PASS and per-task `/red-verify` semantic-pass are required before scheduler marks the task done
  - Manual mode T0/T1: `/verify` PASS may close only with explicit closure ownership and completed evidence
  - Manual mode T2: `/verify` PASS plus full protocol and applicable task/spec
    gates makes the task closure-eligible; the explicit owner writes the
    lifecycle decision, and T2 feature completion still requires feature-level
    semantic-pass recorded in the feature doc
  - Manual mode T3: `/verify` PASS is not final closure; per-task `/red-verify` semantic-pass is required before `done`, with full `/mb-sync` deferred to the wave boundary
  - T3: exact marker line `HUMAN_CHECKPOINT: done` is required
- mandatory `/mb-sync` once at the end of each wave, after task status,
  closure decisions, and evidence are written immediately; early sync is only
  for a real RTM/index/spec/contract/changelog dependency inside the current
  wave or an explicit owner request
- mandatory lint/link consistency before final success, covered by `mb-doctor`

## Failure budgets
- max_retries_per_task: 2
- max_consecutive_failures: 3
- max_open_blockers: 3

## Terminal fallback
- A no-ready pass or resumed run must preserve any already-recorded specific
  `HALT_*` state together with its reason, owner, and resume route; never
  overwrite it with `HALT_DEPENDENCY_DEADLOCK`.
- Use `HALT_DEPENDENCY_DEADLOCK` only for genuine dependency-only graph
  exhaustion: every unfinished record owned by the active phase is non-runnable
  solely because its task dependencies are unfinished.

## Run state
- `STATE: RUNNING` is the only non-terminal run state. It means the outer
  `/autonomous` or standalone `/autopilot` run still has an authorized next
  action.
- `/autonomous` keeps `STATE: RUNNING` throughout Product/Design and Foundation;
  closing the Foundation gate never writes an intermediate `SUCCESS`.
- `/autopilot` writes the terminal product-queue result to `STATE`; in an outer
  `/autonomous` run, that result is accepted only with the end-to-end gates
  required by `/autonomous`.

## Terminal states
- `SUCCESS`
- `HALT_BLOCKING_QUESTIONS`
- `HALT_CLARIFICATION_REQUIRED`
- `HALT_REVIEW_REJECT`
- `HALT_FAILURE_BUDGET`
- `HALT_DEPENDENCY_DEADLOCK`
- `HALT_POLICY_VIOLATION`
- `HALT_QUALITY_GATES`
- `HALT_BUDGET_EXCEEDED`
