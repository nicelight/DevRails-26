---
description: Shared authority, canonical ownership, authoring, and validation contract for SDD design workflows.
status: active
---
# SDD Design Contract

## Scope and caller ownership

This contract governs canonical SDD authoring for initial design, accepted
redesign, and one-feature design. The calling skill owns its inputs, statuses,
Planning Revision decisions, blockers, validation additions, and handoff.

SDD authoring does not create or mutate task records, implementation plans,
task lifecycle, protocols, completed evidence, review state, or a parallel
readiness/freshness model.

## Evidence and authority

Read only evidence relevant to the active design scope: Constitution, accepted
operator policy, PRD/requirements/features, reviewed scenarios when applicable,
the backbone and spec registry, existing subject specs/ADRs, Foundation evidence,
and mapped code/runtime evidence when present.

Normative target authority, highest first, is:
1. Constitution and explicit accepted operator decisions or policies;
2. active accepted ADRs and authoritative canonical specs;
3. clarified PRD, requirements, features, and applicable reviewed scenarios.

A lower source cannot override a higher one. Unresolved conflicts between target
authorities block their affected scope.

As-is evidence strength, highest first, is runtime observation; production code,
configuration, schemas, and migrations; tests/CI; then mapped baseline and
descriptive documentation. It establishes current behavior, constraints, and
compatibility or migration pressure, but cannot create or override an accepted
target. Label assumptions as non-authoritative. Treat target/current difference
as a planning delta, not an authority conflict.

Scenario evidence is authoritative only for a scenario-sensitive decision and
when `.memory-bank/user-scenarios.md#Review Status` is parseable with
`Status: reviewed`. Otherwise obtain review only when that evidence is material;
never create or promote scenario review decoratively.

Every unresolved material target, ownership, boundary, contract, state/data,
security, deployment, compatibility/migration, Foundation, verification, or
irreversible-behavior choice belongs to the operator unless higher authority
already resolves it. A recommendation, default, silence, or reversible/KISS
preference is not acceptance. Interactive flow obtains the decision; unattended
flow records the exact question, impact, owner, and existing blocker/resume route.
Write an accepted decision to its existing canonical owner, remove contradictory
active wording, and preserve useful as-is evidence as explicitly current state.

## Canonical ownership and coverage

- `spec-backbone.md` owns global status, area matrix, architecture artifact
  strategy, and design routing. Preserve its parseable vocabulary:
  - `complete` means every relevant global/shared area is authoritative,
    explicitly `not_applicable`, or has the narrowly valid
    `needed_before_tasks` route below;
  - `minimal` requires evidenced local/simple pressure and rationale for every
    omitted global/shared concern;
  - `blocked` means a material decision, source conflict, canonical path, or
    required area is unresolved;
  - `local_simple_backbone|standard_architecture_scaffold|strict_architecture_scaffold`
    respectively mean local pressure without shared/strict concerns, normal
    shared design guardrails, or public/security/migration/distributed/
    production-sensitive/irreversible pressure; `pending` is blocked-only;
  - matrix rows use `authoritative|needed_before_tasks|not_applicable|blocked`.
    `authoritative` cites target authority; `needed_before_tasks` identifies one
    concrete path, affected features, and missing detail and blocks dependent
    T2/T3 handoff, except the existing Foundation-only strict route;
    `not_applicable` has evidence, never `TBD`, `none`, or an empty rationale.
- `spec-index.md` is a pure `Type | Path | Status | Scope | Change route`
  registry for active/planned paths, broken links, and concise update rules. It
  contains no decision bodies, matrices, blockers, or handoffs.
- `architecture/system-architecture.md` owns system shape, parent architecture
  units, deployables/composition roots, and the Architecture Spine.
- `contracts/boundary-map.md` owns detailed module/change-unit identity,
  topology, and accepted `Consumer -> Provider` edges with exact contract
  headings. Do not duplicate that inventory or create feature subgraphs.
- Subject contracts live under `architecture/`, `contracts/`, `domains/`,
  `states/`, `testing/`, `runbooks/`, `guides/`, or `adrs/` according to concern.
- Feature documents compose behavior, acceptance, and exact applicable
  `spec_design_links`; they are not default technical-spec hubs.
- `foundation.md` owns the Foundation decision and executable baseline contract.
- The bootstrap-owned registered testing policy is read-only. Route concrete
  harness, evidence/redaction, operational proof, and runbook concerns to their
  applicable subject owner; do not invent a fallback testing-policy path.
- Legacy `tech-specs/FT-*.md` is evidence, not a target design hub.

Architecture, Interfaces/Contracts, Data, and Verification are completeness
criteria, not mandatory phases or file families:

- Architecture covers system shape, source of truth, ownership, runtime and
  deployment boundaries, high-level flow, and global guardrails.
- Interfaces/Contracts covers only applicable component/API/event/data,
  protocol/agent/tool I/O, compatibility, evidence/redaction, security/safety,
  testing/runbook, and verification contracts. A Data Contract owns payload
  compatibility across a boundary.
- Data covers domain model, storage/write ownership, persistence/session/UoW,
  schemas/migrations, states/lifecycles, validation/serialization, retention,
  seed data, and runtime data paths.
- Verification routes concrete proof to the owning requirement/acceptance,
  contract, testing, or runbook artifact. A subject spec is warranted only for
  a non-trivial reproducible dataset/state, statistical window, environment or
  warm-up, isolation/cleanup, shared procedure, or formal expert rubric; it
  cannot supply a missing product target.

For each applicable concern, reach one truthful outcome:
`reuse|extend|create|not_applicable|block`. Keep the audit transient; durable
artifacts contain only resulting contracts, routes, links, decisions, and
blockers.

## Authoring and architecture integrity

Update only durable state that changed or requires repair. Inspect registered
and neighboring specs, reuse or extend before creating, and never resolve two
competing paths by creating a third. Use the smallest subject-based artifact set;
split only for a distinct boundary, ownership/change cadence, consumers, or
meaningful reuse. Do not create empty specs, coverage maps, per-file ownership,
slice registries, audit history, an alternate design workflow/status model, or
speculative shared machinery.

Architecture artifact strategy is an output label: `single-file` uses
`system-architecture.md` as the readable global scaffold; `split-core-docs`
reuses independently owned core documents; `split-by-boundary-topic` isolates a
genuinely complex boundary; `pending` is blocked-only. Do not churn a useful
split or create `architecture/index.md` for three or fewer architecture docs.

Keep detailed API schemas, lifecycle machines, message envelopes, and feature
behavior out of architecture documents. Record only material, non-obvious
code-root/naming conventions that affect a public path, module identity, export,
namespace, ownership, build target, or downstream structure; routine local
conventions remain execution discretion. A code root is a discovery location,
not a task hard write boundary.

When capability slices are the accepted target:

- `system-architecture.md` identifies the deployable/composition root,
  significant slices, and project-relative code roots;
- `boundary-map.md` and subject specs identify each slice's data, invariants,
  transitions, commands it owns and must not own, public application boundary,
  allowed dependencies, mutable-state/write authority, and credible proof path;
- each cross-slice use case has one orchestration owner and uses neighbors'
  public boundaries without direct state writes. Business orchestration does not
  live in an HTTP/UI/bot handler, generic helper, or composition root; the root
  is limited to settings, adapters, wiring, lifecycle, start, and shutdown.

A significant slice is a complete observable capability, not a technical layer
or automatically one product feature. Keep one invariant/write path under one
owner; split independently owned or changing outcomes when evidence supports it.
A shared database does not grant shared command authority: every mutable
invariant or transition has one write owner.

Reconcile observed dependencies against the accepted target. Parent units stay
in `system-architecture.md`; modules, accepted edges, and contract headings stay
in `boundary-map.md`. Unresolved drift blocks the affected scope rather than
creating a second observed graph. Do not use controllers/services/repositories
as primary slices, or introduce shared code, event bus, mediator, DI/plugin
registry, or other cross-slice machinery without a current evidenced need.
Equivalent prose or tables are valid; a small application may remain one
cohesive slice, and internal presentation/application/domain/infrastructure
roles remain conceptual unless current complexity justifies structure.

Where accepted design leaves domain-modeling style open, preserve the affected
area's local style. A material translation boundary requires concrete semantic,
ownership, compatibility, or representation-isolation pressure and operator
resolution when authority does not already decide it.

For evidenced runtime/state sensitivity beyond the ordinary Foundation smoke
path, define known initial state, safe rerun, observable result, and cleanup or
isolation in the owning spec; omit this ceremony for simple/stateless work. For
accepted linear Alembic topology, project database contracts own head/branch/
ancestry proof and feature work owns revision-local proof; the mutable head ID is
transient evidence, not a durable planning contract.

For shared/strict design pressure, maintain stable compact `AD-*` Architecture
Spine rules with `Binds`, `Prevents`, actionable `Rule`, `Verification`, and
`Source`. Create them only for executable durable decisions; do not renumber IDs
or silently delete retired rules. Use an existing project-native mechanical
check only for recurring high-blast-radius, security/safety, or cheap
unambiguous violations. A missing accepted check is work, not a runnable gate;
no universal architecture validator is required. Put durable trade-off rationale
in an ADR only when it has lasting value.

## Shared validation

Before caller-specific handoff, verify within the affected scope:

- target authority and current-state evidence remain distinct; no assumption,
  recommendation, or silence became acceptance;
- every changed rule has one canonical owner and no contradictory active text;
- applicable coverage has a truthful route or blocker, without empty artifacts;
- spec-index paths are unique, resolving, and registry-only;
- parent units, modules, graph endpoints, accepted edges, exact contract
  headings, and affected consumers resolve without duplicated topology;
- accepted ownership, write authority, public boundaries, dependency direction,
  cross-slice orchestration, and proof paths remain legible where applicable;
- affected feature links/status and Foundation evidence remain truthful;
- no task/plan lifecycle, protocol, completed evidence, or review state changed;
- applicable project-native link, lint, and readiness checks pass or preserve a
  named blocker.
