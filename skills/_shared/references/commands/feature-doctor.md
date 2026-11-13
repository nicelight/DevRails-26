---
description: Resolve the meaning of a feature finding and identify the smallest useful repair.
status: active
---
# /feature-doctor — Clarify a feature finding

## Outcome
Determine whether a reported feature problem is real, what decision it needs,
and which artifacts or implementation need correction. Apply
`.memory-bank/workflows/execute-loop.md#working-policy`.

Use one FT ID from the request or an unambiguous caller context. Ask when the
target is unclear. Read the cited finding and only the feature, product, specs,
tasks, or observed behavior necessary to establish its basis. Ignore superseded
findings; do not expand this into a general feature review.

## Resolution
Distinguish an implementation defect from unclear product intent, inconsistent
specs, missing evidence, or stale planning. Internally consistent downstream
wording cannot override an explicit product requirement.

When a decision is needed in manual work, explain its effect and recommend the
smallest sufficient correction. Under authorized autonomy choose within the
provided scope. Reuse settled decisions without asking again.

Apply an accepted correction to the canonical artifacts actually affected when
the caller authorized repair. A request for diagnosis/review alone remains
read-only except for its requested report. Focused skills are available tools;
a separate `/write-prd`, `/spec-redesign`, or `/feature-to-tasks` invocation is
not necessary to apply an already authorized correction.

## Durable result
Preserve stable feature AC IDs, their governing REQ links, accepted quality
criteria, task identities, and historical evidence. Clarify missing product
meaning rather than inventing a target to satisfy a check.

Update the feature and, when useful for continuation,
`.protocols/FT-<NNN>/clarification.md`. Keep optional clarification metadata
`pending|complete|blocked`, `last_clarified`, and `clarification_questions`
truthful; do not add it when no clarification occurred. Record useful impact
using existing `Design impact: none|feature_design_stale|global_design_stale|blocked`
and `Behavior spec impact: none|refresh_recommended` markers when a caller
consumes them.

If linked design remains misleading, retain useful historical links but set
`spec_design_status: blocked` and describe the real remaining gap. When repaired,
restore the truthful `complete|not_required` state. Do not fabricate verification
or pretend an unresolved choice was accepted.

## Handoff
Report the validated finding, decision or correction, and unfinished work.
Recommend the useful owner/tool without imposing a routing chain. An unresolved
question pauses only dependent work; an autonomous caller can retain its existing
clarification/blocking halt when the decision exceeds its authority.
