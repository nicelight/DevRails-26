# Chuck Implementation Plan

## Goal

Refactor `memobank` into a more spec-driven, agent-friendly system without breaking:

- repo-local command SSOT in `.memory-bank/commands/*.md`
- `_shared` as the primary editable source
- classic duo docs (`architecture/*` + `guides/*`)
- PRD-less brownfield behavior
- resumable execution via `.protocols/` and `.tasks/`

This plan assumes the repository is too large for one agent context window and must be executed as an orchestrated multi-agent program.

## Current Context Snapshot

- `memobank` is a skill pack and scaffold generator, not an app.
- The real editable source of truth is `skills/_shared/*`.
- Installable package skills are vendored mirrors and must be refreshed after `_shared` changes.
- The current duo-doc assumption is encoded in several places at once:
  - `skills/_shared/scripts/init-mb.js`
  - `skills/_shared/references/structure-template.md`
  - `skills/_shared/references/workflows/mb-sync.md`
  - `skills/_shared/agents/review-architect.md`
  - `skills/_shared/agents/mb-reviewer.md`
  - `skills/mb-garden/SKILL.md`
- `skills/mb-garden/assets/mb-lint.mjs` is already softer than review/garden wording: it validates structure, frontmatter, and links, but it does not mechanically enforce duo pairs.
- This means the main near-term risk is semantic drift between generator, templates, review prompts, and maintenance policy.

## Critical File Groups

### Bootstrap and structure

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- vendored `scripts/shared-init-mb.js`
- vendored `references/shared-structure-template.md`

### Planning and execution semantics

- `skills/_shared/references/commands/prd.md`
- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`

### Review and maintenance policy

- `skills/_shared/references/commands/review.md`
- `skills/_shared/agents/review-architect.md`
- `skills/_shared/agents/mb-reviewer.md`
- `skills/_shared/references/workflows/mb-sync.md`
- `skills/mb-garden/SKILL.md`
- `skills/mb-garden/assets/mb-lint.mjs`

### Vendoring and package-skill alignment

- `scripts/vendor-shared.mjs`
- affected `skills/*/agents/shared-*.md`
- affected `skills/*/references/shared-*.md`
- affected `skills/*/scripts/shared-*.js`
- package entry docs such as `skills/cold-start/SKILL.md`, `skills/mb-init/SKILL.md`, `skills/mb-from-prd/SKILL.md`, `skills/mb-review/SKILL.md`, `skills/mb-garden/SKILL.md`

## Non-Negotiable Invariants

1. Changes start in `skills/_shared/*`, then get vendored.
2. New spec-driven docs are additive, not destructive.
3. `guides/*` remain legal, useful, and documented.
4. Old repos without `spec-index.md` / `glossary.md` / `invariants.md` must still work.
5. `execute` and `verify` must not require new metadata before `prd-to-tasks` and templates can produce it.
6. Brownfield mapping without PRD must remain as-is documentation only.

## Critical Risks

### Risk A: Partial migration

If `execute` or `verify` starts expecting `Normative Inputs` / `Verification Targets` before templates and `prd-to-tasks` emit them, the workflow breaks.

### Risk B: Contradictory wording

If `init-mb.js`, `structure-template.md`, `mb-sync.md`, `mb-garden`, and review prompts disagree on whether duo docs are required, users get inconsistent behavior.

### Risk C: Hidden vendor drift

If `_shared` is changed without propagating vendored copies, package skills diverge.

### Risk D: Overcorrection

If spec-driven docs become mandatory too early, existing lightweight repos stop fitting the system.

## Operating Model For This Refactor

### Orchestrator responsibilities

- keep the phase order fixed
- assign small bounded tasks to subagents
- review only summaries, not all raw scans
- own final synthesis and cross-phase consistency

### Subagent rules

- each subagent gets one narrow surface area
- each subagent reads at most 4-8 files
- each subagent returns:
  - touched file list
  - compatibility obligations
  - proposed edits or findings
  - risks and open questions
- no subagent edits vendored files first
- no subagent changes more than one migration phase at a time

### Context-saving rule

The orchestrator should treat subagent outputs as the durable working set and avoid reloading whole phases once the findings are summarized.

## Execution Sequence

1. Preflight inventory
2. Phase 1: Init
3. Phase 2: Templates
4. Phase 3: PRD-to-tasks
5. Phase 4: Execute
6. Phase 5: Verify
7. Phase 6: Review
8. Phase 7: Garden
9. Final compatibility sweep

## Phase 0: Preflight Inventory

### Objective

Build a compatibility matrix before any refactor edits.

### Files to inspect first

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/commands/*.md`
- `skills/_shared/agents/review-architect.md`
- `skills/_shared/agents/mb-reviewer.md`
- `skills/mb-garden/SKILL.md`
- `skills/mb-from-prd/SKILL.md`
- `skills/mb-review/SKILL.md`

### Deliverables

- list of current duo-doc assumptions
- list of command semantics that must remain stable
- list of places where spec-driven wording can be introduced safely
- list of vendored copies that will need sync

## Phase 1: Init

### Objective

Add optional spec-driven structure during bootstrap without weakening the old skeleton.

### Primary edit surface

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- any AGENTS example file if it becomes available
- `scripts/vendor-shared.mjs` only if vendoring mechanics need correction

### Intended change shape

- keep creating `architecture/` and `guides/`
- add optional artifacts such as:
  - `.memory-bank/spec-index.md`
  - `.memory-bank/glossary.md`
  - `.memory-bank/invariants.md`
  - `.memory-bank/states/`
- keep wording additive:
  - use `if present`
  - use `prefer`
  - use `optional normative layer`

### Done criteria

- new repo still supports duo-doc workflow
- new repo can host richer spec-driven docs
- generated AGENTS/index/MBB/mb-sync language is not contradictory

## Phase 2: Templates

### Objective

Allow richer metadata without making it mandatory.

### Primary edit surface

- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/concept-architecture-template.md`
- `skills/_shared/references/concept-guide-template.md`
- `skills/mb-from-prd/references/feature-template.md`
- `skills/mb-from-prd/references/epic-template.md`
- protocol templates if needed

### Intended change shape

- preserve architecture + guide pair templates
- add optional sections gradually:
  - `Source Artifacts`
  - `Normative Inputs`
  - `Constraints`
  - `Invariants`
  - `Verification Targets`

### Done criteria

- old feature docs still validate conceptually
- new templates can express spec-driven intent
- downstream commands are still tolerant of missing new sections

## Phase 3: PRD-to-Tasks

### Objective

Make planning emit richer operational structure while keeping current task cards usable.

### Primary edit surface

- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/_shared/references/commands/prd.md` if needed
- feature and plan templates if needed

### Backward-compatible fields that must remain

- `TASK-ID`
- `Status`
- `Wave`
- `Feature`
- `REQs`
- `Depends on`
- `Touched files`
- `Tests`
- `Verify`
- `Docs`

### Optional additive fields

- `Source Artifacts`
- `Normative Inputs`
- `Constraints`
- `Invariants`
- `Verification Targets`

### Done criteria

- old minimal task cards still work
- autonomous backlog generation still works
- richer task cards become possible without being required

## Phase 4: Execute

### Objective

Prefer richer inputs when present, but fall back to classic task inputs.

### Primary edit surface

- `skills/_shared/references/commands/execute.md`
- `skills/mb-execute/SKILL.md`
- related protocol templates if needed

### Resolution priority

1. explicit task-card or plan metadata
2. feature docs
3. requirements
4. duo docs
5. backlog entry

### Hard rule

Missing `Normative Inputs` or `Verification Targets` must not hard-fail task execution.

## Phase 5: Verify

### Objective

Support richer evidence targets while preserving classic AC/REQ verification.

### Primary edit surface

- `skills/_shared/references/commands/verify.md`
- `skills/mb-verify/SKILL.md`
- verifier prompt if needed

### Verification priority

1. explicit `Verification Targets`
2. explicit normative references
3. feature acceptance criteria
4. RTM requirements
5. tests and artifacts in `.tasks/`

## Phase 6: Review

### Objective

Teach reviewers to accept duo docs, spec-driven docs, or both.

### Primary edit surface

- `skills/_shared/references/commands/review.md`
- `skills/_shared/agents/review-architect.md`
- `skills/_shared/agents/mb-reviewer.md`
- affected package-skill review docs if needed

### Policy shift

Replace:

- "duo docs required"

With:

- "duo docs or equivalent spec-driven support docs must cover the concept"

### Hard rule

Absence of `guides/*` alone must not become an automatic defect once equivalent normative docs exist.

## Phase 7: Garden

### Objective

Relax obsolete exclusivity while keeping deterministic lint and maintenance.

### Primary edit surface

- `skills/mb-garden/SKILL.md`
- `skills/mb-garden/assets/mb-lint.mjs`
- `skills/_shared/references/workflows/mb-sync.md`
- any shared structure/recovery references used by garden

### Intended lint policy

- classic core files remain valid
- richer spec-driven files are recognized when present
- missing richer files should default to warnings, not hard errors
- core broken invariants remain errors

## Subagent Breakdown

### SG-01: Compatibility Matrix

Scope:

- `_shared/scripts/init-mb.js`
- `_shared/references/structure-template.md`
- `_shared/references/workflows/mb-sync.md`
- `_shared/agents/review-architect.md`
- `_shared/agents/mb-reviewer.md`

Output:

- inventory of all hard duo-doc assumptions
- exact wording that must change later

### SG-02: Init/Bootstrap Patch Prep

Scope:

- `_shared/scripts/init-mb.js`
- `_shared/references/structure-template.md`

Output:

- patch plan for optional spec-driven bootstrap artifacts
- no command semantic changes

### SG-03: Template Patch Prep

Scope:

- concept templates
- epic template
- feature template
- protocol templates if touched

Output:

- optional metadata sections
- compatibility notes for old documents

### SG-04: Planning Command Patch Prep

Scope:

- `_shared/references/commands/prd-to-tasks.md`
- `_shared/references/commands/prd.md`

Output:

- richer task card proposal
- migration-safe wording

### SG-05: Execute Patch Prep

Scope:

- `_shared/references/commands/execute.md`
- `skills/mb-execute/SKILL.md`

Output:

- fallback-resolution rules
- no mandatory new fields

### SG-06: Verify Patch Prep

Scope:

- `_shared/references/commands/verify.md`
- `skills/mb-verify/SKILL.md`

Output:

- dual-path verification policy
- evidence priority rules

### SG-07: Review Policy Patch Prep

Scope:

- `_shared/references/commands/review.md`
- `_shared/agents/review-architect.md`
- `_shared/agents/mb-reviewer.md`

Output:

- reviewer acceptance policy for old/new doc styles
- replacement wording for duo-doc exclusivity

### SG-08: Garden/Lint Patch Prep

Scope:

- `skills/mb-garden/SKILL.md`
- `skills/mb-garden/assets/mb-lint.mjs`
- `_shared/references/workflows/mb-sync.md`

Output:

- base-tier vs richer-tier validation design
- contradiction list vs earlier phases

### SG-09: Vendoring And Package Audit

Scope:

- `scripts/vendor-shared.mjs`
- affected package skills after each `_shared` change

Output:

- vendoring checklist
- list of packages to spot-check after each phase

## Validation Loop After Every Phase

1. Apply edits only to `_shared` and any explicitly phase-owned package files.
2. Run vendoring.
3. Inspect affected vendored copies.
4. Search for contradictory wording:
   - `guides`
   - `duo docs`
   - `spec-index`
   - `mandatory`
   - `optional normative layer`
5. Confirm these layers agree:
   - bootstrap
   - templates
   - commands
   - review prompts
   - garden/lint
6. Stop before next phase if contradictions remain.

## Suggested Milestones

### Milestone M1

Preflight matrix complete. No edits yet.

### Milestone M2

Init + templates updated. New structure is additive and wording-stable.

### Milestone M3

Planning layer updated. Old and new task cards both acceptable.

### Milestone M4

Execute + verify support dual input model.

### Milestone M5

Review + garden stop rejecting healthy old repos and understand richer new ones.

### Milestone M6

Full vendoring sweep complete and package skills aligned.

## Immediate First Wave

1. Build the preflight compatibility matrix.
2. Patch Phase 1 only.
3. Vendor and audit.
4. Patch Phase 2 only.
5. Vendor and audit.
6. Re-check for wording contradictions before touching `prd-to-tasks`.

## Stop Conditions

Stop and rescope if any of the following happens:

- Phase 1 wording forces later phases prematurely.
- A command doc starts requiring fields not yet generated upstream.
- Review/garden still rejects a repo that should remain valid.
- Vendored copies diverge from `_shared`.

## Success Definition

- old duo-doc repos remain coherent
- richer spec-driven repos become possible
- command behavior stays familiar
- `guides/*` remain valid HOW docs
- no phase requires downstream behavior before upstream generation exists
- `_shared` and vendored packages remain aligned
