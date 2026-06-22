# Refactoring Plan: Foundation Dev Path Migration

## Objective

Introduce a first-class Foundation Dev Path before product feature task
generation.

The migration must keep the existing Memory Bank execution model:

- task records remain schema-backed JSON files in `.memory-bank/tasks/`;
- task lifecycle remains `planned|ready|in_progress|blocked|done|failed`;
- tier routing remains `T0|T1|T2|T3`;
- protocols remain `.protocols/TASK-*` and runtime evidence remains
  `.tasks/TASK-*`;
- Execution Packets remain derivative artifacts under `.memory-bank/packets/`;
- no separate foundation registry, protocol family, lifecycle, or task schema
  replacement is introduced.

## Target Behavior

Greenfield flow becomes:

```text
/analysis -> /brief -> /constitution -> /write-prd -> /spec-init -> /prd
-> /spec-design
-> /foundation-to-tasks
-> /mb-doctor at foundation/task-queue boundary
-> /execute + /verify + /mb-sync foundation tasks
-> final foundation gate task: done
-> /prd-to-tasks FT-001
-> /mb-doctor at feature/task-queue boundary
-> /execute feature TASK-*
```

Brownfield flow can satisfy foundation through verified existing baseline:

```text
/map-codebase -> /write-prd --delta -> /spec-init -> /prd -> /spec-design
-> /foundation-to-tasks --verify-existing
```

Foundation uses normal traceability:

```text
REQ-000 -> FT-000 -> TASK-000..TASK-00N
```

`FT-000` is a reserved pseudo-feature for project foundation only. Normal product
features must not use `W0`.

## Implementation Phases

### Phase 1 - Command Model

Create `skills/_shared/references/commands/foundation-to-tasks.md`.

The command must:

- read `.memory-bank/foundation.md`, PRD, requirements, features,
  `spec-backbone`, `spec-index`, and linked specs;
- require a Feature Pressure Map produced by `/spec-design`;
- create or update `REQ-000` only when foundation is required;
- create or update `.memory-bank/features/FT-000-foundation.md` only when
  foundation is required;
- create `.protocols/FT-000/plan.md` and decision log;
- create `.memory-bank/tasks/plans/IMPL-FT-000.md`;
- create normal schema-backed `TASK-*` records for foundation work;
- create one final foundation gate task depending on all foundation
  implementation/probe tasks;
- create required packets for T2/T3 foundation tasks and explicit T0/T1 packet
  requirements;
- stop before execution and hand off to `/mb-doctor`.

Update `/spec-design`:

- remove the old "one foundation task" exception;
- create/update `.memory-bank/foundation.md` only after `/prd` created the
  feature set and global backbone evidence exists;
- record whether foundation is `required` or `not_required`;
- record feature pressure, minimal work path, deferred decisions, and exit
  criteria;
- route executable foundation work to `/foundation-to-tasks`.

Update `/prd-to-tasks`:

- reject `/prd-to-tasks FT-000` and route to `/foundation-to-tasks`;
- exclude `FT-000` from `--all`;
- require `.memory-bank/foundation.md`;
- require `Foundation Gate Task: not_required` with rationale, or a concrete
  gate task with `status: done`;
- add the final foundation gate task to `depends_on` for generated product
  feature tasks when foundation is required.

Update `/autonomous`:

- run `/foundation-to-tasks` after `/spec-design --all` and before
  `/prd-to-tasks --all`;
- execute and verify the `FT-000` queue first;
- continue to product feature task generation only after the final foundation
  gate task is `done`.

Update `/autopilot`:

- allow foundation tasks as normal JSON queue work;
- before non-`FT-000` product work, rely on the final foundation gate dependency;
- stop with readiness error when foundation is required and a product task lacks
  the gate dependency.

### Phase 2 - Routing And Review Specs

Update command specs that route users toward `/prd-to-tasks` so they insert the
foundation path when relevant:

- `analysis.md`, `brainstorm.md`, `brief.md`, `cold-start.md`,
  `constitution.md`, `discuss.md`, `mb-init.md`, `map-codebase.md`,
  `clarify-feature.md`, `prd.md`, `spec-init.md`, `spec-auto.md`,
  `spec-improve.md`, and `review.md`.

Update task execution and closure specs only where they mention feature
completion or packet readiness:

- `execute.md`, `verify.md`, `red-verify.md`, and `mb-sync.md`.

These files should not add new task states. They should only clarify that
`FT-000` is not a product feature and does not participate in product
feature-completion semantics.

### Phase 3 - Generated Skeleton And Runtime Assets

Update `skills/_shared/scripts/init-mb.js`:

- generated `AGENTS.md` must document the new foundation phase;
- command list must include `/foundation-to-tasks`;
- native proxy skills must be generated for the new command;
- fresh bootstrap must not create `.memory-bank/foundation.md`;
- fresh bootstrap must not create `REQ-000`, `FT-000`, or executable task
  records.

If a separate `skills/_shared/references/foundation-template.md` is added,
`init-mb.js` should not copy it into fresh targets by default. It is a command
reference/template for `/spec-design` and `/foundation-to-tasks`, not generated
state.

### Phase 4 - Deterministic Gates

Update `skills/mb-garden/assets/mb-doctor.mjs` with readiness-only checks:

- `W0` is valid only when `task.feature === "FT-000"`;
- non-`FT-000` product tasks must not use `W0`;
- when `.memory-bank/foundation.md` says foundation is required, product tasks
  must depend on the final foundation gate task;
- `FT-000` must be ignored for product feature completion semantics;
- foundation tasks still pass existing task, dependency, tier, packet, protocol,
  and evidence checks.

Use a minimal parseable contract in `.memory-bank/foundation.md`:

```text
## Gate Anchors
- Foundation Required: true|false
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: TASK-<ID>|not_required
```

Update `skills/mb-garden/assets/mb-lint.mjs` only for structural hygiene:

- ensure current validation accepts `REQ-000`, `FT-000`, and `TASK-000`;
- do not move foundation readiness rules from doctor into lint;
- replace internal smoke fixture assumptions that still use
  `feature: "FOUNDATION"` when those fixtures are moved into CI.

### Phase 5 - Package Skill Entrypoints

Update package-level `SKILL.md` files so installed source-only skills do not
teach stale routes:

- `mb-analysis`, `mb-from-prd`, and `cold-start` need the new planning route;
- `mb-map-codebase` needs the brownfield `--verify-existing` foundation path;
- `mb-review` needs checks for foundation bypass and `FT-000` pseudo-feature
  handling;
- `mb-garden` and `mb-harness` need strict doctor guidance for both foundation
  and feature queue boundaries;
- `mb-execute`, `mb-verify`, and `mb-red-verify` need only minimal wording if
  they mention product feature completion or task routing.

### Phase 6 - Docs And CI

Update docs:

- `README.md`, `README.en.md`, `README.ru.md`, and `howItWorks.md` must show
  foundation before feature tasking;
- `PROJECT_MAP.md` must list new hotspots;
- `skills/_shared/references/structure-template.md` must update generated
  AGENTS text, examples, command list, and task examples;
- workflow refs `execute-loop.md`, `autonomy-policy.md`, `tier-policy.md`, and
  `mb-sync.md` must mention foundation only where it changes routing or gates.

Update `.github/workflows/release-check.yml`:

- assert generated target has `.memory-bank/commands/foundation-to-tasks.md`;
- assert `.claude/skills/foundation-to-tasks/SKILL.md` and
  `.agents/skills/foundation-to-tasks/SKILL.md` exist;
- assert fresh bootstrap does not create `.memory-bank/foundation.md`,
  `FT-000`, `REQ-000`, or `TASK-000`;
- add valid foundation queue smoke:
  `REQ-000 -> FT-000 -> TASK-000..TASK-00N`;
- add strict doctor rejection for `W0` on non-`FT-000`;
- add strict doctor rejection for product tasks missing required final gate
  dependency;
- replace old smoke fixtures that use `feature: "FOUNDATION"` with `FT-000` or
  a normal concrete product feature.

Do not edit generated `skills/*/{agents,references,scripts}/shared-*` files.
Keep source-only hygiene.

## Affected Files

New:

- `skills/_shared/references/commands/foundation-to-tasks.md`
- `skills/_shared/references/foundation-template.md` if extracted as a reusable
  template.

Command specs:

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
- `skills/_shared/references/commands/spec-improve.md`
- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/mb-doctor.md`
- `skills/_shared/references/commands/mb-sync.md`
- `skills/_shared/references/commands/review.md`
- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/commands/red-verify.md`

Workflows and templates:

- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/workflows/execute-loop.md`
- `skills/_shared/references/workflows/autonomy-policy.md`
- `skills/_shared/references/workflows/tier-policy.md`
- `skills/_shared/references/workflows/mb-sync.md`

Bootstrap and generated guide:

- `skills/_shared/scripts/init-mb.js`

Package skill entrypoints:

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

Deterministic tools:

- `skills/mb-garden/assets/mb-doctor.mjs`
- `skills/mb-garden/assets/mb-lint.mjs`

CI and docs:

- `.github/workflows/release-check.yml`
- `package.json` only if a new npm script/check alias is added
- `README.md`
- `README.en.md`
- `README.ru.md`
- `howItWorks.md`
- `PROJECT_MAP.md`

## Acceptance Criteria

- Fresh Memory Bank bootstrap creates no fake `.memory-bank/foundation.md`.
- Fresh bootstrap creates no `REQ-000`, `FT-000`, `TASK-000`, or executable
  foundation task records.
- `/spec-design` creates `.memory-bank/foundation.md` only after PRD/features and
  global backbone evidence exist.
- `/foundation-to-tasks` creates `REQ-000`, `FT-000`, foundation task records,
  implementation plan, protocols, and required packets using existing models.
- `/foundation-to-tasks` creates a final foundation gate task that depends on all
  required foundation implementation/probe tasks.
- `/prd-to-tasks FT-000` rejects and routes to `/foundation-to-tasks`.
- `/prd-to-tasks --all` excludes `FT-000`.
- `/prd-to-tasks FT-001` adds the final foundation gate task to `depends_on` for
  generated product feature tasks when foundation is required.
- `/autonomous` runs foundation before feature decomposition/execution.
- `/mb-doctor --strict` accepts a valid foundation queue.
- `/mb-doctor --strict` rejects `W0` on non-`FT-000` product features.
- `/mb-doctor --strict` rejects normal product feature tasks that omit the final
  foundation gate dependency when foundation is required.
- Existing task lifecycle, tier policy, protocol paths, and packet model remain
  unchanged.

## Test Plan

Run source checks:

```bash
npm run check:syntax --silent
node -e 'JSON.parse(require("node:fs").readFileSync("skills/_shared/references/protocols/packet-template.json", "utf8")); console.log("packet template ok")'
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Run install/bootstrap smoke:

```bash
node scripts/install-framework.mjs --skill '*' --yes
tmpdir="$(mktemp -d)"; node scripts/install-framework.mjs --bootstrap --target "$tmpdir" --yes
```

Add CI scenarios for:

- fresh skeleton without foundation state;
- valid foundation queue;
- invalid `W0` product task;
- missing foundation gate dependency;
- `/prd-to-tasks FT-000` command-spec rejection behavior;
- `/prd-to-tasks --all` excluding `FT-000`;
- strict doctor passing after valid foundation gate evidence.
