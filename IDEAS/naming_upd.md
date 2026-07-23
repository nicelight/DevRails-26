# IDEA: Agent-legible naming и структура исходного кода

Обновлено: 2026-07-24

## 1. Задача

DevRails должен помогать runtime-агентам создавать и находить исходные файлы
так, чтобы полный путь передавал максимум устойчивого и полезного контекста без
необходимости сначала открывать файл.

Сочетание:

```text
code root + relative path + basename + extension
```

должно позволять определить:

- владельца или ближайшую authority boundary;
- business subject либо capability;
- техническую роль файла;
- применимую ecosystem/framework semantics.

Вторичная цель — избегать случайной и дублирующей технической вложенности.
Если framework и архитектурные boundaries не требуют иного, предпочтительна
широкая и неглубокая структура с более информативными именами файлов:

```text
shallow by default, semantic depth only
```

Это изменение относится к runtime workflow DevRails. Оно не предписывает
конкретную структуру самому source repo DevRails и не разрешает массовое
переименование brownfield-кода.

## 2. Исходная проблема

В capability-sliced и modular-monolith проектах агенты часто воспроизводят
однотипные технические имена:

```text
service.py
models.py
contracts.py
repository.py
runtime.py
```

В проанализированном Python/FastAPI backend из 94 application-файлов
повторялись 9 `service.py`, 8 `contracts.py`, 8 `models.py`,
7 `repository.py` и 3 `runtime.py`. При этом 22 файла превышали 500 строк.

Само повторение basename не доказывает ошибку. Полный package path технически
различает файлы. Проблема возникает, когда путь и имя вместе сообщают только
технический слой, но не помогают агенту определить capability, владельца и
реальную ответственность файла.

Например:

```text
safety_gate/service.py
```

может одновременно содержать classification и action-decision behavior.
Агент видит слой `service`, но не видит, какая capability является целью
изменения.

Дополнительная проблема — техническая вложенность:

```text
plant_state/services/review/service.py
access_admin/repositories/session/repository.py
```

Она распределяет небольшой объём полезной информации между несколькими
сегментами и заставляет агента читать больше дерева, чтобы понять один файл.

## 3. Принятое решение

DevRails задаёт language-neutral contract смысловой читаемости полного пути,
а конкретную грамматику выбирает отдельно для каждого code root и ecosystem.

Распределение контекста:

```text
code root  -> architectural unit
directories -> owner, boundary, namespace, route или package
basename   -> subject, capability и role
extension  -> artifact type и ecosystem
```

Общая эвристика для authored application-файла:

```text
<context>/<subject>[_<capability>]_<role>.<ext>
```

Это не универсальный обязательный синтаксис. Naming profile конкретного code
root может использовать `snake_case`, `kebab-case`, dot-role notation,
framework-defined names или семантически достаточный package/module path.

Context не повторяется в basename механически:

```text
plant_state/trust_service.py
```

предпочтительнее:

```text
plant_state/plant_state_trust_service.py
```

если basename не требуется делать автономным и package path уже однозначно
передаёт context.

Имена кодируют устойчивые понятия:

```text
plant_state/review_service.py
safety_gate/classification_service.py
safety_gate/action_decision_service.py
photo_intake/artifact_storage.py
```

Имена не должны перечислять все текущие операции:

```text
plant_state_human_review_confirmation_rejection_conflict_service.py
```

Такое имя быстро устаревает и ухудшает читаемость.

## 4. Правила структуры

### 4.1 Папки

Папка оправдана, когда выражает хотя бы одну устойчивую семантику:

- ownership или authority boundary;
- namespace и import boundary;
- URL и route inheritance;
- visibility;
- package/workspace boundary;
- framework-required structure;
- independently meaningful capability boundary.

Папка не создаётся только для группировки файлов по техническому слою:

```text
services/
models/
repositories/
controllers/
handlers/
```

если тот же контекст яснее выражается именами файлов внутри папки владельца.

Предпочтительно:

```text
plant_state/
  review_service.py
  plant_state_repository.py
  assessment_runtime.py
  plant_state_http.py
```

Вместо:

```text
plant_state/
  services/
    review/
      service.py
  repositories/
    repository.py
```

Техническая подпапка остаётся допустимой, когда она требуется framework,
уже является принятой package boundary или снижает реальную сложность
конкретного code root. DevRails не вводит числовой глобальный предел глубины.

### 4.2 Имена

Authored application-файл должен содержать business subject, capability или
устойчивую роль, если эта информация не выражена однозначно semantic path.

Generic basename разрешён, когда:

- его требует framework или tooling;
- package/module/route path придаёт ему однозначный смысл;
- он явно принят naming profile code root.

Framework-required, generated и vendored файлы не проверяются как обычные
authored application-файлы.

В production names не включаются:

- feature, task и requirement IDs;
- workflow stages;
- временные состояния;
- исторические маркеры `new`, `old`, `fixed`, `refactored`;
- все операции, которые случайно находятся в файле сейчас;
- incidental implementation details.

Устойчивая implementation role допустима, когда она различает реальные
adapters или источники хранения:

```text
postgres_task_repository.py
filesystem_photo_storage.py
timeline_jsonl_writer.py
```

## 5. Почему решение не универсализирует basename и глубину

### 5.1 Не запрещаем повторяющиеся basenames глобально

Повторяющиеся имена могут быть частью ecosystem contract:

- Python: `__init__.py`, `conftest.py`; Django: `models.py`, `admin.py`,
  `apps.py`;
- Rust: `main.rs`, `lib.rs`, `mod.rs`, `build.rs`;
- Node/TypeScript: `index.ts`, `package.json`, framework config files;
- SvelteKit: `+page.svelte`, `+layout.svelte`, `+server.ts`,
  `+page.server.ts`.

В SvelteKit смысл `+page.svelte` задаётся route path. Переименование нарушило
бы framework contract.

Глобальная уникальность также бессмысленна для monorepo:

```text
backend/app/session_service.py
frontend/src/session.service.ts
firmware/src/session.rs
```

Это разные architectural units. Даже внутри одного code root повторяющиеся
`entities.py` могут быть корректны, если package path однозначно задаёт
владельца.

Поэтому уникальность basename не является default invariant. Если конкретный
проект хочет её проверять, область уникальности задаётся его naming profile.

### 5.2 Не выполняем универсальный flattening

Вложенность может быть исполняемой семантикой:

- Rust directory tree влияет на module tree, namespace и visibility;
- SvelteKit route tree определяет URL и layout inheritance;
- Python packages определяют import namespaces;
- Node package/workspace boundaries определяют exports и dependency graph.

Flattening таких директорий может изменить public imports, routing,
visibility или dependency ownership. Удаляется только случайная вложенность,
которая не несёт принятой семантики.

### 5.3 Не повторяем context в каждом имени

Безусловный prefix создаёт шум:

```text
crate::plant_state::plant_state_trust_service
```

Naming profile определяет, должен ли basename быть автономным или context уже
достаточно выражен path. В одном code root используется одна согласованная
стратегия либо явно описанные path-qualified исключения.

### 5.4 Не требуем максимально длинных имён

Цель — максимум устойчивого полезного контекста, а не максимальная длина.
Слишком подробное имя связывает файл с текущей реализацией и быстро устаревает.
Предпочтительны устойчивые domain terms из принятого glossary.

### 5.5 Не требуем физической co-location для любого transport

FastAPI HTTP adapter обычно можно хранить рядом с capability:

```text
photo_intake/photo_intake_http.py
```

Но SvelteKit entrypoint обязан оставаться в route tree:

```text
src/routes/plants/[plantId]/+page.server.ts
```

Business/application logic при этом принадлежит semantic owner:

```text
src/lib/features/plant-state/
```

Framework entrypoint может физически находиться отдельно, но не становится
владельцем бизнес-логики.

### 5.6 Не создаём универсальную cross-language грамматику

Экосистемы имеют разные естественные styles:

```text
Python/FastAPI:
  plant_state/review_service.py

Rust:
  plant_state/trust_service.rs

TypeScript/Nest:
  plant-state/plant-state-review.service.ts

Svelte:
  PlantStateReviewDialog.svelte

SvelteKit routes:
  plants/[plantId]/+page.server.ts
```

DevRails защищает смысл пути и consistency внутри code root, а не один
синтаксис для всех языков.

## 6. Naming profile

Каждый значимый code root использует собственный naming profile либо
унаследованную однозначную ecosystem/framework convention.

Минимальная концептуальная форма:

```yaml
root: backend/app
ecosystem: python
framework: fastapi
path_semantics: package-ownership
authored_style: snake_case
context_prefix: optional
authored_patterns:
  - <subject>_<role>.py
path_qualified_names:
  - entities.py
reserved_names:
  - __init__.py
generated_paths: []
validator: null
```

Это не новая обязательная YAML schema и не отдельный registry. Эквивалентная
компактная таблица или prose живёт в существующем
`.memory-bank/architecture/system-architecture.md` рядом с code roots и
module boundaries.

Профиль фиксирует только то, что необходимо downstream-агенту:

- code root;
- ecosystem/framework;
- семантику директорий;
- authored naming style/pattern;
- политику context prefix;
- допустимые path-qualified generic names;
- framework-required/reserved names;
- generated paths;
- существующий project-native validator.

Если существующая convention однозначна, агент её наследует. Если в greenfield
проекте несколько вариантов materially меняют public paths, module boundaries
или дальнейшую структуру, решение принадлежит оператору. В unattended flow
агент использует только уже принятую authority; отсутствие material решения
возвращает существующий blocker, а не agent-selected convention.

## 7. Поведение runtime-агента

Перед созданием или перемещением authored application-файла агент:

1. определяет owning code root и capability owner;
2. читает принятые module/code-root boundaries и naming profile;
3. учитывает framework-required path semantics;
4. ищет существующие файлы по принятому domain subject;
5. ищет определения символов, imports и references;
6. использует glossary и только документированные aliases/синонимы;
7. проверяет, не существует ли уже подходящий owner или файл;
8. выбирает минимальную семантически достаточную вложенность;
9. формирует устойчивое имя по profile;
10. запускает существующий project-native naming/structure check, если он
    определён и применим.

Агент не обязан выполнять эти действия в фиксированном порядке. Это
обязательное coverage, а не reasoning script.

При material ambiguity ownership, public path, namespace, framework contract
или naming profile агент останавливает scope growth и использует существующий
route к `/spec-design` либо оператору. Незначимый локальный выбор внутри
принятого profile остаётся execution discretion.

## 8. Brownfield policy

Принятие naming profile не разрешает массовое переименование существующего
проекта.

- `/map-codebase` фиксирует наблюдаемую as-is convention, но не превращает её
  автоматически в target authority.
- `/spec-design` принимает, сохраняет либо корректирует target convention.
- Новые файлы следуют принятому profile.
- Затрагиваемый файл переименовывается только когда это необходимо текущему
  outcome и входит в task scope.
- Массовая naming migration выполняется отдельной явно принятой
  refactoring-задачей.

Перед brownfield rename проверяются:

- static и dynamic imports;
- plugin registration;
- serialized module paths;
- package exports и aliases;
- macros, `include!`, `#[path]` и generated references;
- framework routing;
- case-only rename compatibility на Linux/macOS/Windows.

Opportunistic cleanup не должен расширять feature-задачу.

## 9. Validator boundary

Project-native validator может проверять:

- форму имени;
- согласованный naming style;
- разрешённые и запрещённые patterns;
- framework-required и path-qualified исключения;
- generated paths;
- mechanically defined depth rule;
- optional uniqueness scope, если она принята проектом.

Validator не доказывает:

- semantic cohesion файла;
- правильность capability decomposition;
- корректность ownership;
- необходимость разделения большого файла;
- качество архитектуры.

Эти вопросы остаются responsibility архитектурного решения, task planning и
review. DevRails не получает универсальный cross-language naming validator в
рамках этой задачи. Missing validator не становится новым глобальным gate.

## 10. Интеграция в DevRails

Новый lifecycle, status, task field, registry, protocol или обязательный
artifact не создаётся.

### 10.1 Глобальная runtime policy

В `skills/_shared/references/deployable/AGENTS.md` добавляется короткий
language-neutral раздел:

- полный путь является agent context surface;
- `shallow by default, semantic depth only`;
- semantic/framework-required nesting сохраняется;
- project-specific naming profile читается из принятой архитектуры;
- mass brownfield rename не выводится из общей policy.

Полный текст не дублируется во всех runtime skills.

### 10.2 `/map-codebase`

`skills/_shared/references/commands/map-codebase.md` получает bounded
current-state discovery:

- code roots и package/workspace boundaries;
- observed directory semantics;
- framework-required/reserved/generated paths;
- observed naming styles и path-qualified generic names;
- ownership signals и существующие validators.

Результат остаётся as-is evidence и не становится target decision.

### 10.3 `/spec-design`

`skills/_shared/references/commands/spec-design.md`:

- связывает naming profiles с уже принимаемыми code roots и capability slices;
- записывает только значимые profiles в существующий
  `system-architecture.md`;
- сохраняет framework-required path semantics;
- применяет `shallow by default, semantic depth only`;
- не создаёт отдельный naming registry;
- не требует profile для нерелевантных generated/vendor roots;
- не задаёт per-file ownership.

Greenfield recommendation следует ecosystem convention. Brownfield target
учитывает as-is evidence, но операторская/нормативная authority имеет
приоритет.

### 10.4 `/feature-to-tasks`

`skills/_shared/references/commands/feature-to-tasks.md`:

- использует owning slice/code root и naming profile при планировании новых
  путей;
- не создаёт technical-layer folders как новые primary boundaries;
- делает ожидаемый path legible в существующих `touched_files`,
  constraints и linked architecture;
- не превращает code root в hard `write_boundary`;
- не создаёт task по числу файлов или слоёв.

### 10.5 `/review-tasks-plan`

`skills/_shared/references/commands/review-tasks-plan.md` проверяет только
планируемый change surface:

- новый путь соответствует принятому owner/code root;
- path и basename совместно передают достаточный контекст;
- framework-required placement сохранён;
- technical-layer folder не подменил capability boundary;
- naming ambiguity не оставлена executor-у.

Это не repository-wide naming audit.

### 10.6 `/exe`

`skills/_shared/references/commands/exe.md`:

- выполняет discovery перед созданием нового файла;
- следует принятому naming profile;
- предпочитает минимальную семантическую вложенность;
- не выполняет opportunistic mass rename;
- сохраняет framework/package/public-path compatibility;
- останавливается при material ambiguity, не разрешённой task-linked
  authority.

### 10.7 `/verify`

`skills/_shared/references/commands/verify.md`:

- проверяет только actual task change surface;
- подтверждает accepted owner и path semantics;
- запускает project-native validator, только если он существует и применим;
- не требует универсальный naming check;
- не использует имя как доказательство semantic cohesion.

### 10.8 Документация и deployment

При необходимости краткое пользовательское описание добавляется в
`howItWorks.md`. `README.md` не расширяется подробной naming policy.

Installer менять не требуется:

- runtime command skills уже генерируются напрямую из
  `skills/_shared/references/commands/*.md`;
- deployable `AGENTS.md` уже разворачивается canonical bootstrap/sync path.

Все изменения выполняются только в canonical `skills/_shared/`. Generated
`.agents/`, `.claude/`, `.memory-bank/` и package-local `shared-*` не
редактируются и не коммитятся.

## 11. План имплементации

### Этап 1. Зафиксировать единый contract

1. Сформулировать компактную нормативную policy для deployable `AGENTS.md`.
2. Проверить, что policy:
   - language-neutral;
   - не требует unique basenames;
   - не задаёт универсальный max depth;
   - сохраняет framework semantics;
   - не разрешает mass rename;
   - не создаёт новый workflow contract.
3. Использовать одинаковые термины:
   `code root`, `naming profile`, `path semantics`, `capability owner`,
   `authored application file`, `framework-required`, `generated`.

### Этап 2. Добавить discovery и design ownership

1. Обновить `/map-codebase` для as-is naming/path evidence.
2. Обновить `/spec-design` для принятия и записи target naming profiles.
3. Проверить, что:
   - current state и target authority не смешаны;
   - operator decision требуется только для material unresolved branch;
   - profile хранится в существующем architecture artifact;
   - profile не становится registry/schema/task field.

### Этап 3. Провести policy через planning

1. Обновить `/feature-to-tasks`.
2. Обновить `/review-tasks-plan`.
3. Обеспечить, чтобы fresh executor мог по task card и direct links определить:
   - owning code root;
   - применимый naming profile;
   - ожидаемый semantic path;
   - framework-required exceptions;
   - допустимый verification path.
4. Не менять `touched_files`, `write_boundary`, task schema и review verdict
   ownership.

### Этап 4. Провести policy через execution и verification

1. Обновить `/exe` discovery и file-creation правила.
2. Обновить `/verify` task-scoped проверку.
3. Сохранить:
   - execution tactic discretion;
   - tier routing;
   - lifecycle/status ownership;
   - blockers и resume routes;
   - существующие closure gates.

### Этап 5. Добавить regression coverage

Обновить `scripts/test-install-sync.mjs` минимальными assertions, которые
подтверждают:

- runtime Codex и Claude skills содержат одинаковые обновлённые contracts;
- deployed `AGENTS.md` содержит language-neutral policy;
- runtime skills не ссылаются на source-only paths;
- full sync идемпотентно обновляет managed assets;
- новые instructions доступны в isolated target.

Не добавлять semantic naming linter в framework regression suite.

### Этап 6. Проверить source-only deployment chain

Выполнить:

```bash
npm run check:syntax --silent
npm run test:install-sync --silent
npm run test:mb-doctor --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Source-only count должен быть `0`.

Проверить isolated targets:

```bash
tmp_target="$(mktemp -d)"

node scripts/install-framework.mjs \
  --skill '*' \
  --target "$tmp_target/install-only" \
  --yes

node scripts/install-framework.mjs \
  --bootstrap \
  --target "$tmp_target/bootstrap" \
  --yes
```

В `install-only` проверить generated `.agents/skills/*/SKILL.md` и
`.claude/skills/*/SKILL.md`. В `bootstrap` дополнительно проверить deployed
`AGENTS.md` и Memory Bank architecture routing.

## 12. Планируемый change surface

Обязательные canonical runtime sources:

```text
skills/_shared/references/deployable/AGENTS.md
skills/_shared/references/commands/map-codebase.md
skills/_shared/references/commands/spec-design.md
skills/_shared/references/commands/feature-to-tasks.md
skills/_shared/references/commands/review-tasks-plan.md
skills/_shared/references/commands/exe.md
skills/_shared/references/commands/verify.md
```

Regression:

```text
scripts/test-install-sync.mjs
```

Документация только при необходимости синхронизации публичного описания:

```text
howItWorks.md
```

Не планируются:

```text
scripts/install-framework.mjs
scripts/vendor-shared.mjs
task schema
mb-lint / mb-doctor naming rules
new workflow reference
new naming registry
generated .agents/.claude/.memory-bank files
package-local shared-* files
```

## 13. Acceptance criteria

Изменение готово, когда:

- fresh runtime-агент понимает, что полный path является context surface;
- агент может найти принятый naming profile значимого code root;
- новые authored paths выражают owner, subject/capability и role совместно, а
  не обязательно только basename;
- технические layer-папки не создаются автоматически;
- semantic и framework-required nesting сохраняется;
- generic names разрешаются только по path/framework/profile semantics;
- unique basename и universal max depth не стали глобальными invariants;
- разные ecosystems могут использовать разные согласованные profiles;
- brownfield naming не становится основанием для opportunistic mass rename;
- project-native validator используется только когда существует;
- semantic cohesion не объявляется механически доказанной;
- task schema, statuses, verdicts, gates, ownership, blockers, stop conditions
  и resume routes не изменились;
- Codex и Claude получают эквивалентное runtime behavior;
- isolated install/bootstrap подтверждает доступность policy в target;
- source-only tree сохраняет `shared-*` count `0`.

## 14. Non-goals

- глобальная уникальность basenames;
- единая naming grammar для всех языков;
- глобальный числовой limit глубины;
- flattening framework/module/route/package trees;
- обязательный context prefix в каждом basename;
- максимально длинные имена;
- per-file ownership registry;
- универсальный semantic naming validator;
- автоматическая оценка cohesion по имени файла;
- новый lifecycle, status, task field, protocol или gate;
- массовая миграция существующего кода;
- обязательная co-location framework entrypoint и business logic;
- изменение installer architecture.
