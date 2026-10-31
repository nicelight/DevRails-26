---
description: Implement one selected indexed task and retain actual work and selected local evidence.
status: active
---
# /exe — Implement one task

Apply `.memory-bank/workflows/autonomy-policy.md` for DSH runtime ownership,
effective settings, the required compact structured flow feedback, decisions,
and recovery; subject results remain separate from that feedback.

<objective>
Deliver the selected task's accepted outcome inside its semantic and hard
boundaries. Return implementation evidence and the next owner; the host selects
tasks, prepares the attempt, and writes lifecycle in every mode.
</objective>

<input_contract>
Require one `TASK-NNN-TN-FT-NNN-WN` resolving through
`.memory-bank/tasks/index.json`, its schema-valid task card, and
`.memory-bank/workflows/tier-policy.md`. Use purpose, success_outcome, anti_goals,
REQ/AC, direct normative inputs, constraints, invariants, dependencies,
runtime_context, actual changes, and retained evidence relevant to this outcome.
T2/T3 require concrete direct canonical inputs sufficient for the selected work;
accepted task/REQ/feature meaning may supply them when design is disabled.
Registry-only links or invented specs are not a substitute for actual meaning.

Confirm ID/tier/feature/wave consistency, valid gates and evidence fields, and
that dependencies exist and are `done|done_for_prod`. Dependency outcomes are
prerequisites; their proof remains with their owning tasks. Confirm an observable
outcome, selected proof path, scope and tier, and no unresolved applicable
blocker. An existing `PLANNING_RECONCILIATION_REQUIRED` remains a planning gap.
When global design/review is selected, apply its recorded freshness/revision
contract; disabled design/review requires neither a positive Planning Revision
nor fabricated APPROVE or full design bundle.

The host supplies a runnable selected task and durable attempt before probes,
implementation, or effects. `in_progress` means resume the actual attempt;
`done_for_prod` permits only the recorded production-acceptance remainder under
actual permissions. Do not execute a missing, malformed, blocked, failed, or
already done task. Completed implementation returns its retained handoff without
replay. Ambiguous possibly completed unsafe effects require reconciliation.
</input_contract>

<hard_invariants>
- Task identity/tier is not rewritten in place. Escalation proposes controlled
  rebuild/split through `/feature-to-tasks`, preserving partial work and evidence.
- `touched_files` is advisory; non-empty `runtime_context.write_boundary`, its
  deprecated read alias, forbidden_scope, and stop_conditions are hard under
  tier policy. Needed widening or an accidental violation stops affected work.
- Applicable accepted architecture keeps state changes and orchestration with
  their owners, public boundaries and source of truth intact. For registered
  inter-module changes use accepted `Consumer -> Provider` contracts; an absent
  edge grants no authority. Inspect affected consumers until compatibility stops
  propagation. Do not invent graph edges during implementation.
- Resolve source placement, reuse, tooling, imports/exports, routing and build
  identity before creating/moving/renaming source. Preserve applicable local
  naming and `AGENTS.md#source-path-semantics`; no opportunistic renames.
- Under an accepted linear Alembic topology, resolve a head only transiently
  for the new down_revision; preserve historical tests and the graph contract.
- Preserve unrelated changes and task-owned evidence. No generated package-local
  shared-* edits. Selecting a task grants no production, destructive, privileged,
  secret-reading, or external permission.
- Models do not write task lifecycle or promote dependents. Implementation,
  local checks, functional verification, and semantic review are distinct work.
</hard_invariants>

<execution_evidence>
Local execution checks, including T2/T3 RED/GREEN, have their own effective
setting, enabled by default and independently disableable from `/verify` and
`/red-verify`. When off, record absence without running a hidden proof gate or
claiming GREEN/PASS. Explicit project non-negotiables still require owner
resolution if incompatible with that setting.

When selected, perform task-relevant gates and the cheapest sufficient local
checks. Do not fill test categories. Apply tier-policy claim-linked RED/GREEN
only to task-owned claims: initial genuine claim absence before production
change, then equivalent GREEN; preserve pre-implementation GREEN without an
artificial break. Setup/syntax/unrelated failure is not RED. An accepted
not-applicable reason names the alternative proof and unsafe conditions.
Retries retain original RED and the correction basis, then fresh equivalent
GREEN for corrected claims; never fabricate historical RED. T3 harmful probes
need authorized isolated/disposable state, safe rerun and cleanup.

Retain actual changed files (including none), partial effects, hard-scope
compliance, task-owned claim mapping, commands/results, selected/skipped checks,
remaining work, and immediate handoff in the existing task/protocol/evidence
surfaces. Material NFR evidence states the observed result, conditions and
comparison with its accepted target; expert evidence states criterion and
reviewer type. Local results support, but do not constitute, independent PASS.

Reports and protocol files are conditional. Use selected shapes from
`.memory-bank/templates/protocols/`; initialize only absent selected files and
never replace task-owned state. Compact run or context/progress/handoff may
hold the necessary recovery facts without a compulsory five-file bundle.
Create `.tasks/<TASK_ID>/` only for substantive artifacts actually produced.

Optional reuse candidates remain self-attested supporting evidence. Offer only
a known local deterministic gate with a conservatively bounded read surface,
unchanged relevant inputs, and no external/flaky/background-dependent state.
A receipt records attempt, receipt_status (`current|superseded|supporting-only`),
claim, exact redacted command, cwd, exit_code, input_state_basis captured before
the command, completed_at, and evidence (artifact checksum when available).
Source basis covers relevant tracked/untracked/deleted, config/dependency,
generated/runtime and redacted toolchain/environment inputs. Elapsed time or
advisory touched_files never proves input coverage. Complete the receipt after
the command and link it from the handoff. Retain older receipts as superseded
or supporting-only. `/add-tests` evidence is supporting-only; only a later
executor-owned final gate may be offered for reuse. Raw output cannot introduce
standalone workflow verdict markers.
</execution_evidence>

<decisions_and_handoff>
Ordinary local tactics stay with the implementer. Material product, scope,
contract, tier or verification choices use the common decision flow: product
meaning to `/write-prd` or bounded `/feature-doctor` triage, feature/task repair
to `/feature-to-tasks`, shared canonical changes to `/spec-redesign`, unclear
failure cause optionally to `/debug`. Report affected work and the first owner;
do not launch the repair from this leaf.

Return completed/partial implementation, actual evidence, skipped local checks,
blockers and next selected verification or closure recommendation. All verify
off permits host closure without PASS; enabled red-verify may independently
follow implementation. Actual negative evidence remains negative and needs
explicit repair/continue disposition. Do not invoke verification, sync, or
promotion here. Recovery must reuse completed implementation and selected
results, including skipped operations, without replaying effects.
</decisions_and_handoff>
