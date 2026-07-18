---
name: mb-init
description: >
  Create the Memory Bank skeleton and project agent guides in the current repository.
---

# mb-init — Initialize Memory Bank skeleton

- **What it does:** creates the base folders, core docs, runtime scripts, and project agent guides.
- **Use it when:** you want the skeleton only, without immediately choosing PRD or brownfield mapping.
- **Input:** repository root.
- **Output:** `.memory-bank/`, `.tasks/`, `.protocols/`, `AGENTS.md`, and runtime scripts.

## Goal
Create a consistent baseline so agents can work with **repo-local context** instead of ad-hoc prompts.

## Steps

### 1) Create directories
Create (if missing):
- `.memory-bank/` with subfolders (see `./references/shared-structure-template.md`)
- `.tasks/`
- `.protocols/`

### 2) Create core Memory Bank files
From templates, create:
- `AGENTS.md`
- `CLAUDE.md` → symlink/copy to `AGENTS.md`
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
- `.memory-bank/testing/strategy.md`
- `.memory-bank/skills/index.md`

Fresh bootstrap creates `testing/index.md` as a navigation router and
`testing/strategy.md` as a compact framework baseline. Sync for an existing
Memory Bank does not seed `testing/strategy.md` or overwrite an existing
testing index. If the testing router is missing, sync creates a minimal router
to `spec-index.md` and links an existing strategy only when that file was
already present. A missing generated root index or spec registry references
only testing documents that exist after sync; it does not register a
fresh-only policy that was not seeded.

Fresh PRD-less bootstrap must not create `.memory-bank/foundation.md`, `REQ-000`, `.memory-bank/features/FT-000-foundation.md`, `.memory-bank/features/FT-001-*.md`, `.memory-bank/tasks/TASK-000-T1-FT-000-W0.task.json`, `.memory-bank/tasks/TASK-001-T2-FT-001-W1.task.json`, or any other fake roadmap artifact. `.memory-bank/tasks/index.json` starts as `{ "version": 1, "tasks": [] }`; `/write-prd` creates a clarified PRD, `/spec-init` prepares only `.memory-bank/spec-backbone.md` as lightweight pre-PRD framing state and keeps `.memory-bank/spec-index.md` as a pure registry, `/prd` creates real product features, `/review-feat-plan` checks high-risk/large work before SDD design, mandatory `/spec-design` creates a minimal or full backbone gate and records foundation needs, `/foundation-to-tasks` creates real `FT-000` task records only when required, and `/prd-to-tasks FT-<NNN>` completes feature-level design before creating real product `TASK-*.task.json` records. `/clarify-feature FT-<NNN>` is optional for explicitly pending/blocked features.

Also create optional folders that support the richer normative layer without making it mandatory:
- `.memory-bank/contracts/`
- `.memory-bank/states/`
- `.memory-bank/runbooks/`

### 3) Runtime command skills
`/mb-init` does not create command specs or proxy skills.

The DevRails 26 installer creates full runtime command skills directly from
`skills/_shared/references/commands/*.md`:
- `.claude/skills/<name>/SKILL.md` → Claude Code
- `.agents/skills/<name>/SKILL.md` → Codex CLI

Target `.memory-bank/` stores project state/docs only, not command specs.

Agents must read `.memory-bank/constitution.md` early during priming. It records project governing principles and does not replace `.memory-bank/invariants.md`, `.memory-bank/contracts/*`, or `.memory-bank/spec-index.md`; use `/constitution` only to create or amend those principles.

### 5) Enforce MBB rules immediately
- Every `.memory-bank/**/*.md` must have frontmatter (`description`, `status`).

## Optional fast path
If Node.js is available, you may run the helper script (safe: doesn’t overwrite existing files):

```bash
# Option A: copy ./scripts/shared-init-mb.js into your repo then run:
node scripts/init-mb.js
```

If you don’t want a script, just create the files manually using the templates.

## Definition of done
- `AGENTS.md` exists and points to `.memory-bank/index.md`.
- `CLAUDE.md` exists and mirrors `AGENTS.md`.
- `.memory-bank/` has the seeded docs.
- `.memory-bank/constitution.md` exists as the governing-principles doc.
- `.memory-bank/tasks/index.json` and `.memory-bank/schemas/task.schema.json` exist; task state is JSON-backed.
- Fresh bootstrap has `.memory-bank/testing/index.md` linked to the compact
  `.memory-bank/testing/strategy.md`, and the strategy is registered in
  `.memory-bank/spec-index.md`.
- `.memory-bank/tasks/index.json` has an empty `tasks` array in a PRD-less skeleton.
- Skeleton bootstrap creates no fake feature docs or foundation artifacts; task planning starts later with `/write-prd`, `/spec-init`, `/prd`, `/review-feat-plan` for high-risk/large work, mandatory `/spec-design`, `/foundation-to-tasks` if required, then `/prd-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>`, conditional `/mb-doctor`, and tier-routed `/execute TASK`.
- No `.memory-bank/tasks/TASK-001-T2-FT-001-W1.task.json` is created by bootstrap.
- Future task records must contain mandatory `tier: T0|T1|T2|T3`; routing is only through `task.tier`, not the removed `risk` / `risk.level` model.
- `.tasks/` and `.protocols/` exist.
