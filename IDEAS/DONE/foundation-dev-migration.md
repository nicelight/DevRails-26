# Handoff Proposition: Foundation Dev Path Migration

## Context

Current Memory Bank flow is feature-first:

```text
/write-prd -> /spec-init -> /prd -> /spec-design -> /prd-to-tasks FT-001 -> /execute TASK-*
```

This can produce feature task queues before the target project has a verified
executable skeleton. For greenfield AI-first development, that is risky: agents
start implementing feature slices without a proven runtime path, test harness,
entrypoint, module layout, or integration shape.

The desired model is project-wide planning first, feature planning second:

```text
Spec Driven Design
-> Foundation Dev Path
   -> build and verify a walking skeleton
-> Feature Dev Path
   -> grow product features on top of the verified skeleton
```

## Core Decision

Introduce a first-class `Foundation Dev Path`, but keep the existing task,
protocol, packet, tier, and scheduler model.

Do not create a separate protocol system for foundation work. Foundation tasks
must remain normal schema-backed task records:

```text
.memory-bank/tasks/TASK-*.task.json
.memory-bank/tasks/index.json
.protocols/TASK-*/
.tasks/TASK-*/
.memory-bank/packets/TASK-*.packet.json
```

Use a reserved pseudo-feature:

```text
.memory-bank/features/FT-000-foundation.md
feature: "FT-000"
```

`FT-000` is not a product feature. It is a reserved planning surface for the
project foundation / walking skeleton.

Use a reserved non-product enabling requirement:

```text
REQ-000: Project must have a verified executable baseline before product
feature implementation starts.
```

The foundation traceability chain is intentionally normal:

```text
REQ-000 -> FT-000 -> TASK-000..TASK-00N
```

`TASK-00N` is notation for the final numeric foundation gate task, for example
`TASK-009`. Normal product feature tasks should depend on this gate task when
foundation is required.

## Target Workflow

Recommended canonical greenfield flow:

```text
/analysis -> /brainstorm -> /brief -> /constitution
-> /write-prd
-> /spec-init
-> /prd
-> /spec-design
-> /foundation-to-tasks
-> /mb-doctor at foundation/task-queue boundary
-> /execute TASK-000...
-> /verify TASK-000...
-> /mb-sync
-> final foundation gate task: done
-> /prd-to-tasks FT-001
-> /mb-doctor at feature/task-queue boundary
-> /execute feature TASK-*
```

For brownfield projects, `Foundation Dev Path` may be satisfied by mapping and
verifying the existing executable baseline instead of creating it from scratch:

```text
/map-codebase
-> /write-prd --delta
-> /spec-init
-> /prd
-> /spec-design
-> /foundation-to-tasks --verify-existing
```

## Walking Skeleton Definition

Foundation must not become big upfront architecture.

Foundation should include:

- minimal app/repo skeleton;
- primary entrypoint;
- minimal vertical work path through real layers;
- build/start command;
- test harness;
- smoke or integration check;
- evidence that the selected architecture can accept planned features;
- Memory Bank status/evidence for handoff to feature development.

Foundation Non-Goals:

- не строить "future-ready" платформу, plugin/core layers или универсальные
  абстракции без немедленного proving-path спроса;
- не реализовывать продуктовые фичи, кроме tiny compatibility probes;
- не закрывать полный доменный/API/state дизайн для будущих фич;
- не добавлять deploy/CI/CD/ops слой шире минимального build/start/test/smoke
  доказательства.

## Feature Pressure Pass

Before coding foundation, Memory Bank should inspect planned features and extract
design forces, not feature implementation tasks.

For each planned feature, identify pressure on the skeleton:

- required layers;
- state/persistence needs;
- API/contract requirements;
- auth/security/permissions constraints;
- async jobs/events/integration needs;
- UI/navigation/layout constraints;
- testing requirements;
- decisions that are expensive to change later.

This should be recorded in a foundation artifact created by `/spec-design`
after PRD decomposition and global SDD backbone analysis.

Suggested new artifact:

```text
.memory-bank/foundation.md
```

Suggested shape:

```markdown
---
description: Foundation Dev Path evidence and pressure map.
status: active
---
# Foundation Dev Path

## Gate Anchors
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: TASK-<ID>

Use `Foundation Gate Task: not_required` only when `/spec-design` explicitly
decides that the project does not need a foundation path before product feature
work.

## Minimal Work Path
- Build command:
- Start command:
- Primary entrypoint:
- Smoke path:
- Test command:
- Evidence:

## Feature Pressure Map
| Feature | Pressure | Foundation Response | Probe | Status |
|---|---|---|---|---|

## Deferred Decisions
| Decision | Why deferred | Trigger to revisit |
|---|---|---|

## Foundation Exit Criteria
- minimal path passes
- compatibility probes pass
- no P0/P1 design pressure unresolved
- feature dev path allowed
```

## Compatibility Probes

Foundation should protect future feature work through small probes, not by
building future features early.

Examples:

- planned auth -> verify guard/middleware boundary with a tiny protected-route
  smoke path;
- planned persistence -> verify read/write path through the chosen storage
  boundary;
- planned API work -> verify handler, validation, error, and test conventions;
- planned UI work -> verify routing/layout/state pattern;
- planned external integration -> verify adapter boundary and mocked test path.

If a required probe fails, the final foundation gate task cannot be marked
`done`; it remains `blocked` or the failed upstream task is fixed first.

## Unified Wave Vocabulary

Do not introduce separate `F0/F1/F2` wave types. Keep one wave vocabulary for
both foundation and feature paths.

Canonical interpretation:

```text
W0 = project executable foundation only, normally FT-000
W1 = enabling/foundation work for the current scope
W2 = core behavior
W3 = integration, verification, polish, docs/evidence
```

Rules:

- Normal product features should not use `W0`.
- `W0` belongs to `FT-000` and project-level executable baseline work.
- If a normal feature discovers missing baseline capability, create a small
  `FT-000` foundation-extension task instead of hiding cross-cutting skeleton
  work inside the feature task.
- `depends_on` remains the authoritative execution ordering mechanism.
- `wave` remains a planning/review grouping, not a replacement for dependencies.

Example foundation tasks:

```json
{
  "id": "TASK-000",
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
  "source_artifacts": [],
  "normative_inputs": [],
  "constraints": [],
  "invariants": [],
  "verification_targets": []
}
```

Example final foundation gate task:

```json
{
  "id": "TASK-009",
  "title": "Verify foundation gate",
  "status": "planned",
  "wave": "W0",
  "feature": "FT-000",
  "reqs": ["REQ-000"],
  "depends_on": ["TASK-000", "TASK-001"],
  "touched_files": [],
  "tier": "T1",
  "gates": [],
  "verify": [],
  "docs": [".memory-bank/foundation.md"],
  "evidence_required": [],
  "source_artifacts": [".memory-bank/foundation.md"],
  "normative_inputs": [".memory-bank/spec-backbone.md"],
  "constraints": [],
  "invariants": [],
  "verification_targets": []
}
```

## Command Model Changes

### New `/foundation-to-tasks`

Purpose:

- read PRD, requirements, features, `.memory-bank/foundation.md`,
  spec-backbone, spec-index, and linked specs;
- consume the Feature Pressure Pass recorded by `/spec-design`;
- create or update `REQ-000` in `.memory-bank/requirements.md` when foundation
  is required;
- create or update `.memory-bank/features/FT-000-foundation.md` when foundation
  is required;
- update `.memory-bank/foundation.md` with the final gate task id and evidence
  links;
- create `.protocols/FT-000/plan.md` and decision log;
- create `.memory-bank/tasks/plans/IMPL-FT-000.md`;
- create foundation task records `TASK-000..TASK-<ID>`;
- make the final foundation gate task depend on all required foundation tasks;
- create required packets for T2/T3 foundation tasks;
- hand off to `/mb-doctor` before execution.

### `/spec-design`

Change from:

```text
may create exactly one foundation task
```

To:

```text
must create/update .memory-bank/foundation.md after PRD decomposition and
global SDD backbone analysis, decide whether foundation is required, and route
required foundation work to /foundation-to-tasks.
```

`/spec-design` should not create normal foundation task queues directly once
`/foundation-to-tasks` exists. It creates the foundation evidence/pressure
surface, not executable task records.

### `/prd-to-tasks`

Before feature task generation:

- verify `.memory-bank/foundation.md` exists;
- if `Foundation Gate Task: not_required`, require a rationale from
  `/spec-design`;
- otherwise read the `Foundation Gate Task: TASK-<ID>` anchor and require that
  task to exist and be `done` before feature task handoff;
- add the final foundation gate task to `depends_on` for normal product feature
  tasks;
- reject `/prd-to-tasks FT-000` with "use `/foundation-to-tasks`";
- exclude `FT-000` from `/prd-to-tasks --all`;
- if the foundation gate task is missing or not done, route to
  `/foundation-to-tasks` or foundation execution instead of creating executable
  feature tasks.

### `/autonomous`

Become two-phase:

```text
PRD/spec/design
-> /foundation-to-tasks
-> execute/verify/sync FT-000 queue
-> final foundation gate task done
-> /prd-to-tasks --all
-> feature scheduler
```

### `/autopilot`

Can execute foundation tasks using existing scheduler behavior.

Before executing non-`FT-000` feature tasks, it should rely on normal
`depends_on` ordering against the final foundation gate task. If a normal
feature task lacks the required dependency while foundation is required, stop
with a readiness error.

### `/mb-doctor`

Strict mode should stay simple. It should not parse `foundation.md` as a new
state machine and should not validate pressure-map business statuses.

Strict mode should check only:

- `wave: "W0"` is allowed only when `feature: "FT-000"`;
- normal `FT-*` product tasks do not use `W0`;
- if foundation is required, normal product feature tasks depend on the final
  foundation gate task;
- `FT-000` does not participate in product feature-completion semantics;
- all foundation tasks still obey normal task, dependency, tier, packet, and
  protocol policy.

## Foundation Extension Path

If feature development discovers that the skeleton cannot support the feature,
do not let the feature task silently reshape the whole foundation.

Instead:

```text
feature task blocks
-> create small FT-000 foundation-extension task
-> add that extension task to the blocked feature task's depends_on
-> execute/verify/sync extension
-> update foundation.md
-> resume feature task or regenerate feature plan
```

This prevents hidden cross-cutting changes inside feature implementation tasks.
If the extension changes the baseline materially, create a small extension gate
task and depend on that gate instead of depending directly on implementation
work.

## Expected Migration Scope

This is a medium-large workflow migration, but it can be done without replacing
the task schema.

High-value minimal changes:

1. Add `/foundation-to-tasks` command spec.
2. Make `/spec-design` create/update `.memory-bank/foundation.md`; do not seed a
   fake foundation state in fresh bootstrap.
3. Reserve `REQ-000` and `FT-000` in docs and command specs.
4. Replace old `feature: "FOUNDATION"` guidance with `feature: "FT-000"`.
5. Update `/prd-to-tasks` to reject/exclude `FT-000`, require final foundation
   gate completion when required, and add the gate task to normal feature
   `depends_on`.
6. Update `/autonomous` to execute foundation before feature task generation.
7. Update `/mb-doctor --strict` with only simple deterministic checks:
   `W0` ownership, product-task dependency on final gate, and `FT-000` exclusion
   from product feature-completion semantics.
8. Update README/howItWorks/execute-loop docs.
9. Add release-check smoke coverage for `/foundation-to-tasks`, valid
   `REQ-000 -> FT-000 -> TASK-*` queues, final gate dependency, and
   feature queue blocked-before-foundation cases.

Defer unless needed:

- adding a `phase` field to task records;
- adding enum validation for `wave`;
- creating a separate foundation task registry;
- creating separate foundation protocols.
- parsing Feature Pressure Map business statuses in `mb-doctor`.

## Affected Files

This migration touches command specs, generated skeleton behavior, package skill
entrypoints, deterministic validators, CI smoke coverage, and user docs.

### New Files

- `skills/_shared/references/commands/foundation-to-tasks.md`
- `skills/_shared/references/foundation-template.md` if the foundation document
  shape is extracted to a reusable template instead of being embedded only in
  `/spec-design` and `/foundation-to-tasks`.

### Command Specs

- `skills/_shared/references/commands/analysis.md`
- `skills/_shared/references/commands/brainstorm.md`
- `skills/_shared/references/commands/brief.md`
- `skills/_shared/references/commands/constitution.md`
- `skills/_shared/references/commands/cold-start.md`
- `skills/_shared/references/commands/discuss.md`
- `skills/_shared/references/commands/mb-init.md`
- `skills/_shared/references/commands/map-codebase.md`
- `skills/_shared/references/commands/clarify-feature.md`
- `skills/_shared/references/commands/prd.md`
- `skills/_shared/references/commands/spec-init.md`
- `skills/_shared/references/commands/spec-design.md`
- `skills/_shared/references/commands/spec-auto.md`
- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/mb-doctor.md`
- `skills/_shared/references/commands/mb-sync.md`
- `skills/_shared/references/commands/review.md`
- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/commands/red-verify.md`

### Workflow References And Skeleton Templates

- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/workflows/execute-loop.md`
- `skills/_shared/references/workflows/autonomy-policy.md`
- `skills/_shared/references/workflows/tier-policy.md`
- `skills/_shared/references/workflows/mb-sync.md`

### Bootstrap And Generated Project Guide

- `skills/_shared/scripts/init-mb.js`

### Package Skill Entrypoints

- `skills/mb-analysis/SKILL.md`
- `skills/mb-init/SKILL.md`
- `skills/mb-from-prd/SKILL.md`
- `skills/cold-start/SKILL.md`
- `skills/mb-map-codebase/SKILL.md`
- `skills/mb-review/SKILL.md`
- `skills/mb-garden/SKILL.md`
- `skills/mb-harness/SKILL.md`
- `skills/mb-execute/SKILL.md`
- `skills/mb-verify/SKILL.md`
- `skills/mb-red-verify/SKILL.md`

### Deterministic Tools

- `skills/mb-garden/assets/mb-doctor.mjs`
- `skills/mb-garden/assets/mb-lint.mjs`

### CI And Package Checks

- `.github/workflows/release-check.yml`
- `package.json` only if a new npm script or check alias is added.

### User Documentation And Agent Priming

- `README.md`
- `README.en.md`
- `README.ru.md`
- `howItWorks.md`
- `PROJECT_MAP.md`

## Bottlenecks And Risks

- Agents may overbuild foundation. Mitigation: compatibility probes and explicit
  non-goals.
- Agents may skip feature pressure analysis. Mitigation: `/foundation-to-tasks`
  requires a Feature Pressure Map.
- `FT-000` may be confused with product scope. Mitigation: reserve and document
  it as pseudo-feature only.
- `W0` may leak into normal product features. Mitigation: doctor warning/error.
- Brownfield projects may already have a valid baseline. Mitigation:
  use the normal final gate task with evidence source `existing_baseline`; do
  not introduce `verified_from_existing` as a separate status.
- Feature work may uncover new cross-cutting requirements. Mitigation:
  foundation-extension task path.
- Too many gates can slow small projects. Mitigation: allow
  `Foundation Gate Task: not_required` with `/spec-design` rationale for
  docs-only or tiny T0/T1 projects.

## Acceptance Criteria For Migration

- Fresh Memory Bank bootstrap does not create fake foundation state or executable
  task records.
- `/spec-design` creates `.memory-bank/foundation.md` only after PRD/features and
  global backbone evidence exist.
- `/foundation-to-tasks` creates `REQ-000`, `FT-000`, and foundation task records
  using the existing JSON task schema.
- `/foundation-to-tasks` creates a final foundation gate task that depends on all
  required foundation implementation/probe tasks.
- `/mb-doctor --strict` accepts a valid foundation queue.
- `/mb-doctor --strict` rejects `W0` on non-`FT-000` product features.
- `/mb-doctor --strict` rejects normal product feature tasks that omit the final
  foundation gate dependency when foundation is required.
- `/prd-to-tasks FT-000` rejects and routes to `/foundation-to-tasks`.
- `/prd-to-tasks --all` excludes `FT-000`.
- `/prd-to-tasks FT-001` adds the final foundation gate task to `depends_on` for
  generated product feature tasks.
- `/autonomous` runs foundation before feature decomposition/execution.
- Existing task lifecycle remains unchanged:
  `planned|ready|in_progress|blocked|done|failed`.
- Existing tier policy remains unchanged:
  `T0|T1|T2|T3`.
- Existing protocol locations remain unchanged:
  `.protocols/TASK-*` and `.tasks/TASK-*`.
