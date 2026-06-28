# Идея: усиление `/foundation-to-tasks`

## Контекст

`/foundation-to-tasks` находится на стыке между SDD-дизайном и первыми исполнимыми задачами проекта. В greenfield-потоке именно эта команда превращает решение о Foundation Dev Path в `FT-000` и набор foundation-задач, которые доказывают, что проект можно собрать, запустить, проверить и дальше развивать через обычные T2/T3 product tasks.

Сейчас эту команду полезно рассматривать не только как генератор задач walking skeleton, но и как место, где появляется минимальный, переиспользуемый substrate-слой спецификаций. Такой слой лучше не превращать в большой upfront-дизайн, но он может заранее снять неоднозначность вокруг рантайма, scaffold-архитектуры, тестового контура, хранения, миграций, evidence и редактирования чувствительных данных.

## Предлагаемое направление

Имеет смысл усилить `/foundation-to-tasks` так, чтобы перед нарезкой `FT-000` задач команда выполняла небольшой Foundation substrate spec audit. Его задача - понять, какие scaffold-level спецификации уже есть, какие можно естественно обновить, а какие стоит сгенерировать как нормативные входы для foundation-задач.

Такой audit лучше держать легким:

- без отдельной coverage map как непременного артефакта;
- без новых строгих валидаторов;
- без блокировки легковесных проектов из-за формальной неполноты;
- без дублирования уже существующих architecture / contracts / domains / testing документов.

При этом генерацию нужных foundation-спецификаций стоит считать ожидаемой частью команды, а не факультативной рекомендацией. Если foundation-задача иначе вынуждала бы исполнителя угадывать substrate-правило, предпочтительным выглядит создание или обновление естественного spec-owner до генерации task records.

## Ключевые SDD specification families

Важно не размывать смысл слова "необходимые". Если текущий проект, Foundation Feature Pressure Map, PRD/features или backbone specs показывают, что область нужна для безопасного foundation workflow, соответствующая спецификация из ключевого SDD-набора должна получить фундаментальный owner и минимальный substrate-блок до генерации `FT-000` задач, которые на нее опираются.

Ключевой набор:

- Architecture Specification: форма системы, runtime-контур, основные компоненты, границы модулей, source-of-truth, dependency direction и ограничения, которые implementation tasks не должны нарушать.
- Interface Specification: API, события, протоколы, agent/tool I/O, frontend/backend или другие interaction boundaries. Внутри этой family естественно появляются:
  - Component Contract: что гарантирует каждый модуль или bounded context, какие вызовы разрешены/запрещены, где проходит ownership boundary.
  - API Contract: REST/gRPC/GraphQL или другой request/response интерфейс, входы, выходы, статусы, ошибки, auth/compatibility ожидания.
  - Event Contract: формат событий, очередей, сообщений, envelope, required fields, ordering, retry/idempotency и failure behavior.
  - Data Contract: структура передаваемых данных, версии, обязательные поля, nullability/defaults, validation/serialization и compatibility expectations.
- Data Specification: модели данных, storage ownership, схемы БД, миграции, session/UoW, форматы сообщений и payloads, правила валидации и сериализации, lifecycle/state правила, seed/runtime data paths.

Для `/foundation-to-tasks` эти specs лучше держать строго в substrate-scope: они фиксируют только то, что нужно для walking skeleton, bootstrap, smoke path, test harness, storage/runtime proof и evidence. Это фундаментальные спецификации, а не финальная продуктовая детализация всего проекта.

Хороший foundation-level результат может выглядеть как минимальный owner с базовыми правилами, границами и verification target, плюс явно оставленное место для feature-level расширения. Например, foundation может зафиксировать, что HTTP API строится через выбранный backend scaffold и имеет health/smoke contract, но конкретные продуктовые endpoints, request/response schemas и error cases для фич лучше дорабатывать в `/prd-to-tasks`.

Если какая-то family не затронута foundation path, отдельный файл ради галочки не нужен. Но если foundation-задачи зависят от архитектурного, интерфейсного, contract или data-решения, отсутствие естественного spec-owner будет означать недостающую фундаментальную спецификацию, а не допустимую легковесность. Будущие T2/T3 product tasks смогут расширить эти же specs или создать feature-local specs в `/prd-to-tasks`, не дублируя foundation owner.

## Какие спецификации стоит покрывать

### Foundation Architecture Specification

Полезна как краткое описание ранней архитектуры проекта: основные runtime-компоненты, границы backend/frontend/worker/tooling, минимальный путь запуска, допустимые зависимости и то, что входит в walking skeleton.

В этой спецификации полный target architecture на весь продукт выглядит избыточным. Достаточно зафиксировать тот каркас, который foundation-задачи будут доказывать локально.

### Backend Scaffold Specification

Может описывать базовый backend-скелет: структуру приложения, точку входа, конфигурацию, DI/bootstrap, health/smoke endpoint или другой минимальный проверяемый интерфейс.

Для проектов без backend ее можно заменить соответствующим runtime scaffold spec: CLI, worker, mobile shell, embedded loop, desktop app shell или другой главный исполнимый контур.

### Interface Smoke Contract

Имеет смысл как самый ранний контракт наблюдаемого поведения системы. Это может быть health endpoint, CLI-команда, event-loop smoke, test harness command, RPC ping, UI route или иной минимальный интерфейс, через который foundation считается доказанной.

Этот контракт лучше не смешивать с будущими продуктовыми API contracts. Он фиксирует только substrate-интерфейс, на который смогут ссылаться foundation tasks и последующие T2/T3 задачи.

### DB / Session / Unit-of-Work / Migration Contract

Если проект предполагает состояние, БД, миграции, ORM, unit-of-work, session lifecycle или seed/dev data, полезно заранее зафиксировать минимальные правила этого слоя.

Даже в ранней версии достаточно определить выбранный persistence path, где живут миграции, как открывается session/UoW, как откатываются тесты и какой smoke-доказатель подтверждает, что storage-контур работает.

### Test Harness Specification

Foundation-задачи обычно создают первый проверяемый контур. Поэтому полезно иметь маленькую спецификацию тестового harness: команды запуска, минимальные test tiers, ожидаемые smoke/integration checks, где хранится evidence и какие проверки являются достаточными для foundation gate.

Эта спецификация помогает будущим задачам не изобретать заново способ проверки проекта.

### Local Runtime / Bootstrap Runbook

Для greenfield-проекта особенно важен воспроизводимый локальный запуск. Runbook может фиксировать команды install/build/start/test, переменные окружения, dev services, порядок bootstrap и минимальный troubleshooting.

Runbook лучше держать практически полезным, а не превращать в эксплуатационную документацию production-уровня.

### Redaction / Evidence Contract

Если workflow собирает логи, screenshots, test output, traces или другие артефакты evidence, полезно иметь короткий контракт: что можно сохранять, что редактируется, какие данные считаются чувствительными и как оформлять воспроизводимое evidence для foundation gate.

Такой контракт особенно важен для дальнейших `/execute`, `/verify`, `/mb-doctor` и autopilot-сценариев, потому что они наследуют практики evidence из ранней foundation-фазы.

## Когда спецификация выглядит недостающей

Спецификация выглядит кандидатом на создание или обновление, если:

- Foundation Feature Pressure Map упоминает соответствующую область;
- foundation-задача без spec-link вынуждала бы угадывать build/start/runtime/storage/evidence поведение;
- будущие T2/T3 product tasks будут зависеть от substrate-решения, уже выбранного foundation path;
- `/spec-design` уже направил часть backbone-дизайна в Foundation Dev Path;
- существующий документ слишком общий и не отвечает на практический вопрос исполнителя;
- одно и то же substrate-решение описано в нескольких местах с разными формулировками.

В таких случаях предпочтительным выглядит обновление естественного владельца спецификации. Новый файл имеет смысл только тогда, когда подходящего владельца еще нет или смешивание тем ухудшило бы читаемость.

## Естественные места хранения

Ожидаемое размещение можно держать совместимым с текущей Memory Bank структурой:

- architecture/runtime decisions: `.memory-bank/architecture/*`;
- interface, API, protocol, message, tool или agent smoke contracts: `.memory-bank/contracts/*`;
- DB, session, UoW, migration, seed и storage rules: `.memory-bank/domains/*` или `.memory-bank/contracts/*`;
- test harness, verification и evidence rules: `.memory-bank/testing/*`;
- local runtime и bootstrap instructions: `.memory-bank/runbooks/*`.

`spec-index.md` лучше использовать как реестр ссылок и статусов, а не как место для тела решений. Это снижает риск дублирования и оставляет спецификации в их естественных доменах.

## Как это отражается на задачах

Foundation task records выиграли бы от прямых ссылок на substrate specs:

- `source_artifacts` могут указывать, из каких PRD/foundation/spec материалов выведена задача;
- `normative_inputs` могут ссылаться на точные scaffold-level specs;
- `constraints` могут фиксировать ограничения runtime, storage, bootstrap, evidence и redaction;
- `invariants` могут удерживать правила, которые нельзя нарушить при реализации;
- `verification_targets` могут ссылаться на smoke checks, harness spec и final foundation gate.

Такой подход делает `FT-000` задачи менее расплывчатыми и помогает execution packets наследовать точные spec links из task records без дополнительной интерпретации.

## Границы KISS

Усиление `/foundation-to-tasks` лучше ограничить substrate-слоем. В эту команду не стоит переносить полный продуктовый дизайн фич, будущие T2/T3 API, сложные domain models или архитектуру "на вырост".

Также нежелательно добавлять новые жесткие валидаторы ради самого факта наличия всех файлов. Достаточно, чтобы команда явно ставила генерацию релевантных scaffold-level specs в свой рабочий маршрут и использовала их как нормативные входы для задач.

Пустые placeholder-specs лучше не создавать. Если контекста недостаточно, полезнее зафиксировать короткий unresolved вопрос в подходящем документе или в task evidence, чем создавать файл без решений.

Для brownfield `--verify-existing` сценария разумно сохранять другой режим: если существующий проект уже доказывает foundation baseline через реальные build/test/start артефакты, команда может предпочитать evidence и ссылки на текущие документы вместо генерации искусственного `FT-000` queue.

## Ожидаемый эффект

После такого усиления `/foundation-to-tasks` сможет формировать не только executable foundation tasks, но и понятный набор переиспользуемых substrate specs. Будущие `/prd-to-tasks`, `/execute`, `/verify`, `/mb-doctor` и autopilot-сценарии будут получать более точные нормативные входы, а исполнителям T2/T3 задач придется меньше угадывать ранние архитектурные, интерфейсные, data/storage и evidence-решения.
