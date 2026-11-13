---
description: Resume the requested work from durable project state.
status: active
---
# /start

Identify the user's intended work and the relevant durable project state.
Apply `.memory-bank/workflows/execute-loop.md#working-policy`: consult the operator on substantive choices unless autonomy was explicitly granted; carry out settled decisions without repeated approval.

The normal project progression is intent/requirements → features/design → tasks
→ implementation/checks → updated memory. Preserve the useful inputs and
outcomes of these stages without requiring a separate command for each.

If Memory Bank exists, use its index, task cards and any unfinished handoff to
resume useful work. Read affected specs and actual code as needed. Missing
review markers, Planning Revision approvals or protocol files alone do not
require a return through earlier commands. Ask about a substantive unresolved
choice; an optional skill may assist the current agent without becoming a
mandatory transition. Do not select unattended execution without authorization.

If Memory Bank is missing, use the project root or supplied target and an
available verified DevRails checkout to give the external bootstrap command:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --target <project-path> --yes
```

Replace placeholders with verified shell-safe paths. If the checkout is unknown,
ask for it. Do not invent a path, reconstruct the skeleton locally or use direct
`npx skills add` for this source-only framework. After installation, resume the
original request. Report the next useful action or the specific missing input.
