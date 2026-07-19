---
description: Facilitated ideation report before Product Brief; AI coaches, operator intent drives.
status: active
---
# /brainstorm - Facilitated ideation

<objective>
Turn a raw or divergent idea into a compact, traceable brainstorming report
under `.memory-bank/analysis/brainstorming/` without promoting ideas to
requirements.

The agent facilitates exploration and may recommend directions. The operator
owns product intent, priorities, selections, and rejections.
</objective>

<input_contract>
Use `/brainstorm` when the problem space is unclear or several materially
different product directions are plausible. Read the operator's input and any
relevant existing analysis report or Product Brief before updating an existing
line of thought.

Create if missing:
- `.memory-bank/analysis/index.md`
- `.memory-bank/analysis/brainstorming/`

Allocate the next free `BR-<NNN>.md` ID. If creating
`.memory-bank/analysis/index.md`, include frontmatter with
`description: Analysis artifact index.` and `status: active`.
</input_contract>

<hard_invariants>
- Raw ideas are not requirements or accepted product decisions.
- Do not create a PRD, Product Brief, feature/task records, implementation plan,
  research report, PRFAQ, command alias, or separate
  `.memory-bank/analysis/assumptions.md`.
- Do not perform research in this command. Record research needs as risks or
  open questions.
- A recommendation is not an operator decision. Silence or continuation is not
  acceptance.
</hard_invariants>

<operator_decisions>
Interview adaptively whenever a real ambiguity or branch could change the
selected direction, target users, scope, non-goals, constraints, or the Product
Brief handoff. Ask one question or a small group of tightly related questions,
using multiple choice or open form according to the decision. Explain what the
choice changes and optionally recommend an option with rationale.

Do not ask questions merely to fill the report. When authoritative operator
input already resolves the issue, apply it without reconfirmation. Record only
explicitly accepted directions under `Selected Directions`; keep unresolved
choices under `Open Questions` and do not present them as decided.
</operator_decisions>

<required_outputs>
Create `.memory-bank/analysis/brainstorming/BR-<NNN>.md` with this minimum
shape:

```md
---
description: Brainstorming report BR-<NNN>.
status: active
type: brainstorming-report
id: BR-<NNN>
---
# Brainstorming Report - BR-<NNN>

## Status
- Date: YYYY-MM-DD
- Facilitator: AI
- Source of product intent: operator
- Recommended next step: /brief

## Problem Space
## Goals
## Constraints
## Techniques Used
## Raw Ideas
## Clusters / Themes
## Selected Directions
## Rejected Directions
## Assumptions
## Open Questions
## Recommended Next Step
/brief
```

The `id` must match the filename. Assumptions and open questions stay in the
report. Update `.memory-bank/analysis/index.md` with the report link and its
immediate recommended next step.
</required_outputs>

<agent_discretion>
Choose the exploration order, ideation techniques, tools, number of useful
directions, and grouping of findings according to the maturity of the idea.
Stop expanding when additional ideas no longer improve the operator's decision.
Keep a clear concept short; explore a genuinely divergent problem more deeply.
</agent_discretion>

<validation>
Before handoff, verify that:
- the report and index are valid and linked;
- selected/rejected directions reflect explicit operator decisions;
- assumptions are labelled rather than silently accepted;
- unresolved material branches remain visible;
- no requirements or downstream planning artifacts were created.
</validation>

<handoff_contract>
The only normal immediate handoff is `/brief`. If unresolved questions prevent
a coherent Product Brief, continue `/brainstorm` after the operator answers
instead of implying readiness. Do not route directly to `/feature-to-tasks` or
execution commands.
</handoff_contract>
