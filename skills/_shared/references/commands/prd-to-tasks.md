---
description: Декомпозиция или repair product feature: SDD design, implementation plan, JSON tasks и required packets.
status: active
---
# /prd-to-tasks — Feature → Implementation plan → JSON tasks

<objective>
Взять конкретную фичу (FT-XXX), полноценно закрыть или починить feature-level
SDD design и привести её planning surface к согласованному состоянию:
- feature design status/spec links
- Implementation Plan
- schema-backed JSON task records (waves)
- optional behavior specs for concrete ambiguous behavior
- required derivative Execution Packets
- критерии done + тесты + verify

Before each final task record is written, run a task-by-task design pass: refresh
the relevant spec inventory, resolve missing design evidence, update the natural
authoritative owners, and only then materialize that task card.
</objective>

<process>

## 0) Вход
Ожидается `$ARGUMENTS`:
- `FT-<NNN>` для одной фичи
- `--all` для декомпозиции всех `FT-*` по приоритету

The user may also explicitly ask the command to repair/reconcile existing
feature specs and task cards, or to fully re-decompose a feature. Do not add a
persisted mode field or a separate repair command.

Если аргумент не дан:
- interactive → попроси выбрать фичу
- autonomous → используй `--all`

`FT-000` is reserved for the Foundation Dev Path. `/prd-to-tasks FT-000` is
invalid; use `/foundation-to-tasks` instead. In `--all` mode, exclude `FT-000`
from the product feature target set.

## 1) Decomposition preflight
Перед созданием или обновлением implementation plan и JSON task records проверь, что feature can be decomposed.
`/prd-to-tasks` does not require feature clarification metadata. The normal manual path is `/write-prd` → `/spec-init` → `/prd` → `/review-feat-plan` for high-risk/large work → `/spec-design` → `/foundation-to-tasks` when foundation is required → `/prd-to-tasks FT-<NNN>` → `/review-tasks-plan FT-<NNN>` → conditional `/mb-doctor` for T3, autonomous/autopilot handoff, or complex T2/foundation/dependency/packet/stale-doc/risky-link cases → tier-routed `/execute TASK`.

`/prd-to-tasks` is the single owner for feature-local SDD design, initial task
decomposition, and later reconciliation of feature specs, task cards, plans,
and required packets.

Для `FT-<NNN>`:
1. Reject `FT-000` and route to `/foundation-to-tasks`.
2. Найди `.memory-bank/features/FT-<NNN>-*.md`.
3. Прочитай frontmatter.
4. Block only if the feature explicitly says clarification is not complete:

```yaml
clarification_status: pending|blocked
```

Missing clarification metadata does not block decomposition.
`clarification_status: complete` is allowed but not required.

Before changing the feature planning surface, read `.memory-bank/tasks/index.json`
and all indexed task records whose `feature` is the target `FT-<NNN>`. If such
records exist, apply the existing-queue reconciliation rules below instead of
creating duplicate tasks.

Block if relevant unresolved markers appear in behavior / acceptance / data / contracts / security / UX / operations / verification sections:
- `NEEDS CLARIFICATION`
- `TBD`
- `TODO`
- `???`

Do not block on those words in unrelated notes, changelog-like text, or historical context unless they affect task decomposition or verification.

If blocked:
- interactive mode: report the feature and tell the user to run `/clarify-feature FT-<NNN>` or resolve the marker directly
- autonomous mode: set terminal state `HALT_CLARIFICATION_REQUIRED`
- stop immediately before decomposition
- do not create or update implementation plans
- do not create, update, or index task records

For `--all`:
- resolve the full targeted feature set first
- exclude `.memory-bank/features/FT-000-foundation.md` and any other `FT-000`
  pseudo-feature doc from product task generation
- if any targeted feature is missing, has `clarification_status: pending|blocked`, or has blocking unresolved markers, halt before creating or updating task records for any feature
- report all blocked feature IDs and their blockers

`/clarify-feature` does not assign tier. Tier remains mandatory here and is assigned during task decomposition.

## 1.0) Foundation gate preflight
Before product feature task generation, read `.memory-bank/foundation.md`.

Allowed states:
- `Foundation Required: false` with `Foundation Gate Task: not_required` and a
  rationale in `.memory-bank/foundation.md`
- `Foundation Required: true` with a concrete `Foundation Gate Task: TASK-<NNN>-T<N>-FT-000-W<N>`
  whose indexed task record has `feature: "FT-000"` and `status: "done"`

If `.memory-bank/foundation.md` is missing, route to `/spec-design` and stop.
If foundation is required but `Foundation Gate Task` is
`pending_foundation_to_tasks`, missing, not indexed, not `done`, or not an
`FT-000` task, stop and route to `/foundation-to-tasks`, `/mb-doctor`,
`/execute`, and `/verify` for the foundation queue.

When foundation is required and the gate task is `done`, every product task
created or updated by this command must include that gate task in `depends_on`
unless it already depends on another task that transitively depends on the gate.
Do not add the gate to `FT-000` tasks.

## 1.0a) Existing queue reconciliation

When indexed task records already exist for the target feature, default to a
bounded reconciliation pass. A prompt such as "repair specs and task cards"
selects this behavior; full task re-slicing requires an explicit request.

Reconciliation rules:
- do not create duplicate task records or silently renumber the queue
- preserve task `id`, `feature`, `wave`, `tier`, `depends_on`, `status`, recorded
  `verify` evidence, and existing protocol/evidence references
- for `planned`, `ready`, or `blocked` records, update only the implementation
  plan, authoritative specs, behavior-spec links, task content/gates/runtime
  context, and richer design fields needed to restore consistency; preserve
  lifecycle status for the scheduler or explicit owner
- do not semantically rewrite `in_progress`, `done`, or `failed` task goals,
  acceptance basis, or evidence; report the impact and require an explicit
  owner decision, follow-up task, or controlled re-decomposition
- if repair requires changing task identity, tier, wave, dependencies,
  acceptance criteria, or material scope, stop and report that explicit
  re-decomposition is required instead of hiding the change inside repair
- refresh every affected required packet after task or linked-spec changes,
  including spec-only changes whose task-record hash did not change
- rerun `/review-tasks-plan FT-<NNN>` after reconciliation before execution or
  scheduler handoff

These rules do not add a new task status or persisted workflow mode.

## 1.1) Full feature SDD design phase
Before initial decomposition or existing-queue reconciliation, complete or
repair the required feature-level design directly in this command.

Read existing design surface first:
1. Read `.memory-bank/spec-index.md`.
2. Read `.memory-bank/spec-backbone.md`.
3. Confirm global backbone status in `.memory-bank/spec-backbone.md` is `complete`,
   or `minimal` with explicit `not_applicable` areas. If missing, bare `minimal`,
   or `blocked`, route to `/spec-design` and stop before task generation.
4. Read the target `.memory-bank/features/FT-<NNN>-*.md`.
5. Read linked epic, requirements, Constitution, backbone specs, and any existing
   specs routed by the index/backbone.
6. Search existing `.memory-bank/architecture/`, `.memory-bank/tech-specs/`,
   `.memory-bank/contracts/`, `.memory-bank/domains/`, `.memory-bank/states/`,
   `.memory-bank/adrs/`, `.memory-bank/testing/`, `.memory-bank/guides/`, and
   `.memory-bank/runbooks/` for overlapping decisions.

Rule: do not create a new spec before checking existing specs through the index.
If several features need the same missing domain/contract/state/API/security/data/runtime/testing decision, stop and route to `/spec-design` instead of creating duplicate feature-local specs.
If a task/feature interpretation conflicts with a backbone spec, stop with a blocker instead of choosing locally.

Feature frontmatter may include:

```yaml
spec_design_status: complete|not_required|blocked
spec_design_links:
  - .memory-bank/tech-specs/FT-<NNN>-<slug>.md
```

Rules:
- `spec_design_status: blocked` always blocks task decomposition.
- `spec_design_status: not_required` is allowed only for simple T0/T1-like features with a concise rationale in the feature doc.
- `spec_design_status: complete` requires at least one concrete linked spec when the feature implies T2/T3 work.
- missing or incomplete `spec_design_status` means this command must complete or block the feature-level design phase before task slicing.
- Design specs are normative source of truth for task records. If feature/task interpretation conflicts with linked SDD specs, stop with a blocker instead of resolving locally.

T2/T3 indicators include:
- cross-module behavior
- API/contract/schema/state/data/domain model changes
- migrations or persistence behavior
- security/auth/secrets/compliance/payments
- deploy/runtime/production impact
- changes where tests can pass while the substance is wrong

Decide required design depth:
- none: simple T0/T1-like work with no runtime, contract, state, data, security, migration, or cross-module design impact
- feature hub only: a small `.memory-bank/tech-specs/FT-<NNN>-<slug>.md` is enough
- linked specs: update or create specific architecture/contracts/domains/states/ADR/testing/runbook docs

For every non-simple feature, generate or update the SDD specs needed to make
the feature implementable without guessing. Cover the relevant families in the
simplest natural owner:
- Architecture Specification: module/runtime/source-of-truth implications.
- API / Interface Specification: endpoint, CLI, event/message, agent I/O, tool,
  external, or frontend/backend boundaries.
- Data Specification: domain model, storage ownership, persistence, migration,
  session/UoW, lifecycle, retention, seed data, or runtime data path.
- Contracts: compatibility, responsibility boundaries, evidence/redaction,
  security/safety, testing, runbook, or verification contracts.

When relevant, generate/update these concrete contract/spec types in the natural
owner:
- Component Contract: guarantees, responsibilities, allowed/forbidden calls, and
  ownership boundaries for each affected module/component.
- API Contract: REST/gRPC/GraphQL inputs, outputs, auth/status/error behavior,
  compatibility, pagination/upload rules when applicable.
- Event Contract: event/message/queue envelope, required fields, ordering,
  retry/idempotency, delivery and failure behavior.
- Data Contract: data/payload structure, versions, required fields,
  validation/serialization rules, and compatibility expectations.

For feature-local design, prefer one feature hub
`.memory-bank/tech-specs/FT-<NNN>-<slug>.md` with only the relevant sections
from `Architecture Specification`, `API / Interface Specification`,
`Data Specification`, `Contracts`, and `Verification`. Use separate
feature-local files under `.memory-bank/contracts/` or `.memory-bank/domains/`
only when a separate owner is clearer. Update shared/global specs instead when
they are the natural home.

If simple, mark the feature:

```yaml
spec_design_status: not_required
spec_design_links: []
```

Add a concise rationale in the feature doc and update `.memory-bank/spec-index.md`.

Before writing specs, explicitly look for:
- duplicate or conflicting existing specs
- inconsistent boundaries, contracts, state transitions, or data ownership
- hidden coupling or complexity growth
- unclear acceptance criteria that would make tasks unverifiable
- security/compliance/runtime risks
- places where tests could pass while substance remains wrong

If design is blocked or multiple meaningful options exist, ask the user. Ask only
questions needed to make the spec truthful. If contradiction or major complexity
increase exists, stop until resolved.

Allowed artifacts:
- feature design hub: `.memory-bank/tech-specs/FT-<NNN>-<slug>.md`
- architecture notes: `.memory-bank/architecture/<topic>.md`
- contracts: `.memory-bank/contracts/<boundary>.md`
- domain/data model notes: `.memory-bank/domains/<domain>.md`
- states: `.memory-bank/states/<lifecycle>.md`
- ADRs for significant decisions: `.memory-bank/adrs/ADR-<NNN>-<slug>.md`
- frontend component guide: `.memory-bank/guides/frontend-component-guide.md` when UI component/design behavior is normative
- testing/runbooks when needed: `.memory-bank/testing/`, `.memory-bank/runbooks/`

Keep KISS:
- update existing specs when that is the natural home
- do not fork duplicate specs
- do not create empty family sections or files just to satisfy a template
- do not add schema, migration, hook, or governance machinery just for design routing
- write decisions, constraints, invariants, and verification targets only when grounded in PRD/user/spec evidence
- use backbone specs from `/spec-design` as primary normative inputs

Update `.memory-bank/spec-index.md`:
- keep the spec registry/planned specs current
- add linked specs created or used for the feature
- record broken/missing links only when relevant

Do not write feature status maps into `.memory-bank/spec-index.md`; feature `spec_design_status` lives in feature frontmatter. If a global/shared gap appears, update `.memory-bank/spec-backbone.md` or route back to `/spec-design`.

Invariant for `spec_design_status: complete`:
- set `complete` only when every feature-relevant SDD design area either has a concrete linked spec file routed through `.memory-bank/spec-index.md` as an authoritative, evidence-backed source of truth, or is explicitly `not_applicable` for this feature
- do not set `complete` while any feature-relevant design area remains planned, candidate, unknown, conflicting, or otherwise unresolved
- if unresolved feature-relevant planned/candidate/unknown/conflicting areas remain, set `spec_design_status: blocked` or leave the feature without `complete`, and record the gap/open question in the feature doc or relevant spec; use `.memory-bank/spec-backbone.md` only for shared/global gaps

Update target feature frontmatter:

```yaml
spec_design_status: complete
spec_design_links:
  - .memory-bank/tech-specs/FT-<NNN>-<slug>.md
```

Allowed statuses:
- `complete`
- `not_required`
- `blocked`

Use `blocked` only when design cannot be made truthful without user or external evidence.
If the result is `blocked`, stop before creating or updating implementation plans,
task records, or packets.

Treat an existing or initial `spec_design_status: complete` as a feature-level
baseline during this command. Confirm it after the task-by-task loop; if that
loop exposes an unresolved feature-relevant gap, the final status cannot remain
`complete`.

For `--all`, run this full feature SDD design phase for each targeted feature
before task generation. If any targeted feature is blocked, halt before creating
or updating task records for any feature and report all blocked features.

## 1.2) Task-by-task concrete design readiness
Apply this policy inside the per-task loop in section 5. Before creating or
updating each `T2` / `T3` task record, decide whether that task depends on a
concrete boundary:
- HTTP/API endpoint, request/response shape, status/error/auth behavior, or
  compatibility contract
- state/lifecycle transition, guard, rollback, or failure mode
- schema/model fields, storage ownership, migration, retention, seed data, or
  runtime data path
- event/message envelope, ordering, idempotency, retry, or delivery behavior
- domain vocabulary, invariant, business rule, or cross-module ownership
- agent input/output contract, tool payload, or handoff envelope
- security/safety behavior, secrets/auth/compliance, or irreversible operation
- frontend component/UI behavior or operating procedure when a guide is the
  normative source

If a task depends on one of these boundaries, a linked authoritative spec must
be implementable without guessing. The concrete block may live in the simplest
natural owner:
- `.memory-bank/contracts/*`
- `.memory-bank/states/*`
- `.memory-bank/domains/*`
- `.memory-bank/tech-specs/FT-<NNN>-*.md`
- `.memory-bank/testing/*`
- `.memory-bank/guides/*` only when the guide is the normative source for UI or
  operating behavior

Minimum concrete block:
- `shape`: fields, endpoint, states, message/envelope, storage entity/path, or
  boundary shape
- `rules`: `MUST` / `MUST NOT`
- `edge cases/errors`
- `verification target`

Before writing or repairing a concrete block, resolve the authoritative owner:
1. Find candidate specs from `.memory-bank/spec-index.md`,
   `.memory-bank/spec-backbone.md`, feature `spec_design_links`, and existing
   spec folders.
2. Prefer updating the existing authoritative owner. If ownership is unclear,
   do not create a new spec.
3. Create a new spec only with a short rationale, then link it back from
   `.memory-bank/spec-index.md` and the feature.

Each concrete contract block has exactly one authoritative owner. Other docs may
summarize or link to that owner, but must not restate `shape`, `rules`, `edge
cases/errors`, or `verification target` as a second source of truth. When this
command creates or materially updates a concrete contract spec, add or repair a
short ownership statement near the top:

```markdown
## Ownership
- Owns:
- Does not own:
- Related specs:
```

Owner hints:
- `.memory-bank/contracts/api-guidelines.md` owns cross-cutting API naming,
  status/error/auth/pagination/upload/compatibility rules.
- `.memory-bank/contracts/http-api.md`, `.memory-bank/contracts/openapi.md`, or
  stack-native schema docs own concrete HTTP boundary shapes when that boundary
  exists.
- `.memory-bank/contracts/message-envelope.md` or an existing event contract
  owns event/message envelope rules.
- `.memory-bank/contracts/<agent-boundary>.md` owns agent I/O contracts.
- `.memory-bank/domains/<domain>.md` owns domain vocabulary and business
  invariants.
- `.memory-bank/domains/runtime-data-model.md` or an existing storage spec owns
  runtime data/storage ownership, migrations, retention, and seed data.
- `.memory-bank/states/<lifecycle>.md` owns lifecycle/state-machine transition
  guards.
- `.memory-bank/architecture/system-architecture.md#Architecture Spine` owns
  short cross-cutting guardrails only; detailed contract/state/domain blocks
  live in the relevant spec.
- `.memory-bank/tech-specs/FT-<NNN>-<slug>.md` owns only genuinely
  feature-local behavior with no shared reuse.

If `.memory-bank/spec-backbone.md` marks a relevant area `needed_before_tasks`,
resolve it before creating any dependent T2/T3 task:
- update the routed authoritative owner with the minimum concrete block when
  evidence is sufficient;
- update `.memory-bank/spec-index.md` as a registry only;
- link the authoritative owner from feature `spec_design_links`;
- update the Backbone Area Matrix row to `authoritative` or `not_applicable`
  when the concrete readiness gap is resolved.

If the missing contract is needed by multiple features or changes a shared
boundary, update the shared owner. If the shared owner or decision is unclear,
route back to `/spec-design` instead of creating duplicate feature-local blocks.

If the concrete block cannot be truthfully completed without manual
repair/clarification, stop before writing the affected task record, mark/report
the feature design as blocked, and do not build packets or hand off execution.
Resolve feature-local repair by rerunning `/prd-to-tasks FT-<NNN>` after the
missing evidence or user decision is available; if the ambiguity is
shared/global, route to `/spec-design`.

Do not duplicate concrete contract blocks in task records, implementation plans,
or packets. Copy only task-relevant links into existing fields such as
`source_artifacts`, `normative_inputs`, `constraints`, `invariants`, or
`verification_targets`.

## 2) Создай протокол фичи
- `.protocols/FT-<NNN>/plan.md`
- `.protocols/FT-<NNN>/decision-log.md`

Do not remove the current `.protocols/FT-<NNN>/decision-log.md` behavior; the no-extra-protocol-files rule applies to `/clarify-feature`.

Use the existing feature protocol files as lightweight resumable state:
- `plan.md` keeps the concise ordered provisional task outline and the current
  task-design iteration checkpoint; it is not a second task registry
- `decision-log.md` records accepted user answers and design decisions that
  affect task/spec generation
- do not create another draft-task artifact family

## 3) Прочитай контекст
- `.memory-bank/features/FT-<NNN>-*.md`
- соответствующий epic
- requirements RTM
- `.memory-bank/constitution.md`, если есть
- `.memory-bank/spec-backbone.md`, если есть
- `.memory-bank/spec-index.md`, если есть
- linked SDD design specs from the feature, spec-backbone, and spec-index, if any
- `.memory-bank/workflows/tier-policy.md`, если есть

## 4) Напиши Implementation Plan
Создай `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`:
- цели
- short `Constitution Check`: relevant principles, conflicts/blockers, and tier-policy consistency
- шаги
- expected touched files
- тесты
- гейты качества
- UAT steps

Если в feature doc уже есть richer spec-driven inputs, **предпочитай** включить их в план:
- `Source Artifacts`
- `Normative Inputs`
- `Constraints`
- `Invariants`
- `Verification Targets`
- `spec_design_links`

Если этих секций нет:
- не считай это ошибкой
- используй классический вход: feature doc + epic + RTM + duo docs

Constitution Check rules:
- Keep the check short; it is a planning gate, not a copy of the Constitution.
- If the feature or proposed implementation conflicts with `.memory-bank/constitution.md`, stop and report the blocker before creating or updating task records.
- Do not add `.memory-bank/constitution.md` to every task `normative_inputs` automatically.
- Add Constitution to a task `normative_inputs` only when a specific principle is materially relevant to execution or verification of that task.
- Do not introduce alternatives to the required `tier: T0|T1|T2|T3` routing model.

Before writing JSON task records, add a concise ordered provisional task outline
to `.protocols/FT-<NNN>/plan.md`. For each provisional task, record only its
purpose, likely wave/dependencies/tier, and expected design pressure. Keep the
outline compact: it is a checkpoint for the loop below, not an alternative task
model and not a place to duplicate final task cards.

## 4.5) Optional behavior specs
Decide whether the feature needs concrete behavior examples before slicing tasks.
Creating `0` behavior specs is the correct result for simple, mechanical, or
obvious features.

Create 1-3 behavior specs only when evidence from PRD, feature docs, linked
specs, baseline docs, contracts, states, runbooks, or testing docs shows that a
specific `given / when / then` example will materially reduce implementation
ambiguity. Typical cases:
- core happy path for an important feature
- negative or edge case with real implementation risk
- `T2` / `T3` behavior where acceptance criteria could be satisfied too narrowly
- API, state, domain, or UI flow needing a concrete example

Do not create behavior specs for simple `T0` / `T1`, mechanical, or obvious
tasks. Do not invent scenarios without evidence.

Store behavior specs as standalone JSON files:

```text
.memory-bank/behavior-specs/FT-<NNN>-BHV-<NNN>-<slug>.behavior.json
```

Use this minimal shape:

```json
{
  "id": "FT-001-BHV-001",
  "feature_id": "FT-001",
  "title": "Successful login with valid credentials",
  "given": {},
  "when": {},
  "then": {}
}
```

Rules:
- one behavior spec describes one independent behavior
- keep JSON short; do not duplicate the whole feature spec
- do not add a registry, index, JSON Schema, validator, doctor gate, or new task
  field
- if behavior specs are created, add or update the feature doc section:

```md
## Behavior specs
- `.memory-bank/behavior-specs/FT-001-BHV-001-login-success.behavior.json`
```

- link task-relevant behavior specs only through task `source_artifacts`
- do not add behavior specs to `verification_targets`, `evidence_required`,
  `gates`, `constraints`, or `invariants`
- behavior specs are implementation context examples, not readiness,
  verification, or done gates

## 5) Нарежь на schema-backed tasks (waves)
JSON task records are the source of truth:
- `.memory-bank/schemas/task.schema.json`
- `.memory-bank/tasks/index.json`
- `.memory-bank/tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>.task.json`

### 5.1) Run the task-by-task design loop

Process the provisional outline in dependency/wave order. Do not write all task
records first and attempt to repair their design inputs afterward.

For each provisional task:
1. Refresh the current design inventory. Reread `.memory-bank/spec-index.md`,
   relevant backbone routes, feature `spec_design_links`, and specs created or
   updated by earlier iterations in this same run. Do not rely only on the
   inventory remembered at the start of the feature.
2. Build a working inventory for this task, without creating a new artifact:
   - existing authoritative specs required by the task
   - missing or insufficient specs/contract blocks
   - unresolved design decisions that would force implementation guessing
3. Give every task a quick design-needs check. For simple `T0` / `T1`, continue
   without artificial specs or questions when no design pressure exists. For
   `T2` / `T3`, apply the concrete readiness rules in section 1.2.
4. If a meaningful choice cannot be resolved from PRD, feature, backbone, or
   existing spec evidence, use the question gate below before writing specs or
   the task record.
5. Create or update only the minimum necessary authoritative spec owners. Keep
   one owner per concrete contract, update `.memory-bank/spec-index.md` and
   feature `spec_design_links` when needed, then reread the changed sources. Name
   and scope specs by the boundary or behavior they own, not by task id, unless
   the design is genuinely feature-local and the existing feature hub is the
   natural owner.
6. Write the final JSON task record only when its design context is sufficient.
   Link relevant specs through existing richer fields and copy only
   task-relevant executable constraints, invariants, and verification targets.
   When a record already exists, reconcile it under section 1.0a rather than
   replacing its identity/lifecycle/evidence fields.
7. Update the current iteration checkpoint in `.protocols/FT-<NNN>/plan.md` and
   continue to the next provisional task. Do not build its Execution Packet yet.

Question gate:
- ask `0-3` focused questions in one pass; questions are conditional, not a
  mandatory quota for every task
- ask only when the answer can materially change API/interface shape, component
  ownership, event semantics, data/storage behavior, state transitions,
  compatibility, security, or the verification contract
- group related questions for the current task/design boundary and explain the
  concrete decision they unblock
- when one answer affects several provisional tasks, ask once before the first
  affected task, record it in `decision-log.md`, and reuse it
- do not ask questions merely to fill a template or reconfirm evidence already
  present in authoritative sources
- in autonomous mode, do not invent an unsafe missing product/design decision;
  record the blocker and stop according to the active workflow

After all provisional tasks have records, run one feature consistency pass:
- reread all generated/updated task records and their linked authoritative specs
- repair earlier task links, constraints, invariants, or verification targets
  if a later iteration changed a shared spec
- confirm every `T2` / `T3` task remains implementable without guessing and no
  concrete contract has competing authoritative owners
- confirm feature acceptance criteria are covered and finalize truthful
  `spec_design_status` / `spec_design_links`
- if the feature remains design-blocked, do not build packets or hand off
  execution

Создай или обнови отдельные `.task.json` файлы:
- Wave 1: enabling/product setup for this feature (`W1`, not project `W0`)
- Wave 2: core logic
- Wave 3: integration & polish

Task id format is mandatory:
- `TASK-<NNN>-T<N>-FT-<NNN>-W<N>`
- the `T<N>` segment must match the task record `tier`
- the `FT-<NNN>` segment must match the task record `feature`
- the `W<N>` segment must match the task record `wave` (`W1` -> `W1`)
- the task file must be `<task.id>.task.json`

Правила:
- каждая задача должна быть достаточно маленькой (обычно 1–2 часа)
- каждая задача описывает:
  - что сделать
  - какие файлы трогаем
  - какие тесты написать
  - как проверить
  - какие MB документы обновить (Docs First)

Минимальный JSON record (обязательно для `/autopilot` и `/autonomous`):
```json
{
  "id": "TASK-001-T1-FT-001-W1",
  "title": "Short task title",
  "status": "planned",
  "wave": "W1",
  "feature": "FT-001",
  "reqs": ["REQ-001"],
  "depends_on": [],
  "touched_files": [],
  "tier": "T1",
  "gates": [
    {
      "name": "unit tests",
      "command": "npm test",
      "required": true
    }
  ],
  "verify": [],
  "docs": [],
  "evidence_required": [],
  "source_artifacts": [],
  "normative_inputs": [],
  "constraints": [],
  "invariants": [],
  "verification_targets": []
}
```

Optional runtime context fields may be added only when there is evidence in the
PRD, feature docs, linked specs, baseline docs, contracts, states, runbooks, or
testing docs:

```json
{
  "purpose": "Why this task exists.",
  "success_outcome": "Observable result that proves real success.",
  "anti_goals": [
    "What must not be changed or optimized away."
  ],
  "runtime_context": {
    "allowed_write_scope": [],
    "forbidden_scope": [],
    "stop_conditions": []
  }
}
```

Rules for optional purpose/runtime fields:
- do not invent `purpose`, `success_outcome`, `anti_goals`, or
  `runtime_context` without evidence
- when boundary evidence exists in `.memory-bank/contracts/boundary-map.md` or
  other contracts/specs, link those docs through existing fields such as
  `source_artifacts`, `normative_inputs`, `constraints`, `invariants`, or
  `verification_targets`; do not add boundary-specific task fields
- for `T2` / `T3` or shared-boundary work, read relevant
  `.memory-bank/architecture/system-architecture.md#Architecture Spine`
  decisions and `.memory-bank/contracts/boundary-map.md` boundary cards before
  slicing tasks
- when an `AD-*` or boundary card constrains the task, copy the doc link into
  `normative_inputs`, copy the executable rule into `constraints` or
  `invariants`, and add a concrete check to `verification_targets`
- if required T2/T3 boundary, concrete contract, or architecture decisions are
  missing, contradictory, or not checkable, stop with a design blocker and route
  shared/global gaps back to `/spec-design`; keep feature-local repair inside
  `/prd-to-tasks` instead of creating a weak task record
- `T0` / `T1` tasks may omit runtime context entirely
- `T0` / `T1` tasks require packets only when there is explicit evidence that
  compact executable runtime context is needed; in that case set
  `runtime_context.packet_required: true`
- do not infer packets for `T0` / `T1`; if `packet_ref` exists without
  `packet_required: true`, it is advisory only
- `T2` / `T3` tasks always require an Execution Packet before implementation
- for every generated `T2` / `T3` task, set
  `runtime_context.packet_required: true` and `packet_ref` to
  `.memory-bank/packets/<task.id>.packet.json`
- if a planned `T2` / `T3` task is downgraded to `T0` / `T1`, remove the
  automatic packet requirement unless explicit T0/T1 packet evidence remains
- `allowed_write_scope` may default from `touched_files` when that scope is
  already evidenced by the task plan
- `allowed_write_scope`, `forbidden_scope`, and `stop_conditions` may be copied
  from linked boundary notes/contracts only when the task needs executable
  scope constraints
- use `forbidden_scope` only for concrete risks
- keep `stop_conditions` short, for example:
  - linked spec contradicts task goal
  - needed public contract is missing
  - implementation requires scope outside `allowed_write_scope`
  - verification cannot prove `success_outcome`
  - security/runtime decision is unclear

Required enums:
- `status`: `planned|ready|in_progress|blocked|done|failed`
- `tier`: `T0|T1|T2|T3`

Tier is mandatory. Do not create or index a task record without `tier`.
Authoritative execution, verification, red-verification, and autonomous routing are determined only by `task.tier`.
The old `risk` / `risk.level` model is invalid and removed.

Tier assignment:
- `T0`: trivial docs-only or formatting/link fixes with no runtime, contract, state, data, security, or test impact.
- `T1`: local code or local behavior with low blast radius.
- `T2`: cross-module, API/contract/schema/state/data/migration/domain behavior, or changes where tests can pass while the substance is wrong.
- `T3`: auth, security, secrets, deploy/runtime/production impact, irreversible/data-loss, payments, compliance, or other critical changes.
- If uncertain between two tiers, choose the higher tier.
- If scope grows during planning, update `tier` before handing the task to execution.

Persistence rule:
- If the feature includes mutable runtime state, storage, persistence, read-model authority, seed data, or migrations, create at least one task that explicitly names the DB-backed storage path, not only schema or migration files.
- That task must include a runtime smoke or repository integration verification target that exercises read/write through the persistence boundary.
- If persistence is truly not needed, mark the storage/persistence area `not_applicable` in the relevant spec instead of creating a fake DB task.

Эти ключи обязательны в task records; когда есть достаточно evidence и это реально помогает downstream deterministic execution, заполняй их содержимым:
- `source_artifacts`
- `normative_inputs`
- `constraints`
- `invariants`
- `verification_targets`

Важно:
- ключи обязательны, но значения могут быть пустыми массивами, если evidence нет
- не выдумывай содержимое без evidence из PRD / feature docs / baseline docs / contracts / states / runbooks
- when task-relevant behavior specs exist, include their file paths only in
  `source_artifacts`; never copy them into verification/gate/constraint fields
- for `T2` / `T3`, include relevant linked SDD specs from `spec_design_links`, `.memory-bank/spec-backbone.md`, and `spec-index.md` in `source_artifacts`, `normative_inputs`, `constraints`, `invariants`, or `verification_targets`
- include relevant backbone specs from `.memory-bank/spec-backbone.md` and `spec-index.md` whenever they constrain source of truth, module boundaries, runtime data model, API behavior, events/messages, frontend component behavior, invariants, or testing gates
- include relevant Architecture Spine `AD-*`, ADR, and boundary-map links for
  T2/T3 or shared-boundary work when they constrain implementation or
  verification
- if a planned `T2` / `T3` task still has no relevant linked SDD spec after the feature design phase, stop with a design blocker; route shared/global gaps to `/spec-design`, or repair feature-local gaps before creating a weak task record
- if a planned `T2` / `T3` task depends on a concrete boundary but the linked
  authoritative spec lacks `shape`, `rules`, `edge cases/errors`, or
  `verification target`, stop before creating the task record and repair the
  natural owner inside this command

Обнови `.memory-bank/tasks/index.json` только ссылками:
```json
{
  "version": 1,
  "tasks": [
    {
      "id": "TASK-001-T1-FT-001-W1",
      "file": "TASK-001-T1-FT-001-W1.task.json"
    }
  ]
}
```

Правила ready-state:
- product feature tasks must not use `W0`; `W0` is reserved for `FT-000`
  foundation work created by `/foundation-to-tasks`
- product tasks with no deps may start as `ready` only when all preflight gates
  are satisfied, including the foundation gate when required
- downstream tasks по умолчанию `planned`
- `planned -> ready` происходит явно, когда все prerequisites/dependencies уже `done` или отсутствуют, и нет blockers / blocking review rejects
- dependent task может быть `ready`, если все её dependencies уже `done`

## 6) Build required Execution Packets
Only after all task records are written and the feature consistency pass in
section 5 succeeds, build initial derivative Execution Packets while the
feature/task/spec context is still loaded. Do not create packets inside the
per-task design loop.

Create or refresh `.memory-bank/packets/<task.id>.packet.json` for:
- every generated `T2` / `T3` task
- every `T0` / `T1` task with `runtime_context.packet_required: true`
- every existing required-packet task affected by task-card or linked-spec
  reconciliation, including spec-only changes

Use `skills/_shared/references/protocols/packet-template.json` shape when
available. Each packet is derivative only; task records, feature docs, linked
SDD specs, and tier policy remain authoritative.

For each required packet:
1. Use the just-written task record as the source task.
2. Compute `source_task_hash` as `sha256:<64-lowercase-hex>` over the raw task
   record bytes.
3. Fill source refs, purpose fields, scope, verification checks, evidence
   requirements, stop conditions, and required handoff from the task record,
   implementation plan, linked feature, and linked specs.
4. Use status `ready` when usable, `ready_with_gaps` for bounded non-blocking
   gaps, or `blocked` when required inputs are missing, contradictory, or
   insufficient for safe execution.

For T2/T3 required packet use, missing linked SDD specs, missing verification
basis, contradictory scope, or unresolved public contract/state/data/security
decisions are packet blockers, not `ready_with_gaps`.

Standalone `/mb-packet TASK-<NNN>-T<N>-FT-<NNN>-W<N>` remains the repair/refresh command when task
records or specs change after decomposition.

If a task record changes after its packet was generated, run
`/mb-packet TASK-<NNN>-T<N>-FT-<NNN>-W<N>` again before `/execute`, `/verify`,
`/autopilot`, or strict readiness handoff. Do not hand off a required packet
whose `source_task_hash` no longer matches the indexed task record.

## 7) Readiness handoff
Before handoff:
- проверь что acceptance criteria из FT покрыты задачами
- verify that every provisional task completed the task-by-task design loop and
  the final feature consistency pass succeeded
- обнови RTM при необходимости
- если richer fields были добавлены, проверь что они не противоречат feature doc и RTM
- for `T2` / `T3`, verify that `runtime_context.packet_required: true` and
  canonical `packet_ref` are present before handing off task records
- if `runtime_context.packet_required` is set for any tier, verify that
  `packet_ref` points to expected `.memory-bank/packets/<task.id>.packet.json`
- required packet files exist and have `status: ready|ready_with_gaps`; if any
  required packet is `blocked`, report the blocker and do not hand off execution
- if any required task record was changed after packet generation, refresh the
  packet with `/mb-packet TASK-<NNN>-T<N>-FT-<NNN>-W<N>` before handoff
- when foundation is required, every created/updated non-`FT-000` product task
  has the final foundation gate task in `depends_on` directly or transitively

Если используется `--all`:
- пройдись по всем product `FT-*` в порядке приоритета, excluding `FT-000`
- после каждой фичи перечитай `tasks/index.json` и избегай дублирования `TASK-*`
- не запускай execution отсюда; только готовь autonomous-ready JSON task queue

Final report:
- feature id and final `spec_design_status`
- queue action: `created|reconciled|rebuild_required`
- linked specs created/used
- task-by-task design coverage: `complete|blocked`
- implementation plan path
- behavior specs created/linked, or `none`
- task records created/updated
- packet files created/updated and their statuses
- foundation gate dependency: `not_required` or `TASK-<NNN>-T<N>-FT-000-W<N>`
- blockers/open questions, or `none`
- next gate:
  - for `FT-<NNN>`: run `/review-tasks-plan FT-<NNN>`, then conditional
    `/mb-doctor` for T3, autonomous/autopilot handoff, or complex
    T2/foundation/dependency/packet/stale-doc/risky-link cases before
    tier-routed `/execute TASK`
  - for `--all`: run `/review-tasks-plan FT-<NNN>` for every task-linked
    product feature before scheduler execution
</process>
