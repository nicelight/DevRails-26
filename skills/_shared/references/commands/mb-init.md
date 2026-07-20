---
description: Route Memory Bank bootstrap or coherent framework sync through an available external DevRails checkout.
status: active
---
# /mb-init — Route external Memory Bank bootstrap

<objective>
Inspect the target repository and return the exact external DevRails installer
command required to create its Memory Bank or coherently sync the installed
framework. `/mb-init` is a thin router: it does not create, sync, or reconstruct
the skeleton itself.
</objective>

<process>
1. Treat the current repository root as `<target-repo>` unless the operator
   supplied another target explicitly.
2. Accept `<devrails-checkout>` only when the operator supplied it or its
   `scripts/install-framework.mjs` can be verified at an already known path.
   Never guess or invent `<devrails-checkout>`.
3. If `.memory-bank/` is missing, return this command with both placeholders
   replaced by verified, shell-safe paths:

   ```bash
   node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --target <target-repo> --yes
   ```

4. For an explicit framework sync request on an existing target, update runtime
   command skills and Memory Bank managed assets from the same prepared source
   copy:

   ```bash
   node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --sync --target <target-repo> --yes
   ```

5. `--bootstrap-only --sync` repairs only Memory Bank managed assets and does
   not update runtime command skills. Do not present it as a full framework
   sync.
6. Do not run local bootstrap logic, copy a helper into the target, install a
   dependency, or create the skeleton manually. The external installer owns
   bootstrap and its existing target-file safety policy.
7. If the DevRails checkout is unknown or unavailable, stop with a blocker:
   ask the operator to provide an available checkout path or run the external
   installer action, then rerun `/mb-init`. Do not present a placeholder as an
   executable command.
</process>

<handoff_contract>
- After a successful external bootstrap or sync, rerun `/mb-init` to confirm
  `.memory-bank/` is present.
- If the Memory Bank is present and no sync was requested, make no changes and
  hand off to `/cold-start` only when its `SKILL.md` exists in the active
  `.agents/skills/` or `.claude/skills/` runtime surface. Otherwise report that
  the skeleton is ready and stop; do not claim `/cold-start` is available.
  Runtime command installation remains an explicit external installer action.
</handoff_contract>
