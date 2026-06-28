# Project Map For Agents

## Read First

Before changing this repository, read:

- `README.md`
- `package.json`
- `scripts/install-framework.mjs`
- `scripts/vendor-shared.mjs`
- `.github/workflows/release-check.yml`

## Core Invariant: Source-Only Skill Packaging

This fork intentionally does not commit generated package-local `shared-*` files.

Current source tree:

```text
skills/_shared/...        canonical shared source
skills/<skill>/SKILL.md   package skill entrypoints
skills/<skill>/shared-*   not committed in source-only form
```

Installation and CI generate the missing package-local copies in a temporary prepared repository:

```text
source-only repo
  -> scripts/install-framework.mjs
  -> temporary repo copy
  -> scripts/vendor-shared.mjs
  -> full runtime command skills generated into target .agents/.claude
  -> bootstrap/sync Memory Bank skeleton from prepared temp repo
```

Do not edit or commit generated `skills/*/{agents,references,scripts}/shared-*` files. If shared behavior needs to change, edit `skills/_shared/...`.

This source repository also does not track a deployed `.memory-bank/` baseline.
Local `.memory-bank/`, `.agents/`, `.claude/`, `.protocols/`, and `.tasks/`
directories are generated dogfood/runtime output only. Validate generated
Memory Bank behavior through temporary bootstrap/smoke targets instead of
committing those outputs.

## File Ownership Map

Root documentation:

- `README.md`: short bilingual entrypoint and install warning.
- `howItWorks.md`: detailed workflow and framework behavior documentation.
- `GREENFIELD_WORKFLOW.md`: greenfield manual/autopilot workflow map.
- `PROJECT_MAP.md`: this file, intended as agent priming.

Packaging and install:

- `package.json`: package bin and scripts.
- `scripts/install-framework.mjs`: correct installer for this fork; no args starts the interactive one-command install/bootstrap flow, explicit `--skill ... --yes` installs selected runtime command skills without TUI, and bootstrap paths prepare a temporary vendored repo before generating target `.agents/.claude` skills.
- `scripts/vendor-shared.mjs`: generator that copies `skills/_shared` files into every installable skill package; normal install uses it inside a temporary prepared repository, while direct source-tree vendoring requires explicit `--in-place`.
- `.github/workflows/release-check.yml`: CI source-only hygiene, syntax checks, install smoke, bootstrap smoke.

Canonical shared source:

- `skills/_shared/agents/*.md`: shared worker/reviewer prompts.
- `skills/_shared/references/commands/*.md`: canonical command specs copied into generated runtime skills by the installer.
- `skills/_shared/references/protocols/*`: protocol templates and derivative artifact templates such as `packet-template.json`.
- `skills/_shared/references/structure-template.md`: Memory Bank structure reference.
- `skills/_shared/scripts/init-mb.js`: Memory Bank bootstrap/sync generator.

Installable skill entrypoints:

- `skills/cold-start/SKILL.md`
- `skills/mb-analysis/SKILL.md`
- `skills/mb-init/SKILL.md`
- `skills/mb-from-prd/SKILL.md`
- `skills/mb-map-codebase/SKILL.md`
- `skills/mb-execute/SKILL.md`
- `skills/mb-verify/SKILL.md`
- `skills/mb-red-verify/SKILL.md`
- `skills/mb-review/SKILL.md`
- `skills/mb-garden/SKILL.md`
- `skills/mb-harness/SKILL.md`

Skill-specific non-shared assets:

- `skills/mb-analysis/assets/*.md`: analysis index, brainstorming, and product brief templates.
- `skills/mb-garden/assets/mb-lint.mjs`: packaged deterministic Memory Bank structural/mechanical hygiene linter.
- `skills/mb-garden/assets/mb-doctor.mjs`: current packaged location for the deterministic workflow/autonomous readiness check over `mb-lint`.
- `skills/mb-garden/assets/memory-bank-lint.yml`: related lint config asset.
- `skills/mb-harness/assets/codex-config.toml`: Codex harness config template.
- `skills/mb-from-prd/references/*.md`: PRD decomposition templates.
- `skills/mb-map-codebase/references/*.md`: mapping/synthesis references.
- `skills/mb-verify/agents/verifier.md`: verifier-specific agent prompt.

## JSON Task Registry Work Hotspots

For updates that change the JSON-only task registry or indexed task record model, expect the main touch points to be:

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/commands/foundation-to-tasks.md`
- `skills/_shared/references/commands/write-prd.md`
- `skills/_shared/references/commands/clarify-feature.md`
- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/_shared/references/commands/mb-packet.md`
- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/commands/mb-sync.md`
- `skills/mb-garden/assets/mb-lint.mjs` (packaged deterministic lint asset)
- `skills/mb-garden/assets/mb-doctor.mjs` (current packaged deterministic readiness asset)
- `.github/workflows/release-check.yml`
- `README.md`, `howItWorks.md`, `GREENFIELD_WORKFLOW.md`

## Foundation Dev Path Hotspots

Foundation uses normal JSON task records and the reserved pseudo-feature
`FT-000`; it must not introduce a separate registry, task lifecycle, protocol
family, or task schema.

Primary source files:

- `skills/_shared/references/commands/spec-design.md` for writing
  `.memory-bank/foundation.md` and the Feature Pressure Map
- `skills/_shared/references/commands/foundation-to-tasks.md` for `REQ-000`,
  `FT-000`, foundation task records, packets, and the final foundation gate
- `skills/_shared/references/commands/prd-to-tasks.md` for rejecting `FT-000`,
  excluding it from `--all`, and adding final gate dependencies to product tasks
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/mb-doctor.md`
- `skills/_shared/scripts/init-mb.js`
- `skills/mb-garden/assets/mb-doctor.mjs`
- `.github/workflows/release-check.yml`
- `README.md`, `howItWorks.md`, `GREENFIELD_WORKFLOW.md`

Fresh bootstrap must not create `.memory-bank/foundation.md`, `REQ-000`,
`FT-000`, `TASK-000-T1-FT-000-W0`, or any runnable foundation records.

## Architecture Spine Hotspots

Architecture Spine is a compact design-pressure guardrail inside
`.memory-bank/architecture/system-architecture.md#Architecture Spine`. It uses
stable `AD-*` executable rules and does not introduce a separate architecture
workflow.

Primary source files for this behavior:

- `skills/_shared/references/commands/spec-design.md` for creating/updating the
  spine during the global SDD backbone gate
- `skills/_shared/references/commands/spec-auto.md` for applying the same KISS
  AD rules during autonomous feature design
- `skills/_shared/references/commands/prd-to-tasks.md` for initial feature-local
  design, repair/reconciliation, and copying relevant AD/boundary links into
  task fields
- `skills/_shared/references/commands/review-tasks-plan.md` for fresh-context
  review of shared-boundary AD/boundary routing before execution
- `skills/_shared/references/structure-template.md` and
  `skills/_shared/scripts/init-mb.js` for generated skeleton templates
- `skills/mb-garden/assets/mb-lint.mjs` and
  `skills/mb-garden/assets/mb-doctor.mjs` for minimal deterministic checks

Do not add a new task schema, `/architecture` workflow, BMAD output folders, or
mandatory ADRs for local/simple work.

## Task Runtime Context / Execution Packet Hotspots

Execution Packets are derivative runtime artifacts under
`.memory-bank/packets/TASK-*.packet.json`, with concrete file names following
`TASK-NNN-TN-FT-NNN-WN.packet.json`. They summarize task/spec context for one run
but never replace JSON task records or linked SDD specs as source of truth.
T2/T3 tasks require a canonical `.memory-bank/packets/<task.id>.packet.json`
before execute/scheduler
implementation. T0/T1 tasks require packets only when
`runtime_context.packet_required: true`.

Primary source files for this behavior:

- `skills/_shared/references/commands/prd-to-tasks.md` for copying
  boundary-map/contract evidence into existing task link fields and
  `runtime_context`
- `skills/_shared/references/commands/mb-packet.md`
- `skills/_shared/references/protocols/packet-template.json`
- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/commands/red-verify.md`
- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/workflows/tier-policy.md`
- `skills/_shared/references/workflows/mb-sync.md`
- `skills/mb-execute/SKILL.md`
- `skills/mb-verify/SKILL.md`
- `skills/mb-red-verify/SKILL.md`

Do not add `.memory-bank/modules/`, `.memory-bank/graph/`,
`.memory-bank/verification/`, Failure Packet artifacts, or new task lifecycle
statuses for this flow.

Task planning is JSON-only: `.memory-bank/tasks/index.json` indexes `.memory-bank/tasks/TASK-*.task.json` records, concrete task IDs use `TASK-NNN-TN-FT-NNN-WN`, the ID tier/feature/wave segments must match `task.tier`, `task.feature`, and `task.wave`, and commands must treat those records as the only task model.

## Behavior Specs Hotspots

Behavior specs are optional JSON `given / when / then` examples under
`.memory-bank/behavior-specs/`. They have no registry, schema, validator,
doctor gate, task field, or verification-gate semantics. `/prd-to-tasks` may
create 0-3 specs per feature when evidence shows concrete behavior examples
will reduce implementation ambiguity. Feature docs link them in `## Behavior
specs`; task records link task-relevant specs only through `source_artifacts`.

Primary source files for this behavior:

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `skills/mb-from-prd/references/feature-template.md`
- `skills/_shared/references/commands/prd.md`
- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`
- `.github/workflows/release-check.yml`
- `README.md`, `howItWorks.md`

Do not add a behavior registry, JSON Schema, lint/doctor gate, new task field,
feature frontmatter field, test runner, or verification requirement for behavior
specs.

## Verification Commands

Fast syntax/source-only check:

```bash
npm run check:syntax --silent
node -e 'JSON.parse(require("node:fs").readFileSync("skills/_shared/references/protocols/packet-template.json", "utf8")); console.log("packet template ok")'
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

The source-only count command should print `0` in the source-only working tree.

Install smoke without mutating the working repository:

```bash
node scripts/install-framework.mjs --skill '*' --yes
```

One-command bootstrap smoke:

```bash
tmpdir="$(mktemp -d)"; node scripts/install-framework.mjs --bootstrap --target "$tmpdir" --yes
test -f "$tmpdir/.memory-bank/tasks/index.json"
test -f "$tmpdir/AGENTS.md"
```

To inspect the generated temporary package tree during installer debugging:

```bash
MEMOBANK_KEEP_INSTALL_TMP=1 node scripts/install-framework.mjs --skill '*' --yes
```

## Dirty Worktree Rule

This repository may contain unrelated uncommitted changes. Do not revert or overwrite files you did not intentionally touch. Check `git status --short` before and after changes, and keep your write set explicit.
