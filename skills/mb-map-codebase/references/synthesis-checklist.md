# Brownfield synthesis checklist (Repo → Memory Bank)

Use this checklist when turning scan reports into `.memory-bank/` docs.

## 0) Fan-in first (don’t skip)
Before writing final docs:
- merge worker reports into a single view
- resolve contradictions (or record them as “needs verification”)
- separate **facts (evidence)** from **inferences**

## 1) MUST produce (baseline as-is)
- `.memory-bank/product.md` — what the system is today
- `.memory-bank/architecture/` — C4 L1–L3 overview + invariants
- `.memory-bank/runbooks/` — setup, dev, test, deploy
- `.memory-bank/contracts/` — API routes, events, schemas (links to source)
- `.memory-bank/testing/index.md` — how to run gates
- `.memory-bank/index.md` — annotated links
- `.memory-bank/changelog.md` — add an entry about the mapping

> **PRD-less rule (non-negotiable)**: if there is **no `prd.md`**, you MUST NOT create or populate:
> - `.memory-bank/epics/*`
> - `.memory-bank/features/*`
> - `.memory-bank/tasks/*.task.json` task records
> - `.memory-bank/tasks/index.json` task links
>
> It’s OK for these to exist as empty skeleton folders/files.

## 2) Strong signals to capture
- entry points (main/server/cmd)
- data model (schema/migrations)
- API surfaces (routes/controllers)
- external integrations
- config/feature flags
- CI pipelines & canonical commands

## 3) Facts vs inferences rule
In overview docs (product/architecture/requirements if you touch it):
- include a “Facts (evidence)” section with file paths and/or commands
- include an “Inferences / hypotheses” section (explicitly marked)
- include “Open questions” for what you must ask a human

## 4) Avoid
- restating obvious code
- copy-pasting code; link to source instead
- speculative claims without evidence

## 5) Final step: MB-SYNC
Follow `.memory-bank/workflows/mb-sync.md`.
