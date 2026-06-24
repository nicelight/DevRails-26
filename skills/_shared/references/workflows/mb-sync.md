---
description: Чеклист синхронизации Memory Bank после wave/изменений.
status: active
---
# MB-SYNC — Memory Bank synchronization workflow

## Когда запускать
- После scheduler записал closure/failure/blocking decision, final task status, and evidence links в authoritative indexed `.memory-bank/tasks/TASK-*.task.json` (`/autopilot` / `/autonomous`) и выполнения required `/verify` / `/red-verify` gates.
- После manual `/verify`, если он изменил broader durable task/docs state beyond task-local closure evidence.
- Не запускать full `/mb-sync` по умолчанию для local manual `T0` / `T1`
  closure, если authoritative `.task.json` уже содержит `status`/`verify`,
  compact `.protocols/<TASK>/run.md` записан, and no RTM/lifecycle/index/
  changelog/spec/contract/guide/packet/dependency state changed.
- После `/red-verify`, если выполнялась семантическая adversarial-проверка и она изменила или требует reconcile task/docs state.
- После task run с Execution Packet, если task record/protocol/evidence уже
  содержит `runtime_context.packet_ref` или packet-related evidence links.
- После changes that materially affect responsibility boundaries or HOW docs,
  reconcile existing `.memory-bank/contracts/boundary-map.md`, related
  `.memory-bank/contracts/*`, or `.memory-bank/guides/*` as normal Memory Bank
  docs; do not introduce a new boundary lifecycle.
- После значимых рефакторингов или архитектурных изменений.
- Перед `/review-feat-plan` или `/review-tasks-plan` (чтобы reviewer видел
  актуальное состояние нужной поверхности).
- На T2 wave/feature boundary, после T2 feature-level red-verify completion,
  and after T3 closure.
- Перед handoff to another agent when they need fresh durable Memory Bank state.
- При ощущении drift между кодом и документацией.

## Status Transition Modes

Status transitions have two modes.

Scheduler mode:
- `/autopilot` and `/autonomous` own task status transitions.
- Scheduler decides closure/failure/blocking eligibility.
- `/execute` returns scoped implementation handoff; it does not close tasks.
- `/verify` gives functional verdict/evidence; in scheduler mode it does not close/fail/block/promote.
- `/red-verify` gives semantic verdict for per-task T3 checks and T2 feature-completion checks; in scheduler mode it does not close/fail/block/promote.
- Scheduler must write the closure/failure/blocking decision, final task status, and evidence links to the authoritative indexed `.memory-bank/tasks/TASK-*.task.json` record before `/mb-sync`.
- `/mb-sync` records/reconciles already-written task state. It does not decide closure/failure/blocking/promotion and must not sync a decision that exists only in scheduler context.
- T0/T1 scheduler closure may use compact evidence / functional PASS according to tier policy.
- T2 scheduler task closure requires full protocol, required packet/spec gates, and `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, recorded in the feature doc.
- `FT-000` is the Foundation Dev Path pseudo-feature and does not participate in product feature-completion semantics.
- T3 scheduler task closure requires full protocol, required packet/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires exact markers `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`.

Manual mode:
- Expected T0/T1 simple flow: `/execute TASK`, compact local evidence, and optional closure by the explicit manual top-level owner.
- Manual closure is allowed only when an explicit closure owner exists.
- `explicit standalone owner` means either the user directly asked the current top-level agent to close the task, or the top-level agent/orchestrator explicitly runs a manual workflow for one TASK and records that it owns closure. Subagents/worker prompts do not silently become closure owners.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- `T2` manual task closure requires full protocol, required packet/spec gates, and `/verify PASS`; per-task `/red-verify` is optional, while T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc.
- `T3` manual task closure requires `/red-verify` `SEMANTIC_VERDICT: semantic-pass` after `/verify PASS`; if semantic issues are found, the scheduler or explicit owner may reopen/block/fail or create follow-up work.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Do not mix scheduler mode and manual mode inside one task run.
- No persisted `mode` field is used.

## Чеклист

### 1) Concept support consistency
- [ ] Если используется классическая duo-модель, каждый `architecture/<concept>.md` имеет парный `guides/<concept>.md` (и наоборот).
- [ ] Взаимные ссылки между duo docs актуальны, если используется классическая пара.
- [ ] Если используются spec-driven support docs, они явно маршрутизированы через `spec-index.md` и не противоречат `architecture/*`, `guides/*`, `contracts/*`, `states/*`, `runbooks/*`, `testing/*`.
- [ ] If responsibility/scope boundaries changed, existing
  `contracts/boundary-map.md` or related contracts are updated/recommended;
  task records still use existing link fields plus `runtime_context`.

### 2) RTM (traceability)
- [ ] `requirements.md` RTM таблица отражает реальный `Lifecycle` (planned/implemented/verified).
- [ ] Нет REQ без привязки к Epic/Feature.
- [ ] Нет Feature без привязки к REQ.

### 3) Entity lifecycle vs document status
- [ ] У feature/epic **document `status`** остаётся в допустимой таксономии (`draft|active|deprecated|archived`).
- [ ] У feature/epic **`lifecycle`** отражает реальную стадию реализации (`planned|implemented|verified`).
- [ ] Acceptance criteria не расходятся с реализацией.

### 4) Task registry
- [ ] `.memory-bank/tasks/index.json` отражает актуальный набор задач.
- [ ] `.memory-bank/tasks/TASK-*.task.json` records отражают актуальные статусы задач.
- [ ] Новые задачи (из багов, из новых требований) добавлены как schema-backed task records.
- [ ] В scheduler mode closure/failure/blocking decision уже записан в indexed `.task.json`; если нет, report consistency gap and stop for explicit scheduler or standalone owner decision.
- [ ] В manual mode manual closure sync имеет already-recorded explicit owner decision в task record или direct instruction for this sync; иначе report consistency gap and do not infer closure.
- [ ] Local manual `T0` / `T1` closure with only task `status`, task `verify`,
      and compact `.protocols/<TASK>/run.md` does not require full sync.
- [ ] Если использовался Execution Packet, reconcile только уже записанные
  `runtime_context.packet_ref`, protocol links и evidence paths. Не строить
  packet, не обновлять его статус и не выводить closure/promotion decision из
  packet status.
- [ ] Promotion/dependent block/unblock не выполняется внутри `/mb-sync`; это отдельный scheduler pass после sync + strict doctor.

### 5) Changelog
- [ ] `.memory-bank/changelog.md` содержит запись о текущей wave/change.
- [ ] Формат: `## [YYYY-MM-DD] Wave N / описание` → список изменений.

### 6) Lint
- [ ] `node scripts/mb-lint.mjs` — 0 errors.
- [ ] Все `.memory-bank/**/*.md` имеют frontmatter.
- [ ] Ссылки не битые.

### 7) Index
- [ ] `.memory-bank/index.md` содержит аннотированные ссылки на все новые/изменённые документы.
- [ ] Router-индексы в папках с >3 документами присутствуют.

## Формат changelog

```markdown
---
description: Лог изменений Memory Bank.
status: active
---
# Changelog

## [YYYY-MM-DD] Wave N — краткое описание
- Added: ...
- Updated: ...
- Fixed: ...
- Removed: ...
```

## Если что-то не проходит
1. Исправь проблему немедленно (пока контекст свеж).
2. Если исправление нетривиально — создай schema-backed task record и обнови `.memory-bank/tasks/index.json`.
3. В interactive режиме можно отметить partial sync в `changelog.md`.
4. В autonomous режиме partial sync недопустим: остановись с `HALT_QUALITY_GATES`.
