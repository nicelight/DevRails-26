---
description: Fresh-context semantic review of one feature's JSON task planning surface before execution or scheduler mode.
status: active
---
# /review-tasks-plan - Task planning review

Installed `agents/review-plan.md` and `agents/review-security.md` are available
for selected co-review assignments; they do not create mandatory fanout.

Apply `.memory-bank/workflows/autonomy-policy.md` for effective settings,
host ownership, decisions, conditional artifacts, and required compact structured
flow feedback. Routes below are semantic handoffs, not instructions to launch
agents or write task lifecycle transitions.

<objective>
Independently decide whether one product feature's runnable planning surface is
safe to hand to execution. Return `APPROVE` or `REJECT` with evidence
and a precise repair owner. This command reviews; it never repairs specs, plans,
task cards, or lifecycle state.
</objective>

<input_contract>
Targets:
- `FT-<NNN>`: review that product feature;
- no argument: infer the latest decomposed product feature.

Latest-feature inference order:
1. most recently modified `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`;
2. most recently modified indexed product task record;
3. highest numeric task ID as a final tie-breaker.

If the target cannot be resolved, stop and ask for `FT-<NNN>`.
`FT-000` is not a review target, although its final gate and dependency effect
must be reviewed when they constrain product tasks.

A full review uses current applicable sources when present:
- Constitution, requirements/RTM, spec backbone/index, task schema, tier policy,
  task index, and Foundation decision when present;
- the acceptance-closure and task-boundary definitions in
  `.memory-bank/workflows/execute-loop.md#principle-no-task-explosion` and
  `#execution-cohesive-task-boundary`, plus
  `.memory-bank/workflows/tier-policy.md#task-claim-and-dependency-ownership`;
- target feature, implementation plan when present, all indexed target task records, and
  their dependency records;
- direct canonical-spec routes and relevant doctor findings. Read full
  architecture sources in the main context only when another review concern or
  the architecture review requires it.

Bind the review to an existing accepted Global Backbone `Planning Revision`.
A disabled design stage does not require a positive revision or its artifacts;
review the available accepted basis instead. A malformed existing revision or
contradictory accepted design is a real integrity gap, not a reason to invent one.

Prior evidence can bound a rerun only when governing inputs (including revision
when present) and the exact repair delta are established. Recheck the delta and
all affected coverage; otherwise assess the current whole feature. A prior
verdict never substitutes for current evidence.

`PLANNING_RECONCILIATION_REQUIRED` in the target feature blocks review and
routes `/feature-to-tasks FT-<NNN>`.

</input_contract>

<hard_invariants>
- The host supplies an independent review context when this review is selected.
- Before each feature verdict, load and apply this installed skill's
  `references/finding-adjudication.md` semantic pack.
- Do not create, edit, close, promote, block, or reconcile reviewed artifacts.
- Task schema, IDs, lifecycle, tier, Foundation, single-card, scope, and status
  ownership remain governed by their canonical sources.
- `touched_files` is advisory; a non-empty `write_boundary` is hard.
- Behavior specs are optional examples, never readiness gates.
- Deterministic doctor findings are evidence, but this semantic review neither
  reruns nor impersonates `/mb-doctor`.
- A bounded execution-cohesion probe is review evidence only. Do not require or
  create a simulation artifact, field, report, status, or replacement queue.
- Rubrics below are coverage criteria, not a mandatory reasoning order or an
  exhaustive limit on reviewer probes.
- A previous report is non-authoritative cache. Retain evidence only when its
  cited coverage and inputs are unchanged; the new verdict covers the current
  whole feature.
- Co-reviewers and architecture consultation are conditional DSH assignments.
  Propose `/architecture-review` only for a material question useful to the
  verdict and permitted by settings. A disabled Architect/reviewer requires no
  fallback impersonation, launch, report or APPROVE. The assigned reviewer still
  assesses its own coverage from available evidence.
</hard_invariants>

<operator_decisions>
Return material unresolved product/design/identity/tier/dependency/proof choices
with their evidence and first owning repair route. `/feature-doctor FT-<NNN>`
can triage unclear semantic ownership; it is not a mandatory intermediate gate.
Check governing product intent even when a downstream spec appears unambiguous.
Schema/index defects go directly to their owner. The caller disposes of REJECT,
repair or consultation through the common decision flow; autonomous decisions
remain explicit and do not change the review's actual verdict.
</operator_decisions>

<agent_discretion>
The reviewer chooses reading order, search tools, working notes, additional
adversarial probes, and verification depth. The four coverage groups may be
explored in any useful order, but applicable groups must be supported before the verdict.
</agent_discretion>

<required_outputs>
Return `VERDICT: APPROVE|REJECT`, evidence, material findings/questions, governing
basis and immediate owner with common structured flow feedback. Separate request
and report files are conditional. When a report is selected, use
`.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-<STAGE_ID>-final-report-docs-01.md`,
with a feature-specific stage such as `S-TASKS-FT-001`.

When a positive backbone revision applies, retain
`REVIEWED_PLANNING_REVISION: <N>` with either verdict. An approval is current only
while governing evidence and revision still match; a disabled review needs no
approval marker. When design was skipped, cite the actual accepted basis rather
than fabricate a revision. Bounded reruns record checked delta and retained
current evidence without an append-only report history.

Include actual enabled architecture/co-review results when provided; omitted
consultations need no marker or separate report. A failed launch is an operation
failure, not a synthetic verdict. The caller retains final review ownership.

Cover:

1. Structural integrity
   - schema validation; unique/resolving index entries; ID/tier/feature/wave
     consistency; product `W1+`; concrete governing REQ links.
2. Coverage and slicing
   - complete feature AC/REQ and eligible exact-claim closure, including ACs
     added during `/feature-to-tasks` when grounded in accepted REQ/spec and
     providing exact task ownership; their origin alone is not a reason to
     `REJECT`; no orphan/duplicate/unrelated outcomes; coherent plans, waves,
     dependencies, change surface, gates, and verification targets;
   - independently derive eligible exact claims and canonical semantic owners
     from accepted sources; planner preview and merge rationale are not review
     proof. Reject proof-only sibling tasks; partition only independent
     implementation/change outcomes. Allow at most one final `Production
     acceptance:` task as defined by the execution boundary. Reject only when a
     material implementation subset can complete separately under accepted
     contracts or has its own grounded implementation boundary.
     Complete AC coverage, shared outcome, owner, tier, one end-to-end path, or
     a complete handoff does not prove execution cohesion. Stop after the
     boundary verdict; do not repeat full implementation planning.
3. Design readiness
   - clarification not explicitly pending/blocked; truthful recorded feature design
     status; no unresolved material design gap; one applicable
     canonical owner per material concern; sufficient boundary meaning and direct
     inputs, with selected proof; relevant AD/boundary/contract links. Accepted
     requirement/code/contract inputs may suffice without a disabled design-stage
     spec. No hub-only T2/T3 guesses or source contradictions.
   - assess actual architecture-review findings when performed; a skipped review
     is not a defect. Cite any material accepted-boundary, ownership, dependency,
     invariant or selected-proof gap affecting this result.
   - where an accepted graph applies, confirm endpoints, contracts, consumer impact, and
     compatibility/rollout basis support the plan. Reject copied topology or an
     interaction execution would have to legalize.
   - reject only when inspected evidence shows that a material semantic choice
     left unresolved in its canonical owning artifact affects the current
     runnable surface and would force execution to choose between behaviorally
     distinct public or cross-boundary outcomes, compatibility or migration
     behavior, authority, or state/data ownership. Do not require enumeration
     of irrelevant concerns or internal tactics that preserve accepted behavior
     and ownership.
4. Execution readiness
   - correct tier; every task status is legal and consistent with its lifecycle
     context and owner; `ready` is valid iff every dependency is `done|done_for_prod` and no
     unresolved blocker or semantic gap remains; actual negative checks retain
     their disposition, not a fake APPROVE;
   - `planned` remains valid for unmet dependencies or future waves;
   - existing `in_progress|blocked|done|done_for_prod|failed` records are reviewed for evidence and
     ownership consistency, never normalized or mutated by this skill;
     actual Foundation dependencies satisfied for runnable work and linked; usable T2/T3
     single-card handoff; hard runtime scope respected; no slice code root was
     mechanically treated as a task hard write boundary.
   - every accepted product AC has one stable feature-matching
     `FT-<NNN>-AC-<NNN>` heading, an existing governing REQ, and at least one
     exact owning-task `source_artifacts` locator. Task-linked ACs must exist in
     that task's feature and agree with its governing `reqs`.
   - where material-NFR proof is selected, new/reconciled `planned|ready` tasks
     at any tier retain governing REQ, exact AC locator, non-empty
     `verification_targets`, and `evidence_required` identifying result,
     decisive conditions, pass/fail comparison, and any selected artifact without repeating
     linked method. Shared probes map every covered AC; expert review names its
     rubric and reviewer role without becoming a T3 checkpoint.
   - where proof is selected, derive each `planned|ready` T2/T3 task proof scope from
     accepted sources and task/dependency ownership before evaluating the card;
     card detail cannot authorize itself. Reject both missing proof and excess
     requirements: inherited dependency proof,
     unrelated locators, speculative risks, safeguards, fixtures, vectors, or
     artifact formats. Confirm the remaining probes are realistic and minimal,
     with distinguishable results, claim-equivalent GREEN, and honest RED caused
     by claim absence rather than setup, syntax, or artificial failure. T3
     probes stay inside authorized isolated/disposable state with safe rerun and
     cleanup. An AC mapping retains its exact ID and RED/GREEN evidence or a
     concrete `RED_NOT_APPLICABLE` reason and alternative proof.
   - when accepted module/slice boundaries apply, confirm each affected task
     card and its direct links make the primary owner/code root, public boundary,
     semantic/write owner, forbidden bypasses, eligible cross-slice orchestration
     owner when relevant, applicable forbidden technical placements, and proof
     path directly discoverable; do not require slices from an accepted
     architecture that uses another primary change unit.

Do not reject historical `in_progress|done|done_for_prod|failed` records solely because they
predate this prospective RED/GREEN planning contract, and never request
fabricated backfill. Apply the material-NFR proof rule prospectively under the
same boundary.

Verdicts:
- `APPROVE`: all applicable coverage groups pass. Non-blocking notes are allowed.
- `REJECT`: at least one blocking gap exists. Name the failed coverage group,
  exact evidence, question when applicable, and repair owner.

For acceptance closure, name the uncovered outcome and use the routing above.

Disabled proof/review/report operations are not missing-evidence defects.
`done` without selected verification is implementation completion, not verified
acceptance. Do not require review APPROVE or doctor reports for disabled stages.
</required_outputs>

<validation>
Before publishing the verdict, establish applicable coverage through current
inspection or valid retained evidence. For each finding, inspect directly
coupled fields and artifacts; report all material gaps in one `REJECT`. Verify
that every claim cites an inspected task, plan, spec, requirement, dependency,
or doctor finding; the subject verdict uses only `APPROVE|REJECT`; its reviewed revision
marker matches the current accepted revision when applicable; and no reviewed
durable state was mutated.
</validation>

<handoff_contract>
`APPROVE` -> prepared queue and next selected readiness/execution operation.
Doctor or pre-mortem occurs only when selected; approval itself does not promote
tasks or create another gate. `REJECT` -> propose the named repair/disposition
through the common decision flow, followed by enabled review of affected claims.
Preserve actual negative evidence if continuation is authorized.
</handoff_contract>
