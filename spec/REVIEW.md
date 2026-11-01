# Проверка достаточности реализации

**READY_FOR_IMPLEMENTATION.** Спецификации задают достаточные границы для
первого кода. Это verdict по проекту, не подтверждение работающего runtime.
Проверен DSH source pin `ce7073d51254c26cd63b22a60835b8f948deb447`.

## Исправлено

- [Feedback](feedback.md): click H больше не может переименовать ответ уже
  выполняющегося main step. Scoped `agent/pre-step` связывает принятую delivery
  с assignment, tool execution замораживает capture attribution. Main feedback
  не завершает child activation. Это устраняет смешение inspection, chat consent
  и прежнего semantic ответа без собственного scheduler.
- `concludeTurn` не обещает новый turn: DSH сначала обрабатывает queued steering.
  Capture ограничен assignment; H работает и в следующем step того же turn.
  Стабильный envelope и текущая host validation исключают hot-swap tool schemas;
  scoped native executor устраняет зависимость прямого feedback от PTC defaults.
- [Evidence](evidence.md) сохраняет main/H correlation и resume reference:
  восстановление не теряет незавершённую semantic работу или manual holds.

## Цена и ценность

| Решение | Итог |
| --- | --- |
| External bundle, один reducer, существующие task records и native sessions | Оставлено: это минимальные владельцы доставки, admission, evidence и диалога. |
| Настройки | Упрощено: current value + revision + frozen leg snapshot; отдельный журнал accepted deltas без потребителя удалён. |
| H | Один выполняющийся запрос, повторный click возвращает его; без очереди инспекций, stack main задач и второго consent. |
| Side, карта, три Judge slots, zoom/context indicators | Оставлено как принятый пользовательский опыт; slots не означают три постоянных agents. |
| Точная геометрия и visual polish | Вне первого vertical slice; согласовать геометрию перед оформлением, не перед проверкой host execution. |

Других material функций с доказанно неоправданной ценой не найдено.
Новый registry, replay engine, REST слой и полный chat clone не требуются.

## Короткий handoff

1. Первый vertical slice: устанавливаемый external bundle в чистом DSH без
   core changes; authenticated `/nav27/`, typed snapshot/control, один existing
   task → native child exe → retained result/skip/closure, main с прямым feedback
   и native chat link. Проверить resource delivery без source checkout и
   guards после cold resume. Минимальная UI проекция достаточна.
2. Admission/evidence: selected peer group, Pause/red, Stop/late outcomes,
   stopped-ready settings, FAIL disposition и recovery после evidence-before-
   position crash. Использовать existing doctor на actual records.
3. Semantic interaction: один proposal, green/main-chat consent, autonomous
   provenance и H во время running main/active child. Проверить старый capture
   после click, H после concludeTurn, Judge result без leg completion и Stop.
4. Side fork/DEL и scene projection: committed prefix + current summary,
   независимые sessions/markers, native streams, reconnect, согласование
   геометрии и затем оформление карты/zoom/indicators.

## Проверено и пределы

Локальные ссылки/anchors и DAG зависимостей спецификаций проверены; граф не
задаёт runtime routing. Reply example — TypeScript shape, не готовая schema.
Source подтверждает steer/pre-step, native executor и capture/concludeTurn seams.
Установка нового bundle, реальный provider call, UI delivery, guards и recovery
**runtime-unverified**: их проверяют slices, не новый круг документационного audit.
