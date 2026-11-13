# Project Map For Agents

Before changing the framework, read `README.md`, `package.json`,
`scripts/install-framework.mjs`, and `scripts/vendor-shared.mjs`. Inspect
`git status --short`; preserve unrelated work.

## Product and working policy

DevRails is an installed agent development framework. Evaluate a change across
canonical source → installer/generator → deployed target → agent behavior →
durable project state.

The runtime follows intent/requirements → features/design → tasks →
implementation/checks → memory. Stages may be combined or satisfied by existing
work. The policy lives in
`skills/_shared/references/workflows/execute-loop.md#working-policy` and is
installed as `.memory-bank/workflows/execute-loop.md`.

Substantive manual choices are discussed with the operator. Autopilot or explicit
autonomy permits decisions within granted scope. Framework command sequences,
formal approvals, fresh contexts, TDD, and protocol depth are recommendations;
user constraints, real prerequisites, data consistency, and honest evidence
remain meaningful boundaries. Missing process artifacts do not alone block work.

## Source-only packaging

`skills/_shared/` is the canonical shared source. Do not create or commit
package-local `skills/*/{agents,references,scripts}/shared-*` copies.

The installer prepares a temporary repository, runs `vendor-shared.mjs`,
generates all runtime command skills for `.agents/skills/` and `.claude/skills/`,
and optionally bootstraps/syncs Memory Bank. Direct `npx skills add <repo>` is
not supported. Install-only does not create Memory Bank.

Local `.memory-bank/`, `.agents/`, `.claude/`, `.codex/`, `.protocols/`, and
`.tasks/` are ignored dogfood/runtime outputs, not canonical source or scratch
space. Bootstrap and sync tests use isolated temporary targets.

## File ownership

| Surface | Canonical source / purpose |
|---|---|
| User documentation | `README.md`, `howItWorks.md`, `GREENFIELD_WORKFLOW.md` |
| Installer | `scripts/install-framework.mjs`: external install/bootstrap/sync, both runtime surfaces, collision safety |
| Temporary preparation | `scripts/vendor-shared.mjs`: shared assets for package entrypoints |
| Runtime skills | `skills/_shared/references/commands/*.md`: full generated command instructions |
| Shared workflow | `skills/_shared/references/workflows/*.md`: policy, execution, autonomy, sync and design guidance |
| Deployed guide | `skills/_shared/references/deployable/AGENTS.md`: target root guide |
| Roles and supporting agents | `skills/_shared/references/roles/`, `skills/_shared/agents/` |
| Protocol templates | `skills/_shared/references/protocols/`: optional task/run aids, copied into `.memory-bank/templates/protocols/` |
| Memory Bank generator | `skills/_shared/scripts/init-mb.js`: skeleton, schema, framework-owned assets, installed skill index |
| Structure reference | `skills/_shared/references/structure-template.md`: generated tree and artifact shapes |
| Package entrypoints | `skills/{start,mb-init,mb-garden}/SKILL.md`: package/install surface, not duplicate runtime commands |
| Mechanical lint | `skills/mb-garden/assets/mb-lint.mjs` |
| Diagnostic doctor | `skills/mb-garden/assets/mb-doctor.mjs` and `mb-doctor/*.mjs` |
| Install/sync tests | `scripts/test-install-sync.mjs`: isolated deployment, parity, resources, source-only links, preservation and idempotence |
| Doctor tests | `scripts/test-mb-doctor.mjs`: diagnostic CLI and task/Foundation/acceptance fixtures |

Read `skills/mb-garden/assets/mb-doctor/AGENTS.md` before changing doctor code.

## Task model

The task schema and existing task identity remain unchanged by the workflow
simplification. `.memory-bank/tasks/index.json` indexes `TASK-*.task.json`.
IDs use `TASK-NNN-TN-FT-NNN-WN`; their tier/feature/wave segments match the card.
Lifecycle remains `planned|ready|in_progress|blocked|done|done_for_prod|failed`.

Task fields support distinct mechanisms:

- `id`, `status`, `feature`, `wave`, and `depends_on` support identity, queue
  selection, real prerequisites, completion and recovery.
- `tier` guides the depth of work. It does not mandate TDD or a full protocol.
- `reqs` links governing requirements; exact AC locators in `source_artifacts`
  assign acceptance outcomes to tasks.
- `normative_inputs`, `constraints`, `invariants`, `purpose`, `success_outcome`,
  and `anti_goals` carry task-relevant meaning into a new context.
- `gates`, `verification_targets`, and `evidence_required` describe planned
  checks and evidence; `verify` records what was actually observed.
- `touched_files` is advisory. A deliberately non-empty
  `runtime_context.write_boundary` is a hard literal-path allow-list;
  `allowed_write_scope` is a deprecated read alias. Forbidden scope and stop
  conditions keep their explicit meaning.
- `docs` remains in the schema; changing its required presence is a separate
  decision, not part of shortening skill text.

Do not change schema fields merely because a process step is optional. Trace
producers, consumers, lint/doctor and fixtures before revising a field. Schema
and lint encode format separately. Sync updates framework-owned schema and
scripts but does not migrate existing task cards.

Primary touch points: `feature-to-tasks`, `foundation-to-tasks`, `exe`, `verify`,
`red-verify`, `review-tasks-plan`, `autopilot`, `autonomous`, `mb-sync`, tier and
autonomy policies, generator, lint, doctor, and both test scripts.

The `Production acceptance:` title prefix excludes production-only tasks from
development scheduling. It is functional metadata despite living in `title`.
Do not translate or remove it without changing all consumers.

## Foundation and scheduler

`FT-000`, `REQ-000` and W0 identify Foundation work in the normal task model.
`/autonomous` handles needed Foundation work; `/autopilot` handles the product
queue. Fresh bootstrap creates no Foundation plan, FT-000 task, or runnable
product task. Preserve real dependencies on Foundation results.

The scheduler records a resumable checkpoint under
`.protocols/AUTONOMOUS-RUN/status.md`, reconciles it with task evidence, and
avoids replaying uncertain side effects. `/exe` starts a selected task; the
scheduler owns final states in scheduler flow. The top-level manual executor
can finish the requested task within its scope. Separate verdict commands
provide evidence without expanding a read-only assignment.

Sequential execution remains the default. Explicit `--experimental-parallel`
uses isolated workspaces and deliberately disjoint write boundaries. Advisory
`touched_files` never proves isolation.

## Design, acceptance and memory

- Canonical specs use subject-based paths under `architecture/`, `contracts/`,
  `domains/`, `states/`, `testing/`, `runbooks/`, `guides/`, or `adrs/`.
  Feature docs compose links; avoid duplicate feature-specific spec hubs.
- `spec-index.md` is the spec registry. `spec-backbone.md` records current
  design framing; Planning Revision and reconciliation markers help find drift,
  not enforce a formal approval queue.
- `architecture/system-architecture.md` describes system shape and useful
  durable AD rules. `contracts/boundary-map.md` owns the detailed module and
  Consumer → Provider topology when relevant. Do not duplicate it into task
  cards or turn every graph edge into a task dependency.
- Stable `FT-NNN-AC-NNN` criteria link to REQ; tasks link their exact claims.
  Preserve the distinction between accepted result, proposed proof and actual
  evidence. Do not fabricate historical RED or review verdicts.
- Behavior specs are optional examples with no separate registry, schema,
  lifecycle or gate. Link them through `source_artifacts` when useful.
- `/mb-sync` reconciles actual changes, keeping task state authoritative and
  project docs current; it does not create a new acceptance decision.

Relevant design sources: `spec-init`, `spec-design`, `spec-redesign`, `spec-auto`,
`feature-to-tasks`, `prd-to-features`, `write-prd`, and
`workflows/sdd-design-contract.md`.

## Installed references

The installer explicitly attaches `semantic-packs/finding-adjudication.md` to
review-feat-plan, review-tasks-plan, verify and red-verify, and
`semantic-packs/web-design-reviewer.md` to verify/red-verify. The code-review
prompt is attached to verify as `agents/review-code.md`. These are optional
assessment aids; a deployed skill references its local resource, not a
`skills/_shared/` path.

Shared workflows, roles and protocol templates are copied into Memory Bank.
Every referenced required asset must resolve in a bootstrapped isolated target.
`--bootstrap-only --sync` updates Memory Bank assets but not runtime skills;
use `--bootstrap --sync` for a coherent framework update.

## Validation

Run checks appropriate to the changed surface:

```bash
npm run check:syntax --silent
npm run test:mb-doctor --silent
npm run test:install-sync --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

The source-only count is `0`. For explicit isolated smoke:

```bash
tmp_target="$(mktemp -d)"
node scripts/install-framework.mjs --install-only --target "$tmp_target/install-only" --yes
node scripts/install-framework.mjs --bootstrap --target "$tmp_target/bootstrap" --yes
```

Do not overwrite task/protocol/project-owned state while updating framework
assets. Review `git status --short` after changes; do not commit generated output.
