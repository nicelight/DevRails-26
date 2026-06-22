# Context For Chuck

## Purpose

This file gives you the working context for the original `memobank` repository before any refactor.

Your task is not to invent a new system from scratch. Your task is to evolve the existing system into a more spec-driven, agent-friendly model while preserving the current workflow and minimizing breakage.

The explicit target from the human is:

- keep `duo docs` as a backward-compatible layer
- add a spec-driven layer on top of `duo docs`
- do not make `guides/*` forbidden or useless
- migrate commands gradually in this order:
  - `init`
  - `templates`
  - `prd-to-tasks`
  - `execute`
  - `verify`
  - `review`
  - `garden`

## Language Rules

You must communicate with the human in Russian.

When editing repository files, preserve the original language of each file:

- if the original file is in English, keep edits in English
- if the original file is in Russian, keep edits in Russian
- do not translate existing English project docs into Russian unless the human explicitly asks for that
- do not introduce mixed-language rewrites unless the file already uses that pattern

## What This Repository Is

`memobank` is not an app. It is a skill pack and scaffold generator for agent runtimes such as Codex CLI, Claude Code, and similar tools.

It turns a target repository into an agent-operable workspace by creating:

- `.memory-bank/` as durable project knowledge
- `.tasks/` as runtime artifacts and detailed worker outputs
- `.protocols/` as resumable file-based execution state
- generated repo-local commands such as `/prd`, `/execute`, `/verify`, `/review`, `/autopilot`, `/autonomous`

The repository contains:

- package skills like `cold-start`, `mb-init`, `mb-from-prd`, `mb-execute`, `mb-verify`, `mb-review`, `mb-garden`, `mb-harness`
- shared source-of-truth assets in `skills/_shared/`
- vendored copies of those shared assets inside each installable skill

## Core Architecture Of The Repository

### Source of truth

The true editable base is:

- `skills/_shared/agents/*`
- `skills/_shared/references/*`
- `skills/_shared/scripts/init-mb.js`

Everything vendored under top-level package skills is a flattened copy for installability.

If you change shared behavior, you must keep vendored assets in sync via:

- `scripts/vendor-shared.mjs`

### Installable package skills

Main package skills:

- `cold-start`
- `mb-init`
- `mb-from-prd`
- `mb-map-codebase`
- `mb-execute`
- `mb-verify`
- `mb-review`
- `mb-garden`
- `mb-harness`

These package skills are entry points for installation and user-facing discovery.

### Generated repo-local commands

After initialization inside a target repository, the system generates command specs under:

- `.memory-bank/commands/*.md`

Then it exposes them via thin runtime-native proxy skills:

- `.claude/skills/<name>/SKILL.md`
- `.agents/skills/<name>/SKILL.md`

Those proxy skills only route to:

- `.memory-bank/commands/<name>.md`

This means `.memory-bank/commands/*.md` is the real SSOT for runtime command behavior.

## Current Original Workflow

### Bootstrap layer

Primary bootstrap logic lives in:

- `skills/_shared/scripts/init-mb.js`

It creates:

- `.memory-bank/`
- `.tasks/`
- `.protocols/`
- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`
- `.memory-bank/commands/*.md`
- `.claude/skills/*`
- `.agents/skills/*`

### Current Memory Bank model

The original model is centered on:

- `AGENTS.md` as short repo map
- `.memory-bank/index.md` as table of contents
- `.memory-bank/mbb/index.md` as rules
- `product -> requirements -> epics -> features -> tasks`

The original documentation philosophy is:

- code is implementation truth
- Memory Bank stores WHY/WHERE
- runtime details go to `.tasks/`
- long-running execution state goes to `.protocols/`

### Duo docs

The original MBB expects a pair model:

- `architecture/<concept>.md` = WHAT / WHY
- `guides/<concept>.md` = HOW

This pair is called here "duo docs".

This model is present in multiple places:

- MBB rules
- structure templates
- `init-mb.js`
- `mb-garden`
- architecture review prompts
- review command examples

### Greenfield flow

For a new repository with PRD:

1. `cold-start` or `mb-init`
2. `/prd`
3. `/prd-to-tasks FT-XXX`
4. `/execute TASK-XXX`
5. `/verify TASK-XXX`
6. `/mb-sync`
7. `/review`

Important invariant:

- `/prd` does not generate all tasks at once
- task generation is per-feature through `/prd-to-tasks`

### Brownfield flow

For an existing repository:

1. `cold-start` or `mb-init`
2. `/map-codebase`
3. `/review`
4. wait for PRD delta
5. `/prd`
6. `/prd-to-tasks`
7. `/execute -> /verify -> /mb-sync`

Important invariant:

- without PRD, brownfield mapping must remain as-is documentation only
- no invented epics, features, waves, or real task backlog without PRD

### Task execution flow

`/execute` creates and uses:

- `.protocols/TASK-XXX/context.md`
- `.protocols/TASK-XXX/plan.md`
- `.protocols/TASK-XXX/progress.md`
- `.protocols/TASK-XXX/verification.md`
- `.protocols/TASK-XXX/handoff.md`
- `.tasks/TASK-XXX/`

The intended model is resumable, fresh-session-friendly execution.

### Verification flow

`/verify` checks task output against:

- acceptance criteria from feature docs
- requirements RTM
- deterministic evidence such as tests, logs, screenshots, browser artifacts

### Review flow

`/review` is a fresh-context multi-reviewer gate:

- architect
- scope/RTM
- plan/backlog
- security
- MBB compliance
- optional code-quality

### Autonomous flow

There are two autonomous modes:

- `/autopilot` = backlog executor only
- `/autonomous` = full `PRD -> review -> decompose -> execute -> verify -> mb-sync -> review` loop

Terminal-state logic is already part of the original design.

## Files And Behaviors Most Important For Refactor

### Highest priority source files

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/commands/mb.md`
- `skills/_shared/references/commands/prd.md`
- `skills/_shared/references/commands/map-codebase.md`
- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/commands/review.md`
- `skills/_shared/references/workflows/mb-sync.md`
- `skills/mb-garden/assets/mb-lint.mjs`

### Important compatibility surface

- `skills/cold-start/SKILL.md`
- `skills/mb-init/SKILL.md`
- `skills/mb-from-prd/SKILL.md`
- `skills/mb-map-codebase/SKILL.md`
- `skills/mb-garden/SKILL.md`
- `skills/mb-review/SKILL.md`
- `skills/_shared/agents/review-architect.md`
- `skills/_shared/agents/mb-reviewer.md`
- `AGENTS-good-example.md`

## Existing Workflow Invariants That Must Not Break

These are non-negotiable unless the human explicitly says otherwise.

### 1. Repo-local command system

Keep:

- `.memory-bank/commands/*.md` as command SSOT
- proxy skills in `.claude/skills/*` and `.agents/skills/*`

Do not replace this with a different command registration model.

### 2. `_shared` remains source of truth

All conceptual refactor must start in:

- `skills/_shared/*`

Then shared assets must be vendored into package skills.

### 3. Do not break the old duo-doc workflow

The old model expects:

- `architecture/*`
- `guides/*`

You may weaken their mandatory status or redefine their role, but you must not suddenly make old docs invalid or nonsensical.

### 4. Do not block old projects

Existing Memory Bank users may already have:

- only `architecture/*`
- only `guides/*`
- pure duo-doc structure
- no spec-driven layer at all

The new system must still let those repos work.

### 5. PRD-less rule must survive

Without PRD:

- no speculative roadmap generation
- no fake epics/features/tasks

### 6. Execution remains resumable

Do not weaken:

- `.tasks/` as detailed worker output
- `.protocols/` as resumable state
- clean-session/fresh-session task execution model

## Target Refactor Direction

The intended future direction is not "replace duo docs with spec-driven docs".

The intended future direction is:

- keep duo docs as a compatibility layer
- add a spec-driven normative layer on top
- let `guides/*` remain useful
- gradually make execution/review more deterministic by relying on explicit normative inputs

The safe mental model is:

- `architecture/*` stays important
- `guides/*` stays allowed and useful
- spec-driven docs become an additional explicit layer for contracts, states, invariants, runbooks, testing, and source-of-truth routing

## Recommended Layering For The Future

This is the likely target shape the human wants:

- `.memory-bank/spec-index.md` as routing registry for normative docs
- `.memory-bank/glossary.md` as vocabulary
- `.memory-bank/invariants.md` as global MUST/NEVER rules
- `.memory-bank/architecture/*` for WHAT/WHY and boundaries
- `.memory-bank/guides/*` as optional but valid HOW docs
- `.memory-bank/contracts/*` for interface and boundary specs
- `.memory-bank/states/*` for lifecycle/state rules
- `.memory-bank/runbooks/*` for operational procedures
- `.memory-bank/testing/*` for verification basis
- `epics/features/tasks` remain operational planning artifacts

## Critical Refactor Risks

### Risk 1: partial migration

If you update `execute` and `verify` to require new spec fields before `prd-to-tasks` and templates generate them, the workflow self-breaks.

### Risk 2: contradictory rules

If `init-mb.js`, templates, review prompts, and garden rules disagree about whether `guides/*` are required, users get contradictory behavior.

### Risk 3: overcorrection

If you make spec-driven docs mandatory too early, you break the existing lightweight experience and old repos.

### Risk 4: hidden vendor drift

If you change `_shared` but forget to propagate vendored files, package skills will behave inconsistently.

## What Good Looks Like After Refactor

The ideal result:

- old duo-doc repos still pass and still make sense
- new repos can gradually adopt a spec-driven layer
- command behavior stays familiar
- `guides/*` remain valid and helpful
- normative sources become more explicit over time
- task execution can use richer structured inputs without hard-breaking old tasks

## Practical Rule For Every Change

Before any change, ask:

1. Does this preserve current greenfield flow?
2. Does this preserve current brownfield flow?
3. Does this preserve old duo-doc repos?
4. Does this add spec-driven structure as additive, not destructive?
5. Is the change first applied in `_shared` and then properly vendored?

If any answer is "no", the change is probably too aggressive for this stage.
