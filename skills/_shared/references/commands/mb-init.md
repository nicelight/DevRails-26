---
description: Route bootstrap or coherent sync through a verified external installer.
status: active
---
# /mb-init — External bootstrap router

Return the exact installer action for a verified target and available DevRails
checkout. Use the current repository as target unless another was supplied.
A checkout is valid only when supplied or already known and its
`scripts/install-framework.mjs` is verifiable. Never invent paths.

For missing Memory Bank:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --target <target-repo> --yes
```

For explicitly requested coherent framework sync:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --sync --target <target-repo> --yes
```

Replace placeholders with shell-safe verified paths; an unresolved placeholder
is not an executable command. `--bootstrap-only --sync` repairs only managed
Memory Bank assets, not runtime skills. Preserve installer collision handling;
this operation does not create the skeleton, copy helpers or install dependencies.

Unknown/unavailable checkout or a real install conflict needs its actual input
or owner decision. When Memory Bank exists, apply
`.memory-bank/workflows/autonomy-policy.md`; before bootstrap, report the missing
input without fabricating a reference or successful deployment.

After external installation return to `/mb-init` to confirm the result, then
`/start` only if it is available in DSH. Otherwise report the ready skeleton and
missing runtime capability. Packaging directories alone do not prove DSH
availability. Installation is not agent launch or automatic recovery work.
