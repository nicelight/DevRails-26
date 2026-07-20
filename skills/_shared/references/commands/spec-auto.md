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
- `FT-<NNN>`;
- `--all`.
</objective>

<input_contract>
`--init` requires the normal `/spec-init` inputs after `/write-prd` and before
`/prd-to-features`.

`FT-<NNN>` and `--all` require:
- clarified PRD, product, requirements, epics, and product features;
- `.memory-bank/spec-backbone.md` and pure `.memory-bank/spec-index.md`;
- a Global Backbone Status of `complete`, or valid `minimal` with explicit
  `not_applicable` rationale, plus positive integer `Planning Revision`; if
  missing or invalid, invoke/perform `/spec-design --all` under the same
  unattended decision rules;
- `.memory-bank/foundation.md` with an explicit decision and, when foundation
  work is required, a closed Foundation Gate before product task handoff;
- relevant canonical specs and accepted operator decisions.

If no argument is given, infer `--init` only when clearly before `/prd-to-features`, or
`--all` only when clearly after `/prd-to-features`; otherwise halt and report the missing
argument. Exclude reserved `FT-000` from product feature targets.
</input_contract>

<hard_invariants>
- `/spec-auto` does not ask the operator during the unattended run and never
  treats that as permission to choose for them.
- It may apply only decisions already fixed by Constitution, clarified PRD,
  accepted operator policy/decision, production baseline, ADR, or canonical
  spec.
- Do not invent external contracts, architecture boundaries, security posture,
  migrations, irreversible data behavior, Foundation sufficiency, or competing
  canonical-path resolution.
- Keep spec-index a registry, use subject-based canonical paths, and do not
  create feature-owned design hubs, a coverage-map artifact, task records, or a
  new status/terminal state.
- Preserve feature status vocabulary
  `spec_design_status: complete|not_required|blocked`.
- `--init` preserves Global Backbone `Planning Revision`. Feature design changes
  it only under the global-rule rule below and never uses task lifecycle state as
  a freshness marker.
</hard_invariants>

<operator_decisions>
When a relevant ambiguity or branch is not already resolved authoritatively:
- write the exact question, alternatives/impact, affected artifacts/features,
  and decision owner to the existing backbone, feature, spec, or autonomous
  decision log as appropriate;
- set `Pre-PRD Spec Status: blocked`, Global Backbone Status `blocked`, or
  feature `spec_design_status: blocked` according to ownership;
- stop with existing `HALT_BLOCKING_QUESTIONS` or
  `HALT_CLARIFICATION_REQUIRED`;
- report the interactive resume skill (`/write-prd`, `/spec-init`,
  `/feature-doctor`, or `/spec-design`).

Do not apply a recommendation, conservative/reversible default, or agent
assumption as the missing operator decision. Non-decision implementation detail
may still be chosen under the agent-discretion contract below.
</operator_decisions>

<required_outputs>

## `--init`

Produce the same boundary contract as `/spec-init`:
- `.memory-bank/spec-backbone.md` with
  `Pre-PRD Spec Status: ready_for_prd|blocked`, decomposition inputs, open
  design questions, and `/prd-to-features` handoff;
- `.memory-bank/spec-index.md` as a pure registry;
- only evidence-backed minimal framing artifacts when they are useful.

Do not set post-PRD Global Backbone Status or make architecture/Foundation
decisions in `--init`.

## `FT-<NNN>` and `--all`

For each target feature, satisfy applicable Architecture,
Interfaces/Contracts, Data, and Verification coverage. These are coverage
criteria, not a fixed analysis order or required file set.

For each concrete concern, reach exactly one truthful outcome:
`reuse|extend|create|not_applicable|block`. The audit may remain in memory;
durable artifacts need only the resulting canonical routes, decisions, and
blockers.

Rules:
- discover existing registered and neighboring subject specs before creating;
- reuse/extend first; create the smallest subject-based spec only when no
  suitable canonical path exists;
- never resolve two competing paths by creating a third;
- keep feature behavior/acceptance in the feature and technical contracts in
  canonical `.memory-bank/architecture/*`, `.memory-bank/contracts/*`,
  `.memory-bank/domains/*`, `.memory-bank/states/*`,
  `.memory-bank/testing/*`, `.memory-bank/runbooks/*`, or
  `.memory-bank/guides/*`;
- legacy `.memory-bank/tech-specs/FT-*.md` is evidence, not a target hub;
- split specs only for a distinct boundary, change cadence, consumers, or
  meaningful reuse;
- update Architecture Spine `AD-*` under the same KISS and evidence rules as
  `/spec-design` when shared-boundary, contract, state/data, runtime, security,
  or strict pressure requires executable global rules;
- when feature design durably changes an active global `AD-*` or another global
  rule in a way that can change downstream planning, increment Global Backbone
  `Planning Revision` exactly once under `/spec-design` rules; otherwise preserve
  it;
- carry relevant Architecture Spine, ADR, boundary, contract, and verification
  links into feature `spec_design_links`;
- update `.memory-bank/spec-index.md` only as registry/discovery routing.

Set feature status:
- `complete`: every applicable concern has one concrete canonical route and no
  unresolved decision;
- `not_required`: an evidenced local/simple feature needs no feature-level
  design spec; include concise rationale;
- `blocked`: an operator decision, canonical path, or required design block is
  unresolved.

For `--all`, every targeted product feature must end in one of those statuses;
any `blocked` feature prevents `/feature-to-tasks --all` handoff.
</required_outputs>

<agent_discretion>
Choose reading/search order, tools, concern-discovery method, working notes,
spec organization, and minimum design depth proportional to risk. Choose local
technical tactics that do not change product behavior, architecture/public
contracts, data ownership, security, Foundation decision, or another
operator-owned branch.

Prefer the smallest coherent canonical spec set. The agent is free to reach
coverage in any order and need not persist an internal concern matrix.
</agent_discretion>

<validation>
For `--init`, validate the same `ready_for_prd|blocked` and pure-registry
contracts as `/spec-init`.

For feature design, verify:
- global backbone and Foundation decision/gate are ready for the intended
  handoff;
- each feature status is supported by direct canonical links or explicit
  not-required rationale;
- no relevant area remains planned, candidate, unknown, conflicting, or hidden
  behind an assumption when status is `complete`;
- spec-index has one active path per concrete concern and no decision body;
- blockers use existing statuses/terminal states and name the interactive
  resume route.

For a successful `--all` Product/Design boundary, confirm the durable bundle:
clarified PRD + product/requirements/epics/features + Global Backbone Status
`complete|minimal` + canonical spec-index + Foundation Dev Path decision +
accepted operator decisions in existing canonical artifacts.
</validation>

<handoff_contract>
Report mode, targets, specs changed, status per feature, accepted decision
sources used, blockers, and one immediate next command:
- successful `--init` -> `/prd-to-features`;
- ready backbone with required foundation work not yet complete ->
  `/foundation-to-tasks` or continuation of its existing gate;
- Planning Revision increased after indexed task generation ->
  `/feature-to-tasks --all`, then `/review-tasks-plan --all`; previous product
  task-plan approvals are stale, task statuses remain unchanged, and this branch
  overrides the normal feature handoff;
- successful one-feature design -> `/feature-to-tasks FT-<NNN>`;
- successful `--all` -> `/feature-to-tasks --all`;
- unresolved decision -> named interactive repair skill; no task handoff.
</handoff_contract>
