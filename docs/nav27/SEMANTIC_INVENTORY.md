# DevRails Nav 27: инвентаризация семантики

Исследовано дерево ветки `devrails-nav-27` на базе `82e3c4f`, 2026-11-01.
Это карта последующих изменений, не новая архитектура и не реализованный runtime.
Runtime-файлы в рамках инвентаризации не изменены.

Основания: [принятые решения](../../DEVRAILS_NAV_27.md#принятые-решения),
[границы работы](WORK_LOG.md#принятые-границы), [AGENTS](../../AGENTS.md),
[карта исходников](../../PROJECT_MAP.md). Каталог маршрутов —
[TRANSITIONS.md](TRANSITIONS.md).

## 1. Что уже решено, а что ещё не является контрактом

Принято пользователем:

- Все исполнители, reviewers, Judge, оркестратор и Side Chat работают через DSH.
  Название модели не определяет отдельный способ запуска. Внешние агентные CLI
  и Codex App Server исключены.
- Scheduler/lifecycle-механика принадлежит коду. Модели понимают предметную
  задачу, реализуют, проверяют, формулируют решение и маршрут.
- Проверки, роли и артефакты условны. Любой verify-участник, включая основного,
  отключаем; при отсутствии включённых участников результат `skipped`, не `PASS`.
  Отключённая проверка не требует отчёта и не мешает закрыть реализованную задачу.
  `red-verify` также отключаем.
- Один короткий flow-feedback; подробное уточнение появляется только при
  возникшей потребности. Предметный результат проверки не равен flow-feedback.
- Любое нестандартное отклонение, repair-маршрут или консультация на основном
  пути проходит через вопрос/красный; согласие в основном чате или зелёный
  разрешает конкретное предложение. `/autonomous` принимает решение
  автоматически, сохраняя ручной красный, Pause и Stop.
- Memory Bank сохраняет достаточное состояние для продолжения после потери
  сессии; завершённую работу не требуется повторять из-за отсутствия chat history.
- KISS и полезная предметная семантика важнее совместимости со старой строгостью.

Не считать автоматически принятыми: поля JSON-эскизов feedback, точное размещение
run-записи, DSH API/адаптеры, RPC, workflow-script, guards, списки настроек,
их defaults, форматы snapshot/session bindings и геометрию карты. Раздел
«Предлагаемая архитектура» в исходном документе не превращает эти механизмы
в обязательные требования. Инвентаризация их не проектирует.

Следствия для всей миграции:

1. Удалить безусловное «unattended никогда не принимает решение» во всех owners,
   а не только в `/autonomous`. Автопринятое решение не называть ответом пользователя.
2. Не восстанавливать отключённый gate через соседний prompt, Constitution,
   doctor, шаблон, sync или тест. `done` не доказывает `verified`.
3. Сохранить реальную область задачи, источники требований, результаты,
   фактические findings, hard boundaries и честность evidence. Выключение проверки
   не означает выдуманный успех, разрешение внешнего действия или игнорирование
   уже обнаруженного дефекта.
4. Не заменять семь старых файлов семью новыми обязательными документами.
   Сохранять только необходимые решения, факты выполненного/пропущенного,
   незавершённую работу и ближайший handoff; точное хранение выбирается позднее.

## 2. Фактическая цепочка доставки

[install-framework.mjs](../../scripts/install-framework.mjs) копирует source repo
во временный checkout, запускает [vendor-shared.mjs](../../scripts/vendor-shared.mjs),
затем напрямую генерирует все 37 command skills в обе поверхности
`.agents/skills/` и `.claude/skills/`. Это пока Codex/Claude packaging,
не готовое подключение DSH.

`COMMAND_RESOURCE_SPECS` отдельно доставляет:

- `finding-adjudication.md` в `verify`, `red-verify`, `review-feat-plan`, `review-tasks-plan`;
- `web-design-reviewer.md` в `verify`, `red-verify`;
- `agents/review-code.md` только в `verify`.

[init-mb.js](../../skills/_shared/scripts/init-mb.js) доставляет шесть workflows,
семь roles, семь protocol templates, deployable AGENTS и девять исполняемых
validator-файлов; также генерирует task schema, MBB, routers, testing policy,
пустые project skeleton files. Существующие project/mixed файлы sync сохраняет.

Важное ограничение покрытия: vendoring в три package entrypoints **не означает**
доступность всех shared references в target. Из пяти остальных `agents/*.md`,
`recovery-plan.md`, `deep-questioning.md`, `concept-*-template.md`,
`adr-template.md`, `structure-template.md` отдельные файлы текущим direct
installer не доставляются. ADR skeleton генерируется inline, а не копированием
`adr-template.md`. Их семантику надо рассмотреть, но нельзя дать новому runtime
обязательную ссылку на source-only файл.

Это подтверждено свежим изолированным bootstrap в
`/tmp/nav27-inventory.VPIVxr/target`: 37 skills на каждую поверхность,
7 roles, 6 workflows + index, 7 protocol templates; из проверенных shared
agents в target найден только `verify/agents/review-code.md`.
Bootstrap завершился успешно. Это проверка текущей доставки, не Nav/DSH runtime.

## 3. Все canonical commands

Все пути ниже принадлежат `skills/_shared/references/commands/`.
«Изменить» означает сохранить названную предметную функцию, убрать старую
безусловность/дублирование и применить общие решения раздела 1. Это не решение
сделать каждую команду обязательной станцией.

| Файл | Сохранить | Изменить / исключить из обязательного поведения |
| --- | --- | --- |
| [start.md](../../skills/_shared/references/commands/start.md) | Определение незавершённого owner по durable state; одна ближайшая операция; честный missing-bootstrap blocker | Выбор следующей операции/допуск — код; запрос при неоднозначности через общий механизм. Убрать привязку доступности к Codex/Claude и безусловным старым gates |
| [mb-init.md](../../skills/_shared/references/commands/mb-init.md) | Проверенный target/source, безопасный bootstrap/sync, запрет выдумывать checkout | Внешний installer — текущий deploy tool, не будущий запуск DSH-агента. Не заставлять модель выполнять упаковочную инструкцию при каждом runtime recovery |
| [fill.md](../../skills/_shared/references/commands/fill.md) | Read-only загрузка нужного контекста, gaps, граница отсутствия mutations | Короткий результат; не вводить обязательный manifest, делегацию или артефакт |
| [context-manifest.md](../../skills/_shared/references/commands/context-manifest.md) | Опциональная маршрутизация чтения; прямые источники; gaps; без source dumps и durable artifact | Условный DSH Explorer; убрать постоянную длинную схему и жёсткие размеры, когда достаточно ссылок; обязательные reads определяются применимым контрактом |
| [find-skills.md](../../skills/_shared/references/commands/find-skills.md) | Project-first discovery, проверенный origin, отсутствие установки по угаданному имени | DSH availability вместо двух каталогов как универсальной истины; missing skill — общий вопрос/repair route, не новый реестр или агентный CLI |
| [creator-vibe.md](../../skills/_shared/references/commands/creator-vibe.md) | Авторский замысел, опыт человека, отсутствие выдуманных требований | Сократить декларативную прозу; «test and review until…» не должно возвращать обязательные отключённые проверки |
| [grill-me.md](../../skills/_shared/references/commands/grill-me.md) | Discovery, различение фактов и рекомендаций, durable brief и открытых вопросов | Не фиксировать форму Q/стрелок и полную frontier-тактику; подтверждение общего понимания через общий decision flow; autonomous может принять решение |
| [constitution.md](../../skills/_shared/references/commands/constitution.md) | Governing principles, explicit project non-negotiables, ratified/partial/skipped provenance | Убрать exactly-one/two-options/точную фразу рекомендации; не считать framework-default запретом settings; unattended halt заменить принятой политикой |
| [write-prd.md](../../skills/_shared/references/commands/write-prd.md) | Владение product targets, acceptance/NFR, source consistency, amendments; новый/существующий PRD route | Материальные вопросы через общий decision flow; форма PRD достаточная по содержанию, не обязательная стопка разделов/dated logs; no-check completion не выдавать за verified acceptance |
| [discuss.md](../../skills/_shared/references/commands/discuss.md) | Bounded clarification, запись ответа у canonical owner, возврат вызывающему owner | Консультация на главном пути; не заставлять создавать artifact/дополнительный переход лишь чтобы задать вопрос; решение записать там, где оно нужно продолжению |
| [map-codebase.md](../../skills/_shared/references/commands/map-codebase.md) | As-is baseline, Fact/Inference, отсутствие roadmap без product input, сохранение accepted target | Условный report/delegation; не генерировать все doc families; missing PRD — вопрос, сохранённый PRD не спрашивать заново |
| [spec-init.md](../../skills/_shared/references/commands/spec-init.md) | Доменные термины/сценарии и decomposition context; не выдавать hints за принятую архитектуру | Условность framing artifacts и scenario review; отсутствие декоративной glossary/matrix церемонии; unresolved inputs через общий механизм |
| [prd-to-features.md](../../skills/_shared/references/commands/prd-to-features.md) | REQ/EP/FT, стабильные AC, traceability, scope и отсутствие task generation | Review не обязателен по одному признаку autonomous/large/high-risk; bootstrap plan/log/REQUEST только при полезности/настройке; вернуть questions в главный путь |
| [review-feat-plan.md](../../skills/_shared/references/commands/review-feat-plan.md) | Проверка продуктовой декомпозиции и материальных gaps; APPROVE/REJECT только выполненного review | Review/участники/отчёт условны; убрать обязательные REQUEST и filename ceremony; REJECT предлагает owner repair, не запускает его сам |
| [feature-doctor.md](../../skills/_shared/references/commands/feature-doctor.md) | Проверка основания конкретного semantic finding, REQ/AC authority, первый действительный repair owner | Не обязательная прослойка для каждого finding; triage по необходимости; clarification artifact условен, autonomous может принять предложение |
| [spec-design.md](../../skills/_shared/references/commands/spec-design.md) | Начальный SDD backbone, boundaries/ownership, Foundation need, KISS минимальный набор | «Mandatory global gate» и обязательная матрица/артефактная стратегия — условны; modular-monolith preference не requirement; решения через общий flow |
| [spec-redesign.md](../../skills/_shared/references/commands/spec-redesign.md) | Delta accepted design, none/bounded/global по доказанному влиянию, сохранение сделанного | Не безусловный reset downstream; re-review только включённый и затронутый; markers/revision остаются кандидатами текущего planning contract, не новый Nav engine |
| [spec-auto.md](../../skills/_shared/references/commands/spec-auto.md) | Режим framing либо design одной feature; не переопределять accepted target из observed code | Убрать противоречие «autonomous не решает»; общая семантика с spec-init/design без второго workflow; отдельный Architect условен |
| [foundation-to-tasks.md](../../skills/_shared/references/commands/foundation-to-tasks.md) | Минимальный executable baseline; FT-000/REQ-000 в обычной task-модели; brownfield verify-existing без лишней очереди | Условные Foundation/checks/reports; не навязывать обязательную отдельную gate task и пять файлов независимо от настроек. Не выдать skipped proof за proven baseline |
| [feature-to-tasks.md](../../skills/_shared/references/commands/feature-to-tasks.md) | Одна feature, cohesive tasks, canonical links, schema/index, stable identity, bounded reconcile, optional behavior examples | Условные IMPL/protocol/log/review; убрать обязательную slicing-тактику и отдельное accepted boundary интервью вне общего механизма. RED/GREEN и proof fields не должны скрыто включать отключённые проверки |
| [review-tasks-plan.md](../../skills/_shared/references/commands/review-tasks-plan.md) | Смысловая достаточность задач, scope/claims/dependencies/owners, delta review и repair routing | Условные main/co/architecture reviewers и отчёты; missing APPROVE не запрещает выбранный skip; revision freshness применима к действительно выполненному review |
| [architecture-review.md](../../skills/_shared/references/commands/architecture-review.md) | Bounded read-only C4/contract/dependency/invariant review, без нового ADR gate | Условный участник; компактный предметный результат вызывающему review, общий feedback при необходимости решения |
| [kiss-architect.md](../../skills/_shared/references/commands/kiss-architect.md) | Дешевейшее достаточное решение; finding не создаёт authority; изменение у owner | Сжать обязательный reasoning preflight, не требовать отдельного Architect для каждого вывода; не менять полномочия вызовом lens |
| [exe.md](../../skills/_shared/references/commands/exe.md) | Одна выбранная задача, actual change surface, hard boundaries, accepted semantics, truthful result, safe resume | Убрать lifecycle writes/queue mechanics из роли модели; условные protocols/RED/GREEN/gates; безусловные current APPROVE и full protocol исключить; передавать outcome/blocker коду |
| [add-tests.md](../../skills/_shared/references/commands/add-tests.md) | Полезные scoped tests, запрет ослаблять assertions/расширять продукт, возврат владельцу | Опциональная операция, результат по реально запущенным checks; не восстанавливать full protocol через tier |
| [verify.md](../../skills/_shared/references/commands/verify.md) | Независимая проверка исхода/claims, достоверность evidence, PASS/FAIL/NEEDS-CLARIFICATION выполненной проверки | Условные все участники, включая main; убрать Luna/xhigh и auto-fanout; skipped без отчёта/PASS; lifecycle в коде; receipts остаются optional supporting evidence |
| [red-verify.md](../../skills/_shared/references/commands/red-verify.md) | Adversarial semantic review, материальность findings, semantic-pass/concern/fail выполненной проверки | Отключаемость T3/task и T2/feature; отсутствие отчёта при skip; conditional prerequisites для комбинации с выключенным verify требует решения (раздел 8) |
| [debug.md](../../skills/_shared/references/commands/debug.md) | Task-bound cause/invariant, inconclusive честен, read-only diagnosis, доказанная recurrence | Optional report/DSH diagnostic role; не расширять attempts; follow-up/pre-mortem предложение через общий механизм |
| [technical-premortem.md](../../skills/_shared/references/commands/technical-premortem.md) | Advisory проверка конкретного failure mechanism, blast radius, условий продолжения | Сократить фиксированную форму вывода; не вводить NO_GO как самостоятельный lifecycle gate; decision-relevant finding возвращается основному owner |
| [tech-debt.md](../../skills/_shared/references/commands/tech-debt.md) | Advisory bounded debt, material evidence, без task/status mutation | Не обязательный wave report; при включённой report-операции сохранять только её результат, без дублирования при resume |
| [mb-sync.md](../../skills/_shared/references/commands/mb-sync.md) | Согласование уже принятых решений/состояний, links/RTM/actual evidence | Не выводить verified из done; не запускать disabled gates на post-sync boundary; consistency gap — общий вопрос, не самостоятельное решение модели |
| [mb-garden.md](../../skills/_shared/references/commands/mb-garden.md) | Mechanical-only repair, реальные changed files, semantic/destructive owner | Availability через будущий DSH surface; проверки условны; archive/delete/merge и task conversion через общий decision flow, не автоматическое расширение |
| [mb-doctor.md](../../skills/_shared/references/commands/mb-doctor.md) | Детерминированные findings, отделение mechanical от semantic, read-only диагностика | Readiness относительно применённых настроек, не blanket strict gate; перечень findings согласовать с кодом, no disabled-report/PASS requirement |
| [autopilot.md](../../skills/_shared/references/commands/autopilot.md) | Исполнение подготовленной очереди, evidence-aware recovery, не сочинять PRD, явный terminal outcome | Весь recovery/selection/promotion/closure/retry/wave алгоритм удалить из модельных инструкций; оставить смысл задачи, результаты и repair options. Не реализовывать scheduler в этом этапе |
| [autonomous.md](../../skills/_shared/references/commands/autonomous.md) | End-to-end цель, usable input, сохранение сделанного, предметные owners | Автопринятие решений вместо старого unattended halt; sequencing/counters/lifecycle в коде; все gates/child roles условны, единый feedback |
| [multiagentic.md](../../skills/_shared/references/commands/multiagentic.md) | End-to-end режим с Judge consultation | Убрать отдельный обязательный delegated scheduler и неизменяемого Judge; имя команды не создаёт второй контракт |
| [multipilot.md](../../skills/_shared/references/commands/multipilot.md) | Prepared-queue режим с Judge consultation | То же, без Product/Design scope; не требовать strict-ready/обязательного Judge вопреки настройке |

## 4. Общие workflows, роли, prompts и semantic packs

| Источник / семейство | Сохранить | Адаптация |
| --- | --- | --- |
| [workflows/execute-loop.md](../../skills/_shared/references/workflows/execute-loop.md) | Карта product→feature→task, cohesive slicing, bounded redesign, owners | Карта условных переходов вместо обязательного сценария и fresh-child ceremony; mechanics в код, вопросы/отклонения через общий flow |
| [workflows/autonomy-policy.md](../../skills/_shared/references/workflows/autonomy-policy.md) | Различать failure, decision gap, runtime error, budget, dependency; recovery не повторяет unsafe effects | Убрать старое unattended-no-choice, unconditional strict/review/PASS и prompt scheduler; retry limits 2/3/3 — прежние defaults, не новое immutable требование |
| [workflows/tier-policy.md](../../skills/_shared/references/workflows/tier-policy.md) | Risk classification, task claim scope, literal hard boundary, evidence честность | Tier не должен автоматически включать выключенных участников/артефакты; убрать manual fast-lane vs scheduler closure ceremony, lifecycle кодовый; RED/GREEN условность согласовать |
| [workflows/sdd-design-contract.md](../../skills/_shared/references/workflows/sdd-design-contract.md) | Target/as-is distinction, subject ownership, reuse before create, scoped KISS, boundaries/consumer impact | Условная глубина/spec families; источник решения может быть autonomous. Не превращать matrix/AD/ADR в обязательное оформление простой задачи |
| [workflows/mb-sync.md](../../skills/_shared/references/workflows/mb-sync.md) | Sync decisions, не выдумывать их; preserve project state, нет копирования templates поверх заполненного protocol | Убрать unconditional wave/check/report ceremony; implemented без проверки не становится verified; disabled verification не consistency error |
| [workflows/multiagents_with_judge.md](../../skills/_shared/references/workflows/multiagents_with_judge.md) | Judge оценивает trajectory/route и материал; final owner отдельно | Убрать `gpt-5.6-sol xhigh`, «ровно один навсегда», запрет replacement, обязательные checkpoints; enabled DSH Judge, recommendation не самозапускающий redirect |
| [roles/general.md](../../skills/_shared/references/roles/general.md) | Bounded single-operation work и escalation | Старый top-level manual closure и запрет spawn не определяют Nav-controller; не требовать префикс каждой реплики |
| [roles/orchestrator.md](../../skills/_shared/references/roles/orchestrator.md) | Смысловая координация, scope, решения и консультация | Убрать Codex reasoning matrix, obligatory delegation-only/no-test tactics, role boilerplate; DSH/settings определяют launches. Scheduler code не маскировать prompt-ролью |
| [roles/architect.md](../../skills/_shared/references/roles/architect.md) | Accepted requirements, feasibility/value/cost, KISS, canonical owner | Убрать обязательный семишаговый preflight и повторяющуюся отчётность; оставить критерии принятия предложения |
| [roles/explorer.md](../../skills/_shared/references/roles/explorer.md) | Read-only evidence routes, gaps, bounded discovery | DSH role по потребности, без собственного workflow или принятия решений за caller |
| [roles/implementer.md](../../skills/_shared/references/roles/implementer.md) | Assigned scope, smallest change, actual evidence, stop on genuine blocker | STOP_REPORT/COMPLETION_REPORT не второй flow protocol; короткий outcome + общий feedback; не требовать progress.md всегда |
| [roles/reviewer.md](../../skills/_shared/references/roles/reviewer.md) | Независимость, scoped actionable findings, read-only implementation | Условная роль, verdict по активной операции; не требовать отдельный общий verdict поверх предметного |
| [roles/judge.md](../../skills/_shared/references/roles/judge.md) | Read-only trajectory judgment и evidence; не task lifecycle owner | Compact result; настройки модели/сессии вне prompt; disagreement/redirect → общий запрос решения |
| [agents/repo-scanner.md](../../skills/_shared/agents/repo-scanner.md) | Bounded as-is Fact/Inference, actual matched sources | Не требовать subagents/full fixed reports; сейчас source-only для direct install |
| [agents/mb-reviewer.md](../../skills/_shared/agents/mb-reviewer.md) | MB consistency, links, semantic drift | Не требовать verification artifacts закрытых skipped tasks, всех категорий/3–10 замечаний; source-only |
| [agents/review-plan.md](../../skills/_shared/agents/review-plan.md) | Cohesion, schema/links/dependencies, usable execution context | Условные protocol/gates/MB-SYNC и evidence; no mandatory exhaustive tests; source-only |
| [agents/review-scope.md](../../skills/_shared/agents/review-scope.md) | REQ/feature traceability и реальные gaps | Hidden requirements — lenses, не новые требования; условный отчёт; source-only |
| [agents/review-security.md](../../skills/_shared/agents/review-security.md) | Проверка действительных trust/security risks | Only applicable scope, no automatic missing-doc checklist; условная DSH role/report; source-only |
| [agents/review-code.md](../../skills/_shared/agents/review-code.md) | Короткие candidate findings без verdict, fixes и scope creep | Уже близок к цели; подключается только при включённом участнике, модель не pinned |
| [semantic-packs/finding-adjudication.md](../../skills/_shared/references/semantic-packs/finding-adjudication.md) | Независимые взгляды, evidence admission, agreement не vote | Исключить обязательные два focuses/Luna/xhigh/retry-once/no-substitution; число/модели задаёт настройка, не скрытый fan-out |
| [semantic-packs/web-design-reviewer.md](../../skills/_shared/references/semantic-packs/web-design-reviewer.md) | Уже условный rendered-UI evidence, реальные маршруты/состояния/impact | Сохранить conditional activation; инструмент не отдельный агентный CLI; не делать все viewports/states обязательной бюрократией |

## 5. Protocols, templates, deployable AGENTS

| Источник | Решение для миграции |
| --- | --- |
| [deployable/AGENTS.md](../../skills/_shared/references/deployable/AGENTS.md) | Сохранить KISS, source/target authority, Russian plain reports, contextual reading и project state boundaries. Убрать fixed role prefixes, Codex/Claude availability как универсальную модель, unconditional APPROVE/strict doctor и model scheduler. Не переносить runtime lifecycle в ручные top-level роли |
| [protocols/compact-run-template.md](../../skills/_shared/references/protocols/compact-run-template.md) | Goal/change/check/result/next полезны; убрать обязательный PASS для closure, fast-lane ownership checklist; skipped хранится честно без имитации verdict |
| [protocols/context-template.md](../../skills/_shared/references/protocols/context-template.md) | Сохранить pointers, unfinished work и safe-resume context; отдельный файл и 2–8 reads не обязательны |
| [protocols/plan-template.md](../../skills/_shared/references/protocols/plan-template.md) | Сохранить scope/outcome/constraints; убрать обязательные fan-out/RED-GREEN/owner checklists при выключенной функции |
| [protocols/progress-template.md](../../skills/_shared/references/protocols/progress-template.md) | Сохранить фактическое сделанное, evidence и next; не второй lifecycle и не обязательный receipt ledger |
| [protocols/handoff-template.md](../../skills/_shared/references/protocols/handoff-template.md) | Сохранить actual files, boundaries, открытые вопросы и next; evidence/reuse sections только по наличию |
| [protocols/verification-template.md](../../skills/_shared/references/protocols/verification-template.md) | Создавать лишь для выбранного способа записи реально выполненного verify; не требовать empty artifact при skip, не назначать verifier lifecycle owner |
| [protocols/red-verification-template.md](../../skills/_shared/references/protocols/red-verification-template.md) | То же для semantic review; verdict не substitute functional evidence |
| [constitution-template.md](../../skills/_shared/references/constitution-template.md) | Исправить «Every completed task MUST…», «MUST NOT done without verification»: defaults должны допускать принятые settings. Сохранить память, scope и truthful results. Existing ratified project Constitution не перезаписывать молча |
| [structure-template.md](../../skills/_shared/references/structure-template.md) | Согласовать task schema, routes, MB ownership, testing policy, examples и conditional artifacts с generator; не копировать старые blanket gates в новый skeleton |
| [recovery-plan.md](../../skills/_shared/references/recovery-plan.md) | Сохранить cosmetic/structural/lost-MB distinctions. Исключить произвольные time/% thresholds, mandatory scanner fanout, archive/rebuild без решения и старый local mb-init route. Сейчас не deployed |
| [deep-questioning.md](../../skills/_shared/references/deep-questioning.md) | Deprecated stub: не активировать и не тащить в модельный контекст; удаление не обязательно для результата |
| [adr-template.md](../../skills/_shared/references/adr-template.md) | Optional durable decision rationale; не требовать ADR, полный alternatives table или новый gate; отдельно согласовать inline ADR skeleton |
| [concept-architecture-template.md](../../skills/_shared/references/concept-architecture-template.md), [concept-guide-template.md](../../skills/_shared/references/concept-guide-template.md) | WHAT/WHY/HOW и code pointers оставить; duo files условны, subject specs могут быть достаточны; не требовать file pairs ради template |

Package entrypoints тоже входят в scope:

- [skills/start/SKILL.md](../../skills/start/SKILL.md) — сохранить разделение package
  и runtime, safe bootstrap; убрать описание DevRails 26/Codex/Claude как Nav execution contract.
- [skills/mb-init/SKILL.md](../../skills/mb-init/SKILL.md) — согласовать с canonical
  command и installer; не дублировать новый decision flow.
- [skills/mb-garden/SKILL.md](../../skills/mb-garden/SKILL.md) — оставить asset
  packaging entrypoint, без второго maintenance workflow; required paths проверяются установкой.

## 6. Что переживёт правку prompts в исполняемом коде

| Файл / точка | Текущий enforce | Необходимое согласование |
| --- | --- | --- |
| [init-mb.js](../../skills/_shared/scripts/init-mb.js), `TASK_SCHEMA` | Обязательные gates/verify/evidence/source/proof arrays, fixed task ID/tier/status grammar, additionalProperties=false; verify допускает строку/произвольный объект | Не изобретать новую task schema без нужды: поля допускают пустые arrays и уже дают место фактическому результату. Любое выбранное изменение shape согласовать с lint/doctor/structure/tests |
| Там же, inline MBB/testing/routers/ADR | MBB rules и testing policy создаются кодом; fresh-only testing strategy требует T2/T3 executable verification path | Правка отдельных shared templates не изменяет inline текст. Testing policy/Constitution project-owned сохраняются при sync: явно проверять сохранённые старые constraints, не обещать автоматическую полную миграцию |
| Там же, `copyWorkflowReference`, `copyRoleReference`, `copyProtocolReferences`, `RUNTIME_SCRIPT_ASSETS` | Явные lists ролей/workflows/scripts, автоматический список protocol templates, framework-owned copy/sync | Каждый required runtime reference должен действительно доставляться. Новый общий reference без generator wiring останется source-only |
| [mb-lint.mjs](../../skills/mb-garden/assets/mb-lint.mjs), `REQUIRED`, `REQUIRED_TASK_FIELDS`, `checkTaskRecords` | Обязательные MB files/schema/index, hard-coded task keys/statuses, ready dependencies, feature/PRD metadata, graph and AD links | Сохранить валидность существующей модели; убрать требования только тех artifacts, которые стали условными. Синтаксический integrity не равен обязательному model review |
| [mb-doctor.mjs](../../skills/mb-garden/assets/mb-doctor.mjs) | Безусловно вызывает preflight, Constitution, backbone, feature/task readiness | При меняющейся applicability нельзя оставить прежний all-checks gate в caller; сохранить read-only report |
| [preflight.mjs](../../skills/mb-garden/assets/mb-doctor/preflight.mjs) | Сам запускает mb-lint; strict missing script error; obsolete backlog error | Отключение doctor в prompt не меняет его внутренний lint; distinguish выбранную диагностику и допуск процесса |
| [foundation-backbone.mjs](../../skills/mb-garden/assets/mb-doctor/foundation-backbone.mjs), `checkConstitutionStructure`, `checkBackboneReadiness`, `checkFoundationReadiness` | Mandatory Constitution/routes, backbone matrix, Foundation anchors, final gate done и dependencies | Conditional artifacts/readiness; Foundation факт и принятое scope-решение сохранить, skipped proof не объявлять доказанным |
| [task-readiness.mjs](../../skills/mb-garden/assets/mb-doctor/task-readiness.mjs), `checkInProgressProtocol`, `checkSingleCardHandoffCompleteness`, `checkT2FeatureSemanticCompletion` | Compact protocol для in_progress, direct T2/T3 specs+proof path, T2 feature semantic-pass; dependencies/clarification/queue summaries | Отделить usable task/context/dependency integrity от выключенных proof/report требований; не требовать red-verify при skip |
| [acceptance-trace.mjs](../../skills/mb-garden/assets/mb-doctor/acceptance-trace.mjs), `checkFeatureAcceptanceTrace`, `hasAcceptanceExecutionEvidence` | AC/REQ identity/mapping и terminal T2/T3 progress RED/GREEN плюс verification PASS | Сохранить mapping для accepted requirements; absent skipped evidence не дефект. Не фальсифицировать acceptance evidence и не backfill исторические задачи |
| [terminal-compat.mjs](../../skills/mb-garden/assets/mb-doctor/terminal-compat.mjs), `checkFullProtocolTask`, `checkCompactDoneProtocol`, `checkTerminalEvidence` | Пять full protocol files; done требует PASS; T3 semantic-pass; T0/T1 compact PASS; failed BUG/follow-up | Главный кодовый blocker done-without-verify. Убрать fixed mandatory files/PASS при выбранном skip; фактический FAIL сохраняется FAIL. Failed report/follow-up не должен создавать новую обязательную бюрократию |
| Там же, legacy terminal compatibility | Отдельно смягчает пробелы исторических terminal tasks | Не использовать legacy exemption как фиктивный способ разрешить новые skipped задачи; новая семантика должна быть явной |
| [cli-reporting.mjs](../../skills/mb-garden/assets/mb-doctor/cli-reporting.mjs), [readers.mjs](../../skills/mb-garden/assets/mb-doctor/readers.mjs) | CLI flags/report/exit и чистое чтение | Сохранить до доказанной необходимости изменения; это не scheduler, не authorization engine |
| [scripts/test-mb-doctor.mjs](../../scripts/test-mb-doctor.mjs) | Fixture matrix закрепляет full/compact evidence, semantic gates, Foundation, AC proof, brownfield и finding order | Обновить ожидания принятого нового поведения, сохранить полезные invalid-data/dependency cases; добавить skipped closure без отчётов |
| [scripts/test-install-sync.mjs](../../scripts/test-install-sync.mjs), `assertFreshBootstrap` | Кроме доставки содержит exact-string assertions `Codex Luna xhigh`, single immutable Judge, mandatory separate reviewers, старое feature-doctor triage | Эти assertions нельзя «починить» возвращением старого prompt. Заменить на проверки новой семантики и реальной доставки |
| [install-framework.mjs](../../scripts/install-framework.mjs), `RUNTIME_SKILL_ROOTS`, `COMMAND_RESOURCE_SPECS` | Два runtime каталога, whitelist extra resources, collision-safe replacement, stale generated cleanup | Пока сохранить работоспособную упаковку для semantic deployment проверки; DSH discovery/adapter — следующий этап. Нельзя утверждать, что этот installer уже запускает DSH |
| [vendor-shared.mjs](../../scripts/vendor-shared.mjs) | Flatten/copy всех shared assets в временные packages | Сохранить source-only; не создавать tracked package-local generated files |

В репозитории не обнаружен исполняемый model scheduler или код запуска Luna/Sol:
это **инструкции** в skills/roles/packs и закрепляющие их тесты. Shell/Node
subprocess в installer и doctor запускает упаковку/детерминированный lint,
а не внешнюю модель. Не удалять эти инструменты под предлогом запрета agent CLI.
Sandbox/production/secret permissions в runtime сейчас описаны текстом;
исполняемого DSH permission enforcement здесь ещё нет.

Перед изменением doctor-модулей применим
[их AGENTS.md](../../skills/mb-garden/assets/mb-doctor/AGENTS.md): ownership
модулей и required test matrix. Он явно допускает изменение публичного
контракта; принятые Nav decisions являются таким основанием.

## 7. Остальное дерево и документация

| Файлы / семейство | Scope |
| --- | --- |
| [README.md](../../README.md), [howItWorks.md](../../howItWorks.md), [GREENFIELD_WORKFLOW.md](../../GREENFIELD_WORKFLOW.md), [PROJECT_MAP.md](../../PROJECT_MAP.md) | Согласовать текущие descriptions/chains/tier table/roles/retry/recovery с адаптированной семантикой. Сейчас подробно повторяют обязательные reviews, TDD, red gates, unattended halts и Codex/Claude execution |
| [package.json](../../package.json), [package-lock.json](../../package-lock.json) | Scripts и metadata; не добавлять DSH dependencies/архитектуру на этапе семантики. Обновить scripts только если изменится реальный набор проверок |
| [install-local.sh](../../install-local.sh) | Тонкий forwarding wrapper к installer; предметного workflow нет |
| [memory-bank-lint.yml](../../skills/mb-garden/assets/memory-bank-lint.yml) | Пример CI для deterministic lint, не model gate; сейчас не копируется runtime asset list |
| [RELEASE_NOTES.md](../../RELEASE_NOTES.md), [skills-lock.json](../../skills-lock.json), `LICENSE`, `devrails.jpg` | Исторические release/package/image сведения, не authority новых settings. Не переписывать историю ради semantic migration |
| `IDEAS/**`, `DONE/**` | Входные/исторические предложения, не активные executable contracts; не импортировать их механизмы в Nav requirements |
| `DEVRAILS_NAV_27.md`, `docs/nav27/WORK_LOG.md`, visual reference/prompt | Решения и рабочая координация; предложения реализации не подменяют принятые требования; WORK_LOG ведёт оркестратор |
| Root `AGENTS.md` | Правила разработки source repo, не deployable runtime guide; эта миграция не разрешает заменить их DSH-политикой |
| Generated `.memory-bank/`, `.agents/`, `.claude/`, `.codex/`, `.tasks/`, `.protocols/`; `IMPROVING-PRJ-PRMPT/`, `PAPERCUTS/` | Не canonical runtime source; не использовать как память разработки/объект массовой правки |

## 8. Реальные невыбранные семантические детали

Они не мешают начать общую адаптацию, но перед завершением соответствующего
пакета нельзя незаметно восстановить старый ответ:

1. **`red-verify` включён, все functional verify выключены.** Сейчас
   `red-verify.md#input_contract` требует functional PASS. Принята независимая
   отключаемость, но поведение этой комбинации явно не определено. Нужно выбрать:
   semantic review работает по доступному implementation evidence с честной
   отметкой об отсутствии functional proof либо настройка явно связывает операции.
   Нельзя молча включить functional verify или написать PASS.
2. **Локальные checks/RED-GREEN внутри `/exe`.** Отключение всех verify точно
   убирает verifier-участников и их отчёты. Устраняет ли оно также обязательную
   execution-time TDD/gate работу, либо у неё отдельная настройка, нужно выразить
   явно. Иначе «без проверки» сохранит тот же mandatory proof через executor.
3. **Состав defaults и действие выполненного отрицательного review.** Все review/
   doctor/roles/artifacts становятся условными; конкретные defaults и то,
   какие отрицательные результаты требуют repair, а какие допускают явное
   решение продолжить, ещё не перечислены. Пропуск отключённого review уже
   разрешён; подмена выполненного FAIL на skipped не разрешена. Эти варианты
   нельзя решать exact-string совместимостью со старыми тестами.

Формат run-записи, выбор места хранения, названия параметров, DSH session
replacement, aggregate-verdict plumbing при отключённом main reviewer,
сохранение названий wrapper-команд и технические способы feedback — детали
следующего этапа. Для semantic контрактов достаточно условного исполнения,
честного предметного результата и владельца решения без проектирования API.

## 9. Последовательные пакеты правок

Пакеты ниже — рекомендуемый scope, не параллельные ветки. Каждый завершается
review своего diff; последующий пакет не делает предыдущий контракт строже.

### Пакет 1 — общий контракт и все entry/decision instructions

Scope: шесть `workflows/*.md`, семь `roles/*.md`, deployable AGENTS,
constitution-template, команды `start`, `mb-init`, `fill`, `context-manifest`,
`find-skills`, `creator-vibe`, `grill-me`, `constitution`, `write-prd`, `discuss`,
`map-codebase`; три package SKILL. Сформулировать общую conditional/decision/
recovery семантику кратко в уже доставляемых общих источниках; убрать fixed
models/roles, unattended-no-choice и model-owned scheduler tactics. Leaf
contracts ссылаются на реально deployed общий owner. Не писать DSH код.

Проверки: просмотр каждого leaf handoff против TRANSITIONS; поиск старых
безусловных правил внутри изменённого scope; install-only и bootstrap в
изолированных targets, resolvable references и source/deployed parity;
0 source-tree `shared-*`. Пока downstream ещё не адаптирован, не заявлять
готовность всего Nav; противоречия оставшихся пакетов известны этой картой.

### Пакет 2 — Product/SDD/tasking и все reviews

Scope: `spec-init`, `prd-to-features`, `feature-doctor`, `spec-design`,
`spec-redesign`, `spec-auto`, `foundation-to-tasks`, `feature-to-tasks`,
`review-feat-plan`, `review-tasks-plan`, `architecture-review`, `kiss-architect`;
все шесть `agents/*.md`, оба semantic packs; recovery/concept/ADR/deprecated
references. Preserve предметную coverage/authority/identity, убрать mandatory
артефактные каскады и скрытый co-review fanout, согласовать questions/repairs.

Проверки: greenfield, brownfield, one-feature, bounded/global repair walkthrough;
выключенные review/Architect/Judge не требуют launch/report/APPROVE;
existing task identity/evidence сохраняются; bootstrap/parity/resources и
0 source-tree `shared-*`. Exact-string install tests обновлять вместе с
изменяемым контрактом, не ослабляя collision/sync/parity проверки.

### Пакет 3 — execution/recovery/closure и исполняемые validators

Scope: `exe`, `add-tests`, `verify`, `red-verify`, `debug`, `technical-premortem`,
`tech-debt`, `mb-sync`, `mb-garden`, `mb-doctor`, `autonomous`, `autopilot`,
`multiagentic`, `multipilot`; семь protocol templates; `init-mb.js`,
`structure-template.md`, affected lint/doctor modules, installer resource wiring,
оба test scripts. Common contracts уточнять только для согласованности.
До реализации conditional evidence выбрать ответы раздела 8. Снять из prompts
scheduler algorithms, сохранить смысл безопасного continuation. Не создавать
новый scheduler/DSH adapter на этом этапе.

Проверки: `npm run check:syntax`, `npm run test:mb-doctor`,
`npm run test:install-sync`, отдельный deployed doctor smoke. Матрица минимум:
все verify off → skipped/no report/done допустим; red off; main off с другими
enabled; выполненный FAIL не PASS/skipped; interruption после реализации и
после проверки; skipped state после recovery; malformed task/dependency не
«лечится» skip; исторические protocols и user-owned docs не теряются sync.

### Пакет 4 — полная согласованность описаний и независимая приёмка семантики

Scope: README/howItWorks/GREENFIELD_WORKFLOW/PROJECT_MAP и необходимые
cross-file corrections предыдущих пакетов. Уточнить inventory/transition
coverage по итоговому дереву. Не добавлять архитектуру DSH до завершения.

Проверки: независимый проход по всем 37 commands и каждой строке семейства;
обычный/автономный decision flow, консультация без смены маршрута, отказ и
неполный ответ, ручная остановка, repair/review/retry, resume без повтора;
полный syntax/test matrix + install-only/bootstrap/sync в isolated target,
сохранение project state и отсутствие source-only required references.
Готовность означает согласованные canonical→generator→deployed инструкции
и validators; работоспособность будущего DSH исполнения отдельно не заявляется.
