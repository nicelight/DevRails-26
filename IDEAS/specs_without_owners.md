# Handoff: subject-based canonical SDD specs

## Назначение документа

Этот файл — handoff для агента, который будет перерабатывать **общий reusable
Memory Bank framework**, разворачиваемый в другие проекты.

Это не задача по дальнейшей правке `.memory-bank/` проекта Agro Intellect.
Локальный проект используется только как evidence того, как текущая модель
ведёт себя после нескольких SDD repair-проходов.

## Где находится canonical framework source

На момент подготовки handoff canonical source обнаружен здесь:

```text
/home/serg/Projects/DevRails 26
```

Git remote:

```text
https://github.com/nicelight/DevRails-26.git
```

Важно:

- `.agents/skills/*` и `.claude/skills/*` внутри развёрнутых проектов —
  generated copies;
- command specs в source framework находятся в
  `skills/_shared/references/commands/*.md`;
- scaffold и generated project docs создаются через
  `skills/_shared/scripts/init-mb.js`;
- runtime command skills устанавливаются через `scripts/install-framework.mjs`;
- менять нужно canonical framework source, затем проверять генерацию в чистом
  fixture-проекте;
- не следует реализовывать изменение только в
  `/home/serg/Projects/agro-intellect/.agents/skills/*` — эти файлы будут
  перезаписаны installer-ом;
- рабочее дерево `/home/serg/Projects/DevRails 26` уже содержит несвязанные
  изменения. Их нельзя сбрасывать или перезаписывать.

## Prerequisite: single-card task model

Сначала должен быть выполнен отдельный план
`IDEAS/packet-reformation.md`. Этот документ исходит из уже действующей модели:

```text
task planning/design
  -> .memory-bank/tasks/<TASK_ID>.task.json
  -> /review-tasks-plan
  -> /execute
  -> /verify
```

Persisted Execution Packets, `/mb-packet`, packet fields/status/hash/freshness и
packet refresh branches уже отсутствуют. Эта реформа не повторяет их удаление и
не вводит новый execution-context artifact. T2/T3 task card должна сохранять
single-card handoff completeness contract и напрямую ссылаться на применимые
SDD specs.

## Цель переработки

Перевести SDD design с модели:

```text
feature -> feature tech-spec hub -> concrete blocks inside hub
```

на модель:

```text
feature -> required system concerns -> discover existing specs by path/index
        -> reuse or extend existing specs
        -> create only missing subject-based specs
        -> link exact specs back to feature and indexed task cards
```

Спецификации должны называться и размещаться по системной области, которую они
описывают. Feature связывает применимые specs, но не становится контейнером для
нескольких независимых architecture/contract/data concerns.

## Исходная SDD модель после prerequisite

### Global design

`/spec-design` после `/prd` создаёт global/shared backbone:

- `spec-backbone.md` хранит readiness и routing;
- `spec-index.md` служит registry;
- shared design размещается в `architecture/`, `contracts/`, `domains/`,
  `states/`, `testing/`, `runbooks/`, `guides/` и `adrs/`;
- feature-local details откладываются до `/prd-to-tasks`.

Эта часть модели в целом правильная и должна быть сохранена.

### Feature design

В canonical source
`skills/_shared/references/commands/prd-to-tasks.md` feature design выполняется
внутри `/prd-to-tasks` перед task slicing.

Текущая логика:

1. Прочитать feature, epic, RTM, `spec-index`, `spec-backbone` и существующие
   `spec_design_links`.
2. Найти существующие authoritative owners.
3. Предпочесть один feature hub:

   ```text
   .memory-bank/tech-specs/FT-<NNN>-<slug>.md
   ```

4. Для каждого concrete boundary выбрать одного authoritative owner.
5. Сначала расширять существующего owner.
6. Создавать новый owner только когда существующий файл не подходит.
7. Записать ссылки в feature `spec_design_links`.
8. Передать task-relevant subset этих links в implementation plan и indexed
   task cards.

### Scaffold

Текущий `init-mb.js`:

- создаёт `.memory-bank/tech-specs/`;
- добавляет planned spec family:

  ```text
  feature_design -> .memory-bank/tech-specs/FT-<NNN>-<slug>.md
  ```

- создаёт в `spec-index.md` колонку `Owner command`;
- описывает interface/data specs через natural-owner terminology.

## Почему текущая модель приводит к монолитам

Правила по отдельности выглядят безопасно:

- не создавать duplicate specs;
- обновлять существующий authoritative owner;
- предпочитать один concise feature hub;
- создавать новый файл только при доказанной необходимости.

Но после создания первого FT hub он становится существующим owner сразу для
нескольких concerns. Каждый следующий repair снова выбирает этот файл, потому
что создание нового owner выглядит как риск дублирования.

В Agro Intellect это привело к тому, что один FT-001 файл одновременно содержал:

- relational data model и migration contract;
- credential/token security;
- session lifecycle и transport;
- HTTP API и error catalog;
- ActorContext и permission interface;
- verification matrix.

Файл вырос с 373 до 735 строк, но размер здесь только симптом. Основная проблема
в том, что workflow не имел concern-based правила, отделяющего независимые
канонические contracts/data/state specs от feature composition.

## Целевая модель

### Основной принцип

Фича не владеет спецификациями.

Фича описывает product behavior и перечисляет системные спецификации, которые
нужны для её реализации:

```yaml
spec_design_status: complete
spec_design_links:
  - .memory-bank/domains/identity/account-membership.md
  - .memory-bank/domains/auth/session-storage.md
  - .memory-bank/contracts/auth/session-security.md
  - .memory-bank/contracts/auth/session-http.md
  - .memory-bank/contracts/access/actor-context.md
  - .memory-bank/states/auth/session-lifecycle.md
  - .memory-bank/testing/auth/session-and-access.md
```

Спецификация может впервые появиться во время работы над FT-001, но её имя,
путь, frontmatter и содержание не должны привязывать её к FT-001.

Вторая фича должна повторно использовать тот же path, а не создавать
`FT-002-actor-context.md`.

### Canonicality и routing

Feature/file ownership убирается, но SSOT-инвариант остаётся: каждый concrete
concern должен иметь ровно одну canonical spec. Для routing используются:

- зарегистрированный canonical path;
- type и предметный scope спецификации;
- `## Scope`, `## Out of scope` и `## Related specs`, когда они нужны;
- `Change route` в `spec-index.md` для защищённых или workflow-owned документов.

Не требуется `owner` в frontmatter или `## Ownership` с `Owns` /
`Does not own`. Terminology `authoritative owner` / `natural owner` в file
routing заменяется на `canonical spec` / `canonical path` / `spec scope`.
Optional metadata о человеческом maintainer-е допустимо, но не участвует в SDD
routing и readiness. Task lifecycle ownership, scheduler ownership и явная
человеческая ответственность остаются отдельными понятиями и не переименовываются.

Пример:

```text
.memory-bank/contracts/access/actor-context.md
```

— каноническая спецификация ActorContext, потому что этот path зарегистрирован
для данного concrete concern, а её scope явно отделён от соседних contracts.

## Целевая структура каталогов

Рекомендуемая базовая структура:

```text
.memory-bank/
├── architecture/
│   └── system-architecture.md
├── domains/
│   ├── identity/
│   │   └── account-membership.md
│   └── auth/
│       └── session-storage.md
├── contracts/
│   ├── auth/
│   │   ├── session-security.md
│   │   └── session-http.md
│   ├── access/
│   │   └── actor-context.md
│   ├── events/
│   └── agents/
├── states/
│   └── auth/
│       └── session-lifecycle.md
├── testing/
│   └── auth/
│       └── session-and-access.md
├── runbooks/
├── guides/
└── adrs/
```

Это пример taxonomy, а не требование создавать все каталоги заранее.
Подкаталог создаётся только когда он улучшает поиск или в области появляется
несколько документов. Для папок с более чем тремя документами сохраняется
правило `index.md` router.

### Назначение основных каталогов

| Каталог | Содержание |
|---|---|
| `architecture/` | global architecture style, module boundaries, source-of-truth hierarchy |
| `domains/` | domain vocabulary, internal models, storage, DB schemas, migrations, persistence |
| `contracts/` | component/API/event/agent/tool/security/access boundary contracts |
| `states/` | lifecycle/state machines, transitions and guards |
| `testing/` | cross-contract verification strategy and executable evidence expectations |
| `runbooks/` | setup, runtime, deployment and operational procedures |
| `guides/` | normative HOW where a guide is the correct source |
| `adrs/` | stable architecture decisions and tradeoffs |

### Naming rules

- Имя отражает предмет: `actor-context.md`, `session-http.md`,
  `session-storage.md`.
- Новые design specs не используют `FT-<NNN>` в имени.
- Новые system specs не содержат `feature_id` в frontmatter.
- Нельзя создавать общий `FT-XXX-tech-spec` для хранения нескольких concerns.
- Truly feature-specific acceptance/use-case detail остаётся в feature doc.
- Если feature впервые вводит новый системный boundary, spec всё равно получает
  предметное имя и canonical system path.
- Specs разделяются по самостоятельному boundary, change cadence и потенциалу
  reuse, а не механически по каждой taxonomy-категории.
- Несколько тесно связанных правил могут оставаться в одной spec, если они
  изменяются и используются как один concern.
- Редкий cohesive feature-local technical concern также получает предметное
  имя и canonical path; это не разрешение создавать новый FT hub.

## Новый `spec-index.md`

`spec-index.md` остаётся pure registry и discovery map, но регистрирует
предметные спецификации, а не feature design hubs.

Рекомендуемая таблица:

```markdown
| Type | Path | Status | Scope | Change route |
|---|---|---|---|---|
| interface_contract | .memory-bank/contracts/access/actor-context.md | active | Request actor identity and Plant permission envelope | /spec-design or /prd-to-tasks |
| api_contract | .memory-bank/contracts/auth/session-http.md | active | Login, logout and current-session HTTP boundary | /spec-design or /prd-to-tasks |
| data_spec | .memory-bank/domains/auth/session-storage.md | active | Local session persistence and migration rules | /spec-design or /prd-to-tasks |
| state_spec | .memory-bank/states/auth/session-lifecycle.md | active | Session activation, expiry and revocation lifecycle | /spec-design or /prd-to-tasks |
```

Правила registry:

- canonical identity задаётся `Path`; отдельный дублирующий `Spec key` не нужен;
- один concrete concern имеет один active canonical path;
- `Change route` описывает допустимый workflow изменения, а не владение файлом;
- в registry нет `feature_id` или `used_by`;
- reverse usage определяется feature/task links и поиском, а не хранится ещё
  одной копией в registry;
- index не хранит readiness, feature status или длинные решения;
- отдельный YAML/JSON registry не создаётся.

## Новый алгоритм создания SDD design specs

### 1. Получить design pressure фичи

Прочитать feature, requirements, epic, global backbone и Foundation evidence.
Выделить только применимые concerns:

- architecture/module/runtime impact;
- component/interface boundary;
- HTTP/RPC/CLI API;
- event/message/agent/tool I/O;
- data payload contract;
- internal domain/storage/migration;
- state/lifecycle;
- security/access/safety;
- verification/runbook/operations.

Не нужно заполнять все категории шаблона. `not_applicable` допустим, если
решение обосновано.

### 2. Выполнить discovery до записи

До создания любого spec файла skill обязан:

1. Прочитать `spec-index.md`.
2. Прочитать relevant folder indexes.
3. Просканировать предметные каталоги по именам файлов и `description`.
4. Прочитать candidate specs целиком.
5. Построить временный coverage/gap audit:

   ```text
   concern | existing canonical spec | sufficient | action
   ```

6. Для каждого concern выбрать ровно одно действие:

   - `reuse` — существующая spec полностью покрывает concern;
   - `extend` — canonical spec существует, но требует обоснованного расширения;
   - `create` — подходящей spec нет;
   - `not_applicable` — concern не относится к фиче;
   - `block` — найдены конфликтующие paths или требуется shared/global решение.

Coverage table остаётся в protocol/working state и не становится ещё одним
нормативным документом.

### 3. Создать только недостающее

Для `create` skill:

1. Выбирает каталог по типу specification.
2. Выбирает предметный slug без FT ID.
3. Повторно проверяет registry и соседние filenames на синонимы/пересечения.
4. Создаёт atomic spec с `Scope`, concrete shape/rules/errors/verification,
   когда это необходимо по tier/design pressure.
5. Обновляет folder index и `spec-index.md`.
6. Добавляет exact path в feature `spec_design_links`.

Если подходящий canonical path неочевиден или существуют две конкурирующие
specs, skill не создаёт третью. Он блокирует handoff и запрашивает решение либо
возвращает shared/global ambiguity в `/spec-design`.

Atomic здесь означает один cohesive concern, а не один файл на каждый тип из
SDD taxonomy. Split оправдан, когда части имеют разные boundaries, change
cadence, consumers или reuse; размер файла сам по себе не является design gate.

### 4. Feature становится composition root

Feature doc хранит:

- use cases;
- acceptance criteria;
- edge cases;
- behavior specs;
- `spec_design_status`;
- список `spec_design_links`;
- короткое объяснение, какие specs применимы к feature.

Feature doc не повторяет concrete fields, endpoint schemas, error catalog,
state transitions, DB indexes или security constants из linked specs.

Новый workflow не создаёт default `.memory-bank/tech-specs/FT-*.md`. Если
возникает редкий feature-local technical concern, он всё равно оформляется как
subject-based canonical spec, а не как контейнер всех решений feature.

### 5. Tasks получают прямые ссылки

`/prd-to-tasks` должен добавлять в каждую T2/T3 task только relevant subset
canonical specs, а не один feature hub.

Пример:

- migration task получает `domains/auth/session-storage.md`;
- security primitive task получает `contracts/auth/session-security.md`;
- API task получает `contracts/auth/session-http.md` и session security;
- authorization task получает `contracts/access/actor-context.md`;
- integration gate получает `testing/auth/session-and-access.md` и необходимые
  boundary specs.

Indexed task card остаётся единственным authoritative execution context. Она
ссылается на применимые canonical specs через существующие task fields и копирует
только task-relevant executable constraints, invariants и verification targets,
но не полные contract blocks.

## Изменения в canonical framework source

Минимально проверить и изменить следующие surfaces.

### Command specs

- `skills/_shared/references/commands/prd-to-tasks.md`
  - удалить preference для feature hub;
  - заменить owner-selection на registry-first canonical-spec discovery/gap audit;
  - не создавать новые default `tech-specs/FT-*`;
  - описать feature как composition root;
  - передавать direct relevant canonical spec links в indexed task cards;
  - сохранять T2/T3 single-card handoff completeness contract.
- `skills/_shared/references/commands/spec-design.md`
  - заменить feature-local tech-spec routing на subject-based system specs;
  - убрать `natural owner`/`authoritative owner` terminology там, где она
    определяет file routing;
  - сохранить global/shared backbone responsibility.
- `skills/_shared/references/commands/spec-auto.md`
  - обеспечить тот же discovery/create-only-missing алгоритм в autonomous flow.
- `skills/_shared/references/commands/foundation-to-tasks.md`
  - foundation specs также должны иметь subject paths без file-owner model;
  - не создавать feature-style owner для substrate concerns.
- `skills/_shared/references/commands/clarify-feature.md`
  - handoff должен говорить о missing canonical specs, не feature spec owner.
- `skills/_shared/references/commands/review-tasks-plan.md`
  - проверять direct canonical spec links и отсутствие hub-only coverage.
- `skills/_shared/references/commands/execute.md`
  - читать применимые task-linked canonical specs напрямую из single-card
    task context;
  - заменить file-owner terminology, не затрагивая lifecycle/closure ownership.
- `skills/_shared/references/commands/verify.md`
  - строить task-scoped verification basis по direct canonical specs из task
    card и feature links;
  - сохранить distinction между design blocker и functional FAIL.
- `skills/_shared/references/commands/mb-sync.md`
  - синхронизировать registry/folder links, не создавать owner metadata.
- Все другие command docs, найденные через:

  ```bash
  rg -n "tech-specs|feature hub|authoritative owner|natural owner|Owner command|spec_design_links" skills
  ```

  должны быть классифицированы и согласованы. Нельзя делать механическую замену
  слова `owner`, если оно относится к task status ownership или человеческой
  ответственности, а не к SDD file routing.

### Scaffold/templates

- `skills/_shared/scripts/init-mb.js`
  - не создавать `tech-specs/` для новых проектов;
  - убрать planned family `feature_design -> tech-specs/FT-*`;
  - заменить `Owner command` на `Change route` в initial `spec-index.md`;
  - добавить canonical path/scope правила;
  - обновить MBB: feature links specs, но не владеет ими;
  - сохранить `spec_design_links` в feature frontmatter.
- `skills/_shared/references/structure-template.md`
  - обновить tree, indexes, AGENTS routing и MBB examples.
- `scripts/install-framework.mjs`
  - проверить, что обновлённые canonical commands корректно генерируются для
    Codex и Claude; специальная логика может не понадобиться.
- README/how-it-works/project-map docs source framework — обновить после
  стабилизации command contract.

## Acceptance criteria

Переработка считается успешной, если выполнены все условия.

### Fresh project

- Single-card task model из `packet-reformation.md` остаётся неизменной и не
  получает нового derivative execution-context artifact.
- `init-mb` не создаёт `.memory-bank/tech-specs/`.
- Initial `spec-index.md` использует `Change route`, не содержит planned FT
  tech-spec и не вводит отдельный `Spec key`.
- Generated Codex/Claude skills описывают одинаковую новую модель.

### Reuse

Given существует:

```text
.memory-bank/contracts/access/actor-context.md
```

When `/prd-to-tasks FT-002` обнаруживает потребность в ActorContext,
Then он читает и добавляет этот path в feature/task links и не создаёт новый
ActorContext spec.

### Create missing only

Given storage и security specs существуют, но session HTTP contract отсутствует,
When feature требует login/logout API,
Then создаётся только:

```text
.memory-bank/contracts/auth/session-http.md
```

### Cross-feature reuse

Две features могут ссылаться на один contract. В spec файле и registry при
этом нет feature ID или `used_by` копий.

### Conflict

Если обнаружены два candidate paths для одного subject, workflow останавливает
создание третьего файла и требует reconciliation.

### Task context

Каждая T2/T3 indexed task card получает direct links только на применимые specs
и сохраняет single-card handoff completeness contract. Storage или DB-migration
task не обязана загружать весь набор API/UI contracts фичи.

## Рекомендуемый порядок реализации

1. Подтвердить prerequisite: single-card task model установлена, generated
   skills актуальны, packet layer отсутствует.
2. Снять baseline tests source framework и сохранить evidence.
3. Зафиксировать target taxonomy и registry row format.
4. Обновить `prd-to-tasks.md` как главный contract новой модели.
5. Согласовать `spec-design`, `spec-auto`, foundation, review, `execute` и
   `verify` commands.
6. Обновить `init-mb.js` и structure templates.
7. Сгенерировать чистый тестовый проект через installer.
8. Прогнать happy-path reuse, missing-only и conflict scenarios.
9. Обновить framework docs.

## Non-goals

- Не перерабатывать product/epic/feature C4 hierarchy.
- Не отменять feature `spec_design_status` и `spec_design_links`.
- Не переносить readiness из `spec-backbone.md` в `spec-index.md`.
- Не вводить второй YAML/JSON registry без необходимости.
- Не делать semantic vector search обязательной зависимостью framework.
- Не создавать заранее пустые каталоги/спеки для всех возможных типов.
- Не смешивать эту работу с task status ownership или scheduler ownership.
- Не добавлять новые `mb-lint` / `mb-doctor` rules в рамках этой переработки.
- Не возвращать persisted packet, packet-like task object или другой derivative
  execution-context layer.

## Риски и вопросы, которые агент должен закрыть

1. Насколько глубокой должна быть folder taxonomy по умолчанию; не допустить
   пустой enterprise-структуры в маленьких проектах.
2. Какие boundaries/change-cadence/reuse признаки требуют отдельной spec, чтобы
   не заменить feature hub набором микроспеков.
3. Какие значения `Change route` нужны для shared/global specs и established
   feature detail без возвращения file-owner модели.
4. Какие текущие source docs используют слово `owner` в другом смысле и не
   должны быть изменены.

## Ожидаемый handoff от implementing agent

Implementing agent должен вернуть:

- список изменённых canonical framework files;
- краткое описание нового discovery/gap algorithm;
- final folder/index conventions;
- generated clean-project evidence;
- результаты reuse, missing-only и conflict scenarios;
- подтверждение, что single-card task model сохранена и packet layer не
  возвращён;
- известные ограничения и follow-up work;
- подтверждение, что generated project copies не редактировались как source of
  truth.
