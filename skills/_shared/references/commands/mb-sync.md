---
description: Thin adapter that reconciles already-decided task and Memory Bank state at a durable boundary.
status: active
---
# /mb-sync - Reconcile durable Memory Bank state

<objective>
Apply `.memory-bank/workflows/mb-sync.md` to reconcile already-written
authoritative task, requirement, feature/spec, index, evidence, and changelog
state. `/mb-sync` synchronizes decisions; it does not make them.
</objective>

<input_contract>
Read and follow `.memory-bank/workflows/mb-sync.md` plus only the changed or
referenced Memory Bank/task/evidence surfaces needed for this boundary.

Normal boundary is once at the end of the current wave, after the scheduler or
explicit owner has written every closure/failure/blocking decision, final task
status, and evidence link to indexed `.task.json` records. Early sync requires
a recorded current-wave dependency on reconciled RTM/index/spec/contract/
changelog state or an explicit owner request; it does not replace the final
wave-boundary sync.

Do not require full sync for a local manual T0/T1 closure when only task
`status`, task `verify`, and compact `.protocols/<TASK>/run.md` changed.
</input_contract>

<hard_invariants>
- JSON task records remain authoritative for task status, dependencies, tier,
  gates, verification targets, and evidence markers.
- Status/closure/promotion ownership comes from
  `.memory-bank/workflows/tier-policy.md` and
  `.memory-bank/workflows/mb-sync.md`.
- `/mb-sync` never infers or writes closure/failure/blocking/promotion,
  `planned -> ready`, dependent unblock, or dependent block when the explicit
  owner decision is absent.
- In scheduler mode, sync only state already written by `/autopilot` or
  `/autonomous`. In manual mode, require an already-recorded explicit owner
  decision or a direct instruction for this sync.
- `spec-index.md` remains a pure registry; no decision bodies, feature status
  maps, ownership, or reverse usage are added.
- Do not create a new task/status/boundary/design lifecycle or guess stale
  product/design state.
</hard_invariants>

<operator_decisions>
If authoritative artifacts disagree, or reconciliation exposes a new product,
design, canonical-path, contract/state/data/storage/security/compatibility,
task-boundary/tier/dependency/verification, closure, or promotion decision,
stop with a consistency gap.

Interactive flow asks the operator/explicit owner and requires the answer to be
written to the existing owning artifact before sync resumes. Unattended flow
returns the gap to the scheduler for `HALT_CLARIFICATION_REQUIRED`,
`HALT_BLOCKING_QUESTIONS`, or `HALT_QUALITY_GATES` as applicable. A
recommendation/default is not an owner decision.
</operator_decisions>

<agent_discretion>
Within the canonical sync checklist, the agent chooses inspection order, tools,
and the minimum changed surfaces needed to prove consistency. It may repair
mechanical links/routers and reconcile already-decided state, but may not create
missing product/design/lifecycle decisions.
</agent_discretion>

<required_outputs>
As applicable, reconcile:
- task index/records and evidence links;
- requirements RTM and REQ lifecycle;
- epic/feature lifecycle separately from document status;
- truthful existing spec-backbone, spec-index, feature design links/status, and
  changed canonical specs without inventing design;
- behavior-spec links as optional examples only;
- Memory Bank/root/subfolder routers;
- `.memory-bank/changelog.md` for the current wave/change.

Report consistency gaps and promotion eligibility without applying
scheduler-owned transitions.
</required_outputs>

<validation>
Run the lint/readiness checks required by
`.memory-bank/workflows/mb-sync.md`. `/autonomous` and `/autopilot` handoff
requires lint plus `/mb-doctor --strict` after sync; T3, complex T2,
Foundation/dependency/stale-doc/risky-link boundaries follow the same routed
gate. A bare skeleton or task-local manual T0/T1 closure does not gain a new
strict requirement.
</validation>

<handoff_contract>
- Successful scheduler wave sync -> return to the scheduler for lint/strict
  doctor and a separate promotion/dependent-blocking pass.
- Successful manual sync -> return to the explicit owner/next task.
- Missing owner decision or semantic contradiction -> stop and name the owning
  task/planning/design/closure repair route.
</handoff_contract>
