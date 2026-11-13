---
description: Map accepted product requirements into coherent epics, features, and acceptance criteria.
status: active
---
# /prd-to-features — Product decomposition

## Outcome
Maintain `.memory-bank/product.md`, `requirements.md`, `epics/EP-*.md`,
`features/FT-*.md`, and their navigation from a sufficiently clear PRD or accepted
product delta. Apply `.memory-bank/workflows/execute-loop.md#working-policy`.

Read relevant project principles, product sources, framing, and canonical specs.
Resolve material uncertainty about behavior, acceptance, or product boundaries
under the working policy; do not require completion of earlier commands when
the needed information already exists.

## Decomposition
Choose the smallest coherent set of independently useful product outcomes.
Technical layers, migrations, security concerns, and files do not by themselves
create separate features. Preserve existing identities when their meaning is
unchanged. `FT-000` remains reserved for Foundation, not product behavior.

Maintain stable `REQ-*` IDs and RTM `REQ -> Epic -> Feature -> Test`. Epics and
features describe value, scope, observable acceptance, and relevant source links.
Use document `status: draft` while material questions remain, and `active` when
their content is settled; these are not task lifecycle statuses.

Each product feature keeps `## Acceptance Criteria` with stable
`### FT-<NNN>-AC-<NNN>` headings. Each AC names at least one governing requirement
on `- REQ: REQ-<NNN>[, ...]`, the observable result, and its verification method.
Preserve IDs for unchanged behavior; do not renumber or reuse retired IDs.

Cover material failure outcomes and qualities through accepted ACs. An accepted
exclusion can use `Disposition: out_of_scope`, its source, and
`Change route: /write-prd`. Material quality requirements retain their accepted
criterion and decisive conditions; reference them instead of duplicating prose.
Do not invent product targets to complete decomposition.

## Durable result
Update affected product artifacts and index links. Optional feature clarification
metadata is `clarification_status: pending|complete|blocked`, `last_clarified`,
and `clarification_questions`; use it only when useful for a real clarification.
Keep design links as links, not speculative specs. `spec_design_status` describes
actual design readiness, never mere completion of this command.

A protocol plan or decision log is optional when the product artifacts already
preserve the decisions and next work. Reconcile an accepted product correction
in the same session instead of requiring another command first.

Check traceability, stable IDs, AC/REQ links, and whether the feature boundaries
hide independently acceptable outcomes. Keep this check proportional to the
product; it needs no separate report or review context.

## Handoff
Report the resulting product map and remaining questions. `/spec-design` or
`/feature-to-tasks` may be useful next. `/review-feat-plan` is an optional focused
review, or required when the operator explicitly requests it; its absence alone
is not a development blocker.
