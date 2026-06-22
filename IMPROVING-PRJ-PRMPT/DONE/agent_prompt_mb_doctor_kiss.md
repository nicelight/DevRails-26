# Промпт для отдельного AI-агента

Ты — независимый AI implementation agent в репозитории:

https://github.com/nicelight/memobank_BMAD_SDD

Твоя задача: внедрить **KISS-версию `mb-doctor`** — deterministic readiness gate для AI-only разработки.

`mb-doctor` должен быть простым, проверяемым и полезным для autonomous/autopilot workflow. Не превращай его в большой semantic reviewer и не дублируй весь `mb-lint`.

---

# Главное правило

В проекте **не нужна backward compatibility**.

Не добавляй:

- legacy fallback;
- markdown task-card parser;
- migration tool;
- поддержку старого `risk.level: low|medium|high`;
- поддержку старого `risk` object;
- поддержку task records без `tier`;
- режим “если JSON нет, попробуй прочитать markdown”;
- поддержку `.memory-bank/tasks/backlog.md`;
- сложную эвристику или LLM-review внутри doctor.

Если task records повреждены или не содержат `tier`, это ошибка workflow.

---

# Текущий целевой контекст

Framework использует schema-backed JSON task records.

Authoritative task model:

- `.memory-bank/tasks/index.json` — единственный machine-readable task registry.
- `.memory-bank/tasks/TASK-*.task.json` — authoritative task records.
- `.memory-bank/schemas/task.schema.json` — task record schema.

В проекте **нет** `.memory-bank/tasks/backlog.md`.

Не создавай, не читай, не парси, не обновляй и не упоминай `backlog.md` как валидный workflow artifact.

Если `.memory-bank/tasks/backlog.md` существует, `mb-doctor` должен считать это obsolete/invalid artifact.

Default mode:

- `TASK_BACKLOG_MD_PRESENT` = error.

Strict mode:

- `TASK_BACKLOG_MD_PRESENT` = error.

Task routing определяется только:

```json
"tier": "T0"
```

Допустимые значения:

```text
T0 | T1 | T2 | T3
```

Если в репозитории ещё осталась старая модель:

```json
"risk": { ... }
```

или:

```json
"risk.level": "low"
```

`mb-doctor` должен считать это ошибкой.

---

# Fresh skeleton rule

Fresh bootstrap может иметь пустой `.memory-bank/tasks/index.json`.

Это валидное состояние skeleton-проекта.

Default `mb-doctor` mode:

- empty task index is not an error;
- report `TASK_INDEX_EMPTY` as `info`;
- message: `No task records yet. This is valid for a fresh skeleton.`

Strict `mb-doctor --strict` mode:

- empty task index is an error because autonomous/autopilot execution has no executable task queue;
- use finding code `TASK_INDEX_EMPTY`;
- suggested fix: create task records via `/prd-to-tasks FT-XXX` after `/prd` and `/clarify FT-XXX`.

Do not require seeded `.memory-bank/tasks/TASK-001.task.json`.

---

# Что такое `mb-doctor`

`mb-lint` отвечает:

```text
Структура Memory Bank валидна?
```

`mb-doctor` отвечает:

```text
Можно ли безопасно продолжать autonomous/autopilot execution?
```

KISS-версия `mb-doctor` должна проверять только readiness-critical вещи:

1. `mb-lint` проходит.
2. JSON task registry не сломан.
3. Indexed task records валидны и имеют `tier`.
4. Task dependencies не создают execution deadlock.
5. Task tier policy соблюдена.
6. Done/failed tasks имеют минимально достаточную evidence/protocol основу.
7. В проекте нет obsolete `.memory-bank/tasks/backlog.md`.

---

# Перед изменениями прочитай минимум

- `README.md`
- `README.en.md`
- `README.ru.md`
- `.github/workflows/release-check.yml`
- `scripts/install-framework.mjs`
- `scripts/vendor-shared.mjs`
- `skills/_shared/scripts/init-mb.js`
- `skills/mb-garden/assets/mb-lint.mjs`
- `skills/mb-garden/SKILL.md`
- `skills/mb-harness/SKILL.md`
- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/commands/mb-sync.md`
- `skills/_shared/references/commands/review.md`
- `skills/_shared/references/workflows/tier-policy.md`, если уже существует

Если `PROJECT_MAP.md`, `HANDOFF.md` или `AGENTS.md` есть в repo root — прочитай их тоже.

---

# Source-only constraint

Репозиторий source-only.

Не коммить generated vendored files:

- `skills/*/agents/shared-*`
- `skills/*/references/shared-*`
- `skills/*/scripts/shared-*`

Проверка должна сохранять:

```bash
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Ожидаемый результат:

```text
0
```

Если нужно проверить install/vendoring, используй:

```bash
node scripts/install-framework.mjs --skill '*' --yes
```

или временную директорию. Не коммить результат vendoring.

---

# Фаза 1 — план

Создай:

`.protocols/TASK-MB-DOCTOR/plan.md`

В плане зафиксируй:

1. Какие файлы будут изменены.
2. Что именно проверяет `mb-doctor`.
3. Что остаётся ответственностью `mb-lint`.
4. Как обрабатывается пустой `tasks/index.json`.
5. Как запрещается obsolete `backlog.md`.
6. Какие checks считаются `ERROR`.
7. Какие checks считаются `WARNING` / `INFO`.
8. Какие CLI flags будут поддержаны.
9. Что явно out of scope.

Не начинай массовую реализацию до этого плана.

---

# Фаза 2 — добавить `mb-doctor.mjs`

Добавь:

`skills/mb-garden/assets/mb-doctor.mjs`

Требования:

- Node.js script.
- ESM, как `mb-lint.mjs`.
- No external npm dependencies.
- Работает из root target repository.
- Проверяет `.memory-bank/`.
- Выводит human-readable report.
- Имеет JSON output для AI scheduler.

Минимальный CLI:

```bash
node scripts/mb-doctor.mjs
node scripts/mb-doctor.mjs --strict
node scripts/mb-doctor.mjs --json
node scripts/mb-doctor.mjs --strict --json
```

Семантика:

- default mode: health report; exit code `1` только при hard errors.
- `--strict`: autonomous-readiness mode; readiness blockers становятся errors.
- `--json`: machine-readable report.
- `--strict --json`: machine-readable autonomous readiness report.

JSON формат:

```json
{
  "status": "pass",
  "summary": {
    "errors": 0,
    "warnings": 0,
    "infos": 0
  },
  "findings": [
    {
      "severity": "error",
      "code": "TASK_READY_DEP_NOT_DONE",
      "path": ".memory-bank/tasks/TASK-002.task.json",
      "message": "Task is ready but dependency TASK-001 is not done.",
      "suggested_fix": "Finish TASK-001 or set TASK-002 to planned/blocked."
    }
  ]
}
```

Finding codes должны быть стабильными и machine-readable.

---

# Фаза 3 — проверки `mb-doctor`

## 3.1 Preflight

Проверить:

- `.memory-bank/` exists.
- `.memory-bank/tasks/index.json` exists.
- `.memory-bank/schemas/task.schema.json` exists.
- `.memory-bank/tasks/backlog.md` does not exist.
- `scripts/mb-lint.mjs` exists.

Если `scripts/mb-lint.mjs` есть:

- запусти его через child process;
- если lint падает, `mb-doctor` возвращает `ERROR`;
- не скрывай stdout/stderr lint-а в human-readable mode.

Если `scripts/mb-lint.mjs` отсутствует:

- default mode: `WARNING`;
- strict mode: `ERROR`.

Не дублируй весь `mb-lint`. `mb-doctor` может повторно читать task records, но не должен становиться вторым полным linter-ом.

Suggested codes:

- `MB_MISSING`
- `MB_LINT_SCRIPT_MISSING`
- `MB_LINT_FAILED`
- `TASK_INDEX_MISSING`
- `TASK_SCHEMA_MISSING`
- `TASK_RECORD_MISSING`
- `TASK_BACKLOG_MD_PRESENT`

---

## 3.2 Task queue readiness

Проверить по `.memory-bank/tasks/index.json` и indexed `.task.json`.

Rules:

- empty task index is allowed in default mode as `info`;
- empty task index is error in strict mode;
- every indexed task file exists;
- every indexed task has `tier`;
- `tier` is one of `T0|T1|T2|T3`;
- task record must not contain `risk`;
- no `ready` task has unfinished dependencies;
- if a task is `failed`, all direct dependents are `blocked`;
- if a task is `planned` and all dependencies are `done`, emit warning: it may be ready;
- if there are no `ready` or `in_progress` tasks, but there are `planned` or `blocked` tasks, emit deadlock warning/error depending on mode;
- no `in_progress` task in strict mode unless `.protocols/<TASK_ID>/` exists.

Default mode:

- `TASK_INDEX_EMPTY` = info.
- `TASK_PLANNED_READY_CANDIDATE` = warning.
- `TASK_QUEUE_DEADLOCK` = warning.
- `TASK_IN_PROGRESS_WITHOUT_PROTOCOL` = warning.

Strict mode:

- `TASK_INDEX_EMPTY` = error.
- `TASK_QUEUE_DEADLOCK` = error.
- `TASK_IN_PROGRESS_WITHOUT_PROTOCOL` = error.
- `TASK_READY_DEP_NOT_DONE` = error in all modes.

Suggested codes:

- `TASK_INDEX_EMPTY`
- `TASK_TIER_MISSING`
- `TASK_TIER_INVALID`
- `TASK_OLD_RISK_OBJECT`
- `TASK_READY_DEP_NOT_DONE`
- `TASK_PLANNED_READY_CANDIDATE`
- `TASK_QUEUE_DEADLOCK`
- `TASK_FAILED_DEPENDENTS_NOT_BLOCKED`
- `TASK_IN_PROGRESS_WITHOUT_PROTOCOL`

---

## 3.3 Tier protocol readiness

Use only this tier policy:

```text
T0/T1 → compact protocol allowed
T2/T3 → full protocol required
T2/T3 → verify + red-verify required when done
T3 → human-aware checkpoint + rollback/recovery note required when done
```

### For T0/T1 done tasks

Accept compact protocol:

`.protocols/<TASK_ID>/run.md`

Check:

- `run.md` exists;
- contains `Verdict` and `PASS` / `DONE`;
- contains minimal evidence/checks section.

Default mode:

- missing `run.md` = warning for T0, error for T1 done.
- missing evidence/checks = warning.

Strict mode:

- missing compact protocol for done T0/T1 = error.
- missing verdict = error.

### For T2/T3 done tasks

Full protocol required:

- `.protocols/<TASK_ID>/context.md`
- `.protocols/<TASK_ID>/plan.md`
- `.protocols/<TASK_ID>/progress.md`
- `.protocols/<TASK_ID>/verification.md`
- `.protocols/<TASK_ID>/handoff.md`

Also required:

- `verification.md` contains `PASS` or `VERDICT: PASS`;
- red verification evidence exists:
  - `.protocols/<TASK_ID>/red-verification.md`
  - or `.tasks/<TASK_ID>/*RED*`;
- `.tasks/<TASK_ID>/` exists.

For T3 done tasks also require:

- human-aware checkpoint marker;
- rollback/recovery note.

Markers can be simple text search in relevant protocol files:

```text
human checkpoint
human-aware checkpoint
approval checkpoint
rollback
recovery
```

Do not implement complex semantic analysis.

Suggested codes:

- `COMPACT_PROTOCOL_MISSING`
- `COMPACT_VERDICT_MISSING`
- `COMPACT_EVIDENCE_MISSING`
- `FULL_PROTOCOL_MISSING`
- `FULL_VERIFICATION_MISSING`
- `FULL_VERDICT_NOT_PASS`
- `RED_VERIFY_MISSING`
- `RUNTIME_EVIDENCE_DIR_MISSING`
- `T3_HUMAN_CHECKPOINT_MISSING`
- `T3_ROLLBACK_NOTE_MISSING`

---

## 3.4 Failed task readiness

For `status: failed` tasks check:

- verification or run protocol contains `FAIL` / `VERDICT: FAIL`;
- there is at least one bug doc in `.memory-bank/bugs/` mentioning the task id, or at least one follow-up task depending on or referencing the failed task;
- direct dependents are `blocked`.

Default mode:

- missing bug/follow-up = warning.

Strict mode:

- missing bug/follow-up = error.

Suggested codes:

- `FAILED_VERDICT_MISSING`
- `FAILED_BUG_OR_FOLLOWUP_MISSING`
- `FAILED_DEPENDENTS_NOT_BLOCKED`

---

## 3.5 Minimal REQ/FT linkage

Keep this simple.

Do not build a full RTM engine.

Check:

- T1/T2/T3 tasks should have non-empty `reqs`;
- T1/T2/T3 tasks should have non-empty `feature`;
- ignore placeholders like `REQ-XXX`, `FT-XXX`;
- if task references `REQ-001`, it should appear somewhere in `.memory-bank/requirements.md`;
- if task references `FT-001`, and `.memory-bank/features/` contains files, matching `FT-001-*.md` should exist.

T0 may have empty `reqs` or generic feature if it is truly docs-only.

Default mode:

- missing reqs/feature = warning.

Strict mode:

- missing reqs/feature for T1/T2/T3 = error.

Suggested codes:

- `TASK_REQS_MISSING`
- `TASK_FEATURE_MISSING`
- `TASK_REQ_NOT_IN_REQUIREMENTS`
- `TASK_FEATURE_FILE_MISSING`

Do not require every REQ in `requirements.md` to have task coverage in this KISS version.

---

## 3.6 Obsolete backlog check

Check:

- `.memory-bank/tasks/backlog.md` must not exist.

There is no backlog summary/router in the current task model.

Suggested code:

- `TASK_BACKLOG_MD_PRESENT`

---

# Фаза 4 — command spec `/mb-doctor`

Добавь:

`skills/_shared/references/commands/mb-doctor.md`

Содержание:

- `/mb-doctor` = readiness gate поверх `mb-lint`;
- `mb-lint` validates structure;
- `mb-doctor` validates autonomous readiness;
- commands:

```bash
node scripts/mb-lint.mjs
node scripts/mb-doctor.mjs
node scripts/mb-doctor.mjs --strict
node scripts/mb-doctor.mjs --strict --json
```

- перед `/autopilot` и `/autonomous` запускать strict mode;
- no `backlog.md`;
- no markdown task cards;
- no old `risk.level`;
- only JSON task registry + task records;
- only `tier: T0|T1|T2|T3`.

Также обнови hard-coded command lists, где они есть:

- generated `AGENTS.md` inside `skills/_shared/scripts/init-mb.js`;
- generated `.memory-bank/skills/index.md` seed text;
- README command lists, если они есть.

---

# Фаза 5 — workflow command specs

Обнови:

- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/commands/mb-sync.md`
- `skills/_shared/references/commands/review.md`

Минимальные правила:

## `/autopilot`

Before scheduler loop:

```bash
node scripts/mb-lint.mjs
node scripts/mb-doctor.mjs --strict
```

If doctor fails:

- stop;
- set terminal state `HALT_QUALITY_GATES`;
- write reason to `.protocols/AUTONOMOUS-RUN/status.md`.

## `/autonomous`

Before batch execution:

```bash
node scripts/mb-lint.mjs
node scripts/mb-doctor.mjs --strict
```

After each wave:

```bash
node scripts/mb-doctor.mjs --strict
```

Final success only if:

- latest review = `APPROVE`;
- `mb-lint` passes;
- `mb-doctor --strict` passes.

## `/mb-sync`

After sync:

- update JSON task records if needed;
- do not refresh or mention `backlog.md`;
- run `mb-doctor` default mode before continuing autonomous progression.

## `/review`

Reviewer reports should consider `mb-doctor` findings if present.

Do not add a new `/check` wrapper.

---

# Фаза 6 — mb-garden / mb-harness

Обнови кратко:

- `skills/mb-garden/SKILL.md`
- `skills/mb-harness/SKILL.md`

`mb-garden`:

- `mb-lint` = mechanical hygiene.
- `mb-doctor` = workflow health / autonomous readiness.
- normal maintenance: run lint + doctor default.
- autonomous readiness: run lint + doctor strict.

`mb-harness`:

- install/copy `mb-doctor.mjs` next to `mb-lint.mjs`;
- use `mb-doctor --strict` as autonomous/autopilot gate;
- CI may run doctor default on generated skeleton.

---

# Фаза 7 — generated skeleton / init-mb

Update `skills/_shared/scripts/init-mb.js`:

1. Add `/mb-doctor` to generated `AGENTS.md` command list.
2. Add `mb-doctor` to generated `.memory-bank/skills/index.md`.
3. Add short mention of doctor to `.memory-bank/workflows/autonomy-policy.md`.
4. Add short mention of doctor to `.memory-bank/workflows/execute-loop.md`.

Do not automatically create `scripts/mb-doctor.mjs` in target repo unless current project already auto-creates `scripts/mb-lint.mjs`.

Keep KISS.

---

# Фаза 8 — CI smoke

Update:

`.github/workflows/release-check.yml`

Required:

- syntax check:

```bash
node --check skills/mb-garden/assets/mb-doctor.mjs
```

- install smoke checks installed skill contains:

```text
.agents/skills/mb-garden/assets/mb-doctor.mjs
```

or corresponding installed asset path.

- dry bootstrap smoke:
  - copy `mb-lint.mjs` and `mb-doctor.mjs` into temp `scripts/`;
  - run:

```bash
node scripts/mb-lint.mjs
node scripts/mb-doctor.mjs
```

Do not run strict mode on bare generated skeleton with empty task index.

No heavy fixtures unless absolutely necessary.

---

# Фаза 9 — docs

Update briefly:

- `README.en.md`
- `README.ru.md`
- relevant `SKILL.md` files, if they mention maintenance/gates.

Add only:

- `mb-lint` validates structure;
- `mb-doctor` validates workflow readiness;
- before autonomous execution:

```bash
node scripts/mb-lint.mjs
node scripts/mb-doctor.mjs --strict
```

- only JSON task registry + task records are supported;
- `.memory-bank/tasks/backlog.md` is not part of the workflow;
- only `tier: T0|T1|T2|T3` is supported;
- markdown task cards and old risk model are not supported.

Do not rewrite full README.

---

# Фаза 10 — validation

Run:

```bash
node --check scripts/vendor-shared.mjs
node --check scripts/install-framework.mjs
node --check skills/_shared/scripts/init-mb.js
node --check skills/mb-garden/assets/mb-lint.mjs
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
cp /path/to/repo/skills/mb-garden/assets/mb-doctor.mjs scripts/mb-doctor.mjs
node scripts/mb-lint.mjs
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

Do not add:

- backward compatibility;
- markdown task-card support;
- old `risk.level` support;
- old `risk` object support;
- `.memory-bank/tasks/backlog.md` support;
- migration/conversion tool;
- `/check` wrapper;
- heavy RTM coverage engine;
- changelog enforcement;
- external dependencies;
- semantic LLM review;
- deploy/publish;
- license changes;
- large docs rewrite.

---

# Definition of done

Done only if:

1. `skills/mb-garden/assets/mb-doctor.mjs` exists.
2. `skills/_shared/references/commands/mb-doctor.md` exists.
3. Doctor supports default, `--strict`, `--json`, `--strict --json`.
4. Doctor runs or requires `mb-lint`.
5. Doctor validates JSON task registry and indexed task records.
6. Doctor treats empty `tasks/index.json` as valid in default mode and blocker in strict mode.
7. Doctor validates `tier: T0|T1|T2|T3`.
8. Doctor rejects old `risk` object.
9. Doctor rejects `.memory-bank/tasks/backlog.md`.
10. Doctor validates protocol/evidence expectations by tier.
11. Doctor checks failed-task follow-up basics.
12. Doctor checks minimal REQ/FT linkage.
13. `/autopilot` and `/autonomous` require doctor strict before autonomous progression.
14. `mb-garden` and `mb-harness` document doctor.
15. CI smoke includes doctor.
16. Source-only hygiene preserved.
17. No legacy task/risk/backlog support.

---

# Final report

At the end, return:

```text
Summary
- ...

Doctor modes
- ...

Checks
- ...

Tier policy integration
- ...

JSON-only task model
- ...

Validation
- ...

Out of scope
- ...

Known risks / follow-ups
- ...
```
