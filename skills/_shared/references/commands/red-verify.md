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
Zero reportable findings is a normal result of sufficient adversarial coverage.
</objective>

<input_contract>
Expected `$ARGUMENTS`:
- `TASK-NNN-TN-FT-NNN-WN`: per-task semantic verification;
- `--feature FT-<ID>`: T2 feature-completion semantic verification.

Reject `--feature FT-000`. Foundation closes through normal FT-000 tasks and
the final gate.

Load `.memory-bank/workflows/tier-policy.md#tier-obligations` and
`#closure-authority` for permitted modes, required gates, and lifecycle
ownership. Apparent scope growth also loads
`#tier-classification-and-escalation` and routes through tier rebuild before
semantic verification.

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
- Before the semantic verdict, load and apply this installed skill's
  `references/finding-adjudication.md` semantic pack.
- Use an independent verifier context; do not trust task prose, writer claims,
  or `VERDICT: PASS` as proof of semantic correctness.
- Route only by task tier and the loaded tier-policy sections; never use legacy
  `risk`.
- Scheduler mode: `/red-verify` never closes/fails/blocks/reopens tasks,
  promotes dependents, or writes scheduler status. It returns verdict/evidence
  and a recommended owner action.
- Manual lifecycle or BUG/follow-up mutation is allowed only under explicit
  standalone ownership and canonical tier policy.
- T3 semantic-pass does not replace functional PASS.
- T2 feature semantic-pass must be recorded in the matching feature document;
  per-task evidence is not a substitute.
- Do not invent a separate failure artifact, status, task schema, or lifecycle.
</hard_invariants>

<operator_decisions>
If the semantic verdict depends on an ambiguous product/spec interpretation,
canonical identity, acceptance meaning, architecture/contract/state/data/
storage/security/compatibility decision, task boundary, tier, dependency, or
verification policy, the verifier does not pick a favorable reading.

- Return `semantic-concern` when an unresolved operator-owned decision is
  necessary to judge the accepted outcome or a proved realistic material risk.
- Return `semantic-fail` only when evidence proves a material break of an
  unambiguous accepted outcome.
- State the exact operator question, competing interpretations, affected
  closure/dependents, and repair owner.
- Do not manufacture an operator question from a speculative, unreachable, or
  immaterial candidate.
- Interactive flow asks the operator; recommendation/default/silence is not an
  accepted decision. The answer must be durably applied by
  `/feature-doctor`, `/feature-to-tasks`, or `/spec-redesign`, then functional and
  semantic gates rerun as applicable.
- Unattended flow returns the blocker to the scheduler for
  `HALT_CLARIFICATION_REQUIRED` or `HALT_BLOCKING_QUESTIONS` and names the exact
  resume route.
</operator_decisions>

<finding_admission>
Generate and assess hostile hypotheses privately. Do not write hypotheses,
admission notes, rejected candidates, scorecards, or a target finding count to
protocols, reports, task records, specs, or tests.

Before a candidate affects the report or verdict, assess:
- contract authority: identify the accepted task/product outcome or boundary;
  task and direct task-linked accepted canonical specs remain source of truth,
  while authorship alone neither creates nor cancels authority;
- reachability: distinguish supported production/internal, migration,
  concurrency, and accepted operational/recovery paths from coding misuse,
  privileged storage mutation, and theoretical states;
- materiality and realism: identify substantive product, authority, security,
  data, or operational harm and account for likelihood and recoverability by
  retry, restart, rebuild, restore, or maintenance;
- evidence: require the probe to prove the claimed defect, not merely that an
  invalid state can be manufactured;
- remedy authority: cost may reject new hardening outside the accepted contract,
  but never cancels a proved material break of an unambiguous accepted outcome.

Publish only:
- an evidenced material break of an accepted outcome;
- an exact operator question required to judge a proved realistic material risk
  or accepted outcome.

Privately discard every other candidate. Do not publish LOW, nit, optional
improvements, rejected alternatives, or possible future hardening.

Direct DB/filesystem mutation is only setup for a reportable defect when the
state is reachable through a supported application, migration, concurrency, or
accepted operational/recovery path, or the accepted threat model requires
protection from privileged storage tampering. Otherwise it proves no
application defect. A catastrophic security/data-loss candidate requires a
proved realistic escalation path and, when outside the accepted contract, an
operator decision rather than automatic repair.
</finding_admission>

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

The verifier may pursue unexpected hypotheses when evidence justifies them, but
screens contract relevance, reachability, and materiality before spending
disproportionate probe effort. Bound the search by the accepted outcome, actual
change surface, affected boundaries, and the heaviest realistic failure modes.
Stop after sufficient coverage even when no candidate is admitted.

Do not repeat a historical hostile matrix unless it still maps to the current
accepted contract. A verifier-generated probe, review, test, or validator does
not authorize a new requirement or permanent regression. `/red-verify` does not
repeat ordinary `/verify` coverage, but any material supported-path break it
proves remains reportable.

When a running UI, relevant route, browser capability, and safe test state are
already accessible, the verifier may load this installed skill's
`references/web-design-reviewer.md` as an optional lens for the supported path
and affected surface. Otherwise the standard semantic review continues. This
command's existing evidence and verdict contracts govern either path.
</agent_discretion>

<required_outputs>
Per-task mode writes:
- `.protocols/<TASK_ID>/red-verification.md`, initialized only when absent from
  `.memory-bank/templates/protocols/red-verification-template.md`;
- `.tasks/<TASK_ID>/<TASK_ID>-S-RED-VERIFY-final-report-docs-01.md`.

An existing `red-verification.md` is task-owned resume state: update it in
place and never recopy the framework template over it. The template defines
shape, not lifecycle authority. If it is absent when initialization is needed,
stop and request framework bootstrap/sync instead of inventing a shape.

Feature mode writes:
- `.tasks/FT-<ID>/FT-<ID>-S-RED-VERIFY-final-report-docs-01.md`;
- a durable `## Semantic Verification` section in the matching feature doc
  with one exact standalone marker and report link.

The report remains concise and records only:
- accepted intent plus sufficient inspected evidence and adversarial coverage
  to support the verdict;
- admitted material findings with their reachable path and impact, if any;
- exact operator-owned questions required for `semantic-concern`, if any;
- the existing owner action or escalation route;
- exactly one standalone marker:
  `SEMANTIC_VERDICT: semantic-pass|semantic-concern|semantic-fail`.

Do not report private hypotheses, admission reasoning, rejected candidates, or
optional improvements. `semantic-pass` requires no finding, risk list, or
counterproposal.

When blocked or failed, use the existing report's `## Failure / Blocker` shape
with status, where, expected/observed, likely category, next action, and whether
replan is required.
</required_outputs>

<validation>
- `semantic-pass`: sufficient adversarial coverage produced no admitted
  material finding or required operator decision; closure/completion
  eligibility follows the loaded tier-policy sections, applicable human
  checkpoint, and required durable verdict location.
- `semantic-concern`: a proved realistic material risk or accepted-outcome
  ambiguity requires an operator-owned decision before normal closure; affected
  task/feature/dependents remain pending or blocked by the lifecycle owner until
  an accepted decision/fix and subsequent semantic-pass.
- `semantic-fail`: evidence proves a material break of an unambiguous accepted
  outcome; recommend failure and BUG/follow-up handling to the active lifecycle
  owner.

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
