---
description: Bounded C4 and architecture review of one feature's task-planning surface for a fresh Reviewer.
status: active
---
# /architecture-review - Feature architecture review

<objective>
Review one feature's task-planning surface against its accepted C4 context,
architecture support, boundaries, dependencies, and invariants. Return a
compact Reviewer report to the calling reviewer.
</objective>

<input_contract>
Require one `FT-<NNN>` plus its product, relevant epic, feature, implementation
plan, and indexed tasks. Include applicable direct architecture/spec links;
their absence is valid when canonical evidence shows none applies to the
reviewed feature. Read additional canonical specs or code evidence only when
needed to verify a finding.
</input_contract>

<hard_invariants>
- Work read-only. Do not repair specs, plans, tasks, or lifecycle state.
- Review the accepted target; do not invent architecture or requirements.
- The verdict covers this architecture review; `/review-tasks-plan` owns its
  final `APPROVE|REJECT`.
- Do not require an ADR unless accepted project policy or the reviewed decision
  requires one.
- Create no separate report artifact.
</hard_invariants>

<coverage>
Treat these as coverage criteria, not a mandatory order:

1. C4 L1-L3
   - product/system purpose and actors remain coherent;
   - relevant epic/subsystem boundaries and value are consistent;
   - target feature/module responsibilities and dependencies fit that context.
2. Architecture support
   - applicable architecture/guides or equivalent contracts, states, runbooks,
     testing, invariants, and spec-index routes are present and consistent;
   - one concrete concern has one canonical path.
3. Boundaries and invariants
   - ownership, source of truth, public boundaries, dependency direction,
     cross-component orchestration, and required proof paths are preserved;
   - dependencies are explicit and no task must invent a material boundary.
   - a capability-sliced cross-slice outcome names one accepted capability slice
     as orchestration owner; reject an orchestration slice invented in planning;
   - applicable linked rules retain existing mechanical gates and required
     runtime reproducibility proof; require neither without canonical evidence.
4. Anti-patterns
   - speculative architecture without current evidence;
   - hidden or cyclic dependencies;
   - business orchestration in transport handlers, generic utilities, or the
     composition root when accepted architecture forbids it;
   - missing applicable invariants or required architecture proof.
</coverage>

<agent_discretion>
Choose reading order, probes, and depth proportional to the target. Follow
relevant dependencies beyond the feature only when they can change the verdict.
</agent_discretion>

<required_outputs>
Return only:

- `verdict: APPROVE|REQUEST_CHANGES|OWNER_DECISION_NEEDED`;
- `findings`;
- `evidence_checked`;
- `risks_or_questions`.

Do not repeat source contents or the caller's task-planning review.
</required_outputs>

<validation>
Each finding cites inspected evidence, distinguishes an accepted-rule defect
from an optional improvement, and states its effect on task-plan readiness.
</validation>

<handoff_contract>
Return the report to `/review-tasks-plan`; the caller owns the final verdict and
repair route.
</handoff_contract>
