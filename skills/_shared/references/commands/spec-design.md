---
description: Mandatory global SDD backbone and Foundation Dev Path decision after PRD decomposition.
status: active
---
# /spec-design - Global SDD backbone gate

<objective>
Create or update the mandatory global architecture/design backbone after `/prd-to-features`
has created the product feature set and before product task design.

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
Run after `/prd-to-features`, with no argument or `--all`.

Require and read relevant evidence from:
- `.memory-bank/constitution.md`;
- `.memory-bank/prd.md`, `.memory-bank/requirements.md`, epics, and product
  features;
- `.memory-bank/spec-backbone.md` and pure `.memory-bank/spec-index.md`;
- `.memory-bank/user-scenarios.md` when present or scenario-sensitive;
- applicable existing specs under `architecture/`, `contracts/`, `domains/`,
  `states/`, `adrs/`, `testing/`, `runbooks/`, and `guides/`;
- production code and mapped brownfield baseline when they exist;
- task records only as stale-state evidence when this command is rerun after
  task generation.

Resolve accepted target and observed current state through separate source
roles.

Normative target authority is:
1. Constitution and explicit accepted operator decisions or policies;
2. active accepted ADRs and authoritative canonical specs;
3. clarified PRD, requirements, features, and applicable reviewed user
   scenarios.

A lower target source cannot override a higher one. A conflict that the
hierarchy does not resolve remains blocked until its owner decides it.

As-is evidence strength is:
1. runtime observations;
2. production code, configuration, schemas, and migrations;
3. tests and CI;
4. mapped brownfield baseline and descriptive documentation.

Existing task records are stale-planning evidence on a rerun, not independent
target authority. Labelled agent assumptions are non-authoritative working
input only.

As-is evidence establishes current behavior, constraints, and compatibility or
migration pressure; it cannot override or create an accepted target. A
current/target difference is a planning delta, not an authority conflict. Block
only when target authorities conflict or a material target, compatibility,
migration, or irreversible-behavior branch remains unresolved.

Treat `.memory-bank/user-scenarios.md` as authoritative scenario evidence only
when an architecture decision is actually scenario-sensitive and the file has
parseable `## Review Status` with `Status: reviewed`. Missing review state or
`draft|blocked` cannot be silently promoted. In interactive flow, ask the
operator adaptively to review/correct the scenarios; in unattended flow, record
the affected areas, set Global Backbone Status `blocked`, and use the existing
blocking halt. If the current architecture decisions are not scenario-sensitive
or another higher-precedence source is sufficient, do not require a decorative
scenario review or create the file only to satisfy a template.
</input_contract>

<hard_invariants>
- Do not skip this gate, even for local/simple work.
- Do not create TASK records, implementation plans, default feature-owned or
  `FT-*`-named design hubs, a new architecture workflow, a coverage-map
  artifact, or another readiness/status model.
- Keep `.memory-bank/spec-index.md` a pure registry with
  `Type | Path | Status | Scope | Change route`, planned specs, broken links,
  and concise update rules. Decision bodies, matrices, blockers, and handoffs do
  not belong there.
- Canonical identity is the registered subject-based path. Reuse or extend an
  existing path before creating one; never create a third spec to avoid choosing
  between competing canonical paths.
- The bootstrap-owned registered testing policy is read-only here. Route
  concrete harness/evidence/redaction/operational verification concerns to
  applicable subject specs; do not invent a fallback testing-policy path.
- Feature docs remain composition roots for behavior and exact applicable spec
  links. Feature-level concern completion and `spec_design_status` normally
  belong to `/feature-to-tasks` or `/spec-auto`.
- Never rewrite task lifecycle state to represent stale planning; Planning
  Revision mismatch is the invalidation gate.
- Foundation work is product-enabling infrastructure only. Do not move product
  behavior into the foundation path.
</hard_invariants>

<operator_decisions>
In interactive mode, every unresolved material architecture/design branch that
could affect the current backbone or downstream contract belongs to the
operator. This includes architecture style, source of truth, module/runtime
boundaries, API/event/agent I/O contracts, state/storage/data behavior,
compatibility, security/safety, deployment, irreversible behavior, competing
canonical paths, and whether a Foundation Dev Path is required or sufficient.

Ask adaptively: one question or a small group of tightly related questions,
multiple choice or open form as useful. Explain what changes, cite the evidence,
and optionally recommend an option. A preferred, conservative, reversible, or
KISS option is not an accepted decision until the operator explicitly answers.
Do not ask questions for choices already fixed by normative target authority.

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

In unattended mode, apply a material target decision only when already resolved
by Constitution, an explicit accepted operator decision or policy, an active
accepted ADR, an authoritative canonical spec, or clarified product sources.
Use runtime observations, production code, and mapped baseline only to establish
current behavior, constraints, and compatibility or migration evidence. If a
material branch is unresolved:
- record the question, affected requirements/features/areas, and owner;
- set the applicable backbone/feature state to `blocked`;
- stop with the active workflow's existing `HALT_BLOCKING_QUESTIONS` or
  `HALT_CLARIFICATION_REQUIRED` state;
- identify `/spec-design` as the resume command after the decision.

Accepted decisions must be written to their owning canonical spec, ADR when
durable trade-off rationale warrants one, or `.memory-bank/foundation.md`.
Remove conflicting superseded normative wording, preserve useful as-is evidence
as explicitly current state, and revalidate before handoff.
</operator_decisions>

<required_outputs>

## 1. Global status and mode

Update `.memory-bank/spec-backbone.md` with this parseable contract:

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

Planning revision rules:
- `0` is pre-design; the first successful backbone sets `1`, and
  `complete|minimal` requires a positive value.
- On later runs, increment the revision exactly once only when a durable global
  target rule, boundary, contract, matrix route, or Foundation decision changes
  in a way that can affect feature/task planning; otherwise preserve it.
- A newly observed current-state drift or baseline correction alone does not
  increment Planning Revision when the accepted target is unchanged.
- Repair a missing/invalid legacy value on the next successful run.
- An increment after task generation makes all product task-plan reviews stale;
  preserve task statuses and use the all-feature handoff below.

Mode meanings:
- `local_simple_backbone`: explicitly local/simple feature pressure without a
  shared boundary, contract, state/data, runtime, security, or irreversible
  decision;
- `standard_architecture_scaffold`: normal greenfield/shared design guardrails;
- `strict_architecture_scaffold`: public contracts, security/safety,
  migrations, distributed/runtime boundaries, cross-team ownership,
  production-sensitive, or irreversible behavior.
- `pending`: allowed only with `Status: blocked` while the operator-owned mode
  or evidence needed to select it remains unresolved.

Status meanings:
- `complete`: every relevant global/shared area has an authoritative route or
  explicit `not_applicable` rationale. A `needed_before_tasks` row is allowed
  only as a clearly routed concrete-detail deferral; it blocks dependent T2/T3
  product task records and strict product handoff until resolved. The existing
  foundation-only strict exception remains available for an `FT-000`-only queue.
- `minimal`: valid only for evidenced local/simple pressure, with each omitted
  global/shared concern listed under `Not applicable areas` using
  `not_applicable - <rationale>`.
- `blocked`: a material decision, source conflict, canonical path, or required
  global/shared area cannot be resolved truthfully.

Do not use `TBD`, `none`, or an empty list as `not_applicable` evidence.

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

Allowed row statuses are
`authoritative|needed_before_tasks|not_applicable|blocked`.
`needed_before_tasks` is only for a concrete missing block whose canonical path,
affected features, and missing detail are already unambiguous. It is not a way
to defer a product or architecture decision.

An `authoritative` row cites normative target authority. As-is evidence may be
linked in Notes to explain constraints or drift, but cannot satisfy that status
by itself.

## 3. Canonical SDD specs

Create or update only specs needed to satisfy applicable coverage. Architecture,
Interfaces/Contracts, Data, and Verification are design coverage criteria, not
mandatory phases, file families, or an analysis order.

Coverage meanings:
- Architecture: system shape, source of truth, module/bounded-context and
  runtime/deployment boundaries, high-level data flow, and global guardrails;
- Interfaces/Contracts: only applicable Component, API, Event, Data,
  protocol/agent/tool I/O, boundary compatibility, evidence/redaction,
  security/safety, testing/runbook, and verification contracts. A Data Contract
  owns payload compatibility across a boundary;
- Data: internal domain model, storage ownership, persistence/session/UoW,
  schemas/migrations, states/lifecycles, validation/serialization, retention,
  seed data, and runtime data paths;
- Verification: concrete proof/evidence concerns routed to the owning contract,
  testing, or runbook spec without adding a global testing backbone row. When
  evidenced runtime/state risk exceeds the ordinary Foundation smoke path,
  define known initial state, safe rerun, observable result, and cleanup or
  isolation; do not add this process to simple/stateless projects.

Use subject paths under `architecture/`, `contracts/`, `domains/`, `states/`,
`testing/`, `runbooks/`, `guides/`, or `adrs/`. Mark a genuinely irrelevant
matrix area `not_applicable` with rationale instead of creating an empty spec.
When only feature-level concrete detail remains and its canonical path is known,
route it as `needed_before_tasks` for later completion.

Architecture artifact strategies are output labels, not a required interview:
- `single-file`: `.memory-bank/architecture/system-architecture.md` is the best
  readable global scaffold;
- `split-core-docs`: separate source-of-truth/module-boundary docs are reused or
  independently owned;
- `split-by-boundary-topic`: a complex boundary needs its own canonical doc.
- `pending`: allowed only with `Status: blocked` when artifact shape depends on
  an unresolved material design decision.

Choose the smallest evidence-backed shape. Do not create
`architecture/index.md` unless there are more than three architecture docs, and
do not churn an existing useful split. Keep detailed API schemas, lifecycle
machines, message envelopes, and feature behavior out of `architecture/*`.

When designing code roots or module boundaries, record in the existing
`.memory-bank/architecture/system-architecture.md` beside the affected root or
boundary only a non-obvious or material naming/path convention that affects a
public path, import/module identity, package export, namespace, ownership, build
target, or later structure. Do not record routine ecosystem/project conventions
or create a naming profile, registry, artifact, status, or gate. An unresolved
material boundary uses the existing operator-decision route; ordinary local
naming remains execution discretion.

When the accepted target is a capability-sliced modular monolith, the existing
architecture artifacts must make that target directly usable downstream:
- `system-architecture.md` identifies the single deployable, composition root,
  significant capability slices, and their project-relative code roots;
- `contracts/boundary-map.md` and applicable subject specs record, for each
  significant slice, what data, behavior-sensitive invariants, transitions,
  and commands it owns and must not own, its public application boundary,
  allowed dependencies, mutable-state/write authority, and minimum credible
  verification path;
- a cross-slice use case names one capability slice as its orchestration owner
  and forbids bypassing a neighbor's public boundary or writing its state
  directly. Business orchestration must not live in an HTTP/UI/bot handler,
  generic utility/shared helper, or the composition root; the composition root
  is limited to settings, adapters, wiring, lifecycle, start, and shutdown.

A significant slice represents a complete user- or operator-observable
capability, not a technical layer and not automatically one product feature.
Keep behavior that shares an invariant and write path under one owner; split
independently owned or independently changing outcomes when evidence supports
the boundary. A feature may cross slices and a slice may support several
features.

A shared database does not create shared business ownership. For every mutable
invariant or transition, name one slice as write owner; another slice's physical
read access does not grant command authority or permission to duplicate the
owner's business rules.

Equivalent prose or tables are valid; no exact heading or table schema is
required. A small application may have one cohesive slice. Do not create empty
multi-slice scaffolding, use technical layers such as controllers/services/
repositories as primary slices, add per-file ownership, or create a slice
registry. Keep internal presentation/application/domain/infrastructure roles
conceptual unless concrete complexity justifies structure. Add shared code,
event bus, mediator, DI/plugin registry, or similar cross-slice machinery only
for a current evidenced requirement. A code root is a discovery location and
is not a task hard write boundary.

For shared-boundary, contract, state/data, runtime, security, or strict pressure,
maintain `.memory-bank/architecture/system-architecture.md#Architecture Spine`
with stable compact rules:

```markdown
#### AD-001 - <short decision>
- Binds:
- Prevents:
- Rule:
- Verification:
- Source:
```

Create `AD-*` only for executable shared/strict decisions. Do not renumber
existing IDs or silently delete a retired rule. Each active rule has `Binds`,
`Prevents`, and an actionable `Rule`; detailed rationale goes to an ADR only
when it has durable value. In `Verification`, name an existing project-native
mechanical check only for a recurring, high-blast-radius, security/safety, or
cheap unambiguous violation. Record a required missing check as accepted work,
not a runnable gate; do not require a universal architecture validator.

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
revalidated on the next `/spec-design` run.

## 5. Feature links and product/design boundary

For affected product features, add only evidence-backed global backbone links
or SDD Design Gate notes. Do not set `spec_design_status: complete` unless all
feature-level concern criteria are already truthfully satisfied. Do not use
`not_required` for a feature that depends on shared-boundary, contract,
state/data, runtime, security, or strict design. On a post-task revision
increment, report all task-linked product features for reconciliation; change
feature status only when its design coverage is no longer truthful.
</required_outputs>

<agent_discretion>
Choose the order of source review, tools, mode assessment, coverage analysis,
spec updates, diagrams, and validation. Choose the minimum useful artifact shape
within KISS and existing registry boundaries. Design coverage areas and risk
lists are completeness criteria, not a mandatory thought process.

The agent may decide local tactics and concrete spec organization when evidence
leaves no material operator branch. It may classify the project shape and
prepare the preferred recommendation from authoritative evidence, but it may
not choose product, architecture, material slice ownership, contract,
Foundation, security, compatibility, or irreversible behavior on the
operator's behalf.
</agent_discretion>

<validation>
Before handoff:
- verify the Global Backbone Status and Matrix are parseable and mutually
  consistent;
- verify Planning Revision is valid for the status and advanced at most once;
- verify every relevant area is authoritative, explicitly not applicable, or a
  narrowly valid `needed_before_tasks` route;
- verify canonical spec-index paths are unique, linked, and contain only
  registry metadata;
- verify accepted decisions live in owning specs/ADRs/foundation evidence;
- verify current-state evidence is labelled separately and has not been used as
  normative target authority;
- when the accepted target uses capability slices, verify the system shape,
  composition root, slice code roots, semantic/write ownership, forbidden
  ownership, public boundaries, allowed dependencies, cross-slice
  orchestration owner and its eligible location, and proof paths are legible
  across the existing architecture and boundary artifacts;
- verify no recommendation or silence was recorded as acceptance, no technical
  layer was substituted for a capability slice, and no code root was promoted
  to a task hard write boundary;
- verify Foundation anchors and decision are explicit;
- verify no TASK/plan or feature-owned spec hub was created;
- rerun applicable link/lint/readiness checks and preserve any blocker.

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
Report backbone status/mode, artifact strategy, specs changed, matrix summary,
`not_applicable` rationale, affected features, Foundation decision, durable
operator decisions, Planning Revision before/after, blockers, and the immediate
next command:
- ready backbone + revision increased after indexed task generation -> rerun
  `/foundation-to-tasks` first when Foundation is required, then
  `/feature-to-tasks --all`, `/review-tasks-plan --all`, and the applicable
  doctor/execution gate; this branch overrides the normal ready handoff;
- ready backbone + `Foundation Required: true` -> `/foundation-to-tasks`;
- ready backbone + `Foundation Required: false` -> `/feature-to-tasks FT-<NNN>` in
  manual flow, or `/spec-auto --all` for autonomous feature design;
- `blocked` -> no downstream handoff; obtain the named operator/owner decision
  and rerun `/spec-design`.
</handoff_contract>
