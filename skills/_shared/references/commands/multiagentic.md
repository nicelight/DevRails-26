---
description: Run the current autonomous and product-scheduler contracts with phased Judge supervision.
status: active
---
# /multiagentic - Current autonomous workflow with Judge

<objective>
Run the complete unattended workflow using the currently installed
`/autonomous` contract, then delegate product execution to the currently
installed `/autopilot`, augmenting each phase only with
`.memory-bank/workflows/multiagents_with_judge.md`. Use `/autonomous` as the
baseline contract executed by `/multiagentic`; keep both base contracts in
their installed canonical files.
</objective>

<contract>
1. For Product/Design, Foundation, and product tasking, read the installed
   `/autonomous` `SKILL.md` from the active runtime surface and apply
   `multiagents_with_judge.md#judge-consultation` and
   `#autonomous-with-judge`. Act as `/multiagentic`.
2. Load `/autopilot` and its Judge section when the base autonomous contract
   reaches its strict-ready product handoff. Delegate the queue to the installed
   `/autopilot`; its launch prompt requires the active-runtime `SKILL.md`,
   `multiagents_with_judge.md#judge-consultation`, and
   `#autopilot-with-judge`. On resume from an active product-scheduler
   checkpoint, resume this delegated phase.
3. The base contracts own lifecycle, ownership, gates, budgets, recovery,
   terminal states, and handoffs. The overlay owns Judge consultation and route
   reaction.
4. If the operator explicitly requests Judge consultation, consult Judge at
   the next safe durable boundary in the active phase.

Use only the matching active runtime copy (`.agents/skills/` or
`.claude/skills/`). If a required base contract, overlay, or Judge role is
unavailable, use the base `HALT_POLICY_VIOLATION` route and resume after the
installed contract is restored.
</contract>

<handoff_contract>
Preserve the run protocol and terminal result required by the active base
contract. `/multiagentic` reports success only when the base end-to-end success
conditions and every due Judge reaction are resolved.
</handoff_contract>
