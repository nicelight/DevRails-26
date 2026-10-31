---
description: Decompose a clarified PRD into Memory Bank product, requirements, epics, and features.
status: active
---
# /prd-to-features - Clarified PRD -> product plan

Apply `.memory-bank/workflows/autonomy-policy.md` for effective settings,
host ownership, decisions, conditional artifacts, and required compact structured
flow feedback. Routes below are semantic handoffs, not instructions to launch
agents or write task lifecycle transitions.

<objective>
Derive the canonical L1-L3 product structure from an already clarified PRD:
- `.memory-bank/product.md`;
- `.memory-bank/requirements.md` with stable `REQ-*` IDs and RTM;
- `.memory-bank/epics/EP-*.md`;
- `.memory-bank/features/FT-*.md`;
- `.memory-bank/index.md`.

This command owns product decomposition, not PRD clarification, architecture
design, testing policy, task generation, or implementation planning.
</objective>

<input_contract>
Use accepted product intent, normally the clarified PRD, applicable Constitution,
and relevant decomposition inputs/spec routes when present. A missing spec-init
result or other disabled-stage artifact is not a blocker if intent is sufficient.
Do not load every SDD spec or require a complete prior artifact bundle.
An actual product/governance gap proposes `/write-prd` or `/constitution`;
a material framing gap proposes `/spec-init` or focused consultation.
</input_contract>

<hard_invariants>
- Do not write/clarify the PRD, perform architecture design, create TASK records
  or implementation plans, choose test levels, define global testing gates, or
  create/modify `.memory-bank/testing/*`. `/prd-to-features` does not create or modify files
  under `.memory-bank/testing/`.
- Do not let a lower-precedence PRD or feature override Constitution or an
  authoritative canonical spec.
- `FT-000` is reserved for Foundation Dev Path and is never a product feature.
- Do not set feature `spec_design_status: complete` unless applicable feature concerns are actually satisfied.
- Do not add clarification metadata to every feature; it is only for an
  explicit feature-level decomposition blocker.
- Product feature acceptance criteria use stable
  `FT-<NNN>-AC-<NNN>` IDs. Preserve an ID while its accepted behavior is the
  same; never renumber or reuse an existing ID.
</hard_invariants>

<operator_decisions>
Material scope, acceptance, actor/behavior, ownership, traceability, or REQ/EP/FT
boundary choices use the common decision flow. Record decomposition decisions
at the owning product artifact; a separate decision log is optional. A change to
PRD-owned scope, behavior, or acceptance proposes `/write-prd` before dependent
decomposition. Autonomous decisions are permitted under the run policy, without
inventing missing facts or overriding accepted authority.
</operator_decisions>

<required_outputs>
Create only the product artifacts needed to express the selected decomposition;
separate bootstrap plans and decision logs are optional.

Update `product.md` with product identity, core value, audience, primary flow,
constraints, and non-goals. Update `requirements.md` with stable `REQ-*` IDs,
out-of-scope items, and RTM `REQ -> Epic -> Feature -> Test`.

Each epic records value, success metrics, acceptance criteria, evidence-backed
source/normative/constraint links when useful. Set epic `status: draft` by
default; promote it to document `status: active` only after its open questions
are closed. This document status is not the task lifecycle.

Each feature records:
- use cases, edge/failure behavior, and `## Acceptance Criteria` with one
  `### FT-<NNN>-AC-<NNN>` block per accepted criterion. Each block names at
  least one governing `REQ-*` on an exact `- REQ: REQ-<NNN>[, ...]` line, the
  observable criterion, and its verification method;
- acceptance closure for every material product outcome: each observable
  edge/failure outcome that can itself block acceptance or realize a
  significant accepted risk names one or more covering AC IDs, or records an
  authoritative `Disposition: out_of_scope` with its source and
  `Change route: /write-prd`. Several related outcomes may share one AC;
- for each material NFR, an owning `REQ-*` that preserves the observable
  quality, accepted numeric target or qualitative criterion, and general
  pass/fail-changing conditions. Its feature AC preserves the feature-specific
  application, observable criterion, and verification method; do not duplicate
  the full requirement across artifacts;
- optional evidence-backed source artifacts, normative inputs,
  constraints/invariants, and verification targets;
- optional `## Behavior specs` routing only; do not create behavior JSON;
- `status: draft` by default;
- design routing when useful: `/spec-design` for needed global design and
  `/feature-to-tasks` or `/spec-auto` for feature concerns; do not require an
  SDD gate note or create empty specs when design is disabled;
- candidate canonical links only when grounded in evidence; omit
  `spec_design_status` unless its existing truthful state must be preserved.

When the clarified PRD leaves a feature-level blocker, optional metadata remains:

```yaml
clarification_status: pending|blocked
last_clarified: null
clarification_questions: 0
```

If a material outcome has neither a covering AC nor an authoritative exclusion,
or a material NFR lacks an accepted target/criterion or decisive condition,
stop the affected decomposition. PRD-owned acceptance changes route to
`/write-prd`; decomposition-only repair remains owned here.

Update `.memory-bank/index.md` with annotated links.
</required_outputs>

<agent_discretion>
Choose source-reading order, tools, decomposition technique, epic/feature
grouping, filenames/slugs, and the smallest coherent product structure. Use
traceability, independent product value, acceptance cohesion, and downstream
designability as coverage criteria, not a mandatory reasoning sequence.
`Smallest coherent` does not mean the fewest features.

Assess feature boundaries proportionally where authoritative evidence
shows multiple independently acceptable user outcomes or acceptance clusters,
distinct lifecycle/release/rollback units, or actor/authority/boundary paths
that may produce standalone product outcomes. Split only when concrete parts
have their own observable product result and acceptance and can be verified or
released independently. A pressure signal alone is not a split decision;
technical layers, migrations, integrations, or security concerns alone are not
product features. Stop the focused analysis once the boundary is sufficient or
an operator-owned ambiguity is identified. Do not persist a score, matrix, or
pressure rationale; record only material accepted decisions through the
existing decision route.
</agent_discretion>

<validation>
Verify:
- every derived claim is supported by the clarified PRD or authoritative
  linked evidence;
- every requirement has a stable `REQ-*` ID;
- every product feature AC has a unique stable ID matching its feature and at
  least one existing governing `REQ-*`;
- every material product outcome satisfies the acceptance-closure contract
  above;
- each epic/feature traces to requirements or an explicit accepted delta;
- each feature boundary was checked proportionally to evidence, and no concrete
  independently acceptable product outcome remains hidden inside another
  feature;
- no product feature uses `FT-000`;
- blockers and optional clarification metadata are truthful;
- no task or testing-policy artifact was created;
- decomposition does not claim unperformed architecture design or verification.
</validation>

<handoff_contract>
Successful decomposition -> enabled `/review-feat-plan`, otherwise the next
selected design/tasking operation. A disabled review requires no APPROVE or
report. Global design, when selected/needed, belongs to `/spec-design`.
A real feature ambiguity may propose `/feature-doctor FT-<NNN>`; it is not an
additional mandatory gate. Return decomposition outcome and immediate route with
the common feedback.
</handoff_contract>
