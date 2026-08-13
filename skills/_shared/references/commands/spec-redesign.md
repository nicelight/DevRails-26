---
description: Evidence-bounded redesign of an already accepted SDD backbone or shared contract.
status: active
---
# /spec-redesign - Accepted design change gate

<objective>
Apply an accepted change to an existing positive-revision SDD backbone or
shared contract, prove its planning impact, and route only affected planning
surfaces. Do not replay initial architecture discovery.
</objective>

<input_contract>
Require:
- Global Backbone Status `complete|minimal` with positive `Planning Revision`;
- the accepted change or exact unresolved operator decision;
- current canonical specs, feature links, task plans/cards, and review evidence
  needed to trace consumers and planning impact;
- `.memory-bank/workflows/sdd-design-contract.md`;
- `.memory-bank/workflows/execute-loop.md#planning-redesign-boundary` and
  `#fresh-feature-tasking-boundary`.

If no successful positive-revision backbone exists, route to `/spec-design`.
If the requested target change is not authoritative, obtain the operator-owned
decision before changing canonical contracts.
</input_contract>

<hard_invariants>
- Change only the owning canonical backbone, spec, ADR, Foundation, feature, or
  registry links required by the accepted decision.
- Do not create task records, plans, revision history, impact registries,
  lifecycle, schema, or a parallel review system. Bounded routing uses only the
  feature-body marker below.
- Preserve task lifecycle, completed evidence, protocols, and unaffected
  approvals.
- Do not use revision mismatch as impact proof. Establish semantic impact
  before deciding whether revision changes.
- Do not revisit Foundation unless its decision or executable baseline contract
  is affected.
</hard_invariants>

<operator_decisions>
Apply the shared authority and operator-decision boundary. Unattended flow uses
the existing blocking halt and names `/spec-redesign` as the resume route.
</operator_decisions>

<required_outputs>
Apply the SDD Design Contract to the accepted delta: update its canonical owner,
every affected canonical consumer, registry links, and affected feature links.
Update backbone status/matrix/mode or Foundation only when their owned semantics
actually changed.

Classify impact under the loaded Planning Redesign Boundary. Report the
`none|bounded|global` verdict, changed planning semantics or the evidence that
they were preserved, exact affected features, Planning Revision before/after,
and Foundation impact. If the impact boundary cannot be proved, return blocked
without changing revision.

Reconcile `bounded|global` affected features one at a time through the Fresh
Feature Tasking Boundary. For `bounded`, add
`PLANNING_RECONCILIATION_REQUIRED` only to affected task-linked feature bodies
whose planning needs repair; do not change feature frontmatter, Global Backbone
Status, or Planning Revision. Unaffected features remain eligible. Rerun
Foundation planning only when its decision or executable baseline changed.
</required_outputs>

<agent_discretion>
Choose the minimum reading, trace, artifact edits, and validation sufficient to
prove the verdict. Reuse current accepted artifact shapes and canonical paths.
</agent_discretion>

<validation>
Apply Shared Validation from the SDD Design Contract, then verify:
- the verdict cites changed planning semantics and exact affected consumers;
- Planning Revision is unchanged for `none|bounded` and increments once for
  `global`;
- Foundation routing matches actual Foundation impact;
- task statuses, completed evidence, protocols, and unaffected approvals are
  unchanged;
- every bounded feature whose planning needs repair has the marker and a
  sequential reconciliation/review route; unaffected work remains eligible.
</validation>

<handoff_contract>
Report changed contracts, impact verdict and evidence, Planning Revision
before/after, affected features, Foundation impact, blockers, and one next
command:
- `none` -> resume the prior owner;
- `bounded|global` -> next affected `/spec-auto FT-<NNN>` when feature design
  needs reconciliation, otherwise fresh `/feature-to-tasks FT-<NNN>`;
- blocked -> obtain the named decision/evidence and rerun `/spec-redesign`.
</handoff_contract>
