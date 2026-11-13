---
description: Reconcile durable project knowledge after meaningful changes.
status: active
---
# Memory Bank synchronization

Apply `execute-loop.md#working-policy`. Keep the existing Memory Bank useful
for the next session: task cards describe current work and results; specs and
requirements describe accepted behavior; indexes locate those sources.

Reconcile when meaningful work or a handoff changes this knowledge. Small
local work may need only the task's status/verify and the affected document.
No fixed wave ceremony or separate `/mb-sync` call is required.

Within the authorized work, update affected task/index references, REQ/feature
traceability, feature/epic lifecycle, specs, routers and changelog as useful.
Preserve the distinction between document status and implementation lifecycle.
Use actual task results; no invented PASS, acceptance or closure decision.
A substantive conflict needs consultation unless the agent has authority to
resolve it autonomously. Settled decisions need no extra approval artifact.

Check consistency of the surfaces changed. Lint and doctor are optional
mechanical diagnostics, not required post-sync gates. Report unresolved
contradictions with their affected work and the next useful action.

Framework-owned `.memory-bank/scripts/`, workflow references and
`.memory-bank/templates/protocols/` are maintained by installer sync. Project
records and filled `.protocols/<TASK_ID>/` remain authored state; preserve them.
