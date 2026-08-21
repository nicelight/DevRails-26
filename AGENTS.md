# Что является продуктом этого репозитория

DevRails — framework агентной разработки, а не обычное приложение и не набор
независимых prompts.

Canonical source через installer разворачивается в целевой проект как runtime
skills, Memory Bank, workflows, protocols и validators.

Изменения оцениваются по всей цепочке:

```text
canonical source
  -> installer/generator
  -> deployed target files
  -> поведение runtime-агента
  -> workflow state, gates и handoffs
```

Наличие файла в source repo не означает, что он доступен runtime-агенту в
target project.

# Skills как executable workflow contracts

Runtime skills, shared workflows, protocol shapes и validators являются частями
одного публичного workflow contract.

Без отдельного решения нельзя менять или терять:

- inputs, outputs, statuses и verdicts;
- lifecycle и status ownership;
- blockers, stop conditions и resume routes;
- required gates и handoffs;
- task schema и registry semantics.

Leaf skill должен описывать собственный outcome и immediate handoff, а общие
правила получать из доступного в target canonical reference.

## Стиль runtime-инструкций

- Пиши runtime-инструкции только для исполняющего агента. Перед сохранением сокращай или объединяй формулировки и удаляй текст, если это не меняет допустимое поведение агента и workflow contract.
- Из однозначных contract-equivalent вариантов выбирай кратчайший. Не дублируй правила; rationale, пояснения и примеры оставляй только когда они нужны для однозначного исполнения.
- Каждая инструкция должна защищать workflow contract, корректность, безопасность или совместимость.
- Inputs, outputs, gates, blockers, validation и handoff формулируй нормативно.
- В остальных случаях избегай повелительного тона: внутреннюю тактику и порядок действий оставляй на выбор агента.
- Не превращай примеры, предпочтения и best practices в обязательные шаги.
- Сокращение текста не должно менять statuses, ownership, stop conditions и resume routes.

## Цель и тактика

- В инструкциях, промптах и ответах фиксируй цель, ограничения и критерии результата.
- Не предписывай тактику, шаги, порядок или инструменты без основания в корректности, безопасности, совместимости или workflow contract; оставляй их выбор агенту.

## Strict relevance and scope / No scope creep

- Отвечай только на поставленный вопрос и рассматривай только затронутые аспекты.
- Не добавляй смежные улучшения, use cases, будущие риски, альтернативные архитектуры или best practices без запроса.
- Включай finding только если он подтверждён, материален и влияет на запрошенное решение.
- Не превращай brainstorming в расширение requirements или scope.
- Предлагай архитектурный элемент только когда его ценность оправдывает стоимость реализации, проверки и сопровождения.
- Не сообщай отклонённые speculative candidates.
- В план включай только изменения, необходимые для принятого результата.
- Смежный blocker сообщи кратко и не развивай без запроса.

## Creator Vibe Lens

Считай `creator-vibe` постоянной интерпретационной линзой для каждого сообщения
пользователя до классификации задачи и буквального исполнения запроса.
Учитывай, что пользователь пытается сделать возможным, какой опыт должен дать
результат и что в нём должно остаться узнаваемо авторским.

Линза не отменяет явные инструкции, фактическую точность, safety-ограничения,
exact-output требования и strict scope. Не придумывай requirements и не
расширяй scope от имени `creator-vibe`. В фактических, механических и полностью
определённых задачах проявляй линзу только через аккуратность, ясность и уважение
к времени пользователя.

Если успех существенно зависит от вкуса, голоса, человеческого опыта или
неявного замысла, до более узких skills прочитай и применяй
`skills/_shared/references/commands/creator-vibe.md` как project-local skill.
Не пересказывай интерпретацию пользователю без запроса; она должна проявляться
в результате.

## Reasoning Policy: Selection Before Expansion (KISS Gate)

**Core rule:** A sufficient solution is a reason to stop expanding, not an
invitation to add optional improvements.

Within the discretion left to you, select the simplest solution sufficient for
the requested outcome and required contracts. Treat every added mechanism,
abstraction, safeguard, edge-case handling, future-proofing measure, or process
as a separate candidate. Include it only when an accepted requirement,
applicable constraint, or evidenced material risk justifies its total
implementation, verification, and ownership cost. Possible usefulness, best
practice, or greater completeness is not sufficient justification.

A discovered risk, edge case, or possible failure is not automatically a
requirement. Assess its realism, impact, recoverability, and remedy cost in the
current deployment. Use the cheapest sufficient remedy for an accepted
requirement. If an uncovered serious problem requires expanding the accepted
target, ask the operator. Otherwise accept or defer a risk whose remedy costs
materially more than its expected impact. Agent discretion permits only a local
safeguard with negligible cost and no new state or lifecycle.

If an additional mechanism compensates for a weakness introduced by the base
solution, first revise or simplify the base candidate. Stop when the outcome and
required contracts are satisfied.

Accepted requirements authorize outcomes, not unnecessarily complex
mechanisms. Agent-generated reviews, specifications, brainstorm results, and
best-practice recommendations cannot authorize their own complexity. Do not
reopen accepted requirements, operator decisions, or governing sources.

Report evidenced defects and issues affecting the requested verdict. Do not
propose or report optional improvements, rejected candidates, or speculative
observations unless the user explicitly asks for them.


## Редактирование

- Для небольшой однозначной правки не описывай план и не пересказывай задачу.
- Не сопровождай изменения очевидными пояснениями или рассуждениями.
- После правки сообщай только результат, изменённые файлы и проверки.

## Log papercuts

Record minor, evidence-backed problems in the project's code, architecture, or
structure encountered during current work.
If current work proves a project-wide problem that makes continuation unsafe or
invalid, record it in ALL CAPS and stop.

Use one Markdown file per agent session. Create it only when the first papercut
occurs, at `PAPERCUTS/<model> __ MM-DD-YYYY HH.MM.md`, using the current model
identifier and the local time of that first papercut. Replace filename-unsafe
characters in the model identifier with `-`. Reuse that file for every later
papercut in the same session; do not create a file for each note and do not add
timestamps inside the file.

# Правила рефакторинга framework

Перед изменением `skills/mb-garden/assets/mb-doctor.mjs` или модулей в
`skills/mb-garden/assets/mb-doctor/` прочитай
`skills/mb-garden/assets/mb-doctor/AGENTS.md`.

При рефакторинге skills, workflows, protocols или installer обязательно проверь:

- доступен ли runtime-агенту каждый required reference/template в target;
- не ссылается ли deployed skill на source-only path;
- сохранён ли executable workflow contract;
- работает ли изменение после установки в изолированный target.

Более короткий или чистый prompt не считается успешным refactor, если
развёрнутый skill теряет контекст или нарушает workflow contract.

# Граница проекта и агентной памяти

Этот репозиторий сам является проектом `memobank_BMAD_SDD`.

Все файлы и папки в рабочем дереве, кроме `AGENTS.md`, `IMPROVING-PRJ-PRMPT/`, пользовательских workflow-записей в `PAPERCUTS/` и локально развернутых generated-директорий (`.memory-bank/`, `.protocols/`, `.tasks/`, `.agents/`, `.claude/`, `.codex/`), являются целевыми исходными файлами проекта и должны рассматриваться как product/source files.

Важно:

- `skills/`, `scripts/`, `.github/`, `README*`, `PROJECT_MAP.md` и другие tracked файлы репозитория — это не личная память текущего агента.
- `.memory-bank/`, `.protocols/`, `.tasks/`, `.agents/`, `.claude/`, `.codex/` в этом source repo являются ignored generated dogfood/runtime output. Они не являются canonical source и не должны коммититься.
- Их нельзя использовать как scratchpad, temporary notes или внутреннюю память агента без явного разрешения пользователя или без того, что это прямо входит в задачу.
- Если задача просит изменить framework, workflow, skills, scripts, docs или generated skeleton behavior, изменения этих файлов являются изменениями продукта.
- Planning artifacts для текущей работы можно создавать только там, где это явно разрешено ролью и задачей, например `.protocols/<TASK-ID>/plan.md` или согласованный planning файл.
- `IMPROVING-PRJ-PRMPT/` содержит входные пожелания/брифы пользователя и не является частью целевого продукта, если пользователь явно не сказал обратное.
- Не путай Memory Bank framework, который разрабатывается в этом репозитории, с runtime memory текущего агента. В этом repo canonical Memory Bank framework source живет в `skills/_shared/` и связанных scripts/docs; локальный `.memory-bank/` — только ignored dogfood output.

# Стратегия разработки

## Автономность исполнения и стабильность workflow-контрактов

Этот раздел относится только к runtime skills, которые DevRails разворачивает в
целевые проекты, и к агентам, выполняющим эти skills. Он не регулирует выбор
skills/tools текущим агентом-разработчиком DevRails.

- Runtime skill фиксирует objective, inputs, hard boundaries, required outputs,
  validation и handoff, но не диктует внутреннюю тактику без причины, связанной
  с корректностью, риском или совместимостью.
- Ручной и unattended flow сохраняют один workflow contract: lifecycle, status
  ownership, gates, blockers, validation и handoffs. Режим может менять только
  способ запуска, продолжения и получения решений оператора, если это прямо
  определено contract.
- Агент сам выбирает порядок действий, инструменты и минимально достаточный путь
  внутри objective, scope, source of truth, safety-ограничений и tier policy.
- Если runtime skill предусматривает анкетирование, любая релевантная
  неоднозначность или развилка, доступная решению оператора, требует его явного
  ответа. Рекомендация или default агента не считаются решением.
- В unattended flow применяется только уже принятое authoritative решение;
  иначе агент использует существующий blocker/terminal halt, а не выбирает за
  оператора.

# Source-only packaging

Перед доработкой проекта прочитай `PROJECT_MAP.md`.

Этот проект использует source-only модель упаковки skills:

- `skills/_shared/` — единственный canonical source для общих prompts, references и scripts.
- В рабочем дереве намеренно нет package-local файлов `skills/*/{agents,references,scripts}/shared-*`.
- В git намеренно нет tracked `.memory-bank/*` baseline; bootstrap/smoke проверяет generated Memory Bank во временной target-директории.
- При установке фреймворка shared-файлы разворачиваются только во временной копии репозитория для трёх package entrypoints: `start`, `mb-init` и `mb-garden`.
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

Для проверки установки и bootstrap используй изолированные временные targets:

```bash
tmp_target="$(mktemp -d)"

node scripts/install-framework.mjs \
  --install-only \
  --target "$tmp_target/install-only" \
  --yes

node scripts/install-framework.mjs \
  --bootstrap \
  --target "$tmp_target/bootstrap" \
  --yes
```

Если нужно посмотреть временно развёрнутые package-local `shared-*` файлы, запускай:

```bash
MEMOBANK_KEEP_INSTALL_TMP=1 node scripts/install-framework.mjs --install-only --yes
```
