# Skill Audit: /clarify-feature

Date: 2026-06-26

Fix status: applied in `skills/_shared/references/commands/clarify-feature.md`
on 2026-06-26.

## Scope
- Canonical runtime command: `skills/_shared/references/commands/clarify-feature.md`
- Context: `/prd-to-tasks` now owns feature-level SDD design before task slicing; `/spec-improve` repairs feature design without creating tasks.

## Verdict
`/clarify-feature` is intentionally small and still useful for product ambiguity. It is not yet explicit enough about SDD-impacting clarifications, so answers about API/data/contracts/security can invalidate design specs without marking the design surface stale or routing back to `/spec-improve`.

## Findings

### P2 - SDD-impacting ambiguity is not a first-class output

The command asks questions that can change data/domain behavior, API/contracts, security/compliance, operations, and future tier assignment (`skills/_shared/references/commands/clarify-feature.md:74`). But the apply step only updates the feature doc and clarification protocol (`skills/_shared/references/commands/clarify-feature.md:87`).

Impact: a clarification can change contract/data/security expectations while existing `spec_design_status: complete` and linked specs remain apparently valid.

Suggested fix:
- Add a "Design impact" section to `.protocols/FT-<NNN>/clarification.md`.
- If an answer changes or contradicts existing SDD specs, set or recommend `spec_design_status: blocked`/stale in the feature doc and route to `/spec-improve FT-<NNN>` or `/spec-design` for shared/global gaps.

### P2 - Minimal context does not explicitly include SDD registry/backbone when design metadata exists

The read step loads product, requirements, and the feature, with optional epics/glossary/invariants/contracts/states/testing/runbooks when linked or clearly needed (`skills/_shared/references/commands/clarify-feature.md:41`).

It does not explicitly say to read `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, or feature `spec_design_links` when the feature already has SDD design metadata.

Impact: the command may ask and apply answers without seeing that the feature has blocked/complete/not_required design state or linked contract owners.

Suggested fix:
- If feature frontmatter contains `spec_design_status` or `spec_design_links`, read `spec-backbone.md`, `spec-index.md`, and linked specs before deciding whether ambiguity remains.

### P2 - Downstream routing stops before the feature-level design repair route

The downstream section says not to bypass `/spec-design`, foundation work, and `/prd-to-tasks` (`skills/_shared/references/commands/clarify-feature.md:128`). It does not mention `/spec-improve` or that `/prd-to-tasks` will perform/complete feature-level SDD design before task slicing.

Impact: after clarification, agents may jump straight to task decomposition even when the clarification invalidated feature-local design specs.

Suggested fix:
- Add routing:
  - if only feature wording changed and no design specs exist, continue to `/prd-to-tasks`.
  - if linked feature specs changed or are stale, run `/spec-improve FT-<NNN>` or let `/prd-to-tasks` perform the design phase before creating tasks.
  - if the answer affects shared/global backbone or concrete contract ownership, route to `/spec-design`.

### P3 - Existing behavior specs can become stale

The command predates optional behavior specs. If a feature already has `## Behavior specs`, a clarification can invalidate the examples.

Impact: execution may later read stale behavior examples through task `source_artifacts`.

Suggested fix:
- Add a non-gating note: if behavior specs are linked and the accepted answer changes the described behavior, mark them for refresh during `/prd-to-tasks` or `/spec-improve`; do not edit behavior specs inside `/clarify-feature` unless explicitly scoped.

## Recommended Next Patch
Keep `/clarify-feature` small. Add SDD-awareness only as routing and stale-state detection; do not make it create specs, tasks, implementation plans, or behavior-spec files.

Applied patch summary:
- Added optional `spec_design_status` / `spec_design_links` awareness.
- Added design-impact and behavior-spec-impact recording in the clarification protocol.
- Added routing to `/spec-improve` for feature-local stale design and `/spec-design` for shared/global design gaps.
- Preserved the rule that `/clarify-feature` does not create specs, tasks, implementation plans, or behavior specs.
