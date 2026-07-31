# `/debug` и diagnostic recovery `/autopilot`

**Статус:** реализованный runtime-контракт.

## Цель

Добавить отдельный `/debug <TASK_ID>` для систематической диагностики одного
наблюдаемого сбоя в свежем контексте и подключить его к `/autopilot`, когда
обычная task-local коррекция не подтверждена evidence.

`/debug` устанавливает root cause и первый нарушенный invariant либо честно
возвращает недостаточность evidence. Он не реализует исправление, не верифицирует
задачу и не владеет её lifecycle.

## Место в workflow

### Ручной режим

```text
/exe или /verify фиксирует сложный наблюдаемый сбой
  -> рекомендует отдельный /debug <TASK_ID>
  -> оператор запускает /debug в свежем контексте
  -> отдельный /exe применяет разрешённую task-local коррекцию
  -> действующие verification gates выполняются обычным путём
```

`/exe` и `/verify` не запускают `/debug` внутри себя. Их ownership и verdict
contract не меняются.

### `/autopilot`

`/autopilot` запускает `/debug` в свежем child-контексте, когда durable failure
evidence не подтверждает ни безопасную task-local коррекцию, ни
`failed|blocked` disposition. Trigger зависит от evidence, не tier, числа
файлов или checklist.

Подтверждённая безопасная коррекция может использовать оставшийся retry.
Иначе scheduler применяет существующий disposition немедленно; `/debug` не
расширяет retry budget.

## Что считается тремя неудачными попытками

Текущий `max_retries_per_task: 2` означает:

```text
initial Execution Attempt + retry 1 + retry 2 = 3 attempts
```

Одна Execution Attempt считается неудачной, когда её обязательный gate path
завершился одним из результатов:

- `VERDICT: FAIL`;
- `SEMANTIC_VERDICT: semantic-fail`.

Одна попытка учитывается один раз, даже если её gate path содержит несколько
проверок. Не увеличивают этот счётчик:

- повтор verifier для той же попытки;
- resume после прерывания;
- запуск `/debug`;
- несколько findings в одном verdict;
- `VERDICT: NEEDS-CLARIFICATION`;
- `SEMANTIC_VERDICT: semantic-concern`;
- execution blocker без завершённой попытки коррекции.

`max_consecutive_failures` остаётся отдельным лимитом последовательных
неуспешных задач и не используется для подсчёта попыток одной задачи.

После третьей неудачной попытки retry budget исчерпан. Диагностическая
эскалация не создаёт четвёртую Execution Attempt.

## Контракт `/debug`

### Input

Один конкретный индексированный `TASK-NNN-TN-FT-NNN-WN` с наблюдаемым сбоем,
привязанным к текущей Execution Attempt и фактической change surface.

### Scope и authority

`/debug` может читать task card, direct specs, текущую попытку, verdict/evidence,
фактические изменения и только необходимые для tracing соседние callers и
boundaries.

`/debug` не может:

- изменять source, tests, specs, task record или scheduler state;
- менять status, tier, dependencies или Execution Attempt;
- выдавать functional/semantic verdict;
- принимать product, spec или architecture decision;
- реализовывать рекомендуемую коррекцию;
- расширять scope или permissions.

Он может записать только собственный task-owned отчёт/evidence под
`.tasks/<TASK_ID>/`.

Диагностические probes допустимы только в безопасном локальном, изолированном
или disposable state при известных исходных условиях и безопасных
rerun/cleanup. Команда не даёт production, destructive, privileged или external
permissions. Если безопасное доказательство недоступно, результат остаётся
inconclusive.

### Диагностическая тактика

Агент выбирает минимально достаточный путь. Полезные ориентиры:

- воспроизвести symptom с точными command/input/environment либо зафиксировать
  точный evidence gap;
- прочитать полную ошибку и текущую change surface;
- проследить
  `symptom -> immediate cause -> caller/source -> first violated invariant`;
- проверять по одной evidence-backed гипотезе минимальным различающим
  экспериментом;
- для async/flaky behavior предпочитать condition-based waiting;
- остановить случайные исправления, когда evidence не подтверждает причину.

Четыре обязательные фазы, обязательный failing test, дополнительные scripts и
фиксированный checklist не вводятся.

### Output

Отчёт:

```text
.tasks/<TASK_ID>/<TASK_ID>-S-DEBUG-final-report-docs-01.md
```

Он содержит только:

- symptom и reproduction либо точный evidence gap;
- привязку к текущей Execution Attempt и change surface;
- подтверждённый root cause и первый нарушенный invariant либо inconclusive;
- проведённые эксперименты и только materially useful отклонённые гипотезы;
- минимальную рекомендуемую коррекцию;
- подходящий regression check;
- остаточную неопределённость и следующего owner;
- один точный marker:

```text
DIAGNOSIS: CONFIRMED|INCONCLUSIVE
```

`CONFIRMED` допустим только когда evidence связывает наблюдаемый сбой с root
cause и первым нарушенным invariant. Marker является supporting classification,
а не verdict или task status.

Отчёт `/debug` — supporting evidence. Если `/verify` на него ссылается, обычное
правило evidence adequacy сохраняется; отчёт не заменяет verifier-owned
functional proof.

## Diagnostic hook `/autopilot`

Перед `/debug` задача остаётся `in_progress`, а checkpoint получает
`current stage: diagnose`, failure evidence, exact next action и expected report
path. Отчёт является supporting evidence для scheduler-owned retry или
disposition; отдельная Architect escalation не нужна.

## Scheduler disposition

`/autopilot` принимает lifecycle/routing decision по verifier evidence и
текущему debug report, если он потребовался:

- безопасная task-local коррекция при доступном budget -> обычный retry;
- доказанный task-local failure без безопасного retry -> `failed`;
- доказанный upstream/authority gap -> `blocked` с точным owner/resume route;
- недоказанный mapping до исчерпания budget -> existing quality/clarification
  halt с evidence owner и resume route, не blind retry;
- inconclusive evidence при исчерпанном budget -> обычно `failed`, либо
  `blocked` только при доказанном authority gap.

Наличие свободного retry само по себе не сохраняет task `in_progress`. После
третьей неудачной попытки четвёртая невозможна.

Новый terminal state вроде `HALT_DEBUG_REQUIRED` не вводится.

## Checkpoint и resume

Допустимые scheduler checkpoint stages:

```text
selection|execute|verify|red-verify|diagnose|closure|wave-boundary
```

`diagnose` — orchestration checkpoint, не task lifecycle state.

Перед каждым диагностическим child `/autopilot` записывает:

- current task;
- `current stage: diagnose`;
- last durable evidence;
- exact next action;
- expected report path.

При resume scheduler переиспользует matching current-attempt debug report, а не
chat context. Неоднозначно завершённый mutating probe не повторяется. Если
unsuccessful-attempt count или child completion недоказуемы, сохраняется
`in_progress` и existing halt с evidence gap, owner и resume route.

## KISS-границы

Изменение не добавляет:

- task status, field, schema или registry;
- отдельный debug lifecycle, protocol family или scheduler;
- новый role;
- обязательную Architect reassessment;
- четвёртый retry;
- новый terminal state;
- обязательный `/debug` после каждого failure;
- изменение ownership `/exe`, `/verify`, `/red-verify` или `/mb-sync`.

`/autonomous` не требует отдельного изменения для product phase, потому что
делегирует её `/autopilot`. Foundation phase не получает этот механизм без
отдельного решения.

`spec-to-RED handoff` не входит в эту реализацию.

## Минимальная реализация

Canonical source:

```text
skills/_shared/references/commands/debug.md
skills/_shared/references/commands/autopilot.md
skills/_shared/references/commands/exe.md
skills/_shared/references/commands/verify.md
skills/_shared/references/workflows/tier-policy.md
scripts/test-install-sync.mjs
README.md
howItWorks.md
```

Installer менять не нужно: runtime-команды генерируются из
`skills/_shared/references/commands/*.md`.

## Проверка реализации

- `/debug` одинаково развёрнут в `.agents` и `.claude` из canonical source;
- сохранены debug marker и report path;
- `/debug` не получил implementation, verdict или lifecycle authority;
- probes не расширяют permissions;
- `diagnose` входит только в scheduler checkpoint vocabulary;
- ранний trigger зависит от evidence, а не tier/file count/checklist;
- три попытки и исключения считаются однозначно;
- ранний `FAIL` без безопасного retry получает `failed|blocked` disposition;
- resume переиспользует matching report и не повторяет unsafe probe;
- четвёртая Execution Attempt невозможна;
- `max_retries_per_task` остаётся `2`;
- task statuses, schema и terminal vocabulary не меняются;
- `/exe` и `/verify` могут только рекомендовать `/debug`;
- evidence adequacy `/verify` сохраняется;
- source-only дерево не содержит generated `shared-*`;
- install-only и bootstrap проходят в изолированных temporary targets.

## Источник диагностической тактики

- [`systematic-debugging`](https://github.com/bish-x/bx-dev-skill/tree/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/engineering/systematic-debugging)
- [`root-cause-tracing.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/engineering/systematic-debugging/root-cause-tracing.md)
- [`condition-based-waiting.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/engineering/systematic-debugging/condition-based-waiting.md)
