---
description: Establish needed global SDD decisions and a Foundation baseline decision.
status: active
---
# /spec-design - Initial global design

Optional installed templates: `references/adr-template.md`,
`references/concept-architecture-template.md`, and
`references/concept-guide-template.md`. Use them only for needed selected docs.

Apply `.memory-bank/workflows/autonomy-policy.md` for effective settings,
host ownership, decisions, conditional artifacts, and required compact structured
flow feedback. Routes below are semantic handoffs, not instructions to launch
agents or write task lifecycle transitions.

<objective>
Establish the minimum sufficient initial technical decisions, boundaries and
canonical contracts for the accepted product. Decide whether a separate
Foundation baseline is needed. This operation creates no tasks, implementation
plans, REQ-000 or FT-000. Design depth and artifacts follow actual concerns and
selected settings, not a mandatory scaffold.
</objective>

<input_contract>
Use accepted product intent/feature scope, relevant project policy, canonical
specs and current-state evidence. Load
`.memory-bank/workflows/sdd-design-contract.md` for authority, canonical ownership,
coverage and validation. Missing prior disabled-stage artifacts alone do not
block design. A successful positive-revision backbone already exists -> propose
`/spec-redesign` for an accepted change rather than replay initial discovery.
</input_contract>

<decisions>
Material design or Foundation choices use the common decision flow. For an
application-shaped greenfield project with no accepted style or contrary
concrete trade-off, a modular monolith with capability slices is a useful simple
candidate. Do not impose it on libraries, CLI, firmware, pipelines, plugins,
existing brownfield boundaries or independent services. Future scale/reuse alone
does not justify complexity. Resolve a coherent slice/boundary proposal rather
than a questionnaire per slice; an explicit accepted alternative governs.

Meaningful brownfield code without a credible baseline may need `/map-codebase`,
acceptance of PRD-only drift risk, or an evidenced local delta. Propose the needed
branch unless already authorized. As-is evidence does not authorize a new target.
</decisions>

<outputs>
Apply the SDD Design Contract. Reuse/extend subject owners before creating files;
keep feature docs as behavior/composition roots and spec-index registry-only.
Applicable coverage: architecture style, source of truth, module boundaries,
scenarios, constraints/non-goals, domain/data flow/storage, API/event/agent I/O,
security/safety, deployment, risks and open questions. No required file family,
area matrix or artifact strategy label when existing contracts are sufficient.

When recording backbone state in `spec-backbone.md`, keep the parseable shape:

```markdown
## Global Backbone Status
- Status: complete|minimal|blocked
- Planning Revision: <non-negative integer>
```

Revision is 0 before initial design and 1 for first successful design; blocked
initial design remains 0. Repair missing legacy successful revision to 1;
later changes belong to `/spec-redesign`. Status meanings follow the shared
contract. If mode/strategy are useful, preserve their existing vocabulary:
`local_simple_backbone|standard_architecture_scaffold|strict_architecture_scaffold|pending`
and `single-file|split-core-docs|split-by-boundary-topic|pending` respectively.
Optional area rows retain `authoritative|needed_before_tasks|not_applicable|blocked`
with an authoritative source or concrete rationale/owner.
A `needed_before_tasks` route names the missing detail, path and affected features;
missing detail blocks only dependent work. No speculative global reset.

Record a material Foundation decision in `.memory-bank/foundation.md` when
needed for downstream work. Existing anchors retain their meanings:

```markdown
## Gate Anchors
- Foundation Required: true|false
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: pending_foundation_to_tasks|TASK-<NNN>-T<N>-FT-000-W<N>|not_required
```

`true` means an executable baseline is a real prerequisite, with
`pending_foundation_to_tasks` until tasking. `false`/`not_required` needs a concise
basis, such as sufficient existing baseline or no separate baseline need.
Unresolved sufficiency remains a decision, never invented true/false anchors.
Preserve previous truthful anchors as history without claiming current approval.

Describe only applicable build/start/entrypoint/smoke/test paths, evidence and
exit criteria. A Feature Pressure Map and deferred-decision table are optional;
retain actual material pressure and its minimum response. Selected proof results
stay actual results; unperformed proof is not passed. Do not move product behavior
into Foundation or require a proof-only queue merely because reports are absent.

Add direct evidence-backed feature spec links. `spec_design_status: complete`
requires satisfied applicable concerns; `not_required` requires genuinely local
work without needed feature design. Do not mark unresolved concerns complete.
Update durable decisions/routing only when changed, without per-run audit history.
</outputs>

<validation>
Apply Shared Validation. Recorded backbone status/revision and Foundation anchors
must be truthful and consistent; every material concern has an accepted owner,
concrete deferral or blocker. No feature-owned technical-spec hub, fabricated
review result or unconditional prior-artifact bundle is required.
</validation>

<handoff_contract>
Ready design with needed Foundation -> `/foundation-to-tasks`; otherwise selected
one-feature `/spec-auto FT-<NNN>` or `/feature-to-tasks FT-<NNN>`.
An unresolved material choice proposes consultation at this owner, then resumes
`/spec-design`; changed accepted backbone -> `/spec-redesign`.
Return concise status, material decisions/provenance, changed specs, applicable
Foundation decision and revision, blocker and immediate route with common feedback.
</handoff_contract>
