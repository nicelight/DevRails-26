---
description: Initial global SDD backbone and Foundation Dev Path decision after PRD decomposition.
status: active
---
# /spec-design - Global SDD backbone gate

<objective>
Create the initial mandatory global architecture/design backbone after
`/prd-to-features` has created the product feature set and before product task
design.

The outcome is a compact set of technical decisions, boundaries, and canonical
contracts that constrains later agents without prescribing implementation. The
gate is mandatory but adaptive in depth:
- local/simple pressure may produce a valid `minimal` backbone with explicit
  `not_applicable` rationale;
- shared-boundary, contract, state/data, runtime, security, or strict pressure
  requires a `complete` scaffold and applicable canonical specs;
- unresolved material decisions produce `blocked` and stop the handoff.

This command also records the explicit Foundation Dev Path decision. It never
creates task records, implementation plans, `REQ-000`, or `FT-000`.
</objective>

<input_contract>
Run after `/prd-to-features` with no argument. If a successful positive-revision
backbone already exists, route changes to `/spec-redesign`.

Require the clarified product feature set, pre-design backbone/registry, and
relevant accepted/current evidence. Load and apply
`.memory-bank/workflows/sdd-design-contract.md`; it owns source authority,
canonical artifact ownership, SDD coverage, architecture integrity, and shared
semantic validation.
</input_contract>

<hard_invariants>
- Do not skip this gate, even for local/simple work.
- Feature docs remain composition roots for behavior and exact applicable spec
  links. Feature-level concern completion and `spec_design_status` normally
  belong to `/feature-to-tasks` or `/spec-auto`.
- This command owns only initial Planning Revision activation. Accepted
  backbone changes and later revision decisions belong to `/spec-redesign`.
- Foundation work is product-enabling infrastructure only. Do not move product
  behavior into the foundation path.
</hard_invariants>

<operator_decisions>
Apply the shared operator-decision boundary. In interactive mode, ask only for
unresolved material choices; in unattended mode, block and name `/spec-design`
as the resume route.

When `architecture_style` is unresolved, evidence identifies an
application-shaped greenfield project, and no accepted decision or concrete
trade-off points elsewhere, first recommend one deployable modular monolith
whose primary change units are capability/vertical slices. Include one runtime
composition, narrow module contracts, explicit write ownership including a
shared-database case, and a credible verification path per significant
capability. Present another style first only when current evidence supports the
trade-off; hypothetical future scale or reuse is insufficient.

This recommendation order does not create target authority. Propose one
coherent initial slice map and its material ownership/boundary choices as part
of the same focused architecture decision, then obtain one explicit operator
confirmation rather than a questionnaire per slice. An explicit alternative
always wins. A previously accepted operator/project policy may authorize this
preferred style and an evidence-determined slice map only when the evidence
yields one materially unambiguous decomposition; otherwise unattended mode
uses the existing blocker below.

Do not force this recommendation onto a library/package, CLI, firmware, data
pipeline, plugin/protocol system, established brownfield boundary, or genuinely
independently deployed services. Recommend the evidence-backed natural primary
change unit for those shapes. Brownfield migration to the preferred target
still requires an accepted target decision.

Brownfield special case: when meaningful code exists but a credible mapped
current-state baseline is missing, ask the operator to choose the immediate
route unless the accepted scope already proves a strictly local delta:
- run `/map-codebase` first;
- explicitly accept PRD-only drift risk;
- constrain the work to an evidenced local delta.

An unresolved initial choice sets Global Backbone Status `blocked` and uses the
active workflow's existing `HALT_BLOCKING_QUESTIONS` or
`HALT_CLARIFICATION_REQUIRED` state.
</operator_decisions>

<required_outputs>

## 1. Global status and mode

Ensure `.memory-bank/spec-backbone.md` contains this parseable contract for the
current durable backbone state:

```markdown
## Global Backbone Status
- Status: complete|minimal|blocked
- Planning Revision: <non-negative integer>
- Mode: local_simple_backbone|standard_architecture_scaffold|strict_architecture_scaffold|pending
- Architecture artifact strategy: single-file|split-core-docs|split-by-boundary-topic|pending
- Not applicable areas:
  - event_message_contracts: not_applicable - no event/message boundary in this feature set.
- Notes:
```

Edit the file only when durable backbone state has changed or the existing
contract needs repair. Do not append per-run reconciliation/history or mirror
the final chat handoff; preserve durable routing sections owned by the backbone.

Planning revision rules:
- `0` is pre-design. The first successful `complete|minimal` backbone sets `1`.
- A blocked initial backbone keeps `0`.
- A successful legacy initial backbone with a missing/invalid value is repaired
  to `1`; later changes follow the Planning Redesign Boundary.

Status, mode, and `not_applicable` meanings follow the SDD Design Contract.

## 2. Backbone Area Matrix

Maintain in `spec-backbone.md`:

```markdown
## Backbone Area Matrix
| Area | Status | Authoritative source | Notes |
|---|---|---|---|
```

Required areas:
- `architecture_style`, `source_of_truth`, `module_boundaries`;
- `user_scenarios`, `constraints`, `non_goals`, `domain_model`;
- `data_flow`, `storage`;
- `api_contracts`, `event_message_contracts`, `agent_io_contracts`;
- `security_safety`, `deployment`, `risks`, `open_questions`.

Row status semantics follow the SDD Design Contract. As-is evidence may explain
constraints or drift in Notes but cannot satisfy `authoritative` by itself.

## 3. Canonical SDD specs

Apply the shared SDD Design Contract to create or update only the canonical
specs needed by the initial backbone. A genuinely irrelevant matrix area uses
`not_applicable` with rationale; a known feature-level concrete gap may use the
narrow `needed_before_tasks` route defined above.

Set `Architecture artifact strategy` using the shared contract; it is an output
classification, not a required operator interview.

## 4. Foundation Dev Path decision

When the Foundation decision is accepted or already authoritative, create or
update `.memory-bank/foundation.md` with this parseable shape:

```markdown
---
description: Foundation Dev Path evidence and feature pressure map.
status: active
---
# Foundation Dev Path

## Gate Anchors
- Foundation Required: true|false
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: pending_foundation_to_tasks|TASK-<NNN>-T<N>-FT-000-W<N>|not_required

## Minimal Work Path
- Build command:
- Start command:
- Primary entrypoint:
- Smoke path:
- Test command:
- Evidence:

## Feature Pressure Map
| Feature | Pressure | Foundation Response | Probe | Status |
|---|---|---|---|---|

## Deferred Decisions
| Decision | Why deferred | Trigger to revisit |
|---|---|---|

## Foundation Exit Criteria
- minimal path passes
- compatibility probes pass
- no P0/P1 design pressure unresolved
- feature dev path allowed
```

Set `Foundation Required: true` only when planned features cannot safely begin
without an executable walking skeleton, runtime/entry path, test harness,
storage baseline, contract boundary, or compatibility probe. Then set
`Foundation Gate Task: pending_foundation_to_tasks`; `/foundation-to-tasks`
creates the concrete queue and gate ID.

Set `Foundation Required: false` with evidence when an existing baseline or
project simplicity makes a separate queue unnecessary, and set
`Foundation Gate Task: not_required`. Brownfield defaults are not decisions:
use existing executable evidence, or ask/halt if baseline sufficiency is
ambiguous. Existing executable evidence can prove current baseline sufficiency
for an accepted path; it does not independently authorize the target
architecture.

The Feature Pressure Map is evidence for the minimum baseline, not a product
backlog. Do not create `REQ-000`, `FT-000`, tasks, protocols, or plans here.

If the Foundation branch is unresolved, do not fabricate `true|false` anchors.
Create or update `.memory-bank/foundation.md` only to record
`Foundation decision: blocked`, the question/evidence, affected features, and
owner; preserve any previous truthful anchors without treating them as current
approval. Set Global Backbone Status `blocked` and report Foundation decision
`blocked`. The operator answer must be applied and the normal Gate Anchors
revalidated on the next `/spec-design` run while the initial backbone remains
incomplete.

## 5. Feature links and product/design boundary

For product features, add only evidence-backed global backbone links
or SDD Design Gate notes. Do not set `spec_design_status: complete` unless all
feature-level concern criteria are already truthfully satisfied. Do not use
`not_required` for a feature that depends on shared-boundary, contract,
state/data, runtime, security, or strict design.
</required_outputs>

<agent_discretion>
Choose the minimum coherent artifact shape and internal tactics permitted by the
shared contract. Project-shape classification and recommendation preparation do
not grant authority over an unresolved material decision.
</agent_discretion>

<validation>
Apply Shared Validation from the SDD Design Contract, then verify:
- Global Backbone Status and Matrix are parseable and mutually
  consistent;
- Planning Revision is `1` for a successful initial backbone and `0` for
  a blocked one;
- every relevant area is authoritative, explicitly not applicable, or a
  narrowly valid `needed_before_tasks` route;
- Foundation anchors and decision are explicit;
- no feature-owned technical-spec hub was created.

The complete Product/Design boundary is ready only when the durable bundle is
present and consistent:
- clarified `.memory-bank/prd.md`;
- product, requirements, epics, and product features;
- Global Backbone Status `complete` or valid `minimal` with positive Planning
  Revision;
- canonical `.memory-bank/spec-index.md`;
- explicit Foundation Dev Path decision;
- accepted operator decisions in their existing canonical artifacts.
</validation>

<handoff_contract>
In the final chat response, report backbone status/mode, artifact strategy,
specs changed, matrix summary, `not_applicable` rationale, affected features,
Foundation decision, durable operator decisions, Planning Revision before/after,
blockers, and the immediate next command:
- ready backbone + `Foundation Required: true` -> `/foundation-to-tasks`;
- ready backbone + `Foundation Required: false` -> `/feature-to-tasks FT-<NNN>` in
  manual flow, or `/spec-auto FT-<NNN>` for one autonomous feature;
- `blocked` -> no downstream handoff; obtain the named operator/owner decision
  and rerun `/spec-design`;
- later accepted backbone/contract change -> `/spec-redesign`.
</handoff_contract>
