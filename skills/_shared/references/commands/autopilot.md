---
description: Assess and support execution of an existing product task queue under host scheduling.
status: active
---
# /autopilot — Existing product queue

Apply `.memory-bank/workflows/autonomy-policy.md` for DSH runtime ownership,
effective settings, the required compact structured flow feedback, decisions,
and recovery; subject results remain separate from that feedback.

<objective>
Bring the prepared product queue to its actual completion or a specific halt.
The host owns scheduling, launches, promotion, task lifecycle, configured
budgets and recovery. Models perform assigned execution/review and semantic
route or disposition decisions. Product work excludes `FT-000`.
</objective>

<input_contract>
Use indexed schema-valid JSON tasks and the deployed tier-policy, execute-loop,
autonomy-policy and mb-sync workflows. Resolve task identity, dependencies,
accepted product scope, Foundation work actually needed, and selected settings.
A missing required runtime reference needs coherent installer sync; do not
invent a local substitute. A missing queue needs the planning owner.

Design, task-plan review, lint and doctor readiness apply when selected, not as
implicit gates. A disabled design needs no positive Planning Revision; enabled
review binds the existing revision when recorded. Preserve reconciliation
markers, actual negative findings and genuine authority gaps. An optional
Foundation proof gate is not invented; existing accepted baseline dependencies
remain. Foundation additions require a decision to return to their owner while
preserving product work. `/autopilot` does not execute FT-000.
</input_contract>

<semantic_work>
Assess the concrete task or boundary assigned by the host, using
`.memory-bank/workflows/execute-loop.md`. Models do not implement selection,
retry counting, stage transitions, child launch loops or session management.
Sequential mutation is the baseline; opt-in concurrency follows autonomy-policy
isolation and hard-boundary rules, never advisory touched_files.

A same-task repair keeps identity, tier, outcome, scope and dependency meaning.
Changed meaning goes to the first planning/design owner through the common
decision flow. Actual FAIL/REJECT/semantic-fail remains evidence; propose repair
or continuation with reason and provenance, never failure-to-skip conversion.
Unclear cause may justify `/debug`; diagnosis neither starts an execution
attempt nor adds retry capacity. Budget exhaustion requires a specific
failure/budget disposition, not another hidden attempt.

Functional participants are individually optional, including the main reviewer.
Only selected participants run; secondary-only verification has no mandatory
main fallback. All off means skipped/no verification report and implemented
work may close without PASS. Red-verify is independently optional, including
feature semantic review. Red alone can inspect available implementation while
stating absent functional proof; it does not create functional PASS. Local
executor checks have their independent setting under `/exe`.

A wave boundary reconciles already-recorded decisions through selected
`/mb-sync` and selected lint/doctor/reviews. Status/evidence-only changes do not
invalidate an unchanged review. Re-review is due only for changed claims under
an enabled review policy. `/tech-debt wave <N>` is an enabled-by-default advisory
option, not an immutable gate; unavailable reporting does not become a halt.
</semantic_work>

<recovery_and_outputs>
Retain enough state in Memory Bank, indexed tasks and existing run/protocol
surfaces for the host to reconcile actual work after interruption: current task
and attempt, partial effects, completed/selected/skipped operations, material
decisions, remaining work, blockers, evidence and immediate handoff. No fixed
run-file bundle is required. Preserve historical snapshots; current settings
cannot reinterpret past results.

Actual task/evidence state outranks an old checkpoint. Completed implementation
moves to remaining selected work; completed verification is reused for unchanged
work; skipped verification has no missing report. A closed task may still have
unfinished selected wave work. Reconcile stranded work before selecting more;
ambiguous non-idempotent effects require evidence/decision, not blind replay.

Return the subject outcome and required common feedback. Distinguish unresolved
decisions, failed checks, budget exhaustion, policy restrictions, blocked
upstream work and genuine dependency deadlock. Preserve the specific reason,
evidence, owner and resume route. Existing terminal vocabulary remains
`SUCCESS|HALT_BLOCKING_QUESTIONS|HALT_CLARIFICATION_REQUIRED|HALT_REVIEW_REJECT|HALT_FAILURE_BUDGET|HALT_DEPENDENCY_DEADLOCK|HALT_POLICY_VIOLATION|HALT_QUALITY_GATES|HALT_BUDGET_EXCEEDED`.

SUCCESS means all selected product work and boundary operations are complete or
explicitly skipped/disposed, no unresolved blocker or manual stop remains, and
records agree with actual outcomes. Distinguish implementation completion from
verified acceptance and `done_for_prod` production remainder. The host records
terminal state and task lifecycle. Autonomous decision policy inherited from
`/autonomous` remains active throughout this phase.
</recovery_and_outputs>
