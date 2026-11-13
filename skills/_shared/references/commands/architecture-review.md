---
description: Focused read-only review of an accepted architecture and task plan.
status: active
---
# /architecture-review - Feature architecture review

<objective>
Assess the requested feature/change against its accepted architecture,
responsibilities, dependencies, and material invariants. Supply evidence to the
caller without adding an architecture gate or lifecycle.
</objective>

<input_contract>
Read the target feature/plan/tasks and relevant canonical architecture/spec or
code evidence. Apply `.memory-bank/workflows/execute-loop.md#working-policy`.
Load adjacent context only when needed to judge a material concern.
</input_contract>

<review>
Consider purpose, ownership, public boundaries, dependency direction, consumer
impact, and verification where they affect the outcome. Prefer existing local
patterns inside open choices. Do not demand C4 documents, ADRs, a graph, slices,
or a new abstraction merely to complete a checklist.

Accepted requirements and explicit constraints govern the review. Missing
material meaning calls for an operator decision under Working policy; optional
ceremony or an alternative preferred design is not a defect. This assignment
is read-only over implementation and planning artifacts.
</review>

<required_outputs>
Return `verdict: APPROVE|REQUEST_CHANGES|OWNER_DECISION_NEEDED`, material
`findings`, `evidence_checked`, and relevant `risks_or_questions`.
A finding identifies the violated outcome/constraint and concrete impact.
No separate report artifact is required.
</required_outputs>

<handoff_contract>
The caller decides the next action; `/review-tasks-plan`, when used, owns its
own final verdict. Architecture advice alone does not change task state.
</handoff_contract>
