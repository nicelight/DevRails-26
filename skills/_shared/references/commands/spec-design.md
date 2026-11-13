---
description: Establish the initial useful architecture and executable-baseline decisions.
status: active
---
# /spec-design — Initial design

## Outcome
A compact architecture and applicable canonical specs that make the next work
clear, including whether a separate executable Foundation baseline is useful.
Apply `.memory-bank/workflows/execute-loop.md#working-policy` and
`.memory-bank/workflows/sdd-design-contract.md`.

Read accepted product intent, relevant features, existing specs, and current
code/runtime evidence. A completed command sequence or review is not an input
requirement. For an existing design, use the accepted delta; `/spec-redesign`
provides a focused tool without requiring a separate invocation.

## Design
Resolve only choices needed by current work. In manual work discuss material
architecture and Foundation choices; under delegated autonomy choose within the
accepted scope and constraints. Keep simple projects simple.

For an application-shaped greenfield project without another accepted direction,
a modular monolith with capability slices is a useful starting proposal. A CLI,
library, firmware, pipeline, or established project may need a different natural
structure. A preference is not a requirement or permission to replace an accepted
architecture. Use existing code as evidence of current state, not automatic
product authority.

## Durable result
Update only useful canonical specs and registry links. Keep
`spec-backbone.md` parseable:

```markdown
## Global Backbone Status
- Status: complete|minimal|blocked
- Planning Revision: <non-negative integer>
- Mode: local_simple_backbone|standard_architecture_scaffold|strict_architecture_scaffold|pending
- Architecture artifact strategy: single-file|split-core-docs|split-by-boundary-topic|pending
```

`minimal` is sufficient when the relevant design is simple. `complete` means
current relevant concerns are resolved; neither requires documents for unused
concerns. `blocked` names a real unresolved decision and its affected work.
The first usable backbone uses revision `1`; an unresolved initial design may
remain `0`. Revision tracks design change, not permission to implement.

When useful, maintain `## Backbone Area Matrix` with
`Area | Status | Authoritative source | Notes` and statuses
`authoritative|needed_before_tasks|not_applicable|blocked`. Use rows for relevant
architecture, ownership, domain/data, interface, runtime, security, and
verification concerns; omit decorative coverage and empty rationale.

Record a settled Foundation decision in `.memory-bank/foundation.md`:

```markdown
## Gate Anchors
- Foundation Required: true|false
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: pending_foundation_to_tasks|TASK-<NNN>-T<N>-FT-000-W<N>|not_required
```

Use `true` when the intended product work actually needs an executable baseline
first; otherwise use `false` and `not_required` with concise evidence. Describe
its minimal build/start/test/smoke path and important feature pressures. A separate
Foundation queue is not a default prerequisite. If the decision is unresolved,
record `Foundation decision: blocked` and the question instead of inventing
anchors. Preserve previous evidence without presenting it as current approval.

Link relevant design from affected features. Feature `spec_design_status` is
`complete|not_required|blocked` according to its actual needs. Update accepted
corrections and related links in the same work. Check consistency and resolve
broken task-relevant links before relying on them.

## Handoff
Report the design decisions, changed specs, Foundation choice, and open issues.
Recommend Foundation work only when needed; otherwise continue useful feature
planning or implementation. `/foundation-to-tasks` and `/feature-to-tasks` are
available tools, not compulsory transitions.
