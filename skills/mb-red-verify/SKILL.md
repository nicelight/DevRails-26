---
name: mb-red-verify
description: >
  Adversarial semantic verification for one TASK-* so teams can catch solutions that pass process checks but are still wrong in substance.
---

# mb-red-verify — Adversarial semantic verification

- **What it does:** pressure-tests one completed `TASK-*` for semantic correctness, hidden failure modes, and systemic harm.
- **Use it when:** a task may be locally correct yet still wrong in product/domain/architectural/operational reality.
- **Input:** `TASK_ID`, task intent, actual change surface, tests/evidence, and only then relevant spec reconciliation.
- **Output:** `red-verification.md`, a concise semantic-risk report, and follow-up bugs/tasks when concerns are serious.

## Goal
Catch changes that are "disciplined but wrong":
- pass acceptance criteria but solve the wrong problem
- work locally but damage system integrity
- overfit to the task record and ignore neighboring constraints
- introduce architectural drift, state inconsistency, or hidden maintenance cost
- create false confidence because the evidence surface is too narrow

## This is intentionally different from existing commands
- `mb-verify` checks acceptance criteria and evidence-backed task completion.
- `mb-review` provides explicit feature-plan and task-plan review gates in fresh context.
- `mb-red-verify` asks: "Is this solution actually right in substance?"

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
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, and the verdict must be recorded in the feature doc itself.
- `FT-000` is the Foundation Dev Path pseudo-feature and does not participate in product feature-completion semantics.
- T3 scheduler task closure requires full protocol, required packet/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires exact markers `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`.

Manual mode:
- Expected T0/T1 simple flow: `/execute -> /verify` for one TASK.
- Manual closure is allowed only when an explicit closure owner exists.
- `explicit standalone owner` means either the user directly asked the current top-level agent to close the task, or the top-level agent/orchestrator explicitly runs a manual workflow for one TASK and records that it owns closure. Subagents/worker prompts do not silently become closure owners.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- `T2` manual task closure requires `/verify PASS` plus full protocol and required packet/spec gates; per-task `/red-verify` / `mb-red-verify` is optional, while T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc.
- `T3` manual task closure requires `/verify PASS` plus per-task `/red-verify` / `mb-red-verify` `SEMANTIC_VERDICT: semantic-pass` before `status: done` or `/mb-sync`; if semantic-pass is absent, leave closure pending or blocked, not done.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Do not mix scheduler mode and manual mode inside one task run.
- No persisted `mode` field is used.

## Preconditions
- Implementation exists.
- Quality gates were already run (or failures were recorded).
- For non-trivial tasks, `mb-verify` should usually run first.
- The indexed task record contains `tier`. Authoritative red-verification routing is only `task.tier`; the old `risk` / `risk.level` model is invalid.
- For `T2` / `T3`, linked SDD specs are present in task richer fields, feature `spec_design_links`, or `spec-index.md`; if absent, stop and route back to `/prd-to-tasks` feature design, standalone `/spec-improve` repair, or `/spec-auto`.
- For `T2` / `T3`, the packet must exist, be usable (`ready` or
  `ready_with_gaps`), and match the current task record hash regardless of
  whether older task records omit `runtime_context.packet_required`.
- For `T0` / `T1`, packets are required only when
  `runtime_context.packet_required` is true.
- If a required packet is missing, malformed, stale, blocked, or
  hash-mismatched, record a semantic blocker instead of blessing the work.
- In scheduler mode, `T2` tasks do not require per-task `mb-red-verify` before
  scheduler marks the task `done`; the feature still requires feature-level
  `mb-red-verify --feature FT-<ID>` and a recorded feature-doc semantic verdict
  before feature completion.
- In scheduler mode, `T3` tasks require per-task `mb-red-verify` before
  scheduler marks the task `done`.
- In manual mode, this pass is optional for `T2` task closure and required for
  `T3` task closure after `mb-verify PASS`; feature-level
  `mb-red-verify --feature FT-<ID>` plus a recorded feature-doc semantic verdict
  is required before T2 feature completion.
- `T0` / `T1` usually skip it unless scope has grown and the tier is updated first.
- Do not use `mb-red-verify --feature FT-000`; foundation is closed through
  normal `FT-000` task dependencies and the final foundation gate task.

## Required outputs
Create or update:
- `.protocols/<TASK_ID>/red-verification.md` in per-task mode

Store a concise report in:
- `.tasks/<TASK_ID>/<TASK_ID>-S-RED-VERIFY-final-report-docs-01.md` in per-task mode
- `.tasks/FT-<ID>/FT-<ID>-S-RED-VERIFY-final-report-docs-01.md` in feature mode

In feature mode, also update the matching `.memory-bank/features/FT-<ID>-*.md`
with a durable `## Semantic Verification` section containing an exact
standalone line:
`SEMANTIC_VERDICT: semantic-pass|semantic-concern|semantic-fail`, plus a link to
the `.tasks/FT-<ID>/...` report.

If concerns are material:
- `.memory-bank/bugs/BUG-<short>.md`
- follow-up `.task.json` records indexed in `.memory-bank/tasks/index.json`
- recommended task/dependent status for the active scheduler or explicit standalone owner

Use:
- `./references/shared-protocols-red-verification-template.md`
- `./agents/red-verifier.md`

## Input priority
Do **not** start by over-trusting the same full spec context the implementer used.

Prime in this order:
1. task intent and expected real-world outcome
2. actual code changes / diff / touched runtime behavior
3. tests, logs, screenshots, traces, and other evidence
4. task/packet purpose, success outcome, anti-goals, allowed scope, forbidden
   scope, and stop conditions when present
5. linked SDD specs and neighboring constraints only when they are linked
   through task provenance fields, feature `spec_design_links`, or
   `runtime_context` evidence
6. broader spec reconciliation

This keeps the verifier from merely confirming the workflow surface.

## When to use it
Use `mb-red-verify` when:
- `task.tier` is `T3`, or when a `T2` feature is ready for feature-completion review
- a `T2` task owner explicitly wants optional per-task semantic review
- contracts, states, migrations, or data behavior changed
- the task crosses boundaries between modules/features
- runtime or API behavior changed
- business rules or domain semantics matter heavily
- acceptance criteria can be satisfied in a narrow but misleading way
- the change is risky, architectural, or likely to create hidden future cost

## When not to use it
Usually skip it for:
- typo-only edits
- formatting-only changes
- isolated mechanical refactors with no behavioral impact

## Process

### 1) Start from task intent and reality, not paperwork
Read only what you need:
- `.protocols/<TASK_ID>/plan.md`
- `.protocols/<TASK_ID>/progress.md`
- `.protocols/<TASK_ID>/verification.md` if it exists
- linked task record, feature, and requirement docs for intent
- the real diff / changed files / tests / runtime artifacts

### 2) Build a hostile hypothesis list
Challenge the solution from multiple angles:
- wrong problem solved
- false success: AC passed but `purpose` / `success_outcome` remains unmet
- anti-goal violation
- autonomy/scope violation beyond allowed task or packet scope
- forbidden scope touched
- weak task/packet context hiding a semantic problem
- local optimization with systemic harm
- hidden assumptions
- cross-boundary regression risk
- architectural drift
- state/data inconsistency
- operational weakness
- future maintenance burden

### 3) Reconcile with specs only after forming independent concerns
Then inspect the smallest sufficient spec subset:
- `.memory-bank/spec-index.md` and linked SDD specs for `T2` / `T3`
- docs linked through existing task fields: `source_artifacts`,
  `normative_inputs`, `constraints`, `invariants`, or `verification_targets`
- feature `spec_design_links`
- docs used to populate `runtime_context` fields
- `requirements.md` only for referenced `REQ-*` reconciliation
- related feature/epic docs for task intent

Do not discover boundary-map/contracts implicitly. Read
`.memory-bank/contracts/boundary-map.md`, other `contracts/*`, `domains/*`,
`states/*`, `runbooks/*`, `guides/*`, or `invariants.md` only when they are
linked through the provenance fields above, feature spec links, or
runtime_context evidence.

If code and specs disagree, record the drift explicitly rather than silently choosing one side.

### 4) Produce a hard-to-game report
The output must be concise and high-signal. Include:
- semantic verdict
- top substance risks
- false-success / purpose-fit assessment
- anti-goal and scope/autonomy assessment
- weak-context questions that could change the verdict
- hidden assumptions
- cross-boundary impact
- architectural concerns
- state/data consistency concerns
- operational concerns
- future maintenance cost
- how the change could still be wrong
- counterproposal or escalation path

For `T3`, also cover critical/security/runtime/recovery concerns and confirm exact marker lines `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present` are present before closure.

Do not create a separate Failure Packet. When a packet/spec/task gap blocks a
credible semantic verdict, use the existing red-verification report and add:

```md
## Failure / Blocker
- Status: blocked|failed
- Where: command/protocol/file
- Expected:
- Observed:
- Likely category: code|spec|task|packet|verification|tool|unknown
- Recommended next action:
- Requires replan: yes/no
```

### 5) Take action from the verdict
- `semantic-pass`: no substantive concerns found; per-task T3 scheduler closure-eligible when `mb-verify` also has `PASS`; optional per-task T2 results do not make T2 task closure stricter; feature-mode T2 semantic-pass makes feature completion eligible when all feature tasks and task-level gates are complete and the feature doc records `SEMANTIC_VERDICT: semantic-pass`
- `semantic-concern`: not proven wrong, but blocked or human-review-required; in manual mode, do not trust existing `done` without human review / follow-up
- `semantic-fail`: substantively wrong, systemically harmful, or too risky to accept; recommend or apply task `status: failed` according to active workflow ownership and explicit closure ownership

When invoked by `/autopilot` or `/autonomous`, `mb-red-verify` must not independently close the task, write `done`, write `failed`, block dependents, or promote dependents. It writes the semantic verdict and returns the recommended status/dependent action to the scheduler.

For `semantic-concern`, recommend blocking task/dependents, reopening from `done`, or leaving the task/feature pending human review. If human review accepts the concern, record owner/reason and repeat `mb-red-verify`; scheduler normal T3 task `done` and T2 feature completion require `semantic-pass`, with the T2 feature verdict recorded in the feature doc.
For `semantic-fail`, file or recommend a bug, recommend follow-up tasks, recommend or apply `status: failed` according to active workflow ownership and explicit closure ownership, and stop downstream progression through the scheduler/explicit standalone owner.

## Definition of done
- `red-verification.md` exists and is substance-focused.
- The report is concise, skeptical, and not just a rephrased `/verify`.
- Serious concerns result in explicit bugs/tasks/escalation.
