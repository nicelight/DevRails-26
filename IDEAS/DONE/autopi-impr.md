# KISS-рефакторинг scheduler `/autopilot`

Created: 2026-07-18
Status: implemented
Implemented: 2026-07-20

## Implementation progress

Completed:

- removed the strict-doctor cadence optimization and all dependent scope;
- removed the evidence-reuse and wave/feature integration-gate sections;
- removed `skills/_shared/references/protocols/run-status-template.md`;
- moved the common durable run checkpoint contract into deployed
  `workflows/autonomy-policy.md`;
- defined the scheduler-specific stage vocabulary in `commands/autopilot.md`;
- routed `/autonomous` run-status creation to the deployed checkpoint contract;
- implemented recovery-first reconciliation and durable stage resume in
  `/autopilot`, including unfinished scheduler-level checkpoints, stable-order
  recovery of multiple `in_progress` tasks, and the prohibition on
  promotion/selection while either remains unresolved;
- added checkpoint transitions plus safe no-replay recovery/halt decisions;
- made `/autopilot` the only detailed product-queue scheduler and routed product
  queue execution from `/autonomous` to that contract;
- kept Foundation execution outside `/autopilot`: `/autonomous` directly owns
  the bounded FT-000 phase through the existing Foundation workflow, while
  Foundation resume uses outer run/task evidence rather than scheduler stages;
- made `/autopilot` product-only and added explicit rejection/handoff for
  unfinished or newly created FT-000 work without adding a scope flag or doctor
  mode;
- reduced `execute-loop.md` to the high-level sequence and ownership links;
- synchronized `README.md`, `howItWorks.md`, and `GREENFIELD_WORKFLOW.md` with
  recovery-first scheduler ownership;
- passed syntax/diff validation, isolated install-only and bootstrap smokes,
  deployed recovery-contract cases, and confirmed `0` generated package-local
  `shared-*` files.

Remaining: none.

## Проблема

`/autopilot` уже является последовательным scheduler для готовой JSON queue,
но scheduler contract частично повторяется в `/autonomous`, `execute-loop`,
`autonomy-policy` и `tier-policy`. При этом recovery существующих
`in_progress` tasks и durable orchestration checkpoint не определены
однозначно.

## Цель

Оставить `/autopilot` тонким resumable scheduler:

1. восстановить незавершённую durable scheduler stage;
2. восстановить или явно разрешить каждую существующую `in_progress` task;
3. выбрать одну ready task;
4. вызвать tier-routed child skills;
5. принять их durable handoff/verdict;
6. записать lifecycle decision и evidence links;
7. выполнить wave-boundary reconciliation;
8. продолжить либо завершиться существующим terminal state.

Канонический режим остаётся последовательным. Parallel mode остаётся
экспериментальным и не входит в этот рефакторинг.

## Ownership после рефакторинга

- `autopilot.md` — точный scheduler loop, resume, scheduler-specific stage
  vocabulary и terminal routing.
- `tier-policy.md` — closure eligibility, failure/retry и tier gates.
- `autonomy-policy.md` — durable run checkpoint contract, budgets, hard stops и
  terminal vocabulary.
- `execute-loop.md` — короткая карта общего workflow, без второго scheduler
  algorithm.
- `/exe`, `/verify`, `/red-verify` — собственные методы и evidence.
- `/autonomous` — Product/Design/tasking orchestration, bounded FT-000 execution
  ownership, затем использование canonical `/autopilot` product scheduler
  contract вместо его копирования.

Не создавать новый scheduler module, registry или workflow artifact.

## План рефакторинга

### 1. Убрать дублирование scheduler loop

- Оставить полную task-selection/transition последовательность только в
  `commands/autopilot.md`.
- В `commands/autonomous.md` после готовности product queue ссылаться на
  canonical `/autopilot` contract и описывать только дополнительные end-to-end
  boundaries.
- Foundation не делегировать в `/autopilot`: `/autonomous` владеет bounded
  FT-000 phase через существующий Foundation workflow; product scheduler
  checkpoint активируется только после закрытия Foundation gate.
- В `workflows/execute-loop.md` оставить high-level sequence и ownership links.
- Не переносить failure rules из `tier-policy.md` в scheduler prompts.

### 2. Сделать resume boundary однозначным

Определить в `workflows/autonomy-policy.md` минимальный checkpoint contract для
существующего `.protocols/AUTONOMOUS-RUN/status.md`:

- current task или `none` для run-level stage;
- current stage: `selection|execute|verify|red-verify|closure|wave-boundary`;
- last durable child verdict/handoff path;
- next action.

Допустимые scheduler stage определить только в `commands/autopilot.md`:
`selection|execute|verify|red-verify|closure|wave-boundary`.

Это orchestration checkpoint, не новый task state. Authoritative lifecycle
остаётся в indexed `.task.json`.

При resume scheduler сначала перечитывает JSON records и durable evidence, затем
продолжает с первой незавершённой stage. Он не повторяет успешно завершённый
child step только из-за перезапуска scheduler.

До любой promotion или selection scheduler выполняет recovery-first pass:

1. сверяет незавершённую checkpoint action даже при отсутствии `in_progress` и
   продолжает selected-task, feature `red-verify`, closure или wave-boundary с
   первой не завершённой durable action;
2. находит все indexed tasks со статусом `in_progress`;
3. сверяет authoritative `.task.json`, run checkpoint, task protocol, handoff и
   verdict evidence, не доверяя одному checkpoint без подтверждения;
4. определяет текущий attempt и первую не завершённую durable stage;
5. продолжает безопасный путь:
   - нет implementation handoff → `/exe`;
   - implementation завершён, но нет functional verdict → `/verify`;
   - T3 имеет functional PASS, но не имеет semantic-pass → `/red-verify`;
   - все tier gates уже пройдены → записывает scheduler-owned lifecycle
     decision;
6. если stage, ownership или безопасность повторного side effect неоднозначны,
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

### 3. Сохранить существующие safety contracts

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
- `skills/_shared/references/workflows/tier-policy.md`
- `skills/_shared/references/commands/foundation-to-tasks.md`
- `skills/_shared/references/commands/mb-doctor.md`
- `howItWorks.md`

Checkpoint source:

- отдельный `run-status-template.md` отсутствует; общий checkpoint contract
  живёт в deployed `autonomy-policy.md`.

Conditional:

- `README.md`, `GREENFIELD_WORKFLOW.md` — только если их публичное описание
  scheduler/resume требует синхронизации.

Task schema, `mb-lint`, `/exe`, `/verify` и `/red-verify` не меняются этой
задачей.

Required validation:

- isolated target bootstrap/install smoke;
- recovery cases below against deployed runtime skills and workflows;
- source-only tree contains `0` generated package-local `shared-*` files.

## Non-goals

- no parallel-first scheduler;
- no new task status, registry, queue format or persisted mode field;
- no scheduler-owned verification strategy;
- no automatic planning repair or follow-up creation;
- no new orchestration abstraction ради удаления нескольких повторяющихся
  строк.

## Evaluation cases

- scheduler restart с `in_progress` и `ready` сначала восстанавливает
  `in_progress`, не выполняя promotion/selection другой task;
- interruption after `/exe` resumes at `/verify`, not repeated execute;
- interruption after functional PASS resumes at required T3 semantic gate or
  closure;
- interruption after task closure resumes unfinished feature `red-verify`
  before selection;
- interruption inside `wave-boundary` resumes the first incomplete boundary
  action before promotion;
- ambiguous stage, scheduler ownership или non-idempotent replay записывает
  recovery decision и завершается существующим halt;
- несколько stranded `in_progress` reconciled последовательно без запуска новой
  task;
- unresolved operator decision yields the existing halt and exact resume route;
- sequential queue behavior and terminal vocabulary remain unchanged;
- `/autonomous` executes/reconciles only FT-000 records during Foundation and
  never invokes `/autopilot` for that phase;
- `/autopilot` starts only after the Foundation gate and rejects any unfinished
  or newly created FT-000 work with an exact `/autonomous` resume handoff;
- Foundation resume uses the outer run plan and FT-000 task protocols without
  adding non-product scheduler stages or an intermediate `SUCCESS`;
- isolated installed target exposes the checkpoint contract through
  `.memory-bank/workflows/autonomy-policy.md` and does not depend on a deployed
  `run-status-template.md`.

## Acceptance criteria

- one canonical detailed scheduler loop remains;
- `/autonomous` owns only the bounded Foundation task phase and does not restage
  `/autopilot` product internals;
- `/autopilot` owns only product task transitions after the Foundation gate;
- scheduler run can resume from a durable stage checkpoint;
- common checkpoint shape is owned by deployed `autonomy-policy.md`, while the
  scheduler stage vocabulary is owned by `/autopilot`;
- promotion/selection не выполняются при unfinished scheduler checkpoint или
  unresolved `in_progress`;
- каждая найденная `in_progress` либо безопасно продолжена с первой
  незавершённой stage, либо получила явное recovery decision;
- no new lifecycle, registry or canonical parallel behavior appears;
- recovery не добавляет новый task status, schema field, registry или terminal
  state;
- existing tier, safety, failure and terminal contracts remain compatible;
- isolated target smoke passes against deployed runtime files.
