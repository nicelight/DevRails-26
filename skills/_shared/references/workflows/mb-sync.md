---
description: Reconcile durable Memory Bank state without semantic or lifecycle decisions.
status: active
---
# MB-SYNC — Memory Bank synchronization

Apply `autonomy-policy.md` and `tier-policy.md#closure-authority`.

## Scope and timing

Reconcile affected durable state at a wave/change boundary or when the next
operation needs it. Task-local outcome recording alone does not require full
sync. Sync is not a required prelude to every review or closure.

Inputs are already recorded owner decisions, actual task outcomes, performed or
skipped checks, and changed project artifacts. Models do not infer closure,
promote tasks, unblock dependencies, or turn transient claims into durable truth.

## Reconciliation

Update only affected links, indexes, routers, RTM, feature/epic lifecycle,
changelog and spec references. Preserve document status
`draft|active|deprecated|archived` separately from entity lifecycle
`planned|implemented|verified`. `done` without verification supports implemented,
not verified. Missing reports for disabled checks are expected.

- Keep REQ/feature/task links and the JSON task index consistent with their owners.
- Preserve canonical subject ownership, accepted boundary-map edges and AD anchors;
  repair locators without changing contract meaning.
- Keep `spec-index.md` a `Type | Path | Status | Scope | Change route` registry.
- Reconcile backbone/feature design links with actual accepted state. A stale
  `needed_before_tasks` route or material linked design conflict returns to
  `/feature-to-tasks` or `/spec-redesign`, not a sync-authored design.
- Existing duo/support docs remain linked where used; no new document family is
  required. Optional behavior examples are links/context, not gates.
- Add a concise changelog entry only for meaningful reconciled change.

Framework-owned `.memory-bank/templates/protocols/*` and `.memory-bank/scripts/*`
are installer state. Do not edit them or add a project router for the template
leaf. Filled task protocols remain task evidence when used.

## Validation and handoff

Check the relationships actually changed against their authoritative sources.
Return changed paths, remaining gaps, and the calling owner. Selected post-sync
lint/doctor checks belong to the host/caller; sync does not duplicate them.

Mechanical link/index corrections within the assignment need no new decision.
Missing/conflicting owner decisions and semantic repair use the common decision
flow. Keep completed reconciliation and an exact remaining gap; do not invent
follow-up tasks or interpret ambiguous acceptance. Resume this sync only where
still needed after the owning repair.
