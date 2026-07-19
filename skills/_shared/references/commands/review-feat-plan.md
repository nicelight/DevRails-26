---
description: Fresh-context review of PRD decomposition before global SDD design.
status: active
---
# /review-feat-plan - Feature plan review

<objective>
Independently decide whether PRD -> requirements -> epics -> features
decomposition is ready for `/spec-design`.

The verdict vocabulary remains `APPROVE|REJECT`. This review does not inspect
JSON task design; `/review-tasks-plan` owns that later gate.
</objective>

<input_contract>
Read when present and relevant:
- Constitution, Product Brief, analysis index, and clarified PRD;
- product, requirements, epics, and product features;
- spec-index and spec-backbone.

Do not require task records. If they already exist, ignore implementation detail
except for an obvious stale contradiction with the current product plan.
</input_contract>

<hard_invariants>
- Use a fresh-context reviewer or separate fresh session; do not pin a provider,
  CLI, or model.
- Reviewer reports findings only. It does not rewrite product decisions or
  choose between ambiguous alternatives.
- `FT-000` remains reserved for Foundation Dev Path.
- `REJECT` is blocking; `APPROVE` may include non-blocking notes.
- High-risk, large, and autonomous flows require `APPROVE`; small manual flows
  use this gate when required by the operator/Constitution or as recommended.
</hard_invariants>

<operator_decisions>
If correctness depends on an unresolved product/decomposition choice, return
`REJECT` with the exact question, affected artifacts, decision owner, and repair
route. A reviewer recommendation may accompany the question but must not be
applied as the operator's decision.
</operator_decisions>

<required_outputs>
Create:
- `.tasks/TASK-MB-REVIEW-FEAT-PLAN/REQUEST.md`;
- `.tasks/TASK-MB-REVIEW-FEAT-PLAN/TASK-MB-REVIEW-FEAT-PLAN-<STAGE_ID>-final-report-docs-01.md`.

The report must contain `VERDICT: APPROVE|REJECT`, evidence, blocking findings,
non-blocking notes, unresolved operator questions, and the owning repair route.

Use `TASK_ID=TASK-MB-REVIEW-FEAT-PLAN` and `STAGE_ID=S-FEAT`. The bounded
reviewer request must name the inputs above, the output path ending in
`TASK-MB-REVIEW-FEAT-PLAN-S-FEAT-final-report-docs-01.md`, the
`APPROVE|REJECT` vocabulary, and the prohibition on reviewing task
implementation detail. This is the reviewer handoff contract; review order and
probes remain discretionary.
</required_outputs>

<agent_discretion>
Choose review order, search tools, working-note shape, additional probes, and
depth proportional to risk and evidence. The review dimensions below are
coverage criteria, not a required reasoning script:
- clarified PRD and Constitution consistency;
- stable `REQ-*` IDs and no unsupported scope;
- PRD -> REQ -> EP -> FT traceability, including Product Brief/analysis when
  present;
- coherent feature value, sizing, boundaries, acceptance, and failure behavior;
- where evidence shows multiple acceptance outcomes, lifecycle/release units,
  or actor/authority/boundary paths, one bounded falsification probe asks
  whether a concrete second product slice has its own observable value and
  acceptance and can be verified or released independently;
- truthful `clarification_status: pending|blocked` handling;
- no bypass from analysis to tasking around `/write-prd`, `/spec-init`, `/prd-to-features`,
  `/spec-design`, or required Foundation Dev Path;
- `FT-000` reservation;
- visible Foundation pressure signals for `/spec-design` without creating
  foundation tasks here.
</agent_discretion>

<validation>
Return `APPROVE` only when product decomposition is traceable, coherent, and
free of blocking governance/clarification gaps. Return `REJECT` for a blocking
product, RTM, feature-boundary, clarification, or Constitution issue. Cite the
artifacts checked and distinguish evidence gaps from actual defects.

Boundary pressure alone is not a defect. For this boundary falsification probe,
reject only when inspected evidence proves a hidden independent product outcome
or an unresolved material boundary decision. Do not design the replacement
feature tree, split by technical layer, or require a persisted pressure
analysis; route repair to the owning command.
</validation>

<handoff_contract>
- `APPROVE` -> `/spec-design`.
- `REJECT` -> the named owner command, normally `/write-prd`, `/spec-init`,
  `/prd-to-features`, `/feature-doctor FT-<NNN>`, or `/constitution`; rerun this review
  after repair.

Do not restate the full downstream task/execution workflow.
</handoff_contract>
