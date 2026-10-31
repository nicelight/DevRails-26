---
description: Bounded C4 and architecture review of one feature's task-planning surface for a fresh Reviewer.
status: active
---
# /architecture-review - Feature architecture review

Apply `.memory-bank/workflows/autonomy-policy.md` for effective settings,
host ownership, decisions, conditional artifacts, and required compact structured
flow feedback. Routes below are semantic handoffs, not instructions to launch
agents or write task lifecycle transitions.

<objective>
Review one feature's task-planning surface against its accepted C4 context,
architecture support, boundaries, dependencies, and invariants. Return a
compact Reviewer report to the calling reviewer.
</objective>

<input_contract>
Require one `FT-<NNN>` and its indexed task scope. Use product, epic, feature and
implementation plan evidence when present; missing disabled-stage artifacts alone
do not block review. Include applicable direct architecture/spec links;
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
- A separate report is unnecessary; retain the actual result through the caller.
- Disabled architecture review requires no launch, verdict or report.
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
     Their outcomes are prerequisites, not inherited proof; regression checks
     do not transfer claim ownership;
   - when an accepted graph applies, its relevant modules, exact contracts, accepted
     directions and consumers are consistent until compatibility stops impact;
   - accepted architecture and rollout constraints—not graph shape alone—justify
     task dependencies and waves;
   - a capability-sliced cross-slice outcome names one accepted capability slice
     as orchestration owner; reject an orchestration slice invented in planning;
   - selected checks retain applicable accepted rules and reproducibility proof;
     disabled checks require no missing report or synthetic pass.
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
Return the subject result plus common structured flow feedback:

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
Return the result to the caller, normally `/review-tasks-plan`; it owns the final
verdict. Material repair/consultation proposals use the common decision flow,
not an automatic new review gate.
</handoff_contract>
