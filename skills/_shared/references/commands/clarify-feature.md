---
description: Optional feature-level clarification for one feature before task decomposition when needed.
status: active
---
# /clarify-feature - Optional feature ambiguity pass

<objective>
Clarify one `.memory-bank/features/FT-*.md` only when that feature explicitly needs local clarification.

This command is optional and manual. It does not create tasks, implementation plans, tiers, aliases, or a canonical workflow gate.
</objective>

<process>

## 0) Input
Expected `$ARGUMENTS`:
- `FT-<NNN>` for one target feature.

If no feature ID is provided:
- interactive mode: ask the user to provide `FT-<NNN>`.
- autonomous mode: halt with `HALT_CLARIFICATION_TARGET_REQUIRED`.

Do not auto-select a feature.

## 1) Locate target feature
Find exactly one matching file:
- `.memory-bank/features/FT-<NNN>-*.md`

If no feature file matches, stop and report the missing target.

Feature clarification metadata is optional. If present, valid values are:

```yaml
clarification_status: pending|complete|blocked
last_clarified: null|YYYY-MM-DD
clarification_questions: 0
```

Missing clarification metadata is not an error.

Feature design metadata is optional and is owned by `/prd-to-tasks`, not by
`/clarify-feature`. If present, treat it as context that may become stale after
accepted clarification answers:

```yaml
spec_design_status: complete|not_required|blocked
spec_design_links:
  - .memory-bank/tech-specs/FT-<NNN>-<slug>.md
```

## 2) Read minimal context
Read only the context needed for this feature:
- `.memory-bank/product.md`
- `.memory-bank/requirements.md`
- `.memory-bank/features/FT-<NNN>-*.md`

Read epics, glossary, invariants, contracts, states, testing docs, runbooks, or other docs only when:
- the feature links to them, or
- they are clearly needed to decide whether ambiguity affects decomposition.

If the feature has `spec_design_status`, `spec_design_links`, or linked SDD
specs, also read:
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- linked specs from `spec_design_links`

Read these design docs only to detect whether clarification answers make the
existing design stale, contradictory, or still usable. Do not perform design
repair inside `/clarify-feature`.

## 3) Artifact
Create or update only:
- `.protocols/FT-<NNN>/clarification.md`

Do not create:
- task records
- implementation plans
- `.protocols/FT-<NNN>/decision-log.md`
- `.protocols/FT-<NNN>/clarification-report.md`
- command aliases
- external spec directories
- SDD specs, behavior specs, or feature implementation plans

## 4) Pass-based interview
Each `/clarify-feature FT-<NNN>` run is one clarification pass.

Rules per pass:
- ask exactly one question at a time
- accept at most 5 answers
- do not reveal queued future questions
- after each accepted answer, update the feature doc
- after each accepted answer, update `.protocols/FT-<NNN>/clarification.md`
- after each accepted answer, recalculate remaining critical ambiguity

Ask only questions whose answers can change:
- acceptance criteria
- task decomposition
- verification targets or evidence
- UX behavior
- data/domain behavior
- API/contracts
- security/compliance
- operations
- future tier assignment by `/prd-to-tasks`

Use the same question format as `/write-prd`: one multiple-choice question with a recommended option, or one short-answer question with a suggested answer.

## 5) Apply accepted answers
After every accepted answer:
1. Add or append to the feature doc:

```md
## Clarifications

### Session YYYY-MM-DD
- Q: ... -> A: ...
```

2. Apply the answer to the relevant feature section:
- behavior -> use cases / acceptance criteria / requirements
- actors -> user stories / use cases
- data -> entities / fields / lifecycle
- NFR -> measurable verification target
- edge case -> failure modes
- terminology -> glossary / normalized wording
- dependency -> constraints / integration notes
- completion -> verification targets

3. Remove contradictory old wording.
4. Keep edits short, testable, and actionable.
5. Update `.protocols/FT-<NNN>/clarification.md` with:
   - question and accepted answer
   - feature sections changed
   - remaining critical ambiguity
   - Design impact: `none|feature_design_stale|global_design_stale|blocked`
   - Behavior spec impact: `none|refresh_recommended`
   - Next design route, when needed: `/prd-to-tasks FT-<NNN>` or `/spec-design`
6. If the accepted answer changes or contradicts linked SDD specs, concrete
   API/data/contract/security/runtime expectations, or existing
   `spec_design_status`, do not repair those specs here. Instead:
   - record the design impact in the clarification protocol
   - if the existing feature design status would now be misleading, update the
     feature frontmatter to `spec_design_status: blocked`
   - preserve existing `spec_design_links`
   - route feature-local spec/task reconciliation to `/prd-to-tasks FT-<NNN>`
   - route shared/global backbone or contract-owner gaps to `/spec-design`
7. If the feature links behavior specs and the accepted answer changes behavior
   described by those examples, record `Behavior spec impact:
   refresh_recommended` in the clarification protocol. Do not create, edit, or
   delete `.memory-bank/behavior-specs/*.behavior.json` from
   `/clarify-feature` unless the user explicitly scoped that maintenance.
8. If clarification metadata exists, update it. If the pass creates new clarification state, add:

```yaml
clarification_status: pending|complete|blocked
last_clarified: YYYY-MM-DD
clarification_questions: <cumulative accepted answer count>
```

## 6) Completion
Set `clarification_status: complete` only when no critical ambiguity remains for task decomposition.

Set `clarification_status: pending` when more questions are needed.

Set `clarification_status: blocked` when a required product decision cannot be resolved in this pass.

If the feature has no unresolved decomposition ambiguity, the command may leave clarification metadata absent and simply report that no feature-level clarification is needed.

Do not set or keep `spec_design_status: complete` when accepted clarification
answers make linked design specs incomplete, contradictory, or unverifiable.
Use the existing `blocked` design status and route feature-local repair to
`/prd-to-tasks` or shared/global repair to `/spec-design`; do not invent a new
`stale` design status.

## 7) Downstream routing
After clarification, do not bypass the normal design/task route: `/spec-design`
must be complete or minimal, required `/foundation-to-tasks` must have run, and
the final `FT-000` foundation gate task must be `done` before `/prd-to-tasks`
creates product feature tasks.

If clarification changed only feature wording and no linked design surface was
invalidated, continue to `/prd-to-tasks FT-<NNN>`, where feature-level SDD
design is completed before task slicing.

If clarification invalidated feature-local `spec_design_links`, run
`/prd-to-tasks FT-<NNN>` to reconcile feature specs, task cards, plans, and
required packets before execution.

If clarification invalidated shared/global backbone, concrete contract
ownership, Architecture Spine, or cross-feature design decisions, route back to
`/spec-design` before `/prd-to-tasks`.
</process>
