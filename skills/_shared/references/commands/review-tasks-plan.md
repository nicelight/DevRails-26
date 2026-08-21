---
description: Fresh-context semantic review of one feature's JSON task planning surface before execution or scheduler mode.
status: active
---
# /review-tasks-plan - Task planning review

<objective>
Independently decide whether one product feature's runnable planning surface is
safe to hand to execution. Return exactly `APPROVE` or `REJECT` with evidence
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

A full review reads current:
- Constitution, requirements/RTM, spec backbone/index, task schema, tier policy,
  task index, and Foundation decision when present;
- the acceptance-closure and task-boundary definitions in
  `.memory-bank/workflows/execute-loop.md#principle-no-task-explosion` and
  `#execution-cohesive-task-boundary`, plus
  `.memory-bank/workflows/tier-policy.md#task-claim-and-dependency-ownership`;
- target feature, implementation plan, all indexed target task records, and
  their dependency records;
- direct canonical-spec routes and relevant doctor findings. Read full
  architecture sources in the main context only when another review concern or
  the architecture review requires it.

Require Global Backbone `Planning Revision` to be a positive integer. A missing,
zero, or invalid revision is a blocking design-readiness gap owned by
`/spec-design`.

An existing report may bound a rerun only when its Planning Revision matches
and the exact repair delta is established from the caller handoff, an isolated
diff, or direct comparison of cited evidence. Otherwise perform a full review.
On a bounded rerun, recheck the delta and every coverage area it can affect;
unchanged cited evidence may cover the rest of the feature.

`PLANNING_RECONCILIATION_REQUIRED` in the target feature blocks review and
routes `/feature-to-tasks FT-<NNN>`.

</input_contract>

<hard_invariants>
- Use a fresh-context reviewer or separate fresh session.
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
- Establish two co-review focuses on a full review. On a bounded rerun, retain
  each focus only when its target, scope, and governing evidence are unchanged;
  refresh every other focus through the semantic pack.
- Run `/architecture-review` only when current accepted evidence leaves a
  material ownership, dependency, or boundary question that could change the
  verdict. If delegation fails, perform the same architecture review locally.
</hard_invariants>

<operator_decisions>
The reviewer never chooses between competing product, design, canonical-path,
task-boundary, tier, dependency, or verification interpretations. Route every
unresolved feature-related semantic finding to `/feature-doctor FT-<NNN>`, even
when one inspected specification appears to make the defect unambiguous; the
doctor validates that finding's governing basis and repair owner.

Direct repair routing is limited to a mechanically invalid schema/index or an
absent required artifact whose contents are not disputed. Return `REJECT` with
exact evidence, affected tasks/specs, the operator question when known, and the
applicable doctor or direct repair owner. A recommendation is not an accepted
answer.
</operator_decisions>

<agent_discretion>
The reviewer chooses reading order, search tools, working notes, additional
adversarial probes, and verification depth. The four coverage groups may be
explored in any useful order, but all must be addressed before the verdict.
</agent_discretion>

<required_outputs>
Create:
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/REQUEST.md`;
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-<STAGE_ID>-final-report-docs-01.md`.

Use a feature-specific stage ID such as `S-TASKS-FT-001`.

Every feature report records the exact standalone marker
`REVIEWED_PLANNING_REVISION: <N>` for the current Global Backbone Planning
Revision, for both `APPROVE` and `REJECT`. `APPROVE` is valid only while this
value equals the current positive Planning Revision.

On a bounded rerun, replace the report; record the checked delta, finding
dispositions, retained evidence, and each co-review focus as retained or
refreshed. A full review records both selected focuses and their evidence.
Append no review history.

When architecture review is not required, record the exact standalone marker
`ARCHITECTURE_REVIEW: not_required`. Retained prior architecture evidence is
not a current architecture verdict.

When required, give one fresh `Reviewer` the target feature ID, product and
relevant epic paths, implementation plan, task records, and discovered direct
architecture/spec routes. Require it to read
`.memory-bank/roles/reviewer.md` and the installed `/architecture-review` skill,
then include its compact verdict and evidence in the main report. Create no
separate architecture-review artifact.

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
   - clarification not explicitly pending/blocked; truthful feature design
     status; no applicable `needed_before_tasks|blocked` row; one applicable
     canonical path per concrete concern; sufficient shape/rules/errors/
     verification block; relevant AD/boundary/contract links; no hub-only T2/T3
     design; persistence proof where applicable; no source contradictions.
   - integrate any architecture-review verdict and findings; reject a blocking
     accepted-boundary, ownership, dependency, invariant, or proof-path
     finding, and resolve any gap that can change the verdict.
   - confirm registered endpoints, exact contracts, consumer impact, and
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
     context and owner; `ready` is valid iff every dependency is `done` and no
     blocker, review reject, or unresolved semantic gap remains;
   - `planned` remains valid for unmet dependencies or future waves;
   - existing `in_progress|blocked|done|failed` records are reviewed for evidence and
     ownership consistency, never normalized or mutated by this skill;
     Foundation final gate `done` and linked when required; complete T2/T3
     single-card handoff; hard runtime scope respected; no slice code root was
     mechanically treated as a task hard write boundary.
   - every accepted product AC has one stable feature-matching
     `FT-<NNN>-AC-<NNN>` heading, an existing governing REQ, and at least one
     exact owning-task `source_artifacts` locator. Task-linked ACs must exist in
     that task's feature and agree with its governing `reqs`.
   - every newly created or reconciled `planned|ready` task at any tier that
     proves a material NFR has its governing REQ, exact AC locator, non-empty
     `verification_targets`, and `evidence_required` identifying result,
     decisive conditions, pass/fail comparison, and artifact without repeating
     linked method. Shared probes map every covered AC; expert review names its
     rubric and reviewer role without becoming a T3 checkpoint.
   - for each `planned|ready` T2/T3 task, derive the allowed proof scope from
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

Do not reject historical `in_progress|done|failed` records solely because they
predate this prospective RED/GREEN planning contract, and never request
fabricated backfill. Apply the material-NFR proof rule prospectively under the
same boundary.

Verdicts:
- `APPROVE`: all coverage groups pass. Non-blocking notes are allowed.
- `REJECT`: at least one blocking gap exists. Name the failed coverage group,
  exact evidence, question when applicable, and repair owner.

For acceptance closure, name the uncovered outcome and use the routing above.

For `/autopilot` or autonomous scheduler readiness, every task-linked product
feature needs a latest independent `APPROVE`; this is necessary but does not
replace downstream `/mb-doctor --strict`.
</required_outputs>

<validation>
Before publishing the verdict, establish every coverage group through current
inspection or valid retained evidence. For each finding, inspect directly
coupled fields and artifacts; report all material gaps in one `REJECT`. Verify
that every claim cites an inspected task, plan, spec, requirement, dependency,
or doctor finding; the report uses only `APPROVE|REJECT`; its reviewed revision
marker exactly matches the current positive Planning Revision; and no reviewed
durable state was mutated.
</validation>

<handoff_contract>
- `APPROVE` manual route -> conditional `/mb-doctor` when required. Before
  `/exe <TASK_ID>`, recommend optional `/technical-premortem <TASK_ID>` only
  for an executable task with evidenced material cross-surface, migration/data,
  security/trust-boundary, operational, delayed-harm, or limited-reversibility
  exposure; otherwise route `/exe` directly. Approval does not promote tasks,
  normalize status, or add a gate.
- Complete scheduler review coverage -> `/mb-doctor --strict`, then the selected
  scheduler, which retains promotion/status ownership.
- `REJECT` -> the named repair owner, followed by rerun of
  `/review-tasks-plan FT-<NNN>`.
</handoff_contract>
