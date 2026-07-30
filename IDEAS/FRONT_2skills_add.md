# План внедрения двух рекомендательных frontend skills

## Решение

Внедрить оба skill как устанавливаемые по умолчанию advisory runtime-skills:

- `ui-ux-pro-max`;
- `frontend-performance-best-practices` — framework-agnostic переработка
  `vercel-react-best-practices`.

Skills доступны агенту в target project и применяются по релевантности, но не
становятся обязательными workflow-шагами, gates или проверками.

Они не меняют:

- task lifecycle, statuses и ownership;
- schema и registry semantics;
- blockers, stop conditions и resume routes;
- обязательные gates и handoffs;
- scope и требования выполняемой задачи.

## 1. Поддержка ресурсных runtime-skills

Текущий installer генерирует runtime-skill из одного Markdown-файла в
`skills/_shared/references/commands/`. Этого недостаточно для
`ui-ux-pro-max`, которому нужны Python-скрипты и CSV-данные.

Добавить canonical root:

```text
skills/_shared/runtime-skills/
├── ui-ux-pro-max/
│   ├── SKILL.md
│   ├── scripts/
│   ├── data/
│   └── LICENSE
└── frontend-performance-best-practices/
    ├── SKILL.md
    ├── references/
    └── LICENSE
```

Расширить `scripts/install-framework.mjs`:

- обнаруживать директории в `skills/_shared/runtime-skills/`;
- валидировать наличие `SKILL.md`, совпадение имени директории и `name`,
  наличие `description`;
- рекурсивно разворачивать skill в обе runtime surfaces:
  `.agents/skills/<name>/` и `.claude/skills/<name>/`;
- добавлять существующие generated/version markers в deployed `SKILL.md`;
- включать bundled skills в общий collision preflight и expected runtime set;
- сохранять защиту пользовательских unmarked skills;
- при `--sync` обновлять полный bundle и удалять только распознанные
  DevRails-generated версии.

`vendor-shared.mjs` не должен копировать эти bundles в package entrypoints.
Canonical source остаётся внутри `skills/_shared/`, а installer разворачивает
его непосредственно в target.

## 2. Адаптация `ui-ux-pro-max`

Исходник:
[nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).

Сохранить локальный поисковый движок, scripts и data, но переработать
`SKILL.md` под DevRails:

- результаты поиска являются кандидатами, а не требованиями или принятыми
  design decisions;
- PRD, canonical specs, существующие design tokens и решения оператора имеют
  приоритет;
- убрать обязательное требование всегда начинать с генерации design system;
- не использовать `--persist` по умолчанию;
- разрешать persistence только когда задача явно авторизует durable artifact
  и его путь;
- не создавать `design-system/MASTER.md` как второй source of truth;
- определять stack по текущему проекту, не подставлять `html-tailwind` без
  evidence;
- если выбор stack materially меняет результат и не определён authoritative
  evidence, использовать существующий operator-decision route;
- не устанавливать Python или другие зависимости автоматически;
- если Python недоступен, использовать доступную статическую guidance либо
  сообщить об ограничении без расширения scope;
- трактовать style, icon, spacing и viewport рекомендации как heuristics;
- делать accessibility-пункт gate только при наличии соответствующего
  task/spec/project requirement.

Путь к `scripts/search.py` разрешать относительно активного `SKILL.md`, без
жёсткой привязки к `.agents` или `.claude`.

Сохранить MIT attribution оригинальному upstream.

## 3. Framework-agnostic performance skill

Исходник:
[vercel-labs/react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices).

Рабочее имя новой версии:

```text
frontend-performance-best-practices
```

Не переносить монолитный `AGENTS.md`. Создать короткий `SKILL.md` с
progressive disclosure:

```text
references/
├── async-data-flow.md
├── bundles-and-loading.md
├── server-client-boundaries.md
├── browser-runtime.md
├── reactive-ui.md
├── javascript-hot-paths.md
└── validation.md
```

Переработка правил:

- сохранить framework-agnostic рекомендации по waterfalls, параллельным
  операциям, conditional/dynamic loading, bundle boundaries, passive event
  listeners, storage access, DOM/layout, SVG, `content-visibility`, Map/Set и
  hot paths;
- обобщить SWR, React cache и Server Components до request deduplication,
  caching и server/client serialization boundaries;
- выразить React rerender-рекомендации через общие reactive UI concepts:
  минимальные subscriptions, derived state, transient state и event-driven
  side effects;
- удалить конкретные React/Next.js API и конструкции: hooks, JSX, RSC,
  `React.cache`, `Activity`, `next/dynamic`, `after()` и аналогичные
  framework-owned механизмы;
- не заменять удалённые API выдуманными универсальными абстракциями;
- применять JavaScript micro-optimizations только к доказанному hot path;
- не расширять scope ради speculative performance improvements;
- требовать измеримый риск, наблюдаемую проблему или task/spec requirement
  перед performance-driven refactor.

Сохранить attribution Vercel и MIT notice.

## 4. Advisory-семантика в DevRails

В generated `.memory-bank/skills/index.md` добавить guidance:

- `ui-ux-pro-max` рекомендуется для UI structure, interaction, accessibility
  и visual review;
- `frontend-performance-best-practices` рекомендуется для загрузки, bundle и
  runtime performance, а также performance review.

Не добавлять эти skills:

- в обязательную manual/autonomous sequence;
- в task schema или JSON registry;
- в `review-tasks-plan` или `mb-doctor` gates;
- как обязательные child skills для `autonomous` или `autopilot`.

## 5. Проверки

### Installer и deployment

Расширить `scripts/test-install-sync.mjs`:

- install-only и bootstrap разворачивают одинаковый набор из 35 runtime-skills
  в обе surfaces;
- resource directories обоих bundled skills присутствуют в target;
- deployed `SKILL.md` содержит generated/version markers;
- `.memory-bank/skills/index.md` отражает оба skills и обе surfaces;
- bundled-skill collision с пользовательским unmarked skill останавливает
  установку до любых частичных изменений;
- `--sync` обновляет устаревшие bundle resources;
- `--sync` не перезаписывает unmarked пользовательский skill;
- deployed skills не ссылаются на source-only пути.

### Skill validation

- Запустить `ui-ux-pro-max/scripts/search.py` из изолированного installed target
  для design-system и domain search сценариев.
- Проверить, что скрипт находит `data/` относительно собственного пути.
- Проверить существование всех references, scripts и data, названных в
  `SKILL.md`.
- Проверить, что framework-agnostic performance references не содержат
  React/Next.js API, кроме provenance/attribution.
- Проверить should-trigger и should-not-trigger запросы для обоих
  descriptions.
- Forward-test UI generation/review и performance review на отдельных
  реалистичных задачах без передачи ожидаемого ответа.

### Source-only invariants

После изменений выполнить:

```bash
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Ожидаемый результат: `0`.

Проверить изолированные targets:

```bash
tmp_target="$(mktemp -d)"

node scripts/install-framework.mjs \
  --install-only \
  --target "$tmp_target/install-only" \
  --yes

node scripts/install-framework.mjs \
  --bootstrap \
  --target "$tmp_target/bootstrap" \
  --yes
```

Запустить применимые project checks:

```bash
npm run check:syntax
npm run test:install-sync
npm run test:mb-doctor
```

## 6. Документация и карта проекта

Обновить:

- `README.md`: количество runtime-skills с 33 до 35 и краткое описание двух
  advisory skills;
- `howItWorks.md`: различие между workflow command skills и advisory bundled
  skills;
- `PROJECT_MAP.md`: новый canonical root
  `skills/_shared/runtime-skills/` и installer deployment path;
- `skills/_shared/references/structure-template.md`: deployed resource-bearing
  skill shape;
- `skills/_shared/scripts/init-mb.js`: guidance для двух новых installed
  skills.

## Планируемая change surface

```text
skills/_shared/runtime-skills/ui-ux-pro-max/**
skills/_shared/runtime-skills/frontend-performance-best-practices/**
scripts/install-framework.mjs
scripts/test-install-sync.mjs
skills/_shared/scripts/init-mb.js
skills/_shared/references/structure-template.md
PROJECT_MAP.md
README.md
howItWorks.md
```

Generated `skills/*/{agents,references,scripts}/shared-*` и локальные
`.agents/`, `.claude/`, `.memory-bank/`, `.protocols/`, `.tasks/` в source repo
не редактировать и не коммитить.
