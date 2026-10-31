# DevRails Nav 27 — журнал оркестрации

## Задача и порядок

Адаптировать семантику всех runtime skills, общих инструкций, ролей, workflows
и протоколов DevRails к будущему плагину DSH. Проверить доступность и согласованность
результата после установки. Только после завершения этой работы проектировать
архитектуру плагина на основе адаптированной семантики и актуального кода DSH.

Оркестратор: основной агент. Исполнители: `gpt-6-astra`, reasoning `medium`,
строго один активный сабагент. Интервал проверки прогресса — около пяти минут;
сообщения о завершении и блокерах обрабатываются при получении.

Рабочее дерево: `/home/serg/Projects/DevRails Nav 27`.
Ветка: `devrails-nav-27`. Исходная точка этой работы: `82e3c4f`.
Основное дерево DevRails 26 не редактируется.

## Принятые границы

- Решения пользователя собраны в `DEVRAILS_NAV_27.md`; конкретные предложения
  реализации в нём ещё могут уточняться. Требования пользователя имеют приоритет
  над прежними неизменяемыми контрактами DevRails 26.
- Все модели и субагенты выполняются штатными механизмами DSH. Внешних CLI
  и Codex App Server нет. Scheduler и механика lifecycle принадлежат коду;
  семантика разработки и выбора решения — моделям.
- Проверки, роли и артефакты условны согласно настройкам. Отключение всех verify
  означает skipped, не PASS; допускается закрытие реализованной задачи без проверки.
- Единый короткий feedback; подробные уточнения только по ситуации. Все отклонения
  и консультации на основном пути используют один механизм решения: вопрос и
  красный, согласие в основном чате или зелёный. В `/autonomous` решение принимается
  автоматически; явные остановки пользователя сохраняют силу.
- Сохраняются предметная ценность команд и восстановление по Memory Bank.
  Не сохраняются ради совместимости обязательные старые gates и длинные инструкции.
- Source-only packaging: canonical source, установка, deployed references и реальное
  поведение проверяются вместе. Generated dogfood не является местом заметок.
- UI/plugin runtime пока не реализуется. Архитектура не прорабатывается параллельно
  с изменением семантики. KISS ограничивает каждое предлагаемое дополнение.

## Этапы

1. **Завершён:** полная инвентаризация семантики, переходов и необходимых изменений.
2. **Завершён:** shared/entry, planning/reviews, execution/validators.
3. **Завершён:** независимая приёмка — READY_FOR_ARCHITECTURE.
4. **В работе:** архитектура Nav/DSH на принятой семантике.

## Записи

### Начало

Рабочая ветка чистая. Подтверждены source-only цепочка и существующие install-sync
и mb-doctor проверки. Первая делегация — инвентаризация, без изменения runtime
и без проектирования архитектуры. Детали должны оставаться в документах;
сводки для оркестратора — краткими и проверяемыми.

### Инвентаризация — завершена

Исполнитель: `/root/semantics_inventory`, Astra medium. Результат:
`SEMANTIC_INVENTORY.md` и `TRANSITIONS.md`; покрыты 37 команд и все семейства
runtime source, generator, validators и описаний. Архитектура не проектировалась.

Ключевые зависимости для следующих пакетов:

- Doctor требует full protocols/PASS/T3 semantic-pass и T2 feature semantic-pass;
  условное выполнение нужно отразить и в этих проверках.
- Init/templates и exact-string assertions воспроизводят fixed models/reviewers/Judge.
- Isolated bootstrap обнаружил недоставляемые shared agents/recovery references.
  Required references необходимо проверить в target после изменений.
- Scheduler сейчас существует в prompts. На семантическом этапе описывается
  граница его ответственности, но DSH runtime ещё не создаётся.

Выбраны четыре последовательных пакета из inventory: общие/entry инструкции;
planning/reviews; execution/validators/delivery; итоговые docs и независимая проверка.
Первые два не зависят от уточнений политики execution checks.

Пользователю заданы два необязательных уточнения: независимый red-verify без
functional verify; отдельная настройка локальных checks внутри exe. Предложения
по умолчанию: независимый semantic review с честной отметкой; local checks
включены и настраиваются отдельно. Пока ответа нет, зависимые контракты не правятся.
Остальные reviews сохраняют полезные исходные defaults, оставаясь отключаемыми.
Полученный FAIL сохраняется; repair/продолжение является явным решением по уже
согласованной политике обычного или autonomous режима, не подменой verdict.

### Пакет 1 — завершён

Исполнитель: `/root/semantics_base`, Astra medium. 29 runtime/package источников,
связанные install-sync assertions и `SEMANTIC_BASE_RESULT.md`. Общий контракт
находится в уже доставляемом `workflows/autonomy-policy.md`; fixed models,
fanout и механический scheduler из этого scope удалены.

Проверки исполнителя: syntax, полный install-sync, отдельные install-only/bootstrap,
deployed parity/references/anchors, 0 generated shared-*; diff-check. Полный
doctor regression и conditional evidence matrix остаются пакету 3.

Интеграционный просмотр выявил и исправил формулировку, делавшую общий feedback
необязательным. Он обязан быть единым коротким структурированным интерфейсом;
точные поля/transport отложены до архитектуры. Уточнено сохранение autonomous
decision policy во всём run, включая legacy handoff в autopilot. После локального
исправления проверены затронутые assertions, syntax и diff-check.

Следующий исполнитель адаптирует planning/review commands, shared agent prompts
и связанные references. Исполняемые validators пока сохраняют известные старые
ограничения; готовность всей миграции не заявляется.

### Пакет 2 — завершён

Исполнитель: `/root/semantics_planning`, Astra medium. Адаптированы 12 команд,
шесть agent prompts, оба semantic packs и recovery/concept/ADR/deprecated references.
Результат и доказательства: `SEMANTIC_PLANNING_RESULT.md`.

Installer теперь доставляет все шесть prompts по владельцам; recovery и optional
design templates доступны в target. Проверены parity/sync ресурсов, anchors,
148 command copies, 17 resource routes, отдельные install-only/bootstrap/sync,
syntax, mb-doctor regression, install-sync, deployed doctor и 0 generated shared-*.
Прохождение старых regressions не доказывает conditional evidence: это пакет 3.

Для пакета 3 существенны conditional Foundation gate, tasking без отключённого
design/positive revision и честное закрытие без PASS. Существующие ID и evidence
сохраняются; отрицательный verdict не переписывается.

Ответов на два необязательных уточнения пока нет. Оркестратор сообщил выбранные
стартовые defaults для продолжения: red-verify независим и использует доступное
implementation evidence, явно отмечая отсутствие functional proof; локальные exe
checks имеют отдельную настройку и включены по умолчанию. Это рабочие defaults,
не новое явное решение пользователя и не запрет их отключить. Общая авторизация
адаптации позволяет продолжить; дальнейший ответ пользователя имеет приоритет.

### Пакет 3 — завершён

Исполнитель: `/root/semantics_execution`, Astra medium. 14 commands, 7 protocol
templates, skeletons и validators/tests; результат `SEMANTIC_EXECUTION_RESULT.md`.
DSH runtime не создавался.

Минимальное data-решение: existing `task.verify` entry `stage: workflow` хранит
attempt, выбранные проверки/участников/design/protocols и фактические results.
Protocols default пуст; inline evidence допустим; disabled design не требует
пустого backbone. Старые записи читаются по историческим правилам, без backfill.
Feature/Foundation используют existing registry, `Gate Task: not_required`
допускается при выбранной реализации без отдельного proof gate.

Важная межпакетная находка: code-only reviewer возвращает candidate findings,
не functional verdict. Исправлены verify/doctor/matrix: main-off не создаёт
hidden main или synthetic PASS. Negative findings/verdict сохраняют disposition.

Пройдены syntax, full doctor matrix, install-sync, отдельные install-only/bootstrap/
sync в `/tmp/nav27-execution.lELVGm`, 62 deployed references и source-only check.
Deployed strict doctor принимает T2 done/all-off без reports (0 errors/warnings).
Matrix включает all-off T0–T3, secondary/code-only, red-alone, local checks,
negative disposition/failure→skip rejection, interrupted work, disabled design,
optional Foundation, malformed identity/dependency и сохранение истории при sync.

Контекст исполнителя оборвался после сохранения результата; передача восстановлена
из result-файла и краткой сводки оркестратора. Незавершённого follow-up нет.
Независимый следующий проход проверяет согласованность всех пакетов и обновляет
общие описания. Только после его verdict начинается архитектура.

### Независимая приёмка — READY_FOR_ARCHITECTURE

Исполнитель: `/root/semantics_acceptance`, Astra medium. Проверены 37/37 commands
и все семейства source, generator и validators. `SEMANTIC_ACCEPTANCE.md` содержит
покрытие, walkthrough и фактическую validation. Блокеров нет.

Исправлены пять подтверждённых дефектов: historical repair учитывает selected
своей попытки; optional design matrix; candidate-only verification template;
global redesign без recorded revision; sync только host-recorded lifecycle.
Обновлены общие docs, inventory/transitions и metadata/display Nav27; compatibility
markers/bin сохранены. Исторические результаты предыдущих пакетов сохранены.

Syntax/full doctor/install-sync прошли. Независимо сверены 148 command copies,
68 resource copies, workflows/roles/templates/validator files и required references.
Deployed strict doctor подтвердил all-off closure, selected historical repair
и optional matrix; unselected repair отвергнут. Source shared-* =0.

Архитектурная делегация начинается только после этого verdict. Её source of truth:
принятые решения пользователя, текущая canonical семантика и проверяемый код DSH.
Архитектурные эскизы в DEVRAILS_NAV_27 не являются обязательством сохранить
раньше предложенные механизмы. Runtime/UI implementation остаётся вне этапа.

### Архитектурный проект — подготовлен, передан на независимую приёмку

Исполнитель: `/root/nav_architecture`, Astra medium; завершил после приёмки
семантики, без параллельных изменений contracts. Созданы `ARCHITECTURE.md`
и `IMPLEMENTATION_PLAN.md`; прежние эскизы заменены ссылками в общих docs.
DSH source и remote HEAD: `ce7073d51254c26cd63b22a60835b8f948deb447`.

Выбраны один host-controller, шесть семейств обработчиков, компактный feedback
с ситуационным уточнением, один pending decision и existing task.verify evidence.
Main — постоянный семантический оркестратор; предметную работу выполняют native
DSH children, механический переход не требует дополнительного main LLM call.
Standalone Svelte использует headless native transport; маленькое дополнение
native client отвечает за переход в main chat и показ pending proposal.

Проверенные ограничения DSH: native model selection не знает Nav run state;
native Stop main сам не останавливает host-owned children; generic fork наследует
preset; scoped guards наследуются дочерними агентами. Предложены два маленьких
admission hooks, собственная Side composition и точная область guards.
Workspace-write shell не обеспечивает protected-path isolation host JSON;
абсолютная гарантия такой защиты не заявляется.

Архитектор проверил 33 pinned source links, mapping всех 75 transition IDs,
diff-check и отсутствие generated shared-* в source. Runtime ещё не создан:
auth/bootstrap, отмена и гонки требуют integration spike из плана.
Следующий единственный агент `/root/nav_architecture_acceptance` проверяет
доказательность seams, необходимость hooks, KISS и соответствие contracts;
runtime/UI и canonical semantics не меняет.

### Приёмка архитектуры — последовательный возврат к семантике

`nav_architecture_acceptance` завершил source review и сохранил
`ARCHITECTURE_ACCEPTANCE.md`. Исправлены три доказанные детали: native header
Stop при idle main/active children, обязательный `meta.isSeeded` для Side seed,
явный Side model selection после seed вместо перекрываемого agentOptions.
Два узких upstream hooks подтверждены; третьего hook не требуется.

Root заметил слишком ранний freeze selected, reviewer подтвердил blocker:
tier-policy фиксирует все будущие проверки до exe. Это противоречит исходному
требованию live enablement будущих этапов. Архитектурный проход остановлен
с `BLOCKED_SEMANTIC_ALIGNMENT`, canonical не менялся в параллель с ним.

Единственный следующий агент `semantics_live_selection` корректирует эту
границу: planned work можно менять до соответствующего запуска в текущей
attempt без повторного exe/approval; начатая работа сохраняет snapshot,
исторические результаты и failures не стираются. Новые registry/lifecycle
не нужны. После результата архитектурная приёмка возобновится последовательно.

### Live selection — исправлено и проверено

`semantics_live_selection` завершил узкое исправление; результат сохранён
в `SEMANTIC_LIVE_SELECTION_RESULT.md`, semantic verdict READY_FOR_ARCHITECTURE.
Freeze относится к launch/skip конкретной операции или участника; pending
selection изменяется в той же attempt. Embedded local checks сохраняют snapshot
exe; ещё не запущенные verify peers и red можно менять. Начатая работа и
результаты сохраняются; schema/validator/lifecycle не изменены.

Syntax, full doctor suite, install-sync и isolated install/bootstrap/sync прошли.
Deployed strict doctor подтвердил active exe → pending-off → done одной attempt
без reports/PASS и без повторного exe; pending-peer off не устраняет main FAIL.
Source shared-* =0. Архитектура во время этого исправления не менялась.
Теперь единственный architecture acceptance agent продолжает согласование
документов с исправленным контрактом и завершает приёмку.

### Итоговая архитектурная приёмка — READY_FOR_IMPLEMENTATION_SPIKE

`nav_architecture_acceptance` завершил повторный проход после `f757db1`.
Согласованы architecture settings/recovery/handlers/sequences и build plan:
freeze целой task attempt/batch устранён, pending enablement применяется
перед соответствующим launch/skip. Semantic blocker закрыт.

Source review подтверждает 75/75 переходов, 34 локальные и 37 pinned DSH links,
два необходимых узких admission seams и existing native header Stop extension.
Side seed/metadata/model selection явно описаны. Diff-check и source-only=0
прошли. Финальный verdict и ограничения — `ARCHITECTURE_ACCEPTANCE.md`.

Этап пользователя завершён: семантика адаптирована и проверена, затем
архитектура спроектирована и независимо проверена. Агенты работали по одному;
возврат к semantic correction был отдельной последовательной фазой.
DSH plugin/hooks/UI ещё не реализованы. Следующий технический этап — isolated
integration spike по `IMPLEMENTATION_PLAN.md`; перед полной картой требуется
согласовать визуальное расположение маршрутов. Papercut logs остаются локальными
пользовательскими workflow-записями и в продуктовый commit не включаются.
