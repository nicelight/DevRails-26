---
description: Template for .protocols/TASK-NNN-TN-FT-NNN-WN/verification.md (acceptance criteria + evidence).
status: active
---
# Verification — <TASK_ID>

Use only when this artifact is selected. Keep only applicable sections; its
presence creates no check, role or lifecycle requirement. Existing task-owned
state is updated in place, never replaced from this template. Host owns
lifecycle; retain actual and skipped work under tier-policy, not inferred PASS.


## What was verified
- Task outcome: ...
- Feature: ...
- Task-scoped REQ IDs / acceptance criteria: ...
- Execution handoff/evidence: ...

## Verification basis
- Direct task-linked canonical SDD specs and applicable contract types: ...
- Task purpose / success outcome / anti-goals: ...
- Verification targets / constraints / invariants: ...
- Task-scoped AC / REQ basis: ...
- Required task/spec checks: ...
- Executor RED/GREEN path: <claim mapping plus evidence locators, accepted not-applicable reason, skipped local checks, or legacy not required>

## Task-scoped checklist
> Include only outcomes and AC/REQ behavior mapped to this task.

- [ ] FT-001-AC-001 / REQ-001: ...
  - Method: (test / manual / log inspection / api call)
  - Commands:
    - `...`
  - Evidence:
    - `.tasks/<TASK_ID>/...`

## Regression / non-goals
- [ ] Confirmed non-goals unaffected (if applicable)
- [ ] Confirmed advisory `touched_files` deviations remain necessary for the same outcome
- [ ] Confirmed hard allowed/forbidden scope (if applicable)
- [ ] Confirmed applicable Architecture/Component/API/Event/Data spec rules

## Selected checks evidence
- participant / assigned proof scope:
- check / result / observed claim:

## Reused execute evidence
- receipt locator:
- supported claim(s):
- current-state / freshness basis:

## Repeated checks
- check:
- why reuse was denied or repetition was necessary:
- evidence:

## New targeted probes
- verifier-owned probe:
- claim mapping:
- evidence:

Executor GREEN is supporting evidence only. Record independent proof for the
selected claims. No hidden main participant or local execution check is required.

## Verdict
For performed functional verification, use one exact standalone marker:
VERDICT: <PASS|FAIL|NEEDS-CLARIFICATION>
For candidate-only code review, retain `candidate_findings: none` or the actual
material findings instead; do not emit a functional verdict or add a main reviewer.

## Handoff
- Recommended owner/action: ...
- Tier escalation or planning repair: none | ...
- BUG/follow-up recommendation for scheduler/owner: none | ...
- Negative result disposition: decision / user-or-autonomous source / reason
- Task lifecycle: host-owned

## Notes
- ...
