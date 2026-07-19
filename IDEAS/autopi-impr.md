# KISS-рефакторинг scheduler `/autopilot`

Created: 2026-07-18
Status: proposed

## Проблема

`/autopilot` уже является последовательным scheduler для готовой JSON queue,
но scheduler contract частично повторяется в `/autonomous`, `execute-loop`,
`autonomy-policy` и `tier-policy`. Дополнительно strict doctor привязан к
каждому task selection, хотя полный readiness gate полезнее на durable
boundaries.

Provenance-aware evidence reuse из `IDEAS/verifyings_optim.md` не должен
превратить scheduler в cache manager или заставить его решать, какие команды
verifier обязан повторять.

## Цель

Оставить `/autopilot` тонким resumable scheduler:

1. восстановить или явно разрешить каждую существующую `in_progress` task;
2. выбрать одну ready task;
3. вызвать tier-routed child skills;
4. принять их durable handoff/verdict;
5. записать lifecycle decision и evidence links;
6. выполнить wave-boundary reconciliation;
7. продолжить либо завершиться существующим terminal state.

Канонический режим остаётся последовательным. Parallel mode остаётся
экспериментальным и не входит в этот рефакторинг.

## Ownership после рефакторинга

- `autopilot.md` — точный scheduler loop, resume и terminal routing.
- `tier-policy.md` — closure eligibility, failure/retry и tier gates.
- `autonomy-policy.md` — budgets, hard stops и terminal vocabulary.
- `execute-loop.md` — короткая карта общего workflow, без второго scheduler
  algorithm.
- `/execute-task`, `/verify`, `/red-verify` — собственные методы и evidence.
- `/autonomous` — Product/Design/tasking orchestration, затем использование
  canonical `/autopilot` scheduler contract вместо его копирования.

Не создавать новый scheduler module, registry или workflow artifact.

## План рефакторинга

### 1. Убрать дублирование scheduler loop

- Оставить полную task-selection/transition последовательность только в
  `commands/autopilot.md`.
- В `commands/autonomous.md` после готовности Foundation/product queue ссылаться
  на canonical `/autopilot` contract и описывать только дополнительные
  end-to-end boundaries.
- В `workflows/execute-loop.md` оставить high-level sequence и ownership links.
- Не переносить failure rules из `tier-policy.md` в scheduler prompts.

### 2. Сделать resume boundary однозначным

Расширить существующий `.protocols/AUTONOMOUS-RUN/status.md` минимальным
checkpoint-блоком:

- current task;
- current stage: `selection|execute|verify|red-verify|closure|wave-boundary`;
- last durable child verdict/handoff path;
- next action.

Это orchestration checkpoint, не новый task state. Authoritative lifecycle
остаётся в indexed `.task.json`.

При resume scheduler сначала перечитывает JSON records и durable evidence, затем
продолжает с первой незавершённой stage. Он не повторяет успешно завершённый
child step только из-за перезапуска scheduler.

До любой promotion или selection scheduler выполняет recovery-first pass:

1. находит все indexed tasks со статусом `in_progress`;
2. сверяет authoritative `.task.json`, run checkpoint, task protocol, handoff и
   verdict evidence, не доверяя одному checkpoint без подтверждения;
3. определяет текущий attempt и первую не завершённую durable stage;
4. продолжает безопасный путь:
   - нет implementation handoff → `/execute-task`;
   - implementation завершён, но нет functional verdict → `/verify`;
   - T3 имеет functional PASS, но не имеет semantic-pass → `/red-verify`;
   - все tier gates уже пройдены → записывает scheduler-owned lifecycle
     decision;
5. если stage, ownership или безопасность повторного side effect неоднозначны,
   ничего не replay-ит: записывает recovery decision, evidence и exact resume
   route, затем использует подходящий существующий policy/quality/blocking halt.

Пока остаётся unresolved `in_progress`, новые `planned -> ready` promotion и
выбор другой `ready` task запрещены. Если dirty state содержит несколько
`in_progress`, scheduler reconciles их последовательно в stable index order.
Task, начатую вне доказанного scheduler-owned run, нельзя автоматически
adopt-ить как scheduler work.

Recovery использует существующие task records, `AUTONOMOUS-RUN/status.md`, task
protocols, retry counters и terminal vocabulary. Не добавлять task lifecycle
status, `current_stage` в Task schema, recovery registry или новый terminal
state.

### 3. Сократить cadence полного readiness gate

Запускать `/mb-doctor --strict`:

- перед началом scheduler run;
- после planning/spec/task/dependency repair;
- после wave-boundary `/mb-sync` перед новой promotion wave;
- перед final `SUCCESS`.

Перед каждой отдельной task выполнять только локальный selection preflight:

- перечитать index и selected task record;
- проверить status, tier, dependencies, blockers и required handoff;
- убедиться, что последний applicable strict pass не инвалидирован material
  planning/spec/task mutation.

Не запускать полный strict doctor перед каждой task, если изменились только
ожидаемые task status/evidence внутри уже проверенной wave.

### 4. Не переносить evidence-reuse решение в scheduler

- Scheduler всегда вызывает `/verify` там, где этого требует tier policy.
- `/verify` самостоятельно принимает или отклоняет execute evidence.
- Scheduler читает только functional verdict, evidence links и recommended
  lifecycle action.
- Scheduler не вычисляет fingerprints, freshness windows и не хранит cache.
- При `NEEDS-CLARIFICATION` или stale evidence использовать существующий
  failure/blocker route.

### 5. Wave/feature integration gates

- Не вводить обязательный full suite на каждую wave.
- Запускать wave/feature integration gate только когда он уже определён
  project-native testing policy, canonical spec или explicit run plan и
  соответствует реальному integration risk.
- Записывать результат в существующий run/task evidence.
- Failure блокирует promotion/final success через существующий
  `HALT_QUALITY_GATES`; scheduler не угадывает виновную task и не создаёт
  follow-up самостоятельно.

### 6. Сохранить существующие safety contracts

Без изменений оставить:

- sequential canonical execution;
- experimental `--experimental-parallel` opt-in и sequential fallback;
- immediate task status/evidence write before sync;
- T2 feature-level `/red-verify`;
- T3 per-task `/red-verify` и `HUMAN_CHECKPOINT: done`;
- failure budgets и существующие terminal states;
- operator-decision halts и exact resume route;
- wave-boundary `/mb-sync` ownership.

## Expected implementation surface

Primary:

- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/workflows/autonomy-policy.md`
- `skills/_shared/references/workflows/execute-loop.md`
- `skills/_shared/references/protocols/run-status-template.md`

Conditional:

- `skills/_shared/references/workflows/tier-policy.md` — только если нужно
  устранить найденное ownership-дублирование;
- `README.md`, `howItWorks.md`, `GREENFIELD_WORKFLOW.md` — только при material
  изменении публичного scheduler contract;
- agent-run isolated target checks — только для узкого regression smoke.

Task schema, `mb-lint`, `mb-doctor`, `/execute-task`, `/verify` и `/red-verify` не
меняются этой задачей.

## Non-goals

- no parallel-first scheduler;
- no new task status, registry, queue format or persisted mode field;
- no cache service or evidence-receipt registry;
- no scheduler-owned verification strategy;
- no automatic planning repair or follow-up creation;
- no mandatory wave suite;
- no new orchestration abstraction ради удаления нескольких повторяющихся
  строк.

## Evaluation cases

- scheduler restart с `in_progress` и `ready` сначала восстанавливает
  `in_progress`, не выполняя promotion/selection другой task;
- interruption after `/execute-task` resumes at `/verify`, not repeated execute;
- interruption after functional PASS resumes at required T3 semantic gate or
  closure;
- ambiguous stage, scheduler ownership или non-idempotent replay записывает
  recovery decision и завершается существующим halt;
- несколько stranded `in_progress` reconciled последовательно без запуска новой
  task;
- status/evidence-only task completion does not trigger per-task strict doctor;
- task/spec/dependency repair invalidates prior readiness and triggers strict
  doctor;
- stale execute evidence is routed by `/verify`, not scheduler;
- wave integration failure blocks promotion without guessing task ownership;
- unresolved operator decision yields the existing halt and exact resume route;
- sequential queue behavior and terminal vocabulary remain unchanged.

## Acceptance criteria

- one canonical detailed scheduler loop remains;
- `/autonomous` does not restage `/autopilot` internals;
- scheduler run can resume from a durable stage checkpoint;
- promotion/selection не выполняются при unresolved `in_progress`;
- каждая найденная `in_progress` либо безопасно продолжена с первой
  незавершённой stage, либо получила явное recovery decision;
- strict doctor runs at meaningful boundaries rather than before every task;
- evidence reuse remains verifier-owned;
- no new lifecycle, registry, cache, mandatory suite or canonical parallel
  behavior appears;
- recovery не добавляет новый task status, schema field, registry или terminal
  state;
- existing tier, safety, failure and terminal contracts remain compatible.
