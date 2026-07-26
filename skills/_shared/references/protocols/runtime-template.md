---
description: Template for optional task-scoped delegated-agent runtime state.
status: active
---
# Delegated Agent Runtime State

Create `.protocols/<TASK_ID>/runtime.json` only when the current task actually
delegates an Implementer or a specialized Reviewer. Direct single-agent work
does not create this file.

`runtime.json` is operational task resume state. It is not part of Memory Bank,
the task schema, the task registry, or task lifecycle. It never grants task
status authority.

Initialize the file from this object:

```json
{
  "task_id": "TASK-NNN-TN-FT-NNN-WN",
  "waiting_for": "",
  "agents": {
    "implementer": null,
    "bug_reviewer": null,
    "security_reviewer": null,
    "compliance_reviewer": null,
    "qa": null
  }
}
```

When a slot is non-null, its value has exactly this operational shape:

```json
{
  "agent_id": "<opaque runtime agent id>",
  "role": "implementer|bug_reviewer|security_reviewer|compliance_reviewer|qa",
  "status": "running|waiting|completed|closed|failed",
  "waiting_for": ""
}
```

## Invariants

- `task_id` must equal the protocol directory and authoritative task ID.
- `waiting_for` at the top level is either empty or the one active slot name.
- An agent's `waiting_for` is empty unless that agent is waiting for a named
  durable handoff, verdict-supporting report, or other exact final output.
- `agent_id` is opaque and runtime-specific. Never derive lifecycle meaning
  from its format.
- At most one slot is `running|waiting` at a time. DevRails task execution and
  reviewer delegation remain sequential.
- Slot status is operational only. It is not a task lifecycle status and does
  not replace `planned|ready|in_progress|blocked|done|failed` in the indexed
  task record.
- Reviewers return findings only. They never change task status, create tasks,
  or own `/verify` and `/red-verify` verdicts.

## Spawn, wait, complete, close

Use the current runtime's native equivalent of spawn, wait/resume, final
notification, and close. Do not require Codex-specific function names from
Claude Code or vice versa.

1. Before spawning, reconcile the slot and existing durable task reports.
2. Immediately after spawn returns, persist `agent_id`, `role`, and
   `status: running` before any wait.
3. Before waiting, set top-level `waiting_for` to the slot, set the slot to
   `status: waiting`, and name the expected durable output in the slot's
   `waiting_for`.
4. On a final response or late final notification, first persist the complete
   handoff/findings in the existing task protocol or `.tasks/<TASK_ID>/`.
5. Then set the slot to `status: completed`, clear both `waiting_for` fields,
   and invoke the runtime's close/terminate-equivalent for that agent.
6. After explicit close succeeds, set `status: closed`. When the runtime has no
   explicit close operation, `completed` is terminal: do not treat it as active
   and do not respawn it.

## Recovery after interruption

Always read `runtime.json` and existing durable reports before spawning:

- `closed` plus its durable final report: consume the report and never respawn.
- `completed` plus its durable final report: consume it, attempt close when the
  runtime supports that operation, and never redo the delegated work.
- `completed|closed` without a durable final report: do not assume success and
  do not automatically replay the delegated work. Return an evidence gap to the
  owning command; only its existing retry/repair policy may authorize a safe
  replacement.
- `running|waiting`: inspect the same `agent_id` and any late final
  notification first. Resume/wait on that agent instead of creating another.
- `failed`, missing, or stale runtime identity: respawn only when the owning
  stage is still required, replay is safe, and no durable final report exists.
  Record the replacement reason in the existing task protocol before replacing
  the slot.
- A durable final report wins over a stale `waiting_for` flag. Clear the stale
  wait, finalize/close the recorded agent, and continue from the report.

Never replay a possibly completed unsafe or non-idempotent action merely to
repair runtime state.
