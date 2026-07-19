---
description: Build a compact Memory Bank/codebase Context Read Manifest for another agent from a delegated Explorer session; use for broad discovery when direct reads are not already cheaper.
status: active
---
# /context-manifest - Route context reads

<objective>
Return one compact `Context Read Manifest`: an ordered set of current-worktree
sources for the caller to read personally before planning, execution,
verification, review, or analysis.

This is optional context routing. It is not a workflow gate, source summary,
durable artifact, or substitute for source-of-truth reading.
</objective>

<input_contract>
Resolve from `$ARGUMENTS`:
- target workflow or work type;
- one `FT-*`, `TASK-*`, or `REQ-*` target, or a short free-form goal;
- optional downstream read budget;
- whether codebase/test evidence is needed.

Before discovery, read local `AGENTS.md`, `.memory-bank/roles/worker.md`, and,
when a target workflow exists, its installed skill. Resolve IDs through
existing indexes/registries. Do not invent a separate CLI parser.

The caller should delegate this work only when broad discovery is likely to
cost more context than a separate Explorer call. Direct reads are normally
cheaper for simple T0/T1 work or a small task with an obvious complete read
set.
</input_contract>

<hard_invariants>
- Work read-only. Do not execute the target workflow, edit files, create
  planning/spec/task/protocol artifacts, or launch subagents.
- Return routes, not source contents. No file dumps, long summaries, product or
  design conclusions, secrets, credentials, or environment values.
- Direct canonical links outrank registry-only guesses. Do not route one
  concern to competing active specs or use archive/legacy material as current
  authority without an explicit active-source reason.
- Workflow-mandatory files remain `read_full`; never shorten them for budget.
- The manifest is an initial read set, not a scope boundary. The caller expands
  it when read sources, direct links, diff, or evidence require more context.
- Do not persist the manifest in `.memory-bank/`, `.protocols/`, or `.tasks/`.
- Do not change target workflow inputs, outputs, gates, statuses, ownership, or
  handoff contracts.
</hard_invariants>

<operator_decisions>
Explorer does not resolve product, acceptance, architecture, contract,
storage/state, security, tier, task-boundary, dependency, or verification
ambiguity.

Record every unresolved branch or competing canonical route under `Gaps / stop
conditions`. When the operator can decide it, the caller must interview the
operator under the owning workflow before proceeding. A recommendation,
default, or silence is not acceptance.
</operator_decisions>

<agent_discretion>
Within the read-only boundary, choose the search order, tools, discovery depth,
focused ranges, anchors, and optional sources that produce the smallest
sufficient manifest. Prefer indexes, direct links, targeted search, and
current-worktree evidence over broad reads.
</agent_discretion>

<routing_profiles>
- Planning/design: include governing priming, target feature/epic/REQ/RTM,
  backbone/index, plausible subject-based canonical specs, existing plans/tasks,
  and only necessary codebase evidence.
- Execute: include indexed task record, tier policy, direct task-linked specs,
  minimal feature/REQ context, and relevant code/tests. Do not add broad
  Constitution/backbone/index context for T0/T1 without a direct reason.
- Verify/review: include target record/plan, acceptance basis, direct specs,
  implementation diff/evidence, applicable testing contracts, and only needed
  upstream context. The verifier may expand beyond the manifest independently.
- Broad analysis: start from governing routers/indexes, then include only
  evidenced relevant Memory Bank areas and codebase seams.

Follow `source_artifacts`, `normative_inputs`, `spec_design_links`, task,
feature, and REQ links. For T2/T3 execution or verification, the indexed task
card and direct task-linked canonical specs are mandatory; feature links are
only composition/drift context. Exclude archive, legacy, and background areas
unless a current source needs them as evidence.
</routing_profiles>

<required_outputs>
Return only this final shape; omit empty optional sections except `Gaps / stop
conditions`:

```markdown
# Context Read Manifest

- Goal:
- Workflow:
- Target:
- Generated against: <worktree root; git HEAD and dirty|clean when available>
- Estimated read size:
- Status: ready | gaps

## Ordered reads

| # | File | Read | Anchor | Role | Why |
|---|---|---|---|---|---|

## Optional reads

## Ephemeral facts

## Gaps / stop conditions

- none

## Explicit exclusions
```

For each row:
- use a project-relative Markdown link;
- use `read_full` or a real, valid `start_line-end_line` range from the current
  worktree;
- name a Markdown heading or code symbol/section anchor;
- use role `governing | normative | target | planning | code | verification |
  optional`;
- give one short reason;
- merge nearby ranges and list a path only once.

Use `read_full` for workflow-mandatory sources, small JSON task cards, and
short specs. Focused ranges are allowed for large documents and code files.
Estimate read size approximately. Keep output within about 1500 tokens; when
mandatory reads exceed the downstream budget, keep them all, split them into
ordered batches, and return `Status: gaps` with the budget issue.

`Status: ready` means sufficient relative to discovered mandatory routes and
direct links, not proven completeness of the repository. Use `Status: gaps`
for a missing target, broken mandatory link, competing active specs,
insufficient budget, or another unresolved stop condition.

Ephemeral facts are limited to small read-only observations not represented in
files, such as dirty/clean worktree state. Include the source command and no
large output. The manifest is valid for the generated worktree state; if a
listed file changes before use, regenerate it.
</required_outputs>

<validation>
Before returning:
- confirm every listed path exists and every range fits its current line count;
- confirm mandatory target-workflow reads and direct canonical links are not
  omitted for budget;
- confirm T0/T1 has no unjustified broad planning context;
- confirm no duplicated path, source dump, secret, decision, write, or target
  workflow execution appears in the result;
- use `Status: gaps` rather than guessing when routing is incomplete.
</validation>

<handoff_contract>
Return only the `Context Read Manifest` to the caller. The caller personally
reads mandatory sources, expands the read set when needed, handles operator
questions, and continues the unchanged target workflow.
</handoff_contract>
