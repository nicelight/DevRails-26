# Промпт для агента: TUI-установка memobank одной командой

## Роль

Ты выступаешь как инженер-продуктовик и разработчик CLI/TUI tooling для проекта `memobank_BMAD_SDD`.

Твоя задача не просто написать код, а сначала разобраться в текущей модели установки, предложить варианты реализации, обсудить плюсы и минусы с пользователем, получить подтверждение выбранного подхода и только после этого брать реализацию.

## Контекст проекта

`memobank` - это source-only skill pack/framework для Codex CLI, Claude Code, OpenCode и совместимых agent runtimes.

Он нужен, чтобы агентная разработка велась не только через историю чата, а через файлы проекта:

- `.memory-bank/` - знания и состояние проекта: продукт, требования, features, task records, индексы, правила.
- `.protocols/` - планы, прогресс и verification по задачам/features.
- `.tasks/` - runtime evidence, reports, handoff-файлы.
- `.memory-bank/tasks/index.json` и `.memory-bank/tasks/TASK-*.task.json` - JSON task registry.

Сейчас установка состоит из двух разных действий:

1. Установить package skills в agent runtime.
2. Bootstrap-нуть Memory Bank skeleton в целевой проект.

Текущий ручной flow:

```bash
node scripts/install-framework.mjs --skill '*' --yes
```

Затем в целевом проекте:

```text
/mb-init
```

Если project command proxies еще недоступны, можно запустить bootstrap script напрямую:

```bash
node .agents/skills/mb-init/scripts/shared-init-mb.js
```

## Важный нюанс source-only packaging

Этот fork намеренно не хранит generated package-local `shared-*` файлы внутри каждого skill.

Canonical shared source лежит здесь:

```text
skills/_shared/
```

В source tree **нет** таких generated файлов:

```text
skills/<skill>/agents/shared-*
skills/<skill>/references/shared-*
skills/<skill>/scripts/shared-*
```

Поэтому прямой:

```bash
npx skills add <repo>
```

для этого fork не подходит.

Нужно сначала подготовить временную vendored copy:

```text
source-only repo
  -> scripts/install-framework.mjs
  -> temporary repo copy
  -> scripts/vendor-shared.mjs
  -> generated shared-* files
  -> npx -y skills add <prepared-temp-repo> ...
```

Текущий wrapper:

```text
scripts/install-framework.mjs
```

уже делает временную копию, запускает `scripts/vendor-shared.mjs`, затем вызывает:

```bash
npx -y skills add <prepared-temp-repo> ...
```

После этого временная директория удаляется, если не задан:

```bash
MEMOBANK_KEEP_INSTALL_TMP=1
```

## Проблема

Текущий UX установки для новичка неочевиден:

- сначала нужно понять, зачем нужен wrapper;
- затем нужно понять, где запускать `/mb-init`;
- затем нужно понять, что делать, если slash command еще недоступна;
- нужно вручную выбрать целевой проект;
- установка skills и bootstrap Memory Bank выглядят как разные несвязанные операции.

Пользователь хочет более простой сценарий:

> Сделать красивый TUI-интерфейс установки memobank в проект одной командой с последующим выбором целевой папки проекта.

## Цель задачи

Спроектировать и реализовать установку memobank через одну удобную команду, которая:

1. Запускает понятный TUI.
2. Объясняет пользователю, что будет сделано.
3. Позволяет выбрать целевую папку проекта.
4. Устанавливает package skills с учетом source-only vendoring.
5. Bootstrap-ит Memory Bank skeleton в выбранный проект.
6. Безопасно обрабатывает уже существующий `.memory-bank/`.
7. Показывает итог: что установлено, куда, какие команды запускать дальше.

## Обязательная стратегия работы

Сначала **не пиши код**.

Сначала сделай analysis/design pass:

1. Прочитай текущие файлы:
   - `README.ru.md`
   - `howItWorks.md`
   - `PROJECT_MAP.md`
   - `package.json`
   - `scripts/install-framework.mjs`
   - `scripts/vendor-shared.mjs`
   - `skills/_shared/scripts/init-mb.js`
   - `.github/workflows/release-check.yml`
2. Объясни текущий install/bootstrap flow простыми словами.
3. Предложи 2-4 варианта реализации TUI.
4. Для каждого варианта опиши:
   - что меняется;
   - пользовательский сценарий;
   - плюсы;
   - минусы;
   - риски;
   - какие файлы придется менять;
   - как проверять.
5. Дай свою рекомендацию.
6. Попроси пользователя утвердить вариант.
7. Только после явного подтверждения пользователя переходи к реализации.

## Варианты, которые обязательно нужно рассмотреть

### Вариант A: расширить `scripts/install-framework.mjs`

Добавить в существующий wrapper флаги вроде:

```bash
node scripts/install-framework.mjs --tui
node scripts/install-framework.mjs --bootstrap
node scripts/install-framework.mjs --target /path/to/project
```

Возможная логика:

```text
install-framework.mjs
  -> TUI выбора target project
  -> temporary vendored copy
  -> skills add
  -> run preparedRepo/skills/mb-init/scripts/shared-init-mb.js in target project
```

Ключевая идея: bootstrap можно запускать прямо из prepared temp repo, не завися от того, куда runtime физически установил skill.

### Вариант B: отдельный script `scripts/install-tui.mjs`

Создать отдельный entrypoint:

```bash
node scripts/install-tui.mjs
```

Он использует существующие функции/логику install-framework или вызывает его как subprocess.

Плюс: меньше риска сломать текущий wrapper.

Минус: появляется второй install entrypoint, нужно синхронизировать документацию и package bin.

### Вариант C: split core + TUI wrapper

Вынести общую install/bootstrap логику в reusable module, например:

```text
scripts/lib/install-core.mjs
scripts/install-framework.mjs
scripts/install-tui.mjs
```

Плюс: чище архитектура.

Минус: больше refactor, больше regression surface.

### Вариант D: минимальный non-TUI one-command mode

Сначала сделать не TUI, а безопасный one-command mode:

```bash
node scripts/install-framework.mjs --bootstrap --target /path/to/project
```

Потом поверх него добавить TUI.

Плюс: меньше риск, проще проверить.

Минус: не закрывает полностью запрос на красивый TUI сразу.

## Требования к TUI

TUI должен быть практичным, без тяжелого overengineering.

Минимально ожидаемые экраны/шаги:

1. Приветствие:
   - что будет установлено;
   - что будет создано в target repo.
2. Выбор target папки:
   - текущая директория;
   - ввести путь вручную;
   - возможно выбрать из последних/родительских директорий, если это просто реализовать.
3. Проверка target:
   - существует ли папка;
   - является ли она git repo;
   - есть ли там `.memory-bank/`;
   - есть ли уже `AGENTS.md`;
   - есть ли права на запись.
4. Режим действия:
   - fresh bootstrap;
   - sync existing Memory Bank;
   - install skills only;
   - bootstrap only, если skills уже стоят или bootstrap запускается из prepared repo.
5. Confirmation screen:
   - source repo;
   - target repo;
   - какие операции будут выполнены.
6. Progress:
   - vendoring;
   - `skills add`;
   - bootstrap/sync;
   - checks.
7. Итог:
   - success/failure;
   - что создано;
   - следующая команда: `/cold-start` или manual flow.

## Безопасность и ограничения

Не ломай текущий рабочий flow:

```bash
node scripts/install-framework.mjs --skill '*' --yes
```

Он должен остаться рабочим.

Не коммить generated `shared-*` в source tree.

После изменений source tree должен сохранять:

```bash
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Ожидаемый результат:

```text
0
```

Bootstrap target repo должен быть safe-by-default:

- не перетирать пользовательские файлы без явного `--force`/подтверждения;
- если `.memory-bank/` уже есть, предпочитать sync/update generated files;
- предупреждать перед изменением существующего `AGENTS.md`;
- не делать deploy/prod writes/secret reads;
- не трогать файлы вне target repo.

## Возможные зависимости для TUI

Перед выбором библиотеки проверь текущий `package.json`.

Сейчас проект минимальный и не имеет тяжелого dependency stack.

Возможные варианты:

1. Без зависимостей, через `node:readline/promises`.
   - Плюсы: просто, no dependency.
   - Минусы: это скорее интерактивный CLI, не полноценный TUI.

2. `@inquirer/prompts`.
   - Плюсы: понятный интерактивный UX, выборы, input, confirm.
   - Минусы: новая dependency.

3. `ink` / React TUI.
   - Плюсы: красиво.
   - Минусы: слишком тяжело для install flow, выше стоимость поддержки.

4. `enquirer` или аналог.
   - Плюсы: легкий prompt UX.
   - Минусы: еще одна dependency, нужно оценить maintenance.

Рекомендация должна учитывать KISS: лучше понятный надежный installer, чем эффектный, но хрупкий TUI.

## Ожидаемый результат после согласования и реализации

После утверждения подхода пользователь ожидает:

- одну команду для интерактивной установки;
- выбор целевой папки проекта;
- установку skills через правильный source-only wrapper/vendoring flow;
- bootstrap Memory Bank в выбранный project folder;
- понятный итог и next steps.

Возможные команды после реализации:

```bash
node scripts/install-framework.mjs --tui
```

или:

```bash
node scripts/install-tui.mjs
```

или package bin:

```bash
memobank-install --tui
```

Конкретный вариант нужно сначала согласовать с пользователем.

## Проверки после реализации

Минимальные проверки:

```bash
npm run check:syntax --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
node scripts/install-framework.mjs --skill '*' --yes
```

Если добавлен TUI/non-TUI bootstrap mode, добавить smoke test на временной директории:

```bash
tmpdir="$(mktemp -d)"
node scripts/install-framework.mjs --bootstrap --target "$tmpdir" --yes
test -f "$tmpdir/.memory-bank/tasks/index.json"
test -f "$tmpdir/AGENTS.md"
```

Если TUI требует ручного ввода, предусмотреть non-interactive флаги для CI:

```bash
--target <path>
--yes
--no-tui
--install-only
--bootstrap-only
--sync
```

## Документация после реализации

После реализации обновить:

- `README.ru.md`
- `README.en.md`, если английский README должен отражать новый install flow
- `howItWorks.md`
- возможно `PROJECT_MAP.md`, если изменились install hotspots/checks

README должен показывать простой happy path, например:

```bash
node scripts/install-framework.mjs --tui
```

А подробная механика должна оставаться в `howItWorks.md`.

## Что вернуть пользователю на первом этапе

На первом этапе, до кода, верни:

1. Краткое объяснение текущей проблемы.
2. 2-4 варианта реализации.
3. Таблицу плюсов/минусов.
4. Рекомендованный вариант.
5. Список файлов, которые придется изменить.
6. Список проверок.
7. Прямой вопрос: какой вариант утверждаем?

Не переходи к реализации, пока пользователь явно не утвердит подход.
