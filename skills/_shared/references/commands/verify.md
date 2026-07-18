---
description: Independently verify one implemented task against its task-scoped normative basis and reproducible evidence.
status: active
---
# /verify - Verify one implemented TASK

<objective>
Prove or disprove one task's independently verifiable outcome. Record functional
evidence and exactly one `VERDICT: PASS|FAIL|NEEDS-CLARIFICATION` without
becoming an implementer, planner, scheduler, or adversarial semantic reviewer.
</objective>

<input_contract>
Expected `$ARGUMENTS`: one `TASK-NNN-TN-FT-NNN-WN`.

Require:
- exactly one matching indexed task record and
  `.memory-bank/workflows/tier-policy.md`;
- task-linked feature/REQ material needed for this outcome;
- direct task-linked applicable canonical SDD specs;
- tier-selected execution protocol and implementation handoff/evidence:
  - T0/T1 -> `.protocols/<TASK_ID>/run.md` plus `.tasks/<TASK_ID>/` when present;
  - T2/T3 -> `context.md`, `plan.md`, `progress.md`, `handoff.md`, existing
    `verification.md`, and substantive `.tasks/<TASK_ID>/` artifacts.

Normal scheduler input is `in_progress`. Manual re-verification of another state
requires tier-appropriate implementation evidence or an explicit request. Never
verify a merely `planned|ready` task as implemented or silently reinterpret
`blocked|failed|done`.

Point-of-use preflight confirms index/file/ID and ID-segment consistency, valid
tier, string-array `reqs`/`depends_on`, valid gate shapes, valid `verify` array,
and tier-selected execution evidence. This is not another full schema/review
gate. Missing required input returns `NEEDS-CLARIFICATION`; do not reconstruct
it from protocol prose.
</input_contract>

<hard_invariants>
- Route only by `task.tier`; lifecycle/status ownership is canonical in
  `.memory-bank/workflows/tier-policy.md`.
- Verify this task's outcome and mapped AC/REQ subset, not the whole feature or
  acceptance assigned to other tasks.
- Direct task-linked canonical specs outrank secondary task prose for their
  concerns. For T2/T3, feature links or `spec-index.md` alone are insufficient.
- Apply only spec families demanded by actual scope. Missing/conflicting/wrong
  canonical coverage is a planning/design blocker, not an implementation FAIL.
- Evidence requirements and verification targets state what must be proved;
  they are not proof. `/execute` local PASS is input, not automatic PASS.
- Advisory `touched_files` deviation is not material expansion by itself; hard
  allowed/forbidden scopes and semantic task boundaries remain strict.
- Do not edit implementation, specs, AC, dependencies, tier/wave, task scope,
  BUG records, or follow-up tasks.
- Scheduler mode: never close/fail/block/promote tasks or dependents.
</hard_invariants>

<operator_decisions>
If a credible verdict depends on an unresolved product behavior,
architecture/contract/state/data/storage/security/compatibility interpretation,
task boundary, tier, dependency, verification strategy, or human checkpoint,
do not choose one.

- Record `VERDICT: NEEDS-CLARIFICATION`, the exact question, affected proof,
  and current evidence.
- Interactive flow asks the operator; a recommendation/default/silence is not
  acceptance. The owning skill durably updates the canonical artifact and the
  task is revalidated/re-executed before verification resumes.
- Route task scope/tier/feature-level spec repair to
  `/prd-to-tasks FT-<NNN>`, shared/global design to `/spec-design`, product
  ambiguity to `/clarify-feature FT-<NNN>`, and missing implementation evidence
  to `/execute <TASK_ID>`.
- Unattended flow returns the blocker and exact route to the scheduler for
  `HALT_CLARIFICATION_REQUIRED` or `HALT_BLOCKING_QUESTIONS`.

No question is needed when authoritative evidence already settles the branch.
</operator_decisions>

<agent_discretion>
Within the task-scoped normative basis, the verifier chooses evidence-reading
order, tools, the smallest credible independent checks, reproducible flows, and
depth proportional to tier and failure risk. Coverage criteria do not prescribe
a fixed checklist order or require irrelevant test categories.
</agent_discretion>

<required_outputs>
Build the minimum complete verification basis from:
- direct task-linked canonical SDD rules and verification targets;
- task purpose/outcome, anti-goals, constraints, invariants, runtime hard scope;
- mapped feature AC and concrete REQ behavior;
- gates/evidence requirements;
- execution handoff, actual changes, local results, and artifacts.

Cover every task-scoped outcome, mapped AC/REQ item, applicable concrete spec
rule, gate, verification target, and evidence requirement, or record the exact
blocker. Verify observable behavior, non-goals, actual change scope, hard scope,
contract/state/data consistency, and real persistence proof when applicable.

For UI/browser scope, use the smallest reproducible project-native automation,
record runtime/base URL and relevant viewport/device plus redacted artifacts,
and return `NEEDS-CLARIFICATION` when required behavior cannot be credibly
proved.

Write:
- T0/T1 -> `.protocols/<TASK_ID>/run.md`;
- T2/T3 -> `.protocols/<TASK_ID>/verification.md`;
- substantive artifacts -> `.tasks/<TASK_ID>/`.

Use exactly one verdict:
- `VERDICT: PASS`: every required task-scoped check passed with credible
  evidence;
- `VERDICT: FAIL`: observed implementation violates the task-scoped normative
  basis or a required functional check;
- `VERDICT: NEEDS-CLARIFICATION`: input, evidence, scope/tier, canonical
  coverage, or reproducibility is missing, stale, contradictory, or unsafe.

Append the verdict/evidence summary to structurally valid task `verify`. If the
task record is malformed, keep evidence in protocol/artifacts and route repair.
</required_outputs>

<validation>
Before reporting, confirm every required claim is reproducible from recorded
commands/flows/artifacts; no feature-wide requirement was misassigned; actual
scope did not require a higher tier; and no material branch was silently
resolved.

Higher-tier evidence returns `NEEDS-CLARIFICATION`, records original/required
tier and trigger, and routes controlled rebuild/split through
`/prd-to-tasks FT-<NNN>`, then review/doctor/re-execution of the replacement ID.
</validation>

<handoff_contract>
- Scheduler mode -> return verdict/evidence and recommended scheduler action;
  leave lifecycle unchanged.
- Manual T0/T1 PASS -> may set `done` only under the explicit-owner conditions
  in tier policy and after evidence is in task `verify`.
- T2 PASS -> closure-eligible for the explicit owner/scheduler; per-task
  red-verify is optional, while T2 feature completion still requires
  `/red-verify --feature FT-<ID>`.
- T3 PASS -> per-task `/red-verify <TASK_ID>`; it is not closure-eligible yet.
- FAIL or NEEDS-CLARIFICATION -> the named lifecycle/planning/evidence owner.

Do not run `/red-verify`, `/mb-sync`, planning repair, or scheduler transitions
inside this command.
</handoff_contract>
