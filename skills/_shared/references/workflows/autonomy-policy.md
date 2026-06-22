---
description: Guardrails and terminal states for unattended autonomous runs.
status: active
---
# Autonomy policy

## Default mode
- Prefer interactive mode unless the user explicitly requested unattended execution.

## Hard-stop categories
- security / compliance ambiguity
- external contracts or partner APIs with unknown behavior
- destructive data migrations
- secret reads / prod writes / deploys

## Allowed assumptions
- naming / wording / non-critical UX defaults
- low-impact implementation details that can be verified later

Non-blocking gaps must be written as explicit assumptions in `.protocols/AUTONOMOUS-RUN/decision-log.md`.

## Required gates
- latest `/review-tasks-plan` verdict must be `APPROVE`
- mandatory `/mb-doctor --strict` before autonomous/autopilot task selection, after `/mb-sync` before promotion, and before final success
- tier-appropriate verification per TASK:
  - T0/T1: compact evidence may be enough
  - Scheduler mode T2: full protocol, required packet/spec gates, and `/verify` PASS are required before scheduler marks the task done; per-task `/red-verify` is not required
  - T2 feature completion: feature-level `/red-verify --feature FT-<ID>` semantic-pass is required after all feature tasks are implemented and must be recorded in the feature doc
  - `FT-000`: foundation pseudo-feature; do not apply product feature-completion semantics
  - Scheduler mode T3: `/verify` PASS and per-task `/red-verify` semantic-pass are required before scheduler marks the task done
  - Manual mode T0/T1: `/verify` PASS may close only with explicit closure ownership and completed evidence
  - Manual mode T2: `/verify` PASS plus full protocol and required packet/spec gates may close the task with explicit closure ownership; T2 feature completion still requires feature-level semantic-pass recorded in the feature doc
  - Manual mode T3: `/verify` PASS is not final closure; per-task `/red-verify` semantic-pass is required before `done` or `/mb-sync`
  - T3: exact marker lines `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present` are required
- mandatory `/mb-sync`
- mandatory lint/link consistency before final success, covered by `mb-doctor`

## Failure budgets
- max_retries_per_task: 2
- max_consecutive_failures: 3
- max_open_blockers: 3

## Terminal states
- `SUCCESS`
- `HALT_BLOCKING_QUESTIONS`
- `HALT_CLARIFICATION_REQUIRED`
- `HALT_REVIEW_REJECT`
- `HALT_FAILURE_BUDGET`
- `HALT_DEPENDENCY_DEADLOCK`
- `HALT_POLICY_VIOLATION`
- `HALT_QUALITY_GATES`
- `HALT_BUDGET_EXCEEDED`
