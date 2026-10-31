---
name: mb-init
description: Route external Memory Bank bootstrap or coherent framework sync.
---
# mb-init package entrypoint

Apply `references/shared-commands-mb-init.md` for the verified checkout/target,
bootstrap-only versus coherent sync action, collision safety and immediate
handoff. This package does not create a skeleton, copy helpers or launch agents.

The external installer owns packaging; DSH owns runtime models, subagents and
tools. After actual bootstrap/sync confirm the target and return to `/start`
only if DSH exposes it. Do not infer runtime availability from package folders.
