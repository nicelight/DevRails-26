# Пакет 1 — общий семантический контракт и входные операции

Результат подготовлен в `devrails-nav-27`, рабочее дерево
`/home/serg/Projects/DevRails Nav 27`. Основное дерево DevRails 26 не изменялось.
Коммитов, push, DSH API, scheduler, UI и новой runtime-схемы нет.

## Scope

Изменены 29 canonical/package файлов:

- Все шесть `skills/_shared/references/workflows/*.md`.
- Все семь `skills/_shared/references/roles/*.md`.
- `skills/_shared/references/deployable/AGENTS.md` и `constitution-template.md`.
- Команды `start`, `mb-init`, `fill`, `context-manifest`, `find-skills`,
  `creator-vibe`, `grill-me`, `constitution`, `write-prd`, `discuss`, `map-codebase`.
- `skills/start/SKILL.md`, `skills/mb-init/SKILL.md`, `skills/mb-garden/SKILL.md`.

Дополнительно обновлены необходимые assertions в `scripts/test-install-sync.mjs`
и создан этот результат: всего 31 файл пакета. Существующий чужой файл
`PAPERCUTS/gpt-6-astra __ 11-01-2026 02.08.md` не изменён.

## Общие решения

`workflows/autonomy-policy.md` стал единственным кратким общим владельцем
семантики DSH execution, decision flow, conditional checks и recovery. Этот
reference уже доставляется bootstrap/sync; нового обязательного ресурса нет.
Leaf-команды и роли ссылаются на него. До bootstrap `/start` и `/mb-init`
честно возвращают отсутствующий input или проверенный installer route.

Механическая очередь, launches, lifecycle/status writes, budgets и recovery
sequencing принадлежат host. Модели возвращают предметный результат, evidence,
решение или предложение маршрута. Удалены scheduler-алгоритмы, фиксированные
модели/reasoning, обязательные persona prefixes, неизменяемые роли, один
незаменяемый Judge и безусловный fanout.

Один общий компактный структурированный feedback обязателен как семантический
интерфейс и отделён от subject verdict. Точные поля и transport отложены до
архитектуры; полный report и feedback после каждого tool call не требуются. Все нестандартные branches,
repairs и main-path consultations проходят общую процедуру решения. В обычном
режиме требуется ответ пользователя/зелёный для конкретного предложения;
неполный ответ, тишина, рекомендация и Side Chat не являются согласием.
Autonomous — политика принятия решений всего Nav-run: она сохраняется при
handoff `/autonomous` → `/autopilot` независимо от границ командных фаз.
Модель принимает семантическое решение с честной provenance, сохраняя
ручной красный/Pause/Stop, permissions и реальные ограничения операций.
Повторного согласия с уже принятым применимым решением не требуется.

Reviews, Judge, Architect, checks и reports условны по effective settings.
All-off verify означает skipped без отчёта; implemented task может закрываться
без PASS, но не объявляется verified. Полученный FAIL/REJECT не стирается и не
становится skipped после изменения настроек. Его disposition использует общий
decision flow. Явные project non-negotiables отделены от framework defaults;
конфликт настроек с принятой проектной нормой не разрешается молча.

Recovery сохраняет task identity, реальные частичные эффекты, выполненные и
пропущенные операции, незавершённую работу и ближайший owner. Потеря сессии не
требует replay implementation/check/report. Stale checkpoint не сильнее actual
state. Сохранились различия blocked/failed/dependency exhaustion и production
remainder; небезопасный повтор не разрешается новым контекстом.

## Сохранённая предметная семантика

- Tier/ID согласованность, indexed JSON registry и буквальная segment-prefix
  семантика hard write boundary сохранены. `touched_files` остаётся advisory.
- Same-task correction не меняет identity/outcome/scope/tier/dependencies;
  изменение смысла возвращается planning owner.
- Продуктовые targets принадлежат PRD, canonical shared design — design owner,
  baseline — observed current state. Mapping не переписывает accepted target.
- Planning Revision и none/bounded/global различаются по доказанному влиянию;
  affected repair сохраняет завершённую работу и unaffected evidence/reviews.
  APPROVE/re-review требуются только когда соответствующая review включена.
- SDD canonical ownership, registry/subject boundaries, accepted dependency
  graph и Architecture Spine сохранены. Матрица/стратегия артефактов не создаются
  просто ради формы.
- Sync согласует уже записанное состояние, не решает closure или canonical
  semantic conflicts; skipped evidence не становится missing-report gap.
- Constitution сохраняет `framework-default|ratified|partial|skipped`, даты
  и provenance. PRD сохраняет clarification/constitution-check meaning,
  наблюдаемые acceptance/NFR и отдельные handoffs нового/обновлённого PRD.
- Brief остаётся durable; удалены фиксированный questionnaire/frontier,
  форма вопросов и обязательный transcript/history.
- `/creator-vibe` изменён только в одной предметно конфликтующей строке:
  призыв к test/review больше не создаёт дополнительный обязательный gate.

## Проверка handoffs по TRANSITIONS

| Surface | Сверенные маршруты | Результат |
| --- | --- | --- |
| start + package start | M01, M03, M04 | Verified bootstrap → start; unfinished owner; mapping branch требует общего решения |
| mb-init + package mb-init | M02, R33 | Bootstrap-only/full sync различены; availability проверяется в DSH; collisions не обходятся |
| grill-me | M05 | Ready brief → constitution либо write-prd; unresolved discovery остаётся у owner |
| constitution | M06, R01 | Governing choice/skip/provenance → write-prd; конфликт остаётся у Constitution |
| write-prd | M07, M08, R01–R02 | Новый → spec-init; update → prd-to-features; продуктовые/amendment вопросы не уходят в execution |
| fill/context-manifest | R37 | Read-only источники/gaps → вызывающий owner; нет нового artifact/gate |
| find-skills | R33–R34 | Proven origin → конкретный install/sync proposal; unknown origin не угадывается |
| discuss | R38 | Консультация на главном пути → тот же owner; отсутствие artifact не мешает задать вопрос |
| map-codebase | M04, R37 | As-is baseline → invoking PRD/delta owner; уже переданный input не спрашивается снова |
| shared workflows/roles | M10–M22, R03–R32, J01–J05, recovery table | Conditional review/closure, repair owner, evidence-preserving recovery, host lifecycle |
| creator-vibe / mb-garden package | Existing caller / R30–R33 | Lens не добавляет gate; package не создаёт второй maintenance workflow |

Сохранены heading anchors, на которые ещё ссылаются команды следующих пакетов:
`durable-run-checkpoint`, `scheduler-failure-handling`,
`principle-no-task-explosion`, `judge-session-and-consultation`, tier/claim/closure
и feature-tasking anchors. Старые имена anchors не сохраняют старую механику.

## Проверки

Успешно:

1. `npm run check:syntax --silent`.
2. `node scripts/test-install-sync.mjs` — `install sync smoke passed`.
   Включает isolated install-only/bootstrap, полную command/source parity,
   canonical workflow copies, collisions без partial write, sync/idempotence,
   сохранение user-owned state, bootstrap-only isolation, deployed lint/doctor
   на свежем skeleton. Добавлена точная parity семи ролей с учётом единственного
   generated marker; существующие collision/sync/parity проверки не ослаблены.
3. Отдельные install-only/bootstrap targets:
   `/tmp/nav27-base.XWtd6n/install-only` и `/tmp/nav27-base.XWtd6n/bootstrap`.
   Обе установки завершились успешно; логи лежат рядом.
4. Дополнительная установка с retained prepared repo:
   `/tmp/nav27-base.XWtd6n/prepared-check`; prepared copy
   `/tmp/devrails26-skills-drtDy6/repo`. Все три package ссылки
   `references/shared-commands-*.md` существуют в prepared package. Source-only
   ссылка mb-garden на соседний `_shared` заменена реально vendored ресурсом.
5. Scoped source/deployed audit: все 11 изменённых команд совпадают с source
   на обеих поверхностях; required shared references присутствуют в bootstrap;
   все command→workflow anchors, включая пока не мигрированные команды,
   разрешаются. Никакой required source-only ссылки в изменённых runtime
   командах не добавлено. Общие роли/workflows также проверены полным parity test.
6. Scoped grep не нашёл прежних unattended-no-choice, fixed models/xhigh,
   exactly-one/two questions, immutable role/persona prefix или mandatory
   review/doctor требований в изменённом scope.
7. `git diff --check` проходит; source-tree generated `shared-*` count = `0`.

Exact-string assertions обновлены только для изменённых discovery/flow,
Judge/common-policy и bounded-owner формулировок. Assertions оставшихся
execution/planning commands пока отражают их старый source и будут изменяться
в соответствующих пакетах. Успех install-sync сейчас означает корректность
доставки и его проверок, не готовность всей Nav-семантики или DSH runtime.

## Зависимости следующих пакетов

Пакет 1 завершён без блокера; вся миграция ещё не завершена.

- Пакет 2: остальные planning/review commands, shared agents и semantic packs
  всё ещё содержат старые mandatory/fixed-model/decision правила. Они должны
  реально измениться, а не получать поверх них общий override.
- Пакет 3: execution/autonomous/autopilot/multiagentic/multipilot и maintenance
  commands пока описывают прежние lifecycle writes, обязательные gates и
  scheduler. Их расхождение с новым shared contract ожидаемо до миграции.
- `init-mb.js`/structure/testing/MBB/protocol templates и doctor validators
  ещё могут требовать старые full protocols/PASS/semantic-pass. В этом пакете
  generator не изменялся: текущая доставка читает изменённые canonical files
  напрямую. Общая conditional execution readiness остаётся задачей пакета 3.
- Независимый red-verify без functional verify и local execution checks при
  verify off не выбраны этим пакетом. Tier policy сохраняет смысл честного
  RED/GREEN, когда он требуется execution proof policy, но не устанавливает
  новые defaults или взаимную зависимость этих настроек.
- Полный `test:mb-doctor` отдельно не запускался; fresh deployed lint/doctor
  входят в прошедший install-sync. Матрица all-off/negative-result/recovery и
  полные doctor regressions нужны после изменения validators.
- Existing ratified/project-owned Constitution сохраняется installer sync;
  новый template меняет только fresh defaults. Реальные конфликтующие принципы
  требуют решения у Constitution owner, не принудительной перезаписи.
- Packaging по-прежнему генерирует `.agents`/`.claude`; это не реализация
  подключения к DSH и не доказательство runtime availability.

### Интеграционное уточнение

Обязательность общего структурированного feedback и непрерывность autonomous
policy явно закреплены после review. Проверены затронутые policy assertions
на canonical source, syntax test script и `git diff --check`; полная установка
для этого текстового уточнения повторно не запускалась.
