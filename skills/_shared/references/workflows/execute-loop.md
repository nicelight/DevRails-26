---
description: Product, design, tasking, and execution ownership and immediate handoffs.
status: active
---
# Execute loop (PRD → Feature → Tasks)

Apply `autonomy-policy.md` for decisions, effective settings, host ownership,
and recovery. These are semantic routes; the host selects and launches the
next applicable operation without requiring every station or artifact.

## Principle: no task explosion

- Raw or uncertain ideas: `/grill-me` produces the durable brief, then
  `/constitution` if principles remain unresolved, otherwise `/write-prd`.
  A clear authoritative source can enter at Constitution/PRD directly.
- Brownfield: `/map-codebase` records as-is evidence and returns to the supplied
  PRD/delta owner. It does not invent a roadmap or re-request supplied input.
- `/constitution` owns governing principles; `/write-prd` owns product targets,
  scope, observable acceptance and material NFRs. No downstream artifact invents
  a missing product target. New PRD → `/spec-init`; updated PRD → `/prd-to-features`.
- `/spec-init` owns lightweight domain/scenario framing. `/prd-to-features`
  owns REQ/EP/FT decomposition and stable ACs, not tasks or testing documentation.
  Enabled `/review-feat-plan` assesses that decomposition; otherwise continue
  with its review skipped, not a fabricated APPROVE.
- `/spec-design` owns the initial shared backbone and Foundation decision;
  accepted backbone changes belong to `/spec-redesign`. Use only applicable
  canonical artifacts under `sdd-design-contract.md`.
- `/foundation-to-tasks` owns the minimal FT-000 executable baseline when needed.
  Brownfield proof can establish that no Foundation queue is required.

Material acceptance follows accepted REQ/AC or a sourced out-of-scope decision,
exact task ownership, and the selected proof path. Record observed proof when
performed and absence when skipped; implementation completion alone does not
establish verified product acceptance. Simple quality criteria stay in REQ/AC;
subject specs own only non-trivial reproducible measurement detail.

## Planning Redesign Boundary

`/spec-redesign` returns `none|bounded|global` from evidenced planning impact.
`none` preserves revision/reviews. `bounded` preserves revision and names only
affected features, marking their planning `PLANNING_RECONCILIATION_REQUIRED`
where repair is needed. `global` increments the positive Planning Revision once
only when durable planning semantics changed with product-wide impact.
Initial accepted design establishes revision 1 from 0. Uncertain impact needs
evidence, not an automatic global reset.

Affected tasking returns to `/feature-to-tasks`; Foundation is revisited only
if its baseline contract changed. Preserve task identity, statuses, completed
evidence, and unaffected work. Enabled task-plan reviews bind to current
`REVIEWED_PLANNING_REVISION`; disabled reviews do not require APPROVE. Status,
evidence-only closure, and equivalent locator repair do not invalidate review.

## Fresh Feature Tasking Boundary

One `/feature-to-tasks FT-<NNN>` invocation owns one product feature, canonical
concern reconciliation and complete indexed task cards. `/spec-auto` can provide
feature design when needed. Separate Architect/reviewer contexts are conditional
DSH assignments, not prerequisites merely because the run is autonomous.

Handoff is enabled `/review-tasks-plan FT-<NNN>` or the prepared task queue when
review is skipped. A performed REJECT proposes its actual repair owner through
the decision flow; repair preserves unaffected work and returns to the enabled
review of changed claims. Missing context goes to its evidence/decision owner.

## Execution-Cohesive Task Boundary

A task owns one independently completable material change result. Tests, probes,
rollback checks and UAT belong with that result; files, layers, AC count and
artifacts do not create a separate task boundary. Keep production-only remainder
explicit. Dependencies retain their outcomes and proof; downstream tasks do not
inherit their claims merely through links.

The indexed JSON card is the task-scoped handoff with purpose, outcome, direct
canonical inputs and real boundaries. `touched_files` is advisory. Tier and
identity changes use the planning owner, not in-place ID mutation.

## Execution and continuation

The host supplies one selected task to `/exe`, then selects enabled verification
and closure operations under `tier-policy.md`. Models return implementation,
check and decision outcomes; the host records lifecycle. All-off verify is
skipped and may close implemented work without PASS. Actual negative results
remain evidence and need a disposition through the decision flow.

`/autonomous` covers end-to-end work including applicable FT-000; `/autopilot`
handles the prepared product queue. Neither prompt owns a mechanical scheduler.
`/mb-sync` reconciles already recorded outcomes at useful durable boundaries;
missing disabled reports are not sync gaps. Enabled checks apply to the changed
boundary, without automatic replay of the entire chain.

## Operator-decision boundary

Product questions return to `/write-prd`; local feature/task meaning returns to
its planning owner; shared contracts return to `/spec-redesign`; implementation
correction stays in the task when its meaning is unchanged. `/feature-doctor`
can triage unclear semantic ownership. Every nonstandard route and main-path
consultation follows `autonomy-policy.md#decision-flow`, including autonomous
semantic choices and preservation of manual stops.
