---
description: Run an existing product queue with optional Judge guidance.
status: active
---
# /multipilot - Product scheduler with Judge

<objective>
Use the installed `/autopilot` with advisory guidance from
`.memory-bank/workflows/multiagents_with_judge.md`.
</objective>

<contract>
Read the active runtime scheduler and overlay. Reuse one Judge when available;
consult it when its judgment would help or the operator asks. No fixed model,
fresh-session rule, or successful Judge launch is required to run the queue.

The scheduler retains task selection, final states, retries, recovery, and
budgets. Judge advice is evidence for its judgment, not a separate approval or
permission system. If guidance is unavailable, continue the authorized base
flow and make that limitation clear.
</contract>

<handoff_contract>
Return the base scheduler's result with useful accepted advice recorded in
existing run state. Missing optional supervision is not a queue failure.
</handoff_contract>
