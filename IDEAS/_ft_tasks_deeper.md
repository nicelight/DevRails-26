# Handoff: более глубокая декомпозиция features и tasks

## Статус документа

- Тип: idea / design handoff.
- Scope: улучшение product decomposition и feature-scoped task planning в
  DevRails.
- Это не готовый implementation plan и не разрешение менять публичные workflow
  contracts без их отдельной проверки.
- Документ находится в `IDEAS/` как пользовательский вход. Он не является
  canonical runtime source и не должен разворачиваться installer-ом в target.

## Цель идеи

Увеличить внимание runtime-агента к деталям на двух границах:

1. при разложении проекта на product features — раньше выявлять фичи, внутри
   которых скрыто несколько самостоятельных продуктовых результатов;
2. при разложении одной feature на JSON tasks — до выпуска task cards проверять
   правдоподобный путь реализации каждой кандидатной задачи и выявлять скрытую
   работу, из-за которой задача раздуется во время `/execute`.

Желаемый результат — feature и task boundaries, которые дают агенту достаточно
узкий и связный контекст для реализации, но не создают искусственную
пере-декомпозицию по файлам, слоям или техническим шагам.

## Исходная проблема

Текущий workflow правильно использует иерархию:

```text
PRD -> REQ -> Epic -> Feature -> implementation plan -> TASK
```

Однако модель часто выполняет слишком широкий анализ за один проход:

- `/prd` смотрит на продукт целиком и одновременно должен обеспечить полное
  покрытие PRD, RTM, epics и всех features;
- в таком контексте агент хорошо видит общую карту, но может не заметить, что
  одна feature содержит несколько независимых user journeys, acceptance
  clusters, state lifecycles или rollout units;
- `/review-feat-plan` использует fresh context, но проверяет всю L1-L3
  декомпозицию, а feature sizing сейчас является лишь одной общей review
  dimension;
- `/prd-to-tasks` объединяет feature-level SDD coverage, implementation plan и
  выпуск полной JSON task queue;
- single-feature режим `/prd-to-tasks FT-<NNN>` уже существует, но unattended
  flow использует `/spec-auto --all` и `/prd-to-tasks --all`, снова расширяя
  рабочий контекст;
- формулировки `smallest coherent product structure` и `smallest cohesive task
  queue` могут быть интерпретированы моделью как предпочтение меньшего числа
  features/tasks;
- правило task slicing правильно запрещает дробление по файлам, модулям, слоям
  или тестам, но недостаточно явно требует проверить реалистичность пути
  выполнения до создания task card.

В результате feature может остаться слишком широкой, а внутри неё появляются
несколько крупных задач. Реальная скрытая работа обнаруживается поздно — во
время `/execute`, tier escalation или controlled `rebuild_required`.

## Основная гипотеза

Проблема решается не общей инструкцией «думай глубже» и не увеличением размера
checklist. Нужны более узкие границы внимания:

```text
сначала breadth по всему продукту
-> затем depth только для сложных feature candidates
-> затем отдельный feature-scoped planning pass
-> затем короткая симуляция одной кандидатной задачи
```

Каждый проход должен иметь один тип решения. Глобальный проход отвечает за
coverage, focused feature pass — за product slicing, task simulation — только
за реалистичность одной task boundary.

## Предлагаемое направление workflow

```text
/prd
  -> построить полную продуктовую карту
  -> выполнить дешёвый feature complexity/pressure scan
  -> провести focused re-slicing только сложных candidates
  -> /review-feat-plan с углублённой проверкой сложных candidates
  -> /spec-design

для каждой product feature отдельно
  -> feature-scoped design и implementation planning
  -> preliminary task candidates
  -> bounded implementation simulation для каждого candidate
  -> keep | split | block
  -> JSON task emission
  -> /review-tasks-plan FT-<NNN>
```

Это направление нужно реализовать через существующие skills, modes, reports и
artifacts, не добавляя новый публичный workflow surface.

## Feature complexity / pressure scan

`/prd` остаётся владельцем product decomposition и сначала строит полную карту.
После этого он должен проверить feature candidates на признаки скрытой ширины.

Полезные pressure signals:

- несколько самостоятельных user journeys;
- несколько actors с различными целями или acceptance;
- независимые группы acceptance criteria;
- несколько доменных lifecycle/state flows;
- разные permission/security модели;
- несколько внешних boundaries или integrations;
- runtime behavior вместе с migration/backfill/cutover;
- независимо выпускаемые или откатываемые части;
- разные failure/recovery paths;
- части, которые могут быть приняты и проверены независимо.

Это не score и не механический порог. Сигналы нужны только для маршрутизации
внимания: обычная feature остаётся в глобальном проходе, feature с заметным
pressure получает отдельный focused pass в узком контексте.

Основной критерий feature split:

> Если части дают самостоятельные наблюдаемые продуктовые результаты, имеют
> собственные acceptance criteria и могут быть проверены или выпущены отдельно,
> они являются кандидатами в разные features.

Не следует разделять feature горизонтально на `backend`, `frontend`,
`database`, `tests`. Технические слои сами по себе не являются независимой
продуктовой ценностью.

Focused re-slicing должен происходить до `/spec-design`, пока изменение
feature boundaries ещё не инвалидирует готовые feature specs и task records.
Первичная feature может сохранить свой ID для главного slice, а извлечённые
siblings должны получить нормальные новые `FT-*` IDs с обновлением epic, RTM и
index. Focused analysis остаётся внутренней тактикой существующего `/prd`, без
нового invocation mode.

## Focused review feature decomposition

`/review-feat-plan` уже является правильным owner независимого product-plan
review. Его стоит усилить без превращения reviewer в repair skill и без нового
command mode или report:

- существующий review проверяет coverage, traceability, gaps и overlaps;
- внутри него сложные feature candidates получают отдельный focused analysis;
- reviewer ищет наиболее правдоподобный дополнительный product slice;
- `REJECT` возвращает feature-boundary finding и repair route к owning product
  decomposition skill;
- reviewer не создаёт новые features и не выбирает material product branch за
  оператора.

Для small/manual flow глубина должна оставаться пропорциональной evidence. Для
large, high-risk и autonomous flow focused review сложных candidates должен
быть обязательным.

## Feature-scoped task planning

Task planning должен сохранять внимание на одной feature за раз. В режиме
`--all` это является внутренней bounded тактикой существующего skill, а не
обещанием физического context reset или новым execution mode:

```text
enumerate FT targets
-> focus analysis on FT-001
-> focus analysis on FT-002
-> ...
```

Существующий полный preflight target set, blocker handling и отсутствие partial
affected queue сохраняются. Эта идея не меняет публичную семантику `--all` и не
утверждает, что runtime создаёт новую session/context boundary между features.

## Минимальное моделирование кандидатной задачи

Пользователь отдельно уточнил: моделирование реализации должно оставаться
минимальным и не превращаться в отдельный workflow, checklist или analysis
artifact.

Оптимальная форма — короткий `implementation sanity pass` внутри
`/prd-to-tasks`, после preliminary slicing и до выпуска JSON task records.

Агент берёт одну кандидатную задачу и моделирует только наиболее вероятный
evidence-backed путь:

```text
первое необходимое изменение
-> основные шаги реализации
-> наблюдаемый outcome
-> проверка результата
```

Внутренне он отвечает только на три вопроса:

1. Как задача приблизительно будет реализована от первого изменения до
   verification?
2. Обнаружилась ли скрытая работа, существенно расширяющая scope?
3. Нужно оставить candidate целым, разделить его или остановиться из-за
   material decision?

Внутренний результат pass:

- `keep` — путь связный, всё служит одному outcome;
- `split` — найдена самостоятельная зависимость или независимо проверяемый
  промежуточный outcome;
- `block` — обнаружен unresolved material decision или противоречие source of
  truth.

`keep|split|block` здесь является неперсистентным внутренним planning
disposition, а не output field, report, task lifecycle/status vocabulary или
новым публичным contract.

### Границы внимания simulation

Simulation должна:

- рассматривать ровно одну candidate task;
- читать только target feature, direct canonical specs, необходимые dependency
  records и plausible change surface;
- следовать одному наиболее вероятному пути, разрешённому authoritative
  evidence;
- искать только скрытую работу, способную изменить task boundary;
- завершаться сразу после решения `keep|split|block`.

Simulation не должна:

- сравнивать все возможные architectures или implementation alternatives;
- писать pseudocode;
- строить полный risk register;
- проводить исчерпывающий security/operations/testing audit без evidence;
- перечитывать весь проект;
- создавать новый artifact, registry, schema field или lifecycle;
- продолжать анализ нескольких material branches вместо точного `block` и
  repair route.

## Task split semantics

Существующая плоская JSON task model должна быть сохранена. Под «подтасками» в
этой идее понимаются обычные sibling `TASK-*` records с `depends_on` и waves, а
не nested subtask schema.

Один существенный сигнал может быть достаточным для пересмотра task boundary;
комбинация нескольких сигналов не обязательна. Candidate следует разделить,
когда simulation обнаружила скрытую работу, имеющую хотя бы одно
самостоятельное свойство:

- отдельную dependency;
- отдельный независимо проверяемый outcome;
- собственный rollout или rollback;
- material decision, который позволяет отделить независимую от решения работу;
- способность блокировать остальную реализацию;
- существенно другой risk/tier route.

Candidate не следует разделять только из-за:

- большого количества файлов;
- нескольких технических шагов;
- одновременного изменения backend/frontend/tests;
- субъективной оценки объёма;
- желания увеличить число tasks.

Если все изменения необходимы для одного observable outcome и не образуют
полезного самостоятельного состояния завершённости, task остаётся целой.

Material decision не даёт агенту права выбрать ветку. Агент может отделить
доказанно независимую работу, которая не предрешает выбор; зависимая от решения
часть остаётся заблокированной и следует существующему operator question/halt и
resume route.

Пример корректного split:

```text
исходный candidate: перевести runtime на новую storage schema

TASK A: добавить backward-compatible schema и dual-read/write proof
  -> TASK B: выполнить и проверить data backfill
  -> TASK C: выполнить cutover и удалить legacy path после gate
```

Здесь части разделены по dependencies, independently verifiable states и
rollback units, а не по файлам или слоям.

## Simulation не фиксируется

Simulation выполняется только в уме модели. Не создавать для неё запись в
`IMPL-FT-<NNN>.md`, task card, protocol, report или другом artifact и не
раскрывать внутренний reasoning.

Её результат проявляется только в итоговых task boundaries, dependencies,
constraints, invariants, verification targets и существующем blocker/handoff,
когда он действительно нужен. После `split` preliminary list пересобирается,
новые candidates проходят тот же внутренний pass, и только затем создаются JSON
task records.

Обязательная simulation применяется к новым candidates до первоначального JSON
emission. Existing task cards не проходят её ретроактивно; при отдельно
обнаруженной необходимости material reslicing сохраняется текущий
`rebuild_required` route.

## Усиление `/review-tasks-plan`

Текущий fresh-context review уже владеет semantic task slicing и execution
readiness. Достаточно добавить один bounded probe:

> Обнаруживает ли правдоподобный путь реализации скрытый самостоятельный
> execution packet внутри task boundary?

Reviewer должен отклонить queue, если:

- обнаруженная скрытая prerequisite work потеряна;
- одна task снова объединяет несколько independently verifiable packets;
- executor должен принять plan-level material decision;
- task boundary противоречит inspected code/spec evidence;
- verification зависит от невключённой самостоятельной работы.

Не нужно требовать от reviewer повторять полное моделирование или создавать
новый verdict/status. Сохраняется `APPROVE|REJECT` и существующий repair route к
`/prd-to-tasks FT-<NNN>` или другому owning skill.

## KISS и явно исключённый scope

Идея не должна приводить к следующим изменениям без отдельного requirement и
operator decision:

- новый task schema, registry, lifecycle или nested subtasks;
- новый persisted complexity score;
- новая feature/task readiness state machine;
- обязательная большая matrix для каждой простой feature/task;
- отдельный `/simulate-task`, `/feature-plan` или `/plan-to-tasks` skill только
  ради этой идеи;
- новый public command mode или отдельный family of review reports;
- новый family of planning/rehearsal artifacts;
- split по числу файлов, строк, модулей или предполагаемых часов;
- фиксированное минимальное/максимальное число features или tasks;
- полный model-eval framework как blocking CI gate;
- ослабление существующих SDD, Foundation, tier, verify или semantic gates.

Ключевой баланс:

> Добавлять дополнительное внимание только там, где evidence показывает
> decomposition pressure, и останавливать analysis сразу после принятия
> достаточного boundary decision.

## Контракты, которые необходимо сохранить

- `/prd` остаётся владельцем product/REQ/epic/feature decomposition.
- `/spec-design` остаётся mandatory global SDD backbone и Foundation decision
  gate.
- `/prd-to-tasks` остаётся planning skill и не выполняет tasks.
- `/review-feat-plan` и `/review-tasks-plan` остаются независимыми read/review
  owners с `APPROVE|REJECT` и не ремонтируют reviewed artifacts.
- JSON task records и `.memory-bank/tasks/index.json` остаются единственной
  task model.
- Сохраняются task IDs, `T0|T1|T2|T3`, waves, dependencies, lifecycle
  `planned|ready|in_progress|blocked|done|failed` и status ownership.
- `FT-000`, Foundation Gate и product `W1+` semantics не меняются.
- Existing queue reconciliation остаётся default; material reslicing требует
  controlled rebuild route и не маскируется как repair.
- Operator-owned material product/design/task-boundary decisions нельзя
  принимать по recommendation/default/silence.
- Features остаются composition roots поведения и canonical links; task
  simulation не должна создавать feature-owned multi-concern spec hubs.

## Предполагаемый canonical change surface

Если идея принимается в реализацию, сначала следует проверить и согласовать
точный contract diff. Вероятные primary owners:

- `skills/_shared/references/commands/prd.md`;
- `skills/_shared/references/commands/review-feat-plan.md`;
- `skills/_shared/references/commands/prd-to-tasks.md`;
- `skills/_shared/references/commands/review-tasks-plan.md`.

Вероятные documentation/check surfaces:

- `README.md`;
- `howItWorks.md`;
- `GREENFIELD_WORKFLOW.md`;
- `.github/workflows/release-check.yml` — только минимальные deterministic
  contract assertions и source-only/install smoke coverage.

`skills/_shared/scripts/init-mb.js`, task schema и generated skeleton не должны
меняться: simulation не персистится, а её результат использует только текущие
task boundaries и fields. Если proposed implementation всё же требует их
изменения, это сигнал повторно проверить scope на overengineering.

## Решения, которые нужно принять перед реализацией

1. Нужно ли хранить compact feature pressure rationale в существующем
   `.protocols/PRD-BOOTSTRAP/plan.md`, или достаточно feature review evidence.

Focused analysis остаётся внутренней тактикой существующих `/prd`,
`/review-feat-plan`, `/prd-to-tasks` и `/review-tasks-plan`; новые modes и
reports не создаются. Физический context reset не является требованием.

## Критерии успеха

Идея реализована успешно, когда:

- сложная feature с несколькими самостоятельными acceptance clusters получает
  focused review и разделяется до `/spec-design`, если split доказан;
- простая cohesive feature не дробится декоративно;
- task candidate с hidden migration/backfill/cutover или другой самостоятельной
  prerequisite work разделяется до JSON emission;
- task, затрагивающая много файлов ради одного outcome, может остаться одной;
- `/execute` реже обнаруживает oversized scope, missing prerequisite или
  необходимость controlled rebuild/split;
- task cards остаются compact single-card handoffs без дублирования полного
  implementation plan;
- `/review-tasks-plan` может доказательно отклонить implausible/oversized task,
  не создавая новый review workflow;
- `--all` сохраняет текущую публичную семантику, используя bounded working focus
  по одной feature без гарантии физического context reset;
- task schema, lifecycle, tier policy, Foundation semantics и status ownership
  не изменились;
- source-only repository не содержит generated package-local `shared-*`.

## Рекомендуемые behavioral probes

Минимальный набор не-blocking сценариев:

1. Простая локальная feature должна остаться одной feature и одной/несколькими
   естественными tasks без искусственного split.
2. Feature, объединяющая registration, login, recovery и session revocation,
   должна выявить независимые product slices.
3. Candidate «перевести storage schema» должен обнаружить migration/backfill/
   cutover pressure и предложить dependency-based split.
4. Candidate, затрагивающий backend, frontend и tests ради одного атомарного
   outcome, не должен делиться только по слоям.
5. Unresolved material contract choice должен дать `block` и repair route, а не
   speculative implementation.
6. Unattended `--all` должен сохранить per-feature blockers и не выдавать
   partial affected queue как полный успех.

Полезные outcome metrics после внедрения:

- число execution-time `rebuild_required` из-за oversized task;
- число task-plan `REJECT` по hidden scope;
- число `/execute` stop из-за отсутствующей prerequisite work или plan-level
  decisions;
- отсутствие роста искусственных file/layer tasks;
- сохранение полного AC/REQ coverage.

Количество features/tasks само по себе не является метрикой качества.

## Source-only validation boundary

После любых изменений нужно проверить всю цепочку:

```text
canonical source
-> installer/generator
-> deployed target files
-> runtime-agent behavior
-> workflow gates and handoffs
```

Минимальная mechanical validation:

```bash
npm run check:syntax --silent
git diff --check
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l

tmp_target="$(mktemp -d)"
node scripts/install-framework.mjs --skill '*' --target "$tmp_target/install-only" --yes
node scripts/install-framework.mjs --bootstrap --target "$tmp_target/bootstrap" --yes
```

Source-only `shared-*` count должен остаться `0`. Проверки должны выполняться в
изолированных temporary targets и не использовать локальные generated
`.memory-bank/`, `.agents/`, `.claude/`, `.protocols/` или `.tasks/` как
canonical source.
