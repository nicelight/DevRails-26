# DevRails workflow findings: повторный source-only аудит

Статус документа: review notes, без реализации.

Дата повторной проверки: 2026-07-20.

Пункты отсортированы по важности исправления. Исходный номер сохранён в каждом
заголовке; finding №7 в исходном списке отсутствовал.

## Граница проверки

Повторный аудит выполнен только по текущим сырцам репозитория:

- canonical commands, workflows, roles и protocol templates в
  `skills/_shared/`;
- generator `skills/_shared/scripts/init-mb.js`;
- installer `scripts/install-framework.mjs` и vendor
  `scripts/vendor-shared.mjs`;
- validators `skills/mb-garden/assets/{mb-lint,mb-doctor}.mjs`;
- root documentation и `PROJECT_MAP.md`.

Installer/bootstrap не запускались, generated target не проверялся. Поэтому
`подтверждён` ниже означает, что defect однозначно следует из source code и
contract text; это не runtime smoke result.

## Шкала оценки

- **Важность:** `1` — source cleanup, `5` — нарушение публичного workflow
  contract, readiness gate, hard safety boundary или поддерживаемого route.
- **Сложность:** `1` — локальная правка, `5` — совместимая миграция нескольких
  классов state/ownership.
- **Риск раздувания workflow:** вероятность добавить лишние artifacts, modes,
  registries, merge machinery или повторяющиеся правила при неосторожном fix.
- **Объём:** `1` — один файл и узкая проверка, `5` — широкая поверхность source,
  generator, docs и regression fixtures.
- **Приоритет:** `P0` — исправлять первым, `P1` — высокий, `P2` — средний,
  `P3` — cleanup.
- **Важность `0`:** finding уже не воспроизводится в текущих сырцах; реализация
  не требуется.

Оценки сложности, риска и объёма относятся к рекомендуемому KISS-исправлению,
а не к максимально общей реализации проблемы.

## Сводка

| Порядок | Исходный finding | Итог повторной проверки | Важность | Сложность | Риск раздувания | Объём | Приоритет |
|---:|---:|---|---:|---:|---:|---:|---|
| 1 | 3 | подтверждён; scope требует точной ownership-классификации | 5/5 | 5/5 | 5/5 | 5/5 | P0 |
| 2 | 1 | подтверждён source chain | 5/5 | 2/5 | 1/5 | 3/5 | P0 |
| 3 | 2 | подтверждён в deterministic doctor | 5/5 | 3/5 | 2/5 | 3/5 | P0 |
| 4 | 4 | подтверждён; исходное решение слишком широко | 5/5 | 4/5 | 5/5 | 4/5 | P0 |
| 5 | 9 | подтверждён; start и closure ownership нужно разделить | 4/5 | 4/5 | 3/5 | 4/5 | P1 |
| 6 | 11 | подтверждён source semantics installer | 4/5 | 1/5 | 1/5 | 2/5 | P1 |
| 7 | 8 | подтверждён прямым конфликтом template/policy | 4/5 | 1/5 | 1/5 | 2/5 | P1 |
| 8 | 6 | подтверждён, но только для pre-protocol halt | 3/5 | 1/5 | 1/5 | 1/5 | P2 |
| 9 | 10 | подтверждён; legacy-block migration недооценена | 3/5 | 4/5 | 3/5 | 3/5 | P2 |
| 10 | 12 | подтверждён только как source-reference drift | 1/5 | 1/5 | 1/5 | 1/5 | P3 |
| 11 | 5 | уже исправлен в текущих сырцах | 0/5 | — | — | — | закрыт |

## Общие ограничения для всех исправлений

- сохранять lifecycle `planned|ready|in_progress|blocked|done|failed`;
- не добавлять task registry, protocol family, scheduler, persisted mode field
  или отдельную task-context model;
- менять canonical source в `skills/_shared/`, а не generated package-local
  `shared-*`;
- не превращать runtime commands в копии общих policies и templates;
- не перезаписывать project-authored state только потому, что исходный skeleton
  когда-то создал этот файл;
- при реализации всё равно выполнить обязательные isolated target checks из
  `AGENTS.md`; они не входили только в этот повторный аудит.

## 1. `--sync` оставляет устаревшие framework-owned assets (исходный №3)

**Вердикт:** подтверждён, но первое описание недооценивало ownership migration.

### Что доказано сырцами

- `writeFile` сохраняет любой существующий файл, если caller не передал
  `overwrite: true`.
- `--sync` явно перезаписывает только copied runtime scripts, четыре canonical
  workflows, три roles и распознанный generated `AGENTS.md`.
- `.memory-bank/schemas/task.schema.json`, `.memory-bank/mbb/index.md`,
  `.memory-bank/workflows/index.md` и `.memory-bank/skills/index.md` создаются
  обычным `writeFile` без `overwrite: SYNC_MODE`.
- Installed commands требуют deployed task schema и workflows. Поэтому новый
  command/validator может быть установлен поверх старой schema или старого
  framework router/policy текста.
- `writeFile` для большинства skipped files возвращается без сообщения, поэтому
  текущий sync report не показывает, что часть skeleton осталась старой.

Самый однозначный defect — stale `task.schema.json`: это deterministic public
task contract, который commands обязаны загружать перед созданием records.

### Что нельзя автоматически объявить framework-owned

Первоначальная рекомендация «перезаписывать весь deterministic skeleton» всё
ещё слишком расплывчата:

- `.memory-bank/tasks/index.json`, product/requirements/features/specs,
  architecture, plans, protocols и changelog однозначно project-owned;
- `howItWorks.md` прямо фиксирует, что existing `testing/strategy.md` не
  перезаписывается и не seed-ится в legacy target без project-level decision;
- `.memory-bank/index.md`, `workflows/index.md` и `skills/index.md` могут
  содержать project/custom router entries, поэтому whole-file overwrite опасен;
- `AGENTS.md` уже имеет отдельную marker/replace/merge policy и не должен
  случайно попасть под второй общий механизм;
- для `.memory-bank/mbb/index.md` и template-like files ownership следует
  зафиксировать явной allowlist в generator code, а не угадывать по тому, что
  файл был создан bootstrap.

### Оценка

- важность: `5/5` — existing installations могут получить внутренне
  несовместимые commands, schema и framework policies;
- сложность: `5/5` — нужна безопасная классификация whole-file и mixed-file
  ownership плюс legacy migration;
- риск раздувания: `5/5` — легко скатиться в migration registry, универсальный
  merge engine или content database;
- объём: `5/5` — generator, возможно installer handoff, docs и несколько классов
  fixtures.

### KISS-исправление

1. В `init-mb.js` держать маленькую явную allowlist whole-file
   framework-owned assets. Минимально доказанный кандидат — task schema;
   canonical copied workflows/roles/scripts уже имеют overwrite path, а protocol
   templates должны войти в него после finding №1.
2. Для router files использовать только ограниченные generated blocks. Не
   перезаписывать весь `workflows/index.md` или `skills/index.md`.
3. Для legacy unmarked baseline распознавать только точную известную old shape.
   Если block изменён или неоднозначен — `conflict/kept`, а не silent rewrite.
4. Project-owned files и intentional sync exceptions, включая existing testing
   policy, оставлять без изменений.
5. Пусть write helper возвращает действие, чтобы итоговый report честно
   перечислял `updated framework-owned`, `updated generated block`, `kept
   user-owned` и `conflict`.

Не вводить общий three-way merge, versioned migration registry или скрытое
определение ownership по произвольному содержимому.

### Поверхность изменений

- `skills/_shared/scripts/init-mb.js`;
- `scripts/install-framework.mjs` только если для generated block действительно
  нужны данные, которых нет в target filesystem;
- `README.md` и `howItWorks.md` для точного sync ownership contract;
- fixtures: exact legacy baseline, modified legacy block, custom router entries,
  stale schema и project-owned docs.

### Acceptance

- stale schema обновляется;
- canonical copied assets продолжают обновляться;
- custom router entries и project-authored state сохраняются;
- intentional testing-policy exception сохраняется;
- modified legacy block не перезаписывается молча;
- report соответствует фактическому действию по каждому файлу/блоку.

## 2. Protocol templates недоступны установленному runtime-agent (исходный №1)

**Вердикт:** полностью подтверждён source chain.

### Что доказано сырцами

- Canonical templates существуют только в
  `skills/_shared/references/protocols/*.md`.
- `vendor-shared.mjs` действительно кладёт flattened protocol references во
  временные package directories.
- Но direct runtime generation затем удаляет target skill directory и создаёт
  в нём только `SKILL.md` через `writeRuntimeSkill`; vendored references в target
  skill не копируются.
- `init-mb.js` умеет находить nested или flattened shared references, но имеет
  copy functions только для workflows и roles. Protocol copy loop отсутствует.
- `/exe` требует full protocol «using available templates», `/red-verify`
  требует «existing template shape», однако ни один stable target path не назван.

Таким образом, наличие templates во временной prepared repo не делает их
доступными runtime-agent после direct generation.

### Оценка

- важность: `5/5` — deployed runtime теряет часть executable workflow contract;
- сложность: `2/5` — resolver pattern уже существует;
- риск раздувания: `1/5` — одна target directory и один generic loop;
- объём: `3/5` — generator, consumers, structure reference и checks.

### KISS-исправление

1. Одним generic loop копировать все семь canonical files в
   `.memory-bank/templates/protocols/`.
2. Считать deployed copies framework-owned и обновлять их на `--sync`.
3. `/exe` должен назвать compact/full template paths, `/verify` — verification
   template, `/red-verify` — red-verification template.
4. Не встраивать тела templates в commands и не копировать их в каждый runtime
   skill.

Install-only не нужно превращать в отдельный self-contained execution mode:
`/exe` и `/verify` уже требуют Memory Bank. Старому target нужен существующий
bootstrap/sync repair route.

### Поверхность изменений

- `skills/_shared/scripts/init-mb.js`;
- `skills/_shared/references/commands/{exe,verify,red-verify}.md`;
- `skills/_shared/references/structure-template.md`;
- sync ownership из finding №3.

### Acceptance

Source checks должны доказать generic enumeration без hardcoded consumer copies,
а implementation smoke — наличие всех canonical filenames по stable target path
после fresh bootstrap и sync.

## 3. Strict doctor пропускает незавершённый Foundation contract (исходный №2)

**Вердикт:** полностью подтверждён в deterministic validator и его command doc.

### Что доказано сырцами

- При non-empty task index `checkTaskReadiness` вызывает
  `checkFoundationReadiness`.
- `checkFoundationReadiness` немедленно возвращается, если
  `.memory-bank/foundation.md` отсутствует.
- При parseable `Foundation Required: true` функция также возвращается без
  finding для `pending_foundation_to_tasks`.
- Для `Foundation Required: false` функция возвращается до проверки наличия
  indexed `FT-000` records.
- `mb-doctor.md` формулирует проверку только как «when foundation.md exists», то
  есть contract text сейчас повторяет code gap.
- `/spec-design` обязан записать accepted true/false Foundation decision до
  product task design; `/feature-to-tasks` требует valid decision и закрытый
  concrete gate, когда Foundation required.

Agentic `/feature-to-tasks` и `/autopilot` содержат дополнительные preconditions,
но deterministic strict doctor всё равно может выдать false PASS для вручную
созданной, legacy или повреждённой queue. Это не отменяется наличием textual
guard в другом skill.

### Оценка

- важность: `5/5` — mandatory deterministic scheduler gate может пропустить
  незавершённый global prerequisite;
- сложность: `3/5` — код локален, но state matrix шире одного `if`;
- риск раздувания: `2/5` — исправление использует существующие anchors/statuses;
- объём: `3/5` — validator, contract doc и fixture matrix.

### KISS-исправление

Для non-empty indexed queue:

- strict mode требует `foundation.md` и parseable current Gate Anchors;
- `Foundation Required: true` плюс `pending_foundation_to_tasks` — strict error;
- required Foundation требует concrete indexed final gate из `FT-000`;
- foundation-only queue может проходить pre-execution readiness с ещё не
  закрытым final gate;
- как только существуют product records, final gate должен быть `done`, а все
  product tasks — зависеть от него прямо или транзитивно;
- `Foundation Required: false` требует `not_required` и отсутствие indexed
  `FT-000` records.

Default mode может сообщать эти состояния warning, но не должен превращать
fresh/manual pre-planning в новый blocking gate. Empty index сохраняет текущий
`info` default и strict error.

Не добавлять Foundation status, registry или отдельный validator phase.

### Поверхность изменений

- `skills/mb-garden/assets/mb-doctor.mjs`;
- `skills/_shared/references/commands/mb-doctor.md`;
- `foundation-to-tasks.md` только если после изменения обнаружится точное
  расхождение, а не для дублирования doctor matrix.

### Acceptance

Fixtures должны покрывать: empty default/strict; non-empty без foundation;
invalid anchors; required pending; required concrete open foundation-only gate;
missing/unindexed/wrong-feature gate; product queue с open gate; product queue с
closed gate без dependency; valid closed gate; false без `FT-000`; false с
ошибочным `FT-000`.

## 4. Hard `write_boundary` не имеет общей path semantics (исходный №4)

**Вердикт:** defect подтверждён, но исходное исправление меняло бы лишний public
contract.

### Что доказано сырцами

- Task schema задаёт `write_boundary`, deprecated `allowed_write_scope` и
  `forbidden_scope` как обычные arrays of strings.
- `mb-lint` проверяет только array/string shape, конфликт нового и deprecated
  field и warning об alias. Даже empty strings и path syntax не проверяются.
- Doctor проверяет лишь наличие хотя бы одной non-empty boundary string как
  части handoff completeness и полагается на lint для structure.
- `tier-policy`, `/exe`, planning commands и autonomy policy называют
  `write_boundary` hard boundary, но не определяют path grammar и overlap.
- Experimental parallel требует pairwise-disjoint boundaries, хотя source не
  задаёт общий способ отличить `src/a` от `src/ab` или сопоставить `src/` с
  `src/a.js`.

### Почему исходное решение нужно сузить

`forbidden_scope` в schema означает «hard paths or areas». В нём законно может
быть смысловой запрет, а не filesystem path. Применение path-only grammar к
этому полю стало бы breaking contract change. `stop_conditions` тем более
остаётся текстовым.

Формальная grammar нужна только для:

- `runtime_context.write_boundary`;
- deprecated read alias `allowed_write_scope`.

### Оценка

- важность: `5/5` — неоднозначен hard write boundary, а parallel proof может
  дать ложную независимость;
- сложность: `4/5` — нужны grammar, compatibility, schema/lint и одинаковые
  lexical examples во всех consumers;
- риск раздувания: `5/5` — особенно опасны glob engine, path object schema,
  scope registry или новый parallel planner;
- объём: `4/5` — policy, task producers/consumers, schema, lint и fixtures.

### Минимальная grammar

- project-relative POSIX path;
- comparison case-sensitive и lexical, без filesystem existence requirement;
- разрешён optional single trailing `/`, который удаляется перед сравнением;
- запрещены absolute paths, `.`/`..` segments, `//`, backslash, NUL и glob
  metacharacters;
- entry разрешает сам path и lexical subtree;
- overlap существует, когда normalized segment array одного entry является
  prefix другого; string prefix недостаточен.

Примеры:

- `src` и `src/a.js` пересекаются;
- `src/` нормализуется в `src`;
- `src/a` и `src/ab` не пересекаются;
- equal paths пересекаются;
- `./src`, `../src`, `/src`, `src//a`, `src\\a` и `src/**` невалидны.

Lexical disjointness является необходимым, но не достаточным доказательством
parallel safety. Symlink/junction/alias или общий external output могут свести
разные lexical paths к одному ресурсу; при такой неопределённости действует уже
существующий sequential fallback. Не нужно добавлять realpath registry.

### KISS-исправление

1. Canonical grammar и segment-prefix algorithm определить один раз в
   `tier-policy.md`.
2. TASK_SCHEMA должен ограничить syntax, а один helper в `mb-lint` — дать
   понятные errors и нормализационные tests.
3. Doctor не должен копировать validator: он уже запускает lint первым.
4. Producers (`foundation-to-tasks`, `feature-to-tasks`) и consumers
   (`review-tasks-plan`, `exe`, `autopilot`/autonomy policy) ссылаются на
   canonical rule, не изобретают свои grammars.
5. Parallel workflow применяет documented segment algorithm и fallback; новая
   library или scheduler implementation не нужны.

### Поверхность изменений

- `skills/_shared/references/workflows/{tier-policy,autonomy-policy}.md`;
- `skills/_shared/references/commands/{foundation-to-tasks,feature-to-tasks,review-tasks-plan,exe,autopilot}.md`;
- `skills/_shared/scripts/init-mb.js` для schema;
- `skills/mb-garden/assets/mb-lint.mjs` и focused fixtures.

### Acceptance

Один case table должен использоваться для schema/lint tests и policy examples.
Experimental parallel допускает только pairwise-disjoint normalized boundaries,
сохраняет shared-state exclusions и при любой alias/isolation неопределённости
переходит к sequential без нового status.

## 5. Manual `/exe` допускает `planned`, но start-transition owner не определён (исходный №9)

**Вердикт:** подтверждён; первая версия недооценивала resume/ordering semantics.

### Что доказано сырцами

- `/exe` требует абстрактное `executable lifecycle state`, но явно блокирует
  только `blocked|failed|done`.
- Следовательно, `planned`, `ready` и `in_progress` проходят этот конкретный
  lifecycle filter.
- `feature-to-tasks` может создать `planned` или `ready`; `ready` разрешён только
  при уже закрытых dependencies/blockers.
- В manual flow нет scheduler promotion pass, который позже переведёт
  `planned -> ready` после закрытия dependencies.
- `execute-loop` требует пройти planning/review/applicable doctor до `/exe`, но
  не назначает owner самих start transitions.
- `/verify` правильно запрещает считать `planned|ready` implemented и ожидает
  normal scheduler input `in_progress`.
- Compact/full templates имеют closure-owner material, но не однозначный
  execution-start owner/current-attempt basis.

### Почему execution ownership нельзя смешивать с closure ownership

Прямая просьба top-level agent выполнить task даёт authority начать manual
execution, но не обязательно закрыть task. Например, T2/T3 `/exe` никогда не
владеет closure, а T0/T1 fast lane требует отдельного explicit closure basis.
Один общий флаг owner снова создаст lifecycle ambiguity.

### Оценка

- важность: `4/5` — manual implementation может начаться без durable
  `in_progress`, а resume/verify увидят противоречивый lifecycle;
- сложность: `4/5` — нужно согласовать promotion, attempt ownership, protocol
  ordering и closure separation;
- риск раздувания: `3/5` — соблазн добавить promoter skill, mode field или новую
  attempt registry;
- объём: `4/5` — policy, `/exe`, `/verify` wording и compact/full templates.

### KISS-исправление

Manual top-level execution owner выполняет существующие transitions внутри
`/exe` preflight:

1. Для `planned` повторно проверяет dependencies, blockers и уже применимые
   planning/review/readiness gates; затем пишет `planned -> ready`.
2. Создаёт/reuses tier-appropriate protocol и записывает execution-owner,
   invocation basis и current attempt.
3. Непосредственно перед первым implementation write пишет
   `ready -> in_progress`.
4. `in_progress` разрешает resume только при согласованном task record и
   current-attempt protocol. Ambiguous/foreign attempt требует handoff, а не
   silent adoption.
5. Без explicit top-level execution ownership `/exe` не начинает
   `planned|ready`; scheduler-owned invocation должна уже получить
   `in_progress` от scheduler.
6. Start authority не даёт closure authority; текущие T0/T1/T2/T3 closure rules
   сохраняются.

Protocol-before-status ordering уменьшает crash window: `ready` с подготовленным
protocol допустим, а `in_progress` без protocol уже является doctor defect.
Implementation не начинается до durable `in_progress`.

Не добавлять promoter command, mode/task field, lifecycle status или отдельный
attempt registry.

### Поверхность изменений

- `skills/_shared/references/workflows/tier-policy.md`;
- `skills/_shared/references/commands/exe.md`;
- `skills/_shared/references/commands/verify.md` только для согласованного
  implemented/resume precondition;
- compact template и full plan/context/handoff template для start owner/attempt.

### Acceptance

Нужны отдельные cases: planned с open/closed dependencies; ready; scheduler-owned
in_progress; matching manual in_progress resume; ambiguous attempt; missing
execution owner; execution owner без closure owner; T0/T1 fast-lane closure;
T2/T3 handoff. Ни один case не начинает writes до `in_progress`.

## 6. Partial install `cold-start` ведёт к неполному bootstrap (исходный №11)

**Вердикт:** полностью подтверждён source semantics installer.

### Что доказано сырцами

- `/cold-start` при missing `.memory-bank/` возвращает `--bootstrap-only`.
- Installer вычисляет `install = !bootstrapOnly`; следовательно,
  `--bootstrap-only` действительно пропускает runtime command installation.
- При `--bootstrap` installer включает и install, и bootstrap, а отсутствие
  explicit selection приводит к default `--skill '*'`.
- `howItWorks.md` сейчас объединяет `/cold-start` и `/mb-init` под одним
  `--bootstrap-only` route.
- После поддерживаемого `--skill cold-start` target может получить skeleton, но
  не получить `/brief`, `/write-prd`, `/map-codebase` и остальные routes,
  которые рекомендует сам `/cold-start`.

### Оценка

- важность: `4/5` — поддерживаемый entry/recovery route приводит к
  нефункциональному downstream;
- сложность: `1/5`;
- риск раздувания: `1/5`;
- объём: `2/5` — command doc, root doc и smoke.

### KISS-исправление

Только missing-skeleton route установленного `/cold-start` должен вернуть:

```bash
node <devrails-checkout>/scripts/install-framework.mjs \
  --bootstrap --target <target-repo> --yes
```

`/mb-init` остаётся thin Memory Bank maintenance router и сохраняет
`--bootstrap-only`/`--bootstrap-only --sync`. CLI flags и partial install
semantics менять не нужно.

### Поверхность изменений

- `skills/_shared/references/commands/cold-start.md`;
- `howItWorks.md`, где routes сейчас объединены;
- README только если там появится/есть тот же partial recovery example.

### Acceptance

`cold-start` route логически ведёт к full command set + skeleton, а `mb-init`
route по-прежнему не переустанавливает commands.

## 7. Compact template допускает manual `failed|blocked` transition (исходный №8)

**Вердикт:** полностью подтверждён прямым конфликтом template и tier policy.

### Что доказано сырцами

- Metadata placeholder template допускает
  `status: done|status: failed|blocked` и даже синтаксически неодинаково пишет
  `blocked`.
- `## Closure Decision` повторно предлагает
  `none|status: done|status: failed|status: blocked` без разделения mode/owner.
- Tier policy даёт manual `/exe` только одну final transition: T0/T1 fast-lane
  `status: done` после compact PASS.
- При отсутствии fast-lane conditions `/exe` обязан оставить lifecycle
  неизменным. Scheduler failure handling отдельно владеет `failed|blocked`.

### Оценка

- важность: `4/5` — executable template предлагает неавторизованный lifecycle
  write;
- сложность: `1/5`;
- риск раздувания: `1/5`;
- объём: `2/5` — template и точечная consumer wording check.

### KISS-исправление

В том же template разделить:

- `manual /exe decision: status unchanged | status: done`;
- `scheduler decision: none | status: done | status: failed | status: blocked`.

Manual `done` разрешён только при exact compact PASS и всех fast-lane
conditions. `VERDICT: FAIL|BLOCKED` остаётся evidence verdict, а не lifecycle
authority. Новый manual failure workflow не нужен.

Tier policy уже формулирует правило достаточно точно; копировать туда template
shape не требуется.

### Поверхность изменений

- `skills/_shared/references/protocols/compact-run-template.md`;
- `skills/_shared/references/commands/exe.md` только если нужна точная ссылка на
  разделённые branches.

### Acceptance

Source scan не находит manual `/exe` placeholder, предлагающий `failed|blocked`;
scheduler branch сохраняет обе transitions.

## 8. Missing-workflow preflight противоречит terminal handoff (исходный №6)

**Вердикт:** подтверждён, но только для halt до protocol creation.

### Что доказано сырцами

- `/autonomous` требует при missing required workflow вернуть
  `HALT_POLICY_VIOLATION` до creation/reuse run protocol и любых durable writes.
- Общий handoff contract без исключения требует записать terminal state,
  reason, evidence и resume command в
  `.protocols/AUTONOMOUS-RUN/status.md`.
- В missing-workflow branch этот status file либо ещё не существует, либо его
  запрещено reuse/write. Оба требования одновременно выполнить нельзя.

### Оценка

- важность: `3/5` — scenario редкий, но contract логически невыполним;
- сложность: `1/5`;
- риск раздувания: `1/5`;
- объём: `1/5` — один command contract.

### KISS-исправление

- pre-protocol `HALT_POLICY_VIOLATION` возвращает terminal state, missing paths,
  external installer owner и exact resume command только в command response;
- общий durable handoff действует только после успешного protocol preflight;
- обходной status/halt artifact не создаётся.

Это не новый terminal state и не новая protocol phase.

### Поверхность изменений

Только `skills/_shared/references/commands/autonomous.md`.

### Acceptance

Source contract однозначно различает pre-protocol response-only halt и любой
последующий durable halt.

## 9. Fresh skill registry hardcodes только `cold-start` (исходный №10)

**Вердикт:** подтверждён; первая оценка недооценивала legacy migration.

### Что доказано сырцами

- `init-mb.js` всегда seed-ит `## Installed` как `- cold-start`.
- Full installer устанавливает runtime commands перед bootstrap, но generator не
  читает `.agents/skills` или `.claude/skills`.
- `/mb-garden` уже требует сверять registry с обеими runtime surfaces, поэтому
  framework сам признаёт filesystem источником факта установки.
- `mb-lint` проверяет наличие skills index, но не его соответствие runtime.
- Existing `skills/index.md` не имеет generated markers; sync его вообще не
  обновляет.
- `## When to use` перечисляет многие commands независимо от partial/empty
  runtime. Даже после исправления Installed block этот section нужно трактовать
  как guidance «when installed», а не как второй factual registry.

Наличие `/mb-garden` снижает blast radius: drift можно исправить позже. Но fresh
generated registry всё равно изначально ложен.

### Оценка

- важность: `3/5` — discovery/maintenance defect, не блокирующий сами installed
  commands;
- сложность: `4/5` — fresh generation проста, но безопасный переход legacy
  unmarked block сложнее;
- риск раздувания: `3/5` — не нужны manifest, registry DB или parser framework;
- объём: `3/5` — generator, structure reference, sync migration и fixtures.

### KISS-исправление

1. Сканировать target paths `.agents/skills/*/SKILL.md` и
   `.claude/skills/*/SKILL.md`.
2. Писать sorted generated table `skill | agents | claude`.
3. На fresh file сразу использовать paired markers.
4. На legacy file мигрировать только точный baseline `## Installed` block;
   modified/ambiguous block сохранять и сообщать conflict.
5. Authored sections сохранять; default `## When to use` назвать guidance для
   installed commands или формулировать условно.
6. При отсутствии runtime dirs писать явный empty state, не выдумывать
   `cold-start`.

Directory name достаточно как availability identity для generated DevRails
commands. Не добавлять второй manifest или installer cache; frontmatter parser
нужен только если появится отдельное доказанное требование проверять name/dir
mismatch.

### Поверхность изменений

- `skills/_shared/scripts/init-mb.js`;
- `skills/_shared/references/structure-template.md`;
- sync mixed-block handling из finding №3;
- `mb-garden.md` только если его current filesystem semantics потребуется
  уточнить, а не для дублирования scan logic.

### Acceptance

Cases: full, partial, empty и asymmetric `.agents`/`.claude`; exact legacy
baseline; user-modified legacy block; authored sections; deterministic sorting.

## 10. `structure-template.md` дублирует устаревший MB-SYNC checklist (исходный №12)

**Вердикт:** подтверждён только как source-reference drift.

### Что доказано сырцами

- В конце `structure-template.md` существует отдельный `# MB-SYNC Checklist` с
  `Lint passes (0 errors)`.
- Canonical `workflows/mb-sync.md` и `/mb-sync` command запрещают full lint и
  doctor внутри sync; post-sync gates принадлежат scheduler/manual caller.
- `init-mb.js` не содержит эту устаревшую полную checklist copy.
- Direct runtime generation и bootstrap не используют `structure-template.md`
  как executable input. Файл является canonical source reference для
  maintainers, а не deployed runtime policy.

### Оценка

- важность: `1/5` — текущий runtime contract не ломается;
- сложность: `1/5`;
- риск раздувания: `1/5` — fix удаляет duplication;
- объём: `1/5`.

### KISS-исправление

Удалить embedded checklist и оставить короткий router на canonical
`.memory-bank/workflows/mb-sync.md` с указанием caller-owned post-sync gates.
Validator текстового равенства не нужен.

### Поверхность изменений

Только `skills/_shared/references/structure-template.md`, если финальный source
scan не обнаружит ещё одну executable copy.

### Acceptance

В structure reference отсутствуют `# MB-SYNC Checklist` и `Lint passes`, а
canonical workflow остаётся единственной полной policy.

## 11. Scheduler ownership contradiction (исходный №5) — уже исправлен

**Вердикт:** finding больше не воспроизводится в текущих сырцах.

### Что проверено

- `tier-policy.md` прямо говорит: `/autonomous` владеет transitions только
  bounded `FT-000` phase, `/autopilot` — только reviewed product queue.
- `mb-doctor.md` повторяет то же phase split.
- `autonomous.md` запрещает принимать/mutate product tasks в Foundation phase и
  передаёт product queue `/autopilot`.
- `autopilot.md` определяет `task/queue` только как non-`FT-000` records и
  запрещает изменять `FT-000`.
- README, `howItWorks.md` и `GREENFIELD_WORKFLOW.md` уже phase-qualified.
- Общая фраза tier policy о том, что оба schedulers применяют один failure
  contract, не является contradiction: preceding ownership boundary ограничивает
  каждому свой record set.
- Формулировка mb-sync о caller `/autonomous` or `/autopilot` относится к
  post-sync gates активной фазы, а не даёт обоим ownership всех task transitions.

Исходное предложение сделать `/autopilot` единственным owner вообще было бы
ошибочным: оно оставило бы `FT-000` без scheduler owner и нарушило бы прямой
запрет `/autopilot` менять Foundation records.

### Оценка

- важность: `0/5`;
- реализация: не требуется;
- место в implementation batches: отсутствует.

Сохранить этот пункт как rejected/resolved audit evidence, чтобы старое
предложение не было реализовано позднее по инерции.

## Рекомендуемые implementation batches

1. **Sync/deployment ownership:** исходные findings 3, 1 и 10. Сначала точная
   ownership/migration policy, затем protocol templates и factual registry block.
2. **Executable readiness/safety:** findings 2 и 4. Foundation matrix и
   `write_boundary` grammar независимы по данным, но оба меняют readiness source.
3. **Manual lifecycle:** findings 9 и 8. Сначала start ownership/attempt ordering,
   затем compact closure placeholders.
4. **Broken/contradictory routes:** findings 11 и 6.
5. **Source cleanup:** finding 12.

Finding 5 не включать: он уже закрыт текущими сырцами.

После каждого implementation batch: syntax check, source-only `shared-*` count,
узкие regression fixtures и обязательные isolated install/bootstrap/sync checks
из `AGENTS.md`.
