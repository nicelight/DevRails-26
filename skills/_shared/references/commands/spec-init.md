---
description: Frame product vocabulary, scenarios, domain, and lifecycle for decomposition.
status: active
---
# /spec-init - Decomposition framing

Apply `.memory-bank/workflows/autonomy-policy.md` for effective settings,
host ownership, decisions, conditional artifacts, and required compact structured
flow feedback. Routes below are semantic handoffs, not instructions to launch
agents or write task lifecycle transitions.

<objective>
Prepare evidence-backed framing sufficient to derive meaningful requirements,
epics, and features. Return `Pre-PRD Spec Status: ready_for_prd|blocked`.
Architecture and Foundation design remain owned by `/spec-design` when selected.
</objective>

<input_contract>
Use the accepted product source, normally clarified `.memory-bank/prd.md`,
applicable Constitution, discovery brief, glossary, scenarios, invariants,
spec-backbone/index, and relevant subject specs. Missing artifacts from disabled
earlier operations do not block framing when supplied intent is sufficient.
A material product gap or authority conflict needs a decision at `/write-prd`
or `/constitution`; do not manufacture readiness from a marker.
Legacy `tech-specs/FT-*.md` may supply brownfield evidence, never a new spec path.
</input_contract>

<hard_invariants>
- No feature/task creation, implementation plans, full architecture decisions,
  API/DB/deployment design, detailed state machines, or invented security policy.
- Do not set feature `spec_design_status` or initialize/increment Global Backbone
  `Planning Revision`; preserve existing accepted design and revision.
- `spec-index.md` is a pure registry, not a decision or handoff document.
- Boundary hints are preliminary; they do not establish accepted modules/edges.
- Defer architecture questions unless they block truthful decomposition now.
</hard_invariants>

<decisions>
Resolve material ambiguity in terminology, actors/scenarios, entity/business-rule
ownership, lifecycle, constraints, risks, or proposed cuts through the common
decision flow. Reuse accepted answers; autonomous decisions retain autonomous
provenance. Missing facts remain gaps. Apply decisions at their canonical owner
and remove conflicting active wording before dependent decomposition.
</decisions>

<outputs>
Retain only useful durable framing. Reconcile glossary definitions when terms
affect decomposition; a separate filled glossary is not a gate. Link an adequate
PRD section instead of duplicating it. If used, `spec-backbone.md` holds:
- `## Pre-PRD Spec Status` with `Status: ready_for_prd|blocked` and concise basis;
- `## Decomposition Inputs`: scenarios, domain, constraints, non-goals, risks,
  boundary and lifecycle hints;
- material open design questions and the immediate handoff.

Create/update user-scenarios, domain, invariants, or lifecycle-map only when they
add necessary durable meaning. Scenario coverage includes primary actors, core
and out-of-scope scenarios, and domain implications. Preserve existing
`draft|reviewed|blocked` review state truthfully; a disabled scenario review
requires no reviewed marker. Evidence must still support the chosen cuts.
Register created specs using `Type | Path | Status | Scope | Change route`.
Do not append per-run audit history or duplicate the final feedback.
</outputs>

<validation>
`ready_for_prd` means evidence supports meaningful L1-L3 decomposition without
inventing product scope. `blocked` names the concrete missing decision/fact or
conflict. Check affected terminology, source precedence, links and registry
consistency; no architecture/Foundation assumption may become accepted design.
A pending or absent global backbone alone does not block this result.
</validation>

<handoff_contract>
Ready -> `/prd-to-features`. Blocked -> propose the owning product/domain
consultation, `/write-prd`, or `/constitution`, then resume framing. Return the
status, material inputs/blocker, changed artifacts when any, and immediate route
with the common feedback; no separate report is required.
</handoff_contract>
