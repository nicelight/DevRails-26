# Как работает DevRails 26

Этот документ — подробный справочник по текущим contracts DevRails 26:
архитектуре skills, установке, Memory Bank, Product/Design boundary, JSON task
model, reviews, readiness, tier routing и автоматическим режимам. Короткая
точка входа находится в [README.md](README.md).

## 1. Mental model

DevRails превращает агентную разработку из набора chat prompts в
repository-backed workflow:

```text
product intent
  -> clarified PRD
  -> requirements / epics / features
  -> global SDD backbone + Foundation decision
  -> feature-level canonical specs + JSON tasks
  -> implementation
  -> functional and semantic verification
  -> durable lifecycle state and evidence
```

В target-проекте агенты работают не от памяти одной сессии, а от четырёх
связанных surfaces:

```text
.memory-bank/   durable product, design, task и lifecycle state
.agents/skills/ full Codex runtime command skills
.claude/skills/ full Claude runtime command skills
.protocols/     resumable task/run state
.tasks/         substantive evidence, reports и handoffs
```

Фреймворк следует KISS: создаётся минимальный набор artifacts и checks,
достаточный для текущего риска и contract. Это не разрешает пропускать
correctness, security, compatibility или обязательные verification gates.

## 2. Что изменилось в contracts skills

Core Product/Design, tasking, execution и scheduler skills теперь отделяют
обязательный workflow contract от внутренней тактики агента. Типовая структура
такого skill включает:

- `<objective>` — какой outcome принадлежит skill;
- `<input_contract>` — authoritative inputs и preconditions;
- `<hard_invariants>` — что нельзя нарушать;
- `<operator_decisions>` — какие развилки агент не решает сам;
- `<agent_discretion>` — где агент свободен выбирать тактику;
- `<required_outputs>` — durable artifacts и verdicts;
- `<validation>` — условия правдивого завершения;
- `<handoff_contract>` — единственный допустимый следующий owner/step.

### Свобода тактики

Внутри уже принятого objective, scope, specs, tier и hard boundaries агент сам
выбирает:

- порядок чтения и exploration;
- инструменты и форму временных notes;
- локальную implementation strategy;
- минимальную cohesive artifact shape;
- task slicing, когда skill владеет planning;
- самые дешёвые достаточные project-native checks;
- глубину анализа пропорционально реальному риску.

Architecture, Interfaces/Contracts, Data, Verification, security, runtime и
operations используются как coverage criteria, а не как обязательный порядок
мышления или требование создать файл каждого типа.

### Граница operator decisions

Material branch остаётся у оператора, если она может изменить product behavior,
scope/acceptance, architecture, public/component/API/event/data contract,
state/storage ownership, security/compliance, compatibility, Foundation path,
task boundary, tier, dependencies, verification policy или human checkpoint.

В interactive flow skill задаёт адаптивный вопрос и может рекомендовать
вариант. Recommendation, framework default, reversible choice и молчание не
являются принятым решением. Уже однозначное authoritative evidence не требует
декоративного интервью.

В unattended flow агент не задаёт вопрос и не выбирает за оператора. Он
записывает exact question, affected scope и owner, затем завершает run через
существующий `HALT_CLARIFICATION_REQUIRED` или `HALT_BLOCKING_QUESTIONS` с
точным interactive resume skill.

## 3. Package skills и runtime-skills

В source repo существуют два разных слоя.

### Package entrypoints

Tracked installable package entrypoints всего три:

- `skills/cold-start/SKILL.md` — package/start и external-bootstrap routing
  surface;
- `skills/mb-init/SKILL.md` — external installer router для bootstrap/sync;
- `skills/mb-garden/SKILL.md` — packaged lint/doctor/CI assets.

Они нужны для source-only упаковки и не являются вторым набором runtime
workflow contracts.

### Canonical runtime commands

Текущие 29 runtime-skills определены в:

```text
skills/_shared/references/commands/*.md
```

Installer превращает каждый command spec в полноценные target files:

```text
.agents/skills/<command>/SKILL.md
.claude/skills/<command>/SKILL.md
```

Обе runtime copies содержат одинаковый полный command contract. Target
`.memory-bank/` хранит project state и не содержит `.memory-bank/commands/` или
proxy skills.

## 4. Роли агентов

Bootstrap разворачивает role contracts в `.memory-bank/roles/` и связывает их
с `AGENTS.md`.

| Role | Назначение | Ограничение |
|---|---|---|
| `GENERAL` | самостоятельная top-level работа одним агентом | не запускает subagents без явного запроса оператора |
| `ORCHESTRATOR` | strategy, decomposition, delegation, risk control и final judgment | не выполняет executor work без явного разрешения |
| `Explorer` | bounded read-only discovery и optional `/context-manifest` routing | delegated worker, не принимает product/design decisions |
| `Implementer` | bounded implementation с preflight и evidence | останавливается при scope/spec conflict |
| `Reviewer` | independent read-only critique | не исправляет reviewed work |

Роль фиксируется при назначении и не меняется по ходу работы. Delegated worker
не становится `GENERAL` или `ORCHESTRATOR` автоматически. Lifecycle ownership
также не возникает только из факта delegation.

`/context-manifest` нужен только когда broad discovery, вероятно, обойдётся
дороже direct reads. Delegated Explorer возвращает compact ordered
`Context Read Manifest` с существующими paths, ranges, anchors и gaps, но не
source summary и не durable artifact. Caller всё равно лично читает mandatory
sources и расширяет read set по новым links/evidence. Для obvious small read
set и простой T0/T1 работы direct reads обычно дешевле.

## 5. Source-only packaging

Единственный canonical shared source находится в `skills/_shared/`:

```text
skills/_shared/agents/*
skills/_shared/references/commands/*
skills/_shared/references/workflows/*
skills/_shared/references/protocols/*
skills/_shared/references/roles/*
skills/_shared/references/structure-template.md
skills/_shared/scripts/init-mb.js
```

Package-local files вида
`skills/<skill>/{agents,references,scripts}/shared-*` намеренно не хранятся в
git. Нормальная установка выполняет:

```text
source-only repo
  -> temporary repository copy
  -> scripts/vendor-shared.mjs
  -> temporary package-local shared-* assets
  -> full runtime commands in target .agents/.claude
  -> optional Memory Bank bootstrap/sync
  -> temporary copy cleanup
```

Поэтому прямой `npx skills add <repo>` для framework не поддерживается. Он не
выполняет обязательную temporary vendoring/generation цепочку.

Правила изменения source repo:

- shared behavior меняется только в `skills/_shared/`;
- generated package-local `shared-*` нельзя редактировать или коммитить;
- локальные `.memory-bank/`, `.agents/`, `.claude/`, `.protocols/` и `.tasks/`
  в source repo являются ignored dogfood/runtime output, не canonical source.

## 6. Установка и bootstrap

### Интерактивный путь

Из checkout DevRails:

```bash
node scripts/install-framework.mjs
```

Installer:

1. предлагает выбрать или создать target directory;
2. проверяет writable state, git status, `.memory-bank/` и `AGENTS.md`;
3. показывает warnings и запрашивает confirmation;
4. при существующем `AGENTS.md` предлагает replace или merge policy;
5. готовит временную vendored copy source repo;
6. генерирует все runtime command skills в `.agents/skills/` и
   `.claude/skills/`;
7. создаёт fresh Memory Bank или выполняет sync существующей установки;
8. удаляет temporary repo.

### Non-interactive bootstrap

```bash
node scripts/install-framework.mjs --bootstrap --target /path/to/project --yes
```

Существующий Memory Bank автоматически переводит flow в sync. Явный вариант:

```bash
node scripts/install-framework.mjs --bootstrap --target /path/to/project --yes --sync
```

`--force` сейчас эквивалентен `--sync`.

### Install-only

Все runtime-skills в текущий target без Memory Bank bootstrap:

```bash
node scripts/install-framework.mjs --skill '*' --yes
```

Один выбранный runtime-skill:

```bash
node scripts/install-framework.mjs --skill verify --yes
```

Для inspection временно подготовленной package copy:

```bash
DEVRAILS_KEEP_INSTALL_TMP=1 node scripts/install-framework.mjs --skill '*' --yes
```

После install-only, если `.memory-bank/` отсутствует, `/cold-start` и
`/mb-init` не создают skeleton локально. Они возвращают точную external command
через доступный checkout DevRails:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --target <target-repo> --yes
```

Для explicit sync добавляется `--sync`. Неизвестный checkout path является
честным blocker; после успешного bootstrap исходную команду запускают повторно.

## 7. Fresh bootstrap state

Fresh bootstrap создаёт skeleton, но не roadmap. Основные artifacts:

```text
.memory-bank/
  adrs/
  agents/
  architecture/system-architecture.md
  archive/
  behavior-specs/
  bugs/
  constitution.md
  contracts/boundary-map.md
  domains/
  epics/
  features/
  glossary.md
  guides/
  invariants.md
  mbb/index.md
  product.md
  quality/
  requirements.md
  roles/{general,orchestrator,worker}.md
  runbooks/
  schemas/task.schema.json
  skills/index.md
  spec-backbone.md
  spec-index.md
  states/
  tasks/index.json
  tasks/plans/
  testing/index.md
  testing/strategy.md
  workflows/{index,autonomy-policy,execute-loop,mb-sync,tier-policy}.md
  changelog.md
.protocols/
.tasks/
.agents/skills/<command>/SKILL.md
.claude/skills/<command>/SKILL.md
scripts/mb-lint.mjs
scripts/mb-doctor.mjs
AGENTS.md
CLAUDE.md
GEMINI.md
```

Fresh `.memory-bank/tasks/index.json` содержит только:

```json
{
  "version": 1,
  "tasks": []
}
```

Bootstrap не создаёт `.memory-bank/foundation.md`, `REQ-000`, `FT-000`,
product features, implementation plans или runnable `TASK-*.task.json`.
`.memory-bank/tech-specs/` также не создаётся.

В fresh target `testing/index.md` является router, а зарегистрированный
`testing/strategy.md` задаёт компактную baseline risk-based policy. Sync
legacy target не seed-ит новый `testing/strategy.md` и не переписывает
существующую testing policy/spec registry без явного project-level решения.

## 8. Канонический Product/Design flow

### Greenfield

```text
raw idea -> /brainstorm -> /brief
clear concept ---------> /brief
existing PRD ----------> /write-prd

/brief
  -> /constitution when principles are not ratified|partial
  -> /write-prd
  -> /spec-init
  -> /prd
  -> /review-feat-plan when high-risk|large|autonomous
  -> /spec-design
  -> Foundation route
  -> feature tasking route
```

Stages do not own each other's outputs:

1. `/brainstorm` explores directions but does not promote ideas to
   requirements.
2. `/brief` owns only the concise Product Brief and analysis index.
3. `/constitution` owns governing principles, Definition of Done, autonomy,
   checkpoints и non-negotiables. An explicit skip may continue as
   `framework-default|skipped`; silence is not a skip.
4. `/write-prd` owns product-level clarification. Handoff requires
   `type: prd`, `clarification_status: complete` и
   `constitution_checked: true`.
5. `/spec-init` owns decomposition-safety framing, not architecture. It writes
   `Pre-PRD Spec Status: ready_for_prd|blocked` in `spec-backbone.md`.
6. `/prd` owns L1-L3 product decomposition: product, stable `REQ-*`, epics и
   product `FT-*`. It does not create task records or testing policy.
7. `/review-feat-plan` independently checks PRD -> REQ -> EP -> FT. It is
   required for high-risk, large и autonomous work and recommended for small
   manual work.
8. `/spec-design` is mandatory for every feature set and owns the global SDD
   backbone plus Foundation Dev Path decision.

### Brownfield

```text
/map-codebase
  -> reuse supplied authoritative PRD/delta, иначе запросить его и остановиться
  -> /constitution if needed
  -> /write-prd --delta
  -> /spec-init
  -> /prd
  -> applicable /review-feat-plan
  -> /spec-design
```

`/map-codebase` creates an as-is baseline from code/config/tests, separates
facts from inferences and does not generate roadmap entities without PRD/delta.
Малый repository можно исследовать direct reads одним агентом. Для широкого
discovery допустимы `/context-manifest` или bounded delegation, только если это
дешевле direct reads и разрешено ролью/оператором. Уже переданный delta не
переспрашивается.

When existing executable baseline sufficiency is not proved,
`/foundation-to-tasks --verify-existing` can create only the minimum probe
queue. A credibly proven baseline produces no `FT-000` queue.

### Product/Design boundary

Product task handoff разрешён только когда весь durable bundle согласован:

- clarified, Constitution-checked `.memory-bank/prd.md`;
- product, requirements, epics и product features;
- `Global Backbone Status: complete` или valid `minimal`;
- pure canonical `.memory-bank/spec-index.md`;
- explicit Foundation Dev Path decision;
- все material operator decisions записаны в существующих owning artifacts;
- required Foundation final gate закрыт.

`blocked` status или unanswered material branch запрещает task generation.

## 9. SDD backbone и canonical specs

### `spec-backbone.md`

`/spec-init` сначала использует файл как pre-PRD route/state map. После `/prd`
`/spec-design` добавляет parseable global contract:

```text
Global Backbone Status: complete | minimal | blocked
Mode: local_simple_backbone | standard_architecture_scaffold |
      strict_architecture_scaffold | pending
Architecture artifact strategy: single-file | split-core-docs |
                                split-by-boundary-topic | pending
```

Backbone Area Matrix использует только:

- `authoritative`;
- `needed_before_tasks`;
- `not_applicable` с rationale;
- `blocked`.

`needed_before_tasks` допустим только для уже однозначно routed concrete detail.
Он не заменяет нерешённое design decision и должен быть закрыт до успешного
product task handoff.

`minimal` допустим только для доказанно local/simple pressure и требует
явных `not_applicable - <rationale>` entries. Shared boundary, contracts,
state/data, runtime, security, production-sensitive или irreversible pressure
обычно требует `complete` scaffold.

### `spec-index.md`

Это pure registry:

```text
Type | Path | Status | Scope | Change route
```

Он не хранит decision bodies, matrices, feature status map, ownership или
reverse `used_by`. Canonical identity определяется зарегистрированным
subject-based path. Перед созданием нового spec skills обязаны найти соседние и
registered specs; два competing paths нельзя обходить созданием третьего.

### Subject-based paths

Новые canonical specs живут по предмету, а не по feature ID:

```text
.memory-bank/architecture/*
.memory-bank/contracts/*
.memory-bank/domains/*
.memory-bank/states/*
.memory-bank/testing/*
.memory-bank/runbooks/*
.memory-bank/guides/*
.memory-bank/adrs/*
```

Feature остаётся composition root для behavior, acceptance criteria и exact
applicable spec links. Legacy `.memory-bank/tech-specs/FT-*.md` можно читать как
brownfield evidence, но нельзя расширять как default T2/T3 hub.

### Architecture Spine

Shared/strict executable decisions получают стабильные `AD-*` anchors внутри
`.memory-bank/architecture/system-architecture.md#Architecture Spine`:

```text
AD-NNN
  Binds
  Prevents
  Rule
  Verification
  Source
```

AD создаётся только для реального shared/strict rule. Detailed rationale
выносится в ADR, только если оно имеет durable value. Локальная простая работа
не требует обязательных ADR или отдельного architecture workflow.

### Contracts, Data и Verification

- Data Contract описывает payload, пересекающий component/API/event/protocol
  boundary.
- Data Specification описывает internal models, DB/storage, persistence,
  migrations, validation и serialization.
- Verification concern маршрутизируется в owning contract, testing spec или
  runbook, а не превращается в обязательный global testing row.
- Bootstrap-owned testing policy read-only для `/spec-design`; project-specific
  design расширяется только через свой owning route.

### Optional behavior specs

`/prd-to-tasks` может создать 0-3 коротких JSON examples:

```text
.memory-bank/behavior-specs/FT-NNN-BHV-NNN-<slug>.behavior.json
```

Они используют только `id`, `feature_id`, `title`, `given`, `when`, `then`.
Feature ссылается на них в `## Behavior specs`, task — только через
`source_artifacts`. Это не registry, schema, test runner, readiness gate,
verification target или done criterion.

## 10. Foundation Dev Path

`/spec-design` фиксирует одно из трёх состояний:

- `Foundation Required: true` — до product tasks нужен executable walking
  skeleton или compatibility proof;
- `Foundation Required: false` — existing baseline/project simplicity уже
  доказаны;
- blocked Foundation decision — material branch возвращается оператору.

При `true` `/foundation-to-tasks`:

1. выбирает минимальный walking skeleton и proof path;
2. создаёт только нужные substrate-level canonical specs;
3. добавляет reserved `REQ-000`;
4. создаёт pseudo-feature `FT-000`;
5. создаёт normal schema-backed foundation task records;
6. создаёт ровно один final Foundation Gate task, зависящий от всех required
   implementation/probe tasks;
7. записывает concrete gate ID в `.memory-bank/foundation.md`.

Foundation использует обычные JSON tasks, lifecycle, tiers и protocols. Для неё
нет отдельной schema, registry или status machine. `W0` разрешён только для
`FT-000`; product tasks используют `W1+` и зависят от final gate напрямую или
transitively.

Перед выполнением FT-000 queue обязателен `/mb-doctor --strict`. Product
tasking продолжается только после `done` final gate. `FT-000` не участвует в
T2 product feature-completion semantics.

## 11. Feature design и JSON task planning

После ready global backbone и Foundation route:

```text
/prd-to-tasks FT-<NNN>
  -> /review-tasks-plan FT-<NNN>
  -> conditional /mb-doctor
  -> /execute <TASK_ID> или /autopilot
```

`/clarify-feature FT-<NNN>` используется только для реальной feature-level
ambiguity. Он может обновить feature wording и отметить design impact, но не
создаёт specs, implementation plan, tiers или tasks.

`/prd-to-tasks` для каждого applicable concern выбирает ровно один результат:

```text
reuse | extend | create | not_applicable | block
```

Затем он создаёт или reconciles:

- `.protocols/FT-<NNN>/plan.md` и `decision-log.md`;
- `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`;
- subject-based canonical specs и feature links;
- optional behavior examples;
- indexed `.memory-bank/tasks/TASK-*.task.json` records.

Task slicing строится вокруг cohesive independently verifiable outcomes, а не
вокруг файлов, слоёв, modules или отдельной «task на tests».

### JSON-only registry

Единственный durable task model:

```text
.memory-bank/tasks/index.json
.memory-bank/tasks/TASK-NNN-TN-FT-NNN-WN.task.json
.memory-bank/schemas/task.schema.json
```

Concrete ID segments обязаны совпадать с record fields `tier`, `feature` и
`wave`. Lifecycle фиксирован:

```text
planned | ready | in_progress | blocked | done | failed
```

`ready` допустим только при закрытых dependencies и отсутствии blocker.
`planned` остаётся корректным для future waves или unmet dependencies. Legacy
`risk`/`risk.level` не используются; routing идёт только по `task.tier`.

Schema-valid пример:

```json
{
  "id": "TASK-001-T2-FT-001-W1",
  "title": "Implement the accepted boundary behavior",
  "status": "ready",
  "wave": "W1",
  "feature": "FT-001",
  "reqs": ["REQ-001"],
  "depends_on": [],
  "touched_files": ["src/component/", "tests/component/"],
  "tier": "T2",
  "gates": [
    {
      "name": "component tests",
      "command": "npm test -- component",
      "required": true
    }
  ],
  "verify": [],
  "docs": [],
  "evidence_required": [],
  "purpose": "Apply the accepted component boundary contract.",
  "success_outcome": "The boundary behavior is observable and verified.",
  "anti_goals": [],
  "runtime_context": {
    "write_boundary": ["src/component/", "tests/component/"],
    "forbidden_scope": ["deploy/"],
    "stop_conditions": ["A public contract change becomes necessary."]
  },
  "source_artifacts": [
    ".memory-bank/contracts/component-boundary.md"
  ],
  "normative_inputs": [],
  "constraints": [],
  "invariants": [],
  "verification_targets": [
    "The accepted request and error shapes pass contract tests."
  ]
}
```

### Single-card handoff для T2/T3

До execution T2/T3 record обязан содержать:

- non-empty `purpose`;
- scalar `success_outcome`;
- concrete `REQ-*` и `FT-*` linkage;
- direct task-relevant canonical SDD path;
- expected change surface в advisory `touched_files` и/или обоснованный hard
  `runtime_context.write_boundary`;
- real gate command и/или non-empty verification target;
- valid dependency graph.

Feature links или `spec-index.md` сами по себе не заменяют direct task context.
Linked concrete spec должен задавать shape, `MUST`/`MUST NOT`, edge
cases/errors и verification target, применимые именно к task.

`touched_files` не является write allow-list. Исполнитель подтверждает actual
files на preflight и может добавить файл для того же outcome/spec/tier.
Непустой `write_boundary`, `forbidden_scope` и `stop_conditions` являются hard.
`allowed_write_scope` поддерживается только как deprecated read alias и не
эмитится в новых cards.

### Reconciliation

Повторный `/prd-to-tasks` по умолчанию согласует existing specs, plan и cards,
сохраняя task identity, tier, wave, dependencies, lifecycle и verification
evidence. Изменение identity, tier, dependency, AC или material scope требует
явного `rebuild_required`, а не скрытого repair.

## 12. Review, lint, doctor и verification ownership

Эти gates не взаимозаменяемы:

| Gate | Проверяет | Не делает |
|---|---|---|
| `/review-feat-plan` | PRD -> REQ -> EP -> FT traceability и boundaries | не ревьюит JSON task queue |
| `/review-tasks-plan` | schema/coverage/slicing/design/execution readiness одной feature | не исправляет planning surface и не меняет lifecycle |
| `mb-lint` | structural/mechanical Memory Bank consistency | не принимает semantic decisions |
| `/mb-doctor` | deterministic executable-readiness поверх lint | не заменяет reviews или verification |
| `/verify` | task-scoped functional outcome и evidence | не проверяет всю feature, не чинит implementation/specs |
| `/red-verify` | adversarial semantic correctness | не заменяет functional PASS и не закрывает scheduler task |

Оба review skills требуют fresh context или отдельную fresh session и возвращают
findings, а не silently repair. `/review-tasks-plan --all` всё равно создаёт
отдельный bounded verdict для каждой product feature.

### Doctor modes

```bash
node scripts/mb-doctor.mjs
node scripts/mb-doctor.mjs --strict
node scripts/mb-doctor.mjs --json
node scripts/mb-doctor.mjs --strict --json
```

- Default mode — human health report. Fresh skeleton с empty task index valid;
  `TASK_INDEX_EMPTY` является info.
- Strict mode — non-empty executable queue readiness gate. Empty queue — error.
- JSON mode сохраняет machine-readable `status`, `summary`, `findings`.

Strict doctor обязателен:

- после `/foundation-to-tasks` перед FT-000 execution;
- перед `/autopilot` и scheduler phase `/autonomous`;
- перед scheduler task selection;
- после wave-boundary `/mb-sync` перед promotion;
- перед final scheduler success.

В manual flow doctor conditional: T3, complex T2, Foundation, dependency,
stale-doc, risky-link или autonomous handoff. Простая local T0/T1 работа не
получает mandatory doctor gate по умолчанию.

Doctor механически проверяет наличие single-card evidence, но не решает,
действительно ли spec применим и достаточен. Это semantic ownership
`/review-tasks-plan`.

`/mb-garden` начинает с read-only scan и classification. Он автоматически
меняет только однозначные mechanical links, indexes и routers в заранее
названных transient paths; список можно расширить, назвав path до его edit.
После фактических edits обязателен final `mb-lint`. Semantic, destructive и
canonical choices возвращаются owner/operator. Cosmetic cleanup не запускает
`/mb-sync`; broader reconciliation уже принятого durable decision получает
отдельный handoff существующему `/mb-sync`.

## 13. Execution protocols и lifecycle ownership

### Protocol depth

T0/T1 могут использовать compact:

```text
.protocols/<TASK_ID>/run.md
```

T2/T3 требуют full protocol:

```text
.protocols/<TASK_ID>/context.md
.protocols/<TASK_ID>/plan.md
.protocols/<TASK_ID>/progress.md
.protocols/<TASK_ID>/verification.md
.protocols/<TASK_ID>/handoff.md
```

T3 дополнительно использует `red-verification.md`. Substantive logs, reports и
artifacts записываются в `.tasks/<TASK_ID>/`.

`/add-tests` работает только внутри существующей indexed task со статусом
`in_progress`. Он выбирает narrowest credible test level, не создаёт synthetic
testing task и не меняет `.memory-bank/testing/`.

### Receipt-aware reuse между `/execute` и `/verify`

`/execute` может предложить результат хорошо известного local deterministic
gate как optional `reuse candidate`. Receipt остаётся self-attestation
исполнителя: он сообщает attempt/status, claim, command/cwd/exit code, declared
pre-command input state, completed time и redacted observable evidence, но не
доказывает независимо, что snapshot и command выполнялись именно в заявленном
порядке.

Reuse разрешён только при консервативно ограниченном command read surface и
совпадении current relevant source/config/dependency/generated/runtime state.
Implicit, broad, incomplete, flaky, external-state-dependent, input-mutating
или stale evidence не переиспользуется. Отсутствующий или непригодный receipt
ведёт к safe rerun или replacement probe; это не `NEEDS-CLARIFICATION`, пока
обязательные implementation и normative inputs доступны.

Receipt хранится в существующем task protocol и не создаёт task field,
registry, cache, status или отдельную artifact family. Current handoff указывает
актуальный receipt; evidence прежней retry attempt становится superseded или
supporting-only. `/add-tests` сам reusable receipt не создаёт: после всех
изменений candidate может оформить только финальный gate `/execute`.

Перед новыми mutating probes `/verify` оценивает все candidates относительно
одного current state. Receipt может избавить от identical gate rerun, но не
считается independent observation:

- T0/T1 сохраняют существующий compact/manual fast lane и scheduler rules;
- T2 требует минимум один новый verifier-owned outcome probe и независимое
  обоснование каждого обязательного task-scoped outcome, AC/REQ, gate,
  verification target и применимого spec claim; ни один required claim не
  закрывается только receipt;
- T3 требует новое functional evidence для каждого independently harm-driving
  claim, после чего остаются обычные per-task `/red-verify` и human checkpoint.

Verification report отдельно показывает `reused execute evidence`, `repeated
checks` и `new targeted probes`. Оптимизируется повтор команд, а не ownership
или полнота functional verification.

### Manual mode

Manual mode означает явный top-level owner, а не ручное написание кода.

- T0/T1 `/execute` может закрыть task только если current agent — explicit
  manual top-level closure owner, scope остался local, не возник T2/T3 trigger,
  hard boundaries соблюдены и compact PASS evidence записан в protocol и
  task `verify`.
- Если ownership отсутствует, `/execute` или `/verify` оставляет status без
  изменения и передаёт closure recommendation owner/scheduler.
- T2 closure требует full protocol, applicable task/spec gates, `/verify PASS`
  и explicit owner, который записывает lifecycle decision. Per-task
  `/red-verify` optional.
- T2 product feature completion отдельно требует
  `/red-verify --feature FT-<ID>` и exact
  `SEMANTIC_VERDICT: semantic-pass` в feature doc.
- T3 closure требует `/verify PASS`, per-task semantic-pass, exact standalone
  `HUMAN_CHECKPOINT: done` и explicit owner.

Не смешивайте manual и scheduler ownership внутри одного task run.

### Scheduler mode

`/autopilot` и `/autonomous` владеют:

- `planned -> ready` promotion;
- `ready -> in_progress`;
- final `done|failed|blocked` decision;
- dependent blocking/unblocking;
- retry/failure budgets;
- terminal run state.

`/execute` реализует, `/verify` возвращает functional verdict,
`/red-verify` — semantic verdict. В scheduler mode эти child skills не меняют
final lifecycle. Scheduler записывает status, closure/failure/blocking decision
и evidence links в authoritative `.task.json` сразу после task и до следующего
sync boundary.

### `/mb-sync`

`/mb-sync` — thin reconciliation adapter. Он согласует уже принятые решения с
RTM, feature/epic lifecycle, spec links, indexes, routers и changelog, но не
делает closure, failure, blocking или promotion inference.

Full sync выполняется один раз в конце wave. Early sync допустим только если
current wave реально зависит от reconciled RTM/index/spec/contract/changelog
state или owner явно его запросил. Local manual T0/T1 closure без broader
durable changes full sync не требует.

### Failure handling

Scheduler может безопасно retry ту же task только в пределах budget и
неизменных identity, outcome, scope, tier, dependencies, specs и hard
boundaries. Unsafe/non-idempotent side effect нельзя повторять.

Если retry невозможен или budget исчерпан:

- task получает `failed` и functional/semantic evidence;
- создаётся bug note или normal schema-backed follow-up через planning owner;
- direct dependents `failed|blocked` task блокируются до следующего promotion;
- clarification/semantic concern становится `blocked`, а не automatic failure.

## 14. Tier policy

| Tier | Scope | Protocol | Manual completion | Scheduler completion |
|---|---|---|---|---|
| `T0` | typo, formatting, links, safe docs-only | compact | `/execute` fast lane или optional `/verify` у explicit owner | ordered `/verify`; compact evidence may be enough |
| `T1` | local function/component/test, low blast radius | compact | local check + explicit-owner closure; `/verify` optional | ordered `/verify`; compact functional evidence may be enough |
| `T2` | API, contracts, events, state/data/domain, migration, cross-module | full | `/verify PASS` + applicable gates + explicit owner | scheduler task done after functional PASS; feature complete only after feature semantic-pass |
| `T3` | auth, security, secrets, production/deploy, irreversible/data-loss, payments, compliance | full | functional PASS + task semantic-pass + human checkpoint + explicit owner | те же gates до scheduler `done` |

Если evidenced scope однозначно триггерит несколько tiers, применяется самый
высокий triggered tier. Если сам scope или требуемый tier неоднозначен, это
operator decision: interactive planning спрашивает, unattended planning
останавливается. «На всякий случай взять выше» не заменяет решение.

Tier входит в task ID, поэтому его нельзя изменить in-place. Higher-tier
discovery возвращает исходную task в `/prd-to-tasks FT-<NNN>` для controlled
rebuild/split, затем повторяются `/review-tasks-plan`, applicable doctor и
`/execute` replacement ID.

## 15. Автоматические режимы

### `/autopilot`

Используется только для уже подготовленной queue. Preconditions:

- non-empty, schema-valid JSON registry;
- valid Global Backbone и Foundation anchors/dependencies;
- latest `/review-tasks-plan FT-<NNN>` `APPROVE` для каждой task-linked product
  feature;
- complete T2/T3 single-card handoffs;
- no unresolved operator decision;
- `/mb-doctor --strict` PASS.

Пустой task index нарушает non-empty queue contract и возвращает
`HALT_QUALITY_GATES`, после чего нужен reviewed non-empty queue и повторный
strict readiness gate.

Canonical scheduler loop:

```text
refresh JSON state
  -> promotion pass
  -> select one ready task by wave/index order
  -> strict doctor precondition
  -> ready -> in_progress
  -> /execute
  -> /verify
  -> per-task /red-verify for T3
  -> scheduler lifecycle/evidence write
  -> T2 feature semantic gate when its last task closes
  -> next task in wave
  -> wave-boundary /mb-sync
  -> lint + strict doctor
  -> conditional task-plan re-review if planning surface changed
  -> next promotion pass
```

Status/evidence-only closure не вызывает повторный `/review-tasks-plan`.
Re-review нужен, если изменились task cards, specs, dependencies, tier, scope
или plan assumptions.

### `/autonomous`

Это полный unattended orchestration:

```text
authoritative Product Brief / PRD / delta
  -> pre-queue lint + default doctor
  -> Constitution decision check
  -> /write-prd
  -> /spec-auto --init
  -> /prd
  -> /review-feat-plan
  -> /spec-design --all
  -> Foundation queue and gate when required
  -> /spec-auto --all
  -> /prd-to-tasks --all
  -> per-feature /review-tasks-plan
  -> lint + strict doctor
  -> sequential scheduler loop
  -> terminal state
```

`/autonomous` orchestrates child contracts, но не переписывает их внутреннюю
тактику. Он не проводит unattended Constitution interview и не принимает
missing operator decisions.

Для `feature-plan` и каждой реально reviewed `task-plan:FT-<NNN>` surface
допускаются ровно два завершённых цикла `repair -> re-review`. Initial review
начинается с counter `0` и не считается попыткой; counter увеличивается после
re-review и сохраняется в existing run status при resume. `REJECT` после
второго цикла приводит к existing `HALT_REVIEW_REJECT`.

Allowed terminal states:

```text
SUCCESS
HALT_BLOCKING_QUESTIONS
HALT_CLARIFICATION_REQUIRED
HALT_REVIEW_REJECT
HALT_FAILURE_BUDGET
HALT_DEPENDENCY_DEADLOCK
HALT_POLICY_VIOLATION
HALT_QUALITY_GATES
HALT_BUDGET_EXCEEDED
```

No-ready fallback не заменяет уже записанный specific `HALT_*`, его reason,
owner и resume route. `HALT_DEPENDENCY_DEADLOCK` допустим только когда каждый
unfinished record non-runnable исключительно из-за незакрытых task
dependencies.

### Experimental parallel

Canonical execution sequential. `--experimental-parallel` требует:

- explicit opt-in;
- isolated worktrees/sandboxes;
- pairwise-disjoint non-empty hard `runtime_context.write_boundary`;
- отсутствие T3, shared/governing files, package manifests, lockfiles, CI и
  global config в parallel set.

`touched_files` не доказывает независимость. Если isolation/non-overlap нельзя
доказать, scheduler делает sequential fallback без ошибки.

## 16. Reference всех runtime-skills

### Entry, context и discovery

| Command | Owns | Не владеет / handoff |
|---|---|---|
| `/cold-start` | scenario detection и next route | без skeleton возвращает external installer route, не вызывает `/mb-init`; после bootstrap запускается повторно |
| `/mb-init` | external installer route для Memory Bank bootstrap/sync | сам не создаёт skeleton; затем повторный `/mb-init` и `/cold-start` |
| `/mb` | минимально достаточный context priming | не реализует task; может записать plan неизвестных |
| `/context-manifest` | optional delegated Explorer routing в компактный read manifest | не пересказывает sources, не выполняет target workflow и не становится gate/scope boundary; caller читает sources лично |
| `/find-skills` | project-first skill discovery | не устанавливает marketplace skill без confirmation |
| `/brainstorm` | traceable ideation report | не создаёт requirements/PRD; затем `/brief` |
| `/brief` | concise Product Brief | не создаёт features/tasks; затем `/constitution` или `/write-prd` |
| `/constitution` | governing principles, DoD, autonomy, checkpoints | не заменяет PRD/specs; затем `/write-prd` |
| `/write-prd` | clarified Constitution-checked PRD | не декомпозирует; затем `/spec-init` |
| `/discuss` | bounded accepted decisions в owning artifacts/protocol | не обходит owning skill gate |
| `/map-codebase` | evidence-backed as-is baseline | не создаёт roadmap без delta; затем PRD route |
| `/clarify-feature` | ambiguity одной feature и design-impact routing | не создаёт specs/tasks; затем owning repair или tasking |

### Product, SDD и tasking

| Command | Owns | Не владеет / handoff |
|---|---|---|
| `/spec-init` | pre-PRD decomposition framing | не создаёт architecture/Foundation; затем `/prd` |
| `/prd` | product, REQ, epics, product features | не создаёт tasks/testing policy; затем review/design |
| `/review-feat-plan` | fresh-context `APPROVE|REJECT` PRD decomposition review | не исправляет product docs; затем `/spec-design` или repair |
| `/spec-design` | mandatory global backbone и Foundation decision | не создаёт tasks/plans; затем Foundation или feature design |
| `/spec-auto` | unattended `--init`, `FT-*` или `--all` SDD from authoritative decisions | не спрашивает и не выбирает missing decision |
| `/foundation-to-tasks` | minimum FT-000 queue или proven-baseline no-op | не реализует product features; затем strict doctor или product tasking |
| `/prd-to-tasks` | feature canonical coverage, IMPL plan, behavior examples и JSON tasks | не выполняет tasks; затем `/review-tasks-plan` |
| `/review-tasks-plan` | fresh-context `APPROVE|REJECT` runnable planning review | не чинит specs/cards/status; затем doctor/execution или repair |

### Execution, verification, maintenance и automation

| Command | Owns | Не владеет / handoff |
|---|---|---|
| `/execute` | implementation одной indexed task и tier-routed evidence | не закрывает scheduler task и не запускает child verification |
| `/add-tests` | cheapest sufficient tests внутри current `in_progress` task | не создаёт testing lifecycle или `.memory-bank/testing/` policy |
| `/verify` | task-scoped functional `PASS|FAIL|NEEDS-CLARIFICATION` | не исправляет implementation/spec и не создаёт follow-up task |
| `/red-verify` | independent hostile model и semantic verdict | не заменяет functional PASS и не меняет scheduler lifecycle |
| `/mb-sync` | reconciliation already-decided durable state | не принимает closure/promotion/design decisions |
| `/mb-garden` | mechanical links/indexes/routers maintenance и final lint | semantic/destructive decisions блокирует; broader reconcile передаёт `/mb-sync` |
| `/mb-doctor` | deterministic readiness report | не заменяет semantic review или verification |
| `/autopilot` | existing queue scheduler и terminal state | не создаёт PRD/features/initial queue |
| `/autonomous` | full Product/Design-to-terminal-state orchestration | не принимает unresolved operator decisions |

## 17. Проверки

### Source repo

```bash
npm run check:syntax --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
node scripts/install-framework.mjs --skill '*' --yes
tmpdir="$(mktemp -d)"; node scripts/install-framework.mjs --bootstrap --target "$tmpdir" --yes
```

Source-only count должен быть `0`.

### Target repo

```bash
node scripts/mb-lint.mjs
node scripts/mb-doctor.mjs
```

Strict только после появления executable queue или на явно требуемом
readiness boundary:

```bash
node scripts/mb-doctor.mjs --strict
```

## License

MIT
