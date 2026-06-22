# Промпт для отдельного AI-агента

Ты — независимый AI implementation agent в репозитории:

https://github.com/nicelight/memobank_BMAD_SDD

Твоя задача: внедрить **KISS-версию Analysis phase** по мотивам classical BMAD Method.

Этот prompt содержит весь BMAD-контекст, нужный для реализации. Не нужно читать BMAD docs, если только пользователь явно не попросит свериться с ними.

Нужно добавить только минимальный upstream discovery layer перед PRD:

```text
/analysis   # router
/brainstorm # если идея сырая
/brief      # если концепт понятен или после brainstorm
/prd
/clarify FT-XXX
/prd-to-tasks FT-XXX
```

Главная цель: сделать PRD точнее, не утяжеляя execution workflow.

---

# Self-contained BMAD context snapshot

Classical BMAD Method строит работу по фазам. Phase 1 называется **Analysis** и является optional upstream-фазой перед Planning.

Смысл Analysis:

```text
Не строить PRD на сырой идее.
Сначала прояснить, что строим, для кого, зачем и какие предположения опасны.
```

BMAD Analysis использует несколько инструментов:

1. Brainstorming.
2. Research: market / domain / technical.
3. Product Brief.
4. PRFAQ / Working Backwards.

Для memobank в этой задаче внедряются только:

```text
brainstorming → product brief → PRD
```

Не внедряются:

```text
research workflows
PRFAQ
market/domain/technical research
advanced elicitation
full BMAD clone
```

## BMAD meaning: Brainstorming

Brainstorming в BMAD — это не “AI сгенерировал фичи”.

Правильная роль AI:

```text
AI = facilitator / coach.
User = source of product intent and ideas.
```

Brainstorming помогает:

- прояснить problem space;
- расширить пространство решений;
- найти направления;
- сгруппировать идеи;
- выбрать promising directions;
- зафиксировать rejected directions;
- выявить assumptions и open questions;
- подготовить вход для product brief.

Не превращай raw ideas напрямую в requirements.

## BMAD meaning: Product Brief

Product Brief в BMAD — это короткий structured discovery artifact перед PRD.

Смысл:

```text
Product Brief = PRD input contract.
```

Он фиксирует:

- strategic vision;
- target users;
- problem;
- value proposition;
- product concept;
- MVP scope;
- non-goals;
- success metrics;
- constraints;
- assumptions;
- risks;
- open questions;
- decision whether to proceed.

Product Brief не является PRD, backlog или marketing document.

## BMAD relationship to PRD

Product Brief feeds PRD, but PRD does not require Product Brief.

Correct rule:

```text
If product brief exists → PRD should use it as primary upstream source.
If product brief does not exist but user already has PRD → go directly to PRD/planning flow.
If brainstorming exists but brief does not → create brief before PRD.
```

After `/prd`, feature docs must go through feature-level Clarification before task decomposition.

Correct downstream rule:

```text
PRD → Feature docs → /clarify FT-XXX → /prd-to-tasks FT-XXX
```

Analysis is useful when the idea is vague or product direction is unstable. It is not mandatory for every project.

---

# KISS reduction for memobank

Implement only:

```text
/analysis
/brainstorm
/brief
```

Do not add aliases.

Do not add separate research commands.

Do not add separate package skills for brainstorm or brief.

Do not add assumptions.md.

Do not add PRFAQ.

Do not make Analysis mandatory.

Do not implement `/clarify` in this task. Clarification is a separate feature-level gate. This Analysis task only makes sure new Analysis/PRD routing does not bypass it.

---

# Current memobank context

Framework uses or will use:

- `.memory-bank/` — durable knowledge.
- `.protocols/` — task/protocol state.
- `.tasks/` — runtime evidence.
- `.memory-bank/tasks/index.json` and `*.task.json` — authoritative task records.
- `.memory-bank/tasks/backlog.md` — readable summary/router.
- `/prd`, `/clarify`, `/prd-to-tasks`, `/execute`, `/verify`, `/red-verify`, `/mb-sync`.

Analysis artifacts must live in:

```text
.memory-bank/analysis/
```

Not in `.tasks/`.

---

# Clarification dependency

This Analysis implementation must not create task records directly or route directly to `/prd-to-tasks`.

Canonical flow after PRD:

```text
/prd → /clarify FT-XXX → /prd-to-tasks FT-XXX
```

Feature docs created by `/prd` must include clarification metadata if the Clarification phase is present or planned:

```yaml
clarification_status: pending
last_clarified: null
clarification_questions: 0
```

Rules:

- New feature docs default to `clarification_status: pending`.
- `/prd-to-tasks` must not be recommended for a feature until `clarification_status: complete`.
- Analysis does not perform clarification.
- Product Brief override may allow `/prd` to continue, but it must never bypass `/clarify` before `/prd-to-tasks`.

If current repo already has a `/clarify` command spec, align with it. If not, do not create it in this Analysis task; only make docs/routes compatible with future Clarification.

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

Для install smoke используй:

```bash
node scripts/install-framework.mjs --skill '*' --yes
```

или временную директорию. Не коммить результат vendoring.

---

# Перед изменениями прочитай минимум

- `README.md`
- `README.en.md`
- `README.ru.md`
- `.github/workflows/release-check.yml`
- `scripts/install-framework.mjs`
- `scripts/vendor-shared.mjs`
- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/commands/prd.md`
- `skills/_shared/references/commands/clarify.md`, если есть
- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/_shared/references/commands/cold-start.md`, если есть
- `skills/_shared/references/commands/review.md`
- `skills/_shared/references/commands/mb-sync.md`
- `skills/cold-start/SKILL.md`
- `skills/mb-from-prd/SKILL.md`
- `skills/mb-review/SKILL.md`
- `skills/mb-garden/SKILL.md`
- `skills/mb-harness/SKILL.md`
- `skills/mb-garden/assets/mb-lint.mjs`
- `skills/mb-garden/assets/mb-doctor.mjs`, если есть

Если `AGENTS.md`, `PROJECT_MAP.md`, `HANDOFF.md`, `CHANGING_plan.md` есть в repo root — прочитай их тоже.

---

# Фаза 1 — план

Создай:

```text
.protocols/TASK-ANALYSIS/plan.md
```

В плане зафиксируй:

1. Какие файлы будут изменены.
2. Как Analysis вписывается перед `/prd`.
3. Как Analysis не обходит `/clarify`.
4. Почему внедряются только `/analysis`, `/brainstorm`, `/brief`.
5. Какие artifacts будут создаваться.
6. Какие lint/CI checks будут добавлены.
7. Что явно out of scope.

Не начинай массовые изменения до этого плана.

---

# Фаза 2 — новый package skill

Добавь один новый skill:

```text
skills/mb-analysis/
  SKILL.md
  assets/
    analysis-index-template.md
    brainstorming-template.md
    product-brief-template.md
```

Не добавляй отдельные package skills:

- `mb-brainstorm`;
- `mb-brief`;
- `mb-product-brief`;
- `mb-research`.

`skills/mb-analysis/SKILL.md` должен кратко описывать:

- what Analysis is;
- when to use `/analysis`;
- when to use `/brainstorm`;
- when to use `/brief`;
- Analysis is optional;
- `/brief` creates the input contract for `/prd`;
- after `/prd`, feature work still goes through `/clarify FT-XXX` before `/prd-to-tasks FT-XXX`;
- brainstorming is facilitated by AI, not generated by AI alone.

---

# Фаза 3 — новые command specs

Добавь command specs:

```text
skills/_shared/references/commands/analysis.md
skills/_shared/references/commands/brainstorm.md
skills/_shared/references/commands/brief.md
```

`init-mb.js` должен автоматически подхватить их через существующий command template mechanism.

Также обнови hard-coded command lists, если они есть:

- generated `AGENTS.md` внутри `skills/_shared/scripts/init-mb.js`;
- generated `.memory-bank/skills/index.md`;
- README command list;
- relevant skill docs.

Не добавляй aliases. Только `/analysis`, `/brainstorm`, `/brief`.

---

# Фаза 4 — Memory Bank artifacts

Analysis artifacts создаются только при первом запуске `/analysis`, `/brainstorm` или `/brief`.

Не создавай `.memory-bank/analysis/` в пустом skeleton по умолчанию, если текущий framework не требует этого для всех optional workflows.

Структура:

```text
.memory-bank/
  analysis/
    index.md
    product-brief.md
    brainstorming/
      BR-001.md
```

Не создавай отдельный `assumptions.md`.

Assumptions и open questions должны быть секциями внутри:

- `product-brief.md`;
- `BR-*.md`.

---

# Фаза 5 — `/analysis` router

`/analysis` — router, not generator.

Он должен:

1. Проверить текущее состояние.
2. Сказать следующий шаг.
3. При необходимости создать `.memory-bank/analysis/index.md`.
4. Не писать PRD.
5. Не генерировать product brief без команды `/brief`.
6. Не генерировать brainstorming report без команды `/brainstorm`.
7. Не рекомендовать `/prd-to-tasks` напрямую, если feature clarification ещё не complete.

Routing table:

| State | Next step |
|---|---|
| Есть PRD, но feature docs ещё не созданы | `/prd` or current PRD ingestion flow |
| Есть feature docs with `clarification_status: pending` | `/clarify FT-XXX` |
| Есть feature docs with `clarification_status: complete` | `/prd-to-tasks FT-XXX` |
| Есть approved product brief | `/prd`, then `/clarify FT-XXX` |
| Есть draft product brief | finish `/brief`, then `/prd`, then `/clarify FT-XXX` |
| Есть brainstorming report, но нет brief | `/brief` |
| Идея сырая / vague | `/brainstorm` |
| Концепт понятен, PRD нет | `/brief` |
| Brownfield без PRD | `/map-codebase`, затем `/brief --delta` or `/prd --delta`, then `/clarify FT-XXX` |
| Недостаточно данных | skeleton + explicit next step |

Brownfield rule:

```text
Brownfield as-is mapping comes first. Do not invent roadmap from analysis before map-codebase.
```

---

# Фаза 6 — `/brainstorm`

`/brainstorm` должен вести себя как facilitated ideation, not “AI invented features”.

Preserve BMAD meaning:

```text
AI acts as coach/facilitator.
Ideas come from user direction and guided exploration.
Raw ideas do not become requirements directly.
```

`/brainstorm` должен:

1. Создать `.memory-bank/analysis/brainstorming/`.
2. Создать или обновить `.memory-bank/analysis/index.md`.
3. Создать новый report:

```text
.memory-bank/analysis/brainstorming/BR-001.md
```

Если ID занят — следующий:

```text
BR-002.md
BR-003.md
```

4. Сохранить:
   - problem space;
   - goals;
   - constraints;
   - techniques used;
   - raw ideas;
   - clusters/themes;
   - selected directions;
   - rejected directions;
   - assumptions;
   - open questions;
   - recommended next step.

5. Завершить:

```text
Recommended next step: /brief
```

KISS rule:

- no mandatory 100 ideas;
- no complex depth profiles;
- default target: 20–40 useful ideas/directions if session needs expansion;
- if user already has clear direction, do not force long brainstorming;
- no research mode.

---

# Фаза 7 — `/brief`

`/brief` creates or updates:

```text
.memory-bank/analysis/product-brief.md
```

Product Brief = PRD input contract.

It is not a marketing doc and not a PRD.

Минимальные секции:

```text
1. One-liner
2. Target users
3. Problem
4. Current alternatives
5. Value proposition
6. Product concept
7. MVP scope
8. Non-goals
9. Success metrics
10. Constraints
11. Assumptions
12. Risks
13. Open questions
14. PRD input summary
15. Decision
```

Decision values:

```text
proceed | blocked
```

Do not add `no-go`; KISS: `blocked` is enough.

Rules:

- If brainstorming exists, `source_artifacts` must link to latest relevant `BR-*.md`.
- If brainstorming does not exist, brief can be created directly.
- If `Decision: blocked`, `/prd` must not continue without explicit user override.
- Explicit user override may allow `/prd`, but it must not bypass `/clarify FT-XXX` before `/prd-to-tasks FT-XXX`.
- If brief has blocking open questions, `/prd` must warn or stop depending on current PRD policy.
- Product brief should be concise: target 1–2 pages.

---

# Фаза 8 — templates

## `analysis-index-template.md`

```md
---
description: Analysis phase index: brainstorming and product brief artifacts.
status: active
---

# Analysis

## Purpose
Optional discovery before PRD.

## Artifacts
- [product-brief.md](product-brief.md): PRD input contract.
- [brainstorming/](brainstorming/): facilitated ideation reports.

## Next step
- If idea is vague: /brainstorm
- If concept is clear: /brief
- If brief is ready: /prd, then /clarify FT-XXX
```

## `brainstorming-template.md`

```md
---
type: brainstorming-report
id: BR-001
status: draft
created_at:
topic:
source: human-guided
feeds_into:
  - .memory-bank/analysis/product-brief.md
---

# Brainstorming Report: BR-001

## 1. Problem space

## 2. Goals

## 3. Constraints

## 4. Techniques used

## 5. Raw ideas

## 6. Clusters / themes

## 7. Selected directions

## 8. Rejected directions

## 9. Assumptions

## 10. Open questions

## 11. Recommended next step
- /brief
```

## `product-brief-template.md`

```md
---
type: product-brief
status: draft
version: 0.1
created_at:
updated_at:
source_artifacts: []
feeds_into:
  - .memory-bank/product.md
  - .memory-bank/requirements.md
  - prd.md
---

# Product Brief

## 1. One-liner

## 2. Target users

## 3. Problem

## 4. Current alternatives

## 5. Value proposition

## 6. Product concept

## 7. MVP scope

## 8. Non-goals

## 9. Success metrics

## 10. Constraints

## 11. Assumptions

## 12. Risks

## 13. Open questions

## 14. PRD input summary

## 15. Decision
Proceed to PRD: proceed | blocked
```

---

# Фаза 9 — update `/cold-start`

Update cold-start routing.

KISS logic:

```text
1. Existing PRD / requirements → current PRD route, then /clarify FT-XXX before /prd-to-tasks.
2. Clear concept, no PRD → recommend /brief → /prd → /clarify FT-XXX.
3. Vague idea → recommend /brainstorm → /brief → /prd → /clarify FT-XXX.
4. Brownfield without PRD → /map-codebase first, then /brief --delta or /prd --delta, then /clarify FT-XXX.
5. No meaningful input → skeleton + stop + recommend /analysis.
```

Do not make Analysis mandatory.

Do not create roadmap entities from idea-only state.

Do not route directly from PRD to `/prd-to-tasks`.

---

# Фаза 10 — update `/prd`

Update PRD flow so product brief is the primary upstream source if it exists.

KISS upstream order:

```text
1. .memory-bank/analysis/product-brief.md
2. .memory-bank/product.md
3. .memory-bank/requirements.md
```

Do not directly read all brainstorming reports in ordinary `/prd`.

Reason:

```text
brainstorming → product brief → PRD
```

If brainstorming reports exist but product brief does not:

```text
Stop or warn: create /brief first.
```

Rules:

- PRD does not require Analysis.
- If product brief exists, PRD must reference it in source_artifacts / upstream sources.
- If product brief status is draft, PRD runs in draft mode or warns.
- If product brief decision is blocked, stop unless explicit user override.
- If product brief is newer than PRD, warn: PRD may be stale.
- When `/prd` creates feature docs, each feature must include clarification metadata:
  - `clarification_status: pending`
  - `last_clarified: null`
  - `clarification_questions: 0`
- `/prd` should tell the user that next step after feature generation is `/clarify FT-XXX`, not `/prd-to-tasks FT-XXX`.

---

# Фаза 11 — review / garden / lint

## Review

Update `mb-review` docs/prompts minimally.

If `.memory-bank/analysis/product-brief.md` exists, reviewer should check Analysis Quality:

- product vision clear;
- target user explicit;
- assumptions separated from facts;
- non-goals stated;
- success metrics are testable;
- open questions marked clearly;
- PRD links to brief if PRD exists.

Do not add `/review --analysis`.

Review should not mark Analysis missing as an error. Analysis is optional.

## Lint / garden

Update `mb-lint` only with lightweight structural checks.

If `.memory-bank/analysis/` exists:

- `index.md` must exist;
- `product-brief.md`, if exists, must have frontmatter `type: product-brief`;
- `product-brief.md` must have `status`;
- `product-brief.md` must have Decision section;
- `brainstorming/*.md` must have frontmatter `type: brainstorming-report`;
- `brainstorming/*.md` must have `id`;
- `brainstorming/*.md` must have Recommended next step section;
- if PRD exists and product brief exists, PRD should mention product brief path — warning, not error.

Do not add:

- semantic checks;
- market checks;
- full RTM checks;
- assumptions table validation;
- stale-date logic unless already trivial in repo.

Update `mb-garden` docs:

- analysis artifacts are durable Memory Bank artifacts;
- keep product brief concise;
- archive old brainstorming reports if superseded.

---

# Фаза 12 — docs

Update briefly:

- `README.en.md`
- `README.ru.md`
- relevant `SKILL.md` docs.

Add minimal flows:

```text
Idea-only:
  /cold-start → /analysis → /brainstorm → /brief → /prd → /clarify FT-XXX → /prd-to-tasks FT-XXX

Clear concept:
  /cold-start → /brief → /prd → /clarify FT-XXX → /prd-to-tasks FT-XXX

Existing PRD:
  /cold-start → /prd → /clarify FT-XXX → /prd-to-tasks FT-XXX

Brownfield:
  /cold-start → /map-codebase → /brief --delta or /prd --delta → /clarify FT-XXX → /prd-to-tasks FT-XXX
```

Add one sentence:

```text
Analysis is optional. Use it before PRD when the idea is vague or product direction is not stable.
```

Add one more sentence:

```text
Analysis does not replace Clarification: after `/prd`, each feature must pass `/clarify FT-XXX` before `/prd-to-tasks FT-XXX`.
```

Do not turn README into BMAD tutorial.

---

# Фаза 13 — CI / smoke

Update `.github/workflows/release-check.yml`.

Minimum checks:

- new `skills/mb-analysis/SKILL.md` exists;
- templates exist;
- command specs exist:
  - `analysis.md`
  - `brainstorm.md`
  - `brief.md`
- install smoke includes `mb-analysis`;
- dry bootstrap/sync creates command proxies for:
  - `/analysis`
  - `/brainstorm`
  - `/brief`
- `mb-lint` passes on skeleton without `.memory-bank/analysis/`;
- create small valid `.memory-bank/analysis/` fixture in temp and verify `mb-lint` passes.
- if feature docs are generated by bootstrap/examples/templates, they include clarification metadata.

No new external dependencies.

Do not add heavy fixtures.

---

# Фаза 14 — validation commands

Run:

```bash
node --check scripts/vendor-shared.mjs
node --check scripts/install-framework.mjs
node --check skills/_shared/scripts/init-mb.js
node --check skills/mb-garden/assets/mb-lint.mjs
```

If `mb-doctor.mjs` exists:

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
node /path/to/repo/skills/_shared/scripts/init-mb.js --sync
mkdir -p scripts
cp /path/to/repo/skills/mb-garden/assets/mb-lint.mjs scripts/mb-lint.mjs
node scripts/mb-lint.mjs
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

Do not implement:

- market research;
- domain research;
- technical research;
- PRFAQ;
- advanced elicitation;
- assumptions.md;
- separate research skills;
- separate brainstorm/brief package skills;
- aliases;
- external dependencies;
- semantic lint;
- mandatory Analysis phase;
- full BMAD clone;
- `/clarify` command implementation;
- clarification protocol implementation.

---

# Definition of done

Done only if:

1. `skills/mb-analysis/SKILL.md` exists.
2. `skills/mb-analysis/assets/analysis-index-template.md` exists.
3. `skills/mb-analysis/assets/brainstorming-template.md` exists.
4. `skills/mb-analysis/assets/product-brief-template.md` exists.
5. Command specs exist:
   - `analysis.md`
   - `brainstorm.md`
   - `brief.md`
6. `/analysis` is router-only.
7. `/brainstorm` creates BR reports and recommends `/brief`.
8. `/brief` creates PRD input contract.
9. `/prd` uses product brief as primary upstream source when present.
10. `/prd` creates feature docs with clarification metadata if feature docs are generated.
11. `/cold-start` recommends analysis branch only when useful.
12. Docs/routes do not bypass `/clarify FT-XXX` before `/prd-to-tasks FT-XXX`.
13. `mb-review` includes lightweight Analysis Quality checks if brief exists.
14. `mb-lint` includes lightweight structural analysis checks.
15. README.en / README.ru mention minimal Analysis flow with Clarification gate.
16. CI smoke updated.
17. Source-only hygiene preserved.
18. No research/PRFAQ/aliases/assumptions.md implemented.
19. No `/clarify` implementation is added by this task.

---

# Final report

At the end, return:

```text
Summary
- ...

BMAD context preserved
- ...

KISS reductions
- ...

Clarification alignment
- ...

Files changed
- ...

Commands added
- ...

Validation
- ...

Out of scope
- ...

Known risks / follow-ups
- ...
```
