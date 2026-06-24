# Как работает DevRails 26

Это подробный справочник по `DevRails 26`. Короткие README-файлы остаются дружелюбными точками входа, а здесь собрана механика: packaging, установка/bootstrap, workflows, task model, поведение scheduler, command reference и проверки.

Если вы только начинаете, сначала пройдите ручной workflow из README.

## 1. Что такое DevRails 26

`DevRails 26` - это source-only skill pack/framework для Codex CLI, Claude Code и совместимых agent runtimes.

Он генерирует project-local runtime command skills, а затем bootstrap-ит целевой репозиторий в workspace Memory Bank:

```text
.agents/skills/<command>/SKILL.md  full Codex runtime command skills
.claude/skills/<command>/SKILL.md  full Claude runtime command skills
.memory-bank/  durable project knowledge/state
.memory-bank/contracts/boundary-map.md lightweight responsibility/scope boundary notes
.memory-bank/packets/ derivative Execution Packets for task runtime context (required for T2/T3; explicit-only for T0/T1)
.memory-bank/behavior-specs/ optional JSON given/when/then examples linked through task source_artifacts
.protocols/   resumable execution и verification protocols
.tasks/       runtime evidence, reports и handoff material
```

Цель - дать агентам возможность работать от файлов и проверяемого состояния, а не полагаться на историю чата.

## 2. Source-only packaging

Этот fork намеренно не коммитит generated package-local файлы `shared-*`.

Canonical shared source:

```text
skills/_shared/agents/*
skills/_shared/references/commands/*
skills/_shared/references/workflows/*
skills/_shared/references/protocols/*
skills/_shared/scripts/init-mb.js
```

Generated package-local assets:

```text
skills/<skill>/agents/shared-*
skills/<skill>/references/shared-*
skills/<skill>/scripts/shared-*
```

В source tree generated файлы `shared-*` намеренно отсутствуют. Если `SKILL.md` или command spec ссылается на `shared-*`, эта ссылка становится валидной только после того, как vendoring/install подготовит временную installable copy.

Не устанавливайте этот source-only fork прямым flow `npx skills add <repo>`. Используйте wrapper ниже.

Правила разработки:

- меняйте shared behavior в `skills/_shared/`;
- не редактируйте и не коммитьте generated package-local `shared-*`;
- держите source tree чистым:

```bash
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Ожидаемый результат для source tree: `0`.

## 3. Установка и bootstrap

Основной путь - интерактивный installer:

Запускайте из репозитория framework:

```bash
node scripts/install-framework.mjs
```

Wrapper:

1. Показывает folder picker: можно открыть папку по номеру, подняться вверх, выбрать открытую папку, ввести путь вручную или создать новую папку внутри открытой.
2. Проверяет target: существует ли директория, writable ли она, git status, наличие `.memory-bank/` и `AGENTS.md`.
3. Показывает предупреждения и один общий confirmation; если `.memory-bank/` уже есть, после подтверждения запускается sync/update generated assets.
4. Копирует текущий репозиторий во временную директорию.
5. Запускает `scripts/vendor-shared.mjs` внутри этой копии.
6. Генерирует package-local assets `shared-*` для каждого installable skill.
7. Генерирует full runtime command skills напрямую из `skills/_shared/references/commands/*.md` в `.agents/skills/` и `.claude/skills/`.
8. Запускает bootstrap script из prepared temp repo с `cwd=target`.
9. Удаляет временный репозиторий, если не задан `DEVRAILS_KEEP_INSTALL_TMP=1` или legacy `MEMOBANK_KEEP_INSTALL_TMP=1`.

Explicit install-only flow остается рабочим и не открывает interactive UI:

```bash
node scripts/install-framework.mjs --skill '*' --yes
```

Можно выбрать конкретный runtime command skill:

```bash
node scripts/install-framework.mjs --skill cold-start --yes
```

Чтобы посмотреть временно подготовленный репозиторий:

```bash
DEVRAILS_KEEP_INSTALL_TMP=1 node scripts/install-framework.mjs --skill '*' --yes
```

### Bootstrap целевого репозитория вручную

При работе напрямую из checkout этого framework целевой репозиторий можно bootstrap-нуть исходным script:

```bash
node /path/to/DevRails-26/skills/_shared/scripts/init-mb.js
```

Чтобы обновить runtime command skills, skeleton docs и runtime scripts в уже bootstrap-нутом целевом репозитории:

```bash
node scripts/install-framework.mjs --bootstrap --target /path/to/project --yes --sync
```

`--force` сейчас эквивалентен `--sync`.

Для CI/smoke без interactive UI installer поддерживает non-interactive bootstrap:

```bash
node scripts/install-framework.mjs --bootstrap --target /path/to/project --yes
```

Этот режим использует тот же source-only путь: temp copy -> `scripts/vendor-shared.mjs` -> full runtime skills -> bootstrap из prepared temp repo.

## 4. Generated bootstrap artifacts

`skills/_shared/scripts/init-mb.js` создает или обновляет workspace Memory Bank. По умолчанию он не перезаписывает существующие файлы; `--sync` обновляет generated skeleton docs и runtime scripts.

Основные generated artifacts:

```text
.memory-bank/
  adrs/ADR-000-template.md
  agents/
  archive/
  architecture/
  behavior-specs/
  bugs/
  constitution.md
  contracts/
  contracts/boundary-map.md
  domains/
  epics/
  features/
  glossary.md
  guides/
  index.md
  invariants.md
  mbb/index.md
  packets/
  product.md
  quality/
  requirements.md
  runbooks/
  schemas/task.schema.json
  skills/index.md
  spec-index.md
  states/
  tasks/index.json
  tasks/plans/
  tech-specs/
  testing/index.md
  workflows/autonomy-policy.md
  workflows/execute-loop.md
  workflows/mb-sync.md
  workflows/tier-policy.md
  changelog.md
.tasks/
.protocols/
scripts/mb-lint.mjs
scripts/mb-doctor.mjs
AGENTS.md
CLAUDE.md
GEMINI.md
.claude/skills/<command>/SKILL.md
.agents/skills/<command>/SKILL.md
```

В развернутом target-проекте `.claude/skills/*` и `.agents/skills/*` содержат полный текст runtime command specs. В source repo canonical command specs живут в `skills/_shared/references/commands/`; target `.memory-bank/` хранит project state/docs, но не command specs.

## 5. Package skills

- `cold-start` - package entrypoint / generated scenario router; skeleton
  creation остается за installer bootstrap или `mb-init`.
- `mb-init` - генерация skeleton, agent guides и runtime scripts.
- `mb-analysis` - optional discovery до PRD: `/analysis`, `/brainstorm`, `/brief`.
- `mb-from-prd` - clarified PRD -> product, requirements, epics, features.
- `mb-map-codebase` - as-is mapping существующего codebase без roadmap speculation.
- `mb-execute` - implementation handoff для одного `TASK-NNN-TN-FT-NNN-WN`.
- `mb-verify` - functional verification по AC/REQ и evidence.
- `mb-red-verify` - adversarial semantic verification.
- `mb-review` - fresh-context review gates: feature plan or task queue plan.
- `mb-garden` - maintenance Memory Bank и packaged deterministic lint/readiness tool assets.
- `mb-harness` - deterministic commands, clean sessions и worktree guidance.

## 6. Workflows

### Сначала ручной workflow

Рекомендуемый путь для новичка:

```text
idea / rough draft
  -> /analysis или /brief, если направление нужно прояснить
  -> /constitution, если project principles еще не ratified|partial
  -> /write-prd
  -> /spec-init
  -> /prd
  -> /review-feat-plan for high-risk/large work
  -> /spec-design
  -> /foundation-to-tasks if required
  -> /mb-doctor at foundation/task-queue boundary
  -> /execute + /verify FT-000 until foundation gate is done
  -> /prd-to-tasks FT-001
  -> /review-tasks-plan FT-001
  -> conditional /mb-doctor at feature/task-queue boundary for complex/T3/autonomous cases
  -> tier-routed /execute TASK-001-TN-FT-001-W1
  -> /verify TASK-001-TN-FT-001-W1 для T2/T3 или uncertainty
  -> /red-verify TASK-001-T3-FT-001-W1 для T3
  -> /red-verify --feature FT-001 для T2 feature completion
  -> /mb-sync
  -> повторять feature/task loop
```

`/analysis` маршрутизирует discovery. `/brainstorm` может создать brainstorming report. `/brief` создает Product Brief как вход для `/constitution` и `/write-prd`. Ни один из этих discovery-шагов не создает runnable task records.

`/constitution` читает Product Brief, если он есть, и проводит короткое contextual interview по project principles, Definition of Done, автономности агентов, human checkpoints и non-negotiables. Это нормальный шаг перед `/write-prd`, когда principles еще не `ratified|partial`, но не hard-blocker: если пользователь явно пропускает его, flow продолжает идти с `project_principles: framework-default|skipped`, а Constitution можно ratify позже.

`/write-prd` нормализует вход в `.memory-bank/prd.md` с `type: prd`, `clarification_status: complete` и `constitution_checked: true`. `/spec-init` обновляет `.memory-bank/spec-backbone.md` как lightweight pre-PRD route/state map по evidence из PRD/brief/existing specs: decomposition inputs, gaps, handoff и expected locations; `.memory-bank/spec-index.md` при этом остается чистым registry/index спецификаций, без readiness/status state. `/prd` декомпозирует PRD в L1-L3 docs Memory Bank: product, requirements, epics и features. Для high-risk/large work `/review-feat-plan` проверяет PRD/REQ/EP/FT перед SDD design. `/spec-design` является обязательным gate после `/prd`: он потребляет `spec-backbone` и чистый `spec-index` из `/spec-init`, для local/simple feature-set pressure может записать minimal backbone и `not_applicable`, а для shared-boundary, contract, state/data/runtime/security или strict pressure фиксирует source-of-truth, boundaries, data/contracts/testing decisions или blockers. Для такого serious design pressure он держит короткий `Architecture Spine` с `AD-*` executable rules внутри `architecture/system-architecture.md`, без отдельного architecture workflow. Когда нужен executable baseline, `/spec-design` пишет `.memory-bank/foundation.md`, а `/foundation-to-tasks` создает normal `FT-000` JSON tasks и final foundation gate; product task generation waits until that gate is `done`. Architecture может остаться в одном `architecture/system-architecture.md` только когда это лучший readable scaffold shape; split architecture docs создаются только когда split снижает реальную сложность или нужен как authoritative reference. `/prd-to-tasks` полноценно закрывает feature-level SDD design, опционально создает до трех concrete behavior specs для неоднозначных сценариев, затем создает product JSON task records и required initial Execution Packets. После этого `/review-tasks-plan FT-<NNN>` проверяет task planning surface текущей feature перед doctor/execution; без аргумента команда выводит последнюю разложенную product feature эвристически. Standalone `/spec-improve` и `/mb-packet` остаются repair/refresh командами вне happy path.

### Понятный PRD или concept

Если есть понятный concept, но нет PRD:

```text
/brief -> /constitution if principles are not ratified|partial -> /write-prd -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /mb-doctor at foundation/task-queue boundary -> execute/verify FT-000 until foundation gate done -> /prd-to-tasks FT-001 -> /review-tasks-plan FT-001
```

Если уже есть внешний PRD или PRD-like text:

```text
/constitution if principles are not ratified|partial -> /write-prd -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /mb-doctor at foundation/task-queue boundary -> execute/verify FT-000 until foundation gate done -> /prd-to-tasks FT-001 -> /review-tasks-plan FT-001
```

Если project principles уже `ratified` или `partial`, можно сразу продолжать с `/write-prd`.

### Brownfield

Для существующего codebase сначала соберите as-is baseline:

```text
/map-codebase -> /constitution if principles are not ratified|partial -> /write-prd --delta -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> if baseline proof is needed: /foundation-to-tasks --verify-existing -> /mb-doctor -> execute/verify FT-000 until gate done; otherwise skip FT-000 -> /prd-to-tasks FT-001 -> /review-tasks-plan FT-001
```

Можно использовать `/brief`, чтобы сформировать delta input, но route не должен обходить `/write-prd`; перед `/write-prd --delta` запускайте `/constitution`, если project principles еще не `ratified|partial`. Brownfield rule: без PRD/delta нельзя создавать roadmap epics, features или runnable task records. `/map-codebase` документирует текущую систему; он не придумывает план. Если существующий executable baseline уже доказан, brownfield route по умолчанию не создает `FT-000`; `.memory-bank/foundation.md` фиксирует `Foundation Required: false` и `Foundation Gate Task: not_required`.

### Manual task loop

Interactive mode для одной задачи:

```text
T0/T1: /execute TASK -> compact evidence or no-runnable-check note -> optional local closure by explicit owner
T2: /execute TASK -> /verify TASK -> /mb-sync at wave/feature boundary
T3: /execute TASK -> /verify TASK -> /red-verify TASK -> /mb-sync
```

В manual mode T0/T1 task можно закрыть прямо в `/execute`, если есть explicit top-level closure owner, no required packet, task-local scope, no T2/T3 trigger, and compact evidence in `task.verify` plus `.protocols/<TASK>/run.md`. Standalone `/verify` для T0/T1 остается optional: uncertainty, widened scope, explicit request, or public contract/state/data/security/runtime/cross-module changes. Для T2 task closure per-task `/red-verify` не требуется: нужны full protocol, required packet/spec gates и `/verify PASS`; перед T2 feature completion нужен `/red-verify --feature FT-*` с `SEMANTIC_VERDICT: semantic-pass`, записанный в сам feature doc. Для T3 `/verify PASS` не является финальным done: перед closure и `/mb-sync` нужен per-task `/red-verify` с `SEMANTIC_VERDICT: semantic-pass`; для T3 сохраняются human/recovery markers.
Initial required packets создаются в `/prd-to-tasks` для всех T2/T3 задач и для
T0/T1 только если task record явно содержит
`runtime_context.packet_required: true`; packet является производным runtime
контекстом и не заменяет task/specs. `/mb-packet` используется для
repair/refresh после task/spec изменений или readiness finding.

Для manual feature work `node scripts/mb-doctor.mjs` is conditional, not a
default gate for simple T0/T1. Запускайте его для T3, autonomous/autopilot
handoff, and complex T2/foundation/dependency/packet/stale-doc/risky-link
cases. `--strict` остается precondition для autopilot/autonomous handoff.

### Scheduler mode: `/autopilot`

`/autopilot` - это scheduler/executor только для уже существующей JSON task queue.

Preconditions:

- `.memory-bank/tasks/index.json` содержит indexed task records;
- у каждой task есть обязательный `tier`;
- every task-linked product feature has latest `/review-tasks-plan FT-<NNN>`
  `APPROVE`;
- `node scripts/mb-doctor.mjs --strict` проходит;
- ни одна task-linked feature не имеет pending или blocked clarification.
- required packets are usable for every T2/T3 task and for T0/T1 tasks that
  explicitly set `runtime_context.packet_required: true`.

`/autopilot` не запускает `/write-prd`, `/prd`, `/prd-to-tasks` и не создает task queue.

### Full unattended mode: `/autonomous`

`/autonomous` - это полный unattended flow:

```text
PRD/Product Brief/delta
-> inspect constitution; use ratified|partial principles or record framework-default/skipped assumption
-> /write-prd
-> /spec-auto --init
-> /prd
-> /review-feat-plan
-> /spec-design --all
-> /foundation-to-tasks if required
-> /mb-doctor --strict at foundation/task-queue boundary
-> execute/verify FT-000 until foundation gate is done
-> /spec-auto --all
-> /prd-to-tasks --all
-> /review-tasks-plan FT-<NNN> for each task-linked product feature
-> strict doctor
-> scheduler loop
-> wave `/review-tasks-plan FT-<NNN>` gates for affected product features
-> terminal state
```

Он строит SDD route map, L1-L3, feature-level design, JSON task queue по всем features, запускает scheduler loop, выполняет verification/red-verification по tier policy, запускает `/mb-sync`, проходит review gates и заканчивает явным terminal state: `SUCCESS`, `HALT_BLOCKING_QUESTIONS`, `HALT_CLARIFICATION_REQUIRED`, `HALT_REVIEW_REJECT`, `HALT_FAILURE_BUDGET`, `HALT_DEPENDENCY_DEADLOCK`, `HALT_POLICY_VIOLATION`, `HALT_QUALITY_GATES` или `HALT_BUDGET_EXCEEDED`.

## 7. Task model

Task registry является JSON-only:

```text
.memory-bank/tasks/index.json
.memory-bank/tasks/TASK-001-T1-FT-001-W1.task.json
.memory-bank/schemas/task.schema.json
```

Fresh bootstrap создает:

```json
{
  "version": 1,
  "tasks": []
}
```

Fresh bootstrap не создает `.memory-bank/foundation.md`, `REQ-000`, `FT-000`, `TASK-000-T1-FT-000-W0`, `.memory-bank/tasks/TASK-001-T2-FT-001-W1.task.json` и не создает runnable task records. Task records появляются через `/foundation-to-tasks` when required, closed `FT-000` foundation gate, then `/prd-to-tasks FT-001`; autonomous runs use the same foundation gate before `/spec-auto --all` + `/prd-to-tasks --all`.

Минимальная форма task record:

```json
{
  "id": "TASK-001-T1-FT-001-W1",
  "title": "Short task title",
  "status": "planned",
  "wave": "W1",
  "feature": "FT-001",
  "reqs": ["REQ-001"],
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

Allowed `status`: `planned`, `ready`, `in_progress`, `blocked`, `done`, `failed`.

Allowed `tier`: `T0`, `T1`, `T2`, `T3`.

Legacy `risk` и `risk.level` удалены. Execution, verification, red-verification, scheduler routing и doctor checks должны использовать только `task.tier`.

Optional task runtime context may be present when backed by PRD/feature/spec
evidence:

```json
{
  "purpose": "Why this task exists.",
  "success_outcome": "Observable result that proves real success.",
  "anti_goals": [],
  "runtime_context": {
    "allowed_write_scope": [],
    "forbidden_scope": [],
    "stop_conditions": []
  }
}
```

For T0/T1, `packet_required` defaults to false/absent and `packet_ref` without
`packet_required: true` is advisory only. For T2/T3, `/prd-to-tasks` stores
`runtime_context.packet_required: true` and canonical
`packet_ref: ".memory-bank/packets/<task.id>.packet.json"`; downstream gates
also require the packet for older T2/T3 records that omit the flag. A T2/T3
record with `packet_required: false` is a policy violation, not permission to
skip the packet.

Boundary notes live in `.memory-bank/contracts/boundary-map.md` as a normal
contract/spec document. Tasks reference it through existing source/normative/
constraint/verification fields and copy executable limits into
`runtime_context`; there are no boundary-specific task fields.

## 8. Manual mode vs scheduler mode

Владение статусами отличается по mode.

Manual mode:

- `/execute` реализует task и записывает evidence/handoff;
- T0/T1 task можно закрыть прямо в `/execute` только при явном top-level closure owner, no required packet, task-local scope, no T2/T3 trigger и compact evidence;
- standalone `/verify` для T0/T1 optional и нужен для uncertainty, widened scope или explicit request;
- T2 task можно считать финально `done` после full protocol, required packet/spec gates и `/verify PASS`; per-task `/red-verify` не требуется для T2 task closure;
- T2 feature нельзя считать complete, пока после всех feature tasks не прошел `/red-verify --feature FT-*` с `SEMANTIC_VERDICT: semantic-pass`, записанным в feature doc;
- T3 task нельзя считать финально `done` по одному `/verify PASS`; перед closure и `/mb-sync` нужен per-task `/red-verify` с `SEMANTIC_VERDICT: semantic-pass`;
- `/mb-sync` синхронизирует Memory Bank, RTM, changelog и task records после уже записанного closure/failure/blocking decision; сам sync не выводит решение о закрытии и не нужен для local T0/T1 closure, если изменились только `task.status`, `task.verify` и `.protocols/<TASK>/run.md`.

Scheduler mode (`/autopilot`, `/autonomous`):

- scheduler владеет переходами `planned -> ready`, `ready -> in_progress`, `in_progress -> done|failed`, dependent block/unblock и terminal state;
- `/execute` не закрывает tasks;
- `/verify` не закрывает, не fail-ит и не promote-ит dependents;
- `/red-verify` не закрывает, не fail-ит и не promote-ит dependents;
- scheduler записывает closure/failure/blocking decision, final status и evidence links в authoritative `.task.json` до `/mb-sync`;
- before `/execute`, scheduler ensures a usable packet for every T2/T3 task and
  explicit T0/T1 packet requirement; missing/stale/blocked/malformed/hash-
  mismatched required packets are `HALT_QUALITY_GATES`;
- `/mb-sync` только synchronizes/reconciles already-written task state и не принимает closure/promotion decisions сам;
- после `/mb-sync` и strict doctor scheduler выполняет отдельный promotion/dependent blocking pass.

Не смешивайте manual и scheduler mode внутри одного task run.

## 9. Tier policy

| Tier | Когда использовать | Protocol | Verification | Scheduler closure |
|---|---|---|---|---|
| `T0` | typo, links, formatting, safe docs-only | допустим compact `.protocols/TASK/run.md` | отдельный `/verify` обычно не нужен | compact evidence / functional PASS достаточно |
| `T1` | local code/local behavior с низким blast radius | compact допустим | local gates; `/verify` optional | compact evidence / functional PASS достаточно |
| `T2` | API, contracts, schema/state/data/domain, cross-module | full protocol required | `/verify` required; per-task `/red-verify` optional | task: `VERDICT: PASS`; feature: `/red-verify --feature FT-*` + feature-doc `SEMANTIC_VERDICT: semantic-pass` before feature completion |
| `T3` | auth, security, secrets, prod/deploy, irreversible/data-loss, payments, compliance | full protocol required | `/verify` + per-task `/red-verify` + human/recovery evidence | `VERDICT: PASS` + `SEMANTIC_VERDICT: semantic-pass` + exact `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present` |

Если scope растет, поднимите tier перед передачей task дальше. Если сомневаетесь между двумя tiers, выбирайте более высокий.

Execution Packet statuses are local to packet files only:
`ready|ready_with_gaps|blocked|stale`. They are not task lifecycle statuses.
The task lifecycle remains `planned|ready|in_progress|blocked|done|failed`.

## 10. Generated command reference

| Command | Purpose | Creates/updates | Does not do | Next step |
|---|---|---|---|---|
| `/cold-start` | Scenario router после skeleton creation | routing decision, next command recommendation | не создает EP/FT/TASK без PRD; не обходит `/write-prd`; не заменяет `/mb-init` | `/analysis`, `/brief`, `/constitution`, `/write-prd`, `/map-codebase` или stop |
| `/mb` | Prime agent context из Memory Bank | обычно без writes; может создать `.protocols/<TASK>/plan.md` для unknowns | не реализует | выбранная task/workflow command |
| `/mb-init` | Initialize Memory Bank skeleton | `.memory-bank/`, `.tasks/`, `.protocols/`, agent files, runtime scripts | не планирует roadmap/tasks | `/cold-start` |
| `/analysis` | Optional discovery router | `.memory-bank/analysis/index.md` | не создает brief, PRD, tasks, research | `/brainstorm`, `/brief`, `/constitution`, `/write-prd`, `/map-codebase`, `/clarify-feature` |
| `/brainstorm` | Facilitated ideation | `.memory-bank/analysis/brainstorming/BR-*.md`, analysis index | не создает PRD, Product Brief, tasks | `/brief` |
| `/brief` | Product Brief input contract | `.memory-bank/analysis/product-brief.md`, analysis index | не создает features/tasks; не заменяет PRD | `/write-prd` если principles `ratified|partial`; иначе `/constitution`, затем `/write-prd` |
| `/constitution` | Contextual interview for governing principles | `.memory-bank/constitution.md` | не добавляет Spec Kit hooks, governance engines или command aliases; не заменяет PRD | `/write-prd` или current workflow |
| `/write-prd` | Product Brief/context -> clarified PRD | `.memory-bank/prd.md` | не создает EP/FT/TASK; не обходит Constitution conflicts | `/spec-init` |
| `/spec-init` | Bootstrap lightweight pre-PRD framing | `.memory-bank/spec-backbone.md` pre-PRD status, decomposition inputs, gaps, handoff; `.memory-bank/spec-index.md` as pure spec registry/index | не проводит architecture interview; не создает authoritative specs или global backbone; не пишет readiness/status state в `spec-index.md` | `/prd` |
| `/prd` | Clarified PRD -> L1-L3 Memory Bank | product, requirements, epics, features, testing/index | не создает всю task queue вслепую | `/review-feat-plan` for high-risk/large work, then `/spec-design`; `/clarify-feature` если blocked |
| `/spec-design` | Mandatory adaptive architecture scaffold and foundation decision | consumes lightweight spec-index; writes backbone status, SDD backbone specs, serious design-pressure `Architecture Spine` AD rules, and `.memory-bank/foundation.md` when needed; uses one `architecture/system-architecture.md` hub only when it is the best readable scaffold shape, with split architecture docs only when they reduce real complexity or are needed as authoritative references | не создает tasks/plans/feature-local tech-specs; не routes by task tier before task records exist; не дублирует detailed API/state/message contracts в `architecture/*`; не вводит отдельный architecture workflow | `/foundation-to-tasks` only if foundation proof is required, close the `FT-000` foundation gate when one exists, then `/prd-to-tasks FT-*` или `/spec-auto --all` |
| `/foundation-to-tasks` | Foundation Dev Path -> FT-000 JSON tasks or brownfield verified-baseline no-op | `REQ-000`, `FT-000`, `.protocols/FT-000/*`, `IMPL-FT-000.md`, indexed foundation `TASK-NNN-TN-FT-000-WN` records, required packets; or `Foundation Required: false` with `Foundation Gate Task: not_required` | не создает product feature tasks; не вводит отдельную task schema/lifecycle protocol family; не реализует features; brownfield не создает `FT-000`, если baseline уже доказан | `/mb-doctor` at foundation/task-queue boundary when tasks were created, then `/execute`/`/verify`; otherwise `/prd-to-tasks` |
| `/spec-improve` | Standalone feature-level SDD repair/refresh | needed tech-specs/architecture/contracts/domains/states/ADR/testing links, feature `spec_design_status` | не создает task records; не дублирует existing specs; не выдумывает decisions | `/prd-to-tasks FT-*` when decomposition is needed |
| `/spec-auto` | Autonomous SDD init/design | spec-index, feature design status, assumptions/blockers | не спрашивает пользователя; не игнорирует unsafe ambiguity; не обрабатывает `FT-000` как product feature | `/prd`, `/foundation-to-tasks` + foundation gate closure, или `/prd-to-tasks --all` |
| `/clarify-feature` | Resolve feature-level blockers | target `.memory-bank/features/FT-*.md` clarification metadata/answers | не назначает tier; не создает task records | `/spec-design`, required foundation gate closure, then `/prd-to-tasks FT-*` |
| `/prd-to-tasks` | Product feature design -> implementation plan + JSON tasks + required packets | optional `.memory-bank/behavior-specs/*.behavior.json`, `.memory-bank/tasks/plans/IMPL-FT-*.md`, indexed product `TASK-NNN-TN-FT-NNN-WN` records, `.memory-bank/packets/<task.id>.packet.json` when required | не запускает execution; не превращает behavior specs в verification gates; не проходит pending blockers, missing T2/T3 SDD specs, `FT-000`, or missing required foundation gate | `/review-tasks-plan FT-*`, conditional `/mb-doctor` for complex/T3/autonomous boundaries, then tier-routed `/execute`; or `/autopilot` |
| `/mb-packet` | Repair or refresh derivative task runtime context | `.memory-bank/packets/<task.id>.packet.json` | не создает tasks/specs, не реализует code, не закрывает task, не вводит module graph/Failure Packet | rerun `/mb-doctor` или resolve packet blocker |
| `/execute` | Implement one scoped task | `.protocols/<TASK>/...`, `.tasks/<TASK>/...`, code/docs в task scope; for manual T0/T1 may update task `verify`/`status` only under fast-lane owner conditions | не закрывает scheduler tasks; не запускает verify/red-verify/mb-sync; не закрывает T2/T3 | compact T0/T1 closure, `/verify`, or owner handoff |
| `/verify` | Functional acceptance/evidence verification | verification protocol/evidence, task `verify` entries, possible bugs/follow-ups | в scheduler mode не закрывает/fail-ит/promote-ит | manual close или `/red-verify`/scheduler decision |
| `/red-verify` | Adversarial semantic verification | `.protocols/<TASK>/red-verification.md`, `.tasks/<TASK>/...`, bugs/follow-ups при необходимости | не дублирует `/verify`; в scheduler mode не закрывает | `/mb-sync` или scheduler decision |
| `/review-feat-plan` | Fresh-context feature plan review | `.tasks/TASK-MB-REVIEW-FEAT-PLAN/*`, fix list/verdict | не ревьюит JSON task queue | `/spec-design` или исправить PRD/REQ/EP/FT |
| `/review-tasks-plan` | Fresh-context feature task-plan review; no args infer latest decomposed product feature; `--all` expands to per-feature reviews | `.tasks/TASK-MB-REVIEW-TASKS-PLAN/*`, per-feature fix list/verdict | не заменяет `/mb-doctor`, `/verify`, `/red-verify`; не ревьюит PRD decomposition как основной surface; не схлопывает batch features в один широкий prompt | исправить rejected feature task plan или manual `/mb-doctor`; every task-linked product feature needs `APPROVE` для `/autopilot`/`/autonomous` |
| `/map-codebase` | Brownfield as-is mapping | `.memory-bank/*` baseline docs, `.tasks/TASK-MB-MAP/*` | не создает roadmap/tasks без PRD | `/write-prd --delta`, затем `/prd` |
| `/mb-sync` | Synchronize durable docs and task consistency | indexes, RTM/lifecycle, changelog, task consistency | не принимает scheduler closure/promotion decisions; не нужен для local T0/T1 closure, если изменились только `task.status`, `task.verify` и `.protocols/<TASK>/run.md` | review, next task, or boundary doctor |
| `/mb-garden` | Maintain Memory Bank hygiene | cleanup/archive recommendations, hygiene findings | не меняет product scope; не является doctor workflow gate | исправить docs или rerun checks |
| `/mb-doctor` | Deterministic readiness gate over `mb-lint` | report only; optional JSON output | не заменяет `/review-feat-plan`, `/review-tasks-plan`, `/verify`, `/red-verify`; не default для simple manual T0/T1; нет markdown task-card fallback | исправить findings, перейти к scheduler, or skip for simple T0/T1 |
| `/mb-harness` | Set up deterministic agent-safe workflows | harness docs/config guidance, gates/worktree guidance | не реализует product tasks | запустить выбранный workflow с gates |
| `/autopilot` | Execute existing JSON task queue | task statuses, protocols, evidence, sync/review loop | не создает PRD/FT/TASK queue | terminal state или follow-up fixes |
| `/autonomous` | Full unattended PRD -> done flow | PRD/L1-L3/tasks/protocols/reviews/status | не спрашивает пользователя mid-run кроме terminal halt; не обходит hard stops | terminal state |
| `/discuss` | Clarify unknowns/contradictions before implementation | decision log/protocol notes when useful | не реализует; не создает tasks сам | resolved command, например `/write-prd`, `/execute` |
| `/add-tests` | Add useful unit/integration/e2e coverage | tests, `.memory-bank/testing/index.md`, evidence в `.tasks/` | не добавляет decorative/flaky tests | run tests, `/mb-sync` |
| `/find-skills` | Find relevant installed/marketplace skills | recommendation list | не устанавливает marketplace skills без confirmation | use/install selected skills |

## 11. Checks

Проверки framework/source repo:

```bash
npm run check:syntax --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
node scripts/install-framework.mjs --skill '*' --yes
tmpdir="$(mktemp -d)"; node scripts/install-framework.mjs --bootstrap --target "$tmpdir" --yes
```

Команда `find` должна вывести `0`.

Проверки target repo после bootstrap:

```bash
node scripts/mb-lint.mjs
node scripts/mb-doctor.mjs
```

Используйте strict doctor только после появления реальной executable task queue:

```bash
node scripts/mb-doctor.mjs --strict
```

В fresh skeleton пустой `.memory-bank/tasks/index.json` валиден в default doctor mode и невалиден в strict mode, потому что executable queue отсутствует.

## License

MIT
