---
description: Template for .protocols/TASK-NNN-TN-FT-NNN-WN/plan.md (execution plan + MB-SYNC handoff).
status: active
---
# Plan — <TASK_ID>

Use only when this artifact is selected. Keep only applicable sections; its
presence creates no check, role or lifecycle requirement. Existing task-owned
state is updated in place, never replaced from this template. Host owns
lifecycle; retain actual and skipped work under tier-policy, not inferred PASS.


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

### Preflight-confirmed change surface
- Expected hints kept: ...
- Additional same-outcome files/areas and rationale: ...
- Hard `write_boundary` present and satisfied: yes | no | not set
- `forbidden_scope` / stop-condition check: clear | blocked

## Applicable quality gates
List only selected task-relevant checks. Disabled local checks are independent
of verify settings; explicit non-negotiables need owner resolution if incompatible.

- [ ] `<check name>`: `<cmd>` — proves `<task outcome or concrete risk>`
- No meaningful runnable check: `<not applicable | rationale>`

## Claim-linked RED / GREEN (T2/T3)
- applicability: selected | skipped | accepted not applicable
- accepted claim locator(s): <AC / REQ / exact canonical spec anchor>
- planned test/probe and environment:
- observable RED:
- corresponding GREEN:
- accepted not-applicable reason and alternative proof:
- T3 isolation, safe rerun, cleanup, and permission boundary:

## Handoff
- existing task.verify workflow selection / attempt:
- completed / partial effects:
- remaining selected work:
- affected Memory Bank references needing reconciliation:
- immediate owner / decision needed:

Host owns task status and launches. A protocol plan does not authorize additional
participants or force sync, review or verification.

## Definition of done
- ...
