# changes.md

## Этот документ фиксирует:

- как работал исходный `memobank` до текущей волны изменений
- как он работает теперь
- какие именно изменения были внесены
- что осталось инвариантом и не должно ломаться

Документ нужен как человеческий changelog высокого уровня по смыслу, а не только как `git diff`.

---

## 1. Что представлял собой исходный проект

Исходный `memobank` был не приложением, а набором skills, шаблонов и scaffold-логики для агентных рантаймов.

Его базовая идея:

- превратить репозиторий в рабочее пространство для AI-first разработки
- хранить долговременное знание в `.memory-bank/`
- хранить рабочие артефакты исполнения в `.tasks/`
- хранить возобновляемое состояние long-running работы в `.protocols/`
- управлять агентом через repo-local command specs в `.memory-bank/commands/*.md`

Исходная архитектурная модель документации была в первую очередь duo-doc:

- `architecture/*` = WHAT / WHY
- `guides/*` = HOW

Это duo-представление было встроено сразу в несколько слоёв:

- bootstrap generator
- structure templates
- MBB rules
- `mb-sync`
- review prompts
- `mb-garden`
- package skill docs

То есть duo docs были не просто рекомендацией, а фактически опорной моделью всего проекта.

---

## 2. Как работал исходный проект по сценариям

### 2.1 Greenfield

Исходный greenfield flow:

1. `cold-start` или `mb-init`
2. `/prd`
3. `/prd-to-tasks FT-XXX`
4. `/execute TASK-XXX`
5. `/verify TASK-XXX`
6. `/mb-sync`
7. `/review`

Важная особенность:

- `/prd` не должен был порождать весь backlog сразу
- декомпозиция в `TASK-*` происходила по одной фиче через `/prd-to-tasks`

### 2.2 Brownfield

Исходный brownfield flow:

1. `cold-start` или `mb-init`
2. `/map-codebase`
3. `/review`
4. ожидание PRD delta
5. `/prd`
6. `/prd-to-tasks`
7. `/execute -> /verify -> /mb-sync`

Важный инвариант:

- без `prd.md` запрещено invent roadmap entities
- brownfield mapping должен был оставаться as-is documentation only

### 2.3 Execution / Verify / Review

Исходный execution model был resumable и protocol-driven:

- `/execute` создавал `.protocols/TASK-XXX/{context,plan,progress,verification,handoff}.md`
- `/verify` проверял задачу по acceptance criteria и evidence
- `/review` запускал fresh-context multi-expert review

### 2.4 Autonomous

Были два режима:

- `/autopilot` = исполнение уже готового backlog
- `/autonomous` = полный цикл `PRD -> review -> tasks -> execute -> verify -> mb-sync -> review`

---

## 3. В чём была проблема исходной модели

Главная проблема была не в том, что duo docs плохи.

Проблема была в том, что проекту не хватало явного spec-driven normative layer, который можно было бы использовать как более детерминированный источник:

- контрактов
- инвариантов
- состояний
- runbooks
- verification basis
- source-of-truth routing

Из-за этого:

- многие вещи были implicit
- `guides/*` и `architecture/*` брали на себя слишком много ролей
- deterministic execution/review/verifier не имели более строгой опоры, кроме feature doc + RTM + duo docs

При этом нельзя было просто “заменить duo docs”.

Нужно было сохранить совместимость:

- старые репозитории с классической моделью должны продолжать работать
- `guides/*` не должны стать legacy junk
- richer layer должен быть additive, а не destructive

---

## 4. Что стало новой целевой моделью

Теперь `memobank` движется к многоуровневой модели.

### Layer A: backward-compatible duo docs

- `architecture/*`
- `guides/*`

Это остаётся валидным и поддерживаемым слоем.

### Layer B: explicit normative layer

- `spec-index.md`
- `glossary.md`
- `invariants.md`
- `contracts/*`
- `states/*`
- `runbooks/*`
- `testing/*`

Этот слой:

- не отменяет duo docs
- не делает старые репозитории невалидными
- добавляет более явную маршрутизацию и более строгий source-of-truth

### Layer C: operational planning and execution

- `epics/*`
- `features/*`
- `tasks/backlog.md`
- `tasks/plans/*`
- `.protocols/*`
- `.tasks/*`

---

## 5. Как проект работает теперь

### 5.1 Bootstrap / init

Теперь bootstrap не только создаёт классический skeleton, но и может сразу развернуть additive normative layer:

- `.memory-bank/spec-index.md`
- `.memory-bank/glossary.md`
- `.memory-bank/invariants.md`
- `.memory-bank/states/`

При этом:

- `architecture/` и `guides/` сохраняются
- duo docs остаются valid
- новая нормативная структура вводится как prefer/if present layer

### 5.2 Templates

Теперь шаблоны поддерживают richer metadata:

- `Source Artifacts`
- `Normative Inputs`
- `Constraints`
- `Invariants`
- `Verification Targets`

Но это пока optional sections.

То есть:

- старые минимальные feature/task документы остаются допустимыми
- richer шаблоны доступны для более структурированных проектов

### 5.3 Planning (`/prd`, `/prd-to-tasks`)

Теперь planning-слой умеет выпускать richer task cards и richer implementation plan, но не требует их.

Правило стало таким:

- если richer structured inputs есть, их можно использовать
- если их нет, минимальный старый task-card формат по-прежнему валиден

### 5.4 Execute / Verify

Теперь `execute` и `verify` используют явный priority order:

1. richer structured inputs
2. classic feature / requirements / RTM basis
3. duo docs
4. related normative docs when needed

Главное изменение:

- richer fields больше не являются скрытой обязательностью
- старые task cards не ломаются
- fallback now documented explicitly

### 5.5 Review / Garden

Теперь review и maintenance policy смотрят не только на наличие duo-pair, а на concept coverage.

Новая логика:

- либо есть классическая пара `architecture + guides`
- либо есть эквивалентный spec-driven support coverage
- либо оба слоя одновременно

Это значит:

- old duo-doc repos остаются валидными
- richer repos теперь тоже легитимны
- review/garden больше не должны автоматически штрафовать репозиторий только за отсутствие `guides/*`, если концепт покрыт другим support layer

---

## 6. Какие изменения были внесены

### 6.1 Созданы рабочие документы рефактора

Созданы:

- `Chuck ImplementationPlan.md`
- `Chuck Compatibility Matrix.md`

Они использовались как рабочая опора для выполнения больших изменений по фазам.

### 6.2 Изменён bootstrap / structure surface

Были изменены:

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`

Что изменилось:

- добавлен `states/`
- добавлены `spec-index.md`, `glossary.md`, `invariants.md`
- обновлён wording в generated `AGENTS.md`
- обновлён wording в generated `.memory-bank/index.md`
- обновлён wording в generated `.memory-bank/mbb/index.md`
- обновлён wording в generated `mb-sync.md`

### 6.3 Изменены concept / feature / epic templates

Были изменены:

- `skills/_shared/references/concept-architecture-template.md`
- `skills/_shared/references/concept-guide-template.md`
- `skills/mb-from-prd/references/feature-template.md`
- `skills/mb-from-prd/references/epic-template.md`

Что добавлено:

- richer optional sections
- support docs links
- richer verification placeholders

### 6.4 Изменён planning command layer

Были изменены:

- `skills/_shared/references/commands/prd.md`
- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/mb-from-prd/SKILL.md`

Что изменилось:

- richer fields разрешены и описаны
- старые minimal task cards явно сохраняются как valid
- richer emission теперь documented, but not mandatory

### 6.5 Изменён execute / verify layer

Были изменены:

- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`
- `skills/mb-execute/SKILL.md`
- `skills/mb-verify/SKILL.md`
- protocol templates в `skills/_shared/references/protocols/*`

Что изменилось:

- задокументирован fallback model
- richer execution inputs стали first-priority only if present
- classic AC/REQ basis сохранён

### 6.6 Изменён review / garden / lint surface

Были изменены:

- `skills/_shared/references/commands/review.md`
- `skills/_shared/agents/review-architect.md`
- `skills/_shared/agents/mb-reviewer.md`
- `skills/mb-garden/SKILL.md`
- `skills/mb-garden/assets/mb-lint.mjs`

Что изменилось:

- review теперь ориентируется на support coverage, а не только на duo pair
- `mb-garden` теперь говорит про concept coverage
- `mb-lint` теперь понимает новые metadata-scoped docs (`spec-index`, `glossary`, `invariants`, `states`)

### 6.7 Исправлен vendoring

Был исправлен:

- `scripts/vendor-shared.mjs`

Проблема:

- на Windows path flattening ломался из-за `\`
- из-за этого vendoring мог падать на nested references вроде `references/workflows/mb-sync.md`

Теперь:

- flattening работает и для `/`, и для `\`
- `node scripts/vendor-shared.mjs` снова проходит

### 6.8 Обновлены vendored package copies

После изменений в `_shared` были обновлены vendored mirrors по всем package skills:

- `cold-start`
- `mb-init`
- `mb-from-prd`
- `mb-map-codebase`
- `mb-execute`
- `mb-verify`
- `mb-review`
- `mb-garden`
- `mb-harness`

То есть пакетное состояние и shared source-of-truth снова выровнены.

### 6.9 Проведён финальный cleanup user-facing docs

Были дополнительно выровнены:

- `skills/cold-start/SKILL.md`
- `skills/mb-init/SKILL.md`
- `skills/mb-from-prd/SKILL.md`
- `skills/mb-map-codebase/SKILL.md`

Это было нужно, чтобы package-level docs не рассказывали старую модель после изменения `_shared`.

---

## 7. Что принципиально НЕ было сломано

Сохранились ключевые инварианты:

- `.memory-bank/commands/*.md` остаётся command SSOT
- `_shared` остаётся главным editable source
- proxy skills в `.claude/skills/*` и `.agents/skills/*` остаются текущей моделью интеграции
- `guides/*` остаются разрешёнными и полезными
- brownfield без PRD по-прежнему не должен invent roadmap
- execution по-прежнему resumable через `.protocols/` и `.tasks/`
- classic duo-doc repos по-прежнему должны проходить

---

## 8. Что это даёт practically

После текущей волны проект стал:

- более последовательным
- более детерминированным
- менее завязанным на один-единственный doc style
- более безопасным для старых репозиториев
- лучше подготовленным к long-running AI execution

Главное практическое изменение:

раньше richer spec-driven structure была скорее идеей направления, а теперь она реально встроена в bootstrap, templates, planning, execution, verification, review и maintenance layer.

Но при этом:

- она не стала обязательной everywhere
- старая модель не была удалена
- переход остаётся постепенным

---

## 9. Текущее состояние после изменений

На текущий момент:

- изменён `_shared`
- обновлены vendored copies
- выровнен user-facing package layer
- исправлен Windows vendoring issue
- richer layer добавлен как additive model

То есть репозиторий приведён к более консистентному состоянию по основной refactor-идее:

> сохранить duo docs, но добавить поверх них более явный spec-driven normative layer.

---

## 10. Короткая формула изменений

Было:

- duo docs как фактическая единственная опорная документационная модель

Стало:

- duo docs как backward-compatible support layer
- spec-driven docs как explicit normative layer
- execution/review/garden/lint как consumers обеих моделей

Именно это и есть смысл текущей волны изменений.
