---
description: Optional adaptive clarification of one feature before task decomposition.
status: active
---
# /clarify-feature - Feature ambiguity pass

<objective>
Resolve decomposition-affecting ambiguity in exactly one
`.memory-bank/features/FT-*.md` while preserving existing design routes and
status contracts.

This command is optional and manual. It does not create tasks, implementation
plans, tiers, behavior specs, or canonical SDD design specs.
</objective>

<input_contract>
Require `$ARGUMENTS` with one `FT-<NNN>`. Do not auto-select a feature. If the
ID is absent, ask for it in interactive mode. In unattended flow, halt before
any write with `HALT_CLARIFICATION_REQUIRED` and report:
- reason: `missing required FT-<NNN> argument for /clarify-feature`;
- affected command: `/clarify-feature`;
- owner and next action: the operator supplies the exact feature ID;
- exact resume command: `/clarify-feature FT-<NNN>`.

Use the caller's existing halt handoff; do not create a durable artifact solely
for this missing argument.

Locate exactly one `.memory-bank/features/FT-<NNN>-*.md`; otherwise stop. Read
product, requirements, and the target feature. Read epics, glossary,
invariants, contracts, states, testing docs, runbooks, spec-backbone,
spec-index, and linked `spec_design_links` only when they affect this feature's
ambiguity or design-impact assessment.
</input_contract>

<hard_invariants>
- Optional clarification metadata uses only:
  `clarification_status: pending|complete|blocked`,
  `last_clarified: null|YYYY-MM-DD`, and a non-negative cumulative
  `clarification_questions` count.
- Preserve feature design statuses `complete|not_required|blocked`; do not add a
  `stale` status.
- `/clarify-feature` may detect design impact but must not repair linked SDD
  specs, create tasks/plans, or change tier.
- A recommendation/default is not accepted without an explicit operator answer.
</hard_invariants>

<operator_decisions>
Interview adaptively whenever a real feature-level ambiguity or branch can
change acceptance criteria, use cases/UX, task decomposition, verification,
data/domain behavior, API/contracts, security/compliance, operations, or future
tier routing.

Ask one question or a small group of tightly related questions in the most
useful format. Explain downstream impact and optionally recommend an option.
Do not impose a pass size, fixed questionnaire, or artificial answer-length
limit. If evidence already makes the feature unambiguous, do not interview and
report that no local clarification is needed.

Unanswered material choices remain blockers; do not infer acceptance from
silence. This manual command records the question and waits for the operator.
</operator_decisions>

<required_outputs>
Create or update only `.protocols/FT-<NNN>/clarification.md` plus the target
feature doc. Do not create a separate decision log or clarification report.

After every accepted answer:
- append a dated `## Clarifications` entry in the feature;
- apply it to the relevant behavior, actor, data, NFR, edge-case, terminology,
  dependency, or verification section;
- remove contradictory wording;
- update the clarification protocol with the question/answer, changed sections,
  remaining ambiguity, `Design impact:
  none|feature_design_stale|global_design_stale|blocked`, `Behavior spec impact:
  none|refresh_recommended`, and an immediate repair route when needed;
- increment `clarification_questions` when metadata is present or newly needed.

If an accepted answer invalidates linked design:
- preserve `spec_design_links` as historical routing evidence;
- set misleading `spec_design_status: complete|not_required` to `blocked`;
- route feature-local canonical reconciliation to `/prd-to-tasks FT-<NNN>`;
- route shared/global backbone, Architecture Spine, or competing canonical path
  issues to `/spec-design`;
- note behavior-spec refresh without editing behavior JSON unless explicitly
  scoped by the operator.
</required_outputs>

<agent_discretion>
Choose context order, search tools, analysis depth, question grouping, and the
smallest useful feature/protocol edits. Read only evidence relevant to the
target feature and avoid design repair inside this command.
</agent_discretion>

<validation>
- `complete`: no critical decomposition ambiguity remains.
- `pending`: more operator answers are needed.
- `blocked`: a required decision remains unresolved or design impact prevents
  a truthful downstream handoff.

If no ambiguity exists, clarification metadata may remain absent. Never retain
`spec_design_status: complete|not_required` when accepted answers make linked
design incomplete, contradictory, or unverifiable.
</validation>

<handoff_contract>
- feature wording changed without design invalidation -> `/prd-to-tasks
  FT-<NNN>` after the global backbone and any required Foundation Gate are
  ready;
- feature-local canonical design invalidated -> `/prd-to-tasks FT-<NNN>` for
  reconciliation before task slicing;
- shared/global design or canonical-path conflict -> `/spec-design`;
- unresolved operator decision -> answer it and rerun `/clarify-feature`.
</handoff_contract>
