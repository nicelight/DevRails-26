---
description: Adaptively resolve unknowns and contradictions before planning or coding.
status: active
---
# /discuss - Clarify before work

<objective>
Resolve a bounded set of unknowns, contradictions, or hidden requirements and
leave durable operator decisions for the owning workflow step.
</objective>

<input_contract>
Identify the discussion scope from `$ARGUMENTS` or ask the operator to name it.
Read only the relevant PRD, Memory Bank artifacts, protocols, and accepted
decisions needed to understand that scope. Respect their normal source-of-truth
precedence and ownership.
</input_contract>

<hard_invariants>
- `/discuss` does not invent product, architecture, contract, task, tier, or
  verification decisions.
- It does not create a new status model or bypass the owning skill's gate.
- A recommendation is advisory until the operator explicitly accepts it.
- Keep unresolved dependent work blocked; independent read-only analysis may
  continue when it does not pre-decide the choice.
</hard_invariants>

<operator_decisions>
Identify ambiguities, decisions needed, and risks. Whenever a real branch can
affect the current outcome or downstream contract, ask the operator. Adapt the
format and grouping to the issue: one question, a small group of tightly related
questions, multiple choice, or open form. Explain impact and optionally give a
recommendation with rationale.

Do not use a fixed round size, questionnaire UI, or answer-length limit. Do not
ask formal questions for issues already resolved by authoritative evidence.
Silence or an unanswered recommendation is not a decision.
</operator_decisions>

<required_outputs>
Record accepted answers in the existing `.protocols/<ID>/decision-log.md` for
the discussed scope and apply each answer to the canonical artifact owned by
the relevant stage, such as PRD, requirements, feature, spec, or protocol.
Remove contradictory superseded wording and record unresolved questions with
their affected scope and owner.

Do not create a separate interview registry.
</required_outputs>

<agent_discretion>
Choose evidence order, tools, analysis depth, question grouping, and concise
recommendation form. Use the smallest discussion that resolves the material
branch and do not restate the entire downstream workflow.
</agent_discretion>

<validation>
Re-read changed canonical sections and confirm that accepted decisions are
durable, contradictions are removed, unresolved branches remain explicit, and
the owning skill's existing statuses/blockers still describe the real state.
</validation>

<handoff_contract>
Return to the immediate owning skill: `/brief`, `/constitution`, `/write-prd`,
`/spec-init`, `/prd`, `/clarify-feature FT-<NNN>`, or `/spec-design` according
to the artifact and blocker being resolved. `/discuss` never routes directly
past a required product/design gate or to execution without an already-ready
indexed task.
</handoff_contract>
