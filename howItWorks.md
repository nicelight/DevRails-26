# Как работает DevRails 26

Этот документ — подробный справочник по текущим contracts DevRails 26:
архитектуре skills, установке, Memory Bank, Product/Design boundary, JSON task
model, reviews, readiness, tier routing и автоматическим режимам. Короткая
точка входа находится в [README.md](README.md).

## 1. Mental model

DevRails превращает агентную разработку из набора chat prompts в
repository-backed workflow:

```text
product intent
  -> clarified PRD
  -> requirements / epics / features
  -> global SDD backbone + Foundation decision
  -> feature-level canonical specs + JSON tasks
  -> implementation
  -> functional and semantic verification
  -> durable lifecycle state and evidence
```

В target-проекте агенты работают не от памяти одной сессии, а от пяти
связанных surfaces:

```text
.memory-bank/   durable product, design, task и lifecycle state
.agents/skills/ full Codex runtime command skills
.claude/skills/ full Claude runtime command skills
.protocols/     resumable task/run state
.tasks/         substantive evidence, reports и handoffs
```

Фреймворк следует KISS: создаётся минимальный набор artifacts и checks,
достаточный для текущего риска и contract. Это не разрешает пропускать
correctness, security, compatibility или обязательные verification gates.



### Свобода тактики

Внутри уже принятого objective, scope, specs, tier и hard boundaries агент сам
выбирает:

- порядок чтения и exploration;
- инструменты и форму временных notes;
- локальную implementation strategy;
- минимальную cohesive artifact shape;
- task slicing, когда skill владеет planning;
- самые дешёвые достаточные project-native checks;
- глубину анализа пропорционально реальному риску.

Architecture, Interfaces/Contracts, Data, Verification, security, runtime и
operations используются как coverage criteria, а не как обязательный порядок
мышления или требование создать файл каждого типа.

### Граница operator decisions

Material branch остаётся у оператора, если она может изменить product behavior,
scope/acceptance, architecture, public/component/API/event/data contract,
state/storage ownership, security/compliance, compatibility, Foundation path,
task boundary, tier, dependencies или verification policy.

В interactive flow skill задаёт адаптивный вопрос и может рекомендовать
вариант. Recommendation, framework default, reversible choice и молчание не
являются принятым решением. Уже однозначное authoritative evidence не требует
декоративного интервью.

В unattended flow агент не выбирает за оператора. Для feature-related semantic
finding `/feature-doctor` записывает рекомендуемый contract-correct вариант,
основание, последствия и work surface. Затем flow завершается через
существующий `HALT_CLARIFICATION_REQUIRED` или `HALT_BLOCKING_QUESTIONS` с
точным interactive resume skill.

## 2. Описание всех команд в проекте 

### 🧭 Старт и контекст

- `/start` — выбирает ближайший правильный путь;
- `/mb-init` — сообщает внешнюю команду установки или восстановления Memory
Bank, но сам файлы не создаёт;
- `/fill` — читает минимально необходимый контекст, ничего не меняя;
- `/context-manifest` — составляет список файлов для чтения в большом проекте;
- `/find-skills` — ищет дополнительные skills сначала в проекте, затем во
внешнем каталоге;
- `/creator-vibe` — keeps human outcomes and creative intent ahead of
overengineering;
- `/grill-me` — прогревает идею и сохраняет durable Product Brief;
- `/constitution` — записывает главные правила проекта;
- `/write-prd` — создаёт уточнённый PRD;
- `/discuss` — закрывает конкретные вопросы и противоречия;
- `/map-codebase` — описывает текущее состояние существующего кода;
- `/feature-doctor` — проверяет semantic basis проблемы одной feature,
  объясняет варианты и направляет repair владельцу.

### 🏛️ Проектирование и задачи

- `/spec-init` — подготавливает термины и контекст для разделения PRD;
- `/prd-to-features` — создаёт требования и функции продукта;
- `/review-feat-plan` — проверяет структуру продукта;
- `/spec-design` — создаёт общие технические решения;
- `/spec-auto` — выполняет проектирование в автоматическом режиме только из
уже принятых решений;
- `/foundation-to-tasks` — создаёт минимальные базовые задачи `FT-000`, когда
они нужны;
- `/feature-to-tasks` — создаёт техническое описание и задачи функции;
- `/review-tasks-plan` — проверяет готовность задач к выполнению;
- `/architecture-review` — проверяет архитектурные границы и зависимости;
- `/kiss-architect` — применяет правила Architect к текущему решению.
- `/technical-premortem` — по смыслу задачи проводит технический pre-mortem
запланированного изменения до реализации.

### ✅ Реализация, проверки и обслуживание

- `/exe` — выполняет одну выбранную задачу;
- `/add-tests` — добавляет достаточные тесты внутри выполняемой задачи;
- `/debug` — ищет причину сбоя и для подтверждённого повторения указывает
  prevention owner, но ничего не исправляет;
- `/verify` — независимо проверяет результат задачи и подтверждающие его данные;
- `/red-verify` — ищет скрытые смысловые и рискованные ошибки;
- `/mb-sync` — согласует уже принятые изменения между файлами Memory Bank;
- `/mb-garden` — исправляет однозначные механические ошибки в ссылках и
индексах;
- `/mb-doctor` — проверяет готовность проекта или очереди задач;
- `/tech-debt` — создаёт advisory-отчёт о техническом долге;
- `/autopilot` — выполняет готовую очередь продуктовых задач;
- `/autonomous` — управляет полным автоматическим процессом;
- `/multiagentic` — запускает `/autonomous` с одним read-only Judge;
- `/multipilot` — запускает только `/autopilot` с таким же Judge.

## 3. Package skills и runtime-skills

В source repo существуют два разных слоя.

### Package entrypoints

Tracked installable package entrypoints всего три:

- `skills/start/SKILL.md` — package/start и external-bootstrap routing
  surface;
- `skills/mb-init/SKILL.md` — external installer router для bootstrap или
  coherent framework sync;
- `skills/mb-garden/SKILL.md` — packaged lint/doctor assets.

Они нужны для source-only упаковки и не являются вторым набором runtime
workflow contracts.

### Canonical runtime commands

Текущие 37 runtime-skills определены в:

```text
skills/_shared/references/commands/*.md
```

Installer превращает каждый command spec в полноценные target files:

```text
.agents/skills/<command>/SKILL.md
.claude/skills/<command>/SKILL.md
```

Обе runtime copies содержат одинаковый полный command contract. Target
`.memory-bank/` хранит project state и не содержит `.memory-bank/commands/` или
proxy skills.

## 4. Роли агентов

Bootstrap разворачивает role contracts в `.memory-bank/roles/`; `AGENTS.md`
содержит общие правила работы агентов.

| Role | Назначение | Ограничение |
|---|---|---|
| `GENERAL` | самостоятельная top-level работа одним агентом | запускает subagents только по требованию active skill или оператора |
| `ORCHESTRATOR` | strategy, decomposition, delegation, risk control и final judgment | не выполняет executor work без явного разрешения |
| `ARCHITECT` | проектирование practical KISS architecture/specs с proposal-level cost/risk analysis | canonical changes выполняет через owning runtime skill |
| `Explorer` | bounded read-only discovery и optional `/context-manifest` routing | delegated read-only role, не принимает product/design decisions |
| `Implementer` | bounded implementation с preflight и evidence | останавливается при scope/spec conflict |
| `Reviewer` | independent read-only critique | не исправляет reviewed work |
| `Judge` | read-only оценка orchestration route для `/multiagentic` или `/multipilot` | не владеет artifacts, lifecycle, retries или terminal state |

Роль фиксируется при назначении и не меняется по ходу работы. Delegated agent
не становится `GENERAL` или `ORCHESTRATOR` автоматически. Lifecycle ownership
также не возникает только из факта delegation.

Harness сам не переключает агента в `ARCHITECT`. Текущий агент может применить
архитектурный preflight через `/kiss-architect`. `ORCHESTRATOR` может
делегировать `Architect`, явно потребовав прочитать
`.memory-bank/roles/architect.md`. При отдельном запуске оператор назначает
`ROLE: ARCHITECT`, после чего generated `AGENTS.md` направляет агента к тому же
контракту роли.

Перед включением finding, design element или correction в ответ либо canonical
artifact `Architect` выполняет proposal preflight по consequence surface.

`/context-manifest` нужен только когда broad discovery, вероятно, обойдётся
дороже direct reads. Delegated Explorer возвращает compact ordered
`Context Read Manifest` с существующими paths, ranges, anchors и gaps, но не
source summary и не durable artifact. Caller всё равно лично читает mandatory
sources и расширяет read set по новым links/evidence. Для obvious small read
set и простой T0/T1 работы direct reads обычно дешевле.

## 5. Source-only packaging

Единственный canonical shared source находится в `skills/_shared/`:

```text
skills/_shared/agents/*
skills/_shared/references/commands/*
skills/_shared/references/workflows/*
skills/_shared/references/protocols/*
skills/_shared/references/roles/*
skills/_shared/references/deployable/AGENTS.md
skills/_shared/references/structure-template.md
skills/_shared/scripts/init-mb.js
```

Package-local files вида
`skills/<skill>/{agents,references,scripts}/shared-*` намеренно не хранятся в
git. Нормальная установка выполняет:

```text
source-only repo
  -> temporary repository copy
  -> scripts/vendor-shared.mjs
  -> temporary package-local shared-* assets
  -> full runtime commands in target .agents/.claude
  -> optional Memory Bank bootstrap/sync
  -> temporary copy cleanup
```

Поэтому прямой `npx skills add <repo>` для framework не поддерживается. Он не
выполняет обязательную temporary vendoring/generation цепочку.

Правила изменения source repo:

- shared behavior меняется только в `skills/_shared/`;
- generated package-local `shared-*` нельзя редактировать или коммитить;
- локальные `.memory-bank/`, `.agents/`, `.claude/`, `.protocols/` и `.tasks/`
  в source repo являются ignored dogfood/runtime output, не canonical source.

## 6. Установка и bootstrap

### Интерактивный путь

Из checkout DevRails:

```bash
node scripts/install-framework.mjs
```

Installer:

1. предлагает выбрать или создать target directory;
2. проверяет writable state, git status, `.memory-bank/` и `AGENTS.md`;
3. показывает warnings и запрашивает confirmation;
4. при существующем `AGENTS.md` предлагает replace или merge policy;
5. готовит временную vendored copy source repo;
6. проверяет все выбранные runtime skill paths в `.agents/skills/` и
   `.claude/skills/` до первой записи;
7. генерирует все runtime command skills в `.agents/skills/` и
   `.claude/skills/`;
8. создаёт fresh Memory Bank или выполняет sync существующей установки;
9. удаляет temporary repo.

Preflight разрешает замену только пустого directory, DevRails-generated skill
directory или точного legacy generated proxy. Любой другой совпадающий
directory, включая непустой directory без `SKILL.md`, является blocker:
installer перечисляет все конфликты и останавливается до cleanup, записи
runtime skills и bootstrap. Оператор переименовывает или удаляет конфликтующие
skills и повторяет установку.

### Non-interactive bootstrap

```bash
node scripts/install-framework.mjs --bootstrap --target /path/to/project --yes
```

Существующий Memory Bank автоматически переводит flow в sync. Явный вариант:

```bash
node scripts/install-framework.mjs --bootstrap --target /path/to/project --yes --sync
```

### Install-only

Все runtime-skills в указанный target без Memory Bank bootstrap:

```bash
node scripts/install-framework.mjs --install-only --target /path/to/project --yes
```

Выборочная установка не поддерживается: любой install route разворачивает
полный canonical runtime command set в `.agents/skills/` и `.claude/skills/`.

Для inspection временно подготовленной package copy:

```bash
DEVRAILS_KEEP_INSTALL_TMP=1 node scripts/install-framework.mjs \
  --install-only --target /path/to/inspection-target --yes
```

После install-only, если `.memory-bank/` отсутствует, `/start` не создаёт
skeleton локально. Он возвращает через доступный checkout DevRails full
bootstrap route, который устанавливает или обновляет полный runtime command set
и создаёт skeleton:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --target <target-repo> --yes
```

`/mb-init` сохраняет skeleton-only route и не устанавливает runtime commands:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --target <target-repo> --yes
```

После такого bootstrap `/mb-init` передаёт управление в `/start` только
если skill установлен в активной runtime surface; иначе он подтверждает готовый
skeleton и останавливается, не заявляя отсутствующую команду как доступную.

Для coherent framework sync существующего target используется полный route:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --sync --target <target-repo> --yes
```

Он обновляет runtime command skills и framework-owned Memory Bank assets из
одной prepared source copy. `--bootstrap-only --sync` остаётся repair route
только для Memory Bank managed assets и не обновляет commands. Неизвестный
checkout path является честным blocker; после успешного bootstrap исходную
команду запускают повторно.

Whole-file framework ownership задаётся только явными generator call sites:
task schema, copied canonical workflows/roles/protocol templates, runtime
scripts и другие canonical copied assets. Inline skeleton docs, project state
и mixed routers после создания сохраняются. `contracts/boundary-map.md` создаётся
только при отсутствии; installer sync не заменяет и не переименовывает
проектный граф. Version-critical framework contract нельзя размещать только в
seed-once файле. Installer sync не является runtime `/mb-sync` и не меняет task
lifecycle, gates или handoffs.

У `.memory-bank/skills/index.md` только paired-marker block `## Installed`
является generator-managed: bootstrap строит его из фактических
`.agents/skills/*/SKILL.md` и `.claude/skills/*/SKILL.md`, а sync обновляет этот
block, сохраняя authored guidance. Exact legacy baseline мигрируется;
неразмеченный или неоднозначный block остаётся нетронутым с warning.

Итоговый installer report группирует фактические
`created|updated|unchanged|kept` actions по ownership и не считает identical
framework asset обновлённым.

## 7. Fresh bootstrap state

Fresh bootstrap создаёт skeleton, но не roadmap. Основные artifacts:

```text
.memory-bank/
  adrs/
  agents/
  architecture/system-architecture.md
  archive/
  behavior-specs/
  bugs/
  constitution.md
  contracts/boundary-map.md
  domains/
  epics/
  features/
  glossary.md
  guides/
  invariants.md
  mbb/index.md
  product.md
  quality/
  requirements.md
  roles/{architect,explorer,general,implementer,orchestrator,reviewer}.md
  runbooks/
  schemas/task.schema.json
  skills/index.md
  spec-backbone.md
  spec-index.md
  states/
  tasks/index.json
  tasks/plans/
  templates/protocols/*.md
  testing/index.md
  testing/strategy.md
  workflows/{index,autonomy-policy,execute-loop,mb-sync,tier-policy}.md
  changelog.md
.protocols/
.tasks/
PAPERCUTS/
  TECHDEBTS/
.agents/skills/<command>/SKILL.md
.claude/skills/<command>/SKILL.md
.memory-bank/scripts/mb-lint.mjs
.memory-bank/scripts/mb-doctor.mjs
AGENTS.md
CLAUDE.md
GEMINI.md
```

`PAPERCUTS/` хранит только случайно замеченные мелкие проблемы кода,
архитектуры или структуры проекта; агент не ищет их специально.

Fresh `.memory-bank/tasks/index.json` содержит только:

```json
{
  "version": 1,
  "tasks": []
}
```

Bootstrap не создаёт `.memory-bank/foundation.md`, `REQ-000`, `FT-000`,
product features, implementation plans или runnable `TASK-*.task.json`.
`.memory-bank/tech-specs/` также не создаётся.

В fresh target `testing/index.md` является router, а зарегистрированный
`testing/strategy.md` задаёт компактную baseline risk-based policy. Sync
legacy target не seed-ит новый `testing/strategy.md` и не переписывает
существующую testing policy/spec registry без явного project-level решения.

## 8. Канонический Product/Design flow

### Greenfield

```text
raw idea -------------> /grill-me
clear concept ---------> /grill-me
existing PRD ----------> /write-prd

/grill-me
  -> /constitution when principles are not ratified|partial
  -> /write-prd
  -> /spec-init
  -> /prd-to-features
  -> /review-feat-plan when high-risk|large|autonomous
  -> /spec-design
  -> Foundation route
  -> feature tasking route
```

Stages do not own each other's outputs:

1. `/grill-me` explores and stress-tests the idea, then owns the concise
   durable Product Brief and analysis index. It does not promote the brief to
   requirements.
2. `/constitution` owns governing principles, Definition of Done, autonomy,
   checkpoints и non-negotiables. An explicit skip may continue as
   `framework-default|skipped`; silence is not a skip.
3. `/write-prd` owns product-level clarification. Handoff requires
   `type: prd`, `clarification_status: complete` и
   `constitution_checked: true`.

`/grill-me` and `/write-prd` load the installed `creator-vibe` skill before
interpreting idea sources or operator answers; the lens preserves intent but
never supplies an accepted decision or requirement.

4. `/spec-init` first verifies and reconciles the project glossary, creating it
   when missing or placeholder-only. It then owns decomposition-safety framing,
   not architecture, and writes `Pre-PRD Spec Status: ready_for_prd|blocked` in
   `spec-backbone.md`.
5. `/prd-to-features` owns L1-L3 product decomposition: product, stable `REQ-*`, epics и
   product `FT-*`. It does not create task records or testing policy.
6. `/review-feat-plan` independently checks PRD -> REQ -> EP -> FT. It is
   required for high-risk, large и autonomous work and recommended for small
   manual work.
7. `/spec-design` creates the initial global SDD backbone and Foundation Dev
   Path decision. Later accepted backbone/contract changes use `/spec-redesign`.

### Brownfield

```text
/map-codebase
  -> reuse supplied authoritative PRD/delta, иначе запросить его и остановиться
  -> /constitution if needed
  -> /write-prd --delta
  -> /spec-init
  -> /prd-to-features
  -> applicable /review-feat-plan
  -> /spec-design
```

`/map-codebase` creates an as-is baseline from code/config/tests, separates
facts from inferences and does not generate roadmap entities without PRD/delta.
Малый repository можно исследовать direct reads одним агентом. Для широкого
discovery допустимы `/context-manifest` или bounded delegation, только если это
дешевле direct reads и разрешено ролью/оператором. Уже переданный delta не
переспрашивается.

When existing executable baseline sufficiency is not proved,
`/foundation-to-tasks --verify-existing` can create only the minimum probe
queue. A credibly proven baseline produces no `FT-000` queue.

### Product/Design boundary

Product task handoff разрешён только когда весь durable bundle согласован:

- clarified, Constitution-checked `.memory-bank/prd.md`;
- product, requirements, epics и product features;
- `Global Backbone Status: complete` или valid `minimal`;
- pure canonical `.memory-bank/spec-index.md`;
- explicit Foundation Dev Path decision;
- все material operator decisions записаны в существующих owning artifacts;
- required Foundation final gate закрыт.

`blocked` status или unanswered material branch запрещает task generation.

## 9. SDD backbone и canonical specs

### `spec-backbone.md`

`/spec-init` сначала использует файл как pre-PRD route/state map. После `/prd-to-features`
`/spec-design` добавляет parseable global contract:

```text
Global Backbone Status: complete | minimal | blocked
Planning Revision: 0 | positive integer
Mode: local_simple_backbone | standard_architecture_scaffold |
      strict_architecture_scaffold | pending
Architecture artifact strategy: single-file | split-core-docs |
                                split-by-boundary-topic | pending
```

`Planning Revision: 0` означает, что successful global backbone ещё не создан.
Первый successful `/spec-design` устанавливает `1`. После этого
`/spec-redesign` увеличивает revision только при доказанном изменении durable
planning semantics с product-wide impact. Bounded change сохраняет revision и
перепланирует только затронутые features. Task statuses и completed evidence
не меняются; affected features проходят tasking и review последовательно, по
одной feature на fresh context.

Backbone Area Matrix использует только:

- `authoritative`;
- `needed_before_tasks`;
- `not_applicable` с rationale;
- `blocked`.

`needed_before_tasks` допустим только для уже однозначно routed concrete detail.
Он не заменяет нерешённое design decision и должен быть закрыт до успешного
product task handoff.

`minimal` допустим только для доказанно local/simple pressure и требует
явных `not_applicable - <rationale>` entries. Shared boundary, contracts,
state/data, runtime, security, production-sensitive или irreversible pressure
обычно требует `complete` scaffold.

### Preferred architecture для application greenfield

Если `architecture_style` ещё не принят, проект является application-shaped
greenfield и concrete evidence не указывает на другой trade-off, `/spec-design`
первым рекомендует один deployable modular monolith с capability/vertical
slices, одной runtime-композицией, узкими module contracts и явным write
ownership. Recommendation задаёт порядок предложения, но не authority:
interactive flow подтверждает style и coherent initial slice map одним focused
decision, а unattended flow продолжает только по уже принятой policy и
материально однозначному evidence. Явно принятая альтернатива всегда имеет
приоритет.

Library/package, CLI, firmware, pipeline, plugin/protocol system, устойчивый
brownfield и независимо развёртываемые services используют свою естественную
primary change unit. Гипотетические future scale или reuse сами по себе не
оправдывают отклонение или распределённую сложность.

Для принятого capability-sliced target существующие
`architecture/system-architecture.md`, Boundary Map и subject specs вместе
фиксируют один deployable/composition root и эквивалент следующих фактов для
каждого значимого slice: code roots, owns, must-not-own, public boundary,
allowed dependencies, semantic/write ownership и credible proof path. Exact
таблица или heading не обязательны; маленькое приложение может иметь один
cohesive slice. Slice выражает законченную user/operator capability: один
feature не превращается автоматически в slice, а один slice может обслуживать
несколько features. Shared code, event bus, mediator и DI/plugin machinery
появляются только при текущей доказанной необходимости. Новый slice registry и
per-file ownership не создаются. Общая БД не означает shared business
ownership: каждый mutable invariant/transition сохраняет одного write owner.

### Canonical dependency graph

`.memory-bank/contracts/boundary-map.md` — единственный подробный inventory
принятых modules/change units и разрешённых зависимостей между ними. Узел имеет
уникальное функциональное имя, parent architecture-unit link, меняемый `Code
Root` и responsibility. Ребро `Consumer -> Provider` существует только через
точную ссылку на inline или subject-contract heading; отсутствующее ребро не
даёт execution-агенту права изобрести взаимодействие.

`system-architecture.md` хранит более крупные deployable/capability/runtime
units и ссылается на graph inventory. `/spec-design` создаёт начальную
архитектуру, `/spec-redesign` меняет уже принятую, а `/feature-to-tasks`
конкретизирует leaf modules/edges внутри принятой формы, прослеживает reverse
impact по consumers и сохраняет в plan/task только релевантные graph/contract
links. Архитектурный graph не превращается
механически в task DAG: `depends_on` и waves выражают реальный порядок
implementation, compatibility и rollout.

Новый leaf module, edge или consumer неизменного contract не меняет Planning
Revision. Если новый consumer делает ещё не выполненную incompatible provider
task локально устаревшей, `/exe` возвращает только её feature в
`/feature-to-tasks -> /review-tasks-plan`; approvals других features остаются
действующими. Только доказанное product-wide изменение через `/spec-redesign`
увеличивает Planning Revision; features обрабатываются последовательно.

`AD-* Verification` называет project-native mechanical check только для
повторяемого, high-blast/security-sensitive или дешёво однозначного нарушения.
Несуществующая команда не становится gate. Для подтверждённого runtime/state
risk owning verification spec может дополнительно фиксировать initial state,
safe rerun, observable result и cleanup/isolation; simple/stateless flow этого
процесса не получает.

### `spec-index.md`

Это pure registry:

```text
Type | Path | Status | Scope | Change route
```

Он не хранит decision bodies, matrices, feature status map, ownership или
reverse `used_by`. Canonical identity определяется зарегистрированным
subject-based path. Перед созданием нового spec skills обязаны найти соседние и
registered specs; два competing paths нельзя обходить созданием третьего.

### Subject-based paths

Новые canonical specs живут по предмету, а не по feature ID:

```text
.memory-bank/architecture/*
.memory-bank/contracts/*
.memory-bank/domains/*
.memory-bank/states/*
.memory-bank/testing/*
.memory-bank/runbooks/*
.memory-bank/guides/*
.memory-bank/adrs/*
```

Feature остаётся composition root для behavior, acceptance criteria и exact
applicable spec links. Legacy `.memory-bank/tech-specs/FT-*.md` можно читать как
brownfield evidence, но нельзя расширять как default T2/T3 hub.

Критерии готовности функции получают постоянные идентификаторы
`FT-<NNN>-AC-<NNN>`. Идентификатор сохраняется, пока не изменилось само
ожидаемое поведение. Каждый критерий связан с требованием `REQ-*`, а задача
ссылается на точный раздел вида `features/FT-*.md#FT-*-AC-*` через существующее
поле `source_artifacts`. Отдельный реестр или новое поле задачи для этого не
нужны.

### Acceptance Closure для существенных outcomes

Если наблюдаемый edge/failure outcome или нефункциональное качество способны
сами по себе сорвать приёмку либо реализовать существенный принятый риск,
DevRails замыкает цепочку:

```text
material outcome -> accepted REQ/AC или authoritative exclusion
                 -> exact task mapping -> planned proof -> evidence
```

Material edge/failure в feature ссылается на покрывающий AC. Реально
out-of-scope outcome вместо этого хранит authoritative disposition, source и
`/write-prd` change route. Для material NFR `requirements.md` хранит
наблюдаемое качество, принятый target или качественный критерий и общие условия,
меняющие pass/fail; feature AC применяет их к конкретному outcome и называет
verification method. Недостающий target агент не придумывает: это blocker
`/write-prd`.

Простой probe/review остаётся в AC и task record. Subject spec появляется
только для нетривиальной воспроизводимой методики — dataset/state,
статистического окна, environment/warm-up, isolation/cleanup, общей процедуры
или formal expert rubric — и не становится владельцем product target. Task,
доказывающая material NFR, при любом tier получает exact AC/REQ mapping,
`verification_targets` и `evidence_required`. Human/expert review является
evidence method.

Это условный semantic invariant существующих reviews. Он не добавляет `NFR-*`,
registry, schema field, lifecycle, gate или heuristic `/mb-doctor` parser.

### Architecture Spine

Shared/strict executable decisions получают стабильные `AD-*` anchors внутри
`.memory-bank/architecture/system-architecture.md#Architecture Spine`:

```text
AD-NNN
  Binds
  Prevents
  Rule
  Verification
  Source
```

AD создаётся только для реального shared/strict rule. Detailed rationale
выносится в ADR, только если оно имеет durable value. Локальная простая работа
не требует обязательных ADR или отдельного architecture workflow.

### Contracts, Data и Verification

- Data Contract описывает payload, пересекающий component/API/event/protocol
  boundary.
- Data Specification описывает internal models, DB/storage, persistence,
  migrations, validation и serialization.
- Verification concern маршрутизируется в owning contract, testing spec или
  runbook, а не превращается в обязательный global testing row.
- Bootstrap-owned testing policy read-only для `/spec-design`; project-specific
  design расширяется только через свой owning route.

### Optional behavior specs

`/feature-to-tasks` может создать 0-3 коротких JSON examples:

```text
.memory-bank/behavior-specs/FT-NNN-BHV-NNN-<slug>.behavior.json
```

Они используют только `id`, `feature_id`, `title`, `given`, `when`, `then`.
Feature ссылается на них в `## Behavior specs`, task — только через
`source_artifacts`. Это не registry, schema, test runner, readiness gate,
verification target или done criterion.

## 10. Foundation Dev Path

`/spec-design` фиксирует одно из трёх состояний:

- `Foundation Required: true` — до product tasks нужен executable walking
  skeleton или compatibility proof;
- `Foundation Required: false` — existing baseline/project simplicity уже
  доказаны;
- blocked Foundation decision — material branch возвращается оператору.

При `true` `/foundation-to-tasks`:

1. выбирает минимальный walking skeleton и proof path;
2. создаёт только нужные substrate-level canonical specs;
3. добавляет reserved `REQ-000`;
4. создаёт pseudo-feature `FT-000`;
5. создаёт normal schema-backed foundation task records;
6. создаёт ровно один final Foundation Gate task, зависящий от всех required
   implementation/probe tasks;
7. записывает concrete gate ID в `.memory-bank/foundation.md`.

Foundation использует обычные JSON tasks, lifecycle, tiers и protocols. Для неё
нет отдельной schema, registry или status machine. `W0` разрешён только для
`FT-000`; product tasks используют `W1+` и зависят от final gate напрямую или
transitively.

Если accepted target определяет capability slices, Foundation применяет его
composition root и создаёт только slice roots, необходимые walking skeleton.
Она не строит layer-centric scaffold, пустые будущие slices, product behavior
или speculative shared abstractions. Foundation tasks получают применимые
architecture/boundary specs через существующие direct link fields.

Перед выполнением FT-000 queue обязателен `/mb-doctor --strict`. Product
tasking продолжается только после `done` final gate. `FT-000` не участвует в
T2 product feature-completion semantics.

## 11. Feature design и JSON task planning

После ready global backbone и Foundation route:

```text
/feature-to-tasks FT-<NNN>
  -> /review-tasks-plan FT-<NNN>
  -> conditional /mb-doctor
  -> /exe <TASK_ID> или /autopilot
```

`/feature-to-tasks` всегда работает только с одной явной feature в отдельной
fresh session. Multi-feature flow завершает её durable handoff и review до
запуска нового изолированного контекста для следующей feature.

`/feature-doctor FT-<NNN>` принимает feature-related finding от planning или
verification, проверяет его основание и определяет canonical repair owner. В
manual flow он показывает только допустимые варианты, их основание,
последствия и work surface; unattended flow рекомендует минимальный
contract-correct вариант, но не принимает его за оператора. Doctor может
обновить feature wording и отметить design impact, но не создаёт specs,
implementation plan, tiers или tasks.

`/feature-to-tasks` для каждого applicable concern выбирает ровно один результат:

```text
reuse | extend | create | not_applicable | block
```

Затем он создаёт или reconciles:

- `.protocols/FT-<NNN>/plan.md` и `decision-log.md`;
- `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`;
- subject-based canonical specs и feature links;
- optional behavior examples;
- indexed `.memory-bank/tasks/TASK-*.task.json` records.

Task slicing строится вокруг cohesive independently verifiable outcomes, а не
вокруг файлов, слоёв, modules или отдельной «task на tests».

#### Почему task slicing проверяет execution cohesion

Ранее общий product outcome, capability owner или tier могли ошибочно
приниматься за атомарность исполнения. Это приводило к oversized tasks, а
линейный review подтверждал полноту карточки, не замечая независимые units
реализации и проверки.

Теперь exact claims и canonical semantic owners используются как split signals,
а окончательная граница определяется execution cohesion. Material work
разделяется, если её часть можно независимо реализовать и доказать до полезного
completion state либо у неё есть собственная grounded
failure/retry/rollout/rollback boundary. Reviewer независимо пытается
опровергнуть cohesion; exact claim ownership сохраняется, а dependency proof не
наследуется downstream task.

Feature, slice и task остаются разными сущностями. Для принятой module/slice
architecture implementation plan называет primary owning slice/module и code
root, а task card переносит применимые architecture/boundary links,
ownership/bypass constraints, expected advisory change surface и proof path
через существующие поля. Cohesive cross-slice task допустима с одним явным
owning capability slice. Business orchestration не размещается в HTTP/UI/bot
handler, generic util/shared helper или composition root; task planning не
создаёт новый orchestration slice, если accepted architecture не назвала
подходящего owner. Поле `owning_slice` не добавляется, а slice code root не
копируется автоматически в hard `write_boundary`.

Применимый существующий architecture check доходит до task через обычные
`gates` или `verification_targets`. Если accepted rule требует ещё не созданный
check, task planning учитывает его как текущую работу, но не публикует
несуществующую command. То же правило действует для task-scoped reproducible
runtime proof.

### JSON-only registry

Единственный durable task model:

```text
.memory-bank/tasks/index.json
.memory-bank/tasks/TASK-NNN-TN-FT-NNN-WN.task.json
.memory-bank/schemas/task.schema.json
```

Concrete ID segments обязаны совпадать с record fields `tier`, `feature` и
`wave`. Lifecycle фиксирован:

```text
planned | ready | in_progress | blocked | done | done_for_prod | failed
```

`ready` допустим только при закрытых dependencies и отсутствии blocker.
`planned` остаётся корректным для future waves или unmet dependencies. Legacy
`risk`/`risk.level` не используются; routing идёт только по `task.tier`.
`done_for_prod` означает, что разработка завершена, а production acceptance
остаётся для явного запуска после deployment.

Schema-valid пример:

```json
{
  "id": "TASK-001-T2-FT-001-W1",
  "title": "Implement the accepted boundary behavior",
  "status": "ready",
  "wave": "W1",
  "feature": "FT-001",
  "reqs": ["REQ-001"],
  "depends_on": [],
  "touched_files": ["src/component/", "tests/component/"],
  "tier": "T2",
  "gates": [
    {
      "name": "component tests",
      "command": "npm test -- component",
      "required": true
    }
  ],
  "verify": [],
  "docs": [],
  "evidence_required": [],
  "purpose": "Apply the accepted component boundary contract.",
  "success_outcome": "The boundary behavior is observable and verified.",
  "anti_goals": [],
  "runtime_context": {
    "write_boundary": ["src/component/", "tests/component/"],
    "forbidden_scope": ["deploy/"],
    "stop_conditions": ["A public contract change becomes necessary."]
  },
  "source_artifacts": [
    ".memory-bank/contracts/component-boundary.md"
  ],
  "normative_inputs": [],
  "constraints": [],
  "invariants": [],
  "verification_targets": [
    "The accepted request and error shapes pass contract tests."
  ]
}
```

### Single-card handoff для T2/T3

До execution T2/T3 record обязан содержать:

- non-empty `purpose`;
- scalar `success_outcome`;
- concrete `REQ-*` и `FT-*` linkage;
- direct task-relevant canonical SDD path;
- expected change surface в advisory `touched_files` и/или обоснованный hard
  `runtime_context.write_boundary`;
- real gate command и/или non-empty verification target;
- valid dependency graph.

Feature links или `spec-index.md` сами по себе не заменяют direct task context.
Linked concrete spec должен задавать shape, `MUST`/`MUST NOT`, edge
cases/errors и verification target, применимые именно к task.

`touched_files` не является write allow-list. Исполнитель подтверждает actual
files на preflight и может добавить файл для того же outcome/spec/tier.
Непустой `write_boundary`, `forbidden_scope` и `stop_conditions` являются hard.
`allowed_write_scope` поддерживается только как deprecated read alias и не
эмитится в новых cards.

Boundary entries — literal project-root-relative POSIX paths, не globs. Один
trailing `/` игнорируется; entry покрывает сам path и его lexical subtree по
segment-prefix rule. Поэтому `src` включает `src/a.js`, а `src/a` не включает
`src/ab`. Exact grammar и обязательные workflow-evidence exceptions определены
в `.memory-bank/workflows/tier-policy.md`; empty/omitted boundary не создаёт
path allow-list.

### Reconciliation

Повторный `/feature-to-tasks` по умолчанию согласует existing specs, plan и cards,
сохраняя task identity, tier, wave, dependencies, lifecycle и verification
evidence. Изменение identity, tier, dependency, AC или material scope требует
явного `rebuild_required`, а не скрытого repair.

## 12. Review, lint, doctor и verification ownership

Эти gates не взаимозаменяемы:

| Gate | Проверяет | Не делает |
|---|---|---|
| `/review-feat-plan` | PRD -> REQ -> EP -> FT traceability и boundaries | не ревьюит JSON task queue |
| `/review-tasks-plan` | schema/coverage/slicing/design/execution readiness одной feature | не исправляет planning surface и не меняет lifecycle |
| `/architecture-review` | bounded C4 L1-L3, architecture support, boundaries и invariants | возвращает Reviewer verdict, но не владеет итоговым `APPROVE|REJECT` |
| `mb-lint` | structural/mechanical Memory Bank consistency | не оценивает tier/status-dependent protocol, closure evidence или lifecycle eligibility |
| `/mb-doctor` | deterministic executable-readiness поверх lint, включая protocol/evidence consistency | не заменяет reviews/verification и не меняет task status |
| `/verify` | task-scoped functional outcome, applicable linked architecture path и evidence | не проверяет всю feature, не чинит implementation/specs |
| `/red-verify` | adversarial semantic correctness | не заменяет functional PASS и не закрывает scheduler task |

`/review-feat-plan` и `/review-tasks-plan FT-<NNN>` требуют fresh context или
отдельную fresh session и возвращают findings, а не silently repair.

`/review-feat-plan`, `/review-tasks-plan`, `/verify` и `/red-verify` перед
verdict устанавливают два разных co-review focuses; на bounded rerun
неизменные focuses/evidence можно сохранить, остальные обновляются через
`Codex Luna xhigh`. Основной агент распоряжается findings.

`/verify` также один раз best-effort запускает отдельного read-only code
co-reviewer через `Codex Luna xhigh` по фактическому change surface. Он
возвращает только candidate findings; отсутствие запуска не блокирует
verification и не меняет ownership verdict.

`/review-tasks-plan` запускает fresh Reviewer с `/architecture-review` только
если текущее accepted evidence оставляет material uncertainty в ownership,
dependencies или boundaries, способную изменить verdict. Иначе фиксируется
`ARCHITECTURE_REVIEW: not_required`; retained architecture evidence не является
текущим verdict. Основной reviewer сохраняет ownership финального verdict, а
при недоступной делегации выполняет ту же architecture review локально.

### Technical pre-mortem

`/technical-premortem` — самостоятельный skill для анализа запланированного
технического изменения до реализации. Он представляет изменение уже
провалившимся, работает назад от наблюдаемого симптома к механизму и blast
radius, затем отделяет evidence-backed Tiger от доказательно пониженного Paper
Tiger и decision-relevant Elephant. Категории и число findings не заполняются
искусственно. Результат включает recovery route, проверяемый pre-flight и
verdict `GO | GO_WITH_CONDITIONS | NO_GO`.

Skill не встроен в обязательную workflow-цепочку и не меняет task lifecycle,
statuses или ownership. В manual flow `/review-tasks-plan` рекомендует его после
принятого плана только для task с evidenced material exposure; после `/debug`
он является следующим advisory handoff только для уже сформулированной
нетривиальной или multi-surface correction внутри принятой task boundary.
Scheduler retry и failure disposition его не используют.

### Doctor modes

```bash
node .memory-bank/scripts/mb-doctor.mjs
node .memory-bank/scripts/mb-doctor.mjs --strict
node .memory-bank/scripts/mb-doctor.mjs --json
node .memory-bank/scripts/mb-doctor.mjs --strict --json
```

- Default mode — human health report. Fresh skeleton с empty task index valid;
  `TASK_INDEX_EMPTY` является info.
- Strict mode — non-empty executable queue readiness gate. Empty queue — error.
- JSON mode сохраняет machine-readable `status`, `summary`, `findings`.

Strict doctor обязателен:

- после `/foundation-to-tasks` перед FT-000 execution;
- перед `/autopilot` и scheduler phase `/autonomous`;
- перед scheduler task selection;
- после wave-boundary `/mb-sync` перед promotion;
- перед final scheduler success.

Resume также начинает со strict doctor. Если единственные failing findings
являются durable следствием точно установленной unfinished checkpoint action,
scheduler может выполнить только её recovery route и обязан снова получить
strict PASS до promotion, selection или terminal success.

В manual flow doctor conditional: T3, complex T2, Foundation, dependency,
stale-doc, risky-link или autonomous handoff. Простая local T0/T1 работа не
получает mandatory doctor gate по умолчанию.

Doctor механически проверяет single-card completeness, tier-appropriate
protocol и terminal evidence с предусмотренной default/strict severity. Он не
решает, действительно ли spec применим и достаточен, и не принимает lifecycle
decision. Semantic applicability принадлежит `/review-tasks-plan`, а переход
status — scheduler или explicit manual owner.

`/mb-garden` начинает с read-only scan и classification. Он автоматически
меняет только однозначные mechanical links, indexes и routers в заранее
названных transient paths; список можно расширить, назвав path до его edit.
После фактических edits обязателен final `mb-lint`. Semantic, destructive и
canonical choices возвращаются owner/operator. Cosmetic cleanup не запускает
`/mb-sync`; broader reconciliation уже принятого durable decision получает
отдельный handoff существующему `/mb-sync`.

## 13. Execution protocols и lifecycle ownership

### Protocol depth

T0/T1 могут использовать compact:

```text
.protocols/<TASK_ID>/run.md
```

Compact сокращает protocol depth, но не отменяет task-scoped acceptance
evidence: заполненные `verification_targets` и `evidence_required` должны быть
доказаны до closure.

T2/T3 требуют full protocol:

```text
.protocols/<TASK_ID>/context.md
.protocols/<TASK_ID>/plan.md
.protocols/<TASK_ID>/progress.md
.protocols/<TASK_ID>/verification.md
.protocols/<TASK_ID>/handoff.md
```

T3 дополнительно использует `red-verification.md`. Substantive logs, reports и
artifacts записываются в `.tasks/<TASK_ID>/`.

Canonical shapes разворачиваются в
`.memory-bank/templates/protocols/*.md`. Runtime skill читает только шаблон,
нужный для создания отсутствующего protocol file. Уже заполненные
`.protocols/<TASK_ID>/` являются task-owned resume state и не перезаписываются
при framework sync; command и tier policy остаются lifecycle authority. Runtime
`/mb-sync` не редактирует и не добавляет project router для template leaf.

`/add-tests` работает только внутри существующей indexed task со статусом
`in_progress`. Он выбирает narrowest credible test level, не создаёт synthetic
testing task и не меняет `.memory-bank/testing/`.

### RED → GREEN для задач T2/T3

Новая или перепланированная задача `T2/T3` заранее связывает конкретное
требование с проверкой. Для этого используются уже существующие поля
`verification_targets` и `evidence_required`, поэтому новый этап или новое поле
задачи не появляются.

Каждый claim доказывает только owning task. `depends_on` передаёт downstream
task подтверждённое предусловие, но не AC, probes и evidence dependency.
Downstream доказывает свой outcome и integration delta. Regression checks
остаются его gates и не переносят ownership upstream claim.

В плане записываются ожидаемые результаты:

- `RED` — до изменения кода проверка показывает, что нужного поведения ещё нет;
- `GREEN` — после изменения та же проверка подтверждает это поведение.

Одна проверка может подтверждать несколько требований, только если в плане явно
перечислены все связи. Если получить осмысленный `RED` невозможно, план
фиксирует конкретную причину и другой способ проверки. Уровень риска, удобство
или отсутствие готового тестового стенда сами по себе такой причиной не
считаются. `/review-tasks-plan` проверяет, что этот путь описан честно.

Для критерия готовности функции его точный ID повторяется в
`verification_targets` и `evidence_required`. `/mb-doctor` проверяет цепочку
`REQ -> AC -> task -> proof`, а `/verify` оценивает, действительно ли
приведённые данные подтверждают нужное поведение.

Перед изменением кода `/exe` переводит задачу в `in_progress` и получает
настоящий `RED`. Ошибка импорта, синтаксиса, настройки или намеренно сломанный
тест не считается `RED`. После реализации тот же проверяемый результат должен
дать `GREEN`.

При повторной попытке исходный `RED` сохраняется, если он был. Новая попытка
ссылается на проваленную проверку и сделанное исправление, получает свежий
`GREEN` и повторяет все обязательные проверки.

Если проверка проходит ещё до изменения кода, это предварительный `GREEN`.
Агент сохраняет его и не меняет рабочий код только ради искусственного `RED`.
При этом `/exe` всё равно завершает оставшуюся часть задачи и передаёт её в
`/verify`. Результаты хранятся в обычных `progress.md`, каталоге
`.tasks/<TASK_ID>/` и `handoff.md`.

Для `T3` проверки выполняются только в уже разрешённой изолированной или
одноразовой среде, которую можно безопасно очистить и запустить повторно. Это
правило не даёт разрешения писать в рабочую систему, выполнять необратимые
действия или ослаблять защиту.

`/verify` независимо подтверждает итог задачи. `RED`, `GREEN`,
предварительный `GREEN` и принятая замена неприменимого `RED` являются только
дополнительными данными. Они не заменяют собственную проверку `/verify` и сами
по себе не определяют результат. Если надёжных данных недостаточно, `/verify`
выполняет минимальную безопасную проверку или возвращает
`NEEDS-CLARIFICATION`. Если принятое требование действительно нарушено, он
возвращает `FAIL`. Feature-related semantic blocker или violation после этого
проходит `/feature-doctor`, который повторно проверяет его governing basis и
выбирает repair owner; functional verdict при этом не переписывается.

Для старых задач со статусом `in_progress`, `done` или `failed` придумывать
`RED` задним числом не нужно. Для планировщика весь путь по-прежнему остаётся
одним этапом выполнения, а `/red-verify` сохраняет свою отдельную смысловую
проверку.

### Receipt-aware reuse между `/exe` и `/verify`

`/exe` может предложить результат хорошо известного local deterministic
gate как optional `reuse candidate`. Receipt остаётся self-attestation
исполнителя: он сообщает attempt/status, claim, command/cwd/exit code, declared
pre-command input state, completed time и redacted observable evidence, но не
доказывает независимо, что snapshot и command выполнялись именно в заявленном
порядке.

Reuse разрешён только при консервативно ограниченном command read surface и
совпадении current relevant source/config/dependency/generated/runtime state.
Implicit, broad, incomplete, flaky, external-state-dependent, input-mutating
или stale evidence не переиспользуется. Отсутствующий или непригодный receipt
ведёт к safe rerun или replacement probe; это не `NEEDS-CLARIFICATION`, пока
обязательные implementation и normative inputs доступны.

Receipt хранится в существующем task protocol и не создаёт task field,
registry, cache, status или отдельную artifact family. Current handoff указывает
актуальный receipt; evidence прежней retry attempt становится superseded или
supporting-only. `/add-tests` сам reusable receipt не создаёт: после всех
изменений candidate может оформить только финальный gate `/exe`.

Перед новыми mutating probes `/verify` оценивает все candidates относительно
одного current state. Receipt может избавить от identical gate rerun, но не
считается independent observation:

- T0/T1 сохраняют существующий compact/manual fast lane и scheduler rules;
- T2 требует минимум один новый verifier-owned outcome probe и независимое
  обоснование каждого обязательного task-scoped outcome, AC/REQ, gate,
  verification target и применимого spec claim; ни один required claim не
  закрывается только receipt;
- T3 требует новое functional evidence для каждого independently harm-driving
  task-owned claim, основанного на принятом требовании или подтверждённом
  material risk, после чего остаётся обычный per-task `/red-verify`.

Verification report отдельно показывает `reused execute evidence`, `repeated
checks` и `new targeted probes`. Оптимизируется повтор команд, а не ownership
или полнота functional verification.

Для применимых linked architecture rules `/verify PASS` требует не только
functional outcome, но и разрешённый путь: правильного state owner, public
boundary, отсутствие forbidden write path/second source of truth и business
responsibility в запрещённом linked rule техническом месте, включая transport,
generic helper или composition root. Наблюдаемое нарушение даёт `FAIL`;
отсутствующее или неоднозначное canonical правило — `NEEDS-CLARIFICATION`.
Оба feature-related результата проходят bounded triage в `/feature-doctor`, а
не прямой выбор между локальным repair и `/spec-redesign`. Это не full
architecture audit.

### Manual mode

Manual mode означает явный top-level owner, а не ручное написание кода.

Caller заранее выбирает конкретный task ID. В manual и scheduler flow `/exe`
одинаково проверяет выбранную task, готовит tier protocol и нейтральный current
Execution Attempt (`attempt`, `started`), затем непосредственно перед первым
implementation write записывает `ready -> in_progress`. Для runnable `planned`
task `/exe` сначала делает point-of-use `planned -> ready`; иначе status не
меняется. Attempt не хранит owner, invocation basis или mode и не даёт closure
authority.

Если direct task links задают architecture boundaries, point-of-use preflight
также проверяет write owner, public boundary, source of truth, dependency
direction и допустимое место orchestration. Проверка ограничена actual change
surface. Pre-existing current drift может остаться evidence, но необходимость
изменить accepted target останавливает task и возвращает её в `/spec-redesign`.

- T0/T1 `/exe` может закрыть task только если current agent — explicit
  manual top-level closure owner, scope остался local, не возник T2/T3 trigger,
  hard boundaries соблюдены и compact PASS evidence записан в protocol и
  task `verify`.
- Если ownership отсутствует, `/exe` или `/verify` оставляет status без
  изменения и передаёт closure recommendation owner/scheduler.
- T2 closure требует full protocol, applicable task/spec gates, `/verify PASS`
  и explicit owner, который записывает lifecycle decision. Per-task
  `/red-verify` optional.
- T2 product feature completion отдельно требует
  `/red-verify --feature FT-<ID>` и exact
  `SEMANTIC_VERDICT: semantic-pass` в feature doc.
- T3 closure требует `/verify PASS`, per-task semantic-pass и explicit owner.

Manual и scheduler closure authority не смешиваются; Execution Attempt сам по
себе mode не хранит.

### Диагностика `/debug`

Если причина сложного сбоя неясна, `/exe` или `/verify` может предложить
отдельный запуск `/debug <TASK_ID>` в новом контексте. `/debug` изучает текущую
попытку, требования, результаты проверок и затронутый код, но не меняет код,
тесты, спецификации, задачу, протокол или её статус.

Команда создаёт только диагностический отчёт:

```text
.tasks/<TASK_ID>/<TASK_ID>-S-DEBUG-final-report-docs-01.md
```

В отчёте указаны наблюдаемый сбой, подтверждённая причина или пробел в данных,
минимальное исправление и regression check. После подтверждения причины он
фиксирует `repeated_confirmed|no_prior_evidence|unclassified`; подтверждённое
material повторение получает один минимальный guardrail с canonical owner и
adoption check. Это supporting evidence, а не новый scope или verdict. Маркер
`DIAGNOSIS: CONFIRMED|INCONCLUSIVE` и полномочия `/verify` не меняются.

### Scheduler mode

`/autopilot` владеет только product queue после закрытия Foundation gate:

- `planned -> ready` promotion;
- выбор task и durable checkpoint перед `/exe`;
- final `done|failed|blocked` decision;
- dependent blocking/unblocking;
- retry/failure budgets;
- terminal queue state.

`/autonomous` владеет Product/Design sequence, promotion/selection/final
decisions ограниченной FT-000 фазы и внешним end-to-end result. Готовую product
queue он передаёт каноническому `/autopilot`, не повторяя его product scheduler algorithm.
`/autopilot` не выполняет и не изменяет FT-000 records.

Для выбранной scheduler task `/exe` готовит protocol, записывает
`ready -> in_progress` и реализует; `/verify` возвращает functional verdict,
`/red-verify` — semantic verdict. В scheduler mode эти child skills не меняют
final lifecycle. Scheduler записывает status, closure/failure/blocking decision
и evidence links в authoritative `.task.json` сразу после task и до следующего
sync boundary.

Product scheduler checkpoint живёт в
`.protocols/AUTONOMOUS-RUN/status.md` и содержит current task, current stage,
last durable child verdict/handoff и next action. Допустимые scheduler stages
ровно такие:
`selection|execute|verify|red-verify|diagnose|closure|wave-boundary`. Checkpoint не
является task state: при resume scheduler сверяет его с indexed task record,
current-attempt protocol, handoff и verdict evidence. Он активируется только
при product handoff в `/autopilot`; Foundation resume использует outer run plan,
FT-000 task records и их protocols, не изобретая дополнительные scheduler
stages.

`STATE: RUNNING` — единственное non-terminal run state. `/autonomous` сохраняет
его на Product/Design и Foundation фазах; закрытие Foundation gate не является
intermediate `SUCCESS`. `/autopilot` записывает final product-queue result в
`STATE`.

### `/mb-sync`

`/mb-sync` — thin reconciliation adapter. Он согласует уже принятые решения с
RTM, feature/epic lifecycle, spec links, indexes, routers и changelog, но не
делает closure, failure, blocking или promotion inference.

Full sync выполняется один раз в конце wave. Early sync допустим только если
current wave реально зависит от reconciled RTM/index/spec/contract/changelog
state или owner явно его запросил. Local manual T0/T1 closure без broader
durable changes full sync не требует.

### Failure handling

Планировщик может повторить задачу, только если исправление остаётся в её
принятых границах и не повторяет опасное или необратимое действие.

`max_retries_per_task: 2` означает три выполнения: первое и два повторных.
Попытка считается неудачной только после `VERDICT: FAIL` или обязательного
`SEMANTIC_VERDICT: semantic-fail`. Если оба результата относятся к одной
попытке, она всё равно считается один раз. Незавершённый `/exe`, возобновление
работы, `/debug`, `NEEDS-CLARIFICATION` и `semantic-concern` число попыток не
увеличивают.

Если данных недостаточно, чтобы выбрать безопасное исправление или честно
поставить статус `failed` либо `blocked`, `/autopilot` запускает `/debug`.
Диагностический отчёт для текущей попытки можно использовать повторно; он не
добавляет ещё одну попытку. Scheduler переносит recurrence/prevention evidence
в существующий correction, disposition или follow-up и не расширяет task
boundary.

Пока не исчерпаны три выполнения, подтверждённое локальное исправление может
использовать оставшийся повтор. Проблема вне границ или полномочий задачи
переводит её в `blocked` и указывает, кто и как должен продолжить работу.
Подтверждённый локальный сбой без безопасного исправления переводит задачу в
`failed`. Если данных пока недостаточно, задача остаётся `in_progress`, а
процесс останавливается для уточнения.

После третьего неудачного выполнения четвёртого не будет. Внешняя проблема
остаётся `blocked`; локальный или неясный сбой получает `failed`. Перед
возобновлением `/autopilot` сверяет число попыток, последний результат и
диагностический отчёт. Если это нельзя сделать надёжно или повтор проверки
опасен, процесс останавливается и указывает причину и способ продолжения.

После `failed` создаётся запись об ошибке или обычная новая задача через
существующий этап планирования. Зависимые от `failed` или `blocked` задачи тоже
блокируются. Запрос уточнения сам по себе не превращается в автоматический
`failed`.

## 14. Tier policy

| Tier | Scope | Protocol | Manual completion | Scheduler completion |
|---|---|---|---|---|
| `T0` | typo, formatting, links, safe docs-only | compact | `/exe` fast lane или optional `/verify` у explicit owner | ordered `/verify`; compact evidence may be enough |
| `T1` | local function/component/test, low blast radius | compact | local check + explicit-owner closure; `/verify` optional | ordered `/verify`; compact functional evidence may be enough |
| `T2` | API, contracts, events, state/data/domain, migration, cross-module | full | `/verify PASS` + applicable gates + explicit owner | scheduler task done after functional PASS; feature complete only after feature semantic-pass |
| `T3` | auth, security, secrets, production/deploy, irreversible/data-loss, payments, compliance | full | functional PASS + task semantic-pass + explicit owner | functional PASS + task semantic-pass |

Если evidenced scope однозначно триггерит несколько tiers, применяется самый
высокий triggered tier. Если сам scope или требуемый tier неоднозначен, это
operator decision: interactive planning спрашивает, unattended planning
останавливается. «На всякий случай взять выше» не заменяет решение.

Tier входит в task ID, поэтому его нельзя изменить in-place. Higher-tier
discovery возвращает исходную task в `/feature-to-tasks FT-<NNN>` для controlled
rebuild/split, затем повторяются `/review-tasks-plan`, applicable doctor и
`/exe` replacement ID.

## 15. Автоматические режимы

### `/autopilot`

Используется только для уже подготовленной product queue. Preconditions:

- non-empty, schema-valid JSON registry;
- valid Global Backbone и Foundation anchors/dependencies;
- Foundation `not_required` или named gate task `done`, без unresolved FT-000
  work;
- хотя бы одна indexed product task; FT-000 records остаются read-only history;
- latest `/review-tasks-plan FT-<NNN>` `APPROVE` для каждой task-linked product
  feature с `REVIEWED_PLANNING_REVISION`, равным текущей positive Planning
  Revision;
- complete T2/T3 single-card handoffs;
- no unresolved operator decision;
- `/mb-doctor --strict` PASS.

Отсутствие indexed product tasks нарушает product-queue contract и возвращает
`HALT_QUALITY_GATES`, после чего нужен reviewed non-empty queue и повторный
strict readiness gate.

Canonical scheduler loop:

```text
refresh JSON state
  -> recover unfinished durable checkpoint action
       -> selected task, feature red-verify, closure or wave-boundary
  -> recover every in_progress task in stable index order
       -> reconcile current attempt and durable stage
       -> reconcile task + checkpoint + protocol/handoff/verdict
       -> resume first incomplete durable stage
       -> or record recovery decision and existing exact halt
  -> only with no unresolved in_progress: promotion pass
  -> select one ready task by wave/index order
  -> strict doctor precondition
  -> checkpoint execute: next action = /exe TASK
  -> /exe: начать попытку -> выполнить проверку -> внести изменения
  -> /verify
  -> per-task /red-verify for T3
  -> если причина сбоя неясна: optional /debug
     -> повтор или статус failed|blocked; четвёртой попытки нет
  -> scheduler lifecycle/evidence write
  -> T2 feature semantic gate when its last task closes
  -> next task in wave
  -> wave-boundary /mb-sync
  -> lint + strict doctor
  -> conditional task-plan re-review if planning surface changed
  -> default `/tech-debt wave <N>` report
  -> next promotion pass
```

При возобновлении `/autopilot` сначала заканчивает уже начатый шаг и только
потом выбирает новую задачу. Завершённые шаги повторно не запускаются:

- нет результата `/exe` — продолжить через `/exe`;
- `/exe` передал готовый результат на проверку — продолжить через `/verify`;
- `/exe` сообщил блокировку или необходимость исправить план — выполнить
  указанную им команду;
- задача `T3` прошла `/verify`, но ещё не прошла смысловую проверку — продолжить
  через `/red-verify`;
- этап `diagnose` использует подходящий отчёт `/debug`, после чего выбирается
  повтор или итоговый статус;
- все обязательные проверки пройдены — закрыть задачу.

Пока для задачи `in_progress` нет подтверждённого продолжения или решения,
выбирать следующую задачу нельзя. Если состояние попытки неясно или повтор
может снова выполнить опасное действие, процесс останавливается и указывает,
кто и как должен продолжить работу.

Status/evidence-only closure не вызывает повторный `/review-tasks-plan`.
Re-review нужен, если изменились task cards, specs, dependencies, tier, scope
или plan assumptions. Изменение Global Backbone Planning Revision означает уже
доказанный global impact и инвалидирует reviews всей product queue; features
повторно проходят fresh tasking и review последовательно.

Локальная конкретизация dependency graph Planning Revision не меняет. Если
point-of-use preflight обнаружил нового релевантного consumer или изменённый
contract, несовместимый с ещё не выполненной provider task, повторное
планирование и review ограничиваются затронутой feature.

### `/autonomous`

Это полный unattended orchestration:

```text
authoritative Product Brief / PRD / delta
  -> pre-queue lint + default doctor
  -> Constitution decision check
  -> /write-prd
  -> /spec-auto --init
  -> /prd-to-features
  -> /review-feat-plan
  -> /spec-design
  -> autonomous-owned FT-000 queue and final gate through the existing workflow
  -> for each FT-NNN: isolated /spec-auto FT-NNN when needed
  -> isolated /feature-to-tasks FT-NNN child
  -> separate fresh /review-tasks-plan FT-NNN child
  -> lint + strict doctor
  -> product queue through canonical /autopilot
  -> terminal state
```

`/autonomous` orchestrates child contracts и непосредственно владеет bounded
FT-000 phase, но не вызывает для неё `/autopilot` и не изменяет product tasks.
Он завершает tasking и review одной product feature до выбора следующей; child
не наследует parent/previous-feature conversation. Без isolated child contexts
flow останавливается и выдаёт точный fresh-session resume route.
Текущая feature и exact next action живут в existing outer run plan до
current-revision `APPROVE`; `REJECT` всегда следует named repair owner.
Foundation resume опирается на outer run plan и durable task protocols. После
доказанного закрытия final Foundation gate `/autonomous` продолжает
Product/Design и передаёт готовую product queue `/autopilot`.
Любой `/autopilot` `HALT_*` переносится без замены state/reason/owner/resume
route. Product queue `SUCCESS` переходит к финальным end-to-end gates.
`/autonomous` не проводит unattended Constitution interview и не принимает
missing operator decisions. Для product-feature finding он сначала запускает
bounded `/feature-doctor`: authority-set route продолжается автоматически, а
при оставшемся решении run сохраняет рекомендацию doctor и останавливается.

Required-workflow preflight выполняется до создания или reuse run protocol.
Missing path возвращает response-only `HALT_POLICY_VIOLATION` с external
installer/resume route и не изменяет существующие run artifacts. После
создания protocol terminal result записывается в
`.protocols/AUTONOMOUS-RUN/status.md` для resume.

Для `feature-plan` и каждой реально reviewed `task-plan:FT-<NNN>` surface
допускаются ровно пять завершённых циклов `repair -> re-review`. Initial review
начинается с counter `0` и не считается попыткой; counter увеличивается после
re-review и сохраняется в existing run status при resume. `REJECT` после
пятого цикла приводит к existing `HALT_REVIEW_REJECT`.

Allowed terminal states:

```text
SUCCESS
HALT_BLOCKING_QUESTIONS
HALT_CLARIFICATION_REQUIRED
HALT_REVIEW_REJECT
HALT_FAILURE_BUDGET
HALT_DEPENDENCY_DEADLOCK
HALT_POLICY_VIOLATION
HALT_QUALITY_GATES
HALT_BUDGET_EXCEEDED
```

No-ready fallback не заменяет уже записанный specific `HALT_*`, его reason,
owner и resume route. `HALT_DEPENDENCY_DEADLOCK` допустим только когда каждый
unfinished record non-runnable исключительно из-за незакрытых task
dependencies.

### Experimental parallel

Canonical execution sequential. `--experimental-parallel` требует:

- explicit opt-in;
- isolated worktrees/sandboxes;
- pairwise-disjoint non-empty hard `runtime_context.write_boundary`;
- отсутствие T3, shared/governing files, package manifests, lockfiles, CI и
  global config в parallel set.

`touched_files` не доказывает независимость. Если isolation/non-overlap нельзя
доказать, scheduler делает sequential fallback без ошибки.

## 16. Reference всех runtime-skills

### Entry, context и discovery

| Command | Owns | Не владеет / handoff |
|---|---|---|
| `/start` | scenario detection и next route | без skeleton возвращает external installer route, не вызывает `/mb-init`; после bootstrap запускается повторно |
| `/mb-init` | external installer route для Memory Bank bootstrap или coherent framework sync | сам не создаёт skeleton; после повторного `/mb-init` передаёт управление только в установленный `/start`, иначе останавливается с готовым skeleton |
| `/fill` | минимально достаточный context priming | строго read-only; возвращает gaps и рекомендуемые reads, не создаёт artifacts |
| `/context-manifest` | optional delegated Explorer routing в компактный read manifest | не пересказывает sources, не выполняет target workflow и не становится gate/scope boundary; caller читает sources лично |
| `/find-skills` | project-first skill discovery | не устанавливает marketplace skill без confirmation |
| `/creator-vibe` | persistent interpretive lens for creative intent and human outcomes | creates no requirements, statuses, artifacts, gates, or scope authority |
| `/brainstorm` | traceable ideation report | не создаёт requirements/PRD; затем `/brief` |
| `/brief` | concise Product Brief и initial draft glossary | не создаёт features/tasks; затем `/constitution` или `/write-prd` |
| `/constitution` | governing principles, DoD, autonomy, checkpoints | не заменяет PRD/specs; затем `/write-prd` |
| `/write-prd` | clarified Constitution-checked PRD | не декомпозирует; затем `/spec-init` |
| `/discuss` | bounded accepted decisions в owning artifacts/protocol | не обходит owning skill gate |
| `/map-codebase` | evidence-backed as-is baseline | не создаёт roadmap без delta; затем PRD route |
| `/feature-doctor` | semantic triage одной feature, варианты и repair routing | не создаёт specs/tasks; затем owning repair или tasking |

### Product, SDD и tasking

`/spec-design`, `/spec-redesign` и однофичевый `/spec-auto` используют один
deployed SDD-contract; каждая команда сохраняет собственные statuses, revision и handoff.

| Command | Owns | Не владеет / handoff |
|---|---|---|
| `/spec-init` | glossary gate и pre-PRD decomposition framing | не создаёт architecture/Foundation; затем `/prd-to-features` |
| `/prd-to-features` | product, REQ, epics, product features | не создаёт tasks/testing policy; затем review/design |
| `/review-feat-plan` | fresh-context `APPROVE|REJECT` PRD decomposition review | не исправляет product docs; затем `/spec-design` или repair |
| `/spec-design` | initial global backbone, preferred architecture recommendation и Foundation decision | не меняет accepted backbone; затем Foundation или feature design |
| `/spec-redesign` | accepted backbone/contract change и `none|bounded|global` impact verdict | не создаёт tasks/state; затем только affected sequential reconciliation |
| `/spec-auto` | unattended `--init` или одна `FT-*` из authoritative decisions | не спрашивает, не выбирает missing decision и не меняет revision |
| `/foundation-to-tasks` | minimum FT-000 queue или proven-baseline no-op | не реализует product features; затем strict doctor или product tasking |
| `/feature-to-tasks` | feature canonical coverage, IMPL plan, behavior examples и JSON tasks | не выполняет tasks; затем `/review-tasks-plan` |
| `/review-tasks-plan` | fresh-context `APPROVE|REJECT` runnable planning review | не чинит specs/cards/status; затем doctor/execution или repair |
| `/architecture-review` | bounded C4 L1-L3 и architecture verdict для одной feature | read-only; не возвращает итоговый planning verdict и не создаёт отдельный artifact |
| `/kiss-architect` | Architect proposal preflight для architecture/spec design, findings и corrections | не меняет active role или workflow authority; canonical edits передаёт owning skill |
| `/technical-premortem` | read-only technical pre-mortem принятого изменения перед реализацией | optional manual planning-to-execution или post-debug handoff; не является workflow gate |

### Execution, verification, maintenance и automation

| Command | Owns | Не владеет / handoff |
|---|---|---|
| `/exe` | выполняет одну выбранную задачу и записывает результаты проверок | не закрывает задачу за планировщик и сам не запускает следующую команду |
| `/add-tests` | cheapest sufficient tests внутри current `in_progress` task | не создаёт testing lifecycle или `.memory-bank/testing/` policy |
| `/debug` | ищет причину сбоя и рекомендует prevention для подтверждённого повторения | не исправляет код, не принимает recommendation и не меняет статус задачи |
| `/verify` | независимо проверяет результат одной задачи | не исправляет код или спецификации и не создаёт следующую задачу |
| `/red-verify` | independent hostile model и semantic verdict | не заменяет functional PASS и не меняет scheduler lifecycle |
| `/mb-sync` | reconciliation already-decided durable state | не принимает closure/promotion/design decisions |
| `/mb-garden` | mechanical links/indexes/routers maintenance и final lint | semantic/destructive decisions блокирует; broader reconcile передаёт `/mb-sync` |
| `/mb-doctor` | deterministic readiness report | не заменяет semantic review или verification |
| `/tech-debt` | advisory report по подтверждённому техническому долгу в заданной change surface | ничего не исправляет и не меняет workflow state; `/autopilot` запускает его после успешной wave boundary |
| `/autopilot` | reviewed product queue scheduler и terminal state после Foundation gate | не создаёт PRD/features/initial queue и не выполняет FT-000 |
| `/autonomous` | full Product/Design-to-terminal-state orchestration и bounded FT-000 scheduler | не принимает unresolved operator decisions и не копирует product scheduler |
| `/multiagentic` | `/autonomous` и его delegated `/autopilot` под одним Judge | сохраняет lifecycle, gates и terminal authority базовых contracts |
| `/multipilot` | standalone `/autopilot` под одним Judge | не запускает `/autonomous`; lifecycle и terminal authority остаются у `/autopilot` |

## 17. Проверки

### Source repo

```bash
npm run check:syntax --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
tmp_target="$(mktemp -d)"
node scripts/install-framework.mjs \
  --install-only --target "$tmp_target/install-only" --yes
node scripts/install-framework.mjs \
  --bootstrap --target "$tmp_target/bootstrap" --yes
```

Source-only count должен быть `0`.

### Target repo

```bash
node .memory-bank/scripts/mb-lint.mjs
node .memory-bank/scripts/mb-doctor.mjs
```

`mb-lint` блокирует structural errors, но structurally valid task с
tier/status-dependent protocol или closure-evidence gap может пройти lint.
Такие gaps выявляет `mb-doctor` с severity применимого default/strict mode.

Strict только после появления executable queue или на явно требуемом
readiness boundary:

```bash
node .memory-bank/scripts/mb-doctor.mjs --strict
```

## License

MIT
