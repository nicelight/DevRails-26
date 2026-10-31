---
description: Plan or reconcile one product feature into canonical SDD coverage, an implementation plan, and complete JSON task cards.
status: active
---
# /feature-to-tasks - Feature design -> implementation plan -> JSON tasks

Apply `.memory-bank/workflows/autonomy-policy.md` for effective settings,
host ownership, decisions, conditional artifacts, and required compact structured
flow feedback. Routes below are semantic handoffs, not instructions to launch
agents or write task lifecycle transitions.

<objective>
Close or safely reconcile one product feature's tasking surface:
- applicable feature-level SDD concern coverage and canonical spec links;
- an implementation plan when useful/selected;
- optional evidence-grounded behavior examples;
- an execution-cohesive schema-backed JSON task queue;
- usable single-card handoff with selected proof obligations.

This command plans; it never executes tasks.
</objective>

<input_contract>
Accept exactly one product `FT-<NNN>` supplied by the caller/user; request a
missing target through common feedback. Reject FT-000 and multi-feature targets;
Foundation tasking belongs to `/foundation-to-tasks`.

Use accepted feature scope/AC/REQ, relevant product and Constitution evidence,
canonical specs, code and prior planning/evidence when present. Missing artifacts
from disabled design/framing/review stages do not block tasking by default.
A real material product or boundary gap still needs its owning decision.

Load `.memory-bank/tasks/index.json`, all indexed target records,
`.memory-bank/schemas/task.schema.json`,
`.memory-bank/workflows/execute-loop.md#execution-cohesive-task-boundary`,
`#fresh-feature-tasking-boundary`, `.memory-bank/workflows/tier-policy.md`, and
`.memory-bank/workflows/sdd-design-contract.md` before durable task drafts.
Preserve any accepted backbone revision and canonical boundary-map topology.
When Foundation is an actual prerequisite, retain its concrete dependencies;
planning may describe dependent work before they finish, but cannot declare it
runnable. No Foundation gate is invented for a disabled operation.

An unresolved relevant clarification/design blocker or missing/incompatible
schema blocks affected drafting. `PLANNING_RECONCILIATION_REQUIRED` requests
reconciliation, not an automatic halt. Absent optional metadata is allowed.
</input_contract>

<hard_invariants>
- JSON task records and `.memory-bank/tasks/index.json` are the only task model.
  Do not add a schema, registry, planning mode field, nested context model, or
  lifecycle value.
- Concrete IDs use `TASK-NNN-TN-FT-NNN-WN`; ID tier/feature/wave segments match
  record fields. Product tasks use dependency-driven `W1+`; `W0` belongs only
  to `FT-000`.
- Lifecycle/status ownership is defined by
  `.memory-bank/workflows/tier-policy.md#closure-authority`. Models supply planning content and dependency/blocker facts; the host
  initializes `planned|ready` and owns all lifecycle writes. `ready` needs
  satisfied dependencies and no unresolved blocker.
- Existing queue reconciliation is the default. Preserve ID, feature, wave,
  tier, dependencies, lifecycle status, verification evidence, protocol links,
  and the semantic basis of `in_progress|done|done_for_prod|failed` records. Full re-slicing
  requires a decision under the common flow.
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
Material product/acceptance, architecture, contract, state/data, security,
compatibility, identity/tier/dependency, proof or canonical-path choices use the
common decision flow. Record decisions with provenance at the existing owner;
separate decision logs are optional.

Proposed repair owners: PRD targets -> `/write-prd`; REQ/AC decomposition ->
`/prd-to-features`; accepted shared/global design -> `/spec-redesign`; initial
needed design -> `/spec-design`. `/feature-doctor FT-<NNN>` can triage unclear
feature semantics or ownership; it is not a required intermediate gate.
Do not re-ask settled choices. Autonomous policy permits semantic decisions
throughout the run; missing facts and manual stops remain effective.
</operator_decisions>

<agent_discretion>
Within the objective, authoritative evidence, hard boundaries, schema, and tier
policy, the agent chooses:
- discovery/read order, tools, temporary working notes, and proportional depth;
- how to identify applicable concerns and canonical candidates;
- whether a resumable concern note is useful or an in-memory audit is enough;
- `reuse|extend|create|not_applicable|block` for each applicable concern;
- the minimal canonical artifact shape;
- task slicing, dependency/wave shape and
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

Use the following existing paths only when a plan/log is selected or adds
needed durable meaning beyond task cards:
- `.protocols/FT-<NNN>/plan.md`;
- `.protocols/FT-<NNN>/decision-log.md`;
- `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`.

The implementation plan captures goals, scope/non-goals, cohesive strategy,
dependencies, expected advisory change surface, selected tests/gates/UAT, applicable
Constitution constraints, source/normative inputs, invariants, verification
targets, and direct canonical links. `.protocols/FT-<NNN>/plan.md` is bounded
resume state, not another task model.

When an accepted canonical graph applies, reconcile every task-relevant change
unit and inter-module interaction with its node, edge and exact contract heading.
Do not require a graph file for work with no relevant designed boundary.
For changed providers, cover relevant consumers until a compatible boundary
stops propagation. Leaf modules/edges inside accepted architecture preserve
Planning Revision; global architecture or ownership changes route to
`/spec-redesign`. The plan records only affected module/contract links and the
implementation reason for task order, dependencies, and waves.

Expected project-authored paths follow `AGENTS.md#source-path-semantics`. Carry
an evidence-backed expected path through existing plan fields and advisory
`touched_files`; leave an immaterial exact filename choice to `/exe`, not a
blocker, new task field, or hard `write_boundary`.

When the accepted architecture defines modules or capability slices, the plan
names the primary owner and code root for each outcome. A cross-slice outcome
names one accepted capability owner, crossed public boundaries, and forbidden
ownership/direct-write bypasses; business orchestration does not belong in a
transport handler, generic helper, or composition root. Missing accepted
ownership routes to `/spec-redesign`. Do not derive task count from slices,
layers, or files.

## Canonical SDD coverage

For each changed or depended-on concrete concern, select exactly one action:
- `reuse`: one canonical path is sufficient;
- `extend`: the same cohesive canonical concern needs grounded detail;
- `create`: no suitable canonical spec exists;
- `not_applicable`: evidence proves the concern irrelevant;
- `block`: identity/scope/decision remains unresolved.

A task changing or depending on a material boundary links its canonical owner
with sufficient:
- shape;
- `MUST` / `MUST NOT` rules;
- edge cases/errors;
- selected verification target when applicable.

Accepted requirement/code/contract input may suffice when design is disabled;
create a separate subject spec only when necessary to resolve durable meaning.

Before handoff, resolve each evidenced material boundary decision in its owning
canonical artifact when execution would otherwise determine public or
cross-boundary behavior, compatibility or migration, authority, or state/data
ownership. Unresolved authority uses the existing operator-decision and blocker
route. This constrains outcomes, not analysis order, inapplicable coverage, or
implementation tactics.

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

When design state is recorded, feature frontmatter remains:

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
- no applicable unresolved `needed_before_tasks` concern may be represented as
  ready; unrelated rows or an omitted matrix do not block this feature.
- Successful reconciliation removes `PLANNING_RECONCILIATION_REQUIRED` even
  when no artifact change was needed; blocked/incomplete handoff keeps it.

## Optional behavior specs

Create 0-3 short files only when a grounded example materially reduces
ambiguity:

```text
.memory-bank/behavior-specs/FT-<NNN>-BHV-<NNN>-<slug>.behavior.json
```

Use only `id`, `feature_id`, `title`, `given`, `when`, and `then`; link the
relevant examples as described by the hard invariant above.

## JSON task records

Use accepted feature outcomes, current queue constraints and applicable
canonical owners to derive task boundaries. Generated detail does not create
authority, and no slicing report or fixed thinking order is required.

Close the eligible exact claim set before slicing. Add the minimally sufficient
atomic AC for each independent material feature outcome not already covered by
an exact AC. A distinct material technical acceptance result may use an exact
single-obligation canonical locator; a multi-obligation section is context, not
a claim. Constraints, safeguards, methods, and artifact formats do not become
claims without accepted authority. Material edge/failure outcomes require an AC
or sourced exclusion; material NFRs require an accepted REQ/AC result and
verification method.

Slicing constraints:
1. Enumerate grounded material implementation/change outcomes exposed by exact
   claims and canonical owners.
2. Keep proof, tests, probes, RED/GREEN, and UAT with their implementation task;
   they do not create task boundaries.
3. Group all production-only configuration and checks (ports, SSH, policies,
   service users, external scans, recovery) into one final, highest-wave
   `Production acceptance:` task. It depends on all implementation tasks, has no
   dependents, and may remain `planned` without blocking development.
   Development-required configuration stays with its implementation task.
4. Split only independently completable implementation/change outcomes under
   accepted contracts and available code/change evidence.

Assign claims and locators to owning tasks after slicing; they do not determine
task count. Existing-queue identity, tier, dependency, AC, target/condition, or
material-scope changes use `rebuild_required`; unresolved authority uses its
existing blocker route.

A materially ambiguous slicing decision or an existing-queue rebuild proposes
concrete task outcomes and the reason for splitting/merging through the common
decision flow. Routine unambiguous slicing inside accepted scope needs no extra
approval checkpoint. Preserve existing identity and history; never quietly
re-slice indexed work. Persist only enough boundary rationale for recovery.

Assign IDs, tiers, waves, dependencies and selected proof fields using the loaded
schema and tier policy. Neither a proof preference nor a missing disabled report
may create a new task boundary or mandatory check.

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
- actual required Foundation dependencies remain direct or transitive;
- for accepted module/slice boundaries, map direct architecture/graph/contract
  links, expected files, owner, crossed boundaries, and ownership/bypass rules
  through existing fields. Do not add `owning_slice`, mechanically copy a code
  root into `write_boundary`, place cross-slice business orchestration in a
  forbidden technical owner, or exclude task-required work;
- when selected or required by explicit accepted policy, carry an applicable
  existing project-native architecture check through
  `gates` or `verification_targets`. If an accepted rule requires a missing
  check, plan that accepted work instead of emitting a nonexistent command;
- when selected proof for a linked runtime/state rule requires reproducibility,
  carry its known
  initial state, safe rerun, observable result, and cleanup/isolation proof;
  do not infer this process for simple/stateless work;
- populate fields only with task-relevant grounded evidence; leave optional
  fields empty/absent. T2/T3 records satisfy tier obligations and carry advisory
  expected change surface and/or a justified hard write scope;
- selected proof retains its exact `FT-<NNN>-AC-<NNN>` mapping. A
  not-applicable mapping uses `<AC-ID> RED_NOT_APPLICABLE: <reason>;
  alternative proof: <proof>` and the tier-policy justification rule;
- mutable persistence names its actual runtime storage path and applicable
  selected read/write or integration proof; do not invent persistence concerns.
</required_outputs>

<validation>
Before handoff:
- validate every changed record against the loaded schema and its unique index
  entry;
- verify ID/tier/feature/wave consistency, concrete REQ links, valid Foundation
  dependencies, existing/acyclic dependencies, and legal initial statuses;
- preserve an existing Planning Revision during feature/task reconciliation;
  disabled global design needs no invented positive revision;
- where an accepted graph applies, verify task-relevant modules, edges, exact
  contract headings and consumers are consistent; an absent disabled design
  artifact alone does not block tasking;
- map every stable feature AC locator and governing REQ to at least one task
  and every task back to feature scope without orphan, duplicate, or unrelated
  outcomes;
- reread changed specs/tasks and reconcile any shared detail changed later in
  the run;
- confirm canonical identity is unique, linked concrete blocks are sufficient,
  feature design state is truthful, and each T2/T3 card is independently
  executable without guessing;
- when selected proof policy requires it, confirm new/reconciled `planned|ready`
  T2/T3 cards have credible claim-linked RED/GREEN or a concrete not-applicable
  reason; reject inherited dependency proof, unsupported evidence requirements,
  and unsafe or permission-expanding T3 probes;
- for module/slice boundaries and advisory project-authored paths, confirm a
  fresh executor can locate the owner/root, public boundary, forbidden bypasses,
  proof path, and an expected path compliant with
  `AGENTS.md#source-path-semantics`; any remaining filename choice is immaterial;
- confirm every accepted operator decision is durably applied and no material
  branch remains unresolved.

Do not fabricate or backfill RED/GREEN evidence for historical
`in_progress|done|done_for_prod|failed` records. Preserve their identity, lifecycle, and
accumulated evidence under the reconciliation rules above.
</validation>

<handoff_contract>
Return the common structured feedback with:
- feature ID and queue action `created|reconciled|rebuild_required`;
- final design status and specs reused/extended/created;
- task records created/updated;
- blockers/questions or `none`;
- immediate next step.

- Successful single-feature result -> enabled `/review-tasks-plan FT-<NNN>`,
  otherwise the prepared queue and next selected readiness/execution operation.
- Blocked PRD-owned target/scope/pass-fail decision -> `/write-prd`;
  feature-local product clarification -> `/feature-doctor
  FT-<NNN>`; missing REQ/AC decomposition -> `/prd-to-features`; blocked
  shared/global decision -> `/spec-redesign`.

Selected doctor checks and execution are host handoffs, not actions performed
by this command. Disabled task review requires no APPROVE or report.
</handoff_contract>
