---
description: Decompose a clarified PRD into Memory Bank product, requirements, epics, and features.
status: active
---
# /prd - Clarified PRD -> product plan

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
Require:
- `.memory-bank/prd.md` with `type: prd`,
  `clarification_status: complete`, and `constitution_checked: true`;
- `.memory-bank/spec-backbone.md` with
  `Pre-PRD Spec Status: ready_for_prd` and explicit decomposition inputs;
- a pure `.memory-bank/spec-index.md`.

Read the Constitution before writing. Use spec-backbone decomposition inputs
and only canonical specs routed by spec-index that are relevant to the current
PRD. Do not load every SDD spec by default.

Stop and route to the owning command when an input is missing, stale,
placeholder-only, blocked, internally inconsistent, or has broken relevant
links:
- PRD/Constitution issue -> `/write-prd` or `/constitution`;
- framing/index issue -> `/spec-init`.
</input_contract>

<hard_invariants>
- Do not write/clarify the PRD, perform architecture design, create TASK records
  or implementation plans, choose test levels, define global testing gates, or
  create/modify `.memory-bank/testing/*`. `/prd` does not create or modify files
  under `.memory-bank/testing/`.
- Do not let a lower-precedence PRD or feature override Constitution or an
  authoritative canonical spec.
- `FT-000` is reserved for Foundation Dev Path and is never a product feature.
- Do not set feature `spec_design_status: complete` before the global design
  backbone exists and feature concerns are actually satisfied.
- Do not add clarification metadata to every feature; it is only for an
  explicit feature-level decomposition blocker.
</hard_invariants>

<operator_decisions>
The agent may choose ordinary decomposition tactics, but a real ambiguity or
branch that could materially change product scope, REQ/EP/FT boundaries,
acceptance, actors, behavior, ownership, or traceability belongs to the
operator.

In interactive mode, ask one question or a small group of tightly related
questions, explain what the decomposition choice changes, and optionally
recommend an option. The recommendation is not accepted without an explicit
answer. Record accepted decomposition-only decisions in
`.protocols/PRD-BOOTSTRAP/decision-log.md` and the owning product artifact,
remove contradictions, then revalidate before deriving dependent docs. If the
answer changes PRD scope, behavior, acceptance, or another PRD-owned contract,
route it through `/write-prd` and stop this run before continuing decomposition.

In autonomous mode, use only an already accepted authoritative decision. If
none exists, record the question/affected artifacts and set terminal state
`HALT_BLOCKING_QUESTIONS`; do not write the affected decomposition as fact.
</operator_decisions>

<required_outputs>
Create `.protocols/PRD-BOOTSTRAP/plan.md` and `decision-log.md` if missing.

Update `product.md` with product identity, core value, audience, primary flow,
constraints, and non-goals. Update `requirements.md` with stable `REQ-*` IDs,
out-of-scope items, and RTM `REQ -> Epic -> Feature -> Test`.

Each epic records value, success metrics, acceptance criteria, evidence-backed
source/normative/constraint links when useful. Set epic `status: draft` by
default; promote it to document `status: active` only after its open questions
are closed. This document status is not the task lifecycle.

Each feature records:
- use cases, acceptance criteria, and edge/failure behavior;
- optional evidence-backed source artifacts, normative inputs,
  constraints/invariants, and verification targets;
- optional `## Behavior specs` routing only; do not create behavior JSON;
- `status: draft` by default;
- an `## SDD Design Gate` note routing immediately to mandatory
  `/spec-design`, with feature-level canonical design completed later by
  `/prd-to-tasks` or `/spec-auto` after any required Foundation Gate;
- candidate canonical links only when grounded in evidence; omit
  `spec_design_status` unless its existing truthful state must be preserved.

When the clarified PRD leaves a feature-level blocker, optional metadata remains:

```yaml
clarification_status: pending|blocked
last_clarified: null
clarification_questions: 0
```

Update `.memory-bank/index.md` with annotated links.
</required_outputs>

<agent_discretion>
Choose source-reading order, tools, decomposition technique, epic/feature
grouping, filenames/slugs, and the smallest coherent product structure. Use
traceability, independent product value, acceptance cohesion, and downstream
designability as coverage criteria, not a mandatory reasoning sequence.
</agent_discretion>

<validation>
Verify:
- every derived claim is supported by the clarified PRD or authoritative
  linked evidence;
- every requirement has a stable `REQ-*` ID;
- each epic/feature traces to requirements or an explicit accepted delta;
- no product feature uses `FT-000`;
- blockers and optional clarification metadata are truthful;
- no task or testing-policy artifact was created;
- global backbone remains pending until `/spec-design`.
</validation>

<handoff_contract>
For high-risk, large, or autonomous work, the immediate handoff is mandatory
fresh-context `/review-feat-plan`. For small manual work it is recommended unless
the Constitution/operator requires it. After applicable approval, continue to
`/spec-design`.

If one feature is explicitly pending/blocked, `/clarify-feature FT-<NNN>` may
resolve it before review/design. Do not copy or recommend the entire downstream
execution chain from this leaf command.
</handoff_contract>
