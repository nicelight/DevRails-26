---
description: Convert required Foundation Dev Path evidence into FT-000 JSON tasks, or mark brownfield baseline as already verified.
status: active
---
# /foundation-to-tasks - Foundation Dev Path -> JSON tasks

<objective>
Turn the project foundation / walking-skeleton decision from `/spec-design` into
normal Memory Bank task records before any product feature queue is generated,
unless brownfield `--verify-existing` proves the existing baseline is already
sufficient.

Foundation uses the same execution model as product work:
- `.memory-bank/tasks/TASK-*.task.json`
- `.memory-bank/tasks/index.json`
- `.protocols/TASK-*`
- `.tasks/TASK-*`
- `.memory-bank/packets/TASK-*.packet.json`

Do not create a separate foundation registry, task lifecycle, protocol family, or
task schema.
</objective>

<process>

## 0) Input
Supported arguments:
- no argument: create/update required foundation task records from
  `.memory-bank/foundation.md`
- `--verify-existing`: brownfield mode; create verification/probe tasks only when
  the existing executable baseline must be proven before feature work; if the
  baseline is already verified, record `Foundation Required: false` and create
  no `FT-000` queue

Required reads:
- `.memory-bank/foundation.md`
- `.memory-bank/prd.md`
- `.memory-bank/requirements.md`
- `.memory-bank/epics/`
- `.memory-bank/features/`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- linked architecture/contract/domain/state/testing/runbook specs
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/schemas/task.schema.json`

`/spec-design` must run first. If `.memory-bank/foundation.md` is missing, route
back to `/spec-design` and stop before task generation.

## 1) Foundation contract
Read `.memory-bank/foundation.md` and require this parseable section:

```markdown
## Gate Anchors
- Foundation Required: true|false
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: pending_foundation_to_tasks|TASK-<NNN>-T<N>-FT-000-W<N>|not_required
```

Rules:
- `Foundation Required: false` requires `Foundation Gate Task: not_required` and a
  concise rationale in `.memory-bank/foundation.md`; create no tasks.
- `Foundation Required: true` may enter this command with
  `Foundation Gate Task: pending_foundation_to_tasks`; this command creates or
  refreshes `REQ-000`, `FT-000`, at least one implementation/probe task, and one
  final foundation gate task.
- `FT-000` is reserved for project foundation only. It is not a product feature.
- `REQ-000` is reserved for the verified executable baseline requirement.
- Product features must not use `FT-000` and product tasks must not use `W0`.

If anchors are absent, contradictory, or still contain placeholders, stop and
route back to `/spec-design`.

## 2) Foundation scope
Foundation is a walking skeleton, not big upfront architecture.

Allowed work:
- minimal app/repo skeleton
- primary entrypoint
- build/start command
- minimal vertical path through real layers
- test harness
- smoke or integration check
- small compatibility probes required by planned features
- evidence that planned feature work can start safely

Non-goals:
- no future-ready platform, plugin/core framework, or universal abstraction
  without immediate proving-path pressure
- no product feature implementation except tiny compatibility probes
- no complete future API/domain/state design
- no deploy/CI/CD/ops layer beyond minimal build/start/test/smoke proof

Use the Feature Pressure Map in `.memory-bank/foundation.md` to decide the
minimum task set. If the map is missing, stale, or not grounded in current
features/specs, route back to `/spec-design`.

## 3) Create or update REQ-000 and FT-000
When foundation is required:
1. Add/update `REQ-000` in `.memory-bank/requirements.md`:
   `Project must have a verified executable baseline before product feature
   implementation starts.`
2. Create/update `.memory-bank/features/FT-000-foundation.md` with:
   - lifecycle `planned|implemented|verified`
   - clarification status omitted or `complete`; do not mark it pending
   - links to `.memory-bank/foundation.md`, `REQ-000`, and relevant specs
   - explicit note: this is a reserved pseudo-feature, not a product feature
3. Create/update `.protocols/FT-000/plan.md` and
   `.protocols/FT-000/decision-log.md`.
4. Create/update `.memory-bank/tasks/plans/IMPL-FT-000.md`.

Do not create `FT-000` when foundation is not required.

## 4) Create foundation task records
Create normal schema-backed task records only:

```json
{
  "id": "TASK-000-T1-FT-000-W0",
  "title": "Create minimal executable skeleton",
  "status": "ready",
  "wave": "W0",
  "feature": "FT-000",
  "reqs": ["REQ-000"],
  "depends_on": [],
  "touched_files": [],
  "tier": "T1",
  "gates": [],
  "verify": [],
  "docs": [],
  "evidence_required": [],
  "source_artifacts": [".memory-bank/foundation.md"],
  "normative_inputs": [],
  "constraints": [],
  "invariants": [],
  "verification_targets": []
}
```

Task rules:
- prefer `TASK-000-T1-FT-000-W0` for the first minimal `T1` foundation task;
  otherwise use the next safe `TASK-<NNN>-T<N>-FT-000-W<N>` ID with the chosen
  tier segment, without renumbering existing tasks
- use `feature: "FT-000"` for every foundation task
- task id tier, feature, and wave segments must match the task record fields
- use `reqs: ["REQ-000"]` unless a task also traces to concrete product
  requirements
- use `wave: "W0"` only for project executable baseline tasks under `FT-000`
- use `W1`/`W2`/`W3` for probes, integration, verification, and evidence work
  when that better matches the normal wave vocabulary
- set `status: ready` only when dependencies are empty or already `done`;
  otherwise use `planned`
- choose `tier` by `.memory-bank/workflows/tier-policy.md`
- fill the normal task schema fields; use empty arrays only when no evidence
  exists
- never add foundation-specific task fields or lifecycle values

Brownfield `--verify-existing` mode should not create `FT-000` by default. If
existing baseline evidence is already verified and no task is needed, update
`.memory-bank/foundation.md` to `Foundation Required: false` and
`Foundation Gate Task: not_required` with concise evidence/rationale, then stop
without creating `REQ-000`, `FT-000`, protocols, packets, or task records. If
evidence is insufficient, keep `Foundation Required: true` and create only the
minimum probe/verification tasks needed to prove the existing baseline before
product feature tasking.

## 5) Final foundation gate task
When foundation is required, create exactly one final gate task.

Rules:
- it must be a normal `TASK-NNN-TN-FT-000-WN` record with `feature: "FT-000"` and
  `reqs: ["REQ-000"]`
- it depends on every required foundation implementation/probe task
- it verifies the minimal work path and all required compatibility probes
- it records evidence requirements for build/start/test/smoke success
- replace `.memory-bank/foundation.md`
  `Foundation Gate Task: pending_foundation_to_tasks` with the concrete final
  gate task id: `Foundation Gate Task: TASK-<NNN>-T<N>-FT-000-W<N>`
- product feature tasks created later by `/prd-to-tasks` must depend on this
  gate task when foundation is required

Do not mark the gate `done` during this command. Execution and verification go
through `/execute`, `/verify`, `/red-verify` when tier requires it, and
`/mb-sync`.

## 6) Execution Packets
Create or refresh required initial Execution Packets for:
- every foundation `T2` / `T3` task
- every foundation `T0` / `T1` task with
  `runtime_context.packet_required: true`

Use the same packet rules as `/prd-to-tasks`:
- canonical path `.memory-bank/packets/<task.id>.packet.json`
- `source_task_hash` over the raw task record bytes
- packet is derivative and never overrides task/spec/foundation truth
- use `status: ready`, `ready_with_gaps`, or `blocked`

If a packet is blocked, keep the task queue but do not hand off to execution.

## 7) Handoff
Before finishing:
- update `.memory-bank/tasks/index.json` with normal task entries only
- keep foundation tasks ordered before product feature tasks
- ensure `.memory-bank/foundation.md` Gate Anchors name the final gate task or
  `not_required`
- report the planned foundation queue and blockers
- stop before execution

Next command:
- run `/mb-doctor` at the foundation/task-queue boundary
- then execute/verify foundation tasks until the final foundation gate task is
  `done`
- only then run `/prd-to-tasks FT-<NNN>` for product features

</process>
