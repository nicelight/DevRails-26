---
description: Frame product vocabulary, scenarios, and domain boundaries for useful decomposition.
status: active
---
# /spec-init — Frame the product

## Outcome
Enough shared vocabulary and domain/scenario context to derive meaningful
requirements and features. Apply
`.memory-bank/workflows/execute-loop.md#working-policy`.

Use the current PRD or other explicit product input, project principles, and
relevant existing specs. Ask about unclear product meaning when it affects the
requested decomposition; missing command-history markers alone are not blockers.

## Framing
Reconcile term meanings in `.memory-bank/glossary.md`; keep unresolved design
questions with their owning concern. Capture useful actors, scenarios, entities,
ownership/lifecycle hints, constraints, non-goals, and risks in the framing below.
Link a sufficient PRD section instead of copying it.

Use `.memory-bank/spec-backbone.md` for decomposition inputs, open design
questions, and handoff. Keep `.memory-bank/spec-index.md` a registry of canonical
specs. Additional scenario/domain/invariant/state documents are useful only when
they make a real decision clearer. Preliminary boundary hints are not accepted
architecture or dependency edges.

## Durable result
Preserve these backbone sections when relevant:

- `## Pre-PRD Spec Status` with `Status: ready_for_prd|blocked`;
- `## Decomposition Inputs` with source links;
- `## Open Design Questions`;
- `## Handoff To /prd-to-features` and `## Handoff To /spec-design`.

`ready_for_prd` means framing is sufficient for decomposition. `blocked` names
the unresolved decision and affected work. Preserve an existing Global Backbone
Planning Revision; framing alone does not change accepted design.

If `user-scenarios.md` is useful, its `## Review Status` uses
`Status: draft|reviewed|blocked`. Mark reviewed only after checking its meaning
against accepted product intent. A separate reviewer or review command is not
required. Do not demand a scenario document for decisions that do not need it.

Check changed wording and links for consistency. Apply accepted corrections to
related product artifacts directly; retain only material unresolved questions.

## Handoff
Recommend `/prd-to-features` when decomposition is useful, or `/spec-design`
when the next unresolved question is architectural. These are focused tools,
not mandatory transitions or a reason to restart work already completed.
