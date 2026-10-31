---
description: Resolve the current incomplete owner from durable state.
status: active
---
# /start — Resolve next workflow owner

Resolve the next subject owner and target from `$ARGUMENTS`, the host's current
operation and authoritative durable state. Return one immediate handoff for
host continuation; do not launch a chain or select queue work yourself.

## Missing Memory Bank

Use the current repository as target unless another was supplied. Accept a
DevRails checkout only if supplied or already verifiable by its
`scripts/install-framework.mjs`; never invent it. Return the following with
verified shell-safe paths:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --target <target-repo> --yes
```

If a path is unknown, report the exact missing input. Do not run local bootstrap
logic, copy helpers or create the skeleton. Resume `/start` after actual external
bootstrap. This installer is packaging, not an agent execution environment.

## Existing Memory Bank

Apply `.memory-bank/workflows/autonomy-policy.md` for decisions, effective
settings, host ownership and recovery.

Use `.memory-bank/index.md`, `.memory-bank/workflows/execute-loop.md`, and only
the product/design/task/evidence records needed to identify the incomplete owner.
Prefer a valid unfinished handoff over a new chain. File existence alone does
not prove completion; disabled checks do not create missing-verdict blockers.

Substantial existing code without a current baseline suggests `/map-codebase`
before new planning; an added mapping branch follows the common decision flow.
Ambiguous target/authority needs a focused decision, not a guessed feature/task.
Keep this operation read-only. Do not invent product scope or select autonomous
mode without its authorization. Return the owner, concise basis and any specific
missing input; completed work is not replayed because conversation context is gone.
