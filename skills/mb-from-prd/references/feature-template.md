---
description: Feature spec (C4 L3): цель, use cases, acceptance criteria, edge cases, verification plan, ссылки на задачи.
status: draft
lifecycle: planned
feature_id: FT-XXX
epic_id: EP-XXX
req_ids: [REQ-XXX]
---
# FT-XXX — <Feature name>

## Summary

## User value

## Scope
### In scope

### Out of scope

## Requirements (REQ IDs)
- REQ-XXX

## Source artifacts (optional)
- PRD section: ...
- Existing code / baseline doc: ...

## Normative inputs (optional)
- Spec index: `.memory-bank/spec-index.md`
- Contracts / states / runbooks / testing docs: ...

## SDD Design Gate
- Run `/spec-improve FT-XXX` before `/prd-to-tasks FT-XXX`.
- When `/spec-improve` sets `spec_design_status: complete`, linked specs must be listed in `spec_design_links`.
- If feature-level design is not needed, `/spec-improve` may set `spec_design_status: not_required` with a short rationale.
- If design is blocked, `/spec-improve` sets `spec_design_status: blocked` and records the blocker.
- Until `/spec-improve` or an authoritative existing design establishes one of those outcomes, omit `spec_design_status`.

## Constraints / invariants (optional)
- MUST: ...
- NEVER: ...

## Clarifications
- Optional. Add dated Q/A here only if `/clarify-feature FT-XXX` is needed.

## Use cases
- UC-01: ...

## Acceptance criteria
- AC-01: ...
- AC-02: ...

## Edge cases / failure modes
- ...

## Verification plan (RTM-friendly)
| AC/REQ | Method | Where implemented | Evidence |
|---|---|---|---|
| AC-01 / REQ-XXX | unit/integration/e2e/manual | `path/to/test` or steps doc | `.tasks/TASK-.../` |

## Verification targets (optional)
- Contract / state / runbook assertions: ...
- Browser / API / data invariants: ...

## Tasks
- See `.memory-bank/tasks/index.json` and indexed `.memory-bank/tasks/TASK-*.task.json` records
- Optional IMPL plan: `.memory-bank/tasks/plans/IMPL-FT-XXX.md`

## Notes
- MB-SYNC expectations: what docs must update when implementing this feature.
