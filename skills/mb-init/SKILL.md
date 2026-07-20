---
name: mb-init
description: Route Memory Bank bootstrap or coherent framework sync through an available external DevRails checkout.
---

# mb-init — External bootstrap router

This package does not create or sync Memory Bank files. Bootstrap is owned only
by `scripts/install-framework.mjs` in an available DevRails checkout.

## Route

- Verify the target repository path.
- Use a DevRails checkout path only when the operator supplied it or the
  checkout and its installer are already verifiable. Never guess or invent the
  checkout path.
- For a target without `.memory-bank/`, return:

  ```bash
  node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --target <target-repo> --yes
  ```

- For an explicit framework sync of an existing target, update runtime command
  skills and Memory Bank managed assets from the same prepared source copy:

  ```bash
  node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --sync --target <target-repo> --yes
  ```

  `--bootstrap-only --sync` repairs only Memory Bank managed assets and does not
  update runtime command skills. Do not present it as a full framework sync.

Replace both placeholders with verified, shell-safe paths. If the checkout is
unknown or unavailable, ask the operator to provide one or run the external
installer action, then rerun `/mb-init`; never present a placeholder as an
executable command.

Do not run local bootstrap logic, copy a helper into the target, install a
dependency, or create the skeleton manually. When `.memory-bank/` already
exists and no sync was requested, make no changes and hand off to `/cold-start`.
