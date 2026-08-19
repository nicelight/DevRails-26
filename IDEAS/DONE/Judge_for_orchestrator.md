# DevRails Judge — supervisory role для автономного workflow

## Статус и цель

Добавить в DevRails отдельную роль **Judge**, которая следит не за качеством
кода или отдельного артефакта, а за **адекватностью управления автономным
workflow**.

Judge отвечает на вопрос:

> Достаточно ли обоснован предлагаемый следующий ход с учётом цели,
> authoritative state, выполненной работы и наблюдаемой траектории?

Judge нужен прежде всего для контроля дешёвого Оркестратора, который способен
корректно исполнять локальные contracts, но может долго двигаться не в ту
сторону, повторять неэффективный recovery или лечить симптом вместо причины.

Model routing не входит в первый этап. Роль и workflow contract остаются
model-independent; отдельная более сильная модель для Judge может быть
подключена позже без изменения его полномочий.

## Основная модель

```text
active ORCHESTRATOR
  -> ведёт workflow и собирает evidence
  -> достигает Judge checkpoint или замечает material uncertainty
  -> формирует компактный Judge Brief с file:line locators
  -> вызывает fresh ROLE: JUDGE

fresh JUDGE
  -> проверяет brief и точечно читает durable evidence
  -> оценивает trajectory и proposed route
  -> SUPPORT | REDIRECT | ESCALATE_OPERATOR

active ORCHESTRATOR
  -> следует рекомендации
  -> либо останавливается и передаёт конфликт Оператору
```

Judge консультирует только активного владельца orchestration:

- `/autonomous` — во время Product/Design, Foundation и до product handoff;
- `/autopilot` — во время исполнения product queue.

После handoff в `/autopilot` `/autonomous` не запускает параллельного Judge
поверх product scheduler.

Вызов Judge обеспечивает логика роли Оркестратор. Harness не вводит отдельный
таймер, scheduler или техническую гарантию вызова.

## Почему это отдельная роль

Reviewer и Judge проверяют разные объекты:

```text
Reviewer
  -> соответствует ли конкретный artifact/work его contract

Judge
  -> адекватно ли Оркестратор ведёт workflow и обоснован ли его следующий route
```

Reviewer ограничен одним review target и возвращает verdict его owning
workflow. Judge смотрит на последовательность решений, failures, repairs,
handoffs и смену owning layer. Он не должен превращаться в Reviewer №2 или
повторно проводить полный review уже проверенных артефактов.

Используется одна роль Judge с двумя lens:

1. **Decision lens** — проверяет конкретный proposed route.
2. **Trajectory lens** — проверяет, показывает ли история реальный прогресс,
   повторение failure pattern, symptom repair или drift от исходной цели.

Оба lens применяются к одному узкому вопросу на invocation.

## Fresh context и экономия контекста

Каждая консультация запускает fresh Judge context. У Judge нет свободной
долговременной conversational memory; история остаётся в durable state
DevRails.

Оркестратор подготавливает контекст до вызова Judge. Judge не должен начинать с
широкого сканирования проекта или восстанавливать весь run самостоятельно.

Это экономит context window, снижает anchoring и позволяет позже назначить
Judge более дорогую модель без передачи ей полной истории Оркестратора.

Self-report Оркестратора не является source of truth. Judge использует его как
навигационный пакет и вправе точечно проверить любой material claim по
переданным locators. При конфликте brief и durable evidence побеждает
authoritative state.

## Judge Brief

Оркестратор передаёт минимально достаточный пакет:

```text
JUDGE_BRIEF

objective:
  исходная цель и применимые success conditions

checkpoint:
  текущая фаза, owning orchestrator и причина вызова

progress_since_last_judge:
  значимые действия, outcomes и изменения authoritative state

evidence:
  material claims с точными project-relative file:line locators

trajectory:
  attempts, repairs, review/verifier verdicts, blockers и budget counters

noticed_problems:
  подтверждённые, потенциальные и уже разрешённые проблемы с evidence/status

proposed_route:
  конкретный следующий existing skill/owner и ожидаемый результат

real_alternatives:
  только существующие material alternatives и причины их отклонения

question:
  один decision-relevant вопрос Judge
```

Brief содержит наблюдаемые факты, решения и evidence, а не скрытую
chain-of-thought. Потенциальные проблемы включаются, когда Оркестратор реально
заметил относящийся к решению signal; exhaustive speculative brainstorming не
требуется.

`file:line` locators должны вести к достаточным excerpts: task records,
specifications, status/checkpoint, decision log, review verdicts, `/verify`,
`/red-verify`, `/debug`, tests или другому decisive evidence. Judge расширяет
read set только для проверки material gap, contradiction или unsupported claim.

Judge Brief не создаёт новый durable artifact. Краткий результат консультации
и принятый route записываются в существующий decision log/run state, когда это
нужно для resume и audit.

## Плановые checkpoints

Judge не вызывается после каждого skill или tool call. Плановые вызовы стоят
только на границах, после которых цена неверной траектории заметно возрастает.

### 1. Перед Foundation execution

Только когда `Foundation Required: true`:

```text
/spec-design --all
  -> Foundation decision
  -> JUDGE
  -> /foundation-to-tasks
  -> FT-000 execution
```

Judge проверяет, обоснован ли переход от design к Foundation work и не пытается
ли workflow компенсировать design gap через scaffold или implementation.

Если Foundation не требуется, checkpoint пропускается.

### 2. Перед product handoff в `/autopilot`

```text
для каждой FT-NNN:
  isolated /feature-to-tasks FT-NNN child
  -> separate fresh /review-tasks-plan FT-NNN child
после всех features:
  lint + /mb-doctor --strict
  -> JUDGE
  -> /autopilot
```

Judge оценивает целостную trajectory Product/Design/Foundation/tasking и
готовность Оркестратора передать выполнение product scheduler.

### 3. На product wave boundary

```text
wave execution
  -> required verification and semantic gates
  -> /mb-sync
  -> lint + /mb-doctor --strict
  -> applicable task-plan re-reviews
  -> /tech-debt wave <N>
  -> JUDGE
  -> next wave или terminal SUCCESS
```

Judge получает путь к advisory `/tech-debt` report вместе с остальным wave
evidence. Один вызов покрывает всю wave, а не каждую task. Для последней wave
он также служит проверкой trajectory перед `SUCCESS`; отдельный дублирующий
финальный Judge не нужен.

## Обязательный checkpoint затянувшейся task

После завершения применимой verification chain для **любой retry attempt**
Оркестратор вызывает Judge до следующей correction, disposition или closure.

```text
initial attempt
  -> verification FAIL
  -> evidence-backed correction
  -> retry attempt
  -> /verify и применимый /red-verify verdict
  -> JUDGE
  -> recovery route или closure
```

Этот checkpoint срабатывает после verification попытки, которой уже
предшествовали неуспешная attempt и correction. Он не требует нового task field,
status или counter: основанием служат существующие Execution Attempts,
verdicts и retry budget.

Judge проверяет:

- устранила ли correction подтверждённую причину или только изменила symptom;
- соответствует ли новый verdict заявленному progress;
- повторяется ли тот же causal mechanism или только похожий symptom;
- остаётся ли проблема task-local;
- не требуется ли сменить evidence, correction или owning layer;
- достаточно ли оснований для closure после успешной retry verification.

При неуспешной retry verification Judge рекомендует минимальный подходящий
existing route:

```text
/debug <TASK_ID>
  -> root cause или first violated invariant не подтверждены;
  -> evidence не различает competing hypotheses;
  -> повторные corrections не объясняют recurrence.

/technical-premortem <TASK_ID>
  -> root cause и конкретная следующая correction уже evidence-backed;
  -> correction нетривиальна, multi-surface или имеет material blast radius;
  -> до нового /exe нужно проверить failure, rollback и pre-flight conditions.

direct bounded retry
  -> причина подтверждена;
  -> correction локальна, однозначна и безопасна;
  -> pre-mortem не изменит решение.

existing upstream owner
  -> evidence показывает task slicing, product, spec, architecture,
     authority или другой upstream gap.
```

`/debug` устанавливает причину. `/technical-premortem` не заменяет diagnosis: он
проверяет уже сформированную planned correction до реализации. Judge не
придумывает дополнительную attempt и не расширяет retry budget.

Если retry verification успешна, Judge не перепроверяет functional verdict
вместо `/verify`. Он оценивает, достаточно ли trajectory evidence показывает,
что затянувшаяся проблема исправлена в правильном owning layer и workflow может
продолжить required closure gates.

## Событийные вызовы

Помимо плановых checkpoints Оркестратор вызывает Judge, когда:

- один review surface получил второй последовательный `REJECT`;
- предполагается сменить owning layer;
- новый evidence противоречит ранее выбранному route;
- recovery допускает несколько materially different routes;
- несколько действий не дают наблюдаемого progress;
- Оркестратор замечает, что локальные gates проходят, но исходный outcome не
  приближается;
- потенциальная проблема способна изменить следующий material ход;
- Оркестратор не уверен, что продолжает решать исходную задачу.

Judge не нужен для механических переходов, полностью определённых policy:

- обычный `verify -> red-verify` до retry checkpoint;
- deterministic `planned -> ready`;
- выбор earliest-wave task по scheduler contract;
- обычный `/mb-sync`;
- task-local closure без retry trajectory и без material uncertainty.

## Verdict и сила рекомендации

```text
JUDGE_ASSESSMENT

assessment: SUPPORT | REDIRECT | ESCALATE_OPERATOR

basis:
  почему proposed route достаточно или недостаточно обоснован

trajectory_signal:
  progress | repeated_pattern | symptom_repair | owning_layer_drift | none

recommended_route:
  proposed route либо конкретный existing skill/owner

conditions:
  только необходимые evidence/decision conditions

evidence_checked:
  проверенные file:line locators
```

- `SUPPORT` — proposed route достаточно обоснован текущим evidence.
- `REDIRECT` — продолжать по proposed route не следует; назван existing route
  или owner.
- `ESCALATE_OPERATOR` — material route зависит от operator-owned decision или
  evidence не позволяет безопасно разрешить конфликт.

Это verdict Judge, а не task status или terminal run state.

Рекомендация Judge настоятельна и обязательна к реакции. Оркестратор может:

1. принять её и продолжить по названному route; либо
2. остановиться, если считает рекомендацию ошибочной, противоречащей policy,
   evidence или невыполнимой в текущих boundaries.

Оркестратор не может молча проигнорировать Judge и продолжить свой прежний ход.
При несогласии он использует существующий `HALT_BLOCKING_QUESTIONS` и передаёт
Оператору:

- recommendation Judge;
- своё конкретное возражение;
- evidence обеих позиций;
- последствия доступных routes;
- точный вопрос и resume owner.

## Authority boundaries

Judge может:

- указать на trajectory drift и отсутствие progress;
- отклонить недостаточно обоснованный proposed route;
- рекомендовать `/debug`, `/technical-premortem`, bounded retry или existing
  upstream owner;
- заметить symptom repair, premature closure или premature success;
- потребовать operator escalation при material conflict.

Judge не может:

- менять task lifecycle, status, retry budget или scheduler checkpoint;
- закрывать, блокировать или исправлять task;
- заменять `/verify`, `/red-verify`, Reviewer, `/debug` или
  `/technical-premortem`;
- отменять verdict owning workflow;
- менять specs, task cards или implementation;
- принимать operator-owned decision;
- создавать новый workflow, lifecycle, registry или terminal state.

Judge влияет только на следующий orchestration route. Authoritative artifacts,
existing policies и решения Оператора сохраняют более высокий authority.

## Отношение к существующим механизмам

```text
Reviewer
  -> качество конкретного reviewed artifact/work

/verify
  -> functional truth конкретной attempt

/red-verify
  -> semantic / risk truth

/debug
  -> подтверждённая причина observed task failure

/technical-premortem
  -> риск уже сформированной planned correction

/mb-doctor
  -> deterministic structural readiness

Judge
  -> адекватность orchestration trajectory и proposed route
```

Judge использует результаты этих механизмов как evidence и не дублирует их
работу.

## KISS boundaries

Первый вариант не вводит:

- model routing или обязательную асимметрию моделей;
- harness-controlled Judge scheduler или timer;
- Judge memory;
- Judge report artifact;
- новый task field, schema, registry, lifecycle или status;
- новый scheduler stage;
- вызов Judge после каждой task, skill или tool call;
- автоматическую реализацию Judge recommendation.

Достаточный первый результат — отдельная fresh-context роль, Judge Brief,
ограниченный набор checkpoints, retry-verification consultation и
operator-escalation при несогласии.

## Критерии успешности

Идея работает, если:

1. Judge обычно принимает решение по brief и нескольким точечным reads, без
   восстановления всего run.
2. Повторная correction не запускается автоматически после retry verification:
   сначала проверяется направление recovery.
3. `/debug` используется при неизвестной причине, а `/technical-premortem` —
   для известной нетривиальной correction.
4. Wrong-layer repair и повторение без progress обнаруживаются раньше
   исчерпания budget.
5. Механические transitions не получают лишний inference.
6. Оркестратор не может продолжить против Judge без явной передачи конфликта
   Оператору.
7. Существующие ownership, lifecycle, gates, statuses и resume routes не
   меняются.

## Референсы

- CAMEL CriticAgent: https://github.com/camel-ai/camel
- Agent-as-a-Judge: https://github.com/metauto-ai/agent-as-a-judge
- DevRails-26: https://github.com/nicelight/DevRails-26

Итоговая формула:

> **Orchestrator-prepared evidence + fresh supervisory Judge + sparse phase
> checkpoints + mandatory retry-trajectory review + operator escalation on
> disagreement.**
