# Plan: remove persisted Execution Packets

## Статус

Реализовано: framework переведён на single-card task handoff, persisted packet
family и `/mb-packet` удалены, downstream contracts и проверки согласованы.

## Flow до рефакторинга

Для product feature `/prd-to-tasks`, а для Foundation Dev Path
`/foundation-to-tasks` создают два связанных файла:

```text
task planning/design
  -> .memory-bank/tasks/<TASK_ID>.task.json
  -> .memory-bank/packets/<TASK_ID>.packet.json
  -> /review-tasks-plan проверяет task, specs и packet readiness
  -> /mb-doctor проверяет packet path/status/hash/freshness
  -> /execute читает task + required packet + direct specs
  -> /verify и /red-verify используют task/spec/evidence и packet context
  -> после task/spec changes packet обновляется через /prd-to-tasks или /mb-packet
```

Task card остаётся source of truth, а packet является derivative snapshot. Для
T2/T3 packet обязателен; для T0/T1 он требуется только при
`runtime_context.packet_required: true`.

## Flow после рефакторинга

Planning и execution context находятся в одной authoritative task card:

```text
task planning/design
  -> .memory-bank/tasks/<TASK_ID>.task.json
  -> /review-tasks-plan проверяет single-card handoff contract и linked specs
  -> /mb-doctor проверяет structural schema/dependency/tier/protocol readiness
  -> /execute читает task + task-linked authoritative specs
  -> /verify и /red-verify используют task-scoped basis и evidence
  -> /mb-sync согласует durable state на обычной workflow boundary
```

Отдельного `.memory-bank/packets/<TASK_ID>.packet.json`, packet hash/status,
freshness gate и `/mb-packet` больше нет. Изменение task/spec context сразу
отражается в единственном authoritative task flow и не требует refresh второго
файла.

## Цель

Упростить DevRails до одной authoritative task model:

```text
.memory-bank/tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>.task.json
```

Task card должна содержать весь task-scoped planning, execution и verification
context. Отдельные persisted Execution Packets под `.memory-bank/packets/` и
skill `/mb-packet` удаляются.

Не следует переносить packet как вложенный дублирующий объект внутрь task card.
Нужно сохранить только полезные данные в существующих task fields и удалить
сам packet lifecycle.

## Почему меняем подход

Task card уже является source of truth и содержит почти весь полезный packet
context:

- `purpose`, `success_outcome`, `anti_goals`;
- `source_artifacts` и `normative_inputs`;
- `constraints`, `invariants`, `verification_targets`;
- gates и evidence requirements;
- `runtime_context.write_boundary`;
- `runtime_context.forbidden_scope`;
- `runtime_context.stop_conditions`.

Execution Packet повторяет эти данные, но не может переопределять task card или
linked specs. `/execute` и `/verify` всё равно должны читать authoritative task
и применимые SDD specs. В результате отдельный packet добавляет:

- второй файл на каждую T2/T3 task;
- hash/freshness/status machinery;
- дополнительные readiness и repair branches;
- риск drift между task, specs и packet;
- дополнительный контекст и стоимость сопровождения.

Удаление packet layer не зависит от будущего перехода на subject-based SDD
specs. Уже текущая task card и feature links маршрутизируют authoritative specs;
subject-based модель позже сделает эти links точнее, но не является prerequisite
этого рефакторинга.

## Целевая модель

Для каждой задачи существует одна indexed task card:

```text
.memory-bank/tasks/index.json
.memory-bank/tasks/<TASK_ID>.task.json
```

Task card остаётся authoritative для:

- identity, feature, wave, tier и dependencies;
- lifecycle status;
- independently verifiable outcome;
- touched files и execution scope;
- task-linked authoritative spec links under the active SDD model;
- constraints и invariants;
- gates, verification targets и evidence;
- stop conditions и handoff context.

Удаляются:

- `.memory-bank/packets/` как persisted artifact family;
- `runtime_context.packet_required`;
- `runtime_context.packet_ref`;
- `source_task_hash` и packet freshness checks;
- packet statuses `ready|ready_with_gaps|blocked|stale`;
- packet template;
- `/mb-packet` command и runtime skill.

Если в будущем внешний scheduler потребует отдельный transport envelope, он
может формироваться transient/in-memory из task card. Такой envelope не должен
становиться вторым durable source of truth.

## T2/T3 single-card handoff completeness contract

Это не новый lifecycle status, не отдельный artifact, не вложенный packet и не
новый общий readiness layer. Контракт определяет только минимальную полноту
одной T2/T3 task card перед handoff в execution.

Детерминированно проверяется:

- task card schema-valid и присутствует в `.memory-bank/tasks/index.json`;
- ID segments соответствуют `tier`, `feature` и `wave`;
- `reqs` содержит конкретные существующие `REQ-*` без placeholders;
- заданы непустые `purpose` и один `success_outcome`;
- существует хотя бы одна task-linked SDD spec path; запись только в
  `spec-index.md` без task/feature link не считается task context;
- grounded scope задан непустым `touched_files` и/или
  `runtime_context.write_boundary`;
- существует хотя бы один verification path: gate с реальной command или
  непустой `verification_target`;
- все dependencies существуют и не образуют cycle.

Механическая проверка подтверждает только наличие и структурную корректность
этой surface. Она не должна притворяться, что понимает смысл спецификаций.

Не следует требовать непустые значения во всех optional fields:

- `anti_goals`;
- `runtime_context.forbidden_scope`;
- `constraints`;
- `invariants`;
- `evidence_required`;
- `runtime_context.stop_conditions`.

Эти поля заполняются только при наличии evidence. Обязательное заполнение
породит фиктивные ограничения и не повысит качество handoff.

Семантически и только в fresh-context `/review-tasks-plan` оценивается:

- действительно ли linked spec применима к задаче;
- достаточен ли её concrete block;
- независимо ли проверяем `success_outcome`;
- нет ли смыслового конфликта между task, feature и specs.

Эти вопросы не превращаются в deterministic `/mb-doctor` rules. Если semantic
review не может подтвердить безопасный handoff, он возвращает `REJECT` и
маршрутизирует repair существующим workflow.

## Затрагиваемые skills

Основные изменения:

- `/prd-to-tasks` - создавать только schema-valid task cards и task-linked
  authoritative spec links; не генерировать packets.
- `/foundation-to-tasks` - использовать ту же single-card model для `FT-000`.
- `/execute` - читать task card, task-linked specs и protocol context без
  packet preflight.
- `/verify` - строить task-scoped verification basis без packet checks.
- `/red-verify` - использовать task/spec/evidence context напрямую.
- `/review-tasks-plan` - проверять полноту task card и linked specs вместо
  packet readiness.
- `/mb-doctor` - удалить packet path/status/hash/freshness findings.
- `/mb-sync` - удалить packet drift и refresh routing.
- `/autopilot` - удалить packet gates и packet repair branches из scheduler
  loop.
- `/autonomous` - удалить packet generation/readiness из полного workflow.

Удаляемый skill:

- `/mb-packet`.

Package entrypoints `/mb-verify` и `/mb-red-verify` нужно согласовать с
обновлёнными canonical verify/red-verify contracts.

## План реализации

### 1. Зафиксировать текущий contract

- Найти все packet references в canonical commands, workflows, scripts,
  templates, docs и release checks.
- Сохранить checklist поведения, которое должно остаться после удаления
  packet layer: scope, stop conditions, verification commands, evidence и
  handoff.
- Не редактировать generated `.agents/`, `.claude/` и package-local
  `shared-*` files.

### 2. Упростить task schema

- Убедиться, что task card напрямую представляет все необходимые execution и
  verification данные.
- Закрепить T2/T3 single-card handoff completeness contract без нового status,
  artifact или вложенного `packet` object.
- Удалить `packet_required` и `packet_ref` из `runtime_context`.
- Не добавлять новый task lifecycle, registry или artifact family.
- Не делать все optional context fields обязательными или непустыми.

Полезная packet surface уже имеет естественное место:

- packet verification commands -> task `gates`;
- success checks -> `verification_targets`;
- evidence requirements -> `evidence_required`;
- specs/guides -> `source_artifacts` и `normative_inputs`;
- scope и stop conditions -> существующий `runtime_context`;
- `required_handoff` -> command contract `/execute`, а не новое task field;
- task/feature/protocol paths выводятся из task identity и workflow.

### 3. Обновить task generation

- В `/prd-to-tasks` удалить packet creation, hash calculation, statuses и
  refresh instructions.
- В `/foundation-to-tasks` удалить ту же packet machinery для `FT-000`.
- Сохранить task-linked SDD paths и обязательную single-card handoff surface.
- `constraints`, `invariants`, `evidence_required`, `forbidden_scope` и
  `stop_conditions` заполнять только когда они grounded evidence.

### 4. Обновить execution и verification

- `/execute` использует indexed task card, tier policy, task-linked
  authoritative specs under the active SDD model и protocol state.
- `/verify` использует task-scoped outcome, mapped AC/REQ, linked specs и
  execution evidence.
- `/red-verify` использует тот же authoritative basis без packet fallback.
- Удалить packet-only blockers; semantic contradiction между task и specs
  остаётся blocker.

### 5. Обновить planning/readiness gates

- `/review-tasks-plan` семантически проверяет task-scoped outcome, применимость
  linked specs, concrete-block sufficiency и отсутствие смысловых конфликтов.
- `/mb-doctor` удаляет packet-specific findings и сохраняет schema,
  dependency, tier, SDD-link presence, protocol и evidence checks.
- Детерминированная часть T2/T3 single-card contract проверяет только
  объективную структуру/наличие; не превращать doctor в semantic validator
  содержимого specs или качества outcome.

### 6. Обновить scheduler flows

- Удалить packet generation, repair и readiness branches из `/autopilot` и
  `/autonomous`.
- Удалить packet refresh logic из `/mb-sync`.
- Сохранить существующее ownership lifecycle transitions, verify/red-verify
  routing и dependent-task orchestration.

### 7. Удалить packet artifacts и skill

- Удалить canonical `mb-packet` command.
- Удалить packet template.
- Перестать создавать `.memory-bank/packets/` в fresh bootstrap.
- Удалить `/mb-packet` из runtime skill generation и command documentation.
- Проверить source-only packaging и не оставлять generated shared copies.

### 8. Обновить framework surfaces

Проверить и согласовать:

- `skills/_shared/scripts/init-mb.js`;
- `skills/_shared/references/structure-template.md`;
- `skills/_shared/references/workflows/tier-policy.md`;
- `skills/_shared/references/workflows/execute-loop.md`;
- `skills/_shared/references/workflows/mb-sync.md`;
- `skills/mb-garden/assets/mb-lint.mjs`;
- `skills/mb-garden/assets/mb-doctor.mjs`;
- package skill entrypoints;
- `README.md`, `howItWorks.md`, `GREENFIELD_WORKFLOW.md`, `PROJECT_MAP.md`;
- installer and release smoke checks.

### 9. Проверить fresh target project

- Запустить syntax и source-only checks.
- Выполнить install-only smoke.
- Выполнить fresh bootstrap в temporary target.
- Подтвердить отсутствие `.memory-bank/packets/` и `/mb-packet` skill.
- Подтвердить, что task schema не содержит packet fields.
- Проверить T2/T3 single-card contract на complete и structurally incomplete
  task fixtures; optional evidence-driven fields могут оставаться пустыми.
- Проверить T0/T1 compact и T2/T3 full-protocol execution/verification flows на
  single task card.
- Запустить `mb-lint` и `mb-doctor` на fresh fixture.

## Acceptance criteria

- Fresh project создаёт только task registry/cards, без packet directory.
- `/prd-to-tasks` и `/foundation-to-tasks` не создают packet files.
- T2/T3 task card удовлетворяет single-card handoff completeness contract:
  schema/index/ID/REQ linkage, `purpose`, один `success_outcome`, task-linked SDD
  path, grounded scope, verification path и корректные dependencies.
- `anti_goals`, `forbidden_scope`, `constraints`, `invariants`,
  `evidence_required` и `stop_conditions` остаются evidence-driven и не требуют
  фиктивного непустого заполнения.
- `/review-tasks-plan` оценивает semantic applicability/sufficiency/conflicts;
  `/mb-doctor` не заявляет детерминированную semantic validation.
- `/execute`, `/verify` и `/red-verify` не требуют packet.
- `/review-tasks-plan`, `/mb-doctor`, `/autopilot` и `/autonomous` не имеют
  packet-specific blockers или repair branches.
- `/mb-packet` и packet template удалены из поставляемого framework.
- Task IDs, tiers, statuses, dependencies, protocol depth и closure ownership
  не изменились.
- Generated Codex и Claude skills описывают одинаковую single-card model.
- Standard syntax, install, bootstrap, lint и doctor checks проходят.

## Non-goals

- Не создавать nested packet внутри task card.
- Не вводить новый execution-context файл вместо packet.
- Не менять tier model или task lifecycle statuses.
- Не переносить authoritative SDD content в task card; task хранит direct links
  и только task-relevant executable rules.
- Не проектировать remote transport/signed dispatch protocol без реального
  требования.
- Не описывать или выполнять миграцию существующих target-project task records
  в рамках этого рефакторинга.
