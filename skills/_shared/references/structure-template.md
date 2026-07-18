# Memory Bank structure templates

Use these templates to initialize a repo.

> Note: Templates are intentionally **short** and **structural**.
> The Memory Bank will be expanded by the agent based on PRD/codebase.

---

## 1) `AGENTS.md` (repo root)

Keep it ~100 lines. It must be a **map**, not an encyclopedia.

```markdown
# Agent Operating Guide (Project Map)

## Prime before work

Planning/design priming:
1. Read `AGENTS.md` (this guide)
2. Read `.memory-bank/constitution.md` (top governing policy)
3. Read `.memory-bank/mbb/index.md` (Memory Bank rules)
4. Read `.memory-bank/spec-backbone.md` (spec readiness/backbone state)
5. Read `.memory-bank/spec-index.md` (normative spec registry)
6. Read `.memory-bank/index.md` (table of contents)
7. If no explicit top-level role is given, use ROLE: GENERAL and read `.memory-bank/roles/general.md`.
8. If ROLE: ORCHESTRATOR, read `.memory-bank/roles/orchestrator.md`.
9. If delegated worker, read `.memory-bank/roles/worker.md`.
10. Read task/feature-specific docs

Manual execution priming for `/execute TASK-NNN-TN-FT-NNN-WN`:
1. Read `AGENTS.md` (this guide)
2. Read the selected indexed `.memory-bank/tasks/TASK-*.task.json`
3. Read `.memory-bank/workflows/tier-policy.md`
4. Read linked feature/REQ/docs only when needed to interpret the task
5. Read direct task-linked canonical specs; use feature links only for
   composition context or drift checks

For manual `T0` / `T1` execution, do not load Constitution, MBB, full
backbone/index docs, role docs, or broad planning docs by default unless the
selected task, feature, tier, or linked specs route to them.

## Role Mode

If no explicit role is given to the top-level agent, act as:

ROLE: GENERAL

Delegated agents are not ORCHESTRATOR or GENERAL by default.
The role is fixed and cannot be changed.

Full role contracts live in:
- `.memory-bank/roles/orchestrator.md`
- `.memory-bank/roles/general.md`
- `.memory-bank/roles/worker.md`

## KISS / Avoid overengineering
- Implement the simplest solution that fully satisfies current requirements and specs.
- Prefer existing project patterns over new abstractions, layers, registries, frameworks, or workflow artifacts.
- Do not design for hypothetical future scale, integrations, configurability, or reuse without a concrete current requirement.
- Do not introduce enterprise architecture or additional process merely because it may be useful later.
- Added complexity must be justified by an existing requirement, constraint, risk, or demonstrated duplication.
- KISS does not permit skipping required correctness, security, compatibility, or verification gates.

## Communication

- Always answer this user in Russian, while preserving stable English technical terms and established expressions when they are conventional in software engineering, product, or workflow contexts.

## Preferred context routing
- Start with `.memory-bank/architecture/*` and `.memory-bank/guides/*` for concept priming.
- If present, prefer explicit normative docs such as `.memory-bank/constitution.md`, `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, `.memory-bank/invariants.md`, `.memory-bank/glossary.md`, `.memory-bank/contracts/boundary-map.md`, `.memory-bank/contracts/*`, `.memory-bank/states/*`, `.memory-bank/runbooks/*`, and `.memory-bank/testing/*`.
- Normative docs enrich the Memory Bank; they do not invalidate valid duo docs.
- Before serious planning/design work, read `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, and follow linked SDD specs.
- Do not create a new spec before checking `.memory-bank/spec-index.md`,
  relevant folder indexes, and plausible subject-based candidates.
- New design specs use subject-based canonical paths without feature IDs; a
  feature composes applicable spec links and does not own a default spec hub.
- For any tier, if the task record or linked feature contains canonical SDD
  spec links, read `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, and those linked specs before
  implementation or verification.
- For `T2` / `T3` tasks, direct task-linked canonical specs are normative
  inputs; feature links or the registry alone do not replace them.

## Docs First
After finishing a meaningful unit of work:
1) Update `.memory-bank/` (WHY/WHERE + navigation)
2) Then include code changes in the handoff; commit only when explicitly requested or workflow-owned

## Runtime vs durable memory
- Durable knowledge base: `.memory-bank/`
- Operational artifacts: `.tasks/` (NOT part of Memory Bank)
- Long-running plans/logs: `.protocols/`

## Clean context (recommended)
- Route each `TASK-NNN-TN-FT-NNN-WN` by `task.tier` and `.memory-bank/workflows/tier-policy.md`.
- Delegation and worker reports follow `.memory-bank/roles/orchestrator.md` and `.memory-bank/roles/worker.md`.
- T0/T1 may use compact `.protocols/TASK-NNN-TN-FT-NNN-WN/run.md`; compact evidence can be enough.
- Scheduler mode: T2 requires full protocol state, applicable task/spec gates, and `/verify` `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- Scheduler mode: T2 feature completion requires `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all feature tasks are implemented, recorded in the feature doc. Run it when the last T2 feature task closes, before the wave-boundary `/mb-sync` and strict doctor.
- Scheduler mode: T3 requires full protocol state, applicable task/spec gates, `/verify` `VERDICT: PASS`, and per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass` before the scheduler marks `done`.
- Scheduler mode: T3 also requires the exact marker line `HUMAN_CHECKPOINT: done`.
- Manual mode: T0/T1 may close in `/execute` with compact evidence when the explicit manual top-level owner conditions are met; standalone `/verify` is optional for uncertainty, widened scope, or explicit request. T2 becomes closure-eligible after `/verify PASS` when full protocol plus applicable task/spec gates are satisfied; the explicit owner writes the lifecycle decision. T3 must run per-task `/red-verify` before final closure; full `/mb-sync` runs at the end of the current wave unless an earlier reconciled-state dependency or explicit owner request requires it.
- If `/execute` or `/verify` discovers a required higher tier, stop scope growth and route
  the original task ID through `/prd-to-tasks FT-<NNN>` for controlled
  rebuild/split; rerun task-plan review and applicable doctor gates before
  executing the replacement task ID.
- T2/T3 use the indexed task card as the complete task-scoped handoff; `/mb-doctor` checks structural completeness and `/review-tasks-plan` checks semantic applicability and sufficiency.
- If running in **Claude Code**: execute each `TASK-NNN-TN-FT-NNN-WN` in a **fresh Claude session** using tier-appropriate `.protocols/TASK-NNN-TN-FT-NNN-WN/` state.
- If running in **Codex**: you can run each `TASK-NNN-TN-FT-NNN-WN` in a fresh session via `codex exec` (see `/execute`).
- Execution file scope: `touched_files` is advisory and non-exhaustive; executor
  preflight confirms actual files, while non-empty `write_boundary` and
  `forbidden_scope` remain hard boundaries.
- Sequencing: canonical task execution is sequential. Parallel task execution is
  experimental, requires explicit `--experimental-parallel`, pairwise-disjoint
  hard `runtime_context.write_boundary`, isolated worktrees/sandboxes, and
  the exclusions in `.memory-bank/workflows/autonomy-policy.md`;
  `touched_files` alone never proves independence.

Codex (fresh session):
- `codex exec --ephemeral --full-auto -m gpt-5.2-high 'TASK_ID=TASK-123-T2-FT-001-W1. Use the installed /execute project skill. Read AGENTS.md, the indexed task record, .memory-bank/workflows/tier-policy.md, and direct task-linked canonical specs. Assume structural readiness was checked by the feature/task-queue gate. Treat touched_files as advisory and non-exhaustive; confirm the actual write set during preflight, respect hard allowed/forbidden scope, and stop on material outcome/tier/design expansion. Implement only semantically scoped changes. Record evidence and actual changed files. Report → .tasks/TASK-123-T2-FT-001-W1/…'`

Claude (fresh session):
- `claude -p --no-session-persistence --permission-mode acceptEdits --model opus 'TASK_ID=TASK-123-T2-FT-001-W1. Use the installed /execute project skill. Read AGENTS.md, the indexed task record, .memory-bank/workflows/tier-policy.md, and direct task-linked canonical specs. Assume structural readiness was checked by the feature/task-queue gate. Treat touched_files as advisory and non-exhaustive; confirm the actual write set during preflight, respect hard allowed/forbidden scope, and stop on material outcome/tier/design expansion. Implement only semantically scoped changes. Record evidence and actual changed files. Report → .tasks/TASK-123-T2-FT-001-W1/…'`

## Two modes (manual vs scheduler)
- **Manual**: run `/brainstorm` for raw ideas or `/brief` for clear concepts → `/constitution` if `project_principles` is not `ratified|partial` → `/write-prd` → `/spec-init` → `/prd` → `/review-feat-plan` for high-risk/large work → `/spec-design` → `/foundation-to-tasks` when foundation is required → `/mb-doctor --strict` at the foundation/task-queue boundary → execute/verify `FT-000` until the foundation gate is `done` → `/prd-to-tasks FT-<NNN>` → `/review-tasks-plan FT-<NNN>` → conditional `/mb-doctor` at the feature/task-queue boundary for T3, autonomous/autopilot handoff, or complex T2/foundation/dependency/stale-doc/risky-link cases → execute tasks one-by-one with tier routing. T0/T1 manual: `/execute TASK`, compact evidence or no-runnable-check note, optional local closure by explicit owner. T2 manual: `/execute TASK` → `/verify TASK`, then sync at wave/feature boundary. T3 manual: `/execute TASK` → `/verify TASK` → `/red-verify TASK`, then explicit owner closure and wave-boundary `/mb-sync`. Run `/red-verify --feature FT-<NNN>` before T2 feature completion, recording the verdict in the feature doc. Every task writes status/closure/evidence immediately; full `/mb-sync` runs once at the end of the wave, with early sync only for a real reconciled RTM/index/spec/contract/changelog dependency or explicit owner request. `/mb-sync` is not required for local T0/T1 closure when only `task.status`, `task.verify`, and `.protocols/<TASK>/run.md` changed. `/prd-to-tasks` performs canonical concern discovery/task generation and later reconciles subject-based specs, direct task links, task cards, and plans. `/spec-design` is mandatory after `/prd`, but local/simple feature-set pressure may record a minimal backbone with irrelevant areas `not_applicable`; it always records the explicit `.memory-bank/foundation.md` decision, and `/foundation-to-tasks` creates normal `FT-000` task records only when foundation is required. Use `/clarify-feature FT-<NNN>` only for explicit feature blockers and rerun `/prd-to-tasks FT-<NNN>` for feature-level canonical spec repair.
- **Autonomous (batch)**: use `/autonomous` for full `PRD → done`; it runs `/spec-auto --init`, `/review-feat-plan`, mandatory `/spec-design --all`, `/foundation-to-tasks` when required, strict `/mb-doctor` at the foundation/task-queue boundary, and execute/verify `FT-000` until the foundation gate is `done` before `/spec-auto --all`, `/prd-to-tasks --all`, and `/review-tasks-plan FT-<NNN>` for each task-linked product feature. Use `/autopilot` only if JSON task records and required SDD spec links already exist and every task-linked product feature has latest `/review-tasks-plan FT-<NNN>` `APPROVE`. See: `.memory-bank/workflows/execute-loop.md` and `.memory-bank/workflows/autonomy-policy.md`.

`.tasks/` naming:
- Folder per process: `.tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/`
- Files: `TASK-<NNN>-T<N>-FT-<NNN>-W<N>-S-<STAGE>-final-report-<code|docs>-<NN>.md`
- Keep each report to ≤ 3–5 files worth of analysis to avoid context overflow

## Quality gates (before merge)
- Run only applicable project-native lint, typecheck, build, and test commands
  required by current task/spec/PRD evidence or repository configuration.
- Run `/mb-doctor` when the workflow boundary requires it; strict mode remains
  mandatory before autonomous/autopilot task selection.
- Do not require a test level solely to fill a category.

## Memory Bank entry points
Command specs live in `skills/_shared/references/commands/*.md` in the source
repo. The DevRails 26 installer generates full runtime command skills directly
into `.agents/skills/<name>/SKILL.md` and `.claude/skills/<name>/SKILL.md`.
`.memory-bank/` stores project state/docs only, not command specs.

Representative commands:
- `/brainstorm`
- `/brief`
- `/constitution`
- `/write-prd`
- `/spec-init`
- `/prd`
- `/spec-design`
- `/foundation-to-tasks`
- `/spec-auto`
- `/clarify-feature`
- `/prd-to-tasks`
- `/execute`
- `/verify`
- `/red-verify`
- `/autopilot`
- `/mb-doctor`

> Keep this file small. Deep docs live under `.memory-bank/`.
```

Create symlinks (or copies if symlink not supported):
- `CLAUDE.md` → `AGENTS.md`
- `GEMINI.md` → `AGENTS.md` *(optional)*

### Native runtime command skills

The installer creates full command skills so commands work natively across tools:

| Directory | Runtime |
|-----------|---------|
| `.claude/skills/<name>/SKILL.md` | Claude Code |
| `.agents/skills/<name>/SKILL.md` | Codex CLI |

> Note: `.codex/` is **not** a skills directory. It is used for Codex **project configuration** (e.g. `.codex/config.toml`).

Each `SKILL.md` follows this pattern:
```yaml
---
name: <command-name>
description: <what it does>
---

<!-- Generated by DevRails 26 install-framework.mjs. Safe to overwrite with install-framework.mjs --sync. -->

<full command spec copied from skills/_shared/references/commands/<command-name>.md>
```

This keeps the source repo command specs as canonical framework source while
the target project gets self-contained runtime skills.

---

## 2) `.memory-bank/index.md`

```markdown
---
description: Главная карта знаний проекта (table of contents) для агентов.
status: active
---
# Memory Bank Index

Этот файл — **главная точка входа**. Он должен оставаться коротким.

## Навигация

- [.memory-bank/constitution.md](constitution.md): Project Constitution — top governing policy for agents.
- [.memory-bank/mbb/index.md](mbb/index.md): Правила ведения Memory Bank (MBB).
- [.memory-bank/roles/orchestrator.md](roles/orchestrator.md): Orchestrator role contract.
- [.memory-bank/roles/general.md](roles/general.md): General role contract for one-agent execution.
- [.memory-bank/roles/worker.md](roles/worker.md): Worker role contracts.
- [.memory-bank/product.md](product.md): Продукт, аудитория, core value (C4 L1).
- [.memory-bank/requirements.md](requirements.md): Требования (REQ-IDs) + RTM.
- [.memory-bank/epics/](epics/): Эпики (C4 L2).
- [.memory-bank/features/](features/): Фичи (C4 L3).
- [.memory-bank/behavior-specs/](behavior-specs/): Optional JSON behavior examples linked from feature docs and task `source_artifacts`.
- [.memory-bank/tasks/index.json](tasks/index.json): Authoritative JSON task record index.
- [.memory-bank/schemas/task.schema.json](schemas/task.schema.json): JSON schema for task records.
- [.memory-bank/workflows/index.md](workflows/index.md): Workflow router and tier/execution/sync policies.

- [.memory-bank/spec-index.md](spec-index.md): Pure SDD spec registry and planned-spec index.
- [.memory-bank/spec-backbone.md](spec-backbone.md): Pre-PRD framing status and global backbone state for `/prd` and `/spec-design`.
- `.memory-bank/user-scenarios.md`: optional user scenarios and architecture implications when created by `/spec-init` or `/spec-design`.
- [.memory-bank/glossary.md](glossary.md): Общий словарь терминов и доменных значений.
- [.memory-bank/invariants.md](invariants.md): Глобальные MUST/NEVER правила.
- [.memory-bank/architecture/](architecture/): Duo + boundaries (WHAT/WHY).
- [.memory-bank/guides/](guides/): Valid HOW docs для использования, запуска и troubleshooting.
- [.memory-bank/adrs/](adrs/): ADR-решения.

- [.memory-bank/domains/](domains/): Subject-based domain models, storage, schemas, migrations, and persistence rules.
- [.memory-bank/contracts/](contracts/): Контракты и boundary specs (prefer when present).
- [.memory-bank/contracts/boundary-map.md](contracts/boundary-map.md): Lightweight responsibility/scope boundary notes for decomposition and task runtime context.
- [.memory-bank/states/](states/): Lifecycle/state rules (prefer when present).
- [.memory-bank/runbooks/](runbooks/): Runbooks (setup, dev, deploy).
- [.memory-bank/testing/index.md](testing/index.md): Router testing-документации.

- [.memory-bank/skills/index.md](skills/index.md): Реестр скиллов.

## Known gaps
- TBD
```

---

## 3) `.memory-bank/mbb/index.md`

```markdown
---
description: Memory Bank Bible — правила, инварианты и стандарты документации.
status: active
---
# Memory Bank Bible (MBB)

## Constitution precedence
- [.memory-bank/constitution.md](../constitution.md) is the top governing policy for agent decisions.
- MBB, spec-index, spec-backbone, invariants, contracts, states, testing, and workflow docs refine the Constitution and MUST NOT contradict it.

## SSOT pyramid
- **Code**: WHAT/HOW — implementation truth.
- **Docstrings**: contracts + `@docs` pointers.
- **Memory Bank**: WHY/WHERE — boundaries, invariants, navigation.

## Hard rules
1. Every `.memory-bank/**/*.md` file MUST have frontmatter with `description:`.
2. If a folder has >3 docs, add an `index.md` router.
3. Use annotated links: `[.memory-bank/path](rel-path): короткое описание`.
4. Atomic docs: one cohesive concern per doc; split by boundary, change cadence,
   consumers, or reuse, not by file length alone.
5. Duo docs remain valid: `architecture/` (WHAT/WHY) + `guides/` (HOW), cross-link both ways for concepts that use the classic pair model.
6. C4 layering: L1 product → L2 epics → L3 features → L4 plans/tasks.
7. Docs First: update MB immediately after finishing a task.
8. Refactor MB every 5–10 updates (split, merge, archive).
9. Separate facts from interpretations: mark hypotheses explicitly ("предположительно", "требует проверки").
10. After merge/rebase conflicts: re-check MB consistency.
11. MB-SYNC after each wave/significant change (see `workflows/mb-sync.md`).
12. When present, `constitution.md`, `spec-backbone.md`, `spec-index.md`, `glossary.md`, `invariants.md`, `contracts/*`, `states/*`, `runbooks/*`, and `testing/*` act as an explicit normative layer and should be linked from relevant docs.
13. Features compose product behavior and exact canonical spec links. New design
    specs use subject-based paths without `FT-<NNN>` names or feature ownership.

## Forbidden
- Copy-paste implementation details / pseudocode
- Duplicating configs (timeouts, constants) instead of linking to source
- Speculative claims without evidence from code/metrics/tests

## Allowed / encouraged
- Invariants (MUST/NEVER)
- Contracts at boundaries
- Decision rationale + pointers
- Runbooks and verification procedures
```

---

## 3a) `.memory-bank/spec-index.md`

```markdown
---
description: Pure SDD spec registry and planned-spec index.
status: active
last_updated: YYYY-MM-DD
source_of_truth:
  - .memory-bank/spec-index.md
---
# SDD Spec Index

## Purpose
- Keep a concise registry of existing and planned SDD specs.
- Read this index before creating new specs or doing serious design-pressure work.
- Keep readiness, open design questions, backbone status, and routing handoffs in [.memory-bank/spec-backbone.md](spec-backbone.md).
- Feature `spec_design_status` lives in feature frontmatter, not in this index.

## Spec Registry
| Type | Path | Status | Scope | Change route |
|---|---|---|---|---|
| governance | [.memory-bank/constitution.md](constitution.md) | active | Top governing policy. | /constitution |
| invariants | [.memory-bank/invariants.md](invariants.md) | planned | Global MUST/NEVER rules when evidence exists. | /spec-init or /spec-design |
| glossary | [.memory-bank/glossary.md](glossary.md) | planned | Shared vocabulary when needed. | /spec-init or /spec-design |
| contract | [.memory-bank/contracts/boundary-map.md](contracts/boundary-map.md) | draft | Lightweight responsibility/scope notes for task boundaries. | /spec-init or /spec-design |
| testing | [.memory-bank/testing/strategy.md](testing/strategy.md) | active | Framework baseline testing policy. | explicit project-level user decision |

## Planned Specs
| Area | Expected path | Needed by | Notes |
|---|---|---|---|
| user_scenarios | .memory-bank/user-scenarios.md | /prd, /spec-design | Create only when scenario evidence exists or gaps must be explicit. |
| core_domain | .memory-bank/domains/core-domain.md | /prd, /spec-design | Create only when domain model affects decomposition or shared design. |
| boundary_hints | .memory-bank/contracts/boundary-map.md | /prd, /spec-design | Seeded lightweight template; fill only evidence-backed responsibility/scope notes, no endpoint/OpenAPI details. |
| lifecycle_hints | .memory-bank/states/lifecycle-map.md | /prd, /spec-design | Create only when lifecycles affect feature boundaries. |
| system_architecture | .memory-bank/architecture/system-architecture.md | /spec-design | Candidate architecture hub; fill only when selected or needed by /spec-design. |
| interface_contract_specs | .memory-bank/contracts/*, .memory-bank/testing/*, and .memory-bank/runbooks/* | /spec-design, /foundation-to-tasks, /prd-to-tasks | Generate/update Interface Specification and only applicable Component/API/Event/Data contracts, protocol/agent/tool I/O, boundary compatibility, evidence/redaction, safety/security, testing, runbook, or verification contracts. Data Contract defines payloads crossing a boundary. |
| data_specs | .memory-bank/domains/* and .memory-bank/states/* | /spec-design, /prd-to-tasks | Generate/update Data Specification for internal models, DB schemas, storage/persistence/migrations, internal data formats, validation/serialization rules, lifecycle, retention, seed, or runtime data paths. |
| foundation_substrate_specs | .memory-bank/architecture/*, .memory-bank/contracts/*, .memory-bank/domains/*, .memory-bank/states/*, .memory-bank/testing/*, .memory-bank/runbooks/* | /foundation-to-tasks | Apply Architecture, Interfaces/Contracts, and Data lenses to the walking-skeleton proof path. Generate only applicable subject-based substrate contracts/specs. Product-level detail reuses or extends those paths later. |
| subject_feature_concerns | .memory-bank/contracts/*, .memory-bank/domains/*, .memory-bank/states/*, .memory-bank/testing/*, .memory-bank/runbooks/*, or .memory-bank/guides/* | /prd-to-tasks | Discover existing canonical specs first; create only missing subject-based concerns and link exact paths from features/tasks. |

## Broken / Missing Links
- TBD

## Update Rules
- Keep this file as index/registry only: types, canonical paths, statuses,
  scopes, change routes, and broken links.
- Canonical identity is the path. Do not add a separate spec key, feature owner,
  `used_by`, or reverse-usage copy; derive usage from feature/task links.
- Do not add global backbone status, backbone matrices, feature status maps, long hard rules, or open design question dumps here.
- Use [.memory-bank/spec-backbone.md](spec-backbone.md) for pre-PRD readiness, decomposition inputs, global backbone status, matrix, and handoffs.
- Use linked specs or ADRs for detailed decisions, rationale, contracts, state transitions, schemas, invariants, and testing rules.
```

---

## 3b) `.memory-bank/spec-backbone.md`

```markdown
---
description: Pre-PRD spec framing and global SDD backbone state.
status: active
---
# SDD Spec Backbone

## Pre-PRD Spec Status
- Status: blocked
- Last updated: YYYY-MM-DD
- Notes: Run /spec-init after /write-prd to determine whether PRD decomposition is safe.

## Decomposition Inputs
- User scenarios: not_started
- Domain model: not_started
- Constraints: not_started
- Non-goals: not_started
- Risks: not_started
- Boundary hints: not_started
- Lifecycle hints: not_started

## Open Design Questions
- TBD

## Backbone Area Matrix
| Area | Status | Authoritative source | Notes |
|---|---|---|---|
| architecture_style | blocked | - | Decide in /spec-design after /prd. |
| source_of_truth | blocked | - | Decide in /spec-design after /prd. |
| module_boundaries | blocked | .memory-bank/contracts/boundary-map.md | Fill only evidence-backed responsibility/scope notes; decide in /spec-design after /prd. |
| user_scenarios | blocked | .memory-bank/user-scenarios.md | Create/review when scenarios affect decomposition or architecture. |
| constraints | blocked | - | Capture in /spec-init and refine in /spec-design. |
| non_goals | blocked | - | Capture in /spec-init and refine in /spec-design. |
| domain_model | blocked | .memory-bank/domains/core-domain.md | Create only when domain model affects decomposition or shared design. |
| data_flow | blocked | - | Decide in /spec-design after /prd. |
| storage | blocked | - | Decide in /spec-design after /prd. |
| api_contracts | blocked | - | Decide authoritative/needed/not_applicable/blocked in /spec-design. |
| event_message_contracts | blocked | - | Decide authoritative/needed/not_applicable/blocked in /spec-design. |
| agent_io_contracts | blocked | - | Decide authoritative/needed/not_applicable/blocked in /spec-design. |
| security_safety | blocked | - | Decide in /spec-design after /prd. |
| deployment | blocked | - | Decide in /spec-design after /prd. |
| risks | blocked | - | Capture in /spec-init and refine in /spec-design. |
| open_questions | blocked | - | Resolve or keep blocked. |

## Handoff To /prd
- Ready: no
- Required reads: .memory-bank/prd.md, .memory-bank/spec-index.md, this file, and linked pre-PRD specs.
- Stop conditions: Pre-PRD Spec Status is missing, stale, or blocked.

## Handoff To /spec-design
- Backbone areas to revisit: all
- Candidate specs: see .memory-bank/spec-index.md Planned Specs.

## Global Backbone Status
- Status: blocked
- Mode: pending
- Architecture artifact strategy: pending
- Not applicable areas:
  - TBD
- Notes: /spec-design has not completed the global architecture scaffold yet.
```

---

## 3c) `.memory-bank/constitution.md`

Canonical skeleton source: `skills/_shared/references/constitution-template.md`.
`init-mb.js` writes `.memory-bank/constitution.md` from that template and
replaces `{{TODAY}}` with the current date.

Minimal generated frontmatter:

```yaml
description: Project Constitution — governing principles for AI-first development.
status: active
version: 1
project_principles: framework-default
ratified: null
last_updated: YYYY-MM-DD
```

---

## 3c) `.memory-bank/glossary.md`

```markdown
---
description: Словарь терминов, сущностей и agreed vocabulary проекта.
status: draft
---
# Glossary

## Terms
- Term: definition

## Notes
- Используй этот файл для устранения неоднозначностей в названиях и статусах.
```

---

## 3d) `.memory-bank/invariants.md`

```markdown
---
description: Глобальные инварианты и запреты проекта (MUST/NEVER).
status: draft
---
# Invariants

## MUST
- TBD

## NEVER
- TBD

## Notes
- Ссылайся на этот файл из архитектурных, контрактных и execution docs, если правило является cross-cutting.
```

---

## 3e) `.memory-bank/architecture/system-architecture.md`

```markdown
---
description: Compact system architecture hub and Architecture Spine for serious design-pressure work.
status: draft
---
# System Architecture

## System Goal
- TBD

## Main Constraints
- TBD

## Architecture Spine

Use this section only for durable decisions that constrain shared-boundary, contract, state/data/runtime/security, or strict work. Keep it short; detailed rationale belongs in ADRs or decision logs.

### Architecture Decisions

#### AD-NNN — <short decision>
- Binds:
- Prevents:
- Rule:
- Verification:
- Source:

### Deferred Decisions

| Decision | Deferred because | Revisit when |
|---|---|---|
| TBD | TBD | TBD |

## Main Modules / Bounded Contexts
- TBD

## Data Flow
- TBD

## API / Contract Boundaries
- See [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md).
```

---

## 3f) `.memory-bank/contracts/boundary-map.md`

```markdown
---
description: Lightweight responsibility and scope boundary notes for decomposition, implementation, and verification.
status: draft
---
# Boundary Map

## Purpose
- Keep lightweight boundary notes that help agents avoid crossing ownership, responsibility, or write-scope lines during decomposition and task execution.
- Use this file as an existing contract/spec input when task records need `purpose`, `success_outcome`, `anti_goals`, `runtime_context.write_boundary`, `runtime_context.forbidden_scope`, or `runtime_context.stop_conditions`.

## Boundary Notes
| Boundary | Purpose | Direction | Owner | Known Constraints | Questions |
|---|---|---|---|---|---|
| TBD | TBD | TBD | TBD | TBD | TBD |

## Boundary: <producer> -> <consumer>

- Owner:
- Consumers:
- Allowed calls:
- Forbidden calls:
- Data owner:
- Compatibility rule:
- Verification:
- Linked ADs:

## Runtime Context Hints
- Write boundary hints: TBD
- Forbidden scope hints: TBD
- Stop condition hints: TBD

## Update Rules
- Keep entries evidence-backed and short.
- Do not add endpoint lists, OpenAPI details, request/response schemas, auth policy, error-code design, or implementation pseudocode here.
- Do not create new task fields for boundaries; link this file through existing task fields such as `source_artifacts`, `normative_inputs`, `constraints`, `invariants`, or `verification_targets`, and copy executable scope into `runtime_context` when needed.
```

---

## 4) `.memory-bank/product.md`

```markdown
---
description: Product brief (C4 L1): что это, для кого, core value, ограничения.
status: draft
---
# Product

## What this is
<!-- 2–3 предложения словами пользователя -->

## Core value
<!-- 1 thing that MUST work -->

## Audience

## Primary user flow

## Constraints
- Tech stack:
- Timeline:
- Non-goals:

## Key decisions
| Decision | Rationale | Status |
|---|---|---|
| | | pending |
```

---

## 5) `.memory-bank/requirements.md`

```markdown
---
description: Требования (REQ-IDs) + traceability matrix (RTM).
status: draft
---
# Requirements

## REQ list
- (fill from PRD; do not invent requirements without evidence)

## Out of scope
- ...

## Traceability (RTM)
| REQ | Epic | Feature | Test | Lifecycle |
|---|---|---|---|---|
| REQ-XXX | EP-XXX | FT-XXX | test:... | planned |
```

---

## 6) `.memory-bank/schemas/task.schema.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Memory Bank Task Record",
  "type": "object",
  "additionalProperties": false,
  "required": ["id", "title", "status", "wave", "feature", "reqs", "depends_on", "touched_files", "tier", "gates", "verify", "docs", "evidence_required", "source_artifacts", "normative_inputs", "constraints", "invariants", "verification_targets"],
  "properties": {
    "id": { "type": "string", "pattern": "^TASK-[0-9]{3}-T[0-3]-FT-[0-9]{3}-W[0-9]+$" },
    "title": { "type": "string" },
    "status": { "type": "string", "enum": ["planned", "ready", "in_progress", "blocked", "done", "failed"] },
    "wave": { "type": "string" },
    "feature": { "type": "string" },
    "reqs": { "type": "array", "items": { "type": "string" } },
    "depends_on": { "type": "array", "items": { "type": "string" } },
    "touched_files": {
      "type": "array",
      "description": "Advisory, expected, non-exhaustive change surface confirmed by executor preflight.",
      "items": { "type": "string" }
    },
    "tier": { "type": "string", "enum": ["T0", "T1", "T2", "T3"] },
    "gates": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "command", "required"],
        "properties": {
          "name": { "type": "string" },
          "command": { "type": "string" },
          "required": { "type": "boolean" }
        }
      }
    },
    "verify": {
      "type": "array",
      "items": {
        "anyOf": [
          { "type": "string" },
          { "type": "object", "additionalProperties": true }
        ]
      }
    },
    "docs": { "type": "array", "items": { "type": "string" } },
    "evidence_required": { "type": "array", "items": { "type": "string" } },
    "purpose": { "type": "string" },
    "success_outcome": { "type": "string" },
    "anti_goals": { "type": "array", "items": { "type": "string" } },
    "runtime_context": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "write_boundary": {
          "type": "array",
          "description": "Optional hard write boundary; omit unless evidence justifies one.",
          "items": { "type": "string" }
        },
        "allowed_write_scope": {
          "type": "array",
          "description": "Deprecated alias for write_boundary; do not emit in new task cards.",
          "items": { "type": "string" }
        },
        "forbidden_scope": {
          "type": "array",
          "description": "Hard paths or areas that execution must not change.",
          "items": { "type": "string" }
        },
        "stop_conditions": {
          "type": "array",
          "description": "Hard conditions that require execution to stop and hand off.",
          "items": { "type": "string" }
        }
      },
      "not": { "required": ["write_boundary", "allowed_write_scope"] }
    },
    "source_artifacts": { "type": "array", "items": { "type": "string" } },
    "normative_inputs": { "type": "array", "items": { "type": "string" } },
    "constraints": { "type": "array", "items": { "type": "string" } },
    "invariants": { "type": "array", "items": { "type": "string" } },
    "verification_targets": { "type": "array", "items": { "type": "string" } }
  }
}
```

## 6a) `.memory-bank/tasks/index.json`

```json
{
  "version": 1,
  "tasks": []
}
```

## 6b) Example task record template

The skeleton does not generate this file. Concrete task IDs use `TASK-<NNN>-T<N>-FT-<NNN>-W<N>`; the `T<N>`, `FT-<NNN>`, and `W<N>` ID segments must match the task record `tier`, `feature`, and `wave` fields. `/foundation-to-tasks` creates normal `FT-000` foundation `.task.json` records only when `.memory-bank/foundation.md` says foundation is required. `/prd-to-tasks FT-<NNN>` first resolves feature design concerns through subject-based canonical specs, then creates real product feature `.memory-bank/tasks/TASK-*.task.json` records with direct task-relevant spec links when the feature is ready and any required final foundation gate task is `done`, or marks design blocked and stops. Fresh bootstrap does not create `.memory-bank/foundation.md`, `REQ-000`, `FT-000`, `TASK-000-T1-FT-000-W0`, or any runnable task records.

```json
{
  "id": "TASK-001-T0-FT-001-W1",
  "title": "Short task title",
  "status": "planned",
  "wave": "W1",
  "feature": "FT-001",
  "reqs": ["REQ-001"],
  "depends_on": [],
  "touched_files": [],
  "tier": "T0",
  "gates": [],
  "verify": [],
  "docs": [],
  "evidence_required": [],
  "purpose": "Why this task exists.",
  "success_outcome": "Observable result that proves real success.",
  "anti_goals": [
    "What must not be changed or optimized away."
  ],
  "runtime_context": {
    "forbidden_scope": [],
    "stop_conditions": []
  },
  "source_artifacts": [],
  "normative_inputs": [],
  "constraints": [],
  "invariants": [],
  "verification_targets": []
}
```

Optional (but recommended) plans folder:
- `.memory-bank/tasks/plans/` — IMPL plans like `IMPL-FT-XXX.md`

Optional runtime context rules:
- `gates` starts empty. Add only evidence-backed project-native checks that are
  applicable to the task outcome; do not add a test level merely to fill a
  category. T0/T1 may keep it empty when compact evidence or a documented
  no-meaningful-runnable-check route is valid under tier policy.
- `purpose`, `success_outcome`, `anti_goals`, and `runtime_context` are optional; existing tasks without them remain valid.
- `touched_files` is an advisory, expected, non-exhaustive change surface. It
  guides preflight and review but does not prohibit another file needed for the
  same task outcome.
- `write_boundary`, when present, is an optional hard write boundary and
  must not be populated by mechanically copying the exact `touched_files` list.
- Existing `allowed_write_scope` is a deprecated read alias; never emit both.
- `forbidden_scope` and `stop_conditions` are hard preflight/evidence contracts.
  These fields do not replace sandbox permissions or role write-scope instructions.
- T2/T3 task cards require non-empty `purpose` and scalar `success_outcome`,
  an existing task-linked SDD path, an expected change surface, and a
  verification path at handoff. Optional evidence-driven fields stay empty when
  ungrounded.

### 6c) `.memory-bank/behavior-specs/`

Optional behavior specs are concrete JSON examples for important or ambiguous
feature behavior:

```text
.memory-bank/behavior-specs/FT-NNN-BHV-NNN-short-title.behavior.json
```

Rules:
- Create 0-3 behavior specs per feature only when concrete `given / when / then`
  examples materially help implementation.
- Do not create a registry, schema, validator, doctor gate, or new task field
  for behavior specs.
- Link behavior specs from the feature doc `## Behavior specs` section.
- Link task-relevant behavior specs only through task `source_artifacts`.
- Do not put behavior specs in `verification_targets`, `evidence_required`,
  `gates`, `constraints`, or `invariants`.
- `/execute` may use linked behavior specs as context examples; `/verify` does
  not require their presence, coverage, or exact code alignment.

---

## 7) `.memory-bank/testing/`

Fresh bootstrap creates a router and one compact framework baseline policy.
Existing targets keep their registered testing path until an explicit manual
migration. Legacy sync never seeds the baseline strategy or overwrites an
existing testing index. When the testing router is missing, it creates a
minimal router to `spec-index.md`; generated root navigation and registry rows
reference only testing documents that exist after sync.

### `.memory-bank/testing/index.md`

```markdown
---
description: Router for testing and verification documentation.
status: active
---
# Testing Documentation

- [Testing strategy](strategy.md): минимальные глобальные правила тестирования и verification evidence.
- [SDD Spec Index](../spec-index.md): authoritative registry предметных testing и verification specs.
```

### `.memory-bank/testing/strategy.md`

```markdown
---
description: Minimal framework baseline policy for risk-based testing and verification evidence.
status: active
---
# Testing Strategy

## Risk-based checks
- Choose checks from concrete product and regression risks.
- Use the cheapest check that reliably proves the required behavior.
- Add a broader test level only when a narrower check cannot prove the outcome.
- Do not create tests merely to fill unit, integration, or e2e categories.

## Integrity
- Do not weaken assertions, disable failing checks, or replace meaningful
  verification with decorative coverage to obtain a green result.

## Evidence and ownership
- T2/T3 require an executable verification path; T0/T1 may use compact evidence
  or a documented no-runnable-check route when meaningful checks do not exist.
- Store execution evidence in `.protocols/<TASK_ID>/` and `.tasks/<TASK_ID>/`.
- Keep project requirements in requirements/features, concrete verification
  contracts in subject specs, and executable gates in task records.
```

---

## 8) `.memory-bank/skills/index.md`

```markdown
---
description: Реестр доступных скиллов (когда применять) в этом репозитории.
status: active
---
# Skills

## Installed
- cold-start

## When to use
- Bootstrap skeleton / memory: mb-init
- Scenario routing: cold-start
- Discovery: /brainstorm for raw ideas, then /brief; clear concepts may start at /brief
- SDD design: /spec-init, mandatory adaptive /spec-design, foundation tasking inside /foundation-to-tasks, close the FT-000 foundation gate when required, initial and repair feature-level design/task reconciliation inside /prd-to-tasks, /spec-auto
- PRD decomposition: /prd
- Codebase mapping: /map-codebase
- Execution: /execute
- Verification (UAT): /verify
- Semantic adversarial verification: /red-verify
- Review: /review-feat-plan, /review-tasks-plan
- Maintenance: mb-garden
```

---

## 9) `.memory-bank/changelog.md`

```markdown
---
description: Лог изменений Memory Bank.
status: active
---
# Changelog

## [YYYY-MM-DD] Initial setup
- Created Memory Bank skeleton
- Seeded core docs (product, requirements, testing, task registry)
```

---

## 10) `.memory-bank/workflows/index.md` and `mb-sync.md`

```markdown
---
description: Router for generated DevRails execution, autonomy, tier, and synchronization workflows.
status: active
---
# Workflow Index

- [.memory-bank/workflows/tier-policy.md](tier-policy.md): Task tier routing, protocol depth, and closure gates.
- [.memory-bank/workflows/execute-loop.md](execute-loop.md): Manual and autonomous task execution sequence.
- [.memory-bank/workflows/autonomy-policy.md](autonomy-policy.md): Unattended-run guardrails, budgets, and terminal states.
- [.memory-bank/workflows/mb-sync.md](mb-sync.md): Durable state synchronization boundaries and checklist.
```

```markdown

---
description: Чеклист синхронизации Memory Bank после wave/изменений.
status: active
---
# MB-SYNC Checklist

- [ ] Duo docs consistent where the classic pair model is used (architecture ↔ guides)
- [ ] Optional normative docs, if present, are linked and do not contradict duo docs
- [ ] RTM up to date (requirements.md)
- [ ] Feature statuses updated
- [ ] JSON task records and `.memory-bank/tasks/index.json` updated
- [ ] Changelog entry added
- [ ] index.md links valid
- [ ] Lint passes (0 errors)
```
