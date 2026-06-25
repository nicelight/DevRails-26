---
description: Mandatory global SDD architecture backbone gate after PRD decomposition and before feature task design.
status: active
---
# /spec-design - Global SDD backbone gate

<objective>
Create or update the mandatory global architecture/design backbone after `/prd` has created the FT set and before `/prd-to-tasks FT-<NNN>` or `/spec-auto --all`.

The first result is an architecture scaffold: technical decisions, boundaries,
and contracts that constrain agents/developers so they do not damage the
project. It is not a narrative architecture essay.

Main question:
> What technical decisions, boundaries, and contracts must constrain implementation so agents/developers cannot tear the project apart?

The gate is mandatory by workflow, but adaptive by depth:
- local/simple feature-set pressure creates a minimal backbone and marks irrelevant areas `not_applicable`;
- shared-boundary, contract, state/data/runtime/security, or strict pressure gets staged architecture decisions and normal backbone specs;
- unresolved key decisions are recorded as blockers and downstream commands must stop.

`/spec-design` does not create TASK records, implementation plans, or feature-local tech specs. Feature-local design is handled inside `/prd-to-tasks`; standalone `/spec-improve` is for repair/refresh. When a project needs a minimum executable baseline before business features, `/spec-design` records the Foundation Dev Path decision and Feature Pressure Map in `.memory-bank/foundation.md`; executable foundation work is generated later by `/foundation-to-tasks`.
</objective>

<process>

## 0) Input and timing
Run after `/prd`.

Supported arguments:
- no argument: inspect all current features and update the global backbone
- `--all`: same as no argument; explicit for autonomous or batch flow

Required inputs:
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/requirements.md`
- `.memory-bank/epics/`
- `.memory-bank/features/`
- `.memory-bank/user-scenarios.md` when present
- existing relevant specs under `.memory-bank/architecture/`, `.memory-bank/guides/`, `.memory-bank/domains/`, `.memory-bank/contracts/`, `.memory-bank/states/`, `.memory-bank/adrs/`, `.memory-bank/testing/`, and `.memory-bank/runbooks/`

Never skip the command. Read `.memory-bank/spec-backbone.md` as the pre-PRD framing from `/spec-init`. For explicitly local/simple feature sets, write the minimal backbone status and mark non-applicable areas instead of expanding architecture.

## 1) Source-of-truth precedence
Use this precedence when deciding what is authoritative:
1. Constitution / explicit user decision
2. Existing production code and brownfield baseline
3. ADRs
4. Authoritative contracts/specs
5. PRD / requirements / features
6. User scenarios
7. Task records, only when rerunning after task generation
8. Agent assumptions

A lower source cannot override a higher source. Any conflict becomes `blocked` unless the user makes an explicit decision.

## 2) Brownfield guard
Before interviewing, inspect whether meaningful production code exists and whether a mapped baseline / authoritative architecture baseline exists.

Interactive mode:
- If meaningful code exists but baseline is missing, ask one question:
  - **Run `/map-codebase` first (recommended)**: create authoritative brownfield baseline before architecture decisions.
  - **PRD-only override**: continue from PRD evidence and record drift risk.
  - **Minimal local delta only**: continue only for a clearly local/safe change with narrow `not_applicable` rationale.

Autonomous mode:
- Block if baseline is missing and scope is not clearly local/safe.
- Continue only when evidence proves the change is local, reversible, and does not affect shared architecture/contracts.

## 3) User scenarios preflight
Check `.memory-bank/user-scenarios.md`.

After `/spec-init` PASS, creating or reviewing `.memory-bank/user-scenarios.md` is only required when architecture decisions are scenario-sensitive. This is not a `/spec-init` failure; if PRD, requirements, features, or spec-backbone evidence is enough, link that evidence and continue.

If scenarios are visible in PRD/requirements/features/existing specs and architecture decisions depend on them, create or update a draft and ask the user to review/add before relying on those scenario-sensitive decisions.

If scenarios are absent and materially affect architecture, record a blocker/gap instead of guessing.

Use this simple template:

```markdown
# User Scenarios

## Primary Actors
- TBD

## Core Scenarios
- Scenario:
  - Architecture implications:

## Out Of Scope Scenarios
- TBD

## Review Status
- Status: draft|reviewed|blocked
- Notes:
```

## 4) Initial architecture mode
After reading PRD/requirements/features and current specs, ask one initial
architecture mode question in interactive mode, or choose the mode from
evidence in autonomous mode. Task tiers are assigned later by `/prd-to-tasks`;
`/spec-design` routes by feature/design pressure, not by task tier.

- **local_simple_backbone**: only for explicitly local/simple feature sets with no shared boundary, contract, state/data, runtime, security, or irreversible pressure; irrelevant global areas require `not_applicable` rationale.
- **standard_architecture_scaffold**: default for normal greenfield architecture scaffold; records guardrails for modules, source-of-truth, contracts, data, testing, and deployment as needed by the feature set.
- **strict_architecture_scaffold**: for public contracts, security/safety, migrations, distributed/runtime boundaries, cross-team ownership, production-sensitive behavior, or irreversible decisions.

Recommend the mode from evidence; the user may override. Preserve the rule that
`/prd-to-tasks` may route back to `/spec-design` for shared/global gaps or use
its own feature-level design phase for feature-local gaps if serious design
pressure appears during task slicing.

## 5) Backbone status gate
Update `.memory-bank/spec-backbone.md` with this exact contract:

```markdown
## Global Backbone Status
- Status: complete|minimal|blocked
- Mode: local_simple_backbone|standard_architecture_scaffold|strict_architecture_scaffold
- Architecture artifact strategy: single-file|split-core-docs|split-by-boundary-topic
- Not applicable areas:
  - event_message_contracts: not_applicable - no event/message boundary in local/simple feature set.
- Notes:
```

For `minimal`, explicit not-applicable global/shared lines must appear inside `.memory-bank/spec-backbone.md` `## Global Backbone Status` under `- Not applicable areas:` for readiness-gate compatibility. Do not use a separate heading as the authoritative source for minimal readiness; if a non-authoritative mirror exists elsewhere, the status gate still reads the lines under `## Global Backbone Status`.

Do not use `TBD`, `none`, or empty placeholders as a substitute for `not_applicable` rationale.

Status criteria:
- `complete`: every relevant/global area in the Backbone Area Matrix has a route-level decision. Rows are normally `authoritative` or `not_applicable`. A concrete contract-detail row may be `needed_before_tasks` only when the source-of-truth owner/path is routed clearly enough for `/prd-to-tasks` to complete the concrete block before dependent T2/T3 task records are created. No `unknown`, `planned`, `candidate`, or `blocked` remains in global/shared areas.
- `minimal`: only for explicit local/simple feature-set pressure; each unnecessary global/shared area has `not_applicable` plus rationale.
- `blocked`: unsafe ambiguity remains, source-of-truth conflict exists, or a required global/shared area cannot be decided truthfully.

If status is `blocked`, stop downstream work. Record:
- unresolved decision
- affected features/requirements
- why a conservative assumption would be unsafe
- next question or owner needed

## 6) Backbone Area Matrix
Maintain a concise matrix in `.memory-bank/spec-backbone.md`. It holds only labels, status, links, and gaps; detailed rules live in linked specs or ADRs.

Required columns:

| Area | Status | Authoritative source | Notes |
|---|---|---|---|

Required areas:
- `architecture_style`
- `source_of_truth`
- `module_boundaries`
- `user_scenarios`
- `constraints`
- `non_goals`
- `domain_model`
- `data_flow`
- `storage`
- `api_contracts`
- `event_message_contracts`
- `agent_io_contracts`
- `security_safety`
- `testing_strategy`
- `deployment`
- `risks`
- `open_questions`

Allowed area statuses: `authoritative`, `needed_before_tasks`, `not_applicable`, `blocked`.
Use `needed_before_tasks` only for concrete contract details that are not yet written but are safely routed to a natural owner for `/prd-to-tasks` or `/spec-improve`. It must name the candidate authoritative source, affected features, and missing concrete block in the Notes column. It does not block entering `/prd-to-tasks`, but it blocks creation of dependent T2/T3 task records until resolved to `authoritative` or `not_applicable`.

Strict/autonomous readiness cannot contain `needed_before_tasks`; `/prd-to-tasks` must resolve any affected rows before execution handoff.

## 7) Spec-index and spec-backbone content boundary
`.memory-bank/spec-index.md` is a pure spec registry/index, not an authoritative design spec or readiness/status file.

Allowed in `spec-index.md`:
- Spec Registry table
- Planned Specs table
- Broken / Missing Links
- concise Update Rules

Not allowed in `spec-index.md`:
- global backbone status, blockers, next command routing, or Backbone Area Matrix
- feature design status map; feature `spec_design_status` remains in feature frontmatter
- decision body, rationale, trade-off analysis, or architecture rules
- API naming/status/error/auth/upload rules
- state transitions, data schemas, event/message envelope rules, safety policy, or testing gate details
- duplicated content that already belongs in `.memory-bank/architecture/`, `.memory-bank/contracts/`, `.memory-bank/domains/`, `.memory-bank/states/`, `.memory-bank/testing/`, `.memory-bank/invariants.md`, or `.memory-bank/adrs/`

Allowed in `.memory-bank/spec-backbone.md`:
- Pre-PRD Spec Status and Decomposition Inputs from `/spec-init`
- Open Design Questions
- Backbone Area Matrix
- Handoff To `/prd`
- Handoff To `/spec-design`
- Global Backbone Status after `/spec-design`
- Not applicable areas and concise blockers/handoff notes

If a decision needs more than a short label plus link, write it in the relevant authoritative spec or ADR and route it from `spec-index.md`; summarize route/state in `spec-backbone.md`. If `spec-index.md` already contains old backbone/status content, migrate that state to `spec-backbone.md` and leave only registry rows and planned specs in the index.

## 8) Phase A - staged architecture decision interview
Do not use a long questionnaire. Ask one question at a time with 2-3 options, a preferred option, and a short rationale. After each answer, record the decision body and rationale in the relevant authoritative spec or ADR. Update `.memory-bank/spec-index.md` only as a registry/planned-spec index and update `.memory-bank/spec-backbone.md` with concise backbone state, status, matrix, and handoff notes.

Confirm or choose only decisions that affect the current PRD:
- architecture style
- source-of-truth hierarchy
- module/bounded-context boundaries
- persistence strategy
- API style
- frontend/backend boundary
- event/message model
- agent input/output boundaries
- schema strategy
- deployment assumptions
- testing gates
- architecture documentation granularity

For local/simple feature sets, prefer conservative defaults such as modular monolith, local/simple persistence, no event bus, no separate HTTP boundary, and minimal testing gates when supported by PRD evidence. Mark unrelated areas `not_applicable`.

In autonomous mode, do not ask questions. Record conservative assumptions only when they are reversible and safe; otherwise set backbone status `blocked`.

## 9) Architecture documentation granularity
Before creating multiple files under `.memory-bank/architecture/`, choose the architecture artifact strategy.

Ask one targeted question when scope/artifact shape is unclear. If a safe
choice is impossible, mark `blocked` instead of defaulting to one file.

Allowed strategies:
- **single-file**: keep the global architecture scaffold in `.memory-bank/architecture/system-architecture.md`; use when the feature set is explicitly tiny/local/simple or when one hub is the best readable scaffold shape.
- **split-core-docs**: create `system-architecture.md`, `source-of-truth.md`, and `module-boundaries.md` only when those sections are large, reused independently, or owned by different workstreams.
- **split-by-boundary-topic**: add extra files such as `<boundary>.md` only for large projects or complex external/runtime boundaries that would make `system-architecture.md` hard to prime.

Normal greenfield scope creates the architecture scaffold needed by the feature
set. Complex/shared scope splits only when separate files reduce real complexity
or are needed as authoritative references. Do not create
`.memory-bank/architecture/index.md` unless the architecture folder has more
than three docs. If the project already has split architecture docs, do not
churn them unless consolidation is explicitly useful.

Recommended `system-architecture.md` sections when `single-file` is selected:
- `# System Architecture`
- `## System goal`
- `## Main constraints`
- `## Non-goals`
- `## Architecture Spine` when shared-boundary, contract, state/data/runtime/security, or strict decisions need compact executable rules
- `## Architecture style`
- `## Main modules / bounded contexts`
- `## Data flow`
- `## External integrations`
- `## Storage decisions`
- `## API / contract boundaries`
- `## Security / safety constraints`
- `## Testing strategy`
- `## Deployment assumptions`
- `## Risks`
- `## Open questions`

Architecture docs content boundary:
- keep only global architecture decisions and invariants there: system shape, ownership, module boundaries, source-of-truth, deployment assumptions, high-level data flow, and diagrams
- do not put detailed API schemas, endpoint contracts, lifecycle state machines, message/event envelope contracts, or feature-local implementation design in `architecture/*`
- route those details to `.memory-bank/contracts/`, `.memory-bank/states/`, `.memory-bank/domains/`, or feature-level `.memory-bank/tech-specs/`

### Architecture Spine KISS rule

For shared-boundary, contract, state/data/runtime/security, or strict pressure, update
`.memory-bank/architecture/system-architecture.md#Architecture Spine`.

Keep the spine short and executable. It is not a narrative architecture essay.

Use stable `AD-*` blocks:

```markdown
#### AD-001 — <short decision>
- Binds:
- Prevents:
- Rule:
- Verification:
- Source:
```

Rules:
- create `AD-*` only for decisions that constrain shared-boundary, contract, state/data/runtime/security, or strict work
- do not create `AD-*` for local/simple implementation details
- do not renumber existing `AD-*`
- retire/replace decisions explicitly; do not silently delete them
- every active `AD-*` must include `Binds`, `Prevents`, and `Rule`
- `Rule` must be actionable for `/execute` and checkable by `/verify`
- put detailed rationale in ADRs or decision logs only when it is worth preserving

ADR routing remains optional. Create/update an ADR only when a decision has
durable trade-off rationale, changes source of truth, changes public
contract/schema/message envelope, introduces irreversible
storage/state/deployment/security behavior, or will be reused by more than one
feature.

## 10) Domain Spec routing
Route domain model work through the Backbone Area Matrix as `domain_model` with status `authoritative`, `needed_before_tasks`, `not_applicable`, or `blocked`.

Domain Spec is not a mandatory heavy phase for every project:
- If the feature set is local/simple and PRD/requirements/features already define the needed vocabulary and rules clearly enough, set `domain_model: not_applicable` with a short rationale, or link the authoritative PRD/requirements/features source.
- If domain logic is feature-local, route it to the `/prd-to-tasks FT-<NNN>` feature-level design phase and the feature tech-spec instead of creating a global Domain Spec.
- If the domain model affects modules, contracts, storage, states, security/safety, runtime behavior, or shared boundaries, `/spec-design` creates or updates a minimal `.memory-bank/domains/<domain>.md` or `.memory-bank/domains/runtime-data-model.md` as the global/shared authoritative source.

Minimal Domain Spec sections:
- main entities
- user roles
- business rules
- entity states
- lifecycle
- domain constraints
- links to contracts, states, and storage specs

Boundaries:
- Domain Spec owns domain vocabulary, model, and business rules.
- Detailed state machines live in `.memory-bank/states/*`.
- DB schemas, migrations, and runtime data details live in `.memory-bank/domains/runtime-data-model.md` or schema/contract docs.

## 11) Phase B - write initial global specs
Write or update only relevant backbone artifacts:
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/user-scenarios.md` when scenario evidence exists or a scenario gap must be explicit
- `.memory-bank/architecture/system-architecture.md` when selected or needed as the architecture hub, using the sections above, Architecture Spine for shared-boundary, contract, state/data/runtime/security, or strict executable rules, and Mermaid C4/context/container/component, data flow, and sequence diagrams when useful
- `.memory-bank/architecture/source-of-truth.md` only when Split core docs or Split by boundary/topic was selected, or when source-of-truth rules are too large/reused to keep in `system-architecture.md`
- `.memory-bank/architecture/module-boundaries.md` only when Split core docs or Split by boundary/topic was selected, or when boundary rules are too large/reused to keep in `system-architecture.md`
- `.memory-bank/architecture/<boundary>.md` only for a complex dedicated architecture boundary that cannot stay readable inside `system-architecture.md`
- `.memory-bank/domains/runtime-data-model.md`
- `.memory-bank/domains/<domain>.md` only when shared domain vocabulary/model/rules are needed before tasks
- `.memory-bank/contracts/api-guidelines.md`
- `.memory-bank/contracts/http-api.md` or `.memory-bank/contracts/openapi.md` only when a separate HTTP boundary spec is needed
- `.memory-bank/contracts/agent-chat-bus.md` if agent/event/chat boundary exists
- `.memory-bank/contracts/message-envelope.md` if messages/events/envelopes exist
- `.memory-bank/guides/frontend-component-guide.md` if frontend component system/design behavior is in scope
- `.memory-bank/glossary.md`
- `.memory-bank/invariants.md`
- `.memory-bank/testing/*`
- `.memory-bank/adrs/*` for stable architecture decisions
- `.memory-bank/foundation.md` only when a Foundation Dev Path decision or explicit non-requirement must be recorded

Keep output conservative. Prefer updating an existing authoritative spec over creating a new one.
Prefer fewer architecture files for faster priming; split only when it removes real complexity or matches the selected artifact strategy.
Keep architecture docs global: if the content is an API schema, lifecycle state machine, message/event contract, or feature-local behavior, create or update the relevant contract/state/domain/tech-spec instead of expanding `architecture/*`.

Do not create:
- `.memory-bank/tasks/*.task.json`
- `.memory-bank/tasks/plans/*`
- feature-local `.memory-bank/tech-specs/FT-*.md`
- implementation plans
- separate diagrams folders; diagrams belong as Mermaid sections in `.memory-bank/architecture/system-architecture.md`
- extra architecture files just because a standard filename exists in this command

## 11.1) Foundation Dev Path decision
After the FT set and global backbone evidence exist, decide whether the project
needs a verified executable baseline before product feature implementation.

Always create or update `.memory-bank/foundation.md` during `/spec-design`.
Downstream product tasking requires an explicit foundation decision, even when
no separate foundation queue is needed.

Minimal required shape:

```markdown
---
description: Foundation Dev Path evidence and feature pressure map.
status: active
---
# Foundation Dev Path

## Gate Anchors
- Foundation Required: true|false
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: pending_foundation_to_tasks|TASK-<NNN>-T<N>-FT-000-W<N>|not_required

## Minimal Work Path
- Build command:
- Start command:
- Primary entrypoint:
- Smoke path:
- Test command:
- Evidence:

## Feature Pressure Map
| Feature | Pressure | Foundation Response | Probe | Status |
|---|---|---|---|---|

## Deferred Decisions
| Decision | Why deferred | Trigger to revisit |
|---|---|---|

## Foundation Exit Criteria
- minimal path passes
- compatibility probes pass
- no P0/P1 design pressure unresolved
- feature dev path allowed
```

Rules:
- set `Foundation Required: true` when planned features cannot safely start
  without a walking skeleton, runtime path, test harness, entrypoint, storage
  baseline, contract boundary, or compatibility probe
- for `Foundation Required: true`, set
  `Foundation Gate Task: pending_foundation_to_tasks`; the concrete final gate
  task id is created later by `/foundation-to-tasks`
- set `Foundation Required: false` when existing code/baseline or project
  simplicity makes a separate foundation queue unnecessary; set
  `Foundation Gate Task: not_required` and record rationale
- in brownfield, default to `Foundation Required: false` when the existing
  executable baseline is already evidenced well enough for the planned delta;
  use `/foundation-to-tasks --verify-existing` only when baseline proof is
  still needed before product feature work
- keep the Feature Pressure Map grounded in current PRD/features/specs; do not
  convert product behavior into foundation work
- do not create `REQ-000`, `FT-000`, task records, packets, protocols, or
  implementation plans in `/spec-design`
- route required executable work to `/foundation-to-tasks`

## 12) Verifiable contracts routing
For AI-first architecture, route concrete contracts to verifiable artifacts when relevant:
- OpenAPI
- JSON Schema
- Pydantic models or equivalent stack schemas
- DB schema / migrations
- event/message schemas
- agent input/output schemas

KISS rule: `/spec-design` must decide each relevant contract area as `authoritative`, `needed_before_tasks`, `not_applicable`, or `blocked`. It does not need to write every concrete contract immediately.

Use contract-area routing this way:
- `authoritative`: a linked spec already owns enough detail for downstream tasking, or the area is governed by an existing stack-native source.
- `needed_before_tasks`: feature tasking can enter `/prd-to-tasks`, but dependent T2/T3 task records must not be created until `/prd-to-tasks` writes or links the missing concrete block in the routed owner.
- `not_applicable`: the current feature set has no such boundary; include a rationale.
- `blocked`: the owner, boundary, or decision is unsafe to choose without user/external evidence; stop downstream work.

Do not mark an area `needed_before_tasks` for unresolved product or architecture choices. Use it only when the owner is clear and the remaining work is making an implementation contract concrete.

OpenAPI is not the source of truth for the whole system.

Rules:
- backend schemas such as FastAPI/Pydantic, or equivalent stack schemas, should generate OpenAPI when that stack exists or is selected
- `.memory-bank/contracts/api-guidelines.md` defines naming, status codes, error format, auth, CORS, upload, pagination, and compatibility rules
- OpenAPI covers only frontend/backend HTTP API
- agent/domain/event/state/safety contracts live in separate specs
- do not write a large hand-written `openapi.yaml` before architecture design
- gate: generated OpenAPI validates and critical endpoints have integration/contract tests

## 13) Phase C - targeted follow-up interviews
While writing boundary/data/testing specs, ask follow-up questions only for unresolved branch decisions that block truthful specs.

Examples:
- the data model needs retention or migration rules not present in PRD
- HTTP API exists but auth/error/upload behavior is undecided
- event/message boundary exists but envelope or ordering rules are undecided
- agent I/O boundary exists but schemas, ownership, or failure semantics are unclear
- frontend component behavior is normative but ownership/design system source is unclear

If the answer is unavailable and a safe assumption is not possible, mark backbone status `blocked` and stop.

## 14) Update routing
Update `.memory-bank/spec-backbone.md`:
- exact `## Global Backbone Status` section and `- Status: complete|minimal|blocked` line
- Backbone Area Matrix with authoritative links or explicit `not_applicable` rationale
- source-of-truth route labels and links; detailed hierarchy/rules live in the selected architecture artifact (`system-architecture.md` when single-file is selected, or `source-of-truth.md` when split)
- global backbone blockers and next command routing
- architecture artifact strategy and baseline backbone specs with their scope
- short backbone decision labels only, never decision body/rationale/rules
- handoff to `/prd-to-tasks` or `/spec-auto`

Update `.memory-bank/spec-index.md` only as a pure registry:
- add or update authoritative spec rows
- add or update planned spec rows
- record broken/missing links
- keep update rules concise

For affected feature docs:
- add SDD Design Gate notes with normative backbone links where evidence exists
- do not set `spec_design_status: complete` unless feature-local design criteria are already fully satisfied
- do not mark `not_required` for features that still depend on shared-boundary,
  contract, state/data/runtime/security, or strict backbone decisions

## 15) Handoff
Report:
- backbone status: `complete`, `minimal`, or `blocked`
- architecture mode and evidence
- architecture artifact strategy: single-file, split core docs, or split by boundary/topic
- specs created/updated
- Backbone Area Matrix summary
- not_applicable areas and rationale for local/simple feature-set pressure
- affected features and normative links
- foundation decision: `required`, `not_required`, or `blocked`
- foundation next step: `/foundation-to-tasks`, or `none` when
  `Foundation Gate Task: not_required`
- blockers/open questions
- next command routing:
  - if status is `complete`, or valid `minimal` with explicit `not_applicable` areas, and foundation is required: `/foundation-to-tasks`, then `/mb-doctor` at the foundation/task-queue boundary
  - if status is `complete`, or valid `minimal` with explicit `not_applicable` areas, and foundation is not required: `/prd-to-tasks FT-<NNN>` for manual flow, or `/spec-auto --all` before `/prd-to-tasks --all` in autonomous flow
  - if status is `blocked`: no downstream command; resolve the blocker, user decision, or spec gap, then rerun `/spec-design`

</process>
