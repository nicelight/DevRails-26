---
description: Shared guidance for useful canonical design, source authority, and coherent changes.
status: active
---
# SDD Design Contract

## Working policy and authority
Apply `.memory-bank/workflows/execute-loop.md#working-policy` to decisions,
autonomy, process flexibility, and continuation. This reference describes useful
design information; it does not impose a command sequence or approval gate.

Preserve the project flow: understand intent/requirements, establish useful
features/design, prepare tasks, implement/check, and reconcile memory. Reuse
existing results and combine stages when that is sufficient; flexibility does
not mean coding without understanding the intended result or its constraints.

Use explicit operator decisions and project principles, accepted specs/ADRs, and
product requirements to establish the intended result. Runtime observations,
code/configuration, tests, and descriptive docs establish current state. A
current/target difference is a change to reconcile, not automatically a conflict.
Do not let an assumption silently override an explicit requirement or constraint.

Manual work discusses material unsettled product/technical choices. Authorized
autonomous work may decide within its delegated scope. Apply settled decisions
to their canonical owner and affected consumers; no separate owning-command
invocation is needed. Unresolved authority pauses only dependent work.

## Canonical homes
Keep each rule or decision at one useful canonical owner and link its consumers:

- `spec-backbone.md`: design state, relevant concern routing, and Planning Revision;
- `spec-index.md`: `Type | Path | Status | Scope | Change route` registry;
- `architecture/system-architecture.md`: system shape, major units, composition,
  code roots, and relevant Architecture Spine decisions;
- `contracts/boundary-map.md`: detailed module identities, accepted
  `Consumer -> Provider` edges, and exact contract headings;
- subject specs under `architecture/`, `contracts/`, `domains/`, `states/`,
  `testing/`, `runbooks/`, `guides/`, or `adrs/`: the cohesive technical concern;
- features: product behavior, stable ACs, and direct `spec_design_links`;
- `foundation.md`: executable-baseline decision, evidence, and gate-task link;
  the queue and task statuses stay in indexed task records.

Do not create default feature-owned multi-concern spec hubs or duplicate a graph
inside plans/tasks. Reuse or extend a useful existing spec before adding another.
A small design may fit in one document. Split only when the concern, consumers,
or change cadence make the split useful. Empty sections and exhaustive matrices
are not evidence of design completeness.

## Useful coverage
Address concerns that affect the current outcome: ownership and boundaries,
interfaces/payloads, data/storage/state, runtime, security, compatibility, and
verification. An irrelevant concern needs no artifact. A concrete interface or
state rule should be sufficiently clear that implementation does not invent its
public meaning. Keep routine internal tactics flexible.

For accepted capability slices, preserve their public boundaries, write owners,
and orchestration responsibility. A shared database does not itself authorize
cross-module writes. Use the project's natural structure rather than imposing a
pattern, future abstraction, or one-slice-per-feature correspondence.

Reconcile affected dependency edges and contracts when an authorized design
change changes them. An absent graph entry calls for checking and updating
relevant design, not an automatic separate redesign workflow. Do not broaden
this into a repository-wide graph audit.

Use durable `AD-*` rules or ADRs when they preserve a non-obvious accepted decision.
Keep IDs stable and retired decisions identifiable. Routine local conventions
need no ADR or architecture rule. Code roots help discovery; they are not hard
task write boundaries.

An architecture rule's verification describes how to check the rule. Link to
task/evidence owners for current implementation or check readiness and results;
do not turn the rule into an execution log.

## Verification and evidence
Keep simple verification methods in feature ACs/task cards. Create a testing or
runbook spec for genuinely reusable or complex procedures, state preparation,
measurement conditions, or expert rubrics. It must not invent missing product
targets. Link framework-owned testing guidance rather than overwriting it.

Separate what to test (`verification_targets`) from the decisive expected proof
(`evidence_required`) and observed evidence (`verify`). Use actual project-native
checks; a desired but nonexistent test is work, not a runnable gate. TDD, extra
reviews, and detailed protocols are options unless explicitly required by the
operator/project. Preserve honest failed or unrun results.

For meaningful runtime/data risk, document the required starting state, rerun
safety, and cleanup/isolation where useful. For accepted linear Alembic topology,
keep head/ancestry integrity project-wide and change-local migration proof with
the affected feature; do not persist the mutable current head as a fixed target.

## State and consistency
Preserve existing parseable vocabularies when used:

- backbone `complete|minimal|blocked`;
- modes `local_simple_backbone|standard_architecture_scaffold|strict_architecture_scaffold|pending`;
- artifact strategy `single-file|split-core-docs|split-by-boundary-topic|pending`;
- concern rows `authoritative|needed_before_tasks|not_applicable|blocked`;
- feature design `complete|not_required|blocked`.

These describe actual information, not ceremonies completed. `needed_before_tasks`
identifies concrete detail needed by affected work. Planning Revision records
meaningful design change; review/revision equality is not execution permission.

Check changed rules and their consumers for contradictions, useful source links,
correct identity, and actual missing prerequisites. Reconcile related task context
and navigation in the same authorized work. Preserve task IDs/status semantics,
completed evidence, and unrelated user changes. Do not manufacture approval or
verification history to make state look complete.
