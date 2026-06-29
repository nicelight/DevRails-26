---
description: Декомпозиция или repair product feature: SDD design, implementation plan и complete JSON task cards.
status: active
---
# /prd-to-tasks - Feature design -> implementation plan -> JSON tasks

<objective>
Close or repair one product feature's planning surface:
- feature-level SDD design and spec links
- implementation plan
- schema-backed JSON task records
- optional behavior specs
- verification-ready single-card handoff

Read the task schema before drafting tasks. Then process provisional tasks in
dependency order: inspect design needs, close grounded spec gaps, and only then
write each final task record.
</objective>

<process>

## 0) Target

`$ARGUMENTS`:
- `FT-<NNN>`: one product feature
- `--all`: all product features in priority order

Without arguments, ask the user to select a feature in interactive mode; use
`--all` in autonomous mode.

The user may ask to repair/reconcile existing specs and task cards or explicitly
request full re-decomposition. Do not add a persisted mode field or another
repair command.

Reject `FT-000`. It is reserved for the Foundation Dev Path and belongs to
`/foundation-to-tasks`. Exclude it from `--all`.

## 1) Preflight, context, and schema

Complete this section before creating an implementation plan, provisional task
outline, or task record.

### 1.1 Feature and queue preflight

For every target feature:
1. Find `.memory-bank/features/FT-<NNN>-*.md` and read its frontmatter.
2. Read `.memory-bank/tasks/index.json` and all indexed records whose `feature`
   is the target. Existing records select reconciliation; do not duplicate them.
3. Block only when `clarification_status` is explicitly `pending|blocked`, or
   when decomposition-relevant behavior, acceptance, data, contract, security,
   UX, operations, or verification text contains unresolved `TBD`, `TODO`,
   `NEEDS CLARIFICATION`, or `???` markers.
4. Treat explicit `spec_design_status: blocked` as a blocker to task drafting.
   A direct repair request may continue only to resolve a feature-local design
   blocker from current evidence or focused user answers before the provisional
   outline. If it remains unresolved, stop; route shared/global blockers to
   `/spec-design`.
5. Ignore unresolved-marker words in historical/unrelated notes.

Missing clarification metadata is allowed. `/clarify-feature` does not assign
tier; tier is selected here under the tier policy.

For unresolved blockers:
- interactive: report the exact blocker; route product ambiguity to
  `/clarify-feature FT-<NNN>` or direct feature-source repair, feature-local
  design ambiguity to a focused decision in this repair run, and shared/global
  design ambiguity to `/spec-design`
- autonomous: return `HALT_CLARIFICATION_REQUIRED` for product clarification or
  `HALT_BLOCKING_QUESTIONS` for unresolved design
- do not create or update plans or task records

For `--all`, resolve and preflight the whole target set before planning writes.
If any target is missing or remains blocked, report all blockers and halt.

### 1.2 Global design and foundation gates

Read `.memory-bank/spec-backbone.md`. Its `Global Backbone Status` must be:
- `complete`; or
- `minimal` with explicit `not_applicable` global/shared areas.

If missing, bare `minimal`, or `blocked`, stop and route to `/spec-design`.

Read `.memory-bank/foundation.md`:
- `Foundation Required: false` requires
  `Foundation Gate Task: not_required` and a rationale.
- `Foundation Required: true` requires a concrete indexed
  `TASK-<NNN>-T<N>-FT-000-W<N>` gate record with `feature: "FT-000"` and
  `status: "done"`.

If the foundation file or valid decision is missing, route to `/spec-design`.
If required foundation work is pending, route to `/foundation-to-tasks`,
`/mb-doctor`, `/execute`, and `/verify`; stop product task generation.

Remember the final foundation gate ID. Every created/updated product task must
depend on it directly or transitively when foundation is required.

### 1.3 Read planning context

Read once before task drafting:
- target feature, linked epic, requirements/RTM, and Constitution when present
- `.memory-bank/spec-index.md` as a registry only
- `.memory-bank/spec-backbone.md` as shared/global route and readiness state
- feature `spec_design_links` and their authoritative specs
- relevant existing architecture, contract, domain, state, ADR, testing, guide,
  and runbook owners routed by those sources
- existing implementation plan, protocols, behavior specs, and tasks
  for reconciliation

Do not create a spec before checking the index and existing owners. A conflict
with a higher/global source is a blocker, not a local choice.

### 1.4 Schema-first invariant

Before inventing even in-memory or provisional task drafts:
1. Read and parse `.memory-bank/schemas/task.schema.json`.
2. Read `.memory-bank/workflows/tier-policy.md`.
3. Confirm the schema can represent the required task ID, fields, enums, arrays,
   dependencies, tier, and runtime context used by this workflow.

Use the loaded schema while thinking through task candidates. Do not reconstruct
it from memory. If it is missing, invalid JSON, or incompatible with required
task semantics, stop before drafting tasks and report the blocker.

Only after this point may the command create a provisional task outline.

## 2) Existing queue reconciliation

When indexed tasks already exist, default to bounded reconciliation. Full
re-slicing requires an explicit user request.

Preserve:
- `id`, `feature`, `wave`, `tier`, `depends_on`, and lifecycle `status`
- recorded `verify` evidence and protocol/evidence references
- the semantic goal and acceptance basis of `in_progress|done|failed` records

For `planned|ready|blocked` tasks, repair only grounded specs, implementation
plan, task content/context, links, and gates; lifecycle
transitions remain with the scheduler or explicit owner.

If repair requires changing identity, tier, wave, dependencies, acceptance
criteria, or material scope, report `rebuild_required` and require controlled
re-decomposition or a follow-up task. Do not hide re-slicing inside repair.

Rerun `/review-tasks-plan FT-<NNN>` after reconciliation.

## 3) Planning artifacts and provisional outline

Create or update:
- `.protocols/FT-<NNN>/plan.md`
- `.protocols/FT-<NNN>/decision-log.md`
- `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`

The implementation plan contains:
- goals, scope/non-goals, ordered implementation strategy, dependencies
- expected touched files, tests, quality gates, and UAT
- a short Constitution Check with relevant principles and blockers
- grounded Source Artifacts, Normative Inputs, Constraints, Invariants,
  Verification Targets, and `spec_design_links` when useful

Do not copy the whole Constitution or invent richer fields. Link it only when a
specific principle constrains execution or verification.
If the proposed feature plan conflicts with the Constitution, stop before task
records and report the blocker.

After the schema and tier policy are loaded, add a concise dependency-ordered
provisional outline to `plan.md`. For each candidate record only its purpose,
likely dependencies/wave/tier, and expected design pressure. This is resumable
planning state, not another task model.

Update the outline only when its structure changes, a material decision is
accepted, or the run pauses. Do not write an iteration checkpoint after every
task.

## 4) Optional behavior specs

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

## 5) Unified design-and-task loop

### 5.1 Feature design baseline

Build an initial feature-wide inventory from the sources loaded in section 1:
- existing authoritative specs needed by the feature
- `needed_before_tasks` routes and feature-local gaps
- duplicate/conflicting owners
- unresolved choices that would force implementation guessing

Feature frontmatter may contain:

```yaml
spec_design_status: complete|not_required|blocked
spec_design_links:
  - .memory-bank/tech-specs/FT-<NNN>-<slug>.md
```

Rules:
- An unresolved explicit `blocked` status must stop task drafting in preflight.
  A successful direct repair must replace it with a truthful status before the
  provisional outline. If the loop discovers a new blocker, record it and stop
  affected task/handoff writes instead of pretending the feature remains
  ready.
- `not_required` is valid only for simple work with no meaningful architecture,
  interface/contract, data, state, security, migration, runtime, or cross-module
  pressure; record a concise rationale, use empty `spec_design_links`, and create
  no fake specs.
- `complete` requires every relevant design area to have a concrete
  authoritative link or an explicit feature-level `not_applicable` rationale;
  treat an existing `complete` as a baseline to reconfirm after the loop.
- Missing/incomplete status means the loop must complete or block feature design.

Prefer one feature hub at
`.memory-bank/tech-specs/FT-<NNN>-<slug>.md` with only relevant Architecture
impact, Interfaces/Contracts, Data impact, and Verification sections. Use a
separate natural owner only when it reduces ambiguity. Keep `spec-index.md`
registry links current; shared/global readiness remains in `spec-backbone.md`.

### 5.2 Canonical concrete readiness and ownership

When a task changes or depends on a concrete boundary, exactly one linked
authoritative owner must define its:
- shape
- `MUST` / `MUST NOT` rules
- edge cases/errors
- verification target

The block must make implementation possible without guessing. This single rule
governs T2/T3 concrete design readiness throughout the command.

Select the owner in this order:
1. Extend an existing authoritative owner within its established rules.
2. Fill a concrete owner routed by `/spec-design` as `needed_before_tasks`.
3. Use the feature hub for genuinely feature-local behavior with no shared reuse.
4. Route a new/unclear shared owner or global decision to `/spec-design`.

Create a new feature-local owner only when no existing owner is suitable; record
a short rationale and register/link it from `spec-index.md` and the feature.

When a routed `needed_before_tasks` concrete block becomes sufficient, update
its Backbone Area Matrix row to `authoritative`, or to `not_applicable` with a
rationale when evidence proves the area irrelevant. Product handoff must leave
no `needed_before_tasks` row unresolved.

Examples:
- HTTP/RPC boundary -> API Contract or stack-native schema owner
- event/message boundary -> Event Contract and boundary Data Contract when
  payload compatibility matters
- internal DB/storage/migration/state -> Data Specification
- feature-local/UI behavior -> feature tech-spec hub or established guide

Data Contract owns payloads crossing component/API/event/protocol boundaries.
Internal models, DB/storage, persistence, and migrations belong to Data
Specification. Component Contract is needed only when a component boundary is
crossed or changed.

Applicable concrete owners cover:
- Component Contract: guarantees, responsibilities, dependencies, forbidden
  calls, ownership, and failure boundaries.
- API Contract: inputs/outputs, auth, status/error behavior, compatibility, and
  protocol-specific concerns such as pagination or upload when relevant.
- Event Contract: producer/consumer, envelope/fields, ordering, versioning,
  retry/idempotency, delivery, and failure behavior.
- Data Contract: boundary payload structure, versions, required fields,
  validation/serialization, and compatibility.

When creating/materially changing a concrete owner, make ownership explicit:

```markdown
## Ownership
- Owns:
- Does not own:
- Related specs:
```

Do not duplicate concrete blocks in task records, plans, or secondary
docs; link the owner and copy only task-relevant executable constraints,
invariants, and verification targets.

Keep `spec-index.md` a pure registry. Feature design status belongs only in
feature frontmatter; shared/global readiness belongs in `spec-backbone.md`.

### 5.3 Question gate

Ask `0-3` focused questions in one pass only when the answer can materially
change architecture impact, component/API/event/data contracts, storage/state,
compatibility, security, or verification.

Group related questions around the current boundary and state what decision they
unblock. If one answer affects several provisional tasks, ask once before the
first, record it in `decision-log.md`, and reuse it. Do not ask to fill a
template or reconfirm authoritative evidence.

In autonomous mode, do not invent unsafe product/design decisions. Record the
blocker and stop according to the active workflow.

### 5.4 Process each provisional task

For each candidate in dependency order:
1. Refresh only specs/routes changed by earlier iterations or newly relevant to
   this task.
2. Apply three design lenses:
   - Architecture impact: constraining boundary/source-of-truth/runtime rules
     including security/safety constraints and any new shared/global decision.
   - Interfaces/Contracts: actual component, API, event, protocol, agent/tool,
     external, or frontend/backend boundary and its concrete owner.
   - Data impact: domain rules/invariants, internal model, DB/storage,
     persistence/migration, validation/serialization, lifecycle, retention,
     seed, or runtime data path.
3. Use the question gate for material unresolved choices.
4. Update only the minimum grounded authoritative owners and registry links.
5. Apply canonical concrete readiness.
6. Write the final task record in
   `.memory-bank/tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>.task.json` and validate it
   against the already-loaded task schema before indexing it.

If design remains blocked, set/report feature design `blocked` and do not write
the affected task or hand off execution.
Use `blocked` only when the design cannot be made truthful without a user
decision or external evidence.

### 5.5 Task record semantic invariants

The loaded schema and tier policy are authoritative. Additionally:
- task ID tier/feature/wave segments match `tier`, `feature`, and `wave`
- every task has one independently verifiable outcome and grounded files/tests
- every T1/T2/T3 task links concrete governing `REQ-*` IDs in `reqs`; never use
  placeholder requirement or feature IDs
- assign tier before writing; never use the removed `risk` model
- use only dependency-driven product waves `W1+`; `W0` belongs only to `FT-000`
- downstream tasks start `planned`; `ready` requires satisfied dependencies and
  no blockers/rejects
- add the final foundation gate dependency directly or transitively when required
- populate `source_artifacts`, `normative_inputs`, `constraints`, `invariants`,
  `verification_targets`, purpose/outcome, and runtime context only from
  PRD/feature/spec/baseline evidence; use empty schema-allowed values only for
  optional fields when no evidence exists
- every T2/T3 task has non-empty `purpose` and one non-empty scalar
  `success_outcome`
- every T2/T3 task links at least one existing task-relevant authoritative SDD
  spec through its existing link-bearing fields; a registry-only
  `spec-index.md` reference is not sufficient task context
- every T2/T3 task grounds execution scope in non-empty `touched_files` and/or
  `runtime_context.allowed_write_scope`
- every T2/T3 task has at least one executable verification path: a gate with a
  real command and/or a non-empty `verification_target`
- keep runtime allowed/forbidden scope and stop conditions concrete and grounded
- keep `anti_goals`, `runtime_context.forbidden_scope`, `constraints`,
  `invariants`, `evidence_required`, and `runtime_context.stop_conditions`
  empty or absent when current evidence does not justify them; do not invent
  completeness filler
- link behavior specs only through `source_artifacts`
- include task-relevant SDD/AD/ADR/boundary links and executable constraints
- if mutable runtime data/persistence is in scope, name the real DB-backed path
  and require a read/write smoke or repository integration verification target
- if persistence is not needed, record `not_applicable` in the relevant spec
  instead of creating a fake DB task

Update `.memory-bank/tasks/index.json` with references only. Do not add another
task model or task-specific fields outside the schema.

### 5.6 Feature consistency

After all records exist:
- reread generated/updated records and authoritative owners
- repair earlier task links if a later iteration changed shared feature detail
- confirm acceptance criteria coverage, coherent dependencies/waves, and one
  owner per concrete boundary
- confirm every T2/T3 task remains implementable without guessing
- finalize truthful `spec_design_status` and `spec_design_links`

Do not leave `complete` while a relevant area is planned, candidate, unknown,
conflicting, or unresolved. Do not hand off tasks when final consistency is
blocked.

For `--all`, process features in priority order, reread `tasks/index.json` after
each feature, avoid duplicate IDs, and never start execution from this command.

## 6) T2/T3 single-card handoff completeness

After feature consistency succeeds, confirm every T2/T3 task card is complete
enough to execute directly from the indexed task plus its linked authoritative
specs:
- the record validates against `task.schema.json`, is indexed exactly once, and
  its ID tier/feature/wave segments match the record
- `reqs` contains concrete existing governing `REQ-*` IDs without placeholders
- `purpose` and the scalar `success_outcome` are non-empty
- at least one existing task-relevant authoritative SDD spec path is linked;
  `spec-index.md` alone does not count
- scope is grounded by non-empty `touched_files` and/or
  `runtime_context.allowed_write_scope`
- at least one verification path exists through a gate with a real command
  and/or a non-empty `verification_target`
- every dependency exists and the dependency graph is acyclic

This is a completeness contract for the existing task card, not a new status,
artifact, nested packet, or general readiness layer. Deterministic checks prove
only structure and presence. Semantic applicability of linked specs,
independent verifiability of `success_outcome`, concrete-block sufficiency, and
task/spec conflicts remain owned by fresh-context `/review-tasks-plan`.

Do not require non-empty optional evidence-driven fields merely to satisfy this
contract: `anti_goals`, `runtime_context.forbidden_scope`, `constraints`,
`invariants`, `evidence_required`, and `runtime_context.stop_conditions` remain
grounded-only.

## 7) Final handoff

Before handoff:
- validate every created/updated task against `task.schema.json` and its index
  reference
- confirm feature acceptance coverage and final design status
- confirm foundation dependencies and T2/T3 single-card handoff completeness
- update RTM/docs only where planning changed durable state
- report blockers explicitly

Final report:
- feature ID and queue action: `created|reconciled|rebuild_required`
- final design status and authoritative specs created/updated/used
- task records created/updated
- blockers/questions, or `none`
- next step

Next step:
- one feature: `/review-tasks-plan FT-<NNN>`, then conditional `/mb-doctor`
- `--all`: review every task-linked product feature before scheduler execution

Do not execute tasks from this command.

</process>
