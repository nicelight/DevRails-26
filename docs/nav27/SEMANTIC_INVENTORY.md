# DevRails Nav 27: итоговая инвентаризация семантики

Обновлено по итоговому source поверх `45ae29e`, 2026-11-01.
Первичная инвентаризация исследовала `82e3c4f`; найденные тогда старые gates,
fixed models и недоставляемые prompts были основанием трёх последовательных
пакетов. Их исторические результаты сохранены в `SEMANTIC_BASE_RESULT.md`,
`SEMANTIC_PLANNING_RESULT.md`, `SEMANTIC_EXECUTION_RESULT.md`; statements об
оставшейся работе в них относятся к тому моменту, не к текущему дереву.
Независимый verdict и фактические проверки: [SEMANTIC_ACCEPTANCE.md](SEMANTIC_ACCEPTANCE.md).

## 1. Общий контракт

Canonical owner — [autonomy-policy](../../skills/_shared/references/workflows/autonomy-policy.md).
Все модели/субагенты используют DSH. Host владеет queue/launch/lifecycle/budget/
recovery sequencing; модели — предметной работой и semantic decisions.
Один короткий structured flow feedback обязателен на границе операции;
subject verdict отделён, exact fields/transport ещё не определены.

Каждый nonstandard branch, repair и main-path consultation проходит один
запрос/красный/ожидание main-chat или green. Autonomous принимает решения весь
run, в том числе после handoff в autopilot, с честным provenance, сохраняя
manual red/Pause/Stop, permissions и неизвестные внешние факты. Refusal отменяет
предложение; incomplete answer не разрешает зависимую работу.

Checks/participants/artifacts условны. Main-off не создаёт replacement main;
code-only candidates не являются functional PASS; all-off — skipped/no report,
implemented task может быть done. Red independently on/off, red-alone честно
без functional proof. Local exe checks отдельно configurable, default on.
Оба последних выбора — рабочие defaults родителя до ответа на optional
уточнения, не новые immutable решения пользователя.

Actual FAIL/REJECT/candidates сохраняются со scoped disposition; skip не
стирает negative evidence. Disabled design не требует placeholder backbone или
positive revision. Foundation proof gate условен при сохранении действительных
baseline dependencies. Identity, hard boundaries, partial effects, historical
evidence и sync ownership остаются.

## 2. Фактическая цепочка доставки

[Installer](../../scripts/install-framework.mjs) готовит temporary copy,
[vendoring](../../scripts/vendor-shared.mjs) разворачивает shared assets внутри
трёх package entrypoints, затем direct generation создаёт 37 skills в каждой
из `.agents/skills/` и `.claude/skills/`. Это legacy delivery, не DSH adapter.
Bootstrap/sync через [init-mb.js](../../skills/_shared/scripts/init-mb.js)
доставляет workflows/roles/protocols/guide/validators и создаёт skeleton/schema.

| Owner command | Реально доставляемые дополнительные ресурсы |
| --- | --- |
| map-codebase | agents/repo-scanner.md |
| mb-garden | agents/mb-reviewer.md, references/recovery-plan.md |
| review-feat-plan | agents/review-scope.md, finding-adjudication pack |
| review-tasks-plan | agents/review-plan.md, agents/review-security.md, finding-adjudication pack |
| verify | agents/review-code.md, finding-adjudication и web-design-reviewer packs |
| red-verify | оба semantic packs |
| spec-design | ADR, concept-architecture и concept-guide templates |
| spec-redesign | ADR template |

Пять prompts и recovery/design templates, отсутствовавшие в первичном target,
подключены пакетом 2. Source-only `structure-template.md` описывает generator;
`deep-questioning.md` остаётся deprecated stub, не required runtime input.
Optional availability сама не включает операцию.

## 3. Все 37 canonical commands

Все команды сохраняют общий conditional/decision/recovery контракт выше.
Read-only review не исполняет repair; handoff не является model launch loop.

### Вход, контекст и продукт

| Command | Сохранённый outcome / граница |
| --- | --- |
| [start](../../skills/_shared/references/commands/start.md) | Определяет ближайшего незавершённого owner по фактическому состоянию; не запускает цепочку. |
| [mb-init](../../skills/_shared/references/commands/mb-init.md) | Возвращает проверенное действие внешнего installer для bootstrap/sync; проверяет реальную доступность после него. |
| [fill](../../skills/_shared/references/commands/fill.md) | Read-only загружает достаточный контекст текущей работы. |
| [context-manifest](../../skills/_shared/references/commands/context-manifest.md) | Опционально возвращает маршруты к источникам и реальные gaps без нового артефакта. |
| [find-skills](../../skills/_shared/references/commands/find-skills.md) | Находит реально доступные capabilities и проверенный origin недостающего skill. |
| [creator-vibe](../../skills/_shared/references/commands/creator-vibe.md) | Сохраняет авторский замысел в творческой работе; не создаёт requirements или новые gates. |
| [grill-me](../../skills/_shared/references/commands/grill-me.md) | Проясняет неопределённую идею и сохраняет resumable brief. |
| [constitution](../../skills/_shared/references/commands/constitution.md) | Владеет принципами, явными non-negotiables и provenance принятых решений. |
| [write-prd](../../skills/_shared/references/commands/write-prd.md) | Владеет product intent, scope, acceptance и NFR; новый PRD ведёт к framing, update — к decomposition. |
| [discuss](../../skills/_shared/references/commands/discuss.md) | Разрешает ограниченный вопрос на основном пути и возвращает решение его owner. |
| [map-codebase](../../skills/_shared/references/commands/map-codebase.md) | Фиксирует as-is baseline без подмены accepted target или создания roadmap. |

### Design, tasking и reviews

| Command | Сохранённый outcome / граница |
| --- | --- |
| [spec-init](../../skills/_shared/references/commands/spec-init.md) | Даёт vocabulary/domain/scenario framing для decomposition без принятия архитектуры. |
| [prd-to-features](../../skills/_shared/references/commands/prd-to-features.md) | Создаёт REQ/EP/FT и stable AC; не создаёт задачи или testing policy. |
| [feature-doctor](../../skills/_shared/references/commands/feature-doctor.md) | Проверяет основание конкретного semantic finding и определяет первый repair owner. |
| [spec-design](../../skills/_shared/references/commands/spec-design.md) | Владеет начальным достаточным SDD design и решением о Foundation. |
| [spec-redesign](../../skills/_shared/references/commands/spec-redesign.md) | Меняет accepted shared design с доказанным none/bounded/global impact. |
| [spec-auto](../../skills/_shared/references/commands/spec-auto.md) | Применяет autonomous decisions к framing либо дизайну одной продуктовой фичи. |
| [foundation-to-tasks](../../skills/_shared/references/commands/foundation-to-tasks.md) | Планирует минимальный FT-000 baseline; verify-existing может подтвердить отсутствие отдельной очереди. |
| [feature-to-tasks](../../skills/_shared/references/commands/feature-to-tasks.md) | Планирует или согласует ровно одну продуктовую фичу в полные indexed task cards. |
| [review-feat-plan](../../skills/_shared/references/commands/review-feat-plan.md) | Независимо оценивает продуктовую decomposition: APPROVE/REJECT. |
| [review-tasks-plan](../../skills/_shared/references/commands/review-tasks-plan.md) | Оценивает meaning, cohesion, identity, dependencies и selected proof задач: APPROVE/REJECT. |
| [architecture-review](../../skills/_shared/references/commands/architecture-review.md) | Возвращает bounded read-only architecture assessment вызывающему review. |
| [kiss-architect](../../skills/_shared/references/commands/kiss-architect.md) | Применяет Architect policy без смены роли и полномочий. |

### Execution, maintenance и run modes

| Command | Сохранённый outcome / граница |
| --- | --- |
| [exe](../../skills/_shared/references/commands/exe.md) | Реализует одну выбранную runnable task, возвращает actual/partial effects и selected local evidence. |
| [add-tests](../../skills/_shared/references/commands/add-tests.md) | Добавляет полезные tests внутри текущего in-progress task scope. |
| [verify](../../skills/_shared/references/commands/verify.md) | Независимо проверяет выбранные claims; участники возвращают собственные functional verdicts либо code candidates. |
| [red-verify](../../skills/_shared/references/commands/red-verify.md) | Даёт независимый semantic-pass/concern/fail по задаче или T2 feature; не заменяет functional proof. |
| [debug](../../skills/_shared/references/commands/debug.md) | Read-only устанавливает task-bound cause/invariant либо INCONCLUSIVE; не добавляет попытку. |
| [technical-premortem](../../skills/_shared/references/commands/technical-premortem.md) | Даёт scoped advisory GO/GO_WITH_CONDITIONS/NO_GO, без собственного lifecycle gate. |
| [tech-debt](../../skills/_shared/references/commands/tech-debt.md) | Возвращает подтверждённый advisory debt по выбранной поверхности; файл отчёта условен. |
| [mb-sync](../../skills/_shared/references/commands/mb-sync.md) | Согласует уже записанные решения и состояние без closure/semantic authority. |
| [mb-garden](../../skills/_shared/references/commands/mb-garden.md) | Чинит однозначные links/indexes/routers; semantic/destructive repair возвращает owner. |
| [mb-doctor](../../skills/_shared/references/commands/mb-doctor.md) | Read-only проверяет структуру и evidence выбранной работы. |
| [autopilot](../../skills/_shared/references/commands/autopilot.md) | Поддерживает выполнение подготовленной продуктовой очереди, исключая FT-000; scheduler принадлежит host. |
| [autonomous](../../skills/_shared/references/commands/autonomous.md) | Охватывает accepted product → selected planning → нужную Foundation → product execution; semantic decisions автономны весь run. |
| [multiagentic](../../skills/_shared/references/commands/multiagentic.md) | Применяет выбранный Judge overlay к autonomous contract. |
| [multipilot](../../skills/_shared/references/commands/multipilot.md) | Применяет выбранный Judge overlay к autopilot contract. |

## 4. Workflows, roles, prompts и packs

| Семейство / файлы | Итоговое покрытие |
| --- | --- |
| autonomy-policy | DSH-only, общий feedback/decision, conditional checks, evidence-aware recovery, host mechanics. |
| execute-loop | Product→design→tasking→execution owners; conditional handoffs; bounded/global revision и no-revision repair. |
| tier-policy | Risk/identity, hard write boundary, claim/dependency ownership, selected proof, host closure, retained attempt state. |
| sdd-design-contract | Target/current authority, canonical ownership, sufficient selected artifacts, no mandatory matrix/ADR ceremony. |
| mb-sync workflow | Уже принятые решения; status/evidence reconciliation, без собственного closure или verified-from-done. |
| multiagents_with_judge | Условный read-only Judge, SUPPORT не permission, REDIRECT не launch; нет fixed model/session/fanout. |
| general, orchestrator, architect | Bounded work, semantic coordination, KISS; все под shared policy и DSH settings. |
| explorer, implementer, reviewer, judge | Соответствующие read/write boundaries, evidence и handoff, без дополнительных lifecycle полномочий. |
| repo-scanner, mb-reviewer | Bounded as-is discovery и consistency assessment; conditional reports, no mandatory fanout. |
| review-plan, review-scope, review-security | Task cohesion/identity, product traceability, actual security risk; no invented requirements/gates. |
| review-code | Candidate-only scoped code findings, не functional verdict. |
| finding-adjudication | Evidence/authority, не голосование; только selected participants, disabled caller не заменяется. |
| web-design-reviewer | Optional rendered evidence по доступным route/browser/safe state; no mandatory ceremony. |

Все шесть workflows и семь roles доставляются в Memory Bank; все шесть prompts
и оба packs имеют установленные skill-local routes из раздела 2.

## 5. Templates, deployable guide и package entrypoints

| Surface | Итог |
| --- | --- |
| deployable AGENTS | Shared policy, KISS, source-path semantics, Russian plain reports, DSH availability и conditional completion. Root source AGENTS не менялся. |
| constitution-template | Fresh defaults не объявлены project-ratified non-negotiables; decisions/provenance и checks честны. Existing project Constitution сохраняется. |
| compact-run, context, plan, progress, handoff | Семь protocol templates условны; эти пять сохраняют actual work, selected checks, partial effects и resume, не назначают модель lifecycle owner. |
| verification, red-verification | Только performed subject result; code-only может сохранить candidates без functional verdict; red не заменяет functional proof. |
| structure-template + inline init-mb skeleton | JSON schema/status vocabulary сохранены; selected proof/inputs и MBB/testing/routes согласованы; fresh skeleton не runnable queue. |
| recovery-plan | Evidence-bounded mechanical/structural/lost-state repair, общий decision flow и no blind replay. |
| ADR / concept architecture / concept guide | Optional durable docs по реальной ценности, без обязательных pairs/alternatives/gates. |
| deep-questioning | Deprecated compatibility stub, не активный workflow. |
| start / mb-init / mb-garden package SKILL | External packaging routes / assets; единственный runtime owner — canonical command; prepared shared references существуют. |

## 6. Исполняемые validators и generator

| Source | Проверенный контракт |
| --- | --- |
| init-mb.js | Existing task schema; verify допускает typed object, selected protocols default []; explicit assets/roles/workflows; project-owned sync preservation. |
| mb-lint.mjs | Identity/schema/index, resolving paths, hard scope, REQ/FT/AC/dependencies и optional design applicability; skip не чинит malformed record. |
| mb-doctor.mjs | Только top-level diagnostic orchestration, не scheduler. |
| preflight.mjs | Selected doctor выполняет mechanical lint; CLI error/default/strict различаются. |
| foundation-backbone.mjs | Disabled design без bundle; optional matrix для Nav; existing matrix/anchors/dependencies проверяются; optional integrated gate. |
| task-readiness.mjs | Usable single-card context/proof по выбранной работе, dependency/readiness integrity, conditional feature semantic completion. |
| acceptance-trace.mjs | Stable AC/REQ/task mapping; claim evidence только выбранного proof; no historical backfill. |
| terminal-compat.mjs | Latest attempt selection, selected results/protocols, code candidates, actual negatives/dispositions и historical compatibility; repair success проверяет selected той попытки. |
| cli-reporting/readers | Сохранены CLI/report/exit и filesystem reading responsibilities. |
| test-mb-doctor.mjs | Legacy + Nav matrix: all-off T0–T3, main-off/code-only, red-alone, local checks, negative dispositions, recovery, optional design/Foundation, malformed identity/dependency. |
| test-install-sync.mjs | Source/deployed parity, resources, collision safety, restoration/idempotence и сохранение historical/user state; прежние gates не возвращаются ради assertions. |
| install-framework/vendor-shared | Source-only compatibility packaging; labels/metadata Nav 27, bin/paths/ownership markers сохранены. |

Новые Nav snapshot entries используют `stage: workflow` в existing `task.verify`.
`selected` до запуска соответствующей операции/участника — изменяемый план
текущей attempt; при запуске/skip её выбор фиксируется. Local checks входят в
snapshot exe, будущие verify/red — нет. Diagnostics используют retained choices
выполненной работы, не live config; закрытые attempts и evidence неизменны.
Это не DSH API/transport, не новый registry или lifecycle. Старым records snapshot
не дописывается для обхода historical checks.

## 7. Переходы и готовность

[TRANSITIONS.md](TRANSITIONS.md) покрывает M01–M23, R01–R40 с дополнительными
bounded/global/retry branches, J01–J07 и recovery situations. All-off, main-off,
red-alone, refusal/incomplete answer, main-path consultation, ordinary/autonomous
repair и recovery сверены независимо по действующему source.

Три semantic пакета завершены; итоговая приёмка содержит фактические проверки
и verdict. Дальнейшая архитектура DSH не является частью этого inventory.
Exact feedback fields/transport, controller/session/settings API, UI и native
launch/stop/recovery enforcement здесь не реализованы и не выданы за готовые.
