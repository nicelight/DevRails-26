---
description: Apply autonomous decisions to framing or one-feature SDD design.
status: active
---
# /spec-auto - Autonomous SDD design

Apply `.memory-bank/workflows/autonomy-policy.md` for effective settings,
host ownership, decisions, conditional artifacts, and required compact structured
flow feedback. Routes below are semantic handoffs, not instructions to launch
agents or write task lifecycle transitions.

<objective>
Perform `--init` framing or design for exactly one product `FT-<NNN>` under the
run's autonomous decision policy. Resolve semantic choices with autonomous
provenance while preserving accepted requirements and manual stops.
</objective>

<input_contract>
`--init` uses the installed `/spec-init` contract and its available product
sources. A feature target uses accepted product/REQ/feature context and relevant
canonical design/current evidence; load
`.memory-bank/workflows/sdd-design-contract.md`.
Infer `--init` only when clearly before decomposition; otherwise require one
explicit target. Reject FT-000 and multi-feature targets.
A disabled prior stage does not require its artifact or success marker. Missing
facts that materially prevent truthful design remain concrete blockers.
</input_contract>

<hard_invariants>
- `--init` produces framing, not accepted architecture/Foundation topology.
- Preserve accepted architecture, ownership and module/slice map; do not replace
  them with defaults or equate one feature with one slice.
- Preserve `spec_design_status: complete|not_required|blocked`.
- Preserve Global Backbone `Planning Revision`; feature design never owns revision.
  Accepted global/shared changes propose `/spec-redesign`, initial needed design
  `/spec-design`. As-is drift alone does not change the accepted target/revision.
- No task creation or lifecycle writes. Actual required Foundation dependencies
  remain prerequisites; absent disabled-stage reports do not create them.
</hard_invariants>

<outputs>
`--init` returns the same `ready_for_prd|blocked` framing result as `/spec-init`,
with only useful durable inputs, glossary/spec links and questions. Do not
initialize post-PRD design state.

For a feature, apply the SDD Design Contract to applicable concerns and affected
consumers. Link direct Architecture Spine, ADR, boundary, contract and proof
owners through `spec_design_links` when relevant; do not manufacture empty specs.
Material ownership/boundary changes beyond accepted design propose
`/spec-redesign`. Feature status is:
- `complete`: applicable concerns have concrete canonical routes and no material
  unresolved decision;
- `not_required`: evidenced local/simple work needs no feature design spec;
- `blocked`: a necessary decision, fact, canonical route or design is unresolved.

Record material decisions with their actual provenance at existing owners; edit
only changed durable contracts/routing. No obligatory audit or decision-log file.
</outputs>

<validation>
Framing meets `/spec-init` criteria. Feature design meets Shared Validation and
truthful status/link criteria. No assumption becomes external fact, no manual
stop is released, and no skipped operation becomes APPROVE/PASS. Preserve existing
task identity, lifecycle and completed evidence.
</validation>

<handoff_contract>
Successful `--init` -> `/prd-to-features`; successful feature design ->
`/feature-to-tasks FT-<NNN>`. A real incomplete Foundation prerequisite proposes
`/foundation-to-tasks` or continuation of its existing work. Return the concise
result, material decisions/blockers and immediate owner with common feedback.
</handoff_contract>
