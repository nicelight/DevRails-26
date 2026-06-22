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
- Split docs > ~700 lines into atomic docs + router index.
- Ensure key concepts are covered either by classic duo docs (`architecture` WHAT/WHY + `guides` HOW) or by equivalent spec-driven support docs.
- Replace copy-pasted code/config with links to source.

### 3) Archive stale or superseded docs
- Move outdated docs to `.memory-bank/archive/`.
- Leave a short tombstone stub in the original location with a link to the archive.

### 4) Optional: add CI gate
If the repo uses GitHub Actions:
- Create `.github/workflows/memory-bank-lint.yml` from `assets/memory-bank-lint.yml`.

### 5) Produce a short report
Write a summary (what changed + what remains) to:
- `.tasks/TASK-MB-GARDEN/TASK-MB-GARDEN-S-01-final-report-docs-01.md`

### 6) Weekly maintenance checklist
Run this checklist weekly (or every 5–10 meaningful changes):

1. **Frontmatter audit**: every `.memory-bank/**/*.md` has `description` + `status`.
2. **Stale docs**: scan for docs not updated in >2 weeks — archive or refresh.
3. **Concept coverage check**: every key concept is covered either by a matching `architecture/<X>.md` + `guides/<X>.md` pair or by clearly routed equivalent spec-driven support docs.
4. **RTM sync**: `requirements.md` RTM matches actual feature/test status.
5. **Task record hygiene**: completed tasks marked done in `.task.json`, every task has `tier`, and no orphaned tasks exist without a feature link.
6. **Changelog**: `.memory-bank/changelog.md` has entries for recent changes.
7. **Index links**: all links in `index.md` and router-indexes resolve correctly.
8. **Archive tombstones**: every doc in `archive/` has a tombstone stub at original location.

## Definition of done
- `node scripts/mb-lint.mjs` passes (0 errors).
- `node scripts/mb-doctor.mjs` readiness gate passes in default mode; `--strict` passes post-queue before scheduler/autopilot execution.
- Index navigation is coherent.
- No obvious duplication or stale docs without archive.
- Weekly checklist items are addressed.
