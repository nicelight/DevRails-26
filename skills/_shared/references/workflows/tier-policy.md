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

Do not use a separate risk model in task records. If execution reveals a higher
tier, stop scope growth and record the required tier. Because tier is embedded
in task identity, route the target task through `/prd-to-tasks FT-<NNN>` for a
controlled rebuild or split, then rerun task-plan review and applicable doctor
gates before executing the replacement task ID.

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
- Expected T0/T1 simple flow: `/execute TASK`, compact local evidence, and optional closure by the explicit manual top-level owner.
- Manual closure is allowed only when an explicit closure owner exists.
- `explicit standalone owner` means either the user directly asked the current top-level agent to close the task, or the top-level agent/orchestrator explicitly runs a manual workflow for one TASK and records that it owns closure. Subagents/worker prompts do not silently become closure owners.
- `/execute` may close a `T0` / `T1` task only when the current agent is the manual top-level executor, explicit closure ownership is present, no required packet is involved, scope stayed task-local, no T2/T3 trigger appeared, and compact evidence was written.
- When those conditions pass, `/execute` may write/update `.protocols/<TASK>/run.md`, append compact PASS evidence to task `verify`, and set `status: done`.
- When any condition is missing, `/execute` leaves the task open and reports the next owner action: run `/verify`, ask the explicit owner to close, or use the tier-escalation handoff when scope requires a higher tier.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- `T2` manual task closure requires full protocol, required packet/spec gates, and `/verify PASS`; per-task `/red-verify` is optional, while T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc.
- `T3` manual task closure requires `/red-verify` `SEMANTIC_VERDICT: semantic-pass` after `/verify PASS`; if semantic issues are found, the scheduler or explicit owner may reopen/block/fail or create follow-up work.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Do not mix scheduler mode and manual mode inside one task run.
- No persisted `mode` field is used.

Tier summary:
- T0/T1: compact allowed.
- T2 tasks: full protocol + required packet/spec gates + verify PASS before scheduler marks done; T2 feature completion then requires feature-level red-verify.
- T3 tasks: verify + per-task red-verify before scheduler marks done.
- T3: human checkpoint + rollback/recovery before scheduler marks done.
- Manual mode: T0/T1 may close in `/execute` with compact evidence when the explicit manual top-level owner conditions are met, or through `/verify PASS` when independent verification is requested; T2 tasks do not require per-task /red-verify for closure; T2 feature completion requires feature-level /red-verify semantic-pass recorded in the feature doc; T3 tasks require per-task /red-verify semantic-pass before closure.

## Execution Packets

Execution Packets are derivative runtime artifacts:

```text
.memory-bank/packets/TASK-NNN-TN-FT-NNN-WN.packet.json
```

They summarize task purpose, linked specs, allowed/forbidden scope,
verification checks, and stop conditions for one run. They never replace the
indexed task record, linked SDD specs, or this tier policy as source of truth.

Rules:
- `T0` / `T1` tasks require packets only when the indexed task record sets
  `runtime_context.packet_required: true`. If a `T0` / `T1` task has
  `packet_ref` without `packet_required: true`, the packet is advisory only.
- `T2` / `T3` tasks require a usable packet before implementation regardless
  of whether older task records omit `runtime_context.packet_required`.
- `/foundation-to-tasks` and `/prd-to-tasks` must set `runtime_context.packet_required: true` and
  `runtime_context.packet_ref: ".memory-bank/packets/<task.id>.packet.json"`
  for generated `T2` / `T3` task records. If a task is downgraded to `T0` /
  `T1`, do not infer or add packet requirement from the old planned tier.
- If a `T2` / `T3` task record has `runtime_context.packet_required: false`,
  treat it as a policy violation, not permission to skip the packet.
- Required packet gates use canonical
  `.memory-bank/packets/<task.id>.packet.json` when `packet_ref` is absent.
- For required packet gates, `/verify`, `/red-verify`, `/autopilot`, and
  `/autonomous` must block on missing, malformed, stale, blocked, or
  hash-mismatched packets.
- `/execute` reads packet context only when required by tier/policy or explicitly
  linked by the task/feature; structural packet readiness is owned by
  `/foundation-to-tasks`, `/prd-to-tasks`, `/mb-doctor`, and scheduler gates.
  `/execute` stops on semantic packet/task/spec contradictions, not on packet
  freshness/hash/status checks.
- Packet statuses are local packet statuses only:
  `ready|ready_with_gaps|blocked|stale`.
- Packet statuses are not task lifecycle statuses and must not be added to the
  task `status` enum.

## T0 - trivial / docs-only

Use for typos, formatting, broken links, or safe documentation changes with no runtime, contract, state, data, security, or test impact.

- Protocol: compact allowed. Full protocol not required.
- Scheduler mode: `/verify TASK` is the ordered verification step; compact protocol/evidence may be enough.
- Manual mode: separate `/verify` is not default; `/execute` may close with compact evidence when explicit top-level owner conditions pass.
- `/red-verify`: not required
- Evidence: `VERDICT: PASS` or clear compact evidence accepted by current lint/doctor policy
- MB-SYNC: not required when only task `status`, task `verify`, and compact `.protocols/<TASK>/run.md` changed; run if broader durable Memory Bank docs/state changed

## T1 - local code / local behavior

Use for one local function, one small component, a local unit test, or a contained behavior change with low blast radius.

- Protocol: compact allowed. Full protocol not required.
- Checks: relevant local lint/typecheck/unit tests when available
- Scheduler mode: `/verify TASK` is the ordered verification step; compact protocol/evidence may be enough.
- Manual mode: separate `/verify` is optional; `/execute` should run the cheapest relevant local check when available, or record why no meaningful runnable check exists, and may close with compact evidence when explicit top-level owner conditions pass.
- `/red-verify`: not required
- Evidence: `VERDICT: PASS` or clear compact evidence accepted by current lint/doctor policy
- MB-SYNC: not required when only task `status`, task `verify`, and compact `.protocols/<TASK>/run.md` changed; run if broader durable Memory Bank docs/state changed

## T2 - cross-module / API / state / data / domain

Use for APIs, contracts, events, schemas, state machines, lifecycle changes, data behavior, migrations, multiple modules, or meaningful domain logic.

- Protocol: full protocol files are required
- Compact-only protocol: invalid
- `/verify`: required
- Scheduler mode: full protocol, required packet/spec gates, and `/verify` `VERDICT: PASS` before scheduler marks the task done; per-task `/red-verify` is not required
- Manual mode: T2 requires explicit closure ownership plus full protocol, required packet/spec gates, and `/verify PASS`; per-task `/red-verify` is optional
- Feature completion: after all tasks for the feature are implemented, run `/red-verify --feature FT-<ID>` and require `SEMANTIC_VERDICT: semantic-pass` before treating the feature as complete
- Evidence: store substantive artifacts under `.tasks/<TASK_ID>/`
- MB-SYNC: required at T2 wave/feature boundary or earlier when broader state must be reconciled; do not require full sync after every ordinary linear manual T2 task if the next step does not depend on reconciled state beyond the task record.

## T3 - critical / security / production / irreversible

Use for auth, permissions, secrets, security-sensitive behavior, deploy/runtime or production impact, irreversible migration, data loss, payments, compliance, or destructive operations.

- Protocol: full protocol files are required
- Compact-only protocol: invalid
- `/verify`: required
- Scheduler mode: `/verify` `VERDICT: PASS` plus per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass` before scheduler marks the task done
- T3: human checkpoint + rollback/recovery before scheduler marks done
- Required scheduler marker lines are exact standalone lines: `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`
- Manual mode: T3 requires explicit closure ownership, `/red-verify` semantic-pass, and human/recovery markers before closure
- MB-SYNC: required

## Assignment Rules

- Docs-only and safe -> `T0`
- Local, contained, low blast radius -> `T1`
- API, contracts, state, data, migration, domain logic, or multiple modules -> at least `T2`
- Auth, security, deploy/runtime, production, irreversible/data-loss, payments, or compliance -> `T3`
- If unsure between two tiers, choose the higher tier
