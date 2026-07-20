---
description: Run the complete unattended DevRails workflow from authoritative product input to a terminal sequential JSON task queue.
status: active
---
# /autonomous - End-to-end unattended run

<objective>
Orchestrate the existing Product/Design, tasking, review, readiness, and queue
execution contracts to one explicit end-to-end terminal state. This command
owns Product/Design phase sequencing, review budgets, and the outer run result.
It owns the bounded FT-000 Foundation execution phase, then delegates the
prepared product task scheduler and queue recovery to canonical `/autopilot`;
every child skill owns its outcome and local tactics.
</objective>

<input_contract>
Use when an explicit Product Brief, PRD/delta, or existing clarified project
state authorizes unattended work. Use `/autopilot` instead when the reviewed
product JSON queue already exists and the Foundation gate is already closed or
truthfully `not_required`.

Preflight:
- `.memory-bank/` exists, otherwise route `/mb-init`;
- authoritative PRD/brief/delta input exists;
- `.memory-bank/workflows/{autonomy-policy,tier-policy,execute-loop,mb-sync}.md`
  exist;
- at least one configured executor is available;
- repository safety policy permits code edits but no unapproved marketplace
  install, deployment, production write, secret read, or out-of-repo
  infrastructure change.

If a required workflow is missing, halt before creating/reusing the run
protocol or making any other durable write with `HALT_POLICY_VIOLATION`. Name
every missing path in the reason. The repair owner is the external DevRails
installer: from an available DevRails checkout run
`node scripts/install-framework.mjs --bootstrap --target <project-path> --yes --sync`,
then resume `/autonomous`. Do not copy missing workflow rules inline.

If substantial code already exists, require/update the brownfield baseline via
`/map-codebase` before applying the PRD delta.

Create/reuse:
- `.protocols/AUTONOMOUS-RUN/plan.md`;
- `.protocols/AUTONOMOUS-RUN/status.md` using the durable run checkpoint
  contract in `.memory-bank/workflows/autonomy-policy.md`;
- `.protocols/AUTONOMOUS-RUN/decision-log.md`;
- `.tasks/TASK-AUTONOMOUS/`.

Record run metadata, scheduler mode, review coverage, blocking decisions,
applied authoritative policies, queue summary linked to JSON records, failure
budget, and terminal state/reason. The run protocol is resumable orchestration
state, not a second task registry.
</input_contract>

<hard_invariants>
- Follow `.memory-bank/workflows/autonomy-policy.md`,
  `.memory-bank/workflows/tier-policy.md`,
  `.memory-bank/workflows/execute-loop.md`, and
  `.memory-bank/workflows/mb-sync.md`.
- Canonical queue execution is sequential.
- `--experimental-parallel` remains opt-in and uses only existing autonomy-policy
  isolation rules. Never infer independence from advisory `touched_files`.
- Queue/task metadata comes only from indexed JSON task records. Preserve task
  schema, IDs, lifecycle `planned|ready|in_progress|blocked|done|failed`, tier,
  waves, Foundation dependencies, and hard runtime scopes.
- During the Foundation phase, `/autonomous` owns promotion, selection, and
  final lifecycle decisions only for indexed `feature: "FT-000"` records. After
  the Foundation gate is `done`, `/autopilot` owns those scheduler decisions
  only for product records. `/exe` owns `ready -> in_progress` for the concrete
  task selected by either scheduler. Neither phase may adopt or mutate the other
  phase's tasks.
- `/autonomous` must not restage `/autopilot`'s product-queue algorithm or
  reinterpret its task transitions. `/exe`, `/verify`, `/red-verify`, and
  `/mb-sync` keep the ownership defined by tier policy.
- The active scheduler writes every task closure/failure/blocking decision,
  status, and evidence link to the authoritative `.task.json` before any sync
  boundary.
- `/mb-sync` reconciles already-written state once per wave unless an explicit
  current-wave durable-state dependency requires an early sync; it never
  chooses closure or promotion.
- Required reviews, lint, doctor, T2 feature semantic gate, T3 task semantic
  gate, and exact T3 human checkpoint are not bypassed.
- Preserve failure budgets and all existing terminal states; do not add a
  scheduler, status, lifecycle, or assumption registry.
</hard_invariants>

<operator_decisions>
Unattended mode never answers a material operator branch. It may apply only a
decision already fixed by Constitution, clarified PRD, accepted operator
policy/decision, production baseline, ADR, canonical spec, task card, or other
authoritative evidence.

When any child skill or scheduler step finds an unresolved product/design/
contract/state/data/storage/security/compatibility/task-boundary/tier/
dependency/verification/Foundation/human-checkpoint branch:
- record the exact question, affected scope/tasks, current evidence, and owner
  in the existing run status/decision log and owning blocker artifact;
- do not treat recommendation, framework preference, reversible default,
  silence, or a low-risk guess as acceptance;
- stop before affected writes or promotion with
  `HALT_CLARIFICATION_REQUIRED` for product/feature clarification or
  `HALT_BLOCKING_QUESTIONS` for design/contract/operator decisions;
- name the exact interactive resume skill (`/constitution`, `/write-prd`,
  `/feature-doctor`, `/spec-design`, `/feature-to-tasks`, or another existing owner).

After the operator answer is durably applied by the owning skill and its gates
pass, resume from the recorded boundary without replaying completed work.
Implementation tactics already inside authoritative scope remain agent choices,
not operator branches.
</operator_decisions>

<agent_discretion>
The orchestrator chooses efficient local tooling, context refreshes, and retry
tactics within budgets. It does not restage child-skill algorithms. Each child
skill chooses its own evidence-grounded local tactics within its input/output
contract.
</agent_discretion>

<required_outputs>
## Contract sequence

Run the canonical gates in this order, skipping a child only when its own input
contract proves it already complete:

1. Pre-queue health: `node scripts/mb-lint.mjs`, then plain `/mb-doctor`.
   Strict doctor is not used before a real executable queue.
2. Product/design:
   - if the input names tools/skills/CLIs, run `/find-skills`, auto-use only
     already installed project skills, and record missing ones as recommendations
     without installing them;
   - inspect Constitution: use `ratified|partial` principles or an explicitly
     accepted `skipped|framework-default` decision; otherwise do not start an
     unattended Constitution interview and let the owning Product/Design gate
     halt on the unresolved governance decision;
   - `/write-prd` when PRD is not complete/current;
   - `/spec-auto --init`;
   - `/prd-to-features`;
   - `/review-feat-plan` until `APPROVE`, within review budget;
   - `/spec-design --all`;
   - required Foundation route below;
   - `/spec-auto --all`.
3. Foundation when `Foundation Required: true`:
   - `/foundation-to-tasks`;
   - lint plus `/mb-doctor --strict` for the FT-000 queue;
   - execute the bounded FT-000 phase under `## Foundation execution and
     resume` below; do not invoke `/autopilot` and do not select or mutate a
     product task;
   - continue only when every required FT-000 task, including the named final
     gate task, is `done` and the post-boundary gates pass.
   When Foundation is not required, require truthful `not_required` anchors and
   create no FT-000 queue.
4. Product tasking:
   - `/feature-to-tasks --all`;
   - fresh-context `/review-tasks-plan FT-<NNN>` separately for every
     task-linked product feature until `APPROVE`, within review budget;
   - lint plus `/mb-doctor --strict` after the real product queue exists.
5. Delegate the strict-ready product queue to default full-queue `/autopilot`.

### Review repair cycles

Apply one bounded loop independently to the `feature-plan` surface and each
actually reviewed `task-plan:FT-<NNN>` surface. The maximum is exactly `5`
completed `repair -> re-review` cycles per surface.

- The initial review starts at `0` completed cycles and is not a repair attempt.
- A cycle is one repair followed by re-review of the same surface. Increment its
  counter exactly once, after that re-review returns its verdict.
- Keep compact counters only for surfaces actually reviewed in the existing
  `## Review gates` section of `.protocols/AUTONOMOUS-RUN/status.md`; do not add
  a file, template, schema, policy field, or registry.
- `APPROVE` continues the recorded flow. On `REJECT` with fewer than `5`
  completed cycles, run the next repair and re-review for that same surface.
- On `REJECT` after completed cycle `5`, record existing
  `HALT_REVIEW_REJECT`, the latest findings, and the named repair owner. Do not
  enter another automatic repair cycle.
- On resume, read the recorded counter; never reset it. A surface at `5` stays
  exhausted. Operator-directed repair returns to the same review with that
  counter preserved, and only `APPROVE` continues the recorded flow.

Missing/failing lint or doctor uses `HALT_QUALITY_GATES`.

## Foundation execution and resume

`/autonomous` directly owns only indexed FT-000 records in this phase. Follow
`/foundation-to-tasks`, tier policy, autonomy policy, and the existing
`/mb-sync` boundary; never invoke `/autopilot` or mutate a product task.

Before new work, reconcile every FT-000 `in_progress` task from its
authoritative record and current-attempt protocol/handoff/verdict. Resume the
first incomplete required child action without replaying a possibly completed
unsafe side effect; ambiguity or conflicting product-task ownership uses the
existing exact halt contract.

With no unresolved FT-000 task and a current strict-doctor pass, execute the
remaining FT-000 dependency order sequentially under tier policy until the
named final gate is `done`. Before each selected task, record exact next action
`/exe <TASK_ID>` in the existing outer run plan/status; `/exe` prepares the tier
protocol and writes `ready -> in_progress`. Foundation resume uses that outer
run state plus task protocols; the `/autopilot` checkpoint remains inactive and
outer `STATE` remains `RUNNING` until product handoff.

## Product scheduler delegation and resume

After the Foundation gate is `done`, delegate the reviewed, strict-ready product
queue to installed `/autopilot`, the only detailed product scheduler. Reuse the
existing run state and durable evidence without resetting counters, attempts,
or blockers. Initialize `/autopilot`'s checkpoint only at this handoff; do not
add Product/Design/Foundation values to its stage vocabulary.

Any `/autopilot` `HALT_*` stops `/autonomous` with the same state, reason,
evidence, owner, and exact resume route. Do not replace it with a generic halt.
Product-queue `SUCCESS` proceeds to the final end-to-end validation below.
</required_outputs>

<validation>
Respect these existing budgets from autonomy policy/run plan:
- `max_retries_per_task`;
- `max_consecutive_failures`;
- `max_open_blockers`;
- `max_files_changed_per_task` when configured in the run plan;
- any explicit file, token, time, or run budget.

Use `HALT_FAILURE_BUDGET` or `HALT_BUDGET_EXCEEDED` when exceeded.

`SUCCESS` requires:
- no `ready|in_progress` tasks and no unresolved blocking work;
- required REQ/AC lifecycle verified;
- every completed T2 feature has feature-level semantic-pass;
- every T3 closure has functional PASS, task semantic-pass, and exact human
  checkpoint;
- every task-linked product feature has latest task-plan `APPROVE`;
- latest lint and `/mb-doctor --strict` pass;
- run protocol and authoritative task records agree.

Allowed terminal states remain exactly:
- `SUCCESS`;
- `HALT_BLOCKING_QUESTIONS`;
- `HALT_CLARIFICATION_REQUIRED`;
- `HALT_REVIEW_REJECT`;
- `HALT_FAILURE_BUDGET`;
- `HALT_DEPENDENCY_DEADLOCK`;
- `HALT_POLICY_VIOLATION`;
- `HALT_QUALITY_GATES`;
- `HALT_BUDGET_EXCEEDED`.
</validation>

<handoff_contract>
Write the terminal state, reason, evidence paths, unresolved operator questions,
and exact resume command to `.protocols/AUTONOMOUS-RUN/status.md`. On success,
report the closed queue and final gate evidence; on halt, do not claim partial
coverage as completion.
</handoff_contract>
