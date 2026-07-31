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

- Пиши лаконично и agent-oriented: фиксируй требуемый результат и ограничения без повторов, воды и очевидных пояснений.
- Каждая инструкция должна защищать workflow contract, корректность, безопасность или совместимость.
- Inputs, outputs, gates, blockers, validation и handoff формулируй нормативно.
- В остальных случаях избегай повелительного тона: внутреннюю тактику и порядок действий оставляй на выбор агента.
- Не превращай примеры, предпочтения и best practices в обязательные шаги.
- Сокращение текста не должно менять statuses, ownership, stop conditions и resume routes.

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

## Редактирование

- Для небольшой однозначной правки не описывай план и не пересказывай задачу.
- Не сопровождай изменения очевидными пояснениями или рассуждениями.
- После правки сообщай только результат, изменённые файлы и проверки.

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

Все файлы и папки в рабочем дереве, кроме `AGENTS.md`, `IMPROVING-PRJ-PRMPT/` и локально развернутых generated-директорий (`.memory-bank/`, `.protocols/`, `.tasks/`, `.agents/`, `.claude/`, `.codex/`), являются целевыми исходными файлами проекта и должны рассматриваться как product/source files.

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

## KISS / Avoid overengineering

- Implement the simplest solution that fully satisfies current requirements and specs.
- Prefer existing project patterns over new abstractions, layers, registries, frameworks, or workflow artifacts.
- Do not design for hypothetical future scale, integrations, configurability, or reuse without a concrete current requirement.
- Do not introduce enterprise architecture or additional process merely because it may be useful later.
- Added complexity must be justified by an existing requirement, constraint, risk, or demonstrated duplication.
- KISS does not permit skipping required correctness, security, compatibility, or verification gates.

# Source-only packaging

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
