---
description: Выполнение одной TASK-NNN-FT-NNN-W-N как implementation handoff: read -> preflight -> protocol -> implement -> local gates -> evidence -> handoff.
status: active
---

# /execute - Execute One TASK

<objective>
Implement one scoped JSON task and produce protocol/evidence for the next owner.
`/execute` is not a scheduler and never closes tasks.
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
- T2 scheduler task closure requires full protocol, required packet/spec gates, and `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, recorded in the feature doc.
- `FT-000` is the Foundation Dev Path pseudo-feature and does not participate in product feature-completion semantics.
- T3 scheduler task closure requires full protocol, required packet/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires exact markers `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`.

Manual mode:
- Expected T0/T1 simple flow: `/execute -> /verify` for one TASK.
- Manual closure is allowed only when an explicit closure owner exists.
- `explicit standalone owner` means either the user directly asked the current top-level agent to close the task, or the top-level agent/orchestrator explicitly runs a manual workflow for one TASK and records that it owns closure. Subagents/worker prompts do not silently become closure owners.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- `T2` manual task closure requires `/verify PASS` plus full protocol and required packet/spec gates; per-task `/red-verify` is optional, while T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc.
- `T3` manual task closure requires `/verify PASS` plus per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass` before `status: done` or `/mb-sync`; if semantic-pass is absent, leave closure pending or blocked, not done.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Do not mix scheduler mode and manual mode inside one task run.
- No persisted `mode` field is used.

## 0) Input
Expected `$ARGUMENTS`:
- `TASK-<NNN>-FT-<NNN>-W-<N>`

Required sources:
- `.memory-bank/tasks/index.json`
- `.memory-bank/tasks/TASK-<NNN>-FT-<NNN>-W-<N>.task.json`
- task-relevant feature, epic, requirements, or normative docs referenced by the
  task
- `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, and all linked
  authoritative SDD specs when the task record or linked feature contains SDD
  spec links, for any tier

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

Packet context:
- `/prd-to-tasks` creates initial required Execution Packets, and
  `/mb-doctor` validates packet readiness at the feature/task-queue boundary.
- `/execute` may read `.memory-bank/packets/<TASK_ID>.packet.json` when present
  or expected by tier/policy, but it does not validate `packet_ref`,
  `source_task_hash`, packet freshness, or packet status.
- If packet context is absent, continue from the authoritative task/spec inputs
  unless the task is semantically unsafe to implement.

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

Missing richer fields or absent SDD spec links are not an error for `T0` /
`T1`. Use classic feature/requirements/docs fallback when they are absent.
For `T2` / `T3`, missing linked SDD specs are a blocker for serious work unless the feature is explicitly marked `spec_design_status: not_required` and the task scope is downgraded to `T0` / `T1`.
For any tier, linked SDD specs are primary normative inputs. If the task record conflicts with linked specs or the backbone, stop with a blocker instead of choosing locally.

## 1) Preflight
Stop with an explicit error if:
- the task record is missing from `index.json`
- the indexed task file is missing
- the task record `id` does not match `TASK-<NNN>-FT-<NNN>-W-<N>`
- the task record has no `tier`
- `tier` is not `T0`, `T1`, `T2`, or `T3`
- task `status` is `blocked`, `failed`, or `done`
- any `depends_on` task is missing or has status other than `done`
- `tier` is `T2` or `T3` and task/feature/spec-backbone/spec-index provide no concrete linked SDD spec in `source_artifacts`, `normative_inputs`, `constraints`, `invariants`, or `verification_targets`
- the task record, implementation plan, or feature doc contradicts linked SDD specs or a non-blocked global backbone decision
- the task, packet summary, feature, implementation plan, linked specs, or
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

If a packet exists, treat it as derivative context. If it contradicts the task
record or linked specs in a way that affects implementation semantics, stop with
a blocker and report the contradiction; do not repair or validate the packet
inside `/execute`.

## 2) Protocol By Tier
Create `.tasks/TASK-<NNN>-FT-<NNN>-W-<N>/` for runtime evidence and reports.

For `T0` / `T1`, create or update compact protocol:
- `.protocols/TASK-<NNN>-FT-<NNN>-W-<N>/run.md`
- include tier, task record path, goal, non-goals, context used, fallback basis,
  plan, changes, local gates, evidence, and handoff notes
- `VERDICT: PASS|FAIL|BLOCKED` is a local evidence verdict only; it is not final
  task closure

For `T2` / `T3`, create or update full protocol:
- `.protocols/TASK-<NNN>-FT-<NNN>-W-<N>/context.md`
- `.protocols/TASK-<NNN>-FT-<NNN>-W-<N>/plan.md`
- `.protocols/TASK-<NNN>-FT-<NNN>-W-<N>/progress.md`
- `.protocols/TASK-<NNN>-FT-<NNN>-W-<N>/verification.md`
- `.protocols/TASK-<NNN>-FT-<NNN>-W-<N>/handoff.md`

For `T3`, exact closure marker lines are required by the later closure owner:
- `HUMAN_CHECKPOINT: done`
- `ROLLBACK_RECOVERY_NOTE: present`

During `/execute`, record marker presence or gaps in handoff notes. Do not close
the task.

Use protocol templates when available. In `plan.md` or compact `run.md`, record:
- task tier and authoritative task record path
- richer inputs found
- fallback basis used when richer inputs are absent
- packet context path/status/gaps when present or expected
- Goal Interpretation:
  - Purpose:
  - Success outcome:
  - Anti-goals:
  - Allowed write scope:
  - Forbidden scope:
  - Stop conditions:
- Boundary Notes:
  - Linked boundary/contracts:
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
- keep changed files inside `runtime_context.allowed_write_scope` when present;
  if implementation requires wider scope, stop and report the needed owner
- do not touch `runtime_context.forbidden_scope`; if forbidden scope was touched
  accidentally, stop and record it as a blocker
- top-level owner only, and only when the operator explicitly requested subagents: if fan-out is necessary, use narrow non-overlapping worker scopes and collect
  reports in `.tasks/TASK-<NNN>-FT-<NNN>-W-<N>/`

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
- packet-sourced `verification.commands` and `verification.success_checks` when
  packet context is present and the checks apply to this task

Record for each gate:
- command
- result
- evidence path or concise output summary
- blocker if the gate could not run

Gate results are evidence. `/execute` must not turn them into final task status.

## 5) Handoff Output
Return a concise handoff report containing:
- changed files
- protocol paths
- local gates run and results
- evidence paths under `.tasks/TASK-<NNN>-FT-<NNN>-W-<N>/`
- verification targets and notes for `/verify` or `/red-verify`
- scope compliance: yes/no
- forbidden scope touched: yes/no
- packet-sourced commands/checks used or explicitly skipped with reason
- MB-SYNC handoff notes for scheduler or explicit standalone owner
- blockers, unresolved questions, or FAIL reason if any
- recommended next owner

## 6) Do Not Own
`/execute` never:
- runs `/verify`
- runs `/red-verify`
- runs `/mb-sync`
- writes final task status
- closes tasks
- promotes, blocks, or unblocks dependents
- performs scheduler state transitions

Schedulers (`/autopilot`, `/autonomous`) or an explicit standalone owner perform
verification orchestration, final task status decisions, MB-SYNC, and dependent
promotion/blocking.

</process>
