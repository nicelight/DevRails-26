---
description: Optional read-only source routing for a bounded target.
status: active
---
# /context-manifest — Route context reads

Apply `.memory-bank/workflows/autonomy-policy.md` for decisions, effective
settings, host ownership and recovery.

Return the smallest sufficient source routes for the caller's target workflow,
FT/TASK/REQ or free-form goal, with any actual gaps. Resolve IDs through existing
indexes and read the target operation's input contract. Direct reads are usually
cheaper for an obvious small source set; a DSH Explorer is conditional, not a gate.

Stay read-only. Do not execute the target workflow, create a durable manifest,
launch further agents, expose secrets, or dump source contents. Direct canonical
links outrank registry guesses; legacy/as-is evidence is not accepted authority.
Keep required inputs even if a suggested read budget is too small, reporting
the budget gap instead of omitting authority.

A useful result names the target, current sources with valid paths/anchors or
ranges, why they matter where unclear, and `ready|gaps`. No fixed table, token
limit or full-file read is required beyond the owning operation's input contract.
`ready` means sufficient for discovered routes, not global completeness. If
source state changes, recheck affected routes before use.

Return to the caller. The caller reads the needed authority, expands context
when evidence requires it, and handles unresolved choices through its decision
flow. The manifest is neither a scope boundary nor a new artifact/check.
