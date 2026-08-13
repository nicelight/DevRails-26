---
description: Unattended SDD framing and design using only authoritative operator decisions.
status: active
---
# /spec-auto - Autonomous SDD design

<objective>
Perform the unattended equivalent of pre-PRD framing or post-PRD feature design
without turning autonomy into authority over unresolved product/design choices.

Supported arguments:
- `--init`;
- exactly one `FT-<NNN>`.
</objective>

<input_contract>
`--init` requires the normal `/spec-init` inputs after `/write-prd` and before
`/prd-to-features`.

`FT-<NNN>` requires:
- clarified PRD, product, requirements, epics, and product features;
- `.memory-bank/spec-backbone.md` and pure `.memory-bank/spec-index.md`;
- a Global Backbone Status of `complete`, or valid `minimal` with explicit
  `not_applicable` rationale, plus positive integer `Planning Revision`; if
  missing or invalid, route to `/spec-design`;
- `.memory-bank/foundation.md` with an explicit decision and, when foundation
  work is required, a closed Foundation Gate before product task handoff;
- relevant canonical specs and accepted operator decisions;
- `.memory-bank/workflows/sdd-design-contract.md`.

If no argument is given, infer `--init` only when clearly before
`/prd-to-features`; otherwise halt and request one explicit product feature.
Reject `FT-000` and every multi-feature target.
</input_contract>

<hard_invariants>
- `/spec-auto` does not ask the operator during the unattended run and never
  treats that as permission to choose for them.
- `--init` inherits `/spec-init` source authority and decision boundaries; it
  does not invent contracts, architecture, security, migration, irreversible
  data behavior, or Foundation sufficiency.
- Apply the shared SDD authority and operator-decision contract in `FT-<NNN>`
  mode; unresolved material choices block instead of receiving agent defaults.
- In post-PRD modes, inherit the accepted global architecture and material
  module/slice map. Do not reopen, weaken, or replace them with a framework
  recommendation, feature-local heuristic, or one-slice-per-feature mapping.
- Preserve feature status vocabulary
  `spec_design_status: complete|not_required|blocked`.
- Do not create a new status or terminal-state model.
- `/spec-auto` preserves Global Backbone `Planning Revision`. Accepted backbone
  changes route to `/spec-redesign`; feature design never owns revision.
- Current-state drift or baseline correction alone does not change Planning
  Revision while the accepted target remains unchanged.
</hard_invariants>

<operator_decisions>
Apply the shared operator-decision boundary. When it leaves a relevant material
branch unresolved:
- write the exact question, alternatives/impact, affected artifacts/features,
  and decision owner to the existing backbone, feature, spec, or autonomous
  decision log as appropriate;
- set `Pre-PRD Spec Status: blocked`, Global Backbone Status `blocked`, or
  feature `spec_design_status: blocked` according to ownership;
- stop with existing `HALT_BLOCKING_QUESTIONS` or
  `HALT_CLARIFICATION_REQUIRED`;
- report the interactive resume skill (`/write-prd`, `/spec-init`,
  `/feature-doctor`, `/spec-design`, or `/spec-redesign`).

Non-decision implementation detail remains agent discretion.
</operator_decisions>

<required_outputs>

Across modes, edit canonical artifacts only when durable framing/design state,
routes, decisions, blockers, registry links, or applicable contracts have
changed, or the existing contract needs repair. Do not append per-run
audit/reconciliation history or mirror the final chat handoff.

## `--init`

Produce the same boundary contract as `/spec-init`:
- `.memory-bank/spec-backbone.md` with
  `Pre-PRD Spec Status: ready_for_prd|blocked`, decomposition inputs, open
  design questions, and `/prd-to-features` handoff;
- `.memory-bank/spec-index.md` as a pure registry;
- only evidence-backed minimal framing artifacts when they are useful.

Keep boundary hints in `spec-backbone.md#Decomposition Inputs`; `--init` writes
no accepted graph entries.

Do not set post-PRD Global Backbone Status or make architecture/Foundation
decisions in `--init`.

## `FT-<NNN>`

Apply the SDD Design Contract to exactly the target feature. Reconcile each
applicable canonical owner and affected consumer, then record direct
Architecture Spine, ADR, boundary, contract, and verification paths in feature
`spec_design_links`.

Do not change the accepted global architecture, dependency policy, or
Architecture Spine here; route such accepted changes to `/spec-redesign`.
Leaf modules and edges inside accepted architecture preserve Planning Revision.
If required capability ownership or a boundary remains materially ambiguous,
set the feature `blocked` and route to `/spec-redesign` rather than choosing it.

Set feature status:
- `complete`: every applicable concern has one concrete canonical route and no
  unresolved decision;
- `not_required`: an evidenced local/simple feature needs no feature-level
  design spec; include concise rationale;
- `blocked`: an operator decision, canonical path, or required design block is
  unresolved.

</required_outputs>

<agent_discretion>
Choose the minimum design depth and local tactics permitted by the shared
contract; no internal concern matrix needs to persist.
</agent_discretion>

<validation>
For `--init`, validate the same `ready_for_prd|blocked` and pure-registry
contracts as `/spec-init`.

For feature design, apply Shared Validation from the SDD Design Contract, then
verify:
- global backbone and Foundation decision/gate are ready for the intended
  handoff;
- each feature status is supported by direct canonical links or explicit
  not-required rationale;
- no relevant area remains planned, candidate, unknown, conflicting, or hidden
  behind an assumption when status is `complete`;
- blockers use existing statuses/terminal states and name the interactive
  resume route.

</validation>

<handoff_contract>
In the final chat response, report mode, targets, specs changed, status per
feature, accepted decision sources used, blockers, and one immediate next
command:
- successful `--init` -> `/prd-to-features`;
- ready backbone with required foundation work not yet complete ->
  `/foundation-to-tasks` or continuation of its existing gate;
- successful one-feature design -> `/feature-to-tasks FT-<NNN>`;
- unresolved decision -> named interactive repair skill; no task handoff.
</handoff_contract>
