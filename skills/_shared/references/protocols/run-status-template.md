---
description: Template for .protocols/AUTONOMOUS-RUN/status.md (autonomous run state machine).
status: active
---
# Autonomous Run Status

## Run metadata
- mode: autonomous
- engine: codex | claude | hybrid
- started at: YYYY-MM-DD HH:MM
- last update: YYYY-MM-DD HH:MM

## Review gates
- latest feature-plan review verdict: PENDING | APPROVE | REJECT | NOT_RUN
- latest task-plan review coverage: PENDING | APPROVE | REJECT | NOT_RUN
- blocking review issues:
  - ...

## Operator decisions and implementation assumptions
### Blocking questions
- decision needed: ...
- affected scope/tasks: ...
- owner and interactive resume skill: ...

### Applied authoritative decisions
- Decision: ...
  - source artifact: ...

### Implementation-only assumptions
- Assumption (must not change product/design/contracts/task boundary/tier): ...
  - confidence: low | medium | high
  - TTL / revisit trigger: ...

## Queue state
- ready:
  - TASK-...
- in_progress:
  - TASK-...
- blocked:
  - TASK-... → because ...
- done:
  - TASK-...
- failed:
  - TASK-...

## Failure budget
- max_retries_per_task: 2
- max_consecutive_failures: 3
- max_open_blockers: 3
- current retries / blockers:
  - ...

## Run state
STATE: RUNNING | SUCCESS | HALT_BLOCKING_QUESTIONS | HALT_CLARIFICATION_REQUIRED | HALT_REVIEW_REJECT | HALT_FAILURE_BUDGET | HALT_DEPENDENCY_DEADLOCK | HALT_POLICY_VIOLATION | HALT_QUALITY_GATES | HALT_BUDGET_EXCEEDED

`RUNNING` means the run is still active. Terminal states are:
- `SUCCESS`
- `HALT_BLOCKING_QUESTIONS`
- `HALT_CLARIFICATION_REQUIRED`
- `HALT_REVIEW_REJECT`
- `HALT_FAILURE_BUDGET`
- `HALT_DEPENDENCY_DEADLOCK`
- `HALT_POLICY_VIOLATION`
- `HALT_QUALITY_GATES`
- `HALT_BUDGET_EXCEEDED`

## Reason / next action
- ...
