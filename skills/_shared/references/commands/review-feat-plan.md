---
description: Fresh-context review of PRD decomposition before global SDD design.
status: active
---
# /review-feat-plan - Feature plan review

The installed `agents/review-scope.md` is available for selected scope co-review;
its availability does not enable another participant.

Apply `.memory-bank/workflows/autonomy-policy.md` for effective settings,
host ownership, decisions, conditional artifacts, and required compact structured
flow feedback. Routes below are semantic handoffs, not instructions to launch
agents or write task lifecycle transitions.

<objective>
Independently decide whether PRD -> requirements -> epics -> features
decomposition supports the next selected design/tasking work.

The verdict vocabulary remains `APPROVE|REJECT`. This review does not inspect
JSON task design; `/review-tasks-plan` owns that later review when enabled.
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
- The host supplies an independent review context when this review is selected.
- Before the verdict, load and apply this installed skill's
  `references/finding-adjudication.md` semantic pack.
- Review is read-only; findings do not rewrite product decisions or authorize
  new scope. Route material choices through the common decision flow.
- `FT-000` remains reserved for Foundation Dev Path.
- A performed `REJECT` remains negative evidence; disposition uses the decision
  flow. `APPROVE` may include material non-blocking notes. Disabled review
  requires no launch, verdict or report, including autonomous runs.
</hard_invariants>

<operator_decisions>
If correctness depends on a material unresolved product/decomposition choice,
return `REJECT` with evidence, the question and owning repair route. The review
does not silently resolve the target; the caller uses the common decision flow,
including autonomous decisions. A recommendation alone is not user approval.
</operator_decisions>

<required_outputs>
Return `VERDICT: APPROVE|REJECT`, material evidence/findings, unresolved questions
and immediate owner with common flow feedback. A separate request or report is
optional. When selected, reuse the existing report path
`.tasks/TASK-MB-REVIEW-FEAT-PLAN/TASK-MB-REVIEW-FEAT-PLAN-S-FEAT-final-report-docs-01.md`.
Retain enough actual outcome and evidence for recovery without a fixed file set.
</required_outputs>

<agent_discretion>
Choose review order, search tools, working-note shape, additional probes, and
depth proportional to risk and evidence. The review dimensions below are
coverage criteria, not a required reasoning script:
- clarified PRD and Constitution consistency;
- stable `REQ-*` IDs and no unsupported scope;
- PRD -> REQ -> EP -> FT traceability, including Product Brief/analysis when
  present;
- stable unique `FT-<NNN>-AC-<NNN>` IDs under each feature's
  `## Acceptance Criteria`, matching the owning feature and linked to existing
  governing `REQ-*`;
- acceptance closure for material outcomes: each material edge/failure maps to
  a feature AC or a sourced authoritative out-of-scope disposition with
  `/write-prd` change route; each material NFR has an accepted observable
  target/qualitative criterion, decisive conditions, and verification method
  across its governing REQ and feature AC;
- coherent feature value, sizing, boundaries, acceptance, and failure behavior;
- where evidence shows multiple acceptance outcomes, lifecycle/release units,
  or actor/authority/boundary paths, one bounded falsification probe asks
  whether a concrete second product slice has its own observable value and
  acceptance and can be verified or released independently;
- truthful `clarification_status: pending|blocked` handling;
- sufficient accepted product meaning for the next selected operation; missing
  disabled-stage markers/artifacts alone are not defects;
- `FT-000` reservation;
- visible Foundation pressure signals for `/spec-design` without creating
  foundation tasks here.
</agent_discretion>

<validation>
Return `APPROVE` only when product decomposition is traceable, coherent, and
free of blocking governance/clarification gaps. Return `REJECT` for a blocking
product, RTM, feature-boundary, clarification, or Constitution issue. Cite the
artifacts checked and distinguish evidence gaps from actual defects.

For acceptance-closure rejection, name the uncovered outcome and route
PRD-owned acceptance to `/write-prd`, missing decomposition to
`/prd-to-features`, or feature-local clarification to `/feature-doctor FT-<NNN>`.

Boundary pressure alone is not a defect. For this boundary falsification probe,
reject only when inspected evidence proves a hidden independent product outcome
or an unresolved material boundary decision. Do not design the replacement
feature tree, split by technical layer, or require a persisted pressure
analysis; route repair to the owning command.
</validation>

<handoff_contract>
`APPROVE` -> next selected design/tasking operation, normally `/spec-design`
when global design is selected. `REJECT` -> propose the first owning repair
(`/write-prd`, `/prd-to-features`, `/spec-init`, `/constitution`, or optional
`/feature-doctor FT-<NNN>` triage), then re-review affected claims only if enabled.
A decision to continue preserves the actual REJECT; it does not fabricate APPROVE.
</handoff_contract>
