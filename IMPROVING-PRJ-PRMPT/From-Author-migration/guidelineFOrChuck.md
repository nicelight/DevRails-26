# Guideline For Chuck

## Goal

Refactor the original `memobank` repository into a more spec-driven-development-oriented system without breaking the familiar workflow.

The intended outcome is:

- `duo docs` remain supported and useful
- a spec-driven layer is added on top
- `guides/*` remain allowed and meaningful
- migration is incremental and low-risk

This is not a rewrite. This is a compatibility-preserving evolution.

## Language Policy

- communicate with the human in Russian
- keep file edits in the original language of the file being edited
- preserve English in the original project documentation unless the human explicitly requests translation
- avoid mixed-language edits unless the file already uses mixed-language content intentionally

## Hard Principles

### 1. Additive, not destructive

Do not remove the old duo-doc model first.

Prefer:

- "old model still valid"
- "new model optionally richer"

Avoid:

- "old docs become invalid"
- "new mandatory fields appear before generators produce them"

### 2. `_shared` first

Always treat the following as the primary editable sources:

- `skills/_shared/agents/*`
- `skills/_shared/references/*`
- `skills/_shared/scripts/init-mb.js`

After changes:

- propagate them through vendoring
- verify the vendored skill copies match the shared sources

### 3. Preserve existing command semantics

The current command set and expected workflow must remain recognizable:

- `/mb`
- `/cold-start`
- `/mb-init`
- `/prd`
- `/prd-to-tasks`
- `/execute`
- `/verify`
- `/review`
- `/mb-sync`
- `/autopilot`
- `/autonomous`

Do not silently repurpose commands into something incompatible.

### 4. Keep `guides/*` legal

`guides/*` must remain:

- allowed
- useful
- documented

Do not treat them as legacy junk.

They may become optional in the future architecture, but never "forbidden".

### 5. Maintain old repo compatibility

The refactor must still support target repos that contain:

- classic `architecture + guides` pairs
- no `spec-index.md`
- no `glossary.md`
- no `invariants.md`
- no `contracts/*`
- no `states/*`

The new system must degrade gracefully.

## Target Compatibility Model

The safest target model is:

### Layer A: backward-compatible duo docs

- `architecture/*` for WHAT / WHY
- `guides/*` for HOW

### Layer B: new spec-driven normative layer

- `spec-index.md`
- `glossary.md`
- `invariants.md`
- `contracts/*`
- `states/*`
- `runbooks/*`
- `testing/*`
- `adrs/*`

### Layer C: operational planning layer

- `epics/*`
- `features/*`
- `tasks/backlog.md`
- `tasks/plans/*`
- `.protocols/*`
- `.tasks/*`

The critical design rule:

- Layer B enriches and tightens Layer A
- Layer B does not invalidate Layer A

## Migration Strategy

Follow this order only:

1. `init`
2. `templates`
3. `prd-to-tasks`
4. `execute`
5. `verify`
6. `review`
7. `garden`

Do not start with `execute` or `verify`.

## Preflight Before Phase 1

Before changing anything:

1. read the current original behavior from:
   - `skills/_shared/scripts/init-mb.js`
   - `skills/_shared/references/structure-template.md`
   - `skills/_shared/references/commands/*.md`
   - `skills/mb-from-prd/SKILL.md`
   - `skills/mb-garden/SKILL.md`
   - `skills/mb-review/SKILL.md`
2. write down where the original repo currently assumes:
   - mandatory duo docs
   - `guides/*` pair requirements
   - classic feature/task card format
3. treat those assumptions as compatibility obligations until each one is intentionally migrated

This preflight is not a refactor phase. It is a guard against accidental semantic drift.

## Phase 1: Init

### Files

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `AGENTS-good-example.md`
- `scripts/vendor-shared.mjs` only if needed for portability or vendoring correctness

### Objectives

- keep generating the original structure
- add spec-driven files as optional additive artifacts
- keep `guides/` in the created structure
- do not remove old directories unless there is a very strong reason

### Recommended actions

- keep creating `architecture/`
- keep creating `guides/`
- add optional new files:
  - `.memory-bank/spec-index.md`
  - `.memory-bank/glossary.md`
  - `.memory-bank/invariants.md`
- add optional new folders only if they are actually used by later stages:
  - `.memory-bank/contracts/`
  - `.memory-bank/states/`
- keep `AGENTS.md` wording compatible with old flow
- mention spec-driven docs as optional preferred inputs, not as mandatory hard dependency

### Important wording strategy

Use phrases like:

- "if present"
- "prefer"
- "optional normative layer"
- "guides remain valid HOW docs"

Avoid phrases like:

- "guides are not needed"
- "guides are deprecated"
- "must use spec-index for everything"

### Phase-1 done criteria

- a freshly initialized repo still supports the original duo-doc workflow
- a freshly initialized repo can additionally host spec-driven docs
- no contradictions remain between generated `AGENTS.md`, `.memory-bank/index.md`, `.memory-bank/mbb/index.md`, and `mb-sync.md`

## Phase 2: Templates

### Files

- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/concept-architecture-template.md`
- `skills/_shared/references/concept-guide-template.md`
- `skills/mb-from-prd/references/feature-template.md`
- `skills/mb-from-prd/references/epic-template.md`
- protocol templates if needed

### Objectives

- keep duo-doc templates
- add optional spec-driven metadata gradually
- do not require new fields before downstream generators and commands understand them

### Recommended actions

- preserve concept pair templates:
  - architecture template stays
  - guide template stays
- add optional sections to feature/task-related templates:
  - `Source Artifacts`
  - `Normative Inputs`
  - `Constraints`
  - `Invariants`
  - `Verification Targets`
- mark them as recommended or optional at first
- do not make them universal hard requirements in Phase 2

### Important compatibility rule

At this stage:

- old feature docs without the new fields must still be acceptable

### Phase-2 done criteria

- templates support richer spec-driven data
- templates still support classic duo-doc usage
- no downstream command assumes the new fields are always present

## Phase 3: PRD-To-Tasks

### Files

- `skills/_shared/references/commands/prd-to-tasks.md`
- possibly `skills/_shared/references/commands/prd.md`
- feature and plan templates if needed

### Objectives

- teach planning to emit richer spec-driven operational fields
- preserve old task card shape

### Recommended actions

- keep existing task card fields:
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
- optionally extend task cards with:
  - `Source Artifacts`
  - `Normative Inputs`
  - `Constraints`
  - `Invariants`
  - `Verification Targets`
- optionally extend feature/implementation-plan generation with:
  - boundary or contract inputs
  - relevant states/runbooks/testing references

### Critical rule

Do not require the new fields in execution until this phase actually produces them.

### Phase-3 done criteria

- `prd-to-tasks` can produce richer task cards
- old minimal task cards still exist and remain valid
- autonomous backlog generation still works with minimal cards

## Phase 4: Execute

### Files

- `skills/_shared/references/commands/execute.md`
- `skills/mb-execute/SKILL.md`
- protocol templates if needed

### Objectives

- let execution benefit from structured spec-driven inputs
- do not block classic tasks that only have old fields

### Recommended behavior

Execution should follow this priority:

1. if task card or plan includes spec-driven fields, read them
2. else fall back to classic inputs:
   - feature doc
   - requirements
   - backlog entry
   - architecture/guides as available

### Compatibility rule

Do not hard-fail only because:

- `Source Artifacts` is missing
- `Normative Inputs` is missing
- `Verification Targets` is missing

Instead:

- use fallback resolution
- record the missing structure as a warning or follow-up improvement opportunity

### Good fallback wording

- "prefer explicit normative inputs when present"
- "fallback to classic feature + requirement + duo-doc priming when absent"

### Phase-4 done criteria

- new rich tasks execute cleanly
- old minimal tasks still execute cleanly
- execution becomes more deterministic when richer inputs exist

## Phase 5: Verify

### Files

- `skills/_shared/references/commands/verify.md`
- `skills/mb-verify/SKILL.md`
- verifier prompt if needed

### Objectives

- verification should use spec-driven targets when present
- verification must still work against old AC/REQ model

### Recommended behavior

Verification priority:

1. `Verification Targets` and explicit normative inputs if present
2. otherwise classic acceptance criteria from feature docs and RTM

### Compatibility rule

Never require the new spec-driven verification fields as the only valid basis.

Old basis must remain valid:

- feature acceptance criteria
- requirements
- tests
- evidence in `.tasks/`

### Phase-5 done criteria

- verifier supports both classic and spec-driven evidence basis
- no regression for existing task verification workflow

## Phase 6: Review

### Files

- `skills/_shared/references/commands/review.md`
- `skills/_shared/agents/review-architect.md`
- `skills/_shared/agents/mb-reviewer.md`
- possibly package-skill review docs

### Objectives

- review must understand both models
- no reviewer should reject a repo merely because it uses duo docs

### Recommended review policy

Architecture review should accept either:

- classic duo docs
- or richer spec-driven docs
- or both

MBB review should check:

- `guides/*` are valid if present
- `guides/*` are not mandatory if equivalent normative docs exist
- but lack of `guides/*` alone is not a defect

### Replace hard assumptions

Replace "duo docs required" with something like:

- "duo docs or equivalent spec-driven support docs must cover the concept"

### Phase-6 done criteria

- review prompts and examples no longer assume only one model
- old repos are not unfairly rejected
- new richer repos are correctly evaluated

## Phase 7: Garden

### Files

- `skills/mb-garden/SKILL.md`
- `skills/mb-garden/assets/mb-lint.mjs`
- `skills/_shared/references/workflows/mb-sync.md`
- any shared recovery or structure references used by garden

### Objectives

- maintenance tools must stop enforcing obsolete exclusivity
- lint must recognize both old and new structures

### Recommended lint policy

`mb-lint` should:

- still validate classic core files
- understand optional spec-driven files if present
- not require `guides/*` pairs unconditionally
- not require `spec-index.md` unconditionally unless the project explicitly opts into stricter mode

### Best compatibility approach

Support two validation tiers:

- base compatibility tier
- richer spec-driven tier

Without turning that into a giant framework.

Simple approach:

- warnings for missing richer spec-driven files
- errors only for broken core invariants

### Phase-7 done criteria

- `mb-garden` no longer contradicts the new architecture
- lint does not reject healthy duo-doc repos
- lint can positively validate richer spec-driven repos

## Validation Loop After Every Phase

After each migration phase:

1. vendor shared assets so package-skill copies reflect `_shared`
2. inspect package skills most affected by the change
3. search for contradictory wording such as:
   - `guides required`
   - `duo docs required`
   - `guides optional`
   - `spec-index mandatory`
4. confirm these four layers agree:
   - generator behavior
   - templates
   - command specs
   - review and garden expectations
5. check that the refactor remains additive:
   - old duo-doc repos still make sense
   - new spec-driven docs are usable when present

If one phase leaves contradictory expectations behind, do not move to the next phase yet.

## What Not To Do

- do not delete `guides/*` from the generated structure in early phases
- do not make `spec-index.md` mandatory everywhere on day one
- do not require new feature/task metadata before generators produce it
- do not change `execute` and `verify` first
- do not leave `_shared` and vendored files out of sync
- do not silently rewrite command semantics beyond recognition

## Practical Editing Pattern

For each phase:

1. update `_shared` source files
2. propagate vendored shared copies
3. inspect package skill docs that still contradict the new model
4. verify command docs, skill docs, prompts, and templates all describe the same behavior

## Minimum Acceptance Checklist For The Refactor

- classic duo-doc workflow still works
- spec-driven files can be generated and used optionally
- `guides/*` remain documented as valid HOW docs
- `execute` and `verify` support both old and new task inputs
- `review` accepts both old and new documentation styles
- `mb-garden` and `mb-lint` no longer enforce outdated assumptions
- no contradictions remain between:
  - `init-mb.js`
  - structure templates
  - command specs
  - review prompts
  - garden rules

## Recommended Final Wording Model

Use this style consistently:

- `architecture/*` = preferred WHAT/WHY boundary docs
- `guides/*` = valid HOW/usage/troubleshooting layer
- `contracts/*`, `states/*`, `runbooks/*`, `testing/*`, `glossary.md`, `invariants.md` = explicit normative layer when present
- `epics/*`, `features/*`, `tasks/*` = operational planning layer

This gives you the bridge:

- old repos still make sense
- new repos can become more structured
- commands can gradually prefer stronger inputs without breaking the familiar workflow
