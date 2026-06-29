---
description: Независимая functional verification одной реализованной TASK по task-scoped outcome, acceptance basis, SDD contracts и evidence.
status: active
---
# /verify - Verify one implemented TASK

<objective>
Prove or disprove one task's independently verifiable outcome against its
task-scoped normative basis and reproducible evidence.

`/verify` is not an implementer, planner, scheduler, or
adversarial semantic review. It records functional evidence and one verdict:
`PASS`, `FAIL`, or `NEEDS-CLARIFICATION`. Use `/red-verify` where required by
tier policy after functional verification succeeds.
</objective>

<process>

## 0) Input and ownership

Expected `$ARGUMENTS`:
- `TASK-<NNN>-T<N>-FT-<NNN>-W<N>`

Read first:
- `.memory-bank/tasks/index.json` and the indexed task record
- `.memory-bank/workflows/tier-policy.md`
- the task-linked feature and concrete `REQ-*` sources needed to interpret this
  task's outcome
- task-linked authoritative SDD specs when present

Read execution evidence by tier:
- T0/T1: `.protocols/<TASK_ID>/run.md` and the task's implementation report or
  evidence under `.tasks/<TASK_ID>/` when present
- T2/T3: `.protocols/<TASK_ID>/context.md`, `plan.md`, `progress.md`,
  `handoff.md`, any existing `verification.md`, and the implementation report
  or evidence under `.tasks/<TASK_ID>/`

Do not load unrelated feature-wide or global planning documents. Read
`spec-backbone.md` and `spec-index.md` only to resolve task/feature-linked owners
or a relevant contradiction.

Normal scheduler input is an `in_progress` task. In manual mode, another status
is acceptable only when tier-appropriate execution handoff/evidence proves the
implementation happened or the user explicitly requested re-verification. Do
not verify a merely `planned|ready` task as implemented, and do not silently
reinterpret `blocked|failed|done` lifecycle state.

## 1) Point-of-use preflight

Before reading evidence as proof or running commands, confirm:
- the index resolves exactly one task record and its `id` matches `$ARGUMENTS`
- ID tier/feature/wave segments match record `tier`, `feature`, and `wave`
- `tier` is `T0|T1|T2|T3`
- `reqs` and `depends_on` are arrays of strings
- `gates` entries have `name`, `command`, and boolean `required`
- `verify` is an array of strings or structured objects
- the tier-selected execution protocol and implementation handoff/evidence
  exist and describe the requested task

This is a narrow point-of-use guard, not another full schema/review gate. Empty
schema-allowed arrays are valid. Missing or malformed required inputs must not
be reconstructed from protocol notes. Record `VERDICT: NEEDS-CLARIFICATION`,
list the exact gap, and route task-card repair to `/prd-to-tasks FT-<NNN>` or the
active scheduler owner.

Authoritative routing uses only `task.tier`; never use legacy `risk` fields.

## 2) Build the task-scoped verification basis

Verify this task, not the whole feature. Derive the minimum complete basis in
this precedence order:
1. linked authoritative SDD specs and their executable rules
2. task `purpose`, `success_outcome`, `anti_goals`, `constraints`, `invariants`,
   and `verification_targets`
3. only the feature acceptance criteria and concrete `REQ-*` behavior mapped to
   this task's independently verifiable outcome
4. task `gates`, `evidence_required`, and `runtime_context` scope/stop conditions
5. execution handoff, changed files, local-gate results, and artifacts

Do not require one task to satisfy acceptance criteria intentionally assigned to
other tasks. If the selected task cannot be mapped to one independently
verifiable outcome and a task-scoped AC/REQ subset, return
`NEEDS-CLARIFICATION` and route `/prd-to-tasks` reconciliation.

`evidence_required` and `verification_targets` are proof requirements, not proof
by themselves. An `/execute` local PASS is evidence input, not an automatic
`/verify PASS`.

### Applicable SDD owners

An entry in `spec-index.md` alone is not a task link. For T2/T3, the task richer
fields or feature `spec_design_links` must route to every relevant authoritative
owner. Apply only the owner types demanded by actual task scope:
- Architecture Specification for system/module shape, source of truth, runtime,
  deployment, Architecture Spine, or ADR constraints
- Component Contract for crossed/changed module guarantees and call/failure
  boundaries
- API Contract for API inputs, outputs, auth, status/errors, and compatibility
- Event Contract for producer/consumer, envelope, ordering, versioning,
  retry/idempotency, delivery, and failures
- Data Contract for payloads crossing boundaries, including required fields,
  validation/serialization, versions, and compatibility
- Data Specification for internal models, DB/storage ownership, persistence,
  migrations, lifecycle, retention, seed data, and runtime data paths

Verify implementation and evidence against each applicable owner's concrete
`shape`, `rules`, `edge cases/errors`, and `verification target`. Do not require
irrelevant spec families. A missing, conflicting, or wrong owner type is a
planning/design blocker, not an implementation FAIL:
- feature-local repair -> `/prd-to-tasks FT-<NNN>`
- shared/global owner or decision -> `/spec-design`

T0/T1 may use classic task-scoped AC/REQ evidence when no SDD owner is relevant.
Behavior specs linked through `source_artifacts` are optional context examples;
they are never independent gates or substitutes for AC, contracts, tests, or
verification targets.

## 3) Tier and scope guard

- T0: standalone verification is normally unnecessary; compact evidence may be
  enough when explicitly requested.
- T1: standalone verification is optional for strictly local work.
- T2/T3: functional `/verify` and full protocol evidence are required.
- T3: functional PASS still requires per-task `/red-verify` and the closure
  markers required by tier policy.

If verification evidence shows that actual implementation requires a higher
tier or materially different task scope:
1. Stop before claiming PASS or extending verification into the wider scope.
2. Record current tier, required tier, triggering evidence, affected files, and
   whether split/rebuild is preferable.
3. Do not edit `task.tier` in place; tier is embedded in task identity, paths,
   index entries, and dependencies.
4. Return `VERDICT: NEEDS-CLARIFICATION` and route the original task through
   `/prd-to-tasks FT-<NNN>` for controlled rebuild/split.
5. Require `/review-tasks-plan`, the applicable `/mb-doctor` gate, and
   `/execute <replacement-task-id>` before verification resumes.

## 4) Run functional verification

For every task-scoped outcome, mapped AC/REQ item, verification target, and
applicable contract rule:
- choose the smallest credible deterministic check
- run the command or reproducible flow independently when practical
- record what was checked, command/flow, result, and evidence path under
  `.tasks/<TASK_ID>/`
- cover task gates, verification targets, and evidence requirements or record
  the exact blocker

When runtime context exists, verify:
- `success_outcome` is observable, not merely that files changed
- `anti_goals` and non-goals remain respected
- changed files remain within `allowed_write_scope`
- `forbidden_scope` was not touched
- applicable architecture/component/API/event/data owners were respected
- real persistence paths receive the required read/write or integration proof

If UI/browser behavior is in scope:
- use the project's existing browser automation; prefer configured Playwright,
  otherwise use an available agent-browser or CDP flow
- run the smallest reproducible flow proving the mapped task criterion,
  including error, state, responsive, or navigation behavior only when relevant
- record runtime/base URL, viewport/device, result, and screenshot/trace/video
  paths under `.tasks/<TASK_ID>/`
- follow redaction rules and never capture secrets or PII
- when required browser behavior cannot be proved credibly, return
  `NEEDS-CLARIFICATION`, not PASS

## 5) Evidence and verdict

Write evidence to:
- T0/T1 compact path: `.protocols/<TASK_ID>/run.md`
- T2/T3 full path: `.protocols/<TASK_ID>/verification.md`
- substantive artifacts: `.tasks/<TASK_ID>/`

Use exactly one verdict:
- `VERDICT: PASS`: every task-scoped required check passed with credible evidence
- `VERDICT: FAIL`: observed implementation behavior violates the task-scoped
  normative basis or a required functional check fails
- `VERDICT: NEEDS-CLARIFICATION`: a safe verdict is impossible because inputs,
  execution evidence, scope/tier, required context, or normative ownership are
  missing, stale, contradictory, or unverifiable

Append the completed verdict/evidence summary to the task record `verify` array
when that field is structurally valid. If the record itself is malformed, keep
the evidence in protocol/artifacts and hand task-card repair to the owner.
Do not create or edit specs, BUG records, follow-up tasks, dependencies,
tier, wave, acceptance criteria, or material task scope from `/verify`.

## 6) Lifecycle and handoff

Scheduler mode:
- never close/fail/block/promote tasks or dependents
- return the verdict, evidence links, and recommended scheduler action

Manual mode:
- T0/T1 PASS may set `status: done` only when the current top-level agent has
  explicit closure ownership and completed evidence is in task `verify`
- T2 PASS makes the task closure-eligible; the explicit owner writes the final
  lifecycle decision
- T3 PASS routes to per-task `/red-verify`; it is not closure-eligible yet

On FAIL, report the defect and evidence. The scheduler or explicit owner decides
`failed|blocked|retry`, creates any durable BUG/follow-up work, updates
dependents, and records failure-budget impact. New task planning routes through
`/prd-to-tasks`.

On NEEDS-CLARIFICATION, name one repair owner:
- task scope/tier/feature-local spec -> `/prd-to-tasks FT-<NNN>`
- shared/global spec owner -> `/spec-design`
- missing implementation evidence -> `/execute <TASK_ID>`

Do not run `/red-verify`, `/mb-sync`, task-plan repair, or scheduler transitions
inside `/verify`. Report the next required owner/action.

</process>
