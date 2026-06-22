# memobank

`memobank` is a skill pack/framework for Codex CLI, Claude Code, OpenCode, and compatible agent runtimes.

It helps agents run a project through files instead of fragile chat history: Memory Bank docs, resumable protocols, JSON tasks, and evidence. The goal is simple: keep context durable, make work restartable, and give beginners a clear path in. 🌱

## Why it exists

As a project grows, chat history becomes a weak source of truth. Decisions drift, task state gets fuzzy, and the next agent often has to rediscover too much.

`memobank` keeps the working state in the repository:

- `.memory-bank/` stores product knowledge, requirements, features, architecture, and task records;
- `.memory-bank/contracts/boundary-map.md` stores lightweight responsibility and scope boundary notes used through existing task fields and `runtime_context`;
- `.memory-bank/packets/` stores derivative Execution Packets for task runtime context; T2/T3 require them, T0/T1 use them only when explicitly required;
- `.protocols/` stores execution and verification traces for specific `TASK-*` work;
- `.tasks/` stores runtime evidence, reports, and handoff material;
- the JSON task queue keeps execution order and tier policy explicit.

## Main path: manual workflow

Start manually first. It makes the system easy to understand before you hand more control to automation.

```text
idea / rough draft
  -> /analysis or /brief when the direction needs shaping
  -> /constitution
  -> /write-prd
  -> /spec-init
  -> /prd
  -> /review-feat-plan for high-risk/large work
  -> /spec-design
  -> /foundation-to-tasks when foundation is required
  -> /mb-doctor at the foundation/task-queue boundary
  -> /execute + /verify FT-000 until the foundation gate is done
  -> /prd-to-tasks FT-001
  -> /review-tasks-plan
  -> /mb-doctor at the feature/task-queue boundary
  -> /execute first indexed TASK
  -> /verify same TASK
  -> /red-verify same TASK for T3 work (optional for T2 task closure)
  -> /red-verify --feature FT-001 for T2 feature completion
  -> /mb-sync
  -> repeat the feature/task loop until the project is done
```

In plain terms:

- `/analysis` and `/brief` help turn a raw idea into a usable input.
- `/constitution` runs a short contextual interview for project principles and non-negotiables. If you explicitly skip it, the flow can continue with framework-default/skipped principles and you can revisit it later.
- `/write-prd` captures a clear PRD.
- `/spec-init` creates a lightweight SDD route map from PRD/brief/existing-spec evidence. It does not run architecture design or create authoritative specs.
- `/prd` decomposes the PRD into Memory Bank product, requirements, epics, and features.
- For high-risk/large work, run `/review-feat-plan` after `/prd` and before `/spec-design`.
- `/spec-design` is mandatory after `/prd`, but adaptive in depth. Small independent T0/T1 projects get a minimal backbone with irrelevant areas marked `not_applicable`; shared/T2/T3 projects get normal architecture backbone decisions. When a minimum executable baseline is needed, it records `.memory-bank/foundation.md` and routes executable work to `/foundation-to-tasks`. If key decisions are unresolved, it records blockers and stops downstream.
- `/foundation-to-tasks` creates normal `FT-000` JSON foundation tasks and a final foundation gate task. Product feature tasks start only after that gate is `done`, or after `/spec-design` records foundation as `not_required`.
- `/prd-to-tasks FT-001` completes the feature-level SDD design, creates feature JSON tasks, and builds the required initial Execution Packets while feature/task/spec context is loaded. When foundation is required, product tasks depend on the final foundation gate.
- After the current feature task set is decomposed, run `/review-tasks-plan`, then `/mb-doctor` once at the feature/task-queue boundary before `/execute`.
- `/spec-improve FT-001` and `/mb-packet TASK-001` remain standalone repair/refresh commands when feature design or packets must be updated after decomposition.
- `/execute`, `/verify`, and `/mb-sync` take one task from implementation to synchronized project memory.
- `/red-verify TASK-*` is required for T3 task closure and optional for T2 task closure; `/red-verify --feature FT-*` is required before a T2 feature is treated as complete, and its verdict is recorded in the feature doc.

## Automation, when you are ready

Automation is available, but it works best after the manual loop is familiar.

- `/autopilot` runs an existing JSON task queue as a scheduler/executor.
- `/autonomous` runs the full unattended flow from PRD/Product Brief/delta to terminal state.
Both require usable packets for T2/T3 tasks and for T0/T1 tasks only when
`runtime_context.packet_required: true`.

## Killer features

- Durable context instead of dependence on chat history.
- Resumable task protocols for work that spans sessions.
- JSON task queue with `tier: T0|T1|T2|T3`.
- Beginner-friendly manual mode first, autonomous mode later.

## Install and quick start

For this source-only fork, use the installer wrapper:

```bash
node scripts/install-framework.mjs
```

The interactive installer lets you choose the target project folder from a list,
installs the memobank commands, and bootstraps or syncs the target repository.

Detailed installation mechanics and automation scenarios are documented in
[howItWorks.md](howItWorks.md).

Then run:

```text
/cold-start
```

or go straight into the manual flow: `/analysis` -> `/brief` -> `/constitution` -> `/write-prd` -> `/spec-init` -> `/prd` -> `/review-feat-plan for high-risk/large work` -> `/spec-design` -> `/foundation-to-tasks if required` -> `/mb-doctor at foundation/task-queue boundary` -> `execute/verify FT-000 until foundation gate done` -> `/prd-to-tasks FT-001` -> `/review-tasks-plan` -> `/mb-doctor at feature/task-queue boundary` -> `/execute first indexed TASK`.

`/spec-init` is the pre-PRD spec framing step: it captures enough domain, scenario, constraints, non-goals, risks, boundary hints, and lifecycle context for `/prd` to decompose safely. A `/spec-init` PASS means the project is prepared for `/prd`; Global Backbone Status is intentionally pending until `/spec-design`. After required foundation is gated and the current feature task set is decomposed, the feature/task-queue doctor gate makes the project ready for `/execute`. It keeps `.memory-bank/spec-index.md` as a pure spec registry and writes readiness/state to `.memory-bank/spec-backbone.md`.

## More detail

The full mechanics for installation, packaging, task model, tier policy, command reference, and checks live in [howItWorks.md](howItWorks.md).
