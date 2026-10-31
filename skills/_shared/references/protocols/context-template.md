---
description: Template for .protocols/TASK-NNN-TN-FT-NNN-WN/context.md (clean-session context set).
status: active
---
# Context — <TASK_ID>

Use only when this artifact is selected. Keep only applicable sections; its
presence creates no check, role or lifecycle requirement. Existing task-owned
state is updated in place, never replaced from this template. Host owns
lifecycle; retain actual and skipped work under tier-policy, not inferred PASS.


## Purpose
This file captures the **minimal reproducible context** so a fresh session can resume work safely.

## Execution Attempt
- attempt:
- started:

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
- Other accepted direct inputs (when applicable): ...

## Loaded context set (what was read)
Keep only useful canonical pointers.
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
- Retained state / partial effects / selected and skipped operations:
- Next action (one concrete step): ...
