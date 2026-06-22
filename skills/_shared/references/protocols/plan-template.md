---
description: Template for .protocols/TASK-XXX/plan.md (execution plan + MB-SYNC handoff).
status: active
---
# Plan — <TASK_ID>

## Goal

## Non-goals

## Inputs / source specs
- Task record: `.memory-bank/tasks/<TASK_ID>.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: ...
- REQ IDs: ...

## Richer execution inputs (optional)
- Source Artifacts: ...
- Normative Inputs: ...
- Verification Targets: ...

## Fallback basis
- If richer inputs are absent, record the classic basis used for execution:
  - feature doc
  - requirements / RTM
  - duo docs
  - related contracts / states / runbooks / testing docs (if needed)

## Constraints / invariants (MUST / NEVER)
- MUST: ...
- NEVER: ...

## Scope
### In scope

### Out of scope

## Proposed changes
### Touched areas (hypotheses OK)
- `path/to/file` — why

## Quality gates
- [ ] lint/typecheck: `<cmd>`
- [ ] unit tests: `<cmd>`
- [ ] integration tests: `<cmd>`
- [ ] e2e/UAT: `<cmd>`

## Fan-out plan (if needed)
- Worker A: scope ...
- Worker B: scope ...

## MB-SYNC handoff / owner
Scheduler or explicit standalone owner performs sync after verification/status
decision. `/execute` only records handoff notes.

An `explicit standalone owner` exists only when the user directly asked the
current top-level agent to close the task, or when the top-level
agent/orchestrator explicitly runs a manual workflow for one TASK and records
that it owns closure. Subagents/worker prompts do not silently become closure
owners.

Checklist:
- [ ] Owner identified: scheduler | explicit standalone owner | human | none
- [ ] Explicit standalone owner basis recorded if manual closure is expected: user direct instruction | top-level manual workflow ownership | n/a
- [ ] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): ...
- [ ] `.memory-bank/index.md` router update needed: yes | no
- [ ] RTM update in `.memory-bank/requirements.md` needed: yes | no
- [ ] Task registry/status update owner: ...
- [ ] Changelog update owner: ...

## Definition of done
- ...
