# Agentic-first архитектура для DevRails: capability slices + authority boundaries

## Статус и scope

Этот документ описывает рекомендуемый подход к архитектуре target-проектов,
которые разрабатываются и проверяются AI-агентами через DevRails.

Предложение не вводит:

- новый workflow, status model, registry или task schema;
- новый обязательный artifact или file family;
- отдельный Agent Harness Contract;
- обязательный architecture validator;
- изменения scheduler, lifecycle или protocol family.

Цель — помочь агенту быстро найти место изменения, понять его полномочия и
доказать результат без чтения и перестройки всей системы.

`Agentic-first architecture` относится к способу разработки проекта. Продукт не
обязан содержать AI-функции. Если он использует модели или AI-провайдеров, их
trust boundary проектируется как отдельная применимая concern.

DevRails уже является workflow harness: skills, Memory Bank, JSON tasks,
protocols, verification и scheduler. Target-проекту нужен только минимальный
executable path, уже принадлежащий Foundation Dev Path.

## Главный принцип

Agentic-first архитектура должна обеспечивать три свойства:

1. **Change locality** — изменение находится в небольшой предсказуемой части
   системы.
2. **Authority clarity** — ясно, кто владеет invariant/state transition, через
   какую boundary разрешено изменение и какие обходы запрещены.
3. **Cheap proof path** — существует самый дешёвый достоверный
   project-native способ доказать outcome.

Dependency direction, source of truth, composition root и documentation важны
постольку, поскольку поддерживают эти свойства.

## Рекомендуемый default

Для application-shaped greenfield DevRails первым рассматривает и, если evidence
не указывает обратное, рекомендует:

- один deployable modular monolith;
- capability/vertical slices как primary change units;
- узкие application/module contracts;
- общую БД с явным write ownership либо отдельные storage boundaries, если они
  уже нужны;
- thin composition root;
- verification вокруг observable capability outcome.

Это рекомендация, а не принятое решение. Агент даёт один сильный
evidence-backed вариант; альтернативы показывает только при реальной
материальной развилке. Решения, меняющие system shape, ownership, public
contracts, storage, security, compatibility или deployment, подтверждает
оператор.

### Когда primary change unit должен быть другим

Capability slice не является универсальным правилом. Другой unit естественнее,
например, для:

- library/package — public module или package API;
- CLI — command или command family;
- firmware — subsystem, driver или control loop;
- data pipeline — pipeline stage или transformation;
- plugin ecosystem — host contract и plugin capability;
- protocol implementation — protocol layer или state machine;
- устойчивого brownfield — существующий module/bounded context;
- independently deployed system — service, если independent deployment,
  scaling, availability или ownership уже реальны.

Агент называет выбранный unit и объясняет, почему он лучше локализует текущие
изменения и verification. Гипотетический будущий scale, reuse или integration
не является достаточной причиной.

## Ownership решения

Агент самостоятельно:

- исследует codebase и runtime baseline;
- формирует и рекомендует архитектурный вариант;
- объясняет trade-offs, риски и обратимость;
- выбирает внутреннюю раскладку и implementation tactic внутри принятых границ;
- выбирает минимальную useful artifact shape.

Оператор подтверждает material choices, влияющие на architecture style, write
authority, module/runtime boundaries, public contracts, state/storage,
security/safety, compatibility, deployment и irreversible behavior.

## Минимальный Agentic-first Architecture Contract

`/spec-design` записывает в существующий architecture artifact:

```markdown
## Agentic-first Architecture Contract

- Primary change unit and code location:
- Ownership and write authority:
- Public boundary and forbidden bypasses:
- Dependency direction:
- Composition/runtime entrypoint:
- Verification path:
```

Это не новый файл и не новый status. Для `local_simple_backbone` достаточно
шести коротких строк. Для standard/strict проекта строки ссылаются на
существующие subject-based specs.

### Смысл полей

- `Primary change unit and code location` — conceptual unit и основной code
  root, с которого агент начинает чтение.
- `Ownership and write authority` — принадлежащие unit invariants, transitions
  и commands. Один mutable invariant/transition имеет одного write authority.
- `Public boundary and forbidden bypasses` — минимальный разрешённый contract и
  самые опасные direct обходы.
- `Dependency direction` — реальные значимые module edges, а не декоративная
  линейная layer formula.
- `Composition/runtime entrypoint` — место wiring и, когда применимо, команда
  запуска или package entrypoint.
- `Verification path` — focused test, contract test, runtime smoke, CLI
  invocation, browser/API flow или другое минимальное credible evidence.

Один write authority не означает одну физическую representation данных. Audit
log, cache, projection или materialized view могут существовать, но не получают
command/write authority автоматически.

## Feature, slice и task — разные сущности

```text
Feature = независимо ценный product outcome.
Slice/module = долгоживущая ownership и authority boundary.
Task = cohesive independently verifiable изменение.
```

Следствия:

- feature может затрагивать несколько slices;
- один slice обычно обслуживает несколько features;
- task обычно имеет один primary owning slice/module;
- cross-slice task допустима при cohesive outcome и ясном orchestration owner;
- technical module, migration или integration не становятся product feature без
  собственного observable outcome.

Нельзя механически создавать один slice на каждый `FT-*`.

## Capability slices

Slice выражает связную пользовательскую или операционную capability.

Хорошие примеры: `catalog`, `checkout-payment`, `delivery-tracking`,
`photo-intake`, `plant-operations`.

Плохие primary slices: `controllers`, `repositories`, `services`, `utils`,
`database`.

Технические роли могут существовать внутри slice или в минимальном shared
substrate, но не становятся primary delivery units.

### Optional slice table

Для standard проекта с несколькими значимыми boundaries достаточно:

```markdown
| Module / Slice | Code root | Owns / must not own | Public boundary | Allowed dependencies | Verification |
|---|---|---|---|---|---|
```

Таблица нужна только когда ownership влияет на несколько features, shared state
или cross-module calls. Local/simple проект обходится шестью строками общего
контракта.

### Внутренняя структура

Внутри slice могут существовать conceptual роли `presentation`, `application`,
`domain`, `infrastructure`. Это не обязательные каталоги, interfaces или
factories.

Фактические правила важнее названий:

- presentation вызывает application boundary;
- application использует domain rules и нужные ports;
- infrastructure реализует adapters;
- framework/transport details не определяют business rules;
- composition root видит concrete implementations только для wiring.

## Связи между slices

### Public boundary

Slice не импортирует внутренние service, repository, model или helper соседнего
slice. Вызов проходит через небольшой owning application/module contract.
Обычной функции, interface или facade часто достаточно.

Не нужно автоматически вводить service bus, mediator, event framework, plugin
registry или сложную ports system.

### Write authority

- соседний slice не изменяет чужое state или таблицы напрямую;
- behavior-sensitive read предпочтительно идёт через owning boundary;
- direct read допустим, если он явно принят и не копирует чужие business rules;
- read-only projection не получает write authority;
- shared database не означает shared business ownership.

### Cross-slice orchestration

Один use case имеет одного orchestration owner: owning application use case,
реальный workflow slice или существующий application composition boundary.

Оркестрация не должна оседать в HTTP routes, UI handlers, generic utils или
composition root. Третья abstraction допустима только как реальная capability
или shared contract, а не для маскировки dependency cycle.

Transaction, retry, idempotency, rollback и eventual consistency раскрываются
только при реальном cross-slice write, external side effect, event/queue,
migration, irreversible operation или partial-failure risk.

## Thin composition root

Composition root отвечает за settings, adapters, wiring, routes/handlers,
lifecycle hooks, start и shutdown.

Он не должен содержать business rules, state transitions, product data
transformations, persistence semantics, feature fallbacks или параллельный
source of truth.

Если wiring растёт, его можно группировать небольшими module factories без
автоматического DI framework или plugin registry.

## Shared-код

> Начинай в owning slice. Выноси в shared после доказанного повторного
> использования или когда единый механизм защищает конкретный cross-cutting
> invariant.

В shared обычно допустимы runtime primitives, bootstrap helpers,
serialization/error primitives, auth/security primitives, transport-neutral
contracts и UI primitives без business meaning.

Не следует заранее выносить business rules одного slice, feature orchestration,
специфичные state machines, generic repositories/services и models ради
потенциального reuse.

## Presentation contours

Web, Admin UI, bot, CLI и API реализуют presentation boundaries одной
capability, а не создают отдельные domain models или sources of truth.

Platform-specific outcome проверяется в соответствующей среде. Browser smoke не
доказывает Telegram, native, embedded или hardware behavior, если различие
materially влияет на результат.

## AI product boundary

Model output по умолчанию является untrusted candidate input, а не domain fact,
command или authorization decision.

Применимый путь может выглядеть так:

```text
authorized input
  -> provider adapter
  -> typed candidate
  -> validation / safety guard
  -> owning domain command
  -> authoritative state
```

Не каждый проект требует всех шагов. Но raw model output, chat, UI presentation,
audit log и hidden reasoning не должны молча становиться authority.

Development-agent permissions относятся к runtime policy DevRails. Application
architecture и task `write_boundary` не заменяют sandbox, network, secrets или
production permissions. Новый capability profile здесь не вводится.

## Verification и mechanical enforcement

Каждый значимый primary change unit имеет минимальный credible verification
path. Агент выбирает только применимые unit, integration, contract, e2e или
platform checks пропорционально риску.

Documentation и review являются default. Project-native lint, structural test,
import rule или contract check добавляется только когда правило:

- стабильное;
- важное или high-blast-radius;
- дешёво и достаточно точно проверяется;
- уже повторно нарушалось либо относится к security/safety.

```text
Hypothetical one-time concern -> documentation/review
Repeated forbidden imports   -> project-native import lint
Critical foreign write       -> structural/integration test
Subjective organization      -> no validator
```

DevRails не вводит универсальный architecture validator и не добавляет
target-language analysis в `mb-lint` или `/mb-doctor`.

## Foundation и executable baseline

Отдельный Agent Harness Contract не нужен. Existing Foundation Dev Path доказывает
только minimum baseline, без которого feature work нельзя безопасно начать:

- build/invocation command;
- primary entrypoint;
- start path, если нужен runtime;
- минимальный smoke/test;
- storage/test seam, только если применим.

Правило:

> Provide the cheapest reproducible path that proves the executable baseline.

Примеры:

| Project shape | Достаточный proof |
|---|---|
| Library | build/typecheck + focused test |
| CLI | build + реальная command invocation |
| Stateless API | start + primary endpoint smoke |
| Web UI | start + один browser/HTTP acceptance path |
| DB application | minimal fixture + persistence proof |
| External integration | local fake/sandbox либо explicit checkpoint |

Seed, reset, isolated ports/DB, observability и teardown добавляются только
когда без них повторный запуск недостоверен или autonomous/parallel work реально
конфликтует.

Foundation не реализует product slices и future-ready platform abstractions.
Его gates и scheduler policy остаются в `foundation.md` и workflow artifacts, а
не в product Architecture Spine.

## Brownfield: current и target

Production code является сильным evidence текущего behavior, но не
автоматически нормативным target.

Нужно разделять:

```text
Normative authority:
accepted operator decisions -> accepted target / ADR -> canonical specs
-> clarified product sources -> labelled assumptions

As-is evidence:
runtime observations -> code/config/schema/migrations -> tests/CI
-> mapped baseline -> descriptive docs
```

При значимом конфликте используется optional block:

```markdown
## Architecture Drift

- Current:
- Accepted target:
- Reconciliation route:
```

Если drift отсутствует или не влияет на scope, пустая секция не создаётся.

Нельзя объявлять workaround нормативным без решения, описывать target как уже
работающий runtime, поддерживать два write authority для одного invariant или
создавать третий competing path для обхода конфликта.

## Architecture Spine

Существующая форма сохраняется:

```markdown
#### AD-NNN - <short decision>
- Binds:
- Prevents:
- Rule:
- Verification:
- Source:
```

В Spine попадают только executable product-architecture rules: write authority,
module/runtime boundaries, public contracts, AI trust, security/safety,
compatibility, deployment и irreversible data behavior.

Task lifecycle, Foundation gates, scheduler и DevRails workflow policy остаются
в своих owning artifacts. ADR создаётся только при durable value.

## Adaptive depth

### Local/simple

Достаточно общего шестистрочного контракта. Slice table, ADR и отдельные specs
не создаются без потребности.

### Standard

Ожидаются meaningful slice boundaries, real dependency direction, thin
composition root, write ownership и acceptance paths. Brownfield drift block
добавляется только при реальном расхождении.

### Strict/risky

Раскрываются только применимые public contracts, state/data lifecycle,
authorization/safety, AI trust, migrations, compatibility, runtime isolation,
failure, retry, idempotency, audit и recovery semantics.

Strict depth не означает больше обязательных files, gates или validators.

## Anti-overengineering guardrails

Подход не должен автоматически вводить:

- microservices;
- четыре слоя/каталога на каждый slice;
- interface/repository/factory для каждого class;
- event bus, mediator или plugin registry;
- events, queues, WebSocket/SSE или distributed transactions «на будущее»;
- provider abstraction вне реальной external boundary;
- отдельный read model без текущей потребности;
- generic abstractions без доказанного reuse;
- новый harness contract или capability profile;
- architecture workflow, registry, status или task fields;
- mandatory validators;
- пустые specs.

Дополнительная сложность допускается только по текущему requirement, constraint,
risk или доказанному повторению.

## Влияние на skills

### P0 — первый этап

`/spec-design`:

- выбирает/recommends primary change unit;
- использует modular monolith + capability slices как application default;
- записывает шестистрочный contract;
- создаёт slice table и drift block только при необходимости;
- разделяет normative target и as-is evidence;
- оставляет material decisions оператору.

`/map-codebase` фиксирует current change units, code roots, write authorities,
public boundaries, composition/runtime entrypoints и существующий verification
path. Он не выбирает target architecture.

`/spec-auto` наследует принятый global contract и не выбирает architecture или
ownership заново.

`/feature-to-tasks` без новых task fields:

- определяет primary owning module;
- добавляет direct task-relevant canonical links через existing fields;
- фиксирует foreign-boundary constraints только когда они применимы;
- сохраняет cohesive independently verifiable outcome.

`/review-tasks-plan` добавляет один criterion:

> Fresh executor должен по task card и direct links определить owning module,
> разрешённую boundary, запрещённое expansion и verification path без broad
> repository scan и без invention material design.

### P1 — только после dogfood

`/exe` на preflight подтверждает primary owner и останавливается при foreign
state write, boundary bypass или material architecture expansion.

`/verify` проверяет architecture rule только когда она относится к task outcome
или linked spec.

`/red-verify` может проверять direct foreign writes, duplicate authority,
orchestration leakage и boundary bypass как optional hostile hypotheses.

### Не менять сначала

Идея не требует изменений в `/autopilot`, `/autonomous`, `/mb-sync`,
`/mb-garden`, `/mb-doctor`, `mb-lint`, task schema/IDs/lifecycle, scheduler
checkpoint model, protocol templates или Foundation task model.

## Phased adoption

### Phase 1

Изменить contracts/documentation:

```text
IDEAS/_arch-impr.md
spec-design.md
map-codebase.md
spec-auto.md
feature-to-tasks.md
review-tasks-plan.md
```

Опционально добавить одну узкую preflight/hypothesis формулировку в `exe.md` и
`red-verify.md`.

Scripts, schema, doctor и scheduler не менять.

### Phase 2

Провести dogfood на:

- небольшом greenfield application;
- brownfield repository;
- CLI или library.

Проверить:

1. агент быстро нашёл primary change unit;
2. правильно понял write authority;
3. не обошёл соседний boundary;
4. ему хватило direct task context;
5. он дёшево доказал outcome;
6. framework не создал лишние specs, questions или blockers.

Только повторяющиеся evidence-backed проблемы становятся следующими framework
changes.

## Критерии успешности

Fresh agent, получив task/feature и direct links, должен без чтения всего
проекта ответить:

1. Кто владеет изменением и где code root?
2. Какие invariants/writes принадлежат owner?
3. Что запрещено менять или считать authority?
4. Через какой contract идёт взаимодействие?
5. Где composition/runtime entrypoint?
6. Какой минимальный evidence доказывает outcome?
7. Есть ли current/target drift, влияющий на task?

При этом система не должна платить за ясность новой task model, runtime
workflow, mandatory validators, duplicated specs или лишними abstractions.

## Итог

> DevRails рекомендует архитектуру, в которой primary change unit локализован,
> его полномочия и границы явны, а результат проверяется минимальным
> project-native способом. Для обычных приложений default — modular monolith с
> capability slices и thin composition root. Другой architecture style допустим,
> если он лучше соответствует реальной природе проекта. Дополнительные specs,
> runtime mechanisms и mechanical checks вводятся только по текущей
> необходимости или подтверждённому риску.
