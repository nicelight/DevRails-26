# DevRails 26 — фабрика агентной разработки

![Схема DevRails 26](devrails.jpg)

`DevRails 26` — source-only фреймворк для Codex CLI, Claude Code и совместимых
agent runtimes. Он разворачивает в целевом репозитории набор взаимосвязанных
runtime-skills, Memory Bank, JSON task registry и протоколы, которые проводят
проект от идеи или brownfield delta до проверенной реализации.

## Что даёт фреймворк

- хранит продуктовые решения, требования, SDD specs и состояние работы в
  репозитории, а не только в истории чата;
- связывает PRD, `REQ-*`, epics, `FT-*`, implementation plans и
  `TASK-NNN-TN-FT-NNN-WN` records;
- даёт каждому агенту достаточный task-scoped handoff, gates и evidence;
- разделяет planning, implementation, functional verification, adversarial
  semantic verification и lifecycle ownership;
- поддерживает greenfield, brownfield, ручное выполнение, `/autopilot` и
  полный `/autonomous` flow;
- применяет одну task model и один lifecycle во всех режимах.

## Главный принцип переработанных skills

Skill фиксирует objective, inputs, hard boundaries, required outputs,
validation и handoff, но не навязывает агенту пошаговую внутреннюю методику без
причины. Внутри принятого scope агент сам выбирает порядок чтения, инструменты,
тактику, минимальную artifact shape и самые дешёвые достаточные проверки.

Эта свобода не даёт агенту права принимать за оператора material product,
architecture, contract, data/state, security, task-boundary, tier, dependency
или verification decisions. В interactive flow такая развилка требует явного
ответа. Recommendation или default не являются решением. В unattended flow
используются только уже принятые authoritative decisions; иначе workflow
останавливается с точным blocker и resume route.

## Канонический greenfield flow

```text
raw idea ──> /brainstorm ──> /brief
clear concept ─────────────> /brief
existing PRD ──────────────> /write-prd

/brief
  -> /constitution, если principles ещё не ratified|partial
  -> /write-prd
  -> /spec-init
  -> /prd-to-features
  -> /review-feat-plan для high-risk, large или autonomous flow
  -> /spec-design                         # mandatory global SDD gate
  -> /foundation-to-tasks, если required
  -> /mb-doctor --strict для FT-000 queue
  -> /execute-task + /verify до закрытия Foundation Gate
  -> /feature-to-tasks FT-<NNN>
  -> /review-tasks-plan FT-<NNN>
  -> conditional /mb-doctor
  -> manual tier-routed loop или /autopilot
```

`/review-feat-plan` рекомендован и для небольшого ручного flow, но обязателен
для high-risk, large и autonomous work. `/spec-design` обязателен всегда: для
локальной простой работы он может зафиксировать valid `minimal` backbone с
обоснованными `not_applicable` areas.

`/spec-design` также принимает явное Foundation Dev Path decision. Если
executable baseline нужен, `/foundation-to-tasks` создаёт минимальную `FT-000`
queue и final gate. Product tasks нельзя генерировать до закрытия этого gate.
Если baseline уже доказан или отдельная foundation queue не нужна, фиксируется
`Foundation Required: false` и `Foundation Gate Task: not_required`.

## Brownfield flow

```text
/map-codebase
  -> получить PRD/delta
  -> /constitution, если principles ещё не ratified|partial
  -> /write-prd --delta
  -> /spec-init
  -> /prd-to-features
  -> /review-feat-plan при применимом gate
  -> /spec-design
  -> /foundation-to-tasks --verify-existing, только если baseline proof нужен
  -> /feature-to-tasks FT-<NNN>
  -> /review-tasks-plan FT-<NNN>
  -> execution
```

`/map-codebase` документирует фактическое состояние кода и отделяет facts от
inferences. Для небольшого repository достаточно direct reads одним агентом;
bounded delegation нужна только для действительно широкого discovery и когда
её разрешают текущая роль и оператор. Уже переданный authoritative delta не
запрашивается повторно. Без PRD или delta команда не создаёт roadmap epics,
product features или runnable task records.

## Task execution по tiers

| Tier | Тип работы | Manual route | Обязательный результат |
|---|---|---|---|
| `T0` | safe docs-only | `/execute-task` | compact evidence; closure только у explicit top-level owner |
| `T1` | local code или contained behavior | `/execute-task`, optional `/verify` | relevant local check или объяснение, почему runnable check не нужен |
| `T2` | API, contract, state/data/domain, cross-module | `/execute-task -> /verify` | full protocol + functional PASS; feature-level `/red-verify --feature FT-*` перед completion |
| `T3` | security, production, irreversible/data-loss, payments, compliance | `/execute-task -> /verify -> /red-verify` | functional PASS + semantic-pass + exact `HUMAN_CHECKPOINT: done` |

`touched_files` — advisory, non-exhaustive прогноз. Фактический write set
подтверждает `/execute-task` preflight. Только непустой
`runtime_context.write_boundary` является deliberate hard write boundary;
`forbidden_scope` и `stop_conditions` также остаются hard constraints.

Если выполнение обнаружило higher-tier scope, tier не меняют на месте: исходную
task возвращают в `/feature-to-tasks FT-<NNN>` для controlled rebuild/split, затем
повторяют review и применимые readiness gates.

## Ручной и автоматический режимы

- **Manual:** оператор выбирает task и явно задаёт closure ownership. T0/T1
  могут использовать fast lane с compact evidence. T2/T3 проходят полный
  protocol и обязательные tier gates.
- **`/autopilot`:** sequential scheduler для уже существующей, reviewed и
  strict-ready JSON queue. Он не создаёт PRD, features или первоначальные
  tasks.
- **`/autonomous`:** полный unattended orchestration от authoritative Product
  Brief/PRD/delta до terminal state через существующие child-skill contracts.

Scheduler владеет task transitions, failure budgets, dependent blocking и
terminal state. `/execute-task`, `/verify` и `/red-verify` возвращают evidence и
verdicts, но не закрывают scheduler-owned tasks. `/mb-sync` один раз на границе
wave согласует уже записанное authoritative state и сам не принимает closure
или promotion decisions.

No-ready fallback сохраняет уже записанный specific `HALT_*` вместе с reason,
owner и resume route. `HALT_DEPENDENCY_DEADLOCK` используется только для
dependency-only graph exhaustion; пустая queue `/autopilot` возвращает
`HALT_QUALITY_GATES`. В `/autonomous` initial review не считается repair
attempt, а для каждой review surface разрешены ровно два завершённых цикла
`repair -> re-review`; compact counter сохраняется при resume.

Каноническое выполнение последовательно. `--experimental-parallel` разрешён
только явно и требует isolated worktrees/sandboxes и pairwise-disjoint hard
`write_boundary`; `touched_files` не доказывает независимость.

## Карта runtime-skills

После полной установки target получает 29 full runtime command skills.

### Старт, контекст и discovery

- `/cold-start` — определяет greenfield или brownfield route; при отсутствующем
  skeleton возвращает внешний installer route и не зависит от `/mb-init`.
- `/mb-init` — thin router к bootstrap/sync через installer из доступного
  checkout DevRails; сам skeleton не создаёт.
- `/get-context` — загружает минимально достаточный project context.
- `/context-manifest` — поручает Explorer вернуть компактный read manifest для
  дорогого discovery, не выполняя целевой workflow.
- `/find-skills` — ищет сначала project-installed skills, затем marketplace.
- `/brainstorm` — превращает сырую идею в traceable ideation report.
- `/brief` — создаёт компактный Product Brief как PRD input contract.
- `/constitution` — фиксирует governing principles, Definition of Done,
  autonomy rules и non-negotiables.
- `/write-prd` — создаёт clarified, Constitution-checked PRD.
- `/discuss` — закрывает ограниченный набор unknowns и contradictions.
- `/map-codebase` — строит evidence-backed brownfield baseline.
- `/feature-doctor` — опционально снимает ambiguity одной feature.

### Product, SDD и task planning

- `/spec-init` — готовит pre-PRD domain/scenario/boundary framing.
- `/prd-to-features` — декомпозирует clarified PRD в product, `REQ-*`, epics и `FT-*`.
- `/review-feat-plan` — fresh-context review продуктовой декомпозиции.
- `/spec-design` — mandatory global backbone и Foundation decision.
- `/spec-auto` — unattended SDD framing/design только из authoritative
  decisions.
- `/foundation-to-tasks` — создаёт minimum `FT-000` queue или доказывает
  existing baseline.
- `/feature-to-tasks` — согласует feature-level canonical specs, implementation
  plan и JSON task cards.
- `/review-tasks-plan` — fresh-context semantic review runnable planning
  surface одной feature.

### Выполнение, проверки и обслуживание

- `/execute-task` — реализует одну indexed task в её semantic и hard boundaries.
- `/add-tests` — добавляет cheapest sufficient coverage внутри существующей
  `in_progress` task.
- `/verify` — независимо проверяет task-scoped functional outcome.
- `/red-verify` — проводит adversarial semantic verification для T3 tasks и
  T2 feature completion.
- `/mb-sync` — reconciles уже принятые durable decisions на boundary.
- `/mb-garden` — автоматически чинит только однозначные mechanical
  links/indexes/routers и после edits запускает final lint; semantic или
  destructive decisions блокирует, а broader reconciliation передаёт
  отдельному `/mb-sync`.
- `/mb-doctor` — deterministic readiness gate поверх `mb-lint`.
- `/autopilot` — выполняет готовую JSON queue до terminal state.
- `/autonomous` — оркестрирует полный PRD-to-terminal-state workflow.

## Основные артефакты target-проекта

- `.memory-bank/` — durable product, requirements, architecture/specs,
  lifecycle и task state;
- `.memory-bank/spec-backbone.md` — pre-PRD framing, global backbone status и
  design handoff;
- `.memory-bank/spec-index.md` — pure registry в формате
  `Type | Path | Status | Scope | Change route`;
- `.memory-bank/architecture/system-architecture.md#Architecture Spine` —
  compact executable `AD-*` rules для shared/strict decisions;
- `.memory-bank/{contracts,domains,states,testing,runbooks,guides,adrs}/` —
  subject-based canonical specs;
- `.memory-bank/tasks/index.json` и `TASK-*.task.json` — единственный durable
  task registry;
- `.protocols/` — resumable execution/verification state;
- `.tasks/` — substantive evidence, reports и handoff material;
- `.memory-bank/behavior-specs/` — optional JSON `given/when/then` examples,
  не являющиеся отдельным registry или quality gate.

## Установка

Запустите из checkout DevRails:

```bash
node scripts/install-framework.mjs
```

Интерактивный installer выберет target, проверит его состояние, установит
runtime-skills в `.agents/skills/` и `.claude/skills/`, затем создаст или
синхронизирует Memory Bank.

Non-interactive bootstrap:

```bash
node scripts/install-framework.mjs --bootstrap --target /path/to/project --yes
```

Install-only всех runtime-skills в текущий target:

```bash
node scripts/install-framework.mjs --skill '*' --yes
```

Этот репозиторий использует source-only packaging. Прямой
`npx skills add <repo>` для установки framework не поддерживается: wrapper
сначала создаёт временную vendored copy, а затем генерирует full runtime-skills
в target.

В source repo общие контракты живут только в `skills/_shared/`. Не редактируйте
и не коммитьте generated package-local `shared-*` files.

Подробная механика: [howItWorks.md](howItWorks.md). Mermaid-карта greenfield
пути: [GREENFIELD_WORKFLOW.md](GREENFIELD_WORKFLOW.md).
