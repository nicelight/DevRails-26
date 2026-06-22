# Prompt: анализ scope of work для вынесения `mb-doctor` в отдельный skill

Роль: Оркестратор

Проведи read-only анализ scope of work для возможного вынесения `mb-doctor` в отдельный skill.

Важно: пока ничего не правь.  
Цель — понять, будет ли выделение `mb-doctor` отдельным skill реальным KISS-улучшением или принесёт лишнюю packaging/command/CI сложность.

---

# Контекст

Сейчас `mb-doctor` физически лежит внутри:

```text
skills/mb-garden/assets/mb-doctor.mjs
```

Но по смыслу роли уже разделены:

```text
mb-lint   = structural validity
mb-doctor = autonomous readiness / workflow gate
mb-garden = Memory Bank maintenance / hygiene / cleanup
```

Проблема: `mb-garden` начал разрастаться и смешивать maintenance, lint, doctor, readiness, tier/protocol/evidence checks.

Нужно оценить, стоит ли вынести:

```text
skills/mb-doctor/
  SKILL.md
  assets/mb-doctor.mjs
```

или лучше оставить физически внутри `mb-garden/assets`, но сильнее разделить документацию и роли.

---

# Главный принцип

KISS.

Не предлагай вынос, если он требует большой перестройки install/CI/vendor/proxy/generation.

Вынос имеет смысл только если он:

- уменьшает role confusion;
- упрощает mental model;
- не ломает generated target behavior;
- не создаёт новый source-of-truth конфликт;
- не раздувает command surface;
- не требует поддержки legacy paths.

---

# Что нужно проверить

## 1. Текущие зависимости `mb-doctor`

Найди все места, где упоминается или используется:

```text
mb-doctor
mb-doctor.mjs
skills/mb-garden/assets/mb-doctor.mjs
scripts/mb-doctor.mjs
/mb-doctor
node scripts/mb-doctor.mjs
```

Проверь:

- command specs;
- README;
- SKILL.md;
- init-mb.js;
- release-check.yml;
- install-framework/vendor-shared;
- generated target logic;
- mb-lint/doctor cross-dependencies;
- docs around mb-garden/mb-harness/autopilot/autonomous.

Выведи dependency map:

```text
source file → reference type → would need change if moved
```

---

## 2. Packaging impact

Проверь, как package skills устроены сейчас:

- `skills/mb-garden/`
- assets copying;
- `scripts/vendor-shared.mjs`;
- `scripts/install-framework.mjs`;
- generated `.agents/skills/*`;
- generated `.claude/skills/*`;
- installed target layout.

Ответь:

- будет ли `skills/mb-doctor/` автоматически устанавливаться через `--skill '*'`;
- что надо добавить для package skill;
- как target repo получит `scripts/mb-doctor.mjs`;
- не появятся ли два источника doctor script.

---

## 3. Command model impact

Сейчас есть command spec:

```text
skills/_shared/references/commands/mb-doctor.md
```

Проверь:

- должен ли `/mb-doctor` оставаться generated command spec;
- нужен ли package skill `mb-doctor` с тем же именем;
- будет ли конфликт между package skill `mb-doctor` и generated project command `/mb-doctor`;
- как избежать путаницы “skill vs command”.

Предпочтительная модель, если выносить:

```text
skills/mb-doctor/                         package skill
.memory-bank/commands/mb-doctor.md        generated project command
scripts/mb-doctor.mjs                     generated target script
```

Но проверь, не создаёт ли это конфликт.

---

## 4. Source-of-truth impact

Сейчас source script:

```text
skills/mb-garden/assets/mb-doctor.mjs
```

Если выносить, preferred source:

```text
skills/mb-doctor/assets/mb-doctor.mjs
```

Нужно определить:

- удалить старый файл или оставить копию?
- если оставить копию — это нарушение SSOT;
- если удалить — что сломается?
- как `init-mb.js` должен находить doctor asset;
- как CI проверит отсутствие старого duplicate.

KISS preference:

```text
one source file only
```

---

## 5. `mb-garden` cleanup impact

Если doctor вынести, что должно остаться в `mb-garden`?

Ожидаемо:

```text
mb-garden:
- Memory Bank maintenance
- mb-lint asset
- docs cleanup/hygiene
- archive/stale docs guidance
```

Проверить, какие тексты в `mb-garden/SKILL.md` нужно упростить.

Не превращать `mb-garden` в wrapper над `mb-doctor`.

---

## 6. CI / smoke impact

Определи минимальные проверки, которые понадобятся после выноса:

- `node --check skills/mb-doctor/assets/mb-doctor.mjs`;
- install smoke includes `mb-doctor` skill;
- generated target still has `scripts/mb-doctor.mjs`;
- `/mb-doctor` proxy still works;
- source-only hygiene still passes;
- old `skills/mb-garden/assets/mb-doctor.mjs` absent, если вынос принят.

Не добавляй тяжёлые fixtures в scope анализа, только перечисли, что надо проверить.

---

## 7. Migration / compatibility

Так как no backward compatibility:

- не нужно поддерживать старый path `skills/mb-garden/assets/mb-doctor.mjs`, если вынос принят;
- не нужно compatibility shim;
- не нужно duplicated copy.

Но оцени риск:

- какие существующие docs/tests/scripts сломаются;
- насколько просто заменить path.

---

# Варианты решения

Сравни три варианта.

## Option A — оставить как есть

```text
skills/mb-garden/assets/mb-doctor.mjs
```

Только улучшить docs, чтобы doctor conceptual role был отдельным.

Оцени:

- плюсы;
- минусы;
- KISS score;
- risk.

---

## Option B — вынести в отдельный package skill

```text
skills/mb-doctor/
  SKILL.md
  assets/mb-doctor.mjs
```

Удалить old doctor asset из `mb-garden`.

Оцени:

- файлы для изменения;
- install/package impact;
- CI impact;
- risk;
- KISS score.

---

## Option C — оставить script в `_shared` / common assets

Например:

```text
skills/_shared/scripts/mb-doctor.mjs
```

а package skills только ссылаются/копируют.

Оцени, не создаст ли это лишний shared complexity.

---

# Output format

Верни отчёт:

```text
Роль: Оркестратор

# mb-doctor extraction scope analysis

## Overall recommendation
Option A / Option B / Option C

## Short verdict
...

## Current dependency map
| File | Reference | Change needed if extracted |
|---|---|---|

## Option A — keep in mb-garden
Pros:
Cons:
Risk:
KISS score:

## Option B — separate skill
Pros:
Cons:
Files likely changed:
CI/smoke impact:
Risk:
KISS score:

## Option C — shared script source
Pros:
Cons:
Risk:
KISS score:

## Recommended scope if Option B
Minimal file changes:
- ...

Validation:
- ...

Do not touch:
- ...

## Stop conditions
- ...

## Final answer
Implement extraction now / Defer / Keep as is
```

---

# Hard constraints

- Read-only analysis only.
- Do not modify files.
- Do not create `skills/mb-doctor` yet.
- Do not move files.
- Do not run destructive commands.
- Do not run generators in real repo.
- If unsure, recommend defer over risky refactor.
