---
description: Единая точка входа — выбрать сценарий и запустить правильный флоу (analysis / PRD / map-codebase / skeleton-only).
status: active
---
# /cold-start — Scenario router (choose the right flow)

<objective>
Дать одну удобную команду “с чего начать”, которая:
- определяет сценарий (greenfield / brownfield / skeleton-only)
- запускает правильный следующий шаг
- не генерирует EP/FT/TASK без PRD
  - не обходит PRD-level clarification перед task decomposition
</objective>

<process>

## 0) Предусловия
Если `.memory-bank/` отсутствует:
1. Считай корень текущего repository `<target-repo>`, если оператор явно не
   указал другой target.
2. Принимай `<devrails-checkout>` только когда путь предоставлен оператором или
   `scripts/install-framework.mjs` уже можно проверить по известному пути.
   Never guess or invent `<devrails-checkout>`.
3. Объясни, что route установит или обновит полный DevRails runtime command set
   и создаст skeleton. Затем верни external bootstrap command, заменив оба
   placeholders проверенными, shell-safe paths:

   ```bash
   node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --target <target-repo> --yes
   ```

4. Если доступный DevRails checkout неизвестен, остановись с честным blocker:
   попроси оператора предоставить путь к checkout или выполнить external
   installer action, затем rerun the original `/cold-start`. Не показывай
   unresolved placeholder как executable command.
5. Do not call `/mb-init`, не запускай local bootstrap logic, не копируй helper,
   не добавляй dependency и не создавай skeleton вручную. После успешного
   external bootstrap повторно запусти `/cold-start`.
6. Не создавай roadmap docs, features or task records до появления skeleton.

## 1) Определи сценарий (не угадывай)
Проверь:
- Есть ли `prd.md`?
- Есть ли `.memory-bank/analysis/product-brief.md`?
- Есть ли `.memory-bank/analysis/brainstorming/BR-*.md` или другой durable brainstorming artifact?
- Есть ли `.memory-bank/constitution.md` и `project_principles: ratified|partial`, или principles только `framework-default|skipped|missing`?
- Есть ли существенный код (например: `src/`, `package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`)?
- Насколько вход пользователя ясен: vague idea / clear concept / existing PRD?

Выбор выполняй от более специфичного к общему:
- **Если есть код и PRD / product brief / clear delta** → это
  **brownfield + planned delta**: сначала `/map-codebase` для as-is baseline,
  затем если project principles не ratified/partial рекомендуй `/constitution`,
  потом `/write-prd --delta` для нормализации delta в PRD, `/spec-init`,
  `/prd-to-features`, `/review-feat-plan for high-risk/large work`, `/spec-design`,
  `/foundation-to-tasks --verify-existing` только если baseline proof still
  needed, закрыть `FT-000` только если команда создала probe tasks, и
  `/feature-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>`, conditional
  `/mb-doctor`, и tier-routed `/exe TASK` как delta. По умолчанию brownfield не создает
  `FT-000`, если existing baseline уже доказан.
- **Если есть код, но нет PRD / product brief / clear delta** → это
  **brownfield baseline only**: сначала запусти `/map-codebase` для as-is
  baseline, затем попроси PRD/delta. Не создавай roadmap EP/FT/TASK без delta.
- **Если кода почти нет и есть PRD** → это **greenfield with existing PRD** → если project principles не ratified/partial, рекомендуй `/constitution`, затем перенеси/нормализуй PRD через `/write-prd`, затем `/spec-init`, `/prd-to-features`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks` если required, `/mb-doctor --strict` и execute/verify `FT-000` до закрытия gate when foundation tasks were created, `/feature-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>`, conditional `/mb-doctor`, и tier-routed `/exe TASK`.
- **Если кода почти нет и есть `.memory-bank/analysis/product-brief.md`** → если project principles уже `ratified|partial`, переходи к `/write-prd`; иначе рекомендуй `/constitution`, затем `/write-prd`, `/spec-init`, `/prd-to-features`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks` если required, `/mb-doctor --strict` и execute/verify `FT-000` до закрытия gate when foundation tasks were created, `/feature-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>`, conditional `/mb-doctor`, и tier-routed `/exe TASK`.
- **Если кода почти нет и концепт ясен, но PRD нет** → запусти `/brief`; затем если project principles уже `ratified|partial`, переходи к `/write-prd`, иначе рекомендуй `/constitution` перед `/write-prd`; затем `/spec-init`, `/prd-to-features`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks` если required, `/mb-doctor --strict` и execute/verify `FT-000` до закрытия gate when foundation tasks were created, `/feature-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>`, conditional `/mb-doctor`, и tier-routed `/exe TASK`.
- **Если кода почти нет и идея сырая / направление нестабильно** → запусти `/brainstorm`, затем `/brief`.
- **Если есть brainstorming artifact, но нет product brief и PRD** → запусти `/brief`; затем если project principles уже `ratified|partial`, переходи к `/write-prd`, иначе рекомендуй `/constitution` перед `/write-prd`; затем `/spec-init`, `/prd-to-features`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks` если required, `/mb-doctor --strict` и execute/verify `FT-000` до закрытия gate when foundation tasks were created, `/feature-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>`, conditional `/mb-doctor`, и tier-routed `/exe TASK`.
- **Если нет кода и нет PRD / clear concept / discovery artifacts** → это **skeleton-only**: попроси пользователя предоставить PRD, product brief или хотя бы требования текстом и остановись.

## 2) Правила (важно)
- Если **нет PRD**, ты **НЕ** создаёшь/заполняешь:
  - `.memory-bank/epics/*`
  - `.memory-bank/features/*`
  - `.memory-bank/tasks/*.task.json` реальными задачами
  - `.memory-bank/tasks/index.json` ссылками на реальные TASK-IDs
- Пустой skeleton допустим:
  - папки/файлы могут существовать после external bootstrap
  - но roadmap-сущности, реальные TASK-IDs и task records без PRD не создаются
- Если PRD есть, но пользователь временно недоступен:
  - фиксируй `Open questions` в `.protocols/PRD-BOOTSTRAP/decision-log.md`
  - **останавливайся и жди** (не выдумывай факты).
- Discovery artifacts живут в `.memory-bank/analysis/` и являются durable Memory Bank artifacts, но discovery не обязателен для каждого проекта.
- Product Brief — upstream input contract для `/constitution` и `/write-prd`, а не PRD, backlog или task plan.
- `/constitution` — нормальный greenfield step после Product Brief / existing PRD context и перед `/write-prd`, если project principles ещё не `ratified|partial`. Он должен читать Product Brief, если тот есть, и провести contextual interview.
- `/constitution` не hard-blocker: если пользователь явно пропускает interview, продолжай downstream с `project_principles: framework-default|skipped` и предложи вернуться позже.
- `/cold-start` никогда не рекомендует `/feature-to-tasks` напрямую от raw input.
  Канонический downstream: optional `/constitution` when project principles are
  not `ratified|partial` → `/write-prd` or `/write-prd --delta` →
  `/spec-init` → `/prd-to-features` → `/review-feat-plan` for high-risk/large work →
  `/spec-design` → `/foundation-to-tasks` if required → `/mb-doctor --strict`
  and execute/verify `FT-000` until its gate is done when tasks were created →
  `/feature-to-tasks FT-<NNN>` → `/review-tasks-plan FT-<NNN>` →
  conditional `/mb-doctor` → tier-routed `/exe TASK`.
- `/feature-to-tasks` must not run while PRD clarification is pending/blocked or a targeted feature is explicitly pending/blocked.

## 3) После запуска флоу
После `/prd-to-features` или `/map-codebase`:
- after `/prd-to-features`, run `/review-feat-plan` (fresh context) before `/spec-design` for high-risk, large, or autonomous flows
- interactive: после `/prd-to-features` всегда пройди `/spec-design`; для local/simple feature-set pressure запиши minimal status с explicit `not_applicable` areas; если foundation required, пройди `/foundation-to-tasks`, `/mb-doctor --strict` и execute/verify `FT-000` до закрытия foundation gate; затем выбери фичу, при необходимости пройди `/feature-doctor FT-<NNN>`, затем `/feature-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>` и выполняй задачи по tier route: T0/T1 manual через `/exe TASK` с compact evidence/no-runnable-check note и optional local closure by explicit owner; T2 через `/exe` → `/verify` и `/mb-sync` на wave/feature boundary; T3 через `/exe` → `/verify` → `/red-verify` → `/mb-sync`; для T2 feature completion после всех задач выполни `/red-verify --feature FT-<NNN>`
- Product JSON task queue unattended: используй `/autopilot` только когда
  product records уже подготовлены, Foundation is `not_required` or its named
  final gate is `done` with no unresolved FT-000 work, every task-linked
  product feature has latest `/review-tasks-plan FT-<NNN>` `APPROVE` for the
  current positive Global Backbone Planning Revision, and strict doctor passes.
  `/autopilot` never executes FT-000
- full unattended (`PRD → done`): используй `/autonomous`
</process>
