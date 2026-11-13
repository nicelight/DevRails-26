---
description: Add useful checks within one existing task's agreed outcome.
status: active
---
# /add-tests - Improve task-scoped coverage

<objective>
Add the smallest useful tests for an existing task and record their results.
Tests support its outcome; they do not create a separate workflow.
</objective>

<input_contract>
Resolve the selected task and read relevant outcome/specs, implementation,
constraints, and test configuration. Apply
`.memory-bank/workflows/execute-loop.md#working-policy` and tier policy.
Implementation work belongs to an active task; its owner applies `/exe`'s
task-start rules in the same flow before test writes when it has not started.
</input_contract>

<execution>
Choose test level, fixtures, tools, and depth for the behavior and regression
risk. Prefer an existing meaningful check over decorative coverage. Do not
weaken assertions to manufacture success or introduce unresolved product
requirements through a test. New substantive choices follow Working policy.

Advisory `touched_files` does not exclude necessary test files; explicit hard
boundaries and permissions still apply. Shared test specifications may be
updated within an authorized assignment, without a mandatory skill roundtrip.
</execution>

<required_outputs>
Record actual test changes, commands/results, limitations, and useful evidence
links in the existing task `verify` or its active protocol. A failing test is
an observation, not by itself a final task failure decision. No new testing
record, full protocol, or report is required merely for this command.
</required_outputs>

<handoff_contract>
Return the result to the task owner. Further implementation/checking can continue
in the same authorized flow. The scheduler or top-level owner retains closure.
</handoff_contract>
