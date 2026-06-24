---
description: Decompose a clarified PRD into Memory Bank product, requirements, epics, and features.
status: active
---
# /prd - Clarified PRD -> Memory Bank

<objective>
Turn an already clarified `.memory-bank/prd.md` into Memory Bank L1-L3 artifacts:
- `.memory-bank/product.md`
- `.memory-bank/requirements.md` with REQ IDs and RTM
- `.memory-bank/epics/EP-*.md`
- `.memory-bank/features/FT-*.md`
- `.memory-bank/testing/index.md`
- `.memory-bank/index.md`

`/prd` does not write the PRD, ask Deep Questioning questions, create TASK records, create implementation plans, run architecture design, or require feature-level clarification.
`/prd` requires the `/spec-init` output: `.memory-bank/spec-backbone.md` with Pre-PRD Spec Status `ready_for_prd`, plus `.memory-bank/spec-index.md` as a pure spec registry/index. It reads decomposition inputs from the backbone and only relevant existing specs routed by the index before deriving L1-L3.
</objective>

<process>

## 0) Required PRD input
Require:
- `.memory-bank/prd.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`

Its frontmatter must include:

```yaml
type: prd
clarification_status: complete
constitution_checked: true
```

If `.memory-bank/prd.md` is missing, stop and tell the user to run `/write-prd`.
If `clarification_status` is `pending` or `blocked`, stop and continue `/write-prd`.
If `constitution_checked` is not `true`, stop and run `/write-prd` or resolve the Constitution gate.
If the PRD contains unresolved `NEEDS CLARIFICATION` blockers in decomposition-relevant sections, stop and run `/write-prd`.

Read `.memory-bank/constitution.md` before writing derived docs. If the PRD conflicts with the Constitution, stop and ask for explicit resolution or `/constitution` amendment.

### Pre-PRD spec framing gate
`.memory-bank/spec-backbone.md` and `.memory-bank/spec-index.md` are required `/spec-init` outputs for `/prd`.

Before writing derived docs:
- read `.memory-bank/spec-backbone.md` first;
- require `## Pre-PRD Spec Status` with `Status: ready_for_prd`;
- stop and run `/spec-init` if `.memory-bank/spec-backbone.md` is missing, stale, placeholder-only, blocked, or does not make decomposition inputs explicit enough;
- read `.memory-bank/spec-index.md` as a pure registry/index, not as a substitute for the specs;
- stop and run `/spec-init` if `.memory-bank/spec-index.md` is missing, stale, placeholder-only, ambiguous, contains broken links, or still contains old non-index sections such as `Feature Design Status Map`, `Global backbone status`, or Backbone Area Matrix;
- use `.memory-bank/spec-backbone.md` decomposition inputs before deriving product/requirements/epics/features: user scenarios, domain model, constraints, non-goals, risks, boundary hints, and lifecycle hints;
- determine relevance from PRD sections, affected product areas, requirements, actors, data/domain model, contracts/APIs, states/lifecycles, security/compliance, runtime/operations, and verification strategy;
- resolve and read only the relevant authoritative spec files routed by `.memory-bank/spec-index.md`;
- do not load every SDD spec by default; leave non-relevant authoritative specs closed unless the index routes them into the current PRD/decomposition scope;
- if a relevant authoritative spec conflicts with the PRD, stop and ask for explicit resolution through a spec or PRD amendment instead of silently overriding either source.
- do not perform architecture design; unresolved global design questions are passed to `/spec-design` after L1-L3 exists.

## 1) Protocol
Создай (если нет):
- `.protocols/PRD-BOOTSTRAP/plan.md`
- `.protocols/PRD-BOOTSTRAP/decision-log.md`

Режимы:
- **interactive**: write derived docs and report the next feature to decompose.
- **autonomous**: write derived docs non-interactively; if the PRD gate fails, set terminal state `HALT_BLOCKING_QUESTIONS`.

## 2) Update product.md
Заполни `.memory-bank/product.md`:
- what this is
- core value
- audience
- primary user flow
- constraints/non-goals

## 3) Requirements and traceability
Обнови `.memory-bank/requirements.md`:
- REQ-001…
- Out of scope
- RTM: REQ → Epic → Feature → Test

## 4) Create epics/
Для каждого эпика:
- `.memory-bank/epics/EP-<NNN>-<slug>.md`
- value, success metrics, acceptance criteria
- optional, if grounded in evidence: `Source artifacts`, `Normative inputs`, `Constraints / invariants`
 - `status: draft` по умолчанию (переводи в active после закрытия Open questions)

## 5) Create features/
Для каждой фичи:
- `.memory-bank/features/FT-<NNN>-<slug>.md`
- use cases
- acceptance criteria
- edge cases & failure modes
- `## Behavior specs` section as optional routing only; `/prd` may mention that
  concrete behavior examples could help later, but must not create
  `.memory-bank/behavior-specs/*.behavior.json`
- test strategy pointers
- optional, if grounded in evidence: `Source artifacts`, `Normative inputs`, `Constraints / invariants`, `Verification targets`
- `status: draft` по умолчанию
- write a `## SDD Design Gate` section into every new feature: run mandatory `/spec-design`, then `/foundation-to-tasks` if required, then `/prd-to-tasks FT-<NNN>`; `/prd-to-tasks` sets `spec_design_status: complete|not_required|blocked` before task slicing, with linked specs in `spec_design_links` when complete, concise rationale when not required, and blocker notes when blocked
- if existing SDD specs apply, add candidate/normative `spec_design_links` or route notes only when grounded in evidence; `/prd` must not set `spec_design_status: complete` before `/spec-design` has produced a global backbone status of `complete` or valid `minimal`
- otherwise omit `spec_design_status`; in the normal `/prd` flow this means omit status or write route notes only, because after the global `/spec-design` gate `/prd-to-tasks FT-<NNN>` or `/spec-auto` owns the feature-level design gate and may establish only `complete`, `not_required`, or `blocked`
- add an SDD Design Gate note that `/spec-design` is the mandatory global gate before foundation gating and feature-level design inside `/prd-to-tasks`; if the feature-set pressure is local/simple, `/spec-design` records a minimal backbone with irrelevant areas `not_applicable`

Do not set every new feature to `clarification_status: pending`.
Only add feature clarification metadata when the PRD explicitly leaves a feature-level decomposition blocker:

```yaml
clarification_status: pending|blocked
last_clarified: null
clarification_questions: 0
```

When a feature is already clear enough for task decomposition, omit clarification metadata.

## 6) Testing index
Обнови `.memory-bank/testing/index.md`:
- quality gates
- unit/integration/e2e
- анти-чит правила

## 7) Index
Обнови `.memory-bank/index.md`:
- добавить аннотированные ссылки

## 8) Feature-plan review gate
For high-risk, large, or autonomous flows, run `/review-feat-plan` with fresh context before `/spec-design`.

For small/manual flows, report review as optional/recommended and do not make it a mandatory stop before `/spec-design`.

## 9) What next
- interactive: run `/spec-design`; if foundation is required, run `/foundation-to-tasks` and close the foundation gate; then choose one feature and run `/prd-to-tasks FT-<NNN>`
- optional: run `/clarify-feature FT-<NNN>` only if that feature is explicitly pending/blocked or has decomposition-affecting unresolved markers
- autonomous end-to-end: запусти `/autonomous`; it will run/require `/review-feat-plan`, `/spec-design --all`, handle `/foundation-to-tasks` when required, then `/spec-auto --all` before `/prd-to-tasks --all` and `/review-tasks-plan`

Do not create TASK records from `/prd`.
</process>
