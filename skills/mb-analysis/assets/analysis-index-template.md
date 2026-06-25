---
description: Analysis artifact index.
status: active
---
# Analysis Index

## Status
- Current state: not started|brainstorming|brief draft|brief approved|blocked
- Recommended next step: /brainstorm|/brief|/constitution|/write-prd|/map-codebase|/clarify-feature FT-<NNN>

## Artifacts
- Product brief: `.memory-bank/analysis/product-brief.md`
- Brainstorming reports:
  - `.memory-bank/analysis/brainstorming/BR-001.md`

## Routing Notes
- Discovery is optional before `/prd`.
- Route raw ideas to `/brainstorm`; route clear concepts directly to `/brief`.
- Product Brief is the input contract for `/constitution` and `/write-prd`, not a PRD.
- After `/brief`, run `/constitution` before `/write-prd` unless project principles are already `ratified|partial`.
- After `/write-prd`, run `/spec-init`, `/prd`, `/review-feat-plan` for high-risk/large work, `/spec-design`, `/foundation-to-tasks` if required, then `/prd-to-tasks FT-<NNN>` and `/review-tasks-plan FT-<NNN>`.
- Use `/spec-improve FT-<NNN>` only to repair or refresh feature design outside the happy path.
- Run `/clarify-feature FT-<NNN>` only if a specific feature is pending/blocked.
- Discovery does not create task records.

## Open Routing Questions
- None
