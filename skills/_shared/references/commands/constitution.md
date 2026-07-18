---
description: Adaptively clarify and maintain the Project Constitution governing layer.
status: active
---
# /constitution - Project Constitution

<objective>
Create or maintain `.memory-bank/constitution.md` as the short, top-level
governing layer for AI-first project work before `/write-prd` when possible.

The Constitution owns durable governing principles, agent autonomy rules,
Definition of Done, human checkpoints, and non-negotiables. It does not replace
the Product Brief, PRD, MBB, specs, contracts, states, testing docs, workflow
policies, or tier policy.
</objective>

<input_contract>
Read relevant evidence from:
- `.memory-bank/constitution.md`;
- `.memory-bank/analysis/product-brief.md` and the latest relevant brainstorm;
- `.memory-bank/mbb/index.md`, `.memory-bank/spec-backbone.md`, and
  `.memory-bank/spec-index.md`;
- `.memory-bank/invariants.md` and applicable contracts/states/testing/workflow
  docs;
- `AGENTS.md` and `$ARGUMENTS`.

If the Constitution is missing, create it from the current framework skeleton.
Its minimum frontmatter remains:

```yaml
description: Project Constitution - governing principles for AI-first development.
status: active
version: 1
project_principles: framework-default
ratified: null
last_updated: YYYY-MM-DD
```

Missing or blocked Product Brief does not prevent a generic governing-principles
discussion, but it must be reported as context quality.
</input_contract>

<hard_invariants>
- Ground project-specific principles only in accepted operator answers,
  explicit instructions, AGENTS.md, or existing authoritative project docs.
- Do not invent domain principles, Spec Kit hooks, command aliases, migration
  machinery, governance engines, or a second tier/status model.
- Do not silently weaken or override existing authoritative rules.
- An explicit operator skip is supported: keep `framework-default` or set
  `skipped`, record the skip, and allow `/write-prd` to continue. Absence of an
  answer is not an explicit skip.
</hard_invariants>

<operator_decisions>
Use an adaptive interview when a governing branch remains unresolved. Cover
only the topics that lack authoritative answers, while ensuring the resulting
Constitution addresses the applicable criteria:
- project level (`enterprise|medium|junior`); for non-enterprise work, an
  explicit `DO NOT Overengineering`-equivalent principle;
- architecture priority such as KISS or stability;
- Definition of Done and required checks;
- agent autonomy and human checkpoints;
- applicable critical non-negotiables such as security/privacy, no data loss,
  backward compatibility, performance, accessibility/UX consistency, low
  maintenance, or an operator-defined rule.

Ask one question or a small group of tightly related questions in the format
best suited to the choice. Explain the impact and optionally recommend an
option. Do not impose a pass count, a fixed questionnaire UI, or an artificial
word limit on substantive answers.

Recommendations and suggested answers become authoritative only after explicit
operator acceptance. In unattended use, apply only decisions already fixed by
authoritative policy; otherwise stop with the active workflow's existing
`HALT_BLOCKING_QUESTIONS` or `HALT_CLARIFICATION_REQUIRED` state.
</operator_decisions>

<required_outputs>
Update the Constitution from accepted evidence and set `project_principles`:
- `ratified`: all applicable governing criteria have accepted answers;
- `partial`: some criteria remain open and the operator explicitly chooses to
  proceed;
- `framework-default`: generated defaults only;
- `skipped`: the operator explicitly skipped the interview.

Record accepted decisions in a compact `## Governance Decisions` or
`## Interview Notes` section when provenance helps future agents. Remove
contradictory superseded wording. Keep concrete domain rules in their existing
canonical invariants/contracts/states/workflow artifacts.
</required_outputs>

<agent_discretion>
Choose the order of evidence review, question grouping, tools, and document
wording. Reuse authoritative answers without re-asking. Keep the Constitution
short and use the minimum interview needed to resolve material governance
branches.
</agent_discretion>

<validation>
Before saving, check consistency with MBB, spec-backbone/spec-index, invariants,
applicable contracts/states/testing/workflow policies, AGENTS.md, and the
`T0|T1|T2|T3` model. If a conflict needs an operator decision, do not choose a
side; record the conflict and keep the dependent handoff blocked.

Report the evidence used, Product Brief state, decisions accepted, resulting
`project_principles`, conflicts fixed or remaining, and any minimal dependent
doc update requiring approval.
</validation>

<handoff_contract>
When governing conflicts are resolved, the immediate next command is
`/write-prd`. When a conflict remains, answer the recorded question and rerun
`/constitution`. An explicit skip also hands off to `/write-prd` with
`framework-default|skipped` principles and a recommendation to revisit this
command later.
</handoff_contract>
