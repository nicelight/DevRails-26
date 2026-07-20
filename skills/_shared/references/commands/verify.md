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

An execute receipt is optional evidence, not required implementation input.
Its absence or ineligibility routes to a rerun or replacement probe, not by
itself to `NEEDS-CLARIFICATION`. Missing tier-required protocol, implementation,
or normative evidence remains a required-input blocker under the rule above.
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
  they are not proof. `/exe` local PASS is input, not automatic PASS.
- An execute receipt is self-attested supporting evidence. It does not prove
  that its declared snapshot preceded the command or that the reported result
  occurred, and it is never an independent observation by `/verify`.
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
  `/feature-to-tasks FT-<NNN>`, shared/global design to `/spec-design`, product
  ambiguity to `/feature-doctor FT-<NNN>`, and missing implementation evidence
  to `/exe <TASK_ID>`.
- Unattended flow returns the blocker and exact route to the scheduler for
  `HALT_CLARIFICATION_REQUIRED` or `HALT_BLOCKING_QUESTIONS`.

No question is needed when authoritative evidence already settles the branch.
</operator_decisions>

<agent_discretion>
Within the task-scoped normative basis, the verifier chooses evidence-reading
order, tools, the smallest credible independent checks, reproducible flows, and
depth proportional to tier and failure risk. It also chooses whether validating
a reuse candidate or safely rerunning/replacing its gate is the cheaper credible
path. Receipt reuse is an optional optimization, not a required verification
phase. Coverage criteria do not prescribe a fixed checklist order or require
irrelevant test categories.
</agent_discretion>

<required_outputs>
Build the minimum complete verification basis from:
- direct task-linked canonical SDD rules and verification targets;
- task purpose/outcome, anti-goals, constraints, invariants, runtime hard scope;
- mapped feature AC and concrete REQ behavior;
- gates/evidence requirements;
- execution handoff, actual changes, local results, and artifacts.

The verifier may ignore reuse candidates and immediately run a safe gate or
replacement probe. Prefer that direct path when the gate is cheap, receipt
eligibility is unclear, or validating the candidate would not be meaningfully
cheaper than rerunning it. Do not inventory or assess every receipt merely
because it exists.

When the verifier elects to reuse a specific current-attempt candidate, assess
that candidate before any probe or evidence write that may change its relevant
inputs. Use the implementation-handoff locator, or the current `run.md` receipt
block for T0/T1, and ignore receipts marked `superseded` or supporting-only by
a later attempt. For each candidate actually considered for reuse:

- require one unambiguous block with `attempt`, `receipt_status`, `claim`,
  `command`, `cwd`, `exit_code`, `input_state_basis`, `completed_at`, and
  `evidence`;
- require a well-known local deterministic gate with an explicitly and
  conservatively bounded command read surface;
- independently inspect current source/diff and recompute the relevant source,
  config, dependency, generated/runtime, and redacted environment/toolchain
  state needed to compare with `input_state_basis`;
- accept elapsed time alone as non-invalidating for deterministic current-state
  evidence, unless an authoritative project/task/spec/gate freshness policy or
  volatile input requires a fresh observation;
- reject reuse for missing/ambiguous fields, state drift, incomplete input
  coverage, implicit/broad read surface, flaky/nondeterministic behavior,
  external state, a command that changed its relevant inputs, observed
  background mutation, or conflicting evidence.

An eligible candidate may satisfy the need to repeat that exact execute gate,
but remains supporting evidence. If a candidate is absent or rejected, rerun
the safe gate or perform a replacement probe. Return
`NEEDS-CLARIFICATION` only when required proof cannot be safely obtained or
reproduced from the available state; do not turn an unusable receipt into an
implementation `FAIL`.

Cover every task-scoped outcome, mapped AC/REQ item, applicable concrete spec
rule, gate, verification target, and evidence requirement, or record the exact
blocker. Verify observable behavior, non-goals, actual change scope, hard scope,
contract/state/data consistency, and real persistence proof when applicable.

Tier-specific independence remains:
- T0/T1 retain the existing compact/manual fast lane and scheduler evidence
  rules from tier policy;
- T2 may reuse eligible supporting or expensive execute gates, but PASS
  requires at least one new verifier-owned outcome-level probe and independent
  grounding for every required task-scoped claim. One probe may cover multiple
  claims only when the report maps it to the complete affected claim set; no
  required claim may rely only on a receipt;
- T3 never permits reuse-only PASS. New verifier-owned functional evidence must
  cover every independently harm-driving claim; one probe is sufficient only
  when it demonstrably covers that full risk-driving set. `/red-verify` remains
  the separate hostile semantic review and is not duplicated here.

For UI/browser scope, use the smallest reproducible project-native automation,
record runtime/base URL and relevant viewport/device plus redacted artifacts,
and return `NEEDS-CLARIFICATION` when required behavior cannot be credibly
proved.

Write:
- T0/T1 -> `.protocols/<TASK_ID>/run.md`;
- T2/T3 -> `.protocols/<TASK_ID>/verification.md`;
- substantive artifacts -> `.tasks/<TASK_ID>/`.

The canonical initialization shape for the required existing T2/T3
`verification.md` is
`.memory-bank/templates/protocols/verification-template.md`. The task copy is
task-owned resume state: update it in place and never recopy the framework
template over it. Command and tier policy rules outrank template placeholders.

Separate the verification evidence into:
- `reused execute evidence`: accepted candidates, supported claims, state and
  freshness basis, and exact receipt locations;
- `repeated checks`: reruns or replacement checks and the concise reason for
  choosing that path; no rejected-candidate inventory is required;
- `new targeted probes`: verifier-owned observations and their claim mapping.

Keep full receipts in their existing protocol/artifact locations. Append only
a concise verdict/evidence summary and links to task `verify`. Raw receipt
output containing a standalone workflow verdict marker is not itself closure
evidence.

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
resolved. Also confirm that no T2 required claim and no T3 independently
harm-driving claim relies only on self-attested execute evidence, and that every
reused candidate is current-attempt, state-matched, bounded-input, and
auditably reported.

Higher-tier evidence returns `NEEDS-CLARIFICATION`, records original/required
tier and trigger, and routes controlled rebuild/split through
`/feature-to-tasks FT-<NNN>`, then review/doctor/re-execution of the replacement ID.
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
