# Installer Improvements

## Задание

Переработать install/bootstrap flow DevRails 26 так, чтобы после установки
команды были полноценными runtime skills в target project, без промежуточного
proxy-hop через `.memory-bank/commands/*`.

Целевая модель:

```text
source repo
  skills/_shared/references/commands/*.md   canonical command source

target repo
  .agents/skills/<command>/SKILL.md         full Codex skill
  .claude/skills/<command>/SKILL.md         full Claude skill
  .memory-bank/                             project skeleton/state only
  scripts/mb-lint.mjs
  scripts/mb-doctor.mjs
  AGENTS.md / CLAUDE.md
```

`.memory-bank/commands/*` в target project больше не создается и не является
runtime source of truth.

## Почему

Сейчас installer сначала ставит package skills в `.agents/skills`, а bootstrap
потом пытается создать command proxy skills с теми же именами. Для Codex это
создает коллизии: package skill успевает занять путь, и proxy на
`.memory-bank/commands/<command>.md` не записывается.

Новая модель устраняет:

- конфликт package skill vs generated proxy skill;
- лишний контекстный hop `SKILL.md -> .memory-bank/commands/*.md`;
- расхождение Codex и Claude по тому, какой текст команды они читают.

## Scope

Основные файлы:

- `scripts/install-framework.mjs`
- `skills/_shared/scripts/init-mb.js`
- `.github/workflows/release-check.yml`

Связанные source docs и references:

- `README.md`
- `howItWorks.md`
- `PROJECT_MAP.md`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/commands/*.md`
- `skills/*/SKILL.md`, если они описывают install/bootstrap или command routing

## Design

### Installer

`scripts/install-framework.mjs` должен:

1. Подготовить source-only repo во временной директории, если это все еще нужно
   для чтения shared command sources/assets.
2. Не вызывать `npx skills add <prepared-repo>` для target project как способ
   установки runtime command skills.
3. Сгенерировать full runtime skills напрямую из
   `skills/_shared/references/commands/*.md`:
   - `.agents/skills/<command>/SKILL.md`
   - `.claude/skills/<command>/SKILL.md`
4. Вставлять в каждый generated skill полный текст command spec, а не строку
   `Read and follow .memory-bank/commands/...`.
5. Добавлять generated marker, чтобы `--sync` мог безопасно обновлять только
   framework-generated skills.
6. Не трогать пользовательские custom skills без generated marker.

### Bootstrap

`skills/_shared/scripts/init-mb.js` остается нужен, но его роль сужается.

Он должен создавать/синхронизировать:

- `.memory-bank/` skeleton/state docs;
- `.memory-bank/workflows/*`;
- `.memory-bank/roles/*`;
- `.memory-bank/spec-index.md`;
- `.memory-bank/spec-backbone.md`;
- `.memory-bank/tasks/index.json`;
- `scripts/mb-lint.mjs`;
- `scripts/mb-doctor.mjs`;
- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` по принятой policy.

Он больше не должен создавать:

- `.memory-bank/commands/*.md`;
- `.memory-bank/commands/index.md`;
- proxy skills в `.agents/skills/*`;
- proxy skills в `.claude/skills/*`.

### AGENTS.md

`AGENTS.md` должен перестать маршрутизировать команды в
`.memory-bank/commands/*.md`.

Вместо старого формата:

```md
## Entry points
- /cold-start -> .memory-bank/commands/cold-start.md
- /mb -> .memory-bank/commands/mb.md
```

использовать короткий формат:

```md
## Entry points
Workflow commands are installed as project skills for Codex and Claude.
Start with /cold-start.

Core manual chain:
/analysis -> /brief -> /constitution -> /write-prd -> /spec-init -> /prd -> ...
```

### Existing AGENTS.md policy

При bootstrap проверять, есть ли в target project существующий `AGENTS.md`.

Если `AGENTS.md` уже есть, в interactive mode дать выбор:

- заменить существующий `AGENTS.md` разворачиваемым вариантом;
- слить существующий `AGENTS.md` с разворачиваемым вариантом.

Рекомендуемый вариант по умолчанию: замена.

Merge должен быть простым и предсказуемым, без LLM-синтеза.

После выбора merge installer обязан показать user-facing warning:

```text
Крайне рекомендуется проверить обновленный AGENTS.md на противоречия и двусмысленность! Слияние было сделано автоматически, без семантических проверок
```

### Branding

Во всех user-facing сообщениях installer/bootstrap использовать `DevRails 26`,
не `memoflow`.

## Migration Notes

- Source-only модель остается: canonical command source в source repo живет в
  `skills/_shared/references/commands/*.md`.
- Vendoring package-local `shared-*` может остаться для packaging/release
  сценариев, но target install не должен зависеть от `npx skills add` как
  способа записи runtime command layer.
- Если direct `skills add` режим все еще нужен для development/debug, он должен
  быть явно отделен от normal target bootstrap и не должен загрязнять target
  `.agents/skills` package skills с именами runtime commands.

## Rules

- Не создавать отдельный installer workflow.
- Не поддерживать дополнительные runtime providers кроме Codex и Claude.
- В target project `.agents/skills` и `.claude/skills` являются финальным
  runtime command layer.
- `.memory-bank` хранит project state/docs, но не command specs.
- Sync должен быть идемпотентным.
- Sync не должен затирать пользовательские custom skills без generated marker.
- Replacement `AGENTS.md` не должен затрагивать другие файлы Memory Bank.

## Acceptance Criteria

- Fresh install создает full command skills:
  - `.agents/skills/<command>/SKILL.md`
  - `.claude/skills/<command>/SKILL.md`
- Generated runtime skills содержат полный command spec, а не proxy-строку
  `Read and follow .memory-bank/commands/...`.
- Fresh install не создает `.memory-bank/commands/`.
- В target project нет package-skill/proxy collision для Codex.
- Codex и Claude получают одинаковый текст команды для одинакового command name.
- `AGENTS.md` не содержит ссылок на `.memory-bank/commands/*.md`.
- Installer output не использует старое название `memoflow` в user-facing тексте.
- При существующем `AGENTS.md` installer явно сообщает об этом.
- В interactive mode пользователь может выбрать replacement или merge.
- Default/recommended choice для `AGENTS.md`: replacement.
- После merge existing/new `AGENTS.md` installer показывает warning:
  `Крайне рекомендуется проверить обновленный AGENTS.md на противоречия и двусмысленность! Слияние было сделано автоматически, без семантических проверок`.
- Non-interactive mode остается безопасным и предсказуемым.
- Bootstrap smoke продолжает проходить.
- Source-only hygiene check продолжает возвращать `0` для package-local
  `shared-*` в source tree.
