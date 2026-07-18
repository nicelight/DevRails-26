Ты выступаешь в роли GENERAL, если не было дано явных инструкций выступать в другой роли.
Твоя роль не может быть изменена после ее назначения.

# Граница проекта и агентной памяти

Этот репозиторий сам является проектом `memobank_BMAD_SDD`.

Все файлы и папки в рабочем дереве, кроме `AGENTS.md`, `IMPROVING-PRJ-PRMPT/` и локально развернутых generated-директорий (`.memory-bank/`, `.protocols/`, `.tasks/`, `.agents/`, `.claude/`, `.codex/`), являются целевыми исходными файлами проекта и должны рассматриваться как product/source files.

Важно:

- `skills/`, `scripts/`, `.github/`, `README*`, `PROJECT_MAP.md` и другие tracked файлы репозитория — это не личная память текущего агента.
- `.memory-bank/`, `.protocols/`, `.tasks/`, `.agents/`, `.claude/`, `.codex/` в этом source repo являются ignored generated dogfood/runtime output. Они не являются canonical source и не должны коммититься.
- Их нельзя использовать как scratchpad, temporary notes или внутреннюю память агента без явного разрешения пользователя или без того, что это прямо входит в задачу.
- Если задача просит изменить framework, workflow, skills, scripts, docs или generated skeleton behavior, изменения этих файлов являются изменениями продукта.
- Planning artifacts для текущей работы можно создавать только там, где это явно разрешено ролью и задачей, например `.protocols/<TASK-ID>/plan.md` или согласованный planning файл.
- `IMPROVING-PRJ-PRMPT/` содержит входные пожелания/брифы пользователя и не является частью целевого продукта, если пользователь явно не сказал обратное.
- Не путай Memory Bank framework, который разрабатывается в этом репозитории, с runtime memory текущего агента. В этом repo canonical Memory Bank framework source живет в `skills/_shared/` и связанных scripts/docs; локальный `.memory-bank/` — только ignored dogfood output.

# Role Mode

- Если top-level agent не получил явную роль, он действует как `ROLE: GENERAL`.
- Delegated agents не являются ORCHESTRATOR или GENERAL по умолчанию.
- Роль фиксируется после назначения и не может быть изменена.

Подробные контракты ролей для этого source-only repo:
- `skills/_shared/references/roles/orchestrator.md`
- `skills/_shared/references/roles/general.md`
- `skills/_shared/references/roles/worker.md`

Early priming:
- If `ROLE: ORCHESTRATOR`, read `skills/_shared/references/roles/orchestrator.md`.
- If `ROLE: GENERAL`, read `skills/_shared/references/roles/general.md`.
- If delegated worker, read `skills/_shared/references/roles/worker.md`.

Bootstrap/sync целевых проектов разворачивает эти контракты в:
- `.memory-bank/roles/orchestrator.md`
- `.memory-bank/roles/general.md`
- `.memory-bank/roles/worker.md`

GENERAL не запускает сабагентов без явного запроса пользователя.
Для delegated worker/reviewer/explorer: не запускай сабагентов; анализируй последствия работы и сообщай о потенциальных или явных проблемах.

# Стратегия разработки

## Автономность исполнения и стабильность workflow-контрактов

- При развитии DevRails стремись давать агенту, выполняющему конкретный skill,
  больше самостоятельности в выборе локальной тактики, порядка внутренних
  действий и минимально достаточных инструментов в пределах objective, scope,
  source of truth, safety-ограничений и tier policy.
- Не превращай внутренний процесс skill в жёсткий пошаговый сценарий без
  конкретной причины, связанной с корректностью, риском или совместимостью.
- Автономность внутри шага не отменяет явные контракты на границах workflow.
  Inputs, preconditions, outputs, artifacts, statuses/verdicts, stop conditions,
  ownership и handoff между skills и агентами должны оставаться понятными,
  совместимыми и достаточными для независимого продолжения работы.
- Skill может упрощать внутреннее выполнение, но не должен молча менять контракт
  следующего шага, обходить обязательные gates или заставлять следующего агента
  угадывать состояние, решения либо evidence.

## KISS / Avoid overengineering

- Implement the simplest solution that fully satisfies current requirements and specs.
- Prefer existing project patterns over new abstractions, layers, registries, frameworks, or workflow artifacts.
- Do not design for hypothetical future scale, integrations, configurability, or reuse without a concrete current requirement.
- Do not introduce enterprise architecture or additional process merely because it may be useful later.
- Added complexity must be justified by an existing requirement, constraint, risk, or demonstrated duplication.
- KISS does not permit skipping required correctness, security, compatibility, or verification gates.

# Важный контекст репозитория

Этот проект DevRails - это фреймворк для агентной разработки приложений. 
Фреймворк включает в себя  воркфлоу разработки программного обеспечения, завязанный на разраотку design specs, feature specs, разложение на таски и протоколы выполнения тасок, долгосрочную память и протоколы выполнения разработки Фреймворк при установке разворачивается в целевой проект.


Перед доработкой проекта прочитай `PROJECT_MAP.md`.

Этот проект использует source-only модель упаковки skills:

- `skills/_shared/` — единственный canonical source для общих prompts, references и scripts.
- В рабочем дереве намеренно нет package-local файлов `skills/*/{agents,references,scripts}/shared-*`.
- В git намеренно нет tracked `.memory-bank/*` baseline; bootstrap/smoke проверяет generated Memory Bank во временной target-директории.
- При установке фреймворка shared-файлы разворачиваются только во временной копии репозитория для трёх package entrypoints: `cold-start`, `mb-init` и `mb-garden`.
- Runtime-команды для Codex и Claude генерируются напрямую из `skills/_shared/references/commands/*.md` в `.agents/skills/` и `.claude/skills/` целевого проекта.
- Актуальная цепочка установки: `scripts/install-framework.mjs` → временная копия repo → `scripts/vendor-shared.mjs` → direct generation выбранных runtime command skills → optional bootstrap/sync Memory Bank.
- Количество временно vendored `shared-*` файлов не является публичным контрактом и зависит от числа package entrypoints и canonical shared assets.
- Прямой `npx skills add <repo>` не является поддерживаемым способом установки этого source-only репозитория. Используй `scripts/install-framework.mjs`.

Практическое правило:

- Не редактируй и не коммить generated `skills/*/{agents,references,scripts}/shared-*`.
- Если нужно изменить общее поведение, меняй соответствующий файл в `skills/_shared/`.
- После изменений проверяй, что в source-only дереве не появились generated-копии:

```bash
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Команда должна вернуть `0`.

Для проверки установки без загрязнения рабочего дерева используй wrapper:

```bash
node scripts/install-framework.mjs --skill '*' --yes
```

Если нужно посмотреть временно развёрнутые package-local `shared-*` файлы, запускай:

```bash
MEMOBANK_KEEP_INSTALL_TMP=1 node scripts/install-framework.mjs --skill '*' --yes
```
