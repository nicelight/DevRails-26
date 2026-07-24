# IDEA: Устойчивая смысловая плотность полного пути

Обновлено: 2026-07-24

## 1. Задача

DevRails должен помогать runtime-агентам создавать исходные файлы так, чтобы
полный путь передавал достаточно устойчивого контекста для предварительного
понимания назначения файла без его открытия.

```text
maximum durable meaning
-----------------------
minimum necessary path structure
```

Оценивается вся конструкция:

```text
package/workspace/code root + directories + complete filename
```

`Complete filename` включает зарезервированные framework/tooling prefixes,
suffixes и compound extensions.

Она должна по возможности сообщать:

- ближайшего владельца, authority либо reuse boundary;
- business subject либо capability;
- устойчивую техническую роль файла;
- применимую ecosystem/framework semantics.

Минимальная вложенность не является самостоятельной целью. Дополнительный
сегмент оправдан, если он добавляет устойчивый смысл или требуется
архитектурой, framework либо tooling.

Это runtime policy DevRails, а не требование к структуре самого source repo
DevRails и не разрешение на массовое переименование brownfield-кода.

## 2. Исходная проблема

Агенты легко воспроизводят технически корректные, но малосодержательные пути:

```text
safety_gate/service.py
plant_state/services/review/service.py
access_admin/repositories/session/repository.py
```

В первом случае путь может не различать classification и action-decision
responsibility. В остальных случаях один полезный контекст распределён между
несколькими техническими сегментами.

Само повторение `service.py`, `models.py`, `repository.py`, `index.ts` или
другого filename не является ошибкой. Проблема существует только когда полный
путь не помогает определить владельца и назначение файла либо содержит
дублирующую вложенность без дополнительной семантики.

## 3. Принятое решение

Полный путь рассматривается как единая agent context surface. Его части не
имеют универсальных ролей:

```text
package/workspace/code root
directories
complete filename
```

Каждая часть сообщает тот owner, boundary, namespace, route, package, subject,
capability, role или artifact type, который действительно закреплён
architecture, language, framework либо tooling. Например, технический `src/`
сам по себе может не быть architectural unit: соответствующий owner находится
в package или workspace segment выше него.

Каждый сегмент должен добавлять устойчивый смысл либо сохранять обязательную
project/framework semantics. Контекст папки не повторяется в filename
механически.

Filesystem path, import/module path, package export, URL/route и build target
являются разными executable identities. Агент не заставляет их совпадать, если
такую связь явно не задаёт language, framework, tooling или принятая
architecture.

Например:

```text
plant_state/review_service.py
```

предпочтительнее:

```text
plant_state/services/review/service.py
plant_state/plant_state_review_service.py
```

если дополнительные сегменты не выражают самостоятельную boundary, namespace
или framework semantics.

При нескольких responsibilities внутри одного owner:

```text
safety_gate/classification_service.py
safety_gate/action_decision_service.py
```

информативнее, чем:

```text
safety_gate/service.py
```

При этом имя не перечисляет все текущие операции и incidental implementation
details:

```text
plant_state_human_review_confirmation_rejection_conflict_service.py
```

Такое имя нестабильно и не повышает полезную смысловую плотность.

## 4. Границы эвристики

### 4.1 Семантическая и обязательная вложенность сохраняется

Папка оправдана, когда выражает:

- ownership или authority boundary;
- namespace, import или visibility boundary;
- URL, route или layout inheritance, когда framework связывает их с filesystem;
- package/workspace boundary;
- independently meaningful capability;
- framework/tooling-required structure.

DevRails не задаёт универсальный max depth и не выполняет flattening package,
module, route или workspace trees.

Например, SvelteKit entrypoint сохраняет framework path:

```text
src/routes/plants/[plantId]/+page.server.ts
```

Business logic при этом может принадлежать semantic owner:

```text
src/lib/features/plant-state/review-service.ts
```

### 4.2 Техническая вложенность не запрещается глобально

Папки `services/`, `models/`, `repositories/`, `controllers/` или `handlers/`
не создаются только по привычке. Они остаются допустимыми, если являются
принятой project convention, реальной package boundary или уменьшают
конкретную сложность.

### 4.3 Generic и reserved filenames допустимы

Generic или reserved filename допустим, когда его смысл однозначно задаётся
полным путём, framework или принятой convention:

- Python: `__init__.py`, `conftest.py`, Django `models.py`;
- Rust: `main.rs`, `lib.rs`, `mod.rs`, `build.rs`;
- Node/TypeScript: `index.ts`, `index.d.ts`, `package.json`;
- SvelteKit: `+page.svelte`, `+page.server.ts`, `+layout.svelte`, `+server.ts`.

Зарезервированный prefix, suffix или compound extension рассматривается как
часть единого filename и не изменяется ради дополнительной описательности.
Глобальная уникальность filename не является invariant.

### 4.4 Экосистемы сохраняют естественную грамматику

DevRails не вводит универсальный cross-language syntax:

```text
Python:     plant_state/review_service.py
Rust:       plant_state/trust_service.rs
TypeScript: plant-state/review-service.ts
Svelte:     plant-state/PlantStateReviewDialog.svelte
```

Повторение directory context в filename допустимо, когда filename одновременно
является устойчивым exported/public symbol, component identity или
tooling-required name и без повторения теряет нужный контекст вне своей папки.

Authored source file означает написанный проектом исходный код, а не generated
или vendored output. Framework entrypoints, tests, migrations, configs и другие
специализированные artifacts прежде всего следуют своим project/tooling
conventions; общая эвристика применяется только там, где она им не
противоречит.

Configured generator output и применимый project scaffold считаются project
convention, даже если их структура не является жёстким framework requirement.
Пока файл или путь управляется generator/tooling contract, последующее ручное
редактирование не отменяет этот contract автоматически.

## 5. KISS runtime policy

Эта идея не создаёт naming subsystem.

Не вводятся:

- обязательные naming profiles;
- YAML schema или registry;
- task fields или отдельные artifacts;
- обязательный discovery checklist;
- naming-specific lifecycle, status, gate или handoff;
- universal naming/structure validator;
- repository-wide naming review.

Runtime-агент использует authority в таком порядке:

1. language/framework/tooling contracts, configured generators и применимый
   project scaffold;
2. принятые architecture и project conventions;
3. наблюдаемая локальная convention;
4. общая эвристика смысловой плотности полного пути.

Физический путь оптимизируется только внутри уже выбранных executable
boundaries. Эвристика не выводит URL, import path, module path, package export
или build target из похожести имён.

Неочевидное naming/path решение записывается в существующий
`.memory-bank/architecture/system-architecture.md` рядом с соответствующим
code root или module boundary только когда оно materially влияет на public
path, import/module identity, package export, namespace, ownership, build target
или дальнейшую структуру. Формат свободный: компактная строка, таблица или
prose.

Отсутствие отдельного naming rule не является blocker. Локальный выбор внутри
принятых boundaries остаётся execution discretion. Только material ambiguity
в ownership/reuse boundary, public path, namespace, package/module identity,
build target или framework contract использует существующий route к
`/spec-design` либо оператору.

## 6. Минимальная интеграция в DevRails

### 6.1 Deployable `AGENTS.md`

В `skills/_shared/references/deployable/AGENTS.md` добавляется короткая
language-neutral policy:

- полный путь является единой context surface;
- каждый сегмент добавляет устойчивый смысл либо обязательную semantics;
- используется минимально необходимая вложенность;
- directory context не повторяется в filename без причины;
- полный filename сохраняет required prefixes, suffixes и compound extensions;
- filesystem path не заставляет разные executable identities совпадать;
- framework, tooling, generator и project conventions сохраняются;
- общая policy не разрешает opportunistic brownfield rename.

Полный текст не дублируется во всех runtime skills.

### 6.2 `/spec-design`

`skills/_shared/references/commands/spec-design.md` получает одно bounded
правило: при проектировании code roots и module boundaries фиксировать рядом
только неочевидную или material naming/path convention. Для обычной
ecosystem/project convention отдельная запись не требуется.

### 6.3 `/exe`

`skills/_shared/references/commands/exe.md` получает компактную instruction:
перед созданием или перемещением authored source file определить применимую
ownership, reuse или tooling boundary; проверить ближайший релевантный local
pattern и управляющие этим путём manifests, configuration либо registration;
сохранить framework, import/module, public-path, package-export и build-target
compatibility; затем выбрать минимальный полный путь с достаточным устойчивым
контекстом.

Это обычный task preflight, а не отдельная фаза. Агент не обязан выполнять
фиксированный порядок поисков и не останавливается из-за несущественного
локального naming choice.

Остальные runtime commands продолжают применять существующие ownership,
architecture и task-scope rules без naming-specific coverage.

## 7. Brownfield policy

- Наблюдаемая convention является evidence, но не автоматически новым target.
- Новый файл следует framework, принятой architecture и согласованной локальной
  convention.
- Затрагиваемый файл переименовывается только когда rename необходим текущему
  outcome и входит в task scope.
- Массовая naming migration требует отдельной явно принятой refactoring-задачи.
- Opportunistic cleanup не расширяет feature-задачу.

Перед допустимым rename агент проверяет применимые imports, module declarations,
references, exports, manifests/resolution, registration, routing, build targets
и case-sensitive compatibility. Конкретный набор проверок определяется
ecosystem и фактическим риском, а не универсальным чеклистом DevRails.

## 8. План имплементации

Изменить только canonical runtime sources:

```text
skills/_shared/references/deployable/AGENTS.md
skills/_shared/references/commands/spec-design.md
skills/_shared/references/commands/exe.md
```

Добавить в `scripts/test-install-sync.mjs` минимальные assertions, что policy
доступна в deployed `AGENTS.md` и сгенерированных runtime skills для Codex и
Claude.

Installer, task schema, `mb-lint`, `mb-doctor`, generated directories и
package-local `shared-*` не менять.

Проверить:

```bash
npm run check:syntax --silent
npm run test:install-sync --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Source-only count должен остаться `0`. Установку проверить в изолированных
install-only и bootstrap targets через `scripts/install-framework.mjs`.

## 9. Acceptance criteria

Изменение готово, когда:

- fresh runtime-агент рассматривает полный путь как единую context surface;
- новые authored paths используют минимально необходимую вложенность;
- каждый необязательный сегмент добавляет устойчивый смысл;
- directory context не дублируется в filename механически;
- justified symbol/component/tooling identity может сохранять повторение;
- reserved prefixes, suffixes и compound extensions не повреждаются;
- filesystem path не заставляет URL, import/module path, package export и build
  target совпадать;
- framework, route, package, namespace и project conventions сохраняются;
- configured generator и scaffold conventions сохраняются;
- generic и повторяющиеся filenames не запрещены глобально;
- brownfield policy не приводит к opportunistic rename;
- отсутствие отдельного naming rule или validator не блокирует исполнение;
- material path decisions используют существующую architecture authority;
- task schema, statuses, verdicts, gates, ownership, blockers, stop conditions
  и resume routes не изменились;
- policy доступна runtime-агенту после isolated install/bootstrap;
- source-only tree сохраняет `shared-*` count `0`.

## 10. Non-goals

- naming profile для каждого code root;
- единая naming grammar для всех языков;
- глобальная уникальность filenames;
- глобальный числовой depth limit;
- flattening framework/module/route/package trees;
- максимально длинные или автономные filenames;
- принудительное совпадение filesystem, URL, import/module, export и target
  identities;
- per-file ownership registry;
- universal naming/structure validator;
- repository-wide naming audit;
- новый lifecycle, status, task field, protocol или gate;
- массовая миграция существующего кода;
- изменение installer architecture.

## 11. Межстековые риски и опорные варианты

Policy должна обходить следующие риски:

- поломка import/module/public API при создании, перемещении или переименовании
  файла;
- ложное зеркалирование filesystem path в URL, package export, module path или
  build target;
- повреждение reserved filenames, compound extensions и tool discovery;
- потеря route, layout, server/client, visibility, package или workspace
  semantics ради меньшей вложенности;
- игнорирование manifests, resolvers, generator ownership или registration,
  расположенных вне соседней папки;
- искусственное назначение единственного business owner shared или
  cross-platform коду;
- opportunistic brownfield migration и case-only rename с разным поведением на
  case-sensitive и case-insensitive filesystems.

Опорные варианты нужны как compatibility coverage, а не как naming profiles:

| Стек | Сохраняемая semantics | Типичный риск |
|---|---|---|
| Python / FastAPI | package/import boundaries, `APIRouter` composition, `pyproject.toml`, tests и migrations conventions | принять filesystem layout за URL routing либо разрушить imports |
| Node.js / TypeScript | ESM/CJS mode, `package.json` `exports`/`imports`, workspace и module resolution, compound filenames | принять внутренний файл за публичный import path либо повредить tool discovery |
| Svelte / SvelteKit | filesystem routing в `src/routes`, `+` entrypoints, route groups, layout inheritance, `$lib` и server-only boundaries | flattening меняет URL/layout или переносит server-only code в client graph |
| Rust / Cargo | crate/workspace boundaries, module tree, visibility, `lib.rs`/`main.rs`, `src/bin`, `tests`, `examples` и `benches` | путь перестаёт соответствовать module declaration или Cargo target |
| Rust / Dioxus | Cargo semantics, `Routable` enum, component modules, Fullstack server/client targets и применимый `dx` scaffold | ошибочно вывести URL из filesystem либо смешать client/server build boundaries |
| Generator-managed code | configured scaffold, regeneration path и tool-owned registration | ручная оптимизация пути расходится с повторной генерацией |

Эта coverage matrix не требует отдельного runtime обхода по стеку. Агент
применяет только фактически обнаруженные language, framework и tooling
contracts текущего проекта.
