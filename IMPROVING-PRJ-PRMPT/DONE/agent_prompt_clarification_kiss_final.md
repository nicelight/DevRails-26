# Промпт для отдельного AI-агента

Ты — независимый implementation agent в репозитории:

https://github.com/nicelight/memobank_BMAD_SDD

Твоя задача: внедрить **feature-level Clarification phase** — минимальный gate между `/prd` и `/prd-to-tasks`.

Адаптируй полезную идею из Spec Kit, но **не превращай проект в Spec Kit**.

---

# KISS principle

Clarification phase должна решать только одну задачу:

```text
закрыть критичные неоднозначности конкретной feature до decomposition into JSON task records
```

Не расширяй scope.

---

# Текущий контекст framework

В проекте уже есть или внедряется:

- `/prd`;
- `/prd-to-tasks`;
- JSON task records;
- `.memory-bank/tasks/index.json`;
- `.memory-bank/tasks/TASK-XXX.task.json`;
- `.memory-bank/tasks/backlog.md` как summary/router;
- `.memory-bank/features/FT-XXX-*.md`;
- `.protocols/`;
- `mb-lint`;
- возможно `mb-doctor`;
- возможно tier model `T0-T3`.

Clarification работает **после создания feature doc и до создания task records**.

Canonical flow:

```text
/prd → /clarify FT-XXX → /prd-to-tasks FT-XXX → /execute TASK-XXX
```

Если tier model уже внедрена: `/clarify` не назначает `tier`. Она уточняет feature так, чтобы `/prd-to-tasks` мог корректно назначить `tier` позже.

---

# No legacy support

Backward compatibility не нужна.

Не добавляй:

- поддержку старых feature docs без clarification metadata;
- fallback mode;
- `/mb-clarify` alias;
- `skills/mb-clarify/SKILL.md`;
- migration tool;
- `.specify/`;
- skip/bypass flag;
- `clarification_status: skipped`;
- сложную session database;
- два protocol-файла вместо одного;
- semantic ambiguity detection в `mb-lint`;
- task generation внутри `/clarify`.

Если feature doc не содержит clarification metadata — это ошибка.

---

# Required artifacts

Используй только:

```text
.memory-bank/features/FT-XXX-*.md
.protocols/FT-XXX/clarification.md
```

Не создавай:

```text
.protocols/FT-XXX/decision-log.md
.protocols/FT-XXX/clarification-report.md
```

Один `clarification.md` должен содержать Q/A, status, context, passes и remaining blockers.

---

# Feature metadata

Feature frontmatter должна содержать:

```yaml
clarification_status: pending
last_clarified: null
clarification_questions: 0
```

Allowed values:

```text
clarification_status: pending | complete
```

Rules:

- New feature docs default to `pending`.
- `/clarify` sets `complete` only when critical ambiguity is resolved.
- If blockers remain, status stays `pending`.
- `/prd-to-tasks` can run only when `clarification_status: complete`.
- Missing metadata blocks `/prd-to-tasks`.
- `clarification_questions` is cumulative across all clarification passes for this feature.

---

# `/clarify` command behavior

Add command spec:

```text
skills/_shared/references/commands/clarify.md
```

Input is required:

```text
/clarify FT-XXX
```

If no feature ID is provided:

- interactive mode: ask user to provide `FT-XXX`;
- autonomous mode: halt with `HALT_CLARIFICATION_TARGET_REQUIRED`.

Do not auto-select a feature. Keep routing explicit.

Command must:

1. Locate target feature:

```text
.memory-bank/features/FT-XXX-*.md
```

2. Read minimal context:

```text
.memory-bank/product.md
.memory-bank/requirements.md
.memory-bank/features/FT-XXX-*.md
```

Read epics, glossary, invariants, contracts, states, testing docs only if the feature links to them or they are clearly relevant.

3. Create/update:

```text
.protocols/FT-XXX/clarification.md
```

4. Run clarification as a **pass-based interview**.

---

# Clarification passes

Each `/clarify FT-XXX` run is one clarification pass.

Per pass:

- ask at most 5 accepted questions;
- ask exactly one question at a time;
- after each accepted answer, update the feature doc;
- after each accepted answer, update `.protocols/FT-XXX/clarification.md`;
- after each accepted answer, recalculate remaining ambiguity;
- do not reveal future queued questions.

There is **no hard maximum number of questions per feature**.

A feature becomes:

```yaml
clarification_status: complete
```

only when no critical ambiguity remains.

If 5 questions were accepted in the current pass and blockers remain:

- keep `clarification_status: pending`;
- write remaining blockers to `.protocols/FT-XXX/clarification.md`;
- tell the user to continue with:

```text
/clarify FT-XXX
```

Do not mark a feature complete just because the pass question limit was reached.

---

# Completion criteria

`clarification_status: complete` is allowed only when `/prd-to-tasks FT-XXX` can safely produce JSON task records with:

- clear acceptance criteria;
- clear verification targets;
- known constraints;
- known actors / behavior;
- no unresolved product decision that affects task decomposition;
- no unresolved data / API / security / UX ambiguity;
- enough context to assign future task tier if tier model exists.

If any of these are not true, status stays:

```yaml
clarification_status: pending
```

---

# Question prioritization

Prioritize questions in this order:

1. Blocking product decisions  
   Without the answer, task decomposition would require invention.

2. Verification-shaping decisions  
   The answer affects acceptance criteria, tests, or evidence.

3. Scope-boundary decisions  
   The answer affects what is included or excluded.

4. Risk-shaping decisions  
   The answer affects future task tier, red-verify need, or protocol depth.

5. Nice-to-have clarity  
   Do not ask. Record as assumption/follow-up only if useful.

Do not ask a question if the answer would not change:

- acceptance criteria;
- task decomposition;
- verification;
- UX behavior;
- data/domain behavior;
- API/contracts;
- security/compliance;
- future task tier.

---

# Ambiguity scan

Use this internal scan. Do not persist a large matrix unless useful.

1. Scope / behavior
2. Actors / UX flow
3. Data / domain rules
4. Integrations / constraints
5. Edge cases / failure modes
6. Verification / completion signals

Ask only questions that affect correctness, decomposition, verification, UX, data/domain behavior, contracts, security/compliance, or future tier.

Do not ask style, naming, or implementation-detail questions unless they affect correctness.

---

# Question format

Always ask one question at a time.

Do not reveal future queued questions.

## Multiple-choice

Use 2–5 options.

```markdown
**Recommended:** Option B — <brief rationale>

| Option | Description |
|---|---|
| A | ... |
| B | ... |
| C | ... |
| Short | Custom short answer, max 5 words |

Reply with A/B/C, "recommended", or a short answer.
```

## Short-answer

Use only when options are a bad fit.

```markdown
**Suggested:** <answer> — <brief rationale>

Format: short answer, max 5 words.
Reply "suggested" to accept.
```

Accepted user replies:

```text
A
B
C
recommended
suggested
done
stop
proceed
```

Rules:

- `recommended` accepts recommended option.
- `suggested` accepts suggested answer.
- `done/stop/proceed` ends the current pass.
- Ending a pass does not imply `complete` if blockers remain.

---

# Updating feature doc

Ensure the target feature has:

```markdown
## Clarifications

### Session YYYY-MM-DD
- Q: ... → A: ...
```

Also apply each accepted answer into the relevant feature section:

- behavior → acceptance criteria / requirements;
- actors → user stories / use cases;
- data → entities / fields / lifecycle;
- NFR → measurable verification target;
- edge case → failure modes;
- terminology → glossary / normalized wording;
- dependency → constraints / integration notes;
- completion → verification targets.

Remove contradictory old wording.

Keep edits short, testable, and actionable.

---

# Updating protocol artifact

Create/update:

```text
.protocols/FT-XXX/clarification.md
```

Minimal structure:

```md
# Clarification — FT-XXX

## Status
pending|complete

## Summary
- Current outcome: ...
- Questions accepted total: N
- Last clarified: YYYY-MM-DD

## Passes

### Pass 1 — YYYY-MM-DD
Questions accepted: N / 5

#### Context used
- .memory-bank/product.md
- .memory-bank/requirements.md
- .memory-bank/features/FT-XXX-*.md

#### Questions
1. Q: ...
   A: ...
   Applied to: <feature section>

#### Remaining blockers
- <short blocker>
```

If no blockers remain:

```md
#### Remaining blockers
- None
```

Keep the protocol compact. Do not create extra protocol files.

---

# Files to inspect first

Study only what is needed.

Minimum:

```text
README.md
README.en.md
README.ru.md
AGENTS-myTemplate.md
skills/_shared/scripts/init-mb.js
skills/_shared/references/structure-template.md
skills/_shared/references/deep-questioning.md
skills/_shared/references/commands/prd.md
skills/_shared/references/commands/prd-to-tasks.md
skills/_shared/references/commands/autonomous.md
skills/_shared/references/commands/autopilot.md
skills/_shared/references/commands/mb-sync.md
skills/_shared/references/workflows/execute-loop.md
skills/mb-from-prd/SKILL.md
skills/cold-start/SKILL.md
skills/mb-init/SKILL.md
skills/mb-garden/assets/mb-lint.mjs
```

If `skills/mb-garden/assets/mb-doctor.mjs` exists, inspect it too.

If paths differ, search the repo and adapt.

---

# Phase 1 — plan

Create:

```text
.protocols/TASK-CLARIFY/plan.md
```

Plan must state:

1. Files to change.
2. How `/clarify` works.
3. How pass-based clarification works.
4. How feature metadata is generated.
5. How `/prd-to-tasks` blocks unresolved features.
6. What `mb-lint` validates.
7. Whether `mb-doctor` exists and needs update.
8. What is out of scope.

Do not do broad implementation before this plan.

---

# Phase 2 — update `/prd`

Update:

```text
skills/_shared/references/commands/prd.md
```

Generated feature docs must include:

```yaml
clarification_status: pending
last_clarified: null
clarification_questions: 0
```

Add a short note:

```text
Run /clarify FT-XXX before /prd-to-tasks FT-XXX.
```

Keep existing Deep Questioning unchanged.

Clarification is not PRD discovery. It is feature-level ambiguity closure.

---

# Phase 3 — add `/clarify`

Create:

```text
skills/_shared/references/commands/clarify.md
```

Use existing memobank command style.

Do not create `/mb-clarify`.

Do not create package skill unless the current repo absolutely requires it for command exposure. If command proxies are generated from `_shared/references/commands`, rely on that.

---

# Phase 4 — update `/prd-to-tasks`

Update:

```text
skills/_shared/references/commands/prd-to-tasks.md
```

Before creating implementation plan or JSON task records:

1. Locate target feature.
2. Read frontmatter.
3. Require:

```yaml
clarification_status: complete
```

4. Block if feature contains explicit unresolved markers:

```text
NEEDS CLARIFICATION
TBD
TODO
???
```

Only block on these markers when they appear in feature sections relevant to behavior, acceptance, data, contracts, security, UX, operations, or verification.

If blocked:

- interactive mode: tell user to run `/clarify FT-XXX`;
- autonomous mode: set terminal state:

```text
HALT_CLARIFICATION_REQUIRED
```

Do not create task records.

No skip flag.

No bypass flag.

---

# Phase 5 — update autonomous/autopilot

Update:

```text
skills/_shared/references/commands/autonomous.md
skills/_shared/references/commands/autopilot.md
```

Rules:

- autonomous PRD → done flow must require clarified features before task decomposition;
- if clarification requires user input, halt with `HALT_CLARIFICATION_REQUIRED`;
- do not invent product decisions;
- do not create tasks for pending features;
- after clarification completes, continue to `/prd-to-tasks`.

If `mb-doctor` exists, pending clarification is a readiness blocker.

Do not create `mb-doctor` in this task.

---

# Phase 6 — update bootstrap routing

Update:

```text
skills/_shared/scripts/init-mb.js
skills/_shared/references/structure-template.md
```

Required:

- generated `AGENTS.md` mentions `/clarify`;
- generated command proxies include `/clarify`;
- generated feature template includes clarification frontmatter;
- generated workflow docs mention:

```text
/prd → /clarify → /prd-to-tasks
```

Do not add `/mb-clarify`.

Do not add new directories beyond canonical artifacts.

---

# Phase 7 — update mb-lint

Update:

```text
skills/mb-garden/assets/mb-lint.mjs
```

Minimal checks:

1. Feature files in `.memory-bank/features/FT-*.md` must include `clarification_status`.
2. `clarification_status` must be `pending` or `complete`.
3. If `clarification_status: complete`, feature doc must include either:
   - `## Clarifications`, or
   - `Clarification: no critical ambiguity found`.
4. Task records must not exist for a feature with `clarification_status: pending`.

Keep checks structural.

Do not implement semantic ambiguity detection.

---

# Phase 8 — update mb-doctor only if it exists

If this file exists:

```text
skills/mb-garden/assets/mb-doctor.mjs
```

Update strict mode:

- pending clarification is a readiness blocker;
- feature with missing clarification metadata is a blocker;
- tasks generated from pending feature are blockers.

Suggested codes:

```text
FEATURE_CLARIFICATION_PENDING
FEATURE_CLARIFICATION_METADATA_MISSING
TASKS_FROM_UNCLARIFIED_FEATURE
```

If `mb-doctor.mjs` does not exist, do not create it.

---

# Phase 9 — docs

Update briefly:

```text
README.md
README.en.md
README.ru.md
AGENTS-myTemplate.md
skills/mb-from-prd/SKILL.md
skills/cold-start/SKILL.md
skills/mb-init/SKILL.md
skills/_shared/references/workflows/execute-loop.md
```

Only add concise routing:

```text
/prd → /clarify FT-XXX → /prd-to-tasks FT-XXX
```

And concise difference:

```text
Deep Questioning = PRD-level discovery.
Clarification = feature-level ambiguity gate.
```

Do not rewrite docs broadly.

---

# Phase 10 — CI / smoke validation

Update:

```text
.github/workflows/release-check.yml
```

Minimal smoke expectations:

- `node --check skills/_shared/scripts/init-mb.js`;
- bootstrap creates `.memory-bank/commands/clarify.md`;
- generated `AGENTS.md` mentions `/clarify`;
- generated feature template or example feature includes `clarification_status`;
- no `.specify/` is created;
- `mb-lint` syntax passes.

Do not add heavy fixtures.

---

# Validation commands

Run what is relevant and safe:

```bash
node --check skills/_shared/scripts/init-mb.js
node --check skills/mb-garden/assets/mb-lint.mjs
```

If `mb-doctor.mjs` exists:

```bash
node --check skills/mb-garden/assets/mb-doctor.mjs
```

Dry bootstrap:

```bash
TMP_DIR="$(mktemp -d)"
cd "$TMP_DIR"
node /path/to/repo/skills/_shared/scripts/init-mb.js

test -f .memory-bank/commands/clarify.md
grep -q "/clarify" AGENTS.md
find . -path "*/.specify/*" -print | grep -q . && exit 1 || true
```

If generated feature template/example exists:

```bash
grep -R "clarification_status" .memory-bank/features .memory-bank 2>/dev/null || true
```

Source-only hygiene:

```bash
if find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | grep -q .; then
  echo 'Found vendored shared-* files in source-only repository'
  exit 1
fi
```

---

# Out of scope

Do not implement:

- backward compatibility;
- `/mb-clarify` alias;
- old feature docs support;
- migration tool;
- `.specify/`;
- task generation inside `/clarify`;
- AI semantic reviewer inside `mb-lint`;
- new package skill unless current repo absolutely requires it;
- new directories beyond `.protocols/FT-XXX/`;
- two separate clarification protocol files;
- skip/bypass flag;
- broad README rewrite;
- external dependencies;
- deploy/publish;
- license changes.

---

# Definition of done

Done only if:

1. `/clarify` command spec exists.
2. Generated command proxy for `/clarify` works.
3. Generated feature docs include clarification metadata.
4. `/prd` instructs `/clarify` before `/prd-to-tasks`.
5. `/prd-to-tasks` blocks unless `clarification_status: complete`.
6. `/autonomous` and `/autopilot` halt on pending clarification.
7. `/clarify` uses pass-based interview:
   - max 5 accepted questions per pass;
   - no hard total max per feature;
   - feature becomes complete only when critical blockers are resolved.
8. `/clarify` asks one question at a time.
9. `/clarify` updates feature doc and `.protocols/FT-XXX/clarification.md`.
10. `mb-lint` validates clarification metadata.
11. `mb-doctor` is updated if it exists.
12. Docs show `/prd → /clarify → /prd-to-tasks`.
13. No `.specify/`.
14. No `/mb-clarify` alias.
15. No backward compatibility path.
16. No heavy fixtures or unnecessary workflow surface.

---

# Final report format

Return:

```md
## Summary
- ...

## Files changed
- path: purpose

## Behavior added
- ...

## Validation
- command/result

## Out of scope
- ...

## Follow-ups
- ...
```
