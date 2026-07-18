# Skill Audit: `/mb-garden`

Original audit: 2026-06-26  
Reassessed: 2026-07-18  
Status: actionable after revision

## Current verdict

The original verdict that `/mb-garden` is the most outdated command is no
longer accurate. The canonical runtime command now covers `spec-index`
hygiene, installed skill routing, `mb-lint`, and `mb-doctor` default/strict
timing.

Do not expand `/mb-garden` with a duplicate SDD readiness checklist.
`mb-doctor` already owns deterministic checks for backbone status, feature
design state, T2/T3 task readiness, and Architecture Spine anchors.

Packet readiness is obsolete. The indexed JSON Task card is the only durable
task-scoped handoff.

## Remaining findings

### P1 — `/mb-sync` is invoked unconditionally

`skills/_shared/references/commands/mb-garden.md` still runs `/mb-sync` as a
normal step. This conflicts with the current sync contract: `/mb-sync`
reconciles already-decided durable state at a real boundary and must not infer
closure, promotion, or scheduler ownership.

Change the command to run `/mb-sync` only when garden work changed durable
Memory Bank state or discovered drift that requires reconciliation. Otherwise
report that sync is not needed.

### P1 — Package entrypoint duplicates runtime behavior

`skills/mb-garden/SKILL.md` contains a second, longer maintenance workflow,
weekly checklist, fixed report path, and doctor timing rules. The installer
generates the runtime `/mb-garden` skill from
`skills/_shared/references/commands/mb-garden.md`, so the two instruction
surfaces can drift.

Keep `skills/mb-garden/SKILL.md` as a thin package wrapper that:

- identifies the canonical runtime command source;
- explains that the package carries `mb-lint`, `mb-doctor`, and optional CI
  assets;
- does not duplicate the runtime maintenance process.

Do not remove the package entrypoint because it still owns packaged assets.

### P2 — Behavior-spec maintenance is not routed

Add one lightweight garden rule:

- check that feature links and task `source_artifacts` resolve;
- report stale behavior examples as notes;
- do not turn behavior specs into a registry, schema, doctor gate, done
  criterion, or independent verification source.

### P2 — Periodic planning reviews are too broad

Do not run `/review-feat-plan` or `/review-tasks-plan` merely because garden is
being run periodically. Route to a review only when maintenance finds concrete
planning/spec/task drift within that review's ownership.

## Implementation scope

Primary files:

- `skills/_shared/references/commands/mb-garden.md`
- `skills/mb-garden/SKILL.md`

Update public workflow documentation only if the external `/mb-garden`
contract changes materially. Do not modify `mb-lint` or `mb-doctor` unless the
implementation exposes a concrete validator defect.

## Non-goals

- no packet terminology or packet lifecycle;
- no duplicate backbone/feature/task/Architecture Spine readiness checklist;
- no new Memory Bank artifact, registry, schema, status, or gate;
- no unconditional `/mb-sync` or planning review;
- no automatic deletion of user-owned skills or governance amendments.

## Acceptance criteria

- canonical `/mb-garden` remains a concise maintenance command;
- readiness findings are delegated to `mb-doctor`;
- `/mb-sync` and planning reviews are conditional on an applicable boundary;
- behavior-spec drift is reported without changing its non-gate semantics;
- package `SKILL.md` is an asset-oriented wrapper rather than a second runtime
  workflow.
