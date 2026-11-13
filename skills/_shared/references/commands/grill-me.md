---
description: Clarify a product idea with the operator and preserve its intent in a durable brief.
status: active
---
# /grill-me — Clarify the idea

## Outcome
A shared understanding of the product in `.memory-bank/analysis/brief.md`,
linked from `analysis/index.md`.

Apply `.memory-bank/workflows/execute-loop.md#working-policy`. Before
interpreting the idea, use the installed `creator-vibe` skill. Read an existing
brief and relevant evidence; legacy product-brief/brainstorming files may supply
context.

## Conversation
Explore the questions that materially affect intent, users, desired experience,
MVP scope, constraints, and success. Research discoverable facts rather than
asking the operator for them. Group related questions, explain their effect,
and recommend an answer when useful. Resolve dependent questions after their
premises are settled. Stop expanding when the idea is clear enough for the
requested next work.

Keep accepted decisions distinct from suggestions and open questions. In
manual work, confirm that the resulting understanding matches the operator's
intent; this can be part of the ordinary conversation.

## Durable result
Update the brief after useful decisions so another session can continue. Keep
intent, users/problem/outcome, product direction, MVP/non-goals, sources,
decisions/rationale, constraints, deferred directions, and open questions;
omit empty sections and the interview transcript.

Use frontmatter `type: product-brief`, `status: draft|active`, and
`decision: blocked|proceed`, plus a matching `## Decision`. `proceed` means the
understanding is sufficient for the next agreed work, not that every future
question has an answer. Record a real unresolved decision and the affected work
when `blocked`.

## Handoff
Report the settled direction and any decision still needed. A useful next step
is `/write-prd`, or `/constitution` when project principles need discussion.
The same agent may continue the agreed work without a separate command.
