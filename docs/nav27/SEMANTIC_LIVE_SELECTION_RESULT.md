# Live selection — semantic correction

**Verdict: READY_FOR_ARCHITECTURE**, в границах исправления семантики.
DSH runtime/controller/UI не реализованы и не тестировались.

## Исправленная граница

Enablement, model и effort применяются при следующем запуске соответствующей
операции/участника внутри текущего workflow. Пока работа не начата и skip не
записан, её `selected` — изменяемый план текущей attempt, не evidence.
Запуск или запись skip фиксируют выбор только этой работы и её reports.
Запуск одного verify participant не замораживает ещё не запущенных peers.
Embedded local checks используют snapshot активного exe; будущие verify и
red-verify остаются изменяемыми во время exe. Toggle не требует новой attempt,
перезапуска workflow, повторного exe или отдельного approval.

Начатая/завершённая/пропущенная/прерванная работа, actual findings и закрытые
attempts не переписываются. Started participants сохраняются в `selected.verify`.
Реальный FAIL требует существующего scoped disposition; off не превращает его
в skip. Все verify off до запуска дают skipped без functional PASS/reports;
implemented task может закрыться. Red независим; main-off не создаёт hidden main.

## Изменения

- `autonomy-policy.md`: общая граница live settings и независимых launches.
- `tier-policy.md`: pending plan против retained choices в existing
  `task.verify`, `stage: workflow`; удалён freeze всей attempt перед exe.
- `commands/mb-doctor.md`, `structure-template.md`: согласованы чтение evidence
  и initial planned selection; schema/validator/lifecycle не менялись.
- `howItWorks.md`, `PROJECT_MAP.md`, semantic inventory/transitions/acceptance:
  устранено описание фиксации всего pipeline на одну attempt.
- `test-mb-doctor.mjs`: один task record проходит active exe → pending verify/red
  off → done в прежней attempt с сохранёнными local checks; отдельный pending
  peer off сохраняет main FAIL и блокирует closure без disposition.
- `test-install-sync.mjs`: существующий prose assertion согласован с новой
  формулировкой запрета переоценки evidence; delivery parity остаётся проверкой.

## Проверки

- `npm run check:syntax --silent` — pass.
- `npm run test:mb-doctor --silent` — pass, включая historical selected repair,
  optional matrix/design, candidate-only review и negative→off rejection.
- `npm run test:install-sync --silent` — pass.
- Isolated install-only/bootstrap/sync: `/tmp/nav27-live.syZfDL/`.
- Установленный strict doctor на изолированной fixture `records/`: active exe,
  pending-off и same-attempt done — pass, 0 errors/warnings. Task JSON не изменён
  диагностикой, новых attempts, task reports или functional PASS нет.
- Workflow source/deployed parity и обе generated mb-doctor skill routes — pass;
  required policy links доступны, source-only references не добавлены.
- Fresh empty bootstrap: ожидаемый strict `TASK_INDEX_EMPTY`, не ошибка доставки.
- `git diff --check` — pass; generated source `shared-*` — **0**.

## Передача архитектору

Снимок принадлежит запускаемой работе, не task pipeline целиком. Pending
selection можно обновлять в текущей attempt; исторический результат проверяется
по выбору своей работы. Existing record достаточен для диагностики: новый
registry, stage schema, lifecycle или toggle-disposition не нужны. Enforcement
launch boundary остаётся работой будущего host. Архитектурные документы и
исторические result files этим исправлением не редактировались.
