---
description: Template for .protocols/TASK-XXX/context.md (clean-session context set).
status: active
---
# Context — <TASK_ID>

## Purpose
This file captures the **minimal reproducible context** so a fresh session can resume work safely.

## Inputs (what drives this task)
- Task record: `.memory-bank/tasks/<TASK_ID>.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Specs: (FT/EP/REQ docs you opened)
- Acceptance criteria source: (FT or verification section)

## Richer inputs (optional)
- Source Artifacts: ...
- Normative Inputs: ...
- Constraints / Invariants: ...
- Verification Targets: ...

## Fallback basis (if richer inputs were absent)
- Classic feature doc: ...
- Requirements / RTM: ...
- Duo docs: ...

## Loaded context set (what was read)
Keep this list short (2–8 items). Prefer SSOT pointers.
- `AGENTS.md`
- `.memory-bank/index.md`
- ...

## Decisions / assumptions
- Decision: ...
- Assumption (needs verification): ...

## Commands run / environment notes
- `...` → OK/FAIL (logs/evidence → `.tasks/<TASK_ID>/...`)

## Open questions / blockers
- ...

## Next session
- Start by reading: `context.md`, `plan.md`, `progress.md`
- Next action (one concrete step): ...

