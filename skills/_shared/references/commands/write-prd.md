---
description: Clarify product intent, requirements, and acceptance in the project's PRD.
status: active
---
# /write-prd — Product requirements

## Outcome
Create or update `.memory-bank/prd.md` from a brief, explicit operator input,
or an existing PRD. Apply
`.memory-bank/workflows/execute-loop.md#working-policy` and the installed
`creator-vibe` skill when interpreting the product's intended experience.

Read applicable project principles and relevant existing requirements/specs.
When no product source exists, ask what is being built. Missing preliminary
commands or interview markers alone do not invalidate clear product input.

## Clarification
Preserve accepted intent, scope, users, behavior, and constraints. Discuss real
choices about functionality, UX, data, integrations, important failure outcomes,
quality, and acceptance. Under authorized autonomy, make bounded decisions and
record their basis. Do not infer authority from silence.

For a material quality requirement, identify its observable result, an accepted
numeric target or qualitative criterion, decisive conditions, and a suitable
verification-method class. Human review is valid when its criterion and reviewer
role are clear. Avoid inventing numeric targets or requirements to fill a form.

## Durable result
Use the project's useful PRD structure, covering applicable goals/non-goals,
users, behavior, data, interactions, integrations, constraints, acceptance, and
open decisions. Omit decorative sections; link canonical detail.

Keep frontmatter `type: prd`, `status`,
`clarification_status: pending|complete|blocked`, and `constitution_checked`.
Set `complete` when requirements are clear enough for the requested work;
record later/deferred questions separately. Use `pending` for open clarification
and `blocked` for a decision that prevents the affected work. Set
`constitution_checked: true` only after checking applicable project principles.

Apply decisions to the owning sections, remove superseded contradictions, and
retain concise clarification provenance when it helps future agents. When an
accepted change affects requirements, features, or specs, reconcile those
artifacts in the same work rather than requiring a command round trip.
Unresolved governing conflicts remain explicit and block only dependent work.

## Handoff
Report the product change and unresolved decisions. `/spec-init` can help frame
an unclear domain; `/prd-to-features` can decompose a sufficiently clear PRD.
Choose the useful next action from actual context, not whether the PRD file
happened to exist before this run.
