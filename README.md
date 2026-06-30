# factory for development

![Схема DevRails 26](devrails.jpg)

`DevRails 26` - это фреймворк co своим workflow, который содержит набор взаимосвязанных skills и extended memory для агентной разработки проектов по SDD way.

Фреймворк ориентирован на упряжки Claude CLI / Codex CLI, под капотом куча бюрократии ради независимой разработки и  надежной поддержки проекта Агентами на стадии refactoring\extending.



## 🗄️ Что дает DevRails



 Фреймворк помогает вести разработку как повторяемый процесс:

- фиксирует требования, решения и статус задач в репозитории;
- связывает PRD, requirements, epics, features и implementation tasks;
- хранит acceptance criteria, gates, evidence и verification results;
- позволяет выполнять задачи по одной, с явным handoff и проверкой результата;
- поддерживает ручной workflow и автоматические режимы поверх той же task model.

## 🧭 Сценарии использования



- 🌱 **Greenfield**: когда есть идея, черновик или разрозненные требования. Framework помогает довести входные данные до PRD, разложить PRD на requirements, epics, features и tasks, затем пройти реализацию до готового проекта.
- 🏗️ **Brownfield**: когда код уже существует. Framework можно встроить в текущий репозиторий, сначала описать фактическое состояние через `/map-codebase`, а затем планировать изменения через новый PRD или delta к уже описанному baseline.

## 🔄 Workflow разработки



DevRails ведет проект через три фазы. 

### 1. Мозговой штурм и формирование ТЗ

Фаза начинается с идеи, черновика или внешнего PRD. Если идея сырая, `/brainstorm` помогает разложить ее на понятные варианты, риски и решения, но не превращает мысли в требования автоматически. Когда концепт уже достаточно ясен, `/brief` собирает короткий Product Brief: что строим, для кого, зачем, что точно не входит в scope.

Дальше `/constitution` фиксирует правила проекта: Definition of Done, допустимую автономность агентов, human checkpoints и non-negotiables. Это нужно, чтобы последующие агенты не принимали важные продуктовые и инженерные решения заново в каждой задаче. Если проектные принципы уже `ratified|partial`, этот шаг можно не повторять.

`/write-prd` превращает brief, внешний PRD или delta-описание в `.memory-bank/prd.md`. На этом этапе закрываются крупные неоднозначности: цели, scope, ограничения, пользователи, acceptance expectations и открытые вопросы. Для brownfield проекта перед планированием изменений обычно запускают `/map-codebase`: он описывает текущий код как baseline и не создает roadmap features без PRD/delta.

### 2. Создание плана разработки проекта и спецификаций

После PRD `/spec-init` делает pre-PRD framing: проверяет, достаточно ли понятны домены, сценарии, границы, lifecycle и non-goals, чтобы `/prd` не нарезал продукт неправильно. Он обновляет `.memory-bank/spec-backbone.md` как lightweight route/state map и держит `.memory-bank/spec-index.md` чистым registry спецификаций.

`/prd` раскладывает clarified PRD на продуктовую структуру: requirements, epics и функциональные спецификации features (`FT-*`). Для крупной или рискованной работы `/review-feat-plan` проверяет traceability и границы до архитектурного design gate.

`/spec-design` - обязательный SDD gate после `/prd` и до task decomposition. Он генерирует или обновляет core SDD specs через три design lenses: Architecture, Interfaces/Contracts и Data. Interfaces/Contracts включает только применимые Component Contract, API Contract, Event Contract и Data Contract; Data Contract описывает payload через границу, а Data Specification - внутренние модели, БД и persistence. Для простой локальной работы gate может зафиксировать minimal backbone и пометить лишние области `not_applicable`; для shared-boundary, contract, state/data/runtime/security или strict pressure создает/обновляет архитектурный backbone, source-of-truth, boundary/contracts, state/domain/runtime/testing decisions. Короткие executable architecture rules живут в `Architecture Spine` как `AD-*` внутри `.memory-bank/architecture/system-architecture.md`.

`/spec-design` всегда фиксирует явное Foundation Dev Path решение в `.memory-bank/foundation.md`. Если проекту нужен executable baseline до продуктовых задач, `/foundation-to-tasks` применяет к walking skeleton три design lenses: Architecture, Interfaces/Contracts и Data. Он создает только нужные substrate-level Component/API/Event/Data contracts, internal Data Specification и supporting Test Harness/Runbook/Evidence specs в объеме baseline proof. После этого создаются `REQ-000`, pseudo-feature `FT-000`, normal JSON tasks и final foundation gate. Если baseline не нужен, файл содержит `Foundation Required: false` и `Foundation Gate Task: not_required`, а foundation queue не создаётся. `FT-000` не является продуктовой feature: это walking skeleton / baseline proof, который нужно закрыть через `/execute` и `/verify` до генерации обычных product tasks. Детальные product specs дорабатываются в `/prd-to-tasks`. Fresh bootstrap сам `FT-000` не создает.

После backbone и foundation decisions команда `/prd-to-tasks FT-<NNN>` закрывает feature-level SDD concern coverage и формирует план реализации: сначала через `spec-index` и subject directories находит canonical specs и для каждого concern выбирает `reuse|extend|create|not_applicable|block`, затем пишет implementation plan, JSON task records `TASK-NNN-TN-FT-NNN-WN` и индекс `.memory-bank/tasks/index.json`. Feature остаётся composition root и ссылается на предметные specs без `FT-*` в именах. Для T2/T3 task card должна содержать purpose/outcome, direct task-relevant canonical spec links, grounded scope и verification path; если реализация требует угадывать API/state/schema/message/storage/domain/agent I/O/security contract, task record не создаётся до появления concrete block. Там же могут появиться behavior specs - маленькие JSON `given / when / then` примеры для неоднозначного поведения. Они помогают агенту понять ожидаемый результат, но не являются отдельным test runner, registry или обязательным verification gate.

Перед исполнением `/review-tasks-plan FT-<NNN>` независимо проверяет четыре стороны runnable plan: structural integrity task records, покрытие acceptance criteria/REQ и качество slicing, финальную design readiness, а также execution readiness зависимостей, tiers, single-card handoff и Foundation Gate. `/mb-doctor --strict` обязателен после `/foundation-to-tasks` перед исполнением `FT-000`; для product queue `/mb-doctor` запускают как readiness gate для T3, complex T2, dependency/stale-doc/risky-link cases и перед autonomous/autopilot handoff. Для простого ручного T0/T1 это не обязательный gate.

### 3. Имплементация кодовой базы

В ручном процессе агент выполняет одну indexed task через `/execute TASK-NNN-TN-FT-NNN-WN`. "Ручной" здесь значит не ручное написание кода, а ручной контроль агентов: явно выбирается task, проверяется scope, запускаются локальные gates, фиксируются evidence и следующий owner action. Для T0/T1 `/execute` может закрыть задачу compact evidence, если есть явный top-level closure owner и scope не вырос. Если реализация требует более высокого tier, `/execute` останавливает расширение scope и возвращает target task в `/prd-to-tasks FT-<NNN>` для controlled rebuild/split, после чего повторяются `/review-tasks-plan`, применимый doctor gate и `/execute` нового task ID. Для T2/T3 после реализации нужен `/verify`; для T3 дополнительно нужен `/red-verify`. Для завершения T2 feature нужен feature-level `/red-verify --feature FT-<NNN>`. `/mb-sync` выполняется на boundary, где надо согласовать RTM, индексы, lifecycle, changelog, specs или broader task state.

Когда JSON task queue уже создана, reviewed и проходит strict readiness checks, можно запускать `/autopilot`. Он не пишет PRD, не делает `/prd-to-tasks` и не придумывает task queue. Это scheduler/executor: берет существующие task records, последовательно переводит статусы, запускает `/execute`, `/verify`, T3 `/red-verify`, feature-level semantic checks и `/mb-sync` по tier policy. `/autopilot` обычно съедает заметно больше токенов, потому что работает через более чистые контексты, перечитывает task-linked specs/evidence и пытается самостоятельно довести все доступные задачи до terminal state.

После реализации кода можно усиливать тестовое покрытие. Внутри `/execute` агент запускает локальные project gates, если они есть. `/verify` независимо проверяет outcome выбранной task, только связанные с ней acceptance criteria/REQ, применимые SDD contracts и evidence; он не проверяет всю feature и не создает follow-up tasks. `/red-verify` ищет смысловые ошибки, которые могли пройти обычные проверки. Для отдельного улучшения покрытия используется `/add-tests`: команда добавляет unit/integration/e2e тесты там, где они реально ловят регрессии, обновляет `.memory-bank/testing/index.md` и записывает evidence. После добавления тестов нужно запускать реальные тестовые команды проекта и синхронизировать Memory Bank на boundary через `/mb-sync`.



## Короткая карта greenfield flow:

```text
/brainstorm or /brief
  -> /constitution
  -> /write-prd
  -> /spec-init
  -> /prd
  -> /review-feat-plan if high-risk/large
  -> /spec-design
  -> /foundation-to-tasks if required
  -> /mb-doctor --strict for the FT-000 queue
  -> close FT-000 foundation gate if it exists
  -> /prd-to-tasks FT-<NNN>
  -> /review-tasks-plan FT-<NNN>
  -> conditional /mb-doctor
  -> manual /execute loop or /autopilot
```

Та же greenfield-схема в виде Mermaid-карты вынесена отдельно: [GREENFIELD_WORKFLOW.md](GREENFIELD_WORKFLOW.md).



## 🛠️ Описание команд



### 1. Старт и формирование ТЗ

- `/cold-start` - выбирает стартовый сценарий после bootstrap: raw idea, clear concept, existing PRD, brownfield или skeleton-only.
- `/mb-init` - создает или синхронизирует skeleton Memory Bank, `.tasks/`, `.protocols/`, `AGENTS.md` и runtime scripts.
- `/mb` - праймит агента контекстом Memory Bank перед работой.
- `/brainstorm` - проводит ideation для сырой идеи и пишет compact brainstorming artifacts.
- `/brief` - создает Product Brief как вход для `/constitution` и `/write-prd`.
- `/constitution` - фиксирует governing principles, Definition of Done, autonomy rules и non-negotiables.
- `/write-prd` - превращает brief, PRD-like text или delta в clarified `.memory-bank/prd.md`.
- `/map-codebase` - для brownfield описывает существующий код как as-is baseline без roadmap planning.
- `/discuss` - проясняет неизвестные и противоречия перед тем, как продолжать planning или coding.

### 2. Спецификации и планирование

- `/spec-init` - готовит pre-PRD domain/scenario/boundary framing и чистый spec registry.
- `/prd` - декомпозирует clarified PRD в product, requirements, epics, features и testing index.
- `/review-feat-plan` - проверяет PRD -&gt; REQ/EP/FT decomposition перед `/spec-design`.
- `/spec-design` - обязательный global SDD backbone gate, генерация/обновление core SDD specs и решение по Foundation Dev Path.
- `/foundation-to-tasks` - применяет Architecture, Interfaces/Contracts и Data lenses только к baseline proof, создает нужные substrate specs и `FT-000` foundation JSON tasks либо фиксирует, что brownfield baseline уже доказан.
- `/clarify-feature FT-<NNN>` - снимает feature-level blockers перед task decomposition.
- `/spec-auto` - autonomous equivalent для SDD init/design, используется в unattended flows.
- `/prd-to-tasks FT-<NNN>` - выполняет registry-first discovery предметных canonical specs, переиспользует/расширяет существующие и создаёт только недостающие, затем формирует implementation plan, complete JSON task records и optional behavior specs; repair-режим сохраняет task identity, lifecycle и evidence, а для T2/T3 требует direct task-relevant spec links и complete single-card handoff.
- `/review-tasks-plan FT-<NNN>` - fresh-context gate одной feature перед `/execute` или scheduler mode: проверяет schema/index, acceptance/REQ coverage, slicing, design readiness и готовность dependencies/single-card handoff/foundation.

### 3. Реализация, проверки и синхронизация

- `/execute TASK-...` - реализует одну scoped task и пишет protocol/evidence/handoff.
- `/verify TASK-...` - независимо проверяет task-scoped outcome по mapped AC/REQ, applicable SDD contracts и evidence; возвращает PASS/FAIL/NEEDS-CLARIFICATION без создания новых tasks.
- `/red-verify TASK-...` - adversarial semantic verification для случаев, где формально passing решение может быть неверным по сути.
- `/add-tests` - добавляет полезные unit/integration/e2e тесты и evidence.
- `/mb-sync` - синхронизирует durable Memory Bank state на boundary после уже принятого closure/failure/blocking decision.
- `/mb-doctor` - deterministic readiness gate поверх `mb-lint`; обязателен для strict autonomous/autopilot handoff, conditional для complex manual work.
- `/mb-garden` - регулярное обслуживание Memory Bank: lint, cleanup, archive, drift repair.



## 🏗️ Автоматизация и tooling



- `/autopilot` - автономно исполняет уже готовую JSON task queue, но не создает PRD/features/tasks.
- `/autonomous` - полный unattended flow от PRD/brief/delta до сгенерированного кода.
- `/mb-harness` - помогает настроить чистые agent sessions, профили и deterministic gates.
- `/find-skills` - ищет релевантные skills сначала в проекте, затем в marketplace; не устанавливает без подтверждения.

Автоматические режимы стоит включать после того, как PRD, features и task records уже понятны. `/autopilot` работает по готовой JSON task queue, а `/autonomous` берет на себя более длинный unattended flow. Оба режима требуют complete T2/T3 task cards и зелёный `/mb-doctor --strict`.

##   
📚 Подробная механика работы фреймворка



Подробное описание установки, source-only packaging, структуры фреймворка, task model, tier policy, command reference и проверок находится в [howItWorks.md](howItWorks.md).

###  Основные папки фреймворка:

- `.memory-bank/` - знания и состояние проекта: продукт, требования, epics, features, архитектура, task records, индексы и правила работы.
- `.memory-bank/architecture/system-architecture.md#Architecture Spine` - короткие `AD-*` rules для shared-boundary, contract, state/data/runtime/security или strict pressure.
- `.memory-bank/spec-index.md` - registry предметных specs в формате `Type | Path | Status | Scope | Change route`; canonical identity задаётся path.
- `.memory-bank/contracts/`, `domains/`, `states/`, `testing/`, `runbooks/`, `guides/` - subject-based canonical specs, которые features и tasks связывают прямыми ссылками.
- `.memory-bank/contracts/boundary-map.md` - легкие responsibility/scope boundary notes, которые используются через существующие task поля и `runtime_context`.
- `.memory-bank/behavior-specs/` - optional JSON `given / when / then` примеры для важных или неоднозначных feature behaviors; tasks ссылаются на них только через `source_artifacts`.
- `.protocols/` - планы, прогресс и verification по конкретным задачам или features.
- `.tasks/` - runtime evidence, отчеты, handoff-файлы и материалы, которые помогают передавать работу между агентами.
- `.memory-bank/tasks/*.task.json` - task records. Это источник правды для задач.
- `.memory-bank/tasks/index.json` - индекс task records, по которому команды находят и планируют задачи.



## 🚀 Установка и запуск 



Скачайте этот репозиторий, перейдите в его папку и запустите скрипт автоустановки:

```bash
node scripts/install-framework.mjs
```

Интерактивный installer позволит выбрать нужную папку проекта из списка,

установит команды DevRails 26 и создаст или синхронизирует skeleton Memory Bank в

выбранном репозитории.

Если Memory Bank уже был развернут, installer обновит runtime command skills,

runtime scripts и может синхронизировать `AGENTS.md`.   


После bootstrap-установки используйте `/cold-start` или начните ручной цикл.

Если запускали только install-only и `.memory-bank/` еще нет, сначала выполните

`/mb-init`.
