---
description: Автономный прогон JSON task queue (TASK-NNN-TN-FT-NNN-WN records) в чистых сессиях Codex/Claude.
status: active
---
# /autopilot — Run JSON task queue autonomously

## Важно
- Это **executor JSON task queue**, а не полный `PRD → done` orchestrator.
- Для полного unattended flow используй `/autonomous`.
- Запуск разрешён только если JSON task records уже декомпозированы и каждая
  task-linked product feature имеет latest `/review-tasks-plan FT-<NNN>`
  `APPROVE`.
- По умолчанию выполняй **строго последовательно**. Параллель — только для независимых задач без общих файлов.
- `/autopilot` не запускает `/prd-to-tasks` и не создает task queue; он только исполняет уже готовые JSON task records.

## Preconditions
- `.memory-bank/tasks/index.json` exists and lists task record files.
- `.memory-bank/schemas/task.schema.json` exists.
- Each indexed `.memory-bank/tasks/*.task.json` has at minimum:
  - `id`
  - `status: planned|ready|in_progress|blocked|done|failed`
  - `wave`
  - `feature`
  - `depends_on`
  - `touched_files`
  - `tier: T0|T1|T2|T3`
- Every task `feature` points to a `.memory-bank/features/FT-<NNN>-*.md` file that is not explicitly marked `clarification_status: pending|blocked`.
- `FT-000` is allowed only for Foundation Dev Path tasks. It is not a product
  feature and may use `W0`; non-`FT-000` product tasks must not use `W0`.
- If `.memory-bank/foundation.md` says `Foundation Required: true`, every
  non-`FT-000` product task depends directly or transitively on the final
  foundation gate task named by `Foundation Gate Task: TASK-<NNN>-T<N>-FT-000-W<N>`.
- Every `T2` / `T3` task has relevant SDD spec links in `source_artifacts`, `normative_inputs`, `constraints`, `invariants`, or `verification_targets`.
- `.memory-bank/spec-backbone.md` records mandatory `/spec-design` status `complete`, or `minimal` with explicit `not_applicable` areas.
- Authoritative routing is only `task.tier`; the old `risk` / `risk.level` model is invalid and must not be used.
- `T2` / `T3` tasks require usable Execution Packets before implementation,
  regardless of whether older task records omit `runtime_context.packet_required`.
- `T2` / `T3` task records with `runtime_context.packet_required: false` are
  policy violations, not permission to skip packets.
- `T0` / `T1` tasks require packets only when the indexed task record sets
  `runtime_context.packet_required: true`; `packet_ref` without that flag is
  advisory only.
- Нет unresolved blocking questions в `.protocols/AUTONOMOUS-RUN/status.md` или equivalent run protocol.
- `/mb-doctor --strict` passes before the run starts.

If there are no JSON task records, stop with an explicit error:
`HALT_DEPENDENCY_DEADLOCK: no schema-backed task records found in .memory-bank/tasks/index.json`.

If any indexed task record is missing `tier`, stop with `HALT_POLICY_VIOLATION`.
If any indexed task record is missing `feature`, references a missing feature file, or references a feature explicitly marked `clarification_status: pending|blocked`, stop with `HALT_CLARIFICATION_REQUIRED`.
If any non-`FT-000` product task uses `W0`, or foundation is required and a
product task lacks the final foundation gate dependency, stop with
`HALT_QUALITY_GATES`.
If backbone status is missing/blocked, or any indexed `T2` / `T3` task lacks linked SDD specs, stop with `HALT_QUALITY_GATES` and route back to `/spec-design`, then `/prd-to-tasks FT-<NNN>` for manual repair, standalone `/spec-improve FT-<NNN>` for design-only repair, or `/spec-auto --all`.
Read the task queue and task metadata only from JSON task records.
Before task selection and before progression after a task closes, run `/mb-doctor --strict` using the repository's documented command or `node scripts/mb-doctor.mjs --strict`. Treat a missing doctor command/script, non-zero exit, or readiness error as `HALT_QUALITY_GATES`. Explicit pending/blocked feature clarification and tasks linked to those features are readiness errors. `mb-doctor` runs `mb-lint` as its first gate; do not fall back to plain `mb-lint` for autonomous readiness.

## Протокол batch-run
Если `.protocols/AUTONOMOUS-RUN/status.md` ещё нет:
- создай его с разделами:
  - run metadata
  - task-plan review gate
  - blocking questions / assumptions
  - queue state
  - failure budget
  - terminal state

Во время прогона обновляй:
- queue state from JSON task records (`ready`, `in_progress`, `blocked`, `done`, `failed`)
- latest `/review-tasks-plan FT-<NNN>` verdict coverage for task-linked product
  features
- current failure budget
- terminal state

## Status ownership

Status transitions have two modes.

Scheduler mode:
- `/autopilot` is the scheduler for an already prepared JSON task queue.
- `/autopilot` owns `planned -> ready`, `ready -> in_progress`, `in_progress -> done`, `in_progress -> failed`, dependent block/unblock decisions, and terminal queue state.
- `/execute` returns scoped implementation handoff; it does not close tasks.
- `/verify` gives functional verdict/evidence; in scheduler mode it does not close/fail/block/promote.
- `/red-verify` gives semantic verdict for per-task T3 checks and T2 feature-completion checks; in scheduler mode it does not close/fail/block/promote.
- Scheduler must write the closure/failure/blocking decision, final task status, and evidence links to the authoritative indexed `.memory-bank/tasks/TASK-*.task.json` record before `/mb-sync`.
- `/mb-sync` records/reconciles already-written task state. It does not decide closure/failure/blocking/promotion and must not sync a decision that exists only in scheduler context.
- T0/T1 scheduler closure may use compact evidence / functional PASS according to tier policy.
- T2 scheduler task closure requires full protocol, required packet/spec gates, and `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, recorded in the feature doc.
- T3 scheduler task closure requires full protocol, required packet/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires exact markers `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`.

Manual mode:
- Expected T0/T1 simple flow: `/execute TASK`, compact local evidence, and optional closure by the explicit manual top-level owner.
- Manual closure is allowed only when an explicit closure owner exists.
- `explicit standalone owner` means either the user directly asked the current top-level agent to close the task, or the top-level agent/orchestrator explicitly runs a manual workflow for one TASK and records that it owns closure. Subagents/worker prompts do not silently become closure owners.
- `/execute` may close `T0` / `T1` only under the tier-policy fast-lane conditions; otherwise closure remains with `/verify`, scheduler, or explicit owner.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- `T2` manual task closure requires full protocol, required packet/spec gates, and `/verify PASS`; per-task `/red-verify` is optional, while T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc.
- `T3` manual task closure requires `/red-verify` `SEMANTIC_VERDICT: semantic-pass` after `/verify PASS`; if semantic issues are found, the scheduler or explicit owner may reopen/block/fail or create follow-up work.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Do not mix scheduler mode and manual mode inside one task run.
- No persisted `mode` field is used.

## Selection rule
На каждой итерации reread `.memory-bank/tasks/index.json` and indexed `.task.json` records.

Сначала выполни promotion pass:
- `planned -> ready`, если все `depends_on` уже `done` и нет blockers / blocking review rejects / unresolved semantic-concern
- не продвигай задачу, если upstream failed/blocked, есть open blocking bug или task-level review reject
- запиши promotion в соответствующий `.task.json`

Затем выбирай только задачи, у которых:
- `status: ready`
- все `depends_on` уже `done`
- нет blocking bug / blocked upstream

Если после promotion pass `ready` пусто:
- и JSON task queue полностью закрыт → запусти финальный
  `/review-tasks-plan FT-<NNN>` for every task-linked product feature;
  `SUCCESS` разрешён только если every final feature review returned
  `APPROVE`
- и остались `planned` / `blocked` → `HALT_DEPENDENCY_DEADLOCK`

## TASK loop
Для каждой выбранной задачи:
1) перечитай `task.tier` и `runtime_context` из JSON record and route only by
   those authoritative values
2) before writing `ready -> in_progress`, ensure a usable packet while the task
   remains `ready` when required by tier/policy (`T2` / `T3`, or `T0` / `T1`
   with `runtime_context.packet_required: true`):
   - use canonical `.memory-bank/packets/<task.id>.packet.json` when
     `runtime_context.packet_ref` is absent
   - if a `T2` / `T3` task has `packet_required` absent or false, record a
     policy violation and route to task-record fix + `/mb-packet TASK-<NNN>-T<N>-FT-<NNN>-W<N>`
   - if missing or stale, run/route `/mb-packet TASK-<NNN>-T<N>-FT-<NNN>-W<N>` once without
     changing task status
   - usable packet status is `ready` or `ready_with_gaps` with matching
     `source_task_hash`
   - if the packet is still missing, stale, blocked, malformed, or
     hash-mismatched after that one attempt, leave the task `ready`, record the
     clear halt reason in run status, and stop with `HALT_QUALITY_GATES`
3) only after the required packet gate passes, write `status: ready -> in_progress`
4) выполни `/execute TASK-<NNN>-T<N>-FT-<NNN>-W<N>`
5) выполни `/verify TASK-<NNN>-T<N>-FT-<NNN>-W<N>` by tier:
   - `T0` / `T1`: compact protocol/evidence allowed according to tier policy
   - `T2` / `T3`: full path is required
   - `T3`: require exact marker lines `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`; no silent autonomous closure
6) run `/red-verify TASK-<NNN>-T<N>-FT-<NNN>-W<N>` only when required by tier:
   - `T2`: not required for task closure; optional/manual per-task semantic review is allowed
   - `T3`: required before task closure
7) scheduler writes closure/failure/blocking decision, final task status, and evidence links to the authoritative indexed `.memory-bank/tasks/TASK-*.task.json`:
   - `T0` / `T1`: normal `done` allowed after compact evidence / functional `VERDICT: PASS`
   - `T2`: normal task `done` allowed after full protocol, required packet/spec gates, and `/verify` `VERDICT: PASS`; per-task `/red-verify` is not required
   - `T3`: normal task `done` allowed only after `/verify` `VERDICT: PASS` evidence and per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass`
   - `semantic-concern`: never normal `done`; write `blocked` or `in_progress` pending human review with owner/reason/follow-up evidence
   - `FAIL` or `semantic-fail`: write `status: failed`, create bug + follow-up task, and record failure budget impact
8) run `/mb-sync` to synchronize the already-written task state; if the task record does not contain the scheduler decision/status/evidence, `/mb-sync` reports a consistency gap and stops
9) run `node scripts/mb-lint.mjs`, then `/mb-doctor --strict`
10) apply a separate scheduler promotion/dependent blocking pass:
   - promote dependents через explicit `planned -> ready`, если все их deps закрыты и нет blockers / blocking review rejects / unresolved semantic-concern
   - block dependents if upstream is `failed` / blocking / unresolved `semantic-concern`
   - write every promotion/blocking result to the affected `.task.json` records

Per-task command order is exactly: required packet readiness gate while task is
still `ready` (`/mb-packet` for every T2/T3 and explicit T0/T1 packet
requirement) → scheduler writes `ready -> in_progress` → `/execute` → `/verify` →
`/red-verify` for T3 only, optional for T2 → scheduler writes final task decision/status/evidence
to `.task.json` → `/mb-sync` → `node scripts/mb-lint.mjs` +
`/mb-doctor --strict` → scheduler promotion/dependent blocking pass.

Feature completion is a separate gate: after all tasks for a `T2` feature are
implemented, run `/red-verify --feature FT-<ID>` and require
`SEMANTIC_VERDICT: semantic-pass` recorded in the matching
`.memory-bank/features/FT-<ID>-*.md` before treating that feature as complete.

Новые follow-up задачи, созданные во время verify, должны подхватываться **в том же run** на следующей итерации.

## Fresh-session packet context
Every fresh-session worker prompt must include:
- read `runtime_context` from the indexed JSON task record
- for `T2` / `T3`, read canonical `.memory-bank/packets/<task.id>.packet.json`
  before implementation/verification
- for `T0` / `T1`, read `runtime_context.packet_ref` before
  implementation/verification only when `runtime_context.packet_required: true`
- respect packet `scope`, `verification`, and `stop_conditions`
- treat the task record and linked authoritative specs as source of truth; the
  packet is derivative runtime context and must not override them

## Concrete task-level commands
### Codex (fresh session per TASK)

```bash
codex exec --ephemeral --full-auto -m gpt-5.2-high \
  "TASK_ID=TASK-123-T2-FT-001-W1. Use the installed /execute project skill. Read AGENTS.md, the indexed JSON task record including runtime_context, .memory-bank/workflows/tier-policy.md, the tier-selected protocol path, and packet/spec context only when required by tier/policy or linked by the task/feature. Assume scheduler/doctor checked required packet readiness; do not repair or structurally validate packets here. Respect packet scope/verification/stop_conditions as derivative context. Task/spec are source of truth. Route only by task.tier. Stop on semantic contradictions, unverifiable success, or scope/public-contract ambiguity. Implement only scoped changes. Update compact run.md or full progress.md. Report → .tasks/TASK-123-T2-FT-001-W1/TASK-123-T2-FT-001-W1-S-IMPL-final-report-code-01.md."

codex exec --ephemeral --full-auto -m gpt-5.2-high \
  "TASK_ID=TASK-123-T2-FT-001-W1. Use the installed /verify project skill, and /red-verify when task.tier is T3. Read AGENTS.md, the indexed JSON task record including runtime_context, .memory-bank/workflows/tier-policy.md, linked acceptance criteria, and packet/spec context only when required by tier/policy or linked by the task/feature. Assume scheduler/doctor checked required packet readiness; do not repair or structurally validate packets here. Respect packet verification/scope/stop_conditions as derivative context. Task/spec are source of truth. Route only by task.tier: T0/T1 compact run.md; T2 verify PASS without per-task red-verify; T3 verify + per-task red-verify and exact markers HUMAN_CHECKPOINT: done and ROLLBACK_RECOVERY_NOTE: present. Run mb-doctor --strict before progression."
```

### Claude (fresh session per TASK)
```bash
claude -p --no-session-persistence --permission-mode acceptEdits --model opus \
  "TASK_ID=TASK-123-T2-FT-001-W1. Use the installed /execute project skill. Read AGENTS.md, the indexed JSON task record including runtime_context, .memory-bank/workflows/tier-policy.md, the tier-selected protocol path, and packet/spec context only when required by tier/policy or linked by the task/feature. Assume scheduler/doctor checked required packet readiness; do not repair or structurally validate packets here. Respect packet scope/verification/stop_conditions as derivative context. Task/spec are source of truth. Route only by task.tier. Stop on semantic contradictions, unverifiable success, or scope/public-contract ambiguity. Implement only scoped changes. Update compact run.md or full progress.md. Report → .tasks/TASK-123-T2-FT-001-W1/TASK-123-T2-FT-001-W1-S-IMPL-final-report-code-01.md."

claude -p --no-session-persistence --permission-mode acceptEdits --model opus \
  "TASK_ID=TASK-123-T2-FT-001-W1. Use the installed /verify project skill, and /red-verify when task.tier is T3. Read AGENTS.md, the indexed JSON task record including runtime_context, .memory-bank/workflows/tier-policy.md, linked acceptance criteria, and packet/spec context only when required by tier/policy or linked by the task/feature. Assume scheduler/doctor checked required packet readiness; do not repair or structurally validate packets here. Respect packet verification/scope/stop_conditions as derivative context. Task/spec are source of truth. Route only by task.tier: T0/T1 compact run.md; T2 verify PASS without per-task red-verify; T3 verify + per-task red-verify and exact markers HUMAN_CHECKPOINT: done and ROLLBACK_RECOVERY_NOTE: present. Run mb-doctor --strict before progression."
```

## Terminal states
- `SUCCESS`
- `HALT_BLOCKING_QUESTIONS`
- `HALT_CLARIFICATION_REQUIRED`
- `HALT_REVIEW_REJECT`
- `HALT_FAILURE_BUDGET`
- `HALT_DEPENDENCY_DEADLOCK`
- `HALT_POLICY_VIOLATION`
- `HALT_QUALITY_GATES`
- `HALT_BUDGET_EXCEEDED`
