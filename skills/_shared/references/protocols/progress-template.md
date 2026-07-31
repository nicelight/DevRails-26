---
description: Template for .protocols/TASK-NNN-TN-FT-NNN-WN/progress.md (resume-friendly log).
status: active
---
# Progress — <TASK_ID>

## Current status
- state: planning | implementing | verifying | blocked | done
- last update: YYYY-MM-DD

## What was done
- ...

## Commands run (with results)
- `...` → OK/FAIL (link logs in `.tasks/<TASK_ID>/`)

## Claim-linked RED / GREEN (T2/T3)
- attempt:
- applicability: applicable | not applicable
- accepted claim locator(s):
- accepted not-applicable reason and alternative proof:
- RED command/probe:
- RED observation and evidence:
- GREEN command/probe:
- GREEN observation and evidence:
- claim-equivalent probe changes and rationale:
- T3 isolation/cleanup/permission evidence:

RED/GREEN are execution evidence, not workflow verdict markers. A failing
setup/syntax/import or artificial break is not RED; pre-implementation GREEN
avoids artificial RED and unnecessary production changes for that claim.

## Reuse Candidates (optional)
Receipt is executor self-attestation and supporting evidence, not independent
provenance. Repeat the block only for current-attempt results offered by
`/exe`; mark older same-claim blocks superseded.

- receipt_status: current | superseded | supporting-only
- attempt:
- claim:
- command: <exact filters/arguments; secrets redacted>
- cwd:
- exit_code:
- input_state_basis: <declared pre-command source/config/dependency/runtime basis>
- completed_at:
- evidence: <concise redacted output or artifact path/checksum; no standalone workflow verdict markers>

## Evidence links
- `.tasks/<TASK_ID>/...`

## Open issues / risks
- ...

## Next step (single concrete action)
- ...
