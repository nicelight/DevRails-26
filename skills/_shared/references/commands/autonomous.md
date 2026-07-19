---
description: Run the complete unattended DevRails workflow from authoritative product input to a terminal sequential JSON task queue.
status: active
---
# /autonomous - End-to-end unattended run

<objective>
Orchestrate the existing Product/Design, tasking, review, readiness,
implementation, verification, synchronization, and scheduler contracts to one
explicit terminal state. This command owns orchestration, budgets, terminal
state, and scheduler transitions; child skills own their outcomes and local
tactics.
</objective>

<input_contract>
Use when an explicit Product Brief, PRD/delta, or existing clarified project
state authorizes unattended work. Use `/autopilot` instead when the reviewed
JSON queue already exists.

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
- `.protocols/AUTONOMOUS-RUN/status.md` using the existing run-status shape;
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
- Canonical execution is sequential: select, execute, verify, record the
  authoritative lifecycle decision/evidence for one task, then select another.
- `--experimental-parallel` remains opt-in and uses only existing autonomy-policy
  isolation rules. Never infer independence from advisory `touched_files`.
- Queue/task metadata comes only from indexed JSON task records. Preserve task
  schema, IDs, lifecycle `planned|ready|in_progress|blocked|done|failed`, tier,
  waves, Foundation dependencies, and hard runtime scopes.
- Scheduler owns promotion, `ready -> in_progress`, final
  `done|failed|blocked` decisions, dependent block/unblock, queue state, and
  terminal run state. `/execute`, `/verify`, `/red-verify`, and `/mb-sync` keep
  the ownership defined by tier policy.
- Scheduler writes every task closure/failure/blocking decision, status, and
  evidence link to the authoritative `.task.json` before any sync boundary.
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
  `/clarify-feature`, `/spec-design`, `/prd-to-tasks`, or another existing owner).

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
   - `/prd`;
   - `/review-feat-plan` until `APPROVE`, within review budget;
   - `/spec-design --all`;
   - required Foundation route below;
   - `/spec-auto --all`.
3. Foundation when `Foundation Required: true`:
   - `/foundation-to-tasks`;
   - lint plus `/mb-doctor --strict` for the FT-000 queue;
   - execute the FT-000 queue under the same sequential scheduler/tier rules;
   - wave-boundary `/mb-sync`, lint, strict doctor;
   - continue only when the named final gate task is `done`.
   When Foundation is not required, require truthful `not_required` anchors and
   create no FT-000 queue.
4. Product tasking:
   - `/prd-to-tasks --all`;
   - fresh-context `/review-tasks-plan FT-<NNN>` separately for every
     task-linked product feature until `APPROVE`, within review budget;
   - lint plus `/mb-doctor --strict` after the real product queue exists.
5. Scheduler loop below.

### Review repair cycles

Apply one bounded loop independently to the `feature-plan` surface and each
actually reviewed `task-plan:FT-<NNN>` surface. The maximum is exactly `2`
completed `repair -> re-review` cycles per surface.

- The initial review starts at `0` completed cycles and is not a repair attempt.
- A cycle is one repair followed by re-review of the same surface. Increment its
  counter exactly once, after that re-review returns its verdict.
- Keep compact counters only for surfaces actually reviewed in the existing
  `## Review gates` section of `.protocols/AUTONOMOUS-RUN/status.md`; do not add
  a file, template, schema, policy field, or registry.
- `APPROVE` continues the recorded flow. On `REJECT` with fewer than `2`
  completed cycles, run the next repair and re-review for that same surface.
- On `REJECT` after completed cycle `2`, record existing
  `HALT_REVIEW_REJECT`, the latest findings, and the named repair owner. Do not
  enter another automatic repair cycle.
- On resume, read the recorded counter; never reset it. A surface at `2` stays
  exhausted. Operator-directed repair returns to the same review with that
  counter preserved, and only `APPROVE` continues the recorded flow.

Missing/failing lint or doctor uses `HALT_QUALITY_GATES`.

## Sequential scheduler loop

Before every selection pass, reread the JSON index/records and apply a separate
promotion pass: `planned -> ready` only when all dependencies are `done` and no
blocking review, bug, decision, or unresolved semantic concern remains. Write
every promotion/dependent block decision to the affected record.

Select one eligible `ready` task by earliest wave and stable index order. Before
writing `ready -> in_progress`, require the current strict-doctor pass. Then:

1. scheduler writes `ready -> in_progress`;
2. `/execute <TASK_ID>`;
3. `/verify <TASK_ID>` using authoritative `task.tier`;
4. per-task `/red-verify <TASK_ID>` for T3 only (optional for T2);
5. scheduler records final lifecycle decision and evidence in `.task.json`;
6. when the last task of a non-FT-000 feature containing T2 work closes, run
   `/red-verify --feature FT-<ID>` and require the feature-doc
   `SEMANTIC_VERDICT: semantic-pass` before feature completion;
7. continue other eligible tasks in the same wave without ordinary per-task
   full sync.

At the wave boundary:
- resolve every required T2 feature semantic gate and T3 human checkpoint;
- run `/mb-sync` once for already-written authoritative state;
- run lint then `/mb-doctor --strict`;
- rerun `/review-tasks-plan FT-<NNN>` only for product features whose task
  cards, specs, dependencies, tier, scope, or plan assumptions changed during
  execution; status/evidence-only closure does not trigger a new review;
- only after lint, doctor, and any triggered review pass, run the next
  promotion/dependent-blocking pass.

Functional FAIL, semantic-fail, NEEDS-CLARIFICATION, semantic-concern, and
execution blockers follow `## Scheduler Failure Handling` in tier policy. Tier
escalation follows the controlled rebuild route. Any follow-up remains a normal
schema-backed JSON record, joins the same run only after normal planning review
and readiness gates, and is never created independently by `/verify` or
`/red-verify`.

If no eligible task remains:
- preserve any already-recorded specific `HALT_*` state, reason, owner, and
  resume route as required by autonomy policy;
- all queue work closed and success gates pass -> success evaluation;
- only when every unfinished record is non-runnable solely because its task
  dependencies are unfinished -> record exact dependency evidence and
  `HALT_DEPENDENCY_DEADLOCK`;
- missing/invalid tier/schema/ownership rule -> `HALT_POLICY_VIOLATION`;
- incomplete task handoff or readiness gate -> `HALT_QUALITY_GATES`.
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
