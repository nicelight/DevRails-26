# `/debug` и диагностическая эскалация `/autopilot`

**Статус:** согласованный план реализации; runtime-контракт появится только
после изменения canonical source и проверки установки.

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

`/autopilot` как scheduler запускает `/debug` в свежем child-контексте:

- до исчерпания retry budget — когда durable failure evidence не даёт
  evidence-backed минимальной task-local коррекции и новый диагностический
  контекст полезнее слепого retry;
- обязательно после третьей неудачной Execution Attempt и до окончательного
  решения `failed|blocked`.

Ранний debug не определяется tier, числом файлов или обязательным checklist.
Если он подтверждает однозначную безопасную коррекцию внутри текущей задачи и
retry budget ещё доступен, `/autopilot` может выполнить обычный retry. При
неоднозначности он использует существующий owner/halt route и не угадывает.

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

## Обязательная эскалация после третьей попытки

До окончательного scheduler decision задача остаётся `in_progress`, а
checkpoint получает `current stage: diagnose`.

`/autopilot` последовательно запускает два свежих child-контекста с указанными
ниже write boundaries:

1. `/debug <TASK_ID>`;
2. `ROLE: Architect` с установленным `/kiss-architect`.

Последовательность обязательна: Architect получает debug report как недоверенное
supporting evidence и независимо проверяет его. Параллельное выполнение не
нужно и усложняет recovery.

### Architect reassessment

Architect получает:

- task card и direct specs;
- три Execution Attempt и их verdict/evidence;
- фактическую change surface;
- актуальный task-plan approval и необходимый feature plan;
- непосредственно затронутые architecture boundaries;
- текущий debug report.

Его задача — определить, существует ли хотя бы одна evidence-backed коррекция,
полностью разрешённая текущими task identity, outcome, tier, dependencies,
direct specs, architecture rules и write boundary, либо установить первый
upstream mismatch, из-за которого корректное исправление внутри задачи
невозможно.

Architect не повторяет полную диагностику и не может:

- изменять implementation, tests, specs, task или scheduler state;
- менять lifecycle, counters, tier или dependencies;
- принимать product/spec/architecture decisions;
- разрешать дополнительный retry;
- создавать BUG или follow-up.

`/architecture-review` не используется: он принадлежит planning review и имеет
другой ownership.

Architect возвращает только:

- attempt IDs и evidence paths;
- первый нарушенный или конфликтующий boundary;
- минимальную preflighted task-local коррекцию, если она существует;
- точного upstream owner и resume route;
- оставшийся evidence/authority gap;
- один точный marker:

```text
ARCHITECTURE_ASSESSMENT: TASK_LOCAL|UPSTREAM_MISMATCH|INCONCLUSIVE
```

Значения:

- `TASK_LOCAL` — хотя бы одна evidence-backed коррекция укладывается в принятые
  контракты текущей задачи;
- `UPSTREAM_MISMATCH` — evidence доказывает первый конкретный task/spec/
  architecture mismatch, запрещающий корректное task-local исправление;
- `INCONCLUSIVE` — evidence недостаточно или authoritative inputs конфликтуют.

Marker является supporting classification, а не verdict, status или planning
approval.

`/autopilot` сохраняет возвращённый read-only assessment по пути:

```text
.tasks/<TASK_ID>/<TASK_ID>-S-ARCH-REASSESSMENT-final-report-docs-01.md
```

## Scheduler disposition

`/autopilot` интегрирует оба отчёта и единолично принимает lifecycle/routing
decision.

До исчерпания retry budget подтверждённая однозначная безопасная task-local
коррекция может привести к обычному retry. В остальных случаях применяется
существующий halt/owner route.

После третьей неудачной попытки:

- `TASK_LOCAL` -> `failed` по существующему failure-budget contract; создать
  или связать обычный BUG/follow-up handoff с diagnostic и architecture
  evidence; дополнительного retry нет;
- `UPSTREAM_MISMATCH` -> `blocked` либо существующий clarification/blocking halt
  с точным owner:
  - task slicing, tier или direct task spec -> `/feature-to-tasks FT-<NNN>`;
  - product ambiguity -> `/feature-doctor FT-<NNN>`;
  - shared/global architecture, write authority, source of truth, public
    boundary или dependency direction -> `/spec-design`;
- `INCONCLUSIVE` или конфликт двух отчётов -> не угадывать коррекцию; применить
  существующий failure/clarification route по evidence. При исчерпанном retry
  budget обычный исход — `failed`, кроме реального authority gap, требующего
  `blocked`/halt.

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

При resume scheduler опирается на durable reports, а не chat context:

- полный current-attempt debug report не создаётся повторно;
- при готовом debug report и отсутствующем Architect report запускается только
  Architect;
- при наличии обоих отчётов выполняется только scheduler disposition;
- read-only Architect assessment можно безопасно повторить, если он не был
  durably сохранён;
- неоднозначно завершённый mutating probe не повторяется; `/debug` обязан
  использовать isolated/replay-safe probe либо остановиться.

Если обязательный child/delegation после третьей попытки недоступен,
`/autopilot` не заменяет его анализом в собственном контексте. Он фиксирует
отсутствующий отчёт и использует существующий quality/blocking halt с точным
owner/resume route.

## KISS-границы

Изменение не добавляет:

- task status, field, schema или registry;
- отдельный debug lifecycle, protocol family или scheduler;
- новый role;
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
- сохранены exact markers и report paths;
- `/debug` не получил implementation, verdict или lifecycle authority;
- probes не расширяют permissions;
- `diagnose` входит только в scheduler checkpoint vocabulary;
- ранний trigger зависит от evidence, а не tier/file count/checklist;
- три попытки и исключения считаются однозначно;
- после третьей попытки `/debug` и Architect запускаются последовательно;
- resume пропускает завершённый child и не повторяет unsafe probe;
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
