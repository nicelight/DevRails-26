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
  testing/index.md
  testing/strategy.md
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

В fresh target `testing/index.md` является только router, а компактная
framework baseline policy живёт в зарегистрированном `testing/strategy.md`.
Она задаёт risk-based выбор проверок и место хранения evidence, но не диктует
обязательную test pyramid. Sync существующего Memory Bank не создаёт этот файл
и не переписывает legacy testing index/spec registry; миграция выполняется
только явным project-level решением. Если legacy target не имеет testing
router, sync создаёт минимальный `testing/index.md` со ссылкой на spec registry,
но не seed-ит strategy. Отсутствующие root index/spec registry регистрируют
только реально существующую testing policy и не создают broken links на
fresh-only strategy.

## 5. Package skills

- `cold-start` - package entrypoint / generated scenario router; skeleton
  creation остается за installer bootstrap или `mb-init`.
- `mb-init` - генерация skeleton, agent guides и runtime scripts.
- `mb-garden` - maintenance Memory Bank и packaged deterministic lint/readiness tool assets.

## 6. Workflows

### Сначала ручной workflow

Рекомендуемый путь для новичка:

```text
idea / rough draft
  -> /brainstorm для raw ideas или /brief для clear concepts
  -> /constitution, если project principles еще не ratified|partial
  -> /write-prd
  -> /spec-init
  -> /prd
  -> /review-feat-plan for high-risk/large work
  -> /spec-design
  -> /foundation-to-tasks if required
  -> /mb-doctor --strict at foundation/task-queue boundary
  -> /execute + /verify FT-000 until foundation gate is done
  -> /prd-to-tasks FT-001
  -> /review-tasks-plan FT-001
  -> conditional /mb-doctor at feature/task-queue boundary for complex/T3/autonomous cases
  -> tier-routed /execute TASK-001-TN-FT-001-W1
  -> /verify TASK-001-TN-FT-001-W1 для T2/T3 или uncertainty
  -> /red-verify TASK-001-T3-FT-001-W1 для T3
  -> /red-verify --feature FT-001 для T2 feature completion
  -> record task status/closure/evidence immediately
  -> /mb-sync once at the end of the wave
  -> повторять feature/task loop
```

`/brainstorm` может создать brainstorming report для raw ideas. `/brief` создает Product Brief как вход для `/constitution` и `/write-prd`. Ни один из этих discovery-шагов не создает runnable task records. Все Product/Design skills используют один operator-decision принцип: реальная неоднозначность или развилка, влияющая на outcome/handoff, требует явного ответа; recommendation, conservative default или молчание не являются решением. Формат интервью адаптивный, без фиксированной анкеты и искусственного лимита ответа. Если authoritative evidence уже однозначно, вопрос не задаётся. Unattended flow применяет только ранее принятое решение, иначе использует существующий clarification/blocking halt.

`/constitution` читает Product Brief, если он есть, и адаптивно закрывает только неразрешённые governing branches по project principles, Definition of Done, автономности агентов, human checkpoints и non-negotiables. Это нормальный шаг перед `/write-prd`, когда principles еще не `ratified|partial`, но не hard-blocker: если пользователь явно пропускает его, flow продолжает идти с `project_principles: framework-default|skipped`, а Constitution можно ratify позже.

`/write-prd` нормализует вход в `.memory-bank/prd.md` с `type: prd`, `clarification_status: complete` и `constitution_checked: true`. `/spec-init` обновляет `.memory-bank/spec-backbone.md` как lightweight pre-PRD route/state map по evidence из PRD/brief/existing specs: decomposition inputs, gaps, handoff и expected locations; `.memory-bank/spec-index.md` при этом остается чистым registry/index спецификаций, без readiness/status state. `/prd` декомпозирует PRD в L1-L3 docs Memory Bank: product, requirements, epics и features. Для high-risk/large work `/review-feat-plan` проверяет PRD/REQ/EP/FT перед SDD design.

`/spec-design` является обязательным gate после `/prd`: он потребляет `spec-backbone` и чистый `spec-index` из `/spec-init`, а Architecture, Interfaces/Contracts, Data и Verification использует как coverage criteria, не как обязательные фазы или единый порядок анализа. Агент свободно выбирает инструменты, порядок и минимальную artifact shape, но сохраняет parseable status/matrix, canonical routing, blockers и handoff. Concrete feature-level gaps маршрутизируются как `needed_before_tasks` только при уже однозначном canonical path. Data Contract описывает payload, пересекающий component/API/event/protocol boundary; Data Specification описывает внутренние модели, БД, persistence, migrations и internal validation/serialization. Для local/simple feature-set pressure gate может записать minimal backbone и `not_applicable`, а для shared-boundary, contract, state/data/runtime/security или strict pressure фиксирует source-of-truth, boundaries, data/contracts и конкретные verification concerns либо blockers. Bootstrap-owned testing policy разрешается через `spec-index.md`, но `/spec-design` не расширяет и не перепроектирует её. Для serious design pressure он держит короткий `Architecture Spine` с `AD-*` executable rules внутри `architecture/system-architecture.md`, без отдельного architecture workflow. `/spec-design` всегда пишет явное Foundation Dev Path решение в `.memory-bank/foundation.md`; когда executable baseline нужен, `/foundation-to-tasks` сам выбирает минимальный walking skeleton, spec coverage и cohesive task slicing внутри уже принятого Foundation decision. Architecture/Interfaces/Data/Verification/security/runtime являются coverage criteria, а не предписанным анализом. Команда создаёт только необходимые subject-based substrate specs, normal `FT-000` JSON tasks и final foundation gate; новую material design branch она возвращает оператору или в unattended режиме останавливает. Product task generation waits until that gate is `done`. При `Foundation Required: false` queue не создаётся. Architecture может остаться в одном `architecture/system-architecture.md` только когда это лучший readable scaffold shape; split architecture docs создаются только когда split снижает реальную сложность или нужен как canonical reference.

Product/Design boundary готов только когда согласован полный durable contract: clarified PRD; product/requirements/epics/features; `Global Backbone Status: complete|minimal`; canonical `spec-index`; Foundation Dev Path decision; и accepted operator decisions в существующих canonical artifacts. `blocked` status или unanswered material branch запрещает task handoff.

`/prd-to-tasks` полноценно закрывает feature-level SDD concern coverage и для новой, и для уже разложенной feature. До durable task draft команда обязательно читает schema и tier policy, но порядок discovery, инструменты, форму временного concern audit и cohesive task slicing выбирает сама. Для каждого применимого concern всё равно требуется ровно одно доказанное действие: `reuse|extend|create|not_applicable|block`. Architecture, Interfaces/Contracts, Data, state, security, runtime, operations и Verification служат критериями полноты без фиксированного порядка. Feature остаётся composition root; новые specs получают предметные canonical paths без `FT-*` и не хранят reverse `used_by`. Новые shared/global решения или competing canonical paths возвращаются в `/spec-design`. Любая material product/design/contract/task-boundary/tier/dependency/verification branch требует explicit operator answer; recommendation/default не считается ответом, а unattended run завершает существующим halt с resume route. Если task queue уже существует, команда по умолчанию согласует specs, plan и task records без смены task identity, lifecycle status или verification evidence; изменения identity, tier, wave, dependencies, acceptance criteria или material scope требуют явной полной передекомпозиции. Для T2/T3 concrete concern должен иметь canonical spec с `shape`, `rules`, `edge cases/errors` и `verification target`, а task card — purpose/outcome, direct spec links, expected change surface и verification path. `touched_files` является advisory non-exhaustive гипотезой; `write_boundary`, если заполнен, является deliberate hard boundary. Нерешённая неоднозначность блокирует task creation. После этого `/review-tasks-plan FT-<NNN>` независимо и в выбранном reviewer-ом порядке покрывает structural integrity, acceptance/REQ coverage и slicing, final design readiness и execution readiness; он не исправляет planning surface и не выбирает неоднозначную трактовку, а возвращает `APPROVE|REJECT` с вопросом и repair route.

### Понятный PRD или concept

Если есть понятный concept, но нет PRD:

```text
/brief -> /constitution if principles are not ratified|partial -> /write-prd -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /mb-doctor --strict at foundation/task-queue boundary -> execute/verify FT-000 until foundation gate done -> /prd-to-tasks FT-001 -> /review-tasks-plan FT-001 -> conditional /mb-doctor -> tier-routed /execute TASK
```

Если уже есть внешний PRD или PRD-like text:

```text
/constitution if principles are not ratified|partial -> /write-prd -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /mb-doctor --strict at foundation/task-queue boundary -> execute/verify FT-000 until foundation gate done -> /prd-to-tasks FT-001 -> /review-tasks-plan FT-001 -> conditional /mb-doctor -> tier-routed /execute TASK
```

Если project principles уже `ratified` или `partial`, можно сразу продолжать с `/write-prd`.

### Brownfield

Для существующего codebase сначала соберите as-is baseline:

```text
/map-codebase -> /constitution if principles are not ratified|partial -> /write-prd --delta -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> if baseline proof is needed: /foundation-to-tasks --verify-existing -> /mb-doctor --strict -> execute/verify FT-000 until gate done; otherwise skip FT-000 -> /prd-to-tasks FT-001 -> /review-tasks-plan FT-001 -> conditional /mb-doctor -> tier-routed /execute TASK
```

Можно использовать `/brief`, чтобы сформировать delta input, но route не должен обходить `/write-prd`; перед `/write-prd --delta` запускайте `/constitution`, если project principles еще не `ratified|partial`. Brownfield rule: без PRD/delta нельзя создавать roadmap epics, features или runnable task records. `/map-codebase` документирует текущую систему; он не придумывает план. Если существующий executable baseline уже доказан, brownfield route по умолчанию не создает `FT-000`; `.memory-bank/foundation.md` фиксирует `Foundation Required: false` и `Foundation Gate Task: not_required`.

### Manual task loop

Interactive mode для одной задачи:

```text
T0/T1: /execute TASK -> compact evidence or no-runnable-check note -> optional local closure by explicit owner
T2: /execute TASK -> /verify TASK -> /mb-sync at wave/feature boundary
T3: /execute TASK -> /verify TASK -> /red-verify TASK -> explicit owner closure
Wave boundary: /mb-sync -> mb-lint -> /mb-doctor --strict
```

В manual mode T0/T1 task можно закрыть прямо в `/execute`, если есть explicit top-level closure owner, semantic task-local scope, no T2/T3 trigger, and compact evidence in `task.verify` plus `.protocols/<TASK>/run.md`. `/execute` использует `touched_files` как стартовую гипотезу, а порядок исследования, implementation tactic, actual files и cheapest sufficient checks выбирает внутри outcome/spec/hard scopes. Нарушение hard allowed/forbidden scope или новая material product/design/contract/dependency/tier/verification branch останавливает работу: interactive flow спрашивает оператора, unattended возвращает blocker и exact repair route. Если фактический scope требует higher tier, исходный task ID передается в `/prd-to-tasks FT-*` для controlled rebuild/split, затем повторяются `/review-tasks-plan`, применимый `/mb-doctor` и `/execute` replacement task ID. `/verify` независимо выбирает минимально убедительные checks, но сохраняет `PASS|FAIL|NEEDS-CLARIFICATION` и task-scoped basis. Для T2 task closure per-task `/red-verify` не требуется: нужны full protocol, applicable task/spec gates и `/verify PASS`; перед T2 feature completion нужен `/red-verify --feature FT-*` с `SEMANTIC_VERDICT: semantic-pass`, записанный в сам feature doc. Для T3 `/verify PASS` не является финальным done: `/red-verify` самостоятельно строит hostile model и probes, а closure требует `semantic-pass` и exact `HUMAN_CHECKPOINT: done`. Explicit owner сразу записывает closure/status/evidence в task record. Full `/mb-sync` выполняется один раз в конце текущей wave; ранний sync допустим только при реальной зависимости текущей wave от согласованного RTM/index/spec/contract/changelog state или по явному запросу owner.

Для manual feature work `node scripts/mb-doctor.mjs` is conditional, not a
default gate for simple T0/T1. Запускайте его для T3, autonomous/autopilot
handoff, and complex T2/foundation/dependency/stale-doc/risky-link
cases. `--strict` остается precondition для autopilot/autonomous handoff.

### Scheduler mode: `/autopilot`

`/autopilot` - это scheduler/executor только для уже существующей JSON task queue. Канонический режим последователен: одна task должна получить execute/verify/closure decision до выбора следующей. `--experimental-parallel` остаётся тестовой opt-in возможностью и требует isolated worktrees/sandboxes и pairwise-disjoint hard `write_boundary`; `touched_files` не доказывает независимость.

Preconditions:

- `.memory-bank/tasks/index.json` содержит indexed task records;
- у каждой task есть обязательный `tier`;
- every task-linked product feature has latest `/review-tasks-plan FT-<NNN>`
  `APPROVE`;
- `node scripts/mb-doctor.mjs --strict` проходит;
- ни одна task-linked feature не имеет pending или blocked clarification.
- every T2/T3 task satisfies the single-card handoff contract.

`/autopilot` не запускает `/write-prd`, `/prd`, `/prd-to-tasks` и не создает task queue.

### Full unattended mode: `/autonomous`

`/autonomous` - это полный unattended flow:

```text
PRD/Product Brief/delta
-> inspect constitution; use ratified|partial or an explicitly accepted skip/default, otherwise halt on unresolved governance decision
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
-> conditional `/review-tasks-plan FT-<NNN>` when a wave changed task/spec planning
-> terminal state
```

Он строит SDD route map, L1-L3, feature-level design и JSON task queue через child-skill contracts, не копируя их внутреннюю методику. Scheduler остаётся sequential, владеет transitions/budgets/terminal state и останавливается на любой новой operator-owned branch вместо silent assumption. `/mb-sync` остаётся тонким adapter к canonical sync workflow и не принимает closure/promotion decisions. Terminal state остаётся одним из: `SUCCESS`, `HALT_BLOCKING_QUESTIONS`, `HALT_CLARIFICATION_REQUIRED`, `HALT_REVIEW_REJECT`, `HALT_FAILURE_BUDGET`, `HALT_DEPENDENCY_DEADLOCK`, `HALT_POLICY_VIOLATION`, `HALT_QUALITY_GATES` или `HALT_BUDGET_EXCEEDED`.

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

Fresh bootstrap не создаёт `.memory-bank/tech-specs/`, `.memory-bank/foundation.md`, `REQ-000`, `FT-000`, `TASK-000-T1-FT-000-W0`, `.memory-bank/tasks/TASK-001-T2-FT-001-W1.task.json` и runnable task records. Task records появляются через `/foundation-to-tasks` when required, closed `FT-000` foundation gate, then `/prd-to-tasks FT-001`; autonomous runs use the same foundation gate before `/spec-auto --all` + `/prd-to-tasks --all`.

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
    "forbidden_scope": [],
    "stop_conditions": []
  }
}
```

For T2/T3, `/prd-to-tasks` and `/foundation-to-tasks` require a complete single
task card before execution: non-empty `purpose` and scalar `success_outcome`, an
existing direct task-linked canonical SDD path, an expected change surface in
advisory non-exhaustive `touched_files` and/or a deliberate hard
`runtime_context.write_boundary`, and a real gate command and/or non-empty
`verification_target`. Optional evidence-driven fields remain empty when no
grounded value exists.

Boundary notes live in `.memory-bank/contracts/boundary-map.md` as a normal
contract/spec document. Tasks reference it through existing source/normative/
constraint/verification fields and copy executable limits into
`runtime_context`; there are no boundary-specific task fields.

## 8. Manual mode vs scheduler mode

Владение статусами отличается по mode.

Manual mode:

- `/execute` реализует task и записывает evidence/handoff;
- T0/T1 task можно закрыть прямо в `/execute` только при явном top-level closure owner, task-local scope, no T2/T3 trigger и compact evidence;
- standalone `/verify` для T0/T1 optional и нужен для uncertainty, widened scope или explicit request;
- T2 task можно считать финально `done` после full protocol, applicable task/spec gates и `/verify PASS`; per-task `/red-verify` не требуется для T2 task closure;
- T2 feature нельзя считать complete, пока после всех feature tasks не прошел `/red-verify --feature FT-*` с `SEMANTIC_VERDICT: semantic-pass`, записанным в feature doc; scheduler запускает этот gate при закрытии последней feature task до wave-boundary `/mb-sync` и strict doctor;
- T3 task нельзя считать финально `done` по одному `/verify PASS`; перед closure нужен per-task `/red-verify` с `SEMANTIC_VERDICT: semantic-pass` и exact `HUMAN_CHECKPOINT: done`;
- explicit owner сразу записывает task status, closure decision и evidence; `/mb-sync` синхронизирует Memory Bank, RTM, changelog и task records один раз в конце wave и сам не выводит решение о закрытии;
- ранний full sync допустим только если продолжение текущей wave зависит от reconciled RTM/index/spec/contract/changelog state или owner явно запросил sync; local T0/T1 closure не требует sync, если изменились только `task.status`, `task.verify` и `.protocols/<TASK>/run.md`.

Scheduler mode (`/autopilot`, `/autonomous`):

- canonical selection is sequential: one task completes its
  execute/verify/closure decision before the next is selected;
- `--experimental-parallel` is non-canonical and requires isolated execution,
  pairwise-disjoint hard scopes, no T3/shared-governing writes, and sequential
  fallback when independence cannot be proved;
- scheduler владеет переходами `planned -> ready`, `ready -> in_progress`, `in_progress -> done|failed|blocked`, dependent block/unblock и terminal state;
- functional/semantic failure может повторить ту же task только в пределах retry budget и без изменения identity/scope/tier/contracts; иначе task фиксируется как `failed`, получает bug либо normal planned follow-up, а dependents блокируются;
- `/execute` не закрывает tasks;
- `/verify` не закрывает, не fail-ит и не promote-ит dependents;
- `/red-verify` не закрывает, не fail-ит и не promote-ит dependents;
- scheduler записывает closure/failure/blocking decision, final status и evidence links в authoritative `.task.json` сразу после каждой task;
- before `/execute`, scheduler requires a green `/mb-doctor --strict`; an
  incomplete T2/T3 single-card handoff is `HALT_QUALITY_GATES`;
- `/mb-sync` только synchronizes/reconciles already-written task state и не принимает closure/promotion decisions сам; обычный full sync запускается один раз в конце wave;
- после wave-boundary `/mb-sync`, lint и strict doctor scheduler выполняет отдельный promotion/dependent blocking pass для следующей wave.

Не смешивайте manual и scheduler mode внутри одного task run.

## 9. Tier policy

| Tier | Когда использовать | Protocol | Verification | Scheduler closure |
|---|---|---|---|---|
| `T0` | typo, links, formatting, safe docs-only | допустим compact `.protocols/TASK/run.md` | отдельный `/verify` обычно не нужен | compact evidence / functional PASS достаточно |
| `T1` | local code/local behavior с низким blast radius | compact допустим | local gates; `/verify` optional | compact evidence / functional PASS достаточно |
| `T2` | API, contracts, schema/state/data/domain, cross-module | full protocol required | `/verify` required; per-task `/red-verify` optional | task: `VERDICT: PASS`; feature: `/red-verify --feature FT-*` + feature-doc `SEMANTIC_VERDICT: semantic-pass` before feature completion |
| `T3` | auth, security, secrets, prod/deploy, irreversible/data-loss, payments, compliance | full protocol required | `/verify` + per-task `/red-verify` + human checkpoint | `VERDICT: PASS` + `SEMANTIC_VERDICT: semantic-pass` + exact `HUMAN_CHECKPOINT: done` + explicit owner/scheduler closure; `/mb-sync` at wave boundary |

Если evidenced scope однозначно триггерит несколько tiers, используется самый высокий triggered tier. Если же tier зависит от неразрешённой scope/verification развилки или evidence недостаточно, interactive flow спрашивает оператора, а unattended flow останавливается без higher-tier default.

The task lifecycle remains `planned|ready|in_progress|blocked|done|failed`.

## 10. Generated command reference

| Command | Purpose | Creates/updates | Does not do | Next step |
|---|---|---|---|---|
| `/cold-start` | Scenario router после skeleton creation | routing decision, next command recommendation | не создает EP/FT/TASK без PRD; не обходит `/write-prd`; не заменяет `/mb-init` | `/brainstorm`, `/brief`, `/constitution`, `/write-prd`, `/map-codebase` или stop |
| `/mb` | Prime agent context из Memory Bank | обычно без writes; может создать `.protocols/<TASK>/plan.md` для unknowns | не реализует | выбранная task/workflow command |
| `/mb-init` | Initialize Memory Bank skeleton | `.memory-bank/`, `.tasks/`, `.protocols/`, agent files, runtime scripts | не планирует roadmap/tasks | `/cold-start` |
| `/brainstorm` | Facilitated ideation | `.memory-bank/analysis/brainstorming/BR-*.md`, analysis index | не создает PRD, Product Brief, tasks | `/brief` |
| `/brief` | Product Brief input contract | `.memory-bank/analysis/product-brief.md`, analysis index | не создает features/tasks; не заменяет PRD | `/write-prd` если principles `ratified|partial`; иначе `/constitution`, затем `/write-prd` |
| `/constitution` | Adaptive interview for unresolved governing principles | `.memory-bank/constitution.md` | не добавляет Spec Kit hooks, governance engines или command aliases; recommendation не заменяет operator decision | `/write-prd` или repair unresolved governance blocker |
| `/write-prd` | Product Brief/context -> clarified PRD | `.memory-bank/prd.md` | не создает EP/FT/TASK; не обходит Constitution conflicts | `/spec-init` |
| `/spec-init` | Bootstrap lightweight pre-PRD framing | `.memory-bank/spec-backbone.md` pre-PRD status, decomposition inputs, gaps, handoff; `.memory-bank/spec-index.md` as pure spec registry/index | не проводит architecture interview; не создаёт canonical design specs или global backbone; не пишет readiness/status state в `spec-index.md` | `/prd` |
| `/prd` | Clarified PRD -> L1-L3 Memory Bank | product, requirements, epics, features | не создаёт task queue и не изменяет testing documentation | `/review-feat-plan` for high-risk/large work, then `/spec-design`; `/clarify-feature` если blocked |
| `/spec-design` | Mandatory adaptive architecture scaffold and foundation decision | consumes lightweight spec-index; writes backbone status; covers applicable Architecture, Interfaces/Contracts, Data, and Verification concerns in any suitable order; writes serious design-pressure `Architecture Spine` AD rules and an explicit `.memory-bank/foundation.md` decision (`required` or `not_required`); routes contract areas and canonical paths as `authoritative`, `needed_before_tasks`, `not_applicable`, or `blocked`; uses one `architecture/system-architecture.md` hub only when it is the best readable global scaffold shape | не создаёт tasks/plans/default feature-owned specs; не принимает unresolved operator decisions; не дублирует detailed API/state/message contracts в `architecture/*`; не вводит отдельный architecture workflow | `/foundation-to-tasks` only if foundation proof is required, иначе `/prd-to-tasks FT-*` или `/spec-auto --all`; blocked -> `/spec-design` after decision |
| `/foundation-to-tasks` | Foundation Dev Path -> FT-000 JSON tasks or brownfield verified-baseline no-op | минимальный agent-selected walking skeleton; applicable Architecture/Interfaces/Data/Verification coverage; `REQ-000`, `FT-000`, `.protocols/FT-000/*`, `IMPL-FT-000.md`, indexed complete foundation `TASK-NNN-TN-FT-000-WN` records; or `Foundation Required: false` with `Foundation Gate Task: not_required` | не создаёт product feature tasks; не вводит отдельную task schema/lifecycle; не принимает новую design branch за оператора; не заполняет будущие product contracts вместо `/prd-to-tasks` | `/mb-doctor --strict` when tasks were created, then `/execute`/`/verify`; otherwise `/prd-to-tasks` |
| `/spec-auto` | Unattended SDD init/design from authoritative decisions | spec-index, feature design status, accepted-decision references/blockers | не спрашивает пользователя и не выбирает за него; unresolved branch завершает существующим halt; не обрабатывает `FT-000` как product feature | `/prd`, `/foundation-to-tasks` + foundation gate closure, `/prd-to-tasks --all`, или interactive repair skill |
| `/clarify-feature` | Resolve feature-level blockers | target `.memory-bank/features/FT-*.md` clarification metadata/answers | не назначает tier; не создает task records | `/spec-design`, required foundation gate closure, then `/prd-to-tasks FT-*` |
| `/prd-to-tasks` | Initial product feature concern design or safe reconciliation -> implementation plan + complete JSON tasks | agent-selected discovery/audit/slicing tactics; `reuse|extend|create|not_applicable|block`; subject-based specs; direct task links; optional behavior examples; IMPL plan; indexed T2/T3-complete cards | не создаёт default `FT-*` hubs; не принимает operator-owned product/design/tasking decisions; не запускает execution; reconciliation сохраняет identity/lifecycle/evidence | `/review-tasks-plan FT-*` или named clarification/design repair |
| `/review-tasks-plan` | Fresh-context gate for one feature's runnable planning surface | `APPROVE|REJECT` report over structural integrity, acceptance/REQ coverage and slicing, canonical design readiness/direct task links, and execution readiness | не исправляет specs/plans/tasks; отклоняет hub-only T2/T3 coverage; behavior specs не являются readiness gate; не заменяет `/review-feat-plan` или `/mb-doctor` | feature-level canonical repair через `/prd-to-tasks`, shared/global repair через `/spec-design`, либо conditional `/mb-doctor` и execution |
| `/execute` | Implement one scoped task using direct task-linked canonical Architecture, Component/API/Event/Data Contract, and Data Specification inputs | `.protocols/<TASK>/...`, `.tasks/<TASK>/...`, code/docs в task scope; for manual T0/T1 may update task `verify`/`status` only under fast-lane owner conditions | не считает feature links или `spec-index` заменой direct T2/T3 task context; не закрывает scheduler tasks; не запускает verify/red-verify/mb-sync; не меняет tier-encoded task identity in place | compact T0/T1 closure, `/verify`, or higher-tier handoff through `/prd-to-tasks FT-*` |
| `/verify` | Task-scoped functional verification одной реализованной task | tier-selected verification protocol, task `verify` evidence и `PASS|FAIL|NEEDS-CLARIFICATION`; checks only mapped AC/REQ and direct task-linked applicable canonical specs | не чинит specs/tasks, не создаёт BUG/follow-up task, не меняет tier identity; T2/T3 lifecycle остаётся explicit owner/scheduler | T0/T1 explicit-owner closure, T2 closure recommendation, T3 `/red-verify`, либо repair route в `/prd-to-tasks`/`/spec-design` |
| `/red-verify` | Adversarial semantic verification | самостоятельно построенная hostile model/probes, `.protocols/<TASK>/red-verification.md`, `.tasks/<TASK>/...`, exact semantic verdict | не дублирует `/verify`; не выбирает неоднозначную трактовку; в scheduler mode не закрывает | scheduler/explicit owner decision или named repair route |
| `/review-feat-plan` | Fresh-context feature plan review | `.tasks/TASK-MB-REVIEW-FEAT-PLAN/*`, fix list/verdict | не ревьюит JSON task queue | `/spec-design` или исправить PRD/REQ/EP/FT |
| `/review-tasks-plan` | Fresh-context feature task-plan review; no args infer latest decomposed product feature; `--all` expands to per-feature reviews | `.tasks/TASK-MB-REVIEW-TASKS-PLAN/*`, per-feature fix list/verdict, concrete contract readiness answer for T2/T3 | не заменяет `/mb-doctor`, `/verify`, `/red-verify`; не ревьюит PRD decomposition как основной surface; не схлопывает batch features в один широкий prompt | исправить rejected feature task plan или manual `/mb-doctor`; every task-linked product feature needs `APPROVE` для `/autopilot`/`/autonomous` |
| `/map-codebase` | Brownfield as-is mapping | `.memory-bank/*` baseline docs, `.tasks/TASK-MB-MAP/*` | не создает roadmap/tasks без PRD | `/write-prd --delta`, затем `/prd` |
| `/mb-sync` | Thin adapter to canonical wave-boundary reconciliation | indexes, RTM/lifecycle, changelog, task/spec consistency already decided by owners | не принимает closure/promotion/product/design decisions; не запускается после каждой ordinary task | lint + strict doctor, then separate scheduler promotion |
| `/mb-garden` | Maintain Memory Bank hygiene | cleanup/archive recommendations, hygiene findings | не меняет product scope; не является doctor workflow gate | исправить docs или rerun checks |
| `/mb-doctor` | Deterministic readiness gate over `mb-lint` | report only; optional JSON output | не заменяет `/review-feat-plan`, `/review-tasks-plan`, `/verify`, `/red-verify`; не default для simple manual T0/T1; нет markdown task-card fallback | исправить findings, перейти к scheduler, or skip for simple T0/T1 |
| `/autopilot` | Sequential scheduler for an existing reviewed JSON queue | scheduler-owned task statuses, protocols, evidence, wave sync/review loop | не создаёт PRD/FT/TASK queue; не повторяет child implementation methods; не выбирает unresolved operator branch | terminal state или exact interactive repair route |
| `/autonomous` | Full unattended PRD -> done orchestration | PRD/L1-L3/tasks/protocols/reviews/status through child contracts | не выбирает за оператора; не обходит hard stops; не меняет sequential canonical scheduler | terminal state with exact resume route |
| `/discuss` | Clarify unknowns/contradictions before implementation | decision log/protocol notes when useful | не реализует; не создает tasks сам | resolved command, например `/write-prd`, `/execute` |
| `/add-tests` | Add risk-based coverage inside an existing indexed `in_progress` task | scoped tests and tier-selected evidence in `.protocols/<TASK_ID>/` / `.tasks/<TASK_ID>/` | не создаёт task identity, не меняет `.memory-bank/testing/`, не добавляет decorative/flaky tests | return to `/execute`, `/verify`, scheduler, or explicit owner |
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
