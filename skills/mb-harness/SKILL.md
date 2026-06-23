---
name: mb-harness
description: >
  Set up deterministic commands, worktrees, and quality gates so agents can run safely in this repository.
---

# mb-harness — Harness engineering setup

- **What it does:** defines the execution harness around the repo, including commands, gates, and parallel-safe workflow.
- **Use it when:** the repository needs stronger agent guardrails before autonomous or multi-session work.
- **Input:** repository root and the project’s canonical build, test, and lint commands.
- **Output:** documented quality gates, optional Codex config, and a safer harness for agent execution.

## Goal
Turn the repo into a reliable “harness” for agents:
- clear entry points (AGENTS.md)
- reproducible commands (build/test/lint)
- mechanical checks (CI + MB lint)
- parallel-safe workflow (worktrees)

## Process

### 1) Codex project configuration (optional but recommended)
If you use Codex:
1. Create `.codex/` folder.
2. Create `.codex/config.toml` from `assets/codex-config.toml`.

Usage examples:
- default profile (coding): `codex`
- deep review: `codex --profile deep-review`

### 2) Document quality gates
In `AGENTS.md` (keep it short), list the canonical commands (examples):
- install deps
- lint / typecheck
- unit tests
- e2e tests

If the repo has UI or browser flows, explicitly document:
- Playwright command(s)
- agent-browser / browser MCP path (if available)
- where screenshots/videos/traces are stored
- which flows are considered release-critical

If the repo lacks them, add minimal scripts/Make targets.

### 3) Worktree workflow (parallel agents)
If multiple agents work in parallel:
- create worktrees per agent to avoid file conflicts
- merge only after passing gates

Example:
```bash
git worktree add ../wt-agent-1 -b agent-1
```

### 4) Add deterministic Memory Bank gates
If not already present, install the packaged Memory Bank gate assets:
- `scripts/mb-lint.mjs` from `mb-garden/assets/mb-lint.mjs`
- `scripts/mb-doctor.mjs` from `mb-garden/assets/mb-doctor.mjs`
- CI workflow coverage for the default health gates

The `mb-garden/assets` path is the current packaged asset location, not conceptual ownership of the doctor role. `mb-lint` covers structural/mechanical hygiene. `mb-doctor` covers workflow/autonomous readiness over `mb-lint`. Run default `mb-doctor` for ordinary pre-queue health checks. Run strict mode only after the JSON task queue exists: after `/foundation-to-tasks` at the foundation/task-queue boundary, after `/prd-to-tasks` at the feature/task-queue boundary, before scheduler execution inside `/autonomous`, or before `/autopilot` when the queue is already prepared:

```bash
node scripts/mb-lint.mjs
node scripts/mb-doctor.mjs --strict
```

The harness should treat missing `task.tier` as a blocking policy error. Task state is JSON-only through `.memory-bank/tasks/index.json` and indexed `TASK-*.task.json` records with concrete IDs shaped as `TASK-NNN-TN-FT-NNN-WN`; `backlog.md`, markdown task cards, and old `risk` / `risk.level` routing are unsupported.

### 4.1) Browser verification for UI projects
If the product has a UI:
- prefer Playwright / agent-browser / CDP-driven checks over “manual looks OK”
- persist artifacts (screenshots, videos, traces) into `.tasks/TASK-NNN-TN-FT-NNN-WN/`
- document canonical browser verification commands in `.memory-bank/testing/index.md`

### 5) Optional: skill eval harness
If you iterate on skills heavily:
- use `codex exec --json` runs + deterministic graders (see OpenAI evals guidance)

## Definition of done
- `.codex/config.toml` exists (if using Codex) with coding + review profiles.
- AGENTS.md lists quality-gate commands.
- repo has a documented path for worktrees.
- Memory Bank lint exists and passes.
- UI repos have a documented browser-driven verification path.
