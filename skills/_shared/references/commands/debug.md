---
description: Diagnose a concrete task failure and recommend a bounded correction.
status: active
---
# /debug - Diagnose one TASK failure

<objective>
Trace an observed task failure to an evidenced cause, or identify the exact
missing evidence. Diagnosis does not implement a correction or own lifecycle.
</objective>

<input_contract>
Read the selected task, actual failure/change surface, relevant specs, and
current-attempt evidence. Apply
`.memory-bank/workflows/execute-loop.md#working-policy`. Missing reproduction
or history is a valid limitation, not a reason to invent either.
</input_contract>

<diagnosis>
Choose the cheapest distinguishing investigation. Keep probes within existing
permissions and safe local/disposable state. Do not replay an ambiguously
completed unsafe effect. Read adjacent callers or history only when needed to
establish the cause or a realistic recurrence.

This assignment is read-only over implementation, tests, specs, task lifecycle,
and external systems. A diagnostic report is its allowed write. It does not
change scope, retry budget, requirements, or acceptance. A prevention measure
is useful only for an evidenced material recurring mechanism and remains advice.
</diagnosis>

<required_outputs>
Write or reuse the current-scope report at
`.tasks/<TASK_ID>/<TASK_ID>-S-DEBUG-final-report-docs-01.md`.
Keep symptom, reproduction/evidence gap, cause, decisive evidence, minimum
correction, useful regression check, and remaining uncertainty concise.
Identify the current attempt when retries matter. Record recurrence only when
it affects the correction: `repeated_confirmed|no_prior_evidence|unclassified`.
Use `DIAGNOSIS: CONFIRMED|INCONCLUSIVE`; this is not a functional verdict.
</required_outputs>

<handoff_contract>
Return the report and next useful action. A clear correction may go directly to
the authorized executor; pre-mortem, planning help, or another review is optional.
The scheduler/owner retains retry and lifecycle decisions.
</handoff_contract>
