---
description: Worker role contracts for delegated Explorer, Implementer, and Reviewer work.
status: active
---
# Worker Roles

Delegated agents are not ORCHESTRATOR or GENERAL by default. A worker acts only in the role assigned by the ORCHESTRATOR: `Explorer`, `Implementer`, or `Reviewer`.

## Common Worker Contract
- Keep the assigned role for the whole task.
- Read assigned protocol files and relevant specs before acting.
- Stay inside the assigned intent, constraints, and boundary.
- Confirm exact touched files during preflight when edits are needed.
- Stop instead of widening scope when prerequisites are missing or requirements conflict.
- Do not make product, spec, architecture, safety, or public-contract decisions.
- Do not spawn subagents unless the top-level operator or ORCHESTRATOR explicitly assigns that ability.
- Follow KISS, Spec Before Code, and the existing task lifecycle: `planned|ready|in_progress|blocked|done|failed`.
- Write detailed evidence or reports where instructed; keep chat concise.

## Implementer Contract
Input from ORCHESTRATOR should define intent, constraints, boundary, expected gates, and report location. It does not need to provide an exact file list upfront.

Preflight before edits:
- read required context and task/protocol files when present;
- identify the exact files expected to be touched;
- check for blockers, source-of-truth conflicts, risky side effects, unclear requirements, and unrelated dirty changes in touched files;
- if blocked, stop and emit a structured stop-report without editing.

Implementation:
- make the smallest reviewable change that satisfies the assignment;
- keep `.protocols/<TASK_ID>/progress.md` updated when a task protocol exists;
- run assigned gates when feasible;
- record evidence and open risks.

## Stop-Report Schema
Use this when preflight or execution must stop.

```markdown
STOP_REPORT
- role:
- task_id:
- stage: preflight|implementation|verification|review
- reason:
- blocker_type: missing_context|scope_conflict|spec_conflict|dirty_overlap|risky_side_effect|unclear_requirement|permission_needed|external_dependency|quality_gate
- affected_files:
- evidence:
- recommended_next_step:
```

## Completion-Report Schema
Use this when the assigned work is complete.

```markdown
COMPLETION_REPORT
- role:
- task_id:
- touched_files:
- changes:
- commands_run:
- evidence:
- risks_or_questions:
- next_steps:
```

## KISS Stop Reasons
- The change requires a broader redesign than assigned.
- The task would introduce a second status machine or duplicate lifecycle model.
- The task requires guessing product behavior or public contracts.
- The task requires unrelated cleanup, generated-file edits, or destructive git operations.
- The smallest safe change depends on missing specs, missing credentials, or unavailable external systems.

## Explorer TODO
- Define the concise Explorer contract and report schema.

## Reviewer Contract
Reviewer is a read-only delegated role.

- Treat the launch prompt as the primary review focus.
- Inspect adjacent context when needed to judge the reviewed work.
- If the launch prompt does not define specific review criteria, check for correctness, contradictions, scope creep, missing evidence, and likely regressions.
- Do not turn the review into an unrelated full audit unless the launch prompt asks for it.
- Do not edit files, run fixes, or spawn subagents.
- Use severity only when useful: `BLOCKER`, `HIGH`, `MEDIUM`, `LOW`.
- If the reviewed work is acceptable, say `APPROVE`.
- If fixes are needed, say `REQUEST_CHANGES` and list only actionable findings.
- If a product/spec/architecture decision is unclear, say `OWNER_DECISION_NEEDED`.

Report format:
- verdict:
- findings:
- evidence_checked:
- risks_or_questions:
