---
description: Convert an accepted Foundation Dev Path decision into the minimum FT-000 JSON queue, or prove an existing brownfield baseline.
status: active
---
# /foundation-to-tasks - Foundation decision -> FT-000 JSON tasks

Apply `.memory-bank/workflows/autonomy-policy.md` for effective settings,
host ownership, decisions, conditional artifacts, and required compact structured
flow feedback. Routes below are semantic handoffs, not instructions to launch
agents or write task lifecycle transitions.

<objective>
Turn the already accepted Foundation Dev Path decision into the smallest
executable walking-skeleton queue, using the normal JSON task model. In
`--verify-existing` mode, record a proven brownfield baseline without creating
`FT-000`, or create only the probes needed to prove it.
</objective>

<input_contract>
Supported targets: the accepted Foundation baseline, or `--verify-existing`
for a brownfield baseline assessment. Use its actual product pressure, accepted
architecture/contracts and evidence; `.memory-bank/foundation.md` is the owner
when a durable Foundation decision is needed. A prior disabled design operation
requires no backbone, positive revision, pressure map or report merely by default.
If missing meaning prevents tasking, propose initial `/spec-design` or accepted
design change `/spec-redesign` rather than inventing it.

Before drafting records, load `.memory-bank/tasks/index.json`, existing FT-000
records, `.memory-bank/schemas/task.schema.json` and
`.memory-bank/workflows/tier-policy.md` for identity, tier, hard boundaries,
claim/dependency ownership and selected proof obligations. Missing/incompatible
schema or ambiguous task identity remains a technical blocker.

Existing Foundation anchors retain `Foundation Required: true|false`,
`Foundation Requirement: REQ-000`, `Foundation Pseudo-Feature: FT-000` and
`Foundation Gate Task: pending_foundation_to_tasks|TASK-<NNN>-T<N>-FT-000-W<N>|not_required`.
Do not silently rewrite accepted baseline semantics while repairing a marker.
</input_contract>

<hard_invariants>
- Foundation is the minimum executable baseline, not product implementation or
  a future-ready platform.
- Apply the accepted architecture, composition, module/slice boundaries, and
  code roots that constrain the walking skeleton; do not revise or reinterpret
  them while tasking Foundation.
- `REQ-000`, `FT-000`, and product-foundation `W0` are reserved. Product
  features must not use `FT-000`; product tasks must not use `W0`.
- Foundation uses only `.memory-bank/tasks/TASK-*.task.json`,
  `.memory-bank/tasks/index.json`, the existing task schema/lifecycle, and the
  selected protocol/evidence paths. Do not add a foundation registry,
  schema, status machine, task fields, or protocol family.
- Task IDs use `TASK-NNN-TN-FT-000-WN`; ID tier/feature/wave segments match the
  record. Existing IDs are not renumbered.
- Lifecycle and closure ownership come from
  `.memory-bank/workflows/tier-policy.md#closure-authority`. Models author planning content; the host initializes or changes lifecycle,
  including final-gate closure. Never mark a gate `done` from a planning claim.
- `touched_files` is advisory and non-exhaustive. A non-empty
  `runtime_context.write_boundary` is a deliberate hard boundary, never a
  mechanical copy of `touched_files`; `forbidden_scope` and stop conditions
  remain hard.
- New specs use subject-based canonical paths without `FT-000` or product
  feature identity. `spec-index.md` remains
  `Type | Path | Status | Scope | Change route`, without decision bodies,
  ownership, or `used_by` metadata.
- Do not invent future endpoints, event payloads, domain behavior, state
  machines, schemas, migrations, security policy, or operational layers that
  are not needed to prove the baseline.
- When the accepted target uses capability slices, scaffold only the
  composition root and slice roots required by the walking skeleton. Do not
  create layer-centric application structure, empty future slices,
  cross-slice business behavior, or speculative shared abstractions.
- Never resolve competing canonical paths by creating a third spec.
</hard_invariants>

<operator_decisions>
Consume the accepted Foundation decision. A new material branch about necessity,
sufficiency, architecture, boundaries, storage/state, security, compatibility,
task identity, dependencies or proof uses the common decision flow. Record the
resolved choice at its canonical owner; a separate decision log is optional.
Accepted global design/Foundation changes propose `/spec-redesign` before
dependent tasking. Autonomous policy permits decisions with provenance, not
invented baseline evidence.
</operator_decisions>

<agent_discretion>
Within the accepted Foundation objective, source precedence, KISS constraints,
schema, tier policy, and hard scopes, the agent chooses:
- exploration order, tools, and working notes;
- the minimum walking skeleton and proof path;
- which applicable Architecture, Interfaces/Contracts, Data, testing, runbook,
  and evidence concerns need concrete coverage;
- `reuse|extend|create|not_applicable|block` per concern;
- the smallest cohesive task slicing, dependency shape, waves, and cheapest
  credible verification path.

Architecture, Interfaces/Contracts, Data, Verification, security, runtime, and
operations are coverage criteria driven by actual foundation pressure, not a
mandatory analysis sequence or a requirement to create every spec family.
</agent_discretion>

<required_outputs>
Edit the required outputs only when durable Foundation planning state,
accepted decisions, canonical contracts, evidence basis, task records,
registry links, or gate anchors have changed, or the existing contract needs
repair. Do not append per-run audit/reconciliation history, changed-artifact
inventories, or mirror the final chat handoff; preserve durable decision
provenance, blockers, lifecycle evidence, and protocol resume state.

When `Foundation Required: false`:
- require `Foundation Gate Task: not_required` and concise evidence/rationale;
- create no `REQ-000`, `FT-000`, foundation plans, protocols, or task records.

For `--verify-existing`, assess available executable evidence. A proven sufficient
baseline supports the no-queue state; apply a changed accepted decision through
its owner. Insufficient evidence proposes the minimum selected probes or a
concrete disposition through the decision flow; it does not automatically create
a verification queue. Skipped proof is not proof of baseline sufficiency.

When `Foundation Required: true`:
1. Reconcile only the substrate-level canonical specs needed by the proof path.
   Each material changed/depended-on concern has one canonical owner defining
   shape, `MUST`/`MUST NOT` rules, edge cases/errors, and a verification target.
   Before handoff, resolve each evidenced material boundary decision in its
   owning canonical artifact when execution would otherwise determine public or
   cross-boundary behavior, compatibility or migration, authority, or state/data
   ownership. Unresolved authority uses the existing operator-decision and
   blocker route. This constrains outcomes, not analysis order, inapplicable
   coverage, or implementation tactics.
   Typical routes are:
   - runtime/module shape -> `.memory-bank/architecture/*`;
   - component/API/event/protocol/agent/tool boundaries and crossing payloads
     -> `.memory-bank/contracts/*`;
   - internal DB/session/UoW/migration/seed/storage/state ->
     `.memory-bank/domains/*`, `.memory-bank/states/*`, or the stack-native
     schema/migration source;
   - proof harness/evidence -> `.memory-bank/testing/*`;
   - local bootstrap/runtime/troubleshooting -> `.memory-bank/runbooks/*`.
   For an accepted linear Alembic topology, reuse or create one project-level
   database contract owner that derives the single head and proves no branches
   plus intact ancestry. Do not seed a literal current head ID into Foundation
   specs, plans, or task cards.
   For an accepted capability-sliced target, preserve its composition root,
   required slice roots, public boundaries, ownership, dependency rules, and
   proof paths; do not design product behavior or additional slices here.
2. Add/update `REQ-000` as the accepted executable-baseline requirement;
   planning does not mark it verified.
3. Create/update the content of `.memory-bank/features/FT-000-foundation.md`
   with links to Foundation/REQ/specs and an explicit pseudo-feature note.
   Preserve actual host-recorded `planned|implemented|verified` lifecycle;
   return initial-state facts to the host. Clarification is omitted or truthful.
4. Use `.protocols/FT-000/plan.md`, `decision-log.md` and
   `.memory-bank/tasks/plans/IMPL-FT-000.md` only when selected or useful beyond
   complete task cards; they are not a required bundle.
5. Create/reconcile only necessary baseline implementation/probe records. When
   an integrated Foundation gate is selected or an accepted dependency requires
   it, retain exactly one final gate and its complete prerequisite links. Do not
   create a proof-only gate for disabled checks. Preserve existing gate identity
   and actual results; a change to its meaning requires a decision.
6. Recorded Gate Anchors name the actual final task or `not_required` when no
   distinct gate applies. `pending_foundation_to_tasks` is not a concrete dependency.
7. Index every record exactly once; dependency facts, not index order, govern
   execution. Product tasks retain actual baseline dependencies.

When a Foundation plan or advisory expected change surface names a new, moved,
or renamed project-authored source path, follow
`AGENTS.md#source-path-semantics`, the accepted owner/code root, and governing
framework/tooling/generator/scaffold semantics. Preserve required or reserved
filename parts, and do not infer import/module, public path, package export,
route, or build-target identities from name similarity.
Leave an immaterial exact filename choice to `/exe`; do not turn it into a task
blocker or hard `write_boundary`.

Task-record rules:
- use `feature: "FT-000"`, normally `reqs: ["REQ-000"]`, and `W0` only for
  executable-baseline work; later probe/integration waves may use `W1+`;
- return dependency/blocker facts for host lifecycle initialization:
  `ready` requires no unmet dependency or unresolved blocker, otherwise `planned`;
- choose tier only from
  `tier-policy.md#tier-classification-and-escalation`;
- populate schema fields only from evidence and leave optional grounded-only
  fields empty/absent rather than inventing filler;
- link task-relevant substrate, architecture, and boundary specs through
  existing link-bearing fields so a Foundation executor can locate every
  accepted composition/slice constraint that applies;
- every T2/T3 record has non-empty `purpose`, scalar `success_outcome`, at
  least one direct applicable canonical input, advisory expected change surface
  and/or justified hard write scope, and an applicable selected proof path.
  Accepted requirement/code/contract evidence can suffice without a disabled
  design-stage spec; no command, report or invented evidence is due for disabled
  proof.
- when proof is selected, each new/reconciled `planned|ready` T2/T3 record maps
  only its tier-policy proof scope. Dependency outcomes are prerequisites; do not
  copy
  their claims, probes, or evidence into the final gate or downstream records;
- for selected proof, `evidence_required` keeps the minimal result contract; probe method
  remains in `verification_targets` or a direct testing link. T3 covers every
  task-owned harm-driving claim required by accepted requirements or evidenced
  material risk, using only authorized isolated/disposable state with safe rerun
  and cleanup.
</required_outputs>

<validation>
Before handoff, prove:
- schema/index validity and ID/tier/feature/wave consistency;
- `REQ-000`, `FT-000`, W0, and final-gate rules;
- any selected final gate is unique with complete dependencies; the graph is acyclic;
- no task inherits dependency proof or adds unsupported evidence requirements;
- no product behavior or speculative substrate escaped the Foundation scope;
- accepted composition/module/slice boundaries were applied without inventing
  layer-centric scaffolding, extra slices, or a hard write boundary copied from
  a code root;
- advisory authored-source paths preserve accepted owner/code-root,
  naming/path, framework/tooling/generator/scaffold, and executable-identity
  semantics; any remaining exact filename choice is immaterial execution
  discretion;
- canonical-path uniqueness and spec-index purity;
- every T2/T3 card satisfies the complete single-card handoff contract;
- where proof policy requires it, new/reconciled `planned|ready` T2/T3 cards
  have a credible RED/GREEN path or concrete not-applicable reason, with
  safe coverage of its task-owned T3 risk-driving claims;
- Gate Anchors name the final gate or `not_required` truthfully;
- no affected material operator decision remains unresolved.

Do not fabricate or backfill RED/GREEN evidence for historical
`in_progress|done|done_for_prod|failed` Foundation records.
</validation>

<handoff_contract>
Return queue action, task IDs, actual baseline dependency/gate or no-queue basis,
blockers and immediate route with common feedback. Selected doctor/review checks
precede execution only under effective settings; disabled checks need no report
or verdict. Return FT-000 to the `/autonomous` Foundation owner or the caller's
Foundation execution path, never the product-only `/autopilot` queue.
No Foundation work needed -> `/feature-to-tasks FT-<NNN>`.
New baseline/design meaning -> propose `/spec-redesign` (or initial
`/spec-design`) and resume the affected planning after disposition.
</handoff_contract>
