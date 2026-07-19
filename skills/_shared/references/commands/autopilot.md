---
description: Sequentially execute an already reviewed and strict-ready indexed JSON task queue to a terminal state.
status: active
---
# /autopilot - Run an existing JSON task queue

<objective>
Act as the scheduler for an already prepared JSON task queue. Select, execute,
verify, close/block/fail, synchronize, and promote tasks until the queue reaches
an explicit terminal state. Do not create PRD, product features, design, or the
initial task queue.
</objective>

<input_contract>
Require:
- non-empty `.memory-bank/tasks/index.json` and resolving schema-valid
  `.memory-bank/tasks/*.task.json` records;
- `.memory-bank/schemas/task.schema.json`;
- `.memory-bank/workflows/{tier-policy,execute-loop,autonomy-policy,mb-sync}.md`;
- valid Global Backbone Status and Foundation anchors/dependencies;
- latest `/review-tasks-plan FT-<NNN>` `APPROVE` for every task-linked product
  feature;
- no unresolved blocking operator decision;
- `node scripts/mb-doctor.mjs --strict` PASS before the run.

Every task must preserve JSON schema, matching ID/tier/feature/wave segments,
legal lifecycle, valid dependencies, feature existence, product `W1+`/reserved
FT-000 W0 rules, and authoritative `task.tier`. Every T2/T3 task must have the
complete single-card handoff: purpose/outcome, direct applicable canonical SDD
links, expected advisory change surface and/or deliberate hard write boundary,
verification path, concrete REQ links, and valid dependencies.

If the queue is empty, return
`HALT_QUALITY_GATES: no schema-backed task records found in .memory-bank/tasks/index.json`.
Use the existing planning owner identified by authoritative Foundation/product
state to create and review a non-empty queue. If that state identifies no owner,
require the operator to provide a reviewed non-empty queue; do not invent a
planning route. After review and strict readiness pass, resume `/autopilot`.
Missing/invalid tier is `HALT_POLICY_VIOLATION`; clarification/design/Foundation/
handoff/readiness gaps use the applicable clarification or quality halt and
repair route.
</input_contract>

<hard_invariants>
- `/autopilot` is the scheduler and owns JSON task promotion,
  `ready -> in_progress`, final `done|failed|blocked` decisions, dependent
  block/unblock, failure budget, and terminal queue state.
- Child ownership remains canonical in
  `.memory-bank/workflows/tier-policy.md`: `/execute-task` implements, `/verify`
  provides functional verdict, `/red-verify` provides semantic verdict, and
  `/mb-sync` only reconciles already-written state.
- Canonical execution is sequential. Select and finish one task's execute,
  verification, lifecycle decision, and evidence write before selecting the
  next.
- `--experimental-parallel` remains opt-in and follows autonomy policy exactly:
  isolated worktrees/sandboxes plus pairwise-disjoint non-empty hard
  `write_boundary`; never infer independence from `touched_files`. Fallback
  is sequential.
- Scheduler writes each final task decision/status/evidence to the authoritative
  `.task.json` before `/mb-sync`.
- Full `/mb-sync` runs once at the wave boundary. Early sync requires a real
  current-wave RTM/index/spec/contract/changelog dependency or explicit owner
  request and does not replace the boundary sync.
- Do not add a schema, lifecycle, scheduler, registry, or persisted mode field.
</hard_invariants>

<operator_decisions>
The scheduler may apply only decisions already fixed in authoritative artifacts.
If a child or queue transition exposes a new material product/design/contract/
state/data/storage/security/compatibility/task-boundary/tier/dependency/
verification/Foundation/human-checkpoint branch:
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
the internal method of `/execute-task`, `/verify`, or `/red-verify`.
</agent_discretion>

<required_outputs>
Create/reuse `.protocols/AUTONOMOUS-RUN/status.md` with run metadata, task-plan
review coverage, operator blockers/applied decisions, queue summary linked to
JSON records, failure budget, and terminal state. This is not authoritative task
state.

## Selection and task loop

Before each selection pass, reread index/records and run a separate promotion
pass. Write `planned -> ready` only when every dependency is `done` and no
blocking review, bug, decision, or unresolved semantic concern remains. Write
dependent blocking decisions to the affected records.

In canonical mode, select one `ready` task by earliest wave and stable index
order. Require current strict-doctor PASS before `ready -> in_progress`, then:

1. scheduler writes `ready -> in_progress`;
2. `/execute-task <TASK_ID>`;
3. `/verify <TASK_ID>` by authoritative tier;
4. per-task `/red-verify <TASK_ID>` for T3 only (optional for T2);
5. scheduler writes final closure/failure/blocking decision and evidence:
   - T0/T1 `done` after tier-valid compact/functional PASS;
   - T2 `done` after full protocol, applicable gates, and functional PASS;
   - T3 `done` only after functional PASS, task semantic-pass, and exact
     `HUMAN_CHECKPOINT: done`;
   - concern remains non-done pending the recorded owner decision/fix;
   - functional FAIL, semantic-fail, NEEDS-CLARIFICATION, semantic-concern, and
     execution blockers follow `## Scheduler Failure Handling` in
     `.memory-bank/workflows/tier-policy.md`;
6. when this closes the last task of a non-FT-000 feature containing T2 work,
   run `/red-verify --feature FT-<ID>` and require feature-doc semantic-pass
   before feature completion;
7. continue eligible work in the wave without ordinary per-task full sync.

At each wave boundary:
1. resolve required T2 feature semantic gates and T3 checkpoints;
2. run `/mb-sync` once for authoritative already-written state;
3. run lint then `/mb-doctor --strict`;
4. rerun `/review-tasks-plan FT-<NNN>` only for product features whose task
   cards, specs, dependencies, tier, scope, or plan assumptions changed; pure
   status/evidence closure does not trigger it;
5. only after all triggered gates pass, run the next promotion/dependent-
   blocking pass.

Tier policy owns retry eligibility, `failed|blocked` mapping, failed-task
BUG/follow-up evidence, dependent blocking, and failure budgets. A schema-backed
follow-up created through the normal planning owner is considered in the same
run only after its review and readiness gates pass; verifiers do not create it
independently.

If no `ready` task remains:
- preserve any already-recorded specific `HALT_*` state, reason, owner, and
  resume route as required by autonomy policy;
- all work closed -> run final task-plan review coverage and success checks;
- only when every unfinished record is non-runnable solely because its task
  dependencies are unfinished -> record exact dependency evidence and
  `HALT_DEPENDENCY_DEADLOCK`;
- for any other cause, keep the applicable specific halt and its owner/resume
  route.
</required_outputs>

<validation>
Keep existing `max_retries_per_task`, `max_consecutive_failures`,
`max_open_blockers`, configured `max_files_changed_per_task`, and any explicit
token/time/run budgets plus terminal vocabulary from autonomy policy/run status.
Do not claim success unless:
- no task is `ready|in_progress` and no blocking queue work remains;
- every task-linked product feature has latest final `APPROVE`;
- all required functional, T2 feature semantic, T3 task semantic/human, and
  Foundation gates pass;
- latest lint plus `/mb-doctor --strict` pass;
- run protocol matches authoritative JSON records.

Terminal states remain:
`SUCCESS|HALT_BLOCKING_QUESTIONS|HALT_CLARIFICATION_REQUIRED|HALT_REVIEW_REJECT|HALT_FAILURE_BUDGET|HALT_DEPENDENCY_DEADLOCK|HALT_POLICY_VIOLATION|HALT_QUALITY_GATES|HALT_BUDGET_EXCEEDED`.
</validation>

<handoff_contract>
Record terminal state, reason, evidence, unresolved decisions, and exact resume
route in `.protocols/AUTONOMOUS-RUN/status.md`. `/autopilot` does not route back
into PRD/design/task generation except through an explicit halt and named repair
owner.
</handoff_contract>
