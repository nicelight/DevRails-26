---
description: Independent adversarial semantic verification for T3 tasks and T2 feature completion.
status: active
---
# /red-verify - Adversarial semantic verification

Apply `.memory-bank/workflows/autonomy-policy.md` for DSH runtime ownership,
effective settings, the required compact structured flow feedback, decisions,
and recovery; subject results remain separate from that feedback.

<objective>
Challenge the available implementation for substantive correctness. Find
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

Reject `--feature FT-000`. Foundation uses normal FT-000 tasks and any selected integrated proof gate.

Load `.memory-bank/workflows/tier-policy.md#tier-obligations` and
`#closure-authority` for permitted modes, required gates, and lifecycle
ownership. Apparent scope growth also loads
`#tier-classification-and-escalation` and routes through tier rebuild before
semantic verification.

Run only when selected/requested. Disabled red-verify is skipped without a
report or semantic verdict. Require indexed identity, accepted task/feature
intent and mapped REQ/AC, actual change surface and available implementation
and runtime evidence. Use concrete direct normative inputs, including accepted
task/REQ/feature meaning when design is disabled; do not invent a full SDD or
protocol bundle. A material input gap remains a concern.

Enabled red-verify may independently inspect implementation when all functional
verification is off. Record absent functional proof explicitly; do not launch
verify, infer PASS, or present semantic-pass as functional acceptance. Existing
functional FAIL remains evidence requiring disposition, not an automatic skip.
</input_contract>

<hard_invariants>
- Before the semantic verdict, load and apply this installed skill's
  `references/finding-adjudication.md` semantic pack.
- Use an independent verifier context; do not trust task prose, writer claims,
  or `VERDICT: PASS` as proof of semantic correctness.
- Route only by task tier and the loaded tier-policy sections; never use legacy
  `risk`.
- Host owns lifecycle in every mode. Return semantic evidence and an owner
  recommendation; do not close/fail/block/reopen, promote, or create follow-ups.
- Semantic-pass never replaces functional PASS. T2 feature evidence belongs to
  the matching feature; per-task evidence does not replace it when selected.
- Do not invent a separate failure artifact, status, task schema, or lifecycle.
</hard_invariants>

<operator_decisions>
Return semantic-concern for a material unresolved interpretation or evidenced
realistic risk requiring a decision; semantic-fail only for a proved material
break of an unambiguous accepted outcome. Name affected claims, evidence and
first owner. Use the common decision flow for product/spec clarification,
repair and continuation. Autonomous policy may decide with its provenance;
missing facts, manual stops and permissions remain constraints. Do not turn
speculative or immaterial candidates into questions.
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
Retain accepted intent, inspected evidence/coverage, admitted material findings,
necessary questions and owner/handoff with exactly one
`SEMANTIC_VERDICT: semantic-pass|semantic-concern|semantic-fail`.
A zero-finding semantic-pass needs no invented risk list or counterproposal.

When reports are selected, use existing per-task
`.protocols/<TASK_ID>/red-verification.md` and/or
`.tasks/<TASK_ID>/<TASK_ID>-S-RED-VERIFY-final-report-docs-01.md`; feature reports
use `.tasks/FT-<ID>/FT-<ID>-S-RED-VERIFY-final-report-docs-01.md`. Initialize a
selected protocol only when absent from
`.memory-bank/templates/protocols/red-verification-template.md`, preserving
existing task-owned state. Reports off retains the concise result in task.verify
or the feature's Semantic Verification section, with evidence and disposition.
No report is required for a disabled operation. Never fabricate missing
functional proof or overwrite actual failure with skipped.
</required_outputs>

<validation>
Semantic-pass requires sufficient inspected coverage without admitted material
failure or unresolved decision. Semantic-concern records the real question;
semantic-fail records the proved accepted-outcome break. Preserve negatives
until explicit repair/continue disposition through the common decision flow;
after changed work, only selected rechecks are due. Confirm evidence supports
the verdict and no lifecycle authority was exercised.
</validation>

<handoff_contract>
Return semantic verdict, evidence and next owner with required common feedback.
Host records closure/disposition and selected boundary work. No automatic repair,
follow-up creation, sync or next command from this leaf.
</handoff_contract>
