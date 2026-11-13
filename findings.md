# GreenField manual flow: findings и решения

Область: сокращение обязательного процесса в ручной разработке. Ниже отделены
наблюдения о текущем коде от решений о новом поведении. Это не дополнительные
требования к разрабатываемым через DevRails проектам.

Наблюдения аудита и номера строк в разделах 1–13 относятся к исходной версии
до переработки. Текущее состояние реализации описано ниже; исторические
формулировки не являются инструкциями для runtime-агента.

## Принято пользователем

- В manual flow агент предлагает достаточную глубину работы и консультируется
  с оператором по содержательным решениям. Самостоятельное принятие решений
  разрешено на автопилоте или при явном поручении действовать автономно,
  самостоятельно, в пределах этого поручения. Это уточнение заменяет прежнюю
  формулировку о самостоятельном выборе агента по умолчанию.
- Пользователь может отменять шаги процесса без оформления исключений.
  Цели, явные ограничения пользователя и честность отчёта сохраняются.
- Существующая Memory Bank сохраняется; формат JSON-карточек разрешено
  переработать, если это упрощает работу. Ручной агент может
  в рамках согласованных решений обновлять затронутые спецификации/план,
  выполнять работу, проверять и закрывать задачу без обязательных переходов
  между командами. Новые содержательные решения требуют консультации, если
  самостоятельность не была явно предоставлена.
- Упрощение распространяется также на unattended flow.
- Основная цель — больше свободы агентам при сохранении основного flow:
  замысел/требования → фичи/проектирование → задачи → реализация/проверка → память.
  Сначала упрощаются формулировки skills и обязательные процедуры вокруг
  полезных данных. Состав карточки не сокращается без обоснования механизма.

## Реализовано

- Общая working policy находится в существующем `execute-loop.md`; leaf skills
  описывают свой результат и полезное продолжение без обязательных переходов
  между командами. Сохраняются результаты основных этапов разработки.
- Переписаны planning/execution/maintenance skills, роли и поддерживающие
  prompts. Убраны фиксированные анкеты, обязательные fresh contexts/co-review
  модели, дополнительные планы ради формы и повторное согласование принятого.
  Изменены 36 из 37 runtime-команд; `creator-vibe` сохранён. Суммарный текст
  команд сократился с 5815 до 1874 строк (примерно на 68%).
- Формальные APPROVE/Planning Revision/strict doctor больше не являются
  допуском к работе. Реальные зависимости, ясность результата и предоставленные
  полномочия сохраняют значение.
- TDD, отдельный verifier/red-review и полный набор protocol files рекомендованы
  по необходимости. Карточка сохраняет фактические результаты; шаблоны помогают
  продолжению работы, но не возвращают прежние требования при их использовании.
- Top-level исполнитель может завершить порученную end-to-end задачу любого
  tier; отдельное объявление closure owner не нужно. Read-only и ограниченные
  поручения не расширяются. В scheduler flow финальное состояние остаётся за
  scheduler; checkpoint и восстановление сохраняются.
- Doctor согласован с компактным evidence любого tier, optional protocols,
  non-TDD proof и допустимыми guide-only источниками. Повреждённые карточки,
  реальные незавершённые зависимости и отсутствующее terminal evidence
  продолжают диагностироваться.
- Pre-mortem остаётся советом, а не разрешением или запретом на реализацию.
  Уточнены AC ownership и соотношение templates с общей policy.
- Обновлены deployed AGENTS, skeleton hints, документация и source project map.
  Generated MBB больше не требует refactor по счётчику обновлений или отдельный
  MB-SYNC после каждой wave.
- Schema сохранена побайтно в исходном определении: 22 поля, 18 required,
  прежний формат ID и lifecycle. `docs` не удалён. Отвязка tier/wave от ID
  не входит в эту переработку; разрешённое изменение согласуется вместе со
  ссылками без обязательного command/review roundtrip.

## Проверки реализации

- Syntax check — пройден.
- Isolated install/sync — пройден: обе runtime surfaces совпадают с source,
  явные workflow references/anchors доступны в target; sync сохраняет
  существующую непустую карточку, её evidence и protocol state.
- Doctor regression matrix — пройдена после последнего исправления; проверяет компактный/card-only T3, bare PASS без
  результата, guide-only sources, non-TDD evidence, actual dependencies и
  malformed status, а также раздельную привязку evidence двух AC.
- Финальные syntax и isolated install/sync проверки повторно пройдены после
  интеграции. `git diff --check` пройден; generated `shared-*` в source tree: 0.
- Интеграционный read-only review выявил оставшиеся старые MBB/template
  ограничения; они согласованы с новой policy.
- Это проверка инструкций, упаковки и детерминированных validators. Полный
  runtime-сеанс разработки пользовательского проекта не исполнялся.

### Регрессия, обнаруженная при реализации

В упрощённом `acceptance-trace.mjs` наличие AC locator в одном месте протокола
и результата другого AC в другом могло скрывать отсутствие результата первого
AC. Независимый review воспроизвёл случай `AC-001: pending` и
`Result: AC-002 observed`. Исправлено: диагностическая проверка связывает locator
и результат в одной записи/строке без обязательных RED/GREEN или отдельных
review-протоколов. Regression fixture подтверждает, что отсутствующим остаётся
только результат первого AC.

## Независимая проверка двумя Astra medium

Оба reviewer работали read-only по новой согласованной модели, без требования
вернуть отменённые процедуры. Смысловая проверка skills, ролей, протоколов и
переходов workflow не выявила подтверждённых материальных дефектов. Проверка
runtime/data/deployment выявила один открытый дефект ниже.

Дополнительно на изолированном target успешно выполнены bootstrap и sync;
карточка сохранена побайтно, shared references и review resources доступны на
обеих runtime surfaces, source-only ссылок в установленных skills не найдено.
Полный агентный сеанс разработки проекта не исполнялся. По результатам этого
review код не менялся.

### 14. P2 — пустая evidence-разметка скрывает отсутствие результата

Статус: открыт, воспроизведён на deployed CLI.

`skills/mb-garden/assets/mb-doctor/terminal-compat.mjs:13–14` принимает любой
непустой текст, кроме нескольких одиночных маркеров, и строка 31 прекращает
проверку отсутствующего terminal evidence. Поэтому составная запись без
наблюдений проходит проверку:

```json
{"verify": ["VERDICT: PASS\nEvidence:"]}
```

В изолированном bootstrapped target для schema-valid завершённой T0 задачи без
protocol/evidence-файлов:

- `verify: ["PASS"]` → `--strict --json`: exit 1, единственная ошибка
  `TASK_DONE_EVIDENCE_MISSING`;
- `verify: ["VERDICT: PASS\nEvidence:"]` → exit 0, `status: pass`, ошибок нет.

Связанный случай в protocol fallback на строке 35: `\s*` после двоеточия
захватывает переносы строк. Пустая запись
`VERDICT: PASS\n- Evidence:\n\n## Next action\n` принимается за evidence за
счёт следующего заголовка; это подтверждено узким вызовом deployed модуля.

Следствие: форматирование скрывает отсутствие фактического результата. Минимальное
исправление должно отличать пустую разметку от непустого содержимого, не возвращая
обязательные review, PASS-маркеры или подробные протоколы.

## Подтверждённые источники трения

Намеренно строгие правила ниже не объявляются ошибками реализации: они
объясняют нынешнее поведение, которое пользователь хочет пересмотреть.
Фактические расхождения инструкций и проверок выделены после карты полей.

### 1. Локальная простота не освобождает от глобального допуска

`skills/_shared/references/commands/exe.md`, `input_contract`: для любой
продуктовой задачи, включая T0/T1, нужны положительная Planning Revision и
актуальный `/review-tasks-plan APPROVE`. Отсутствие допуска останавливает
исполнение и возвращает к планированию и ревью.

Следствие: компактный протокол T0/T1 сокращает отчётность, но не позволяет
сделать небольшую ручную правку без всей предшествующей подготовки.

### 2. Изменение оценки риска требует пересоздания задачи

`skills/_shared/references/workflows/tier-policy.md`, Tier Classification and
Escalation: повышение tier требует остановки, rebuild/split через
`/feature-to-tasks`, повторного ревью и применимого doctor gate.
`skills/_shared/scripts/init-mb.js`, TASK_SCHEMA: tier встроен в ID.

Следствие: корректировка оценки по ходу работы меняет идентичность задачи,
а не только глубину проверки. Это структурная связь, которую нельзя убрать
одной заменой MUST на SHOULD.

### 3. Объём протокола назначается по категории задачи

`skills/_shared/references/workflows/tier-policy.md`, Tier Obligations, и
`skills/_shared/references/commands/exe.md`, required_outputs: T2/T3 требуют
пять файлов протокола; компактный вариант прямо запрещён. T2 требует отдельного
`/verify` и semantic review на завершении фичи, T3 — также на каждой задаче.
Claim-Linked RED / GREEN требует доказательств до изменения реализации.

Следствие: даже при ясном результате и достаточной локальной проверке агент
не может выбрать более короткое завершение ручной работы.

### 4. Ревью само порождает обязательный маршрут исправления

`skills/_shared/references/commands/review-tasks-plan.md`, hard_invariants и
operator_decisions: требуются fresh context и два co-review focus;
семантические findings направляются в `/feature-doctor` даже при однозначном
основании дефекта. Reviewer не вправе исправлять проверяемые артефакты.
Co-review best-effort: после неудачных попыток допускается продолжение без
сабагентов (`semantic-packs/finding-adjudication.md:21`). Требование касается
организации попыток, а не безусловной доступности дополнительных агентов.

Следствие: очевидное исправление может потребовать нескольких отдельных
команд и контекстов. Независимая проверка смешана с обязательной организацией
работы.

### 5. Завершение ручной задачи требует отдельного владения lifecycle

`skills/_shared/references/workflows/tier-policy.md`, Closure Authority:
нужен explicit standalone owner; без него даже `/verify PASS` оставляет
задачу открытой. `/exe` не закрывает T2/T3.
Владельцем может быть сам текущий top-level агент, записавший владение одной
TASK: отдельный участник или новое разрешение пользователя не обязательны.

Следствие: просьба реализовать задачу и фактическое завершение работы сами
по себе не образуют достаточного основания закрыть её в памяти проекта.

### 6. Диагностика тоже закрепляет обязательность документов

`skills/mb-garden/assets/mb-doctor/terminal-compat.mjs`,
checkCompactDoneProtocol: отсутствие `run.md` у завершённой T1 даёт error даже
без `--strict`. Для T2/T3 отсутствие полного протокола даёт warning в обычном
режиме и error в strict; suggested_fix требует пять файлов.

Следствие: изменение только текстовых инструкций оставит диагностику,
которая считает допустимый упрощённый путь нарушением. Нужны согласованные
инструкции и интерпретация диагностики для manual flow.

### 7. Свобода тактики ограничена неизменяемым процессом

`AGENTS.md`, «Автономность исполнения и стабильность workflow-контрактов»,
требует одинаковых gates и handoffs в ручном и unattended flow.
`skills/_shared/references/workflows/execute-loop.md` закрепляет обязательные
spec-design, review и fresh-feature-tasking boundaries; deployed
`skills/_shared/references/deployable/AGENTS.md` повторяет допуск через revision
и APPROVE под заголовком Clean context (recommended).

Следствие: новая принятая свобода manual flow требует явного изменения этой
политики и её runtime-источников, а не добавления ещё одного исключения.

### 8. Unattended останавливается и на технических развилках

`skills/_shared/references/workflows/autonomy-policy.md`, Operator decisions
and local tactics: даже обратимый conservative default не разрешает принять
новое material architecture, task-boundary, tier, dependency или verification
решение. `/autonomous` дополнительно запрещает работу без isolated child
contexts и требует фиксированной последовательности gates.

Следствие: снять обязательность ревью недостаточно для автономной работы;
нужно определить, какие технические решения агент вправе принимать сам.

### 9. Формальная валидность и готовность к исполнению проверяются отдельно

`skills/_shared/scripts/init-mb.js`, TASK_SCHEMA.required: обязательны
18 полей, включая `wave`, `tier`, `gates`, `docs`, `evidence_required`,
`normative_inputs`, `constraints`, `invariants`, `verification_targets`.
При этом `purpose` и `success_outcome` в список обязательных полей не входят;
их заполнение обеспечивается отдельными workflow-требованиями для T2/T3.

Это не доказанная ошибка: `structure-template.md:633` сохраняет совместимость
со старыми карточками, а `mb-doctor/task-readiness.mjs:346` проверяет непустые
purpose/outcome для T2/T3. Required означает наличие ключа, а не обязательность
непустого содержимого. Пересмотру подлежит необходимость пустой формы, а не
автоматически смысл поля.

## Обзор всех skills и механизмов карточки

Аудит выполнен тремя сабагентами read-only. Полностью просмотрены 37 canonical
runtime-команд и три package entrypoints; исследуемые команды не исполнялись.
Изучены связанные workflows, роли, protocol templates, semantic packs,
генерация схемы, функции lint/doctor, установка/sync и релевантные fixtures.
Исполняемые тесты не запускались: продукт пока не менялся, ниже статический
анализ. Полнота обзора skills не означает проверку всех runtime-сценариев.

### Охват runtime-команд

Все пути этой таблицы находятся в `skills/_shared/references/commands/`.

| Команды | Назначение |
|---|---|
| `grill-me`, `constitution`, `write-prd` | Замысел и brief; принципы/автономность; уточнённый PRD. |
| `spec-init`, `prd-to-features`, `review-feat-plan` | Подготовка декомпозиции; REQ/RTM/EP/FT/AC; проверка покрытия продукта. |
| `spec-design`, `spec-redesign`, `spec-auto` | Первоначальная архитектура/Foundation; изменение принятого дизайна; unattended design. |
| `feature-to-tasks`, `foundation-to-tasks` | Производители product/Foundation карточек, планов и связей. |
| `feature-doctor`, `discuss` | Разбор семантических findings, решения оператора и маршрутизация исправлений. |
| `autonomous`, `autopilot` | Полный unattended flow; выполнение, восстановление и завершение продуктовой очереди. |
| `exe`, `verify`, `red-verify` | Реализация; функциональное доказательство; поиск содержательных дефектов за формальным PASS. |
| `review-tasks-plan`, `architecture-review` | Проверка task planning; ограниченная архитектурная проверка. |
| `add-tests`, `debug` | Проверки внутри существующей задачи; read-only диагностика неудачной попытки. |
| `multiagentic`, `multipilot` | Обёртки autonomous/autopilot с Judge, без отдельного lifecycle. |
| `context-manifest`, `fill` | Маршрутизация чтения и загрузка контекста. |
| `creator-vibe`, `kiss-architect` | Интерпретация замысла и применение Architect policy. |
| `find-skills`, `start`, `mb-init` | Поиск доступных skills, выбор следующего владельца, внешний bootstrap/sync. |
| `map-codebase` | Evidence-backed as-is baseline существующего проекта. |
| `mb-doctor`, `mb-garden`, `mb-sync` | Readiness; механическое обслуживание памяти; согласование уже записанных решений. |
| `tech-debt`, `technical-premortem` | Advisory debt report и pre-mortem конкретного изменения. |

Package entrypoints: `skills/start/SKILL.md`, `skills/mb-init/SKILL.md`,
`skills/mb-garden/SKILL.md`. Они отвечают за package/install surface; runtime
команды генерируются отдельно из canonical command sources.

### Карта всех 22 полей

Производители планового содержимого — `feature-to-tasks.md:265–347` и
`foundation-to-tasks.md:193–216`. Схему задаёт `init-mb.js:77`, а не агент,
исполняющий задачу. Runtime преимущественно меняет `status` и `verify`.

В таблице пути команд сокращены до имени; модули doctor находятся в
`skills/mb-garden/assets/mb-doctor/`. Ни одно поле пока не решено удалить.

| Поле | Назначение и потребители | Что означает для упрощения |
|---|---|---|
| `id` | Index → файл → карточка, dependencies, protocol/evidence paths, checkpoint; lint:759,776,1057. | Стабильная идентичность необходима. Изменение формата требует согласовать все parsers и ссылки. |
| `title` | Читаемое название; префикс `Production acceptance:` также управляет development scheduling (`autopilot.md:56`, task-readiness:609). | Не только текст. Нельзя свободно менять префикс без изменения механизма. |
| `status` | Promotion, recovery, closure, blocked propagation, terminal/deadlock (`autopilot.md:199,263`). | Необходима память о фактическом ходе работы. |
| `feature` | Feature context/AC, completion, разделение FT-000 и product queue (`autopilot.md:14,282`). | Удаление затрагивает и контекст, и владельца исполнения. |
| `wave` | Earliest-wave selection, sync/review/tech-debt boundaries, Foundation W0 (`autopilot.md:271,291`). | Не просто дубликат зависимости; сначала решить судьбу wave-механизма. |
| `tier` | Protocol, RED/GREEN, verification, closure и parallel policy (`tier-policy.md:141`, task-readiness:182). | Отвязать tier от ID и сделать tier рекомендательным — разные изменения. |
| `reqs` | Governing requirements, RTM и согласованность AC → task (`acceptance-trace.mjs:234`). | Нужна трассировка; REQ-ссылка сама по себе не присваивает все proofs задаче. |
| `depends_on` | Prerequisite outcomes, cycles, ready selection, blocking/deadlock, Foundation gate (lint:1215; task-readiness:204,522,547). | Реальная зависимость исполнения; пустой список допустим. |
| `touched_files` | Advisory ожидаемая поверхность изменения, executor preflight и handoff (task-readiness:358). | Не hard boundary; не доказывает независимость задач. |
| `gates` | Именованные исполнимые проверки с command/required (`exe.md:287`, `verify.md:211`, lint:830). | Сохраняет воспроизводимость конкретной проверки; не равно всей приёмке. |
| `verify` | Наблюдённые результаты, verdict/evidence/closure links; пишут verifier и lifecycle owner (`verify.md:259,272`, terminal-compat:248,332). | Нельзя смешивать с планируемым доказательством. |
| `docs` | Обязательный string array в schema/lint; специального producer/consumer-смысла не найдено (init-mb:140; lint:92,1182,1196). | Единственный выявленный кандидат без отдельного назначения; решение об optional/removal ещё не принято. |
| `source_artifacts` | Контекст, optional behavior examples и точные AC locators, назначающие proof ownership (`feature-to-tasks.md:322`, acceptance-trace:234). | Удаление теряет не только ссылки, но и распределение критериев приёмки. |
| `normative_inputs` | Прямые governing specs/architecture/ADR для свежего исполнителя и проверяющего (`exe.md:41`, `context-manifest.md:87`). | Отличает обязательное основание от вспомогательных примеров. |
| `constraints` | Ограничения решения, текст и ссылки на применимые правила (`exe.md:342`, `verify.md:118`). | Код извлекает ссылки, агент исполняет смысл. Отсутствие специального parser не делает поле бесполезным. |
| `invariants` | Свойства, которые должны сохраняться; execution/verification/debug. | Общий scanner с constraints не доказывает одинаковое назначение. |
| `verification_targets` | Что и каким методом проверять; claim/probe mapping, альтернатива gate command (tier-policy:92,109; task-readiness:373). | Метод проверки намеренно отделён от ожидаемого доказательства. |
| `evidence_required` | Планируемый claim-linked результат: RED/GREEN или alternative proof, сравнение и artifact (tier-policy:97,109; acceptance-trace:284). | Обязательный TDD можно пересмотреть, сохранив критерии и требуемые наблюдения. |
| `purpose` | Зачем задача существует; перенос мотивации в свежий контекст (task-readiness:346). | Schema-optional, содержательно требуется для T2/T3. |
| `success_outcome` | Наблюдаемый результат; slicing и verification (task-readiness:351). | Не заменяется списком прошедших команд. Schema-optional, T2/T3 обязателен. |
| `anti_goals` | Исключённые результаты и защита от расширения scope (`verify.md:118,213`). | Optional; полезные ограничения должны остаться доступны. |
| `runtime_context` | Контейнер deliberate boundaries (lint:793; task-readiness:357; tier-policy:35). | Optional, не второй обязательный task context. |

Подполя `runtime_context`: `write_boundary` — намеренная path allow-list и
основа experimental parallel isolation; `allowed_write_scope` — deprecated
read alias; `forbidden_scope` — запрещённые области; `stop_conditions` —
условия остановки. Пустой/отсутствующий boundary уже сейчас не ограничивает
исполнителя списком файлов.

### Связь с установкой и проверками

- `scripts/install-framework.mjs:670,711,797` генерирует обе поверхности
  runtime skills из canonical commands; `vendor-shared.mjs:42` подготавливает
  package assets во временной копии.
- `init-mb.js:1085` обновляет framework-owned schema, но существующие карточки
  и project-owned index сохраняются (`:227,1090`). Sync не является миграцией
  task format.
- Формат карточки независимо описан в schema и hardcoded lint checks
  (`mb-lint.mjs:1057,1148`); doctor добавляет readiness/semantic-presence checks.
  Изменить один required-список недостаточно.
- ID parser присутствует в lint, task-readiness и foundation-backbone;
  fixtures также извлекают tier/feature/wave из ID (`test-mb-doctor.mjs:62`).
  Новый `TASK-001` сам по себе не совместим с существующей цепочкой.
- Найденная проверка preservation при install/sync использует пустой task
  index (`test-install-sync.mjs:427`). Она не доказывает сохранение поведения
  исторических непустых карточек после изменения формата.

## Подтверждённые расхождения и неоднозначности

### 10. Advisory pre-mortem содержит обязательную остановку

`commands/technical-premortem.md:18` объявляет skill advisory и не workflow
gate, но `:165` при `NO_GO` предписывает «implementation не продолжать».
Рекомендация фактически превращается в запрет. Это непосредственно относится
к желаемому различию между советом и обязательным допуском.

### 11. Guide-only проверка строже описанной применимости

`commands/mb-doctor.md:146` разрешает guide как нормативный источник и требует
другие виды specs, когда соответствующие concerns входят в scope.
`mb-doctor/task-readiness.mjs:296` выдаёт TASK_SDD_SPEC_GUIDE_ONLY для любого
T2/T3, чьи найденные spec links ведут только в guides, без проверки scope.
В strict это error. Следовательно, выбор достаточного guide по инструкции
сам по себе не позволяет пройти механический gate.

### 12. Compact template строже родительской closure policy

`workflows/tier-policy.md:150` допускает PASS либо clear compact evidence;
`protocols/compact-run-template.md:71` требует exact compact PASS.
Приоритет command/tier policy указан в `commands/exe.md:219`, поэтому
конфликт разрешим, но шаблон снова навязывает дополнительную форму.

### 13. Неоднозначная граница дополнения feature AC

`commands/feature-to-tasks.md:110` отправляет missing REQ/AC decomposition в
`/prd-to-features`, но `:265` требует самостоятельно добавить минимальный
atomic AC для ещё не покрытого material feature outcome. Accepted authority
ограничивает это действие, однако граница между уточнением принятого AC и
недостающей декомпозицией явно не определена. Возможны два маршрута одной
работы: локальное дополнение либо отдельный handoff.

## Вывод для следующего обсуждения

Прежнее сокращение карточки до пяти полей не обосновано исследованными
механизмами и не принято к реализации. Не найдено основания объявить
большинство полей лишними.

Рациональный предмет упрощения — обязательная форма работы вокруг полезных
данных: command handoffs, отдельные review/repair passes, prescribed TDD,
fresh contexts и повторение task context в полном протоколе. Например,
`context-template.md:15`, `plan-template.md:11`, `verification-template.md:13`
повторяют часть целей, источников и ограничений карточки. Часть этого текста
фиксирует уже прочитанное/сделанное, поэтому само пересечение ещё не доказывает
ненужность всех протоколов.

Дополнительные точки обсуждения: `discuss.md:18–31` требует owning artifact
до содержательного вопроса; `constitution.md:68–76` задаёт фиксированную форму
вопроса; `feature-to-tasks.md:151–160` требует feature protocol plan,
decision-log и IMPL plan. Это намеренные процессные ограничения, а не новые
дефекты и не основание удалять поля карточки.

Решения об изменении этих механизмов обсуждаются с оператором. Затем для
каждого затронутого поля выбирается сохранение, условная обязательность,
объединение или удаление с проверкой его производителей и потребителей.

## Граница самостоятельности — принято пользователем

- По умолчанию агент консультируется с оператором по содержательным
  продуктовым, техническим и процессным решениям. Обратимость решения сама
  по себе не разрешает принять его самостоятельно.
- Автопилот или явное поручение действовать автономно/самостоятельно разрешает
  агенту принимать решения внутри предоставленного scope и ограничений.
  Молчание оператора не является таким поручением.
- Согласованные решения исполняются без повторного согласования. Консультация
  происходит в обычном диалоге, без обязательного отдельного workflow,
  approval-артефакта или оформления исключения.
- Если необходимое решение выходит за предоставленные полномочия, агент
  обращается к оператору; в unattended сохраняет вопрос и приостанавливает
  зависимую работу.
