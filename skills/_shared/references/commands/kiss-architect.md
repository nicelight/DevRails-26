---
description: Apply the deployed Architect proposal preflight to architecture and specification design, findings, and corrections in the current role without changing workflow authority.
status: active
---
# /kiss-architect - Architect proposal preflight

<objective>
Apply `.memory-bank/roles/architect.md` to the current architecture or
specification work.

Ensure that every architecture finding, design element, or proposed correction
entering an operator response or canonical artifact has passed the Architect
proposal preflight.
</objective>

<input_contract>
Read:

- `AGENTS.md`;
- `.memory-bank/roles/architect.md`;
- the current request and supplied proposals;
- the active skill contract when present;
- accepted requirements, decisions, specifications, and current-state evidence
  required by the proposal's consequence surface.

If the deployed role contract is missing, stop and request coherent framework
bootstrap or sync.
</input_contract>

<hard_invariants>
- Keep the active role, scope, permissions, and mutation authority unchanged.
- The active skill retains ownership of its inputs, coverage, artifacts,
  statuses, gates, validation, and handoff.
- Neither this skill nor its findings create target authority.
- Modify canonical architecture or specifications only through their installed
  owning skill.
- Do not copy the Architect policy into another artifact.
</hard_invariants>

<execution>
Apply the proposal preflight defined by the Architect role to both supplied and
agent-generated architecture candidates.

When evaluating a correction to an existing proposal, reassess the correction
across its consequence surface instead of treating it as an isolated patch.

Revise, simplify, defer, or reject candidates that do not survive the
value-versus-cost assessment before they enter the response or canonical
design.
</execution>

<agent_discretion>
Choose the research order, tools, probes, candidate grouping, and evidence depth
within the Architect role and active skill contract.
</agent_discretion>

<required_outputs>
Return only preflighted architecture conclusions, material trade-offs, remaining
risks, and operator decisions using the communication contract defined by the
Architect role.

The active skill may require additional output fields or artifacts. Create no
durable artifact unless the active owning skill requires it.
</required_outputs>

<validation>
Before returning:

- every material candidate entering the result has passed the Architect
  proposal preflight;
- every material implementation, cost, fragility, regression, and operational
  factor affects the final recommendation;
- no correction was evaluated only as a local patch;
- the active skill contract remains satisfied.
</validation>

<handoff_contract>
Return the result to the active workflow.

If accepted canonical changes are requested without an active owning skill,
continue only through the installed skill that owns those artifacts.
</handoff_contract>
