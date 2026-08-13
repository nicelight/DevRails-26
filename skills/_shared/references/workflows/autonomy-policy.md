---
description: Guardrails, failure handling, budgets, and terminal states for unattended runs.
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
  `tier-policy.md#hard-write-boundary`, plus isolated worktrees/sandboxes.
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
- Unattended mode may apply a material target decision only when it is already
  fixed by Constitution, an explicit accepted operator decision or policy, an
  active accepted ADR, an authoritative canonical spec, or clarified product
  sources.
- Runtime observations, production code, and mapped baseline may establish
  current behavior, constraints, and compatibility or migration evidence; they
  do not authorize a new target architecture, contract, data ownership, or
  migration route. Indexed task cards and workflow state remain authoritative
  for their existing task, lifecycle, scheduler, and verification fields; they
  are not independent sources of a new product or architecture target.
- A difference between current state and an accepted target is a reconciliation
  delta, not an authority conflict. If the accepted target and applicable
  constraints yield one unambiguous route, record it in the existing owning
  artifact and continue without re-asking. Conflicting target authorities or an
  unresolved material compatibility, migration, or irreversible-behavior
  branch must halt through the existing route below.
- An unresolved material product, UX/acceptance, architecture, API/event/data/
  state/storage/security/compatibility, Foundation, task-boundary, tier,
  dependency, or verification branch is not an allowed assumption. Record the
  exact question and halt with
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
- a task-linked product feature is eligible only when it has no
  `PLANNING_RECONCILIATION_REQUIRED` marker and its latest
  `/review-tasks-plan FT-<NNN>` verdict is `APPROVE` with exact
  `REVIEWED_PLANNING_REVISION: <N>` equal to the current positive Global
  Planning Revision; only that feature is withheld when this gate fails
- missing/invalid Global Planning Revision halts all product work for design
  repair; keep task statuses unchanged
- mandatory `/mb-doctor --strict` before `/autonomous` selects/promotes FT-000
  work, before `/autopilot` selects/promotes product work, after `/mb-sync`
  before further promotion, and before final success
- tier-appropriate protocol, verification, semantic, closure, and sync gates
  from `tier-policy.md#tier-obligations` and
  `tier-policy.md#closure-authority`; the active scheduler writes each allowed
  lifecycle decision and evidence before the required sync boundary
- mandatory lint/link consistency before final success, covered by `mb-doctor`

## Failure budgets
- max_retries_per_task: 2
- max_consecutive_failures: 3
- max_open_blockers: 3

## Scheduler Failure Handling

`/autopilot` and `/autonomous` apply this counting, retry-safety, and
failure-disposition contract. Automatic `diagnose` applies only to `/autopilot`
product tasks; `/autonomous` FT-000 Foundation execution keeps its existing
disposition.

- The current Execution Attempt becomes unsuccessful when `/verify` returns
  `VERDICT: FAIL` or a required `/red-verify` returns
  `SEMANTIC_VERDICT: semantic-fail`; both markers count once for that attempt.
  An unfinished `/exe`, replay, resume, `/debug`, multiple findings,
  `NEEDS-CLARIFICATION`, `semantic-concern`, or a blocker without a completed
  correction attempt does not increment the count. `max_retries_per_task: 2`
  permits the initial attempt plus two retries.
- Before the third unsuccessful attempt, same-task retry requires an
  evidence-backed correction inside accepted task identity, outcome, scope,
  tier, dependencies, specs, and hard runtime boundaries, without replaying an
  unsafe or non-idempotent side effect. The task stays `in_progress`. The
  scheduler records the correction basis before re-invoking `/exe`; `/exe` owns
  attempt creation, resume, and replay safety. Every required gate remains due.
- `/autopilot` may checkpoint `diagnose` and run a fresh `/debug <TASK_ID>` when
  durable failure evidence supports neither a safe same-task correction nor an
  evidence-based disposition. `/debug` neither increments nor extends the
  retry budget; checkpoint and report recovery remain owned by `/autopilot`.
- Carry advisory recurrence/prevention evidence into the existing correction,
  disposition, or bug/follow-up handoff. A same-task retry may include its
  guardrail only when the accepted task and minimum correction require it.
- Disposition follows evidence: a proven upstream or authority gap becomes
  `blocked` with exact halt, owner, and resume route; proven task-local failure
  without a safe retry becomes `failed`; an inconclusive mapping before the
  third unsuccessful attempt keeps `in_progress` and uses the existing
  quality/clarification halt with evidence owner and resume route.
- After the third unsuccessful attempt no fourth is permitted. A proven
  upstream or authority gap remains `blocked`; every other task-local or
  inconclusive disposition becomes `failed`.
- For `/autopilot` product tasks, route task slicing, tier, or direct task spec
  to `/feature-to-tasks FT-<NNN>`; product ambiguity to
  `/feature-doctor FT-<NNN>`; and shared architecture, write authority, source
  of truth, public boundary, or dependency direction to `/spec-redesign`.
- A failed disposition writes `in_progress -> failed` with functional/semantic
  and diagnostic evidence. Before the next strict doctor, create a
  `.memory-bank/bugs/` note or route a normal indexed follow-up through its
  planning owner; same-run follow-up still requires normal review/readiness.
- `NEEDS-CLARIFICATION`, `semantic-concern`, and execution blockers follow the
  same evidence mapping and never become `done`.
- Mark direct dependents of every `failed|blocked` task `blocked` before another
  promotion pass. Repeat the pass so no downstream task is promoted through a
  failed or blocked dependency.
- Record retry, consecutive-failure, and open-blocker counters in
  `.protocols/AUTONOMOUS-RUN/status.md`. Exceeding an applicable failure limit
  yields `HALT_FAILURE_BUDGET`; a successful task resets the
  consecutive-failure count.

The scheduler owns these lifecycle decisions. `/exe`, `/verify`,
`/red-verify`, and `/mb-sync` only return or reconcile their existing evidence
and ownership deltas.

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
