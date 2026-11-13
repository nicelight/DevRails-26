---
description: Task risk guidance, evidence, boundaries, and lifecycle ownership.
status: active
---
# Tier Policy

Use [Working policy](execute-loop.md#working-policy) for autonomy, consultation,
and optional workflow steps. Tier guides attention; it does not prescribe a
command sequence, testing method, reviewer count, or protocol size.

## Tier Classification and Escalation

- `T0`: safe documentation or formatting.
- `T1`: a contained local behavior or test change.
- `T2`: meaningful domain logic, APIs, data/state, or multiple modules.
- `T3`: security, production, payments, destructive or irreversible effects.

Keep the current task schema and ID/tier/feature/wave consistency. Reassess tier
when actual scope changes. An authorized reassessment can reconcile the card,
ID, index, dependencies, and evidence links in the same workflow; it does not
require a separate planning/review roundtrip. Preserve completed evidence and
unrelated work. Consult the operator when the changed outcome or authority is
not already agreed or delegated.

## Hard Write Boundary

`touched_files` is advisory and non-exhaustive. A non-empty
`runtime_context.write_boundary` is an explicit path limit; its deprecated
`allowed_write_scope` alias is read-compatible. Empty or omitted values add no
path allow-list. `forbidden_scope`, `stop_conditions`, user constraints, and
actual permissions still apply.

Boundary entries are literal project-relative POSIX paths, compared
case-sensitively by path segments. A path allows itself and its subtree; one
trailing slash is ignored. Reject absolute/drive paths, dot segments, empty
segments, backslashes, control characters, leading/trailing segment whitespace,
`*`, and `?`. Brackets and braces are literal. Both sides of a rename must fit.
Workflow bookkeeping writes are governed by their own assignment. A path limit
is not permission for an external side effect. A needed change to an explicit
limit requires authority under Working policy.

## Task Claim And Dependency Ownership

`reqs` identifies governing requirements. Exact AC/spec locators identify the
outcomes assigned to this task; context links do not adopt every statement in
a document. `depends_on` identifies prerequisites whose results are usable at
`done|done_for_prod`. Their proof stays with their owning task. Regression
checks may protect those outcomes without making them new acceptance claims.

For `FT-000`, use Foundation/REQ-000 outcomes instead of product feature ACs.
Keep proof proportional to the agreed outcome and evidenced material risk.

## Task-Scoped Acceptance Evidence

`verification_targets` describes what/how to check; `evidence_required`
describes the expected proof; `verify` records what actually happened. Keep
these distinct. Use exact acceptance links where needed to make ownership
clear. For material non-functional outcomes, retain the accepted criterion,
observed result, decisive conditions, and comparison or explicit limitation.

A requested omission or authorized change to the checking plan is recorded
concisely in existing task state. A skipped check is not a passed check.

## Claim-Linked RED / GREEN For T2/T3

RED/GREEN is useful when it proves a meaningful regression. It is optional
unless the operator or project explicitly requires it. Record real observations
when used; never manufacture RED, rerun unsafe effects to recreate evidence, or
backfill fictional historical proof. Existing behavior that already satisfies
the outcome need not be changed merely to produce a failing test.

## Tier Obligations

All tiers retain a clear outcome, relevant context, actual changes, and honest
verification evidence. T2/T3 usually benefit from direct canonical spec links
and stronger checks; T3 deserves particular attention to harmful effects and
permissions. Neither tier alone requires TDD, a separate verifier, semantic
review, five protocol files, or a doctor/review approval.

The indexed card is the durable task handoff. Keep a concise result and evidence
links in `verify`. Use `.protocols/<TASK_ID>/run.md`, the full protocol, or
`.tasks/<TASK_ID>/` artifacts only when they improve recovery or evidence
readability. Update existing useful protocol state rather than duplicate it.
Missing optional ceremony is not an implementation failure.

## Closure Authority

In manual flow, the top-level agent asked to complete a task owns its execution,
checks, memory updates, and closure unless the user limited the assignment.
An implementation-only or read-only review request retains that narrower scope.
No separate ownership declaration is needed. Any tier may close when the agreed
outcome is achieved and evidence or explicitly accepted verification limitations
are recorded. Do not turn a failed outcome into `done` by waiving a ceremony.

In scheduler flow, `/exe` records task start; the active scheduler owns final
`done|done_for_prod|failed|blocked` decisions and dependent state. Delegated
verifiers return evidence and verdicts; they do not silently close the task.
`/autonomous` owns FT-000 execution; `/autopilot` owns the product queue.

Keep the existing statuses. `done_for_prod` means development is complete and
only recorded production acceptance remains; it is not a production verdict.
Write lifecycle decisions and evidence to the indexed card before relying on
them. Memory synchronization reconciles those decisions rather than making them.
