---
description: Workflow: PRD → FT → TASK loop (interactive or autonomous).
status: active
---
# Execute loop (PRD → Feature → Tasks)

## Principle: no task explosion
- `/prd` creates L1–L3 only (product/requirements/epics/features/testing/index).
- `/write-prd` = PRD-level ambiguity closure. `/clarify-feature` = optional feature-level ambiguity pass.
- `/spec-init` creates the lightweight SDD route map after `/write-prd` and before `/prd`.
- `/spec-design` is mandatory after `/prd`; it records a minimal backbone for simple T0/T1 projects or full shared backbone for shared/T2/T3 concerns, and records `.memory-bank/foundation.md` when a Foundation Dev Path is needed.
- `/foundation-to-tasks` creates normal `FT-000` foundation JSON tasks and the final foundation gate when foundation is required; execute/verify that queue before product feature tasking.
- `/prd-to-tasks FT-<NNN>` performs full feature-level SDD design before task slicing, then creates the implementation plan, JSON task records, and required initial Execution Packets.
- Standalone `/spec-improve FT-<NNN>` and `/mb-packet TASK-NNN-FT-NNN-W-N` remain repair/advanced commands when design or packets must be refreshed outside the happy path.
- After the current feature task set is decomposed, run `/mb-doctor` once at the feature/task-queue boundary before starting `/execute`.

## Interactive mode (you stay)
1) `/analysis -> /brief` when idea discovery is needed; use `/brainstorm` before `/brief` only for raw ideas
2) `/constitution` for contextual governing principles when `.memory-bank/constitution.md` is missing or `project_principles` is framework-default|skipped|missing; if principles are already ratified/partial, continue to `/write-prd`; if explicitly skipped, continue with framework-default/skipped principles
3) `/write-prd` (creates clarified .memory-bank/prd.md)
4) `/spec-init` (updates .memory-bank/spec-backbone.md framing and .memory-bank/spec-index.md registry)
5) `/prd` (fills L1–L3)
6) `/spec-design` (mandatory; minimal is valid for simple T0/T1-only scope)
7) If foundation is required, run `/foundation-to-tasks`, `/mb-doctor`, then execute/verify `FT-000` tasks until the final foundation gate is `done`
8) Pick one top feature; use `/clarify-feature FT-001` only for explicit feature blockers
9) `/prd-to-tasks FT-001` (completes feature-level SDD design, creates IMPL plan + `TASK-NNN-FT-NNN-W-N` records + required packets for this feature)
10) Run `/mb-doctor` at the feature/task-queue boundary after the current feature task set is decomposed and before execution; use `/mb-doctor --strict` before autonomous handoff
11) Execute tasks from `.memory-bank/tasks/index.json` and indexed `*.task.json` records one-by-one:
   - `/execute first indexed TASK -> /verify same TASK -> /red-verify same TASK for T3 (optional for T2 task closure) -> /mb-sync`
   - after all tasks for a T2 feature are implemented, run `/red-verify --feature FT-<ID>` before treating the feature as complete
   - start `/execute` only after the current feature task set has been decomposed and the feature/task-queue doctor gate has passed
   - `/execute` reads packet context when present or expected, but structural packet readiness is owned by `/mb-doctor`, not by the implementer
12) After each wave: `/review-tasks-plan` (fresh context over task queue state)

## Autonomous end-to-end mode (start and leave)
1) `/autonomous`
2) command runs `/write-prd -> /spec-auto --init -> /prd -> /review-feat-plan -> /spec-design --all -> /foundation-to-tasks when required -> /mb-doctor --strict at foundation/task-queue boundary -> execute/verify FT-000 until the final foundation gate is done -> /spec-auto --all -> /prd-to-tasks --all -> /review-tasks-plan`, then schedules ready TASKs
3) run `/mb-doctor --strict` again before product scheduler execution; T2/T3 tasks without SDD spec links are blockers
4) before `/execute`, scheduler checks required packets for every T2/T3 task and explicit T0/T1 packet requirement; missing/blocked/stale/invalid packets stop execution and require `/mb-packet TASK-NNN-FT-NNN-W-N` or blocker resolution
5) each TASK runs in **fresh CLI sessions**
6) after each `/mb-sync`, run `/mb-doctor --strict` before promoting dependents
7) after each wave: `/review-tasks-plan`
8) final success only if last `/review-tasks-plan` = `APPROVE`, `/mb-doctor --strict` passes, and no blocking tasks remain

## Autonomous executor only
If JSON task records already exist and `/review-tasks-plan` already passed, use:
- `/autopilot`

`/autopilot` must run `/mb-doctor --strict` before each task selection pass and after each `/mb-sync` before promotion.

Codex (implement, then verify when the tier requires a separate verifier):
~~~bash
codex exec --ephemeral --full-auto -m gpt-5.2-high \
  'TASK_ID=TASK-123-FT-001-W-1. Read AGENTS.md, .memory-bank/commands/execute.md, the indexed task record, .memory-bank/workflows/tier-policy.md, and packet context when present or expected. Assume packet readiness was checked by the feature/task-queue gate; do not repair or structurally validate packets here. Stop on semantic contradictions, unverifiable success, or scope/public-contract ambiguity. Use tier-appropriate .protocols/TASK-123-FT-001-W-1/ state. Implement only scoped changes. Record evidence. Report → .tasks/TASK-123-FT-001-W-1/TASK-123-FT-001-W-1-S-IMPL-final-report-code-01.md.'

codex exec --ephemeral --full-auto -m gpt-5.2-high \
  'TASK_ID=TASK-123-FT-001-W-1. Read AGENTS.md, .memory-bank/commands/verify.md, .memory-bank/commands/red-verify.md when task.tier is T3, the indexed JSON task record including runtime_context, .memory-bank/workflows/tier-policy.md, linked acceptance criteria, and packet context when present or expected. Assume scheduler/doctor checked packet readiness; do not repair or structurally validate packets here. Respect packet verification/scope/stop_conditions as derivative context. Task/spec are source of truth. Route only by task.tier: T0/T1 compact run.md; T2 verify PASS without per-task red-verify; T3 verify + per-task red-verify and exact markers HUMAN_CHECKPOINT: done and ROLLBACK_RECOVERY_NOTE: present. Run mb-doctor --strict before progression.'
~~~

Claude (implement, then verify when the tier requires a separate verifier):
~~~bash
claude -p --no-session-persistence --permission-mode acceptEdits --model opus \
  'TASK_ID=TASK-123-FT-001-W-1. Read AGENTS.md, .memory-bank/commands/execute.md, the indexed task record, .memory-bank/workflows/tier-policy.md, and packet context when present or expected. Assume packet readiness was checked by the feature/task-queue gate; do not repair or structurally validate packets here. Stop on semantic contradictions, unverifiable success, or scope/public-contract ambiguity. Use tier-appropriate .protocols/TASK-123-FT-001-W-1/ state. Implement only scoped changes. Record evidence. Report → .tasks/TASK-123-FT-001-W-1/TASK-123-FT-001-W-1-S-IMPL-final-report-code-01.md.'

claude -p --no-session-persistence --permission-mode acceptEdits --model opus \
  'TASK_ID=TASK-123-FT-001-W-1. Read AGENTS.md, .memory-bank/commands/verify.md, .memory-bank/commands/red-verify.md when task.tier is T3, the indexed JSON task record including runtime_context, .memory-bank/workflows/tier-policy.md, linked acceptance criteria, and packet context when present or expected. Assume scheduler/doctor checked packet readiness; do not repair or structurally validate packets here. Respect packet verification/scope/stop_conditions as derivative context. Task/spec are source of truth. Route only by task.tier: T0/T1 compact run.md; T2 verify PASS without per-task red-verify; T3 verify + per-task red-verify and exact markers HUMAN_CHECKPOINT: done and ROLLBACK_RECOVERY_NOTE: present. Run mb-doctor --strict before progression.'
~~~

## Parallel vs sequential
- Independent tasks (no shared files) MAY run in parallel (separate sessions).
- Dependent or shared-file tasks MUST run sequentially: TASK-A (execute→tier-appropriate verify→red-verify if required by tier→mb-sync) → TASK-B.
