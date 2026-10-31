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
3. **В работе:** итоговые docs и независимая проверка всей семантики; исправления.
4. Ожидает завершения этапов 1–3: архитектура Nav/DSH.

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
