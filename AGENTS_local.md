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
Do not overengineer. Придерживайся KISS. Лучшнее враг хорошего, мы делаем хорошо, но не идеально.

# Важный контекст репозитория

Перед доработкой проекта прочитай `PROJECT_MAP.md`.

Этот форк использует source-only модель упаковки skills:

- `skills/_shared/` — единственный canonical source для общих prompts, references и scripts.
- В рабочем дереве намеренно нет package-local файлов `skills/*/{agents,references,scripts}/shared-*`.
- В git намеренно нет tracked `.memory-bank/*` baseline; bootstrap/smoke проверяет generated Memory Bank во временной target-директории.
- При установке фреймворка эти файлы разворачиваются автоматически во временной копии репозитория.
- Ожидаемый масштаб разворота: 671 generated `shared-*` файлов.
- Разворот выполняется цепочкой `scripts/install-framework.mjs` → временная копия repo → `scripts/vendor-shared.mjs` → `npx -y skills add <prepared-temp-repo> ...`.
- Прямой `npx skills add <repo>` для source-only форка использовать нельзя, если перед этим не был запущен vendoring.

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

Если нужно посмотреть временно развернутые 671 файлов, запускай:

```bash
MEMOBANK_KEEP_INSTALL_TMP=1 node scripts/install-framework.mjs --skill '*' --yes
```

## Canonical Interactive Chain
- `/analysis or /brief -> /constitution if project_principles is not ratified|partial -> /write-prd -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /mb-doctor at foundation/task-queue boundary -> execute/verify FT-000 until foundation gate done -> /prd-to-tasks FT-001 -> /review-tasks-plan FT-001 -> conditional /mb-doctor at feature/task-queue boundary -> tier-routed /execute TASK -> /verify TASK for T2/T3 or uncertainty -> /red-verify TASK for T3 -> /red-verify --feature FT-001 before T2 feature completion -> /mb-sync at boundary`
