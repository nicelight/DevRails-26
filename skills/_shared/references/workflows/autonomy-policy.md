---
description: Shared DSH execution, decision, evidence, and recovery boundaries.
status: active
---
# Runtime and autonomy policy

## Runtime ownership

All models, subagents, tools, and sessions use DSH. Effective settings determine
available participants, models, reasoning, checks, and reports. A model name
never selects an external agent CLI or Codex App Server.

Settings changes, including enablement, apply to the next launch of the affected
operation or participant within the current workflow. Each launch retains its
own settings; starting one participant does not freeze unstarted participants.
Embedded local checks share the active `/exe` launch settings. Future `/verify`
participants and `/red-verify` remain configurable while `/exe` runs. Changing
unstarted work requires no new attempt, workflow restart, repeated `/exe`, or
separate approval; existing non-negotiables and negative-result dispositions
still apply. Started, completed, skipped, or interrupted work is not rewritten.

The host owns queue selection, dependency scheduling, launches, lifecycle writes,
check/skip recording, budgets, and recovery sequencing. Models perform the
assigned subject work and return outcomes, evidence, and semantic decisions;
they do not implement a scheduler in conversation or write lifecycle transitions.
Role names describe assignments, not immutable personas or model requirements.

## Decision flow

Return the shared compact structured flow feedback at the operation boundary:
the result is ready for ordinary continuation, or continuation needs a decision
with a concise reason. This is the required common semantic interface; exact
fields and transport are deferred to runtime architecture. Keep the subject
result/verdict separate. A full report is not required, and feedback is not due
after each tool call. Supply situation-specific clarification only when needed.

Every nonstandard branch, repair route, and consultation on the main path uses
this decision flow. In ordinary mode, the main path waits for the user's answer
or green approval of the concrete proposal. A recommendation, silence, Side Chat,
or a branch described in a skill is not approval. Green approves a proposal;
it does not provide missing facts. Reuse an already accepted decision within
its scope without asking again.

Under the autonomous decision policy, the model makes the semantic decision
and records its provenance as autonomous, not as a user answer. This policy
applies throughout the Nav run, including handoff from `/autonomous` to
`/autopilot`; command phase ownership does not reset the decision policy. Explicit user requirements and
accepted constraints still govern. Manual red, Pause, Stop, DSH permissions,
and real operation restrictions remain effective; autonomous cannot release them.
Missing external facts remain unknown, even when the model can choose a route.

Record material decisions at their existing canonical owner, with the reason,
affected scope, and next owner when needed for continuation. Keep independent
work within its authorization. Do not reopen settled choices without material
new evidence or expand scope through a review finding alone.

## Conditional checks and artifacts

Run only checks and participants selected by effective settings or explicitly
requested for the operation. Disabled reviews, Architect, Judge, and verification
participants require no launch, verdict, or report. If all verify participants
are off, verification is `skipped`, never `PASS`; implemented work can close
without verification, explicitly recording that absence. `done` is not evidence
of verified acceptance. `skipped` describes an operation, not a new task status.

A performed check retains its actual verdict, including FAIL/REJECT. Disabling
later work does not erase findings or convert failure to skipped. Repair or
continuation after a negative result uses the decision flow. Reports/protocols
are conditional; retain sufficient decisions, actual outcomes, skipped work,
remaining work, and immediate handoff for recovery without an obligatory file set.
An explicit project non-negotiable is not a framework default: an incompatible
setting requires resolution at its owner rather than silent bypass.

## Durable run checkpoint

Memory Bank and indexed task records retain project/task identity and enough
state to continue without chat history. Host recovery reconciles recorded
position with actual work, partial effects, outcomes, and enabled operations.
A stale checkpoint cannot override a task or observed result. Resume the first
actually unfinished selected operation; do not replay completed implementation,
verification, or reports because a session was lost. A skipped check is not
unfinished work and is not automatically enabled on recovery.

Preserve specific blockers with evidence, owner, and resume route. Distinguish
missing decisions, failed work, blocked dependencies, and genuine dependency
exhaustion. Do not replace every halt with deadlock. Reconcile stranded work
before new selection; do not repeat ambiguous unsafe or non-idempotent effects.

## Phase boundaries

`/autonomous` covers Product/Design and applicable Foundation work; `/autopilot`
consumes the prepared product queue. FT-000 remains the reserved Foundation
pseudo-feature in the ordinary task registry. A Foundation extension during
product execution needs a decision to return to its owner, preserving product
state. No second queue, task model, or lifecycle is introduced.

## Scheduler Failure Handling

A same-task correction preserves accepted identity, outcome, scope, tier,
dependencies, and hard boundaries. Changed task meaning returns to planning.
Unclear cause may justify `/debug`; diagnosis does not create an execution
attempt or extend the configured budget. The host counts completed unsuccessful
attempts, not findings, resumed work, or clarification requests. Budget exhaustion
and unsafe retry require an evidence-based disposition, not a hidden extra try.

Existing task statuses remain `planned|ready|in_progress|blocked|done|done_for_prod|failed`.
`done_for_prod` means development work is complete with production acceptance
still outstanding; it is not permission for production actions or a production
verdict. Keep run terminal reasons distinct from task lifecycle and check verdicts.

## Experimental parallel execution

Sequential execution is the baseline. Concurrent mutations require explicit
opt-in, isolated worktrees/sandboxes and deliberately hard, pairwise-disjoint
`runtime_context.write_boundary` under `tier-policy.md#hard-write-boundary`.
`touched_files` never proves independence. Unproved isolation, shared governing
state, package/lock/CI/global configuration, or T3 work remains sequential.
The host owns concurrency; models report conflicts rather than schedule around them.
