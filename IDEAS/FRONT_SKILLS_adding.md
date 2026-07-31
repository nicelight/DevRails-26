# Handoff: role-private skills и Frontender bundle

## Принятое решение

DevRails получает общий механизм role-private skills:

```text
canonical source
  -> skills/_shared/role-skills/<role>/<skill>/

deployed target
  -> .memory-bank/role-skills/<role>/<skill>/
```

Механизм обеспечивает progressive disclosure для skills, доступных только
назначенной роли. Frontender становится первым bundle на этом механизме и
получает восемь advisory skills:

- [`ui-ux-pro-max`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/ui-ux-pro-max);
- [`better-accessibility`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-accessibility);
- [`better-layout`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-layout);
- [`better-writing`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-writing);
- [`better-typography`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-typography);
- [`better-colors`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-colors);
- [`better-ui`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-ui);
- [`web-performance`](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices).

Public runtime skills сохраняются без изменений. Role-private skills
отсутствуют в `.agents/skills/`, `.claude/skills/`, host-level implicit
invocation и общем `.memory-bank/skills/index.md`.

Role-private skills не меняют:

- task lifecycle, statuses и ownership;
- schema и registry semantics;
- blockers, stop conditions и resume routes;
- обязательные gates и handoffs;
- scope, requirements и authority активного workflow.

## Общий контракт role-private skills

Canonical layout:

```text
skills/_shared/role-skills/
└── <role>/
    └── <skill>/
        ├── SKILL.md
        └── <optional resources>
```

Каждая role directory соответствует canonical role contract в
`skills/_shared/references/roles/<role>.md`. Каждая skill directory содержит
`SKILL.md` со следующими свойствами:

- `name` совпадает с именем директории;
- `description` кратко описывает routing intent;
- ссылки на bundled resources являются относительными и разрешаются внутри
  skill directory;
- source-only и host-specific paths отсутствуют.

Bootstrap и sync разворачивают каждый bundle в:

```text
.memory-bank/role-skills/<role>/<skill>/**
```

Role contract содержит явные routes к skills своей роли. Полный `SKILL.md`
появляется в контексте только после выбора релевантного route. Resources
появляются по необходимости.

Role-private означает изоляцию discovery и contract authority, а не файловую
ACL. Файлы физически доступны в target repository, но другие роли не получают
их metadata через priming и не применяют их без расширения собственного role
contract.

Отсутствующий или повреждённый private skill блокирует только зависящую от него
guidance. Task status автоматически не меняется.

## Packaging и deployment

`skills/_shared/role-skills/` является единственным canonical source.
Package-local и target-копии являются generated output.

Source-only deployment chain:

```text
skills/_shared/role-skills/
  -> scripts/install-framework.mjs
  -> prepared repository
  -> skills/_shared/scripts/init-mb.js
  -> target .memory-bank/role-skills/
```

`scripts/vendor-shared.mjs` не создаёт tracked или source-tree copies
role-private bundles. `--install-only` сохраняет только public runtime
commands. Role contracts и private bundles появляются при bootstrap/sync как
Memory Bank assets.

`init-mb.js`:

- обнаруживает все canonical role bundles в source и prepared layout;
- валидирует явные role routes, skill metadata и resource links до target
  writes;
- рекурсивно сохраняет внутреннюю структуру skills;
- добавляет framework generated/version markers;
- обновляет только распознанные generated files;
- удаляет только распознанные obsolete DevRails-generated files;
- сохраняет unmarked пользовательские files;
- исключает source-only paths из deployed artifacts.

Validation или collision failure оставляет role-private target surface без
частично обновлённого bundle.

## Frontender bundle

Canonical layout:

```text
skills/_shared/role-skills/frontender/
├── ui-ux-pro-max/
│   ├── SKILL.md
│   ├── scripts/
│   ├── data/
│   └── LICENSE
├── better-accessibility/
│   ├── SKILL.md
│   ├── references/
│   └── LICENSE
├── better-layout/
│   ├── SKILL.md
│   ├── references/
│   └── LICENSE
├── better-writing/
│   ├── SKILL.md
│   └── LICENSE
├── better-typography/
│   ├── SKILL.md
│   ├── references/
│   └── LICENSE
├── better-colors/
│   ├── SKILL.md
│   ├── references/
│   └── LICENSE
├── better-ui/
│   ├── SKILL.md
│   ├── references/
│   └── LICENSE
└── web-performance/
    ├── SKILL.md
    ├── references/
    └── LICENSE
```

Deployed layout:

```text
.memory-bank/roles/frontender.md
.memory-bank/role-skills/frontender/ui-ux-pro-max/**
.memory-bank/role-skills/frontender/better-accessibility/**
.memory-bank/role-skills/frontender/better-layout/**
.memory-bank/role-skills/frontender/better-writing/**
.memory-bank/role-skills/frontender/better-typography/**
.memory-bank/role-skills/frontender/better-colors/**
.memory-bank/role-skills/frontender/better-ui/**
.memory-bank/role-skills/frontender/web-performance/**
```

## Роль Frontender

Canonical role contract:

```text
skills/_shared/references/roles/frontender.md
```

Generated `AGENTS.md` содержит только route:

```text
If ROLE: Frontender, read `.memory-bank/roles/frontender.md`.
```

Frontend skill names, descriptions и upstream instructions в generated
`AGENTS.md` отсутствуют.

Role priming:

```text
ROLE: Frontender
  -> .memory-bank/roles/frontender.md
  -> owning SKILL.md
  -> необходимые resources
```

`frontender.md` содержит явное соответствие launch intent, concern и пути к
каждому private skill.

`Frontender` сохраняет назначенные scope, permissions, lifecycle ownership и
authority активного workflow. Назначение роли не создаёт права менять statuses,
gates, specs или public contracts и не разрешает subagents без явной authority
оператора или `ORCHESTRATOR`.

`ORCHESTRATOR` назначает `Frontender` как bounded delegated role по
существующему delegation contract: intent, constraints, boundary, expected
output и report route.

Обычная frontend-задача активирует только owning skills текущего concern.
Holistic frontend review охватывает несколько domains только при явном
launch intent и остаётся в назначенном scope.

## Concern ownership

| Concern | Owning skill | Граница |
| --- | --- | --- |
| Design direction, product patterns, style candidates, charts, stack lookup | `ui-ux-pro-max` | Search results остаются candidates |
| Semantic HTML, keyboard, focus, forms, assistive technology | `better-accessibility` | Guidance не создаёт compliance gate |
| Grouping, alignment, spacing, responsive structure, spatial RTL | `better-layout` | Project tokens и accepted layout conventions имеют приоритет |
| UX copy, terminology, labels, errors, empty states | `better-writing` | Canonical terminology и product voice имеют приоритет |
| Font behavior, type systems, wrapping, punctuation, text-level bidi | `better-typography` | Visual typography не подменяет semantic structure |
| Color notation, palettes, gamut, rendered-pair contrast | `better-colors` | Existing token system сохраняется |
| Surfaces, icons, motion, visual polish | `better-ui` | Taste recipes остаются contextual candidates |
| Loading, bundles, network/runtime, rendering and state performance | `web-performance` | Refactor требует requirement, evidence или measurable risk |

Пересекающий несколько domains concern получает одного владельца underlying
rule. Secondary effects не создают дублирующиеся findings.

Роль не вводит собственные verdicts, severity lifecycle или review status.
Формат результата, gates и handoff остаются у активного DevRails workflow.

## Адаптация upstream skills

### `ui-ux-pro-max`

Upstream:
[`ui-ux-pro-max`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/ui-ux-pro-max).

DevRails bundle сохраняет search engine, scripts, data и MIT attribution.
Search results остаются design candidates. PRD, canonical specs, design tokens,
принятые решения и operator decisions имеют более высокий authority.

`--persist` отсутствует в default behavior. Durable output зависит от явной
авторизации artifact и пути. `design-system/MASTER.md` не становится вторым
source of truth.

Stack определяется по project evidence. Неопределённый material stack choice
использует существующий operator-decision route. Python и другие dependencies
не устанавливаются автоматически. Отсутствие Python оставляет статическую
guidance и фиксируется как limitation.

`scripts/search.py` разрешает `data/` относительно собственной private skill
directory.

### `better-*`

Upstream skills:

- [`better-accessibility`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-accessibility);
- [`better-layout`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-layout);
- [`better-writing`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-writing);
- [`better-typography`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-typography);
- [`better-colors`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-colors);
- [`better-ui`](https://github.com/jakubkrehel/skills/tree/a67333399dabbc71d7778962cb9c4fb9b86a00d0/skills/better-ui).

Все шесть ссылок зафиксированы на commit
`a67333399dabbc71d7778962cb9c4fb9b86a00d0`.

Bundle содержит шесть domain skills и соответствующий MIT notice.
`better-interface` отсутствует: orchestration принадлежит роли `Frontender`.
Upstream `AGENTS.md`, `CLAUDE.md`, `.claude-plugin/` и
`skills/*/agents/openai.yaml` не входят в runtime assets DevRails.

Domain knowledge и progressive disclosure сохраняются. Upstream review
orchestration, самостоятельные verdicts, finding caps и severity ownership
отсутствуют.

Numeric spacing, typography, motion, color и polish values остаются
contextual candidates. Framework API применимы только при evidence
соответствующего stack. Existing component library, tokens, product voice,
accessibility requirements и interaction patterns имеют приоритет.

### `web-performance`

Upstream:
[vercel-labs/react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices).

DevRails-версия сохраняет attribution и MIT notice. Адаптация удаляет
React/Next.js-specific rules, APIs, examples и terminology. Сохраняются только
правила, механизм и доказательная база которых применимы независимо от
frontend framework. Смешанные правила переписываются без React/Next.js частей
и без выдуманных framework-neutral замен.

Оставшиеся правила группируются в:

```text
references/
├── async-work.md
├── bundles-and-loading.md
├── network-and-serialization.md
├── browser-runtime.md
├── rendering-and-state.md
├── javascript-hot-paths.md
└── validation.md
```

Guidance охватывает общие для web-стеков waterfalls, parallel operations,
conditional loading, bundle boundaries, request deduplication, caching,
network serialization, browser runtime, rendering/state cost и доказанные
JavaScript hot paths.

## Advisory contract

Role contract выполняет routing, а не requirements discovery. Выбор skill не
создаёт requirement, gate, lifecycle state или write authority.

PRD, canonical specs, design tokens, source code, task scope и operator
decisions имеют приоритет над advisory guidance.

Frontend bundle не входит:

- в task schema и JSON registry;
- в `review-tasks-plan` и `mb-doctor` gates;
- в обязательные manual/autonomous sequences;
- в обязательные child skills `autonomous` или `autopilot`;
- в task lifecycle и protocol families.

## Acceptance evidence

Deployment regression подтверждает:

- неизменность public runtime inventory;
- отсутствие private skill names и directories в public surfaces и общем skill
  index;
- deployment роли и всех восьми skills при bootstrap/sync;
- разрешение всех явных role routes в deployed target;
- generated-only update/delete semantics и сохранность unmarked files;
- отсутствие source-only paths;
- покрытие attribution и license notices.

Role evals подтверждают:

- отсутствие Frontender metadata в priming остальных ролей;
- загрузку только owning skills и необходимых resources;
- отсутствие дублирующихся cross-domain findings;
- сохранение workflow verdicts, statuses, gates и scope.

Skill validation подтверждает:

- работу `ui-ux-pro-max/scripts/search.py` из isolated installed target;
- относительное разрешение `data/`;
- существование всех referenced resources;
- отсутствие runtime dependency на upstream instruction files;
- отсутствие React/Next.js-specific content в `web-performance`, кроме
  provenance;
- should-trigger, should-not-trigger и forward cases для всех восьми skills.

Source-only invariant:

```bash
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Ожидаемый результат: `0`.

Project verification set:

```bash
npm run check:syntax
npm run test:install-sync
npm run test:mb-doctor
```

## Product change surface

```text
skills/_shared/role-skills/**
skills/_shared/references/roles/frontender.md
skills/_shared/references/roles/orchestrator.md
skills/_shared/references/deployable/AGENTS.md
skills/_shared/references/structure-template.md
skills/_shared/scripts/init-mb.js
scripts/test-install-sync.mjs
PROJECT_MAP.md
README.md
howItWorks.md
```

Generated `skills/*/{agents,references,scripts}/shared-*` и локальные
`.agents/`, `.claude/`, `.memory-bank/`, `.protocols/`, `.tasks/` в source repo
остаются вне change surface.
