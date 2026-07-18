---
description: Create or update a concise Product Brief as the PRD input contract.
status: active
---
# /brief - Product Brief input contract

<objective>
Create or update `.memory-bank/analysis/product-brief.md` as the concise product
input contract for `/constitution` when needed and for `/write-prd`.

The Product Brief captures what to build, for whom, why, the MVP boundary, and
known decisions. It is not a PRD, backlog, marketing document, research report,
or task plan.
</objective>

<input_contract>
Use `/brief` for a concept that is coherent enough to summarize, either directly
from operator input or after `/brainstorm`.

Read when present and relevant:
- the latest `.memory-bank/analysis/brainstorming/BR-*.md`;
- `.memory-bank/analysis/product-brief.md`;
- `.memory-bank/constitution.md` for next-step routing;
- operator-provided concept, notes, or PRD-like text.

If brainstorming exists, include it under `Source artifacts`. A report is not
required when the operator supplied a clear concept directly.
</input_contract>

<hard_invariants>
Allowed outputs are only:
- `.memory-bank/analysis/index.md`;
- `.memory-bank/analysis/product-brief.md`.

Do not create features, task records, implementation plans, research reports,
PRFAQ, command aliases, or `.memory-bank/analysis/assumptions.md`. Preserve the
existing decision vocabulary `proceed|blocked`; do not add `no-go`.
</hard_invariants>

<operator_decisions>
When a relevant ambiguity or branch can change product intent, users, scope,
non-goals, value, constraints, success measures, or the PRD input, interview the
operator before choosing. Questions are adaptive: ask one or group only tightly
related decisions, use multiple choice or open form as useful, explain the
impact, and optionally recommend an option.

A recommendation/default is not accepted until the operator explicitly answers.
Do not run a decorative questionnaire when authoritative evidence is already
clear. Put accepted decisions into the applicable brief sections and keep
unresolved material choices under `Open Questions` with `Decision: blocked`.
</operator_decisions>

<required_outputs>
Create or update `.memory-bank/analysis/product-brief.md` with required
frontmatter:

```yaml
---
description: Product Brief input contract for PRD.
status: draft
type: product-brief
---
```

Keep the brief concise and cover:
- Metadata: status, `Decision: proceed|blocked`, and source artifacts;
- One-liner, Target Users, Problem, Current Alternatives;
- Value Proposition and Product Concept;
- MVP Scope and Non-goals;
- Success Metrics and Constraints;
- Assumptions, Risks, Open Questions;
- PRD Input Summary;
- final `## Decision` with `proceed|blocked`.

If `.memory-bank/analysis/index.md` is created, give it analysis-index
frontmatter. Update the index with the brief status, source artifacts, decision,
and immediate next command.
</required_outputs>

<agent_discretion>
Choose the reading order, analysis tools, question grouping, and brief phrasing.
Use the smallest structure that still covers the required content; do not pad to
a page count or ask formal questions for already-resolved sections.
</agent_discretion>

<validation>
Set `Decision: proceed` only when the brief is coherent enough for governing
principles and PRD clarification. Set `Decision: blocked` when a missing
operator choice would make the PRD unreliable. Verify that accepted decisions
are applied consistently, assumptions remain labelled, and the index agrees
with the brief.
</validation>

<handoff_contract>
- `proceed` + Constitution `project_principles: ratified|partial` ->
  `/write-prd`.
- `proceed` + Constitution `framework-default|skipped|missing` ->
  `/constitution`, unless the operator explicitly chooses the supported skip
  route; then `/write-prd` records that context.
- `blocked` -> obtain the listed operator decisions and rerun `/brief`.

Do not copy the full downstream workflow or route directly to task generation.
</handoff_contract>
