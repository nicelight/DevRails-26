# Global skills refactor: свобода локальной тактики при строгих workflow-контрактах

## Статус

- Тип: план изменения DevRails
- Статус: proposed
- Целевой проект: source-only framework DevRails 26
- Основной scope: canonical command skills, shared workflow references,
  generated runtime skill behavior и связанные release checks

## 1. Исходная проблема

Часть command skills DevRails одновременно описывает:

- обязательный workflow-контракт;
- source of truth и safety boundaries;
- точный порядок чтения и анализа;
- формат внутреннего рассуждения;
- число проходов и вопросов;
- способ декомпозиции работы;
- внутренние инструкции следующих skills;
- полный downstream workflow далеко за пределами собственного handoff.

Из-за этого skills становятся длинными, дублируют общие правила и ограничивают
способность агента выбирать эффективную локальную тактику. Дублированные
контракты также создают drift: одно lifecycle или handoff-правило приходится
согласованно менять сразу в нескольких command specs.

Цель refactor — дать агенту больше свободы внутри каждого шага, не ослабляя
контракты на границах workflow.

## 2. Главный принцип

```text
Workflow владеет переходами и межшаговыми контрактами.
Skill владеет своим outcome и hard boundaries.
Агент свободно выбирает локальную тактику достижения outcome.
Оператор владеет решениями при неоднозначностях и развилках.
```

Свобода агента распространяется на:

- порядок исследования и чтения релевантных источников;
- выбор инструментов;
- локальную декомпозицию анализа;
- глубину проверки пропорционально риску;
- способ реализации;
- выбор минимально достаточных artifacts внутри разрешённого output contract;
- форму объяснения и рекомендации оператору.

Свобода агента не распространяется на:

- изменение objective, scope или source of truth;
- самостоятельный выбор при доступной оператору неоднозначности или развилке;
- обход обязательных gates;
- изменение task lifecycle, tier policy или status ownership;
- ослабление acceptance, verification, security или human checkpoints;
- нарушение schema, artifact ownership или handoff contract;
- silent assumptions, меняющие продуктовый, архитектурный или публичный контракт.

## 3. Обязательный контракт анкетирования оператора

### 3.1 Когда интервью обязательно

Если применимый skill содержит или допускает анкетирование, интервью оператора
обязательно запускается при наличии хотя бы одной релевантной неоднозначности
или развилки.

Агент не должен самостоятельно выбирать вариант, если решение может принять
оператор и выбор способен повлиять на результат текущего skill или downstream
handoff, включая:

- product intent, scope или non-goals;
- пользовательское поведение или UX;
- requirements и acceptance criteria;
- архитектурный стиль, границы или source of truth;
- API, event, data, state, storage или compatibility contracts;
- security, privacy, compliance или irreversible behavior;
- feature/task decomposition;
- tier, dependencies, verification strategy или human checkpoint;
- Foundation Dev Path;
- выбор между competing canonical specs;
- любую иную развилку, для которой в skill предусмотрено обращение к оператору.

Отсутствие неоднозначности не требует искусственного интервью. Но обнаруженная
неоднозначность не может быть закрыта рекомендацией агента без ответа оператора.

### 3.2 Правила интервью

- Агент обязан сформулировать, какое решение требуется и что оно изменяет.
- Агент может дать рекомендуемый вариант и краткое обоснование.
- Рекомендация не считается решением оператора.
- Молчание, отсутствие ответа или продолжение рассуждения не считаются
  согласием.
- Формат интервью адаптивный: один вопрос, группа тесно связанных вопросов,
  multiple choice или открытый вопрос — в зависимости от контекста.
- Нельзя задавать вопросы только ради заполнения шаблона.
- Нельзя ограничивать содержательный ответ оператора искусственным лимитом в
  5–8 слов, если решение требует пояснения.
- Принятое решение должно быть применено к canonical artifact и, когда это
  полезно для handoff, записано в существующий decision log/protocol.
- Пока решение не принято, зависимый output или downstream handoff остаётся
  blocked. Независимый read-only анализ может продолжаться, если он не
  предрешает выбор оператора.

### 3.3 Interactive/manual mode

В interactive/manual mode агент всегда задаёт вопрос оператору при обнаружении
развилки. Conservative default, preferred option или reversible assumption не
заменяют явный ответ.

После ответа агент:

1. фиксирует решение в принадлежащем текущему этапу canonical artifact;
2. устраняет противоречащие старые формулировки;
3. повторно проверяет применимые contracts/gates;
4. продолжает работу только если blocker снят.

### 3.4 Autonomous/unattended mode

Unattended mode не получает право решать за оператора.

Если развилка уже однозначно разрешена Constitution, PRD, accepted decision,
canonical spec или заранее утверждённой operator policy, агент применяет это
решение без повторного вопроса.

Если решение не зафиксировано, autonomous flow обязан:

- записать вопрос и affected scope;
- не выбирать вариант самостоятельно;
- остановиться с существующим подходящим terminal state, например
  `HALT_BLOCKING_QUESTIONS` или `HALT_CLARIFICATION_REQUIRED`;
- указать точную команду/skill для возобновления после ответа.

Нельзя вводить новый status только ради интервью. Следует использовать
существующие blocker/status/terminal-state contracts.

## 4. Целевая структура command skill

Каждый крупный command skill следует привести к следующей логической структуре:

```markdown
<objective>
Проверяемый outcome текущего skill.
</objective>

<input_contract>
Обязательные inputs, preconditions и source-of-truth precedence.
</input_contract>

<hard_invariants>
Safety, ownership, запреты, lifecycle и stop conditions.
</hard_invariants>

<operator_decisions>
Какие неоднозначности требуют обязательного интервью и куда записывается ответ.
</operator_decisions>

<required_outputs>
Обязательные artifacts, поля, statuses, verdicts и evidence.
</required_outputs>

<agent_discretion>
Что агент выбирает самостоятельно: порядок, инструменты, локальная тактика,
минимально достаточная глубина и форма внутренних working notes.
</agent_discretion>

<validation>
Что доказывает корректность результата.
</validation>

<handoff_contract>
Непосредственные допустимые следующие шаги и условия перехода.
</handoff_contract>
```

Не требуется механически добавлять эти XML-like секции во все короткие skills.
Важно разделить смысловые слои и убрать пошаговую режиссуру там, где она не
нужна для корректности.

## 5. Что должно остаться строгим

Следующие контракты не ослабляются:

- task schema и JSON-only task registry;
- task ID, feature, tier и wave consistency;
- lifecycle `planned|ready|in_progress|blocked|done|failed`;
- status ownership между scheduler, execute, verify, red-verify и mb-sync;
- Foundation Gate Anchors, `REQ-000`, `FT-000` и `W0` rules;
- direct task-relevant canonical SDD links для T2/T3;
- complete T2/T3 single-card handoff;
- `write_boundary`, `forbidden_scope` и stop conditions;
- advisory semantics `touched_files`;
- required verification и evidence по tier;
- T3 human checkpoint;
- verdict vocabularies;
- source-only packaging и generated-file hygiene;
- mandatory workflow gates и stop conditions;
- операторское решение при неоднозначности или развилке.

Механические validators должны проверять механические invariants. Semantic
review должен проверять применимость и достаточность, не превращая собственную
методику анализа в обязательный сценарий для всех агентов.

## 6. Приоритетные skills для refactor

### 6.1 `/spec-design`

Проблема:

- смешивает global backbone contract с обязательными Phase A/B/C;
- диктует порядок интервью и анализа;
- детально управляет artifact granularity и design lenses;
- содержит много внутренней тактики вместо outcome contract.

Сохранить:

- обязательное положение после `/prd`;
- `Global Backbone Status: complete|minimal|blocked`;
- parseable Backbone Area Matrix и применимые anchors;
- canonical subject-based spec routing;
- Foundation Dev Path decision и Feature Pressure Map;
- запрет TASK records;
- blocker и handoff contracts.

Освободить:

- порядок архитектурного анализа;
- способ применения design lenses;
- форму и группировку вопросов;
- порядок чтения specs;
- внутренние working notes;
- выбор минимальной artifact shape в рамках KISS и существующего registry.

Обязательное интервью:

- любая неразрешённая архитектурная развилка в interactive mode задаётся
  оператору;
- autonomous mode не выбирает reversible/conservative default, если выбор мог
  сделать оператор и он не закреплён policy/evidence; вместо этого ставится
  blocker и terminal halt.

### 6.2 `/prd-to-tasks`

Проблема:

- фиксирует discovery algorithm и provisional outline sequence;
- требует конкретную форму concern audit;
- предписывает одинаковый порядок design lenses для каждой task;
- смешивает task output contract с методом мышления planner-а.

Сохранить:

- schema validation до durable task write/indexing;
- reconciliation identity/lifecycle preservation;
- cohesive independently verifiable outcomes;
- tiers, dependencies, waves и Foundation Gate dependency;
- canonical SDD readiness и direct task links;
- T2/T3 single-card completeness;
- запрет execution;
- handoff в `/review-tasks-plan`.

Освободить:

- порядок discovery и чтения candidates;
- форму concern audit: in-memory или protocol note по необходимости;
- способ task slicing;
- порядок применения Architecture/Interfaces/Data concerns;
- локальную тактику поиска минимального complete task set.

Обязательное интервью:

- любая развилка, меняющая product behavior, contracts, storage/state,
  security, task boundaries, tier или verification, задаётся оператору;
- competing canonical paths не разрешаются локально;
- без ответа affected task records не создаются и handoff остаётся blocked.

### 6.3 `/red-verify`

Проблема:

- adversarial verification привязана к предсказуемому обязательному checklist;
- фиксированный порядок context loading и hostile hypotheses может вызывать
  anchoring и пропуск неожиданных semantic defects.

Сохранить:

- независимую роль verifier-а;
- task/feature modes и tier routing;
- normative inputs и evidence requirements;
- `SEMANTIC_VERDICT` contract;
- запрет scheduler status transitions;
- T3 и feature-completion handoff rules.

Освободить:

- построение hostile model;
- порядок изучения evidence;
- набор adversarial probes;
- дополнительные тесты и cross-boundary проверки;
- глубину проверки пропорционально риску.

Существующие risk lists оставить как примеры, а не исчерпывающий обязательный
порядок.

Если semantic verdict зависит от неоднозначного product/spec решения, verifier
не выбирает трактовку: возвращает `semantic-concern`/blocker и вопрос оператору.

### 6.4 `/foundation-to-tasks`

Проблема:

- повторяет значительную часть `/spec-design` и `/prd-to-tasks`;
- подробно диктует substrate spec taxonomy;
- может подталкивать к foundation overengineering.

Сохранить:

- Foundation Gate Anchors;
- reserved IDs и normal task model;
- minimum executable baseline outcome;
- product-before-foundation prohibition;
- final foundation gate task;
- T2/T3 task handoff completeness.

Освободить:

- выбор минимального walking skeleton;
- применимый набор substrate specs;
- task slicing внутри foundation;
- порядок анализа и verification design.

При развилке о том, нужен ли foundation, какой baseline считается достаточным
или какой substrate contract выбрать, решение должно исходить из уже принятого
`/spec-design` evidence либо от оператора. `/foundation-to-tasks` не принимает
новое design-решение сам.

### 6.5 `/execute`

Проблема:

- содержит дублированную global lifecycle policy;
- частично смешивает implementation contract и orchestration rules.

Сохранить:

- selected indexed task;
- preflight;
- semantic outcome/AC/REQ/spec boundary;
- hard scope и stop conditions;
- tier escalation;
- local gates и evidence;
- handoff и запрет scheduler ownership.

Освободить:

- порядок code exploration;
- actual file set внутри semantic/hard boundaries;
- implementation tactic;
- выбор самых дешёвых достаточных проверок;
- локальную декомпозицию работы.

Если реализация обнаруживает неоднозначность или развилку, способную изменить
contract, behavior, state/data, architecture, dependency shape, tier или
verification, `/execute` останавливается и спрашивает оператора либо возвращает
planning repair route. Он не выбирает трактовку самостоятельно.

### 6.6 `/review-tasks-plan` и `/review-feat-plan`

Сохранить review dimensions, `APPROVE|REJECT`, evidence и repair routing.

Освободить:

- порядок review;
- дополнительные probes;
- способ поиска конфликтов;
- форму working notes;
- глубину по risk/evidence.

Review rubrics являются coverage criteria, но не обязательным порядком
мышления. Reviewer не исправляет неоднозначное решение и не выбирает вариант за
оператора; он возвращает `REJECT` с конкретным вопросом и owner/repair route.

### 6.7 Interactive discovery/clarification skills

Затрагиваемые skills:

- `/brainstorm`;
- `/brief`;
- `/constitution`;
- `/write-prd`;
- `/clarify-feature`;
- `/discuss`.

Изменения:

- убрать искусственную норму количества идей;
- убрать обязательный fixed questionnaire UI;
- разрешить один вопрос или группу связанных вопросов;
- убрать жёсткий лимит содержательного ответа в 5–8 слов;
- сохранить recommendations, но не считать их operator decisions;
- всегда запускать интервью, если обнаружена неоднозначность или развилка;
- не задавать формальные вопросы при полностью однозначном evidence;
- сохранять accepted decisions и downstream statuses.

### 6.8 `/autonomous`, `/autopilot` и `/mb-sync`

Этим skills не нужна свобода в lifecycle/state machine. Их нужно сделать короче
и более контрактными, а не более творческими в статусах.

`/autonomous` должен владеть:

- command/gate sequence;
- budgets и terminal states;
- scheduler ownership;
- pause/resume и failure handling.

Он не должен повторять внутреннюю методику каждого child skill.

`/autopilot` должен оставаться sequential deterministic scheduler по умолчанию.
Он делегирует implementation и verification соответствующим skills и не
переопределяет их внутреннюю тактику.

`/mb-sync` следует сделать тонким adapter к
`.memory-bank/workflows/mb-sync.md`, сохранив ownership, consistency validation,
required outputs и stop conditions без повторения всей lifecycle policy.

При unresolved operator decision autonomous/scheduler flow останавливается, а
не выбирает вариант самостоятельно.

## 7. Централизация общих контрактов

Использовать существующие canonical references, не создавая новый governance
слой:

- lifecycle/tier/status ownership —
  `skills/_shared/references/workflows/tier-policy.md`;
- task execution sequence —
  `skills/_shared/references/workflows/execute-loop.md`;
- sync ownership/boundary —
  `skills/_shared/references/workflows/mb-sync.md`;
- autonomous guardrails —
  `skills/_shared/references/workflows/autonomy-policy.md`;
- task schema — generated `.memory-bank/schemas/task.schema.json` from
  `skills/_shared/scripts/init-mb.js`;
- protocol/handoff shapes — existing
  `skills/_shared/references/protocols/*`;
- roles — existing `skills/_shared/references/roles/*`.

Leaf skills должны ссылаться на непосредственный canonical contract и
описывать только свою delta/ownership. Они не должны копировать полный
workflow chain или lifecycle policy.

Runtime commands в target проекте должны оставаться самодостаточными настолько,
чтобы однозначно найти required deployed workflow references и остановиться при
их отсутствии.

## 8. Что не нужно делать

- Не создавать новую task schema.
- Не добавлять новые lifecycle statuses.
- Не добавлять новый governance engine.
- Не создавать отдельный interview registry.
- Не добавлять новый decision artifact, если решение помещается в существующий
  canonical doc или protocol/decision-log.
- Не удалять mechanical gates ради сокращения prompts.
- Не переносить safety/permission enforcement только в prompt text.
- Не заменять обязательный operator choice «разумным default».
- Не переписывать все skills одновременно одним большим механическим diff.
- Не редактировать generated package-local `shared-*` files.

## 9. Этапы реализации

### Этап 0 — baseline и contract inventory

1. Зафиксировать текущие inputs, outputs, statuses, verdicts, stop conditions и
   next-step handoffs каждого canonical command.
2. Отметить поля/строки, которые механически читает `mb-lint`, `mb-doctor`,
   installer или release checks.
3. Найти дубли lifecycle, full workflow chains и questionnaire mechanics.
4. Составить behavioral fixtures для representative manual/autonomous paths.

Результат: refactor не меняет публичные workflow-контракты случайно.

### Этап 1 — deduplication без semantic changes

1. Удалить повторный lifecycle/status ownership из leaf commands, оставив
   локальную ownership delta и ссылку на canonical workflow reference.
2. Убрать полный downstream chain из discovery/leaf skills; оставить
   непосредственный handoff.
3. Сократить `/mb-sync` до adapter contract.
4. Сократить повторяющиеся worker command examples там, где deployed role или
   workflow reference уже даёт canonical prompt contract.
5. Обновить docs и release assertions только по изменившимся публичным
   формулировкам/инвариантам.

### Этап 2 — обязательный operator-decision contract

1. Обновить все skills с interview/question behavior.
2. Ввести единое смысловое правило: ambiguity/branch → operator question.
3. Убрать silent conservative/reversible choices там, где решение доступно
   оператору.
4. Для autonomous flow маршрутизировать unresolved decisions в существующие
   terminal halt states.
5. Проверить, что recommendations не интерпретируются как accepted decisions.
6. Проверить durable application ответа и повторную validation перед handoff.

### Этап 3 — свобода локальной тактики

Порядок refactor:

1. `/red-verify`;
2. `/spec-design`;
3. `/prd-to-tasks`;
4. `/foundation-to-tasks`;
5. `/execute`;
6. review skills;
7. interactive discovery/clarification skills.

Для каждого skill:

- выделить hard contract;
- заменить обязательный внутренний algorithm на outcome/risk criteria;
- добавить явный `agent discretion` смысл;
- сохранить operator-decision gates;
- проверить непосредственный handoff;
- не менять downstream contract без отдельного решения.

### Этап 4 — orchestration slimming

1. Оставить `/autonomous` владельцем orchestration, budgets и terminal states.
2. Оставить `/autopilot` владельцем sequential scheduler transitions.
3. Удалить из них дубли внутренней методики child skills.
4. Проверить, что каждый child skill получает достаточный input contract.
5. Проверить pause/halt/resume после operator interview.

### Этап 5 — generated system и документация

Согласованно обновить:

- `skills/_shared/references/commands/*.md`;
- применимые `skills/_shared/references/workflows/*.md`;
- применимые `skills/_shared/references/protocols/*.md`;
- `skills/_shared/references/structure-template.md`;
- `skills/_shared/scripts/init-mb.js` только если меняется generated skeleton;
- `README.md`, `howItWorks.md`, `GREENFIELD_WORKFLOW.md`, `PROJECT_MAP.md`;
- `.github/workflows/release-check.yml`;
- `skills/mb-garden/assets/mb-doctor.mjs` только если меняется механический
  contract, а не prompt wording.

Не создавать tracked generated runtime copies.

## 10. Acceptance criteria

### Contract preservation

- Canonical greenfield и brownfield command order не изменён без явного
  решения.
- Inputs, outputs, statuses, verdicts, stop conditions и handoffs остаются
  однозначными.
- Task schema, IDs, lifecycle и tier policy совместимы с существующими tasks.
- Foundation Gate и T2/T3 readiness не ослаблены.
- `/execute`, `/verify`, `/red-verify`, scheduler и `/mb-sync` сохраняют текущую
  ownership model.

### Operator decisions

- Каждый skill с interview behavior задаёт оператору вопрос при любой
  релевантной неоднозначности или развилке.
- Агент не применяет recommendation/default без явного operator answer или уже
  принятой authoritative policy.
- Autonomous mode останавливается на unresolved operator decision.
- Accepted answer записывается в правильный existing artifact и повторно
  валидируется перед handoff.
- Отсутствие ambiguity не вызывает декоративную анкету.

### Agent autonomy

- Skills не диктуют порядок внутреннего рассуждения без correctness/safety
  причины.
- Read order является обязательным только при source precedence, independence,
  freshness или safety необходимости.
- Checklists описывают coverage/validation, но не всегда порядок мышления.
- Агент может выбрать минимально достаточные tools, exploration path и
  implementation tactic.
- `/red-verify` способен строить собственную hostile model.

### Prompt and maintenance quality

- Полный workflow chain хранится в canonical workflow docs/router, а не
  копируется в каждый leaf skill.
- Lifecycle policy не дублируется полным текстом во многих commands.
- Нет competing canonical instructions по одному status/handoff.
- Сокращение prompts не создаёт недостающий runtime context.
- Крупные skills сокращены без потери проверяемого outcome contract.

## 11. Verification plan

### Static/source-only checks

```bash
npm run check:syntax --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
git diff --check
```

Ожидаемый `shared-*` count: `0`.

### Install/bootstrap smoke

```bash
node scripts/install-framework.mjs --skill '*' --yes
```

И отдельно bootstrap во временный target с проверкой:

- generated runtime skills существуют для Codex и Claude;
- deployed workflow references существуют;
- generated `AGENTS.md` маршрутизирует к актуальным contracts;
- fresh Memory Bank не содержит product/foundation tasks;
- `mb-lint` проходит fresh skeleton;
- strict doctor сохраняет ожидаемое readiness поведение.

### Behavioral fixtures

Нужны как минимум сценарии:

1. Однозначный brief/spec/task — skill действует автономно без декоративных
   вопросов.
2. Interactive product ambiguity — оператор обязательно получает вопрос;
   recommendation не применяется до ответа.
3. Interactive architecture branch — `/spec-design` блокирует handoff до
   ответа.
4. Autonomous unresolved branch — terminal halt без silent assumption.
5. Уже принятая Constitution/spec policy — повторный вопрос не задаётся.
6. `/prd-to-tasks` свободно выбирает analysis order, но создаёт schema-valid
   complete task cards.
7. `/red-verify` использует непредписанный adversarial probe и сохраняет
   canonical verdict/evidence.
8. Scheduler lifecycle и wave boundaries не меняются после prompt slimming.
9. Existing task cards остаются совместимыми.

## 12. Основные риски

### Риск: слишком сильное сокращение prompts

Mitigation: сначала inventory contracts, затем по одному skill; acceptance
проверяется по artifacts и handoff, а не по количеству удалённых строк.

### Риск: agent discretion превратится в silent decision-making

Mitigation: отдельный обязательный operator-decision contract и behavioral
fixtures для interactive/autonomous ambiguity.

### Риск: ссылки на shared workflow недостаточны в runtime target

Mitigation: bootstrap smoke должен проверять deployed references и понятный
point-of-use blocker при их отсутствии.

### Риск: lifecycle drift после deduplication

Mitigation: один canonical owner для tier/status/sync rules, механические
release assertions и representative scheduler fixtures.

### Риск: интервью станет слишком частым

Mitigation: вопрос обязателен только при реальной неоднозначности/развилке,
влияющей на current outcome или downstream contract. Полностью определённый
authoritative evidence не требует повторного подтверждения.

## 13. Definition of Done

Refactor завершён, когда:

- крупные skills описывают outcome и boundaries, а не единый обязательный путь
  мышления;
- оператор всегда принимает доступные ему решения при неоднозначности или
  развилке;
- unattended flow не подменяет оператора и корректно останавливается;
- lifecycle, task model, gates, verdicts и handoffs не изменились случайно;
- generated DevRails target содержит согласованные runtime skills и workflow
  references;
- release checks и behavioral fixtures проходят;
- source-only tree не содержит generated `shared-*` copies;
- документация описывает ту же модель свободы и ответственности, что и runtime
  skills.

## 14. Рекомендуемый первый implementation slice

Первый безопасный slice должен менять только prompt contracts, без task schema
или lifecycle changes:

1. Централизовать дубли status ownership.
2. Ввести обязательный operator-decision contract в interactive/autonomous
   skills.
3. Освободить `/red-verify` как первый изолированный пример.
4. Добавить behavioral fixtures для ambiguity/halt и adversarial verification.
5. Провести `/review-tasks-plan`-подобный fresh-context review самого refactor
   результата перед переходом к `/spec-design` и `/prd-to-tasks` slimming.

После подтверждения этого slice тем же pattern последовательно упростить
`/spec-design`, `/prd-to-tasks`, `/foundation-to-tasks`, `/execute`, review и
interactive discovery skills.
