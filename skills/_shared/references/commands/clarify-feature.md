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

## 2) Read minimal context
Read only the context needed for this feature:
- `.memory-bank/product.md`
- `.memory-bank/requirements.md`
- `.memory-bank/features/FT-<NNN>-*.md`

Read epics, glossary, invariants, contracts, states, testing docs, runbooks, or other docs only when:
- the feature links to them, or
- they are clearly needed to decide whether ambiguity affects decomposition.

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
5. Update `.protocols/FT-<NNN>/clarification.md`.
6. If clarification metadata exists, update it. If the pass creates new clarification state, add:

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

## 7) Downstream routing
After clarification, do not bypass the normal design/task route: `/spec-design`
must be complete or minimal, required `/foundation-to-tasks` must have run, and
the final `FT-000` foundation gate task must be `done` before `/prd-to-tasks`
creates product feature tasks.
</process>
