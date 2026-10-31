# DevRails Nav 27: каталог переходов и продолжения

Карта первоначально извлечена из `82e3c4f` и сверена с итоговым canonical source
поверх `45ae29e` (2026-11-01).
Она покрывает существующие основные пути, repairs, loops, blockers/resume и
консультации. Это semantic inventory, не граф API и не state machine Nav.
Сопутствующая [карта файлов](SEMANTIC_INVENTORY.md) определяет scope правок.

## Правило чтения каталога

**Штатный** переход означает ближайший путь при достаточном результате и
включённой операции. Отключённая операция пропускается по принятой настройке;
старое слово «required» само по себе не делает её обязательной в Nav.

**Предложение** означает отклонение/repair/дополнительную консультацию:
модель сообщает потребность через общий короткий feedback и, при необходимости,
уточняет причину, вопрос, предложение и цель. В обычном режиме основной поезд
ждёт вопрос/красный. Согласие в основном чате или зелёный разрешает показанное
предложение. В `/autonomous` решение принимается автоматически, но ручные
красный/Pause/Stop сохраняются. Наличие старой repair-ветки не является согласием.

Для консультации без смены операции цель — **текущий owner**, а не искусственный
прыжок к другой станции. Если не хватает фактов пользователя, зелёный не
создаёт отсутствующие сведения. Отказ отменяет предложение; уточнение не
считается согласием. Повторно не спрашивать уже принятое применимое решение.

**Технический blocker** — отсутствующий input/tool/permission, конфликт actual
state, ошибка исполнения. Он требует действительного устранения причины;
autonomous принятие маршрута не делает отсутствующее evidence существующим.
Код владеет запуском/skip/lifecycle/обычными переходами; таблицы не поручают
модели выполнять scheduler-механику.

## 1. Основной путь и альтернативные входы

| ID | Источник | Триггер | Ближайший путь / результат | Решение или input пользователя | Где продолжить |
| --- | --- | --- | --- | --- | --- |
| M01 | [start](../../skills/_shared/references/commands/start.md), [package start](../../skills/start/SKILL.md) | Нет Memory Bank | Проверенный external bootstrap текущим installer | Checkout/target, только если неизвестны | `/start` после фактической установки |
| M02 | [mb-init](../../skills/_shared/references/commands/mb-init.md) | Explicit bootstrap/sync | Bootstrap-only либо coherent full sync; runtime доступность проверяется | Missing checkout или реальный install conflict | `/mb-init`, затем доступный `/start` |
| M03 | [start](../../skills/_shared/references/commands/start.md) | Есть незавершённый durable handoff | Его owner/target имеет приоритет над новой цепочкой | При неоднозначном target — один вопрос | Первая незавершённая операция, не replay всего процесса |
| M04 | [start](../../skills/_shared/references/commands/start.md), [map-codebase](../../skills/_shared/references/commands/map-codebase.md) | Значимый existing code без baseline | Предложить as-is mapping перед новым planning | Разрешение отклонения, если не было явного запроса; PRD/delta при его отсутствии | Возврат invoking owner с baseline и прежним PRD/delta |
| M05 | [grill-me](../../skills/_shared/references/commands/grill-me.md) | Сырая идея, material discovery unknowns | Brief; обсуждение до достаточного общего понимания | Ответы/подтверждение либо automatic decision в autonomous | Constitution, или write-prd при уже принятых principles |
| M06 | [constitution](../../skills/_shared/references/commands/constitution.md) | Governing principles отсутствуют/не определены либо amend requested | Принципы, partial/ratified/skip; не новый product scope | Неурегулированные governing choices или явный skip | `/write-prd`; конфликт — остаться у Constitution owner |
| M07 | [write-prd](../../skills/_shared/references/commands/write-prd.md) | Есть product source, новый PRD | Clarified product intent, acceptance, unresolved issues | Material choices, отсутствующие сведения | `/spec-init` при достаточном результате |
| M08 | [write-prd](../../skills/_shared/references/commands/write-prd.md) | Обновляется существующий PRD | Reconciled PRD delta | Material changed choices | `/prd-to-features`; не безусловный reset всех downstream |
| M09 | [spec-init](../../skills/_shared/references/commands/spec-init.md), [spec-auto --init](../../skills/_shared/references/commands/spec-auto.md) | Нужно decomposition framing | Термины, domain/scenario/lifecycle hints; `ready_for_prd` или конкретный gap | Только unresolved decomposition choice | `/prd-to-features` |
| M10 | [prd-to-features](../../skills/_shared/references/commands/prd-to-features.md) | Clarified product ready | REQ/EP/FT и stable feature AC | Неопределённые decomposition choices | Включённый `/review-feat-plan`, иначе выбранный design/tasking owner |
| M11 | [review-feat-plan](../../skills/_shared/references/commands/review-feat-plan.md) | Review включён, decomposition готова | APPROVE/REJECT с material evidence | Нет для штатного APPROVE | Выбранный design/tasking owner; REJECT → R03 |
| M12 | [spec-design](../../skills/_shared/references/commands/spec-design.md) | Initial technical design нужно | Минимально достаточные accepted boundaries/specs и Foundation decision | Material architecture/Foundation choices | Foundation branch либо one-feature design/tasking |
| M13 | [foundation-to-tasks](../../skills/_shared/references/commands/foundation-to-tasks.md) | Foundation действительно нужен | Минимальные ordinary FT-000 tasks для executable baseline | Новая sufficiency/scope branch → R09 | Выбранные checks и выполнение Foundation, затем product tasking |
| M14 | [foundation-to-tasks --verify-existing](../../skills/_shared/references/commands/foundation-to-tasks.md) | Brownfield baseline уже есть | Доказанный baseline → no queue; недостаточно evidence → минимальные probes | Выбор добавочного proof work/изменения baseline через общий decision flow | `/feature-to-tasks` либо завершение Foundation |
| M15 | [spec-auto FT](../../skills/_shared/references/commands/spec-auto.md), [feature-to-tasks](../../skills/_shared/references/commands/feature-to-tasks.md) | Одна product feature готова к design/tasking | Canonical concern coverage, cohesive indexed tasks, usable handoff | Material choices/slicing consultation при необходимости | Включённый task-plan review, иначе execution readiness |
| M16 | [review-tasks-plan](../../skills/_shared/references/commands/review-tasks-plan.md), [architecture-review](../../skills/_shared/references/commands/architecture-review.md) | Включён planning review | Final APPROVE/REJECT; architecture review возвращает свой bounded result caller | Unresolved choice → общий вопрос/repair | Применимый enabled doctor/optional pre-mortem/`exe` |
| M17 | [exe](../../skills/_shared/references/commands/exe.md) | Выбрана runnable task | Реализация ровно выбранного исхода, actual result/change surface | Новая semantic/scope branch → R13–R17 | Enabled verification, иначе closure с явным skipped |
| M18 | [verify](../../skills/_shared/references/commands/verify.md), [tier policy](../../skills/_shared/references/workflows/tier-policy.md) | Есть enabled verify participants | Собственные functional verdicts/evidence или code-only candidates; без hidden main | Decision gap → R18–R20 | Enabled semantic review либо closure |
| M19 | [red-verify](../../skills/_shared/references/commands/red-verify.md) | Semantic review включён для task/feature, независимо от verify | semantic-pass/concern/fail | Material interpretation/repair decision → R21 | Closure/completion либо repair proposal |
| M20 | [mb-sync](../../skills/_shared/references/commands/mb-sync.md), [sync workflow](../../skills/_shared/references/workflows/mb-sync.md) | Состояние/документы действительно требуют согласования | RTM/feature/index/links согласованы с фактическим исполнением/проверками | Consistency gap → R28 | Следующая задача/feature/завершение; post-sync checks только включённые |
| M21 | [autopilot](../../skills/_shared/references/commands/autopilot.md) | Подготовленная product queue | Продолжение/выполнение выбранных задач и terminal outcome | Нестандартные решения по общему механизму | Следующий разрешённый unfinished task/boundary |
| M22 | [autonomous](../../skills/_shared/references/commands/autonomous.md) | End-to-end работа поручена автономно | Те же предметные операции с автоматическим принятием решений | Отсутствующие факты/внешние constraints не выдумывать; manual stops действуют | Сохранённая незавершённая операция |
| M23 | [multiagentic](../../skills/_shared/references/commands/multiagentic.md), [multipilot](../../skills/_shared/references/commands/multipilot.md) | Выбран workflow с Judge | End-to-end либо prepared queue; включённый Judge даёт route assessment | См. J01–J05 | Тот же main workflow, без второго scheduler |

При выключенных review/verify/doctor ветка не должна требовать отсутствующий
отчёт или APPROVE/PASS из неё. Если реализация завершена и проверок нет,
task может быть `done`, но feature/REQ evidence не становится `verified`.
`done_for_prod` означает оставшуюся production acceptance, а не выполненный deploy.

## 2. Product/design/planning repairs и консультации

| ID | Источник / триггер | Что предложить и кому | Что нужно для решения | Resume |
| --- | --- | --- | --- | --- |
| R01 | [write-prd input](../../skills/_shared/references/commands/write-prd.md): нет source; [map-codebase handoff](../../skills/_shared/references/commands/map-codebase.md): mapping завершён без PRD/delta | Получить source либо `/grill-me`; mapping сам roadmap не создаёт | Product input; уже переданный источник повторно не запрашивать | `/write-prd` |
| R02 | [constitution](../../skills/_shared/references/commands/constitution.md), [write-prd](../../skills/_shared/references/commands/write-prd.md): governing conflict/amendment | Изменение Constitution у её owner либо уточнение PRD в принятой границе | Принцип, конфликт, конкретное предложение и последствия | Constitution → write-prd; сохранять готовые независимые материалы |
| R03 | [review-feat-plan](../../skills/_shared/references/commands/review-feat-plan.md): REJECT | Первый owner: write-prd для target/AC, prd-to-features для decomposition, spec-init для framing, feature-doctor для local finding, constitution для governance | Material evidence, вопрос при необходимости, предложение repair | После repair — включённый re-review той же поверхности |
| R04 | [spec-init](../../skills/_shared/references/commands/spec-init.md): glossary/scenario/domain значение влияет на cuts | Консультация на месте либо write-prd/discuss по владельцу | Реальное значение/actor/lifecycle/сценарий, не формальный review существования файла | spec-init → decomposition |
| R05 | [prd-to-features](../../skills/_shared/references/commands/prd-to-features.md): решение меняет PRD scope/behavior/acceptance | Возврат `/write-prd`; decomposition-only decision остаётся у текущего owner | Принять конкретную product delta | Decomposition после обновления governing source |
| R06 | [feature-doctor](../../skills/_shared/references/commands/feature-doctor.md): cited/current semantic finding | Проверить governing basis и первый artifact, который действительно должен измениться | Accepted intent, findings/evidence, viable proposal; не full feature audit | Product/REQ/pass-fail → write-prd; feature/task/proof → feature-to-tasks; shared/global → spec-redesign; implementation-only → caller |
| R07 | [spec-design](../../skills/_shared/references/commands/spec-design.md): brownfield без credible baseline | Предложить map-codebase, принять PRD-only drift risk либо ограничить локальный delta | Выбор с последствиями, если accepted scope ещё не решает вопрос | Возврат spec-design с baseline/принятой границей |
| R08 | [spec-design](../../skills/_shared/references/commands/spec-design.md), [SDD contract](../../skills/_shared/references/workflows/sdd-design-contract.md): material target/boundary/storage/security/style choice | Содержательное architecture proposal текущего owner; поздняя shared change — spec-redesign | Принятое решение, достаточные факты; KISS preference не притворяется user answer | Незавершённый design, затем ближайший tasking путь |
| R09 | [foundation-to-tasks](../../skills/_shared/references/commands/foundation-to-tasks.md): baseline sufficiency/anchors/pressure меняются | Нет начального design → spec-design; accepted Foundation change → spec-redesign | Что должно быть executable/proven, основание изменения | Foundation planning либо product tasking если Foundation не нужен |
| R10 | [feature-to-tasks](../../skills/_shared/references/commands/feature-to-tasks.md): product target/REQ/AC gap либо ambiguous feature semantics | write-prd / prd-to-features / feature-doctor по первому owner | Target или decomposition decision; не сочинять missing requirement в task | Tasking той же feature после owning repair |
| R11 | [feature-to-tasks](../../skills/_shared/references/commands/feature-to-tasks.md): existing queue требует identity/tier/wave/dependency/AC/material-scope changes | `rebuild_required`: controlled rebuild/split вместо тихой замены существующего task | Конкретный rebuild proposal, сохранивший историю и partial changes | Обновлённая tasking surface, включённый review, новая/repaired task |
| R12 | [spec-redesign](../../skills/_shared/references/commands/spec-redesign.md), [planning-redesign boundary](../../skills/_shared/references/workflows/execute-loop.md#planning-redesign-boundary): accepted design delta | `none`: prior owner; `bounded`: affected features; `global`: вся действительно затронутая product planning surface | Разрешение предлагаемого возврата/repair; не считать shared filename доказательством global impact | spec-auto FT если design нужно, иначе feature-to-tasks; включённые reviews только affected surfaces |
| R12a | Те же источники: влияние design delta не доказано | Консультация/evidence gathering у spec-redesign; не default global reset | Какие consumers/semantics меняются | Тот же spec-redesign, revision не повышать на догадке |
| R12b | [review-tasks-plan](../../skills/_shared/references/commands/review-tasks-plan.md): semantic REJECT | Feature-doctor triage когда repair owner не установлен; schema/index/missing undisputed artifact → прямой owner | Finding, evidence, предложенный owner/repair | Включённый re-review той же feature |
| R12c | [review-tasks-plan](../../skills/_shared/references/commands/review-tasks-plan.md): material архитектурная неопределённость | Условный architecture-review / Architect consultation | Конкретная граница и evidence; не автоматически новый ADR | Caller task-plan review сохраняет final verdict ownership |

Старое требование всегда прогонять semantic finding через feature-doctor
инвентаризировано, но не переносится как неизменяемый дополнительный gate.
Сохранить его ценность: repair следует принятому product intent, а не только
внутренне согласованной downstream spec.

## 3. Исполнение, проверки, diagnosis и локальные loops

| ID | Источник / триггер | Что предложить и кому | Что нужно для решения | Resume |
| --- | --- | --- | --- | --- |
| R13 | [exe preflight](../../skills/_shared/references/commands/exe.md): missing/malformed/unindexed task, incompatible schema, no target, unmet dependency | Tasking/repair owner; вернуть корректную task identity/context | Target или исправленный authoritative record, не rewrite статуса ради запуска | Тот же выбранный executable task |
| R14 | [exe](../../skills/_shared/references/commands/exe.md), [tier policy](../../skills/_shared/references/workflows/tier-policy.md): фактический higher tier | Controlled rebuild/split через feature-to-tasks | Original/required tier, trigger, partial changes/evidence и concrete proposal | Replacement task после применимых включённых checks |
| R15 | [exe](../../skills/_shared/references/commands/exe.md): hard write boundary/forbidden scope/side-effect authority нарушается или требуется расширение | Остановить затронутую работу; owning plan/spec/operator decision | Требуемое расширение, фактически затронутое и safe partial state | После accepted boundary repair; DSH permission отдельно остаётся действительным |
| R16 | [exe](../../skills/_shared/references/commands/exe.md): local graph drift, uncovered consumers, stale plan/revision | Local tasking repair либо shared spec-redesign | Evidence влияния на selected task; не превращать missing disabled review в drift | Та же feature/task после содержательного reconcile |
| R17 | [exe operator decisions](../../skills/_shared/references/commands/exe.md): новый product/API/state/security/compatibility/proof branch | Feature-doctor, feature-to-tasks, write-prd либо spec-redesign по действительному owner | Exact decision + последствия + предложение | Первая незавершённая task операция после owner update |
| R18 | [verify](../../skills/_shared/references/commands/verify.md): missing execution/evidence, unsafe proof, conflicting interpretation | NEEDS-CLARIFICATION для выполненной проверки; evidence owner либо semantic repair owner | Каких фактов/решений не хватает, предложенный route | Тот же enabled verify после устранения причины |
| R19 | [verify](../../skills/_shared/references/commands/verify.md): proved task-local implementation FAIL | Correction на той же задаче при прежнем accepted scope либо debug | Evidence-backed correction proposal; бюджет/безопасность повтора учитывает код | exe correction → enabled checks, не ручное проставление PASS |
| R20 | [verify](../../skills/_shared/references/commands/verify.md): apparent downstream violation может требовать feature/design change | Feature-doctor triage, затем соответствующий planning owner | Governing product basis и actual observed failure | Owner repair → affected enabled checks |
| R21 | [red-verify](../../skills/_shared/references/commands/red-verify.md): semantic-concern/fail | Concern — decision/evidence consultation; fail — repair по proved defect; без благоприятного переосмысления target | Exact question/defect, impact на closure/dependents, proposal | Implementation correction либо feature/task/spec repair, затем applicable enabled verification |
| R22 | [autonomy policy](../../skills/_shared/references/workflows/autonomy-policy.md#scheduler-failure-handling): failure с безопасной bounded correction | Предложить same-task retry внутри настроенного budget | Fixed task identity/outcome/scope, безопасный повтор, correction basis | Новый attempt exe; выполненные старые findings не стираются |
| R23 | [autopilot diagnostic recovery](../../skills/_shared/references/commands/autopilot.md), [debug](../../skills/_shared/references/commands/debug.md): cause/disposition не доказаны | Fresh bounded diagnosis | Текущий failure/attempt/change surface; permission для реального probe если нужна | Confirmed → correction/owner; inconclusive → evidence/decision owner |
| R24 | [debug handoff](../../skills/_shared/references/commands/debug.md): confirmed сложная/multi-surface correction | Optional technical-premortem; простая correction → exe | Разрешение дополнительного advisory шага, если не выбран настройкой/запросом | Pre-mortem → exe либо named repair owner |
| R25 | [debug](../../skills/_shared/references/commands/debug.md): repeated_confirmed material mechanism | Минимальная prevention мера через настоящий owner | Доказанный повтор причины/нарушенного invariant и цена меры | В текущем task только внутри accepted scope; иначе нормальный planning route |
| R26 | [technical-premortem](../../skills/_shared/references/commands/technical-premortem.md): GO / GO_WITH_CONDITIONS / NO_GO | GO → original execution; conditions/NO_GO → один actual owner/action | Решение по материальному условию/unknown, не speculative risk checklist | Тот же task если accepted scope прежний; иначе repaired plan |
| R27 | [add-tests](../../skills/_shared/references/commands/add-tests.md): полезный regression proof в текущем task | Scoped test work; out-of-scope behavior/policy → feature/task/shared owner | Дополнительная test операция или material scope decision | Исходный exe/verify/caller, без synthetic testing lifecycle |
| R27a | [autonomy policy](../../skills/_shared/references/workflows/autonomy-policy.md): safe retry невозможен / бюджет исчерпан | Evidence-based blocked или failed; existing owner/follow-up proposal | Scope/authority gap либо failure disposition и next owner | Repair/normal follow-up planning; без скрытого расширения budget |
| R27b | [feature-to-tasks](../../skills/_shared/references/commands/feature-to-tasks.md), [exe](../../skills/_shared/references/commands/exe.md): осталась production acceptance | Отделить development completion от production remainder | Реальный production input/permission; не считать auto mode blanket production consent | Тот же accepted production remainder/финальная acceptance task |

Локальный цикл реализации и проверки возвращается к той же задаче/месту
implementation. Нестандартный выбор correction, debug, redesign или иной
route использует общий decision flow. Обычный повтор уже разрешённой операции
не требует выдуманного нового user approval, но сохраняет ручные остановки.
Budget задаётся эффективной политикой; диагностика не расходует execution attempt
и не даёт дополнительную попытку.

## 4. Maintenance, installation и вспомогательные консультации

| ID | Источник / триггер | Что предложить и кому | Что нужно | Resume |
| --- | --- | --- | --- | --- |
| R28 | [mb-sync](../../skills/_shared/references/commands/mb-sync.md), [workflow](../../skills/_shared/references/workflows/mb-sync.md): owner decision отсутствует/contradictory state | Вернуть actual closure/planning/design owner, не выбрать трактовку при sync | Принятое состояние/решение и evidence; disabled evidence не gap | Незавершённое согласование после owner repair |
| R29 | [mb-sync workflow](../../skills/_shared/references/workflows/mb-sync.md): stale linked design/needed-before-tasks | Feature tasking либо spec-redesign по границе | Material affected claim/owner, не cosmetic link churn | Sync после owning repair |
| R30 | [mb-garden](../../skills/_shared/references/commands/mb-garden.md): однозначные links/index/router defects | Bounded mechanical repair внутри уже порученного maintenance | Новое решение не нужно для штатного разрешённого ремонта | Current garden; final applicable check и caller |
| R31 | [mb-garden](../../skills/_shared/references/commands/mb-garden.md): archive/delete/merge/canonical choice/TODO→task/governance | Owner consultation; constitution/spec-redesign/feature-to-tasks по смыслу | Конкретное предложение и область изменения | Owner route, затем garden только если ещё нужен |
| R32 | [mb-garden](../../skills/_shared/references/commands/mb-garden.md): broad accepted-state reconciliation | Отдельный mb-sync | Применимое accepted owner state | Sync → caller |
| R33 | [mb-garden](../../skills/_shared/references/commands/mb-garden.md), [find-skills](../../skills/_shared/references/commands/find-skills.md): устаревший generated runtime / missing framework reference | Coherent installer sync | Проверенный checkout и target; collision с user-owned files не auto-delete | Исходная операция после восстановления deployed contract |
| R34 | [find-skills](../../skills/_shared/references/commands/find-skills.md): proven external package / unknown origin | Proven external — install proposal; unknown — evidence/clarification, не угадывать | Package identity, принятое install действие и host permissions | Исходная операция, если capability реально стала доступна |
| R35 | [mb-doctor](../../skills/_shared/references/commands/mb-doctor.md), [doctor modules](../../skills/mb-garden/assets/mb-doctor/AGENTS.md) | Diagnostic finding | Mechanical owner либо product/design/task/evidence owner по finding; doctor сам не чинит | Причина, paths, применимость проверки, конкретный repair proposal | Проверенный repaired boundary; не automatic full restart |
| R36 | [recovery-plan](../../skills/_shared/references/recovery-plan.md) | Cosmetic / structural / lost MB | Cosmetic → garden; structural → map-codebase и reconciliation; missing → verified bootstrap и restore useful project facts | Archive/destructive reconstruction требуют actual решения; threshold/time из старого reference не основание | Первый достоверно незавершённый owner, без безусловного replay |
| R37 | [fill](../../skills/_shared/references/commands/fill.md), [context-manifest](../../skills/_shared/references/commands/context-manifest.md) | Context gaps / competing authority / read budget | Direct evidence route либо bounded Explorer по необходимости | Actual missing target/fact/authority decision | Исходный owner, manifest не становится gate/artifact |
| R38 | [discuss](../../skills/_shared/references/commands/discuss.md) | Material question при неизменном маршруте | Консультация на главном пути; durable answer у owner | Ответ/согласие с конкретным решением; green не отвечает неизвестные факты | Тот же owner до обычного следующего шага |
| R39 | [kiss-architect](../../skills/_shared/references/commands/kiss-architect.md) | Архитектурный proposal/preflight нужен | Bounded KISS reasoning без смены роли; accepted edits только через owner | Новый material choice → общий запрос | Активная design/task операция |
| R40 | [tech-debt](../../skills/_shared/references/commands/tech-debt.md) | Explicit bounded debt review либо включённый wave option | Advisory report, без auto tasks/gates | Сам finding не требует нового решения/действия; adoption — отдельный owner proposal | Caller продолжает; отсутствие report не превращается в failure проверки |

`recovery-plan.md` доступен в установленном mb-garden; все шесть agent prompts
доставляются своим command owners. Availability не разрешает archive/rebuild
или запуск дополнительного участника без общего decision flow/selected работы.

## 5. Judge и независимые reviewers

| ID | Источник / триггер | Предметный результат | Решение / продолжение Nav |
| --- | --- | --- | --- |
| J01 | [Judge overlay](../../skills/_shared/references/workflows/multiagents_with_judge.md#autonomous-with-judge): Foundation decision до tasking; подготовленная product queue до execution | Route assessment с evidence | Только при enabled/requested Judge; не новый unconditional gate |
| J02 | [Judge overlay](../../skills/_shared/references/workflows/multiagents_with_judge.md#autopilot-with-judge): retry verification; wave boundary | Проверка progress/route, repeated patterns | Штатная consultation может быть выбранной операцией; необычное предложение маршрута требует общего решения |
| J03 | Те же источники: second REJECT, contradictory evidence, owning-layer drift, no progress, materially different recovery | SUPPORT / REDIRECT / ESCALATE_OPERATOR | SUPPORT не заменяет user permission; REDIRECT — предложение, не запуск; disagreement/ESCALATE — вопрос основного пути |
| J04 | [judge role](../../skills/_shared/references/roles/judge.md): конкретная просьба пользователя | Bounded read-only assessment | После результата исходный main owner; не заставлять Judge менять lifecycle |
| J05 | [multiagentic](../../skills/_shared/references/commands/multiagentic.md), [multipilot](../../skills/_shared/references/commands/multipilot.md): Judge/base contract/session недоступны | Concrete unavailable-capability gap и repair/change proposal | Нужна реальная availability repair либо решение изменить enabled route; не compulsory immutable model/session |
| J06 | [finding-adjudication](../../skills/_shared/references/semantic-packs/finding-adjudication.md), [review-code](../../skills/_shared/agents/review-code.md) | Candidate findings независимых enabled участников | Не голосование, не самостоятельный repair launch; отключённый main reviewer не должен порождать скрытый обязательный main launch |
| J07 | [web-design-reviewer](../../skills/_shared/references/semantic-packs/web-design-reviewer.md) | Rendered UI evidence при доступных route/browser/safe state | Возврат active verifier, без нового workflow и неизбежной browser ceremony |

Модель, reasoning, число участников и доступность определяются выбранной
конфигурацией DSH. Старые Luna/Sol pins, retry-once правила запуска и один
незаменяемый Judge не являются семантическими основаниями этих переходов.

## 6. Recovery и code-owned действия, извлечённые из старых prompts

Эти правила полезны как требования к продолжению, но не как инструкция модели
пошагово выполнять scheduler. Источники:
[autopilot recovery](../../skills/_shared/references/commands/autopilot.md),
[autonomy checkpoint](../../skills/_shared/references/workflows/autonomy-policy.md#durable-run-checkpoint),
[exe attempt](../../skills/_shared/references/commands/exe.md),
[autonomous Foundation resume](../../skills/_shared/references/commands/autonomous.md).

| Ситуация | Сохранить смысл | Продолжение / решение |
| --- | --- | --- |
| Checkpoint указывает task/stage, но task/evidence уже дальше | Durable task и observable result сильнее устаревшего checkpoint | Первая фактически незавершённая операция, не blind replay |
| Выполнение подготовлено, но ещё не начато | Подготовка контекста не означает реализацию | Начать selected task при действующем разрешении |
| Реализация оборвана | Осмотреть сделанное, current attempt/evidence, partial effects | Продолжить фактическое состояние; ambiguous unsafe effect → основной вопрос/evidence owner |
| Exe handoff уже завершён | Не исполнять снова ради новой сессии | Enabled следующая проверка либо skipped/closure |
| Verify уже завершён | Reuse действительный результат той же работы | Следующий enabled semantic/closure шаг; не повторять без changed evidence |
| Проверка была отключена | Отсутствующий отчёт ожидаем; skipped не означает unfinished verify | Не включать её на recovery автоматически |
| Task уже закрыта, wave sync/feature review не завершены | Closure не доказывает завершение boundary work | Продолжить только реально выбранную оставшуюся boundary operation |
| Диагностика завершена для current attempt/change surface | Результат пригоден как supporting evidence | Принятое correction/disposition предложение; debug не добавляет попытку |
| Report action мог завершиться до обрыва | Не плодить второй artifact лишь из-за потери сообщения | Сверить durable report; для advisory недоступности честно отметить её |
| Несколько stranded in_progress | Не выбирать новую задачу, забыв незавершённую | Reconcile unfinished work; конкретный sequencing реализуется кодом |
| Нет runnable task | Различать blocked/failed, missing accepted decision, exhausted dependency graph, всё завершено | Сохранить конкретную причину/owner, не заменять всякий halt на deadlock |
| Foundation extension возникла в product phase | Не выполнять её как неявный product task | Принять возврат Foundation owner, сохранить product state, затем продолжить product |
| Side session недоступна / основной процесс перезапущен | Memory Bank позволяет дать контекст новой DSH-сессии | Не обещать точный resume прежнего сетевого запроса; схема session management вне этого этапа |
| Manual red/Pause/Stop | Согласие с route не снимает независимую ручную остановку | Продолжение лишь после соответствующего разрешения пользователя; не агентным self-consent |

Сохранённые предметные vocabularies:

- Task lifecycle: `planned`, `ready`, `in_progress`, `blocked`, `done`,
  `done_for_prod`, `failed` в indexed JSON records.
- Run terminal reasons: `SUCCESS`, `HALT_BLOCKING_QUESTIONS`,
  `HALT_CLARIFICATION_REQUIRED`, `HALT_REVIEW_REJECT`, `HALT_FAILURE_BUDGET`,
  `HALT_DEPENDENCY_DEADLOCK`, `HALT_POLICY_VIOLATION`, `HALT_QUALITY_GATES`,
  `HALT_BUDGET_EXCEEDED`.
- Planning: feature `complete/not_required/blocked`, clarification
  `pending/complete/blocked`, redesign `none/bounded/global`,
  `PLANNING_RECONCILIATION_REQUIRED`, positive Planning Revision когда она записана.
- Verdicts: review `APPROVE/REJECT`; architecture Reviewer
  `APPROVE/REQUEST_CHANGES/OWNER_DECISION_NEEDED`; functional
  `PASS/FAIL/NEEDS-CLARIFICATION`; semantic
  `semantic-pass/semantic-concern/semantic-fail`; diagnostic
  `CONFIRMED/INCONCLUSIVE`; advisory pre-mortem
  `GO/GO_WITH_CONDITIONS/NO_GO`.

Это существующие носители смысла, а не требование перенести все строки в новый
flow-feedback. Их предметное различие нужно сохранить там, где операция
исполняется. Новое `skipped` относится к невыполненной операции; оно не
добавляется автоматически в task lifecycle и не маскируется под PASS.

## 7. Контроль полноты миграции по каталогу

Итоговая приёмка сверяет следующие пути по canonical/deployed instructions
(фактические проверки и verdict — в [SEMANTIC_ACCEPTANCE.md](SEMANTIC_ACCEPTANCE.md)):

1. Greenfield от raw idea и от уже ясного PRD; brownfield с baseline и без него;
   не переспрашивается уже полученный input.
2. Main-only, secondary-only и all-off verification; red off; no reports для
   disabled checks; done без PASS честно отделён от verified acceptance.
3. Включённый review REJECT → owner repair → re-review; отключённый review не
   вызывает missing-APPROVE blocker. Обнаруженный FAIL не становится skipped.
4. Product/REQ question, local feature/task repair, shared redesign, Foundation
   change, implementation-only retry, debug и evidence gap имеют разные owners
   и одно правило разрешения отклонений.
5. Consultation без смены маршрута останавливает основной путь до решения;
   в обычном режиме source ветки не является согласием; autonomous не блокируется
   старым «не может принимать решения», но соблюдает ручные stops.
6. Возврат к PRD/spec/task owner сохраняет код, history и unaffected work;
   нет автоматического сброса всей последующей цепочки.
7. После interruption продолжение следует actual state, включая skipped checks,
   а не наличию пяти файлов или потерянной сессии; нет повторного unsafe effect.
8. Проверить, что используемый owner/reference доступен в target, а validator
   не требует исключённый artifact/verdict. Это связывает маршруты с
   [кодовым inventory](SEMANTIC_INVENTORY.md#6-исполняемые-validators-и-generator).

Рабочие defaults после пакета 3: red-verify независим от functional verify и
честно обозначает отсутствие functional proof; local exe checks отдельно
configurable/default on. Это не ответы пользователя на optional уточнения.
Полученный negative результат требует scoped repair/continue disposition,
сохраняя user/autonomous provenance. Code-only result не functional PASS.

Новые task attempts сохраняют selected work в existing `task.verify` с
`stage: workflow`; protocols default `[]`. Recovery/diagnostics используют
выбор соответствующей работы, не live settings для переоценки evidence. Пока
операция/участник не запущены и skip не записан, host обновляет их план в той же
attempt без повторного exe/approval. Запуск фиксирует только соответствующую
работу: local checks входят в exe, будущие verify/red остаются изменяемыми.
Disabled global design не требует revision;
если shared delta меняется без recorded revision, reconcile только affected
features существующим marker. Optional Foundation proof не отменяет actual
baseline dependencies. Исторические результаты и partial effects сохраняются.
