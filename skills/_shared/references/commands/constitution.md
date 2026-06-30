---
description: Run a contextual interview and maintain the Project Constitution governing layer.
status: active
---
# /constitution — Project Constitution

<objective>
Create or maintain `.memory-bank/constitution.md` as the short, top-level governing layer for AI-first project work.

The Constitution captures project governing principles, agent autonomy rules, and non-negotiables before `/write-prd` when possible. It does not replace Product Brief, PRD, `mbb/index.md`, `spec-backbone.md`, `spec-index.md`, `invariants.md`, contracts, states, testing docs, workflow policies, or the tier policy.
</objective>

<process>

## 0) Scope and route
Use `/constitution` in the normal manual greenfield flow after `/brainstorm`/`/brief` or existing PRD context and before `/write-prd`:

```text
/brainstorm -> /brief -> /constitution -> /write-prd -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /mb-doctor --strict and execute/verify FT-000 until its gate is done when foundation tasks were created -> /prd-to-tasks FT-<NNN> -> /review-tasks-plan FT-<NNN> -> conditional /mb-doctor -> tier-routed /execute TASK
```

If the user explicitly skips this step, do not block the flow. Leave the Constitution at `project_principles: framework-default` or set `project_principles: skipped`, record the skip in output, and recommend revisiting `/constitution` later.

Do not add Spec Kit hooks, command aliases, migration machinery, governance engines, or new hard-blocker semantics in `/write-prd`.

## 1) Load context
Read, when present:
- `.memory-bank/constitution.md`, if it exists
- `.memory-bank/analysis/product-brief.md`
- latest relevant `.memory-bank/analysis/brainstorming/BR-*.md`
- `.memory-bank/mbb/index.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/invariants.md`, if it exists
- `.memory-bank/workflows/*`, especially tier policy if present
- `AGENTS.md`
- user-provided context in `$ARGUMENTS`

If `.memory-bank/constitution.md` is missing, create it from the current framework skeleton/template before amending it.

Minimum skeleton requirements:
- frontmatter: `description`, `status: active`, `version: 1`, `project_principles: framework-default`, `ratified`, `last_updated`
- title: `# Project Constitution`
- short sections for Purpose, Core Principles, and Governance
- no project-specific domain principles unless grounded in the loaded context or user instruction
- no contradiction with the current `tier: T0|T1|T2|T3` model

If `.memory-bank/analysis/product-brief.md` exists and is not blocked, use it to make questions contextual to the product, users, risks, constraints, and likely agent workflow. Do not turn the Product Brief into PRD requirements, features, backlog, or implementation plan.

If the Product Brief is missing, blocked, or unreadable, continue with a generic/fallback interview. Missing or blocked brief is allowed.

## 2) Contextual interview
Run an interview before project-specific amendments unless the user explicitly asks only to inspect the current Constitution.

Rules:
- ask at most 5 questions per pass
- ask exactly one question at a time
- do not reveal future queued questions
- prefer multiple choice with 2-5 mutually exclusive options
- provide a recommended option with 1-2 sentence rationale
- use a short suggested answer when multiple choice is a bad fit
- accept `yes`, `recommended`, or `suggested` as acceptance of the proposed answer
- validate custom answers are short and unambiguous
- never guess project governing principles that are not grounded in user answers, Product Brief, existing Memory Bank docs, or explicit project context

Multiple choice format:

```md
**Recommended:** Option B - <brief rationale>

| Option | Description |
|---|---|
| A | ... |
| B | ... |
| C | ... |
| Short | Custom short answer, max 8 words |

Reply with A/B/C, "recommended", or a short answer.
```

Short answer format:

```md
**Suggested:** <answer> - <brief rationale>

Format: short answer, max 8 words. Reply "suggested" to accept.
```

Required topics to cover across one or more passes:
1. Project level: `enterprise`, `medium`, or `junior`. If the answer is not `enterprise`, add a Constitution principle named `DO NOT Overengineering` or equivalent wording that explicitly forbids overengineering.
2. Architecture priority: KISS or stability.
3. Definition of Done and required checks.
4. Agent autonomy and human checkpoints.
5. Critical non-negotiables: choose from security/privacy, no data loss, backward compatibility, performance, accessibility/UX consistency, low maintenance, or custom.

Stop early when all required topics are covered, the user says `done` / `stop` / `proceed`, or 5 accepted answers have been recorded for the pass.

## 3) Update Constitution
Update the Constitution only from:
- accepted interview answers
- explicit user instruction
- existing Memory Bank docs
- AGENTS.md
- invariants, contracts, state docs, testing docs, workflow policies, or explicit project decisions

Do not invent domain-specific principles. A principle needs evidence from user instruction, existing Memory Bank docs, AGENTS.md, invariants, contracts, state docs, workflow policies, or explicit project decisions.

Set `project_principles` in frontmatter:
- `ratified` when the required interview topics have clear accepted answers
- `partial` when some topics are answered and the user wants to proceed
- `framework-default` when only the generated skeleton/default exists
- `skipped` when the user explicitly skips the interview

Record accepted answers in a compact `## Interview Notes` or `## Governance Decisions` section only when they help future agents understand the principle source.

## 4) Keep it short
- Remove vague placeholders.
- Keep concrete project rules in `.memory-bank/invariants.md`, `.memory-bank/contracts/*`, `.memory-bank/states/*`, or `.memory-bank/workflows/*`.
- Use Constitution only for durable principles, precedence, governance, and non-negotiables.

## 5) Consistency check
Before saving, check that the Constitution does not contradict:
- MBB rules
- `spec-backbone.md` readiness/backbone state
- `spec-index.md` routing
- invariants
- contracts/states/testing docs when relevant
- workflow policies
- the current tier model (`tier: T0|T1|T2|T3`)
- generated command/workflow expectations that depend on the Constitution

Do not introduce aliases, legacy task formats, old `risk.level` routing, or separate governance/process machinery.

If dependent docs need updates, list the affected docs and update only the minimal affected docs required by the requested amendment.

This check is a consistency check, not a Spec Kit hook.

## 6) Output
Report:
- whether the Constitution was created or amended
- which evidence sources justified the change
- Product Brief status: used / missing / blocked / skipped
- interview questions answered in this pass
- `project_principles` frontmatter value
- any contradictions found and whether they were fixed or remain blocking
- if skipped, state that `/write-prd` may continue with framework-default/skipped principles and `/constitution` can be revisited later
- any follow-up docs that need explicit user approval
</process>
