# Agents-first architecture для DevRails: capability slices + authority boundaries

## Статус предложения

Этот документ описывает рекомендуемый подход к проектированию приложений в
DevRails. Он не вводит новый workflow, status model, registry, validator или
обязательный набор файлов.
Главная цель документа — определить подход `Agent-first development architecture for target projects`:
архитектуру, оптимизированную для разработки и тестирования AI-агентами. Такая
архитектура должна помогать агенту быстро локализовать изменение, однозначно
определить ownership и допустимые зависимости, внести ограниченную правку и
подтвердить результат минимальным достоверным verification path без чтения и
перестройки всей системы.

В этом документе `Agents-first architecture` характеризует способ разработки и
проверки системы, а не требует наличия AI-функций в самом продукте. Если
продукт использует модели или AI-провайдеров, их trust boundaries проектируются
как отдельная применимая concern.

Предложение предназначено прежде всего для `/spec-design` и связанных
design-to-task handoff. Его задача — превратить эту цель в компактный
архитектурный контракт, сохранив свободу проектирования, KISS и ownership
материальных решений за оператором.

## Краткая формулировка

Для приложений DevRails по умолчанию рекомендует один deployable modular
monolith, организованный вокруг capability/vertical slices.

Каждый slice:

- представляет законченную пользовательскую или операционную capability;
- является основной единицей проектирования, изменения и проверки;
- явно определяет, чем он владеет и чем владеть не должен;
- имеет один источник истины для принадлежащего ему mutable state;
- предоставляет соседям узкий публичный application contract;
- имеет минимальный acceptance/verification path.

Центральный composition root только собирает приложение. Он не становится
вторым местом для бизнес-логики, persistence semantics или cross-slice правил.

Это рекомендуемый default, а не универсально обязательная архитектура. Агент
может предложить другой подход, если природа проекта или подтверждённые
ограничения делают capability slices неподходящими. Материальный выбор
архитектуры подтверждает оператор.

## Почему такой подход подходит Agents-first разработке

Агентам проще надёжно изменять систему, когда одновременно выполняются два
условия:

1. Изменение локализовано в небольшой, предсказуемой части кода.
2. Полномочия, источники истины и запрещённые переходы явно описаны.

Capability slices обеспечивают первое условие: агент начинает не с поиска
технических слоёв по всему репозиторию, а с owning capability и её тестового
контура.

Authority boundaries обеспечивают второе: агент понимает, какой модуль вправе
менять состояние, какие данные являются только projection/audit/input и через
какую границу должно пройти изменение.

По отдельности этих свойств недостаточно:

- изолированные slices без ясного ownership могут по-разному интерпретировать
  одни данные или обходить инварианты друг друга;
- хорошо описанные полномочия без физической локальности приводят к широкому
  импортному графу, циклам и необходимости читать значительную часть системы
  для локального изменения;
- тонкие модули не помогают, если вся оркестрация и бизнес-логика перемещается в
  огромный runtime/composition layer.

Цель гибрида — совместить локальность кода, смысловую ясность и дешёвую
проверяемость.

## Что является default, а что контрактом

### Рекомендуемый default для приложений

Агент должен первым рассматривать и, если evidence не указывает обратное,
рекомендовать:

- один deployable modular monolith;
- capability/vertical slice как primary change unit;
- одну общую runtime-композицию;
- узкие синхронные module contracts;
- общую БД с явным write ownership либо отдельные storage boundaries, если они
  уже обоснованы требованиями;
- тестирование вокруг capability и её acceptance-сценария.

Default не является заранее принятым решением. Агент объясняет рекомендацию,
альтернативы приводит только при наличии реальной материальной развилки, после
чего оператор подтверждает архитектурный выбор.

### Инвариантные Agents-first свойства

Независимо от выбранного архитектурного стиля должны быть определены:

- primary change unit;
- ownership и source of truth;
- module/boundary responsibilities;
- допустимое направление зависимостей;
- composition/runtime entrypoint;
- минимальный verification path.

Эти свойства важнее названия паттерна и конкретной структуры каталогов.

### Когда агент должен предложить другой вариант

Отклонение от modular monolith + capability slices оправдано, если есть
конкретное evidence, например:

- проект является библиотекой, firmware, CLI, plugin ecosystem или data
  pipeline, а не приложением с пользовательскими capabilities;
- brownfield уже имеет устойчивую, понятную и проверяемую архитектуру;
- компоненты действительно требуют независимого deployment, scaling,
  availability или ownership;
- protocol, driver, subsystem или pipeline stage является более естественной
  единицей изменения;
- capability slicing создаёт искусственные зависимости или дублирование;
- нормативные security, isolation или regulatory constraints требуют другой
  физической границы.

Агент должен назвать предлагаемую primary change unit и объяснить, почему она
лучше обслуживает текущие требования. Проектирование под гипотетический будущий
scale, интеграции или reuse не является достаточной причиной.

## Ownership архитектурного решения

Агент свободен:

- исследовать codebase и runtime baseline;
- формировать архитектурные варианты;
- выбирать наиболее сильную рекомендацию;
- объяснять trade-offs, риски, обратимость и стоимость;
- предлагать внутреннюю структуру реализации;
- выбирать локальную техническую тактику внутри принятых границ.

Когда evidence достаточно, агент должен рекомендовать один вариант, а не
перекладывать анализ на оператора нейтральным перечнем возможностей.

Оператор подтверждает материальные решения, влияющие на:

- architecture style и primary system shape;
- source of truth и write ownership;
- module/runtime boundaries;
- public API, event, data и agent I/O contracts;
- security и safety posture;
- deployment topology и operational cost;
- compatibility и migrations;
- irreversible data behavior.

Агент самостоятельно выбирает обратимую внутреннюю раскладку кода, если она не
меняет эти решения. Файловая структура, имена внутренних типов, локальный
composition pattern и конкретная реализация test seam сами по себе не требуют
решения оператора.

## Минимальный Agents-first Architecture Contract

`/spec-design` должен записывать в выбранный architecture artifact компактный
контракт:

```markdown
## Agents-first Architecture Contract

- Primary change unit:
- Ownership and source of truth:
- Module boundaries:
- Dependency direction:
- Composition/runtime entrypoint:
- Verification path:
```

Это не новый файл и не новый status. Для `local_simple_backbone` контракт может
состоять из шести коротких строк. Для сложного проекта его пункты раскрываются в
существующих subject-based architecture, contract, domain, state, testing и
runbook specs.

## Capability slice как единица проектирования

### Назначение slice

Slice должен выражать одну связную capability, которую можно объяснить через
наблюдаемый результат для пользователя, оператора или системы.

Хорошие примеры:

- `catalog`;
- `checkout-payment`;
- `delivery-tracking`;
- `plant-operations`;
- `photo-intake`;
- `safety-task-loop`.

Плохие примеры primary slices:

- `controllers`;
- `repositories`;
- `utils`;
- `database`;
- `services`.

Технические слои могут существовать внутри slice или как минимальный shared
substrate, но не должны становиться основной единицей поставки продуктовой
ценности.

### Контракт slice

Для каждого значимого slice достаточно определить:

```markdown
| Module / Slice | Owns | Must not own | Public boundary | Allowed dependencies | Acceptance / verification |
|---|---|---|---|---|---|
```

Смысл полей:

- `Owns` — данные, инварианты, transitions и команды, за которые slice отвечает;
- `Must not own` — соседние полномочия, presentation projections, внешние
  authority или опасные обходные пути;
- `Public boundary` — минимальный application contract для потребителей;
- `Allowed dependencies` — разрешённое направление вызовов;
- `Acceptance / verification` — самый дешёвый достоверный способ доказать
  capability.

Не нужно детализировать таблицу для каждого маленького локального компонента.
Она нужна для границ, которые влияют на scope, authority, shared state или
несколько features.

### Внутренняя структура slice

Предпочтительная модель может включать:

- `presentation` — HTTP/UI/bot/CLI boundary;
- `application` — use cases и orchestration;
- `domain` — инварианты, state transitions и domain types;
- `infrastructure` — persistence и внешние adapters.

Это понятийные роли, а не обязательные четыре каталога. Маленький slice не
должен получать пустые слои, interfaces и factories только ради шаблона.

Фактическое правило зависимостей важнее названий:

- presentation вызывает application boundary;
- application использует domain rules и необходимые ports;
- infrastructure реализует ports и зависит от domain/application contracts, а
  не наоборот;
- framework и transport details не определяют бизнес-правила;
- composition root является явным исключением, которому разрешено видеть
  конкретные реализации для сборки приложения.

Линейная формула вроде
`presentation -> application -> domain -> infrastructure` не должна заменять
описание реального dependency graph.

## Связи между slices

### Основное правило

Slice не должен импортировать внутренние service, repository, model или helper
соседнего slice.

Если одна capability использует другую, вызов проходит через небольшой
публичный application contract owning slice. Контракт должен быть настолько
узким, насколько требует текущий use case.

Не нужно автоматически вводить service bus, mediator, event framework или
сложную систему ports. Обычной функции, интерфейса или facade часто достаточно.

### Write ownership

Mutable state имеет одного владельца записи.

- Соседний slice не изменяет чужие таблицы или state напрямую.
- Cross-slice read допустим, если он явно описан и не копирует чужие бизнес-
  правила.
- Поведение-sensitive read предпочтительно получать через owning boundary.
- Read-only projection может читать общие данные напрямую, если это принятое
  решение, projection не становится authority и не расширяет write rights.

Общая БД допустима и часто оптимальна для modular monolith. Shared database не
означает shared business ownership.

### Cross-slice orchestration

Если use case затрагивает несколько slices, должен быть один владелец
оркестрации:

- owning application use case;
- явно определённый workflow slice, если workflow сам является capability;
- существующий application composition boundary.

Оркестрация не должна случайно оседать в HTTP routes, UI, bot handlers,
generic utils или composition root.

Если два slices напрямую зависят друг от друга, сначала нужно уточнить ownership
и выбрать одно направление. Создание третьей абстракции допустимо только когда
она представляет реальную отдельную capability или подтверждённый shared
contract, а не используется для маскировки цикла.

## Тонкий composition root

Composition root отвечает за:

- создание settings и runtime dependencies;
- выбор конкретных adapters;
- сборку modules/slices;
- регистрацию routes, handlers и lifecycle hooks;
- запуск и корректное завершение приложения.

Composition root не должен:

- содержать бизнес-правила;
- определять state transitions;
- преобразовывать domain data по продуктовым правилам;
- становиться отдельным persistence layer;
- хранить параллельный runtime source of truth;
- реализовывать feature-specific fallback;
- подменять application orchestration.

Если composition root быстро растёт, wiring можно группировать по slice через
небольшие module factories. Это организационный приём, а не основание вводить DI
framework или plugin registry.

## Authority boundaries

### Единый источник изменяемого состояния

Для каждой категории mutable state должен быть один authoritative owner.

Архитектура явно различает:

- mutable runtime state;
- immutable artifacts;
- audit/export history;
- read models и projections;
- UI state;
- external input;
- AI/model candidate output;
- governance или human decision evidence.

Projection, audit record или cached representation не получают write authority
только потому, что содержат похожие данные.

### AI и другие недоверенные границы

Когда проект использует AI, model output по умолчанию является недоверенным
candidate input, а не domain fact, command или authorization decision.

Применимый строгий путь выбирается по риску и может включать:

```text
authorized input
  -> provider adapter
  -> typed candidate output
  -> validation/classification
  -> current authorization/safety guard
  -> owning domain command
  -> authoritative state
```

Не каждый проект нуждается во всех этапах. Но AI output, UI presentation,
raw chat, audit log и скрытое reasoning не должны молча становиться источником
истины или каналом команд.

Для safety-, security- и data-sensitive boundaries точные inputs, outputs,
errors, trust assumptions и stop conditions принадлежат owning subject specs.
Обычные внутренние функции не требуют такого уровня контрактов.

## Shared-код

Базовая рекомендация:

> Начинай в owning slice. Выноси в shared после доказанного повторного
> использования или когда единый механизм защищает конкретный cross-cutting
> invariant.

Правило «минимум два потребителя» полезно как эвристика, но не является
валидатором. Auth, security, transaction, redaction, serialization или
AI-provider boundary могут обоснованно стать shared раньше, если дублирование
создаёт реальный риск расхождения.

В shared обычно допустимы:

- runtime/framework primitives;
- database/bootstrap helpers;
- error и serialization primitives;
- auth/security primitives;
- transport-neutral contracts;
- UI primitives без business meaning;
- действительно общие cross-cutting policies.

В shared не следует заранее выносить:

- бизнес-правила одного slice;
- feature orchestration;
- специфичные state machines;
- модели только ради потенциального reuse;
- generic repository/service abstractions без текущей повторяемости.

## Presentation contours

Если одна capability доступна через несколько surfaces — Web, Admin UI,
Telegram bot, CLI, API — каждый surface реализует только свой presentation
boundary.

Business ownership остаётся у одного slice. Новый UI-контур не создаёт второй
domain model, второй API family или параллельный source of truth.

Contour-specific runtime adapters допустимы для theme, lifecycle, safe-area,
transport verification и других реальных platform constraints. Platform-
specific поведение проверяется в соответствующем окружении; обычный browser
smoke не считается доказательством Telegram, native или hardware boundary.

## Verification model

Каждый slice должен иметь минимальный достоверный verification path:

- acceptance-сценарий подтверждает capability;
- unit tests закрывают рискованные инварианты и policies;
- integration tests проверяют persistence и module contracts;
- e2e проверяет реальный пользовательский или операционный путь, когда это
  оправдано риском;
- platform-specific verification применяется только для реальной platform
  boundary.

Это не обязательная полная test pyramid для каждого изменения. Агент выбирает
минимально достаточное доказательство пропорционально риску.

DevRails не должен вводить специальные architecture validators для этого
подхода. Existing tests, type checks, lint, runtime smoke, review и acceptance
evidence достаточны, если они подтверждают конкретное изменение. Отсутствие
нового validator не отменяет требование соблюдать принятые boundaries.

## Foundation и executable baseline

Foundation Dev Path остаётся полезным, когда features нельзя безопасно начать
без walking skeleton.

Минимальный baseline должен отвечать только на практические вопросы:

- как собрать проект;
- как его запустить;
- где primary entrypoint;
- какой smoke path доказывает wiring;
- как подключается минимальный storage/test seam;
- какой test command подтверждает baseline.

Foundation не должен заранее реализовывать product slices, state machines или
широкие abstractions. Existing brownfield baseline может сделать отдельную
Foundation queue ненужной.

Foundation workflow gates принадлежат `foundation.md` и workflow contracts.
Они не должны попадать в application Architecture Spine как продуктовые
архитектурные решения.

## Current reality и target architecture

Для brownfield важно различать фактическое и нормативное состояние:

```markdown
## Architecture Baseline

- Current runtime:
- Accepted target:
- Known drift:
- Reconciliation route:
```

Production code является authoritative evidence текущего поведения, но не
автоматически оптимальной target architecture.

При конфликте между code reality и принятым target агент должен:

1. Зафиксировать current baseline без украшения.
2. Показать accepted target и конкретное расхождение.
3. Предложить принять baseline, определить migration route, ограничить scope
   локальным delta или заблокировать работу до решения.
4. Получить решение оператора, если выбор меняет архитектурный контракт.

Нельзя:

- молча объявлять временную реализацию нормативной;
- описывать target stack как уже работающий runtime;
- поддерживать два production source of truth;
- позволять debug/dev runtime незаметно стать отдельной production
  архитектурой;
- исправлять расхождение созданием третьего конкурирующего пути.

Это требует правки текущего понимания source precedence в `/spec-design`:
production code имеет высокий приоритет как `as-is evidence`, но принятый
operator/ADR/spec target может требовать явной миграции вместо автоматического
подчинения спецификации текущему коду.

## Architecture Spine

Для shared-boundary, state/data, runtime, security/safety и strict решений
сохраняется компактная форма:

```markdown
#### AD-NNN - <short decision>
- Binds:
- Prevents:
- Rule:
- Verification:
- Source:
```

В Architecture Spine должны попадать только решения, ограничивающие архитектуру
продукта:

- source of truth;
- ownership;
- module и runtime boundaries;
- AI trust boundaries;
- security/safety;
- compatibility;
- deployment;
- irreversible data behavior.

Подробная мотивация выносится в ADR только при наличии долговременной ценности.
Task lifecycle, Foundation gates и scheduler policy остаются в своих workflow-
артефактах.

`Verification` ссылается на существующий test, smoke, acceptance flow или review
evidence. Поле не требует создания отдельного architecture validator.

## Документация и agent legibility

Архитектурная документация должна помогать агенту быстро ответить:

- где owning slice;
- где authoritative state;
- через какой boundary разрешено изменение;
- какие соседние области запрещены;
- как проверить результат.

Главные router/index файлы остаются короткими картами. В них не должны
накапливаться feature repair audits, task history и длинные changelog entries.

Subject spec создаётся или разделяется только при наличии отдельного:

- boundary;
- owner/consumer;
- change cadence;
- compatibility contract;
- security/safety concern;
- operational или verification need.

Не нужно создавать spec для каждой комбинации feature, слоя и вида теста.
Feature остаётся composition root поведения и ссылается только на применимые
canonical subject specs.

## Адаптация глубины

### Local/simple

Достаточно:

- назвать primary change unit;
- указать source of truth;
- описать одну-две значимые границы;
- назвать entrypoint и verification path;
- объяснить неприменимые concerns без создания пустых specs.

### Standard application

Ожидается:

- modular monolith + capability slices как default recommendation;
- module/slice ownership table;
- реальное направление зависимостей;
- тонкий composition root;
- storage/write ownership;
- acceptance path для основных slices;
- current/target reconciliation для brownfield.

### Strict/risky

Дополнительно раскрываются только применимые:

- public contracts;
- state/data lifecycle;
- authorization и safety boundaries;
- AI/provider trust boundary;
- migrations и compatibility;
- deployment/runtime isolation;
- failure, idempotency, audit и recovery semantics.

Strict depth не означает автоматическое создание большего числа файлов,
workflow gates или validators.

## Anti-overengineering guardrails

Подход не должен автоматически вводить:

- микросервисы;
- обязательные четыре слоя и четыре каталога на каждый slice;
- repository/interface/factory для каждого класса;
- event bus, mediator или plugin registry;
- событие для каждой write-операции;
- polling, SSE, WebSocket или queue architecture «на будущее»;
- provider abstraction вне реальной external/AI boundary;
- distributed transactions;
- отдельный read model без текущей потребности;
- generic business abstractions без подтверждённого reuse;
- отдельный architecture workflow, registry или status model;
- architecture validators только ради соблюдения шаблона;
- пустые specs для неприменимых concerns.

Дополнительная сложность допустима только при наличии текущего требования,
ограничения, риска или доказанного повторения.

## Предлагаемое влияние на `/spec-design`

При будущей доработке `/spec-design` целесообразно:

1. Сохранить ownership материальных архитектурных решений за оператором.
2. Требовать от агента одну evidence-backed рекомендацию, когда evidence
   достаточно; альтернативы показывать только при реальном trade-off.
3. Сделать modular monolith + capability slices default recommendation для
   приложений, но разрешить обоснованное отклонение.
4. Добавить компактный `Agents-first Architecture Contract` в существующий
   architecture artifact.
5. Расширить описание значимых modules/slices полями `Owns`, `Must not own`,
   `Public boundary`, `Allowed dependencies`, `Acceptance / verification`.
6. Различать `current runtime`, `accepted target`, `known drift` и
   `reconciliation route` для brownfield.
7. Уточнить source precedence: production code — сильное `as-is evidence`, но
   не автоматический нормативный target.
8. Сохранять composition root тонким и не переносить в него application/domain
   orchestration.
9. Держать Architecture Spine продуктовым; Foundation/task workflow rules
   оставлять в owning workflow artifacts.
10. Не добавлять новые validators, обязательные слои, file families, workflow
    statuses или registries.

Связанные команды, которые должны согласованно использовать выбранные
boundaries, — `/spec-auto`, `/feature-to-tasks` и `/review-tasks-plan`. Они не
должны заново выбирать архитектуру: их задача — наследовать primary change
unit, ownership, dependency direction и verification path из принятого global
backbone и применимых subject specs.

## Критерии успешности подхода

Подход успешен, если новый агент, получив feature/task и минимальный набор
ссылок, может без чтения всего проекта ответить:

1. Какой slice или module владеет изменением?
2. Какие данные и инварианты принадлежат ему?
3. Что ему запрещено менять или считать authority?
4. Через какой contract он взаимодействует с соседями?
5. Где приложение собирается и запускается?
6. Каким минимальным доказательством подтверждается результат?
7. Совпадает ли описанная архитектура с реальным runtime?

Одновременно система не должна платить за эту ясность микросервисами, лишними
абстракциями, дублирующими specs или дополнительным процессом без текущей
потребности.
