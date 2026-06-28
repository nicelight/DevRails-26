---
name: mb-verify
description: >
  Verify one TASK-NNN-TN-FT-NNN-WN against acceptance criteria and record
  reproducible evidence.
---

# mb-verify — Verifier loop (acceptance → evidence → verdict)

- **What it does:** checks a completed task against acceptance criteria and records the result with evidence.
- **Use it when:** implementation is done and you want an explicit PASS, FAIL, or partial verdict.
- **Input:** `TASK_ID`, acceptance criteria sources, and the task protocol files.
- **Output:** `verification.md`, evidence artifacts, verification verdict, and recommended next status/follow-up bugs when criteria fail.

## Goal
Independent-ish verification so we don’t “trust without verify”.

This is **not** the adversarial semantic pass.
If a task may satisfy AC/REQ while still being wrong in substance, follow with `/red-verify` / `mb-red-verify`.

## Status Transition Modes

Status transitions have two modes.

Scheduler mode:
- `/autopilot` and `/autonomous` own task status transitions.
- Scheduler decides closure/failure/blocking eligibility.
- `/execute` returns scoped implementation handoff; it does not close tasks.
- `/verify` gives functional verdict/evidence; in scheduler mode it does not close/fail/block/promote.
- `/red-verify` gives semantic verdict for per-task T3 checks and T2 feature-completion checks; in scheduler mode it does not close/fail/block/promote.
- `/mb-sync` records/reconciles state after the scheduler-provided closure/failure/blocking decision. It does not decide closure itself.
- T0/T1 scheduler closure may use compact evidence / functional PASS according to tier policy.
- T2 scheduler task closure requires full protocol, required packet/spec gates, and `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, recorded in the feature doc.
- `FT-000` is the Foundation Dev Path pseudo-feature and does not participate in product feature-completion semantics.
- T3 scheduler task closure requires full protocol, required packet/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires exact markers `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`.

Manual mode:
- Expected T0/T1 simple flow: `/execute TASK`, compact evidence or no-runnable-check note, and optional closure by the explicit manual top-level owner.
- Standalone `/verify` is optional for manual T0/T1 when requested, uncertainty exists, scope widened, `/execute` cannot produce credible evidence, or public contract/state/data/security/runtime/cross-module behavior changed.
- Manual closure is allowed only when an explicit closure owner exists.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- T2 task closure may rely on `/verify PASS` when full protocol and required packet/spec gates are satisfied; per-task `/red-verify` is optional for T2. T2 feature completion requires `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc before the feature is treated complete. T3 must not treat `/verify PASS` alone as final `done`; run per-task `/red-verify` and require `SEMANTIC_VERDICT: semantic-pass` before final closure/`/mb-sync`.
- If required T3 per-task `/red-verify` or T2 feature-level `/red-verify --feature FT-<ID>` returns anything other than `semantic-pass`, leave the relevant task or feature closure pending or blocked, not complete. Optional T0/T1/T2 per-task red-verify does not make normal verify-based task closure stricter.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Do not mix scheduler mode and manual mode inside one task run.
- No persisted `mode` field is used.

## Inputs
- `TASK_ID` (e.g. `TASK-123-T2-FT-001-W1`)
- Authoritative task record via `.memory-bank/tasks/index.json` and `.memory-bank/tasks/<TASK_ID>.task.json`
- Mandatory `tier: T0|T1|T2|T3` in that task record
- Links to acceptance criteria:
  - `.memory-bank/features/FT-*` and/or
  - `.memory-bank/requirements.md` (REQ IDs)
- Link to protocol plan: `.protocols/<TASK_ID>/plan.md`

If present, also use:
- linked authoritative SDD specs for any tier
- `verification_targets`
- `normative_inputs`
- `constraints`
- `invariants`
- `purpose`
- `success_outcome`
- `anti_goals`
- `runtime_context`
- task record references to source artifacts
- Execution Packet from canonical `.memory-bank/packets/<TASK_ID>.packet.json`
  when required by tier/policy

Authoritative SDD spec links are links in task richer fields or linked feature
`spec_design_links` that point to `.memory-bank/spec-index.md`,
`.memory-bank/tech-specs/`, `.memory-bank/architecture/`,
`.memory-bank/contracts/`, `.memory-bank/domains/`, `.memory-bank/states/`,
`.memory-bank/adrs/`, `.memory-bank/testing/`, or `.memory-bank/runbooks/`.

## Preconditions
- Implementation is done and gates were run (or failures recorded).
- `.memory-bank/tasks/index.json` lists the target task record, and the indexed `.task.json` validates the requested `TASK_ID`.
- Authoritative verification routing is only `task.tier`; the old `risk` / `risk.level` model is invalid.
- For `T2` / `T3`, the packet must exist, be usable (`ready` or
  `ready_with_gaps`), and have a `source_task_hash` matching the current task
  record before verification can pass, regardless of whether older task records
  omit `runtime_context.packet_required`.
- For `T0` / `T1`, packets are required only when
  `runtime_context.packet_required` is true.

## Required outputs
- `T0` / `T1`: verification may be recorded in compact `.protocols/<TASK_ID>/run.md`.
- `T2` / `T3`: update (or create) `.protocols/<TASK_ID>/verification.md` using:
  - `./references/shared-protocols-verification-template.md`
- Store evidence in `.tasks/<TASK_ID>/`:
  - logs, screenshots, videos, reproduction steps
- Add completed evidence entries to the task record `verify` field; `evidence_required` and `verification_targets` remain requirements/targets, not proof by themselves.
- Before any command sets `status: done`, the task record `verify` field must contain completed verification/evidence entries.

## Status ownership

- `mb-verify` owns verification evidence and `VERDICT: PASS|FAIL|NEEDS-CLARIFICATION`.
- When invoked by `/autopilot` or `/autonomous`, it must not close the task, set `status: done`, set `status: failed`, block dependents, or promote dependents. It reports a recommended next status to the scheduler.
- In standalone/manual mode, it may mark a `T0` / `T1` task `done` after functional `VERDICT: PASS` only with explicit closure ownership.
- For `T2`, `mb-verify` records functional evidence and can make task closure eligible when full protocol and required packet/spec gates are satisfied; product feature completion still requires feature-level `mb-red-verify --feature FT-<ID>` semantic-pass recorded in the feature doc. `FT-000` foundation closure uses normal task dependencies and the final foundation gate. For `T3`, final task closure requires per-task `mb-red-verify` semantic-pass first.

## Process

### 1) Prime only what you need
Read:
- `.memory-bank/tasks/index.json`
- indexed `.memory-bank/tasks/<TASK_ID>.task.json`
- `.protocols/<TASK_ID>/context.md`
- `.protocols/<TASK_ID>/plan.md`
- `.protocols/<TASK_ID>/progress.md`
- acceptance criteria source docs
- `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, and all linked
  authoritative SDD specs when the task record or linked feature contains SDD
  spec links, for any tier
- `.memory-bank/packets/<TASK_ID>.packet.json` when required by tier/policy:
  all `T2` / `T3`, and `T0` / `T1` only when
  `runtime_context.packet_required` is true

Before verifying, validate the authoritative task record:
- the task is present in `.memory-bank/tasks/index.json`
- the indexed record `id` matches `TASK_ID`
- required fields for verification are present (`status`, `feature`, `reqs`, `depends_on`, `gates`, `verify`)
- `tier` is present; if missing, stop
- required packet is present and not malformed/stale/blocked/hash-mismatched;
  if missing or unusable, return `VERDICT: NEEDS-CLARIFICATION` or
  `VERDICT: FAIL`
  according to the active workflow ownership
- for `T2` / `T3`, linked SDD specs are present in task richer fields, feature
  `spec_design_links`, or `spec-index.md`; if absent, stop and route
  feature-local repair to `/prd-to-tasks`, shared/global repair to
  `/spec-design`, or autonomous design to `/spec-auto`

Do not block `T0` / `T1` only because SDD spec links are absent.
If the authoritative task record is missing or invalid, stop and report the issue instead of verifying from protocol docs alone.

Priority:
1. linked authoritative SDD specs for any tier, when present
2. required packet verification commands/checks/evidence when packet is present
3. `purpose`, `success_outcome`, and `anti_goals` when present
4. explicit `Verification Targets`
5. explicit `Normative Inputs`
6. classic feature acceptance criteria and RTM
7. evidence in `.tasks/<TASK_ID>/`

Missing richer fields or absent SDD spec links must not block verification of a
classic `T0` / `T1` task.

### 2) Verify acceptance criteria
For each AC / REQ:
- run the smallest meaningful check
- prefer deterministic checks (tests/CLI) over “looks OK”
- record what you did and link the evidence

When purpose/runtime context exists:
- verify `purpose` was served
- verify `success_outcome` is observable from evidence
- verify `anti_goals` were not violated
- verify packet commands/checks/evidence requirements are covered
- verify changed files stayed within `allowed_write_scope` when present
- verify `forbidden_scope` was not touched

If the task changes UI or browser behavior:
- prefer Playwright / agent-browser / CDP-driven verification
- capture screenshots/videos/traces when useful
- store artifacts in `.tasks/<TASK_ID>/`
- do not use “I clicked around manually” as the main evidence when browser automation is available

### 3) Verdict
If anything fails:
- set `VERDICT: FAIL`
- create a bug doc in `.memory-bank/bugs/BUG-<short>.md`
- add a follow-up `.task.json` and update `.memory-bank/tasks/index.json` (if needed)
- recommend current task `status: failed`
- in scheduler mode, do not block downstream dependents directly; return that recommendation to the scheduler

If all pass:
- `VERDICT: PASS`
- add completed verification/evidence entries in `verify`
- apply status by tier:
  - scheduler mode: recommend the scheduler decision; do not close/fail/block/promote
  - manual mode: may set `T0` / `T1` `status: done` after functional `VERDICT: PASS` with explicit closure ownership; for `T2`, recommend task closure when full protocol and required packet/spec gates are satisfied; for `T3`, leave closure pending per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass`
- in scheduler mode, final `T2` task closure does not require per-task red-verify; final `T2` feature completion requires feature-level `/red-verify --feature FT-<ID>` semantic-pass recorded in the feature doc; final `T3` task closure is eligible only after per-task `/red-verify` / `mb-red-verify` returns `semantic-pass`

### 4) Sync recommendations
- Record RTM/feature lifecycle recommendations for `/mb-sync`
- Do not independently perform scheduler closure or dependent block/promotion

## Definition of done
- Verification output exists and is evidence-backed: compact `run.md` for eligible `T0` / `T1`, full `verification.md` for `T2` / `T3`.
- PASS verification has updated RTM/task evidence; `T2` tasks can close without per-task red-verify when full protocol, required packet/spec gates, and PASS evidence are present; `T2` features are not complete until feature-level red-verify produces semantic-pass recorded in the feature doc; `T3` tasks are not closed until per-task `/red-verify` / `mb-red-verify` produces `semantic-pass`.
- FAIL tasks have a bug doc and next steps.
