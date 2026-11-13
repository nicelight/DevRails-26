---
description: Complete one indexed task with proportionate checks and durable results.
status: active
---
# /exe - Execute one TASK

<objective>
Implement one selected `TASK-NNN-TN-FT-NNN-WN`, check its agreed outcome, and
leave enough durable state to close it or continue. The main flow remains
intent/requirements -> features/design -> tasks -> implementation/checks -> memory;
completed preparation can be reused and adjacent stages combined.
</objective>

<input_contract>
Resolve the selected task through `.memory-bank/tasks/index.json`. Read its
outcome, relevant feature/REQ/spec links, dependencies, explicit constraints,
and current evidence. Use
`.memory-bank/workflows/execute-loop.md#working-policy` and
`.memory-bank/workflows/tier-policy.md` for decisions, scope, and closure.

A real missing prerequisite, contradictory outcome, or missing authority needs
resolution before affected work. Missing review approval, Planning Revision,
formal handoff, or optional protocol is not itself a blocker. Reconcile relevant
outdated planning with the actual assignment in the same flow when authorized.
</input_contract>

<execution>
For runnable `planned` work, record `ready`, then `in_progress` before changing
implementation. `/exe` owns task start in both manual and scheduler flow.
For `in_progress`, compare actual work and existing evidence before resuming.
For `done_for_prod`, execute only the requested production-acceptance remainder.
Do not replay completed work or an ambiguously completed unsafe effect.
Reopening `done|failed|blocked` requires an authorized decision and a resolved
reason, not a silent reset.

Use the smallest sufficient implementation and useful project-native checks.
`touched_files` guides discovery; it is not a file allow-list. Respect deliberate
hard boundaries, actual dependencies, accepted requirements, and user changes.
Update affected specifications and task context when an authorized decision
changes them. In manual flow consult on substantive new choices; under explicit
autonomy decide within scope. Already accepted choices need no repeat approval.

TDD, separate verification, semantic review, and delegation are useful options,
not tier-imposed steps. A known failing check or unachieved outcome is material;
missing ceremony is not. Do not fabricate RED, PASS, or evidence. A requested
check omission is recorded as an omission with its effect on confidence.
</execution>

<required_outputs>
Keep the indexed card current. Append a concise `verify` entry with actual
changes/outcome, checks and results or explicit omissions, useful evidence links,
and remaining work/blocker when any. Planned `verification_targets` and
`evidence_required` are not observations. Keep meaningful criterion/result
comparisons, especially for non-functional outcomes.

Use `.protocols/<TASK_ID>/run.md`, the full protocol, and `.tasks/<TASK_ID>/`
only when useful for recovery or substantial evidence. Retain existing useful
attempt/progress state. For a retry, identify the correction and current attempt
without duplicating the whole history. Test-result reuse is allowed when the
result still applies to unchanged relevant inputs; rerun when that is cheaper
or uncertain. A self-reported result is not independent verification.
</required_outputs>

<handoff_contract>
In manual flow, the top-level owner may close any tier after the agreed result
and sufficient evidence or explicitly accepted verification limitations are
recorded. Use `done_for_prod` only for a recorded production remainder.
A narrower assignment ends at its requested result.

In scheduler flow, return the result and evidence to the scheduler for its final
lifecycle decision. Recommend `/verify`, `/red-verify`, `/debug`, or planning
help only when it would resolve a real remaining need; no mandatory command
roundtrip is required. Report the next useful action if work remains.
</handoff_contract>
