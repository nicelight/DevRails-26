---
description: Standalone repair/advanced command for one feature's SDD design.
status: active
---
# /spec-improve - Feature-level SDD design improvement

<objective>
Repair or rerun the minimum necessary spec surface for one feature without task
decomposition.

`/spec-improve FT-<NNN>` checks existing specs first, finds gaps/contradictions, asks focused questions when needed, updates only necessary design artifacts, and marks the target feature with `spec_design_status`.

Normal manual flow does not require a separate `/spec-improve` step:
`/prd-to-tasks FT-<NNN>` includes the full feature-level SDD design phase before
task slicing. Use standalone `/spec-improve` when you need to repair, refresh,
or review feature design without creating/updating task records.
</objective>

<process>

## 0) Input
Expected `$ARGUMENTS`:
- `FT-<NNN>`

Run after `/prd` and mandatory `/spec-design` when feature design needs a
standalone repair/refresh pass. In the happy path, run `/foundation-to-tasks`
first when foundation is required, then `/prd-to-tasks FT-<NNN>`; it performs
this design work before task slicing.
Consume backbone specs as normative inputs instead of duplicating them.

If the argument is missing, ask the user to choose one feature.

Examples:
- `/spec-improve FT-001`
- `/spec-improve FT-012`

Normal route:
`/write-prd -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /prd-to-tasks FT-<NNN> -> /review-tasks-plan FT-<NNN> -> conditional /mb-doctor -> tier-routed /execute TASK`.

Standalone repair route:
`/spec-improve FT-<NNN> -> /prd-to-tasks FT-<NNN> -> /review-tasks-plan FT-<NNN>`
when decomposition is still needed after the repair.

## 1) Read existing design surface first
Before creating any new spec:
1. Read `.memory-bank/spec-index.md`.
2. Read `.memory-bank/spec-backbone.md`.
3. Confirm global backbone status in `.memory-bank/spec-backbone.md` is `complete`, or `minimal` with explicit `not_applicable` areas; if missing, bare `minimal`, or `blocked`, stop and route to `/spec-design`.
4. Read the target `.memory-bank/features/FT-<NNN>-*.md`.
5. Read linked epic, requirements, Constitution, backbone specs, and any existing specs routed by the index/backbone.
6. Search existing `.memory-bank/architecture/`, `.memory-bank/tech-specs/`, `.memory-bank/contracts/`, `.memory-bank/domains/`, `.memory-bank/states/`, `.memory-bank/adrs/`, `.memory-bank/testing/`, `.memory-bank/guides/`, and `.memory-bank/runbooks/` for overlapping decisions.

Rule: do not create a new spec before checking existing specs through the index.
If several features need the same missing domain/contract/state/API/security/data/runtime/testing decision, stop and route to `/spec-design` instead of creating duplicate feature-local specs.
If a task/feature interpretation conflicts with a backbone spec, stop with a blocker instead of choosing locally.
If the missing decision is a compact T2/T3 or shared-boundary rule, prefer updating
`.memory-bank/architecture/system-architecture.md#Architecture Spine` through the
same KISS `AD-*` format used by `/spec-design`; do not create a separate
architecture workflow or local feature-only duplicate.

## 2) Decide required design depth
Classify what the feature needs:
- none: simple T0/T1-like work with no runtime, contract, state, data, security, migration, or cross-module design impact
- feature hub only: a small `.memory-bank/tech-specs/FT-<NNN>-<slug>.md` is enough
- linked specs: update or create specific architecture/contracts/domains/states/ADR/testing/runbook docs

If simple, mark the feature:

```yaml
spec_design_status: not_required
spec_design_links: []
```

Add a concise rationale in the feature doc and update `.memory-bank/spec-index.md`.

## 3) Problem scan
Before writing specs, explicitly look for:
- duplicate or conflicting existing specs
- inconsistent boundaries, contracts, state transitions, or data ownership
- hidden coupling or complexity growth
- unclear acceptance criteria that would make tasks unverifiable
- security/compliance/runtime risks
- places where tests could pass while substance remains wrong

Do not hide complexity growth. Report it and explain the tradeoff.

## 4) Interview gate
If design is blocked or multiple meaningful options exist, ask the user.

Rules:
- notify the user about the concrete problem first
- provide options with rationale, like `/write-prd`
- maximum 5 questions per pass
- ask only questions needed to make the spec truthful
- if contradiction or major complexity increase exists, stop until resolved

## 5) Write only necessary artifacts
Allowed artifacts:
- feature design hub: `.memory-bank/tech-specs/FT-<NNN>-<slug>.md`
- architecture notes: `.memory-bank/architecture/<topic>.md`
- contracts: `.memory-bank/contracts/<boundary>.md`
- domain/data model notes: `.memory-bank/domains/<domain>.md`
- states: `.memory-bank/states/<lifecycle>.md`
- ADRs for significant decisions: `.memory-bank/adrs/ADR-<NNN>-<slug>.md`
- frontend component guide: `.memory-bank/guides/frontend-component-guide.md` when UI component/design behavior is normative
- testing/runbooks when needed: `.memory-bank/testing/`, `.memory-bank/runbooks/`

Keep KISS:
- update existing specs when that is the natural home
- do not fork duplicate specs
- do not add schema, migration, hook, or governance machinery just for design routing
- write decisions, constraints, invariants, and verification targets only when grounded in PRD/user/spec evidence
- use backbone specs from `/spec-design` as primary normative inputs
- for T2/T3 or shared-boundary work, keep Architecture Spine `AD-*` rules short,
  stable, and linked from downstream task fields instead of duplicating long
  rationale in feature specs

## 6) Update routes and feature metadata
Update `.memory-bank/spec-index.md`:
- keep the spec registry/planned specs current
- add linked specs created or used for the feature
- record broken/missing links only when relevant

Do not write feature status maps into `.memory-bank/spec-index.md`; feature `spec_design_status` lives in feature frontmatter. If a global/shared gap appears, update `.memory-bank/spec-backbone.md` or route back to `/spec-design`.

Invariant for `spec_design_status: complete`:
- set `complete` only when every feature-relevant SDD design area either has a concrete linked spec file routed through `.memory-bank/spec-index.md` as an authoritative, evidence-backed source of truth, or is explicitly `not_applicable` for this feature
- do not set `complete` while any feature-relevant design area remains planned, candidate, unknown, conflicting, or otherwise unresolved
- if unresolved feature-relevant planned/candidate/unknown/conflicting areas remain, set `spec_design_status: blocked` or leave the feature without `complete`, and record the gap/open question in the feature doc or relevant spec; use `.memory-bank/spec-backbone.md` only for shared/global gaps

Update target feature frontmatter:

```yaml
spec_design_status: complete
spec_design_links:
  - .memory-bank/tech-specs/FT-<NNN>-<slug>.md
```

Allowed statuses:
- `complete`
- `not_required`
- `blocked`

Use `blocked` only when design cannot be made truthful without user or external evidence.

## 7) Handoff
Report:
- target feature
- `spec_design_status`
- linked specs
- gaps/open questions
- complexity or contradiction notes
- expected next command routing:
  - if `spec_design_status` is `complete` or `not_required`: rerun
    `/prd-to-tasks FT-<NNN>` when task decomposition or packet refresh is needed
  - if `spec_design_status` is `blocked`: no `/prd-to-tasks`; resolve the blocker and rerun `/spec-improve FT-<NNN>`, or route back to `/spec-design` when the gap is shared/global

</process>
