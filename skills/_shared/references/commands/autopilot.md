---
description: Execute an existing product task queue autonomously with resumable state.
status: active
---
# /autopilot - Run an existing product JSON task queue

<objective>
Complete the authorized product queue: select a runnable task, implement/check
its outcome, record the result, and continue. This command does not invent the
initial PRD, features, or queue. FT-000 remains Foundation work owned by
`/autonomous`.
</objective>

<input_contract>
Read `.memory-bank/tasks/index.json`, resolving task cards, relevant project
intent/specs, and existing run state. Apply
`.memory-bank/workflows/execute-loop.md#working-policy`,
`.memory-bank/workflows/tier-policy.md`, and
`.memory-bank/workflows/autonomy-policy.md`.

Keep schema, ID/tier/feature/wave consistency, and actual dependencies intact.
No formal APPROVE, positive Planning Revision, strict doctor result, or separate
reviewer is required merely to begin. Assess any known finding for its actual
effect on the selected outcome. Repair bounded preparation gaps within delegated
authority; pause affected work for missing prerequisites or authority.

Tasks whose title starts `Production acceptance:` stay outside development
selection and completion checks until explicitly requested after deployment.
`done_for_prod` closes development dependencies while retaining the production
remainder. Do not use a past `verify` entry to invent a new queue item.
</input_contract>

<execution>
Use sequential execution by default. Existing `--experimental-parallel` follows
its isolation rules; it is optional. Select runnable product tasks by earliest
wave and stable index order. `depends_on` outcomes must be `done|done_for_prod`;
Foundation dependencies are real prerequisites, not ceremonial approvals.

Apply the installed `/exe` instructions for a selected task in the current or a
delegated context. `/exe` records its start. Choose sufficient checks and use
`/verify`, `/red-verify`, `/debug`, or other focused help when useful. A chain of
separate commands, fresh contexts, co-reviewers, or full protocols is optional.
The scheduler records final task state and evidence in its card, then proceeds.

Keep affected intent/specs/tasks and result memory consistent when autonomous
decisions change them. Actual unmet outcomes remain open or failed; permitted
check omissions remain explicit. Review results inform judgment rather than
constituting a separate permission system. The scheduler cannot override user
constraints or grant itself external permissions.

At a wave boundary, reconcile changed memory and assess integration/results.
`/mb-sync` is useful when broader indexes or traceability need reconciliation;
local updates can happen directly. Doctor, re-review, semantic review, and
`/tech-debt` are optional aids chosen for evidence needs, not fixed boundary
ceremonies. Wave completion does not erase unfinished feature outcomes.
</execution>

<recovery>
Keep `.protocols/AUTONOMOUS-RUN/status.md` with current task/stage, last durable
result, next action, relevant counters, and run state. Retain the existing stage
vocabulary: `selection|execute|verify|red-verify|diagnose|closure|wave-boundary`.
Unused optional stages need no placeholder or visit.

On resume, reconcile the checkpoint and `in_progress` work against task records,
actual changes, and evidence before selecting another task. Continue the first
unfinished useful action; do not blindly repeat a recorded command. If a
previous optional step is no longer needed, record that decision and its basis
without inventing a passed verdict. A possibly completed unsafe effect whose
state is unknown stops affected replay.

Use autonomy policy's retry limits and failure dispositions. A failed attempt
counts once; diagnosis or resume does not add a retry. Preserve counters across
sessions. Keep dependents non-runnable while their prerequisite is blocked or
failed. `/debug` can help when the cause is unclear; no mandatory triage route is
needed for an obvious authorized correction.
</recovery>

<required_outputs>
Record closure/failure/blocking and concise evidence in each task card before
relying on it. Keep the run checkpoint linked to those records. Optional reports
should add useful information rather than repeat the same state.

`SUCCESS` means all agreed development outcomes are complete, actual blockers
are resolved, accepted checking limitations are explicit, and durable memory
matches the work. It does not claim production acceptance or unperformed checks.
Otherwise use the existing autonomy-policy `HALT_*` state matching the cause;
dependency deadlock is only for genuine dependency-only exhaustion.
</required_outputs>

<handoff_contract>
Report completed scope, verification and limitations, remaining work/questions,
and the next useful action. A halt preserves partial progress and its exact
resume context; it does not force a particular repair-command sequence.
</handoff_contract>
