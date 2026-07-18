---
description: Turn Product Brief, Constitution, and optional context into a clarified PRD.
status: active
---
# /write-prd - Product input -> clarified PRD

<objective>
Create or update `.memory-bank/prd.md` as the clarified, Constitution-checked
product source for `/spec-init` and `/prd`.

This command resolves product-level ambiguity. It does not decompose the PRD
into epics/features or perform architecture/task design.
</objective>

<input_contract>
Require at least one current PRD source:
- `.memory-bank/analysis/product-brief.md`;
- explicit operator-provided PRD text/file;
- existing `prd.md` or `.memory-bank/prd.md` being clarified.

Read `.memory-bank/constitution.md`. Read only relevant optional context from
brainstorming, product/requirements, glossary/invariants, spec-backbone,
spec-index, canonical contracts/states/runbooks/testing docs, and `$ARGUMENTS`.

If no PRD source exists, stop and request `/brief` or explicit source text. If
the Constitution is missing, ask for `/constitution` or explicit permission to
continue without ratified project principles.
</input_contract>

<hard_invariants>
- Constitution and explicit accepted operator decisions outrank lower-level
  product evidence.
- Do not weaken, reinterpret, or silently override the Constitution.
- Ground every material PRD claim in source evidence or an accepted answer.
- Do not create product decomposition, feature/task records, implementation
  plans, or SDD design specs.
- A recommendation/default is not an operator decision; silence is not consent.
</hard_invariants>

<operator_decisions>
Inspect the PRD for material ambiguity across these coverage areas, in any
order:
- functional scope and behavior;
- users/actors and UX flows;
- domain/data model;
- non-functional qualities;
- integrations and external dependencies;
- edge cases/failure handling;
- constraints/tradeoffs and terminology;
- acceptance criteria, verification, and completion signals;
- unresolved markers such as `NEEDS CLARIFICATION`, `TBD`, `TODO`, or `???`.

Ask the operator whenever a real ambiguity or branch could affect product
behavior, scope, architecture, data, decomposition, testing, operations,
security/compliance, or acceptance. Adapt the interview to the evidence: ask
one question or a small group of tightly related questions, use multiple choice
or open form, explain impact, and optionally recommend an option. Do not impose
a question quota, fixed questionnaire, or short-answer word limit. Do not ask
decorative questions for already-authoritative evidence.

In unattended use, apply only previously accepted authoritative decisions. If
one is missing, record the question and affected PRD sections and stop with
`HALT_BLOCKING_QUESTIONS` or `HALT_CLARIFICATION_REQUIRED`.
</operator_decisions>

<required_outputs>
Create or update `.memory-bank/prd.md` with:

```yaml
---
description: Product Requirements Document.
status: draft
type: prd
clarification_status: pending
constitution_checked: true
---
```

Use the repository's stronger local template when present; otherwise cover:
Source Inputs, Product Summary, Goals, Non-goals, Users / Actors, Functional and
Non-functional Requirements, Data / Domain Model, UX / Interaction Flow,
Integrations / Dependencies, Edge Cases / Failure Handling, Acceptance
Criteria, Verification Strategy, Clarifications, and Unresolved Blockers.

For each accepted answer:
- append a dated `## Clarifications` session entry;
- apply the decision to the owning PRD section;
- remove contradictory old wording;
- rerun the Constitution check for affected content.

If a Constitution change is required, record `## Constitution Amendment
Candidates` with current principle, conflict, proposed amendment, and rationale;
keep the dependent PRD handoff blocked until the operator resolves the amendment
route.
</required_outputs>

<agent_discretion>
Choose reading order, tools, analysis depth, question form/grouping, and PRD
wording. Use risk and downstream impact to prioritize clarification. Working
notes may stay in context; only durable decisions, blockers, and required PRD
content belong in canonical artifacts.
</agent_discretion>

<validation>
Set:
- `clarification_status: complete` only when no high-impact ambiguity or
  blocking marker remains;
- `pending` when clarification remains and decomposition must wait;
- `blocked` when an unresolved decision prevents a reliable PRD.

Set `constitution_checked: true` only after the current PRD content passes the
Constitution gate. Keep blockers in `## Unresolved Blockers`, not hidden in
prose. Revalidate source consistency after every accepted decision.
</validation>

<handoff_contract>
The immediate handoff is `/spec-init` only when
`clarification_status: complete` and `constitution_checked: true`. Otherwise
answer the recorded operator questions or resolve `/constitution`, then rerun
`/write-prd`.
</handoff_contract>
