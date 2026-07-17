# Улучшение testing-документации: router и компактная strategy

## Проблема

Сейчас `.memory-bank/testing/index.md` одновременно используется как:

- navigation index;
- глобальная testing strategy;
- хранилище quality gates;
- описание unit/integration/e2e подхода;
- место для anti-cheat правил;
- иногда — журнал добавленных тестов, команд, evidence и текущего состояния.

Это смешивает стабильную навигацию, нормативные правила и изменчивую
операционную информацию в одном файле.

Проблема закреплена сразу несколькими skills:

- `/prd` записывает в index quality gates, test levels и anti-cheat rules;
- `/add-tests` записывает туда добавленные тесты и команды запуска;
- `/mb-harness` записывает туда harness gates и правила evidence.

В результате index разрастается, несколько writers конкурируют за его
содержимое, а устаревшая operational information выглядит как актуальный
source of truth.

## Решение

Использовать минимальное разделение ответственности:

```text
.memory-bank/testing/index.md
    Только router: аннотированные ссылки на testing documents.

.memory-bank/testing/strategy.md
    Короткая глобальная testing strategy, основанная на PRD.

.memory-bank/testing/<subject>.md
    Только действительно нужные предметные verification contracts,
    test matrices или другие testing specs.

.memory-bank/testing/test-execution.md
    Опциональное описание воспроизводимого запуска проверок, только если
    project-native конфигурации недостаточно.

.tasks/ и .protocols/
    Test results, logs, screenshots, verdicts и task-specific evidence.
```

Новый слой, registry или отдельный workflow не нужны.

## KISS-принцип

Testing strategy должна быть небольшой и соответствовать реальным рискам
проекта. DevRails не должен требовать unit, integration и e2e одновременно для
каждого проекта или каждой feature.

Правила:

- добавлять только те test levels и gates, необходимость которых следует из
  PRD, Constitution или фактического устройства проекта;
- не создавать тест только ради формального покрытия категории;
- для простого проекта допустима одна минимальная проверка;
- если test level не нужен, его можно не упоминать — отдельная матрица
  `not_applicable` не требуется;
- усложнение testing workflow должно быть обосновано concrete product risk.

Лучше ограниченная, понятная проверка core value, чем сложная testing-модель,
которую агенты будут трактовать неоднозначно.

### Почему не обязательны все уровни проверки

Unit, integration и e2e — это разные инструменты для разных типов риска, а не
обязательные стадии, которые сами по себе гарантируют качество. Их безусловное
требование для каждого проекта приводит к обратному эффекту:

- агенты создают декоративные тесты только для формального заполнения уровней;
- растут implementation scope, время выполнения и стоимость поддержки;
- появляются дублирующие проверки и flaky e2e там, где достаточно простой unit
  или integration test;
- testing strategy перестаёт отражать реальные product risks;
- `/prd` и `/spec-design` вынуждены принимать лишние технические решения без
  достаточного evidence.

Выбор должен следовать характеру изменения:

- чистая изолированная логика обычно требует unit tests;
- существенная DB/API/component boundary требует integration или contract tests;
- критический пользовательский сценарий может требовать e2e;
- небольшое локальное изменение может быть достаточно проверить существующим
  gate или одним targeted test.

Это не отменяет обязательность verification результата. Каждая задача всё ещё
должна иметь соразмерный риску executable verification path и evidence. Снимается
только blanket requirement использовать все test levels независимо от их
полезности.

## Ответственность `/prd`

`/prd` остаётся основным writer компактной `.memory-bank/testing/strategy.md`.
Это не architecture design: skill фиксирует только проверяемые ожидания,
следующие из clarified PRD.

`/prd` должен:

- создать или обновить `testing/strategy.md`;
- зафиксировать минимальные product-level quality expectations;
- перечислить только применимые test levels;
- записать короткие anti-cheat rules;
- указать общие требования к evidence и место его хранения;
- оставить feature-specific verification details в features и предметных specs.

`/prd` не должен:

- проектировать test harness или выбирать инструменты без evidence;
- придумывать все возможные gates;
- требовать test pyramid;
- записывать task IDs, readiness, next route, результаты запусков или историю
  выполнения;
- менять `testing/index.md`, если набор ссылок не изменился.

## Ограниченная роль `/spec-design`

Не добавлять в `/spec-design` новый testing workflow, интервью, checklist или
обязанность заново проектировать глобальную testing strategy.

`/spec-design` только:

- читает `testing/strategy.md` как существующий PRD-grounded input;
- использует этот путь как authoritative source для строки
  `testing_strategy` в Spec Backbone;
- при реальной contract/runtime/security pressure может маршрутизировать
  конкретный verification concern в `testing/<subject>.md` существующим
  subject-based способом.

Если дополнительного testing pressure нет, `/spec-design` не меняет strategy и
не создаёт новых testing documents.

## Правила для `testing/index.md`

Кроме frontmatter и заголовка, index должен содержать только группы
аннотированных ссылок.

Index MUST NOT содержать:

- testing policy или acceptance criteria;
- task IDs, wave status, readiness или next actions;
- canonical test commands;
- execution history, test results или evidence;
- полный inventory тестовых файлов проекта.

Минимальный стартовый вид:

```markdown
# Testing Documentation

- [Testing strategy](strategy.md): минимальные глобальные правила тестирования
  и verification evidence.
```

## Смежные skills

### `/add-tests`

- Добавляет полезные тесты с приоритетом по core value и риску регрессии.
- Не обновляет `testing/strategy.md` при обычном добавлении теста.
- Обновляет `testing/<subject>.md` только если изменился долговечный verification
  contract, а не просто набор test files.
- Добавляет ссылку в `testing/index.md` только при создании нового testing doc.
- Записывает команды, результаты и artifacts в task evidence.

### `/mb-harness`

- Сначала использует canonical commands из project-native источников:
  `package.json`, `Makefile`, CI config или эквивалентных файлов.
- Создаёт `testing/test-execution.md` только если для воспроизводимого запуска
  нужны дополнительные prerequisites, environment setup, fixtures или
  пояснения, которых нет в штатных файлах проекта.
- Добавляет в index только ссылку на созданный test-execution document.
- Не использует `testing/index.md` как конфигурацию и не переписывает глобальную
  strategy.

## Spec registry и backbone

- `spec-index.md` должен регистрировать `testing/strategy.md` как canonical
  testing strategy.
- `testing/index.md` остаётся folder-local router и не считается normative spec.
- Строка `testing_strategy` в `spec-backbone.md` должна ссылаться на
  `.memory-bank/testing/strategy.md`.
- Предметные testing specs регистрируются обычным subject-based способом только
  когда они реально создаются.

## Bootstrap и миграция

Fresh bootstrap должен создавать:

- короткий `testing/index.md` со ссылкой на strategy;
- компактный `testing/strategy.md` с безопасным минимальным шаблоном.

Для существующих target-проектов не нужен автоматический semantic migrator.
Произвольный пользовательский index нельзя молча перезаписывать.

Достаточно следующего пути:

1. sync/bootstrap создаёт отсутствующий `testing/strategy.md`;
2. legacy-содержимое index переносится при следующем явном обновлении `/prd`
   либо вручную;
3. test results и history переносятся только при необходимости — их не нужно
   сохранять в durable strategy;
4. custom files не перезаписываются без явного действия пользователя.

## Acceptance criteria

- Fresh bootstrap создаёт отдельные `testing/index.md` и
  `testing/strategy.md`.
- `testing/index.md` остаётся коротким router после `/prd`, `/add-tests` и
  `/mb-harness`.
- `/prd` создаёт компактную strategy только из grounded product expectations и
  не требует всех test levels.
- `/spec-design` читает и маршрутизирует strategy без нового testing workflow и
  без обязательного изменения файла.
- `spec-index.md` и `spec-backbone.md` указывают на `testing/strategy.md`, а не
  на index.
- Canonical commands остаются в project-native конфигурации; дополнительное
  описание допускается в `testing/test-execution.md` только при необходимости.
- Test execution results остаются в `.tasks/` и `.protocols/`.
- Повторный запуск skills не добавляет в index task status, next actions,
  commands или execution history.
- Existing custom testing docs не перезаписываются автоматически.

## Минимальные проверки реализации

- Bootstrap smoke подтверждает наличие обоих testing files и ссылки между ними.
- Source search не находит инструкций записывать operational data в
  `testing/index.md`.
- Memory Bank lint требует оба файла, если они входят в обязательный skeleton.
- Не добавляется отдельный validator содержимого index: prompt contracts и
  smoke-проверки достаточны.

## Non-goals

- Не создавать отдельный testing skill, workflow или registry.
- Не добавлять новый обязательный gate в `/spec-design`.
- Не вводить обязательную test pyramid или coverage target.
- Не создавать verification contract для каждой feature по умолчанию.
- Не хранить inventory test files в Memory Bank.
- Не дублировать task evidence в testing strategy.
- Не строить автоматическую миграционную систему ради двух Markdown-файлов.

## Ожидаемый результат

Исправление добавляет один стабильный документ `testing/strategy.md` и уточняет
границы существующих writers. Index снова становится router, `/prd` формирует
минимальные product-level verification expectations, `/spec-design` не получает
новой сложной обязанности, а operational evidence остаётся вне durable
navigation documents.
