# DevRails workflow findings: повторный source-only аудит

Статус документа: review notes; findings №1–4, №7 и №9 реализованы и
проверены, остальные пункты остаются без реализации.

Дата повторной проверки: 2026-07-20.

Пункты отсортированы по важности исправления и пронумерованы в этом порядке.

## Граница проверки

Повторный аудит выполнен только по текущим сырцам репозитория:

- canonical commands, workflows, roles и protocol templates в
  `skills/_shared/`;
- generator `skills/_shared/scripts/init-mb.js`;
- installer `scripts/install-framework.mjs` и vendor
  `scripts/vendor-shared.mjs`;
- validators `skills/mb-garden/assets/{mb-lint,mb-doctor}.mjs`;
- root documentation и `PROJECT_MAP.md`.

При исходном повторном аудите installer/bootstrap не запускались. Для findings
№1–4, №7 и №9 после одобрения решений выполнены isolated
install/bootstrap/sync smoke и regression test; для остальных пунктов
`подтверждён` означает только source code и contract evidence, а не runtime
smoke result.

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

Оценки сложности, риска и объёма относятся к рекомендуемому KISS-исправлению,
а не к максимально общей реализации проблемы.

## Сводка

| Finding | Итог повторной проверки | Важность | Сложность | Риск раздувания | Объём | Приоритет |
|---:|---|---:|---:|---:|---:|---|
| 1 | исправлен; schema/coherent-upgrade smoke проходит | 5/5 | 2/5 | 2/5 | 3/5 | закрыт |
| 2 | исправлен; templates deployed/synced по stable target path | 5/5 | 2/5 | 1/5 | 3/5 | закрыт |
| 3 | исправлен; Foundation doctor regression проходит | 5/5 | 3/5 | 2/5 | 3/5 | закрыт |
| 4 | исправлен; boundary grammar/install-sync smoke проходит | 5/5 | 4/5 | 5/5 | 4/5 | закрыт |
| 5 | подтверждён; start и closure ownership нужно разделить | 4/5 | 4/5 | 3/5 | 4/5 | P1 |
| 6 | подтверждён source semantics installer | 4/5 | 1/5 | 1/5 | 2/5 | P1 |
| 7 | исправлен; manual и scheduler closure branches разделены | 4/5 | 1/5 | 1/5 | 2/5 | закрыт |
| 8 | подтверждён, но только для pre-protocol halt | 3/5 | 1/5 | 1/5 | 1/5 | P2 |
| 9 | исправлен; filesystem registry install/sync smoke проходит | 3/5 | 4/5 | 3/5 | 3/5 | закрыт |
| 10 | подтверждён только как source-reference drift | 1/5 | 1/5 | 1/5 | 1/5 | P3 |

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

## 1. `--sync` оставляет устаревшие framework-owned assets

**Статус:** закрыт.

- `task.schema.json` и другие явно framework-owned assets обновляются на sync;
  project/mixed state и routers сохраняются.
- Полный upgrade выполняется через `--bootstrap --sync`, а
  `--bootstrap-only --sync` остаётся Memory Bank repair route.
- Sync report различает `created|updated|unchanged|kept`; isolated regression
  проверяет coherence, idempotence и сохранение project state.

## 2. Protocol templates недоступны установленному runtime-agent

**Статус:** закрыт.

- Все canonical protocol templates разворачиваются и синхронизируются как
  framework-owned `.memory-bank/templates/protocols/*`.
- Runtime commands используют stable target paths только для initialization;
  заполненные `.protocols/<TASK_ID>/*` остаются task-owned resume state.
- `/mb-sync` не редактирует template leaf; regression покрывает bootstrap,
  sync, Codex/Claude paths и отсутствие лишнего router warning.

## 3. Strict doctor пропускает незавершённый Foundation contract

**Статус:** закрыт.

- Для non-empty queue `/mb-doctor` требует current `foundation.md`: default
  сообщает warning, strict блокирует incomplete или contradictory state.
- Foundation-only queue сохраняет open-gate execution; product queue требует
  done gate, отсутствие unresolved `FT-000` и direct/transitive dependencies.
- Existing finding codes и lifecycle ownership сохранены; regression покрывает
  state matrix, bootstrap/sync и Codex/Claude runtime contract.

## 4. Hard `write_boundary` не имеет общей path semantics

**Статус:** закрыт.

- `write_boundary` и deprecated alias используют literal project-relative
  POSIX paths с canonical segment-prefix semantics из `tier-policy.md`.
- Generated schema и `mb-lint` проверяют path syntax; `forbidden_scope` и
  `stop_conditions` сохраняют prose semantics, doctor не дублирует validator.
- Sequential execution остаётся canonical; regression покрывает grammar,
  alias, bootstrap/sync и conservative fallback без новых workflow artifacts.

## 5. Manual `/exe` допускает `planned`, но start-transition owner не определён

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

## 6. Partial install `cold-start` ведёт к неполному bootstrap

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

`/mb-init` остаётся thin router: missing-skeleton bootstrap сохраняет
`--bootstrap-only`, а explicit framework sync использует согласованный в
finding №1 полный `--bootstrap --sync`. CLI flags и partial install semantics
менять не нужно.

### Поверхность изменений

- `skills/_shared/references/commands/cold-start.md`;
- `howItWorks.md`, где routes сейчас объединены;
- README только если там появится/есть тот же partial recovery example.

### Acceptance

`cold-start` missing-skeleton route логически ведёт к full command set +
skeleton; `mb-init` не устанавливает commands при fresh bootstrap, но full
framework sync не оставляет schema/workflows и runtime commands разных версий.

## 7. Compact template допускает manual `failed|blocked` transition

**Статус:** закрыт.

- Manual `/exe` допускает только `status unchanged|status: done`; `done`
  требует compact PASS и все fast-lane conditions.
- `failed|blocked` остаются scheduler-owned transitions; regression проверяет
  разделение branches.

## 8. Missing-workflow preflight противоречит terminal handoff

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

## 9. Fresh skill registry hardcodes только `cold-start`

**Статус:** закрыт.

- `## Installed` строится из фактических `.agents/.claude` `SKILL.md` как
  deterministic per-surface table; отсутствие runtime skills имеет явный empty
  state.
- Sync обновляет только paired-marker block, мигрирует exact legacy
  `- cold-start` и сохраняет authored или неоднозначный state с warning.
- Guidance условна по active surface; regression покрывает full/empty, drift,
  legacy migration, authored sections и isolated install/bootstrap без нового
  manifest, parser или validator gate.

## 10. `structure-template.md` дублирует устаревший MB-SYNC checklist

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

## Рекомендуемые implementation batches

1. **Sync/deployment ownership:** findings 1 и 2 закрыты; finding 9 — factual
   registry block на уже определённой ownership policy.
2. **Executable readiness/safety:** findings 3 и 4. Foundation matrix и
   `write_boundary` grammar независимы по данным, но оба меняют readiness source.
3. **Manual lifecycle:** finding 7 закрыт; finding 5 остаётся отдельной задачей
   про start ownership/attempt ordering.
4. **Broken/contradictory routes:** findings 6 и 8.
5. **Source cleanup:** finding 10.

После каждого implementation batch: syntax check, source-only `shared-*` count,
узкие regression fixtures и обязательные isolated install/bootstrap/sync checks
из `AGENTS.md`.
