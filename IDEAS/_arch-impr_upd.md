# Agentic-first архитектура для DevRails: capability slices + authority boundaries

## Статус и scope

Этот документ описывает архитектурную эвристику для target-проектов, которые
разрабатываются и проверяются AI-агентами через DevRails. Это не отдельный
runtime contract и не новая сущность Memory Bank; идея уточняет существующие
contracts.

Предложение не вводит:

- новый workflow, status, task field, schema или registry;
- новый обязательный artifact или file family;
- отдельный Agent Harness Contract;
- обязательный architecture validator;
- изменения scheduler, lifecycle, protocol family или Foundation task model.

DevRails уже является workflow harness: skills, Memory Bank, JSON tasks,
protocols, verification и scheduler. Идея касается только того, как сделать
архитектуру target-проекта легче для локального изменения и проверки агентом.

## Главный принцип

Agentic-first архитектура должна обеспечивать три свойства:

1. **Change locality** — место изменения находится без broad repository scan.
2. **Authority clarity** — ясно, кто владеет invariant/state transition, через
   какую boundary разрешено изменение и какие обходы запрещены.
3. **Cheap proof path** — существует минимальный достоверный project-native
   способ доказать outcome.

Названия паттернов, структура каталогов, dependency direction, source of truth
и composition root важны только постольку, поскольку поддерживают эти свойства.

## Capability slices как эвристика, а не обязательная архитектура

Для application-shaped greenfield агент может рассмотреть и рекомендовать как
один из KISS-вариантов deployable modular monolith с capability/vertical slices,
узкими module contracts, явным write ownership и thin composition root.

Это рекомендация, а не принятое решение и не automatic default. Материальный
выбор architecture style, module/runtime boundaries, public contracts,
state/storage, security, compatibility или deployment подтверждает оператор.
В unattended flow отсутствие принятого решения остаётся обычным design blocker.

Другой primary change unit естественнее, например, для:

- library/package — public module или package API;
- CLI — command или command family;
- firmware — subsystem, driver или control loop;
- data pipeline — pipeline stage или transformation;
- plugin ecosystem — host contract и plugin capability;
- protocol implementation — protocol layer или state machine;
- устойчивого brownfield — существующий module/bounded context;
- independently deployed system — service, когда independent deployment,
  scaling, availability или ownership уже реальны.

Гипотетический будущий scale, reuse или integration не являются достаточной
причиной для усложнения архитектуры.

## Feature, module/slice и task — разные понятия

```text
Feature      = независимо ценный product outcome.
Module/slice = долгоживущая code/authority boundary, если она реально есть.
Task         = cohesive independently verifiable изменение.
```

Следствия:

- feature может затрагивать несколько modules;
- один module может обслуживать несколько features;
- task не создаётся по числу файлов, слоёв или modules;
- cross-module task допустима, если outcome остаётся cohesive, boundaries ясны,
  а orchestration не требует нового material decision;
- migration, integration, security concern или technical module сами по себе не
  становятся product feature без самостоятельного observable outcome.

`Slice` здесь — conceptual architecture term. DevRails не получает
`.memory-bank/slices/`, slice registry, slice status, `owning_slice` task field
или правило «один `FT-*` = один slice».

## Agentic-first design lens

При проектировании или review полезно проверить шесть вопросов:

1. Какова естественная primary change unit и где её code root?
2. Кто владеет изменяемыми invariants, transitions и writes?
3. Через какую public boundary разрешено взаимодействие и какие bypasses
   запрещены?
4. Какие dependency directions действительно существенны?
5. Где composition/runtime entrypoint?
6. Какой минимальный credible verification path доказывает outcome?

Это coverage lens, а не обязательный шестистрочный persisted contract, table или
checklist artifact. Ответы фиксируются только там, где уже живёт соответствующая
истина:

- global/shared executable rule — в Architecture Spine;
- responsibility, write scope или call boundary — в Boundary Map или owning
  canonical contract;
- detailed API/state/data/security behavior — в subject-based spec;
- build/start/entrypoint/smoke baseline — в Foundation Dev Path;
- task-local scope, links, constraints и proof — в existing single-card task.

Для `local_simple_backbone` не требуется заполнять отдельный architecture block,
создавать slice table, ADR или дополнительные specs. Достаточно уже существующего
minimal backbone и evidence-backed `not_applicable` rationales.

## Практические архитектурные правила

### Locality и boundaries

- Начинай изменение в owning module/capability, когда такой boundary доказан.
- Не импортируй внутренние service, repository, model или helper соседнего
  module вместо его public boundary.
- Не вводи service bus, mediator, event framework, plugin registry или сложную
  ports system без текущей необходимости.
- Внутренние роли `presentation`, `application`, `domain`, `infrastructure`
  допустимы как объяснение ответственности, но не требуют отдельных каталогов,
  interfaces или factories.

### Write authority

- Один mutable invariant/transition имеет одного write authority.
- Shared database не означает shared business ownership.
- Cache, audit log, projection или materialized view не получают command/write
  authority автоматически.
- Direct read допустим только когда он принят и не копирует чужие business rules.

### Orchestration и composition root

- Один cross-module use case имеет одного orchestration owner.
- Orchestration не должна оседать в HTTP route, UI handler, generic utility или
  composition root.
- Composition root отвечает за settings, adapters, wiring, lifecycle, start и
  shutdown, но не за business rules или второй source of truth.
- Shared-код появляется после доказанного reuse либо для конкретного
  cross-cutting invariant, а не ради hypothetical reuse.

### Verification

Каждая значимая change unit должна иметь минимальный credible proof path:
focused test, contract/integration check, runtime smoke, CLI invocation,
browser/API flow или другой project-native evidence.

Mechanical enforcement добавляется только когда правило стабильно, важно,
дёшево проверяется и уже повторно нарушалось либо защищает security/safety.
DevRails не вводит универсальный architecture validator и не добавляет
target-language analysis в `mb-lint` или `/mb-doctor`.

### AI product boundary

Если target-продукт использует модели или AI-провайдеров, model output по
умолчанию является untrusted candidate input, а не domain fact, command или
authorization decision. Эта concern раскрывается только когда она применима и
не создаёт новый DevRails capability profile.

## Brownfield: current evidence и accepted target

Production code является сильным evidence текущего behavior, но не
автоматически нормативным target. Нужно различать две роли источников.

```text
Normative target authority:
Constitution + explicit accepted operator decisions
  -> active accepted ADR / authoritative canonical specs
  -> clarified product sources

As-is evidence:
runtime observations
  -> code / config / schemas / migrations
  -> tests / CI
  -> mapped baseline / descriptive docs

Non-authoritative working input:
labelled assumptions
```

As-is evidence устанавливает, что работает сейчас, и может доказать drift,
constraint или migration need. Оно не отменяет принятый target только потому,
что текущий код устроен иначе. И наоборот, target нельзя описывать как уже
существующий runtime.

Различие current и уже принятого target — это delta, а не authority conflict.
Если target и применимые compatibility/migration constraints уже однозначны,
нужно зафиксировать current, target и reconciliation route в существующем owning
artifact и продолжить. Operator decision требуется только при конфликте target
authorities или нерешённой material развилке направления, compatibility,
migration либо irreversible behavior. Отдельный обязательный
`Architecture Drift` block не создаётся.

Labelled assumption может направлять только non-material agent discretion. Он не
устанавливает accepted target, не закрывает authoritative backbone area и не
заменяет operator decision.

`/map-codebase` остаётся владельцем только as-is baseline. Он может фиксировать
наблюдаемые current change units/code roots, write paths/writers, ownership
signals, exposed call/API boundaries, runtime entrypoints и существующие proof
paths. Эти observations не устанавливают target authority; команда не
рекомендует и не выбирает target architecture.

Если mapping обновляет artifact, в котором уже есть accepted target, он
сохраняет этот target и явно отделяет от него наблюдаемый current state.
`/map-codebase` не создаёт и не изменяет target `AD-*`, normative rules или
architecture decisions на основании одного лишь as-is evidence. Когда current
расходится с уже принятым target, команда фиксирует оба состояния и известный
reconciliation route в существующем owning artifact, не выдавая delta за
authority conflict. Отдельный обязательный heading или artifact для этого не
вводится.

## Что уже реализовано в DevRails

| Concern | Existing owner |
|---|---|
| Global/shared executable architecture rules | `system-architecture.md#Architecture Spine` с `AD-*` |
| Responsibility, calls, data/write ownership и forbidden bypasses | `contracts/boundary-map.md` и subject-based contracts |
| Detailed architecture/API/state/data/security truth | canonical specs + optional ADR rationale |
| Product outcome и applicable design composition | `Feature` + `spec_design_links` |
| Task-local outcome, scope, links, constraints и proof | indexed single-card JSON task |
| Existing-system facts | `/map-codebase` as-is baseline |
| Build/start/entrypoint/smoke baseline | Foundation Dev Path |
| Functional и semantic evidence | `/exe`, `/verify`, `/red-verify` |
| Global design freshness after material change | `Planning Revision` + `REVIEWED_PLANNING_REVISION` |

Эта таблица объясняет существующий ownership и не является новой registry.

Из этого следуют ограничения идеи:

- не создавать отдельный Agentic-first Architecture Contract;
- не создавать slice/module artifact family или обязательную slice table;
- не дублировать Foundation Minimal Work Path в Architecture Spine;
- не копировать canonical contract bodies в feature или task;
- не добавлять owner/boundary fields в task schema;
- не менять task lifecycle для отражения architecture drift;
- при material global target change использовать существующий Planning Revision
  и полный reconciliation/review route.

## Минимальный implementation scope

### 1. `/spec-design` — точное разделение authority ролей

Требуется одно узкое behavior change: заменить единую precedence ladder,
где production code/brownfield baseline автоматически выше ADR/spec, на явное
разделение:

- as-is evidence определяет current behavior;
- normative target authority определяет accepted target;
- current/target delta не требует повторного решения, если accepted target и
  применимые compatibility/migration constraints уже однозначны;
- конфликт target authorities или нерешённая material reconciliation branch
  использует существующий operator-decision blocker;
- labelled assumptions не являются target authority;
- material target change использует существующий Planning Revision contract.

Новые sections, statuses, files, matrices или validators для этого не нужны.

В `<agent_discretion>` достаточно одной условной рекомендации: когда для
application-shaped greenfield уже рассматривается применимый architecture-style
choice, агент может предложить capability-oriented modular monolith как один
KISS-вариант. Это не default, не отдельный вопрос и не принятое решение.

### 2. `/map-codebase` — только wording clarification

Можно кратко уточнить, что as-is mapping при наличии evidence фиксирует current
change units/code roots, observed write paths/writers and ownership signals,
exposed call/API boundaries, runtime entrypoints и существующие proof paths.
Команда по-прежнему не устанавливает target authority, не создаёт roadmap без
PRD/delta и не принимает architecture decisions. При повторном mapping она
сохраняет уже принятый target, не выводит target `AD-*` или normative rules из
текущего кода и маркирует as-is claims так, чтобы downstream skill не принял их
за желаемую архитектуру.

### 3. `/spec-auto` — согласовать только authority wording

Unattended feature design наследует принятый global target. Production baseline
доказывает только current behavior/constraints и не разрешает выбрать новый
architecture style, write ownership или material migration strategy. Уже
принятые решения не запрашиваются повторно; нерешённая material branch использует
существующий blocker. Остальные current `/spec-auto` contracts достаточны.

### 4. `/autonomous` и shared autonomy policy — сохранить ту же boundary

В `/autonomous` и `workflows/autonomy-policy.md` production baseline не должен
оставаться в одном списке с источниками принятых material decisions. Unattended
flow может использовать baseline для current behavior, compatibility evidence
и constraints, но target architecture/contract/data ownership/migration route
берёт только из уже принятой normative target authority. Нерешённая material
branch сохраняет существующие halt state, owner и resume route; новый terminal
state или scheduler behavior не вводится.

Предварительный canonical change set:

Это ориентир для implementation audit, а не strict write boundary. Список
может быть уточнён, если смежные runtime contracts должны сохранить
согласованную authority semantics.

```text
skills/_shared/references/commands/spec-design.md
skills/_shared/references/commands/map-codebase.md
skills/_shared/references/commands/spec-auto.md
skills/_shared/references/commands/autonomous.md
skills/_shared/references/workflows/autonomy-policy.md
```

## Что менять не нужно

Текущие contracts уже покрывают идею, поэтому изменения не требуются в:

- `/prd-to-features` — Feature уже отделена от technical module/task;
- `/feature-to-tasks` — cohesive outcome, direct canonical links, boundary
  constraints, `touched_files`, `write_boundary` и verification context уже есть;
- `/review-tasks-plan` — semantic slicing, applicable boundary/AD/contract links
  и fresh-executor readiness уже проверяются;
- `/foundation-to-tasks` — executable baseline и proof path уже принадлежат
  Foundation;
- `/exe` — preflight уже останавливает material architecture expansion,
  contradictions и hard-boundary violation;
- `/verify` — applicable linked architecture/contract rules уже входят в
  task-scoped normative basis;
- `/red-verify` — cross-boundary harm, responsibility drift и semantic bypass
  уже допустимы как evidence-driven hostile hypotheses;
- task schema, `mb-lint`, `/mb-doctor`, scheduler, lifecycle, protocol templates,
  Foundation task model и installer.

## Dogfood до дальнейшего расширения

Проверить идею на трёх формах проекта:

- небольшое greenfield application;
- brownfield repository с current/target drift;
- CLI, library или firmware, где capability slice не является естественным
  primary unit.

Наблюдать:

1. нашёл ли fresh agent место изменения без broad scan;
2. понял ли write authority и forbidden bypass;
3. хватило ли existing task card и direct links;
4. выбрал ли он дешёвый credible proof;
5. не превратилась ли рекомендация modular monolith/slices в обязательную;
6. не появились ли лишние specs, tables, questions или blockers;
7. сохранил ли повторный mapping уже принятый target при отличающемся current;
8. не использовал ли unattended flow production baseline как разрешение выбрать
   новый target, и остановился ли он на действительно нерешённой material branch.

Только повторяющаяся evidence-backed проблема может обосновать последующее
wording в `/feature-to-tasks`, `/review-tasks-plan`, `/exe` или verification.
Даже тогда сначала используется существующий artifact и field model.

## Anti-overengineering guardrails

Подход не должен автоматически вводить:

- microservices;
- четыре слоя/каталога на каждый module;
- interface/repository/factory для каждого class;
- event bus, mediator, plugin registry, queue или distributed transaction;
- отдельный read model или provider abstraction без текущей boundary;
- generic abstractions без доказанного reuse;
- новые workflow, statuses, fields, registries, validators или artifact families;
- пустые specs и обязательные architecture tables для local/simple work.

## Критерий успеха

Fresh agent, получив task/feature и direct links, должен без чтения всей системы
понять:

- где находится естественное место изменения;
- кто владеет затронутыми writes/invariants;
- через какую boundary разрешено взаимодействие;
- что запрещено расширять или считать authority;
- каким минимальным project-native evidence проверяется outcome;
- влияет ли current/target drift на задачу.

Это должно достигаться существующими DevRails artifacts и ownership, без второго
архитектурного контракта и без расширения workflow machinery.
