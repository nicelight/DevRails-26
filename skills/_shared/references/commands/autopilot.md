---
description: Sequentially execute an already reviewed and strict-ready indexed product JSON task queue to a terminal state.
status: active
---
# /autopilot - Run an existing product JSON task queue

<objective>
Act as the scheduler for an already prepared product JSON task queue. Select,
execute, verify, close/block/fail, synchronize, and promote product tasks until
the queue reaches an explicit terminal state. Do not create PRD, product
features, design, the initial task queue, or execute FT-000 Foundation work.

In this command, `task` and `queue` mean only indexed records whose `feature`
is not `FT-000`. FT-000 records are read-only Foundation history.
</objective>

<input_contract>
Require:
- non-empty `.memory-bank/tasks/index.json` and resolving schema-valid
  `.memory-bank/tasks/*.task.json` records;
- `.memory-bank/schemas/task.schema.json`;
- installed `.memory-bank/workflows/{tier-policy,execute-loop,autonomy-policy,mb-sync}.md`
  exist;
- load tier policy `#tier-obligations` and `#closure-authority`, plus
  `#hard-write-boundary` only for a task/parallel boundary and
  `#tier-classification-and-escalation` only for a tier gap;
- load autonomy policy `#phase-ownership`, `#experimental-parallel-execution` when
  opted in, `#durable-run-checkpoint`, `#required-gates`, `#failure-budgets`,
  `#scheduler-failure-handling`, `#terminal-fallback`, `#run-state`, and
  `#terminal-states`;
- valid Global Backbone Status and Foundation anchors/dependencies; when
  Foundation is required, its named final gate is `done` and no FT-000 record
  remains `planned|ready|in_progress|blocked`;
- positive integer Global Backbone `Planning Revision`;
- at least one indexed product task whose `feature` is not `FT-000`;
- latest `/review-tasks-plan FT-<NNN>` `APPROVE` for every task-linked product
  feature in the queue, with exact standalone
  `REVIEWED_PLANNING_REVISION: <N>` equal to the current Planning Revision;
- no unresolved blocking operator decision;
- invoke `node scripts/mb-doctor.mjs --strict` before the run, including resume,
  and before every later task selection required below. A new run requires
  `PASS`. A resumed run also requires `PASS` unless its only failing findings
  are the durable consequences of the exact unfinished scheduler checkpoint
  being recovered; in that case permit only that recovery action, then require
  `PASS` again before promotion, selection, or terminal success. Any unrelated
  finding uses the existing quality halt.

Every product task must preserve JSON schema, matching ID/tier/feature/wave segments,
legal lifecycle, valid dependencies, feature existence, product `W1+`/reserved
FT-000 W0 rules, and authoritative `task.tier`. Every T2/T3 task must have the
complete single-card handoff: purpose/outcome, direct applicable canonical SDD
links, expected advisory change surface and/or deliberate hard write boundary,
verification path, concrete REQ links, and valid dependencies.

If no product record exists, return
`HALT_QUALITY_GATES: no schema-backed product task records found in .memory-bank/tasks/index.json`
and route to `/feature-to-tasks`. If the Foundation gate is unfinished or any
FT-000 work remains unresolved, return `HALT_QUALITY_GATES` with `/autonomous`
as the Foundation execution/resume owner.
Missing/invalid tier is `HALT_POLICY_VIOLATION`; clarification/design/Foundation/
handoff/readiness gaps use the applicable clarification or quality halt and
repair route.

Missing, invalid, or mismatched planning revision evidence means every previous
product task-plan approval is stale. Return `HALT_QUALITY_GATES` without
promoting or selecting work and route `/feature-to-tasks --all`, then
`/review-tasks-plan --all`, the applicable doctor gate, and `/autopilot` resume.
Do not mutate task statuses to represent this invalidation.
</input_contract>

<hard_invariants>
- `/autopilot` owns only product task promotion and selection, final
  `done|failed|blocked` decisions, dependent block/unblock, failure budget, and
  terminal queue result. Installed `/exe` owns `ready -> in_progress` for the
  task selected by the scheduler.
- It never executes or mutates an FT-000 record.
- Child ownership remains canonical in
  `.memory-bank/workflows/tier-policy.md#closure-authority`: `/exe` implements,
  `/verify` provides functional verdict, `/red-verify` provides semantic
  verdict, and `/mb-sync` only reconciles already-written state.
- Canonical execution is sequential. Select and finish one task's execute,
  verification, lifecycle decision, and evidence write before selecting the
  next.
- Run each selected task in a fresh child execution context/session. Resume an
  interrupted task only from reconciled durable evidence, not from inherited
  conversational state.
- `--experimental-parallel` remains opt-in and follows autonomy policy exactly:
  isolated worktrees/sandboxes plus pairwise-disjoint non-empty hard
  `write_boundary`; never infer independence from `touched_files`. Fallback
  is sequential.
- Scheduler writes each final task decision/status/evidence to the authoritative
  `.task.json` before `/mb-sync`.
- `/debug` is supporting evidence; `/autopilot` owns its invocation, retry
  decision, and lifecycle disposition.
- Full `/mb-sync` runs once at the wave boundary. Early sync requires a real
  current-wave RTM/index/spec/contract/changelog dependency or explicit owner
  request and does not replace the boundary sync.
- After a successful wave-boundary gate, run `/tech-debt wave <N>` by default.
  Its report is advisory: it never changes task state, queue state, gates,
  blockers, terminal state, or resume routing.
- Do not add a schema, lifecycle, scheduler, registry, or persisted mode field.
</hard_invariants>

<operator_decisions>
The scheduler may apply only decisions already fixed in authoritative artifacts.
If a child or queue transition exposes a new material product/design/contract/
state/data/storage/security/compatibility/task-boundary/tier/dependency/
verification/Foundation branch:
- do not choose a recommendation/default or infer consent;
- record the exact question, affected tasks/state, evidence, and interactive
  repair owner in the existing run status/decision log;
- leave affected work non-closed and do not promote dependents;
- stop with `HALT_CLARIFICATION_REQUIRED` or `HALT_BLOCKING_QUESTIONS` and name
  the exact resume skill.

An ordinary implementation tactic within the approved task/spec boundary is not
an operator decision.
</operator_decisions>

<agent_discretion>
The scheduler chooses efficient context refreshes, executor invocation, and
bounded retry tactics within policy/budgets. It does not duplicate or constrain
the internal method of `/exe`, `/verify`, or `/red-verify`.
</agent_discretion>

<required_outputs>
Create/reuse `.protocols/AUTONOMOUS-RUN/status.md` with run metadata, task-plan
review coverage, operator blockers/applied decisions, queue summary linked to
JSON records, failure budget, and terminal state. This is not authoritative task
state. Maintain the durable run checkpoint required by
`.memory-bank/workflows/autonomy-policy.md#durable-run-checkpoint`.

Scheduler-specific `current stage` values are exactly:
`selection|execute|verify|red-verify|diagnose|closure|wave-boundary`. They are
orchestration checkpoint values, not task lifecycle states. Do not persist them
in the task schema or use another stage vocabulary.

## Recovery-first scheduler loop

At scheduler start, after interruption, and before every promotion/selection
cycle, revalidate the input contract, then reread the run checkpoint and durable
task evidence. Recovery order is checkpoint, `in_progress` tasks, then
promotion/selection. Do not overwrite a checkpoint or start new work until
durable evidence proves the earlier action complete or safely superseded.

### Checkpoint recovery

Before inspecting the ready queue, reconcile any checkpoint whose `next action`
still names scheduler work, even when no task is `in_progress`:

1. `selection` with `current task: none` has no selected-task action to replay.
   For backward-compatible recovery only, a legacy `selection` checkpoint that
   names a task is reconciled without a lifecycle write: a still-runnable
   `planned|ready` task is checkpointed at `execute` with exact next action
   `/exe <TASK_ID>`; an `in_progress` or final task uses the rules below.
2. An `execute` checkpoint with a selected `planned|ready` task re-invokes
   `/exe <TASK_ID>` after reconciling the checkpoint and any prepared protocol.
   An `in_progress` task enters task recovery below. `verify`, task-level
   `red-verify`, and `closure` checkpoints also reconcile the named task through
   those rules. If the task is already final, first prove the lifecycle/evidence
   write and derive the next required scheduler action from durable queue/feature
   state; do not assume selection.
3. A `diagnose` checkpoint reconciles the current Execution Attempt, durable
   unsuccessful-attempt count, failure evidence, next action, and expected
   `/debug` report, then resumes `### Diagnostic recovery`. Reuse only a report
   bound to the current attempt and change surface.
4. A `red-verify` checkpoint whose exact next action is
   `/red-verify --feature FT-<ID>` reconciles the feature document and current
   verdict. Resume that child only if semantic-pass is absent and replay is
   safe; after its durable verdict, checkpoint the derived next action.
5. A `wave-boundary` checkpoint resumes the first incomplete boundary action in
   canonical order: required feature/T3 gates, `/mb-sync`, lint, strict doctor,
   planning-surface-triggered task-plan reviews, `/tech-debt wave <N>`, then
   selection. Use `last durable child verdict/handoff` plus the referenced
   artifacts to skip completed actions; do not replace the checkpoint with
   `selection` until every required gate passes and the advisory report action
   is durably reconciled.
   If `next action` names `/tech-debt`, reconcile its existing report path or
   inspect the current-scope report evidence before invoking it again. If the
   prior side effect is ambiguous, record an unavailable advisory handoff and
   never create a second report merely because the scheduler resumed.
6. If checkpoint stage, selected task, prior side effect, or completion
   cannot be reconciled safely, invoke no child and promote/select no task.
   Record the recovery decision, evidence, owner, and exact resume route, then
   use the existing halt matching the cause.

### In-progress task recovery

Reconcile all product `in_progress` tasks sequentially in stable index order. While any remains
unresolved, do not write `planned -> ready` and do not select a different
`ready` task. For each task:

1. Reconcile the authoritative `.task.json`, checkpoint, task protocol, neutral
   current-attempt metadata when present, `/exe` handoff, functional verdict,
   and semantic verdict. The task record and durable
   evidence win over a stale checkpoint. Determine the first incomplete durable
   stage; do not replay a stage merely because the scheduler restarted.
2. Before invoking a child stage, write the task/stage, last durable evidence,
   and intended next action to the run checkpoint. After the child writes its
   handoff or verdict, update `last durable child verdict/handoff` and `next
   action` from that artifact before continuing.
3. Only after the current attempt, stage, and any required replay are proved safe,
   continue from the first incomplete stage:
   - no current `/exe` handoff and no evidence of a possibly completed
     unsafe/non-idempotent execution -> checkpoint `execute`, then
     `/exe <TASK_ID>`; otherwise use the recovery halt in step 4;
   - current forward `/exe` handoff routing to `/verify` but no functional
     verdict -> checkpoint `verify`, then `/verify <TASK_ID>`;
   - an `/exe` handoff naming a blocker or repair owner -> apply its named route
     under tier policy;
   - T3 functional `PASS` but no task semantic-pass -> checkpoint `red-verify`,
     then `/red-verify <TASK_ID>`;
   - every tier-required gate already passes -> checkpoint `closure`, then the
     scheduler writes the lifecycle decision and evidence immediately and
     updates the checkpoint from the authoritative task record;
   - functional FAIL, semantic-fail, NEEDS-CLARIFICATION, semantic-concern, or
     an execution blocker -> apply
     `.memory-bank/workflows/autonomy-policy.md#scheduler-failure-handling`
     without inventing another route.
4. If current attempt, stage, or safe replay cannot be
   proved, invoke no child and promote/select no work. Record the recovery
   decision, conflicting or missing evidence, owner, and exact resume route,
   then use the existing policy, quality, clarification, or blocking halt that
   matches the cause. In particular, never replay a possibly completed unsafe
   or non-idempotent side effect to manufacture missing evidence.

### Diagnostic recovery

Apply
`.memory-bank/workflows/autonomy-policy.md#scheduler-failure-handling`. When
failure evidence supports neither
a safe task-local correction nor disposition, checkpoint `current task`,
`current stage: diagnose`, last durable evidence, exact next action, and the
expected
`.tasks/<TASK_ID>/<TASK_ID>-S-DEBUG-final-report-docs-01.md`, then invoke
`/debug <TASK_ID>` in a fresh child context.

On resume, prove the unsuccessful-attempt count and reuse only a matching
current-attempt report; never replay an ambiguously completed mutating probe.
Then apply the policy-owned retry, disposition, or evidence-owner halt.
`/debug` does not add retry capacity. If count or child completion cannot be
proved, preserve `in_progress`, record the evidence gap and owner/resume route,
and use the matching existing halt.

Continue to the next stranded `in_progress` task only after the current task has
a durable scheduler decision and no terminal halt was recorded. The recovery
pass completes only when no unresolved `in_progress` task remains.

Only after checkpoint recovery leaves no unfinished scheduler action and task
recovery leaves no unresolved `in_progress` task, run the normal
selection loop:

1. checkpoint `current task: none`, `current stage: selection`, and the next
   promotion/selection action;
2. run a separate product promotion pass, writing `planned -> ready` only when
   every dependency is `done` and no blocking review, bug, decision, or
   unresolved semantic concern remains; write dependent blocking decisions only
   to affected records;
3. select one product `ready` task by earliest wave and stable index order;
4. require current strict-doctor PASS, then checkpoint the selected task at
   `execute` with exact `next action: /exe <TASK_ID>` and invoke `/exe`; `/exe`
   prepares/reconciles the tier protocol and writes `ready -> in_progress`;
5. after `/exe` writes its durable handoff, follow its recorded route; only a
   forward handoff runs `verify`, required T3 `red-verify`, and scheduler-owned
   `closure` in order;
6. write the final closure/failure/blocking decision and evidence, then update
   the checkpoint from the authoritative lifecycle/evidence write only after
   `tier-policy.md#tier-obligations` permits it; concerns remain non-done, and
   failures/blockers follow the referenced autonomy-policy contract;
7. when this closes the last task of a non-FT-000 feature containing T2 work,
   checkpoint `current task: none`, `current stage: red-verify`, the lifecycle
   write as last durable evidence, and exact
   `next action: /red-verify --feature FT-<ID>`; run that child and require
   feature-doc semantic-pass before feature completion, then update the
   checkpoint from its durable verdict;
8. continue eligible work in the wave without ordinary per-task full sync.

At each wave boundary:
1. checkpoint `current task: none` and `current stage: wave-boundary`;
2. resolve required T2 feature and T3 task semantic gates;
3. run `/mb-sync` once for authoritative already-written state, updating the
   checkpoint only after its durable handoff;
4. run lint then the strict doctor;
5. rerun `/review-tasks-plan FT-<NNN>` only for product features whose task
   cards, specs, dependencies, tier, scope, or plan assumptions changed; pure
   status/evidence closure does not trigger it;
   if Global Backbone Planning Revision changed, stop the boundary and use the
   all-feature stale-planning route from the input contract instead;
6. only after all triggered gates pass, checkpoint the existing
   `wave-boundary` stage with exact next action `/tech-debt wave <N>` and run
   `/tech-debt wave <N>` by default. Record its report path in the existing
   durable child handoff before continuing. If report creation is unavailable,
   record the existing advisory handoff and continue; a report finding or an
   unavailable advisory report does not become a queue halt or lifecycle
   decision.
7. only after the report action is durably reconciled, run the next
   recovery-first cycle and then the next promotion/dependent-
   blocking pass.

Autonomy policy owns retry eligibility, `failed|blocked` mapping, failed-task
BUG/follow-up evidence, dependent blocking, and failure budgets. A
schema-backed follow-up created through the normal planning owner is considered
in the same run only after its review and readiness gates pass; verifiers do
not create it independently.

If recovery leaves no unresolved product `in_progress` task and no product
`ready` task remains:
- preserve any already-recorded specific `HALT_*` state, reason, owner, and
  resume route as required by autonomy policy;
- all product work closed -> run final review coverage and success
  checks;
- only when every unfinished product record is non-runnable solely because its
  task dependencies are unfinished -> record exact dependency evidence and
  `HALT_DEPENDENCY_DEADLOCK`;
- for any other cause, keep the applicable specific halt and its owner/resume
  route.
</required_outputs>

<validation>
Keep existing `max_retries_per_task`, `max_consecutive_failures`,
`max_open_blockers`, configured `max_files_changed_per_task`, and any explicit
token/time/run budgets plus terminal vocabulary from autonomy policy/run status.
Do not claim success unless:
- no product task is `ready|in_progress` and no blocking product queue work
  remains;
- every task-linked product feature has latest final `APPROVE`;
- every such `APPROVE` records the current positive Planning Revision;
- all task and feature gates in `tier-policy.md#tier-obligations` pass, and
  Foundation remains `not_required` or its named gate task remains `done`;
- latest lint plus strict doctor pass;
- run protocol matches authoritative JSON records.

Terminal states remain:
`SUCCESS|HALT_BLOCKING_QUESTIONS|HALT_CLARIFICATION_REQUIRED|HALT_REVIEW_REJECT|HALT_FAILURE_BUDGET|HALT_DEPENDENCY_DEADLOCK|HALT_POLICY_VIOLATION|HALT_QUALITY_GATES|HALT_BUDGET_EXCEEDED`.
</validation>

<handoff_contract>
Record terminal `STATE`, reason, evidence, unresolved decisions, and exact
resume route in `.protocols/AUTONOMOUS-RUN/status.md`. `/autopilot` does not
route back into PRD/design/task generation except through an explicit halt with
a named repair owner.
</handoff_contract>
