---
description: Template for .protocols/TASK-NNN-TN-FT-NNN-WN/verification.md (acceptance criteria + evidence).
status: active
---
# Verification — <TASK_ID>

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
- Executor RED/GREEN path: <claim mapping plus evidence locators, accepted not-applicable reason, or legacy not required>

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

## Quality gates evidence
- lint/typecheck: ...
- unit tests: ...
- integration/e2e: ...

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

Executor GREEN is supporting evidence only. Record fresh verifier-owned proof
for the same mapped claims.

## Verdict
Replace the placeholder with one exact standalone marker:
VERDICT: <PASS|FAIL|NEEDS-CLARIFICATION>

## Handoff
- Recommended owner/action: ...
- Tier escalation or planning repair: none | ...
- BUG/follow-up recommendation for scheduler/owner: none | ...
- Task lifecycle changed by verifier: no | T0/T1 explicit-owner closure

## Notes
- ...
