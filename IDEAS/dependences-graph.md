# Граф зависимостей модулей и контрактов

## 1. Цель

DevRails должен формировать и поддерживать один канонический граф значимых
module/change units проекта и контрактов между ними. Узлы графа представляют
реализационные модули, capability slices, bounded contexts или другие принятые
primary change units. Направленные рёбра представляют зависимости, а каждое
ребро ссылается на контракт, через который разрешено взаимодействие.

Каноническим владельцем графа становится
`.memory-bank/contracts/boundary-map.md`. Граф развивается по мере появления
реализационной конкретики и остаётся пригодным как для первичной генерации, так
и для последующей доработки уже работающего проекта.

Результат должен позволять агенту по новой feature или delta быстро определить:

- какие модули владеют затронутым поведением и состоянием;
- какие контракты меняются или используются;
- какие непосредственные и транзитивные consumers могут быть затронуты;
- где совместимая граница останавливает распространение изменений;
- какие implementation prerequisites определяют порядок задач и waves;
- какие contract и integration proofs нужны для проверки результата.

Граф не становится новым task model, lifecycle или scheduler contract. Он
служит архитектурным входом для существующих implementation plans, JSON task
records, review и verification flow.

## 2. Зачем это нужно

Сейчас DevRails уже фиксирует architecture units, ownership, allowed
dependencies, canonical contracts и task dependencies, но эти сведения не
собраны в одну явную структуру, по которой удобно восстанавливать blast radius.
Агенту приходится повторно выводить связь модулей из повествовательных specs,
кода, feature links и task context. При последующих изменениях это повышает
риск пропустить скрытого consumer, прямую запись чужого состояния или
несовместимое изменение контракта.

Граф закрывает промежуток между SDD и task generation:

```text
feature / delta
  -> затронутые module/change units
  -> dependency edges и contracts
  -> impact analysis
  -> обоснованный implementation order
  -> task cards, depends_on и waves
```

Особенно полезен он для живого brownfield-проекта. Внутренняя правка реализации
может остаться локальной, а изменение public contract, state semantics или
write ownership получает явный список зависимых модулей до начала реализации.
Это уменьшает зависимость от размера текущего контекстного окна и делает
последующие feature/refactoring runs более предсказуемыми.

Граф не заменяет tests, mutation testing или независимую verification. Он
определяет, что способно быть затронуто и какие границы нужно проверить. Само
доказательство корректности остаётся у существующих gates, `/verify` и
`/red-verify`.

## 3. Почему именно так

### Один канонический владелец

`boundary-map.md` уже является canonical contract input для decomposition,
implementation и verification. Создание отдельной `.memory-bank/graph/`,
module registry или нового task field породило бы конкурирующий source of truth.
Поэтому существующий Boundary Map лучше превратить из набора свободных заметок
в компактный граф.

Текущий шаблон файла содержит `Boundary Notes`, а затем повторяет ту же границу
в повествовательном блоке через `Owner`, `Consumers`, `Allowed calls`,
`Forbidden calls`, `Data owner`, `Compatibility rule` и `Verification`.
Добавление графа поверх этой формы утроило бы одни и те же сведения. В новой
форме таблица графа владеет топологией, а contract body — только правилами
взаимодействия.

Предполагаемая компактная форма:

```markdown
## Modules

| Module / Change Unit | Parent Architecture Unit | Code Root | Responsibility |
|---|---|---|---|

## Dependency Graph

`Consumer -> Provider` означает, что Consumer зависит от Provider.

| Consumer | Provider | Kind | Contract |
|---|---|---|---|
| checkout | pricing | query | [Pricing Query](#pricing-query) |
| checkout | inventory | command | [Reservation Contract](reservation.md) |

## Inline Contracts

### Pricing Query

- Public surface:
- Allowed interaction:
- State/data authority:
- Failure and compatibility rules:
- Forbidden bypass:
- Verification:
```

`Modules` является единственным inventory конкретных change units.
`Dependency Graph` является единственным местом, где записываются
consumer/provider и направление зависимости. Contract body не повторяет эти
поля. Сложный или переиспользуемый контракт живёт в отдельном subject-based
`contracts/*.md`; простая внутренняя граница может использовать inline contract
в самом `boundary-map.md`.

Subject contract описывает shape, semantics, errors, compatibility и proof, но
не ведёт собственный список consumers. Reverse usage выводится из графа. Это
снижает риск рассинхронизации двух списков при добавлении нового потребителя.

### Два уровня декомпозиции

`/spec-design` действительно не знает будущую реализационную декомпозицию во
всех деталях. Его область — крупные capability slices или bounded contexts,
владельцы состояния, composition/runtime boundaries, разрешённые направления
зависимостей и глобальные API/event/data contracts. Эти решения образуют
архитектурный каркас графа, но не полный module inventory.

Конкретные change units становятся видимыми в `/feature-to-tasks`, когда уже
известны feature AC, canonical concerns, существующий код и ожидаемый путь к
наблюдаемому результату. Поэтому именно task planning получает bounded
dependency-design pass между canonical concern discovery и формированием task
candidates.

Feature и module при этом не смешиваются: одна feature может пересекать
несколько модулей, а один модуль может обслуживать несколько features. Task
также не соответствует модулю автоматически. Задачи продолжают формироваться
вокруг cohesive independently verifiable outcomes; граф лишь раскрывает
границы, contracts и prerequisites этих outcomes.

### Downstream использует ссылки, а не копии

Task cards не копируют из `boundary-map.md` consumer, provider или dependency
direction. Через существующие `source_artifacts` и/или `normative_inputs` они
ссылаются на `.memory-bank/contracts/boundary-map.md#dependency-graph` и на
конкретный inline или subject contract. Task-specific constraints,
verification targets и scope остаются в существующих полях только в той мере,
в которой они нужны для выполнения и проверки конкретного outcome.

`IMPL-FT-<NNN>.md` также не хранит копию feature subgraph. В нём остаются только
затронутые modules/contracts, ссылки на canonical graph и обоснование task
order, dependencies и waves. Полный набор узлов и рёбер всегда читается из
`boundary-map.md`.

Такой handoff сохраняет single-card execution context, но не превращает task
records или implementation plan в кэш архитектурного состояния.

## 4. Общий план реализации

Bootstrap-форма `boundary-map.md` может стать пустым компактным графом без
фиктивных `TBD`-рёбер, повествовательных `Boundary Notes` и глобальных
`Runtime Context Hints`. Описание файла в root index, spec-index и backbone
будет отражать его новую роль: canonical module dependency graph и маршрутизация
контрактов.

Pre-PRD `/spec-init` продолжит собирать preliminary boundary hints, но оставит
их в `spec-backbone.md#Decomposition Inputs`, где они уже являются входом для
последующей архитектурной работы. До принятия архитектуры эти hints не будут
записываться как реальные nodes или edges.

`/map-codebase` сможет находить observed change units, imports/calls, writers,
state paths и exposed boundaries как current-state evidence. Такое наблюдение
не станет accepted graph автоматически. `/spec-design` сопоставит его с
нормативным target и зафиксирует только принятый архитектурный каркас,
глобальные edges и contracts. Расхождение current state и target сохранит
существующий decision/blocker route, а не создаст второй полный граф рядом с
первым.

В `/feature-to-tasks` появится dependency-design pass. Для целевой feature
агент выделит необходимые реализационные change units, привяжет их к принятым
architecture units и проследит существенные execution paths через module
boundaries. Дополнительное внимание потребуется переходам через state/data,
events/messages и runtime composition, поскольку они не всегда видны из
основного happy path.

Каждое обнаруженное межмодульное взаимодействие получит направленное edge и
один contract outcome: `reuse`, `extend`, `create` или `block`. Новое простое
edge сможет получить inline contract; отдельный subject contract появится
только для самостоятельной, сложной или переиспользуемой границы. Edge без
contract basis не будет готов к task handoff.

После reconciliation канонического графа планирование определит затронутые
modules/contracts и выполнит reverse impact traversal для изменяемых
providers. Результат этого анализа выразится не копией подграфа, а
обоснованием implementation order в `IMPL-FT-*`. Task candidates, их
`depends_on` и waves будут выводиться из реальных implementation prerequisites,
compatibility/rollout requirements и independently verifiable outcomes, а не
механически из направления архитектурных рёбер.

`/architecture-review` и `/review-tasks-plan` смогут проверять, что все
затронутые contract consumers учтены, новые edges разрешены архитектурой, а
task order согласован с контрактами и rollout constraints. `/exe` и `/verify`
получат task-relevant graph и contract links; найденная во время выполнения
новая граница будет означать planning/design drift, а не разрешение молча
дописать зависимость.

`/mb-sync` останется reconciliation-механизмом. Он сможет согласовать уже
принятые graph/contract links после изменения, но не будет самостоятельно
создавать, удалять или легализовывать semantic edges.

Рефакторинг затронет canonical templates и runtime contracts, прежде всего
`structure-template.md`, зеркальный skeleton в `init-mb.js`, `/spec-init`,
`/spec-design`, `/feature-to-tasks`, autonomous feature-design route,
architecture/task-plan review и `mb-sync`. Task schema, lifecycle, новая
директория графа или отдельная workflow-команда для этого не нужны.

## 5. Потенциальные проблемы и важные инварианты

### Смешение accepted target и observed current state

Brownfield imports и calls доказывают текущее состояние, но не разрешённую
архитектуру. Если `/map-codebase` сможет напрямую легализовывать найденные
edges, существующая связанность начнёт незаметно определять target. В граф
должны попадать только принятые зависимости; observed drift остаётся evidence
для `/spec-design` или `/feature-to-tasks`.

### Неверная граница ownership между skills

`/feature-to-tasks` может добавлять leaf change units и contracts, когда они
однозначно реализуют принятый каркас. Новое cross-slice edge, изменение
dependency direction, state/write owner, orchestration owner или глобального
public contract остаётся материальным архитектурным решением и возвращается в
`/spec-design`. Иначе task planning постепенно станет скрытым владельцем
архитектуры.

### Ложная полнота графа

Граф не должен строиться только из happy-path calls. Значимые зависимости могут
проходить через shared state, storage, events, background jobs, composition,
configuration или migrations. Dependency-design pass использует accepted
specs вместе с фактическим code/config/test evidence. Неполная evidence-backed
карта должна приводить к blocker или явному ограничению scope, а не к заявлению
полноты.

### Путаница направления зависимости и data flow

Текущий шаблон использует форму `producer -> consumer`, тогда как для impact
analysis полезнее направление `consumer -> provider`. Новая семантика должна
быть определена один раз и использоваться всеми skills. Направление payload или
event flow при необходимости описывается contract body и не меняет направление
dependency edge.

### Возвращение дублирования через downstream artifacts

Наиболее вероятный drift — повторное появление consumer/provider/direction в
task cards, полного feature subgraph в `IMPL-FT-*`, consumer inventory в
subject contracts или graph snapshots в indexes. Эти артефакты должны хранить
только exact links и собственную информацию: task outcome/context,
implementation-order rationale, contract semantics либо registry metadata.

### Механическое преобразование module graph в task DAG

Архитектурная зависимость не всегда задаёт порядок реализации. Изменение
provider contract может потребовать сначала совместимый контракт, затем
миграцию consumers и лишь потом удаление старого пути. Task `depends_on` и
waves остаются результатом implementation/rollout prerequisites, а не
топологической копией module graph.

### Избыточный рост контрактов

Обязательный contract basis для edge не означает отдельный Markdown-файл на
каждую внутреннюю связь. Inline contract покрывает простую локальную границу;
subject contract оправдан отдельной сложностью, reuse, consumers, change
cadence или compatibility surface. Без этого правила граф быстро превратится в
большой набор малополезных документов.

### Reconciliation существующего графа

Повторный `/feature-to-tasks` не должен удалять edge только потому, что текущая
feature больше его не использует: тот же contract может обслуживать другие
features или фактический код. Изменение или удаление узла/ребра требует
проверки remaining consumers, existing task plans и current implementation
evidence. Material change сохраняет существующие rebuild/review и Planning
Revision rules.

### Workflow и packaging contract

Изменение только source template не попадёт полностью в target project.
Канонический refactor должен сохранять source-only packaging: согласованные
изменения в `skills/_shared`, generated skeleton через `init-mb.js`, direct
runtime command generation для Codex и Claude и isolated installer/bootstrap
verification. Generated package-local `shared-*` не должны появиться в source
tree.

Главным критерием успешности остаётся не наличие новой таблицы, а поведение
следующей правки: агент находит затронутые модули и контракты из одного
канонического графа, обосновывает порядок задач и передаёт исполнителю только
точные ссылки без повторного пересказа архитектуры.
