---
description: Frame or design a feature under explicitly authorized autonomy.
status: active
---
# /spec-auto — Autonomous design

## Outcome
Produce useful framing (`--init`) or reconcile one product feature's design
(`FT-<NNN>`) under the active autonomous instruction. Apply
`.memory-bank/workflows/execute-loop.md#working-policy` and
`.memory-bank/workflows/sdd-design-contract.md`.

Use explicit product input, accepted constraints, relevant existing specs, and
current-state evidence. A missing prior command or review is not a blocker.
Infer `--init` only when the framing target is clear; otherwise resolve the
feature from the caller's scope. `FT-000` Foundation work remains the domain of
`/foundation-to-tasks`.

## Work
In authorized autonomous work, settle necessary technical/design choices within
the delegated goal and record material decisions. Do not change explicit product
requirements, constraints, or permissions by inference. If a needed decision
exceeds that authority, preserve the question and pause dependent work using the
caller's existing `HALT_BLOCKING_QUESTIONS|HALT_CLARIFICATION_REQUIRED` route.

For `--init`, maintain the same useful glossary, decomposition inputs, registry,
and `Pre-PRD Spec Status: ready_for_prd|blocked` as `/spec-init`; preliminary
hints are not an accepted dependency graph.

For a feature, reconcile its applicable canonical specs and direct
`spec_design_links`. Respect accepted architecture and code ownership; update
an authorized design delta and affected consumers without a separate command
round trip. Use `/spec-redesign` when a focused impact analysis is useful.

Set `spec_design_status` truthfully:
- `complete`: applicable design is concrete enough for the intended work;
- `not_required`: local/simple work needs no separate feature design;
- `blocked`: a needed decision or technical definition remains unresolved.

Keep decisions at their canonical owners. Do not create feature-owned
multi-concern spec hubs, empty artifacts, duplicate graphs, or per-run design
history. Check changed links, consistency, and actual prerequisites.

## Handoff
Report changed design, decisions, and remaining questions. Recommend
`/feature-to-tasks` when a queue is useful, or resume the caller's next action.
Neither a fresh child context nor a separate review is required by this skill.
