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
- closure decision: <none|status unchanged|status: done|status: failed|blocked; reason/evidence link>

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

- explicit standalone owner present: yes | no
- owner basis: user direct instruction | top-level manual workflow ownership | scheduler | human | none
- task record status change: none | `status: done` | `status: failed` | `status: blocked`
- task record evidence updated in `verify`: yes | no

If explicit standalone owner is absent, leave task status unchanged and hand off
the closure recommendation to the scheduler/owner.

## MB-SYNC Handoff
- owner: scheduler | explicit standalone owner | human | none
- reason:
- files/docs likely needing sync:
  - ...

## Notes / Follow-ups
- ...
