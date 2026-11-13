---
description: Plan the smallest executable Foundation baseline using the ordinary task model.
status: active
---
# /foundation-to-tasks — Foundation work

## Outcome
Create or reconcile the smallest necessary executable-baseline queue, or prove
that an existing baseline needs no separate Foundation work. Apply
`.memory-bank/workflows/execute-loop.md#working-policy`,
`.memory-bank/workflows/sdd-design-contract.md`, and applicable tier guidance.

Use `.memory-bank/foundation.md`, current accepted product/design needs, actual
build/runtime evidence, existing indexed tasks, and the task schema. The optional
`--verify-existing` argument focuses on proving a brownfield baseline. Missing
prior command/review markers alone do not require a new queue.

## Foundation decision
The baseline serves current features: a working build/start/smoke/test path or a
concrete compatibility requirement. Do not build a future platform, empty slices,
or speculative endpoints. Preserve accepted architecture and explicit constraints.

Discuss an unresolved baseline choice in manual work; under authorized autonomy
choose the minimum within scope. Apply an authorized design correction and its
affected links directly rather than requiring `/spec-redesign` first.

Keep the existing anchors in `foundation.md`:

```markdown
## Gate Anchors
- Foundation Required: true|false
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: pending_foundation_to_tasks|TASK-<NNN>-T<N>-FT-000-W<N>|not_required
```

With sufficient evidence and no needed baseline work, use `false/not_required`
and create no empty Foundation artifacts. Preserve existing completed history.
If the choice remains unresolved, record the question instead of fabricating a
true/false decision.

## Queue when needed
Maintain `REQ-000`, `FT-000-foundation.md`, and ordinary indexed task records.
The pseudo-feature uses `planned|implemented|verified` and links its baseline,
requirements, and specs. Use `feature: FT-000`, normally `reqs: [REQ-000]`, W0 for
baseline work, and later waves only when useful.

Create the necessary implementation/probe tasks and one final integrated
Foundation gate that depends on them. Replace the pending gate anchor with its
concrete ID. Product tasks depend on this gate only when the accepted Foundation
path is their prerequisite. Do not claim the gate is done until its intended
integrated result is supported by actual evidence.

Preserve task schema, ID/field consistency, lifecycle history, existing evidence,
and meaningful dependencies. `ready` means actual prerequisites are satisfied;
otherwise use `planned`. A plan or `.protocols/FT-000/` notes are optional when
specs and cards already preserve the needed context.

Cards carry a clear purpose/outcome, direct applicable canonical links, an expected
change surface, and a credible verification path. Use `verification_targets` for
method/results to test, `evidence_required` for expected decisive observations,
and `verify` for actual evidence. Do not copy prerequisite proof into downstream
tasks or the final integrated gate. Tier guides depth; it does not mandate a
protocol family, TDD sequence, or separate reviewer.

`touched_files` stays advisory. Add a hard `runtime_context.write_boundary` only
when intentionally needed; preserve explicit forbidden scopes and stop conditions.
Use subject-based specs for actual runtime/data/contract concerns. For linear
Alembic histories, keep dynamic head/ancestry checks project-wide and revision-local
proof with the relevant change; do not freeze a mutable head ID in task cards.

Check JSON/index consistency, dependencies/cycles, the final gate's actual
coverage, and links needed by execution. Keep unresolved decisions and unsafe
prerequisites visible without requiring a separate review or strict-doctor pass.

## Handoff
Report planned baseline work, the final gate or no-queue evidence, and the next
useful action. Manual execution or the caller's Foundation phase may continue
in the same context. `/mb-doctor` is diagnostic support, not a compulsory hop.
