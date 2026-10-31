---
description: Add the cheapest sufficient regression coverage inside one existing in-progress indexed task.
status: active
---
# /add-tests - Improve task-scoped coverage

Apply `.memory-bank/workflows/autonomy-policy.md` for DSH runtime ownership,
effective settings, the required compact structured flow feedback, decisions,
and recovery; subject results remain separate from that feedback.

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

Read the task record, `.memory-bank/workflows/tier-policy.md#tier-obligations`,
`#closure-authority`, `#hard-write-boundary` when applicable, linked
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
- Do not create or modify `.memory-bank/testing/`; accepted shared testing-spec
  changes route through `/spec-redesign`, Foundation detail through
  `/foundation-to-tasks`, and feature detail through `/feature-to-tasks`.
- `/add-tests` does not own task closure or scheduler transitions.
</hard_invariants>

<operator_decisions>
New product, contract, state/data, security/compatibility, scope/tier, external
dependency or verification-policy choices use the common decision flow. Name
scope/evidence and the applicable `/feature-to-tasks`, `/spec-redesign` or
product owner; do not encode an unresolved choice into a regression test.
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
- actual commands/results in existing task evidence; selected protocol/artifacts
  only, without requiring a full bundle or enabling unrelated checks;
- recorded actual test files, advisory deviations, hard-scope compliance,
  flakiness evidence when relevant, and remaining blockers.
</required_outputs>

<validation>
When test execution is selected or explicitly requested, confirm the added tests fail for the meaningful regression they target when
practical, pass against the implementation, prove the task-scoped outcome, and
do not authorize or encode an unresolved product/design decision. When execution
is off, state that the tests were added but not run; no PASS is inferred.
</validation>

<handoff_contract>
Return immediately to `/exe`, `/verify`, the scheduler, or the explicit task
owner under `.memory-bank/workflows/tier-policy.md#closure-authority`.
Out-of-scope coverage routes to normal `/feature-to-tasks FT-<NNN>` planning
instead of being smuggled into the current task.
</handoff_contract>
