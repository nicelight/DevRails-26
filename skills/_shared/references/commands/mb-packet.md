---
description: Repair or refresh a derivative Execution Packet for one TASK.
status: active
---
# /mb-packet - Build TASK Execution Packet

<objective>
Repair or refresh a compact derivative Execution Packet for one indexed task.
The packet helps `/execute`, `/verify`, `/red-verify`, `/autopilot`, and
`/autonomous` load the right runtime context without replacing task records or
linked specs as source of truth.

Normal manual flow creates initial required packets inside
`/prd-to-tasks FT-<NNN>` while feature/task/spec context is already loaded. Use
standalone `/mb-packet TASK-<ID>` after task records or linked specs changed, or
when `/mb-doctor` reports a packet readiness problem.
</objective>

<process>

## 0) Input
Expected `$ARGUMENTS`:
- `TASK-<ID>`

Output path:
- `.memory-bank/packets/TASK-<ID>.packet.json`

Use `skills/_shared/references/protocols/packet-template.json` as the shape
reference when available.

Minimal packet shape:

```json
{
  "schema_version": 1,
  "packet_id": "PACKET-TASK-001-R1",
  "task_id": "TASK-001",
  "created_at": "ISO-8601",
  "source_task_hash": "sha256:<64-lowercase-hex>",
  "status": "ready",
  "tier": "T2",
  "purpose": "",
  "success_outcome": "",
  "anti_goals": [],
  "source_refs": {
    "task": ".memory-bank/tasks/TASK-001.task.json",
    "feature": ".memory-bank/features/FT-001-example.md",
    "specs": [],
    "guides": [],
    "protocols": []
  },
  "scope": {
    "allowed_write_scope": [],
    "forbidden_scope": []
  },
  "verification": {
    "commands": [],
    "success_checks": [],
    "evidence_required": []
  },
  "stop_conditions": [],
  "required_handoff": [
    "changed_files",
    "commands_run",
    "evidence",
    "scope_compliance",
    "blockers_or_none"
  ]
}
```

## 1) Source of truth
Execution Packet is derivative only.

Authoritative sources remain:
- `.memory-bank/tasks/index.json`
- indexed `.memory-bank/tasks/TASK-<ID>.task.json`
- linked feature/REQ docs
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- linked SDD specs in `.memory-bank/tech-specs/`, `.memory-bank/architecture/`,
  `.memory-bank/contracts/`, `.memory-bank/domains/`, `.memory-bank/states/`,
  `.memory-bank/adrs/`, `.memory-bank/testing/`, `.memory-bank/guides/`, and
  `.memory-bank/runbooks/`
- `.memory-bank/workflows/tier-policy.md`

If the packet conflicts with task record, linked specs, tier policy, or protocol
expectations, the packet loses. Rebuild it or stop with a blocker.

## 2) Build steps
1. Read `.memory-bank/tasks/index.json`.
2. Read the indexed task record and verify the record `id` matches `TASK-<ID>`.
3. Read linked feature/REQ docs and richer task fields when present:
   - `purpose`
   - `success_outcome`
   - `anti_goals`
   - `source_artifacts`
   - `normative_inputs`
   - `constraints`
   - `invariants`
   - `verification_targets`
   - `runtime_context`
4. Read `.memory-bank/spec-backbone.md` and `.memory-bank/spec-index.md` when
   task tier, linked specs, or runtime context require them.
5. Resolve linked SDD specs from task fields and linked feature
   `spec_design_links`.
   Include `.memory-bank/contracts/boundary-map.md` only when it is linked by
   existing source/normative/constraint/verification fields or clearly supplies
   the task's runtime scope; do not add boundary-specific task fields.
6. Compute `source_task_hash` as `sha256:<64-lowercase-hex>` over the raw
   bytes of the current indexed `.memory-bank/tasks/TASK-<ID>.task.json` file.
   MVP freshness uses this task-record hash only.
7. Build a compact packet with:
   - task id, tier, purpose fields, and source refs
   - allowed and forbidden scope from `runtime_context`, defaulting
     `allowed_write_scope` from `touched_files` when evidence supports it
   - verification commands/checks/evidence required from task gates, verify
     fields, verification targets, and linked specs
   - short stop conditions from task/runtime context
   - required handoff fields
8. Write `.memory-bank/packets/TASK-<ID>.packet.json`.

## 3) Packet status
Packet statuses are local to the packet:

```text
ready
ready_with_gaps
blocked
stale
```

These statuses are not task lifecycle statuses. Task lifecycle remains:

```text
planned|ready|in_progress|blocked|done|failed
```

Use:
- `ready` when the packet is usable and required context is present.
- `ready_with_gaps` when bounded work can proceed but non-blocking context is
  missing; report the gaps explicitly.
- `blocked` when required inputs are missing, contradictory, or insufficient for
  safe execution.
- `stale` when an existing packet's `source_task_hash` does not match the
  current raw indexed task record file hash. Refresh the packet before
  execution.

For T2/T3 required packet use, missing linked SDD specs, missing verification
basis, or contradictory scope should be `blocked`, not `ready_with_gaps`.

## 4) Do not do
`/mb-packet` must not:
- create task records
- create specs or silently edit product docs
- create `.memory-bank/modules/`, `.memory-bank/graph/`, or a module graph
- create Failure Packet or a separate failure artifact layer
- implement code
- run `/execute`, `/verify`, `/red-verify`, or `/mb-sync`
- close, fail, block, promote, or otherwise change task lifecycle status

## 5) Output report
Report:

```text
Packet: .memory-bank/packets/TASK-001.packet.json
Status: ready|ready_with_gaps|blocked|stale
Missing:
- ...
Gaps:
- ...
Next action:
- rerun /mb-doctor at the feature/task-queue boundary, then /execute TASK-001; or resolve blocker
```

For `T2` / `T3`, and for `T0` / `T1` tasks with
`runtime_context.packet_required: true`, `ready` or `ready_with_gaps` is
required before execution handoff. Missing, stale, blocked, malformed, or
hash-mismatched required packets are reported by `/mb-doctor` as feature/task-
queue readiness problems.

</process>
