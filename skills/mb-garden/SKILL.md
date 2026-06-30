---
name: mb-garden
description: >
  Clean up and maintain Memory Bank docs so they stay accurate and easy to load.
---

# mb-garden — Memory Bank maintenance (doc gardening)

- **What it does:** maintains Memory Bank docs, fixes hygiene issues, and keeps navigation coherent.
- **Use it when:** `.memory-bank/` exists and you want to reduce drift, stale docs, or broken routing.
- **Input:** an existing `.memory-bank/`.
- **Output:** a cleaner Memory Bank, resolved hygiene issues, and optional CI support for ongoing maintenance.

## Goal
Keep `.memory-bank/` accurate, navigable, and cheap-to-prime.
`mb-garden` owns maintenance and cleanup guidance. The current package also ships deterministic tool assets, but `mb-lint` and `mb-doctor` remain separate gates with separate roles.

## Preconditions
- `.memory-bank/` exists.

## Process

### 1) Install deterministic maintenance tools
If the repo doesn’t have the tools yet:
1) Create `scripts/mb-lint.mjs` using `assets/mb-lint.mjs`.
2) Create `scripts/mb-doctor.mjs` using `assets/mb-doctor.mjs`.
3) Make them executable (optional).
4) Add package scripts (optional): `"mb:lint": "node scripts/mb-lint.mjs"` and `"mb:doctor": "node scripts/mb-doctor.mjs"`.

Current package location includes both tool assets under `mb-garden/assets`; this is a packaging detail, not conceptual ownership of the doctor readiness role.

Then run:
```bash
node scripts/mb-lint.mjs
node scripts/mb-doctor.mjs
```

Fix all **ERROR** findings:
- missing YAML frontmatter (description + status)
- broken links
- missing folder index.md
- invalid or missing schema-backed task records, including missing/invalid mandatory `tier`
- obsolete `.memory-bank/tasks/backlog.md` or markdown task cards used as workflow state
- old `risk` / `risk.level` task fields; task routing is only by `task.tier`

`mb-lint` is the structural/mechanical hygiene gate. `mb-doctor` is the workflow/autonomous readiness gate over `mb-lint`. Default `mb-doctor` is suitable for normal health checks and fresh skeletons. Run strict mode only after the JSON task queue exists: after `/foundation-to-tasks` at the foundation/task-queue boundary, after `/prd-to-tasks` at the feature/task-queue boundary, before scheduler execution inside `/autonomous`, or before `/autopilot` when the queue is already prepared:

```bash
node scripts/mb-lint.mjs
node scripts/mb-doctor.mjs --strict
```

Do not treat strict mode as required for a bare generated skeleton with an empty task registry.

### 2) Refactor for ergonomics
- Treat docs above ~700 lines as a review signal, not a split gate. Split only
  when the file mixes independently meaningful boundaries, change cadence,
  consumers, or reuse; keep one cohesive concern together.
- Discover existing specs through `spec-index.md`, relevant folder indexes, and
  subject paths before splitting or creating docs. Keep one active canonical
  path per concern and update exact feature/task links.
- Classic duo docs (`architecture` WHAT/WHY + `guides` HOW) remain valid when
  both documents have distinct value, but do not create a pair merely to satisfy
  a coverage convention.
- Keep `spec-index.md` as `Type | Path | Status | Scope | Change route`; do not
  add feature ownership, `used_by`, decision bodies, or reverse-usage copies.
- Replace copy-pasted code/config with links to source.

### 3) Archive stale or superseded docs
- Move outdated docs to `.memory-bank/archive/`.
- Before archiving a canonical spec, reconcile `spec-index.md`, folder indexes,
  and all affected feature/task links so no duplicate active definition remains.
- Leave a tombstone only when compatibility requires the old path. Mark it
  `status: deprecated`, link the replacement/archive path, and ensure it cannot
  be mistaken for the active canonical spec.

### 4) Reconcile installed skill routing
- Compare `.memory-bank/skills/index.md` with actual `.agents/skills/*/SKILL.md`
  and `.claude/skills/*/SKILL.md` entries.
- Use installed canonical runtime command names in the registry; do not preserve
  a second alias/package command surface.
- For obsolete generated runtime entries, recommend installer sync. Do not
  delete user-owned skills merely because they are outside DevRails.

### 5) Optional: add CI gate
If the repo uses GitHub Actions:
- Create `.github/workflows/memory-bank-lint.yml` from `assets/memory-bank-lint.yml`.

### 6) Produce a short report
Write a summary (what changed + what remains) to:
- `.tasks/TASK-MB-GARDEN/TASK-MB-GARDEN-S-01-final-report-docs-01.md`

### 7) Weekly maintenance checklist
Run this checklist weekly (or every 5–10 meaningful changes):

1. **Frontmatter audit**: every `.memory-bank/**/*.md` has `description` + `status`.
2. **Stale docs**: use age as a review signal; archive or refresh only after
   evidence confirms the content is stale or superseded.
3. **Canonical spec check**: every active concern has one registered subject
   path; no default `FT-*` hub, duplicate active definition, file-owner routing,
   or forced duo pair exists.
4. **RTM sync**: `requirements.md` RTM matches actual feature/test status.
5. **Task record hygiene**: completed tasks are marked done in `.task.json`,
   every task has `tier`, and T2/T3 cards keep purpose/outcome, direct relevant
   canonical spec links, grounded scope, and a verification path.
6. **Changelog**: `.memory-bank/changelog.md` has entries for recent changes.
7. **Index links**: all links in `index.md` and router-indexes resolve correctly.
8. **Archive routing**: deprecated/tombstone paths cannot be mistaken for active
   canonical specs and all replacement links resolve.
9. **Skill routing**: the skill registry matches installed canonical runtime
   commands and contains no duplicate alias surface.

## Definition of done
- `node scripts/mb-lint.mjs` passes (0 errors).
- `node scripts/mb-doctor.mjs` readiness gate passes in default mode; `--strict` passes post-queue before scheduler/autopilot execution.
- Index navigation is coherent.
- `spec-index.md`, feature links, task links, and archive/deprecation routes are
  coherent and identify one active canonical path per concern.
- Installed skill routing exposes one canonical command surface per workflow.
- No obvious duplication or stale docs without archive.
- Weekly checklist items are addressed.
