---
description: Autonomous SDD Design Specs workflow for pre-PRD framing, global backbone, and feature design.
status: active
---
# /spec-auto - Autonomous SDD design

<objective>
Run autonomous pre-PRD framing, mandatory global backbone design, and
feature-level SDD preparation without user interview.

Supported arguments:
- `--init`
- `FT-<NNN>`
- `--all`
</objective>

<process>

## 0) Mode
`/spec-auto` never asks the user questions.

It asks and answers internal design questions itself, records assumptions, and makes conservative/KISS decisions from:
- `.memory-bank/constitution.md`
- `.memory-bank/analysis/product-brief.md`
- `.memory-bank/prd.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/requirements.md`
- `.memory-bank/epics/`
- `.memory-bank/features/`
- existing specs

If a contradiction or ambiguity is unsafe/blocking, record a blocker and stop with the terminal state expected by the active autonomous workflow.

## 1) Arguments
- `--init`: run autonomous pre-PRD spec framing after `/write-prd` and before `/prd`
- `FT-<NNN>`: run autonomous feature-level design for one feature after `/prd`
- `--all`: require or run autonomous backbone after `/prd`, then run autonomous feature-level design for every targeted feature

If no argument is provided, infer:
- before `/prd`, use `--init`
- after `/prd`, use `--all`; run or require `/spec-design --all` first
- if unclear, stop and report the missing argument

## 2) `--init`
Perform `/spec-init` behavior:
- read Constitution, Product Brief, PRD, existing spec-backbone, existing spec-index, and existing specs
- update `.memory-bank/spec-index.md` as a pure spec registry/index
- update `.memory-bank/spec-backbone.md` with pre-PRD decomposition inputs and `Pre-PRD Spec Status: ready_for_prd|blocked`
- create/update small pre-PRD artifacts only when evidence exists or a blocking question must be explicit: `user-scenarios.md`, `domains/<domain>.md`, `invariants.md`, seeded `contracts/boundary-map.md`, optional `states/lifecycle-map.md`
- record assumptions and open questions in `.memory-bank/spec-backbone.md`
- do not run architecture design, set post-PRD Global Backbone Status, create diagrams, define source-of-truth hierarchy, or create authoritative design specs unless existing evidence already contains the decision

If the skeleton would be misleading without unavailable user input:
- record `BLOCKER: misleading pre-PRD framing risk`
- set `.memory-bank/spec-backbone.md` Pre-PRD Spec Status to `blocked`
- in autonomous flow set terminal state `HALT_BLOCKING_QUESTIONS`
- stop before `/prd`

## 3) `FT-<NNN>` and `--all`
Before any feature design:
- read `.memory-bank/spec-backbone.md`
- read `.memory-bank/spec-index.md`
- if global backbone status in `.memory-bank/spec-backbone.md` is missing, run `/spec-design --all` autonomously first
- if global backbone status is `blocked`, stop and report the blocker
- if the feature-set pressure is local/simple, the backbone may be `minimal` only with explicit `not_applicable` areas; bare `minimal` is not ready

For each targeted feature:
1. Derive only applicable design concerns from the feature, requirements,
   backbone, and Foundation evidence.
2. Read `.memory-bank/spec-index.md`, relevant folder indexes, and plausible
   subject-based spec candidates in full before any write.
3. Build an in-memory concern audit and select exactly one action per concern:
   `reuse|extend|create|not_applicable|block`.
4. Check whether the feature is simple enough for
   `spec_design_status: not_required`.
5. If design is needed, reuse or extend canonical specs first and create only
   missing subject-based specs.
6. Update `.memory-bank/spec-index.md` only as a registry/discovery map.
7. Update target feature frontmatter with `spec_design_status` and direct
   canonical `spec_design_links`.

Autonomous decision rules:
- prefer existing specs over new files
- choose the smallest reversible design that satisfies PRD/Constitution/requirements
- do not ask user questions
- record assumptions in the feature or relevant canonical spec; keep
  `.memory-bank/spec-index.md` to registry rows, planned specs, and broken/missing links
- treat the feature as a composition root for behavior and applicable spec
  links, not as the owner of a design-spec hub
- canonical identity is the registered path and subject scope; one concrete
  concern has one active canonical path
- for `create`, choose a subject slug without `FT-<NNN>` or feature identity,
  recheck neighboring names for overlap, and use `Scope`, `Out of scope`, and
  `Related specs` when needed to keep the boundary clear
- split only for a distinct boundary, change cadence, consumers, or reuse; do
  not create one file per taxonomy category and do not use file length as a gate
- if two plausible canonical paths cover one concern, create no third file;
  record `spec_design_status: blocked` and halt for reconciliation
- for global architecture docs, use one `.memory-bank/architecture/system-architecture.md` only when it is the best readable scaffold shape; split `architecture/*` only when existing docs, project size, or boundary complexity makes the split clearly useful
- keep `architecture/*` to global architecture invariants; put detailed API
  schemas/contracts in `contracts/*`, lifecycle state machines in `states/*`,
  domain/storage schemas in `domains/*`, and verification/operations detail in
  `testing/*`, `runbooks/*`, or `guides/*`
- for non-simple feature design, cover only applicable Architecture,
  Interfaces/Contracts, Data, and Verification concerns in their canonical specs
- when relevant, generate/update Component Contract, API Contract, Event
  Contract, and Data Contract specs at their canonical paths instead of hiding those
  details in task records
- keep feature-specific acceptance/use-case detail in the feature doc; even a
  concern first introduced by one feature gets a subject-based canonical path,
  not a default `FT-*` spec
- existing legacy `.memory-bank/tech-specs/FT-*.md` may be read as evidence but
  must not be expanded as multi-concern hubs; migrate only affected concerns and
  update links without duplicate active definitions
- do not add a separate coverage-map artifact, validator, or empty family
  sections/files just to satisfy a template
- for shared-boundary, contract, state/data/runtime/security, or strict pressure, update `.memory-bank/architecture/system-architecture.md#Architecture Spine` with compact executable `AD-*` rules using the same KISS format as `/spec-design`
- do not create `AD-*` for local/simple implementation details, and do not invent `AD-*` entries when evidence is absent
- if a required shared-boundary, contract, state/data/runtime/security, or strict architecture decision is missing, contradictory, or not checkable, record a blocker instead of completing feature design
- when serious design-pressure feature design is complete, include relevant
  Architecture Spine, ADR, contract, and boundary-map links in the feature
  `spec_design_links` or linked canonical specs so `/prd-to-tasks` can route
  them into existing task fields
- do not invent external contracts, security posture, migrations, or irreversible data behavior
- set `spec_design_status: complete` only when every feature-relevant SDD design
  concern either has one concrete canonical spec path routed through
  `.memory-bank/spec-index.md`, or is explicitly `not_applicable` for this feature
- do not set `complete` while any feature-relevant design area remains planned, candidate, unknown, conflicting, or otherwise unresolved; instead set `spec_design_status: blocked` or leave the feature without `complete`, and record the gap/open question in the feature doc or linked spec; use `.memory-bank/spec-backbone.md` for shared/global gaps
- if blocking ambiguity affects security/compliance/payments/external contracts/data loss, set `spec_design_status: blocked`, record the reason, and halt the autonomous run with `HALT_BLOCKING_QUESTIONS` or `HALT_CLARIFICATION_REQUIRED`

For simple T0/T1-like features, `not_required` is valid with a concise rationale.
Exclude `FT-000` from feature design targets; it is reserved for `/foundation-to-tasks`.

## 4) Required outputs
For `--init`:
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`

For feature design:
- target feature docs updated with `spec_design_status`
- linked specs when required
- `.memory-bank/spec-index.md` updated

For `--all`:
- all targeted product features, excluding `FT-000`, have `spec_design_status: complete|not_required|blocked`
- global backbone status in `.memory-bank/spec-backbone.md` is `complete`, or `minimal` with explicit `not_applicable` areas
- no `/prd-to-tasks --all` handoff if any targeted feature is `blocked`

## 5) Handoff
Report:
- mode and targeted features
- specs created/updated
- assumptions
- blockers
- whether the next command is `/prd`, `/foundation-to-tasks`, `/prd-to-tasks FT-<NNN>`, or `/prd-to-tasks --all`

</process>
