---
description: Единая точка входа — выбрать сценарий и запустить правильный флоу (analysis / PRD / map-codebase / skeleton-only).
status: active
---
# /cold-start — Bootstrap router (choose the right flow)

<objective>
Дать одну удобную команду “с чего начать”, которая:
- определяет сценарий (greenfield / brownfield / skeleton-only)
- запускает правильный следующий шаг
- не генерирует EP/FT/TASK без PRD
  - не обходит PRD-level clarification перед task decomposition
</objective>

<process>

## 0) Предусловия
Эта команда предполагает, что skeleton уже создан (есть `.memory-bank/`).
Если `.memory-bank/` отсутствует — сначала создай skeleton (например, запусти `init-mb.js`), затем вернись сюда.

## 1) Определи сценарий (не угадывай)
Проверь:
- Есть ли `prd.md`?
- Есть ли `.memory-bank/analysis/product-brief.md`?
- Есть ли `.memory-bank/analysis/brainstorming.md` или другой durable brainstorming artifact?
- Есть ли `.memory-bank/constitution.md` и `project_principles: ratified|partial`, или principles только `framework-default|skipped|missing`?
- Есть ли существенный код (например: `src/`, `package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`)?
- Насколько вход пользователя ясен: vague idea / clear concept / existing PRD?

Выбор:
- **Если есть код** → это **brownfield** → сначала запусти `/map-codebase` для as-is baseline.
- **Если есть и код, и PRD / product brief / clear delta** → сначала `/map-codebase`, затем если project principles не ratified/partial рекомендуй `/constitution`, потом `/write-prd`, `/spec-init`, `/prd`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks --verify-existing` только если baseline proof still needed, закрыть `FT-000` только если команда создала probe tasks, и `/prd-to-tasks FT-<NNN>` как delta. По умолчанию brownfield не создает `FT-000`, если existing baseline уже доказан.
- **Если кода почти нет и есть PRD** → это **greenfield with existing PRD** → если project principles не ratified/partial, рекомендуй `/constitution`, затем перенеси/нормализуй PRD через `/write-prd`, затем `/spec-init`, `/prd`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks` если required, и `/prd-to-tasks FT-<NNN>`.
- **Если кода почти нет и есть `.memory-bank/analysis/product-brief.md`** → если project principles уже `ratified|partial`, переходи к `/write-prd`; иначе рекомендуй `/constitution`, затем `/write-prd`, `/spec-init`, `/prd`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks` если required, и `/prd-to-tasks FT-<NNN>`.
- **Если кода почти нет и концепт ясен, но PRD нет** → запусти `/brief`; затем если project principles уже `ratified|partial`, переходи к `/write-prd`, иначе рекомендуй `/constitution` перед `/write-prd`; затем `/spec-init`, `/prd`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks` если required, и `/prd-to-tasks FT-<NNN>`.
- **Если кода почти нет и идея сырая / направление нестабильно** → запусти `/analysis`; `/analysis` должен направить в `/brainstorm` или `/brief`.
- **Если есть brainstorming artifact, но нет product brief и PRD** → запусти `/brief`; затем если project principles уже `ratified|partial`, переходи к `/write-prd`, иначе рекомендуй `/constitution` перед `/write-prd`; затем `/spec-init`, `/prd`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks` если required, и `/prd-to-tasks FT-<NNN>`.
- **Если нет кода и нет PRD / clear concept / analysis artifacts** → это **skeleton-only**: попроси пользователя предоставить PRD, product brief или хотя бы требования текстом и остановись.

## 2) Правила (важно)
- Если **нет PRD**, ты **НЕ** создаёшь/заполняешь:
  - `.memory-bank/epics/*`
  - `.memory-bank/features/*`
  - `.memory-bank/tasks/*.task.json` реальными задачами
  - `.memory-bank/tasks/index.json` ссылками на реальные TASK-IDs
- Пустой skeleton допустим:
  - папки/файлы могут существовать после `mb-init` / `init-mb.js`
  - но roadmap-сущности, реальные TASK-IDs и task records без PRD не создаются
- Если PRD есть, но пользователь временно недоступен:
  - фиксируй `Open questions` в `.protocols/PRD-BOOTSTRAP/decision-log.md`
  - **останавливайся и жди** (не выдумывай факты).
- Analysis artifacts живут в `.memory-bank/analysis/` и являются durable Memory Bank artifacts, но Analysis не обязателен для каждого проекта.
- Product Brief — upstream input contract для `/constitution` и `/write-prd`, а не PRD, backlog или task plan.
- `/constitution` — нормальный greenfield step после Product Brief / existing PRD context и перед `/write-prd`, если project principles ещё не `ratified|partial`. Он должен читать Product Brief, если тот есть, и провести contextual interview.
- `/constitution` не hard-blocker: если пользователь явно пропускает interview, продолжай downstream с `project_principles: framework-default|skipped` и предложи вернуться позже.
- `/cold-start` никогда не рекомендует `/prd-to-tasks` напрямую. Канонический downstream: optional `/constitution` when project principles are not `ratified|partial` → `/write-prd` → `/spec-init` → `/prd` → `/review-feat-plan` for high-risk/large work → `/spec-design` → `/foundation-to-tasks` if required → `/prd-to-tasks FT-<NNN>`.
- `/prd-to-tasks` must not run while PRD clarification is pending/blocked or a targeted feature is explicitly pending/blocked.

## 3) После запуска флоу
После `/prd` или `/map-codebase`:
- after `/prd`, run `/review-feat-plan` (fresh context) before `/spec-design` for high-risk, large, or autonomous flows
- interactive: после `/prd` всегда пройди `/spec-design`; для local/simple feature-set pressure запиши minimal status с explicit `not_applicable` areas; если foundation required, пройди `/foundation-to-tasks` и закрой foundation gate; затем выбери фичу, при необходимости пройди `/clarify-feature FT-<NNN>`, затем `/prd-to-tasks FT-<NNN>` и выполняй задачи по tier route: T0/T1 manual через `/execute TASK` с compact evidence/no-runnable-check note и optional local closure by explicit owner; T2 через `/execute` → `/verify` и `/mb-sync` на wave/feature boundary; T3 через `/execute` → `/verify` → `/red-verify` → `/mb-sync`; для T2 feature completion после всех задач выполни `/red-verify --feature FT-<NNN>`
- JSON task queue unattended: используй `/autopilot`
- full unattended (`PRD → done`): используй `/autonomous`
</process>
