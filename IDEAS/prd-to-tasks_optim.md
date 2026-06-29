# Plan: optimize `/prd-to-tasks`

## Goal

Remove harmful duplication from the canonical `/prd-to-tasks` command without
removing workflow behavior, introducing a new user-facing command, or weakening
task/spec readiness.

Correct behavior is the acceptance criterion; line count is not. Retain or add
text whenever it is needed to make ownership, blockers, lifecycle invariants,
or handoff behavior unambiguous.

## Approved decisions

- Keep `/prd-to-tasks` as one user-facing skill.
- Do not optimize or split the skill merely because of its line count.
- Preserve the existing feature-local design and task-by-task workflow.
- Preserve the complete behavior-spec section and its current semantics. Do not
  shorten it merely to meet the line target.
- Read `.memory-bank/schemas/task.schema.json` before creating even provisional
  or in-memory task drafts.
- Do not add a draft-task schema, registry, command, workflow stage, status, or
  new artifact family.
- Continue to create initial required Execution Packets in `/prd-to-tasks`;
  `/mb-packet` remains the packet repair/refresh owner.
- Keep source-only packaging: edit canonical files under `skills/_shared/`, not
  generated `.agents/`, `.claude/`, or package-local `shared-*` copies.

## Core behavior that must remain

- Target selection for one `FT-<NNN>` and `--all`, excluding `FT-000`.
- Clarification and unresolved-marker preflight.
- Mandatory global backbone and Foundation Gate preflight.
- Safe reconciliation of an existing task queue without silently changing task
  identity, lifecycle, evidence, tier, wave, dependencies, acceptance basis, or
  material scope.
- Feature-wide spec inventory and the Architecture, Interfaces/Contracts, and
  Data design lenses.
- Conditional `0-3` focused questions at meaningful design branches.
- One authoritative owner per concrete contract.
- Feature-local repair inside `/prd-to-tasks`; new shared/global decisions route
  to `/spec-design`.
- Concrete readiness for T2/T3 work.
- Schema-backed task records, task index updates, foundation dependencies, and
  tier-selected runtime context.
- Optional behavior specs with their current path, shape, linking, and
  non-gate semantics.
- Initial required packet generation and packet refresh after affected task or
  linked-spec changes.
- Final feature consistency pass and `/review-tasks-plan` handoff.

## Schema-first invariant

Move schema loading before any provisional task outline or mental task drafting.

Required order:

1. Resolve the feature and complete clarification/backbone/foundation preflight.
2. Read the feature, requirements, existing tasks, indexes, and linked specs.
3. Read and parse `.memory-bank/schemas/task.schema.json`.
4. Read `.memory-bank/workflows/tier-policy.md`.
5. Only then create the concise provisional task outline used by the design
   loop.

Rules:

- Do not invent draft task fields before reading the schema.
- Use the schema to constrain IDs, required fields, enums, arrays, and allowed
  record shape while thinking through provisional tasks.
- Keep semantic rules that JSON Schema cannot express in the skill: ID segments
  must match `tier`, `feature`, and `wave`; foundation dependencies must be
  correct; readiness and evidence must remain truthful.
- If the schema is missing, invalid JSON, or incompatible with required task
  semantics, stop before drafting tasks and report the blocker. Do not recreate
  the schema from memory.

## Target command structure

### 1. Input and preflight

Combine target selection, feature blockers, existing queue detection, global
backbone readiness, and Foundation Gate readiness into one concise section.

Keep only prerequisites and stop conditions. Remove the full manual workflow
chain because workflow documentation already owns it.

### 2. Existing queue reconciliation

Keep a compact invariant-based contract:

- preserve identity, lifecycle, evidence, and scheduler-owned state;
- allow bounded repair of specs, plan, task context, links, gates, and packets;
- require explicit re-decomposition for material task slicing changes;
- rerun `/review-tasks-plan` after reconciliation.

Do not duplicate reconciliation rules later in task generation or handoff.

### 3. Context, schema, and provisional outline

Read the feature planning surface once, including the task schema and tier
policy, before drafting provisional tasks. Build one concise dependency-ordered
outline containing purpose, likely dependencies/wave/tier, and expected design
pressure.

The outline is resumable planning state, not a second task model. Update it only
when the outline changes, a material decision is accepted, or the run pauses.
Do not update an iteration checkpoint after every completed task.

### 4. Unified design-and-task loop

Merge the current `Full feature SDD design`, `Task-by-task concrete design
readiness`, and design portion of the task loop.

Preserve this sequence:

1. Build the initial feature-wide spec inventory and detect shared/global gaps.
2. For each provisional task, refresh only changed or newly relevant sources.
3. Apply the three design lenses:
   - Architecture impact;
   - Interfaces/Contracts;
   - Data impact.
4. Ask focused questions only when an unresolved choice materially affects the
   task or its specs.
5. Update the minimum authoritative spec owner.
6. Apply the canonical concrete-readiness rule.
7. Write the final schema-valid task record.
8. After all records exist, run one feature consistency pass and finalize
   `spec_design_status` / `spec_design_links`.

Do not create all specs first and tasks later. The task-by-task loop must retain
the ability to discover and close design gaps exposed by each provisional task.

## Canonical concrete readiness

Define the rule once:

> When a task changes or depends on a concrete boundary, exactly one linked
> authoritative owner must define its shape, rules, edge cases/errors, and
> verification target well enough for implementation without guessing.

Keep concise routing:

1. Extend an existing authoritative owner when the feature detail follows its
   established rules.
2. Fill a concrete owner already routed as `needed_before_tasks`.
3. Use the feature hub for genuinely feature-local design.
4. Route a new or unclear shared/global owner or decision to `/spec-design`.

Retain only a few examples:

- HTTP/RPC boundary -> API Contract or stack-native schema owner.
- Event/message boundary -> Event Contract and boundary Data Contract when
  payload compatibility is relevant.
- Internal DB/storage/migration -> Data Specification.
- Feature-local behavior with no shared reuse -> feature tech-spec hub.

Remove the long owner-hints catalog and all repeated T2/T3 blocker wording.

## Task-record section

Remove the full JSON task example and tier definitions.

Keep only non-obvious semantic invariants:

- read and obey `.memory-bank/schemas/task.schema.json` before drafting;
- read and obey `.memory-bank/workflows/tier-policy.md`;
- task ID tier/feature/wave segments match record fields;
- one independently verifiable outcome per task;
- use only dependency-driven waves; product tasks never use `W0`;
- required task links and richer context come from evidence, not invention;
- persistence work names and verifies the real runtime storage path;
- foundation dependency is direct or transitive when required;
- update `.memory-bank/tasks/index.json` with references only.

Remove the `1-2 hour` sizing heuristic and any wording that implies every
feature must contain W1, W2, and W3. At least one product wave is required, but
additional waves exist only when dependencies justify them.

## Behavior specs

Preserve the current behavior-spec section without functional compression.

It must continue to define:

- when `0` specs is correct;
- when `1-3` specs materially reduce ambiguity;
- standalone file path and minimal JSON shape;
- one behavior per file;
- feature-doc linking;
- task linking only through `source_artifacts`;
- prohibition on registry/schema/validator/doctor/new task fields;
- prohibition on treating behavior specs as verification or done gates.

Only adjust cross-references if section numbering changes.

## Execution Packets

Keep initial packet creation in `/prd-to-tasks`, but reduce its instructions to
the contract not already owned by `/mb-packet`:

- required for every T2/T3 task and evidence-selected T0/T1 tasks;
- canonical path `.memory-bank/packets/<task.id>.packet.json`;
- `source_task_hash` over raw task-record bytes;
- statuses `ready|ready_with_gaps|blocked`;
- task/spec/design contradictions are blockers;
- refresh every affected required packet after task or linked-spec changes,
  including spec-only changes;
- task/spec remain authoritative and packet remains derivative.

Do not duplicate packet field-by-field construction or handoff rules already
owned by `/mb-packet`.

## Final consistency and handoff

Use one final checklist instead of repeating readiness in task, packet, and
handoff sections:

- feature acceptance is covered;
- applicable specs have one authoritative owner;
- task records are schema-valid and indexed;
- foundation dependencies are present when required;
- required packets exist and are usable;
- blockers are explicit;
- next command is `/review-tasks-plan FT-<NNN>` for every affected feature.

Final report should contain only:

- feature and queue action;
- final design status and changed spec owners;
- created/updated task records and packets;
- blockers/questions;
- next step.

## Repetition to remove

- Full workflow narration already documented elsewhere.
- Repeated `spec-index` versus `spec-backbone` explanations.
- Repeated T2/T3 spec-link and concrete-block blockers.
- Repeated packet readiness checks.
- Full task JSON examples and local copies of tier policy.
- Mandatory per-task checkpoint writes.
- `1-2 hour` sizing guidance.
- Implied mandatory W1/W2/W3 sequence.
- Lists of irrelevant or `not_applicable` design categories in reports.

## Split decision

Do not introduce a new feature-design, task-materialization, behavior-spec, or
repair skill in this optimization. Splitting feature design from task drafting
would require another handoff or persisted draft-task model and would weaken the
current feedback loop between provisional tasks and missing specs.

Use existing owners instead:

- `/spec-design` for new shared/global decisions;
- `/mb-packet` for packet-only repair/refresh;
- `/review-tasks-plan` for fresh-context planning review;
- deployed task schema and tier policy for structural rules.

Reconsider a split only if a distinct responsibility with a stable standalone
contract emerges. Prefer a non-user-facing packaged reference over a new
workflow command, but only if the installer also deploys that reference into
target projects. Do not add source-only references that runtime skills cannot
read. Size alone is not a reason to split the workflow.

## Expected files

Primary implementation file:

- `skills/_shared/references/commands/prd-to-tasks.md`

Update only if wording or generated behavior changes:

- `README.md`
- `howItWorks.md`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/scripts/init-mb.js`
- affected review/autonomous workflow commands that rely on exact handoff text

Do not edit generated `.agents/`, `.claude/`, `.memory-bank/`, `.protocols/`,
or `.tasks/` output in the DevRails source repository.

## Acceptance criteria

- Canonical command removes material duplication without using line count as a
  quality or acceptance gate.
- `task.schema.json` is read and parsed before any provisional or mental task
  draft is created.
- Behavior-spec behavior and detail remain intact.
- Feature-wide inventory, per-task three-lens reasoning, conditional questions,
  authoritative-owner routing, and final consistency remain intact.
- Existing-queue reconciliation preserves identity/lifecycle/evidence rules.
- No new command, persisted mode, task status, schema, registry, or planning
  artifact is introduced.
- Initial required packets are still created before review/execution handoff.
- `/review-tasks-plan` remains the next planning gate.
- Fresh install generates valid `/prd-to-tasks` skills in both `.agents` and
  `.claude`.
- `quick_validate.py` passes for the generated skill.
- `npm run check:syntax --silent` passes.
- `git diff --check` passes.
- Source-only `shared-*` count remains `0`.

## Implementation order

1. Record current section/line counts and preserve a behavior checklist.
2. Move schema/tier-policy reads before provisional task drafting.
3. Merge feature design, concrete readiness, and per-task design into one loop.
4. Replace owner hints with the canonical owner rule and examples.
5. Remove JSON/tier/wave/time duplication while preserving semantic invariants.
6. Preserve behavior specs and repair only cross-references.
7. Compress packet and final handoff sections.
8. Review reconciliation and `--all` behavior for regressions.
9. Update user-facing/generated documentation only where required.
10. Run source, install, bootstrap, validator, and lint smoke checks.
