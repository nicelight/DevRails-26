# Handoff: SDD specs без feature/file owners

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
        -> link exact specs back to feature and tasks
```

Спецификации должны называться и размещаться по системной области, которую они
описывают. Они не должны принадлежать фиче, называться по `FT-XXX` или
создаваться как контейнер всех решений одной фичи.

## Текущая модель

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
8. Передать эти links в implementation plan, tasks и packets.

В более старых deployments та же логика присутствует также в standalone
`/spec-improve`. В текущем source framework feature repair уже объединён с
`/prd-to-tasks`. Агент должен проверить актуальную ветку и обновить все реально
поставляемые compatibility-команды, но не восстанавливать `/spec-improve`
только ради этой переработки.

### Scaffold

Текущий `init-mb.js`:

- создаёт `.memory-bank/tech-specs/`;
- добавляет planned spec family:

  ```text
  feature_design -> .memory-bank/tech-specs/FT-<NNN>-<slug>.md
  ```

- создаёт в `spec-index.md` колонку `Owner command`;
- описывает interface/data specs через natural-owner terminology.

### Validation

Текущие `mb-lint` и `mb-doctor` считают `tech-specs/` нормальным SDD spec
каталогом и проверяют существование feature `spec_design_links`, но не
предотвращают появление большого feature hub с несколькими независимыми
contract families.

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

Файл вырос с 373 до 735 строк. Workflow не имел trigger, после которого hub
обязан стать router или быть разбитым. MBB ограничение примерно в 500 строк
оставалось рекомендацией для периодического `/mb-garden`, а не design gate.

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

### Что означает `without owners`

Нужно убрать file-owner модель как механизм routing:

- не требовать `owner` в frontmatter для выбора спецификации;
- не требовать `## Ownership` с `Owns` / `Does not own`;
- убрать `Owner command` из `spec-index.md`;
- заменить terminology `authoritative owner` / `natural owner` на
  `canonical spec` / `canonical path` / `spec scope`;
- использовать `## Scope`, `## Out of scope` и `## Related specs`, когда такие
  секции действительно нужны;
- optional metadata о человеческом maintainer-е допустимо, но не должно
  участвовать в SDD routing и readiness.

При этом SSOT не исчезает. Canonicality задаётся не owner-ом, а уникальным
предметным path, зарегистрированным в `spec-index.md`.

Пример:

```text
.memory-bank/contracts/access/actor-context.md
```

— единственная каноническая спецификация ActorContext потому, что registry и
validator разрешают только один active path для этого spec key.

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
- Path является spec key:

  ```text
  contracts/auth/session-http
  contracts/access/actor-context
  domains/auth/session-storage
  states/auth/session-lifecycle
  ```

## Новый `spec-index.md`

`spec-index.md` остаётся pure registry и discovery map, но регистрирует
предметные спецификации, а не feature design hubs.

Рекомендуемая таблица:

```markdown
| Spec key | Type | Path | Status | Scope |
|---|---|---|---|---|
| contracts/access/actor-context | interface_contract | .memory-bank/contracts/access/actor-context.md | active | Request actor identity and Plant permission envelope |
| contracts/auth/session-http | api_contract | .memory-bank/contracts/auth/session-http.md | active | Login, logout and current-session HTTP boundary |
| domains/auth/session-storage | data_spec | .memory-bank/domains/auth/session-storage.md | active | Local session persistence and migration rules |
| states/auth/session-lifecycle | state_spec | .memory-bank/states/auth/session-lifecycle.md | active | Session activation, expiry and revocation lifecycle |
```

Правила registry:

- `Spec key` выводится из relative path без `.memory-bank/` и `.md`;
- один active key соответствует одному path;
- в registry нет `Owner command`, `feature_id` или `used_by`;
- reverse usage определяется feature/task links и поиском, а не хранится ещё
  одной копией в registry;
- index не хранит readiness, feature status или длинные решения;
- index должен совпадать с фактическими spec files; drift является lint error;
- отдельный YAML registry не нужен, если Markdown table можно надёжно
  валидировать. Не следует вводить второй registry без доказанной необходимости.

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

Новый workflow не создаёт `.memory-bank/tech-specs/FT-*.md`.

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

Required packets после изменения links должны быть refreshed. Task/packet
records не должны копировать полные contract blocks.

## Изменения в canonical framework source

Минимально проверить и изменить следующие surfaces.

### Command specs

- `skills/_shared/references/commands/prd-to-tasks.md`
  - удалить preference для feature hub;
  - заменить owner-selection на registry-first discovery/gap audit;
  - запретить новые `tech-specs/FT-*`;
  - описать feature как composition root;
  - передавать direct canonical spec links в tasks/packets.
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
- `skills/_shared/references/commands/mb-sync.md`
  - синхронизировать registry/folder links, не создавать owner metadata.
- `skills/_shared/references/commands/mb-garden.md`
  - находить legacy feature hubs, oversized specs и duplicate subject specs.
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
  - обновить initial `spec-index.md` table без `Owner command`;
  - добавить path/spec-key правила;
  - обновить MBB: feature links specs, но не владеет ими;
  - сохранить `spec_design_links` в feature frontmatter.
- `skills/_shared/references/structure-template.md`
  - обновить tree, indexes, AGENTS routing и MBB examples.
- `scripts/install-framework.mjs`
  - проверить, что обновлённые canonical commands корректно генерируются для
    Codex и Claude; специальная логика может не понадобиться.
- README/how-it-works/project-map docs source framework — обновить после
  стабилизации command contract.

### Validators

- `skills/mb-garden/assets/mb-lint.mjs`
- `skills/mb-garden/assets/mb-doctor.mjs`

Новые проверки:

1. Каждый active spec в canonical directories зарегистрирован в
   `spec-index.md`.
2. Каждая registry path существует.
3. `Spec key` соответствует path и уникален.
4. Новые specs в `contracts/`, `domains/`, `states/`, `testing/`, `runbooks/`,
   `guides/` не используют `FT-<NNN>` basename и `feature_id` frontmatter.
5. Feature `spec_design_status: complete` содержит существующие direct
   `spec_design_links` либо обоснованно `not_required`.
6. T2/T3 task содержит direct relevant canonical spec links; один legacy hub
   без concrete direct links не считается достаточным для new-layout project.
7. Folder с более чем тремя docs имеет `index.md`.
8. Atomic doc size:
   - warning около 400 строк;
   - error после 500 строк, если framework не введёт явное редкое исключение.
9. Registry не содержит feature status, owner command или feature usage maps.
10. Duplicate/suspicious subject names должны хотя бы давать actionable
    warning; semantic duplicate detection не следует притворно объявлять
    полностью решённым.

Validator messages должны объяснять безопасное исправление агенту.

## Backward compatibility и миграция существующих проектов

Нельзя одномоментно сломать проекты, где tasks и packets уже ссылаются на
`.memory-bank/tech-specs/FT-*.md`.

Предлагаемый rollout:

### Phase 1: framework writes new layout

- Fresh projects не получают `tech-specs/`.
- Новые `/prd-to-tasks` runs создают только subject-based specs.
- Validators продолжают читать legacy `tech-specs/` как compatibility input,
  но выдают migration warning.

### Phase 2: explicit garden migration

- `/mb-garden` умеет провести audit legacy hubs:
  - перечислить содержащиеся concerns;
  - предложить canonical paths;
  - найти existing specs;
  - сформировать migration plan;
  - не переносить contracts автоматически без проверки смысла.
- Миграция выполняется feature-by-feature или boundary-by-boundary.
- Feature links, task records, plans и packets обновляются на direct specs.
- Старый hub может временно оставаться compatibility facade.

### Phase 3: retire legacy hub

- После отсутствия runtime/task/packet references hub архивируется или
  удаляется controlled change-ом.
- `tech-specs/` остаётся только legacy-readable либо полностью удаляется в
  следующей major framework version.

Не следует автоматически превращать каждый heading старого hub в отдельный
файл: границы должны определяться specification concern, а не Markdown
структурой.

## Acceptance criteria

Переработка считается успешной, если выполнены все условия.

### Fresh project

- `init-mb` не создаёт `.memory-bank/tech-specs/`.
- Initial `spec-index.md` не содержит `Owner command` и planned FT tech-spec.
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

Каждая T2/T3 task получает direct links только на применимые specs. Migration
task не обязана загружать весь набор API/UI contracts фичи.

### Validation

- framework tests проходят;
- generated fixture проходит `mb-lint` и `mb-doctor`;
- deliberate duplicate/missing-index/oversized fixtures дают ожидаемые ошибки;
- legacy fixture остаётся читаемым и получает controlled migration warnings,
  а не необъяснимый hard failure.

## Рекомендуемый порядок реализации

1. Снять baseline tests source framework и сохранить evidence.
2. Зафиксировать target taxonomy и registry row format.
3. Обновить `prd-to-tasks.md` как главный contract новой модели.
4. Согласовать `spec-design`, `spec-auto`, foundation и review commands.
5. Обновить `init-mb.js` и structure templates.
6. Добавить/обновить validators и fixtures.
7. Сгенерировать чистый тестовый проект через installer.
8. Прогнать happy-path reuse, missing-only, conflict и legacy scenarios.
9. Обновить framework docs.
10. Только после этого проверять migration на копии реального проекта.

## Non-goals

- Не перерабатывать product/epic/feature C4 hierarchy.
- Не отменять feature `spec_design_status` и `spec_design_links`.
- Не переносить readiness из `spec-backbone.md` в `spec-index.md`.
- Не вводить второй YAML/JSON registry без необходимости.
- Не делать semantic vector search обязательной зависимостью framework.
- Не создавать заранее пустые каталоги/спеки для всех возможных типов.
- Не смешивать эту работу с task status ownership или scheduler ownership.
- Не мигрировать Agro Intellect автоматически как часть изменения reusable
  framework.

## Риски и вопросы, которые агент должен закрыть

1. Нужен ли hard error для документа >500 строк или warning + explicit
   exception metadata.
2. Насколько глубокой должна быть folder taxonomy по умолчанию; не допустить
   пустой enterprise-структуры в маленьких проектах.
3. Как отличить старый project layout от new layout для compatibility checks.
4. Достаточно ли Markdown registry parser или нужен generated index. Default
   recommendation: сохранить один Markdown registry и усилить validation.
5. Как refresh packets после spec-only link changes выполняется в текущем
   `/prd-to-tasks` contract.
6. Какие текущие source docs используют слово `owner` в другом смысле и не
   должны быть изменены.

## Ожидаемый handoff от implementing agent

Implementing agent должен вернуть:

- список изменённых canonical framework files;
- краткое описание нового discovery/gap algorithm;
- final folder/index conventions;
- validator rules и fixture coverage;
- backward-compatibility policy;
- generated clean-project evidence;
- legacy-project evidence;
- известные ограничения и follow-up work;
- подтверждение, что generated project copies не редактировались как source of
  truth.
