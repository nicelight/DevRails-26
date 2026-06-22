# Промпт для отдельного AI-агента

Ты — независимый AI implementation agent в репозитории:

https://github.com/nicelight/memobank_BMAD_SDD

Твоя задача: внедрить в framework **Project Constitution** как короткий верхнеуровневый governing layer для AI-first разработки.

Придерживайся KISS. Не превращай проект в GitHub Spec Kit, не добавляй `.specify/`, не создавай новый большой процессный слой.

---

# Главное правило

Canonical artifact:

```text
.memory-bank/constitution.md
```

Constitution — это верхний governing layer над Memory Bank, но не замена существующих документов:

```text
constitution.md      → принципы, non-negotiables, governance
mbb/index.md         → правила ведения Memory Bank
spec-index.md        → router по normative docs
invariants.md        → конкретные MUST/NEVER правила проекта
contracts/*          → boundary contracts
states/*             → state/lifecycle rules
workflows/*          → operational workflow policies
```

Constitution должна отвечать на вопрос:

```text
Какие принципы управляют решениями агентов?
```

А не превращаться в энциклопедию всех правил проекта.

---

# No legacy / no backward compatibility

Не добавляй поддержку старого функционала.

Не добавляй:

- `.specify/`;
- fallback на старые форматы;
- compatibility layer;
- старые markdown task cards;
- старую risk-модель `risk.level`;
- alias `/mb-constitution`;
- отдельный package skill `skills/mb-constitution`;
- migration tooling;
- большие governance workflows.

Если текущий framework уже использует JSON task records и `tier: T0|T1|T2|T3`, Constitution должна ссылаться именно на эту модель.

Если tier-функционал ещё не полностью присутствует в repo, не реализуй его в этой задаче. Только не противоречь ему и не вводи альтернативную модель риска.

---

# Цель изменения

Добавить минимальный constitution layer, который:

1. появляется в generated Memory Bank skeleton;
2. читается агентами во время priming;
3. доступен через project command `/constitution`;
4. учитывается в `/prd`, `/prd-to-tasks`, `/review`, `/mb-sync`, `/mb-garden`;
5. не дублирует `invariants.md`, `spec-index.md`, `tier-policy.md`;
6. не добавляет лишних aliases, package skills и compatibility paths.

---

# Перед изменениями прочитай минимум

- `README.md`
- `README.en.md`
- `README.ru.md`
- `AGENTS-myTemplate.md`
- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/commands/prd.md`
- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/_shared/references/commands/review.md`
- `skills/_shared/references/commands/mb-sync.md`
- `skills/_shared/references/commands/mb-garden.md`
- `skills/mb-init/SKILL.md`
- `skills/cold-start/SKILL.md`

Если в repo уже есть эти файлы, также прочитай:

- `skills/_shared/references/workflows/tier-policy.md`
- `skills/mb-garden/assets/mb-lint.mjs`
- `skills/mb-garden/assets/mb-doctor.mjs`

Если путь отличается, найди эквивалент. Не пропускай молча.

---

# Фаза 1 — план

Создай:

```text
.protocols/TASK-CONSTITUTION/plan.md
```

В плане зафиксируй:

1. какие файлы будут изменены;
2. где будет создана `.memory-bank/constitution.md`;
3. как Constitution будет добавлена в priming order;
4. какие команды станут constitution-aware;
5. что НЕ входит в scope.

Не начинай массовые изменения до этого плана.

---

# Фаза 2 — skeleton constitution

Обнови:

```text
skills/_shared/scripts/init-mb.js
```

Bootstrap должен создавать:

```text
.memory-bank/constitution.md
```

Минимальный шаблон:

```md
---
description: Project Constitution — governing principles for AI-first development.
status: active
version: 1
ratified: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# Project Constitution

## Purpose

This Constitution defines the non-negotiable principles that guide AI agents when planning, implementing, verifying, and synchronizing project work.

## Core Principles

### I. AI-First Spec-Driven Development

Agents MUST derive implementation work from explicit product, requirement, feature, task, and workflow artifacts. Agents MUST NOT invent product scope without evidence or user instruction.

### II. Memory Bank Is Durable Project Knowledge

`.memory-bank/` is the durable source of project knowledge. Chat context is temporary. Agents MUST update Memory Bank after meaningful changes.

### III. Schema-Backed Task Execution

Tasks MUST use the current schema-backed JSON task record model. If the framework uses `tier: T0|T1|T2|T3`, agents MUST route execution and verification through that tier model.

### IV. Minimal Verifiable Change

Agents SHOULD prefer the smallest change that satisfies the task. Every completed task MUST have clear checks or evidence.

### V. Evidence Before Done

A task MUST NOT be marked done without verification evidence appropriate to its tier and scope.

### VI. No Legacy Fallback and No Speculation

Agents MUST NOT rely on deprecated task formats, old risk models, or undocumented assumptions. Unknowns MUST be recorded as blockers or explicit assumptions.

### VII. Context Discipline

Agents SHOULD read the smallest sufficient context for the task. Higher-tier or cross-cutting tasks MUST read relevant normative docs such as invariants, contracts, states, testing, and workflow policies.

### VIII. Synchronization

After meaningful changes, agents MUST synchronize affected Memory Bank docs, task state, changelog, and routing files.

## Governance

- Constitution has precedence over workflow habits and generated plans.
- MBB, spec-index, invariants, contracts, states, testing, and workflow docs refine this Constitution; they must not contradict it.
- Amendments must include rationale and update affected docs if needed.
- Constitution should stay short. Put concrete project rules into `invariants.md`, `contracts/*`, `states/*`, or workflow policy docs.

**Version**: 1 | **Ratified**: YYYY-MM-DD | **Last updated**: YYYY-MM-DD
```

Use current date dynamically in JS.

Do not add semantic versioning logic. `version: 1` is enough for now.

---

# Фаза 3 — routing и priming

Обнови `skills/_shared/scripts/init-mb.js` так, чтобы generated skeleton:

1. Добавлял Constitution в `.memory-bank/index.md`.
2. Добавлял Constitution в `.memory-bank/spec-index.md` under `Global / Governance`.
3. Добавлял правило в `.memory-bank/mbb/index.md`:
   - Constitution is the top governing policy.
   - MBB/spec-index/invariants must not contradict it.
4. Добавлял Constitution в generated `AGENTS.md` priming order.

Рекомендуемый priming order:

```text
1. AGENTS.md
2. .memory-bank/constitution.md
3. .memory-bank/mbb/index.md
4. .memory-bank/spec-index.md
5. .memory-bank/index.md
6. task/feature-specific docs
```

Также обнови `AGENTS-myTemplate.md` тем же смыслом.

---

# Фаза 4 — `/constitution` command

Создай:

```text
skills/_shared/references/commands/constitution.md
```

Стиль: как остальные command specs.

Минимальное поведение команды:

- read `.memory-bank/constitution.md`;
- if missing, create it from skeleton;
- read key governance context:
  - `.memory-bank/mbb/index.md`
  - `.memory-bank/spec-index.md`
  - `.memory-bank/invariants.md`
  - `.memory-bank/workflows/*`
  - `AGENTS.md`
- update Constitution only when user asks to amend/create/clarify governing principles;
- do not invent domain-specific principles without evidence;
- remove vague placeholders;
- keep the document short;
- ensure it does not contradict MBB/spec-index/invariants/tier-policy;
- if dependent docs need updates, list them and update only minimal affected docs.

Do not add:

- `/mb-constitution` alias;
- package skill;
- semver engine;
- Sync Impact Report block;
- large template sync logic.

---

# Фаза 5 — сделать ключевые команды Constitution-aware

Обнови кратко:

```text
skills/_shared/references/commands/prd.md
skills/_shared/references/commands/prd-to-tasks.md
skills/_shared/references/commands/review.md
skills/_shared/references/commands/mb-sync.md
skills/_shared/references/commands/mb-garden.md
```

## `/prd`

Добавить правило:

- read `.memory-bank/constitution.md` before generating product/requirements/features;
- do not generate requirements that contradict Constitution;
- if there is a conflict, ask/block instead of inventing a workaround.

## `/prd-to-tasks`

Добавить правило:

- read `.memory-bank/constitution.md` before implementation planning;
- add short `Constitution Check` section to implementation plan;
- include `.memory-bank/constitution.md` in task `normative_inputs` only when materially relevant;
- do not add noisy normative_inputs for every tiny task if it adds no value.

## `/review`

Добавить правило:

- review must flag Constitution violations as blocking issues.

## `/mb-sync`

Добавить правило:

- sync checklist should include Constitution consistency when workflows, requirements, policies, or task routing changed.

## `/mb-garden`

Добавить правило:

- garden should flag stale/contradictory Constitution references.

Do not update every command in the repo. Keep scope limited to planning/review/sync/maintenance.

---

# Фаза 6 — lint / doctor

KISS rule:

- Do not add deep semantic constitution validation.
- Do not create `mb-doctor` if it does not exist.

If `skills/mb-garden/assets/mb-lint.mjs` already has required core file checks, add `.memory-bank/constitution.md` as a required core file.

If `skills/mb-garden/assets/mb-doctor.mjs` already exists, add only one strict-mode check:

```text
Constitution exists and is linked from index/spec-index.
```

No more.

---

# Фаза 7 — README / skills docs

Update briefly:

- `README.en.md`
- `README.ru.md`
- `README.md`, if it has command/feature lists
- `skills/mb-init/SKILL.md`
- `skills/cold-start/SKILL.md`

Add only:

- `.memory-bank/constitution.md` exists as project governing principles;
- `/constitution` creates/updates it;
- agents read it early during priming;
- it must not replace invariants/contracts/spec-index.

Do not rewrite docs.

---

# Фаза 8 — CI smoke

Обнови:

```text
.github/workflows/release-check.yml
```

Minimal checks:

- dry bootstrap generates `.memory-bank/constitution.md`;
- `.memory-bank/index.md` links to constitution;
- `.memory-bank/spec-index.md` links to constitution;
- generated `.memory-bank/commands/constitution.md` exists;
- `node scripts/mb-lint.mjs` still passes if lint is part of smoke;
- source-only hygiene remains unchanged.

Do not add heavy fixtures.

---

# Фаза 9 — validation

Run:

```bash
node --check scripts/vendor-shared.mjs
node --check scripts/install-framework.mjs
node --check skills/_shared/scripts/init-mb.js
```

If present:

```bash
node --check skills/mb-garden/assets/mb-lint.mjs
node --check skills/mb-garden/assets/mb-doctor.mjs
```

Dry bootstrap smoke:

```bash
TMP_DIR="$(mktemp -d)"
cd "$TMP_DIR"
node /path/to/repo/skills/_shared/scripts/init-mb.js
test -f .memory-bank/constitution.md
test -f .memory-bank/commands/constitution.md
grep -q "constitution.md" .memory-bank/index.md
grep -q "constitution.md" .memory-bank/spec-index.md
```

Source-only hygiene:

```bash
if find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | grep -q .; then
  echo 'Found vendored shared-* files in source-only repository'
  exit 1
fi
```

If a test fails, fix the implementation.

---

# Out of scope

Do not implement:

- `.specify/`;
- `/mb-constitution`;
- `skills/mb-constitution`;
- semantic versioning engine;
- Sync Impact Report;
- deep governance diff tooling;
- migration tooling;
- backward compatibility layer;
- old markdown task card support;
- old `risk.level` support;
- domain-specific principles;
- large docs rewrite;
- new autonomous scheduler behavior;
- tier implementation itself.

---

# Definition of done

Done only if:

1. Generated skeleton includes `.memory-bank/constitution.md`.
2. Generated `.memory-bank/index.md` links to Constitution.
3. Generated `.memory-bank/spec-index.md` links to Constitution.
4. Generated `.memory-bank/mbb/index.md` states Constitution precedence.
5. Generated `AGENTS.md` and `AGENTS-myTemplate.md` prime Constitution early.
6. `/constitution` command spec exists.
7. `/prd`, `/prd-to-tasks`, `/review`, `/mb-sync`, `/mb-garden` are Constitution-aware.
8. README / init skill docs mention Constitution briefly.
9. CI smoke checks Constitution bootstrap.
10. No `.specify/` directory.
11. No `/mb-constitution` alias.
12. No `skills/mb-constitution` package skill.
13. No backward compatibility logic.
14. No large semantic versioning / Sync Impact machinery.

---

# Final report format

Return:

```text
Summary
- ...

Files changed
- path: purpose

Behavior added
- ...

Validation
- command/result

Out of scope
- ...

Known risks / follow-ups
- ...
```
