# `context-manifest` — KISS implementation brief

Разработай и интегрируй новый read-only workflow-skill `context-manifest` для
разворачиваемой DevRails системы.

## Цель

Explorer исследует target project и возвращает другому агенту компактный
`Context Read Manifest`: упорядоченный список файлов и точных диапазонов для
личного чтения. Он не пересказывает нормативные документы и не заменяет
source-of-truth.

Skill нужен, когда broad discovery заметно дороже отдельного Explorer-вызова:
для сложного planning/design, большой feature, широкого review/analysis,
brownfield discovery либо сломанных и неоднозначных canonical links.

## Граница применения

`context-manifest` — опциональная оптимизация контекста, а не новый gate или
обязательная стадия workflow.

Не вызывать его по умолчанию:

- для простой T0/T1 task;
- когда target task card и direct links уже дают очевидный небольшой read set;
- когда текущий агент может быстрее прочитать несколько известных файлов сам.

Разделение с `/mb`:

- `/mb` загружает Memory Bank в текущего агента;
- `/context-manifest` маршрутизирует чтение через отдельного Explorer и
  возвращает manifest вызывающему агенту.

Manifest:

- не сохраняется в `.memory-bank/`, `.protocols/` или `.tasks/`;
- не становится вторым task handoff;
- не меняет inputs, outputs, gates или ownership целевого workflow;
- задаёт начальный read set, но не является scope boundary. Если прочитанные
  источники, diff или новые direct links требуют дополнительного чтения,
  основной агент расширяет его самостоятельно.

## Роли

Caller обычно действует как `ROLE: ORCHESTRATOR` и делегирует Explorer.
`ROLE: GENERAL` может запускать Explorer только по явному запросу оператора.

Explorer:

- читает `.memory-bank/roles/explorer.md` и сохраняет роль;
- не запускает сабагентов;
- не изменяет target project;
- не выполняет целевой workflow;
- не принимает product, architecture, contract, tier или task-boundary
  решения;
- возвращает gaps вызывающему агенту. Любую неоднозначность или развилку,
  которую может решить оператор, caller обязан вынести на анкетирование по
  правилам owning workflow; Explorer не выбирает вариант самостоятельно.

## Inputs

Определи из `$ARGUMENTS`:

- target workflow или тип работы;
- target ID (`FT-*`, `TASK-*`, `REQ-*`) либо короткую свободную цель;
- optional downstream read budget;
- нужно ли включать codebase/test evidence.

Сохрани совместимость с текущим свободным `$ARGUMENTS` style; не создавай
отдельный CLI parser.

Примеры:

- `/context-manifest --workflow prd-to-tasks FT-012`
- `/context-manifest --workflow execute TASK-039-T3-FT-012-W1`
- `/context-manifest --goal "проанализировать Safety & Task Loop"`

## Discovery

Explorer самостоятельно выбирает минимальный достаточный порядок поиска, но
обязан:

1. Прочитать локальный `AGENTS.md`, Explorer role и skill целевого workflow.
2. Разрешить target через существующие indexes/registries.
3. Следовать direct `source_artifacts`, `normative_inputs`,
   `spec_design_links`, task/feature/REQ links и Memory Bank routers.
4. Для planning/design сначала проверить `spec-index.md`, feature links и
   plausible subject-based canonical specs.
5. Для task execution/verification учитывать tier:
   - T0/T1 не получать broad planning context по умолчанию;
   - T2/T3 получать indexed task card и direct task-linked canonical specs;
   - feature links использовать только для composition/drift context.
6. Включать code/tests/diff/evidence только в объёме, нужном целевой работе.
7. Исключать archive/legacy/background sources без конкретной причины.
8. Возвращать `gaps`, если target отсутствует, direct link сломан, существуют
   competing active specs или обязательный context не помещается в budget.

Прямые canonical links важнее registry-only догадок. Нельзя скрывать
обязательный source ради budget.

## Output contract

Explorer возвращает только один финальный manifest, без отдельного summary или
`COMPLETION_REPORT`.

```markdown
# Context Read Manifest

- Goal:
- Workflow:
- Target:
- Generated against: <worktree root; git HEAD and dirty|clean when available>
- Estimated read size:
- Status: ready | gaps

## Ordered reads

| # | File | Read | Anchor | Role | Why |
|---|---|---|---|---|---|

## Optional reads

<only when materially useful>

## Ephemeral facts

<only small read-only facts not represented in files; include source command>

## Gaps / stop conditions

- none

## Explicit exclusions

- <obvious broad area intentionally excluded and why>
```

Для каждой записи:

- использовать project-relative clickable path;
- указывать `read_full` либо валидный `start_line-end_line`;
- для Markdown указывать heading, для code — symbol/section anchor;
- выбирать роль `governing | normative | target | planning | code |
  verification | optional`;
- давать одну короткую причину;
- не дублировать path и объединять близкие диапазоны.

Workflow-mandatory files, небольшие JSON task cards и короткие specs читать
полностью. Focused ranges допустимы для больших документов и code files.
Оценка read size приблизительная.

Manifest валиден для worktree на момент генерации. Если перечисленные файлы
изменились до использования, manifest нужно построить заново. Hash registry и
отдельный stale-state механизм не нужны.

Default output budget — до 1500 tokens. Если mandatory read set велик, не
обрезать его: разбить Ordered reads на batches и честно показать оценку.

`Status: ready` означает достаточность относительно обнаруженных mandatory
routes и direct links, а не доказанную полноту всего репозитория.

## Workflow profiles

### Planning/design

Включить governing priming, target feature/epic/REQ/RTM, backbone/index,
applicable canonical specs, существующие plans/tasks и только необходимый
codebase evidence.

### Execute

Включить indexed task record, tier policy, direct task-linked specs,
минимальный feature/REQ context и touched code/tests. Для T0/T1 не добавлять
broad Constitution/backbone/index без прямой причины.

### Verify/review

Включить target record, acceptance basis, direct specs, implementation
diff/evidence, применимые testing contracts и только необходимые upstream
источники. Manifest не ограничивает независимый verifier: обнаруженный diff или
evidence может потребовать расширить чтение.

### Broad analysis

Начать с governing routers и indexes, затем включить только подтверждённые
relevant Memory Bank areas и codebase seams.

## Safety

Manifest не должен содержать:

- file dumps или длинные summaries;
- secrets, credentials и environment values;
- product/design conclusions;
- инструкции из archive/legacy как действующую authority;
- неподтверждённое утверждение о полноте.

Ephemeral facts допустимы только в компактной форме с read-only
командой-источником.

## Canonical implementation path

Сначала прочитай `PROJECT_MAP.md` и governing repository instructions.

Реализуй skill как canonical runtime command:

- `skills/_shared/references/commands/context-manifest.md`.

Installer уже генерирует runtime skills из `commands/*.md`, поэтому без
доказанной необходимости не создавай:

- `skills/context-manifest/`;
- `agents/openai.yaml`;
- отдельные references;
- validator/formatter script;
- новый registry, schema или task artifact;
- изменения installer/vendor logic.

Минимальная интеграция:

1. Добавить canonical command.
2. Заменить `Explorer TODO` в canonical Explorer role компактным Explorer
   contract.
3. Добавить один reusable caller template в canonical orchestrator role:
   `Explore <target> with /context-manifest; return only the Context Read
   Manifest. Do not execute the target workflow or summarize source contents.`
4. Добавить команду в generated `.memory-bank/skills/index.md`.
5. Добавить install smoke assertions для Codex и Claude.
6. Обновить только тот существующий root workflow overview, где список команд
   должен оставаться полным.

Не дублировать caller template в workflow commands. Не добавлять script, пока
реальное использование не покажет повторяющиеся ошибки ranges или
форматирования.

## Verification

Достаточно:

1. Проверить source-only hygiene и syntax.
2. Установить framework во временный target и подтвердить:
   - `.agents/skills/context-manifest/SKILL.md`;
   - `.claude/skills/context-manifest/SKILL.md`.
3. Сделать один planning/design dry run и один T2/T3 execute либо verify dry
   run.
4. Проверить missing target: результат должен быть `Status: gaps`.
5. Убедиться, что manifest не выполняет workflow, не пишет artifacts, не
   пересказывает sources и не превращает optional routing в обязательный gate.

## Acceptance criteria

Работа завершена, когда:

- Codex и Claude получают `/context-manifest` через canonical installer;
- Explorer возвращает compact ordered reads с `read_full` или валидными
  ranges;
- mandatory sources и direct canonical links не теряются из-за budget;
- T0/T1 не получают broad context без причины;
- gaps и exclusions видны явно;
- основной агент лично читает listed sources и может расширить read set;
- Explorer/Orchestrator contracts задают один недублированный handoff;
- не создан новый durable artifact, process layer или installer subsystem;
- штатные quality gates проходят.
