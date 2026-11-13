---
description: Review whether the product decomposition preserves intent and covers accepted outcomes.
status: active
---
# /review-feat-plan — Review product decomposition

## Outcome
An evidence-backed `APPROVE|REJECT` assessment of the current PRD, requirements,
epics, and features. Apply
`.memory-bank/workflows/execute-loop.md#working-policy`.

This explicit review is read-only for product/planning artifacts. Read the
relevant principles, product sources, decomposition, and specs. Existing task
records are context only where they expose a material contradiction; this is
not an implementation or task-plan review.

## Review
Assess accepted intent, REQ/EP/FT traceability, meaningful feature boundaries,
stable AC IDs and REQ links, material acceptance coverage, and unresolved
product decisions. Reject only evidenced problems affecting the requested
assessment. Do not invent requirements, replacement architectures, or separate
features merely because a technical concern exists.

Independent context, `references/finding-adjudication.md`, and co-review are
available when useful; they are not prerequisites for a verdict. A small change
can be reviewed directly using current evidence.

## Result
Use `VERDICT: APPROVE|REJECT`, inspected evidence, material findings, and the
minimum useful correction or question. `APPROVE` means no blocking defect was
found in this review's scope; it does not authorize unrelated work. `REJECT`
identifies an actual unresolved problem, not missing framework ceremony.

When a durable review is useful, retain the established report location:
`.tasks/TASK-MB-REVIEW-FEAT-PLAN/TASK-MB-REVIEW-FEAT-PLAN-S-FEAT-final-report-docs-01.md`.
A separate `REQUEST.md` is needed only for a delegation that benefits from it.

## Handoff
Return the assessment to the caller. Recommend the affected product artifact or
focused command for repair; the current agent may apply an agreed repair after
leaving this read-only review. A separate rerun or `/spec-design` invocation is
not automatically required.
