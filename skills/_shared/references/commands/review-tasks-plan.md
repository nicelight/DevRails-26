---
description: Fresh-context review of JSON task queue planning before execution or scheduler mode.
status: active
---
# /review-tasks-plan - Task queue planning review

<objective>
Проверить runnable planning surface после `/prd-to-tasks` и до `/execute`,
`/autopilot`, or scheduler execution.

Scope:
- indexed JSON task records and task index
- waves, dependencies, readiness, gates, verification surface
- feature/task implementation plans and linked SDD specs
- packet/runtime-context readiness for T2/T3 and explicit T0/T1 packet-required
- Foundation Dev Path task/dependency invariants

This command does not validate PRD -> feature decomposition as the primary
surface. Use `/review-feat-plan` before `/spec-design` for that.
</objective>

<process>

## 0) Artifacts
Create:
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/`
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/REQUEST.md`

Reviewer reports go to:
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-<STAGE_ID>-final-report-docs-01.md`

## 1) Inputs
Read:
- `.memory-bank/constitution.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/features/*.md`
- `.memory-bank/tasks/index.json`
- indexed `.memory-bank/tasks/*.task.json`
- `.memory-bank/tasks/plans/IMPL-FT-*.md`
- `.memory-bank/packets/TASK-*.packet.json` when required
- `mb-doctor` output when available

## 2) Review checks
Must check:
- `.memory-bank/tasks/index.json` contains only references to existing
  `.memory-bank/tasks/*.task.json` files.
- Every indexed task has valid `status`, `wave`, `feature`, `depends_on`,
  `touched_files`, `tier`, `gates`, `verify`, and richer context fields.
- `ready` tasks have no unmet dependencies, blockers, blocking review rejects,
  or unresolved semantic concerns.
- Task waves and dependencies are coherent and do not create deadlocks.
- `tier` usage matches `.memory-bank/workflows/tier-policy.md`.
- T2/T3 tasks have relevant linked SDD specs through `source_artifacts`,
  `normative_inputs`, `constraints`, `invariants`, `verification_targets`, or
  feature `spec_design_links`.
- T2/T3 tasks and explicit packet-required T0/T1 tasks have usable canonical
  `.memory-bank/packets/TASK-<ID>.packet.json`.
- Product tasks do not use `W0`; `W0` is reserved for `FT-000`.
- If foundation is required, every non-`FT-000` product task depends directly
  or transitively on the final foundation gate task, and that gate is `done`
  before product execution.
- `/mb-doctor --strict` findings from the reviewed surface are addressed before
  `APPROVE` for autonomous/autopilot execution.
- Constitution contradictions are blocking.

## 3) Decision rule
- `APPROVE`: the task queue is safe to hand to manual `/execute` subject to
  normal `/mb-doctor` passing, or to `/autopilot` / autonomous scheduler
  subject to `/mb-doctor --strict` passing.
- `REJECT`: task records, waves, dependencies, packets, tier routing,
  foundation dependencies, or verification surface have blocking gaps. Fix and
  rerun `/review-tasks-plan`.
- Non-blocking notes may be reported with `APPROVE`; `REJECT` always means the
  gate is blocking.

## 4) Concrete reviewer prompt
Use fresh context. Example:

```bash
codex exec --ephemeral --full-auto -m gpt-5.2-high \
  'TASK_ID=TASK-MB-REVIEW-TASKS-PLAN. STAGE_ID=S-TASKS. Review .memory-bank/constitution.md, .memory-bank/spec-backbone.md, .memory-bank/spec-index.md, .memory-bank/features/*.md, .memory-bank/tasks/index.json, indexed .memory-bank/tasks/*.task.json records, .memory-bank/tasks/plans/IMPL-FT-*.md, packets when required, tier policy, and mb-doctor readiness findings. Check waves, dependencies, readiness, gates, verification surface, T2/T3 SDD links, packet readiness, and Foundation Dev Path dependency invariants. Write report to .tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-final-report-docs-01.md. VERDICT: APPROVE/REJECT; REJECT only for blocking gaps.'
```

## 5) Handoff
When approved:
- for manual `/execute TASK-<ID>`, run normal `/mb-doctor`
- for `/autopilot` or autonomous scheduler execution, run `/mb-doctor --strict`
- then start the selected execution mode
</process>
