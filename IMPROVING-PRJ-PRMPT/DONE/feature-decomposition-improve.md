# Handoff: make `/prd-to-tasks` the full feature planning command

## Status

Partial implementation was started and then intentionally stopped.

Already touched:

- `skills/_shared/references/commands/prd-to-tasks.md`

No verification was run after that partial edit. Before continuing, inspect the
current diff and either continue from it or intentionally replace it with a
cleaner patch.

## Goal

Reduce manual workflow steps and token usage by making `/prd-to-tasks FT-*`
own the whole feature planning handoff:

1. full feature-level SDD design improvement;
2. task decomposition;
3. required Execution Packet creation;
4. readiness handoff to `/mb-doctor`.

This should preserve KISS: fewer commands in the happy path, but no hidden
execution or scheduler behavior.

## Decisions

- `/spec-improve` should be folded into the normal `/prd-to-tasks` happy path.
- The folded design phase must be full `/spec-improve`, not lightweight.
- Standalone `/spec-improve FT-*` should remain as an advanced/repair command
  when only feature design needs to be rerun.
- `/prd-to-tasks` should create required packets while feature/task/spec context
  is already loaded:
  - always for `T2` / `T3`;
  - for `T0` / `T1` only when `runtime_context.packet_required: true`.
- `/mb-packet TASK-*` should remain as a repair/refresh command when task
  records or linked specs changed after decomposition.
- `/execute` should not orchestrate or repair packets and should not duplicate
  `mb-doctor` packet validation.
- `/execute` still must perform semantic implementation sanity checks: task,
  packet, feature, specs, scope, and acceptance criteria must be coherent enough
  to implement. If the request is contradictory, under-specified, too broad, or
  impossible, `/execute` stops with feedback before editing.
- `mb-doctor` is the readiness gate after feature decomposition and before
  execution in manual mode.

## Target manual flow

```text
/write-prd
/spec-init
/prd
/spec-design
/prd-to-tasks FT-001   # full feature design + tasks + required packets
/mb-doctor             # once at the feature/task-queue boundary
/execute TASK-001
/verify TASK-001
/red-verify TASK-001   # T3 only; T2 task red-verify optional
/red-verify --feature FT-001   # T2 feature completion
/mb-sync
```

## Implementation Plan

### 1. `/prd-to-tasks`

Update `skills/_shared/references/commands/prd-to-tasks.md` so the command has
clear phases:

- Phase A: input/clarification preflight.
- Phase B: full feature SDD design improvement.
- Phase C: implementation plan + JSON task records.
- Phase D: required Execution Packet generation.
- Phase E: readiness handoff.

The full feature SDD design phase should copy the important behavior from
`/spec-improve`:

- read `spec-index`, `spec-backbone`, target feature, linked epic,
  requirements, Constitution, backbone specs, and existing routed specs;
- search existing architecture/tech-spec/contracts/domains/states/ADRs/testing
  docs before creating anything new;
- detect duplicate/conflicting specs, boundary/state/data ownership issues,
  unverifiable acceptance criteria, security/runtime risks, and complexity
  growth;
- ask the user or stop when design is blocked, contradictory, or has multiple
  meaningful options;
- update only necessary feature-local or linked specs;
- update `spec-index`;
- set target feature `spec_design_status: complete|not_required|blocked`;
- stop before task generation when feature design is `blocked`.

Packet generation should happen after task records are written:

- write `.memory-bank/packets/TASK-*.packet.json` for required packets;
- use the existing packet template shape;
- compute `source_task_hash` from the raw task record bytes;
- fill source refs, scope, verification checks, evidence, stop conditions, and
  handoff fields from the already-loaded feature/task/spec context;
- mark packet `ready`, `ready_with_gaps`, or `blocked`;
- do not implement code or change task lifecycle status.

Final handoff should report:

- feature id and final `spec_design_status`;
- linked specs created/used;
- implementation plan path;
- task records created/updated;
- packet files created/updated and statuses;
- blockers/open questions or `none`;
- next gate: run `/mb-doctor` once before `/execute`.

### 2. `/spec-improve`

Update docs so `/spec-improve` is no longer presented as a required happy-path
step before `/prd-to-tasks`.

Keep it as:

- standalone feature-design repair;
- rerun command when `/prd-to-tasks` found design blockers;
- advanced command for updating feature design without task decomposition.

### 3. `/mb-packet`

Update `/mb-packet` docs so it is described as repair/refresh, not the normal
happy-path packet builder after `/prd-to-tasks`.

It should still:

- rebuild a packet for one existing task;
- remain useful after task/spec changes;
- not create tasks/specs;
- not implement or change lifecycle status.

### 4. `/execute`

Remove per-task structural packet validation from `/execute` command docs and
`mb-execute` skill docs:

- no packet hash/stale/ref validation gate;
- no route to `/mb-packet` as part of ordinary execution;
- no packet repair.

Keep or add semantic implementation sanity:

- read the prepared task context and packet when present/required;
- compare task intent, packet summary, feature/specs, scope, and acceptance
  criteria for objective coherence;
- stop with feedback if the task is contradictory, under-specified, impossible,
  outside scope, or would require forbidden writes or broader design decisions;
- if coherent, implement only the scoped task.

### 5. Workflow/docs references

Update references that still show the old happy path:

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/workflows/execute-loop.md`
- `README.en.md`
- `README.ru.md`
- `howItWorks.md`
- likely command docs: `analysis.md`, `brief.md`, `brainstorm.md`,
  `constitution.md`, `discuss.md`, `map-codebase.md`, `prd.md`, `review.md`
- likely skill docs: `cold-start/SKILL.md`, `mb-analysis/SKILL.md`,
  `mb-from-prd/SKILL.md`, `mb-init/SKILL.md`, `mb-execute/SKILL.md`,
  `mb-verify/SKILL.md`, `mb-red-verify/SKILL.md`

Do not update autonomous flow unless directly needed. Autonomous may continue
using `/spec-auto --all` before `/prd-to-tasks --all`.

### 6. Dogfood / allowlisted files

Use `.gitignore` as the source of truth for which local dogfood
`.memory-bank/` files are tracked.

When syncing dogfood copies, sync only files that were intentionally changed
and are currently allowlisted by `.gitignore`. Do not broaden tracked
`.memory-bank/commands` files unless explicitly chosen.

## Acceptance Criteria

- Manual happy path no longer requires a separate `/spec-improve` step before
  `/prd-to-tasks`.
- `/prd-to-tasks FT-*` fully resolves or blocks feature-level design before
  creating tasks.
- `/prd-to-tasks FT-*` creates required packet files for T2/T3 and explicit
  T0/T1 packet requirements.
- `/mb-packet` remains available as repair/refresh only.
- `/execute` does not perform structural packet validation or packet repair.
- `/execute` still performs semantic implementation sanity and can stop before
  editing when task context is incoherent.
- Manual workflow says to run `/mb-doctor` once at the feature/task-queue
  boundary before execution.
- Source-only hygiene remains clean:

```bash
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Expected output: `0`.

## Suggested Minimal Checks

```bash
npm run check:syntax --silent
git diff --check
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

If allowlisted dogfood copies are synced, also run a fresh bootstrap comparison
for the synced files.
