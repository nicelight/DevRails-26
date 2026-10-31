---
description: Evidence-bounded redesign of an already accepted SDD backbone or shared contract.
status: active
---
# /spec-redesign - Accepted design change

Use installed `references/adr-template.md` only when a selected durable decision
record is useful; redesign does not require an ADR.

Apply `.memory-bank/workflows/autonomy-policy.md` for effective settings,
host ownership, decisions, conditional artifacts, and required compact structured
flow feedback. Routes below are semantic handoffs, not instructions to launch
agents or write task lifecycle transitions.

<objective>
Apply an accepted change to an existing SDD backbone or
shared contract, prove its planning impact, and route only affected planning
surfaces. Do not replay initial architecture discovery.
</objective>

<input_contract>
Require:
- an existing accepted design/contract owner and its actual revision when present;
- the accepted change or exact unresolved operator decision;
- current canonical specs, feature links, task plans/cards, and review evidence
  needed to trace consumers and planning impact;
- `.memory-bank/workflows/sdd-design-contract.md`;
- `.memory-bank/workflows/execute-loop.md#planning-redesign-boundary` and
  `#fresh-feature-tasking-boundary`.

If there is no accepted design to change, propose initial `/spec-design` only
when needed for the actual scope. An absent disabled global-design stage does
not require a new backbone. Resolve unauthoritative target changes through the
common decision flow before changing contracts.
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
Apply the shared authority and common decision flow to the proposed change,
repair route and unresolved impact boundary. Autonomous policy permits semantic
decisions, not invented consumer evidence. Resume at `/spec-redesign` when
missing facts or a manual stop prevents continuation.
</operator_decisions>

<required_outputs>
Apply the SDD Design Contract to the accepted delta: update its canonical owner,
every affected canonical consumer, registry links, and affected feature links.
Update backbone status/matrix/mode or Foundation only when their owned semantics
actually changed.

Classify impact under the loaded Planning Redesign Boundary. Report the
`none|bounded|global` verdict, changed planning semantics or the evidence that
they were preserved, exact affected features, Planning Revision before/after,
and Foundation impact. When no backbone revision exists, record the actual
accepted basis and affected owners without inventing a revision marker. If the
impact boundary cannot be proved, return blocked without changing revision.

Propose reconciliation of `bounded|global` affected features through the Fresh
Feature Tasking Boundary; the host sequences authorized selected operations.
For `bounded`, or `global` without a recorded revision, add
`PLANNING_RECONCILIATION_REQUIRED` only to affected task-linked feature bodies
whose planning needs repair; do not change feature frontmatter, Global Backbone
Status, or Planning Revision. Unaffected features remain eligible. Propose
Foundation reconciliation only when its decision or executable baseline changed.
</required_outputs>

<agent_discretion>
Choose the minimum reading, trace, artifact edits, and validation sufficient to
prove the verdict. Reuse current accepted artifact shapes and canonical paths.
</agent_discretion>

<validation>
Apply Shared Validation from the SDD Design Contract, then verify:
- the verdict cites changed planning semantics and exact affected consumers;
- an existing Planning Revision is unchanged for `none|bounded` and increments
  once for `global`; omitted disabled-stage revision is not fabricated;
- Foundation routing matches actual Foundation impact;
- task statuses, completed evidence, protocols, and unaffected approvals are
  unchanged;
- every affected feature whose planning needs repair and has no global revision
  invalidation has the marker and a
  reconciliation route with reviews only when enabled; unaffected work remains
  eligible.
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
