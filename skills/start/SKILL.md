---
name: start
description: >
  Route a DevRails 26 target through external bootstrap or the existing
  Memory Bank command workflow.
---

# Start

## What This Skill Is

`start` is the package-level entrypoint for starting DevRails in a target
repository. It does not bootstrap the target itself.

Do not confuse two related surfaces:

- Package/install surface: use the installer from an available external
  DevRails checkout to install runtime command skills or bootstrap the
  skeleton.
- Generated project command: `/start` is the lightweight scenario router
  used after runtime skills are installed in the target repository.

The generated `/start` command is sourced from
`skills/_shared/references/commands/start.md` in this source repo and is
written into target `.agents/skills/start/SKILL.md` and
`.claude/skills/start/SKILL.md` by `scripts/install-framework.mjs`.

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

Explain that this route installs or updates the full DevRails runtime command
set and creates the skeleton. Then return this external bootstrap command with
both placeholders replaced by verified, shell-safe paths:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --target <target-repo> --yes
```

If the checkout is unknown or unavailable, stop with an honest blocker: ask the
operator to provide an available checkout path or perform the external
installer action, then rerun the original `/start`. Never present an
unresolved placeholder as an executable command.

Do not call `/mb-init`, run local bootstrap logic, copy a helper into the
target, install a dependency, or create the skeleton manually. After successful
external bootstrap, rerun `/start` in the target repository.

## If `.memory-bank/` Exists

Use the generated `/start` command. It resolves authoritative runtime
state and invokes one owning skill; do not duplicate its routing contract here.
