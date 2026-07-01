---
description: Чеклист синхронизации Memory Bank после wave/изменений.
status: active
---
# MB-SYNC — Memory Bank synchronization workflow

## Когда запускать
- Один раз в конце текущей wave, после того как scheduler/explicit owner сразу
  записал closure/failure/blocking decision, final task status и evidence links
  каждой task в authoritative indexed `.memory-bank/tasks/TASK-*.task.json` и
  завершил required `/verify` / `/red-verify` gates.
- Раньше конца wave только если продолжение текущей wave реально зависит от
  согласованного RTM/index/spec/contract/changelog state или sync явно запросил
  owner. Early sync не заменяет итоговый wave-boundary sync.
- После manual `/verify`, если он изменил broader durable task/docs state beyond
  task-local closure evidence и достигнут wave boundary или действует правило
  early sync выше.
- Не запускать full `/mb-sync` по умолчанию для local manual `T0` / `T1`
  closure, если authoritative `.task.json` уже содержит `status`/`verify`,
  compact `.protocols/<TASK>/run.md` записан, and no RTM/lifecycle/index/
  changelog/spec/contract/guide/dependency state changed.
- После `/red-verify`, если выполнялась семантическая adversarial-проверка и её
  результат требует reconcile task/docs state на текущем wave boundary.
- После changes that materially affect responsibility boundaries or HOW docs,
  reconcile existing `.memory-bank/contracts/boundary-map.md`, related
  `.memory-bank/contracts/*`, or `.memory-bank/guides/*` as normal Memory Bank
  docs; do not introduce a new boundary lifecycle.
- После changes to `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`,
  feature `spec_design_status`, feature `spec_design_links`, or linked SDD specs,
  reconcile the design routing state before review/task execution handoff.
- После changes to optional `.memory-bank/behavior-specs/*.behavior.json`, or
  feature clarifications that make behavior examples stale, reconcile only links
  and notes. Behavior specs are not gates or done criteria.
- После значимых рефакторингов или архитектурных изменений.
- Перед `/review-feat-plan` или `/review-tasks-plan` (чтобы reviewer видел
  актуальное состояние нужной поверхности).
- На wave/feature boundary, после T2 feature-level red-verify completion и
  after any T3 closures in that wave.
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
- Scheduler must write the closure/failure/blocking decision, final task status, and evidence links to the authoritative indexed `.memory-bank/tasks/TASK-*.task.json` record immediately after each task and before the next `/mb-sync` boundary.
- `/mb-sync` records/reconciles already-written task state. It does not decide closure/failure/blocking/promotion and must not sync a decision that exists only in scheduler context.
- T0/T1 scheduler closure may use compact evidence / functional PASS according to tier policy.
- T2 scheduler task closure requires full protocol, applicable task/spec gates, and `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, recorded in the feature doc. In scheduler mode, run it before the wave-boundary `/mb-sync` once the last feature task closes.
- `FT-000` is the Foundation Dev Path pseudo-feature and does not participate in product feature-completion semantics.
- T3 scheduler task closure requires full protocol, applicable task/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires the exact marker `HUMAN_CHECKPOINT: done`.

Manual mode:
- Expected T0/T1 simple flow: `/execute TASK`, compact local evidence, and optional closure by the explicit manual top-level owner.
- Manual closure is allowed only when an explicit closure owner exists.
- `explicit standalone owner` means either the user directly asked the current top-level agent to close the task, or the top-level agent/orchestrator explicitly runs a manual workflow for one TASK and records that it owns closure. Subagents/worker prompts do not silently become closure owners.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- `T2` manual task closure requires full protocol, applicable task/spec gates, and `/verify PASS`; per-task `/red-verify` is optional, while T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc.
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

### 2) SDD design state
- [ ] `.memory-bank/spec-backbone.md` Global Backbone Status and Backbone Area
  Matrix are still truthful. Stale `needed_before_tasks` rows are resolved,
  reported, or routed to `/spec-design` / `/prd-to-tasks`; do not guess design
  decisions during sync.
- [ ] `.memory-bank/spec-index.md` remains a pure registry/planned-spec index.
  Active rows use `Type | Path | Status | Scope | Change route`; it does not
  contain backbone status, feature status maps, decision bodies, reverse
  feature usage, API rules, state machines, data schemas, or contract details.
- [ ] Feature frontmatter `spec_design_status` and `spec_design_links` match the
  actual linked specs. Stale or contradictory feature design is marked/reported
  as `blocked` and routed to `/prd-to-tasks FT-<NNN>` for feature-level
  canonical spec repair
  or `/spec-design` for shared/global repair; no new `stale` lifecycle/status
  value is introduced.
- [ ] Changed canonical SDD docs under `architecture/`, `contracts/`,
  `domains/`, `states/`, `adrs/`, `testing/`, `guides/`, and `runbooks/` are
  linked from the relevant feature, backbone, or registry.
- [ ] Architecture Spine `AD-*` anchors referenced from task records,
  verification targets, constraints, invariants, or protocol notes still exist.

### 3) RTM (traceability)
- [ ] `requirements.md` RTM таблица отражает реальный `Lifecycle` (planned/implemented/verified).
- [ ] Нет REQ без привязки к Epic/Feature.
- [ ] Нет Feature без привязки к REQ.

### 4) Entity lifecycle vs document status
- [ ] У feature/epic **document `status`** остаётся в допустимой таксономии (`draft|active|deprecated|archived`).
- [ ] У feature/epic **`lifecycle`** отражает реальную стадию реализации (`planned|implemented|verified`).
- [ ] Acceptance criteria не расходятся с реализацией.

### 5) Task registry
- [ ] `.memory-bank/tasks/index.json` отражает актуальный набор задач.
- [ ] `.memory-bank/tasks/TASK-*.task.json` records отражают актуальные статусы задач.
- [ ] Status, closure decision, and evidence for every completed task in the
  wave were written immediately; full sync was not used as the closure owner.
- [ ] Новые задачи (из багов, из новых требований) добавлены как schema-backed task records.
- [ ] В scheduler mode closure/failure/blocking decision уже записан в indexed `.task.json`; если нет, report consistency gap and stop for explicit scheduler or standalone owner decision.
- [ ] В manual mode manual closure sync имеет already-recorded explicit owner decision в task record или direct instruction for this sync; иначе report consistency gap and do not infer closure.
- [ ] Local manual `T0` / `T1` closure with only task `status`, task `verify`,
      and compact `.protocols/<TASK>/run.md` does not require full sync.
- [ ] If behavior specs are linked from feature docs or task `source_artifacts`,
  verify linked files exist. Report stale behavior examples as notes unless a
  normal AC/spec/verification source also fails.
- [ ] Promotion/dependent block/unblock не выполняется внутри `/mb-sync`; это отдельный scheduler pass после sync + strict doctor.
- [ ] Full `/mb-sync` runs once for the wave. Any early sync has a recorded
  current-wave durable-state dependency or explicit owner request.

### 6) Changelog
- [ ] `.memory-bank/changelog.md` содержит запись о текущей wave/change.
- [ ] Формат: `## [YYYY-MM-DD] Wave N / описание` → список изменений.

### 7) Lint
- [ ] `node scripts/mb-lint.mjs` — 0 errors.
- [ ] Все `.memory-bank/**/*.md` имеют frontmatter.
- [ ] Ссылки не битые.

### 8) Readiness gates
- [ ] `/mb-doctor --strict` passes after sync for `/autonomous` and
  `/autopilot` handoff.
- [ ] `/mb-doctor --strict` is also run for T3, complex T2,
  foundation/dependency/stale-doc/risky-link cases before execution
  handoff.
- [ ] Strict mode is not required for a bare generated skeleton or simple manual
  T0/T1 local closure.

### 9) Index
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
