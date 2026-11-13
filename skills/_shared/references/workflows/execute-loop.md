---
description: Shared working policy and the project development flow.
status: active
---
# Execute loop (PRD → Feature → Tasks)

## Working policy

Follow the development flow: understand the intended outcome and requirements,
shape features and the relevant design, prepare tasks, implement and check the
result, then reconcile project memory. Reuse existing answers and combine stages
when useful; a separate command, session, or document is not needed for every
stage. Missing information matters when it prevents the current work, not merely
because a previous ceremony was skipped.

In ordinary interactive work, consult the operator about substantive product,
technical, and process choices that have not been settled. A recommendation or
silence is not a decision. Autopilot, autonomous mode, or an explicit instruction
to act independently authorizes choices within the assigned objective and
constraints. Record consequential choices in the relevant existing artifact.
Do not ask again about an accepted decision; routine execution within it needs
no additional approval.

Commands are focused tools, not exclusive owners of edits or mandatory gates.
An agent carrying out an agreed change may update the affected requirements,
specs, task cards, implementation, and evidence together. Respect an explicitly
bounded or read-only assignment. Consult before expanding the authorized goal
or changing an explicit operator constraint.

Framework reviews, fresh contexts, TDD, doctor runs, and protocol templates are
recommendations. Use them when they help the work; in manual mode discuss
substantive choices about depth or omission, unless already authorized. The
operator may skip a process step in ordinary language, without an exception
record or a new workflow. A missing APPROVE, Planning Revision, or full protocol
is not by itself a reason to stop. Project requirements, actual prerequisites,
explicit permissions, and truthful results still apply.

Keep the canonical Memory Bank and indexed JSON task model coherent. Preserve
existing IDs, schema, dependencies, accepted requirements, and evidence. Link to
existing information rather than copying it into several reports. A task records
its outcome, relevant context, current state, and actual verification results;
additional protocol files are useful only when they help execution or resumption.

Navigation annotations describe a source's purpose; do not copy its current
status, revision, or handoff. Keep state in its owning artifact and existing
registry fields. Specs hold accepted behavior and decisions; task/run records
hold execution progress and results. Report the run's summary to the operator,
without copying it into specs or backbone as per-run history.

For source changes, apply [Module contracts](#module-contracts) to preserve
file-local meaning alongside implementation.

Keep unresolved questions with the concern they belong to. When a question is
resolved, retain the decision at its canonical owner and remove stale open or
deferred markers from the affected documents; preserve relevant history/evidence.

Choose checks that address the requested result and actual risk. Report failed,
skipped, and unavailable checks honestly; a skipped check is not PASS. Stop only
affected work for an unresolved decision outside the granted autonomy, a real
missing prerequisite, unsafe replay, or lack of permission. State what is needed
to continue. Do not turn an optional process recommendation into a blocker.

## Module contracts

Read an existing module header before editing its implementation. For a new or
materially changed source module with non-obvious responsibility, state ownership,
side effects, or invariants, keep a short semantic contract near the file start,
respecting language-required prefixes. Establish its intended meaning before
implementation; update it first when an authorized change alters that meaning.
An unchanged contract needs no rewrite. Adopt this on touched modules, without
backfilling unrelated files or annotating trivial wrappers and generated output.

The header states purpose, owned responsibility/state, relevant observable
guarantees and invariants, and responsibility boundaries or forbidden effects.
Include input/output semantics only where signatures do not convey them. Use
natural language and the project's comment conventions; a `Module contract`
label is sufficient. Omit empty fields, symbol/import inventories, change logs,
and implementation recipes. Section comments are useful only for non-obvious
semantic boundaries; simple functions need no repetitive contracts.

Accepted requirements and specs govern intended behavior; the header captures
their file-local implications and local invariants. Link existing governing
specs where useful rather than copying them or creating a spec just for a header.
Code and tests establish current behavior, not permission to redefine the
contract. Reconcile discrepancies under Working policy; do not weaken a contract
to bless a defect or describe an unimplemented guarantee as verified.

Keep header, implementation, and affected canonical specs coherent in the same
change. Check material guarantees with relevant code/test evidence; header
presence alone proves nothing. Missing markup alone is not a workflow gate.

## Principle: no task explosion

Requirements explain why; feature acceptance describes observable outcomes;
subject specs hold shared technical decisions; task cards carry a bounded
implementation result and its proof. Keep tests and verification with the result
they prove. Split work when outcomes can be completed independently, not by file,
layer, command, or document type. Keep `reqs`, exact AC links in
`source_artifacts`, planned checks in `verification_targets`/`evidence_required`,
and observed results in `verify` distinct.

## Planning Redesign Boundary

Reconcile the affected requirements, canonical specs, feature links, and tasks
when an accepted change makes them stale. `/spec-redesign` is available for
substantial design changes; it is not a mandatory detour for a local update.
Preserve completed evidence and unrelated plans.

Planning Revision and `PLANNING_RECONCILIATION_REQUIRED` help locate changed
planning assumptions. They do not replace checking the actual change or require
reviewing unaffected work. An existing review describes the inputs it examined;
do not represent it as approval of later changes. Clear a reconciliation marker
when its identified inconsistency is resolved, without demanding a separate
review command.

## Fresh Feature Tasking Boundary

Plan a coherent feature at a time when that keeps context manageable. A fresh
context, delegated planner, or independent reviewer is useful for complex work,
but not required. A tasking session may continue into implementation when asked;
its durable cards should let another agent continue without the original chat.

## Execution-Cohesive Task Boundary

A task owns a result that can be completed and checked. A dependency owns its
prerequisite outcome; do not adopt all its proof obligations. Keep product-only
acceptance work separate when it cannot run in development. Preserve the
`Production acceptance:` title prefix used by the current scheduler.

## Interactive mode (you stay)

Use the needed parts of this route, consulting at unresolved substantive choices:

- Clarify intent with `/grill-me`, project principles with `/constitution`, and
  requirements with `/write-prd` when the input does not already settle them.
- Shape features and relevant specs with `/spec-init`, `/prd-to-features`, and
  `/spec-design`; update existing design rather than repeating discovery.
- Use `/foundation-to-tasks` when an executable baseline needs work, then
  `/feature-to-tasks` for the next feature. Plan against the real dependencies.
- Implement with `/exe`; check the result within the same work or use `/verify`
  and `/red-verify` when a separate assessment helps.
- Keep task results and changed project knowledge current; `/mb-sync` helps
  reconcile broader changes. A review or `/mb-doctor` can diagnose uncertainty.

These stages describe useful outcomes, not commands the operator must type in
sequence. Known prerequisites may be reused and small changes may pass through
several stages in one request.

## Autonomous end-to-end mode (start and leave)

`/autonomous` follows the same flow within the granted scope. It prepares the
needed product/design/task information, handles Foundation work when needed,
and uses `/autopilot` for the product queue. It may make substantive decisions
within its authorization; decisions outside it are recorded for the operator.

## Autonomous executor only

Use `/autopilot` when the product task queue already exists. It respects actual
dependencies, preserves a resumable checkpoint, and records each task result.
Missing formal reviews or doctor reports are not admission gates.

## Parallel vs sequential

Sequential execution is the default. Explicit experimental parallel execution
uses the isolation and boundary rules in `autonomy-policy.md`; `touched_files`
is a navigation aid, not proof of independent writes.

## Operator-decision boundary

Apply Working policy to both manual and unattended work. A user answer may be
applied directly to the affected canonical artifacts; no owning-command roundtrip
or repeated approval is required. Unattended work waits only for decisions it
has not been authorized to make, and preserves the question and resume point.
