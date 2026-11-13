---
description: Authority, recovery, dependencies, and bounded unattended execution.
status: active
---
# Autonomy policy

## Default mode

Apply [Working policy](execute-loop.md#working-policy). Manual work consults the
operator on substantive decisions. `/autonomous`, `/autopilot`, or an explicit
autonomy instruction delegates decisions within the assigned goal and limits;
it does not authorize unrelated work or new external permissions. Sequential
execution is the simple default.

## Phase ownership

`/autonomous` owns Product/Design preparation and FT-000 Foundation execution.
`/autopilot` executes an existing product queue and does not mutate FT-000.
A missing Foundation prerequisite returns to its owner; an absent ceremonial
approval does not. `/exe` records the selected task's start, while the active
scheduler owns final task states and the run result.

## Experimental parallel execution

Keep parallel execution opt-in through existing `--experimental-parallel`.
Use isolated worktrees/sandboxes and deliberately disjoint hard
`runtime_context.write_boundary` paths. Advisory `touched_files` does not prove
independence. Shared/governing state and T3 work remain sequential. If isolation
or safe recovery is unclear, use sequential execution without a new blocker.

## Durable run checkpoint

Use `.protocols/AUTONOMOUS-RUN/status.md` for current task, stage, last durable
result, next action, budget counters, and run result. Link authoritative task
records rather than copying the queue. Update it at meaningful handoffs so a
new session can find unfinished work.

The product scheduler retains stages
`selection|execute|verify|red-verify|diagnose|closure|wave-boundary`.
Product/Design/Foundation progress can remain in the existing run plan/status;
do not invent scheduler stages for it. A protocol file is a recovery aid, not
proof that its action occurred.

On resume, compare checkpoint, task state, actual work, and evidence. Resume the
unfinished action; do not replay completed effects or discard an unfinished
check/closure merely because no task is `in_progress`. If a possibly completed
unsafe effect cannot be reconciled, stop affected work for clarification.

## Hard-stop categories

Stop for missing authority, an unresolved decision outside delegated scope, or
an actual prerequisite that prevents the result. Security, production,
destructive changes, secrets, and external systems require particular attention
to the permissions already granted; their mere presence is not a new approval
ceremony when the operator already authorized the action.

## Operator decisions and local tactics

Within delegated autonomy, choose the simplest sufficient product/technical/
process route consistent with the goal and explicit constraints. Update affected
canonical memory when a decision changes it. Keep material decisions and reasons
briefly in existing task/run state. Do not infer autonomy from silence.

Outside that authority, preserve safe partial work, record the exact question,
and pause dependent work. Already settled decisions need no repeat interview.
Normal implementation tactics and optional workflow selection remain bounded by
the active assignment and Working policy.

## Required gates

A task needs a resolvable card, satisfied actual dependencies, adequate context,
and authority to act. Existing project/user-required checks remain applicable
unless changed by the authorized owner. Choose useful verification for the
outcome; document unavailable or intentionally omitted checks honestly.

Planning revision, independent APPROVE, fresh contexts, strict doctor, full
protocols, RED/GREEN, and semantic review are not universal execution gates.
Doctor/review findings are evidence to assess: repair a real prerequisite or
material defect, without stopping solely for absent ceremony.

## Failure budgets

Retain the existing default bounds: two retries after the first unsuccessful
attempt, three consecutive failures, and three open blockers. Honor explicit
run/file/token/time budgets. Record counters in existing run state; do not reset
them on resume. Budget changes require the relevant operator authority.

## Scheduler Failure Handling

A completed failed execution/verification attempt counts once. Resume,
diagnosis, missing evidence, and clarification do not add attempts. Retry only
when there is an evidence-backed correction within authority and safe replay.
Keep the task `in_progress` while retrying, retain useful prior evidence, and
record the new attempt/correction briefly.

Use `/debug` when diagnosis would help; no mandatory diagnostic or triage route
is needed for an obvious correction. After the third unsuccessful attempt,
stop automatic retries. A proven upstream/authority gap is `blocked`; a
remaining task-local failure is `failed`. Record cause, evidence, and a useful
next action in existing task/run state. A bug/follow-up is useful when work must
be tracked separately, not merely to satisfy a report requirement.

Keep dependents of `failed|blocked` work non-runnable and record their actual
blocker before another selection. Never promote a task through an unresolved
prerequisite. Verification concerns require assessment, not automatic success.
Exceeding the run's failure bound yields `HALT_FAILURE_BUDGET`.

## Terminal fallback

Preserve a specific recorded halt with its reason and next action.
`HALT_DEPENDENCY_DEADLOCK` is for genuine dependency-only exhaustion, not a
replacement for missing authority or other diagnosed blockers.

## Run state

`STATE: RUNNING` means authorized work remains. Foundation completion is not
end-to-end success. `done_for_prod` is terminal for development scheduling when
only recorded production acceptance remains.

## Terminal states

Retain `SUCCESS`, `HALT_BLOCKING_QUESTIONS`, `HALT_CLARIFICATION_REQUIRED`,
`HALT_REVIEW_REJECT`, `HALT_FAILURE_BUDGET`, `HALT_DEPENDENCY_DEADLOCK`,
`HALT_POLICY_VIOLATION`, `HALT_QUALITY_GATES`, and `HALT_BUDGET_EXCEEDED`.
Choose the state matching the actual cause. Report completed scope, limitations,
unresolved questions, and a concrete next action; a halt does not erase progress.
