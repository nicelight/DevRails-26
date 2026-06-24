---
description: Optional Analysis router before PRD; recommends brainstorm, brief, write-prd, PRD decomposition, mapping, or feature clarification.
status: active
---
# /analysis - Analysis router

<objective>
Route the project to the next discovery or planning step without generating PRD content, task records, research, PRFAQ, or requirements.

Analysis is optional. Use it when the product idea is vague, product direction is unstable, or the user asks what should happen before `/prd`.
</objective>

<process>

## 0) Scope
`/analysis` is a router only.

Allowed outputs:
- create `.memory-bank/analysis/index.md` if it does not exist
- update `.memory-bank/analysis/index.md` with current state and the recommended next step
- report the next command to the user

Do not create:
- `.memory-bank/analysis/product-brief.md`
- `.memory-bank/analysis/brainstorming/BR-*.md`
- `.memory-bank/tasks/*.task.json`
- `.memory-bank/tasks/plans/*`
- `.memory-bank/analysis/assumptions.md`
- research reports
- PRFAQ artifacts
- command aliases

## 1) Inspect state
Check only what is needed:
- `prd.md`
- `.memory-bank/constitution.md`
- `.memory-bank/analysis/index.md`
- `.memory-bank/analysis/product-brief.md`
- `.memory-bank/analysis/brainstorming/BR-*.md`
- `.memory-bank/features/FT-*.md`
- clear brownfield signals such as source code, `package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`, or existing app folders

Do not infer a roadmap from a brownfield codebase before mapping it.

## 2) Ensure index when useful
If `.memory-bank/analysis/index.md` is missing and Analysis is the selected path, create it with:
- YAML frontmatter:
  - `description: Analysis artifact index.`
  - `status: active`
- current state
- artifact links
- recommended next step
- open routing questions

Use this frontmatter:

```yaml
---
description: Analysis artifact index.
status: active
---
```

Do not create `.memory-bank/analysis/` in a clean skeleton unless `/analysis`, `/brainstorm`, or `/brief` is actually being used.

## 3) Routing table
When routing from an existing Product Brief or PRD/delta source toward `/write-prd`, first inspect `.memory-bank/constitution.md` `project_principles`.

- If project principles are `ratified` or `partial`, recommend `/write-prd`.
- Otherwise, recommend `/constitution`, then `/write-prd`.

Use this table:

| State | Next step |
|---|---|
| Product brief exists, but `.memory-bank/prd.md` is missing | `/constitution` if principles are not `ratified|partial`, then `/write-prd` |
| `.memory-bank/prd.md` exists with `clarification_status: complete` and `constitution_checked: true`, but spec-backbone/spec-index is missing/stale or Pre-PRD Spec Status is not `ready_for_prd` | `/spec-init` |
| `.memory-bank/prd.md` exists with `clarification_status: complete` and `constitution_checked: true`, but feature docs are not created | `/spec-init`, then `/prd` |
| `.memory-bank/prd.md` exists with `clarification_status: pending|blocked` | `/write-prd` |
| Feature docs exist with `clarification_status: pending|blocked` | `/clarify-feature FT-<NNN>` |
| Feature docs exist without blocking clarification metadata | `/spec-design`, then `/foundation-to-tasks` if required, then `/prd-to-tasks FT-<NNN>` |
| Approved product brief exists | `/constitution` if principles are not `ratified|partial`, then `/write-prd`, `/spec-init`, `/prd`, `/review-feat-plan` for high-risk/large work, `/spec-design`, `/foundation-to-tasks` if required, and `/prd-to-tasks FT-<NNN>` |
| Draft product brief exists | finish `/brief`, then `/constitution` if principles are not `ratified|partial`, then `/write-prd`, `/spec-init`, `/prd`, `/review-feat-plan` for high-risk/large work, `/spec-design`, `/foundation-to-tasks` if required, and `/prd-to-tasks FT-<NNN>` |
| Brainstorming report exists, but no brief exists | `/brief` |
| Idea is raw or vague | `/brainstorm` |
| Concept is understandable and no PRD exists | `/brief` |
| Brownfield project without PRD | `/map-codebase`, then `/brief --delta` if needed, then `/constitution` if principles are not `ratified|partial`, then `/write-prd --delta` |
| Not enough data | create/update index and give one explicit next step |

Brownfield rule:

```text
Brownfield as-is mapping comes first. Do not invent roadmap from analysis before /map-codebase.
```

## 4) Decomposition dependency
Do not recommend `/prd-to-tasks` for a feature when the feature has `clarification_status: pending|blocked` or unresolved blocking markers in behavior, acceptance, data, contracts, security, UX, operations, or verification sections.

Missing clarification metadata does not block task decomposition.

Always recommend `/spec-design` after `/prd`. Local/simple feature-set pressure
records a minimal backbone status with explicit `not_applicable` areas instead
of skipping the gate. If `/spec-design` records required foundation, route
through `/foundation-to-tasks` and the foundation gate before product feature
tasking.

If feature-level clarification is explicitly pending or blocked, recommend:

```text
/clarify-feature FT-<NNN>
```

## 5) Response
Return:
- current state
- evidence checked
- recommended next step
- why other tempting routes were not selected, if relevant

Keep the answer short. This command should move the user to the right next command, not perform discovery itself.
</process>
