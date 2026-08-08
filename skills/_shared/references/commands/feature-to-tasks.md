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
- an execution-cohesive schema-backed JSON task queue;
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
- `.memory-bank/contracts/boundary-map.md` as the canonical accepted
  module/change-unit inventory and dependency topology;
- a valid Foundation decision. When Foundation is required, the concrete
  indexed `FT-000` final gate must be `done` and its ID retained as a direct or
  transitive dependency of every product task;
- `.memory-bank/tasks/index.json`, every existing indexed task for the target,
  and existing plan/protocol/behavior evidence used for reconciliation;
- `.memory-bank/workflows/execute-loop.md#execution-cohesive-task-boundary` and
  `.memory-bank/workflows/tier-policy.md#task-claim-and-dependency-ownership`
  before slicing;
- available `.memory-bank/schemas/task.schema.json` and remaining applicable
  tier-policy sections; parse them after boundary acceptance and before drafting
  task records.

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
  `.memory-bank/workflows/tier-policy.md#closure-authority`. Planning writes
  `planned`, or `ready` only when dependencies and blockers are already
  satisfied; it does not claim scheduler closure/promotion ownership.
- Existing queue reconciliation is the default. Preserve ID, feature, wave,
  tier, dependencies, lifecycle status, verification evidence, protocol links,
  and the semantic basis of `in_progress|done|failed` records. Full re-slicing
  requires an explicit operator request.
- If repair needs identity, tier, wave, dependency, AC, or material-scope
  changes, report `rebuild_required`; do not hide a new task behind repair.
- Every task boundary satisfies
  `.memory-bank/workflows/execute-loop.md#execution-cohesive-task-boundary`.
- Product feature, architecture slice/module, and task are distinct. A feature
  may cross slices and a slice may support several features. A task normally
  has one primary owning slice/module. A task may cross slices only after the
  execution-cohesion rule leaves one indivisible outcome; an orchestration
  owner and explicit crossed boundaries establish ownership, not merge
  evidence.
- `boundary-map.md` alone owns module identity and topology; plans and tasks
  link relevant graph/contract blocks without copying the subgraph.
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
dependencies, verification strategy, Foundation dependency,
or canonical spec identity belongs to the operator.

- Interactive/manual flow asks an adaptive focused question, states what it
  unblocks, and may recommend an option; recommendation/default/silence is not
  acceptance.
- Apply an accepted answer to the existing owning feature, PRD, canonical spec,
  Constitution, or Foundation artifact; record it in
  `.protocols/FT-<NNN>/decision-log.md` when useful for handoff, remove
  contradictory wording, and revalidate before task writes.
- Route shared/global decisions to `/spec-design`, PRD-owned acceptance to
  `/write-prd`, missing REQ/AC decomposition to `/prd-to-features`, and
  feature-local ambiguity to `/feature-doctor FT-<NNN>`.
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
- task slicing and, after boundary acceptance, dependency/wave shape and
  cheapest sufficient verification;
- whether 0-3 behavior examples materially reduce real ambiguity.

Architecture, Interfaces/Contracts, Data, state, security, runtime, operations,
and Verification are completeness lenses, not a mandatory thinking order. Do
not force irrelevant categories or fabricate `not_applicable` filler.
</agent_discretion>

<required_outputs>
Edit the required outputs only when durable feature design/planning state,
accepted decisions, canonical contracts, task records, registry links, or
routing have changed, or the existing contract needs repair. Do not append
per-run audit/reconciliation history, changed-spec/task inventories,
queue-action summaries, or mirror the final chat handoff; preserve durable
decision provenance, blockers, task lifecycle/evidence, and protocol resume
state.

## Planning artifacts

Create/update only the existing artifacts:
- `.protocols/FT-<NNN>/plan.md`;
- `.protocols/FT-<NNN>/decision-log.md`;
- `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`.

The implementation plan captures goals, scope/non-goals, cohesive strategy,
dependencies, expected advisory change surface, tests/gates/UAT, applicable
Constitution constraints, source/normative inputs, invariants, verification
targets, and direct canonical links. `.protocols/FT-<NNN>/plan.md` is bounded
resume state, not another task model.

Reconcile the feature with the canonical graph before handoff. Every
task-relevant change unit and inter-module interaction must resolve to a
registered node and an accepted edge with an exact contract heading, or block.
For changed providers, cover relevant consumers until a compatible boundary
stops propagation. Leaf modules/edges inside accepted architecture preserve
Planning Revision; global architecture or ownership changes route to
`/spec-design`. The plan records only affected module/contract links and the
implementation reason for task order, dependencies, and waves.

Expected project-authored paths follow `AGENTS.md#source-path-semantics`. Carry
an evidence-backed expected path through existing plan fields and advisory
`touched_files`; leave an immaterial exact filename choice to `/exe`, not a
blocker, new task field, or hard `write_boundary`.

When the accepted architecture defines modules or capability slices, the plan
names the primary owner and code root for each outcome. A cross-slice outcome
names one accepted capability owner, crossed public boundaries, and forbidden
ownership/direct-write bypasses; business orchestration does not belong in a
transport handler, generic helper, or composition root. Missing ownership
routes to `/spec-design`. Do not derive task count from slices, layers, or files.

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

Keep a simple material-quality probe/review in the AC and task record. Use a
subject spec only for non-trivial reproducible measurement or an expert rubric;
it defines method/evidence, never a missing product target.

For an Alembic migration under an accepted linear topology, reuse the
project-level database contract for dynamic head/branch/ancestry integrity.
Keep feature testing limited to its revision, direct `down_revision`,
upgrade/downgrade, schema transition, and data preservation. Plans, specs, and
task cards must not make the mutable current head an exact-head requirement or
require historical feature-test updates.

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

Before boundary confirmation, use only authoritative feature acceptance,
current queue constraints, applicable canonical specs/owners,
`.memory-bank/workflows/execute-loop.md#execution-cohesive-task-boundary`, and
`.memory-bank/workflows/tier-policy.md#task-claim-and-dependency-ownership`.
Do not persist slicing analysis or let generated detail create authority.

Close the eligible exact claim set before slicing. Add the minimally sufficient
atomic AC for each independent material feature outcome not already covered by
an exact AC. A distinct material technical acceptance result may use an exact
single-obligation canonical locator; a multi-obligation section is context, not
a claim. Constraints, safeguards, methods, and artifact formats do not become
claims without accepted authority. Material edge/failure outcomes require an AC
or sourced exclusion; material NFRs require an accepted REQ/AC result and
verification method.

Run one slicing pass:
1. Discover recursively the unmerged grounded material units from exact claims,
   canonical semantic owners, and distinct implementation, proof,
   failure/retry/rollout/rollback surfaces; do not form tasks yet.
2. State each unit's owner-valid useful task-level implementation-and-proof
   completion. It need not close an AC or the surrounding command, invariant,
   transaction, or end-to-end flow.
3. Merge only when accepted contracts and, when available, bounded code/change
   evidence show that separate completion is impossible; otherwise keep sibling
   tasks.

Use claims and owners as split signals and assign every eligible exact claim one
resulting task owner. Existing-queue identity, tier, dependency, AC,
target/condition, or material-scope changes use `rebuild_required`; unresolved
authority uses its existing blocker route.

In direct interactive use, show the named
`unmerged units -> justified merges -> final task candidates`: each unit, each
merge with one brief grounded indivisibility reason, and each candidate outcome.
Counts alone are insufficient. For a new queue, assign no task IDs, tiers,
waves, concrete `depends_on`, or record fields before explicit boundary
acceptance. Wait for acceptance or a specific split/consolidation request;
apply requests only when contracts and execution cohesion remain valid.

After acceptance, persist the concise boundary outline in
`.protocols/FT-<NNN>/plan.md` as the first durable task-planning write.
Unattended orchestration performs the same pass without the operator checkpoint.
Keep slicing limited to direct sources and enough code/proof surface for the
boundary decision; do not persist a check/report or perform a full audit.
Slicing never silently changes an existing indexed queue.

After the boundary pass is accepted interactively or completed unattended,
parse `.memory-bank/schemas/task.schema.json` and read
`.memory-bank/workflows/tier-policy.md#tier-classification-and-escalation`,
`#hard-write-boundary`, `#task-scoped-acceptance-evidence`,
`#claim-linked-red--green-for-t2t3`, `#tier-obligations`, and
`#closure-authority`. Then assign IDs, tiers, waves, concrete `depends_on`, proof
fields, and other record content. Existing queues retain the identity and
lifecycle constraints above.

Create/reconcile
`.memory-bank/tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>.task.json` and index each
record exactly once. The loaded schema and tier policy are authoritative.

Additionally require:
- map every task-relevant feature AC through an exact
  `.memory-bank/features/FT-<NNN>-<slug>.md#FT-<NNN>-AC-<NNN>` locator in
  its owning task's `source_artifacts`, and cover every accepted feature AC.
  A grounded locator may be added to a historical task without inventing
  RED/GREEN evidence or changing its lifecycle;
- every T1/T2/T3 task has concrete governing `REQ-*` links;
- every required Foundation final-gate dependency is direct or transitive;
- for accepted module/slice boundaries, map direct architecture/graph/contract
  links, expected files, owner, crossed boundaries, and ownership/bypass rules
  through existing fields. Do not add `owning_slice`, mechanically copy a code
  root into `write_boundary`, place cross-slice business orchestration in a
  forbidden technical owner, or exclude task-required work;
- carry an applicable existing project-native architecture check through
  `gates` or `verification_targets`. If an accepted rule requires a missing
  check, plan that accepted work instead of emitting a nonexistent command;
- when a linked runtime/state rule requires reproducibility, carry its known
  initial state, safe rerun, observable result, and cleanup/isolation proof;
  do not infer this process for simple/stateless work;
- populate fields only with task-relevant grounded evidence; leave optional
  fields empty/absent. T2/T3 records satisfy tier obligations and carry advisory
  expected change surface and/or a justified hard write scope;
- an AC-linked mapping retains its exact `FT-<NNN>-AC-<NNN>` ID. A
  not-applicable mapping uses `<AC-ID> RED_NOT_APPLICABLE: <reason>;
  alternative proof: <proof>` and the tier-policy justification rule;
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
- verify task-relevant modules, edges, exact contract headings, and affected
  consumers are complete and consistent with the accepted architecture;
- map every stable feature AC locator and governing REQ to at least one task
  and every task back to feature scope without orphan, duplicate, or unrelated
  outcomes;
- reread changed specs/tasks and reconcile any shared detail changed later in
  the run;
- confirm canonical identity is unique, linked concrete blocks are sufficient,
  feature design state is truthful, and each T2/T3 card is independently
  executable without guessing;
- confirm each newly created or reconciled `planned|ready` T2/T3 card has a
  credible claim-linked RED/GREEN path or a concrete accepted not-applicable
  reason; reject inherited dependency proof, unsupported evidence requirements,
  and unsafe or permission-expanding T3 probes;
- for module/slice boundaries and advisory project-authored paths, confirm a
  fresh executor can locate the owner/root, public boundary, forbidden bypasses,
  proof path, and an expected path compliant with
  `AGENTS.md#source-path-semantics`; any remaining filename choice is immaterial;
- confirm every accepted operator decision is durably applied and no material
  branch remains unresolved.

Do not fabricate or backfill RED/GREEN evidence for historical
`in_progress|done|failed` records. Preserve their identity, lifecycle, and
accumulated evidence under the reconciliation rules above.
</validation>

<handoff_contract>
In the final chat response, report:
- feature ID and queue action `created|reconciled|rebuild_required`;
- final design status and specs reused/extended/created;
- task records created/updated;
- blockers/questions or `none`;
- immediate next step.

- Successful single-feature result -> `/review-tasks-plan FT-<NNN>`.
- Successful `--all` -> one fresh-context `/review-tasks-plan FT-<NNN>` per
  task-linked product feature.
- Blocked PRD-owned target/scope/pass-fail decision -> `/write-prd`;
  feature-local product clarification -> `/feature-doctor
  FT-<NNN>`; missing REQ/AC decomposition -> `/prd-to-features`; blocked
  shared/global decision -> `/spec-design`.

Conditional `/mb-doctor` and execution happen only after the task-plan review;
they are not performed by this command.
</handoff_contract>
