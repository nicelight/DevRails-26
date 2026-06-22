---
description: Turn Product Brief + Constitution + optional context into a clarified PRD.
status: active
---
# /write-prd - Brief + Constitution -> PRD

<objective>
Create or update `.memory-bank/prd.md` from the Product Brief, Constitution, and optional supporting context.

`/write-prd` is the PRD-level clarification loop. It resolves high-impact ambiguity before `/spec-init` builds the SDD route map and `/prd` decomposes the PRD into Memory Bank L1-L3 artifacts.
</objective>

<process>

## 0) Input sources
Read the current PRD source. Accept any one of these as the source input:
- `.memory-bank/analysis/product-brief.md`
- explicit PRD source text or file provided by the user
- existing `prd.md` or `.memory-bank/prd.md` when present and being normalized/clarified

Read as optional context when present and relevant:
- `.memory-bank/constitution.md`
- `.memory-bank/analysis/brainstorming/BR-*.md`
- `.memory-bank/product.md`
- `.memory-bank/requirements.md`
- `.memory-bank/glossary.md`
- `.memory-bank/invariants.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/contracts/*`
- `.memory-bank/states/*`
- `.memory-bank/runbooks/*`
- `.memory-bank/testing/*`
- user-provided context in `$ARGUMENTS`

If no Product Brief, explicit PRD source text/file, or existing `prd.md` / `.memory-bank/prd.md` is available, stop and ask for `/brief` or explicit PRD source text.
If the Constitution is missing, stop and ask for `/constitution` or explicit permission to create the PRD without a Constitution gate.

## 1) Constitution gate
Compare the PRD source and optional context against `.memory-bank/constitution.md`.

If the PRD requires changing the Constitution, add this section to `.memory-bank/prd.md` and stop unless the user explicitly confirms the amendment path:

```md
## Constitution Amendment Candidates

### Candidate 1
- Current principle:
- Conflict:
- Proposed amendment:
- Rationale:
```

Do not weaken, reinterpret, or silently override the Constitution.

## 2) Draft PRD
Create or update `.memory-bank/prd.md` with this frontmatter:

```yaml
---
description: Product Requirements Document.
status: draft
type: prd
clarification_status: pending
constitution_checked: true
---
```

Use this structure unless the repository already has a stronger local PRD template:

```md
# PRD

## Source Inputs

## Product Summary

## Goals

## Non-goals

## Users / Actors

## Functional Requirements

## Non-functional Requirements

## Data / Domain Model

## UX / Interaction Flow

## Integrations / Dependencies

## Edge Cases / Failure Handling

## Acceptance Criteria

## Verification Strategy

## Clarifications

## Unresolved Blockers
```

Ground every material claim in the Product Brief or explicit PRD source, Constitution, optional context, or explicit user answer. Mark unresolved product decisions as `NEEDS CLARIFICATION`.

## 3) Ambiguity coverage scan
Before finalizing, scan the PRD with this taxonomy:
- Functional scope and behavior
- Domain and data model
- UX / interaction flow
- Non-functional quality attributes
- Integrations and external dependencies
- Edge cases and failure handling
- Constraints and tradeoffs
- Terminology consistency
- Acceptance criteria and completion signals
- Placeholder markers (`NEEDS CLARIFICATION`, `TBD`, `TODO`, `???`)

Classify each category internally as Clear, Partial, or Missing. Ask only questions whose answers materially change architecture, data modeling, task decomposition, test design, UX behavior, operations, security, compliance, or acceptance criteria.

## 4) Targeted clarification loop
Use this local clarification format, adapted from GitHub Spec Kit. This wording is only interaction guidance; it does not add hooks, generated files outside the PRD, or an external dependency.
- https://raw.githubusercontent.com/github/spec-kit/main/templates/commands/clarify.md
- https://github.com/github/spec-kit

Rules:
- ask at most 5 high-impact questions per pass
- ask exactly one question at a time
- do not reveal future queued questions
- prefer multiple choice with 2-5 mutually exclusive options
- provide a recommended option with 1-2 sentence rationale
- use a short suggested answer when multiple choice is a bad fit
- accept `yes`, `recommended`, or `suggested` as acceptance of the proposed answer
- validate custom answers are short and unambiguous
- never guess a product decision that is not grounded in evidence

Multiple choice format:

```md
**Recommended:** Option B - <brief rationale>

| Option | Description |
|---|---|
| A | ... |
| B | ... |
| C | ... |
| Short | Custom short answer, max 5 words |

Reply with A/B/C, "recommended", or a short answer.
```

Short answer format:

```md
**Suggested:** <answer> - <brief rationale>

Format: short answer, max 5 words. Reply "suggested" to accept.
```

Stop early when all critical ambiguity is resolved, the user says `done` / `stop` / `proceed`, or 5 accepted answers have been recorded.

## 5) Apply every accepted answer immediately
After each accepted answer:
1. Ensure `.memory-bank/prd.md` contains `## Clarifications`.
2. Add a dated session subsection if needed:

```md
### Session YYYY-MM-DD
- Q: ... -> A: ...
```

3. Apply the answer to the relevant PRD section:
   - Functional ambiguity -> Functional Requirements
   - Actor or journey ambiguity -> Users / Actors or UX / Interaction Flow
   - Data ambiguity -> Data / Domain Model
   - NFR ambiguity -> Non-functional Requirements or Verification Strategy
   - Edge case -> Edge Cases / Failure Handling
   - Terminology conflict -> normalize wording and link glossary when useful
   - Completion ambiguity -> Acceptance Criteria or Verification Strategy
4. Remove contradictory old wording.
5. Re-run the Constitution conflict check for the changed sections.
6. Save `.memory-bank/prd.md`.

## 6) Final PRD frontmatter
Set:
- `clarification_status: complete` when no high-impact ambiguity remains and no `NEEDS CLARIFICATION` markers block decomposition.
- `clarification_status: pending` when non-blocking clarification remains but `/prd` should not run yet.
- `clarification_status: blocked` when unresolved blockers prevent reliable PRD decomposition.
- `constitution_checked: true` only after the Constitution gate has passed for the current PRD content.

Record blockers under `## Unresolved Blockers`. Do not hide unresolved blockers in prose.

## 7) Finish
Report:
- questions asked and answered
- `.memory-bank/prd.md` path
- sections updated
- remaining blockers, if any
- next command: `/spec-init` only when `clarification_status: complete` and `constitution_checked: true`
</process>
