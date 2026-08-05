---
description: Default DevRails entrypoint when the first operator prompt names no skill and implies no unambiguous workflow action; resolves current durable state and routes one owning skill.
status: active
---
# /start — Resolve next workflow owner

<objective>
Resolve the current authoritative workflow state and invoke exactly one next
owning skill. If no route or target is authoritative, ask one focused operator
question and stop.
</objective>

<input_contract>
Use `$ARGUMENTS` as operator focus when present.

If `.memory-bank/` is missing, treat the repository root as `<target-repo>`
unless the operator supplied another target. Accept `<devrails-checkout>` only
when supplied by the operator or already verifiable by its
`scripts/install-framework.mjs`.

When both paths are known, return this command with shell-safe resolved paths:

```bash
node <devrails-checkout>/scripts/install-framework.mjs --bootstrap --target <target-repo> --yes
```

Otherwise ask for the checkout path and stop. Do not call `/mb-init`, run local
bootstrap logic, copy helpers, install dependencies, or create the skeleton.
After external bootstrap, rerun `/start`.

When `.memory-bank/` exists, read `.memory-bank/index.md`,
`.memory-bank/workflows/execute-loop.md#interactive-mode-you-stay`, and only
the product, PRD, baseline, spec/foundation, feature, task, review, protocol, or
handoff records needed to resolve the current incomplete boundary. File
existence and conversation memory are not workflow state; use authoritative
statuses, verdicts, Planning Revision, dependencies, and durable handoffs.
</input_contract>

<hard_invariants>
- `/start` writes no artifact or lifecycle state; the selected skill owns
  its mutations and handoff.
- Select no unattended mode without an explicit operator instruction.
- Do not create roadmap or task state without a clarified PRD/delta.
- Do not bypass an existing review, Foundation, dependency, doctor, tier, or
  operator-decision gate.
- Do not choose among multiple eligible features or tasks without an
  authoritative target.
</hard_invariants>

<routing_contract>
Prefer a valid unfinished durable handoff or resume route. Otherwise select the
first incomplete boundary in the interactive execute-loop whose prerequisites
are satisfied. Substantial existing code without a current evidence-backed
baseline routes to `/map-codebase` before new product planning.

Invoke the one selected owning skill and stop routing. If the owner or target
depends on an unresolved operator choice, ask that one question and stop. Do
not output or execute a downstream chain.
</routing_contract>

<validation>
Confirm that the selected owner matches authoritative state, all earlier gates
remain satisfied, and the result contains only one invoked skill or one blocking
operator question.
</validation>
