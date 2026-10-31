# Greenfield workflow — DevRails Nav 27

Схема показывает предметные owners и условные операции, а не алгоритм модели
или уже работающий DSH-контроллер. Ясный принятый input позволяет входить сразу
в нужную операцию; disabled design/review не требует placeholder или APPROVE.

```mermaid
flowchart TD
  input["Идея / принятый PRD"] --> product["Нужные grill-me / constitution / write-prd"]
  product --> decomposition["spec-init при необходимости → prd-to-features"]
  decomposition --> planning["Выбранные review-feat-plan / spec-design"]
  planning --> baseline{"Нужен executable baseline?"}
  baseline -- "да" --> foundation["foundation-to-tasks → FT-000 implementation<br/>и выбранные проверки"]
  baseline -- "нет" --> feature["feature-to-tasks FT-NNN"]
  foundation --> feature
  feature --> review["Выбранные review-tasks-plan / doctor"]
  review --> exe["Host подаёт одну runnable task → exe"]
  exe --> checks["Выбранные verify / red-verify<br/>Отключённые операции: skipped"]
  checks --> decision{"Нужно решение?"}
  decision -- "нет" --> closure["Host фиксирует результат<br/>done не означает verified"]
  decision -- "да" --> wait["Общий feedback → вопрос / красный<br/>либо autonomous decision"]
  wait -- "repair при неизменном смысле" --> exe
  wait -- "изменился смысл" --> owner["PRD / design / tasking owner"]
  owner --> feature
  closure --> boundary["Нужный mb-sync и выбранные boundary checks"]
  boundary --> next{"Есть незавершённая работа?"}
  next -- "задача" --> exe
  next -- "фича" --> feature
  next -- "нет" --> done["Завершение с фактическим coverage"]
```

Обычный режим ждёт согласия в основном чате или зелёного для конкретного
предложения. Отказ отменяет его; неполный ответ оставляет зависимую работу
в ожидании. То же правило действует для консультации без смены маршрута.
`/autonomous` принимает семантические решения на всём пути, но сохраняет
ручной красный/Pause/Stop, permissions и отсутствующие внешние факты.

`/autopilot` получает только подготовленную продуктовую очередь и не выполняет
FT-000. `/autonomous` охватывает также Product/Design и нужную Foundation.
У выбранной Foundation может не быть отдельной proof gate task, но реальные
baseline dependencies остаются. Judge в `/multiagentic` и `/multipilot`
условен и не принимает lifecycle решения.

Local checks `/exe`, functional verify и red-verify настраиваются отдельно.
All-off verify допускает закрытие реализации без PASS/отчёта; code-only review
сохраняет candidates; red-alone не доказывает functional acceptance.
Полученный отрицательный результат остаётся evidence и требует disposition.

После обрыва продолжение опирается на фактическую работу, partial effects и
снимок выбранных операций попытки. Выполненное не повторяется, skipped не
включается автоматически. Последовательное выполнение — baseline; concurrency
требует opt-in, изоляции и непересекающихся hard write boundaries.
Полный каталог repairs, blockers и resume: [TRANSITIONS.md](docs/nav27/TRANSITIONS.md).
