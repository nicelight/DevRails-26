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

### Уточнение пользователя — plugin-only и настройки на станциях

Пользователь запретил модификации DSH и выбрал KISS-управление. Предыдущие
предложения двух upstream hooks отменены. Последовательный source review
`nav_plugin_only` подтвердил внешние bundles, dynamic `dsh.client` modules,
existing webServer/Connection и package-mode Remote generation: собственная
сборка плагина допустима, правки core/web-entry DSH не нужны. Native Stop
сохраняет session semantics; Nav управляет своими запусками и отменой через
existing handles. Полную осведомлённость Main/Side и контроль ручных изменений
исходников пользователь исключил из задач проекта.

Следующее явное решение: во время перегона модели/options/enablement не меняются.
Можно поставить red после следующей станции; после результатов всего перегона
становится доступна настройка, green фиксирует весь следующий перегон. Без red
поезд продолжает автоматически, без кратковременного окна редактирования.
Side и helicopter consultation остаются доступными в движении.

`nav_station_boundaries` сначала завершил только semantic correction:
autonomy/tier policy, актуальные semantic/entry docs и doctor regression.
Exe/verify/red остаются отдельными legs, поэтому future toggle на станции
не требует новой task attempt. Partial/blocked/failed/decision-needed outcomes
не требуют синтетического success. Results/schema/lifecycle сохранены.
Syntax, full doctor/install-sync и isolated delivery/deployed doctor прошли;
source shared-* =0. Результат — `SEMANTIC_STATION_SETTINGS_RESULT.md`.

Только после этого `nav_plugin_only` актуализирует архитектуру/план. Read-only
helicopter consultation с разбором рекомендаций на станции — рабочее предложение,
а не отдельное принятое пользовательское требование. Основной выигрыш station
boundary — меньше settings/race/UI cases; native lifecycle, карта, Side и
actual-state recovery остаются. Процент экономии без реализации не оцениваем.

`nav_plugin_only` завершил последовательную актуализацию architecture/plan/entry
docs. Удалены upstream hooks и их проверки, live peer updates, global native
Stop interception и отдельная защита host files. Внешняя package/client delivery
описана по существующему plugin manager, dynamic modules и package-mode Remote.
Station snapshot един для всей группы, Pause/red удерживают следующий admission;
Nav Stop best-effort, native Stop сохраняет штатный session scope.

Документационная source-проверка: 37 локальных и 37 pinned DSH links существуют,
diff-check проходит, source shared-* =0. Runtime не создавался и не запускался;
архитектурный verdict явно RUNTIME_UNVERIFIED. Timing helicopter остаётся
открытой деталью: рекомендована инспекция ближайшей станции, без навязывания
новой реализации. Для ответа пользователю оценка качественная: сильное
упрощение settings/admission и тестов, умеренное сокращение проекта в целом.

### SDD-спецификации → проверка стоимости → реализация

Пользователь поручил последовательно создать только основные SDD specs с
акцентом на HOW/WHY, затем проверить острые углы и исключить функции, чья
ценность существенно ниже стоимости, и при приемлемом результате перейти к
оркестрации кода. Авторизация реализации уже дана; новый общий permission gate
не требуется. Сохраняются один Astra medium за раз и стратегическая роль root.

Последнее принятое уточнение Judge: кнопка во время работы отправляет main
prompt через native `agent.steer`; running агент читает его на ближайшей step
boundary, idle просыпается. Не нужно ждать станции. Main формулирует задание,
host запускает Judge с заранее выбранными параметрами; кнопка уже разрешает
консультацию. Результат не завершает текущий leg и не разрешает смену маршрута.
Предыдущее предложение station-only inspection отменено.

Автор `nav_core_specs` создаёт spec/README.md, architecture.md, controller.md,
feedback.md, evidence.md, sessions-ui.md и spec-graph.yaml. Specer используется
для spec-layer/traceability, явные пользовательские HOW/WHY и KISS важнее
обязательного анкетирования и универсальных scaffolding-полей skill. Код пока
не пишется. Следующий агент выполняет независимую consistency/value-cost
приёмку; далее идут последовательные исполняемые срезы плагина.

### Основные specs и cost/value review — готовы к коду

`nav_core_specs` создал пять основных HOW/WHY контрактов, spec/README.md и
spec-graph.yaml. `nav_spec_value_review` независимо проверил и исправил пакет;
итог `spec/REVIEW.md`: READY_FOR_IMPLEMENTATION, runtime ещё unverified.

Материальное уточнение: H steering меняет назначение main ответа только после
того, как native step действительно принял соответствующее сообщение. Capture
сохраняет привязку уже выполняющегося tool call; queued steering после
concludeTurn может продолжить тот же turn. Terminal leg result приходит только
от child activation. Отдельные inbox scheduler/inspection engine не нужны.

Cost cut: отдельный журнал settings deltas исключён; current settings/revision
и snapshot каждого leg сохраняют фактически применённые параметры. Основные
пользовательские функции сохранены, оформление не блокирует headless slice.
Проверены 26 local links/anchors, DAG 6 nodes, source shared-* =0.

Реализация разрешена пользователем после этой проверки. Первый один агент
делает external package + isolated native DSH vertical slice; следующие срезы
последовательно покрывают admission/evidence/recovery, semantic interaction/H,
Side и согласованную schematic UI. Source-only assets/legacy installer остаются
проверяемой доставкой framework, а не выдаются за уже готовый DSH adapter.

### Реализация: foundation slice в работе

Единственный активный исполнитель `nav_implementation_foundation` (Astra medium).
Specs приняты и отправлены commit `14cd949`; код ещё не принят. Исполнитель
сохраняет checkpoint в `IMPLEMENTATION_FOUNDATION_RESULT.md`. Уже созданы
external package/resource build, extracted command inventory, controller/store,
DSH adapter и role composition. Используются native DSH tool-fs, не собственные
file tools. Первый путь пока file-only/all-off; более сложные задачи явно
отклоняются до следующего среза, а не ложно завершаются.

Frozen dependencies upstream установлены. Общий `build:lib:host` сгенерировал
Typert artifacts, но compiler исчерпал доступную память; остановлены только
процессы запущенной исполнителем сборки. Остальные процессы не затронуты.
Продолжение — minimal dependency build и source-resolved native lifecycle tests,
без повторного aggregate typecheck. Отдельно требуется доказать package build/
delivery; source-resolved test не объявляется real-provider или полной
установкой DSH. Upstream source modifications по-прежнему запрещены.

Foundation checkpoint: опубликованный npm DSH `0.2.2-alpha.2` выбран для
изолированной package сборки вместо aggregate upstream build. Research SHA
сохраняется как источник анализа, это не утверждение тождества версий. Typert
package generator потребовал registered workspace protocol; собственный build
staging с public protocol declarations позволил получить штатные descriptors
без patches. Package build и own host typecheck PASS, installer smoke PASS.
Bundle sizes reported: host 23 KB, native addon 1.6 KB, Svelte status 856 KB.

Native Loader уже загружает пакет. Scoped agentPresets mount исправлен; после
reset контекста root передал точное состояние из reports, повтор native test
дошёл до draft mismatch task JSON Schema. Исполнитель меняет Ajv на 2020-12.
Native lifecycle, packed delivery и truthful evidence ещё требуют успешного
прохода. Reset не является завершением среза; исполнитель продолжает один.

### Foundation принят: package и native task loop

`nav_implementation_foundation` завершил первый срез. Реальный DSH Loader,
agent loop, tool-fs и child lineage проверены с deterministic provider через
`npm pack` / изолированное распаковывание. Четыре integration tests, own build/
host tsc и install-sync PASS; auth, generated Remote и stale revision отказ
проверены. Source shared-* =0. Реальный provider и browser пока не проверены.

Native composition исправлена: allow:[] скрывал preset-owned tools; запрет
лишних inherited tools и dispatch guard теперь сохраняют native file tools.
Подробности и ограничения: IMPLEMENTATION_FOUNDATION_RESULT.md. Это первый
срез file-only T0/T1/all-off, а не готовый plugin. Следующий агент расширяет
исполнение и выбранные проверки, станционную конфигурацию и recovery; затем
semantic interactions/H, общий command routing и Side/map. Полный aggregate
upstream build не повторять; один опубликованный DSH baseline 0.2.2-alpha.2.

### Execution принят: legs, station settings, actual-state recovery

`nav_execution` завершил расширение indexed-task пути: native bash/local checks,
verify/red группы, independent roles и frozen routes, station-only edits,
Pause/red/Stop, Resume прежней attempt, dependency queue, repair budget default 3.
Conditional reports и partial/skipped/production remainder сохраняют реальные
результаты; canonical validator принимает записи. 18 сценариев / 22 native tests,
build/typecheck и diff-check PASS; shared-* =0. Подробный handoff —
IMPLEMENTATION_EXECUTION_RESULT.md. Real provider/browser/full host не проверены.

Cost decision: собственная shell песочница/deny-list ради запрета записи
отдельных metadata files внутри writable project не строится. Native DSH
permissions/sandbox + protocol prohibition; direct file guard сохраняется.
Main/Judge/Side read-only composition сохраняется. Spec architecture уточнена.
Это устраняет дорогое ложное обещание, не вводя новый security subsystem.

Следующий последовательный срез: общий model feedback, consent/autonomous,
command-family routing и H steering/consultation. Side/map — после него.

### Semantic/routing: перед последней приёмкой

`nav_semantic_routing` реализовал native pre-step assignment/capture, один
nav_feedback, actual-user consent/freshness, native H steer/Judge и families
37 команд. Representative PRD→planning→task import→exe→feature red→sync и
REJECT→green→owning repair→re-review прошли. Targeted bootstrap, recovery,
Stop/Judge и freshness также прошли. Root не принял вырезание no-target
consultation как unsupported: это явное базовое требование пользователя.
Минимальная ветка реализована существующим pending: facts→main interpretation
→unfinished owner same attempt; factual subject.complete исключает повтор
готового subject. Native test подтверждён; full suite 36/36 PASS.

Последняя локальная правка удерживает automatic semantic delivery при Stop;
исполнитель повторяет build/test после неё. Его context reset застал эту точку;
root восстановил статус из сообщений, поскольку IMPLEMENTATION_SEMANTIC_RESULT
ещё содержал старые checkpoints. Новый функционал не добавляется до final
handoff. Всё ещё впереди: Side и SVG UI, затем независимая итоговая приёмка.

Semantic/routing принят: последняя Stop правка прошла повторный build/typecheck
и 36/36 native tests (32 top-level, 46.95 s); diff-check PASS, shared-* =0.
Финальный handoff обновлён. 37 command IDs имеют shared-family mapping; это
не индивидуальная end-to-end сертификация всех веток. Проверены representative
product/planning/execution, owning repair, bootstrap и subject recovery.
Следующий агент делает Side и schematic SVG UI с semantic zoom, сохраняя
штатный main chat. Визуальная детализация остаётся отдельно от принятия flow.

### Side и schematic UI приняты к браузерной проверке

`nav_side_map` завершил native Side fork/read-only/model override/DEL/recovery,
метрики own context/compactions и Svelte SVG map/Side chat на native transport.
Full regression 40/40 PASS; после candidate display fix rebuild/typecheck и
targeted 3/3 PASS; diff-check PASS, shared-* =0. Handoff обновлён после context
reset; ошибочный ответ о чистом дереве относился к default original26, root
вернул исполнителя в Nav27, где все изменения сохранились.

Эскиз nav27-map-reference.svg показан, async feedback пока без ответа. Пользователь
ранее разрешил schematic implementation: layout остаётся рабочим draft, а не
утверждённым дизайном. Actual reviewers отображаются ниже карты; backend сейчас
последовательно запускает selected peers, что UI показывает честно.

Fresh isolated preview: PID2042260, session8417, http://127.0.0.1:32995/nav27/.
Login URL в /tmp/nav27-preview.log, temporary project /tmp/nav27-native-D77cVp/project.
Это настоящий controller/native session transport с deterministic provider,
не реальная модель и не полная native DSH chat shell. Последняя отдельно
требует full host. Следующий один агент: browser acceptance + только
подтверждённые исправления и проверяемая инструкция установки/запуска.

### Итоговая независимая приёмка — PASS базового flow

`ui_qa` проверил Chromium desktop1440/narrow390 и полный published DSH web
0.2.2-alpha.2 на локальном Node24.22.2 в изолированном профиле. Подтверждены
нативная установка tar через plugin manager, /nav27/, dynamic addon и cold
переход в сохранённую main session без modifications upstream/provider calls.
Исправлены material defects: Svelte proxy clone settings, pan→Side drag latch,
combined Red/Stop/Pause deadlock, reconnect banner, native event source fixture,
client factory format/dependency package IDs и session baseline navigation.

Cost-cut: отдельные native-chat pending/Stop widgets исключены как дублирование
карты. Вопрос/action уже видны в native tool text, main consent сохраняется.
Spec sessions-ui приведена к этой границе. Нет своего transport/sandbox/loop.

Final build/typecheck PASS; 41/41 native tests PASS; diff-check PASS; shared-*0.
ACCEPTANCE.md содержит browser evidence и limitations; QUICKSTART.md —
проверенную установку и использование. Provider calls/качество моделей, все
37 routes E2E, proxy и настоящий reviewer confinement backend не проверены.
Selected reviewers последовательны; draft geometry не утверждена пользователем.
Это работающая базовая версия, не обещание полной alpha/provider совместимости.

Оставлен один fresh fixture preview PID2067685: http://127.0.0.1:41903/nav27/.
Login URL в /tmp/nav27-preview.log. Полный временный host и browser QA остановлены.
Все четыре implementation slices и acceptance завершены последовательно
Astra medium; дальнейшая декоративная детализация не добавлялась.
