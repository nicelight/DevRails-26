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
- no argument: infer the latest decomposed product feature;
- `--all`: run the same independent review separately for every indexed product
  feature, excluding `FT-000`.

Latest-feature inference order:
1. most recently modified `.memory-bank/tasks/plans/IMPL-FT-<NNN>.md`;
2. most recently modified indexed product task record;
3. highest numeric task ID as a final tie-breaker.

If the target cannot be resolved, stop and ask for `FT-<NNN>` or `--all`.
`FT-000` is not a review target, although its final gate and dependency effect
must be reviewed when they constrain product tasks.

Read current:
- Constitution, requirements/RTM, spec backbone/index, task schema, tier policy,
  task index, and Foundation decision when present;
- target feature, implementation plan, all indexed target task records, and
  their dependency records;
- direct canonical-spec routes and relevant doctor findings. Read full
  architecture sources in the main context only when another review concern or
  the architecture review requires it.

Require Global Backbone `Planning Revision` to be a positive integer. A missing,
zero, or invalid revision is a blocking design-readiness gap owned by
`/spec-design`.

For `--all`, repeat this bounded feature-scoped input set; do not collapse the
queue into one broad reviewer prompt.
</input_contract>

<hard_invariants>
- Use a fresh-context reviewer or separate fresh session.
- Do not create, edit, close, promote, block, or reconcile reviewed artifacts.
- Task schema, IDs, lifecycle, tier, Foundation, single-card, scope, and status
  ownership remain governed by their canonical sources.
- `touched_files` is advisory; a non-empty `write_boundary` is hard.
- Behavior specs are optional examples, never readiness gates.
- Deterministic doctor findings are evidence, but this semantic review neither
  reruns nor impersonates `/mb-doctor`.
- A bounded execution-path probe is review evidence only. Do not require or
  create a simulation artifact, field, report, status, or replacement queue.
- Rubrics below are coverage criteria, not a mandatory reasoning order or an
  exhaustive limit on reviewer probes.
- Obtain one bounded architecture review per reviewed feature from a fresh
  Reviewer using the installed `/architecture-review` skill. If fresh
  delegation is unavailable or fails, perform the same review locally.
</hard_invariants>

<operator_decisions>
The reviewer never chooses between ambiguous product, design, canonical-path,
task-boundary, tier, dependency, or verification interpretations.

If such a branch could change the verdict:
- return `REJECT` with the exact operator question, affected tasks/specs, and
  repair owner;
- route feature-level product/design/tasking repair to
  `/feature-to-tasks FT-<NNN>` or `/feature-doctor FT-<NNN>`;
- route shared/global design or competing canonical identity to `/spec-design`;
- do not treat a recommendation as an accepted answer.

The accepted answer is applied by the owning skill to the existing canonical
artifact and re-reviewed. No question is needed when authoritative evidence
already resolves the branch.
</operator_decisions>

<agent_discretion>
The reviewer chooses reading order, search tools, working notes, additional
adversarial probes, verification depth, and when enough context exists to
launch the architecture Reviewer. The four coverage groups may be explored in
any useful order, but all must be addressed before the verdict.
</agent_discretion>

<required_outputs>
Create:
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/REQUEST.md`;
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-<STAGE_ID>-final-report-docs-01.md`.

Use a feature-specific stage ID such as `S-TASKS-FT-001`. For `--all`, keep one
independent report and verdict per feature; an optional summary must not replace
them.

Every feature report records the exact standalone marker
`REVIEWED_PLANNING_REVISION: <N>` for the current Global Backbone Planning
Revision, for both `APPROVE` and `REJECT`. `APPROVE` is valid only while this
value equals the current positive Planning Revision.

When delegation is available, give one fresh `Reviewer` the target feature ID,
product and relevant epic paths, implementation plan, task records, and
discovered direct architecture/spec routes. Require it to read
`.memory-bank/roles/reviewer.md` and the installed `/architecture-review` skill,
then return its compact Reviewer report. If delegation is unavailable or fails,
perform the same review locally. Include the resulting verdict and evidence in
the main report; do not create a separate architecture-review artifact. For
`--all`, repeat this once per feature. Avoid rereading the same full architecture
sources unless needed to resolve a gap, conflict, or another coverage group.

Cover:

1. Structural integrity
   - schema validation; unique/resolving index entries; ID/tier/feature/wave
     consistency; product `W1+`; concrete governing REQ links.
2. Coverage and slicing
   - complete feature AC/REQ coverage; no orphan/duplicate/unrelated outcomes;
     cohesive independently verifiable slicing; coherent plans, waves,
     dependencies, change surface, gates, and verification targets;
   - follow one plausible evidence-backed path only far enough to detect a
     missing independent prerequisite/outcome, rollout/rollback unit, blocking
     dependency, materially different risk route, or plan-level decision that
     execution would otherwise have to invent. Stop after the boundary verdict;
     do not repeat full implementation planning.
3. Design readiness
   - clarification not explicitly pending/blocked; truthful feature design
     status; no applicable `needed_before_tasks|blocked` row; one applicable
     canonical path per concrete concern; sufficient shape/rules/errors/
     verification block; relevant AD/boundary/contract links; no hub-only T2/T3
     design; persistence proof where applicable; no source contradictions.
   - integrate the architecture verdict and findings; reject a blocking accepted-boundary,
     ownership, dependency, invariant, or proof-path finding, and resolve any
     gap that can change the verdict.
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
   - when accepted module/slice boundaries apply, confirm each affected task
     card and its direct links make the primary owner/code root, public boundary,
     semantic/write owner, forbidden bypasses, eligible cross-slice orchestration
     owner when relevant, applicable forbidden technical placements, and proof
     path directly discoverable; do not require slices from an accepted
     architecture that uses another primary change unit.

Verdicts:
- `APPROVE`: all coverage groups pass. Non-blocking notes are allowed.
- `REJECT`: at least one blocking gap exists. Name the failed coverage group,
  exact evidence, question when applicable, and repair owner.

For `/autopilot` or autonomous scheduler readiness, every task-linked product
feature needs a latest independent `APPROVE`; this is necessary but does not
replace downstream `/mb-doctor --strict`.
</required_outputs>

<validation>
Before publishing the verdict, verify that every claim cites an inspected task,
plan, spec, requirement, dependency, or doctor finding; the report uses only
`APPROVE|REJECT`; its reviewed revision marker exactly matches the current
positive Planning Revision; and no reviewed durable state was mutated.
</validation>

<handoff_contract>
- `APPROVE` manual route -> conditional `/mb-doctor` when required, then
  `/exe TASK-...` only for a task whose lifecycle context is currently
  executable; approval does not promote `planned` tasks or normalize status.
- Complete scheduler review coverage -> `/mb-doctor --strict`, then the selected
  scheduler, which retains promotion/status ownership.
- `REJECT` -> the named repair owner, followed by rerun of
  `/review-tasks-plan FT-<NNN>`.
</handoff_contract>
