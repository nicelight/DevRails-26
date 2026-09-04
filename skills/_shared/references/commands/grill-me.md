---
description: Grill a product idea to shared understanding and keep its Product Brief durable.
status: active
---
# /grill-me - Product discovery by grilling

<!-- Grilling mechanics adapted from https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md -->

<objective>
Stress-test a raw or uncertain product idea until the operator and agent share
a clear understanding. Keep the settled result in
`.memory-bank/analysis/brief.md` for `/constitution` and `/write-prd`.

Read the existing brief and relevant project evidence when present. If only
legacy `.memory-bank/analysis/product-brief.md` or
`.memory-bank/analysis/brainstorming/BR-*.md` exists, use it as migration
context. Before interpreting product intent, sources, or operator answers,
load and apply the installed `creator-vibe` skill.
</objective>

<grilling>
Map the subject as a **design tree**: every decision branches into the
decisions that depend on it.

Work in **rounds**. The **frontier** is every decision whose prerequisites are
settled: the questions that can be asked now without guessing. Ask the whole
frontier in one round, numbering each question and giving a recommended
answer. A question that depends on another open question belongs to a later
round.

Format each question like this:

```
❓ **Q1** - **<question title>**: <question body>

➡️ <recommended answer>
```

Each answer reshapes the tree. Recompute the frontier before the next round.

Finding facts is the agent's job. Use repository evidence, tools, research,
and bounded exploration as useful rather than asking the operator for facts
that can be discovered. Running research delays only the dependent branches.
Product decisions remain the operator's and require an explicit answer.

Use intent, users, problem, desired outcome, value, product direction, MVP
boundary, non-goals, success, constraints, risks, assumptions, and open
questions as a coverage lens, not a fixed questionnaire.

The session ends when the frontier is empty. Ask the operator to confirm that
the understanding is shared before advancing.
</grilling>

<durable_output>
After each answered round, create or update
`.memory-bank/analysis/index.md` and `.memory-bank/analysis/brief.md` so the
session can resume without chat history. Keep material current findings,
sources, explicit decisions and rationale, constraints, rejected or deferred
directions, and open questions; do not preserve the interview transcript.

Use this minimum brief shape:

```md
---
description: Durable Product Brief produced by /grill-me.
status: draft
type: product-brief
decision: blocked
---
# Product Brief

## Intent
## Problem / Users / Outcome
## Product Direction
## MVP Boundary / Non-goals
## Findings / Sources
## Decisions / Rationale
## Constraints / Risks / Assumptions
## Rejected / Deferred
## Open Questions
## Decision
blocked
```

Keep recommendations and unresolved choices separate from accepted decisions.
After the operator confirms shared understanding, set `status: active`,
`decision: proceed`, and the final `## Decision` to `proceed`. Update the
analysis index with the brief link, decision, and immediate next command.
</durable_output>

<agent_discretion>
Choose the exploration order, ideation techniques, tools, number of useful
directions, and grouping of findings according to the maturity of the idea.
Stop expanding when additional ideas no longer improve the operator's decision.
Keep a clear concept short; explore a genuinely divergent problem more deeply.
</agent_discretion>

<handoff_contract>
A confirmed brief with `decision: proceed` hands off to `/write-prd` when
project principles are already `ratified|partial|skipped`; otherwise it hands
off to `/constitution`. A blocked brief continues through `/grill-me`.
</handoff_contract>
