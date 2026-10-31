---
description: Produce an advisory technical-debt report for an explicit change surface.
status: active
---
# /tech-debt - Advisory technical-debt report

Apply `.memory-bank/workflows/autonomy-policy.md` for DSH runtime ownership,
effective settings, the required compact structured flow feedback, decisions,
and recovery; subject results remain separate from that feedback.

<objective>
Inspect one explicit change surface and create one evidence-backed Markdown
result of confirmed technical debt. A report is selected by effective settings
or explicit request. The result is advisory and does not change
project implementation or workflow state.
</objective>

<input_contract>
Invocation provides exactly one review intent:

```text
/tech-debt FT-<NNN>
/tech-debt wave <N>
/tech-debt <explicit path, diff, or change scope>
/tech-debt repo-wide
```

Resolve a feature or wave through the relevant indexed task records, durable
evidence, and actual changed files. `touched_files` is advisory and does not
prove the complete change surface.

`repo-wide` is valid only when explicitly requested. Do not widen a feature,
wave, path, diff, or other explicit scope to repository-wide review.
</input_contract>

<hard_invariants>
- When reporting is selected, create one Markdown report under `PAPERCUTS/TECHDEBTS/`.
  Otherwise return the concise result without a file; disabled debt review has no report.
- Never overwrite an existing report. Use a new collision-free filename; add a
  numeric suffix when the preferred filename already exists.
- Do not write or modify any other project file.
- Do not create or change requirements, features, tasks, specs, statuses,
  lifecycle state, blockers, gates, verdicts, resume routes, dashboards,
  registries, scheduler state, or a debt lifecycle.
- Do not launch another skill or agent.
- A report with no material findings is a successful result.
</hard_invariants>

<finding_admission>
Include a finding only when the inspected evidence shows an observable debt
mechanism with material impact on repeated change cost, coupling, regression
risk, reliability, or maintenance burden.

Style preference, function size, coverage percentage, dependency age, or absent
documentation alone is not a finding. Do not invent findings when evidence is
insufficient; record the uncertainty instead.
</finding_admission>

<required_outputs>
The report records:

- the exact checked scope;
- evidence and precise locations;
- confirmed findings, if any;
- practical impact, relative priority, and the smallest remediation direction;
- uncertainty where the evidence does not support a confident conclusion.

If no material debt is confirmed, state that explicitly and leave the findings
section empty.
</required_outputs>

<validation>
Confirm the result names inspected scope and evidence. If a report was created,
confirm it is the only changed file. Recovery reuses a completed report for the
same unchanged boundary instead of duplicating it after a lost session.
</validation>

<handoff_contract>
- Return the result and selected report path with required common feedback.
  Adopting a remediation is a separate owner decision through the common flow.
- The report never blocks, repairs, promotes, or routes workflow state.
</handoff_contract>
