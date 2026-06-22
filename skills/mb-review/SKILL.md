---
name: mb-review
description: >
  Review a Memory Bank planning surface with fresh-context specialists: feature plan before SDD design or task queue before execution.
---

# mb-review — Explicit Memory Bank review gates

- **What it does:** runs independent reviewers over one explicit surface: feature plan or task queue plan.
- **Use it when:** you need `/review-feat-plan` before `/spec-design`, or `/review-tasks-plan` after `/prd-to-tasks` and before execution.
- **Input:** an existing `.memory-bank/`.
- **Output:** reviewer reports under `.tasks/TASK-MB-REVIEW-FEAT-PLAN/` or `.tasks/TASK-MB-REVIEW-TASKS-PLAN/` plus a synthesized fix list and verdict.

## Goal
Detect gaps, contradictions, broken traceability, and non-compliance at the
right gate.

Use:
- `/review-feat-plan` to check PRD -> REQ/EP/FT decomposition before
  `/spec-design`
- `/review-tasks-plan` to check JSON task records, waves, dependencies,
  packets, tier routing, and Foundation Dev Path dependencies before execution

For foundation migration, explicitly check that `FT-000` is used only as the
reserved Foundation Dev Path pseudo-feature, product tasks do not use `W0`, and
required product tasks depend on the final foundation gate.

This is **not** the same as per-task semantic verification.
Use `mb-red-verify` when the question is “did this task solve the right problem in substance?”

## Preconditions
- `.memory-bank/` exists.

## Process

### 1) Pick the review gate
Do not run a combined generic review by default.

- Feature plan gate: create `.tasks/TASK-MB-REVIEW-FEAT-PLAN/`
- Task queue plan gate: create `.tasks/TASK-MB-REVIEW-TASKS-PLAN/`

### 2) Spawn reviewers (fresh contexts)
Spawn only reviewers relevant to the selected gate.

For `/review-feat-plan`:
- Scope/RTM
- MBB compliance
- Security/Constitution when risk requires it

For `/review-tasks-plan`:
- Task planning
- Architect/spec linkage for T2/T3
- Security/Constitution when risk requires it

Shared prompts may still be reused:
- Architect — `./agents/shared-review-architect.md`
- Scope/RTM — `./agents/shared-review-scope.md`
- Task planning — `./agents/shared-review-plan.md`
- Security — `./agents/shared-review-security.md`
- MBB compliance — `./agents/shared-mb-reviewer.md`

Each reviewer must:
- write a detailed report to the selected `.tasks/TASK-MB-REVIEW-*` folder
- return only a short summary + verdict to the orchestrator

### 3) Synthesize and decide
As orchestrator:
- combine findings
- deduplicate
- rank issues P0–P3
- produce a concrete fix plan

If the repo is preparing for `/autonomous`:
- treat any `REJECT` as **blocking**
- keep non-blocking findings as notes under `APPROVE`
- do not allow batch execution until the final verdict is `APPROVE`

### 4) Gate
If any reviewer returns `REJECT`:
- fix MB
- re-run the same explicit review command

## Definition of done
- The selected `.tasks/TASK-MB-REVIEW-*` folder contains reviewer reports.
- Orchestrator produced an actionable prioritized fix list.
- Final verdict: APPROVE.
