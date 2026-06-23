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

## Role Mode

If no explicit role is given to the top-level agent, act as:

ROLE: GENERAL

Delegated agents are not ORCHESTRATOR or GENERAL by default.
The role is fixed and cannot be changed.

Full role contracts live in:
- `.memory-bank/roles/orchestrator.md`
- `.memory-bank/roles/general.md`
- `.memory-bank/roles/worker.md`

## Preferred context routing
- Start with `.memory-bank/architecture/*` and `.memory-bank/guides/*` for concept priming.
- If present, prefer explicit normative docs such as `.memory-bank/constitution.md`, `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, `.memory-bank/invariants.md`, `.memory-bank/glossary.md`, `.memory-bank/contracts/boundary-map.md`, `.memory-bank/contracts/*`, `.memory-bank/states/*`, `.memory-bank/runbooks/*`, and `.memory-bank/testing/*`.
- Normative docs enrich the Memory Bank; they do not invalidate valid duo docs.
- Before serious work, read `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, and follow linked SDD specs.
- Do not create a new spec before checking existing specs through `.memory-bank/spec-index.md`.
- For any tier, if the task record or linked feature contains authoritative SDD
  spec links, read `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, and those linked specs before
  implementation or verification.
- For `T2` / `T3` tasks, linked SDD specs are normative inputs; missing linked specs are a blocker for serious work.

## Docs First
After finishing a meaningful unit of work:
1) Update `.memory-bank/` (WHY/WHERE + navigation)
2) Then commit code changes

## Runtime vs durable memory
- Durable knowledge base: `.memory-bank/`
- Operational artifacts: `.tasks/` (NOT part of Memory Bank)
- Long-running plans/logs: `.protocols/`

## Clean context (recommended)
- Route each `TASK-NNN-FT-NNN-W-N` by `task.tier` and `.memory-bank/workflows/tier-policy.md`.
- Delegation and worker reports follow `.memory-bank/roles/orchestrator.md` and `.memory-bank/roles/worker.md`.
- T0/T1 may use compact `.protocols/TASK-NNN-FT-NNN-W-N/run.md`; compact evidence can be enough.
- Scheduler mode: T2 requires full protocol state, required packet/spec gates, and `/verify` `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- Scheduler mode: T2 feature completion requires `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all feature tasks are implemented, recorded in the feature doc.
- Scheduler mode: T3 requires full protocol state, required packet/spec gates, `/verify` `VERDICT: PASS`, and per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass` before the scheduler marks `done`.
- Scheduler mode: T3 also requires exact marker lines `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`.
- Manual mode: T0/T1 may close after `/verify PASS` only with explicit closure ownership and completed evidence; T2 may close after `/verify PASS` when full protocol plus required packet/spec gates are satisfied; T3 must run per-task `/red-verify` before final closure/`/mb-sync`.
- Packet requirement: T2/T3 require canonical `.memory-bank/packets/<task.id>.packet.json`; T0/T1 require packets only when `task.runtime_context.packet_required === true`.
- Required packets are derivative runtime artifacts under `.memory-bank/packets/`; `/foundation-to-tasks` and `/prd-to-tasks` create initial required packets, and `/mb-doctor` validates readiness at the foundation/task-queue or feature/task-queue boundary. Use `/mb-packet TASK-NNN-FT-NNN-W-N` only to repair or refresh packets after task/spec changes.
- If running in **Claude Code**: execute each `TASK-NNN-FT-NNN-W-N` in a **fresh Claude session** using tier-appropriate `.protocols/TASK-NNN-FT-NNN-W-N/` state.
- If running in **Codex**: you can run each `TASK-NNN-FT-NNN-W-N` in a fresh session via `codex exec` (see `/execute`).
- Sequencing: independent tasks may run in parallel clean sessions; dependent/shared-file tasks must run sequentially.

Codex (fresh session):
- `codex exec --ephemeral --full-auto -m gpt-5.2-high 'TASK_ID=TASK-123-FT-001-W-1. Read AGENTS.md, .memory-bank/commands/execute.md, the indexed task record, .memory-bank/workflows/tier-policy.md, and packet context when present or expected. Assume packet readiness was checked by the feature/task-queue gate; do not repair or structurally validate packets here. Stop on semantic contradictions, unverifiable success, or scope/public-contract ambiguity. Use tier-appropriate .protocols/TASK-123-FT-001-W-1/ state. Implement. Record evidence. Report → .tasks/TASK-123-FT-001-W-1/…'`

Claude (fresh session):
- `claude -p --no-session-persistence --permission-mode acceptEdits --model opus 'TASK_ID=TASK-123-FT-001-W-1. Read AGENTS.md, .memory-bank/commands/execute.md, the indexed task record, .memory-bank/workflows/tier-policy.md, and packet context when present or expected. Assume packet readiness was checked by the feature/task-queue gate; do not repair or structurally validate packets here. Stop on semantic contradictions, unverifiable success, or scope/public-contract ambiguity. Use tier-appropriate .protocols/TASK-123-FT-001-W-1/ state. Implement. Record evidence. Report → .tasks/TASK-123-FT-001-W-1/…'`

## Two modes (manual vs scheduler)
- **Manual**: run `/analysis` → `/brief` → `/constitution` if `project_principles` is not `ratified|partial` → `/write-prd` → `/spec-init` → `/prd` → `/review-feat-plan` for high-risk/large work → `/spec-design` → `/foundation-to-tasks` when foundation is required → `/mb-doctor` at the foundation/task-queue boundary → execute/verify `FT-000` until the foundation gate is `done` → `/prd-to-tasks FT-<NNN>` → `/review-tasks-plan` → `/mb-doctor` at the feature/task-queue boundary → execute tasks one-by-one with `/execute TASK-<NNN>-FT-<NNN>-W-<N>` → `/verify TASK-<NNN>-FT-<NNN>-W-<N>`; run per-task `/red-verify` for T3 tasks, optional for T2 tasks, and run `/red-verify --feature FT-<NNN>` before T2 feature completion, recording the verdict in the feature doc; `/mb-sync` only when durable Memory Bank docs/state changed. `/prd-to-tasks` performs feature-level SDD design and creates required initial packets before product task handoff. `/spec-design` is mandatory after `/prd`, but simple T0/T1 projects may record a minimal backbone with irrelevant areas `not_applicable`; when needed it records `.memory-bank/foundation.md`, and `/foundation-to-tasks` creates normal `FT-000` task records. Use `/brainstorm` before `/brief` only for raw ideas, use `/clarify-feature FT-<NNN>` only for explicit feature blockers, and use standalone `/spec-improve`/`/mb-packet` only for repair or refresh.
- **Autonomous (batch)**: use `/autonomous` for full `PRD → done`; it runs `/spec-auto --init`, `/review-feat-plan`, mandatory `/spec-design --all`, `/foundation-to-tasks` when required, strict `/mb-doctor` at the foundation/task-queue boundary, and execute/verify `FT-000` until the foundation gate is `done` before `/spec-auto --all`, `/prd-to-tasks --all`, and `/review-tasks-plan`. Use `/autopilot` only if JSON task records and required SDD spec links already exist and `/review-tasks-plan` approved the queue. See: `.memory-bank/workflows/execute-loop.md` and `.memory-bank/workflows/autonomy-policy.md`.

`.tasks/` naming:
- Folder per process: `.tasks/TASK-<NNN>-FT-<NNN>-W-<N>/`
- Files: `TASK-<NNN>-FT-<NNN>-W-<N>-S-<STAGE>-final-report-<code|docs>-<NN>.md`
- Keep each report to ≤ 3–5 files worth of analysis to avoid context overflow

## Quality gates (before merge)
- lint / typecheck / build
- unit tests
- e2e tests (if UI/flow)

## Memory Bank entry points
Command specs live in `skills/_shared/references/commands/*.md`.
`skills/_shared/scripts/init-mb.js` generates `.memory-bank/commands/*`, runtime proxy skills, and the current entrypoints in generated `AGENTS.md`.

Representative commands:
- `/analysis`
- `/brief`
- `/constitution`
- `/write-prd`
- `/spec-init`
- `/prd`
- `/spec-design`
- `/foundation-to-tasks`
- `/spec-improve`
- `/spec-auto`
- `/clarify-feature`
- `/prd-to-tasks`
- `/mb-packet`
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

### Native skills (proxy commands for all runtimes)

Create thin proxy skills so commands work natively across tools:

| Directory | Runtime |
|-----------|---------|
| `.claude/skills/<name>/SKILL.md` | Claude Code + OpenCode |
| `.agents/skills/<name>/SKILL.md` | Codex CLI + OpenCode |

> Note: `.codex/` is **not** a skills directory. It is used for Codex **project configuration** (e.g. `.codex/config.toml`).

Each `SKILL.md` follows this pattern:
```yaml
---
name: <command-name>
description: <what it does>
---

Read and follow the instructions in `.memory-bank/commands/<command-name>.md`
```

This keeps `.memory-bank/commands/` as SSOT while giving each runtime native integration:
- Claude Code: `/command-name` in autocomplete
- Codex CLI: `$command-name` or via `/skills` browser
- OpenCode: `/command-name` in TUI (reads both `.claude/` and `.agents/`)

The `init-mb.js` script creates both sets automatically.

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

- [.memory-bank/spec-index.md](spec-index.md): Pure SDD spec registry and planned-spec index.
- [.memory-bank/spec-backbone.md](spec-backbone.md): Pre-PRD framing status and global backbone state for `/prd` and `/spec-design`.
- `.memory-bank/user-scenarios.md`: optional user scenarios and architecture implications when created by `/spec-init` or `/spec-design`.
- [.memory-bank/glossary.md](glossary.md): Общий словарь терминов и доменных значений.
- [.memory-bank/invariants.md](invariants.md): Глобальные MUST/NEVER правила.
- [.memory-bank/architecture/](architecture/): Duo + boundaries (WHAT/WHY).
- [.memory-bank/guides/](guides/): Valid HOW docs для использования, запуска и troubleshooting.
- [.memory-bank/adrs/](adrs/): ADR-решения.

- [.memory-bank/contracts/](contracts/): Контракты и boundary specs (prefer when present).
- [.memory-bank/contracts/boundary-map.md](contracts/boundary-map.md): Lightweight responsibility/scope boundary notes for decomposition and task runtime context.
- [.memory-bank/states/](states/): Lifecycle/state rules (prefer when present).
- [.memory-bank/runbooks/](runbooks/): Runbooks (setup, dev, deploy).
- [.memory-bank/testing/index.md](testing/index.md): Стратегия тестирования.

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
4. Atomic docs: one concept per doc; keep ~≤500 lines.
5. Duo docs remain valid: `architecture/` (WHAT/WHY) + `guides/` (HOW), cross-link both ways for concepts that use the classic pair model.
6. C4 layering: L1 product → L2 epics → L3 features → L4 plans/tasks.
7. Docs First: update MB immediately after finishing a task.
8. Refactor MB every 5–10 updates (split, merge, archive).
9. Separate facts from interpretations: mark hypotheses explicitly ("предположительно", "требует проверки").
10. After merge/rebase conflicts: re-check MB consistency.
11. MB-SYNC after each wave/significant change (see `workflows/mb-sync.md`).
12. When present, `constitution.md`, `spec-backbone.md`, `spec-index.md`, `glossary.md`, `invariants.md`, `contracts/*`, `states/*`, `runbooks/*`, and `testing/*` act as an explicit normative layer and should be linked from relevant docs.

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
---
# SDD Spec Index

## Purpose
- Keep a concise registry of existing and planned SDD specs.
- Read this index before creating new specs or doing serious T2/T3 work.
- Keep readiness, open design questions, backbone status, and routing handoffs in [.memory-bank/spec-backbone.md](spec-backbone.md).
- Feature `spec_design_status` lives in feature frontmatter, not in this index.

## Spec Registry
| Spec | Type | Path | Status | Owner command | Scope |
|---|---|---|---|---|---|
| Project Constitution | governance | [.memory-bank/constitution.md](constitution.md) | active | /constitution | Top governing policy. |
| Invariants | invariants | [.memory-bank/invariants.md](invariants.md) | planned | /spec-init or /spec-design | Global MUST/NEVER rules when evidence exists. |
| Glossary | glossary | [.memory-bank/glossary.md](glossary.md) | planned | /spec-init or /spec-design | Shared vocabulary when needed. |
| Boundary Map | contract | [.memory-bank/contracts/boundary-map.md](contracts/boundary-map.md) | draft | /spec-init or /spec-design | Lightweight responsibility/scope notes for task boundaries. |
| Testing Index | testing | [.memory-bank/testing/index.md](testing/index.md) | planned | /prd or /spec-design | Verification strategy and quality gates. |

## Planned Specs
| Area | Expected path | Needed by | Notes |
|---|---|---|---|
| user_scenarios | .memory-bank/user-scenarios.md | /prd, /spec-design | Create only when scenario evidence exists or gaps must be explicit. |
| core_domain | .memory-bank/domains/core-domain.md | /prd, /spec-design | Create only when domain model affects decomposition or shared design. |
| boundary_hints | .memory-bank/contracts/boundary-map.md | /prd, /spec-design | Seeded lightweight template; fill only evidence-backed responsibility/scope notes, no endpoint/OpenAPI details. |
| lifecycle_hints | .memory-bank/states/lifecycle-map.md | /prd, /spec-design | Create only when lifecycles affect feature boundaries. |
| system_architecture | .memory-bank/architecture/system-architecture.md | /spec-design | Default global architecture hub after /prd. |
| feature_design | .memory-bank/tech-specs/FT-<NNN>-<slug>.md | /prd-to-tasks | Feature-local specs only when needed before task decomposition. |

## Broken / Missing Links
- TBD

## Update Rules
- Keep this file as index/registry only: names, paths, statuses, owners, scopes, and broken links.
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
| testing_strategy | blocked | .memory-bank/testing/index.md | Decide in /spec-design after /prd. |
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
- Mode: standard_ai_first
- Architecture artifact strategy: single-file
- Not applicable areas:
  - TBD
- Notes: /spec-design has not completed the global AI-first architecture guardrails yet.
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
description: Compact system architecture hub and Architecture Spine for serious T2/T3 or shared-boundary work.
status: draft
---
# System Architecture

## System Goal
- TBD

## Main Constraints
- TBD

## Architecture Spine

Use this section only for durable decisions that constrain T2/T3 or shared-boundary work. Keep it short; detailed rationale belongs in ADRs or decision logs.

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

## Testing Strategy
- TBD
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
- Use this file as an existing contract/spec input when task records need `purpose`, `success_outcome`, `anti_goals`, `runtime_context.allowed_write_scope`, `runtime_context.forbidden_scope`, or `runtime_context.stop_conditions`.

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
- Allowed write scope hints: TBD
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
    "id": { "type": "string", "pattern": "^TASK-[0-9]{3}-FT-[0-9]{3}-W-[0-9]+$" },
    "title": { "type": "string" },
    "status": { "type": "string", "enum": ["planned", "ready", "in_progress", "blocked", "done", "failed"] },
    "wave": { "type": "string" },
    "feature": { "type": "string" },
    "reqs": { "type": "array", "items": { "type": "string" } },
    "depends_on": { "type": "array", "items": { "type": "string" } },
    "touched_files": { "type": "array", "items": { "type": "string" } },
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
        "packet_required": { "type": "boolean" },
        "packet_ref": { "type": "string" },
        "allowed_write_scope": { "type": "array", "items": { "type": "string" } },
        "forbidden_scope": { "type": "array", "items": { "type": "string" } },
        "stop_conditions": { "type": "array", "items": { "type": "string" } }
      }
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

The skeleton does not generate this file. Concrete task IDs use `TASK-<NNN>-FT-<NNN>-W-<N>`; the `FT-<NNN>` and `W-<N>` ID segments must match the task record `feature` and `wave` fields. `/foundation-to-tasks` creates normal `FT-000` foundation `.task.json` records only when `.memory-bank/foundation.md` says foundation is required. `/prd-to-tasks FT-<NNN>` first completes feature-level SDD design, then creates real product feature `.memory-bank/tasks/TASK-*.task.json` records when the feature is ready and any required final foundation gate task is `done`, or marks design blocked and stops. Fresh bootstrap does not create `.memory-bank/foundation.md`, `REQ-000`, `FT-000`, `TASK-000-FT-000-W-0`, or any runnable task records.

```json
{
  "id": "TASK-001-FT-001-W-1",
  "title": "Short task title",
  "status": "planned",
  "wave": "W1",
  "feature": "FT-001",
  "reqs": ["REQ-001"],
  "depends_on": [],
  "touched_files": [],
  "tier": "T0",
  "gates": [
    {
      "name": "unit tests",
      "command": "npm test",
      "required": true
    }
  ],
  "verify": [],
  "docs": [],
  "evidence_required": [],
  "purpose": "Why this task exists.",
  "success_outcome": "Observable result that proves real success.",
  "anti_goals": [
    "What must not be changed or optimized away."
  ],
  "runtime_context": {
    "allowed_write_scope": [],
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
- `purpose`, `success_outcome`, `anti_goals`, and `runtime_context` are optional; existing tasks without them remain valid.
- `T0` / `T1`: `runtime_context.packet_required` defaults to false when absent. A packet is required only when the task record says `runtime_context.packet_required === true`; `packet_ref` without that flag is advisory only.
- `T2` / `T3`: a packet is required by tier. Generated T2/T3 records should explicitly store `runtime_context.packet_required: true` and canonical `packet_ref`.
- Required `packet_ref` points to `.memory-bank/packets/<TASK_ID>.packet.json`; omit `packet_ref` for T0/T1 when `packet_required` is false/absent.
- `allowed_write_scope`, `forbidden_scope`, and `stop_conditions` are preflight/evidence contracts. They do not replace sandbox permissions or role write-scope instructions.

### 6c) `.memory-bank/packets/`

Execution packets are compact derivative runtime artifacts for one task run:

```text
.memory-bank/packets/TASK-NNN-FT-NNN-W-N.packet.json
```

Packet semantics:
- The task record and linked SDD specs remain the source of truth.
- A packet compiles existing context for execution; it must not invent missing specs, requirements, or scope.
- `/foundation-to-tasks` and `/prd-to-tasks` create initial required packets while foundation/task/spec or feature/task/spec context is loaded. `/mb-packet TASK-NNN-FT-NNN-W-N` refreshes a packet after task/spec changes or a `/mb-doctor` readiness finding.
- If a packet contradicts the task record, feature, tier policy, or linked specs, repair the source or refresh/rebuild it with `/mb-packet TASK-NNN-FT-NNN-W-N` before execution handoff.
- Packet-local statuses are only `ready`, `ready_with_gaps`, `blocked`, and `stale`; these are not task lifecycle statuses.
- Task lifecycle remains `planned|ready|in_progress|blocked|done|failed`.
- No new `.memory-bank/modules/`, `.memory-bank/graph/`, or `.memory-bank/verification/` layers are introduced for this flow.
- Verification continues to use task `verify`, `verification_targets`, `.memory-bank/testing/`, `.protocols/TASK-NNN-FT-NNN-W-N/`, and `.tasks/TASK-NNN-FT-NNN-W-N/`.

### 6d) `.memory-bank/behavior-specs/`

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

## 7) `.memory-bank/testing/index.md`

```markdown
---
description: Стратегия тестирования и верификации (quality gates, anti-cheat, UI/e2e).
status: active
---
# Testing & Verification

## Quality gates
- lint / typecheck
- unit tests
- integration tests (if applicable)
- e2e tests for critical user flows

## UI verification
- Prefer Playwright / agent-browser / CDP for UI flows when available
- Store screenshots/videos/traces in `.tasks/TASK-NNN-FT-NNN-W-N/`
- In Memory Bank keep only links + short conclusions

## Anti-cheat
- Don’t "green" failing tests by weakening assertions without approval.
- If a test reveals a bug: log it (and fix only with explicit scope).

## Artifacts
- Put screenshots/logs/videos in `.tasks/TASK-NNN-FT-NNN-W-N/`
- In Memory Bank store only links + short conclusions
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
- Bootstrap / memory: cold-start, mb-init
- SDD design: /spec-init, mandatory adaptive /spec-design, foundation tasking inside /foundation-to-tasks, close the FT-000 foundation gate when required, feature-level design inside /prd-to-tasks, standalone /spec-improve repair, /spec-auto
- PRD decomposition: mb-from-prd
- Codebase mapping: mb-map-codebase
- Execution: mb-execute
- Verification (UAT): mb-verify
- Semantic adversarial verification: mb-red-verify
- Review: /review-feat-plan, /review-tasks-plan
- Maintenance: mb-garden
- Harness: mb-harness
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

## 10) `.memory-bank/workflows/mb-sync.md`

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
