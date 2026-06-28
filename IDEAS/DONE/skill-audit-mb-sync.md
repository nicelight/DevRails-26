# Skill Audit: /mb-sync

Date: 2026-06-26

Fix status: applied in `skills/_shared/references/commands/mb-sync.md` and
`skills/_shared/references/workflows/mb-sync.md` on 2026-06-26.

## Scope
- Canonical runtime command: `skills/_shared/references/commands/mb-sync.md`
- Shared workflow reference: `skills/_shared/references/workflows/mb-sync.md`

## Verdict
`/mb-sync` has the newer status-ownership model and understands packets/contracts at a high level. It needs a more explicit SDD sync section so feature-level design docs, spec registry state, packet freshness handoffs, and behavior-spec links do not fall between task execution and gardening.

## Findings

### P2 - Checklist does not explicitly cover feature-level SDD state

The command checklist covers RTM, lifecycle, indexes, task records, packets, contracts/guides, and changelog (`skills/_shared/references/commands/mb-sync.md:71`). The shared workflow has a "spec-driven support docs" item (`skills/_shared/references/workflows/mb-sync.md:62`).

Missing explicit checks:
- `spec-backbone.md` still has valid Global Backbone Status and no stale `needed_before_tasks` rows after task/spec changes.
- `spec-index.md` remains a pure registry and includes new/changed specs.
- feature frontmatter `spec_design_status` and `spec_design_links` still match actual linked specs.
- changed `tech-specs`, `contracts`, `domains`, `states`, `testing`, `runbooks`, and `guides` are routed from the registry and feature docs.
- Architecture Spine `AD-*` links used by tasks still resolve.

Impact: after implementation or spec repair, `/mb-sync` can update task state and changelog while leaving design routing stale.

Suggested fix:
- Add a "SDD design state" checklist block to both command and workflow.

### P2 - Packet freshness handoff after spec changes is underspecified

`/mb-packet` says packets should be refreshed when linked specs changed after generation and the packet summarizes their scope/verification/stop conditions. `/mb-sync` says it reconciles existing `runtime_context.packet_ref`, protocol links, and evidence paths but does not build or refresh packets (`skills/_shared/references/commands/mb-sync.md:62`).

Impact: a sync after SDD spec edits may leave required packets semantically stale while still hash-fresh against the task record.

Suggested fix:
- Add a sync check: if linked specs changed for tasks with required packets, record a `/mb-packet TASK...` handoff or run it only when the current command explicitly owns packet refresh.
- Keep `/mb-sync` from silently rebuilding packets unless that ownership is explicitly granted.

### P2 - Behavior-spec links are not named

Behavior specs are optional and should not become gates. Still, sync should keep feature doc links and task `source_artifacts` coherent when behavior specs are added, removed, or made stale by clarification/spec changes.

Impact: broken or stale behavior examples can remain invisible until execution.

Suggested fix:
- Add a non-gating sync item: verify behavior spec files linked from feature docs and task `source_artifacts` exist; report stale examples as notes unless a normal source also fails.

### P3 - Doctor usage is too narrowly stated in the command checklist

The command says `/mb-doctor --strict` is blocking for `/autonomous` and `/autopilot` after sync (`skills/_shared/references/commands/mb-sync.md:89`). The broader workflow also uses doctor/readiness at feature/task-queue and complex manual boundaries.

Impact: manual T2/T3 or packet-heavy work may skip the readiness gate after sync.

Suggested fix:
- Match the README/project map wording: strict doctor is mandatory for autonomous/autopilot handoff and conditional for T3, complex T2, foundation/dependency/packet/stale-doc/risky-link cases.

## Positive Notes
- Status ownership is much stronger than older versions: `/mb-sync` does not decide closure, failure, blocking, promotion, or dependent unblock.
- The command correctly avoids creating new boundary lifecycle/status models.

Applied patch summary:
- Added explicit SDD design-state sync checks for `spec-backbone`,
  `spec-index`, feature `spec_design_status`, feature `spec_design_links`,
  changed SDD docs, and Architecture Spine `AD-*` anchors.
- Added packet freshness handoff rules after linked spec changes without making
  `/mb-sync` silently rebuild packets.
- Added non-gating behavior-spec link/staleness checks.
- Aligned `/mb-doctor --strict` wording with autonomous/autopilot mandatory use
  and conditional T3/complex T2/foundation/dependency/packet/stale-doc/risky-link
  use.
