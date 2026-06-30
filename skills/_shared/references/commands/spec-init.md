---
description: Frame pre-PRD domain, scenario, constraints, and spec context before PRD decomposition.
status: active
---
# /spec-init - Pre-PRD spec framing

<objective>
Create enough pre-PRD spec context after clarified `/write-prd` and before `/prd` so `/prd` can decompose the product into meaningful epics/features without cutting across the wrong domain, lifecycle, boundary, or scenario lines.

Main question:
> Достаточно ли понятны domain, scenarios, constraints, non-goals, risks, lifecycles, and boundary hints, чтобы `/prd` не нарезал продукт неправильно?

`/spec-init` is pre-PRD framing, not full architecture. It may create small evidence-backed domain/scenario/framing specs and must stop before `/prd` when blocking ambiguity remains.

Real global architecture/backbone and foundation decisions belong to `/spec-design` after `/prd`. Feature-level design belongs to `/prd-to-tasks FT-<NNN>` before task slicing.
</objective>

<process>

## 0) Position in workflow
Run after clarified `/write-prd` and before `/prd`.

Canonical manual chain:
`/brainstorm -> /brief -> /constitution -> /write-prd -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /prd-to-tasks FT-001 -> /review-tasks-plan FT-001 -> conditional /mb-doctor -> tier-routed /execute TASK`.

Stage model:
1. Read PRD and existing framing/spec context.
2. Assess decomposition risk.
3. Create only minimal framing artifacts when PRD evidence is not enough on its own.
4. Update `.memory-bank/spec-index.md` as a pure registry.
5. Update `.memory-bank/spec-backbone.md` with status, decomposition inputs, and handoff.
6. Report PASS/BLOCK and the next command.

## 1) Inputs
Require `.memory-bank/prd.md`.

Read, if present and relevant:
- `.memory-bank/constitution.md`
- `.memory-bank/analysis/product-brief.md`
- existing `.memory-bank/spec-index.md`
- existing `.memory-bank/spec-backbone.md`
- existing `.memory-bank/user-scenarios.md`
- existing `.memory-bank/invariants.md`
- existing specs under `.memory-bank/architecture/`, `.memory-bank/contracts/`,
  `.memory-bank/domains/`, `.memory-bank/states/`, `.memory-bank/adrs/`,
  `.memory-bank/testing/`, `.memory-bank/guides/`, and `.memory-bank/runbooks/`
- legacy `.memory-bank/tech-specs/FT-*.md` only as brownfield evidence; do not
  treat that path family as the target model for new specs

Stop if `.memory-bank/prd.md` is missing or so unclear that pre-PRD framing would mislead `/prd`; route back to `/write-prd`.

## 2) Framing scope
Focus only on decomposition-shaping context:
- primary actors and 1-3 core scenarios
- out-of-scope scenarios and non-goals
- main domain entities, user roles, business rules, entity states, and lifecycles
- decomposition-affecting constraints, invariants, risks, and assumptions
- preliminary boundary hints that may affect feature/epic cuts
- lifecycle hints when lifecycle state is critical for feature boundaries

Ask focused product/domain framing questions only when needed to make `/prd` safe. Do not run an architecture interview.

## 3) Allowed artifacts
Create or update only when evidence exists or a blocking question must be explicit:
- `.memory-bank/spec-index.md`: pure spec registry/index only
- `.memory-bank/spec-backbone.md`: pre-PRD framing state and later global backbone state
- `.memory-bank/user-scenarios.md`: primary actors, 1-3 core scenarios, out-of-scope scenarios, architecture/domain implications, review status
- `.memory-bank/domains/core-domain.md` or `.memory-bank/domains/<domain>.md`: main entities, user roles, business rules, entity states, lifecycles, domain constraints, links to contracts/states/storage
- `.memory-bank/invariants.md`: global MUST/NEVER rules affecting decomposition
- `.memory-bank/contracts/boundary-map.md` optionally: preliminary boundary hints only, not endpoint/OpenAPI contracts
- `.memory-bank/states/lifecycle-map.md` optionally: lifecycle hints only when lifecycles are critical for feature boundaries

Use KISS. Do not make every project write every spec.

If `.memory-bank/prd.md` already contains enough evidence for a decomposition input, link that PRD section in `.memory-bank/spec-backbone.md` instead of creating a separate spec file. Create separate files only when they reduce ambiguity, make gaps explicit, or prevent `/prd` from deriving epics/features from scattered evidence.

Minimum contents when an artifact is created:

Omit sections that do not affect decomposition, or mark them `Not applicable` with a short reason. Do not invent content only to satisfy the template.

`user-scenarios.md`:
- Primary Actors
- Core Scenarios
- Out Of Scope Scenarios
- Architecture/Domain Implications
- Review Status

`domains/core-domain.md` or `domains/<domain>.md`:
- Main Entities
- User Roles
- Business Rules
- Entity States
- Lifecycles
- Domain Constraints
- Links To Contracts/States/Storage

`contracts/boundary-map.md` (seeded skeleton file; update only with evidence):
- Boundary
- Purpose
- Direction
- Owner
- Known Constraints
- Questions

Boundary map is only a decomposition framing artifact. Do not include endpoint lists, OpenAPI details, request/response schemas, auth policy, or error-code design.

`states/lifecycle-map.md`:
- Entity
- Lifecycle Summary
- States
- Transitions needing later detail
- Questions

Lifecycle map is not a detailed state machine. Keep only enough to avoid wrong epic/feature cuts.

`invariants.md`:
- MUST
- NEVER
- Notes or Sources

Include only decomposition-affecting MUST/NEVER rules. Do not use `/spec-init` to invent broad governance, security posture, or implementation policy.

## 4) Forbidden work
Do not create:
- task records or implementation plans
- feature-owned or `FT-*`-named design specs
- `.memory-bank/features/` files or feature design status
- full architecture decisions
- source-of-truth hierarchy
- OpenAPI details, endpoint specs, DB migrations, deployment design, diagrams, or ADRs for decisions not made
- invented contracts, state machines, data models, or security posture

If a real architecture decision is needed, record it as an open design question in `.memory-bank/spec-backbone.md` and route it to `/spec-design` after `/prd`, unless it blocks truthful PRD decomposition.

`/spec-init` must not set `spec_design_status`, create feature-level design links, or create feature files. `/prd` creates features, `/spec-design` establishes the global backbone after features exist, and `/prd-to-tasks` sets feature design status before task slicing.

## 5) spec-index.md boundary
Keep `.memory-bank/spec-index.md` as a pure index/registry with this shape:
- Purpose
- Spec Registry table: `Type | Path | Status | Scope | Change route`
- Planned Specs table: `Area | Expected path | Needed by | Notes`
- Broken / Missing Links
- Update Rules

Do not put these in `spec-index.md`:
- `## Feature Design Status Map`
- `## Global backbone status`
- Backbone Area Matrix
- long hard rules, narrative status dumps, open design question lists, or control-state

Detailed readiness/status lives in `.memory-bank/spec-backbone.md`. Feature design status remains in feature frontmatter.

## 6) spec-backbone.md contract
Update `.memory-bank/spec-backbone.md` with concise route/state summary:

```markdown
## Pre-PRD Spec Status
- Status: ready_for_prd|blocked
- Last updated:
- Notes:

## Decomposition Inputs
- User scenarios:
- Domain model:
- Constraints:
- Non-goals:
- Risks:
- Boundary hints:
- Lifecycle hints:

## Open Design Questions
- TBD

## Handoff To /prd
- Ready: yes|no
- Required reads:
- Stop conditions:

## Handoff To /spec-design
- Global Backbone Status: intentionally pending until `/spec-design`
- Downstream readiness: `/foundation-to-tasks` when required, `/prd-to-tasks`, `/autopilot`, and autonomous scheduler mode must wait for `/spec-design`
- Backbone areas to revisit:
- Candidate specs:
```

If blocking ambiguity remains, set `Status: blocked`, explain the blocker, and stop before `/prd`.

On PASS, do not present the pending global backbone as a current defect. The correct user-facing state is:
- Pre-PRD framing is prepared for the next step: `/prd`
- Global Backbone Status is intentionally pending until `/spec-design`
- Downstream task/autonomous readiness still requires `/spec-design` to record `complete`, or valid `minimal` with explicit `not_applicable` areas

## 7) PASS criteria
`/spec-init PASS = PRD can be decomposed into meaningful epics/features.`

PASS does not mean architecture is done. It means `/prd` can safely derive L1-L3 using:
- `.memory-bank/prd.md`
- `.memory-bank/spec-backbone.md` with `Pre-PRD Spec Status: ready_for_prd`
- `.memory-bank/spec-index.md` as a pure index
- relevant linked pre-PRD specs

Set PASS only when actors, core scenarios, domain boundaries, important lifecycles, non-goals, constraints, and decomposition-affecting invariants are either clear from evidence or explicitly non-blocking for decomposition.

## 8) BLOCK criteria
`/spec-init BLOCK = /prd would likely create misleading epics/features.`

Block and route back to `/write-prd` or focused clarification only when any of these are unclear and decomposition-affecting enough that they prevent meaningful L1-L3 decomposition:
- primary actors or core scenarios
- product/domain boundaries
- main entities, roles, business rules, or lifecycle ownership
- decomposition-affecting constraints, non-goals, invariants, or risks
- boundary/lifecycle hints needed to avoid splitting one flow across wrong epics/features

When blocked:
- set `.memory-bank/spec-backbone.md` `Pre-PRD Spec Status` to `blocked`
- explain the blocker in `Decomposition Inputs`, `Open Design Questions`, and `Handoff To /prd`
- do not tell the user to run `/prd`

## 9) Handoff
Report:
- pre-PRD status: `ready_for_prd` or `blocked`
- artifacts created/updated
- decomposition inputs captured
- blocking gaps, if any
- expected next command: `/prd` only when status is `ready_for_prd`
- when status is `ready_for_prd`, say the Memory Bank is prepared for `/prd`
- Global Backbone Status: intentionally pending until `/spec-design`
- note that `/spec-design` owns global architecture/backbone after `/prd`
- if `mb-doctor` reports internal `SPEC_BACKBONE_NOT_READY` at this point, frame it as expected downstream readiness gating for `/prd-to-tasks`/autonomous execution, not as a `/spec-init` problem to fix now

</process>
