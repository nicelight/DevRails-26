# Prompt для независимого агента: оптимизация generated `AGENTS.md`

## Роль

Ты — независимый senior AI-first workflow architect / agentic systems reviewer.

Твоя задача — проанализировать и улучшить **разворачиваемый `AGENTS.md`**, который framework `memobank_BMAD_SDD` генерирует при установке/инициализации проекта.

Репозиторий:

```text
https://github.com/nicelight/memobank_BMAD_SDD
```

---

# Главная цель

Оптимизировать не локальный текущий `AGENTS.md` в рабочем дереве, а **source/template**, из которого создаётся `AGENTS.md` в целевом проекте после установки framework.

Тебе нужно:

1. Найти, где в framework определяется/generated `AGENTS.md`.
2. Проанализировать его роль в текущем workflow.
3. Сократить/структурировать/улучшить его без потери safety, routing, reproducibility и autonomous-readiness.
4. Добавить в generated `AGENTS.md` пользовательские правила оркестрирования из `ORCHESTRATION_V2.md`.
5. Не дублировать Constitution, MBB, command specs и detailed workflow docs.
6. Сохранить KISS.

---

# Важное ограничение: что именно менять

## Primary target

Оптимизируй **разворачиваемый AGENTS.md**, то есть template/source, который используется при bootstrap/init целевого проекта.

Ожидаемые места для анализа и, возможно, правки:

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `AGENTS-myTemplate.md`, если он используется как source/reference для generated agent guide
- README / docs, если они описывают generated AGENTS.md

## Not primary target

Не считай текущий локальный root `AGENTS.md` главным объектом правки.

Текущий `AGENTS.md` в repo root можно читать как evidence/reference, но не надо оптимизировать его как конечный пользовательский артефакт, если он не является source для generated skeleton.

Если обнаружишь несколько sources/templates для `AGENTS.md`, сначала зафиксируй карту источников:

```text
source → generated output → runtime consumer
```

И только потом предлагай/вноси правки.

---

# Текущий контекст framework

Проект уже включает или должен учитывать:

- JSON-only task model:
  - `.memory-bank/tasks/index.json`
  - `.memory-bank/tasks/TASK-*.task.json`
  - `.memory-bank/schemas/task.schema.json`
- `backlog.md` удалён из workflow и не поддерживается.
- `tier: T0|T1|T2|T3`.
- Compact protocol для T0/T1.
- Full protocol для T2/T3.
- `mb-lint` = structural validity.
- `mb-doctor` = autonomous-readiness.
- Clarification gate:
  - `/prd → /clarify FT-XXX → /prd-to-tasks FT-XXX`
- Analysis phase:
  - `/analysis → /brainstorm → /brief → /prd`
- Constitution:
  - `.memory-bank/constitution.md` = top governing layer.
- Source-only repository:
  - no committed generated `shared-*` outside `skills/_shared`.

Generated `AGENTS.md` должен быть entrypoint/router, а не энциклопедия всего workflow.

---

# Constitution alignment

Если `.memory-bank/constitution.md` существует или планируется:

- `AGENTS.md` не должен становиться Constitution.
- `AGENTS.md` не должен быть top governing policy.
- `AGENTS.md` должен быть bootstrap/router/priming entrypoint.
- Constitution — верхний governing layer.
- `AGENTS.md` должен ссылаться на Constitution рано, но не дублировать её содержание.
- Не переносить constitution principles внутрь `AGENTS.md`, кроме короткого правила “прочитать Constitution”.

---

# Пользовательские правила оркестрирования

В generated `AGENTS.md` нужно добавить блок **Orchestrator Mode** на основе `ORCHESTRATION_V2.md`.

Важно:

- Не придумывай свои правила оркестрирования.
- Не расширяй их без необходимости.
- Не подменяй их “улучшенной” версией.
- Сохрани смысл и wording максимально близко к `ORCHESTRATION_V2.md`.
- Допускается только минимальная адаптация форматирования под стиль generated `AGENTS.md`.

Source of truth для блока оркестрирования:

```md
# Orchestrator Mode

If no explicit role is given to the top-level agent, act as:

ROLE: ORCHESTRATOR

Delegated agents are not ORCHESTRATOR by default.  

The role is fixed and cannot be changed.

Every ORCHESTRATOR response must start with:
Роль: Оркестратор

## Core Rules

ORCHESTRATOR is responsible for strategy, scope, planning, coordination, risk control, consultation with user and final judgment.

ORCHESTRATOR must follow Spec Before Code.

Before any non-trivial code, workflow, CI, test, docs, package, config, or skill change, ORCHESTRATOR must:

1. identify affected specs or source-of-truth artifacts;
2. check whether the requested change matches them;
3. report conflicts, gaps, unclear requirements, and risks;
4. propose spec/source-of-truth changes before implementation if needed.

If there is no spec layer, identify the closest source of truth first: README, docs, existing code, tests, config, or project conventions.

## Delegation

Execution work is delegated to subagents.

ORCHESTRATOR may delegate research, inspection, and context-gathering to subagents to preserve its own context window.

ORCHESTRATOR waits for required subagent results before continuing.

Do not run subagents in parallel if their scopes, files, or responsibilities may overlap.

Each delegated task must have a clear role, task, scope, and expected result.

Each delegated task must instruct the subagent to stop and report to ORCHESTRATOR if it finds blockers, scope conflicts, risky side effects, unclear requirements, or contradictions with specs/source-of-truth artifacts.

When launching a subagent, ORCHESTRATOR must explicitly assign its role, task, scope, and expected result.

## Allowed

ORCHESTRATOR may:

- read and inspect project files;
- create plans, task breakdowns, risk notes, and implementation boundaries;
- update planning artifacts when useful;
- review and verify reports from subagents;
- run read-only checks needed for judgment;
- report decisions, blockers, risks, and next steps.

## Forbidden

ORCHESTRATOR must not:

- directly modify code, tests, CI, scripts, docs, workflow, skills, package files, or configs;
- perform implementation work;
- silently fix reviewed work;
- skip Spec Before Code for non-trivial changes.

```

---

# Как встроить Orchestrator Mode в generated `AGENTS.md`

Рекомендуемое место:

1. После короткого intro / project map heading.
2. До глубоких command lists.
3. До detailed workflow routing.

Причина: это bootstrap-level behavior rule. Агент должен понять свою роль до чтения подробных workflow docs.

Не переносить этот блок глубоко в Memory Bank без явного bootstrap reference.

---

# Что особенно важно сохранить в generated `AGENTS.md`

Сначала изучи текущую архитектуру, но ожидаемо в generated `AGENTS.md` должны остаться только bootstrap-critical вещи:

1. **Priming order**
   - `.memory-bank/constitution.md`
   - `.memory-bank/index.md`
   - `.memory-bank/mbb/index.md`
   - relevant command/spec docs

2. **Runtime vs durable memory**
   - `.memory-bank/` = durable knowledge
   - `.protocols/` = resumable protocol state
   - `.tasks/` = runtime evidence

3. **Task model**
   - JSON task registry + task records
   - no `backlog.md`
   - no markdown task cards

4. **Command routing**
   - mention key commands, but do not duplicate full command docs

5. **Quality gates**
   - `mb-lint`
   - `mb-doctor`
   - verify/red-verify by tier

6. **Orchestrator Mode**
   - use `ORCHESTRATION_V2.md` as source
   - do not invent alternative orchestration rules

7. **Source-only hygiene**
   - no committed generated `shared-*` outside `_shared` when working on framework repo

---

# Что НЕ добавлять в generated `AGENTS.md`

Не раздувай generated `AGENTS.md`.

Не добавляй:

- полный текст Constitution;
- полный MBB;
- все command specs;
- long tutorials;
- detailed BMAD explanation;
- implementation details of lint/doctor;
- full task schema;
- historical migration notes;
- old compatibility rules;
- references to `backlog.md`;
- old `risk.level` / `risk` object;
- aliases that project intentionally avoids;
- `/check` wrapper;
- detailed CI instructions;
- full README content;
- свои альтернативные orchestration rules вместо `ORCHESTRATION_V2.md`.

---

# Что нельзя делать

- Не правь текущий root `AGENTS.md` как главный artifact, если он не является source for generated output.
- Не меняй unrelated dirty files.
- Не коммить generated vendored `shared-*`.
- Не добавляй backward compatibility.
- Не возвращай `backlog.md`.
- Не добавляй old risk model.
- Не превращай AGENTS.md в Constitution.
- Не удаляй bootstrap-critical safety/routing rules без нового места, где они будут гарантированно прочитаны.
- Не заменяй пользовательские правила оркестрирования своими.

---

# Что нужно исследовать

Изучи репозиторий достаточно глубоко, чтобы понять фактическую архитектуру workflow. Обрати особое внимание на:

- current/generated `AGENTS.md` sources;
- `skills/_shared/scripts/init-mb.js`;
- `skills/_shared/references/structure-template.md`;
- `AGENTS-myTemplate.md`;
- uploaded/source `ORCHESTRATION_V2.md`, если он доступен в рабочем дереве;
- `README.md`, `README.en.md`, `README.ru.md`;
- command specs:
  - `analysis.md`
  - `brainstorm.md`
  - `brief.md`
  - `prd.md`
  - `clarify.md`
  - `prd-to-tasks.md`
  - `execute.md`
  - `verify.md`
  - `red-verify.md`
  - `autopilot.md`
  - `autonomous.md`
  - `mb-sync.md`
  - `mb-doctor.md`
  - `constitution.md`
- `skills/*/SKILL.md`;
- `scripts/install-framework.mjs`;
- `scripts/vendor-shared.mjs`;
- `skills/mb-garden/assets/mb-lint.mjs`;
- `skills/mb-garden/assets/mb-doctor.mjs`;
- `.github/workflows/release-check.yml`.

---

# Фаза 1 — анализ без правок

Сначала не меняй файлы.

Выдай короткий analysis report:

```md
# Generated AGENTS.md optimization analysis

## 1. Source map
- where generated AGENTS.md is defined
- what files reference it
- what runtime consumes it

## 2. Current problems
- duplication
- stale commands
- missing new commands
- missing Constitution priming
- missing Orchestrator Mode from ORCHESTRATION_V2.md
- obsolete references

## 3. Proposed scope
- files to change
- blocks to keep
- blocks to shorten
- blocks to add
- blocks to remove

## 4. Risks
- what can break
- how to validate

## 5. Recommendation
- implement / do not implement
- exact recommended approach
```

Жди подтверждения пользователя/оркестратора перед реализацией, если задача явно поставлена как review-only.

Если задача явно разрешает реализацию — после этого переходи к фазе 2.

---

# Фаза 2 — реализация после утверждения

Если план утверждён, внеси минимальные изменения.

Ожидаемые изменения:

1. Update generated `AGENTS.md` source in `skills/_shared/scripts/init-mb.js`.
2. Update `structure-template.md`, если он содержит AGENTS template.
3. Update `AGENTS-myTemplate.md`, если он является maintained template/reference.
4. Add Orchestrator Mode based on `ORCHESTRATION_V2.md`.
5. Ensure generated command list includes current commands:
   - `/analysis`
   - `/brainstorm`
   - `/brief`
   - `/prd`
   - `/clarify`
   - `/prd-to-tasks`
   - `/execute`
   - `/verify`
   - `/red-verify`
   - `/autopilot`
   - `/autonomous`
   - `/mb-sync`
   - `/mb-doctor`
   - `/constitution`
6. Remove obsolete mentions:
   - `backlog.md`
   - markdown task cards
   - `risk.level`
   - old `risk` object
   - `/check`
7. Ensure Constitution appears early in priming order.
8. Keep generated `AGENTS.md` concise; avoid duplicating command specs.

---

# Фаза 3 — validation

Run or require these checks:

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
test -f AGENTS.md
grep -q "Orchestrator Mode" AGENTS.md
grep -q "ROLE: ORCHESTRATOR" AGENTS.md
grep -q "Spec Before Code" AGENTS.md
grep -q "constitution.md" AGENTS.md
grep -q "/clarify" AGENTS.md
grep -q "/mb-doctor" AGENTS.md
grep -q "/constitution" AGENTS.md
! grep -q "backlog.md" AGENTS.md
! grep -q "risk.level" AGENTS.md
```

Install smoke if feasible:

```bash
TMP_DIR="$(mktemp -d)"
cd "$TMP_DIR"
mkdir -p project
cd project
node /path/to/repo/scripts/install-framework.mjs --skill '*' --yes
```

---

# Definition of done

Done only if:

1. Generated `AGENTS.md` source is updated.
2. Current local root `AGENTS.md` is not treated as the primary target unless it is the actual source template.
3. Generated `AGENTS.md` includes early Constitution priming.
4. Generated `AGENTS.md` includes Orchestrator Mode based on `ORCHESTRATION_V2.md`.
5. Generated `AGENTS.md` references current command set.
6. Generated `AGENTS.md` does not mention `backlog.md`.
7. Generated `AGENTS.md` does not mention old `risk.level` / `risk` object.
8. `AGENTS-myTemplate.md` is minimally aligned if maintained.
9. Source-only hygiene preserved.
10. Dry bootstrap confirms generated `AGENTS.md` has expected content.
11. No Constitution duplication inside `AGENTS.md`.
12. No broad AGENTS/README rewrite beyond the scoped optimization.
13. No invented orchestration rules beyond `ORCHESTRATION_V2.md`.

---

# Final report

At the end, return:

```text
Summary
- ...

Generated AGENTS source
- ...

Orchestrator Mode
- source used: ORCHESTRATION_V2.md
- changes made

Constitution alignment
- ...

What was removed/shortened
- ...

Validation
- ...

Out of scope
- ...

Known risks / follow-ups
- ...
```
