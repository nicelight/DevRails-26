---
description: Maintain concise project principles, autonomy boundaries, and completion expectations.
status: active
---
# /constitution — Project principles

## Outcome
A short `.memory-bank/constitution.md` describing the project's governing
principles, agent autonomy, completion expectations, and explicit constraints.
Apply `.memory-bank/workflows/execute-loop.md#working-policy`.

Read the existing Constitution, operator instructions, and only the product or
technical evidence relevant to a governing decision. A missing brief does not
prevent discussing principles. Create a missing Constitution from the framework
template and distinguish its defaults from accepted project decisions.

## Decisions
Discuss unresolved choices that affect this project: its practical scale,
complexity trade-offs, useful checks, agent autonomy, and critical constraints.
Use a natural question or a small related group; reuse answers already given.
Do not turn a generic checklist into requirements or invent domain policy.

Under authorized autonomous work, choose within the delegated scope and record
material decisions. Otherwise consult the operator. An explicit request to skip
the interview is sufficient; no separate approval document is needed.

## Durable result
Keep frontmatter `status: active`, integer `version`, `project_principles`,
`ratified`, and `last_updated`. Preserve the existing values' meanings:

- `ratified`: applicable governing choices are settled;
- `partial`: proceeding with named open choices is authorized;
- `framework-default`: only framework defaults exist;
- `skipped`: the operator skipped the interview.

For ratified/partial principles record the ratification date. Otherwise retain
`ratified: null`. Update version/dates when their represented state changes.
Keep decision provenance only where useful. Concrete domain rules remain in
canonical specs; link them rather than copying them into the Constitution.

Check changed principles against explicit operator decisions and affected
product/spec content. Apply an agreed amendment and reconcile affected wording
in the same work. An unresolved conflict holds only the work that depends on it.

## Handoff
Report changed principles and remaining questions. `/write-prd` is a useful next
step when product requirements need work; missing interview completion alone is
not a reason to stop otherwise authorized development.
