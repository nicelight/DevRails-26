# Отделить structural lint от closure policy

Created: 2026-07-18
Status: implementation-ready

## Подтверждённая проблема

`mb-lint` заявлен как structural/mechanical linter, но сейчас также применяет
run-specific правила:

- `checkDoneEvidence()` требует evidence для завершённых T0/T1;
- `checkTierProtocolRequirements()` требует full protocol для T2/T3 в
  зависимости от task status и PASS/FAIL evidence для terminal state;
- эти ошибки всегда hard-fail, независимо от manual/scheduler mode.

Те же обязанности уже находятся в `mb-doctor`:

- `checkFullProtocolTask()` проверяет full protocol и terminal evidence;
- `checkCompactDoneProtocol()` проверяет compact T0/T1 closure;
- T3 дополнительно проверяется на semantic-pass и human checkpoint;
- default/strict mode позволяет применять readiness policy с нужной severity.

Из-за дублирования hard-fail в `mb-lint` через `MB_LINT_FAILED` безусловно
делает итог doctor ошибочным, даже когда соответствующий doctor finding должен
быть warning в default mode. Doctor продолжает собственные проверки, но
предусмотренное различие default/strict severity теряет силу. Кроме того, два
набора regex/checks могут разойтись.

## Цель

Оставить в `mb-lint` только долговечные структурные инварианты Memory Bank.
Tier/status-dependent protocol и evidence readiness сделать ответственностью
`mb-doctor`. Решение о lifecycle transition остаётся у scheduler либо явного
владельца manual workflow.

## Граница ответственности

### `mb-lint`

Проверяет:

- JSON/schema, обязательные поля, типы и enum values;
- canonical IDs, имена файлов и соответствие task index;
- ссылки, пути, dependency references и циклы;
- структурную корректность присутствующих документов и task records.

Не определяет, достаточно ли evidence для `done|failed`, и не требует protocol
artifact только потому, что task имеет конкретные tier/status.

### `mb-doctor`

Проверяет детерминированную readiness/consistency policy:

- tier-appropriate protocol completeness;
- compact/full evidence для terminal task state;
- PASS/FAIL basis;
- дополнительные T3 closure prerequisites;
- severity согласно действующему default/strict contract.

Doctor сообщает несогласованность или неготовность, но не принимает lifecycle
решение.

### Scheduler или manual owner

Применяет authoritative tier policy и владеет переходом в
`done|failed|blocked`. `/verify` и `/red-verify` формируют verdict/evidence, но
не подменяются lint или doctor.

## Изменения

1. В `skills/mb-garden/assets/mb-lint.mjs` удалить вызовы и реализацию
   `checkDoneEvidence()` и `checkTierProtocolRequirements()`.
2. Удалить ставшие неиспользуемыми evidence/protocol helpers и regex, но не
   затрагивать helpers, нужные структурным проверкам.
3. Сохранить schema validation полей `status`, `tier`, `verify` и остальных
   task contracts: удаляется policy enforcement, а не форма данных.
4. В `skills/mb-garden/assets/mb-doctor.mjs` не создавать новый policy layer.
   Проверить, что существующие checks полностью покрывают вынесенные случаи;
   менять doctor только при найденном coverage gap или несоответствии его
   документированному default/strict contract.
5. Не дублировать уже закреплённую canonical границу ответственности. Уточнить
   только оставшиеся неточные формулировки: lint проверяет структуру, doctor —
   readiness, scheduler/manual owner — transition decision.
6. После удаления closure-проверок из `mb-lint` проверить в изолированном
   временном target, что structural errors по-прежнему ломают lint, а
   tier/status-dependent protocol и evidence gaps выявляются `mb-doctor` с
   предусмотренной default/strict severity.

## Expected implementation surface

Primary:

- `skills/mb-garden/assets/mb-lint.mjs`
- `skills/_shared/references/workflows/tier-policy.md` — убрать неточную
  формулировку, по которой evidence принимается общей lint/doctor policy.

Conditional:

- `skills/mb-garden/assets/mb-doctor.mjs` — только для coverage/severity gap;
- `skills/_shared/references/commands/mb-doctor.md` — только если проверка
  выявит неточность уже документированного default/strict contract;
- `skills/_shared/references/commands/mb-garden.md` — только если требуется
  уточнить публичную границу;
- `PROJECT_MAP.md` или overview docs — только если их текущее описание станет
  неточным.

Generated `.memory-bank/`, `.protocols/`, `.agents/`, `.claude/` и vendored
`shared-*` не редактировать.

## Regression cases

Это сценарии ручной приёмки в изолированном временном target. Они не требуют
постоянных fixture-файлов, отдельного regression harness или нового test script
в `package.json`.

1. Невалидный task field type или broken ID/link по-прежнему ломает `mb-lint`.
2. Валидная T0/T1 `done` task без closure evidence проходит `mb-lint`, но
   получает соответствующий `mb-doctor` finding с действующей tier/mode
   severity: missing compact run для T0 — warning в default mode, для T1 —
   error; в strict mode оба случая являются error.
3. Валидная T2/T3 `in_progress` task без full protocol проходит `mb-lint`, но
   получает warning в default doctor и error в strict doctor.
4. Валидная T2/T3 `done|failed` task без full protocol или PASS/FAIL evidence
   проходит `mb-lint`, но блокируется `mb-doctor --strict`.
5. Валидная T2/T3 task с compact-only protocol проходит `mb-lint`, но получает
   предусмотренный doctor finding.
6. Полностью согласованная terminal task проходит lint и применимый doctor
   mode.
7. Scheduler closure rules и verify/red-verify verdict ownership не меняются.

## Non-goals

- не ослаблять task schema, ID/link/dependency validation;
- не переносить semantic verification в doctor;
- не давать doctor право менять task status;
- не добавлять новый validator, policy registry или evidence format;
- не делать strict doctor обязательным для каждого manual T0/T1 run;
- не превращать agent-run standalone lint в scheduler closure gate;
- не добавлять, не обновлять и не валидировать CI integration в рамках этого
  локального рефакторинга.

## Acceptance criteria

- `mb-lint` не выдаёт ошибок только из-за отсутствия tier/status-dependent
  protocol или closure evidence;
- все удалённые closure/readiness случаи имеют deterministic doctor coverage;
- default/strict doctor behavior соответствует canonical contract;
- structural regressions продолжают блокироваться lint;
- lifecycle transition ownership остаётся у scheduler или explicit manual
  owner;
- source-only packaging и generated install остаются совместимыми.
