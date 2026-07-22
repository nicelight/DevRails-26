# IDEA: Architect, `kiss-architect` и `architecture-review`

Обновлено: 2026-07-22

## 1. Решение

DevRails получает:

- роль `ROLE: ARCHITECT` для отдельной сессии с явно подключённым role contract
  или delegation от ORCHESTRATOR;
- skill `kiss-architect` для KISS/cost-value анализа в текущей роли;
- skill `architecture-review` для bounded C4 и architecture review;
- один fresh Reviewer с `architecture-review` внутри `/review-tasks-plan`.

Новая роль не выбирается автоматически. Новые lifecycle, statuses, registries
и protocols не создаются.

Canonical names:

```text
role marker: ROLE: ARCHITECT
role file: .memory-bank/roles/architect.md
skill: kiss-architect
skill: architecture-review
```

## 2. ROLE: ARCHITECT

Architect проектирует practical KISS architecture и specifications вместе с
оператором. Цель — выполнить accepted requirements с минимальной достаточной
полной ценой реализации и владения, сохранив надёжность и безопасность,
обоснованные реальными deployment risks.

Каждое текстовое сообщение начинается строкой:

```text
ROLE: ARCHITECT
```

### Proposal preflight

Перед включением architecture finding, design element или correction в ответ
оператору либо canonical artifact Architect:

1. связывает proposal с accepted outcome и practical value;
2. прорабатывает минимальный concrete implementation path для оценки
   feasibility и cost;
3. исследует consequence surface: affected boundaries, dependencies, state и
   failure transitions, recovery, security и operations;
4. учитывает fragility, coupling, regressions, новые bugs, state, lifecycle,
   testing и maintenance burden;
5. сравнивает полную цену proposal с его ценностью, cheapest sufficient
   alternative и сохранением текущего design;
6. отклоняет или упрощает proposal, если локальный fix создаёт больший общий
   cost, fragility или risk.

Research ограничен consequence surface текущего proposal и продолжается до
stable value-versus-cost assessment. Mandatory coverage активного skill при
этом сохраняется.

Correction после operator feedback проходит новый proposal preflight, а не
рассматривается как изолированный patch. Operator proposal остаётся candidate
до явного принятия mechanism и trade-off.

### Changes

Architect может менять canonical architecture и specification artifacts только
через installed skill, который владеет соответствующими artifacts. При таком
вызове полностью действует contract выбранного skill.

### Communication

Для каждого material finding или change итог сообщает accepted outcome и
value, implementation approach, total expected cost, introduced fragility и
risks, recommendation либо требуемое operator decision. Raw brainstorming,
rejected alternatives и hidden reasoning не выводятся.

## 3. Skill `kiss-architect`

`kiss-architect` применяет policy Architect в текущей сессии без смены active
role, scope, permissions или mutation authority.

Skill:

1. читает `AGENTS.md`, `.memory-bank/roles/architect.md`, текущий запрос и
   только применимые authoritative sources;
2. применяет proposal preflight к supplied и agent-generated candidates;
3. повторно исследует consequence surface каждой correction;
4. упрощает, откладывает или отклоняет proposals, не прошедшие
   value-versus-cost assessment;
5. возвращает только preflighted conclusions, material trade-offs, remaining
   risks и operator decisions;
6. передаёт canonical mutation installed owning skill.

Полный role contract в skill не копируется. Если deployed role file отсутствует,
skill запрашивает coherent framework bootstrap/sync.

Recommended description:

```yaml
description: Apply the deployed Architect proposal preflight to architecture and specification design, findings, and corrections in the current role without changing workflow authority.
```

Skill не создаёт обязательный durable artifact и не задаёт фиксированный
порядок внутреннего анализа.

## 4. Skill `architecture-review`

Существующий `skills/_shared/agents/review-architect.md` преобразуется в
runtime skill `architecture-review`; старый agent prompt удаляется.

Skill выполняет read-only review одной feature и сохраняет:

### C4 L1-L3

- L1: product/system purpose и actors;
- L2: relevant epic/subsystem boundaries и value;
- L3: target feature/module responsibilities и dependencies.

### Architecture support

- применимые `architecture/` и `guides/` либо эквивалентные contracts, states,
  runbooks, testing, invariants и spec-index routes;
- consistency между support sources;
- один canonical path на concrete concern.

### Boundaries и invariants

- ownership и source of truth;
- public boundaries и dependency direction;
- cross-component orchestration;
- explicit dependencies;
- applicable invariants и proof paths;
- отсутствие material boundary, которую пришлось бы изобретать executor-у.

### Anti-patterns

- speculative architecture без evidence;
- hidden или cyclic dependencies;
- missing applicable invariants;
- нарушение accepted orchestration placement;
- потеря required architecture proof.

Coverage points не задают обязательный порядок работы. Reviewer сам выбирает
reads, probes и depth.

Skill не требует ADR для каждого решения, не возвращает итоговый
`/review-tasks-plan` `APPROVE|REJECT`, не создаёт отдельный artifact и не
исправляет reviewed artifacts.

Результат — короткий Reviewer report:

- `verdict: APPROVE|REQUEST_CHANGES|OWNER_DECISION_NEEDED`;
- findings;
- evidence checked;
- risks или operator questions.

## 5. Интеграция с `/review-tasks-plan`

Для каждой review feature основной агент:

1. собирает достаточный task-planning context;
2. в выбранный им момент запускает одного fresh `Reviewer`;
3. передаёт FT ID, product/relevant epic, feature, plan, task records и
   обнаруженные direct architecture/spec routes;
4. Reviewer читает `reviewer.md` и installed `architecture-review`;
5. основной агент включает architecture verdict и evidence в свой report;
6. итоговый `APPROVE|REJECT` принимает `/review-tasks-plan`.

Основной агент не перечитывает полные architecture sources без необходимости.
Повторное чтение допустимо для разрешения gap, conflict или другого coverage
concern. Для `--all` используется отдельный Reviewer на feature. Если fresh
subagent недоступен или завершился ошибкой, тот же bounded review выполняется
локально.

## 6. Deployment

Canonical sources:

```text
skills/_shared/references/roles/architect.md
skills/_shared/references/commands/kiss-architect.md
skills/_shared/references/commands/architecture-review.md
```

Installer автоматически разворачивает command specs в:

```text
.agents/skills/<name>/SKILL.md
.claude/skills/<name>/SKILL.md
```

`architect.md` разворачивается в `.memory-bank/roles/` и регистрируется в
Memory Bank index. Новый package entrypoint, installer registry,
`agents/openai.yaml` и `/spec-improve` не создаются.

Generated `AGENTS.md` направляет явно назначенный `ROLE: ARCHITECT` к
`.memory-bank/roles/architect.md`; автоматически назначать или переключать роль
он не должен. Серьёзная проблема вне accepted target направляется оператору;
правило об evidenced defects остаётся общим.

## 7. Validation

- Fresh bootstrap разворачивает Architect role и оба skills.
- Codex и Claude получают одинаковые runtime contracts.
- Full sync обновляет role и skills идемпотентно.
- Deployed files не ссылаются на source-only paths.
- Старый `review-architect.md` отсутствует.
- `/review-tasks-plan` использует один Reviewer на feature и сохраняет final
  verdict ownership.
- `architecture-review` сохраняет C4 sweep.
- `kiss-architect` не меняет active role.
- Architect применяет canonical mutations через owning skill.
- Source-only `shared-*` count остаётся `0`.

## 8. Non-goals

- automatic role switching;
- mandatory Architect round-trip для обычной работы;
- новый workflow lifecycle или task status;
- новый spec-improvement command;
- дублирование Architect policy в нескольких runtime files;
- отдельный architecture-review artifact;
- фиксированный reasoning script;
- сложная eval platform.
