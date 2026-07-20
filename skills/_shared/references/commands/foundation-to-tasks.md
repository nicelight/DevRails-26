---
description: Convert an accepted Foundation Dev Path decision into the minimum FT-000 JSON queue, or prove an existing brownfield baseline.
status: active
---
# /foundation-to-tasks - Foundation decision -> FT-000 JSON tasks

<objective>
Turn the already accepted Foundation Dev Path decision into the smallest
executable walking-skeleton queue, using the normal JSON task model. In
`--verify-existing` mode, record a proven brownfield baseline without creating
`FT-000`, or create only the probes needed to prove it.
</objective>

<input_contract>
Supported arguments:
- no argument: create or reconcile the required foundation queue;
- `--verify-existing`: verify an existing brownfield executable baseline.

Require:
- `.memory-bank/foundation.md` produced by `/spec-design`;
- clarified PRD, requirements, epics, product features, and current Feature
  Pressure Map;
- `.memory-bank/spec-backbone.md` with Global Backbone Status `complete`, or
  valid `minimal` with explicit not-applicable rationales, and positive integer
  `Planning Revision`;
- pure `.memory-bank/spec-index.md` plus applicable linked canonical specs;
- `.memory-bank/tasks/index.json` and
  `.memory-bank/schemas/task.schema.json`;
- `.memory-bank/workflows/tier-policy.md`.

Read enough of those sources to prove the selected baseline, spec identity,
task shape, dependencies, and tier. The agent chooses the efficient reading
and exploration order, except that the task schema and tier policy must be
loaded before drafting durable task records.

Require this parseable anchor block:

```markdown
## Gate Anchors
- Foundation Required: true|false
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: pending_foundation_to_tasks|TASK-<NNN>-T<N>-FT-000-W<N>|not_required
```

If the backbone, foundation decision, anchors, or Feature Pressure Map are
missing, blocked, contradictory, stale, or contain placeholders, stop before
foundation specs, plans, requirements, features, or tasks are written and
route to `/spec-design`.
</input_contract>

<hard_invariants>
- Foundation is the minimum executable baseline, not product implementation or
  a future-ready platform.
- `REQ-000`, `FT-000`, and product-foundation `W0` are reserved. Product
  features must not use `FT-000`; product tasks must not use `W0`.
- Foundation uses only `.memory-bank/tasks/TASK-*.task.json`,
  `.memory-bank/tasks/index.json`, the existing task schema/lifecycle, and the
  tier-selected protocol/evidence paths. Do not add a foundation registry,
  schema, status machine, task fields, or protocol family.
- Task IDs use `TASK-NNN-TN-FT-000-WN`; ID tier/feature/wave segments match the
  record. Existing IDs are not renumbered.
- Lifecycle and closure ownership come from
  `.memory-bank/workflows/tier-policy.md`. This command creates/reconciles
  planning state only and never marks the final gate `done`.
- `touched_files` is advisory and non-exhaustive. A non-empty
  `runtime_context.write_boundary` is a deliberate hard boundary, never a
  mechanical copy of `touched_files`; `forbidden_scope` and stop conditions
  remain hard.
- New specs use subject-based canonical paths without `FT-000` or product
  feature identity. `spec-index.md` remains
  `Type | Path | Status | Scope | Change route`, without decision bodies,
  ownership, or `used_by` metadata.
- Do not invent future endpoints, event payloads, domain behavior, state
  machines, schemas, migrations, security policy, or operational layers that
  are not needed to prove the baseline.
- Never resolve competing canonical paths by creating a third spec.
</hard_invariants>

<operator_decisions>
This command consumes the Foundation decision; it does not silently revise it.
If evidence exposes a new material branch about whether Foundation is required,
what executable baseline is sufficient, or which architecture, component/API/
event/data, storage/state, security, compatibility, task-boundary, tier,
dependency, or verification contract should govern it:

- interactive/manual flow asks the operator an adaptive focused question,
  explains the downstream effect, and treats a recommendation/default as not
  accepted until the operator answers;
- record an accepted answer in the existing owning canonical artifact and
  `.protocols/FT-000/decision-log.md` when the queue exists, remove
  contradictory wording, and revalidate the Foundation anchors/spec routes;
- if the answer changes global design or the Foundation decision, route through
  `/spec-design` before task generation;
- unattended flow records the exact question and affected scope, creates no
  affected task records, returns `HALT_BLOCKING_QUESTIONS`, and names
  `/spec-design` as the resume route.

Do not ask when current authoritative evidence already settles the branch.
</operator_decisions>

<agent_discretion>
Within the accepted Foundation objective, source precedence, KISS constraints,
schema, tier policy, and hard scopes, the agent chooses:
- exploration order, tools, and working notes;
- the minimum walking skeleton and proof path;
- which applicable Architecture, Interfaces/Contracts, Data, testing, runbook,
  and evidence concerns need concrete coverage;
- `reuse|extend|create|not_applicable|block` per concern;
- the smallest cohesive task slicing, dependency shape, waves, and cheapest
  credible verification path.

Architecture, Interfaces/Contracts, Data, Verification, security, runtime, and
operations are coverage criteria driven by actual foundation pressure, not a
mandatory analysis sequence or a requirement to create every spec family.
</agent_discretion>

<required_outputs>
When `Foundation Required: false`:
- require `Foundation Gate Task: not_required` and concise evidence/rationale;
- create no `REQ-000`, `FT-000`, foundation plans, protocols, or task records.

For `--verify-existing`, if the baseline is already credibly proven, update the
existing Foundation decision to the same no-queue state. If evidence is
insufficient, keep `Foundation Required: true` and create only the minimum
probe/verification queue.

When `Foundation Required: true`:
1. Reconcile only the substrate-level canonical specs needed by the proof path.
   Each changed or depended-on concrete concern has one canonical spec defining
   shape, `MUST`/`MUST NOT` rules, edge cases/errors, and a verification target.
   Typical routes are:
   - runtime/module shape -> `.memory-bank/architecture/*`;
   - component/API/event/protocol/agent/tool boundaries and crossing payloads
     -> `.memory-bank/contracts/*`;
   - internal DB/session/UoW/migration/seed/storage/state ->
     `.memory-bank/domains/*`, `.memory-bank/states/*`, or the stack-native
     schema/migration source;
   - proof harness/evidence -> `.memory-bank/testing/*`;
   - local bootstrap/runtime/troubleshooting -> `.memory-bank/runbooks/*`.
2. Add/update `REQ-000` in `.memory-bank/requirements.md` as the verified
   executable-baseline requirement.
3. Create/update `.memory-bank/features/FT-000-foundation.md` with lifecycle
   `planned|implemented|verified`, clarification omitted or `complete`, links
   to Foundation/REQ/specs, and an explicit pseudo-feature note.
4. Create/update `.protocols/FT-000/plan.md`,
   `.protocols/FT-000/decision-log.md`, and
   `.memory-bank/tasks/plans/IMPL-FT-000.md`.
5. Create/reconcile at least one implementation/probe task and exactly one
   final foundation gate task. The final gate depends on every required
   foundation implementation/probe task and proves build/start/test/smoke plus
   required compatibility probes.
6. Replace `pending_foundation_to_tasks` with the concrete final gate task ID.
7. Index every record exactly once and keep Foundation records before product
   records.

Task-record rules:
- use `feature: "FT-000"`, normally `reqs: ["REQ-000"]`, and `W0` only for
  executable-baseline work; later probe/integration waves may use `W1+`;
- `ready` requires no unmet dependency or blocker; otherwise use `planned`;
- choose tier only from `tier-policy.md`;
- populate schema fields only from evidence and leave optional grounded-only
  fields empty/absent rather than inventing filler;
- link task-relevant substrate specs through existing link-bearing fields;
- every T2/T3 record has non-empty `purpose`, scalar `success_outcome`, at
  least one existing direct task-linked canonical SDD path, advisory expected
  change surface and/or justified hard write scope, and a real gate command
  and/or non-empty verification target.
</required_outputs>

<validation>
Before handoff, prove:
- schema/index validity and ID/tier/feature/wave consistency;
- `REQ-000`, `FT-000`, W0, and final-gate rules;
- one and only one final gate with complete dependencies and an acyclic graph;
- no product behavior or speculative substrate escaped the Foundation scope;
- canonical-path uniqueness and spec-index purity;
- every T2/T3 card satisfies the complete single-card handoff contract;
- Gate Anchors name the final gate or `not_required` truthfully;
- no affected material operator decision remains unresolved.

Report queue action, specs reused/extended/created, task IDs, final gate ID or
`not_required`, and blockers/questions.
</validation>

<handoff_contract>
- Queue created/reconciled: stop before execution and hand off immediately to
  `/mb-doctor --strict` for the FT-000 queue. In an unattended run, return to
  the `/autonomous`-owned Foundation phase; never hand FT-000 execution to
  `/autopilot`.
- No Foundation required/proven brownfield baseline: hand off to
  `/feature-to-tasks FT-<NNN>`.
- Unresolved Foundation/design decision: no affected queue handoff;
  `/spec-design` is the repair/resume owner.
</handoff_contract>
