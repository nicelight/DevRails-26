---
description: Выполнение одной TASK-NNN-TN-FT-NNN-WN как implementation handoff: read, preflight, protocol, implement, local gates, evidence, handoff.
status: active
---

# /execute - Execute One TASK

<objective>
Implement one scoped JSON task and produce protocol/evidence for the next owner.
`/execute` is not a scheduler. In manual mode it may close only simple `T0` /
`T1` tasks when explicit top-level closure ownership and all fast-lane
conditions are satisfied; otherwise it produces handoff evidence for the next
owner.
</objective>

<process>

## Status Transition Modes

Status transitions have two modes.

Scheduler mode:
- `/autopilot` and `/autonomous` own task status transitions.
- Scheduler decides closure/failure/blocking eligibility.
- `/execute` returns scoped implementation handoff; it does not close tasks.
- `/verify` gives functional verdict/evidence; in scheduler mode it does not close/fail/block/promote.
- `/red-verify` gives semantic verdict for per-task T3 checks and T2 feature-completion checks; in scheduler mode it does not close/fail/block/promote.
- Scheduler must write the closure/failure/blocking decision, final task status, and evidence links to the authoritative indexed `.memory-bank/tasks/TASK-*.task.json` record before `/mb-sync`.
- `/mb-sync` records/reconciles already-written task state. It does not decide closure/failure/blocking/promotion and must not sync a decision that exists only in scheduler context.
- T0/T1 scheduler closure may use compact evidence / functional PASS according to tier policy.
- T2 scheduler task closure requires full protocol, applicable task/spec gates, and `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, recorded in the feature doc.
- `FT-000` is the Foundation Dev Path pseudo-feature and does not participate in product feature-completion semantics.
- T3 scheduler task closure requires full protocol, applicable task/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires exact markers `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`.

Manual mode:
- Expected T0/T1 simple flow: `/execute TASK`, compact local evidence, and optional closure by the explicit manual top-level owner.
- Manual closure is allowed only when an explicit closure owner exists.
- `explicit standalone owner` means either the user directly asked the current top-level agent to close the task, or the top-level agent/orchestrator explicitly runs a manual workflow for one TASK and records that it owns closure. Subagents/worker prompts do not silently become closure owners.
- `/execute` may close a `T0` / `T1` task only when the current agent is the manual top-level executor, explicit closure ownership is present, scope stayed task-local, no T2/T3 trigger appeared, and compact evidence was written.
- When those conditions pass, `/execute` may write/update `.protocols/<TASK>/run.md`, append compact PASS evidence to task `verify`, and set `status: done`.
- When any condition is missing, `/execute` leaves the task open and reports the next owner action: run `/verify`, ask the explicit owner to close, or use the tier-escalation handoff when scope requires a higher tier.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- `T2` manual task closure requires `/verify PASS` plus full protocol and applicable task/spec gates; per-task `/red-verify` is optional, while T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc.
- `T3` manual task closure requires `/verify PASS` plus per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass` before `status: done` or `/mb-sync`; if semantic-pass is absent, leave closure pending or blocked, not done.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Do not mix scheduler mode and manual mode inside one task run.
- No persisted `mode` field is used.

## 0) Input
Expected `$ARGUMENTS`:
- `TASK-<NNN>-T<N>-FT-<NNN>-W<N>`

Required sources:
- `.memory-bank/tasks/index.json`
- `.memory-bank/tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>.task.json`
- `.memory-bank/workflows/tier-policy.md`
- task-relevant feature, epic, requirements, or normative docs only when they
  are needed to interpret the selected task or are referenced by the task
- linked authoritative SDD specs only when the task record or linked feature
  actually references them

Do not load planning/global docs by default for manual execution. For `T0` /
`T1`, avoid `.memory-bank/constitution.md`, `.memory-bank/mbb/index.md`,
`.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`,
`.memory-bank/index.md`, role docs, and broad planning docs unless the selected
task, feature, tier, or linked specs route to them. For `T2` / `T3`, load
task-linked authoritative spec context according to tier policy.

Use richer task fields when present:
- `purpose`
- `success_outcome`
- `anti_goals`
- `source_artifacts`
- `normative_inputs`
- `constraints`
- `invariants`
- `verification_targets`
- `runtime_context`

Boundary notes are not a separate artifact flow. If the task links
`.memory-bank/contracts/boundary-map.md` or other boundary/contract specs
through existing task fields, read them as part of the authoritative context and
copy only task-relevant executable limits into the protocol notes.

Behavior specs are optional concrete examples. If task `source_artifacts`
contains `.memory-bank/behavior-specs/*.behavior.json`, read those files as
implementation context after the task record and linked feature. They may help
interpret a concrete `given / when / then` flow, but they are not authoritative
SDD specs and must not override task records, acceptance criteria, tier policy,
or linked normative specs. If a behavior spec conflicts with authoritative
inputs, note the drift and use the authoritative inputs; stop only when the
remaining task context is unsafe or contradictory.

Scan richer task fields and linked feature `spec_design_links` for authoritative
SDD spec links. For this rule, authoritative SDD spec links are links to
`.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`,
`.memory-bank/tech-specs/`,
`.memory-bank/architecture/`, `.memory-bank/contracts/`,
`.memory-bank/domains/`, `.memory-bank/states/`, `.memory-bank/adrs/`,
`.memory-bank/testing/`, `.memory-bank/guides/`, or `.memory-bank/runbooks/`.

Guides may be authoritative for frontend component behavior or an operating
procedure. For `T2` / `T3`, guide-only context does not replace a relevant
architecture, contract, domain, state, or testing spec when that concern is in
scope.

Apply the enhanced SDD taxonomy only to task-relevant design pressure:
- Architecture Specification: system/module shape, source of truth, runtime or
  deployment constraints, and applicable Architecture Spine/ADR decisions.
- Component Contract: guarantees, responsibilities, dependencies,
  allowed/forbidden calls, ownership, and failure boundaries for a changed or
  crossed component/module boundary.
- API Contract: inputs/outputs, auth, status/error behavior, compatibility, and
  protocol-specific rules for a changed API boundary.
- Event Contract: producer/consumer, envelope/fields, ordering, versioning,
  retry/idempotency, delivery, and failure behavior for changed events/messages.
- Data Contract: payload shape, required fields, versions,
  validation/serialization, and compatibility when data crosses a boundary.
- Data Specification: internal models, DB/storage ownership, persistence,
  migrations, lifecycle, retention, seed data, and internal runtime data paths.

Do not require irrelevant spec families. For each changed or depended-on design
boundary, require exactly one applicable authoritative owner and follow its
concrete block instead of treating any generic SDD link as sufficient.

Missing richer fields or absent SDD spec links are not an error for `T0` /
`T1`. Use classic feature/requirements/docs fallback when they are absent.
For `T2` / `T3`, missing linked SDD specs are a blocker. A feature marked
`spec_design_status: not_required` can support only work whose actual scope
remains `T0` / `T1`. Do not downgrade a serious task to bypass the SDD gate;
route it to `/prd-to-tasks` for design repair or controlled re-decomposition.
For any tier, linked SDD specs are primary normative inputs. If the task record conflicts with linked specs or the backbone, stop with a blocker instead of choosing locally.

## 1) Preflight
Stop with an explicit error if:
- the task record is missing from `index.json`
- the indexed task file is missing
- the task record `id` does not match `TASK-<NNN>-T<N>-FT-<NNN>-W<N>`
- the task record has no `tier`
- `tier` is not `T0`, `T1`, `T2`, or `T3`
- task `status` is `blocked`, `failed`, or `done`
- any `depends_on` task is missing or has status other than `done`
- `tier` is `T2` or `T3` and neither richer task fields nor linked feature
  `spec_design_links` route through the backbone/index to a relevant concrete
  SDD spec
- `tier` is `T2` or `T3`, guides are the only linked SDD context, and the task
  has an in-scope architecture, contract, domain, state, or testing concern
- a `T2` / `T3` task changes or depends on an architecture, component/module,
  API, event/message, boundary-data, internal data/storage/state, domain, agent
  I/O, or security concern, but lacks the applicable authoritative owner from
  the SDD taxonomy above, or that owner lacks `shape`, `rules`,
  `edge cases/errors`, or a `verification target`
- the task record, implementation plan, or feature doc contradicts linked SDD specs or a non-blocked global backbone decision
- the task, feature, implementation plan, linked specs, or
  acceptance criteria are objectively contradictory, underspecified for safe
  implementation, or logically inconsistent
- success cannot be verified from the provided acceptance criteria,
  verification targets, gates, or linked specs
- implementation would exceed the assigned scope, touch forbidden scope, or
  require a product/spec/architecture/public-contract/state/data/security
  decision that is not already settled
- the task appears materially broader than assigned, or its tier is obviously
  too low for the actual implementation risk

Do not block `T0` / `T1` only because SDD spec links are absent.
Authoritative routing is only `task.tier`. Do not use legacy `risk` /
`risk.level`.

For a feature-local SDD readiness gap, stop and route the planning/scheduler
owner to `/prd-to-tasks FT-<NNN>` reconciliation. For a shared/global design
gap, route to `/spec-design`. Do not settle either gap locally in `/execute`.

### Tier escalation handoff

If preflight or implementation evidence shows that the task requires a higher
tier:
1. Stop before making further changes outside the currently safe task scope.
2. Record the current tier, required higher tier, triggering evidence, partial
   changes/evidence, and whether splitting is preferable in the protocol and
   handoff.
3. Do not update `task.tier` in place: the tier is part of task ID, task path,
   index references, and dependency references.
4. Route `/prd-to-tasks FT-<NNN>` to rebuild or split the target task under its
   existing-queue reconciliation rules. Name the original task ID explicitly.
5. Rerun `/review-tasks-plan FT-<NNN>`, then the applicable `/mb-doctor` gate,
   and resume with `/execute <replacement-task-id>`.

In scheduler mode, return the escalation recommendation and let the scheduler
block progression. In manual mode, leave the task open for the explicit owner;
do not claim implementation or closure success from partial evidence.

## 2) Protocol By Tier
Create `.tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/` for runtime evidence and reports.

For `T0` / `T1`, create or update compact protocol:
- `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/run.md`
- include tier, task record path, goal, non-goals, context used, fallback basis,
  plan, changes, local gates, evidence, and handoff notes
- `VERDICT: PASS|FAIL|BLOCKED` is compact evidence. It may support final task
  closure only in manual mode when the explicit top-level owner fast-lane
  conditions are met; otherwise it is handoff evidence only.

For `T2` / `T3`, create or update full protocol:
- `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/context.md`
- `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/plan.md`
- `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/progress.md`
- `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/verification.md`
- `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/handoff.md`

For `T3`, exact closure marker lines are required by the later closure owner:
- `HUMAN_CHECKPOINT: done`
- `ROLLBACK_RECOVERY_NOTE: present`

During `/execute`, record marker presence or gaps in handoff notes. Do not close
the task.

Use protocol templates when available. In `plan.md` or compact `run.md`, record:
- task tier and authoritative task record path
- richer inputs found
- fallback basis used when richer inputs are absent
- Goal Interpretation:
  - Purpose:
  - Success outcome:
  - Anti-goals:
  - Allowed write scope:
  - Forbidden scope:
  - Stop conditions:
- Boundary Notes:
  - Linked boundary/contracts:
  - Applicable SDD owner types:
  - Responsibility boundary:
  - Boundary drift risk:
- Behavior Specs:
  - Linked behavior specs:
  - Context examples used:
- intended local gates
- MB-SYNC handoff / owner

## 3) Implement
Implement only scoped task changes.

Rules:
- keep edits bounded to acceptance criteria and referenced specs
- for any tier, if the task record or linked feature contains authoritative SDD
  spec links, read `.memory-bank/spec-backbone.md`,
  `.memory-bank/spec-index.md`, and all linked authoritative SDD specs before
  editing; treat them as normative inputs, not optional reading
- when linked SDD specs exist, they outrank local task wording for architecture,
  contracts, data/state, invariants, and verification targets
- preserve unrelated user changes
- do not edit generated `skills/*/{agents,references,scripts}/shared-*` files
- update protocol/progress with what changed and where evidence lives
- when linked boundary-map/contracts exist, keep implementation aligned with the
  recorded responsibility boundary; if the task needs a different boundary,
  stop and report the required spec/task update instead of widening locally
- follow the applicable Architecture/Component/API/Event/Data Contract or Data
  Specification owner; stop and route design repair when implementation exposes
  a missing, conflicting, or wrong owner type
- keep changed files inside `runtime_context.allowed_write_scope` when present;
  if implementation requires wider scope, stop and report the needed owner
- do not touch `runtime_context.forbidden_scope`; if forbidden scope was touched
  accidentally, stop and record it as a blocker
- top-level owner only, and only when the operator explicitly requested subagents: if fan-out is necessary, use narrow non-overlapping worker scopes and collect
  reports in `.tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/`

Dependency sequencing:
- `/execute` handles only the requested task
- it does not promote dependent tasks
- it does not block dependent tasks after a failure
- dependent-task orchestration belongs to the scheduler or explicit owner

## 4) Local Gates
Run local implementation gates relevant to the touched code:
- lint / typecheck when applicable
- unit tests for touched behavior
- integration/e2e checks only when relevant
- task `gates` and task/spec `verification_targets` that apply to this task

Record for each gate:
- command
- result
- evidence path or concise output summary
- blocker if the gate could not run

Gate results are evidence. `/execute` must not turn them into final task status.
Exception: in manual mode, `T0` / `T1` may use these local gate results or an
explicit no-runnable-check note as compact closure evidence when all fast-lane
conditions are met.

For `T0`, no runnable check is acceptable for typo, formatting, broken-link, or
safe docs-only edits when the explicit closure owner inspected the diff. For
`T1`, prefer one cheap local check when available. If no meaningful local check
exists, record the reason instead of inventing a fake check.

## 5) Handoff Output
Return a concise handoff report containing:
- changed files
- protocol paths
- local gates run and results
- evidence paths under `.tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/`
- verification targets and notes for `/verify` or `/red-verify`
- scope compliance: yes/no
- forbidden scope touched: yes/no
- task/spec commands and checks used or explicitly skipped with reason
- MB-SYNC handoff notes for scheduler or explicit standalone owner
- blockers, unresolved questions, or FAIL reason if any
- recommended next owner
- tier escalation details and `/prd-to-tasks FT-<NNN>` route when a higher tier
  is required

If manual `T0` / `T1` fast-lane closure was used, also report:
- explicit closure owner basis
- exact compact evidence written to task `verify`
- whether any runnable check was run, or why none was meaningful
- confirmation that no wider scope or T2/T3 trigger appeared

## 6) Do Not Own
Except for manual `T0` / `T1` fast-lane closure under the conditions above,
`/execute` does not:
- run `/verify`
- run `/red-verify`
- run `/mb-sync`
- write final task status
- close tasks
- promote, block, or unblock dependents
- perform scheduler state transitions

Schedulers (`/autopilot`, `/autonomous`) or an explicit standalone owner perform
verification orchestration, final task status decisions, MB-SYNC, and dependent
promotion/blocking.

</process>
