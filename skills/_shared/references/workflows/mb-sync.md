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

## Ownership boundary

- Canonical lifecycle, tier gates, manual-versus-scheduler closure rules, and
  status ownership live only in `.memory-bank/workflows/tier-policy.md`.
- Before sync, the scheduler or explicit manual owner must already have written
  its allowed closure/failure/blocking decision, final task status, and evidence
  links to the authoritative indexed `.task.json` record.
- `/mb-sync` reconciles that already-decided state into RTM, feature/epic
  lifecycle, indexes, routers, specs, evidence links, and changelog. It never
  decides closure/failure/blocking/promotion, unblocks dependents, or treats a
  verdict existing only in transient context as durable state.
- `/mb-sync` owns only reconciliation and sync-local consistency validation:
  after its changes, it re-reads the links, indexes, RTM, lifecycle/spec state,
  and other reconciled surfaces it actually changed. It does not run full
  `node scripts/mb-lint.mjs` or `/mb-doctor`.
- In scheduler flow, `/autonomous` or `/autopilot` is the sole owner of the
  authoritative post-sync `mb-lint` followed by `/mb-doctor --strict`, before
  promotion or success. In manual flow, the successful sync handoff names the
  explicit top-level caller/owner; that owner runs the applicable post-sync
  lint/doctor before its next handoff.
- If the required owner decision is missing or conflicts with tier policy,
  report a consistency gap and return to that owner. Do not infer a scheduler
  or manual mode and do not add a persisted mode field.

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
  reported, or routed to `/spec-design` / `/feature-to-tasks`; do not guess design
  decisions during sync.
- [ ] `.memory-bank/spec-index.md` remains a pure registry/planned-spec index.
  Active rows use `Type | Path | Status | Scope | Change route`; it does not
  contain backbone status, feature status maps, decision bodies, reverse
  feature usage, API rules, state machines, data schemas, or contract details.
- [ ] Feature frontmatter `spec_design_status` and `spec_design_links` match the
  actual linked specs. Stale or contradictory feature design is marked/reported
  as `blocked` and routed to `/feature-to-tasks FT-<NNN>` for feature-level
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

### 7) Sync-local consistency validation
- [ ] Re-read every link, index, RTM row, lifecycle/spec state, router,
  evidence link, and changelog entry changed by this sync; confirm each agrees
  with its already-authoritative source.
- [ ] Check only the files and relationships actually reconciled. Do not run
  full `mb-lint` or `/mb-doctor` inside `/mb-sync`.

### 8) Caller-owned post-sync gates
- [ ] In scheduler flow, `/autonomous` or `/autopilot` runs authoritative
  `node scripts/mb-lint.mjs` and then `/mb-doctor --strict` after sync and
  before promotion or success; `/mb-sync` does not duplicate either gate.
- [ ] In manual flow, the sync handoff names the explicit top-level
  caller/owner that runs applicable post-sync lint/doctor before its next
  handoff. Doctor remains conditional for T3, complex T2,
  foundation/dependency/stale-doc/risky-link boundaries.
- [ ] A bare generated skeleton or simple manual T0/T1 local closure gains no
  new full sync, lint, or strict-doctor requirement.

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
1. Исправь немедленно только механическую consistency/link/router проблему,
   которая не требует нового owner decision.
2. Если исправление меняет product/design/contract/task/lifecycle meaning,
   остановись и верни gap соответствующему owner; `/mb-sync` не выбирает
   трактовку и не создаёт task от своего имени.
3. Если explicit owner уже решил создать follow-up, он добавляет normal
   schema-backed task record через существующий planning/ownership route, после
   чего sync reconciles index/RTM/changelog.
4. В interactive режиме можно отметить partial sync в `changelog.md` только с
   явным owner decision и открытым blocker.
5. В autonomous режиме partial sync недопустим: остановись с
   `HALT_QUALITY_GATES` либо с записанным clarification/blocking halt для
   unresolved operator decision.
