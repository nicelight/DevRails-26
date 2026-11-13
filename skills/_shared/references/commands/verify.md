---
description: Check one task's agreed outcome and record honest functional evidence.
status: active
---
# /verify - Verify one TASK outcome

<objective>
Assess one indexed task against its agreed outcome and relevant requirements.
Return `VERDICT: PASS|FAIL|NEEDS-CLARIFICATION` with evidence. A verification
request does not authorize implementation or a new product/design decision.
</objective>

<input_contract>
Read the task, relevant acceptance/spec links, actual changes, and available
execution evidence. Apply
`.memory-bank/workflows/execute-loop.md#working-policy` and
`.memory-bank/workflows/tier-policy.md#closure-authority`.
The card and current work matter more than a particular protocol shape.
</input_contract>

<verification>
Choose checks that credibly address the task-owned outcome, constraints,
anti-goals, and material regression risk. Dependency results are prerequisites,
not a reason to re-prove their whole scope. Use direct canonical sources where
they govern the outcome; optional examples do not become acceptance criteria.

Inspect actual evidence rather than equating an executor claim with proof.
Reuse a still-applicable result when its inputs and scope are clear; rerun or
probe when needed. TDD history, a fresh context, extra co-reviewers, and a
separate semantic review are not prerequisites. Independence or specialist
review may help for a consequential uncertain result; choose it proportionately.
The optional `references/finding-adjudication.md`, `agents/review-code.md`, and
`references/web-design-reviewer.md` provide bounded review guidance.

Keep production/external probes within existing permissions and known safe
conditions. Missing authority, an unresolved substantive interpretation, or
inaccessible proof is reported precisely. In manual flow consult the operator;
with delegated autonomy resolve choices within that authority and reconcile
memory. Do not silently expand the accepted outcome.

A skipped check is not a passed check. Judge against the current agreed scope,
including explicit accepted verification limitations. Missing optional
ceremony alone does not fail the implementation. A real observed violation of
the agreed outcome remains a failure even when another check passed.
</verification>

<required_outputs>
Append a concise verdict/evidence summary to task `verify`, linking substantial
artifacts when useful. If the card is malformed, preserve evidence and identify
the needed repair. Update an existing useful protocol rather than require a new
one. Record what was checked, observed results, relevant conditions, and what
remains unverified.

- `VERDICT: PASS`: sufficient evidence supports the agreed task-scoped result.
- `VERDICT: FAIL`: observed behavior violates that result or an applicable check.
- `VERDICT: NEEDS-CLARIFICATION`: unresolved meaning, authority, or evidence
  prevents a credible judgment.

No unperformed observation is evidence, and a PASS is limited to its stated
coverage. Report only material findings and questions relevant to this verdict.
</required_outputs>

<handoff_contract>
Return verdict, evidence, limitations, and the next useful action. A delegated
or read-only verifier leaves lifecycle decisions to its caller. A top-level
manual owner with an end-to-end assignment may close the task under tier policy;
a scheduler owns closure in its run. Further review or repair can occur in the
same authorized flow without a prescribed skill sequence.
</handoff_contract>
