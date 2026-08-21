# Project Map For Agents

## Read First

Before changing this repository, read:

- `README.md`
- `package.json`
- `scripts/install-framework.mjs`
- `scripts/vendor-shared.mjs`

## Core Invariant: Source-Only Skill Packaging

This fork intentionally does not commit generated package-local `shared-*` files.

Current source tree:

```text
skills/_shared/...        canonical shared source
skills/<skill>/SKILL.md   package skill entrypoints
skills/<skill>/shared-*   not committed in source-only form
```

The installer generates the missing package-local copies in a temporary prepared repository:

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
- `scripts/install-framework.mjs`: correct installer for this fork; no args starts the interactive one-command install/bootstrap flow, every install route deploys the complete runtime command set into both target surfaces, and bootstrap paths prepare a temporary vendored repo before generating target `.agents/.claude` skills.
- `scripts/vendor-shared.mjs`: generator that copies `skills/_shared` files into every installable skill package; normal install uses it inside a temporary prepared repository, while direct source-tree vendoring requires explicit `--in-place`.
- `scripts/test-install-sync.mjs`: isolated smoke for collision-safe runtime
  deployment, source/deployed parity, bootstrap, sync restoration and project
  state preservation, idempotence, and bootstrap-only ownership boundaries.
- `scripts/test-mb-doctor.mjs`: isolated CLI/report characterization,
  architecture-boundary assertions, and Foundation/task/acceptance/brownfield
  fixture matrix.

Canonical shared source:

- `skills/_shared/agents/*.md`: shared delegated-agent prompts.
- `skills/_shared/references/commands/*.md`: canonical command specs copied into generated runtime skills by the installer.
- `skills/_shared/references/commands/tech-debt.md`: advisory technical-debt
  report contract; `/autopilot` runs it by default after a successful product
  wave boundary, while manual boundary handoffs only recommend it.
- `skills/_shared/references/protocols/*`: canonical protocol and handoff
  templates, deployed as framework-owned
  `.memory-bank/templates/protocols/*`; `.protocols/<TASK_ID>/*` remains
  task-owned state.
- `skills/_shared/references/deployable/AGENTS.md`: canonical deployable agent
  guide copied to the target repository root during bootstrap/sync.
- `skills/_shared/references/structure-template.md`: Memory Bank structure reference.
- `skills/_shared/scripts/init-mb.js`: Memory Bank bootstrap/sync generator; it
  derives the managed `.memory-bank/skills/index.md#Installed` block from
  target `.agents/.claude` `SKILL.md` files while preserving authored sections.

Installable skill entrypoints:

- `skills/start/SKILL.md`
- `skills/mb-init/SKILL.md`
- `skills/mb-garden/SKILL.md`

Skill-specific non-shared assets:

- `skills/mb-garden/assets/mb-lint.mjs`: packaged deterministic Memory Bank
  structural/mechanical hygiene linter.
- `skills/mb-garden/assets/mb-doctor.mjs`: canonical CLI entrypoint for the
  deterministic workflow/autonomous readiness check over `mb-lint`; it is
  deployed unchanged as `scripts/mb-doctor.mjs`.
- `skills/mb-garden/assets/mb-doctor/*.mjs`: canonical internal doctor modules,
  deployed beside the entrypoint under `scripts/mb-doctor/`.
- `skills/mb-garden/assets/mb-doctor/AGENTS.md`: source-only ownership and
  change-routing contract for future doctor work.
- `skills/mb-garden/assets/memory-bank-lint.yml`: related lint config asset.

## JSON Task Registry Work Hotspots

For updates that change the JSON-only task registry or indexed task record model, expect the main touch points to be:

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/commands/foundation-to-tasks.md`
- `skills/_shared/references/commands/write-prd.md`
- `skills/_shared/references/commands/feature-doctor.md`
- `skills/_shared/references/commands/feature-to-tasks.md`
- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/commands/exe.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/commands/mb-sync.md`
- `skills/mb-garden/assets/mb-lint.mjs` (packaged deterministic lint asset)
- `skills/mb-garden/assets/mb-doctor.mjs` and
  `skills/mb-garden/assets/mb-doctor/*.mjs` (packaged deterministic readiness
  entrypoint and modules)
- `README.md`, `howItWorks.md`, `GREENFIELD_WORKFLOW.md`

## Foundation Dev Path Hotspots

Foundation uses normal JSON task records and the reserved pseudo-feature
`FT-000`; it must not introduce a separate registry, task lifecycle, protocol
family, or task schema.

Primary source files:

- `skills/_shared/references/commands/spec-design.md` for writing
  `.memory-bank/foundation.md` and the Feature Pressure Map
- `skills/_shared/references/commands/foundation-to-tasks.md` for `REQ-000`,
  `FT-000`, foundation task records, and the final foundation gate
- `skills/_shared/references/commands/feature-to-tasks.md` for rejecting `FT-000`,
  accepting one product feature per fresh context, and adding final gate
  dependencies to product tasks
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/workflows/execute-loop.md` for the shared isolated
  per-feature tasking and review boundary
- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/mb-doctor.md`
- `skills/_shared/scripts/init-mb.js`
- `skills/mb-garden/assets/mb-doctor.mjs` and
  `skills/mb-garden/assets/mb-doctor/*.mjs`
- `scripts/test-mb-doctor.mjs`
- `README.md`, `howItWorks.md`, `GREENFIELD_WORKFLOW.md`

Fresh bootstrap must not create `.memory-bank/foundation.md`, `REQ-000`,
`FT-000`, `TASK-000-T1-FT-000-W0`, or any runnable foundation records.

## Architecture Spine Hotspots

Architecture Spine is a compact design-pressure guardrail inside
`.memory-bank/architecture/system-architecture.md#Architecture Spine`. It uses
stable `AD-*` executable rules and does not introduce a separate architecture
workflow.

Domain-modeling guidance stays inline: accepted target wins; otherwise local
style is preferred, while material translation boundaries use existing decision
routing. It adds no DDD artifact, status, or lifecycle.

Global planning freshness uses one integer
`.memory-bank/spec-backbone.md#Global Backbone Status` `Planning Revision`.
Only a proved durable planning-semantics change with product-wide impact
increments it and invalidates all product task-plan approvals. Bounded changes
preserve the revision and reconcile only affected features; task lifecycle and
completed evidence remain unchanged. Current reviews bind through
`REVIEWED_PLANNING_REVISION`.

Primary source files for this behavior:

- `skills/_shared/references/workflows/sdd-design-contract.md` for shared SDD
  authority, canonical ownership, architecture integrity, and semantic validation
- `skills/_shared/references/commands/spec-design.md` for the initial backbone
  and spine
- `skills/_shared/references/commands/spec-redesign.md` for accepted contract
  changes and evidence-bounded impact classification
- `skills/_shared/references/commands/spec-auto.md` for applying the same KISS
  AD rules during autonomous feature design
- `skills/_shared/references/commands/feature-to-tasks.md` for registry-first
  feature concern discovery, subject-based canonical spec reconciliation, and
  copying relevant AD/boundary links into task fields
- `skills/_shared/references/commands/review-tasks-plan.md` for fresh-context
  review of shared-boundary AD/boundary routing and binding `APPROVE` to the
  current Planning Revision
- `skills/_shared/references/commands/architecture-review.md` for the delegated
  bounded C4 L1-L3, boundary, dependency, and invariant verdict
- `skills/_shared/references/commands/autopilot.md` and
  `skills/_shared/references/commands/exe.md` for rejecting stale product
  approvals without task lifecycle mutation
- `skills/_shared/references/commands/exe.md` and
  `skills/_shared/references/commands/verify.md` for point-of-use boundary
  protection and task-scoped verification of the allowed architectural path
- `skills/_shared/references/workflows/autonomy-policy.md` and
  `skills/_shared/references/workflows/execute-loop.md` for the shared
  sequential bounded/global reconciliation and review routes
- `skills/_shared/references/structure-template.md` and
  `skills/_shared/scripts/init-mb.js` for generated skeleton templates
- `skills/mb-garden/assets/mb-lint.mjs` and
  `skills/mb-garden/assets/mb-doctor.mjs` and its `mb-doctor/*.mjs` modules for
  minimal deterministic checks

Do not add a new task schema, `/architecture` workflow, BMAD output folders, or
mandatory ADRs for local/simple work.

## Canonical Dependency Graph Hotspots

`.memory-bank/contracts/boundary-map.md` is the single accepted detailed
module/change-unit inventory and `Consumer -> Provider` topology. It uses exact
contract-heading links, remains an architecture input to existing plans/tasks,
and adds no graph lifecycle, registry, scheduler, or task field.

Primary source files:

- `skills/_shared/references/structure-template.md` and
  `skills/_shared/scripts/init-mb.js` for the empty canonical template and
  seed-once preservation during sync
- `skills/_shared/references/commands/spec-init.md` and
  `skills/_shared/references/commands/map-codebase.md` for preliminary/as-is
  evidence without accepted-edge authority
- `skills/_shared/references/workflows/sdd-design-contract.md` for the shared
  canonical graph and architecture authoring contract
- `skills/_shared/references/commands/spec-design.md`, `spec-redesign.md`,
  `spec-auto.md`, and `feature-to-tasks.md` for accepted architecture units,
  graph reconciliation, reverse impact, and Planning Revision ownership
- `skills/_shared/references/commands/architecture-review.md`,
  `review-tasks-plan.md`, `exe.md`, and `verify.md` for semantic subgraph,
  point-of-use, and allowed-path checks
- `skills/_shared/references/commands/mb-sync.md` and
  `skills/_shared/references/workflows/mb-sync.md` for link-only reconciliation
- `skills/mb-garden/assets/mb-lint.mjs` for mechanical graph validation
- `scripts/test-install-sync.mjs` for deployed template preservation, validator,
  and isolated installer coverage

Do not duplicate module inventory in `system-architecture.md`, copy feature
subgraphs into implementation plans/tasks, or mechanically convert graph edges
into task dependencies.

## Architect And KISS Review Hotspots

- `skills/_shared/references/roles/architect.md`: canonical Architect policy.
- `skills/_shared/references/commands/kiss-architect.md`: in-session adapter to
  that policy.
- `skills/_shared/references/commands/architecture-review.md`: bounded C4 and
  architecture review used by `/review-tasks-plan`.
- `skills/_shared/references/commands/review-tasks-plan.md`: owns the final
  planning verdict, reuses unchanged prior evidence, and conditionally
  escalates unresolved architecture boundary questions.
- `skills/_shared/references/roles/orchestrator.md`: Architect delegation route.
- `skills/_shared/references/deployable/AGENTS.md`: deployed role routing and
  KISS text.
- `skills/_shared/scripts/init-mb.js` and
  `skills/_shared/references/structure-template.md`: deployment and generated
  Memory Bank role/index structure.

Keep `architecture-review` read-only; its Reviewer verdict covers only the
architecture review, while `/review-tasks-plan` owns the final planning verdict.
Do not create a new architecture lifecycle, task status, protocol family, or
mandatory ADR gate.

## Subject-Based Canonical SDD Spec Hotspots

Features compose product behavior and exact spec links; they do not own default
`FT-*` design-spec hubs. New specs use subject-based canonical paths under
`architecture/`, `contracts/`, `domains/`, `states/`, `testing/`, `runbooks/`,
`guides/`, or `adrs/`. `spec-index.md` registers
`Type | Path | Status | Scope | Change route`; reverse usage comes from
feature/task links and search.

Primary source files:

- `skills/_shared/references/commands/feature-to-tasks.md`
- `skills/_shared/references/commands/spec-design.md`
- `skills/_shared/references/commands/spec-auto.md`
- `skills/_shared/references/commands/foundation-to-tasks.md`
- `skills/_shared/references/commands/review-tasks-plan.md`
- `skills/_shared/references/commands/exe.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`

Fresh bootstrap must not create `.memory-bank/tech-specs/`. Lint/doctor may
still recognize that legacy path as brownfield migration evidence; semantic
hub-only rejection belongs to `/review-tasks-plan`.

## Stable Acceptance Closure Hotspots

Product feature acceptance uses stable `FT-<NNN>-AC-<NNN>` headings linked to
governing `REQ-*`. Tasks address ACs through exact feature anchors in existing
`source_artifacts`; T2/T3 prospective proof repeats the same ID in existing
`verification_targets` and `evidence_required`.

For a material product outcome—an edge/failure outcome or non-functional
quality whose failure can itself block acceptance or realize a significant
accepted risk—the semantic chain closes through accepted REQ/AC or a sourced
authoritative out-of-scope disposition, exact task mapping, planned proof, and
verified evidence. Product targets remain `/write-prd` owned. Tasks proving a
material NFR carry `verification_targets` and `evidence_required` at every
tier; compact T0/T1 changes protocol depth only. Subject specs are reserved for
non-trivial reproducible measurement detail.

Primary source files:

- `skills/_shared/references/commands/write-prd.md`
- `skills/_shared/references/commands/prd-to-features.md`
- `skills/_shared/references/commands/feature-doctor.md`
- `skills/_shared/references/commands/review-feat-plan.md`
- `skills/_shared/references/commands/spec-auto.md`
- `skills/_shared/references/commands/feature-to-tasks.md`
- `skills/_shared/references/commands/review-tasks-plan.md`
- `skills/_shared/references/commands/exe.md`
- `skills/_shared/references/commands/mb-doctor.md`
- `skills/_shared/references/workflows/execute-loop.md`
- `skills/_shared/references/workflows/tier-policy.md`
- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/protocols/verification-template.md`
- `skills/mb-garden/assets/mb-doctor.mjs` and
  `skills/mb-garden/assets/mb-doctor/*.mjs`
- `scripts/test-mb-doctor.mjs`
- `scripts/test-install-sync.mjs`

Do not add an AC registry, lifecycle, task field, or schema extension. Historical
terminal tasks without the prospective proof contract do not require fabricated
evidence backfill. Materiality and proof sufficiency remain fresh semantic
review judgments; do not add a heuristic doctor parser.

## Task Runtime Context / Single-Card Handoff Hotspots

The indexed `.memory-bank/tasks/TASK-*.task.json` record is the only durable
task-scoped planning, execution, and verification handoff. T2/T3 records must
carry purpose/outcome, direct task-relevant canonical SDD paths, an expected
change surface, and a verification path before execution. `touched_files` is
advisory and non-exhaustive; a non-empty `runtime_context.write_boundary`
is a deliberate hard boundary. `/mb-doctor` checks only mechanical completeness;
`/review-tasks-plan` owns semantic applicability and sufficiency.
Existing `runtime_context.allowed_write_scope` is accepted only as a deprecated
read alias; new or repaired task cards emit `write_boundary`.

The caller or scheduler selects a concrete task. `/exe` alone prepares its
tier-routed neutral Execution Attempt and writes `ready -> in_progress`; it does
not select queue work, and the attempt adds no task field, owner/basis
provenance, persisted mode, or registry.

Primary source files for this behavior:

- `skills/_shared/references/commands/feature-to-tasks.md` for copying
  boundary-map/contract evidence into existing task link fields and
  `runtime_context`
- `skills/_shared/references/commands/review-tasks-plan.md`
- `skills/_shared/references/commands/mb-doctor.md`
- `skills/_shared/references/commands/exe.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/commands/red-verify.md`
- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/workflows/tier-policy.md`
- `skills/_shared/references/workflows/mb-sync.md`
- `skills/_shared/scripts/init-mb.js` and
  `skills/_shared/references/structure-template.md` for task schema
- `skills/mb-garden/assets/mb-lint.mjs` for mechanical path validation
- `scripts/test-install-sync.mjs` for grammar and deployed sync regression

Canonical scheduler execution is sequential. Experimental parallel execution
requires explicit `--experimental-parallel`, isolated worktrees/sandboxes, and
pairwise-disjoint hard `write_boundary`; never infer independence from
`touched_files`.

Do not add a second durable task-context artifact, nested duplicate context
object, `.memory-bank/modules/`, `.memory-bank/graph/`,
`.memory-bank/verification/`, or new task lifecycle statuses for this flow.

Hard `runtime_context.write_boundary` entries use the literal project-relative
POSIX path and segment-prefix semantics in
`skills/_shared/references/workflows/tier-policy.md`. The same syntax is
enforced by the generated task schema and `mb-lint`; deprecated
`allowed_write_scope` is only a read alias. `forbidden_scope` and
`stop_conditions` remain prose-capable hard constraints. Do not add a glob
engine, path registry, realpath cache, or parallel scheduler for this contract.

Task planning is JSON-only: `.memory-bank/tasks/index.json` indexes `.memory-bank/tasks/TASK-*.task.json` records, concrete task IDs use `TASK-NNN-TN-FT-NNN-WN`, the ID tier/feature/wave segments must match `task.tier`, `task.feature`, and `task.wave`, and commands must treat those records as the only task model.

## Behavior Specs Hotspots

Behavior specs are optional JSON `given / when / then` examples under
`.memory-bank/behavior-specs/`. They have no registry, schema, validator,
doctor gate, task field, or verification-gate semantics. `/feature-to-tasks` may
create 0-3 specs per feature when evidence shows concrete behavior examples
will reduce implementation ambiguity. Feature docs link them in `## Behavior
specs`; task records link task-relevant specs only through `source_artifacts`.

Primary source files for this behavior:

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/commands/prd-to-features.md`
- `skills/_shared/references/commands/feature-to-tasks.md`
- `skills/_shared/references/commands/exe.md`
- `skills/_shared/references/commands/verify.md`
- `README.md`, `howItWorks.md`

Do not add a behavior registry, JSON Schema, lint/doctor gate, new task field,
feature frontmatter field, test runner, or verification requirement for behavior
specs.

## Rendered Web UI Semantic Pack

`skills/_shared/references/semantic-packs/web-design-reviewer.md` is the
canonical conditional rendered-interface lens used by the existing `/verify`
and `/red-verify` commands. The installer deploys it inside both runtime skill
directories as `references/web-design-reviewer.md`; deployed commands must not
reference the source-only path.

The pack narrows evidence to applicable rendered UI concerns and contributes to
the owning command's existing verdict and artifacts. It does not introduce a
workflow, gate, lifecycle, status, task field, or mandatory separate report.

Primary touch points:

- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/commands/red-verify.md`
- `scripts/install-framework.mjs`
- `scripts/test-install-sync.mjs`

## Finding Adjudication Semantic Pack

`skills/_shared/references/semantic-packs/finding-adjudication.md` establishes
two co-review focuses for `/review-feat-plan`, `/review-tasks-plan`, `/verify`,
and `/red-verify`; unchanged recorded focus evidence may be retained, while
each refresh uses `Codex Luna xhigh`. The caller retains the existing verdict,
artifact, lifecycle, and handoff contracts.

The installer deploys the pack inside each owning runtime skill as
`references/finding-adjudication.md`; deployed commands must not reference its
source-only path.

`/verify` also receives `skills/_shared/agents/review-code.md` as
`agents/review-code.md` for one non-blocking best-effort `Codex Luna xhigh`
code co-review. It returns only candidate findings; `/verify` retains its
existing contracts.

Primary touch points:

- `skills/_shared/agents/review-code.md`
- `skills/_shared/references/roles/general.md`
- `skills/_shared/references/roles/reviewer.md`
- `skills/_shared/references/commands/review-feat-plan.md`
- `skills/_shared/references/commands/review-tasks-plan.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/commands/red-verify.md`
- `scripts/install-framework.mjs`
- `scripts/test-install-sync.mjs`

## Verification Commands

Fast syntax/source-only check:

```bash
npm run check:syntax --silent
npm run test:mb-doctor --silent
npm run test:install-sync --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

The source-only count command should print `0` in the source-only working tree.

Install smoke without mutating the working repository:

```bash
node scripts/install-framework.mjs --install-only --yes
```

One-command bootstrap smoke:

```bash
tmpdir="$(mktemp -d)"; node scripts/install-framework.mjs --bootstrap --target "$tmpdir" --yes
test -f "$tmpdir/.memory-bank/tasks/index.json"
test -f "$tmpdir/AGENTS.md"
test -f "$tmpdir/scripts/mb-doctor/readers.mjs"
(cd "$tmpdir" && node scripts/mb-doctor.mjs --json)
```

To inspect the generated temporary package tree during installer debugging:

```bash
MEMOBANK_KEEP_INSTALL_TMP=1 node scripts/install-framework.mjs --install-only --yes
```

## Dirty Worktree Rule

This repository may contain unrelated uncommitted changes. Do not revert or overwrite files you did not intentionally touch. Check `git status --short` before and after changes, and keep your write set explicit.
