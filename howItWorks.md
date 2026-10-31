# Как работает DevRails Nav 27

DevRails сохраняет предметную цепочку от принятого продукта до реализации,
проверок и восстановления по Memory Bank. Эта ветка содержит адаптированные
семантические контракты и deterministic validators. DSH-контроллер, native
подключение команд и UI ещё не реализованы. Проверенная legacy доставка
`.agents/.claude` не является работающим DSH adapter.

## Владельцы работы

Модель получает цель, доступные inputs, ограничения, выбранную работу и
критерий результата. Она выбирает внутреннюю тактику, выполняет предметную
операцию и возвращает outcome, evidence и semantic decisions.

Host владеет выбором runnable task, зависимостями, запусками, lifecycle writes,
budget/retry accounting и recovery sequencing. Все модели и субагенты
используют штатную среду DSH. Роль — назначение, а не фиксированная модель,
reasoning level, persona или неизменяемая сессия. GENERAL, ORCHESTRATOR,
ARCHITECT, Explorer, Implementer, Reviewer и JUDGE описаны в
[canonical roles](skills/_shared/references/roles/).

Общий контракт — [autonomy-policy](skills/_shared/references/workflows/autonomy-policy.md).
На границе операции обязателен один короткий structured flow feedback:
результат готов к обычному продолжению либо нужен decision с краткой причиной.
Предметный verdict остаётся отдельно. Полные отчёты и feedback после каждого
tool call не нужны; точные поля и transport определит последующий этап.

## Решения и остановки

Любой нестандартный branch, repair и консультация на основном пути используют
один decision flow. В обычном режиме путь ждёт согласия в основном чате
или зелёного для конкретного предложения. Отказ отменяет предложение;
неоднозначный/неполный ответ, молчание, рекомендация модели и Side Chat не
разрешают продолжение. Зелёный не сообщает неизвестные внешние факты.
Уже принятое применимое решение повторно не спрашивается.

Autonomous policy разрешает модели принимать semantic decisions с provenance
`autonomous`, в том числе после handoff в `/autopilot`. Это не фиктивный ответ
пользователя. Явные требования, manual red/Pause/Stop, permissions и реальные
ограничения остаются. Зависимая работа ждёт отсутствующий факт или разрешение;
независимая работа остаётся в своей авторизованной области.

## Условные операции и evidence

| Выбор | Результат |
| --- | --- |
| Все verify off | `skipped`, без verification report и PASS; завершённая реализация может быть `done`. |
| Main off, другие on | Только выбранные участники и их собственные результаты; без hidden main. |
| Только code co-review | `candidate_findings: none` либо реальные findings и inspected evidence; functional PASS не возникает. |
| Red off | Нет semantic report или verdict. |
| Red alone | Semantic review доступной реализации с явным отсутствием functional proof. |
| Local exe checks off | Нет скрытого RED/GREEN; verify/red настраиваются независимо. |
| Design/review/report off | Нет обязательного placeholder, положительной revision, APPROVE или отсутствующего отчёта. |

Локальные exe checks имеют отдельную настройку, по умолчанию on. Независимый
red-alone и этот local-check default — рабочие defaults миграции, а не новые
неизменяемые решения пользователя. Явная принятая project non-negotiable
при конфликте с настройкой требует решения у её owner.

Выполненный FAIL/REJECT/semantic-fail или material candidate остаётся отрицательным
evidence. Repair/continue имеет scoped disposition, источник решения и reason;
последующий skip не стирает finding. Repair не доказывает успех до следующего
применимого результата. `done` означает completion реализации, а не verified
acceptance. `done_for_prod` сохраняет production-acceptance remainder и не
разрешает production effects.

## Product, design и Foundation

Raw idea проясняется в `/grill-me`; Constitution владеет принципами,
`/write-prd` — product scope, observable acceptance и material NFR. Ясный
accepted input не требует повторного интервью. Новый PRD идёт к framing
`/spec-init`, обновлённый — к `/prd-to-features`. Decomposition сохраняет
REQ/EP/FT identity и feature AC `FT-NNN-AC-NNN` с governing REQ.

Brownfield `/map-codebase` описывает действительное состояние кода, не
переписывает accepted target и не создаёт roadmap без PRD/delta.

`/spec-design` владеет начальным достаточным дизайном. Specs имеют subject
owners под architecture/contracts/domains/states/testing/runbooks/guides/adrs;
feature связывает поведение и применимые specs, не становится техническим hub.
`spec-index.md` — registry `Type | Path | Status | Scope | Change route`.
При accepted dependency graph его подробный owner — `contracts/boundary-map.md`;
ссылки не превращают все graph edges в task dependencies.

SDD depth, matrix, ADR и duo files условны по реальной потребности. Выключенный
global design не требует пустого backbone или positive Planning Revision.
Если revision существует, `/spec-redesign` меняет её только при доказанном
global impact; bounded repair сохраняет revision и затрагивает только affected
features. Без revision применяется существующий reconciliation marker.
Task identity, выполненная работа и evidence сохраняются.

Foundation — минимальный executable baseline, необходимый продуктовой работе.
`REQ-000` и `FT-000` зарезервированы, но используют обычные task records.
`/foundation-to-tasks --verify-existing` может подтвердить достаточный baseline
без очереди; недостаток evidence предлагает probes/disposition, не создаёт их
автоматически. Separate integrated proof gate условен: `Gate Task: not_required`
допустим при нужной baseline implementation без отдельного gate. Реальные
baseline dependencies и identity существующего gate не исчезают из-за skip.

## Задачи и исполнение

Единственная task-модель — `.memory-bank/tasks/index.json` и индексируемые
`TASK-NNN-TN-FT-NNN-WN.task.json`. ID tier/feature/wave совпадают с полями.
Product waves — W1+, W0 зарезервирована для Foundation. Dependency outcomes
остаются prerequisites и принимаются только при `done|done_for_prod`; их proof
не переносится в downstream task.

Одна задача представляет независимо завершимый material change outcome.
Тесты, probes и UAT принадлежат этому outcome, а не создают proof-only siblings.
Реальная production-only acceptance может быть отдельным финальным remainder.
Task card несёт purpose/outcome, прямые accepted inputs, change surface,
constraints и выбранный proof path. T2/T3 нельзя выполнять по registry guesses.
Когда design off, достаточные task/REQ/feature/code/contract inputs допустимы.

`touched_files` — advisory. Непустой `runtime_context.write_boundary` — hard
allow-list project-relative POSIX paths с segment-prefix semantics; glob/`..`
не допускаются. `forbidden_scope`, stop conditions и permissions сохраняются
при любом выборе проверок. Escalation tier или material identity/scope change
возвращается к tasking как controlled rebuild, без переписывания ID на месте.

T0 — безопасные docs; T1 — локальная низкорисковая правка; T2 — contracts,
state/data/migrations или meaningful multi-module behavior; T3 — security,
production, destructive/irreversible effects и подобные риски. Tier определяет
нужную глубину выбранного proof, не обязательный participant/report bundle.

Когда local proof выбран, T2/T3 RED показывает реальное отсутствие task-owned
claim до изменения, затем equivalent GREEN. Setup/syntax/artificial failure
не считается RED; уже существующий GREEN не требует искусственной поломки.
Alternative proof обосновывает реальную неприменимость. Harmful probes требуют
разрешённого disposable/isolated state. Нельзя выдумывать historical RED.

Selected functional verify независимо проверяет task-owned claims; executor
GREEN сам по себе не PASS. Optional deterministic receipts могут быть supporting
evidence после сравнения полного релевантного input state; они не становятся
независимым наблюдением. Candidate-only code review остаётся отдельным результатом.
Adversarial red-verify проверяет semantic correctness и material supported-path
risks, не превращая speculative candidates в requirements.

## Durable state и восстановление

Новые Nav task cards используют existing `task.verify`, entry `stage: workflow`.
`attempt` — stable ID; `selected` сохраняет фактические design/local_checks,
verify participants, task/feature red и protocol filenames. `protocols: []`
допустим и не заменяется tier bundle. До запуска операции/участника её план
можно менять в текущей attempt без повторного exe или approval. При запуске
либо skip фиксируется выбор только этой работы; local checks входят в exe,
будущие verify/red — нет. Current settings не переписывают начатую работу или
историю. Новая попытка добавляет запись.

Результаты заполняются по факту: implementation partial/complete, evidence,
local result, participant verdict/candidates, semantic result. Unfinished поля
отсутствуют; disabled — skipped. Negative disposition содержит decision,
user/autonomous source и reason. Inline evidence допустим без отдельного файла.
Selected feature red может жить в matching feature или existing verify entry
`stage: feature_red_verify`. Полная shape принадлежит
[tier-policy](skills/_shared/references/workflows/tier-policy.md#selected-work-and-retained-results).
Это applicability/evidence для диагностики, не DSH feedback/config API.

Recovery сверяет checkpoint с actual state и partial effects. Завершённую
реализацию не исполняют повторно; сохранённый результат используют для
неизменившейся работы; skipped check не становится unfinished. Неоднозначные
опасные эффекты требуют reconciliation, а не blind replay. Retry accounting
принадлежит host; diagnosis не создаёт новую попытку или дополнительный budget.

Исторические записи без Nav marker читаются по историческим правилам.
Sync не создаёт им фиктивный snapshot и не backfill-ит proof. `/mb-sync`
согласует уже записанные решения/links/RTM, не закрывает задачи самостоятельно.
`/mb-garden` исправляет только однозначные mechanical defects; смысловые и
разрушительные изменения требуют owning decision.

## Доставка и диагностика

Canonical source → temporary repository copy → vendor-shared → direct command
generation → target bootstrap/sync. Source `skills/_shared/` — единственный owner
общих файлов; package-local `shared-*` существуют только во временной копии.
Три package entrypoints (`start`, `mb-init`, `mb-garden`) не являются вторыми
runtime implementations. Прямой `npx skills add` не поддерживается.

```bash
nav_target="$(mktemp -d)"
node scripts/install-framework.mjs --install-only --target "$nav_target/install-only" --yes
node scripts/install-framework.mjs --bootstrap --target "$nav_target/bootstrap" --yes
node scripts/install-framework.mjs --bootstrap --sync --target "$nav_target/bootstrap" --yes
```

Legacy installer создаёт обе поверхности `.agents/skills/` и `.claude/skills/`.
`--bootstrap-only` создаёт Memory Bank без доставки skill-каталогов;
`--bootstrap-only --sync` обновляет только её managed assets.
Полный coherent sync использует `--bootstrap --sync`. Неизвестный skill collision
останавливает перезапись. Existing project-owned Constitution, specs, задачи,
filled protocols и user evidence сохраняются; framework assets обновляются.
Fresh skeleton не создаёт runnable tasks, Foundation queue или accepted design.

Shared workflows/roles/protocol templates/scripts доставляет `init-mb.js`.
Skill-local resources подключены explicit `COMMAND_RESOURCE_SPECS`: все шесть
agent prompts, review packs, recovery и optional design templates имеют владельцев
в target. Source-only `structure-template` и deprecated `deep-questioning`
не являются required runtime references.

`mb-lint` проверяет structural integrity. `mb-doctor` — read-only readiness и
retained selected-work evidence; он не scheduler и не permission engine.
Default допускает пустой skeleton; strict делает applicable gaps ошибками и
требует непустую очередь. Nav completion не требует disabled reports/PASS,
но malformed identity/dependencies и unresolved actual negative evidence остаются
gaps. Historical compatibility не используется для обхода нового Nav contract.

```bash
npm run check:syntax --silent
npm run test:mb-doctor --silent
npm run test:install-sync --silent
```

Эти проверки доказывают semantics/diagnostics/delivery. Исполнение DSH,
Pause/Stop enforcement, native launches и UI требуют отдельной реализации
и проверки после семантической приёмки.

## Все 37 canonical commands

### Вход, контекст и продукт

| Команда | Предметный результат |
| --- | --- |
| [/start](skills/_shared/references/commands/start.md) | Определяет ближайшего незавершённого owner по фактическому состоянию; не запускает цепочку. |
| [/mb-init](skills/_shared/references/commands/mb-init.md) | Возвращает проверенное действие внешнего installer для bootstrap/sync; проверяет реальную доступность после него. |
| [/fill](skills/_shared/references/commands/fill.md) | Read-only загружает достаточный контекст текущей работы. |
| [/context-manifest](skills/_shared/references/commands/context-manifest.md) | Опционально возвращает маршруты к источникам и реальные gaps без нового артефакта. |
| [/find-skills](skills/_shared/references/commands/find-skills.md) | Находит реально доступные capabilities и проверенный origin недостающего skill. |
| [/creator-vibe](skills/_shared/references/commands/creator-vibe.md) | Сохраняет авторский замысел в творческой работе; не создаёт requirements или новые gates. |
| [/grill-me](skills/_shared/references/commands/grill-me.md) | Проясняет неопределённую идею и сохраняет resumable brief. |
| [/constitution](skills/_shared/references/commands/constitution.md) | Владеет принципами, явными non-negotiables и provenance принятых решений. |
| [/write-prd](skills/_shared/references/commands/write-prd.md) | Владеет product intent, scope, acceptance и NFR; новый PRD ведёт к framing, update — к decomposition. |
| [/discuss](skills/_shared/references/commands/discuss.md) | Разрешает ограниченный вопрос на основном пути и возвращает решение его owner. |
| [/map-codebase](skills/_shared/references/commands/map-codebase.md) | Фиксирует as-is baseline без подмены accepted target или создания roadmap. |

### Design, tasking и reviews

| Команда | Предметный результат |
| --- | --- |
| [/spec-init](skills/_shared/references/commands/spec-init.md) | Даёт vocabulary/domain/scenario framing для decomposition без принятия архитектуры. |
| [/prd-to-features](skills/_shared/references/commands/prd-to-features.md) | Создаёт REQ/EP/FT и stable AC; не создаёт задачи или testing policy. |
| [/feature-doctor](skills/_shared/references/commands/feature-doctor.md) | Проверяет основание конкретного semantic finding и определяет первый repair owner. |
| [/spec-design](skills/_shared/references/commands/spec-design.md) | Владеет начальным достаточным SDD design и решением о Foundation. |
| [/spec-redesign](skills/_shared/references/commands/spec-redesign.md) | Меняет accepted shared design с доказанным none/bounded/global impact. |
| [/spec-auto](skills/_shared/references/commands/spec-auto.md) | Применяет autonomous decisions к framing либо дизайну одной продуктовой фичи. |
| [/foundation-to-tasks](skills/_shared/references/commands/foundation-to-tasks.md) | Планирует минимальный FT-000 baseline; verify-existing может подтвердить отсутствие отдельной очереди. |
| [/feature-to-tasks](skills/_shared/references/commands/feature-to-tasks.md) | Планирует или согласует ровно одну продуктовую фичу в полные indexed task cards. |
| [/review-feat-plan](skills/_shared/references/commands/review-feat-plan.md) | Независимо оценивает продуктовую decomposition: APPROVE/REJECT. |
| [/review-tasks-plan](skills/_shared/references/commands/review-tasks-plan.md) | Оценивает meaning, cohesion, identity, dependencies и selected proof задач: APPROVE/REJECT. |
| [/architecture-review](skills/_shared/references/commands/architecture-review.md) | Возвращает bounded read-only architecture assessment вызывающему review. |
| [/kiss-architect](skills/_shared/references/commands/kiss-architect.md) | Применяет Architect policy без смены роли и полномочий. |

### Execution, maintenance и run modes

| Команда | Предметный результат |
| --- | --- |
| [/exe](skills/_shared/references/commands/exe.md) | Реализует одну выбранную runnable task, возвращает actual/partial effects и selected local evidence. |
| [/add-tests](skills/_shared/references/commands/add-tests.md) | Добавляет полезные tests внутри текущего in-progress task scope. |
| [/verify](skills/_shared/references/commands/verify.md) | Независимо проверяет выбранные claims; участники возвращают собственные functional verdicts либо code candidates. |
| [/red-verify](skills/_shared/references/commands/red-verify.md) | Даёт независимый semantic-pass/concern/fail по задаче или T2 feature; не заменяет functional proof. |
| [/debug](skills/_shared/references/commands/debug.md) | Read-only устанавливает task-bound cause/invariant либо INCONCLUSIVE; не добавляет попытку. |
| [/technical-premortem](skills/_shared/references/commands/technical-premortem.md) | Даёт scoped advisory GO/GO_WITH_CONDITIONS/NO_GO, без собственного lifecycle gate. |
| [/tech-debt](skills/_shared/references/commands/tech-debt.md) | Возвращает подтверждённый advisory debt по выбранной поверхности; файл отчёта условен. |
| [/mb-sync](skills/_shared/references/commands/mb-sync.md) | Согласует уже записанные решения и состояние без closure/semantic authority. |
| [/mb-garden](skills/_shared/references/commands/mb-garden.md) | Чинит однозначные links/indexes/routers; semantic/destructive repair возвращает owner. |
| [/mb-doctor](skills/_shared/references/commands/mb-doctor.md) | Read-only проверяет структуру и evidence выбранной работы. |
| [/autopilot](skills/_shared/references/commands/autopilot.md) | Поддерживает выполнение подготовленной продуктовой очереди, исключая FT-000; scheduler принадлежит host. |
| [/autonomous](skills/_shared/references/commands/autonomous.md) | Охватывает accepted product → selected planning → нужную Foundation → product execution; semantic decisions автономны весь run. |
| [/multiagentic](skills/_shared/references/commands/multiagentic.md) | Применяет выбранный Judge overlay к autonomous contract. |
| [/multipilot](skills/_shared/references/commands/multipilot.md) | Применяет выбранный Judge overlay к autopilot contract. |

Маршруты repairs и консультаций: [TRANSITIONS.md](docs/nav27/TRANSITIONS.md).
Карта source ownership: [PROJECT_MAP.md](PROJECT_MAP.md).
License: [MIT](LICENSE).
