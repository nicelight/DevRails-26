# Preferred architecture: modular monolith + capability slices

## Статус и границы

`IDEAS/_arch-impr_upd.md` описывает уже реализованную Agentic-first основу:
authority boundaries, current/target semantics, Architecture Spine, Boundary
Map и design-to-task handoff.

Здесь остаётся только недостающая идея: если для application-shaped greenfield
ещё не принята другая архитектура, DevRails первым рекомендует один deployable
modular monolith с capability/vertical slices и после принятия решения проводит
эту архитектуру через design и task planning.

Runtime delta реализована в canonical `/spec-design`, `/spec-auto`,
`/foundation-to-tasks`, `/feature-to-tasks` и `/review-tasks-plan`, закреплена
deployed-surface regression smoke и отражена в публичной документации.

Новые workflow, statuses, task fields, registries, artifact families и
architecture validators не вводятся.

## Цель: почему выбран этот подход

Архитектура target-проекта должна облегчать работу AI-агента тремя свойствами:

1. **Change locality** — owning code находится без broad repository scan.
2. **Authority clarity** — понятно, кто владеет данными, invariants, transitions
   и writes, через какую boundary разрешено изменение и какие bypasses
   запрещены.
3. **Cheap proof path** — изменение подтверждается минимальным достоверным
   project-native evidence.

Modular monolith даёт одну понятную runtime-композицию и deployable без
распределённой сложности. Capability slices группируют код вокруг законченного
поведения, а не разносят изменение по глобальным `controllers`, `services` и
`repositories`.

Агент начинает с owning capability, меняет её через явный contract и проверяет
в ограниченном контуре. Это уменьшает риск изменить чужой state, продублировать
business rules или спрятать оркестрацию в composition root.

## Preferred default

Когда `architecture_style` ещё не определён и evidence не указывает обратное,
`/spec-design` первым рекомендует:

- один deployable modular monolith;
- capability slice как primary change unit;
- одну общую runtime-композицию;
- узкие module contracts;
- явный write ownership, в том числе при общей БД;
- verification вокруг каждой значимой capability.

Это сильная рекомендация, а не один равноправный вариант. Альтернативы нужны
только при реальном evidence-backed trade-off.

Default не подменяет material operator decision:

- явный выбор другой архитектуры имеет приоритет;
- interactive flow получает подтверждение до записи accepted target;
- ранее принятая policy «использовать DevRails preferred architecture, если не
  выбрано иное» уже является достаточным решением;
- unattended flow без accepted architecture или такой policy использует
  существующий blocker;
- `/spec-auto` наследует принятое решение и не выбирает style заново.

Другой primary change unit следует рекомендовать для library/package, CLI,
firmware, pipeline, plugin/protocol system, устойчивого brownfield или реально
independently deployed services. Отклонение называет альтернативную unit и
конкретное evidence; гипотетический future scale или reuse недостаточны.

## Описание подхода

### System shape и slices

Target-приложение имеет один deployable и явный composition root. Код
группируется прежде всего по пользовательским или операционным capabilities.

Каждый значимый slice:

- выражает законченную наблюдаемую capability;
- имеет предсказуемый project-relative code root;
- владеет конкретными данными, invariants, transitions и commands;
- явно не владеет соседними полномочиями и чужим mutable state;
- предоставляет минимальный public application boundary;
- определяет allowed dependencies и минимальный credible proof.

Хорошие slices называются `catalog`, `checkout-payment`, `delivery-tracking`, а
не `controllers`, `repositories`, `services`, `database` или `utils`.

Граница достаточно крупная, чтобы владеть законченным поведением, и достаточно
узкая для локального изменения. Общие invariants и write path указывают на одну
capability; независимо изменяемые outcomes и owners — на необходимость
разделения.

### Feature, slice и task

```text
Feature = независимо ценный product outcome.
Slice   = долгоживущая capability, code и authority boundary.
Task    = cohesive independently verifiable изменение.
```

Feature может затрагивать несколько slices, а slice — обслуживать несколько
features. Task обычно имеет один primary owning slice; cross-slice task допустима
при ясном orchestration owner и cohesive outcome. Feature и task не создаются
по числу slices, layers или файлов.

### Slice contract и code ownership

Для каждого значимого slice фиксируется эквивалент следующих фактов:

```markdown
| Slice | Code root(s) | Owns | Must not own | Public boundary | Allowed dependencies | Verification |
|---|---|---|---|---|---|---|
```

Таблица — примерная форма, не strict schema. Факты живут в существующих
`system-architecture.md`, Boundary Map и subject specs; slice registry не
создаётся.

`Code root` задаёт основное место поиска. Semantic/write ownership определяет,
кто вправе менять invariant или state. Task-local
`runtime_context.write_boundary` становится hard filesystem boundary только
когда planner намеренно сделал его непустым. Code root не копируется туда
автоматически: task может законно затронуть tests, migrations, composition или
public contract. Реестр владения каждым файлом не нужен.

### Внутренние и cross-slice правила

- `presentation`, `application`, `domain`, `infrastructure` — полезные роли, но
  не обязательные каталоги, interfaces или factories.
- Slice не импортирует internals соседа; вызов проходит через узкий public
  application boundary.
- Mutable state и behavior-sensitive invariant имеют одного write owner.
- Общая БД допустима, но не создаёт shared business ownership.
- Cross-slice use case имеет одного orchestration owner; orchestration не живёт
  в HTTP/UI/bot handler, generic util или composition root.
- Composition root отвечает за settings, adapters, wiring, lifecycle, start и
  shutdown, но не за business rules, persistence semantics или второй source
  of truth.
- Shared-код появляется после доказанного reuse либо ради конкретного
  cross-cutting invariant.
- Event bus, mediator, DI/plugin registry и другие abstractions добавляются
  только по текущей необходимости.

Каждый slice имеет минимальный proof path: acceptance scenario, focused test,
integration/contract check, runtime smoke или применимый e2e. Полная test
pyramid и отдельный architecture validator не требуются.

## Runtime workflow audit

### Существующая последовательность и ownership

Идея должна встраиваться в текущий workflow без нового этапа:

```text
/spec-init                 # pre-PRD framing, не выбирает architecture
  -> /prd-to-features      # product outcomes, не technical slices
  -> /review-feat-plan
  -> /spec-design          # preferred recommendation + accepted global target
  -> /foundation-to-tasks  # первый executable scaffold, если Foundation required
  -> /spec-auto            # feature design внутри accepted target
  -> /feature-to-tasks     # direct task-scoped architecture handoff
  -> /review-tasks-plan
  -> /exe -> /verify -> conditional /red-verify
```

Уже реализованная `_arch-impr_upd`-часть разделяет normative target и as-is
evidence в `/spec-design`, `/map-codebase`, `/spec-auto`, `/autonomous` и
`autonomy-policy`. Эту semantics нельзя откатывать или смешивать с preferred
default: production baseline не принимает target architecture за оператора.

### Результаты аудита и обязательные решения

1. **Default остаётся recommendation policy.** Формулировку `/spec-design`
   нужно усилить с «один из KISS-вариантов» до первой однозначной рекомендации,
   но не превращать silence в acceptance.

2. **Style и slice map нельзя смешивать с локальной тактикой.** Принятие
   `modular monolith + slices` не всегда автоматически разрешает конкретное
   разделение ownership. В interactive flow агент должен предложить один
   coherent initial slice map и получить подтверждение material boundaries в
   той же focused architecture decision. Не нужно задавать вопрос по каждому
   slice отдельно.

3. **Standing policy имеет ограниченную силу.** Явная operator/project policy
   может заранее разрешить preferred style и evidence-determined slice map.
   Если policy и product evidence оставляют несколько materially different
   decompositions, unattended flow всё равно использует существующий blocker.

4. **Feature не становится slice.** `/prd-to-features` менять не нужно: он
   продолжает создавать независимо ценные product outcomes до архитектурного
   design. `/spec-design` может объединить несколько features в один slice или
   провести feature через несколько slices.

5. **Accepted architecture уже есть где хранить.** Новый Architecture Contract
   или slice registry не нужен. Существующие artifacts в совокупности должны
   фиксировать:
   - `spec-backbone.md#Backbone Area Matrix` — authoritative
     `architecture_style` и `module_boundaries` routes;
   - `architecture/system-architecture.md` — system shape, composition root,
     main modules/slices и code roots;
   - `contracts/boundary-map.md` — owners, consumers, allowed/forbidden calls,
     data/write owner и verification;
   - subject specs — только действительно необходимые detailed contracts;
   - Architecture Spine — только shared/strict executable `AD-*`.

6. **Не нужна обязательная таблица.** Для accepted slice architecture эти
   artifacts обязаны содержать эквивалент `Code roots`, `Owns`, `Must not own`,
   `Public boundary`, `Allowed dependencies`, `Verification`, но exact heading
   или table остаётся рекомендательной формой. Один cohesive slice допустим для
   маленького приложения; пустой multi-slice scaffold запрещён KISS.

7. **Code root не равен hard task boundary.** Code root локализует поиск,
   semantic/write ownership определяет полномочия, а непустой
   `runtime_context.write_boundary` ограничивает конкретную task. Нельзя
   механически копировать slice root в hard boundary.

8. **Foundation — реально затронутый handoff.** Первоначальный change set его
   упускал. `/foundation-to-tasks` может первой создать composition root и
   каталоги, поэтому должна наследовать применимые accepted architecture/code
   roots, ссылаться на них в Foundation tasks и не создавать layer-centric
   scaffold, лишние slices или product behavior. Existing Foundation contract
   уже запрещает speculative substrate; требуется только точное propagation
   wording и validation.

9. **`/spec-auto` только применяет target.** В post-PRD modes он должен
   сохранять owning slices, write authority и boundaries, добавлять релевантные
   architecture/boundary links в feature `spec_design_links` и блокироваться на
   новой material boundary. `--init` по-прежнему не принимает architecture
   decisions.

10. **Implementation plan недостаточен для executor.** `/exe` читает indexed
    task card и direct task-linked canonical specs; общий IMPL-plan не является
    достаточным runtime context. Поэтому `/feature-to-tasks` должен:
    - назвать primary owning slice/module и code root в plan;
    - положить task-relevant architecture/boundary paths в существующие
      `source_artifacts`/`normative_inputs`;
    - отразить expected code surface в advisory `touched_files` и применимые
      bypass/ownership правила в существующих constraints, invariants,
      anti-goals или `runtime_context`;
    - явно описать cross-slice scope и одного orchestration owner;
    - не добавлять `owning_slice` task field.

11. **Task slicing contract не конфликтует с architecture slices.** Текущий
    `/feature-to-tasks` правильно запрещает делить tasks по modules/files.
    Обычно task имеет один primary owning slice, но cohesive cross-slice task
    допустима. Полная перестройка уже indexed queue сохраняет существующий
    `rebuild_required`/operator-request route.

12. **Fresh review закрывает semantic handoff.** `/review-tasks-plan` должен
    условно, только когда accepted architecture определяет modules/slices,
    проверить owning code root, direct boundary links, forbidden bypasses,
    cross-slice orchestration owner и proof path. Альтернативные архитектуры не
    должны ошибочно отклоняться за отсутствие slices.

13. **Execution contracts уже достаточны.** `/exe` читает direct task links,
    проверяет material architecture expansion и hard scopes; `/verify` проверяет
    direct specs, а `/red-verify` уже ищет responsibility/cross-boundary drift.
    Их не следует менять без dogfood evidence повторяющегося bypass.

14. **Material rerun уже безопасен.** Изменение accepted global slice map
    повышает `Planning Revision`; task statuses сохраняются, а
    `/feature-to-tasks --all` и `/review-tasks-plan --all` перестраивают и заново
    утверждают planning surface. Новая freshness model не нужна.

15. **Brownfield и non-application paths сохраняются.** `/map-codebase` остаётся
    as-is owner и не навязывает slices. Brownfield migration к preferred target
    требует отдельного accepted decision. CLI/library/firmware/pipeline и
    другие формы сохраняют свою natural primary change unit.

### Итоговый runtime change set

Это примерный, не strict write boundary:

```text
skills/_shared/references/commands/spec-design.md
skills/_shared/references/commands/spec-auto.md
skills/_shared/references/commands/foundation-to-tasks.md
skills/_shared/references/commands/feature-to-tasks.md
skills/_shared/references/commands/review-tasks-plan.md
scripts/test-install-sync.mjs
README.md
howItWorks.md
```

`structure-template.md` и `init-mb.js` менять не требуется: существующие
`Main Modules / Bounded Contexts` и Boundary Map достаточны, а project/mixed
artifacts не следует превращать в новую managed schema. `/prd-to-features`,
`/map-codebase`, `/autonomous`, autonomy policy, task schema, lifecycle,
scheduler, `/exe`, `/verify`, `/red-verify`, `mb-lint` и `/mb-doctor` не меняются
для этой delta, если implementation inspection не обнаружит прямую
несогласованность.

### Требуемая regression-проверка

`scripts/test-install-sync.mjs` должен проверять обе deployed surfaces:

- `/spec-design` содержит preferred-first recommendation, explicit acceptance
  boundary и persisted slice-contract coverage, но не старое `not a default`;
- `/spec-auto` наследует accepted slice target и не выбирает его;
- `/foundation-to-tasks` сохраняет accepted composition/slice boundaries;
- `/feature-to-tasks` переносит owning slice через existing fields без нового
  task field и без механического `write_boundary`;
- `/review-tasks-plan` проверяет fresh-executor slice legibility условно по
  accepted target.

После изменений выполнить:

```text
npm run check:syntax --silent
npm run test:mb-doctor --silent
npm run test:install-sync --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
isolated install-only and bootstrap smoke
```

Dogfood должен покрыть application greenfield с interactive confirmation,
unattended run с accepted standing policy, explicit alternative architecture,
non-application project, Foundation scaffold и cohesive cross-slice feature.

### Audit verdict

Серьёзного неразрешимого workflow gap не найдено. Идея совместима с текущими
contracts при соблюдении трёх условий: material slice map не принимается
молчанием, Foundation наследует accepted architecture, а task получает owning
boundary через direct existing fields. Runtime implementation сохраняет эти
условия без нового workflow, task field, registry, schema или validator.

## Критерий успеха

В application-shaped greenfield без другой принятой architecture DevRails
уверенно рекомендует modular monolith + capability slices. После принятия
решения fresh agent по task card и direct links понимает owning slice/code root,
его invariants и writes, запрещённые области, public contract, cross-slice
orchestration owner и минимальный proof path — без чтения всей системы,
микросервисов, дублирующих specs или дополнительного workflow machinery.
