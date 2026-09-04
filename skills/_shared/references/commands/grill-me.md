---
description: Grill a product idea to shared understanding and persist its durable brief.
status: active
---
# /grill-me - Product discovery

<objective>
Stress-test a product idea until the operator and agent share one understanding,
then create or update `.memory-bank/analysis/brief.md` as the durable discovery
source for `/constitution` and `/write-prd`.

Before interpreting the idea, sources, or an existing brief, load and apply the
installed `creator-vibe` skill.
</objective>

<input_contract>
Start from `$ARGUMENTS`, operator-provided sources, the existing
`.memory-bank/analysis/brief.md`, and relevant project evidence. If the current
brief is absent, use legacy `.memory-bank/analysis/product-brief.md` or
`.memory-bank/analysis/brainstorming/BR-*.md` only as migration evidence. When
the product's center is still missing, ask one sharp opening question.
Otherwise begin from the unresolved or materially changed decisions already
visible.
</input_contract>

<grilling>
Map the subject as a **design tree**: every decision branches into the decisions
that depend on it.

Work the tree in **rounds**. The **frontier** is every decision whose
prerequisites are settled. Ask the whole frontier in one round, number each
question, give your recommended answer, then wait for the operator's answers.
Use this shape:

```md
❓ **Q1** - **<question title>**: <question body>

➡️ <recommended answer>

---

❓ **Q2** - **<question title>**: <question body>

➡️ <recommended answer>
```

After each round, reshape the tree and recompute the frontier. A question that
depends on another decision still open belongs to a later round.

Finding facts is the agent's job. Inspect the repository, tools, and external
sources as needed; delegate bounded fact-finding to a `ROLE: Explorer` when
useful. An unsettled investigation delays only the branches that depend on it,
not the rest of the frontier.

Product decisions belong to the operator. Recommendations are advisory until
the operator answers.

When the frontier is empty, summarize the resulting understanding and ask the
operator to confirm that it is shared. Persist the brief only after that
confirmation.
</grilling>

<brief_artifact>
Create `.memory-bank/analysis/index.md` when missing, then create or update
`.memory-bank/analysis/brief.md` with:

```yaml
---
description: Durable product discovery brief.
status: draft
type: product-brief
---
```

Keep current durable knowledge rather than a transcript. Use only the sections
that carry value, normally covering product intent; users, problem, and value;
product direction and MVP boundary; findings and sources; accepted decisions
and rationale; constraints and success conditions; rejected or deferred
directions; assumptions; and open questions.

Finish the brief with a `## Decision` section containing one current value:
`proceed` or `blocked`. Update the analysis index with the brief link, decision,
and immediate next command. When the analysis index is first created, add its
annotated link to `.memory-bank/index.md`.
</brief_artifact>

<agent_discretion>
Choose the exploration order, ideation techniques, tools, number of useful
directions, and grouping of findings according to the maturity of the idea.
Stop expanding when additional ideas no longer improve the operator's decision.
Keep a clear concept short; explore a genuinely divergent problem more deeply.
</agent_discretion>

<handoff_contract>
- `proceed` with `project_principles: ratified|partial` -> `/write-prd`.
- `proceed` with framework-default, skipped, or missing project principles ->
  `/constitution`.
- `blocked` -> continue `/grill-me` from the recorded open decisions.
</handoff_contract>
