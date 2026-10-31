---
description: Template for compact .protocols/<TASK_ID>/run.md used by T0/T1 tasks.
status: active
---
# Compact Run

Use only when this artifact is selected. Keep only applicable sections; its
presence creates no check, role or lifecycle requirement. Existing task-owned
state is updated in place, never replaced from this template. Host owns
lifecycle; retain actual and skipped work under tier-policy, not inferred PASS.


## Metadata
- task: TASK-NNN-TN-FT-NNN-WN
- tier: T0 | T1
- selected work / attempt: task.verify workflow record
- implementation: partial | complete
- remaining work / partial effects:

## Execution Attempt
- attempt:
- started:

## Goal
- ...

## Scope
- changed files:
  - ...
- non-goals:
  - ...

## Context Used
- ...

## Changes
- ...

## Checks
- command:
- result:
- evidence:

## Reuse Candidates (optional)
- receipt_status: current | superseded | supporting-only
- attempt:
- claim:
- command: <exact filters/arguments; secrets redacted>
- cwd:
- exit_code:
- input_state_basis: <declared pre-command source/config/dependency/runtime basis>
- completed_at:
- evidence: <concise redacted output or artifact path/checksum; no standalone workflow verdict markers>

## Selected checks and results
- local checks: skipped | actual result/evidence
- verification: skipped | actual participant verdicts/evidence
- red-verify: skipped | actual semantic verdict/evidence
- negative result disposition: decision, user/autonomous provenance, reason

Only a performed functional verification emits `VERDICT: PASS|FAIL|NEEDS-CLARIFICATION`.
Local checks do not become functional PASS; skipped checks have no verdict.

## Host closure / handoff
- recorded host decision or pending recommendation:
- actual evidence:
- remaining selected operation:

## MB-SYNC Handoff
- owner: host / named caller
- reason:
- files/docs likely needing sync:
  - ...

## Notes / Follow-ups
- ...
