---
description: Turn one feature into useful design context and executable JSON tasks.
status: active
---
# /feature-to-tasks — Plan a feature

## Outcome
Reconcile one product feature's needed specs and indexed JSON tasks so another
agent can understand the result, dependencies, constraints, and verification.
Apply `.memory-bank/workflows/execute-loop.md#working-policy`,
`.memory-bank/workflows/sdd-design-contract.md`, and applicable
`.memory-bank/workflows/tier-policy.md` guidance.

Use one `FT-<NNN>` from the request or current agreed work. Clarify an ambiguous
target; `FT-000` uses `/foundation-to-tasks`. Read the feature's accepted
requirements/ACs, relevant specs, existing queue/evidence, and the installed task
schema. Missing design approvals, Planning Revision, or previous command history
do not by themselves prevent planning.

## Useful design and boundaries
Reuse or extend canonical subject specs before adding new ones. Describe a
concrete interface, data/state rule, or ownership boundary when execution would
otherwise guess its meaning. Link relevant architecture, contracts, and the
accepted dependency graph; do not copy the graph into each task.

Discuss unresolved material choices in manual work. Under authorized autonomy,
choose within scope. Apply accepted changes to the affected canonical artifacts
in the same work; owning commands are available tools, not mandatory hops.
Preserve explicit user constraints and distinguish evidence from assumptions.

Task boundaries follow independently completable implementation outcomes, not
files, layers, AC count, or test categories. Keep a result's tests and proof with
its implementation. Present a compact proposed decomposition when the operator
needs to choose; no prescribed slicing presentation, separate acceptance stage,
or fresh planning context is required.

## Task records
Use `.memory-bank/tasks/index.json` and schema-valid
`TASK-NNN-TN-FT-NNN-WN.task.json` records. Keep ID tier/feature/wave segments
consistent with fields. Product tasks use W1+; W0 is reserved for Foundation.
Preserve existing IDs and historical evidence when their meaning is unchanged.
Reconcile queued work rather than recreate it. If an authorized change really
requires an identity change, update index/dependencies/links together and retain
history; do not silently redefine completed work.

Populate the existing schema fields with task-relevant information:
- `purpose` and `success_outcome` make the motivation and observable result clear;
- `feature`, `reqs`, and exact feature AC locators in `source_artifacts` preserve
  acceptance traceability;
- `depends_on` represents actual prerequisite outcomes, including an applicable
  Foundation final gate, not a copy of module dependencies;
- `touched_files` is an advisory, non-exhaustive expected change surface;
- `normative_inputs`, `constraints`, `invariants`, `anti_goals`, and `docs` carry
  relevant context and links without copying entire specs;
- `verification_targets` describes the result/probe to check;
- `evidence_required` describes the decisive observations/artifacts needed to
  substantiate it; keep method and expected evidence distinct;
- `gates` contains existing meaningful project-native commands, not invented
  checks or a required catalogue of test levels;
- `verify` preserves actual execution/verification evidence, never planned proof
  presented as already observed.

Keep required schema keys even when their arrays are empty. Optional fields need
no filler. T2/T3 handoffs should be understandable without rediscovery of their
purpose, relevant spec, change surface, or verification path. Choose proportionate
proof; tier alone does not impose RED/GREEN or a separate review ceremony.

A non-empty `runtime_context.write_boundary` is an intentional hard boundary,
not a copy of `touched_files`. Preserve explicit forbidden scopes and stop
conditions. Do not add new fields or a second task/context registry.

Map each task-owned accepted AC through its exact
`.memory-bank/features/FT-<NNN>-<slug>.md#FT-<NNN>-AC-<NNN>` locator. Preserve
stable AC IDs and REQ links. If accepted behavior needs a missing criterion,
clarify its meaning and update the owning feature/requirements directly; do not
invent a new product target. A spec or REQ link is context unless it names an
owned observable acceptance result. Dependency proof stays with its owner.

Group production-only configuration/checks in a final `Production acceptance:`
task when needed; keep that exact prefix because scheduling recognizes it. It
depends on implementation tasks, has no dependents, and may remain planned
without blocking development. Development-required configuration stays with its
implementation outcome.

Use `planned` for future work and `ready` when actual prerequisites are met.
Retain lifecycle state and completed evidence during planning; do not manufacture
PASS results or backfill historical RED/GREEN.

## Other artifacts and checks
An `IMPL-FT-<NNN>.md` plan or `.protocols/FT-<NNN>/` notes are useful for decisions
spanning tasks; omit them when the feature/specs/cards already suffice. Optional
behavior examples remain `given/when/then` JSON linked through `source_artifacts`,
not new gates or proof obligations.

Keep feature `spec_design_status: complete|not_required|blocked` and relevant
`spec_design_links` truthful. Clear resolved reconciliation markers. Validate
changed JSON/index entries, IDs, dependency existence/cycles, AC links, and the
specific assumptions needed to execute. An actual gap blocks only affected work.

## Handoff
Report the tasks, meaningful planning changes, and unresolved questions. Execution
can continue when its actual inputs are sufficient. `/review-tasks-plan` and
`/mb-doctor` are available checks; neither is an automatic permission gate.
