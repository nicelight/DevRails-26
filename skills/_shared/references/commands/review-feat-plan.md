---
description: Fresh-context review of PRD decomposition into requirements, epics, and features before SDD design and tasking.
status: active
---
# /review-feat-plan - Feature plan review

<objective>
Проверить, что продуктовая декомпозиция готова к `/spec-design` и дальнейшему
feature-level task planning.

Scope:
- PRD -> requirements -> epics -> features traceability
- product brief / analysis traceability when those artifacts exist
- feature sizing, boundaries, ambiguity, and blocked clarification markers
- Constitution conflicts affecting product scope
- `FT-000` is reserved for Foundation Dev Path and is not a product feature
- required Foundation Dev Path signals are visible before `/spec-design`

This command does not review JSON task records. Use
`/review-tasks-plan FT-<NNN>` after `/prd-to-tasks FT-<NNN>` creates or updates
that feature's task records.
</objective>

<process>

## 0) Artifacts
Create:
- `.tasks/TASK-MB-REVIEW-FEAT-PLAN/`
- `.tasks/TASK-MB-REVIEW-FEAT-PLAN/REQUEST.md`

Reviewer reports go to:
- `.tasks/TASK-MB-REVIEW-FEAT-PLAN/TASK-MB-REVIEW-FEAT-PLAN-<STAGE_ID>-final-report-docs-01.md`

## 1) Inputs
Read when present:
- `.memory-bank/constitution.md`
- `.memory-bank/analysis/product-brief.md`
- `.memory-bank/analysis/index.md`
- `.memory-bank/prd.md`
- `.memory-bank/product.md`
- `.memory-bank/requirements.md`
- `.memory-bank/epics/*.md`
- `.memory-bank/features/*.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/spec-backbone.md`

Do not require task records. If `.memory-bank/tasks/index.json` already has
records, ignore their implementation details except to flag obvious stale
product-plan contradictions.

## 2) Review checks
Must check:
- PRD is clarified enough for L1-L3 decomposition.
- Requirements have stable `REQ-*` IDs and no invented unsupported scope.
- Every epic/feature traces to requirements or explicitly documented deltas.
- Features are not too broad for downstream `/prd-to-tasks`; oversized or vague
  features become blockers or clarification notes.
- `clarification_status: pending|blocked` is honored; blocked features do not
  proceed to task planning.
- There is no route from Analysis/Product Brief directly to `/prd-to-tasks`
  without `/write-prd`, `/spec-init`, `/prd`, `/spec-design`, and required
  Foundation Dev Path.
- `FT-000` is absent from product feature completion semantics and reserved for
  foundation only.
- If a minimal executable baseline appears necessary, the review asks
  `/spec-design` to record a Foundation Dev Path decision in
  `.memory-bank/foundation.md`; it does not create foundation tasks.
- Constitution contradictions are blocking.

## 3) Decision rule
- `APPROVE`: feature plan is ready for `/spec-design`.
- `REJECT`: product decomposition, RTM, clarification state, or governance has
  blocking gaps. Fix and rerun `/review-feat-plan`.
- Non-blocking notes may be reported with `APPROVE`; `REJECT` always means the
  gate is blocking.

For high-risk, large, or autonomous flows, `APPROVE` is required before
`/spec-design`. For small/manual flows, this command is recommended but not a
mandatory stop unless the user or Constitution requires it.

## 4) Reviewer handoff
Use the active harness's configured fresh-context reviewer or a separate fresh
session. Do not pin a provider, CLI, or model in this command. Pass this payload:

```text
TASK_ID=TASK-MB-REVIEW-FEAT-PLAN. STAGE_ID=S-FEAT. Review
.memory-bank/constitution.md, .memory-bank/prd.md,
.memory-bank/requirements.md, .memory-bank/epics/*.md,
.memory-bank/features/*.md, and analysis/product brief artifacts when present.
Check PRD->REQ->EP->FT traceability, feature sizing, blocked clarification
metadata, Constitution contradictions, and that FT-000 is reserved for
foundation only. Do not review JSON task records except for obvious stale
contradictions. Write report to
.tasks/TASK-MB-REVIEW-FEAT-PLAN/TASK-MB-REVIEW-FEAT-PLAN-S-FEAT-final-report-docs-01.md.
VERDICT: APPROVE/REJECT; REJECT only for blocking gaps.
```

## 5) Handoff
When approved, continue to:
- `/spec-design`
- then `/foundation-to-tasks` and close the `FT-000` foundation gate when
  required
- then `/prd-to-tasks FT-<NNN>` or autonomous `/spec-auto --all` +
  `/prd-to-tasks --all`
</process>
