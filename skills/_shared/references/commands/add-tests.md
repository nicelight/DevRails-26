---
description: Add the cheapest sufficient regression coverage inside one existing in-progress indexed task.
status: active
---
# /add-tests - Improve task-scoped coverage

<objective>
Add useful tests that prove the selected task outcome and catch meaningful
regressions without widening its product/spec boundary or creating a testing
workflow of its own.
</objective>

<input_contract>
Require one explicit `TASK-NNN-TN-FT-NNN-WN` that:
- resolves uniquely through `.memory-bank/tasks/index.json`;
- has `status: in_progress`;
- has an outcome/AC/REQ/spec boundary covering the proposed test behavior.

Read the task record, `.memory-bank/workflows/tier-policy.md`, applicable linked
specs/verification targets, implementation evidence, and project-native test
configuration needed for the chosen check.
</input_contract>

<hard_invariants>
- Reuse the existing task ID, lifecycle, tier, protocol, and evidence paths.
  Do not create synthetic testing tasks, a second lifecycle, or new task fields.
- Test files outside advisory `touched_files` are allowed only for the same
  outcome and inside hard allowed/forbidden scopes; record the deviation.
- Do not weaken assertions, disable failures, introduce decorative tests, or
  substitute screenshots for behavior proof.
- Do not create or modify `.memory-bank/testing/`; durable testing specs route
  through `/spec-design`, `/foundation-to-tasks`, or `/feature-to-tasks`.
- `/add-tests` does not own task closure or scheduler transitions.
</hard_invariants>

<operator_decisions>
If useful coverage requires a new product behavior, contract, state/data,
security/compatibility rule, task-boundary/tier change, external dependency, or
verification-policy choice not already settled, stop and surface the exact
decision.

Interactive flow asks the operator and resumes only after the owning
feature/spec/task plan is durably repaired. Unattended flow returns the blocker
to the scheduler without choosing and names `/feature-to-tasks FT-<NNN>`,
`/spec-design`, or `/feature-doctor FT-<NNN>` as the applicable resume route.
A recommendation is not an accepted decision.
</operator_decisions>

<agent_discretion>
The agent chooses exploration order, tools, test level, test shape, fixtures,
and proportional flakiness checks. Select the narrowest credible proof: a unit,
integration/contract, e2e, or existing project-native check according to the
actual behavior and regression risk. No requirement exists to fill every test
category or put browser/e2e first.
</agent_discretion>

<required_outputs>
- scoped test changes;
- exact commands/results and substantive artifacts in the existing task's
  tier-selected paths:
  - T0/T1 -> `.protocols/<TASK_ID>/run.md`;
  - T2/T3 -> full protocol state plus `.tasks/<TASK_ID>/` evidence;
- recorded actual test files, advisory deviations, hard-scope compliance,
  flakiness evidence when relevant, and remaining blockers.
</required_outputs>

<validation>
Confirm the added tests fail for the meaningful regression they target when
practical, pass against the implementation, prove the task-scoped outcome, and
do not authorize or encode an unresolved product/design decision.
</validation>

<handoff_contract>
Return immediately to `/exe`, `/verify`, the scheduler, or the explicit task
owner under `.memory-bank/workflows/tier-policy.md`. Out-of-scope coverage routes
to normal `/feature-to-tasks FT-<NNN>` planning instead of being smuggled into the
current task.
</handoff_contract>
