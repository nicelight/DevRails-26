# Handoff: improve `/spec-design`

## Goal

Refactor `/spec-design` wording and routing so it clearly creates an architecture scaffold after `/prd` and before `/prd-to-tasks`, without pretending task tiers already exist and without defaulting architecture into one file.

## Problems

1. Current wording says:

```text
It is not an architecture essay.
```

This is ambiguous. `/spec-design` is intended to design the application architecture scaffold. The real anti-goal is narrative prose without executable decisions.

2. Current wording uses `T0/T1` inside `/spec-design`.

At `/spec-design` time features exist, but task records do not. Task tiers are assigned later in `/prd-to-tasks`. `/spec-design` should reason from feature-set pressure, not task tiers.

3. Current Architecture Documentation Granularity says Single-file KISS is the recommended/default strategy, including for unclear scope.

This is wrong. For unclear scope the command must ask one targeted question or block. Single-file may be allowed only for explicitly tiny/local/simple scope.

## Required Changes

### 0. Preserve downstream contracts

Do not rename or change these machine-facing contracts:

```text
Global Backbone Status:
  Status: complete|minimal|blocked

Backbone Area Matrix statuses:
  authoritative|needed_before_tasks|not_applicable|blocked

Foundation Gate Anchors:
  Foundation Required: true|false
  Foundation Requirement: REQ-000
  Foundation Pseudo-Feature: FT-000
  Foundation Gate Task: pending_foundation_to_tasks|TASK-NNN-TN-FT-000-WN|not_required
```

`mb-doctor` depends on `Status` and explicit `not_applicable` lines under
`## Global Backbone Status`. It does not validate `Mode`, so mode names can be
renamed safely if all templates/examples are updated.

Do not remove the foundation decision from `/spec-design`. `/foundation-to-tasks`
and `/prd-to-tasks` rely on `.memory-bank/foundation.md`.

### 1. Replace "not an architecture essay"

Use wording like:

```text
/spec-design creates an architecture scaffold, not a narrative architecture essay.
```

Clarify that architecture output must contain actionable decisions:

```text
- source of truth
- module/boundary ownership
- contract locations
- state/data ownership
- runtime/deployment assumptions
- testing/verification constraints
- blockers when safe assumptions are impossible
```

### 2. Remove task-tier language from `/spec-design`

Replace:

```text
T0/T1
T2/T3
minimal_t0_t1
strict_t2_t3
```

with feature/design pressure language:

```text
local/simple feature-set pressure
shared-boundary pressure
contract/state/data/runtime/security pressure
strict/irreversible/production-sensitive pressure
```

The command may predict likely task complexity from features, but must not route by task tier before task records exist.

Allowed exception: `/spec-design` may mention that task tiers are assigned later
by `/prd-to-tasks`. It must not use task tiers to choose its own mode.

### 3. Rename architecture modes

Suggested mode names:

```text
local_simple_backbone
standard_architecture_scaffold
strict_architecture_scaffold
```

Meaning:

```text
local_simple_backbone:
  only for explicitly local/simple feature sets with no shared boundary, contract, state/data, runtime, security, or irreversible pressure

standard_architecture_scaffold:
  default for normal greenfield architecture scaffold

strict_architecture_scaffold:
  for public contracts, security/safety, migrations, distributed/runtime boundaries, production-sensitive or irreversible decisions
```

Generated pending templates should not preselect the mode. Before `/spec-design`
has run, use:

```text
Mode: pending
Architecture artifact strategy: pending
```

After `/spec-design`, write one of the real mode names and one architecture
artifact strategy.

### 4. Fix architecture artifact strategy

Do not default unclear scope to Single-file KISS.

Use:

```text
Unclear scope:
  ask one targeted question or mark blocked

Explicitly tiny/local/simple scope:
  single architecture hub may be enough

Normal greenfield:
  create the architecture scaffold needed by the feature set

Complex/shared scope:
  split only when separate files reduce real complexity or are needed as authoritative references
```

Single-file is allowed, not the default for all work.

Keep the existing architecture artifact strategy values unless there is a real
reason to rename them:

```text
single-file
split-core-docs
split-by-boundary-topic
```

The change is about when `single-file` is selected, not about adding a new
strategy taxonomy.

### 5. Keep KISS boundaries

Do not add:

```text
- new /architecture workflow
- new task schema fields
- new task lifecycle statuses
- new doctor/lint gates
- mandatory ADRs for local/simple work
- BMAD output folders
```

Keep:

```text
- `/spec-design` mandatory after `/prd`
- feature-local design inside `/prd-to-tasks`
- Architecture Spine only for shared-boundary / contract / strict pressure
- ADRs optional and only for decisions worth preserving
- `spec-index.md` as registry only
- `spec-backbone.md` as readiness/status/handoff surface
- `mb-doctor` checks focused on existing readiness contracts only
```

Do not remove task-tier language from commands where task records already exist
or are being created:

```text
/prd-to-tasks
/execute
/verify
/red-verify
/autopilot
/autonomous
tier-policy
```

## Files To Update

Primary:

```text
skills/_shared/references/commands/spec-design.md
```

Likely follow-ups:

```text
skills/_shared/references/structure-template.md
skills/_shared/scripts/init-mb.js
README.md
howItWorks.md
```

Search terms to update:

```text
not an architecture essay
T0/T1
T2/T3
minimal_t0_t1
standard_ai_first
strict_t2_t3
Single-file KISS
unclear scope
Mode: standard_ai_first
Architecture artifact strategy: single-file
```

## Acceptance Criteria

- `/spec-design` is described as architecture scaffold creation.
- No task-tier routing language remains in `/spec-design` where task records do not exist yet.
- Architecture mode names use feature/design pressure, not task tiers.
- `Status: complete|minimal|blocked` remains unchanged.
- `not_applicable` readiness stays under `## Global Backbone Status`.
- Foundation Gate Anchors remain compatible with `/foundation-to-tasks`, `/prd-to-tasks`, and `mb-doctor`.
- Unclear scope no longer defaults to Single-file KISS.
- Single-file output is allowed only when scope is explicitly tiny/local/simple or when it is the best scaffold shape.
- Generated initial skeletons do not preselect `standard_ai_first` or `single-file`; they use pending values until `/spec-design`.
- Task-tier language remains untouched in downstream commands where task records exist or are being created.
- T2/T3 task execution safety is not weakened elsewhere.
- No new workflow, schema, lifecycle, lint, or doctor mechanism is introduced.
