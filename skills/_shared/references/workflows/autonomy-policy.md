---
description: Guardrails and terminal states for unattended autonomous runs.
status: active
---
# Autonomy policy

## Default mode
- Prefer interactive mode unless the user explicitly requested unattended execution.
- Canonical scheduler execution is sequential: select, execute, verify, and
  record one task before selecting the next.
- Parallel task execution is experimental and disabled unless the run was
  explicitly invoked with `--experimental-parallel`.

## Experimental parallel execution
- Record the opt-in in `.protocols/AUTONOMOUS-RUN/status.md`.
- Never use advisory `touched_files` as proof that tasks are disjoint.
- Parallel candidates require non-empty, deliberately hard, pairwise-disjoint
  `runtime_context.allowed_write_scope` values and isolated worktrees/sandboxes.
- T3 tasks and tasks that write shared/governing state, package manifests,
  lockfiles, CI, or global configuration remain sequential.
- If isolation or non-overlap cannot be proved, fall back to sequential without
  treating the fallback as an error.
- This option adds no task status, schema field, registry, or lifecycle.

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
- latest `/review-tasks-plan FT-<NNN>` verdict must be `APPROVE` for every
  task-linked product feature
- mandatory `/mb-doctor --strict` before autonomous/autopilot task selection, after `/mb-sync` before promotion, and before final success
- tier-appropriate verification per TASK:
  - T0/T1: compact evidence may be enough
  - Scheduler mode T2: full protocol, applicable task/spec gates, and `/verify` PASS are required before scheduler marks the task done; per-task `/red-verify` is not required
  - T2 feature completion: feature-level `/red-verify --feature FT-<ID>` semantic-pass is required after all feature tasks are implemented and must be recorded in the feature doc
  - `FT-000`: foundation pseudo-feature; do not apply product feature-completion semantics
  - Scheduler mode T3: `/verify` PASS and per-task `/red-verify` semantic-pass are required before scheduler marks the task done
  - Manual mode T0/T1: `/verify` PASS may close only with explicit closure ownership and completed evidence
  - Manual mode T2: `/verify` PASS plus full protocol and applicable task/spec
    gates makes the task closure-eligible; the explicit owner writes the
    lifecycle decision, and T2 feature completion still requires feature-level
    semantic-pass recorded in the feature doc
  - Manual mode T3: `/verify` PASS is not final closure; per-task `/red-verify` semantic-pass is required before `done`, with full `/mb-sync` deferred to the wave boundary
  - T3: exact marker line `HUMAN_CHECKPOINT: done` is required
- mandatory `/mb-sync` once at the end of each wave, after task status,
  closure decisions, and evidence are written immediately; early sync is only
  for a real RTM/index/spec/contract/changelog dependency inside the current
  wave or an explicit owner request
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
