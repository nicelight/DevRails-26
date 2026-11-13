---
description: Run the autonomous workflow with optional Judge guidance.
status: active
---
# /multiagentic - Autonomous workflow with Judge

<objective>
Use the installed `/autonomous` and product `/autopilot` with the advisory
`.memory-bank/workflows/multiagents_with_judge.md` overlay.
</objective>

<contract>
Read the active runtime skills and overlay. Reuse one Judge when available and
consult it at useful decision points or the operator's request. Delegation,
model choice, and consultation count are not gates. If unavailable, continue
the authorized base flow and state that Judge guidance was not used.

The base workflow owns intent, tasks, evidence, recovery, budgets, and final
states. Judge advice neither changes those owners nor grants new authority.
An unresolved decision outside delegated scope returns to the operator.
</contract>

<handoff_contract>
Preserve the base workflow's result and evidence. Record material accepted Judge
advice in existing run state; no separate supervision report is required.
</handoff_contract>
