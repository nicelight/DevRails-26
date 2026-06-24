---
name: mb-from-prd
description: >
  Turn a PRD into a traceable Memory Bank with product, requirements, epics, and features.
---

# mb-from-prd — PRD → Memory Bank (greenfield)

- **What it does:** converts a PRD into structured project knowledge and traceable planning artifacts.
- **Use it when:** the project is greenfield and `prd.md` or equivalent requirements already exist.
- **Input:** `prd.md` or user-provided PRD text plus an initialized `.memory-bank/`.
- **Output:** product, RTM, epics, features, and SDD design/foundation routing ready for mandatory `/spec-design` before `/foundation-to-tasks` when required and `/prd-to-tasks`.

## Preconditions
- You are in the repo root.
- `.memory-bank/prd.md` exists with `type: prd`, `clarification_status: complete`, and `constitution_checked: true`; otherwise run `/write-prd` first.
- `.memory-bank/spec-backbone.md` exists after `/spec-init` as the required lightweight pre-PRD framing state for PRD decomposition, and `.memory-bank/spec-index.md` remains a pure spec registry/index. After `/prd`, `/review-feat-plan` checks high-risk/large work before mandatory `/spec-design`; `/spec-design` consumes `spec-backbone` plus the registry, records a minimal or full backbone gate, may record `.memory-bank/foundation.md`, and may update backbone SDD specs and `spec-index` registry rows when features share domain/model/contracts/state/security/runtime design.
- Optional Analysis artifacts such as a product brief may exist; use them as upstream PRD input, but do not require them.
- `.memory-bank/` exists. If not, run `mb-init` first (or create the skeleton manually).

## Process

### 1) Load clarified PRD
1. Read `.memory-bank/prd.md`.
2. Confirm frontmatter has `type: prd`, `clarification_status: complete`, and `constitution_checked: true`.
3. Stop if PRD contains unresolved `NEEDS CLARIFICATION` markers that affect decomposition.
4. Read `.memory-bank/spec-backbone.md` as the lightweight pre-PRD framing state. Stop and run `/spec-init` if the backbone is missing, stale, placeholder-only, blocked, or does not make decomposition inputs explicit enough.
5. Read `.memory-bank/spec-index.md` as a pure registry/index. Stop and run `/spec-init` if the index is missing, stale, ambiguous, has broken links, or contains old readiness/status sections instead of only registry/planned-spec routing.
6. Determine relevant authoritative specs from PRD sections, affected product areas, requirements, actors, data/domain model, contracts/APIs, states/lifecycles, security/compliance, runtime/operations, and verification strategy.
7. Resolve and read only those relevant authoritative spec files routed by `.memory-bank/spec-index.md`. Do not load every SDD spec by default.
8. If a relevant authoritative spec conflicts with the PRD, stop and ask for explicit resolution through a spec or PRD amendment.
9. Start a task protocol folder:
   - `.protocols/PRD-BOOTSTRAP/`
   - `plan.md` (steps)
   - `decision-log.md` (Q/A and choices)

### 2) Skills / tooling discovery (optional but recommended)
If the PRD mentions “use skills / tools / CLIs”:
- run `/find-skills` (project-installed first; marketplace second)
- propose a minimal set of relevant skills to use (do not install without confirmation)

### 3) No Deep Questioning here
PRD-level ambiguity is handled by `/write-prd`. Do not ask Deep Questioning rounds in this skill.
Optional Analysis (`/analysis`, `/brainstorm`, `/brief`) improves `/write-prd` input.

If the target mode is **full autonomous**:
- non-blocking gaps may be recorded as explicit `Assumptions`
- blocking gaps (security/compliance/external contracts/data-loss risks) must halt the run

### 4) Write L1 Product brief
Update `.memory-bank/product.md` (use the user’s wording).

### 5) Requirements + RTM
Update `.memory-bank/requirements.md`:
- Enumerate REQ-IDs.
- Define “out of scope”.
- Fill RTM: REQ → Epic → Feature → Test.

### 6) Create Epics (L2, draft-first)
For each epic:
- Create `.memory-bank/epics/EP-<NNN>-<slug>.md`
- Use `references/epic-template.md`.
- Ensure business value + success metrics.
- Fill optional sections such as `Source artifacts`, `Normative inputs`, and `Constraints / invariants` only when they are grounded in evidence.
- Default `status: draft` until open questions are resolved.

### 7) Create Features (L3, draft-first)
For each feature:
- Create `.memory-bank/features/FT-<NNN>-<slug>.md`
- Use `references/feature-template.md`.
- Ensure autonomy and explicit acceptance criteria.
- Do not add clarification metadata by default. Add `clarification_status: pending|blocked` only when the PRD explicitly leaves a feature-level blocker that affects task decomposition.
- Fill optional sections such as `Source artifacts`, `Normative inputs`, `Constraints / invariants`, and `Verification targets` only when they are grounded in evidence.
- Include the `## SDD Design Gate` section in every feature. This routes through mandatory `/spec-design`, `/foundation-to-tasks` when required, and then `/prd-to-tasks FT-<NNN>`, where feature-level SDD design is completed before task slicing. Do not introduce a placeholder `spec_design_status` or a new blocking status.
- Default `status: draft` until acceptance criteria + verification plan are solid.

### 8) Tasks planning (per-feature, no “everything at once”)
Do **not** generate a full task queue “в лоб” for all features in one pass.

Instead:
1) Ensure `.memory-bank/schemas/task.schema.json` and `.memory-bank/tasks/index.json` exist. A fresh skeleton may have `{ "version": 1, "tasks": [] }`.
2) Run `/spec-design` after `/prd`. For small independent T0/T1 features it may record a minimal backbone with irrelevant areas marked `not_applicable`; for shared/T2/T3 concerns it creates or updates the needed backbone SDD specs and `spec-index`. It creates no tasks and no feature-local implementation design; when foundation is needed it records `.memory-bank/foundation.md`.
3) If foundation is required, run `/foundation-to-tasks` and close the final foundation gate before product feature tasking.
4) For each selected feature, run `/prd-to-tasks FT-<NNN>` to produce feature-level design status, implementation plan, JSON tasks, and required packets:
   - `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`
   - atomic `.memory-bank/tasks/TASK-*.task.json` records grouped by `wave`, each with mandatory `tier: T0|T1|T2|T3`; concrete IDs use `TASK-NNN-TN-FT-NNN-WN`

When enough structured evidence exists, those feature-level plans and task records may include optional richer fields such as `source_artifacts`, `normative_inputs`, `constraints`, `invariants`, and `verification_targets`.
Task routing is authoritative only through `task.tier`; the old `risk` / `risk.level` model is invalid.
Canonical SDD planning path is `/write-prd` → `/spec-init` → `/prd` → `/review-feat-plan` for high-risk/large work → `/spec-design` → `/foundation-to-tasks` if required → `/prd-to-tasks FT-<NNN>`. `/prd-to-tasks` includes the feature-level design phase after the mandatory backbone/foundation gate. Run `/clarify-feature FT-<NNN>` only when a feature is explicitly pending/blocked. For simple T0/T1-like features, the feature design phase may set `spec_design_status: not_required` with a concise rationale.

This keeps planning accurate and avoids speculative task explosions.

### 9) Support docs for key concepts
For every concept that would otherwise require “reading many files” to understand later, create support docs.

Compatibility/default path:
- `.memory-bank/architecture/<concept>.md` (WHAT/WHY)
- `.memory-bank/guides/<concept>.md` (HOW)

Optional richer support docs:
- `.memory-bank/contracts/...`
- `.memory-bank/states/...`
- `.memory-bank/runbooks/...`
- `.memory-bank/testing/...`

Rules:
- classic duo docs remain valid and useful
- richer docs are additive and should be grounded in evidence
- if richer docs exist, route them from `.memory-bank/spec-index.md` and relevant feature/concept docs
- do not create a new spec before checking existing specs through `.memory-bank/spec-index.md`

### 10) Update index
Update `.memory-bank/index.md` with annotated links to everything new.

### 11) Review gate
For high-risk, large, or autonomous flows, run `/review-feat-plan` before
`/spec-design`. After `/prd-to-tasks FT-<NNN>`, use
`/review-tasks-plan FT-<NNN>` before execution. For scheduler handoff, every
task-linked product feature needs its own latest `APPROVE`.

### 12) Autonomous handoff (optional)
If the goal is “PRD → done without more user interaction”:
- do not execute tasks from here manually
- hand off to generated project command `/autonomous`

## Definition of done
- product.md + requirements.md are coherent.
- Every REQ maps to an Epic/Feature in RTM.
- Epics and features exist with acceptance criteria.
- `.memory-bank/spec-backbone.md` records pre-PRD decomposition inputs, gaps, and handoff; `.memory-bank/spec-index.md` lists existing/planned spec files as a pure registry/index.
- No schema-backed task records are required from `mb-from-prd` itself.
- If task planning is explicitly continued with `/prd-to-tasks FT-<NNN>`, schema-backed task records are indexed in `.memory-bank/tasks/index.json`; every task has `tier`.
- index.md is updated.
