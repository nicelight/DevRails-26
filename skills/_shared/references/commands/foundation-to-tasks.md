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

Before reading foundation anchors or writing any artifact, require
`.memory-bank/spec-backbone.md` `## Global Backbone Status` to be:
- `complete`; or
- `minimal` with the explicit `Not applicable areas` entries and rationales
  required by the `/spec-design` status contract.

If the section or status is missing/malformed, the status is `blocked`, or
`minimal` lacks explicit not-applicable rationale, stop and route back to
`/spec-design`. Do not create or update foundation specs, `REQ-000`, `FT-000`,
task records, protocols, or plans.

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

## 2.1) Foundation substrate spec audit
When `Foundation Required: true`, run a foundation substrate spec audit before
creating FT-000 task records. The walking skeleton must not be planned from
implicit platform assumptions.

Generate or update only the fundamental scaffold-level specifications needed to
define and prove the executable substrate. Use evidence from
`.memory-bank/foundation.md`, the Feature Pressure Map, PRD/features, and linked
backbone specs. Do not invent future product behavior.

The output is the smallest set of subject-based canonical specs and substrate
blocks needed by `FT-000` tasks, not the final product specification for every
future feature. A good foundation block records:
- its scope and out-of-scope concerns when the boundary is not obvious
- the substrate shape or boundary used by the walking skeleton
- the basic rules/invariants that foundation tasks must preserve
- the verification target proving the baseline
- where `/prd-to-tasks` should reuse or extend the same canonical path later

Before creating a substrate spec, read `spec-index.md`, relevant folder indexes,
and plausible subject-based candidates in full. For each substrate concern use
exactly one action: `reuse|extend|create|not_applicable|block`. If two paths
compete for one concern, create no third file; route the conflict to
`/spec-design`.

Apply the same three design lenses used by `/spec-design` and `/prd-to-tasks`,
but only to the substrate proof path:
- Architecture impact: minimal runtime shape, entrypoints, core
  components/modules, dependency direction, source-of-truth boundary, and the
  smallest vertical path through real layers. Update the existing canonical
  Architecture Specification; do not introduce product architecture here.
- Interfaces / Contracts: API, event, protocol, CLI, agent/tool, component, or
  frontend/backend boundary actually crossed by the substrate proof path.
  Interface Specification is the lens; create or update only the applicable
  fundamental canonical contracts:
  - Component Contract: module/component guarantees and ownership boundaries
    required by the walking skeleton.
  - API Contract: substrate-level REST/gRPC/GraphQL or other request/response
    inputs, outputs, status/error behavior, and compatibility expectation for
    the smoke path.
  - Event Contract: event/message/queue envelope, required fields, ordering,
    retry/idempotency, and failure behavior only when the foundation path uses an
    event/message boundary.
  - Data Contract: payload/data structure, versions, required fields,
    validation/serialization, and compatibility expectations for substrate data
    crossing a component/API/event/protocol boundary. It does not define internal
    DB/storage models.
- Data impact: update the Data Specification only for internal data
  model/storage ownership needed by the baseline, DB
  schema or migration path when persistence is part of foundation, session/UoW
  lifetime, seed/bootstrap behavior, runtime data paths, internal stored or
  serialized formats, and internal validation/serialization rules used by the
  substrate proof.

Create supporting substrate specs only when the proof path needs them:
- Test Harness Specification: test command, smoke/integration target, required
  fixtures, and evidence expected from foundation verification.
- Local Runtime / Bootstrap Runbook: setup/start commands, environment
  variables, local service dependencies, smoke path, and troubleshooting notes
  needed to prove the baseline.
- Redaction / Evidence Contract: what logs, screenshots, traces, DB dumps, or
  artifacts may be captured; what secrets/PII must be redacted; where evidence is
  stored.

A substrate spec looks missing when the Foundation Feature Pressure Map names
the area, when a foundation task would need to guess build/start/runtime/storage
or evidence behavior, when future T2/T3 product tasks will depend on the
substrate rule already selected by the foundation path, or when `/spec-design`
routed a relevant Backbone Area Matrix row to foundation proof.

Canonical locations:
- architecture/runtime shape -> `.memory-bank/architecture/*`
- interface/component/API/event/protocol/agent/tool boundaries and payloads
  crossing them -> `.memory-bank/contracts/*`
- internal DB/session/UoW/migration/seed/storage ownership ->
  `.memory-bank/domains/*`, `.memory-bank/states/*`, or the stack-native schema
  and migration source
- test harness and evidence requirements -> `.memory-bank/testing/*`
- local runtime/bootstrap/troubleshooting -> `.memory-bank/runbooks/*`

Rules:
- Prefer reusing or extending an existing registered canonical path over
  creating a new file.
- New substrate specs use subject-oriented paths and names without `FT-000`,
  `FT-<NNN>`, or feature identity. Recheck neighboring filenames for synonyms
  and overlap before creation.
- Register canonical identity by path and scope. Do not add feature ownership,
  `used_by`, or file-owner metadata to specs or `spec-index.md`.
- Do not create empty placeholder specs for scaffold areas that the foundation
  path does not touch.
- Foundation tasks must link scaffold specs through normal task fields when
  those specs constrain the task: `source_artifacts`, `normative_inputs`,
  `constraints`, `invariants`, or `verification_targets`.
- Scaffold specs are reusable normative inputs for later T2/T3 product tasks.
  They prove the selected substrate path; they must not define complete future
  product APIs, domain behavior, event payloads, state machines, or migrations
  by guessing.
- Leave product-level endpoint shapes, feature data schemas, event payloads,
  domain rules, state transitions, and edge-case/error matrices for
  `/prd-to-tasks` unless they are required to prove the foundation baseline.
  `/prd-to-tasks` may reuse or extend the same canonical spec, or create only a
  missing subject-based spec, without duplicating the foundation definition.
- When this command creates or materially updates scaffold specs, update
  `.memory-bank/spec-index.md` as a registry only using
  `Type | Path | Status | Scope | Change route`. Do not store decision bodies
  or reverse feature usage in the index.
- If the selected substrate requires an unresolved product/API/data/security
  decision, stop and route back to `/spec-design` instead of creating weak
  foundation tasks.

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
- include scaffold-level spec links from section 2.1 when they constrain
  foundation Architecture, Interfaces / Contracts, Data, test harness,
  runtime/bootstrap, or redaction/evidence behavior
- every T2/T3 record has non-empty `purpose` and one scalar
  `success_outcome`, at least one existing direct task-linked canonical SDD spec
  path, grounded scope in `touched_files` and/or
  `runtime_context.allowed_write_scope`, and at least one verification path
  through a real gate command and/or non-empty `verification_target`
- leave `anti_goals`, `runtime_context.forbidden_scope`, `constraints`,
  `invariants`, `evidence_required`, and `runtime_context.stop_conditions`
  empty or absent when current evidence does not justify them
- never add foundation-specific task fields or lifecycle values

Brownfield `--verify-existing` mode should not create `FT-000` by default. If
existing baseline evidence is already verified and no task is needed, update
`.memory-bank/foundation.md` to `Foundation Required: false` and
`Foundation Gate Task: not_required` with concise evidence/rationale, then stop
without creating `REQ-000`, `FT-000`, protocols, or task records. If
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

## 6) T2/T3 single-card handoff completeness

Before handoff, apply the same single-card completeness contract as
`/prd-to-tasks` to every foundation T2/T3 record:
- schema/index/ID segments are valid
- `REQ-000` and any additional governing requirements exist
- `purpose` and scalar `success_outcome` are non-empty
- at least one existing direct task-linked canonical SDD spec path is present
- scope is grounded by `touched_files` and/or
  `runtime_context.allowed_write_scope`
- a real gate command and/or non-empty `verification_target` exists
- dependencies exist and remain acyclic

This does not add a new status, artifact, nested object, or semantic doctor
rule. Optional evidence-driven fields remain grounded-only.

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
