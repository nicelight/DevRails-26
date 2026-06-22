# Chuck Compatibility Matrix

## Purpose

Capture the current compatibility obligations before refactoring `memobank` toward a more spec-driven model.

This matrix is the stop-the-line reference for deciding whether a change is additive or workflow-breaking.

## Global Invariants

- `.memory-bank/commands/*.md` remains the repo-local command SSOT.
- `.claude/skills/*` and `.agents/skills/*` remain thin proxies to command specs.
- `skills/_shared/*` remains the primary editable source.
- Vendored package copies must stay aligned after every `_shared` change.
- Classic duo docs remain valid:
  - `architecture/*` for WHAT/WHY
  - `guides/*` for HOW
- Brownfield mapping without PRD remains as-is documentation only.
- `.tasks/` and `.protocols/` remain the resumable execution substrate.

## Surface Matrix

| Surface | Primary files | Current hard assumption | Safe additive direction | Risk if changed too early |
|---|---|---|---|---|
| Bootstrap generator | `skills/_shared/scripts/init-mb.js` | Creates duo-doc structure and generated wording that treats `guides/` as part of the core model | Add optional normative files and softer wording without removing old structure | Fresh repos get contradictory bootstrap language |
| Structure template | `skills/_shared/references/structure-template.md` | Mirrors the bootstrap model and repeats duo-doc expectations | Keep duo docs, add optional spec-driven layer | Template/generator semantic drift |
| Concept templates | `skills/_shared/references/concept-architecture-template.md`, `skills/_shared/references/concept-guide-template.md` | Concept docs are modeled as an architecture/guide pair | Keep pair templates valid and optionally point to richer normative docs | Later reviewers reject docs produced by templates |
| Planning | `skills/_shared/references/commands/prd.md`, `skills/_shared/references/commands/prd-to-tasks.md` | Task cards use classic fields only | Add optional structured fields without removing classic ones | `execute`/`verify` depend on fields that are not emitted yet |
| Execution | `skills/_shared/references/commands/execute.md`, `skills/mb-execute/SKILL.md` | Reads feature/requirements/backlog and uses protocols deterministically | Prefer richer inputs when present, fallback to classic inputs | Old tasks become non-executable |
| Verification | `skills/_shared/references/commands/verify.md`, `skills/mb-verify/SKILL.md` | Verifies against AC/REQ and artifacts | Prefer explicit verification targets when present, fallback to AC/REQ | Old tasks fail verification model |
| Review | `skills/_shared/references/commands/review.md`, `skills/_shared/agents/review-architect.md`, `skills/_shared/agents/mb-reviewer.md` | Duo-doc pairing is treated as a review expectation | Accept duo docs, spec-driven docs, or both | Review rejects healthy old repos |
| Garden / sync | `skills/mb-garden/SKILL.md`, `skills/mb-garden/assets/mb-lint.mjs`, `skills/_shared/references/workflows/mb-sync.md` | Weekly/process checklists assume pair consistency; lint is milder | Keep base lint deterministic, add richer-tier awareness as warnings first | Maintenance policy contradicts generator/review |
| Vendoring | `scripts/vendor-shared.mjs` | `_shared` must fan out into every package skill | Re-vendor after every phase and audit affected mirrors | Hidden package drift |

## Current Hard Duo-Doc Assumptions

### Generator and generated docs

- `skills/_shared/scripts/init-mb.js`
  - creates `.memory-bank/guides/`
  - labels `guides/` as `Duo (HOW)` in generated index
  - generated MBB says: duo docs cross-link both ways
  - generated `mb-sync` requires duo-doc consistency

### Templates and shared references

- `skills/_shared/references/structure-template.md`
  - repeats the same duo-doc model in index/MBB/MB-SYNC examples
- `skills/_shared/references/concept-architecture-template.md`
  - points directly to a related guide doc
- `skills/_shared/references/concept-guide-template.md`
  - points directly to a related architecture doc

### Review and maintenance policy

- `skills/_shared/agents/review-architect.md`
  - expects a pair `architecture/` + `guides/` for key concepts
- `skills/_shared/agents/mb-reviewer.md`
  - checks for duo pairing and mutual links
- `skills/_shared/references/workflows/mb-sync.md`
  - requires `architecture/<concept>.md` ↔ `guides/<concept>.md`
- `skills/mb-garden/SKILL.md`
  - weekly checklist requires matching pairs

## Current Contradictions Already Present

- `skills/mb-garden/assets/mb-lint.mjs` does not mechanically enforce duo pairing, while review/garden text does.
- `spec-index.md`, `glossary.md`, `invariants.md`, and `states/*` are described as future direction but are not first-class citizens in bootstrap, review, or lint yet.
- This means additive spec-driven work must update wording and policy, not only structure.

## Phase Ownership

### Phase 1: Init

- Owns bootstrap structure and generated wording.
- May add optional files such as:
  - `.memory-bank/spec-index.md`
  - `.memory-bank/glossary.md`
  - `.memory-bank/invariants.md`
  - `.memory-bank/states/`
- Must not make those files mandatory.

### Phase 2: Templates

- Owns concept, epic, and feature templates.
- May add optional metadata sections.
- Must not require downstream commands to consume them yet.

### Phase 3: PRD-to-Tasks

- Owns emission of richer task cards and implementation plan fields.
- Must keep classic task-card fields intact.

### Phase 4: Execute

- May prefer richer structured inputs.
- Must keep fallback resolution to classic feature/requirements/backlog inputs.

### Phase 5: Verify

- May prefer explicit verification targets.
- Must keep AC/REQ-based verification valid.

### Phase 6: Review

- Must stop treating duo docs as the only acceptable documentation shape.
- Must not reject old repos for lacking new normative docs.

### Phase 7: Garden

- Must align lint/checklists with the new additive model.
- Must keep base compatibility tier for classic repos.

## Mandatory Validation Loop

After each phase:

1. Edit only `_shared` and explicitly phase-owned files.
2. Re-vendor with `scripts/vendor-shared.mjs`.
3. Spot-check affected vendored copies.
4. Search for contradictory wording:
   - `guides`
   - `duo docs`
   - `spec-index`
   - `required`
   - `mandatory`
   - `optional normative layer`
5. Reconcile these layers:
   - generator
   - templates
   - commands
   - review prompts
   - garden/lint
6. Do not enter the next phase while contradictions remain.

## Immediate Next Actions

1. Patch Phase 1 wording in `init-mb.js` and `structure-template.md`.
2. Keep `guides/*` explicit and valid.
3. Introduce optional normative files in bootstrap wording only.
4. Re-vendor and audit generated mirrors before touching templates or commands.
