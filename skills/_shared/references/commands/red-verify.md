---
description: Optional adversarial assessment of a task or feature's substantive correctness.
status: active
---
# /red-verify - Adversarial semantic verification

<objective>
Challenge apparent success for material false assumptions, semantic drift,
unsafe behavior, or cross-boundary harm. Return
`SEMANTIC_VERDICT: semantic-pass|semantic-concern|semantic-fail`.
Zero findings is a valid result of sufficient scoped inspection.
</objective>

<input_contract>
Accept one `TASK-NNN-TN-FT-NNN-WN` or `--feature FT-<ID>`. Foundation uses its
task outcomes rather than product feature acceptance. Read intent, relevant
REQ/AC/specs, actual changes, and functional evidence. Apply
`.memory-bank/workflows/execute-loop.md#working-policy` and tier policy.
A formal functional PASS or particular protocol is not required to examine a
result, but missing evidence limits any semantic verdict.
</input_contract>

<assessment>
Choose a bounded adversarial perspective proportional to actual risk. Look for
reachable material breaks of the agreed outcome; task prose or a green test is
not sufficient proof by itself. Use optional co-review or rendered UI guidance
when it adds evidence. Fresh contexts, model choices, and a hypothesis checklist
are not requirements.

Separate real defects from invented failure states, speculative hardening, and
preferences. A finding needs an applicable accepted outcome/boundary, reachable
path, material impact, and evidence. Direct storage mutation alone proves an
application defect only when that state is in a supported path or threat model.
Do not publish private hypotheses, rejected candidates, or a target finding count.

An unresolved substantive interpretation follows Working policy: consult in
manual flow, decide only within explicitly delegated autonomy. Read-only review
does not authorize repair or silently change product acceptance.
</assessment>

<required_outputs>
Record a concise verdict, inspected coverage, admitted findings/questions,
evidence links, and limitations. For a task, append the summary to `verify` and
use `.protocols/<TASK_ID>/red-verification.md` or `.tasks/<TASK_ID>/` when useful.
For a feature, retain its `## Semantic Verification` summary and optional report.
No separate report is needed merely to duplicate the summary.

- `semantic-pass`: scoped evidence found no material break or unresolved
  decision needed to judge that scope.
- `semantic-concern`: a material question or evidence gap prevents judgment.
- `semantic-fail`: evidence proves a material break of the agreed outcome.

Do not claim unperformed verification. Semantic review does not replace missing
functional proof, and an omitted review is not a semantic-pass.
</required_outputs>

<handoff_contract>
Return evidence and a useful next action. Scheduler or authorized top-level
owner decides closure/failure/blocking; delegated review does not mutate that
state. A real issue can be repaired within the authorized flow without a
mandatory doctor/planning/review roundtrip.
</handoff_contract>
