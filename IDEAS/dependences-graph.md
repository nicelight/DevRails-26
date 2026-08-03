# Канонический граф зависимостей модулей и контрактов

## Замысел

DevRails нужен один канонический граф принятых module/change units проекта и
контрактов между ними. Его владелец —
`.memory-bank/contracts/boundary-map.md`.

Узел обозначает конкретный модуль или другую принятую единицу изменения.
Ребро `Consumer -> Provider` означает, что Consumer зависит от Provider через
указанный контракт. Граф описывает разрешённую архитектуру, а не все найденные
imports или вызовы.

Для новой feature или delta граф даёт агенту короткий путь к ответам:

- где находится владелец затронутого поведения и состояния;
- какие контракты используются или меняются;
- какие прямые и транзитивные consumers могут быть затронуты;
- останавливает ли совместимая граница распространение изменения;
- какие implementation prerequisites определяют задачи и waves;
- какие contract и integration proofs относятся к изменению.

Граф остаётся архитектурным входом для существующих implementation plans, JSON
task records, review и verification flow. Он не создаёт новый task model,
lifecycle, scheduler contract или отдельную workflow-команду.

## Каноническая форма

`boundary-map.md` становится единственным подробным inventory модулей и
топологии их зависимостей.

```markdown
## Modules

| Module / Change Unit | Parent Architecture Unit | Code Root | Responsibility |
|---|---|---|---|
| checkout | [Commerce](../architecture/system-architecture.md#commerce) | src/checkout | Оркестрация оформления заказа |
| pricing | [Commerce](../architecture/system-architecture.md#commerce) | src/pricing | Расчёт принятой цены |
| inventory | [Fulfillment](../architecture/system-architecture.md#fulfillment) | src/inventory | Резервирование доступного остатка |

## Dependency Graph

`Consumer -> Provider` означает, что Consumer зависит от Provider.

| Consumer | Provider | Contract |
|---|---|---|
| checkout | pricing | [Pricing Query](#pricing-query) |
| checkout | inventory | [Reservation Command](reservation.md#reservation-command) |

## Inline Contracts

### Pricing Query

- Public surface:
- Allowed interaction:
- State/data authority:
- Failure and compatibility rules:
- Forbidden bypass:
- Verification:
```

`Module / Change Unit` является уникальным именем узла внутри `Modules` и
точным ключом для `Consumer` и `Provider`. Отдельные module IDs не нужны.
Идентичность ребра задаётся тройкой `Consumer + Provider + Contract`.

Значение `Contract` всегда является точной ссылкой: либо на heading inline
contract в `boundary-map.md`, либо на конкретный блок subject contract. Ссылка
только на файл без нужного блока недостаточна.

Таблица графа единолично владеет consumer, provider и направлением зависимости.
Contract body описывает public surface, правила взаимодействия, authority,
ошибки, совместимость, запрещённые обходы и proof, но не повторяет topology.
Один subject contract может обслуживать несколько рёбер; reverse usage всё
равно выводится из графа.

Простая внутренняя граница остаётся inline. Отдельный `contracts/*.md` оправдан,
когда контракт имеет самостоятельную сложность, несколько consumers,
переиспользование или собственную compatibility surface.

## Граница с архитектурой системы

`.memory-bank/architecture/system-architecture.md` описывает форму системы:
deployables, composition/runtime boundaries, крупные capability slices или
bounded contexts и принятые архитектурные решения. Второй подробный список
модулей там не поддерживается. Когда архитектурному описанию нужен module
inventory, оно ссылается на `boundary-map.md#modules`.

`Parent Architecture Unit` в таблице `Modules` ссылается на соответствующий
крупный архитектурный блок. Так сохраняются два уровня декомпозиции без двух
источников истины:

- `/spec-design` создаёт и именует крупные architecture units;
- `/feature-to-tasks` создаёт конкретные modules/change units внутри уже
  принятой архитектуры.

Имена отражают устойчивую функциональную ответственность и используют
принятую доменную лексику. Feature/task IDs, текущие пути и общие технические
слои не становятся именами модулей. `Code Root` может измениться без смены
идентичности модуля.

## Полнота и разрешённые зависимости

Для каждого узла в `Modules` граф содержит все принятые значимые
межмодульные зависимости. Отсутствующее ребро означает, что такая зависимость
не разрешена.

Значимой считается зависимость между зарегистрированными modules/change units,
которая переносит behavior, state/data authority или runtime responsibility
через контракт. Совместная сборка, тестовый import или общий инструментарий
сами по себе не образуют архитектурное ребро.

Новый узел готов к task handoff вместе со всеми его принятыми edges и точными
contract links. Неполная evidence-backed картина не выдаётся за полный граф:
неразрешённая граница использует существующий blocker route.

Эта closed-world семантика сохраняет роль графа простой: accepted edge разрешает
взаимодействие через свой контракт, отсутствующий edge не даёт агенту права
изобрести связь во время реализации.

## Как граф развивается

До принятия архитектуры `/spec-init` хранит preliminary boundary hints в
`spec-backbone.md#Decomposition Inputs`. Эти hints помогают последующей
декомпозиции, но ещё не являются nodes или edges.

В brownfield-проекте `/map-codebase` находит observed change units, imports,
calls, writers, state paths, runtime entrypoints и существующие proof paths как
current-state evidence. Наблюдаемая связь не становится разрешённой
зависимостью автоматически. `/spec-design` сопоставляет evidence с принятым
target и формирует архитектурный каркас графа. Расхождение current state и
target остаётся drift evidence с существующим decision/blocker route, а не
вторым графом рядом с accepted graph.

Когда feature готовится к tasking, `/feature-to-tasks` связывает её AC и
canonical concerns с конкретными change units. Существенные execution paths
прослеживаются через module boundaries, включая state/data, events/messages,
background work и runtime composition, когда они относятся к feature.

Каждое нужное межмодульное взаимодействие заканчивается одним из существующих
результатов: `reuse`, `extend`, `create` или `block`. Готовое ребро всегда имеет
contract basis. Leaf module или edge может быть добавлен в этом проходе.

После reconciliation актуальный граф используется для reverse impact traversal
изменяемых providers. Implementation plan сохраняет затронутые modules и
contracts, точные canonical links и обоснование task order, dependencies и
waves. Полная копия feature subgraph в `IMPL-FT-*` не появляется.

Task cards также не кэшируют topology. В существующие `source_artifacts` и
`normative_inputs` попадают точные graph/contract links, а task-specific scope,
constraints, invariants и verification targets остаются в предназначенных для
них полях. Primary owner и crossed boundaries должны быть понятны исполнителю,
но consumer/provider inventory продолжает жить только в графе.

Module graph не преобразуется механически в task DAG. Архитектурная зависимость
показывает возможный blast radius, тогда как `depends_on` и waves выражают
реальный порядок реализации, совместимости, rollout и независимо проверяемых
outcomes.

## Planning Revision и локальная свежесть

`Planning Revision` остаётся версией глобальной архитектуры, а не каждой
конкретизации графа.

| Изменение | Владелец | Planning Revision |
|---|---|---|
| Новый consumer неизменного существующего контракта | `/feature-to-tasks` | сохраняется |
| Новый leaf module или edge внутри принятой архитектуры | `/feature-to-tasks` | сохраняется |
| Глобальное архитектурное изменение, выполненное через `/spec-design` | `/spec-design` | увеличивается |

Свежесть исполнения проверяется на двух уровнях:

1. `REVIEWED_PLANNING_REVISION` связывает task-plan approval с глобальной
   архитектурой.
2. Point-of-use preflight `/exe` читает актуальные graph rows и contracts,
   релевантные выбранной задаче.

Если ещё не выполненная задача меняет provider несовместимым образом, а в графе
появился новый релевантный consumer, устаревшей считается только эта tasking
surface. `/exe` останавливает задачу и возвращает её в
`/feature-to-tasks FT-<NNN>`. После локального replan повторяется
`/review-tasks-plan` для затронутой feature; approvals остальных features не
инвалидируются.

Глобальное изменение через `/spec-design` увеличивает `Planning Revision` и
использует существующий all-feature reconciliation/review route.

## Review, execution и reconciliation

`/architecture-review` и `/review-tasks-plan` проверяют релевантный subgraph:
все ли затронутые consumers учтены, разрешены ли новые edges принятой
архитектурой, достаточны ли contracts и согласован ли task order с
compatibility/rollout constraints.

Во время `/exe` отсутствующее межмодульное ребро является planning/design drift,
а не разрешением дописать зависимость по ходу реализации. Выполнение
останавливается без легализации нового edge.

`/verify` проверяет не только функциональный результат, но и использование
разрешённого contract path без прямой записи чужого состояния или второго
source of truth.

`/mb-sync` согласует уже принятые graph/contract links после изменения. Он не
создаёт, не удаляет и не легализует semantic edges от своего имени.

## Механическая и семантическая проверка

Механический validator покрывает форму, которую можно проверить без
архитектурного решения:

- уникальные имена модулей;
- существующие `Consumer` и `Provider` для каждого ребра;
- уникальную тройку `Consumer + Provider + Contract`;
- разрешение каждого contract path и heading;
- разрешение `Parent Architecture Unit`;
- отсутствие placeholder и malformed rows.

Полнота blast radius, соответствие accepted target, достаточность контракта и
корректность rollout остаются semantic review judgments.

## Поверхность реализации

Canonical refactor проходит через `skills/_shared`: шаблон
`boundary-map.md`, зеркальный skeleton в `init-mb.js` и runtime contracts для
`/spec-init`, `/map-codebase`, `/spec-design`, autonomous design,
`/feature-to-tasks`, architecture/task-plan review, `/exe`, `/verify` и
`/mb-sync`. `mb-lint` получает только механическую проверку графа; semantic
verdict остаётся у существующих review gates.

При обновлении framework installer безусловно заменяет существующий
`.memory-bank/contracts/boundary-map.md` новым пустым canonical template со
`status: draft`. Перед заменой прежний файл переименовывается в
`.memory-bank/contracts/boundary-map-old.md` и остаётся исходным материалом для
ручного заполнения нового графа; автоматическая semantic migration не
выполняется.

Source-only packaging сохраняется: generated package-local `shared-*` не
появляются в source tree, а installer/bootstrap smoke подтверждает доступность
обновлённого contract и validator в изолированном target.

Успешность изменения определяется следующим реальным planning run: агент
находит владельцев и contracts из одного accepted graph, видит релевантных
consumers, обосновывает task order и передаёт исполнителю точные ссылки без
копии архитектуры. Неизвестная граница не легализуется во время выполнения, а
локальное развитие графа не запускает глобальную перепроверку без изменения
глобальной архитектуры.
