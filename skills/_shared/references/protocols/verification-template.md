---
description: Template for .protocols/TASK-XXX/verification.md (acceptance criteria + evidence).
status: active
---
# Verification — <TASK_ID>

## What was verified
- Feature/Epic: ...
- REQ IDs: ...

## Verification basis
- Verification Targets (optional): ...
- Normative Inputs (optional): ...
- Classic AC / REQ basis: ...

## Acceptance criteria checklist
> For each item: what you did + where the evidence is.

- [ ] AC-01 / REQ-XXX: ...
  - Method: (test / manual / log inspection / api call)
  - Commands:
    - `...`
  - Evidence:
    - `.tasks/<TASK_ID>/...`

## Regression / non-goals
- [ ] Confirmed non-goals unaffected (if applicable)

## Quality gates evidence
- lint/typecheck: ...
- unit tests: ...
- integration/e2e: ...

## Verdict
Replace the placeholder with one exact standalone marker:
VERDICT: <PASS|FAIL|NEEDS-CLARIFICATION>

## If FAIL
- Bug filed: `.memory-bank/bugs/BUG-...md`
- Follow-up tasks:
  - TASK-...

## Notes
- ...

