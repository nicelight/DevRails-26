---
name: cold-start
description: >
  Route a DevRails 26 target through external bootstrap or the existing
  Memory Bank command workflow.
---

# Cold Start

## What This Skill Is

`cold-start` is the package-level entrypoint for starting DevRails in a target
repository. It does not bootstrap the target itself.

Do not confuse two related surfaces:

- Package/install surface: use the installer from an available external
  DevRails checkout to install runtime command skills or bootstrap the
  skeleton.
- Generated project command: `/cold-start` is the lightweight scenario router
  used after runtime skills are installed in the target repository.

The generated `/cold-start` command is sourced from
`skills/_shared/references/commands/cold-start.md` in this source repo and is
written into target `.agents/skills/cold-start/SKILL.md` and
`.claude/skills/cold-start/SKILL.md` by `scripts/install-framework.mjs`.

## Non-Negotiables

- Do not create epics, features, implementation plans, or runnable task
  records without a clarified PRD/delta.
- Do not create `.memory-bank/commands/`; runtime command skills are installed
  directly into `.agents/skills/` and `.claude/skills/`.
- Do not assume ORCHESTRATOR role or spawn subagents. Follow the target
  `AGENTS.md` role contract.
- Do not use direct `npx skills add <source-repo>` for this source-only fork.
  Use `scripts/install-framework.mjs` from an available external DevRails
  checkout; it prepares a temporary vendored copy.
- Keep skeleton/bootstrap separate from product planning. A fresh skeleton has
  empty `.memory-bank/tasks/index.json` and no `FT-000` or product task records.

## If `.memory-bank/` Is Missing

Treat the current repository root as `<target-repo>` unless the operator
explicitly supplied another target. Accept `<devrails-checkout>` only when the
operator supplied it or its `scripts/install-framework.mjs` is already
verifiable at a known path. Never guess or invent `<devrails-checkout>`.

Return this external bootstrap command with both placeholders replaced by
verified, shell-safe paths:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --target <target-repo> --yes
```

If the checkout is unknown or unavailable, stop with an honest blocker: ask the
operator to provide an available checkout path or perform the external
installer action, then rerun the original `/cold-start`. Never present an
unresolved placeholder as an executable command.

Do not call `/mb-init`, run local bootstrap logic, copy a helper into the
target, install a dependency, or create the skeleton manually. After successful
external bootstrap, rerun `/cold-start` in the target repository.

## If `.memory-bank/` Exists

Use generated `/cold-start` as a router. It should inspect:

- existing code (`src/`, `package.json`, `go.mod`, `Cargo.toml`,
  `requirements.txt`, etc.)
- existing PRD or PRD-like delta
- `.memory-bank/analysis/product-brief.md`
- brainstorming artifacts under `.memory-bank/analysis/`
- Constitution state: `project_principles: ratified|partial` vs
  `framework-default|skipped|missing`
- whether the input is a raw idea, clear concept, existing PRD, or brownfield
  delta

Routing summary:

- code + PRD/delta/clear product input: `/map-codebase` first, then
  `/constitution` if needed, `/write-prd --delta`, `/spec-init`, `/prd`,
  `/review-feat-plan` for high-risk/large work, `/spec-design`,
  `/foundation-to-tasks --verify-existing` only when baseline proof is still
  needed, then `/prd-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>`,
  conditional `/mb-doctor`, and tier-routed `/execute TASK`
- code only: `/map-codebase` as an as-is baseline, then ask for PRD/delta
- no code + existing PRD: `/constitution` if needed, `/write-prd`,
  `/spec-init`, `/prd`, `/review-feat-plan` when needed, `/spec-design`, then
  `/prd-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>`, conditional
  `/mb-doctor`, and tier-routed `/execute TASK` after foundation requirements
  are handled
- no code + product brief: `/constitution` if needed, then `/write-prd`
- clear concept but no PRD: `/brief`, then `/constitution` if needed, then
  `/write-prd`
- raw idea: `/brainstorm`, then `/brief`
- no code and no actionable product input: stop and ask for PRD, product brief,
  or requirements text

## Downstream Gates

After `/prd-to-tasks FT-<NNN>`, run `/review-tasks-plan FT-<NNN>` before
execution. For autonomous/autopilot handoff, every task-linked product feature
needs latest `/review-tasks-plan FT-<NNN>` `APPROVE` plus strict doctor.

Use `/autopilot` only for an already prepared JSON task queue. Use
`/autonomous` for full unattended PRD-to-terminal-state runs.
