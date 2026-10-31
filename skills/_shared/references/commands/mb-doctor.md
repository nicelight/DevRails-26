---
description: Report deterministic Memory Bank structure and selected-work evidence gaps.
status: active
---
# /mb-doctor — Memory Bank readiness diagnostics

Apply `.memory-bank/workflows/autonomy-policy.md` for DSH runtime ownership,
effective settings, the required compact structured flow feedback, decisions,
and recovery; subject results remain separate from that feedback.

<objective>
Diagnose structural readiness and retained evidence under the selected work
contract. This read-only check does not make semantic, lifecycle, repair or
permission decisions. Run only when selected/requested; a disabled doctor is
not silently restored as an unconditional scheduler gate.
</objective>

<invocation>
Use the deployed script or its documented wrapper:

```bash
node .memory-bank/scripts/mb-doctor.mjs
node .memory-bank/scripts/mb-doctor.mjs --strict --json
```

Only `--strict`, `--json`, `--help` and `-h` are accepted. Unsupported arguments
produce CLI_INVALID_ARGUMENT before checks; help exits without checks. Default
mode reports incomplete readiness as warnings where applicable and accepts an
empty skeleton; strict mode makes relevant gaps errors and requires a non-empty
queue. JSON preserves `status`, `summary` and `findings`; verdict/exit status is
a diagnostic result, not permission or task lifecycle.
</invocation>

<checks>
The script runs mb-lint and validates indexed records, schema/ID/tier/feature/wave
consistency, REQ/FT/AC links, dependency existence/cycles/readiness, clarification
metadata, accepted task inputs and actual evidence. Skipped operations do not
excuse malformed identity, invalid scope paths, missing dependencies or cycles.
Stable AC identity, governing REQ and exact task coverage remain enforced;
semantic applicability and proof quality belong to the selected subject review.

New Nav cards are identified by the existing task.verify `stage: workflow`
record defined in `.memory-bank/workflows/tier-policy.md#selected-work-and-retained-results`.
Use the latest attempt's recorded selection; pending choices follow tier policy.
Do not reinterpret retained evidence through live settings. Invalid selection
is TASK_WORKFLOW_EVIDENCE_INVALID. Closure needs
actual implementation evidence and results for selected checks, or explicit
skipped values for disabled checks. Missing/mismatched results and unresolved
negative dispositions are TASK_WORKFLOW_RESULT_INCOMPLETE. Only selected
terminal protocol files are due (TASK_SELECTED_PROTOCOL_MISSING); sufficient
inline results require no separate reports.

All verify off permits done without PASS and without a verification report.
Main-off/secondary-on needs exactly the selected participants' own results; no
main fallback. Candidate-only code review does not imply functional PASS. Local execution checks and red-verify are independent selections.
Red alone may return semantic evidence without functional PASS. A retained
negative result needs a scoped continue disposition or explicit repair followed
by successful selected proof; a later skip does not resolve it. These checks
validate the recorded decision, not its semantic adequacy or real permissions.

Disabled design is read from the existing task record and needs no fabricated
backbone, positive revision or full SDD bundle. Concrete accepted task/REQ/feature
inputs, purpose, outcome and scope remain required. Selected proof needs a
planned path; RED/GREEN applies only when local checks are selected. A missing
Foundation document is not a new mandatory artifact for a Nav product queue
without FT-000 work. Existing Foundation anchors remain validated; required
Foundation implementation may use `Foundation Gate Task: not_required` when
its integrated proof gate is not selected. Real dependency identity and closure
are still checked. A named gate cannot disappear merely by changing settings.

Selected feature semantic review uses the matching feature result; disabled
feature review has no required report. Actual negative results are retained
with explicit disposition. Task completion does not imply verified feature/REQ
acceptance when proof was skipped.

Records without the Nav marker retain historical compact/full protocol and
PASS/semantic evidence checks; this compatibility reader is not the contract
for new Nav work. Deprecated terminal allowed_write_scope records retain their
historical gap summary without fabricated backfill. Sync must not append an
invented Nav selection to reclassify old evidence. Existing report shape, finding
codes for unchanged checks, severity rules and CLI behavior remain stable.
</checks>

<handoff_contract>
Return the diagnostic result, material finding paths and their actual owner with
the required common feedback. Mechanical repair may go to garden; meaning,
identity, design or evidence gaps go to the respective owner through the common
decision flow. Missing managed scripts require coherent installer sync. Do not
repair, create reports for disabled work, rewrite historical evidence, or
perform lifecycle transitions from this command.
</handoff_contract>
