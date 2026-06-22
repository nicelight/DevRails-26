# BUGFIXES

Консолидированный список рисков, найденных read-only анализом workflow, упаковки, оркестрации и KISS-практичности. Исправления в рамках этого отчета не выполнялись.

## P0 / High

### 1. Single-skill install может быть сломан для `cold-start` / `mb-init`

- Источники: `README.en.md:268`, `skills/_shared/scripts/init-mb.js:30`, `skills/_shared/scripts/init-mb.js:211`, `skills/_shared/scripts/init-mb.js:222`
- Проблема: README рекомендует устанавливать отдельные skills, включая `cold-start` и `mb-init`, но `init-mb.js` всегда копирует `mb-lint.mjs` и `mb-doctor.mjs`, а ищет их рядом с установленным `mb-garden/assets` или в `assets` текущего skill. При установке только `mb-init` или `cold-start` sibling `mb-garden` может отсутствовать.
- Влияние: пользователь может поставить один рекомендуемый skill, а bootstrap упадет.
- Минимальное направление: сделать `mb-init` / `cold-start` self-contained для runtime scripts, явно enforce-ить зависимость от `mb-garden`, либо не копировать doctor/lint как обязательный шаг при single-skill bootstrap.

### 2. CI не ловит single-skill install regression

- Источники: `.github/workflows/release-check.yml:60`, `.github/workflows/release-check.yml:141`
- Проблема: release check проверяет только `--skill '*'`, а dry bootstrap запускает source script напрямую, не installed `mb-init` / `cold-start` в одиночку.
- Влияние: критичный install path из README может быть сломан при зеленой CI.
- Минимальное направление: добавить smoke matrix для `--skill mb-init` и `--skill cold-start`, затем запускать installed `scripts/shared-init-mb.js` в target repo.

### 3. `/autonomous` конфликтует с интерактивным `/clarify`

- Источники: `skills/_shared/references/commands/prd.md:114`, `skills/_shared/references/commands/clarify.md:112`, `skills/_shared/references/commands/autonomous.md:83`
- Проблема: `/prd` всегда создает features с `clarification_status: pending`, `/autonomous` требует complete, а `/clarify` задает вопросы по одному и не должен выдумывать product decisions.
- Влияние: обещанный unattended `PRD -> done` часто остановится сразу после PRD на `HALT_CLARIFICATION_REQUIRED`.
- Минимальное направление: явно описать precondition для `/autonomous`, что PRD должен быть достаточно детализирован для auto-clarify без вопросов, либо позиционировать `/autonomous` как run до первого blocking gap.

### 4. Порядок scheduler -> `/mb-sync` -> final status неоднозначен

- Источники: `skills/_shared/references/commands/autonomous.md:185`, `skills/_shared/references/commands/autopilot.md:89`, `skills/_shared/references/commands/mb-sync.md:13`
- Проблема: `/mb-sync` требует уже существующее closure/failure/blocking decision, но `/autonomous` и `/autopilot` местами ставят `/mb-sync` до финальной записи task status.
- Влияние: после context loss непонятно, authoritative state уже записан в JSON record или только был принят в контексте scheduler.
- Минимальное направление: выбрать один порядок. KISS-вариант: scheduler пишет status/decision/evidence в `.task.json`, затем `/mb-sync` только отражает уже записанное.

### 5. T3 human checkpoint может быть самосертифицирован агентом

- Источники: `skills/_shared/references/workflows/tier-policy.md:56`, `skills/_shared/references/commands/autonomous.md:181`, `skills/_shared/references/commands/red-verify.md:97`
- Проблема: marker `HUMAN_CHECKPOINT: done` обязателен, но не определено, кто имеет право его писать и как unattended mode должен останавливаться при его отсутствии.
- Влияние: autonomous agent может формально поставить human marker сам, что ломает смысл T3 gate.
- Минимальное направление: определить authority: только явное human/user/direct approval может писать marker; autonomous scheduler должен halt с отдельным terminal state.

### 6. Fresh skeleton слишком большой для практического default workflow

- Источники: `README.en.md:114`, `README.ru.md:114`, `skills/_shared/scripts/init-mb.js:461`
- Проблема: bootstrap сразу создает много директорий и артефактов: `contracts`, `states`, `runbooks`, `quality`, `testing`, `skills`, `schemas`, `tasks/plans`, `agents`, `bugs`, `.tasks`, `.protocols`, proxy skills и runtime scripts.
- Влияние: простая задача превращается в обслуживание большой структуры.
- Минимальное направление: сделать minimal skeleton дефолтом, а richer/normative/autonomous слои создавать лениво по команде или при первом использовании.

### 7. “Optional richer inputs” фактически обязательны в task schema

- Источники: `skills/_shared/scripts/init-mb.js:54`, `skills/_shared/references/commands/prd-to-tasks.md:169`, `skills/_shared/references/structure-template.md:410`
- Проблема: `source_artifacts`, `normative_inputs`, `constraints`, `invariants`, `verification_targets` описаны как richer/optional, но schema и lint требуют их в каждом task record.
- Влияние: появляется пустой boilerplate и риск формального заполнения без смысла.
- Минимальное направление: оставить обязательными только базовые поля task record; richer fields сделать optional или сгруппировать в optional `context`.

### 8. T2/T3 protocol burden чрезмерен

- Источники: `README.en.md:176`, `README.ru.md:176`, `skills/_shared/references/commands/execute.md:58`, `skills/_shared/references/commands/mb-doctor.md:50`
- Проблема: любой T2/T3 требует 5 protocol files, verification, red-verification, evidence, handoff; T3 еще exact markers.
- Влияние: обычное cross-module изменение получает heavy process overhead.
- Минимальное направление: сделать `run.md` универсальным дефолтом для T0-T2; full protocol включать для long-running, autonomous, T3 или явно requested tasks.

### 9. `/autonomous` перегружен gates/reviews

- Источники: `skills/_shared/references/commands/autonomous.md:29`, `skills/_shared/references/commands/autonomous.md:120`, `skills/_shared/references/commands/autonomous.md:141`, `skills/_shared/references/commands/autonomous.md:202`
- Проблема: full run требует run protocol, PRD review, task-planning review, lint+doctor, repeated strict doctor before selection and after sync, wave review, final review.
- Влияние: команда похожа на тяжелый scheduler/CI spec, а не на KISS workflow.
- Минимальное направление: strict autonomous оставить advanced profile; default autonomous упростить до preflight, execution loop и final gate.

### 10. `npm run vendor:shared` является footgun для source-only invariant

- Источники: `package.json:9`, `scripts/vendor-shared.mjs:35`, `README.en.md:442`
- Проблема: `vendor:shared` пишет generated `shared-*` прямо в `skills/<skill>/{agents,references,scripts}`, хотя source-only модель запрещает коммитить generated copies.
- Влияние: разработчик может случайно загрязнить рабочее дерево generated files.
- Минимальное направление: сделать in-place vendoring явным флагом вроде `--in-place`, а обычный путь оставить через temp wrapper, либо убрать npm script из публичного workflow.

## P1 / Medium

### 11. `mb-init` manual instructions перечисляют неполный command set

- Источники: `skills/mb-init/SKILL.md:49`, `README.en.md:73`, `README.ru.md:73`, `skills/_shared/scripts/init-mb.js:382`
- Проблема: `mb-init/SKILL.md` не включает часть command stubs (`cold-start`, `mb-sync`, `mb-garden`, `mb-doctor`, `mb-harness`), хотя generator создает полный набор из templates.
- Влияние: ручной bootstrap может получить неполный workflow и застрять на sync/readiness gates.
- Минимальное направление: не держать ручной список; ссылаться на `skills/_shared/references/commands/*.md` как authoritative set или синхронизировать список.

### 12. `--delta` mode упоминается, но не определен

- Источники: `README.en.md:338`, `README.ru.md:338`, `skills/_shared/references/commands/prd.md:38`, `skills/_shared/references/commands/brief.md:31`
- Проблема: brownfield flow рекомендует `/brief --delta` или `/prd --delta`, но command specs не описывают аргумент `--delta` и его semantics.
- Влияние: после `/map-codebase` пользователь получает несуществующий или неоднозначный режим.
- Минимальное направление: добавить короткий delta-mode contract в `/brief` и `/prd`, либо убрать флаг и писать “run `/prd` with baseline as context”.

### 13. Docs First конфликтует с `/execute` non-ownership

- Источники: `skills/cold-start/SKILL.md:47`, `skills/_shared/references/commands/execute.md:121`
- Проблема: `cold-start` говорит “Update Memory Bank, then change code / commit”, а `/execute` говорит implement -> gates -> evidence -> handoff и never runs `/mb-sync`.
- Влияние: исполнитель может обновить docs до фактической реализации или, наоборот, оставить sync без владельца.
- Минимальное направление: формулировать как “после meaningful implementation/evidence синхронизировать MB перед commit/closure”.

### 14. `mb-init` предлагает standalone-copy путь, который конфликтует с `init-mb.js`

- Источники: `skills/mb-init/SKILL.md:87`, `skills/_shared/scripts/init-mb.js:237`
- Проблема: skill предлагает скопировать `shared-init-mb.js` и запустить standalone, но сам script требует соседние vendored references/assets и пишет “do not copy it standalone”.
- Влияние: пользователь может следовать documented path и получить ошибку missing references/assets.
- Минимальное направление: убрать standalone-copy инструкцию или заменить на запуск script из установленного skill package.

### 15. Install workflow зависит от latest `skills` CLI

- Источник: `scripts/install-framework.mjs:67`
- Проблема: wrapper вызывает `npx -y skills add ...` без version pin.
- Влияние: upstream изменение `skills` CLI может сломать install/CI без изменения репозитория.
- Минимальное направление: закрепить версию `skills` CLI через dependency или `npx -y skills@<version>`.

### 16. Shared workflow `mb-sync.md` без frontmatter

- Источники: `skills/_shared/references/workflows/mb-sync.md:1`, `skills/_shared/references/commands/mb-sync.md:9`
- Проблема: shared workflow не имеет YAML frontmatter, хотя MBB требует frontmatter для `.memory-bank/**/*.md`; generated inline version имеет frontmatter.
- Влияние: если shared workflow будет copied directly или использован как generated source, lint rule может ломаться.
- Минимальное направление: привести shared workflow к тому же frontmatter format, что generated inline template.

### 17. Concrete red-verify handoff размывает fresh hostile pass

- Источники: `skills/_shared/references/commands/autopilot.md:118`, `skills/_shared/references/commands/autopilot.md:127`, `skills/_shared/references/commands/red-verify.md:55`
- Проблема: concrete command examples объединяют verify + red-verify в одну fresh session и добавляют progression/doctor responsibility, хотя red-verify должен быть отдельным hostile semantic pass без scheduler ownership.
- Влияние: semantic verification может превратиться в extension обычной verify-сессии.
- Минимальное направление: split verifier и red-verifier на отдельные commands/sessions; убрать progression/doctor из verifier prompt.

### 18. T0/T1 compact protocol конфликтует с generated AGENTS

- Источники: `skills/_shared/references/workflows/tier-policy.md:21`, `skills/_shared/references/workflows/tier-policy.md:31`, `skills/_shared/scripts/init-mb.js:575`
- Проблема: tier policy разрешает compact `.protocols/<TASK_ID>/run.md`, но generated AGENTS требует `progress.md`.
- Влияние: T0/T1 получают лишний protocol overhead и ложные expectations у doctor/review.
- Минимальное направление: сделать prompts tier-aware: T0/T1 update `run.md`; T2/T3 update `progress.md`.

### 19. Run status terminal states не синхронизированы

- Источники: `skills/_shared/references/protocols/run-status-template.md:46`, `skills/_shared/references/commands/autonomous.md:231`, `skills/_shared/scripts/init-mb.js:984`
- Проблема: commands и autonomy policy используют `HALT_CLARIFICATION_REQUIRED`, но run-status template enum может его не включать.
- Влияние: resumed agent может считать валидный halt state невалидным или перезаписать его.
- Минимальное направление: выровнять terminal-state enum across run-status-template, autonomy-policy, autonomous, autopilot.

### 20. Split review gates должны иметь явные stage IDs

- Источники: `skills/_shared/references/commands/review-feat-plan.md`, `skills/_shared/references/commands/review-tasks-plan.md`, `skills/_shared/agents/review-plan.md:5`, `skills/_shared/agents/review-security.md:5`, `skills/_shared/agents/review-code.md:5`
- Проблема: feature-plan и task-plan gates теперь разделены, но shared reviewer prompts still accept caller-provided `STAGE_ID`.
- Влияние: будущие deep-review сценарии могут снова начать писать отчеты в неожиданные файлы, если stage IDs не будут заданы единообразно.
- Минимальное направление: держать одну stage ID table для split review gates и optional deep-review subagents.

### 21. Standalone/manual closure underdefined

- Источники: `skills/_shared/references/commands/verify.md:37`, `skills/_shared/references/commands/verify.md:79`, `skills/_shared/references/commands/mb-sync.md:16`, `skills/_shared/references/protocols/compact-run-template.md:12`
- Проблема: “explicit standalone owner” используется, но не определен. Для T0/T1 `/verify` иногда может set `status: done`, `/execute` никогда не closes, `/mb-sync` может record explicit closure.
- Влияние: agents могут либо over-close, либо оставлять tasks stuck.
- Минимальное направление: определить single compact closure path или запретить `/verify` писать status entirely.

### 22. `run-status` дублирует authoritative queue state

- Источники: `skills/_shared/references/protocols/run-status-template.md:27`, `skills/_shared/references/commands/autonomous.md:200`
- Проблема: template хранит bucketed queue state, а autonomous говорит, что queue state должен ссылаться на task records и не дублировать authoritative state.
- Влияние: drift между `.protocols/AUTONOMOUS-RUN/status.md` и `.task.json` при resume.
- Минимальное направление: сделать queue section ссылками/snapshot timestamp only или явно отметить как non-authoritative derived snapshot.

### 23. Review gates не должны снова стать тяжелыми по умолчанию

- Источники: `skills/_shared/references/commands/review-feat-plan.md`, `skills/_shared/references/commands/review-tasks-plan.md`
- Проблема: split review gates intentionally use one focused report each; future additions can accidentally return broad multi-review by default.
- Влияние: для малых изменений review снова станет дорогим ritual.
- Минимальное направление: keep feature-plan and task-plan reviews as focused gates; multi-review только для autonomous batch, T3, security, release или explicit deep review.

### 24. Feature clarification metadata слишком строго для legacy/minimal workflows

- Источники: `skills/mb-garden/assets/mb-lint.mjs:367`, `skills/mb-garden/assets/mb-doctor.mjs:559`, `skills/_shared/references/commands/prd-to-tasks.md:25`
- Проблема: `clarification_status`, `last_clarified`, `clarification_questions` обязательны для feature docs.
- Влияние: хорошо для autonomous, но ломает brownfield/minimal или legacy feature docs.
- Минимальное направление: в default lint делать warning; error только в strict/autonomous или при запуске `/prd-to-tasks`.

### 25. Generated `AGENTS.md` нарушает принцип “map, not encyclopedia”

- Источники: `skills/_shared/references/structure-template.md:10`, `skills/_shared/scripts/init-mb.js:493`, `skills/_shared/scripts/init-mb.js:614`
- Проблема: template требует держать `AGENTS.md` около 100 строк и как карту, но generator встраивает Orchestrator Mode, delegation rules, guardrails и длинный command list.
- Влияние: повышается priming cost и возникает дублирование workflow docs.
- Минимальное направление: оставить `AGENTS.md` кратким router; Orchestrator/delegation вынести в `.memory-bank/workflows/orchestrator.md`.

### 26. Дублирование и drift между README, structure-template и init generator

- Источники: `README.en.md:196`, `README.ru.md:196`, `skills/_shared/references/structure-template.md:10`, `skills/_shared/scripts/init-mb.js:493`
- Проблема: одни и те же правила продублированы в README, template и JS strings generator.
- Влияние: расхождения уже появились и будут накапливаться.
- Минимальное направление: сделать один source для skeleton docs/templates, README оставить user-facing overview.

## P2 / Low

### 28. `/red-verify TASK-123` продублирован в README

- Источники: `README.en.md:197`, `README.ru.md:197`
- Проблема: один и тот же пункт `/red-verify TASK-123` указан дважды.
- Влияние: мелкий doc noise, но это сигнал copy-paste drift.
- Минимальное направление: оставить один пункт.

### 29. Generated `AGENTS.md` entrypoints не включают `/find-skills`

- Источники: `skills/_shared/scripts/init-mb.js:614`, `README.en.md:73`, `README.ru.md:73`
- Проблема: README и command templates включают `find-skills.md`, но generated `AGENTS.md` entrypoints list его не показывает.
- Влияние: агент может не увидеть recommended skill discovery path из generated project guide.
- Минимальное направление: добавить `/find-skills` в generated AGENTS entrypoints или явно оставить его только в command index.

### 30. Ожидаемое число generated `shared-*` файлов не должно быть hardcoded

- Источники: repository instructions, `scripts/vendor-shared.mjs:56`, `scripts/vendor-shared.mjs:64`, `scripts/vendor-shared.mjs:77`
- Проблема: инструкции не должны фиксировать конкретное число generated `shared-*`; актуальное число зависит от количества installable skills и shared source files.
- Влияние: hardcoded count создает ложные ожидания при проверке vendoring.
- Минимальное направление: заменить число формулой/диапазоном или проверять только invariant `0` в source tree.

## Suggested Fix Order

1. Stabilize install packaging: single-skill self-containment/dependencies, CI matrix, CLI pinning.
2. Stabilize task state ownership: one closure order, one standalone closure path, no duplicated authoritative queue state.
3. Fix safety boundaries: T3 human checkpoint authority, separate red-verify sessions, terminal-state enum alignment.
4. Reduce default workflow weight: minimal skeleton, optional richer fields, compact protocol for T0-T2, lighter default review.
5. Clean documentation drift: incomplete command lists, duplicated README lines, `/find-skills` entrypoint, and hardcoded generated-file counts.
