# factory for development

![Схема DevRails 26](devrails.jpg)

`DevRails 26` - это фреймворк, который содержит набор skills , extended long term memory и workflow для агентной разработки проектов по SDD way, с кучей бюрократии ради будующей надежной поддержки проекта Агентами.
Фреймворк ориентирован на упряжки Claude CLI / Codex CLI. 

## 📌 Что это

Основные области:

- `.memory-bank/` - знания и состояние проекта: продукт, требования, epics, features, архитектура, task records, индексы и правила работы.
- `.memory-bank/architecture/system-architecture.md#Architecture Spine` - короткие `AD-*` rules для shared-boundary, contract, state/data/runtime/security или strict pressure.
- `.memory-bank/contracts/boundary-map.md` - легкие responsibility/scope boundary notes, которые используются через существующие task поля и `runtime_context`.
- `.memory-bank/packets/` - derivative Execution Packets с компактным runtime context; T2/T3 требуют packet, T0/T1 только при явном `packet_required`.
- `.memory-bank/behavior-specs/` - optional JSON `given / when / then` примеры для важных или неоднозначных feature behaviors; tasks ссылаются на них только через `source_artifacts`.
- `.protocols/` - планы, прогресс и verification по конкретным задачам или features.
- `.tasks/` - runtime evidence, отчеты, handoff-файлы и материалы, которые помогают передавать работу между агентами.
- `.memory-bank/tasks/*.task.json` - task records. Это источник правды для задач.
- `.memory-bank/tasks/index.json` - индекс task records, по которому команды находят и планируют задачи.

## 🗄️ Что дает Memory Bank

Memory Bank помогает вести разработку как повторяемый процесс:

- фиксирует требования, решения и статус задач в репозитории;
- связывает PRD, requirements, epics, features и implementation tasks;
- хранит acceptance criteria, gates, evidence и verification results;
- позволяет выполнять задачи по одной, с явным handoff и проверкой результата;
- поддерживает ручной workflow и автоматические режимы поверх той же task model.

## 🧭 Сценарии использования

- 🌱 **Greenfield**: когда есть идея, черновик или разрозненные требования. Framework помогает довести входные данные до PRD, разложить PRD на requirements, epics, features и tasks, затем пройти реализацию до готового проекта.
- 🏗️ **Brownfield**: когда код уже существует. Framework можно встроить в текущий репозиторий, сначала описать фактическое состояние через `/map-codebase`, а затем планировать изменения через новый PRD или delta к уже описанному baseline.

## 🔄 Классический workflow разработки

Рекомендуемый режим - ручной. В нем проще контролировать входные данные, видеть, какие документы создаются, и проверять каждую задачу отдельно.

```text
идея

  -> Brainstorming       Интервью -> brief.md
  -> Constitution         Принципы проекта и non-negotiables
  -> PRD
  -> /spec-init           Pre-PRD framing для безопасной нарезки
  -> /prd                 requirements, epics, features
  -> /review-feat-plan    для high-risk/large work перед SDD design
  -> /spec-design         обязательный адаптивный SDD backbone
  -> /foundation-to-tasks если нужен
  -> /mb-doctor           readiness gate на foundation/task-queue boundary
  -> execute/verify       foundation до закрытого gate task
  -> /prd-to-tasks        feature design + JSON tasks + required packets
  -> /review-tasks-plan FT-001
                           review feature task plan
  -> /mb-doctor           conditional readiness gate на complex/T3/autonomous boundaries
  -> execute             tier-routed: T0/T1 compact, T2/T3 full safety
  -> verify              required for T2/T3; optional for manual T0/T1 uncertainty
  -> sync                boundary sync, not per-task habit
  -> следующая task
```

Командная цепочка для ручного greenfield flow:

```text
/analysis -> /brief -> /constitution if project_principles is not ratified|partial -> /write-prd -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /mb-doctor at foundation/task-queue boundary -> execute/verify FT-000 until foundation gate done -> /prd-to-tasks FT-001 -> /review-tasks-plan FT-001 -> conditional /mb-doctor for complex/T3/autonomous boundaries -> tier-routed /execute first indexed TASK (T0/T1 may close with compact evidence; T2/T3 continue through required verify and boundary sync gates)
```

Та же greenfield-схема в виде Mermaid-карты вынесена отдельно: [GREENFIELD_WORKFLOW.md](GREENFIELD_WORKFLOW.md).

1. `/analysis` или `/brief`

  **Когда:** если входная идея сырая, противоречивая или еще не готова для PRD.

   **Создает/обновляет:** analysis artifacts в `.memory-bank/analysis/`, обычно product brief как вход для `/constitution` и PRD.

   **Дальше:** перейти к `/constitution`, когда достаточно понятно, что нужно строить.
2. `/constitution`

  **Когда:** после product brief или existing PRD context, перед `/write-prd`.

   **Создает/обновляет:** `.memory-bank/constitution.md` с governing principles, Definition of Done, автономностью агентов, human checkpoints и критичными non-negotiables.

   **Дальше:** перейти к `/write-prd`. Если пользователь явно пропускает interview, flow продолжается с `project_principles: framework-default|skipped`, а `/constitution` можно пройти позже.
3. `/write-prd`

  **Когда:** когда есть product brief, черновик требований или уже понятное описание продукта.

   **Создает/обновляет:** PRD с уточненными целями, scope, требованиями, ограничениями и открытыми вопросами.

   **Дальше:** если PRD достаточно ясен, запустить `/spec-init`.
4. `/spec-init`

  **Когда:** после clarified PRD, до `/prd`.

   **Зачем:** проверяет, достаточно ли из PRD понятны actors, scenarios, domain boundaries, lifecycles, constraints и non-goals, чтобы `/prd` мог безопасно вывести requirements, epics и features.

   **Создает/обновляет:** pre-PRD spec framing: `.memory-bank/spec-backbone.md` с `Pre-PRD Spec Status: ready_for_prd|blocked`, чистый registry `.memory-bank/spec-index.md`, а при evidence или явных gaps — `user-scenarios.md`, `domains/<domain>.md`, `invariants.md`, optional `contracts/boundary-map.md` и `states/lifecycle-map.md`. При PASS состояние означает: pre-PRD framing готов для `/prd`, а Global Backbone Status намеренно ожидает `/spec-design`. Если PRD уже содержит достаточные evidence, `/spec-init` может просто сослаться на PRD вместо отдельного файла. Не проводит architecture interview, не проектирует full architecture и не создает features/tasks.

   **Дальше:** запустить `/prd` только при `ready_for_prd`; при `blocked` сначала уточнить PRD/framing gaps.
5. `/prd`

  **Когда:** когда PRD готов к разложению на структуру Memory Bank.

   **Создает/обновляет:** `.memory-bank/product.md`, `.memory-bank/requirements.md`, `.memory-bank/epics/`, `.memory-bank/features/` и связанные индексы.

   **Дальше:** для high-risk/large work запустить `/review-feat-plan`, затем обязательный `/spec-design`. Для local/simple feature-set pressure `/spec-design` создает minimal backbone и помечает лишние области `not_applicable`; для shared-boundary, contract, state/data/runtime/security или strict pressure проводит архитектурный checkpoint. Если нужен executable baseline, сначала пройти `/foundation-to-tasks` и закрыть foundation gate. Затем выбрать feature для декомпозиции. Если она заблокирована неясностями, сначала использовать `/clarify-feature FT-001`; затем `/prd-to-tasks FT-001`, `/review-tasks-plan FT-001`, conditional `/mb-doctor` и tier-routed `/execute TASK`.
6. `/spec-design`

  **Когда:** после `/prd`, всегда перед `/prd-to-tasks`. Это обязательный gate, но не обязательная тяжелая фаза.

   **Создает/обновляет:** `spec-backbone` с Global Backbone Status и Backbone Area Matrix, чистый `spec-index` только как registry, SDD backbone specs по необходимости и `.memory-bank/foundation.md`, если нужен Foundation Dev Path. Architecture scaffold может остаться в одном `architecture/system-architecture.md` только когда это лучший readable shape; для shared-boundary, contract, state/data/runtime/security или strict pressure добавляет короткий `Architecture Spine` с `AD-*` executable rules. Отдельные `architecture/source-of-truth.md`, `architecture/module-boundaries.md` или boundary-файлы создаются только когда split снижает реальную сложность или нужен как authoritative reference. Детальные API/state/message contracts живут в `contracts/`, `states/`, `domains/`, `tech-specs/`. Потребляет pre-PRD framing из `/spec-init`, не создает task records.

   **Дальше:** если foundation required, запустить `/foundation-to-tasks` и закрыть final foundation gate; иначе выбрать feature и запустить `/prd-to-tasks FT-001`, `/review-tasks-plan FT-001`, conditional `/mb-doctor` и tier-routed `/execute TASK`.
7. `/foundation-to-tasks`

  **Когда:** после `/spec-design`, если `.memory-bank/foundation.md` говорит `Foundation Required: true`.

   **Создает/обновляет:** `REQ-000`, `.memory-bank/features/FT-000-foundation.md`, `.protocols/FT-000/*`, `.memory-bank/tasks/plans/IMPL-FT-000.md`, normal JSON `TASK-NNN-TN-FT-000-WN` records для foundation и final foundation gate task. Свежий bootstrap это не создает.

   **Дальше:** `/mb-doctor` на foundation/task-queue boundary, затем `/execute`/`/verify` foundation tasks до `done` у final gate task.
8. `/clarify-feature FT-001`

  **Когда:** только если конкретная feature содержит blocker, `TBD`, `TODO`, `NEEDS CLARIFICATION` или другой marker, который мешает нарезать задачи.

   **Создает/обновляет:** уточнения по feature и ее clarification status.

   **Дальше:** после снятия blocker запустить `/prd-to-tasks FT-001`, `/review-tasks-plan FT-001`, conditional `/mb-doctor` и tier-routed `/execute TASK`.
9. `/prd-to-tasks FT-001`

  **Когда:** когда feature можно разложить на implementation tasks.

   **Создает/обновляет:** feature-level SDD design status/spec links, optional `.memory-bank/behavior-specs/*.behavior.json` для конкретных behavior examples, `.protocols/FT-001/plan.md`, `.protocols/FT-001/decision-log.md`, `.memory-bank/tasks/plans/IMPL-FT-001.md`, product task records в `.memory-bank/tasks/*.task.json`, индекс `.memory-bank/tasks/index.json` и required initial Execution Packets для T2/T3 и явных T0/T1 packet requirements. Если foundation required, product tasks зависят от final foundation gate.

   **Дальше:** после декомпозиции текущей feature запустить `/review-tasks-plan FT-<NNN>`, затем conditional `/mb-doctor` для T3, autonomous/autopilot handoff или complex T2/foundation/dependency/packet/stale-doc/risky-link cases и перейти к `/execute TASK-NNN-TN-FT-NNN-WN`. Для manual T0/T1 `/execute` может закрыть task с compact evidence; для T2/T3 `/verify TASK-NNN-TN-FT-NNN-WN` выполняется после реализации.
10. `/mb-doctor`

  **Когда:** после того как feature полностью разложена на task records и required packets, если есть T3, autonomous/autopilot handoff или complex T2/foundation/dependency/packet/stale-doc/risky-link cases. Для simple manual T0/T1 это не default gate.

   **Создает/обновляет:** report readiness findings; не заменяет `/verify` и не исполняет tasks.

   **Дальше:** исправить findings, перейти к `/execute TASK-NNN-TN-FT-NNN-WN`, или для simple manual T0/T1 пропустить gate и идти к tier-routed `/execute`.
11. `/execute TASK-NNN-TN-FT-NNN-WN`

  **Когда:** для реализации одной конкретной задачи из task record.

   **Создает/обновляет:** код или документацию по scope задачи, protocol state в `.protocols/TASK-NNN-TN-FT-NNN-WN/`, evidence и handoff в `.tasks/TASK-NNN-TN-FT-NNN-WN/`.

   **Дальше:** для manual T0/T1 можно закрыть compact evidence/no-runnable-check note прямо в `/execute`, если есть explicit top-level closure ownership и нет required packet/T2/T3 trigger. Для T2/T3 или uncertainty запустить `/verify TASK-NNN-TN-FT-NNN-WN`.
12. `/verify TASK-NNN-TN-FT-NNN-WN`

  **Когда:** после реализации задачи.

   **Создает/обновляет:** verification evidence, verdict `PASS` или `FAIL`, task/protocol state по результату проверки.

   **Дальше:** если задача T3, запустить `/red-verify TASK-NNN-TN-FT-NNN-WN`; для T2 feature completion запустить `/red-verify --feature FT-*`; full `/mb-sync` нужен на boundary или когда менялось broader durable state.
13. `/red-verify TASK-NNN-TN-FT-NNN-WN`

  **Когда:** обязательно для T3 task closure; опционально для T2 task closure; обязательно как `/red-verify --feature FT-*` перед T2 feature completion. Feature-level verdict записывается в сам feature doc. Особенно полезно там, где обычные tests могут пройти, но решение может быть неверным по смыслу.

   **Создает/обновляет:** semantic verification report и semantic verdict.

   **Дальше:** при проблемах вернуть задачу в доработку; при успешной T3 проверке перейти к `/mb-sync`, для T2 feature completion синхронизировать feature/wave boundary.
14. `/mb-sync`

  **Когда:** на boundary, где нужно reconcile broader Memory Bank state: RTM/lifecycle/changelog/index/spec/contract/dependency, T2 wave/feature boundary, T3 closure, handoff/review freshness или drift. Не обязателен для local manual T0/T1 closure, если изменились только `task.status`, `task.verify` и `.protocols/<TASK>/run.md`.

   **Создает/обновляет:** индексы Memory Bank, lifecycle/RTM notes, changelog, task-record consistency и ссылки на evidence.

   **Дальше:** выбрать следующую задачу или feature.
15. Повторять цикл

  **Когда:** пока features и tasks не доведены до нужного состояния.

    **Создает/обновляет:** последовательные изменения в продукте, документах, task records и evidence.

    **Дальше:** продолжать `/prd-to-tasks` для следующих features или `/execute` для следующих tasks. Использовать `/spec-improve` и `/mb-packet` только для repair/refresh вне happy path.

## 🛠️ Команды вне основного ручного цикла

- `/cold-start` - выбирает стартовый сценарий после skeleton creation: greenfield, brownfield, skeleton-only. Если `.memory-bank/` еще нет, сначала используйте `/mb-init` или installer bootstrap.
- `/mb-init` - создает skeleton Memory Bank, `.tasks/`, `.protocols/`, `AGENTS.md` и runtime scripts.
- `/spec-improve` - standalone repair/refresh feature-level SDD design, когда нужно обновить design без task decomposition.
- `/mb-packet` - repair/refresh derivative Execution Packet после task/spec изменений или readiness finding; initial required packets создает `/prd-to-tasks`.
- `/map-codebase` - описывает существующий код как as-is baseline в Memory Bank.
- `/review-feat-plan` - fresh-context review PRD/requirements/epics/features до `/spec-design`.
- `/review-tasks-plan FT-<NNN>` - fresh-context review task plan текущей feature после `/prd-to-tasks FT-<NNN>`. Без аргумента команда выводит последнюю разложенную product feature эвристически; для scheduler handoff требуется `APPROVE` по каждой task-linked product feature.
- `/mb-garden` - обслуживает Memory Bank: lint, чистка, устранение drift, архивирование.
- `/mb-doctor` - deterministic readiness gate для autopilot/autonomous runs и conditional manual readiness check для T3/complex boundaries.
- `/mb-harness` - помогает настроить чистые сессии, профили и проверочные команды.
- `/autopilot` - автономно проходит уже созданную JSON task queue.
- `/autonomous` - ведет полный unattended flow от PRD до terminal state.
- `/discuss` - проясняет неизвестные и противоречия перед реализацией.
- `/add-tests` - добавляет или расширяет тесты вокруг выбранной области.
- `/find-skills` - ищет релевантные skills среди установленных и доступных.

## 🚀 Установка и запуск

Скачайте этот репозиторий, перейдите в его папку и запустите скрипт автоустановки:

```bash
node scripts/install-framework.mjs
```

Интерактивный installer позволит выбрать нужную папку проекта из списка,

установит команды DevRails 26 и создаст или синхронизирует skeleton Memory Bank в

выбранном репозитории.

Если Memory Bank уже был развернут, installer обновит runtime command skills,

runtime scripts и может синхронизировать `AGENTS.md`. Для

существующего проекта лучше запускать установку в git-репозитории или заранее

сделать копию `AGENTS.md`, чтобы при необходимости посмотреть diff.

После bootstrap-установки используйте `/cold-start` или начните ручной цикл.

Если запускали только install-only и `.memory-bank/` еще нет, сначала выполните

`/mb-init`.

Ручной greenfield flow описан выше в разделе

`Классический workflow разработки`; Mermaid-карта вынесена в

[GREENFIELD_WORKFLOW.md](GREENFIELD_WORKFLOW.md).

Автоматические режимы стоит включать после того, как PRD, features и task records уже понятны. `/autopilot` работает по готовой JSON task queue, а `/autonomous` берет на себя более длинный unattended flow. Оба режима требуют usable packets для T2/T3 и для T0/T1 только при `runtime_context.packet_required: true`.

## 📚 Подробная механика

Подробное описание установки, source-only packaging, структуры Memory Bank, task model, tier policy, command reference и проверок находится в [howItWorks.md](howItWorks.md).