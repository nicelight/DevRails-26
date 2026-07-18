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

В результате index разрастается, несколько writers конкурируют за его
содержимое, а устаревшая operational information выглядит как актуальный
source of truth.

## Решение

Использовать минимальное разделение ответственности:

```text
.memory-bank/testing/index.md
    Только router: аннотированные ссылки на testing documents.

.memory-bank/testing/strategy.md
    Короткая framework baseline policy с общими risk-based правилами.

.memory-bank/testing/<subject>.md
    Только действительно нужные предметные verification contracts,
    test matrices или другие testing specs.

.tasks/ и .protocols/
    Test results, logs, screenshots, verdicts и task-specific evidence.
```

Новый слой, registry или отдельный workflow не нужны.

## KISS-принцип

Testing strategy должна быть небольшой framework baseline policy. Она не
перечисляет риски конкретного проекта и не требует unit, integration и e2e
одновременно для каждого проекта или каждой feature.

Правила:

- конкретные test levels и gates выбираются downstream по evidence из PRD,
  Constitution, requirements, features, subject specs и фактического устройства
  проекта, а не записываются заранее в baseline strategy;
- выбирать самую дешёвую проверку, которая надёжно ловит конкретный риск;
  более широкий или дорогой test level добавляется только когда более узкий не
  доказывает нужное поведение;
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

Это не отменяет verification результата и не меняет существующую tier policy:

- для T2/T3 сохраняется требование executable verification path;
- для T0/T1 допустимы compact evidence или documented no-runnable-check, когда
  meaningful runnable check отсутствует;
- для всех tiers снимается только blanket requirement использовать все test
  levels независимо от их полезности.

## Упрощение `/prd`

Главная цель изменения — не только разделить документы, но и убрать testing
strategy из ответственности `/prd`.

Из objective и outputs `/prd` нужно удалить `.memory-bank/testing/index.md` и
не добавлять вместо него `.memory-bank/testing/strategy.md`. Текущий отдельный
шаг `Testing index` удаляется полностью.

`/prd` продолжает делать только то, что нужно для L1-L3 decomposition:

- связывать requirements с ожидаемой verification в RTM;
- оставлять в features короткие test/verification pointers, если они следуют из
  clarified PRD;
- сохранять explicit product-level quality requirements в requirements или
  acceptance criteria, не превращая их в глобальную testing policy.

`/prd` не должен создавать или изменять файлы в `.memory-bank/testing/`,
выбирать test levels, проектировать harness, формулировать global gates или
anti-cheat policy. Повторный запуск `/prd` не меняет testing documentation.

## Ограниченная роль `/spec-design`

Не добавлять в `/spec-design` новый testing workflow, интервью, checklist или
обязанность заново проектировать глобальную testing strategy.

`testing_strategy` нужно удалить из обязательных Backbone Area и из стартовой
Backbone Area Matrix. Базовая strategy создаётся bootstrap и не является
архитектурным решением, которое `/spec-design` должен повторно оценивать или
переводить между `authoritative|needed_before_tasks|not_applicable|blocked`.

Из `/spec-design` и generated architecture skeleton также удаляются связанные
дублирующие surfaces:

- `testing_strategy` из списка существующих Backbone Area, через которые нужно
  маршрутизировать core specs;
- blanket-вопрос `testing gates` из architecture decision interview;
- обещание `minimal testing gates` для local/simple mode;
- упоминание global `testing` как обязательной части standard architecture
  scaffold заменяется на routing только реально применимых verification
  concerns в subject specs;
- `## Testing strategy` из рекомендуемых секций
  `architecture/system-architecture.md`;
- пустая `## Testing Strategy` из fresh bootstrap template
  `architecture/system-architecture.md`.

Это не запрещает архитектурно значимые verification decisions. Если конкретный
test harness, executable verification contract, evidence/redaction rule или
операционный proof path действительно нужен, он остаётся subject-based spec в
`testing/*`, `contracts/*` или `runbooks/*` и проходит обычный SDD routing.

Существующее чтение relevant `testing/*` и subject-based routing конкретных
verification contracts не меняются. В рамках этой доработки `/spec-design`
получает только удаление/сужение прежней global-testing ответственности и
короткую boundary rule; новых шагов, вопросов, проверок, outputs или обязанности
изменять global strategy не появляется.

Короткая boundary rule для `/spec-design`:

```text
Resolve the canonical testing policy path through spec-index.md. In fresh
targets it is testing/strategy.md, a bootstrap-owned framework baseline.
Do not expand or redesign the registered baseline in /spec-design.
Route concrete project verification concerns to subject testing specs through
the existing SDD concern routing.
```

Разрешение пути через `spec-index.md` — не dual-path fallback и не отдельная
legacy-ветка. Это существующее правило canonical spec discovery. `/spec-auto`
использует тот же global backbone и subject-based Verification routing; новая
autonomous-specific обязанность ему не добавляется.

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
- [SDD Spec Index](../spec-index.md): authoritative registry предметных testing
  и verification specs.
```

Команды, которые создают, переименовывают или удаляют subject testing spec,
могут обновить в index только соответствующую аннотированную ссылку как часть
существующего navigation maintenance. Это не делает их writers testing policy.
Полный authoritative inventory по-прежнему живёт в `spec-index.md`.

## Смежные skills

### `/add-tests`

- Работает только в контексте существующей indexed
  `TASK-NNN-TN-FT-NNN-WN` со статусом `in_progress`, явно переданной команде и
  уже включающей соответствующие test changes в свой scope.
- Если отдельное post-hoc улучшение coverage не входит в scope текущей
  `in_progress` task, сначала создаётся normal follow-up task через обычный
  planning/reconciliation route; `/add-tests` не придумывает task identity.
- Добавляет полезные тесты с приоритетом по core value и риску регрессии.
- Выбирает самый дешёвый достаточный test level; не ставит e2e первым по
  умолчанию и не требует browser artifacts, если browser/e2e проверка не нужна.
- Запускает добавленные тесты и проверяет, что они не flaky.
- Записывает команды, результаты и artifacts в tier-selected evidence path
  существующей task: compact `.protocols/<TASK_ID>/run.md` для T0/T1 либо full
  protocol и substantive `.tasks/<TASK_ID>/` artifacts для T2/T3.
- Не создаёт synthetic `TASK-TESTS-*`, отдельную task model или новый lifecycle;
  lifecycle/closure остаётся у `/execute`, `/verify`, scheduler или explicit
  owner по существующей tier policy.
- Не создаёт и не изменяет файлы в `.memory-bank/testing/`.

Если проекту действительно нужен долговечный subject testing spec, он создаётся
существующим SDD routing в `/spec-design`, `/foundation-to-tasks` или
`/prd-to-tasks`, а не как побочный эффект обычного `/add-tests`.

## Spec registry и backbone

- `spec-index.md` должен регистрировать `testing/strategy.md` как canonical
  testing strategy со статусом `active`, scope `Framework baseline testing
  policy` и change route `explicit project-level user decision`.
- `testing/index.md` остаётся folder-local router и не считается normative spec.
- `testing_strategy` удаляется из обязательных строк `spec-backbone.md`.
- Глобальная strategy создаётся как bootstrap-owned framework default; `/prd`,
  `/spec-design` и `/add-tests` не становятся её writers.
- Предметные testing specs регистрируются обычным subject-based способом только
  когда они реально создаются.
- `testing/index.md` не обязан дублировать полный inventory предметных specs:
  authoritative discovery остаётся в `spec-index.md`.

### Почему baseline strategy не нужен отдельный writer

`testing/strategy.md` не является моделью рисков конкретного проекта. Он
фиксирует только стабильные framework rules: проверки выбираются соразмерно
риску, failing tests нельзя формально «зеленить», а execution evidence хранится
в operational artifacts.

Project-specific сведения уже имеют canonical owners:

- product risks и quality requirements — PRD, requirements и features;
- concrete verification contracts — subject specs;
- executable gates и verification targets — task records;
- результаты запусков — `.tasks/` и `.protocols/`.

Поэтому routine skills не должны синхронизировать global strategy. При
необходимости её можно изменить только явным project-level решением пользователя,
без нового skill, lifecycle или workflow.

Для legacy target canonical testing path всегда берётся из его существующего
`spec-index.md`. Ни `/spec-design`, ни другой skill не предполагает, что
`testing/strategy.md` обязательно существует. После явной ручной миграции
registry обновляется на новый путь обычным способом.

## Bootstrap и миграция

Fresh bootstrap должен создавать:

- короткий `testing/index.md` со ссылкой на strategy;
- компактный `testing/strategy.md` с безопасным минимальным шаблоном:
  risk-based выбор проверок, запрет формально «зеленить» failing tests и правило
  хранить execution evidence в operational artifacts.

Bootstrap не перечисляет обязательный набор test levels и не создаёт
project-specific gates без evidence.

Generated `AGENTS.md` и `structure-template.md` также не должны объявлять unit
tests или UI/e2e общими обязательными pre-merge gates. Их общий quality-gate
текст должен требовать только применимые project-native checks из task/spec/
PRD evidence и сохранять существующие tier/verification правила.

`Fresh bootstrap` здесь означает, что `.memory-bank/` отсутствовал в момент
старта `init-mb.js`. Решение нельзя основывать только на наличии флага `--sync`:
даже если script вызван с `--sync` для ещё не существующего Memory Bank, это
fresh target; если `.memory-bank/` существовал до запуска, это legacy/existing
target и новый baseline-файл не seed-ится.

Для существующих target-проектов не нужен автоматический semantic migrator.
Произвольный пользовательский index нельзя молча перезаписывать.

Достаточно следующего пути:

1. fresh bootstrap создаёт новую структуру;
2. sync существующего Memory Bank не создаёт `testing/strategy.md` и не меняет
   существующие index или spec registry;
3. legacy target продолжает использовать testing path, уже зарегистрированный
   в его `spec-index.md`;
4. переход на новую структуру выполняется вручную, если он вообще нужен;
5. framework не обнаруживает, не классифицирует и не мигрирует legacy content;
6. custom files не перезаписываются без явного действия пользователя.

## Acceptance criteria

- Fresh bootstrap создаёт отдельные `testing/index.md` и
  `testing/strategy.md`.
- Fresh `testing/index.md` ссылается на strategy и `spec-index.md`, а fresh
  `spec-index.md` регистрирует strategy как `active` framework baseline с
  explicit user decision change route.
- Sync legacy target не создаёт второй testing strategy document.
- В fresh или явно мигрированном target `testing/index.md` остаётся коротким
  router после `/prd` и `/add-tests`.
- `/prd` больше не содержит `testing/index.md` или `testing/strategy.md` в
  outputs и не имеет отдельного testing-documentation шага.
- Запуск и повторный запуск `/prd` не создают и не изменяют файлы в
  `.memory-bank/testing/`.
- `/prd` сохраняет только feature/requirement-level verification pointers в
  собственных L1-L3 outputs.
- `/add-tests` не создаёт и не изменяет файлы в `.memory-bank/testing/`.
- `/add-tests` требует existing indexed `in_progress` TASK ID с подходящим
  scope, не создаёт synthetic `TASK-TESTS-*`, выбирает test level по риску и
  пишет evidence в существующий tier-selected task path.
- Tier policy не меняется: T2/T3 сохраняют executable verification path, а
  T0/T1 сохраняют compact evidence и documented no-runnable-check route.
- `testing_strategy` отсутствует среди обязательных Backbone Area
  `/spec-design`; новый testing workflow или writer responsibility не
  добавляются.
- `/spec-design` содержит только короткую boundary rule: не изменять baseline
  strategy, разрешать canonical path через `spec-index.md` и использовать
  существующий subject-based routing для concrete verification concerns.
- `/spec-design` и generated `architecture/system-architecture.md` больше не
  содержат отдельный global `Testing Strategy` surface, но concrete test
  harness/verification/evidence specs остаются допустимыми subject concerns.
- Generated general quality-gate guidance не содержит blanket unit/e2e списка и
  требует только evidence-backed project-native checks, не меняя tier policy.
- Fresh `spec-index.md` регистрирует `testing/strategy.md`, а legacy target
  продолжает использовать собственный зарегистрированный path до ручной
  миграции.
- Canonical commands остаются в project-native конфигурации.
- Test execution results остаются в `.tasks/` и `.protocols/`.
- Повторный запуск skills не добавляет в index task status, next actions,
  commands или execution history.
- Existing custom testing docs не перезаписываются автоматически.

## Минимальные проверки реализации

- Bootstrap smoke подтверждает наличие обоих testing files и ссылки между ними.
- Bootstrap smoke подтверждает ссылку index → `spec-index.md`, active registry
  row для strategy и отсутствие `testing_strategy`/`## Testing Strategy` в
  generated backbone/architecture templates.
- Legacy sync smoke подтверждает, что отсутствующий `testing/strategy.md` не
  создаётся рядом с legacy normative `testing/index.md`; содержимое legacy
  `testing/index.md` и `spec-index.md` до и после sync byte-identical.
- Source search подтверждает, что `/prd` не объявляет файлы `testing/*` своими
  outputs и не содержит инструкций изменять их.
- Source search подтверждает, что `/add-tests` не создаёт и не изменяет
  testing documentation.
- Source search подтверждает, что `/add-tests` не использует `TASK-TESTS-*`, не
  задаёт фиксированный e2e-first порядок и маршрутизирует evidence только через
  existing indexed TASK ID и tier policy.
- Source search подтверждает отсутствие обязательной строки `testing_strategy`
  в `/spec-design` и generated Backbone template.
- Source search подтверждает отсутствие отдельной `## Testing Strategy` секции
  в generated system architecture template и blanket `testing gates` interview
  item/`minimal testing gates` default в `/spec-design`.
- Source search подтверждает отсутствие blanket unit/e2e pre-merge списка в
  generated `AGENTS.md` и `structure-template.md`; task-local test examples и
  явно применимые project gates при этом не запрещаются.
- Source checks подтверждают, что `/spec-auto`, `/foundation-to-tasks` и
  `/prd-to-tasks` по-прежнему умеют обнаруживать и создавать только применимые
  subject-based verification/test-harness/evidence specs.
- Tier-policy checks подтверждают, что идея не добавляет обязательный executable
  gate для T0/T1.
- Source search не находит инструкций записывать operational data в
  `testing/index.md`.
- В `mb-lint` не добавляется отдельный unconditional REQUIRED-check для
  `testing/strategy.md`: fresh links уже покрываются существующей проверкой
  broken links.
- Новая semantic validation содержимого index не добавляется.

## Implementation touchpoints

Ожидаемый source write set для реализации:

- `skills/_shared/references/commands/prd.md`;
- `skills/_shared/references/commands/add-tests.md`;
- `skills/_shared/references/commands/spec-design.md`;
- `skills/_shared/scripts/init-mb.js`;
- `skills/_shared/references/structure-template.md`;
- `skills/mb-init/SKILL.md`;
- `skills/_shared/agents/mb-reviewer.md`;
- `README.md`, `howItWorks.md` и при необходимости workflow map, если его текст
  меняется;
- `.github/workflows/release-check.yml` для fresh/legacy smoke assertions.

`mb-lint` и `mb-doctor` не требуют semantic или schema изменений: первый уже
проверяет broken links, второй оценивает фактически существующие Backbone Area
rows и не требует строку `testing_strategy`. Изменять их можно только если
реализация обнаружит concrete regression, а не профилактически.

## Non-goals

- Не создавать отдельный testing skill, workflow или registry.
- Не добавлять новый обязательный gate в `/spec-design`.
- Не добавлять в `/spec-design` fallback, legacy routing или проверку
  достаточности bootstrap strategy.
- Не вводить обязательную test pyramid или coverage target.
- Не переносить testing strategy из одного шага `/prd` в другой файл: `/prd`
  полностью перестаёт быть writer testing documentation.
- Не создавать verification contract для каждой feature по умолчанию.
- Не хранить inventory test files в Memory Bank.
- Не дублировать task evidence в testing strategy.
- Не строить автоматическую миграционную систему ради двух Markdown-файлов.
- Не добавлять dual-path fallback в skills: canonical testing path берётся из
  существующего `spec-index.md`.
- Не создавать taskless testing workflow, synthetic `TASK-TESTS-*` или второй
  task/evidence registry для `/add-tests`.

## Бюджет сложности

```text
+ 1 файл fresh-bootstrap skeleton: testing/strategy.md
+ 0 новых skills
+ 0 новых workflows
+ 0 новых lifecycle statuses
+ 0 новых schemas
+ 0 новых readiness gates
+ 0 semantic migrators
```

## Ожидаемый результат

Исправление добавляет один стабильный документ `testing/strategy.md` и уточняет
границы существующих writers. Index снова становится router, `/prd` становится
короче и отвечает только за L1-L3 decomposition, `/spec-design` не получает
новой обязанности, `/add-tests` остаётся внутри существующей task/tier model, а
operational evidence остаётся вне durable navigation documents.
