# Skill Audit: /mb-packet

Date: 2026-06-26

## Scope
- Canonical runtime source: `skills/_shared/references/commands/mb-packet.md`
- Related template/checks: `skills/_shared/references/protocols/packet-template.json`, `skills/mb-garden/assets/mb-doctor.mjs`
- Context: strengthened feature-level SDD design, concrete contract readiness, optional behavior specs, required packets for T2/T3.

## Verdict
`/mb-packet` is mostly aligned with the new packet policy and SDD source-of-truth model, but it still has weak edges around behavior specs, concrete contract readiness, guide-only SDD links, and runtime template routing.

## Findings

### P1 - Packet shape cannot explicitly carry behavior specs

`/prd-to-tasks` now allows optional `.memory-bank/behavior-specs/*.behavior.json` and links task-relevant examples only through task `source_artifacts`. `/execute` and `/verify` know how to treat those as non-authoritative context examples.

`/mb-packet` reads `source_artifacts` (`skills/_shared/references/commands/mb-packet.md:106`) but the packet shape only has `source_refs.task`, `feature`, `specs`, `guides`, and `protocols` (`skills/_shared/references/commands/mb-packet.md:46`). `packet-template.json` has the same limitation. `mb-doctor` also validates only `specs`, `guides`, and `protocols` under `source_refs`.

Impact: an agent using the packet as compact runtime context can lose concrete behavior examples even though those examples were intentionally linked into the task.

Suggested fix:
- Add a minimal non-authoritative `source_refs.behavior_specs: []` field, or explicitly instruct `/mb-packet` to preserve behavior spec paths under an existing field without treating them as SDD specs.
- Update `packet-template.json`, `/mb-packet`, and `mb-doctor` shape validation together.

### P2 - SDD readiness is coarser than the new concrete contract rules

The command says T2/T3 packets should be `blocked` when linked SDD specs or verification basis are missing (`skills/_shared/references/commands/mb-packet.md:162`). It does not mirror the newer concrete readiness checks from `/prd-to-tasks`: guide-only links, missing `shape/rules/edge cases/verification target`, duplicated contract owners, and unresolved `needed_before_tasks` rows.

Impact: `/mb-packet` can produce a `ready` packet that compactly summarizes weak design context, while `/review-tasks-plan` or `mb-doctor --strict` would reject the same task queue.

Suggested fix:
- Add a short packet-status rule: for T2/T3, guide-only SDD links or missing concrete contract blocks are packet blockers when the task depends on API/state/schema/message/storage/domain/agent I/O/security boundaries.
- Keep the implementation simple: point feature-local repair to `/prd-to-tasks` and shared/global design repair to `/spec-design` instead of duplicating full reviewer logic.

### P2 - Spec changes are known stale inputs but not mechanically visible

`/mb-packet` hashes only raw task record bytes and says linked spec changes should trigger refresh when the packet summarizes their scope/verification/stop conditions (`skills/_shared/references/commands/mb-packet.md:91`). That is acceptable as MVP, but the output report does not require a clear "spec freshness not hashed" warning.

Impact: after SDD spec edits, a packet can still pass hash freshness even when its summarized scope is semantically stale.

Suggested fix:
- In the output report, include `Spec freshness: task-hash-only; refresh required if linked specs changed`.
- Consider a later schema version with optional `source_spec_hashes`, but do not add that until the simpler warning proves insufficient.

### P3 - Runtime template path points at source-only internals

The command says to use `skills/_shared/references/protocols/packet-template.json` as a shape reference (`skills/_shared/references/commands/mb-packet.md:29`). Runtime command skills are generated from shared command specs, so a target project will not normally have that source path.

Impact: low, because the minimal shape is embedded, but it is still misleading for installed runtime use.

Suggested fix:
- Reword to "use the embedded minimal shape; framework source template is `skills/_shared/...` when auditing the framework repository."

## Recommended Next Patch
Patch `/mb-packet`, `packet-template.json`, and `mb-doctor` together. Keep it narrow: behavior spec refs, guide-only/concrete-contract blocker wording, and a task-hash-only freshness warning.
