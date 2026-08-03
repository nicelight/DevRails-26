---
description: Produce an advisory technical-debt report for an explicit change surface.
status: active
---
# /tech-debt - Advisory technical-debt report

<objective>
Inspect one explicit change surface and create one evidence-backed Markdown
report of confirmed technical debt. The report is advisory and does not change
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
- Create exactly one new Markdown report under `PAPERCUTS/TECHDEBTS/`.
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
Before handoff, re-read the new report, verify that it names the checked scope
and evidence locations, and confirm that only the report was created or changed.
</validation>

<handoff_contract>
- Successful report -> return the report path and whether material findings
  were confirmed.
- The report never blocks, repairs, promotes, or routes workflow state.
</handoff_contract>
