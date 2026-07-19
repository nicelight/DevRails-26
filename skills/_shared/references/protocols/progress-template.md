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
