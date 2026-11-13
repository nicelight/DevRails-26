---
description: Apply a design change and reconcile only the work it actually affects.
status: active
---
# /spec-redesign — Reconcile design changes

## Outcome
Update the canonical design and affected consumers for an authorized change.
Apply `.memory-bank/workflows/execute-loop.md#working-policy` and
`.memory-bank/workflows/sdd-design-contract.md`.

Read the requested delta, relevant specs, feature/task links, and current-state
evidence. If no design exists, establish the necessary initial design; a separate
`/spec-design` invocation is optional.

## Reconciliation
Update each changed rule at its canonical owner and trace its affected consumers.
Preserve unaffected work and historical evidence. A missing review, revision, or
command marker is not proof that all planning is invalid.

Describe impact as `none|bounded|global`:
- `none`: planning meaning is unchanged;
- `bounded`: named features or tasks need adjustment;
- `global`: the change genuinely affects product-wide planning.

Keep Planning Revision unchanged for none/bounded and increment it once for a
global change when the backbone tracks a revision. It is navigation/history,
not an execution approval token. Do not infer global impact from a shared file's
location alone.

Reconcile affected specs, features, plans, and queued task context directly within
the authorized change. Preserve valid task IDs, lifecycle history, and evidence;
do not fabricate completed proof or silently redefine completed outcomes.
If reconciliation remains unfinished, an existing
`PLANNING_RECONCILIATION_REQUIRED` marker may identify the affected feature;
remove it when the work is reconciled. The actual unresolved mismatch determines
whether dependent work can continue, not the marker alone.

Revisit Foundation only when its baseline or decision changes. Record unresolved
questions where the next agent will find them; stop only work that depends on a
missing decision or prerequisite.

## Handoff
Report changed decisions, impact, reconciled consumers, and remaining work.
Continue the useful next action in the same context when possible.
`/feature-to-tasks`, `/spec-auto`, or a focused review may help; no mandatory
repair/review chain follows from this command.
