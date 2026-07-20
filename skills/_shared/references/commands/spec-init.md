---
description: Validate project vocabulary and frame pre-PRD context before PRD decomposition.
status: active
---
# /spec-init - Pre-PRD spec framing

<objective>
Prepare enough evidence-backed product/domain framing after clarified
`/write-prd` for `/prd-to-features` to derive meaningful requirements, epics, and features
without cutting across the wrong scenario, domain, lifecycle, or boundary.

`/spec-init` is a decomposition-safety gate, not architecture design. Its result
is `Pre-PRD Spec Status: ready_for_prd|blocked`; the global SDD backbone and
Foundation Dev Path remain intentionally pending for `/spec-design` after
`/prd-to-features`.
</objective>

<input_contract>
Require `.memory-bank/prd.md` with all existing clarified-PRD markers:

```yaml
type: prd
clarification_status: complete
constitution_checked: true
```

If any marker is missing or has another value, stop and route to `/write-prd`
or `/constitution` according to the failed owner contract; do not frame the PRD
as ready. Read relevant context from the Constitution, Product Brief, existing
`glossary.md`, `spec-backbone.md`, pure `spec-index.md`, user scenarios,
invariants, and canonical subject specs under `architecture/`, `contracts/`,
`domains/`, `states/`, `adrs/`, `testing/`, `guides/`, and `runbooks/`.

Legacy `.memory-bank/tech-specs/FT-*.md` may be read as brownfield evidence only;
it is not a target path for new specs. If the PRD is missing or too unclear to
frame truthfully, stop and route to `/write-prd`.
</input_contract>

<glossary_gate>
Before any other framing, inspect `.memory-bank/glossary.md`. It is unfilled if
missing, empty, or placeholder-only. In that case populate it from the Product
Brief, clarified PRD, and other authoritative project sources; otherwise
reconcile existing terms with current evidence.

Keep only evidenced definitions. If a conflicting meaning can affect
decomposition, use the existing operator-decision blocker. Continue only when
the glossary has no placeholders and its `spec-index.md` row matches it.
</glossary_gate>

<hard_invariants>
- Do not create feature files, task records, implementation plans, feature-owned
  or `FT-*` design specs, full architecture decisions, source-of-truth
  hierarchy, API/OpenAPI details, DB migrations, deployment design, detailed
  state machines, or invented security posture.
- Do not set feature `spec_design_status`; `/prd-to-features` creates features and later
  design skills own that status.
- Keep `.memory-bank/spec-index.md` a pure registry. Readiness, open design
  questions, matrices, and handoffs belong in `spec-backbone.md`.
- Preserve any existing Global Backbone `Planning Revision`. `/spec-init` does
  not initialize or increment the post-PRD planning contract; a fresh bootstrap
  placeholder remains `0` until `/spec-design` succeeds.
- Do not turn a later architecture question into a product assumption. Record it
  for `/spec-design` unless it blocks truthful L1-L3 decomposition now.
</hard_invariants>

<operator_decisions>
If an unresolved product/domain branch can change actors, core scenarios,
non-goals, entity/business-rule ownership, lifecycles, boundary hints,
constraints, risks, or feature/epic cuts, ask the operator before setting
`ready_for_prd`.

Use an adaptive interview: ask one question or a small group of tightly related
questions, explain decomposition impact, and optionally recommend an option.
Do not run a fixed framing questionnaire. A recommendation is not a decision.
Do not re-ask matters settled by authoritative PRD/Constitution/spec evidence.

In unattended flow, use only an already accepted authoritative decision. If
none exists, record the question and affected decomposition inputs, set
`Pre-PRD Spec Status: blocked`, and halt with `HALT_BLOCKING_QUESTIONS`.

After every accepted answer, apply the decision to its existing owning
canonical artifact and to the corresponding `spec-backbone.md` decomposition
input or blocker. Remove contradictory superseded wording and rerun the PRD,
source-precedence, link, and decomposition-safety checks before setting
`ready_for_prd`. Do not create a separate decision artifact or status.
</operator_decisions>

<required_outputs>
Update:
- `.memory-bank/glossary.md` through the mandatory glossary gate;
- `.memory-bank/spec-index.md` as registry/index only;
- `.memory-bank/spec-backbone.md` with decomposition state and handoff.

Create or update the following only when evidence exists or a blocking gap must
be made explicit:
- `.memory-bank/user-scenarios.md`;
- `.memory-bank/domains/core-domain.md` or another subject domain spec;
- `.memory-bank/invariants.md`;
- `.memory-bank/contracts/boundary-map.md` with preliminary responsibility and
  scope hints only;
- `.memory-bank/states/lifecycle-map.md` when lifecycle affects decomposition.

When the PRD already owns sufficient evidence, link its section instead of
duplicating it. Created artifacts cover only applicable decomposition criteria:
- actors, 1-3 representative core scenarios, and out-of-scope scenarios;
- main entities, roles, business rules, states/lifecycles, and constraints;
- decomposition-affecting MUST/NEVER rules;
- preliminary boundary responsibility/direction/owner/questions;
- lifecycle transitions needing later detail.

When `.memory-bank/user-scenarios.md` is created, preserve this minimum shape:

```markdown
## Primary Actors
## Core Scenarios
## Out Of Scope Scenarios
## Architecture/Domain Implications
## Review Status
- Status: draft|reviewed|blocked
- Notes:
```

The review status is required only for a created scenario artifact. When a
decomposition decision is scenario-sensitive, missing review state or
`draft|blocked` scenarios are not authoritative: interactive flow asks an
adaptive operator question, while unattended flow records the affected input,
sets `Pre-PRD Spec Status: blocked`, and uses the existing blocking halt. If no
decomposition decision depends on scenarios, do not create or demand a
decorative scenario review.

Keep `spec-index.md` to:
- Purpose;
- `Spec Registry` table `Type | Path | Status | Scope | Change route`;
- `Planned Specs`;
- `Broken / Missing Links`;
- concise Update Rules.

Keep `spec-backbone.md` parseable with:

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

## Handoff To /prd-to-features
- Ready: yes|no
- Required reads:
- Stop conditions:

## Handoff To /spec-design
- Global Backbone Status: intentionally pending until /spec-design
- Downstream readiness: tasking and autonomous execution wait for /spec-design
- Backbone areas to revisit:
- Candidate specs:
```
</required_outputs>

<agent_discretion>
After the mandatory glossary gate, choose evidence-reading order, tools,
analysis shape, question grouping, and the minimum artifact set. Treat
actors/scenarios, domain/lifecycle, constraints, non-goals, risks, boundaries,
and invariants as coverage criteria rather than a mandatory sequence. Do not
create a file when a precise PRD link is enough.
</agent_discretion>

<validation>
Set `ready_for_prd` only when the evidence is sufficient for meaningful L1-L3
decomposition. Set `blocked` when `/prd-to-features` would likely invent scope or cut the
product incorrectly. Verify that `spec-index.md` remains pure, all links resolve,
scenario-sensitive inputs are reviewed or otherwise authoritative, accepted
answers were applied consistently, the glossary is filled and its registry row
is consistent, and no architecture/foundation decision was silently made.

At this boundary, a non-strict doctor warning that Global Backbone Status is
not ready is expected: `/spec-design` has not run yet.
</validation>

<handoff_contract>
- `ready_for_prd` -> `/prd-to-features`.
- `blocked` -> resolve the recorded product/domain decision through
  `/write-prd` or focused discussion, then rerun `/spec-init`.

Report the pre-PRD status, artifacts changed, decomposition inputs, blockers,
and that global backbone/foundation readiness remains owned by `/spec-design`.
</handoff_contract>
