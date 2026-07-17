Разработай и интегрируй новый workflow-skill для Memory Bank.

  Рабочее название: `context-manifest`.
  Если discovery покажет, что существующая naming-система требует другого имени,
  выбери короткое hyphen-case имя и объясни решение.

  ## Проблема

  Сейчас основной агент-оркестратор часто расходует контекстное окно на:

  - широкий поиск по Memory Bank;
  - чтение нерелевантных или дублирующихся specs;
  - повторное чтение файлов после truncated tool output;
  - длинные отчёты Explorer-сабагентов;
  - загрузку codebase evidence, которую можно было предварительно маршрутизировать.

  Нужен отдельный skill для Explorer-сабагента. Explorer должен самостоятельно
  исследовать target project и вернуть оркестратору компактный и достаточный
  `Context Read Manifest`, а не пересказ найденной информации.

  Оркестратор затем лично читает перечисленные файлы и диапазоны строк. Skill не
  должен заменять нормативное чтение основным агентом и не должен утверждать, что
  summary Explorer равнозначен source-of-truth.

  ## Целевая схема использования

  1. Оркестратор получает задачу, например:
     - `/prd-to-tasks FT-012`;
     - `/execute TASK-039-T3-FT-012-W1`;
     - `/verify TASK-*`;
     - review/analysis конкретной feature;
     - общий brownfield analysis.
  2. Оркестратор запускает Explorer-сабагента с минимальным контекстом:
     - target workflow;
     - task/feature ID или краткая цель;
     - путь к проекту;
     - требование использовать новый skill.
  3. Explorer читает локальные `AGENTS.md`, target workflow skill, Memory Bank
     routers, target artifacts, direct links и релевантные codebase seams.
  4. Explorer возвращает один компактный manifest.
  5. Оркестратор читает перечисленные источники самостоятельно и продолжает
     основной workflow уже с точным контекстом.

  Новый skill используется Explorer-сабагентом. Сам skill не должен запускать
  других сабагентов.

  ## Обязательный discovery перед реализацией

  Сначала прочитай governing instructions репозитория и найди source-of-truth
  системы установки/генерации project skills.

  Изучи как минимум:

  - существующий `/mb`;
  - `/map-codebase`;
  - `/prd-to-tasks`;
  - `/execute`;
  - `/verify`;
  - role contracts для orchestrator и worker/explorer;
  - `AGENTS.md` priming rules;
  - `spec-backbone.md`, `spec-index.md`, task schema и tier policy;
  - scripts, которые устанавливают или синхронизируют `.agents/skills` и
    `.claude/skills`;
  - registry/index project skills;
  - существующие tests/validators skills.

  Не редактируй generated mirrors напрямую, если проект имеет отдельный
  framework source-of-truth и sync/install path.

  Проверь, не пересекается ли новая функция с `/mb`. Предпочтительная граница:

  - `/mb` загружает контекст в текущего агента;
  - новый skill исследует проект в отдельном Explorer и возвращает manifest для
    последующего чтения другим агентом.

  ## Функциональный контракт skill

  Skill должен принимать:

  - target workflow или тип работы;
  - target ID (`FT-*`, `TASK-*`, `REQ-*`) либо свободно сформулированную цель;
  - необязательный context budget;
  - необязательное указание включать codebase evidence.

  Примеры предполагаемого вызова:

  - `/context-manifest --workflow prd-to-tasks FT-012`
  - `/context-manifest --workflow execute TASK-039-T3-FT-012-W1`
  - `/context-manifest --workflow verify TASK-039-T3-FT-012-W1`
  - `/context-manifest --goal "проанализировать Safety & Task Loop"`
  - `/context-manifest --workflow prd-to-tasks FT-012 --budget 30000`

  Не фиксируй CLI-синтаксис механически, если существующие project skills
  используют другой `$ARGUMENTS` contract. Сохрани совместимость с текущим
  workflow style.

  ## Алгоритм Explorer

  Skill должен инструктировать Explorer:

  1. Прочитать локальный `AGENTS.md`.
  2. Определить точный workflow mode и target.
  3. Прочитать skill целевого workflow, чтобы узнать его собственные mandatory
     reads и priming rules.
  4. Найти target feature/task/requirement и проверить queue/index.
  5. Следовать прямым `source_artifacts`, `normative_inputs`,
     `spec_design_links`, task links и Memory Bank routers.
  6. Различать:
     - governing sources;
     - обязательные нормативные inputs;
     - feature/task-specific context;
     - existing plans/protocols/tasks;
     - релевантные codebase seams и tests;
     - optional/background sources.
  7. Для design/planning работы выполнить registry-first discovery и проверить
     plausible subject specs.
  8. Для `/execute` соблюдать tier-aware priming:
     - T0/T1 не загружать broad Constitution/backbone по умолчанию;
     - T2/T3 читать indexed task card и direct task-linked canonical specs;
     - feature links использовать только для composition/drift context.
  9. Исключать archive/legacy docs, если активный source явно не требует их как
     evidence.
  10. Не копировать содержимое файлов в отчёт.
  11. Не возвращать длинные summaries нормативных документов.
  12. Не выполнять целевой workflow и не менять проект.
  13. Не создавать новые planning/spec/task artifacts.
  14. Не запускать других сабагентов.

  ## Требования к line ranges

  Manifest должен содержать реальные номера строк текущего worktree.

  Для каждого source укажи:

  - абсолютный или корректно кликабельный project path;
  - `read_full` либо точный диапазон `start_line–end_line`;
  - heading/anchor диапазона, если файл Markdown;
  - роль источника: `governing | normative | target | planning | code |
    verification | optional`;
  - краткую причину включения, максимум одна строка;
  - приоритет и порядок чтения.

  Правила:

  - Если целевой workflow требует лично прочитать файл полностью, помечай
    `read_full`; не сокращай его до удобного диапазона.
  - Для JSON task cards и небольших specs обычно выбирай `read_full`.
  - Для больших PRD/architecture/code files разрешены focused ranges, если
    остальные части не влияют на текущую задачу.
  - Диапазоны должны быть валидны:
    `1 <= start_line <= end_line <= file_line_count`.
  - Объединяй пересекающиеся и близкие диапазоны одного файла.
  - Не дублируй один и тот же файл в нескольких разделах без необходимости.
  - Добавляй heading anchor, чтобы line-number drift было легко заметить.
  - Укажи, что manifest валиден для текущего worktree на момент генерации.
  - Если после генерации изменились перечисленные файлы, manifest считается
    stale и должен быть построен заново.

  Предпочтительно предусмотреть небольшой deterministic script, который:

  - проверяет существование путей;
  - считает строки;
  - валидирует ranges;
  - получает Markdown headings;
  - объединяет диапазоны;
  - оценивает объём чтения;
  - форматирует manifest.

  Семантический выбор файлов остаётся обязанностью Explorer; script не должен
  притворяться архитектурным reasoning engine.

  ## Формат результата

  Explorer должен вернуть только один финальный manifest без промежуточного
  длинного отчёта и без повторного `COMPLETION_REPORT`.

  Предпочтительная форма:

  # Context Read Manifest

  - Goal:
  - Workflow:
  - Target:
  - Generated against:
  - Estimated read size:
  - Completeness status: complete | gaps

  ## Ordered mandatory reads

  | # | File | Lines | Mode | Role | Why |
  |---|---|---:|---|---|---|

  ## Focused code/evidence reads

  | # | File | Lines | Anchor | Why |
  |---|---|---:|---|---|

  ## Optional reads

  Включать только реально полезные optional sources.

  ## Ephemeral facts not represented in files

  Только факты, полученные read-only командами, например:

  - dirty/clean worktree;
  - текущий migration head;
  - отсутствие indexed tasks для feature;
  - найденный конфликт двух canonical paths.

  Каждый такой факт помечать `ephemeral` и указывать команду-происхождение.
  Не включать секреты, environment values или большой command output.

  ## Gaps / stop conditions

  - отсутствующий target;
  - broken link;
  - competing canonical specs;
  - unresolved markers;
  - недостаточный context budget;
  - stale manifest.

  ## Explicit exclusions

  Кратко перечислить, какие очевидные broad/legacy areas намеренно не включены
  и почему.

  Ограничь итоговый manifest разумным бюджетом, ориентировочно 1500–3000 tokens.
  Если обязательный список больше, не скрывай источники: раздели его на ordered
  reading batches и покажи оценку размера.

  ## Полнота и безопасность

  Skill должен обеспечивать следующие инварианты:

  - Manifest не заменяет source-of-truth.
  - Explorer не принимает product/architecture decisions.
  - Explorer не выполняет основную задачу.
  - Explorer не редактирует target project.
  - Оркестратор читает mandatory sources самостоятельно.
  - Прямые canonical links важнее registry-only догадок.
  - Один concern не должен маршрутизироваться к двум competing active specs.
  - `read_full` нельзя превращать в partial range ради экономии.
  - Transient authorization snapshots, summaries и старый envelope не являются
    текущей backend authority.
  - Никакие secrets/auth/environment values не попадают в manifest.
  - Большой tool output, содержимое файлов и подробные пересказы запрещены.
  - Если полноту нельзя доказать, вернуть `gaps`, а не выдумывать уверенность.

  ## Workflow-specific routing

  Предусмотри минимум следующие profiles:

  ### Planning/design

  Для `/prd-to-tasks`, `/spec-design`, `/prd` и похожих flows:

  - governing priming;
  - target feature/epic/REQ/RTM;
  - spec-backbone и spec-index;
  - feature `spec_design_links`;
  - plausible canonical subject specs;
  - existing plans/protocols/tasks;
  - schema/tier policy до task drafting;
  - codebase evidence только в необходимом объёме.

  ### Task execution

  Для `/execute TASK-*`:

  - `AGENTS.md`;
  - indexed task record;
  - tier policy;
  - direct task-linked canonical specs;
  - только необходимые feature/REQ docs;
  - touched code/tests and nearby implementation patterns.

  Не добавлять broad planning context вопреки T0/T1 manual priming rules.

  ### Verification/review

  Для `/verify`, `/red-verify`, task-plan review:

  - target record/plan;
  - acceptance basis;
  - direct canonical specs;
  - implementation evidence/diff;
  - applicable testing contracts;
  - только те upstream docs, которые нужны для semantic drift checks.

  ## Skill implementation requirements

  Создай skill через установленный project skill creation path.

  Минимальный ожидаемый состав:

  - `SKILL.md`;
  - `agents/openai.yaml`, если это стандарт текущего framework;
  - deterministic validation/formatting script, если он действительно уменьшает
    повторяемый tool work;
  - только необходимые references.

  Не создавай README, changelog или отдельную пользовательскую документацию
  внутри skill folder.

  `SKILL.md` должен быть компактным, желательно меньше 500 строк. Подробный
  output contract или fixture examples вынеси в один уровень `references/`
  только если это реально уменьшает основной skill.

  Frontmatter должен содержать только:

  - `name`;
  - точный `description`, описывающий как функцию skill, так и triggers.

  Trigger description должна позволять использовать skill, когда нужно:

  - подготовить priming manifest для другого агента;
  - определить точный список Memory Bank/codebase sources;
  - сохранить context window оркестратора;
  - передать Explorer-сабагенту discovery работы перед planning/execution/review.

  ## Интеграция

  Обнови только существующие необходимые registries/templates/installers:

  - project skill registry/index;
  - source template, из которого устанавливаются Codex/Claude skills;
  - sync/install paths;
  - orchestrator/worker guidance, если без короткого caller contract skill нельзя
    корректно вызвать.

  Не добавляй новую process layer или отдельную task model.

  Добавь короткий reusable delegation template в подходящий существующий
  workflow/role source, например:

  “Explore target X with `/context-manifest`; return only the validated
  Context Read Manifest. Do not execute the target workflow or summarize source
  contents.”

  Не дублируй этот текст во многих местах.

  ## Проверка

  Добавь или обнови tests, проверяющие:

  1. Skill metadata и структура валидны.
  2. Все paths/ranges manifest существуют и корректны.
  3. `read_full` сохраняется для workflow-mandatory sources.
  4. Direct task/spec links попадают в manifest.
  5. Archive/legacy docs не включаются без явной причины.
  6. Пересекающиеся ranges объединяются.
  7. Один путь не дублируется.
  8. Manifest не содержит file dumps, secrets или длинные summaries.
  9. Missing target/broken link возвращает gap/stop condition.
  10. T0/T1 execution не получает broad planning context.
  11. T2/T3 execution получает direct canonical specs.
  12. Planning для feature без tasks находит schema, tier policy, target
      feature/REQ и applicable specs.
  13. Line-number drift или изменившийся worktree делает manifest stale.
  14. Output остаётся компактным и показывает estimated read size.

  Запусти штатный skill validator и project quality gates.

  ## Forward test

  Проведи минимум три свежих сценария:

  1. `/prd-to-tasks FT-*` для feature с большим числом related specs.
  2. `/execute TASK-*` для T0/T1.
  3. `/execute` или `/verify TASK-*` для T2/T3 с direct canonical links.

  В каждом случае Explorer должен видеть только task-local request и target
  project, использовать новый skill и вернуть manifest без ожидаемого ответа.

  Затем проверь:

  - смог ли новый агент, прочитав только manifest и обязательные listed sources,
    правильно назвать governing constraints, target acceptance и canonical
    boundaries;
  - не отсутствует ли critical source;
  - сколько context tokens было сэкономлено по сравнению с broad priming;
  - не утекли ли в финальный manifest подробные summaries Explorer.

  Если forward test требует заранее сообщить Explorer правильный набор файлов,
  skill считается недостаточным и должен быть доработан.

  ## Acceptance criteria

  Работа завершена, когда:

  - новый skill установлен через canonical framework path;
  - Codex и Claude получают его тем же способом, что остальные project skills;
  - Explorer может построить валидный line-number manifest для feature/task;
  - manifest различает full reads и focused ranges;
  - manifest укладывается в заданный output budget либо честно разбивает чтение
    на batches;
  - orchestration contract не допускает длинного Explorer report;
  - основному агенту не требуется повторять discovery;
  - skill не подменяет нормативное чтение и основной workflow;
  - tests, validator и Memory Bank lint проходят;
  - Memory Bank обновлён по существующим Docs First правилам.
