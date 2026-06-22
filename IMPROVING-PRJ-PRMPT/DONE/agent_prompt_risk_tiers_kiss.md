# Промпт для отдельного AI-агента

Ты — независимый AI implementation agent в репозитории:

https://github.com/nicelight/memobank_BMAD_SDD

Твоя задача: внедрить в framework **градацию сложности/риска задач через единую модель `tier: T0–T3`** и **compact protocol для простых задач**.

Придерживайся KISS. Нужны только те изменения, которые реально улучшают AI-only workflow и могут быть проверены tooling-ом.

---

# Главное правило

В проекте **не нужна backward compatibility**.

Не добавляй:

- legacy fallback;
- поддержку старых markdown task cards;
- поддержку старого `risk.level: low|medium|high`;
- объект `risk`;
- `risk.triggers`;
- migration tool;
- compatibility layer;
- режим “если нового поля нет — попробуй старое”.

Если task record не содержит `tier`, это ошибка.

---

# Текущий контекст проекта

Framework уже использует schema-backed JSON task records:

- `.memory-bank/tasks/index.json`
- `.memory-bank/tasks/TASK-001.task.json`
- `.memory-bank/schemas/task.schema.json`

`.memory-bank/tasks/backlog.md` — только readable summary/router.

После этой задачи authoritative execution routing должен определяться только полем:

```json
"tier": "T0"
```

Допустимые значения:

```text
T0 | T1 | T2 | T3
```

Не используй отдельную модель `risk`, `risk.level`, `risk.triggers`, `risk.protocol`, `low/medium/high`.

---

# Цель изменения

Сейчас workflow слишком одинаково строгий для разных задач.

Нужно сделать простое правило:

```text
task.tier → protocol mode → required checks → verify/red-verify policy → MB-SYNC expectations
```

Это должно быть встроено в:

- task schema;
- generated skeleton;
- `/prd-to-tasks`;
- `/execute`;
- `/verify`;
- `/red-verify`;
- `/autopilot`;
- `/autonomous`;
- `/mb-sync`;
- `mb-lint`;
- `mb-doctor`, если он уже существует;
- CI smoke tests;
- краткую документацию.

---

# Tier model

## T0 — trivial / docs-only

Примеры:

- typo;
- formatting;
- broken link;
- маленькое уточнение README / Memory Bank;
- изменение без влияния на runtime behavior, contracts, state, tests, data, security.

Workflow:

- compact protocol;
- no separate `mb-verify`;
- no `mb-red-verify`;
- evidence может быть краткой записью в compact protocol;
- MB-SYNC только если изменение meaningful для Memory Bank.

## T1 — local code / local behavior

Примеры:

- изменение одной локальной функции;
- unit test;
- локальная валидация;
- маленький компонент без cross-module impact.

Workflow:

- compact protocol разрешён;
- relevant lint/typecheck/unit tests, если есть;
- verification записывается в compact protocol;
- `mb-red-verify` не нужен;
- MB-SYNC нужен, если меняется documented behavior, task state, requirements или changelog.

## T2 — cross-module / API / state / data / domain

Примеры:

- API / contracts / events / schemas;
- state machine / lifecycle;
- migration / data behavior;
- несколько модулей;
- существенная domain/business logic;
- риск “tests pass, но смысл неверный”.

Workflow:

- full protocol обязателен;
- compact protocol запрещён;
- `mb-verify` обязателен;
- `mb-red-verify` обязателен;
- evidence обязательно сохраняется в `.tasks/<TASK_ID>/`;
- MB-SYNC обязателен.

## T3 — critical / security / production / irreversible

Примеры:

- auth / permissions / secrets;
- security-sensitive behavior;
- deploy/runtime/production impact;
- irreversible migration;
- data loss;
- payments;
- compliance;
- destructive operations.

Workflow:

- full protocol обязателен;
- compact protocol запрещён;
- `mb-verify` обязателен;
- `mb-red-verify` обязателен;
- нужен human-aware checkpoint перед autonomous closure;
- нужен rollback/recovery note;
- MB-SYNC обязателен.

---

# Простые правила назначения tier

Используй только эти правила. Не добавляй сложную scoring-систему.

- Если задача docs-only и безопасна → `T0`.
- Если задача локальная, с низким blast radius → `T1`.
- Если задача затрагивает API, contracts, state, data, migration, domain logic, несколько модулей → минимум `T2`.
- Если задача затрагивает auth, security, deploy/runtime, production, irreversible/data-loss, payments, compliance → `T3`.
- Если сомневаешься между двумя tier — выбирай более высокий.
- Если во время реализации scope оказался выше ожидаемого — обнови `tier` в `.task.json` на более высокий и продолжай по policy более высокого tier.

Не добавляй explicit escalation/downgrade record в этой задаче.

---

# Что НЕ добавлять

Не добавляй сейчас:

- explicit escalation/downgrade record;
- сложный `risk.triggers` enum;
- отдельный risk object;
- новый большой command wrapper типа `/check`;
- migration tooling;
- поддержку старых task formats;
- внешние npm dependencies;
- product-specific requirements;
- большой rewrite README;
- отдельную scoring-систему сложности.

---

# Фаза 1 — план

Создай:

`.protocols/TASK-TIERS/plan.md`

В плане зафиксируй:

1. Какие файлы будут изменены.
2. Как будет удалён старый `risk.level` и заменён на единственный `tier`.
3. Как T0/T1 используют compact protocol.
4. Как T2/T3 используют full protocol.
5. Какие проверки появятся в `mb-lint`.
6. Нужно ли обновлять `mb-doctor` в текущем repo.
7. Какие проверки будут в CI.
8. Что явно out of scope.

Не начинай массовые изменения до этого плана.

---

# Фаза 2 — task schema и generated skeleton

Обнови:

`skills/_shared/scripts/init-mb.js`

Нужно:

1. В `.memory-bank/schemas/task.schema.json` заменить старую risk-модель на обязательное поле:

```json
"tier": {
  "type": "string",
  "enum": ["T0", "T1", "T2", "T3"]
}
```

2. Убрать из schema и seeded task record:

```json
"risk": {
  "level": "low",
  "reasons": [],
  "red_verify_required": false
}
```

3. В generated `.memory-bank/tasks/TASK-001.task.json` добавить:

```json
"tier": "T0"
```

4. В generated `.memory-bank/tasks/backlog.md` показывать `tier` в summary table.

5. В generated `.memory-bank/index.md` и relevant workflow docs добавить короткую ссылку на tier policy.

---

# Фаза 3 — central tier policy doc

Добавь один центральный policy document:

`skills/_shared/references/workflows/tier-policy.md`

И обеспечь, чтобы bootstrap создавал:

`.memory-bank/workflows/tier-policy.md`

Документ должен быть коротким:

- таблица T0–T3;
- protocol mode для каждого tier;
- verify/red-verify policy;
- human checkpoint для T3;
- MB-SYNC expectations;
- правило: если сомневаешься — выбирай более высокий tier;
- правило: task без `tier` невалидна.

Не превращай policy doc в длинный manual.

---

# Фаза 4 — compact protocol template

Добавь template:

`skills/_shared/references/protocols/compact-run-template.md`

Compact protocol file для T0/T1:

`.protocols/<TASK_ID>/run.md`

Template должен быть коротким:

```md
# <TASK_ID> — <title>

## Tier
T0|T1

## Goal
...

## Scope
Allowed:
- ...

Not allowed:
- ...

## Context used
- ...

## Changes
- ...

## Checks / Evidence
- ...

## MB-SYNC
Done / not needed + reason

## Verdict
PASS | FAIL | BLOCKED
```

Не добавляй несколько compact-файлов. Один `run.md` достаточно.

---

# Фаза 5 — command specs

Обнови command specs.

## `/prd-to-tasks`

Файл:

`skills/_shared/references/commands/prd-to-tasks.md`

Требования:

- каждая `.task.json` получает обязательное поле `tier`;
- task без tier не создаётся;
- T0/T1 можно планировать под compact protocol;
- T2/T3 должны быть full protocol;
- если задача затрагивает API/contracts/state/data/security/runtime/cross-module behavior — не назначай T0/T1;
- `backlog.md` остаётся только summary/router.

## `/execute`

Файл:

`skills/_shared/references/commands/execute.md`

Требования:

- сначала читать `.task.json`;
- если `tier` отсутствует — stop with error;
- T0/T1 → создать/использовать `.protocols/<TASK_ID>/run.md`;
- T2/T3 → создать/использовать full protocol:
  - `context.md`
  - `plan.md`
  - `progress.md`
  - `verification.md`
  - `handoff.md`
- compact protocol запрещён для T2/T3;
- для T3 добавить human-aware checkpoint + rollback/recovery note в protocol.

## `/verify`

Файл:

`skills/_shared/references/commands/verify.md`

Требования:

- читать `tier`;
- T0: separate `/verify` обычно не нужен; verification может быть в compact run;
- T1: verification может быть в compact run, если scope локальный и checks выполнены;
- T2/T3: `/verify` обязателен;
- PASS/FAIL обновляет `.task.json`.

## `/red-verify`

Файл:

`skills/_shared/references/commands/red-verify.md`

Если есть.

Требования:

- T0/T1: обычно не нужен;
- T2/T3: обязателен;
- T3: report должен включать critical/security/runtime/recovery concerns.

## `/autopilot` и `/autonomous`

Файлы:

- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/autonomous.md`

Требования:

- scheduler читает только JSON task records;
- task без `tier` блокирует run;
- T0/T1 могут выполняться compact path;
- T2/T3 выполняются только full protocol path;
- T3 не может быть silently closed без human-aware checkpoint marker;
- перед autonomous progression запускать `mb-lint`;
- если `mb-doctor` существует — запускать strict mode.

## `/mb-sync`

Файл:

`skills/_shared/references/commands/mb-sync.md`

Требования:

- синхронизировать `tier` в readable backlog summary;
- проверять, что T2/T3 имеют full protocol/evidence/red-verify before final closure;
- `backlog.md` не хранит authoritative state.

---

# Фаза 6 — mb-lint

Обнови:

`skills/mb-garden/assets/mb-lint.mjs`

Обязательные проверки:

1. Every task record has `tier`.
2. `tier` is one of `T0 | T1 | T2 | T3`.
3. Task record must not contain old `risk` object.
4. Task schema must not contain old `risk.level`.
5. T2/T3 done or in_progress task must not use compact-only protocol.
6. T2/T3 done task must have full protocol files:
   - `context.md`
   - `plan.md`
   - `progress.md`
   - `verification.md`
   - `handoff.md`
7. T2/T3 done task must have red-verification evidence:
   - `.protocols/<TASK_ID>/red-verification.md`
   - or clear `.tasks/<TASK_ID>/*RED*` artifact.
8. T3 done task must have human-aware checkpoint marker and rollback/recovery note.
9. `backlog.md` must not contain markdown task cards.

Не подключай external JSON schema validator.

---

# Фаза 7 — mb-doctor, если уже есть

Если в repo уже есть:

`skills/mb-garden/assets/mb-doctor.mjs`

обнови его.

Если файла нет — **не создавай его в этой задаче**.

Doctor strict mode должен считать blocker:

- missing `tier`;
- old `risk` object;
- T2/T3 compact protocol;
- T2/T3 without red-verification evidence when done;
- T3 without human-aware checkpoint when done;
- task tier выглядит явно заниженным по documented scope/protocol evidence.

Не добавляй сложную эвристику. KISS: достаточно проверить явные markers и protocol files.

---

# Фаза 8 — skills/docs

Обнови кратко:

- `skills/mb-execute/SKILL.md`
- `skills/mb-verify/SKILL.md`
- `skills/mb-red-verify/SKILL.md`
- `skills/mb-garden/SKILL.md`
- `skills/mb-harness/SKILL.md`
- `skills/mb-from-prd/SKILL.md`
- `skills/cold-start/SKILL.md`
- `skills/mb-init/SKILL.md`
- README.en.md
- README.ru.md

Не переписывай всё.

Нужно только добавить:

- task records use `tier: T0-T3`;
- T0/T1 can use compact protocol;
- T2/T3 require full protocol;
- T2/T3 require verify + red-verify;
- no old `risk.level`;
- no markdown task cards.

---

# Фаза 9 — CI smoke

Обнови:

`.github/workflows/release-check.yml`

Минимальные проверки:

- generated skeleton содержит `.memory-bank/workflows/tier-policy.md`;
- generated `.memory-bank/tasks/TASK-001.task.json` содержит `"tier"`;
- generated `.memory-bank/schemas/task.schema.json` содержит enum `T0/T1/T2/T3`;
- generated task record не содержит `"risk"`;
- `node scripts/mb-lint.mjs` проходит;
- source-only hygiene сохраняется.

Если `mb-doctor.mjs` существует:

- добавить `node --check skills/mb-garden/assets/mb-doctor.mjs`;
- в smoke скопировать его в temp `scripts/`;
- запустить default mode;
- strict mode запускать только если temp fixture реально autonomous-ready.

Не добавляй тяжёлые fixtures без необходимости.

---

# Фаза 10 — проверки перед финалом

Выполни:

```bash
node --check scripts/vendor-shared.mjs
node --check scripts/install-framework.mjs
node --check skills/_shared/scripts/init-mb.js
node --check skills/mb-garden/assets/mb-lint.mjs
```

Если `mb-doctor.mjs` существует:

```bash
node --check skills/mb-garden/assets/mb-doctor.mjs
```

Source-only hygiene:

```bash
if find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | grep -q .; then
  echo 'Found vendored shared-* files in source-only repository'
  exit 1
fi
```

Dry bootstrap smoke:

```bash
TMP_DIR="$(mktemp -d)"
cd "$TMP_DIR"
node /path/to/repo/skills/_shared/scripts/init-mb.js
mkdir -p scripts
cp /path/to/repo/skills/mb-garden/assets/mb-lint.mjs scripts/mb-lint.mjs
node scripts/mb-lint.mjs
```

Если `mb-doctor.mjs` существует:

```bash
cp /path/to/repo/skills/mb-garden/assets/mb-doctor.mjs scripts/mb-doctor.mjs
node scripts/mb-doctor.mjs
```

Install smoke:

```bash
TMP_DIR="$(mktemp -d)"
cd "$TMP_DIR"
mkdir -p project
cd project
node /path/to/repo/scripts/install-framework.mjs --skill '*' --yes
```

---

# Out of scope

Не делай:

- backward compatibility;
- old markdown task card support;
- old `risk.level` support;
- migration tool;
- explicit escalation/downgrade record;
- risk triggers enum;
- new `/check` command;
- external dependencies;
- semantic LLM review inside lint/doctor;
- product-specific requirements;
- deploy/publish;
- license changes;
- большой rewrite docs.

---

# Definition of done

Готово только если:

1. Task schema uses mandatory `tier: T0|T1|T2|T3`.
2. Old `risk.level` model removed.
3. Seeded task record uses `tier`.
4. Tier policy exists in `.memory-bank/workflows/tier-policy.md`.
5. Compact protocol template exists for T0/T1.
6. `/prd-to-tasks` assigns tier.
7. `/execute` routes T0/T1 to compact, T2/T3 to full.
8. `/verify` and `/red-verify` are tier-aware.
9. `/autopilot` and `/autonomous` are tier-aware.
10. `mb-lint` rejects missing tier and old risk object.
11. T2/T3 full protocol + red-verification expectations are enforced for closed tasks.
12. T3 human-aware checkpoint is required for closed tasks.
13. CI smoke updated.
14. Source-only hygiene preserved.
15. No backward compatibility with old task/risk model.

---

# Финальный отчет

В конце выдай короткий отчет:

```text
Summary
- ...

Tier model
- ...

Compact protocol
- ...

Schema/tooling changes
- ...

Validation
- ...

Out of scope
- ...

Known risks / follow-ups
- ...
```
