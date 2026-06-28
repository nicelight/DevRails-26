---
description: Верификация выполненной задачи по acceptance criteria + evidence, итог PASS/FAIL.
status: active
---
# /verify — Verify a TASK (acceptance → evidence → verdict)

<objective>
Подтвердить, что реализованный функционал работает с точки зрения пользователя.
Это **не** adversarial semantic verification: если решение может формально пройти AC, но быть неверным по существу, после `/verify` запусти `/red-verify`.
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
- `/mb-sync` records/reconciles state after the scheduler-provided closure/failure/blocking decision. It does not decide closure itself.
- T0/T1 scheduler closure may use compact evidence / functional PASS according to tier policy.
- T2 scheduler task closure requires full protocol, required packet/spec gates, and `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, recorded in the feature doc.
- `FT-000` is the Foundation Dev Path pseudo-feature and does not participate in product feature-completion semantics.
- T3 scheduler task closure requires full protocol, required packet/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires exact markers `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`.

Manual mode:
- Expected T0/T1 simple flow: `/execute TASK`, compact local evidence, and optional closure by the explicit manual top-level owner.
- Manual closure is allowed only when an explicit closure owner exists.
- Standalone `/verify` is not the default for manual `T0` / `T1`; use it when the user explicitly asks for independent verification, acceptance criteria are unclear, implementation scope grew, `/execute` cannot produce credible evidence, or public contract/state/data/security/runtime/cross-module behavior changed.
- T0/T1 may be marked `done` after functional `VERDICT: PASS` and completed evidence only with explicit closure ownership. Manual `/execute` may also close `T0` / `T1` directly when the tier-policy fast-lane conditions are met.
- T2 task closure may rely on `/verify PASS` when full protocol, required packet/spec gates, and explicit closure ownership are satisfied; per-task `/red-verify` is optional for T2. T2 feature completion requires `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc before the feature is treated complete. T3 must not treat `/verify PASS` alone as final `done`; run per-task `/red-verify` and require `SEMANTIC_VERDICT: semantic-pass` before final closure/`/mb-sync`.
- If required T3 per-task `/red-verify` or T2 feature-level `/red-verify --feature FT-<ID>` returns anything other than `semantic-pass`, leave the relevant task or feature closure pending or blocked, not complete. Optional T0/T1/T2 per-task red-verify does not make normal verify-based task closure stricter.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Do not mix scheduler mode and manual mode inside one task run.
- No persisted `mode` field is used.

0) Вход
Ожидается `$ARGUMENTS`:
- `TASK-<NNN>-T<N>-FT-<NNN>-W<N>`

1) Прочитай минимум:
- `.memory-bank/tasks/index.json`
- `.memory-bank/tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>.task.json`
- `.memory-bank/packets/<TASK_ID>.packet.json` when required by tier/policy:
  all `T2` / `T3`, and `T0` / `T1` only when
  `runtime_context.packet_required` is true
- `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/context.md`
- `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/plan.md`
- `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/progress.md`
- acceptance criteria источник:
  - `.memory-bank/features/FT-*` и/или
  - `.memory-bank/requirements.md` (REQ IDs)
- if the task record or linked feature contains authoritative SDD spec links,
  read `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, and all linked authoritative SDD specs, for
  any tier

If the task record is missing, stop with an explicit error.
Before reading protocol evidence or running verification commands, validate the
verification-critical task fields:
- indexed task record `id` matches the requested `TASK_ID`
- `status` is one of `planned|ready|in_progress|blocked|done|failed`
- `feature` is a non-empty string and matches the `FT-<NNN>` segment in
  `TASK_ID`
- `reqs` and `depends_on` are arrays of strings
- `gates` is an array whose entries follow the task schema with `name`,
  `command`, and boolean `required`
- `verify` is an array whose entries are strings or structured objects
- `tier` is one of `T0|T1|T2|T3`

Empty arrays remain valid where the task schema allows them. Missing or
malformed verification-critical fields are not empty evidence: do not infer,
repair, or reconstruct them from protocol files. Stop before a functional
PASS/FAIL verdict, return `VERDICT: NEEDS-CLARIFICATION`, list the invalid
fields, and route task-record repair to the planning/scheduler owner. This
point-of-use guard does not replace full task-schema checks in
`/review-tasks-plan` or `/mb-doctor`.

Authoritative verification routing is only `task.tier`; the old `risk` /
`risk.level` model is invalid and must not be used.
Task records and linked authoritative specs remain source of truth. Execution
Packets are derivative runtime context and must not override task/spec evidence.
Packet requirement is `T2` / `T3` by tier, or `T0` / `T1` only when
`runtime_context.packet_required` is true. If a required packet is missing,
malformed, stale, blocked, or has a missing/malformed/mismatched
`source_task_hash`, do not verify as if context were complete. Return
`VERDICT: NEEDS-CLARIFICATION` or `VERDICT: FAIL` according to active
verification ownership/mode, with reason `packet required but absent/stale`.
For `T2` / `T3`, `runtime_context.packet_required: false` is a policy
violation, not permission to skip the packet. For `T0` / `T1`, when
`packet_required` is false or absent, `packet_ref` should normally be omitted;
do not make advisory packets part of the verification path unless the user
explicitly asks for that packet to be inspected.
Authoritative SDD spec links are links in task richer fields or linked feature
`spec_design_links` that point to `.memory-bank/spec-index.md`,
`.memory-bank/tech-specs/`, `.memory-bank/architecture/`,
`.memory-bank/contracts/`, `.memory-bank/domains/`, `.memory-bank/states/`,
`.memory-bank/adrs/`, `.memory-bank/testing/`, `.memory-bank/guides/`, or `.memory-bank/runbooks/`.
Use `.memory-bank/contracts/boundary-map.md` and other boundary/contract docs
only when they are linked through those existing fields or provide the source
for `runtime_context` scope. Do not require or invent boundary-specific task
fields.
Behavior specs linked through task `source_artifacts` under
`.memory-bank/behavior-specs/*.behavior.json` are optional implementation
context examples. `/verify` may read them for orientation, but must not treat
their presence, absence, coverage, or exact alignment with code as an
independent verification gate. If the behavior must be verified, it must appear
in ordinary acceptance criteria, `verification_targets`, linked contracts/states,
tests, packet verification checks, or another normal verification source.
If `tier` is `T2` or `T3` and no linked SDD specs are present in task richer fields, feature `spec_design_links`, or `spec-index.md`, stop and report a blocker instead of verifying against classic AC alone.
Do not block `T0` / `T1` only because SDD spec links are absent.
If task/AC wording conflicts with linked SDD specs or the global backbone in `.memory-bank/spec-backbone.md`, stop with a blocker instead of verifying against the task alone.

Tier policy:
- `T0`: standalone `/verify` is normally not required; verification may be recorded in `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/run.md` by `/execute`.
- `T1`: standalone `/verify` is optional for strictly local scope; compact `run.md` may contain the verification evidence and verdict from the cheapest relevant local check, or a no-runnable-check reason.
- `T2` / `T3`: `/verify` is required before scheduler closure and must update `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/verification.md`.
- `T3`: include critical/security/runtime evidence where relevant. Exact markers are scheduler closure requirements, not loose text.

Status ownership:
- `/verify` owns verification evidence and `VERDICT: PASS|FAIL|NEEDS-CLARIFICATION`.
- In scheduler mode (`/autopilot` / `/autonomous`), `/verify` must not close the task, set `status: done`, set `status: failed`, block dependents, or promote dependents. It reports the verdict and recommended next status to the scheduler.
- In standalone/manual mode, `/verify` may mark a `T0` / `T1` task `done` after functional `VERDICT: PASS` only with explicit closure ownership.
- For `T2`, `/verify PASS` records functional evidence and can make task closure eligible when full protocol and required packet/spec gates are satisfied; feature completion still requires feature-level `/red-verify --feature FT-<ID>` semantic-pass recorded in the feature doc. For `T3`, final task closure requires per-task `/red-verify` semantic-pass first.

Приоритет basis для verify:
1. linked authoritative SDD specs for any tier, when present
2. required packet verification commands/checks/evidence when the required
   packet is usable
3. `purpose`, `success_outcome`, and `anti_goals` when present in task record
4. `verification_targets`, если они явно указаны в task record / IMPL plan / feature doc
5. `normative_inputs`, если они явно перечислены и релевантны проверке
6. classic acceptance criteria из feature doc
7. RTM / REQ IDs
8. required packet verification/scope checks when required by tier/policy
9. tests, logs, screenshots и иные evidence artifacts в `.tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/`

Важно:
- отсутствие richer verification fields не является ошибкой
- absence of SDD spec links is not a blocker for `T0` / `T1`; in that case the
  verifier should use the classic AC/REQ model
- for `T2` / `T3`, linked SDD specs are mandatory verification inputs; route
  feature-local repair to `/prd-to-tasks` reconciliation, shared/global repair
  to `/spec-design`, or autonomous design to `/spec-auto` when absent
- linked SDD specs are the primary normative basis when present; conflicting task records must be blocked, not locally reinterpreted
- `evidence_required` и `verification_targets` описывают требования/цели проверки; сами по себе они не являются proof
- behavior specs are not `verification_targets`, `evidence_required`, gates, or
  done criteria; report behavior-spec drift as a note unless a normal
  verification source also fails
- detailed verification report may live in `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/verification.md`, with artifacts in `.tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/`
- before any command sets `status: done`, the task record `verify` field must contain the completed evidence summary/marker (string or structured object)
- in scheduler mode, `/verify` itself must not set `status: done`; for `T2`, PASS makes task closure eligible when full protocol and required packet/spec gates are satisfied; for `T3`, PASS leaves task closure pending per-task `/red-verify`
- in manual mode, `/verify PASS` may close `T0` / `T1` when independent verification was requested, and may close `T2` when full protocol plus required packet/spec gates are satisfied, only with explicit closure ownership; `T3` requires per-task `/red-verify` before final closure/`/mb-sync`

2) Для каждого AC/REQ:
- выполни минимальную проверку (предпочтительно детерминированную)
- зафиксируй:
  - что сделал
  - команды
  - где evidence (в `.tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/`)

If purpose/runtime fields are present:
- verify `purpose` was actually served, not merely that local edits happened
- verify `success_outcome` is observable from evidence
- verify every `anti_goals` item was respected
- verify changed files stayed within `allowed_write_scope` when present
- verify `forbidden_scope` was not touched
- verify linked boundary-map/contracts were respected when they are part of the
  task's source/normative/constraint/verification basis
- verify required packet `verification.commands`, `success_checks`, and
  `evidence_required` were covered or record a blocker for each gap
- when an optional advisory packet is usable, cover relevant packet checks as
  cross-checks; when it is not usable, warn and continue without it

If the task changes UI/browser behavior, or an AC/verification target requires
a browser flow:
- prefer the project's existing browser automation harness; use Playwright when
  it is configured, otherwise use an available agent-browser or CDP-driven
  flow; do not add a new browser framework only to satisfy `/verify`
- run the smallest reproducible browser flow that proves the relevant AC,
  including required state, error, responsive, or navigation behavior when it
  is in scope
- record the command or exact automated flow, runtime/base URL, relevant
  viewport/device, result, and artifact paths in verification evidence
- store screenshots and, when useful, Playwright traces or videos under
  `.tasks/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/`; keep only links and concise
  conclusions in Memory Bank/protocol records
- follow linked redaction/evidence rules and do not capture secrets or PII
- do not use an informal manual click-through as primary evidence when browser
  automation is available
- if browser automation is unavailable, record the reason and reproducible
  manual steps with artifacts; return `VERDICT: NEEDS-CLARIFICATION` instead of
  claiming PASS when the browser AC cannot be proved credibly

Если richer verification targets заданы:
- сначала проверь их
- затем проверь, что они не противоречат classic acceptance criteria

3) Заполни protocol evidence:
- для `T0` / `T1`, если используется compact path, обнови `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/run.md`
- для `T2` / `T3`, заполни `.protocols/TASK-<NNN>-T<N>-FT-<NNN>-W<N>/verification.md` (по шаблону, если он есть в проекте)

4) Если проблемы:
- зафиксируй BUG в `.memory-bank/bugs/`
- in standalone/manual mode, add follow-up `.task.json` and update `.memory-bank/tasks/index.json` only if that is the explicit local workflow
- record `VERDICT: FAIL` and recommend `status: failed`
- in scheduler mode, do not write `failed` or `blocked`; return the recommendation so the scheduler owns failure handling and dependent blocking

5) Если всё ок:
- `VERDICT: PASS`
- обнови текущий task record:
  - add completed verification/evidence entries in `verify`
- status by tier:
  - scheduler mode: recommend the scheduler decision; do not close/fail/block/promote
  - manual mode: may set `T0` / `T1` `status: done` after functional `VERDICT: PASS` with explicit closure ownership; for `T2`, recommend task closure when full protocol and required packet/spec gates are satisfied; for `T3`, leave closure pending per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass`
- record RTM/feature lifecycle recommendations for `/mb-sync`; do not independently perform scheduler closure
</process>
