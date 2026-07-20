---
description: Tier policy for TASK routing, protocol depth, verification, and MB-SYNC.
status: active
---
# Tier Policy

Task records route execution by a single required field:

```json
"tier": "T0"
```

Allowed values: `T0`, `T1`, `T2`, `T3`.

Do not use a separate risk model in task records. If execution or verification
reveals a higher tier, stop scope growth and record the required tier. Because
tier is embedded in task identity, route the target task through
`/feature-to-tasks FT-<NNN>` for a controlled rebuild or split, then rerun task-plan
review and applicable doctor gates before executing the replacement task ID.

`touched_files` is advisory and non-exhaustive. Discovering another file for the
same outcome does not raise tier by itself. Raise tier only when the actual
behavior, boundary, data/state/security/runtime impact, dependency shape, or
blast radius triggers the higher tier. A non-empty
`runtime_context.write_boundary` remains a hard boundary.

## Hard Write Boundary

`runtime_context.write_boundary` and its deprecated read alias
`allowed_write_scope` use literal project-root-relative POSIX paths, never
globs. Omitted or empty values add no path allow-list; semantic task scope,
`forbidden_scope`, stop conditions, role permissions, and sandbox policy still
apply.

Each non-empty entry:
- may have one trailing `/`, removed before comparison;
- must not be absolute or drive-qualified, contain `.` / `..` segments, empty
  segments, backslash, ASCII control characters, leading/trailing segment
  whitespace, `*`, or `?`;
- permits the normalized path itself and its lexical subtree.

Comparison is case-sensitive and lexical, without requiring path existence.
Split normalized paths on `/`: a path is inside an entry when the entry's
segment array is its prefix. Two boundaries overlap when any normalized entry
from either boundary is a segment prefix of an entry from the other; string
prefix alone is insufficient. Thus `src` contains `src/a.js`, while `src/a`
and `src/ab` do not overlap. Brackets and braces are literal path characters,
so `app/[id]/page.tsx` is valid.

The boundary covers task-outcome creates, modifications, and deletions; both
sides of a rename must be inside it. Required workflow bookkeeping and evidence
writes already owned by the active skill do not need to be listed, but retain
their existing output and lifecycle ownership. This path contract neither
grants external side effects nor replaces filesystem isolation.

## Execute Evidence Reuse

`/exe` may optionally offer a well-known local deterministic gate result as
a self-attested `reuse candidate` in the existing task protocol. A receipt is
supporting evidence, not independent or trusted provenance. Unknown, implicit,
broad, stale, flaky, external-state-dependent, input-mutating, or incompletely
bound command inputs deny reuse and route `/verify` to a safe rerun or
replacement probe. Missing receipt alone is not a task blocker.

Evidence reuse changes repeated-command ownership, not verification or closure
ownership:
- T0/T1 retain their existing compact/manual fast lane and scheduler rules;
- T2 may reuse eligible execute gates, but functional PASS requires at least
  one new verifier-owned outcome-level probe and independent grounding of every
  required task-scoped outcome, AC/REQ, gate, verification target, and
  applicable spec claim. One probe may cover several claims only with explicit
  complete mapping; no required claim may rely only on a receipt;
- T3 never permits reuse-only PASS. `/verify` obtains new functional evidence
  for every independently harm-driving claim, then normal per-task
  `/red-verify` and human-checkpoint rules still apply.

Receipt eligibility, current-attempt selection, state/freshness comparison,
fallback, and reporting are fully defined in the installed `/exe` and
`/verify` runtime commands. No receipt task field, registry, status, cache, or
artifact family exists.

## Task Start and Status Transition Modes

The caller selects one concrete task. `/exe` never selects from the queue and is
the sole owner of `ready -> in_progress` for that selected task in both manual
and scheduler flows.

Start contract:
- A selected `planned` task may move `planned -> ready` inside `/exe` only when
  point-of-use preflight proves every dependency done and no recorded blocker or
  unresolved required gate remains. Otherwise it stays `planned` and no
  implementation starts.
- Before `ready -> in_progress`, `/exe` initializes or reconciles the
  tier-required protocol and one neutral current `Execution Attempt` containing
  only `attempt` and `started`.
- `/exe` writes `ready -> in_progress` immediately before the first
  implementation or external side-effect write. Re-entry with a prepared
  `ready` attempt or unfinished `in_progress` attempt reuses it.
- A completed implementation handoff routes forward without replay. An eligible
  same-task retry creates a new attempt; ambiguous possibly completed unsafe or
  non-idempotent work stops instead of being replayed.
- Task selection/start does not grant external permissions or approvals. No
  task field, owner/basis provenance, persisted mode, or attempt registry is
  added.

Final status decisions still have two modes.

Scheduler mode:
- `/autonomous` owns promotion, selection, and final lifecycle decisions only
  for its bounded FT-000 Foundation phase; `/autopilot` owns them only for the
  reviewed product queue after the Foundation gate closes.
- Before invoking the selected task, the scheduler durably checkpoints
  `current stage: execute` and `next action: /exe <TASK_ID>`. `/exe` then owns
  protocol preparation and `ready -> in_progress`.
- Scheduler decides closure/failure/blocking eligibility.
- `/exe` returns scoped implementation handoff; it does not close tasks.
- `/verify` gives functional verdict/evidence; in scheduler mode it does not close/fail/block/promote.
- `/red-verify` gives semantic verdict for per-task T3 checks and T2 feature-completion checks; in scheduler mode it does not close/fail/block/promote.
- Scheduler must write the closure/failure/blocking decision, final task status, and evidence links to the authoritative indexed `.memory-bank/tasks/TASK-*.task.json` record immediately after each task and before the next `/mb-sync` boundary.
- `/mb-sync` records/reconciles already-written task state. It does not decide closure/failure/blocking/promotion and must not sync a decision that exists only in scheduler context.
- T0/T1 scheduler closure may use compact evidence / functional PASS according to tier policy.
- T2 scheduler task closure requires full protocol, applicable task/spec gates, and `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, recorded in the feature doc. In scheduler mode, run it when the last feature task closes and before the wave-boundary `/mb-sync` plus strict doctor.
- `FT-000` is the Foundation Dev Path pseudo-feature and does not participate in product feature-completion semantics.
- T3 scheduler task closure requires full protocol, applicable task/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires the exact marker `HUMAN_CHECKPOINT: done`.

Manual mode:
- Expected T0/T1 simple flow: `/exe TASK`, compact local evidence, and optional closure by the explicit manual top-level owner.
- Manual closure is allowed only when an explicit closure owner exists.
- `explicit standalone owner` means either the user directly asked the current top-level agent to close the task, or the top-level agent/orchestrator explicitly runs a manual workflow for one TASK and records that it owns closure. Subagents/worker prompts do not silently become closure owners.
- `/exe` may close a `T0` / `T1` task only when the current agent is the manual top-level executor, explicit closure ownership is present, semantic scope stayed task-local, no hard runtime boundary or T2/T3 trigger appeared, and compact evidence was written. Extra files outside advisory `touched_files` do not invalidate fast-lane closure when they are necessary for the same local outcome and recorded in evidence.
- When those conditions pass, `/exe` may write/update `.protocols/<TASK>/run.md`, append compact PASS evidence to task `verify`, and set `status: done`.
- When any condition is missing, `/exe` leaves the task open and reports the next owner action: run `/verify`, ask the explicit owner to close, or use the tier-escalation handoff when scope requires a higher tier.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- `T2` manual task closure requires full protocol, applicable task/spec gates,
  `/verify PASS`, and an explicit owner that writes the lifecycle decision;
  `/verify` only makes the task closure-eligible. Per-task `/red-verify` is
  optional, while T2 feature completion requires feature-level
  `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in
  the feature doc.
- `T3` manual task closure requires `/red-verify` `SEMANTIC_VERDICT: semantic-pass` after `/verify PASS`; if semantic issues are found, the scheduler or explicit owner may reopen/block/fail or create follow-up work.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Closure authority comes from the active outer workflow; an Execution Attempt
  carries no manual/scheduler mode and grants no closure authority.
- No persisted `mode` field is used.

## Scheduler Failure Handling

`/autopilot` and `/autonomous` apply one canonical failure contract:

- After `VERDICT: FAIL` or `SEMANTIC_VERDICT: semantic-fail`, a same-task retry
  is allowed only while `max_retries_per_task` has capacity and the correction
  stays inside the accepted task identity, outcome, scope, tier, dependencies,
  specs, and hard runtime boundaries. The retry must not repeat an unsafe or
  non-idempotent side effect. Keep the task `in_progress`, create a new
  Execution Attempt, record it and the evidence in the run status/task protocol,
  then rerun `/exe` and every required verification gate. Ordinary re-entry
  before a completed implementation handoff resumes the existing attempt.
- If no safe same-task retry exists or its budget is exhausted, write
  `in_progress -> failed` with the functional/semantic evidence and failure
  decision in the authoritative task record. Before the next strict doctor,
  create a `.memory-bank/bugs/` note mentioning the failed task or route a
  normal indexed follow-up task through `/feature-to-tasks` or
  `/foundation-to-tasks`. A follow-up joins the same run only after its normal
  review and readiness gates pass.
- `VERDICT: NEEDS-CLARIFICATION`, `SEMANTIC_VERDICT: semantic-concern`, or an
  execution blocker never becomes `done` or automatic `failed`. Use a safe
  same-task retry only when no operator/planning decision is needed; otherwise
  set `blocked`, record owner/reason/evidence and the exact resume route, and use
  the applicable clarification, blocking, or quality terminal state.
- Mark direct dependents of every `failed|blocked` task `blocked` before another
  promotion pass. Repeat the pass so no downstream task is promoted through a
  failed or blocked dependency.
- Record retry, consecutive-failure, and open-blocker counters in
  `.protocols/AUTONOMOUS-RUN/status.md`. Exceeding an applicable failure limit
  yields `HALT_FAILURE_BUDGET`; a successful task resets the consecutive-failure
  count.

The scheduler owns these lifecycle decisions. `/exe`, `/verify`,
`/red-verify`, and `/mb-sync` only return or reconcile their existing evidence
and ownership deltas.

Tier summary:
- T0/T1: compact allowed.
- T2 tasks: full protocol + applicable task/spec gates + verify PASS before scheduler marks done; T2 feature completion then requires feature-level red-verify.
- T3 tasks: verify + per-task red-verify before scheduler marks done.
- T3: human checkpoint before scheduler marks done.
- Manual mode: T0/T1 may close in `/exe` with compact evidence when the explicit manual top-level owner conditions are met, or through `/verify PASS` when independent verification is requested; T2 tasks do not require per-task /red-verify for closure; T2 feature completion requires feature-level /red-verify semantic-pass recorded in the feature doc; T3 tasks require per-task /red-verify semantic-pass before closure.

## Single-card execution context

The indexed task card carries task-scoped execution and verification context.
T2/T3 cards must satisfy the single-card handoff completeness contract before
execution: purpose/outcome, direct task-relevant canonical SDD paths, grounded
scope, a verification path, concrete REQ linkage, and valid dependencies.

This contract does not add a status or artifact. Semantic applicability and
spec sufficiency remain fresh-context review concerns.
## T0 - trivial / docs-only

Use for typos, formatting, broken links, or safe documentation changes with no runtime, contract, state, data, security, or test impact.

- Protocol: compact allowed. Full protocol not required.
- Scheduler mode: `/verify TASK` is the ordered verification step; compact protocol/evidence may be enough.
- Manual mode: separate `/verify` is not default; `/exe` may close with compact evidence when explicit top-level owner conditions pass.
- `/red-verify`: not required
- Evidence: `VERDICT: PASS` or clear compact evidence under the closure rules
  above; acceptance belongs to the scheduler or explicit manual owner, while
  `/mb-doctor` checks readiness only at applicable boundaries
- MB-SYNC: not required when only task `status`, task `verify`, and compact `.protocols/<TASK>/run.md` changed; run if broader durable Memory Bank docs/state changed

## T1 - local code / local behavior

Use for one local function, one small component, a local unit test, or a contained behavior change with low blast radius.

- Protocol: compact allowed. Full protocol not required.
- Checks: relevant local lint/typecheck/unit tests when available
- Scheduler mode: `/verify TASK` is the ordered verification step; compact protocol/evidence may be enough.
- Manual mode: separate `/verify` is optional; `/exe` should run the cheapest relevant local check when available, or record why no meaningful runnable check exists, and may close with compact evidence when explicit top-level owner conditions pass.
- `/red-verify`: not required
- Evidence: `VERDICT: PASS` or clear compact evidence under the closure rules
  above; acceptance belongs to the scheduler or explicit manual owner, while
  `/mb-doctor` checks readiness only at applicable boundaries
- MB-SYNC: not required when only task `status`, task `verify`, and compact `.protocols/<TASK>/run.md` changed; run if broader durable Memory Bank docs/state changed

## T2 - cross-module / API / state / data / domain

Use for APIs, contracts, events, schemas, state machines, lifecycle changes, data behavior, migrations, multiple modules, or meaningful domain logic.

- Protocol: full protocol files are required
- Compact-only protocol: invalid
- `/verify`: required
- Execute evidence reuse: eligible deterministic gates may be reused, but
  `/verify PASS` still requires new verifier-owned outcome evidence and
  independent grounding of every required task-scoped claim
- Scheduler mode: full protocol, applicable task/spec gates, and `/verify` `VERDICT: PASS` before scheduler marks the task done; per-task `/red-verify` is not required
- Manual mode: T2 requires explicit closure ownership plus full protocol, applicable task/spec gates, and `/verify PASS`; per-task `/red-verify` is optional
- Feature completion: after all tasks for the feature are implemented, run `/red-verify --feature FT-<ID>` and require `SEMANTIC_VERDICT: semantic-pass` before treating the feature as complete
- Evidence: store substantive artifacts under `.tasks/<TASK_ID>/`
- MB-SYNC: required at the wave/feature boundary or earlier only when the current
  wave depends on reconciled RTM/index/spec/contract/changelog state or the
  owner explicitly requests sync; do not require full sync after every
  ordinary task.

## T3 - critical / security / production / irreversible

Use for auth, permissions, secrets, security-sensitive behavior, deploy/runtime or production impact, irreversible migration, data loss, payments, compliance, or destructive operations.

- Protocol: full protocol files are required
- Compact-only protocol: invalid
- `/verify`: required
- Execute evidence reuse: supporting lower-risk gates may be reused, but every
  independently harm-driving functional claim requires new verifier-owned
  evidence and reuse-only PASS is forbidden
- Scheduler mode: `/verify` `VERDICT: PASS` plus per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass` before scheduler marks the task done
- T3: human checkpoint before scheduler marks done
- Required scheduler marker line is the exact standalone line `HUMAN_CHECKPOINT: done`
- Manual mode: T3 requires explicit closure ownership, `/red-verify` semantic-pass, and the human checkpoint before closure
- MB-SYNC: required at the end of the current wave; early sync uses the same
  exceptional dependency/owner rule as T2

## Assignment Rules

- Docs-only and safe -> `T0`
- Local, contained, low blast radius -> `T1`
- API, contracts, state, data, migration, domain logic, or multiple modules -> at least `T2`
- Auth, security, deploy/runtime, production, irreversible/data-loss, payments, or compliance -> `T3`
- When evidenced scope deterministically triggers several tiers, use the highest
  triggered tier; this is classification, not an unresolved choice.
- A genuinely ambiguous tier is an operator decision because it changes task
  identity and downstream gates. Interactive planning asks the operator;
  unattended planning records the question and halts through the existing
  clarification/blocking route instead of defaulting to the higher tier.
