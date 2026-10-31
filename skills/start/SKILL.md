---
name: start
description: Route package installation or the existing DevRails runtime entrypoint.
---
# Start package entrypoint

Use `references/shared-commands-start.md` for the entry contract. This package
routes external installation; it does not create the target skeleton or execute
an agent through another environment. Runtime work uses DSH availability and
`.memory-bank/workflows/autonomy-policy.md` after bootstrap.

Use a verified external checkout's `scripts/install-framework.mjs` for this
source-only repository, not direct `npx skills add`. Missing Memory Bank uses
`--bootstrap --target <verified-target> --yes`; unknown checkout/target remains
an input gap. Preserve installer collision handling and shell-safe paths.

The installer generates runtime commands into `.agents/skills/` and
`.claude/skills/`; these are packaging surfaces, not proof of DSH availability.
A fresh skeleton has an empty task index and no Foundation/product tasks.
After installation return to the available runtime `/start`, which resolves
one unfinished owner for host continuation without duplicating routing here.
