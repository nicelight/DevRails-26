---
description: Run the current product scheduler with phased Judge supervision.
status: active
---
# /multipilot - Current product scheduler with Judge

<objective>
Run an already reviewed and strict-ready product queue through the installed
`/autopilot`, applying `.memory-bank/workflows/multiagents_with_judge.md` with
one Judge for the whole run. Keep the base scheduler contract in its installed
canonical file.
</objective>

<contract>
1. Establish and retain the single Judge session required by
   `multiagents_with_judge.md#judge-session-and-consultation`.
2. Read the installed `/autopilot` `SKILL.md` from the active runtime surface
   and apply `multiagents_with_judge.md#judge-session-and-consultation` and
   `#autopilot-with-judge`. Act as `/multipilot`.
3. Delegate the queue to the installed `/autopilot`; its launch prompt requires
   the active-runtime `SKILL.md`, both overlay sections, and
   the existing Judge target. It must use it and must not launch or replace it.
   Resume an active product-scheduler phase with the same Judge session.
4. `/autopilot` owns lifecycle, ownership, gates, budgets, recovery, terminal
   states, and handoffs. The overlay owns Judge consultation and route reaction.
5. If the operator explicitly requests Judge consultation, consult Judge at
   the next safe durable boundary.

Use only the matching active runtime copy (`.agents/skills/` or
`.claude/skills/`). If the base contract, overlay, or Judge role is unavailable,
use `/autopilot`'s `HALT_POLICY_VIOLATION` route and resume after the installed
contract is restored.
</contract>

<handoff_contract>
Preserve the run protocol and terminal result required by `/autopilot`.
`/multipilot` reports success only when the base scheduler success conditions
and every due Judge reaction are resolved.
</handoff_contract>
