---
description: Independent adversarial semantic verification for T3 tasks and T2 feature completion.
status: active
---
# /red-verify - Adversarial semantic verification

<objective>
Challenge a formally passing implementation for substantive correctness. Find
false success, hidden assumptions, cross-boundary harm, semantic drift, unsafe
state/data behavior, operational risk, or unjustified maintenance cost that
ordinary functional `/verify` may miss.

`/verify` owns functional evidence. `/red-verify` owns semantic evidence and one
exact `SEMANTIC_VERDICT: semantic-pass|semantic-concern|semantic-fail`.
</objective>

<input_contract>
Expected `$ARGUMENTS`:
- `TASK-NNN-TN-FT-NNN-WN`: per-task semantic verification;
- `--feature FT-<ID>`: T2 feature-completion semantic verification.

Reject `--feature FT-000`. Foundation closes through normal FT-000 tasks and
the final gate.

Routing from `.memory-bank/workflows/tier-policy.md`:
- per-task mode is required for T3 closure;
- per-task mode is optional evidence for T2 and does not make normal T2 task
  closure stricter;
- feature mode is required after all tasks for a T2 product feature are
  implemented and before that feature is treated complete;
- T0/T1 normally do not use this skill; apparent scope growth routes through
  tier rebuild before semantic verification.

Require indexed task/feature identity, tier policy, task/feature intent and
mapped REQ/AC, successful functional verification evidence, actual diff/change
surface, tests/runtime artifacts, tier-selected protocol, direct task-linked
canonical SDD specs for T2/T3, and only the additional provenance-linked
context needed to assess system impact.

For per-task T2/T3, feature links and `spec-index.md` alone do not replace
direct task links. Missing direct applicable coverage is a blocker, not a basis
for semantic-pass.
</input_contract>

<hard_invariants>
- Use an independent verifier context; do not trust task prose, writer claims,
  or `VERDICT: PASS` as proof of semantic correctness.
- Route only by task tier and canonical tier policy; never use legacy `risk`.
- Scheduler mode: `/red-verify` never closes/fails/blocks/reopens tasks,
  promotes dependents, or writes scheduler status. It returns verdict/evidence
  and a recommended owner action.
- Manual lifecycle or BUG/follow-up mutation is allowed only under explicit
  standalone ownership and canonical tier policy.
- T3 semantic-pass does not replace functional PASS or the exact standalone
  `HUMAN_CHECKPOINT: done` required before closure.
- T2 feature semantic-pass must be recorded in the matching feature document;
  per-task evidence is not a substitute.
- Do not invent a separate failure artifact, status, task schema, or lifecycle.
</hard_invariants>

<operator_decisions>
If the semantic verdict depends on an ambiguous product/spec interpretation,
canonical identity, acceptance meaning, architecture/contract/state/data/
storage/security/compatibility decision, task boundary, tier, dependency, or
verification policy, the verifier does not pick a favorable reading.

- Return `semantic-concern` unless evidence proves a direct semantic break,
  in which case return `semantic-fail`.
- State the exact operator question, competing interpretations, affected
  closure/dependents, and repair owner.
- Interactive flow asks the operator; recommendation/default/silence is not an
  accepted decision. The answer must be durably applied by
  `/clarify-feature`, `/prd-to-tasks`, or `/spec-design`, then functional and
  semantic gates rerun as applicable.
- Unattended flow returns the blocker to the scheduler for
  `HALT_CLARIFICATION_REQUIRED` or `HALT_BLOCKING_QUESTIONS` and names the exact
  resume route.
</operator_decisions>

<agent_discretion>
The verifier independently builds its own hostile model from the actual intent,
change surface, system boundaries, evidence gaps, and risk. It chooses context
loading order, adversarial hypotheses, probes, additional tests, cross-boundary
checks, and depth proportional to tier and blast radius.

The following are examples, not a mandatory or exhaustive checklist/order:
- solving a convenient local interpretation instead of the real outcome;
- passing narrow AC while purpose/success outcome remains false;
- anti-goal, hard-scope, responsibility-boundary, or canonical-spec drift;
- local optimization that harms another feature/module;
- state/data inconsistency, migration/retry/idempotency/failure-mode defects;
- security, secrets, permissions, compliance, destructive/data-loss, payment,
  deploy/runtime, or production hazards;
- passing tests that hide operational or maintenance cost.

The verifier may pursue unexpected hypotheses when evidence justifies them.
</agent_discretion>

<required_outputs>
Per-task mode writes:
- `.protocols/<TASK_ID>/red-verification.md` using the existing template shape;
- `.tasks/<TASK_ID>/<TASK_ID>-S-RED-VERIFY-final-report-docs-01.md`.

Feature mode writes:
- `.tasks/FT-<ID>/FT-<ID>-S-RED-VERIFY-final-report-docs-01.md`;
- a durable `## Semantic Verification` section in the matching feature doc
  with one exact standalone marker and report link.

The report remains concise but records:
- independently generated hostile model and probes;
- top substance/false-success risks and purpose fit;
- anti-goal and semantic/hard-scope assessment;
- hidden assumptions and questions that could change the verdict;
- cross-boundary, architecture, state/data, operational, security when
  relevant, and maintenance impact;
- how the conclusion could still be wrong;
- counterproposal or escalation route;
- exactly one standalone marker:
  `SEMANTIC_VERDICT: semantic-pass|semantic-concern|semantic-fail`.

When blocked or failed, use the existing report's `## Failure / Blocker` shape
with status, where, expected/observed, likely category, next action, and whether
replan is required.
</required_outputs>

<validation>
- `semantic-pass`: no substantive concern survived credible adversarial probes;
  T3 task becomes closure-eligible only when functional PASS and the human
  checkpoint also satisfy tier policy; T2 feature becomes completion-eligible
  only when all feature tasks and required gates are satisfied and the feature
  doc contains the exact marker.
- `semantic-concern`: hidden assumptions or serious risk prevent normal closure;
  affected task/feature/dependents remain pending or blocked by the lifecycle
  owner until an accepted decision/fix and subsequent semantic-pass.
- `semantic-fail`: evidence proves the solution substantively wrong, harmful,
  or too risky; recommend failure and BUG/follow-up handling to the active
  lifecycle owner.

Before reporting, confirm the verdict is supported by inspected evidence, no
unresolved branch was silently resolved, and the skill did not mutate
scheduler-owned state.
</validation>

<handoff_contract>
Return the semantic verdict, evidence paths, and recommended scheduler/explicit
owner action. A lifecycle owner records closure/failure/blocking and any
follow-up task before wave-boundary `/mb-sync`. On ambiguity or design/task gap,
handoff to the named interactive repair route instead of continuing the wave.
</handoff_contract>
