---
description: Template for compact .protocols/<TASK_ID>/run.md used by T0/T1 tasks.
status: active
---
# Compact Run

## Metadata
- task: TASK-NNN-TN-FT-NNN-WN
- tier: T0 | T1
- started:
- finished:
- local evidence verdict: <PASS|FAIL|BLOCKED>
- closure owner: scheduler | explicit standalone owner | human | none
- manual /exe decision: <status unchanged|status: done>
- scheduler decision: <none|status: done|status: failed|status: blocked>

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
Receipt is executor self-attestation and supporting evidence, not independent
provenance or task closure. Repeat this block only for current-attempt results
that `/exe` offers to `/verify`; mark older same-claim blocks superseded.

- receipt_status: current | superseded | supporting-only
- attempt:
- claim:
- command: <exact filters/arguments; secrets redacted>
- cwd:
- exit_code:
- input_state_basis: <declared pre-command source/config/dependency/runtime basis>
- completed_at:
- evidence: <concise redacted output or artifact path/checksum; no standalone workflow verdict markers>

## Evidence Verdict
This marker records local evidence only. It is not task closure and does not set
final task status.

Replace the placeholder with one exact marker:
VERDICT: PASS
VERDICT: FAIL
VERDICT: BLOCKED

## Closure Decision
Record task closure separately from the evidence verdict.

### Manual `/exe`

- explicit standalone owner present: yes | no
- owner basis: user direct instruction | top-level manual workflow ownership | none
- decision: status unchanged | `status: done`
- compact PASS and every fast-lane condition satisfied: yes | no
- task record evidence updated in `verify`: yes | no

Manual `/exe` may write only `status: done`, and only after exact compact PASS
plus every tier-policy fast-lane condition. `VERDICT: FAIL|BLOCKED` is evidence,
not manual lifecycle authority; leave status unchanged and hand off.

### Scheduler

- decision: none | `status: done` | `status: failed` | `status: blocked`
- reason/evidence link:

Only the scheduler records this branch under tier policy. If no authorized
closure owner acted, leave task status unchanged and hand off the recommendation.

## MB-SYNC Handoff
- owner: scheduler | explicit standalone owner | human | none
- reason:
- files/docs likely needing sync:
  - ...

## Notes / Follow-ups
- ...
