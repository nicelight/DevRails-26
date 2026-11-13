---
description: Optional review of one feature's task plan for coherent and executable outcomes.
status: active
---
# /review-tasks-plan - Task planning review

<objective>
Review one product feature's implementation plan and indexed tasks. Return
`APPROVE|REJECT` with concrete evidence. This focused review does not implement
or silently repair the reviewed plan.
</objective>

<input_contract>
Use the requested `FT-<NNN>`; if absent, infer the most recently planned feature
when unambiguous, otherwise ask. Read its intent/REQ/AC, tasks, relevant
specifications, actual prerequisites, and any prior useful review. FT-000
prerequisites may inform the review without becoming its product target.
Apply `.memory-bank/workflows/execute-loop.md#working-policy`.
</input_contract>

<review>
Assess whether outcomes are meaningful, task boundaries coherent, dependencies
real, acceptance covered, and context/checks sufficient for execution. Task IDs,
fields, and index links retain the current schema. Planned future work need not
pretend its prerequisites are complete. Existing completed evidence is retained.

Follow exact acceptance links where they identify the owner of an outcome.
Distinguish governing requirements, context, planned proof, and actual results.
Do not require duplicate proof from dependents, proof-only task splitting,
unnecessary specs, or empty paperwork. Missing material information matters;
missing optional approval, revision marker, protocol, or co-review does not.

Review accepted architecture and relevant consumer effects when they constrain
the plan. `/architecture-review` and `references/finding-adjudication.md` are
optional help. Reuse unchanged evidence and choose context/delegation as useful;
there is no prescribed reviewer count, model, or fresh-session requirement.

Consult the operator on substantive unresolved choices in manual flow. A caller
with delegated autonomy may resolve them within scope and update the plan.
An obvious repair can return directly to its owner; `/feature-doctor` is useful
for disputed meaning, not a compulsory intermediary.
</review>

<required_outputs>
Return the verdict, material findings with source locations, inspected scope,
and any decision needed. Keep a concise durable review with the feature/plan or
in the existing `.tasks/TASK-MB-REVIEW-TASKS-PLAN/` report when useful for handoff.
If a meaningful Planning Revision exists, recording
`REVIEWED_PLANNING_REVISION: <N>` helps identify the reviewed basis; its absence
or later mismatch calls for impact assessment, not automatic rejection.

`APPROVE` means the reviewed plan is sufficient for its intended use.
`REJECT` identifies a concrete material gap or contradiction. Neither verdict
changes task lifecycle or forces a separate command sequence. Do not reject
work only because the operator chose a simpler process.
</required_outputs>

<handoff_contract>
Recommend execution when ready, a bounded repair when clear, or an operator
question when necessary. Further review is useful only when the changed plan
needs it; approval is not a universal prerequisite for execution.
</handoff_contract>
