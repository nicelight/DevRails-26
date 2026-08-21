---
description: Bounded semantic triage and repair routing for one feature.
status: active
---
# /feature-doctor - Feature semantic triage

<objective>
Validate the semantic basis of one feature-related finding set, resolve any
operator-owned decision, and route the minimum contract-correct repair.

This command does not create tasks, implementation plans, tiers, behavior
specs, or canonical SDD design specs.
</objective>

<input_contract>
Require `$ARGUMENTS` with one `FT-<NNN>`. Do not auto-select a feature. If the
ID is absent, ask for it in interactive mode. In unattended flow, halt before
any write with `HALT_CLARIFICATION_REQUIRED` and report:
- reason: `missing required FT-<NNN> argument for /feature-doctor`;
- affected command: `/feature-doctor`;
- owner and next action: the operator supplies the exact feature ID;
- exact resume command: `/feature-doctor FT-<NNN>`.

Use the caller's existing halt handoff; do not create a durable artifact solely
for this missing argument.

Locate exactly one `.memory-bank/features/FT-<NNN>-*.md`; otherwise stop. Inspect
the caller-cited findings or, when none are cited, the target's latest final
task-plan `REJECT`, current blocking task verdicts, and explicit feature
blockers. Ignore superseded findings. Read product, requirements, feature,
relevant canonical design, affected task/plan, and implementation or
verification evidence only as needed to validate the findings and repair
impact.
</input_contract>

<hard_invariants>
- Optional clarification metadata uses only:
  `clarification_status: pending|complete|blocked`,
  `last_clarified: null|YYYY-MM-DD`, and a non-negative cumulative
  `clarification_questions` count.
- Preserve feature design statuses `complete|not_required|blocked`; do not add a
  `stale` status.
- Preserve stable `FT-<NNN>-AC-<NNN>` IDs when accepted behavior is unchanged.
  New or split criteria use the next unused feature-local ID; retired IDs are
  not reused.
- Validate downstream specifications against governing product intent and
  accepted authority. Internally consistent downstream wording does not settle
  a finding when it conflicts with or leaves that intent materially open.
- `/feature-doctor` may determine repair ownership but must not repair linked
  SDD specs, create tasks/plans, change tier, or perform implementation repair.
- Preserve acceptance closure: a material edge/failure outcome retains a
  covering AC or an authoritative out-of-scope disposition with source and
  `/write-prd` change route; a material NFR retains its governing REQ, accepted
  target/qualitative criterion, decisive conditions, and verification method.
- Do not create or change a REQ-level product target locally. Route that change
  through `/write-prd`.
</hard_invariants>

<operator_decisions>
For a material finding, identify only distinct contract-valid options. State
each decision's evidence basis, material consequences, likely affected
artifacts/features, repair/revalidation surface, and canonical owner.

Recommend only among options that preserve accepted product intent and workflow
contracts; prefer the least total canonical, implementation, planning, and
revalidation change after evidenced material risk. Do not invent alternatives
when authority permits one result.

Interactive flow presents viable alternatives and waits only when an operator
decision remains. Unattended flow records the recommended option, basis,
consequences, work surface, exact question, owner, and resume route, then returns
the caller's existing `HALT_CLARIFICATION_REQUIRED` or
`HALT_BLOCKING_QUESTIONS`; it never accepts the recommendation. An existing
authoritative decision may be applied without asking again.
</operator_decisions>

<required_outputs>
Create or update only `.protocols/FT-<NNN>/clarification.md` plus the target
feature doc. Do not create a separate decision log or triage report.

Record each finding, its semantic basis, the option analysis above, remaining
decision, `Design impact: none|feature_design_stale|global_design_stale|blocked`,
`Behavior spec impact: none|refresh_recommended`, and immediate route. Name only
evidenced likely consumers; `/spec-redesign` owns exact affected features and
the `none|bounded|global` verdict.

After every accepted answer:
- append a dated `## Clarifications` entry in the feature;
- apply it to the relevant behavior, actor, data, NFR, edge-case, terminology,
  dependency, or verification section;
- keep every affected acceptance block linked to at least one existing
  governing `REQ-*` through its exact `- REQ: REQ-<NNN>[, ...]` line;
- remove contradictory wording;
- increment `clarification_questions` when a question was asked.

If no feature change is required, record the validated basis and route without
adding clarification text or metadata. If the resolved finding invalidates
linked design, preserve `spec_design_links` as historical routing evidence, set a
misleading `spec_design_status: complete|not_required` to `blocked`, and note
behavior-spec refresh without editing behavior JSON.
</required_outputs>

<agent_discretion>
Choose context order, search tools, analysis depth, question grouping, and the
smallest useful feature/protocol edits. Bound work to the reported finding and
direct consequences; do not perform a feature-wide review or design repair.
</agent_discretion>

<validation>
- `complete`: every finding's semantic basis and repair owner are resolved.
- `pending`: more operator answers are needed.
- `blocked`: a required decision remains unresolved or design impact prevents
  a truthful downstream handoff.

Never retain `spec_design_status: complete|not_required` when an accepted answer
makes linked design incomplete, contradictory, or unverifiable. Before handoff,
confirm changed AC IDs remain unique, feature-matching, REQ-linked, and stable
for unchanged behavior.
</validation>

<handoff_contract>
Route to the command owning the first canonical artifact or execution surface
that must change:
- product target, accepted scope, REQ, or pass/fail decision -> `/write-prd`;
- feature wording, local design reconciliation, task scope/tier/dependencies,
  or planning/proof contract -> `/feature-to-tasks FT-<NNN>`;
- accepted shared/global design or canonical-path change -> `/spec-redesign`;
- confirmed implementation/evidence defect with accepted semantics unchanged
  -> the caller's existing execution, debug, or evidence owner;
- unresolved operator decision -> answer it and rerun `/feature-doctor
  FT-<NNN>`.
</handoff_contract>
