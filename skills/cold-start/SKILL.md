---
name: cold-start
description: >
  Bootstrap a Memory Bank for a new or existing repository, then route into PRD-driven or brownfield workflows.
---

# Cold Start: Memory Bank + Agents bootstrap (greenfield & brownfield)

## Summary

> **Note**: `cold-start` is the **package skill** for all-in-one bootstrap.
> Do not confuse it with the generated project command `/cold-start`: that command is a lightweight router used **after** skeleton creation inside a target repo.
> For modular usage, prefer individual skills: `mb-init` (skeleton), `mb-analysis` (optional idea discovery), `mb-from-prd` (greenfield), `mb-map-codebase` (brownfield), `mb-review` (`/review-feat-plan` or `/review-tasks-plan`), `mb-execute` (implementation), `mb-verify` (UAT), `mb-red-verify` (semantic adversarial verification).

- **What it does:** creates the Memory Bank skeleton, writes agent entry points, and routes the repo into the right workflow.
- **Use it when:** you want one entry point for either a new project with a PRD or an existing codebase that needs mapping first.
- **Input:** repository root plus either `prd.md` / requirements text or an existing codebase.
- **Output:** `.memory-bank/`, `.tasks/`, `.protocols/`, agent entry files, and the next step for greenfield or brownfield work.

Supported scenarios:
- **Idea-only**: repo has a raw idea, but no stable PRD yet; optionally route through `/analysis`, `/brainstorm`, and `/brief`.
- **Clear concept**: repo has enough direction for a product brief; normally run `/brief`, then `/constitution` only if project principles are not already `ratified|partial`, before `/write-prd`.
- **Greenfield**: repo has `prd.md` or requirements text, but no code yet.
- **Brownfield**: repo already contains code and needs **as-is** documentation before change planning.

---

## Non-negotiable principles

### 1) Orchestrator vs workers
- **You (main agent) are the orchestrator.** You plan and coordinate.
- **Workers (subagents) do the heavy lifting** (scanning many files, producing long reports).
- **Max depth = 2**: orchestrator → subagent. No sub-sub-agents.

### 2) `.tasks/` is runtime memory (НЕ Memory Bank)
- Every agent process gets a unique task folder: `.tasks/TASK-NNN-FT-NNN-W-N/`.
- Subagents write *detailed* outputs there, and return *only short summaries* to the orchestrator.

### 3) Avoid conflicts by design
- Split work by **non-overlapping file sets**.
- If overlap is unavoidable, use **git branches/worktrees per agent** and merge later.

### 4) Parallelism limits
- Run up to **5–7 subagents in parallel**.
- If your runtime supports multi-tool calls: spawn parallel subagents **in a single orchestrator turn**.

### 5) Docs First
After completing any meaningful unit of work:
1) Update Memory Bank while context is fresh.
2) Then change code / commit.

---

## Output you MUST create/maintain

### Repo root
- `AGENTS.md` (canonical, short, ~100 lines)
- `CLAUDE.md` → symlink (or copy) to `AGENTS.md`
- *(optional)* `GEMINI.md` → symlink (or copy) to `AGENTS.md`

### Repo folders
- `.memory-bank/` — durable knowledge base
- `.tasks/` — operational runtime memory
- `.protocols/` — file-based protocols (plans / decision logs / resume)

---

## Step 0 — Detect environment (don’t guess)

1) Check what tools you have:
   - Codex available? (Codex CLI / MCP tool)
   - Claude Code available? (CLI `claude`, subagents)
   - Browser tools? (Playwright / agent-browser / CDP MCP)

2) Decide primary engine:
   - **If working inside Codex**: use `gpt-5.2-high` for implementation and review (prefer fresh sessions for critical reviews).
   - **If working inside Claude Code**: use subagents for analysis + use Opus for synthesis; optionally call Codex via shell for second opinion or structured review.
   - **If both Codex and Claude are available (dual-engine)**: use Claude for wide-context scanning and synthesis, Codex for structured review and implementation. Cross-validate critical outputs (MB compliance, architecture) by running the review step on the other engine. See Step 4 for the hybrid workflow.

> If you don’t control Codex model selection via UI, create a project `.codex/config.toml` profile set (see Step 1.5).

---

## Step 1 — Bootstrap the skeleton

### 1.1 Create directories
Create (if missing):

- `.memory-bank/`
  - `mbb/`
  - `architecture/`
  - `guides/`
  - `adrs/`
  - `tech-specs/`
  - `domains/` *(optional but recommended)*
  - `contracts/` *(optional but recommended)*
  - `states/` *(optional but recommended)*
  - `runbooks/` *(optional but recommended)*
  - `workflows/` *(optional; can keep `wfs/` if you already use it)*
  - `quality/` *(optional but recommended)*
  - `testing/`
  - `skills/`
  - `epics/`
  - `features/`
  - `schemas/` *(JSON schemas, including task records)*
  - `tasks/`  *(empty JSON task index until `/foundation-to-tasks` when required or `/prd-to-tasks`, indexed task records, and plans)*
  - `commands/` *(slash-command specs used by humans/agents)*
  - `agents/` *(subagent prompt library)*
  - `archive/`
  - `bugs/`

- `.tasks/`
- `.protocols/`

### 1.2 Create core files (use the templates)
Use the templates in:
- `./references/shared-structure-template.md`

At minimum you must create:
- `AGENTS.md`
- `CLAUDE.md` symlink/copy
- `.memory-bank/index.md`
- `.memory-bank/constitution.md`
- `.memory-bank/mbb/index.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/glossary.md`
- `.memory-bank/invariants.md`
- `.memory-bank/product.md`
- `.memory-bank/requirements.md`
- `.memory-bank/schemas/task.schema.json`
- `.memory-bank/tasks/index.json`
- `.memory-bank/testing/index.md`

Also create the command specs under `.memory-bank/commands/` (use `references/commands/*`).
This includes optional Analysis commands (`analysis.md`, `brainstorm.md`, `brief.md`) when those command specs are present in the package.
It also includes `constitution.md` for the `/constitution` command, which creates or updates `.memory-bank/constitution.md`.

### 1.2.1 Create native skills (proxy commands)
Create thin proxy skills so commands work natively in each runtime:
- `.claude/skills/<name>/SKILL.md` → Claude Code + OpenCode
- `.agents/skills/<name>/SKILL.md` → Codex CLI + OpenCode

Each proxy just says: `Read and follow the instructions in .memory-bank/commands/<name>.md`.
This makes commands available natively (`/mb`, `/constitution`, `/prd`, `/execute`, etc.) in all three tools.

The `init-mb.js` script creates both sets automatically.

Agents read `.memory-bank/constitution.md` early during priming. It is the short governing-principles layer for project decisions, not a replacement for `.memory-bank/invariants.md`, `.memory-bank/contracts/*`, `.memory-bank/spec-index.md`, or tier/workflow policy.

### 1.3 Enforce frontmatter rule
Every markdown file inside `.memory-bank/` must include YAML frontmatter with at least:
- `description: ...`
- `status: draft|active|deprecated|archived`

### 1.4 Create `.tasks/` protocol
Create a task folder for this run (pick a new id):
- `.tasks/TASK-MB-INIT/`

Inside it, create:
- `TASK-MB-INIT-S-00-orchestrator-plan.md` — what you will do + which subagents

### 1.5 Optional: Codex profile presets
If Codex is used, create `.codex/config.toml` with profiles:
- default: coding (gpt-5.2, high)
- profile `deep-review`: review (gpt-5.2, xhigh)

(If your repo is shared, consider keeping it local or documenting it in `.memory-bank/runbooks/`.)

---

## Step 2 — Choose scenario

### Decision rule
- If repo has substantial code (`src/`, `package.json`, `go.mod`, `Cargo.toml`, etc.) → **Brownfield** (Step 3B).
- If repo is mostly empty and you have `prd.md` → **Greenfield** (Step 3A); recommend `/constitution` before `/write-prd` if project principles are not ratified/partial.
- If repo is mostly empty and you only have an idea or loose concept → optionally run **Analysis** first: `/analysis`, `/brainstorm` when the idea is raw, `/brief`, then `/constitution` before `/write-prd` only if project principles are not already `ratified|partial`.
- If both exist: treat as **Brownfield + PRD delta** (Step 3B).
- If repo is empty/new **and no `prd.md`** → **Skeleton-only** (Step 3C).

Record the scenario in:
- `.tasks/TASK-MB-INIT/TASK-MB-INIT-S-00-orchestrator-plan.md`

---

## Step 3A — Greenfield workflow (PRD → Memory Bank)

### 3A.1 Write clarified PRD
- Run `/constitution` before `/write-prd` when project principles are still framework-default/skipped/missing. If they are already ratified/partial, continue directly to `/write-prd`. `/constitution` reads `.memory-bank/analysis/product-brief.md` when present and asks up to 5 contextual governance questions per pass.
- If the user explicitly skips `/constitution`, continue with framework-default/skipped principles and note that it can be ratified later.
- Run `/write-prd` to turn Product Brief / PRD text + Constitution into `.memory-bank/prd.md`.
- `/write-prd` handles PRD-level ambiguity with up to 5 targeted questions per pass.
- If PRD mentions “use skills/tools/CLIs” — run `/find-skills` first (project-installed → marketplace).

If user is temporarily unavailable (“запуск и ушёл”):
- Record `Open questions` in `.protocols/PRD-BOOTSTRAP/decision-log.md`.
- **Stop and wait** (do not invent facts; do not proceed to EP/FT/task generation without answers).

If the user explicitly wants **autonomous mode**:
- record non-blocking gaps as `Assumptions`
- halt only on blocking gaps (security/compliance/external contract/data-loss risks)
- continue with `/autonomous` after `/write-prd` is complete

### 3A.2 Route PRD to L1–L3
Run `/spec-init` to update `.memory-bank/spec-index.md` as a lightweight SDD route map from PRD/brief/existing-spec evidence, without architecture interview or invented authoritative specs.
Then run `/prd` to decompose `.memory-bank/prd.md` into product, requirements, epics, features, testing, and index updates.
After `/prd`, run `/review-feat-plan` for high-risk/large work, then always run `/spec-design`. For small independent T0/T1 features it may record a minimal backbone with irrelevant areas marked `not_applicable`; for shared/T2/T3 concerns it creates or updates the needed backbone SDD specs and `spec-index`. This is not another mandatory heavy phase: it creates no tasks and no feature-local implementation design. If foundation is required, `/foundation-to-tasks` creates normal `FT-000` tasks and the final foundation gate before product feature tasking. `/prd-to-tasks FT-<NNN>` performs feature-level SDD design before task slicing.

`/prd` owns:
- `.memory-bank/product.md`
- REQ-IDs
- RTM table mapping REQ → Epic → Feature → Test
- `.memory-bank/epics/EP-*.md`
- `.memory-bank/features/FT-*.md`

Each generated feature MUST include:
- use cases
- acceptance criteria
- failure modes / edge cases
- test strategy pointers

Status policy:
- Default EP/FT frontmatter to `status: draft` until `Open questions` are resolved.
- Promote to `status: active` only when acceptance criteria + verification plan are stable.
- `/prd` / `mb-from-prd` do not create tasks; canonical planning path is `/write-prd` → `/spec-init` → `/prd` → `/review-feat-plan` for high-risk/large work → `/spec-design` → `/foundation-to-tasks` if required → `/prd-to-tasks FT-<NNN>`.
- Add feature `clarification_status: pending|blocked` only for explicit feature-level blockers.

### 3A.3 Tasks planning (per-feature, no “everything at once”)
Do **not** generate a full task queue for all features in one pass.

Instead:
1) Ensure `.memory-bank/schemas/task.schema.json` and `.memory-bank/tasks/index.json` exist.
2) For each selected feature, use `/clarify-feature FT-<NNN>` only if the feature is explicitly pending/blocked.
3) Run `/spec-design` after `/prd`; use minimal backbone for simple T0/T1 scope and fuller backbone specs for shared/T2/T3 concerns.
4) If foundation is required, run `/foundation-to-tasks` and close the final foundation gate.
5) Run `/prd-to-tasks FT-<NNN>` to produce feature-level design status, implementation plan, JSON tasks, and required packets:
   - `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`
   - atomic `.memory-bank/tasks/TASK-*.task.json` records grouped by `wave`, each with mandatory `tier: T0|T1|T2|T3`; concrete IDs use `TASK-NNN-FT-NNN-W-N`

Task routing is authoritative only through `task.tier`; the old `risk` / `risk.level` model is invalid.

### 3A.4 Identify key concepts and create support docs
For every non-trivial concept, create support docs that make the concept cheap to reload later:
- default / compatibility path:
  - `.memory-bank/architecture/<concept>.md` (WHAT/WHY)
  - `.memory-bank/guides/<concept>.md` (HOW)
- add spec-driven support docs when they clarify source-of-truth:
  - `.memory-bank/tech-specs/...`
  - `.memory-bank/contracts/...`
  - `.memory-bank/domains/...`
  - `.memory-bank/states/...`
  - `.memory-bank/adrs/...`
  - `.memory-bank/runbooks/...`
  - `.memory-bank/testing/...`

Rules:
- classic duo docs remain valid and useful
- spec-driven docs are additive, not a replacement by default
- do not create a new spec before checking existing specs through `.memory-bank/spec-index.md`
- if richer docs exist, route them from `.memory-bank/spec-index.md` and related concept docs

### 3A.5 Update index
Update `.memory-bank/index.md` with annotated links to all created docs.

---

## Step 3B — Brownfield workflow (Repo → Memory Bank)

### 3B.1 Spawn repo-scanning subagents (parallel)
Create a new task folder:
- `.tasks/TASK-MB-MAP/`

Spawn up to 5 subagents in parallel with non-overlapping scopes:
1) `S-01`: build/tooling (package managers, scripts, CI)
2) `S-02`: backend/services
3) `S-03`: frontend/UI
4) `S-04`: data layer (DB, migrations, schema)
5) `S-05`: tests + quality gates

Each subagent MUST:
- verify its file glob targets exist ("smart calling")
- write a detailed report into `.tasks/TASK-MB-MAP/` using naming:
  `TASK-MB-MAP-S-0X-final-report-<code|docs>-YY.md`
- return a 5–10 line summary + file list

Use `./agents/shared-repo-scanner.md` as baseline prompt, but scope it.

### 3B.2 Synthesize Memory Bank from reports
Using the `.tasks/TASK-MB-MAP/` reports, fill:
- `.memory-bank/product.md` — what the system is today
- `.memory-bank/architecture/` — C4 L1–L3 overview + key invariants
- `.memory-bank/spec-index.md` / `.memory-bank/invariants.md` / `.memory-bank/glossary.md` — if the evidence supports explicit normative routing
- `.memory-bank/runbooks/` — setup, dev, test, deploy
- `.memory-bank/contracts/` — API/event contracts
- `.memory-bank/states/` — lifecycle/state rules when they are evident from code or workflows
- `.memory-bank/testing/index.md` — canonical gates + verification notes
- `.memory-bank/index.md` — annotated links

> **PRD-less rule (non-negotiable)**: if there is **no `prd.md`**, you MUST NOT create or populate:
> - `.memory-bank/epics/*`
> - `.memory-bank/features/*`
> - `.memory-bank/tasks/*.task.json` with real roadmap tasks
>
> Empty skeleton files/folders are allowed if they were created by bootstrap.
>
> Repo mapping is **as-is documentation**, not roadmap planning. If something cannot be derived from code/logs/tests, record it as a hypothesis or an open question.

### 3B.3 Ask user for PRD delta
After baseline MB exists:
- ask the user for `prd.md` describing **what to change/add**
- run `/constitution` first only if project principles are not ratified/partial, then `/write-prd`, `/spec-init`, `/prd`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks --verify-existing` only if baseline proof is still needed, and `/prd-to-tasks FT-<NNN>` style decomposition against the existing baseline. By default, brownfield does not create `FT-000` when the existing baseline is already verified.

---

## Step 3C — Skeleton-only workflow (no PRD, no code)

When the repo is new/empty and no `prd.md` is available:

### 3C.1 Create skeleton only
Run Step 1 as usual — create all directories, core files from templates, `AGENTS.md`, `CLAUDE.md` symlink.

The skeleton provides a ready-to-fill structure: `product.md`, `requirements.md`, `tasks/index.json`, etc. remain as draft stubs/placeholders.
In PRD-less mode, `tasks/index.json` must be `{ "version": 1, "tasks": [] }` and no `TASK-001-FT-001-W-1.task.json` or other runnable task record is generated.

### 3C.2 Ask for PRD
After skeleton is created, **ask the user** to provide a PRD:

> "Memory Bank skeleton created. To fill it with product details, epics, features, SDD design, foundation gate when needed, and task records, please provide a `prd.md` file (or paste requirements text). You can do this now or later — run `/constitution` first only if project principles are not already `ratified|partial`, then `/write-prd`, `/spec-init`, `/prd`, `/review-feat-plan` for high-risk/large work, `/spec-design`, `/foundation-to-tasks` if required, and `/prd-to-tasks FT-<NNN>`."

### 3C.3 Wait or proceed
- **If user provides PRD now** → continue to Step 3A (Greenfield workflow).
- **If user defers** → stop here. The skeleton is valid and usable. The user can invoke `$mb-from-prd` or `/prd` later to fill the Memory Bank.
- **If user provides partial info** → route it through `/brief`, then `/constitution` only if project principles are not already `ratified|partial`, and `/write-prd`; stop if PRD-level blockers remain.

> **Note**: The skeleton-only state is a valid stopping point. `AGENTS.md` + `.memory-bank/index.md` + MBB rules are enough for agents to start navigating the repo.

---

## Step 4 — Hybrid mode (Claude ↔ Codex)

If you’re in Claude Code but want Codex quality or long-horizon autonomy:

1) Use Claude subagents to produce the scan reports into `.tasks/TASK-MB-MAP/`.
2) Call Codex via shell to synthesize Memory Bank:

```bash
codex exec --ephemeral --full-auto -m gpt-5.2-high \
  'Read .tasks/TASK-MB-MAP and build/refresh .memory-bank per MBB. Keep AGENTS.md short. Produce a summary and run a self-review.'
```

3) Then run a Codex deep review profile (or a fresh Claude session) for 5-expert review.

---

## Step 5 — Explicit review gates (fresh context)

Run **fresh-context** reviewers (do not reuse the writer context):

- Architect (C4 + dependencies)
- Scope analyst (REQ → Epic → Feature → Task coverage)
- MBB compliance reviewer (frontmatter, links, atomics, duo)
- Plan reviewer (task record quality, waves, gates)
- Security reviewer (auth, sensitive data, OWASP risks)
- Code quality reviewer (conditional: if code exists — quality gates, conventions, hotspots)

Use `/review-feat-plan` after `/prd` for high-risk, large, or autonomous flows.
Use `/review-tasks-plan` after `/prd-to-tasks` and before task execution.
Shared prompts in `./agents/shared-review-*.md` and
`./agents/shared-mb-reviewer.md` may be reused by those commands.

Rules:
- If any reviewer returns REJECT → fix MB and repeat review.
- Persist reviewer reports into the selected `.tasks/TASK-MB-REVIEW-*` folder.

---

## Step 6 — Start executing tasks

After `/review-tasks-plan` passes (APPROVE):

1. Pick the highest-priority ready task from `.memory-bank/tasks/index.json` and its indexed `.task.json` records. If the index is empty, stop and run `/spec-design`, then `/foundation-to-tasks` if required, then `/prd-to-tasks FT-<NNN>` for a selected feature.
   Use `/clarify-feature FT-<NNN>` first only if that feature is explicitly pending/blocked.
2. Run `mb-execute` for the task (plan → implement → quality gates → handoff).
3. Run `mb-verify` for the same task when verification is required by tier/workflow.
4. Route red verification by `task.tier`: `T3` requires per-task `mb-red-verify` before closure; `T2` does not require per-task red-verify for task closure, but the feature requires `/red-verify --feature FT-<NNN>` before feature completion.
5. For `T3`, require human-aware checkpoint plus rollback/recovery note before closure.
6. Run `/mb-sync` only by scheduler or explicit standalone owner after the closure decision is recorded.
7. Repeat until the wave is complete or user stops.

If the intended mode is unattended end-to-end:
- do not stay in manual loop here
- switch to generated project command `/autonomous`

> If `mb-execute`, `mb-verify`, or `mb-red-verify` are not installed, follow their SKILL.md manually.

---

## Definition of done

You are done when:

- `AGENTS.md` exists, short, points to `.memory-bank/index.md`.
- `CLAUDE.md` is a symlink/copy of `AGENTS.md`.
- `.memory-bank/` contains at minimum: index + MBB + product + testing (requirements can remain as stubs until PRD exists).
- `.memory-bank/constitution.md` exists and `/constitution` is available for governing-principles updates.
- `.tasks/` contains scan/review artifacts with naming + stage ids.
- Greenfield: epics/features/task records created from PRD.
- Brownfield: repo mapped **as-is** into MB and user asked for PRD delta (no roadmap entities invented without PRD).
- Skeleton-only: skeleton created, user asked for PRD (valid stopping point).
- Multi-expert review passes (APPROVE) — for Greenfield/Brownfield; skip for Skeleton-only.
- Execution loop is available (mb-execute + mb-verify reachable or documented, plus mb-red-verify for T3 tasks and T2 feature completion).
- Autonomous loop is available (`/autonomous` + `/autopilot` documented).

---

## References in this skill

- `./references/shared-structure-template.md`
- `./agents/shared-repo-scanner.md`
- `./agents/shared-mb-reviewer.md`
- `./agents/shared-review-architect.md`
- `./agents/shared-review-scope.md`
- `./agents/shared-review-code.md`
- `./agents/shared-review-plan.md`
- `./agents/shared-review-security.md`
- `./scripts/shared-init-mb.js` (optional helper)
