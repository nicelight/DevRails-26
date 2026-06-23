# TASK Naming: добавить Tier в ID задач

## Задание

Добавить tier level `T0|T1|T2|T3` в именование task IDs и связанных файлов.

Текущий формат:

```text
TASK-NNN-FT-NNN-W-N
```

Целевой формат:

```text
TASK-NNN-TN-FT-NNN-WN
```

Пример:

```text
TASK-001-T2-FT-001-W1
```

## Scope

Обновить все места, где task ID используется как имя или путь:

- `.memory-bank/tasks/<TASK_ID>.task.json`
- `.memory-bank/tasks/index.json`
- `.memory-bank/packets/<TASK_ID>.packet.json`
- `.protocols/<TASK_ID>/`
- `.tasks/<TASK_ID>/`
- docs/examples/command specs
- `mb-lint`
- `mb-doctor`
- bootstrap task schema/template

## Rules

- `task.tier` остается обязательным полем task record.
- Tier segment в ID должен совпадать с `task.tier`.
- Feature segment в ID должен совпадать с `task.feature`.
- Wave segment в ID должен совпадать с `task.wave`.
- Filename должен совпадать с `task.id`.
- Foundation tasks используют тот же формат:

```text
TASK-NNN-TN-FT-000-WN
```

- Не добавлять новый task registry, lifecycle, protocol family или scheduler mode.
- Не менять смысл tier policy; меняется только naming/consistency layer.

## Acceptance Criteria

- Fresh bootstrap содержит schema/examples с новым ID pattern.
- `mb-lint` ловит:
  - task ID без tier segment;
  - mismatch между ID tier segment и `task.tier`;
  - filename mismatch.
- `mb-doctor` foundation/task readiness checks работают с новым форматом.
- Packet/protocol/task artifact paths используют новый `<TASK_ID>`.
- Source-only invariant сохраняется: generated `shared-*` файлы не появляются.
