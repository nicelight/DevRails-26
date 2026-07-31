---
description: Diagnose one observed task failure in a fresh read-only context and record task-owned supporting evidence.
status: active
---
# /debug - Diagnose one TASK failure

<objective>
Trace one observed failure for a concrete indexed task to its confirmed root
cause and first violated invariant, or report the exact evidence gap. Produce
supporting evidence only; do not implement, verify, or own lifecycle decisions.
</objective>

<input_contract>
Expected `$ARGUMENTS`: one `TASK-NNN-TN-FT-NNN-WN` with an observed failure
bound to the current Execution Attempt and actual change surface.

Read the indexed task card, direct task-linked specs, current-attempt protocol
and handoff, functional/semantic verdict evidence, actual changes, and only the
callers or boundaries needed to trace the failure. Missing reproduction or
evidence is a valid diagnostic input and must remain explicit.
</input_contract>

<hard_invariants>
- Diagnosis is read-only over implementation, tests, specs, task records,
  protocols, scheduler state, and external systems. The only allowed write is
  this command's report under `.tasks/<TASK_ID>/`.
- Do not change status, tier, dependencies, scope, Execution Attempt, retry
  budget, or permissions.
- Do not issue functional/semantic verdicts, accept product/spec/architecture
  decisions, implement a correction, or create BUG/follow-up work.
- A probe may mutate only known local isolated or disposable state with safe
  rerun and cleanup. It grants no production, destructive, privileged, secret,
  or external permission. When safety or initial state is uncertain, do not run
  it and keep the diagnosis inconclusive.
- Keep tracing task-scoped. Neighboring callers and boundaries are evidence,
  not authority to expand the task.
</hard_invariants>

<agent_discretion>
Choose the smallest evidence-producing path. Useful tactics include reproducing
the symptom with exact inputs/environment, reading the complete failure,
tracing `symptom -> immediate cause -> caller/source -> first violated
invariant`, and testing one evidence-backed hypothesis at a time with a
distinguishing experiment. Condition-based waiting is usually preferable for
async or flaky behavior. No fixed phase model, checklist, script, or mandatory
failing test is required.
</agent_discretion>

<required_outputs>
Write exactly:

```text
.tasks/<TASK_ID>/<TASK_ID>-S-DEBUG-final-report-docs-01.md
```

Include:
- symptom and reproduction, or the exact evidence gap;
- current Execution Attempt and actual change surface;
- confirmed root cause plus first violated invariant, or `inconclusive`;
- experiments and only materially useful rejected hypotheses;
- minimum recommended correction;
- suitable regression check;
- residual uncertainty and next owner;
- exactly one standalone marker:

```text
DIAGNOSIS: CONFIRMED|INCONCLUSIVE
```

`CONFIRMED` requires evidence connecting the observed failure to both the root
cause and first violated invariant. This marker is supporting classification,
not a verdict or task status.

If a complete report already binds the same current attempt and unchanged
failure/change surface, reuse it instead of repeating diagnosis. A report for
an older attempt does not satisfy the current-attempt output.
</required_outputs>

<validation>
Before returning, confirm that every causal claim points to observable evidence,
the report names its attempt and change surface, probes stayed within existing
permissions and replay-safety constraints, and no implementation, verdict,
lifecycle, planning, or architecture authority was exercised.
</validation>

<handoff_contract>
Return the report path and classification to the caller. In manual flow,
recommend a separate `/exe <TASK_ID>` only when the report supports a correction
inside the accepted task boundary; otherwise name the existing planning,
clarification, or evidence owner. `/debug` does not invoke the next command.
</handoff_contract>
