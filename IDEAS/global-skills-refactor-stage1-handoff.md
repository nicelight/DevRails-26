# Global skills refactor — Stage 1 handoff

> **Historical Stage 1 snapshot.** Этот документ сохраняет исходный handoff и
> evidence первого этапа, но не является текущим execution plan. Актуальные
> статусы repair-пакетов и open findings ведутся в
> [`_refactor.md`](_refactor.md).

## Status and scope

Stage 1 is implemented for the Product and Design path only:

- `/brainstorm`
- `/brief`
- `/constitution`
- `/write-prd`
- `/feature-doctor`
- `/discuss`
- `/spec-init`
- `/prd-to-features`
- `/review-feat-plan`
- `/spec-design`
- `/spec-auto`

The refactor removes fixed questionnaires, fixed idea/question counts, mandatory
design-phase order, and repeated full downstream chains. It preserves explicit
workflow boundaries and requires the operator to resolve every material
ambiguity/branch that is not already settled by authoritative evidence.

## Changed files

Canonical command specs:

- `skills/_shared/references/commands/brainstorm.md`
- `skills/_shared/references/commands/brief.md`
- `skills/_shared/references/commands/constitution.md`
- `skills/_shared/references/commands/write-prd.md`
- `skills/_shared/references/commands/feature-doctor.md`
- `skills/_shared/references/commands/discuss.md`
- `skills/_shared/references/commands/spec-init.md`
- `skills/_shared/references/commands/prd-to-features.md`
- `skills/_shared/references/commands/review-feat-plan.md`
- `skills/_shared/references/commands/spec-design.md`
- `skills/_shared/references/commands/spec-auto.md`

Related source/docs/checks:

- `README.md`
- `howItWorks.md`
- `IDEAS/global-skills-refactor-stage1-handoff.md` (this planning-only handoff)

No generated package-local `shared-*` or local runtime output was added to the
source tree.

## Preserved Product/Design contracts

| Skill | Required input / immediate output | Preserved status or blocker | Immediate handoff |
|---|---|---|---|
| `/brainstorm` | raw idea -> indexed `BR-<NNN>.md` | selected directions require explicit acceptance; open questions remain visible | `/brief`, or continue brainstorm if not coherent |
| `/brief` | concept/brainstorm -> `product-brief.md` + analysis index | `Decision: proceed|blocked` | `/constitution`, `/write-prd`, or rerun `/brief` |
| `/constitution` | brief/project evidence -> Constitution | `project_principles: ratified|partial|framework-default|skipped`; unresolved conflict blocks; skip must be explicit | `/write-prd` or rerun `/constitution` |
| `/write-prd` | Product Brief/PRD source + Constitution -> PRD | `clarification_status: complete|pending|blocked`; `constitution_checked: true` only after the current content passes | `/spec-init`, or repair `/write-prd`/`/constitution` |
| `/feature-doctor` | explicit `FT-<NNN>` -> target feature + clarification protocol | clarification `pending|complete|blocked`; design impact `none|feature_design_stale|global_design_stale|blocked`; design status remains `complete|not_required|blocked` | `/feature-to-tasks FT-*`, `/spec-design`, or rerun clarification |
| `/discuss` | bounded ambiguity scope -> existing decision log + owning canonical artifact | unresolved choice keeps the owning existing blocker/status | return to the immediate owning Product/Design skill |
| `/spec-init` | PRD with `type: prd`, `clarification_status: complete`, `constitution_checked: true` -> spec-backbone framing + pure spec-index | `Pre-PRD Spec Status: ready_for_prd|blocked`; created scenario artifact keeps review `draft|reviewed|blocked`; Global Backbone intentionally pending | `/prd-to-features` or PRD/framing repair |
| `/prd-to-features` | complete/checked PRD + ready framing/index -> product/REQ/EP/FT | stable `REQ-*`; epic document status `draft -> active` only after open questions close; feature clarification metadata only for real blockers; `FT-000` reserved | `/review-feat-plan`, `/spec-design`, or `/feature-doctor` |
| `/review-feat-plan` | fresh-context L1-L3 review -> fixed review report | `VERDICT: APPROVE|REJECT`; reviewer does not choose an ambiguous interpretation | `/spec-design` or named repair owner |
| `/spec-design` | PRD/REQ/EP/FT + current canonical specs -> global backbone, canonical routes, Foundation decision | Global Backbone `complete|minimal|blocked`; mode/artifact strategy may remain existing `pending` only while blocked; matrix `authoritative|needed_before_tasks|not_applicable|blocked`; Foundation `required|not_required|blocked` | `/foundation-to-tasks`, `/feature-to-tasks`/`/spec-auto`, or rerun after decision |
| `/spec-auto` | authoritative unattended inputs -> pre-PRD or feature design | same pre-PRD/backbone/feature statuses; unresolved decision uses existing `HALT_BLOCKING_QUESTIONS|HALT_CLARIFICATION_REQUIRED` | `/prd-to-features`, foundation route, `/feature-to-tasks`, or named interactive repair skill |

Successful Product/Design handoff now explicitly requires the durable bundle:

1. clarified PRD;
2. product, requirements, epics, and product features;
3. Global Backbone Status `complete` or valid `minimal`;
4. canonical pure `spec-index`;
5. explicit Foundation Dev Path decision;
6. accepted operator decisions in their existing canonical artifacts.

## Pattern for Stage 2

Continue these rules without creating a new governance or interview registry:

- A material ambiguity/branch that can affect current outcome or downstream
  contract requires an explicit operator answer.
- A recommendation, conservative/reversible default, silence, or continued
  reasoning is not an operator decision.
- Reuse an accepted Constitution/PRD/spec/operator policy without re-asking.
- Unattended flow never chooses for the operator; use the existing blocker or
  terminal halt and name the interactive resume skill.
- Apply accepted decisions to the existing owning canonical artifact and remove
  contradictory superseded wording before revalidation; `/spec-init` also
  mirrors the result into `spec-backbone` before `ready_for_prd`.
- Treat a created `user-scenarios.md` as authoritative for a scenario-sensitive
  decision only with `Review Status: reviewed`. Do not demand decorative review
  when scenarios do not affect the decision.
- Agent discretion covers reading order, tools, working notes, local analysis,
  minimum sufficient depth, and artifact shape inside hard boundaries.
- Rubrics/lenses are coverage criteria, not a mandatory reasoning order.
- Leaf skills state their own outcome and immediate handoff, not the entire
  downstream workflow.
- Preserve exact inputs, outputs, statuses/verdicts, stop conditions, ownership,
  and handoff sufficient for a fresh agent to continue independently.

## Explicitly unchanged contracts

Stage 1 did not change:

- task schema or generated `.memory-bank/schemas/task.schema.json`;
- JSON task generation or task registry/index semantics;
- task IDs, tier policy, task lifecycle, waves, or status ownership;
- Foundation task generation, `REQ-000`/`FT-000`/W0 task rules;
- `/feature-to-tasks`, `/foundation-to-tasks`, `/review-tasks-plan`;
- `/execute-task`, `/verify`, `/red-verify`, or evidence/protocol routing;
- `/autonomous`, `/autopilot`, scheduler ordering/budgets/transitions;
- `/mb-sync` ownership and synchronization behavior.

Agent-run prompt-contract checks do not change runtime mechanics.

## Verification evidence

Passed:

- `npm run check:syntax --silent`
- `git diff --check`
- source-only hygiene: package-local `shared-*` count is `0`
- static Product/Design contract assertions for all 11 skills:
  operator decisions, agent discretion, validation, immediate handoff, no fixed
  idea/question counts, no fixed Phase A/B/C, clarified-PRD markers,
  scenario-review status, and epic document-status promotion
- install-only smoke in a temporary target: all 11 skills generated for both
  `.agents/skills/` and `.claude/skills/`, byte-identical by command
- bootstrap smoke in a temporary target: runtime skills and deployed workflow
  references present; fresh task index empty; no fresh `foundation.md` or
  `FT-000`
- fresh generated target `mb-lint`: PASS
- fresh generated target non-strict `mb-doctor`: PASS with the expected
  `SPEC_BACKBONE_NOT_READY` warning before `/spec-design`

## Remaining risks and Stage 2 starting points

- Static assertions verify prompt contracts, not model behavior. Stage 2 should
  run representative manual/unattended behavioral probes for: unambiguous input,
  interactive ambiguity, accepted-policy reuse, unattended halt, competing
  canonical paths, and Foundation ambiguity.
- Start Stage 2 with an exact contract inventory of the remaining skills before
  slimming them. Likely hotspots from the source brief are `/red-verify`,
  `/feature-to-tasks`, `/foundation-to-tasks`, `/execute-task`, `/review-tasks-plan`,
  `/autonomous`, `/autopilot`, and `/mb-sync`.
- `howItWorks.md` still intentionally describes the current fixed/internal
  behavior of out-of-scope Stage 2 skills (for example `/feature-to-tasks`). Update
  those passages only when their owning skills are refactored.
- Do not weaken mechanical doctor/lint gates merely to match shorter prompts.
- Recheck immediate runtime reference availability after any Stage 2
  deduplication; leaf commands must still fail clearly when a required deployed
  reference is absent.

## Dirty-worktree boundary

Before Stage 1, `AGENTS.md` was already modified by the operator and
`IDEAS/global-skills-refactor.md` was already an untracked operator brief.
Neither was edited or reverted. Future agents must preserve both files and must
not treat local generated `.memory-bank/`, `.agents/`, `.claude/`, `.protocols/`,
`.tasks/`, or `.codex/` directories as canonical source or scratch memory.
