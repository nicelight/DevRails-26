---
description: Plan or reconcile one product feature into canonical SDD coverage, an implementation plan, and complete JSON task cards.
status: active
---
# /feature-to-tasks - Feature design -> implementation plan -> JSON tasks

<objective>
Close or safely reconcile one product feature's tasking surface:
- applicable feature-level SDD concern coverage and canonical spec links;
- one implementation plan;
- optional evidence-grounded behavior examples;
- the smallest cohesive schema-backed JSON task queue;
- verification-ready T2/T3 single-card handoff.

This command plans; it never executes tasks.
</objective>

<input_contract>
`$ARGUMENTS`:
- `FT-<NNN>`: one product feature;
- `--all`: every product feature in priority order, excluding `FT-000`.

Without arguments, ask the operator to select a feature in interactive mode;
unattended orchestration uses `--all`. Reject `FT-000`; Foundation tasking
belongs to `/foundation-to-tasks`.

Before any durable plan or task write, require:
- target feature, linked epic, governing REQ/RTM, clarified PRD, and applicable
  Constitution rules;
- `.memory-bank/spec-backbone.md` Global Backbone Status `complete`, or valid
  `minimal` with explicit global/shared not-applicable rationales, and positive
  integer `Planning Revision`;
- `.memory-bank/spec-index.md` plus existing feature links and plausible
  subject-based canonical specs;
- a valid Foundation decision. When Foundation is required, the concrete
  indexed `FT-000` final gate must be `done` and its ID retained as a direct or
  transitive dependency of every product task;
- `.memory-bank/tasks/index.json`, every existing indexed task for the target,
  and existing plan/protocol/behavior evidence used for reconciliation;
- parsed `.memory-bank/schemas/task.schema.json` and
  `.memory-bank/workflows/tier-policy.md` before drafting even provisional task
  records.

Block task drafting when clarification is explicitly `pending|blocked`, feature
design is `blocked`, a decomposition-relevant unresolved marker remains, global
backbone/foundation readiness is invalid, or schema/tier policy is unavailable
or incompatible. Missing clarification metadata alone is allowed.

For `--all`, preflight the complete target set before planning writes. Report
all blockers and create no partial affected queue. After that preflight, keep
the active planning working set to one feature at a time before moving to the
next target. This is bounded working focus, not a physical context reset or a
new execution mode.
</input_contract>

<hard_invariants>
- JSON task records and `.memory-bank/tasks/index.json` are the only task model.
  Do not add a schema, registry, planning mode field, nested context model, or
  lifecycle value.
- Concrete IDs use `TASK-NNN-TN-FT-NNN-WN`; ID tier/feature/wave segments match
  record fields. Product tasks use dependency-driven `W1+`; `W0` belongs only
  to `FT-000`.
- Lifecycle/status ownership is defined by
  `.memory-bank/workflows/tier-policy.md`. Planning writes `planned`, or
  `ready` only when dependencies and blockers are already satisfied; it does
  not claim scheduler closure/promotion ownership.
- Existing queue reconciliation is the default. Preserve ID, feature, wave,
  tier, dependencies, lifecycle status, verification evidence, protocol links,
  and the semantic basis of `in_progress|done|failed` records. Full re-slicing
  requires an explicit operator request.
- If repair needs identity, tier, wave, dependency, AC, or material-scope
  changes, report `rebuild_required`; do not hide a new task behind repair.
- One task has one cohesive independently verifiable outcome. Do not split by
  file, module, layer, artifact, or tests. Split only for independent outcomes,
  hard dependencies/waves, or materially different risk/rollback. Task count
  is not an optimization target.
- Product feature, architecture slice/module, and task are distinct. A feature
  may cross slices and a slice may support several features. A task normally
  has one primary owning slice/module, but a cohesive cross-slice outcome is
  valid when one orchestration owner and every crossed boundary are explicit.
- `touched_files` is advisory and non-exhaustive. A non-empty
  `runtime_context.write_boundary` is a deliberate hard boundary and not a
  copy of `touched_files`; `forbidden_scope` and stop conditions remain hard.
- Features compose product behavior and canonical links; they do not own
  default `FT-*` multi-concern design hubs.
- New specs use subject-based canonical paths.
- `spec-index.md` remains the pure
  `Type | Path | Status | Scope | Change route` registry.
- Never resolve competing canonical paths by creating a third spec.
- Behavior specs are optional JSON `given/when/then` examples linked only
  through feature `## Behavior specs` and task `source_artifacts`. They are not
  a registry, schema, task field, readiness gate, verification target, or done
  criterion.
</hard_invariants>

<operator_decisions>
Any unresolved material branch that can change product behavior, UX/acceptance,
architecture, component/API/event/data/agent-tool contracts, storage/state,
security/privacy/compliance, compatibility, task boundaries, tier,
dependencies, verification strategy, human checkpoint, Foundation dependency,
or canonical spec identity belongs to the operator.

- Interactive/manual flow asks an adaptive focused question, states what it
  unblocks, and may recommend an option; recommendation/default/silence is not
  acceptance.
- Apply an accepted answer to the existing owning feature, PRD, canonical spec,
  Constitution, or Foundation artifact; record it in
  `.protocols/FT-<NNN>/decision-log.md` when useful for handoff, remove
  contradictory wording, and revalidate before task writes.
- Shared/global decisions and competing canonical paths route to
  `/spec-design`; feature product ambiguity routes to
  `/feature-doctor FT-<NNN>` or its owning feature source.
- Unattended flow records the question and affected scope, writes no affected
  tasks, returns `HALT_CLARIFICATION_REQUIRED` for product clarification or
  `HALT_BLOCKING_QUESTIONS` for design/contract decisions, and names the exact
  interactive resume skill.

Do not ask again when authoritative evidence or an accepted policy already
settles the decision. Independent read-only analysis may continue without
predetermining the branch.
</operator_decisions>

<agent_discretion>
Within the objective, authoritative evidence, hard boundaries, schema, and tier
policy, the agent chooses:
- discovery/read order, tools, temporary working notes, and proportional depth;
- how to identify applicable concerns and canonical candidates;
- whether a resumable concern note is useful or an in-memory audit is enough;
- `reuse|extend|create|not_applicable|block` for each applicable concern;
- the minimal canonical artifact shape;
- task slicing, dependency/wave shape, and cheapest sufficient verification;
- whether 0-3 behavior examples materially reduce real ambiguity.

Architecture, Interfaces/Contracts, Data, state, security, runtime, operations,
and Verification are completeness lenses, not a mandatory thinking order. Do
not force irrelevant categories or fabricate `not_applicable` filler.
</agent_discretion>

<required_outputs>
## Planning artifacts

Create/update only the existing artifacts:
- `.protocols/FT-<NNN>/plan.md`;
- `.protocols/FT-<NNN>/decision-log.md`;
- `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`.

The implementation plan captures goals, scope/non-goals, cohesive strategy,
dependencies, expected advisory change surface, tests/gates/UAT, applicable
Constitution constraints, source/normative inputs, invariants, verification
targets, and direct canonical links. A concise provisional outline may be kept
in `plan.md` only when it improves resume safety; it is not another task model.

When the accepted architecture defines modules or capability slices, the plan
also identifies the primary owning slice/module and code root for each planned
outcome. A cross-slice outcome names one orchestration owner, the public
boundaries crossed, and the ownership or direct-write bypasses that remain
forbidden. That owner must be one capability slice; do not place business
orchestration in an HTTP/UI/bot handler, generic utility/shared helper, or the
composition root. Use an owner already accepted in the global architecture;
if none applies unambiguously, route the material boundary to `/spec-design`
instead of creating an orchestration slice during task planning. Do not derive
task count from slice, layer, or file count.

## Canonical SDD coverage

For each changed or depended-on concrete concern, select exactly one action:
- `reuse`: one canonical path is sufficient;
- `extend`: the same cohesive canonical concern needs grounded detail;
- `create`: no suitable canonical spec exists;
- `not_applicable`: evidence proves the concern irrelevant;
- `block`: identity/scope/decision remains unresolved.

A task that changes or depends on a concrete boundary must link exactly one
applicable canonical spec defining:
- shape;
- `MUST` / `MUST NOT` rules;
- edge cases/errors;
- verification target.

Direct routes include Architecture Specification, Component/API/Event/Data
Contracts, Data Specification for internal models/storage/migrations, domain or
state specs, testing specs under `.memory-bank/testing/*`, guides/runbooks, and
applicable AD/ADR/boundary decisions. Data Contract covers payloads crossing
boundaries; internal DB/
storage/persistence belongs to Data Specification. Create a new subject-based
spec only after existing identity and synonyms are checked. Do not expand a
legacy `.memory-bank/tech-specs/FT-*.md` hub as the canonical T2/T3 answer.

Feature frontmatter remains:

```yaml
spec_design_status: complete|not_required|blocked
spec_design_links:
  - .memory-bank/contracts/<subject>.md
```

- `complete` requires every applicable feature concern to have one canonical
  link or a grounded not-applicable rationale;
- `not_required` is only for truly local/simple work with empty links and a
  rationale;
- unresolved concern means `blocked` and no affected task handoff;
- no `needed_before_tasks` Backbone Area Matrix row may remain after a
  successful handoff.

## Optional behavior specs

Create 0-3 short files only when a grounded example materially reduces
ambiguity:

```text
.memory-bank/behavior-specs/FT-<NNN>-BHV-<NNN>-<slug>.behavior.json
```

Use only `id`, `feature_id`, `title`, `given`, `when`, and `then`; link the
relevant examples as described by the hard invariant above.

## JSON task records

Before initially emitting JSON task records, form provisional candidates and
run one bounded execution-path sanity check per candidate. Inspect only one
plausible evidence-backed path from the first necessary change through the main
implementation steps to the observable outcome and cheapest sufficient
verification. Use the target feature, direct canonical specs, necessary
dependency records, and the plausible code/change surface when available.

Look only for hidden work that changes the task boundary. Retain a cohesive
candidate; re-slice when the path exposes an independent prerequisite or
outcome, a separate rollout/rollback unit, a blocking dependency, or materially
different risk/tier route; use the existing blocker and operator-decision route
when a material branch remains unresolved. End the check as soon as that
boundary decision is possible. Do not compare speculative architectures, write
pseudocode, perform an unrelated full audit, persist the check, or add a field,
artifact, status, or report. Newly produced candidates receive the same bounded
check before emission.

This check does not silently re-slice an existing indexed queue. If it exposes
a material identity, dependency, tier, AC, or scope change during
reconciliation, use the existing `rebuild_required` route.

Create/reconcile
`.memory-bank/tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>.task.json` and index each
record exactly once. The loaded schema and tier policy are authoritative.

Additionally require:
- every T1/T2/T3 task has concrete governing `REQ-*` links;
- every task has a cohesive, independently observable outcome and grounded
  dependency graph;
- every required Foundation final-gate dependency is direct or transitive;
- fields such as `source_artifacts`, `normative_inputs`, `constraints`,
  `invariants`, `verification_targets`, purpose/outcome, and runtime context
  contain only task-relevant evidence;
- for a task governed by accepted module/slice boundaries, put the directly
  relevant architecture and boundary paths in existing `source_artifacts`
  and/or `normative_inputs`, the expected code surface in advisory
  `touched_files`, and applicable ownership/bypass rules in existing
  constraints, invariants, anti-goals, or runtime context;
- express the primary owning slice/module and any cross-slice orchestration
  through those existing fields and linked specs; do not add an `owning_slice`
  field, mechanically copy a slice code root into `write_boundary`, or forbid
  task-required tests, migrations, composition, or public-contract changes;
- for a cross-slice task, make the owning capability and the prohibition on
  transport-handler, generic-util, and composition-root business orchestration
  directly legible through existing linked specs and constraint fields;
- optional `anti_goals`, forbidden scope, constraints, invariants,
  `evidence_required`, and stop conditions remain empty/absent when not
  grounded;
- every T2/T3 task has non-empty `purpose`, scalar `success_outcome`, and the
  direct task-relevant subset of canonical specs through existing SDD paths;
  it also carries advisory
  expected change surface and/or a deliberate hard write scope, and at least
  one real gate command and/or non-empty verification target;
- mutable persistence names the real runtime storage path and a read/write or
  repository-integration proof; otherwise the applicable spec records why it
  is not relevant.
</required_outputs>

<validation>
Before handoff:
- validate every changed record against the loaded schema and its unique index
  entry;
- verify ID/tier/feature/wave consistency, concrete REQ links, valid Foundation
  dependencies, existing/acyclic dependencies, and legal initial statuses;
- verify the positive Planning Revision remained unchanged during feature/task
  reconciliation;
- map every feature AC/REQ to at least one task and every task back to feature
  scope without orphan, duplicate, or unrelated outcomes;
- reread changed specs/tasks and reconcile any shared detail changed later in
  the run;
- confirm canonical identity is unique, linked concrete blocks are sufficient,
  feature design state is truthful, and each T2/T3 card is independently
  executable without guessing;
- when accepted module/slice boundaries apply, confirm a fresh executor can
  locate the primary owner/code root, public boundary, forbidden bypasses,
  eligible cross-slice orchestration owner when relevant, forbidden technical
  placements for that orchestration, and proof path directly from the card and
  its linked specs;
- confirm every accepted operator decision is durably applied and no material
  branch remains unresolved.

Final report:
- feature ID and queue action `created|reconciled|rebuild_required`;
- final design status and specs reused/extended/created;
- task records created/updated;
- blockers/questions or `none`;
- immediate next step.
</validation>

<handoff_contract>
- Successful single-feature result -> `/review-tasks-plan FT-<NNN>`.
- Successful `--all` -> one fresh-context `/review-tasks-plan FT-<NNN>` per
  task-linked product feature.
- Blocked product decision -> `/feature-doctor FT-<NNN>` or owning feature
  repair; blocked shared/global decision -> `/spec-design`.

Conditional `/mb-doctor` and execution happen only after the task-plan review;
they are not performed by this command.
</handoff_contract>
