# SDD Contracts Improvement Handoff

## Problem

Current SDD planning can mark design as ready while the key implementation
contracts are still prose-level. Agents may see linked specs and task records,
but still have to guess endpoint shape, state transitions, schema fields,
message envelopes, storage ownership, domain invariants, security behavior, or
verification targets.

That is dangerous mostly for T2/T3 work: tasks can look disciplined, reviewed,
and packetized, but still be impossible to implement safely without inventing a
contract during coding. The result is architectural drift, incompatible APIs,
weak verification, hidden state bugs, and follow-up rework that should have
been prevented before task creation.

We introduce these improvements to make contract readiness explicit without
turning DevRails into a heavy schema-first process. The goal is not to require
OpenAPI/JSON Schema/ADR for everything. The goal is to ensure that when a task
depends on a real boundary, there is enough concrete spec to implement and
verify it without guessing.

## Context

Current SDD flow lets `/spec-design` and `/spec-improve` produce useful
architecture/policy prose, but it does not consistently force concrete
contract-level specs before T2/T3 work.

The target change is intentionally KISS: do not turn SDD into a heavy
schema-first process. Keep `/spec-design` as the global routing/backbone gate,
and enforce minimal contract concrete-ness at the point where feature tasks are
created and reviewed.

## Goal

Prevent T2/T3 tasks from being created or approved when implementation would
require guessing API, state, schema, message, storage, domain, agent I/O, or
security contracts.

## Duplicate Risk

The duplicate-spec risk is high enough to handle explicitly.

The same contract can look like it belongs in several places:

- feature tech-spec vs shared `.memory-bank/contracts/*`
- `.memory-bank/contracts/api-guidelines.md` vs HTTP/OpenAPI docs
- `.memory-bank/domains/<domain>.md` vs `.memory-bank/domains/runtime-data-model.md`
- `.memory-bank/states/*` vs domain lifecycle sections
- Architecture Spine `AD-*` vs detailed contract/state/domain specs
- per-feature concrete blocks vs shared specs needed by several features

Existing command docs already say to search existing specs and avoid duplicate
specs, but that is too weak for concrete contracts. Agents need a small
source-of-truth resolution rule before they write or repair contract blocks.

Do not solve this by turning `.memory-bank/spec-index.md` into a deep ownership
map. That would overload the index and make it compete with the specs
themselves as source of truth.

KISS ownership model:

- `.memory-bank/spec-index.md` stays a broad registry: spec type, path, status,
  owner command, broad scope, broken links.
- `.memory-bank/spec-backbone.md` keeps area-level routing/readiness:
  `api_contracts`, `states`, `storage`, `domain_model`, etc.
- Exact concrete ownership lives in the authoritative spec file itself.
- `/prd-to-tasks` and `/spec-improve` use the index/backbone only to find
  candidate specs, then open those specs and resolve ownership locally.

## Core Design

### 1. `/spec-design` routes contract areas only

`/spec-design` decides which contract areas exist and where their source of
truth should live. It does not need to write every concrete schema.

Contract areas:

- `api_contracts`
- `event_message_contracts`
- `agent_io_contracts`
- `storage`
- `states`
- `domain_model`
- `security_safety`

Each area must be marked as one of:

- `authoritative`
- `needed_before_tasks`
- `not_applicable`
- `blocked`

Rule: if feature tasks cannot be created safely without concrete contract
details, the area is `needed_before_tasks`, not an implicit "later".

Important nuance: `needed_before_tasks` does not block entering
`/prd-to-tasks`. It blocks creation of dependent T2/T3 task records until
`/prd-to-tasks` writes the missing concrete block or routes the feature to
`/spec-improve`.

### 2. `/prd-to-tasks` writes minimum concrete contracts before T2/T3

This is the main enforcement point.

Before creating any T2/T3 task, `/prd-to-tasks FT-<NNN>` must check whether the
task depends on an API/state/schema/message/storage/domain/agent/security
boundary.

If yes, there must be a linked authoritative spec that is implementable without
guessing and contains the minimum concrete block:

- `shape`: fields, endpoint, states, message, storage entity, or boundary shape
- `rules`: `MUST` / `MUST NOT`
- `edge cases/errors`
- `verification target`

No mandatory OpenAPI, JSON Schema, ADR, or one-file-per-contract requirement.
Use the simplest existing doc that can be authoritative:

- `.memory-bank/contracts/*`
- `.memory-bank/states/*`
- `.memory-bank/domains/*`
- `.memory-bank/tech-specs/FT-<NNN>-*.md`
- `.memory-bank/testing/*`
- `.memory-bank/guides/*` only when the guide is the normative source for UI or
  operating behavior

If the concrete block is missing, `/prd-to-tasks` must either:

- update the existing natural spec location before creating the task; or
- stop and route to `/spec-improve FT-<NNN>` when the decision needs manual
  repair/clarification.

`/prd-to-tasks` must follow the shared anti-duplication policy before writing
any concrete contract block.

### 3. `/spec-improve` is a manual repair pass

`/spec-improve FT-<NNN>` is not a mandatory happy-path phase.

Use it when `/spec-design`, `/prd-to-tasks`, or review finds that feature design
is too vague for safe task creation.

Default behavior:

- update an existing tech-spec/contract/state/domain/testing doc;
- avoid creating new files when a natural authoritative home already exists;
- create a new spec only when no existing doc can cleanly own the contract;
- mark the feature `spec_design_status: complete` only when required concrete
  blocks exist or are explicitly not applicable.

`/spec-improve` must follow the same shared anti-duplication policy before
writing any concrete contract block. This prevents `/spec-improve` from becoming
an escape hatch that creates duplicate feature-local specs.

### 4. `/review-tasks-plan` checks one contract-readiness question

Do not add a new doctor or workflow.

Fresh-context review must explicitly answer:

> Can every T2/T3 task be implemented without guessing API, state, schema,
> message, storage, domain, agent I/O, or security contracts?

It should also check whether a T2/T3 task depends on duplicated or conflicting
contract sources. If two docs both look authoritative for the same concrete
contract, verdict must not be `APPROVE`.

If no, verdict must not be `APPROVE`.

Route:

- back to `/prd-to-tasks FT-<NNN>` when the command can complete the missing
  concrete block;
- to `/spec-improve FT-<NNN>` when a focused manual repair/clarification pass is
  needed.

## Anti-Duplication Policy

This policy applies to both `/prd-to-tasks` and `/spec-improve`.

Before either command creates or repairs a concrete contract block, it must
resolve the authoritative owner for that contract.

### 1. One concrete owner

Each concrete contract block has exactly one authoritative owner.

Other docs may summarize, reference, or route to that owner, but they must not
restate `shape`, `rules`, `edge cases/errors`, or `verification target` as a
second source of truth.

Every new or materially updated concrete contract spec should include a short
ownership statement near the top:

```markdown
## Ownership
- Owns:
- Does not own:
- Related specs:
```

Keep this statement concise. It is a routing aid, not a contract registry.
Existing specs do not need to be retrofitted all at once; add or repair the
ownership statement when a command touches that spec for concrete contract work.

### 2. Owner selection rule

Use this KISS rule before writing a concrete block:

1. Find candidate specs from `.memory-bank/spec-index.md`,
   `.memory-bank/spec-backbone.md`, feature `spec_design_links`, and existing
   folders.
2. Prefer updating the existing authoritative owner. If ownership is unclear,
   do not create a new spec.
3. Create a new spec only with a short rationale, then link it back from
   `.memory-bank/spec-index.md` and the feature.

The short rationale for a new spec must say why an existing owner was not used:

- no existing spec owns this boundary;
- adding the block to an existing spec would mix unrelated responsibilities; or
- the new spec is the selected shared owner for future related features.

If candidate specs have no ownership statement or the statements conflict,
repair the ownership statement in the natural existing owner. If the ambiguity
is shared/global, route back to `/spec-design`.

### 3. Owner hints, not an ownership map

Use these as routing hints after finding candidate specs. Do not turn
`.memory-bank/spec-index.md` into a detailed ownership map.

- `.memory-bank/contracts/api-guidelines.md` owns cross-cutting API naming,
  status/error/auth/pagination/upload/compatibility rules.
- `.memory-bank/contracts/http-api.md`, `.memory-bank/contracts/openapi.md`, or
  stack-native schema docs own concrete HTTP boundary shapes when that boundary
  exists.
- `.memory-bank/contracts/message-envelope.md` or an existing event contract
  owns event/message envelope rules.
- `.memory-bank/contracts/<agent-boundary>.md` owns agent I/O contracts.
- `.memory-bank/domains/<domain>.md` owns domain vocabulary and business
  invariants.
- `.memory-bank/domains/runtime-data-model.md` or an existing storage spec owns
  runtime data/storage ownership, migrations, retention, and seed data.
- `.memory-bank/states/<lifecycle>.md` owns lifecycle/state-machine transition
  guards.
- `.memory-bank/architecture/system-architecture.md#Architecture Spine` owns
  short cross-cutting guardrails only; detailed contract/state/domain blocks
  live in the relevant spec.
- `.memory-bank/tech-specs/FT-<NNN>-<slug>.md` owns only genuinely
  feature-local behavior with no shared reuse.

### 4. Shared need routes upward

If the missing contract is needed by multiple features or changes a shared
boundary, `/prd-to-tasks` and `/spec-improve` must not create duplicate
feature-local concrete blocks.

They should update the shared owner. If the shared owner or decision is unclear,
route back to `/spec-design` instead of choosing locally.

### 5. Register and link

After writing or repairing a concrete block:

- update `.memory-bank/spec-index.md` as registry only;
- link the authoritative owner from feature `spec_design_links`;
- copy task-relevant links into task records through existing fields such as
  `source_artifacts`, `normative_inputs`, `constraints`, `invariants`, or
  `verification_targets`;
- do not duplicate the concrete block in task records or packets.

## Packet Refresh Rule

Small operational rule, not a new process:

If a task record changes after its Execution Packet was generated, run
`/mb-packet TASK-NNN-TN-FT-NNN-WN` to refresh the packet before execution,
verification, autopilot, or strict readiness handoff.

Add this rule to `/prd-to-tasks` and `/mb-packet` docs.

## Expected Source Touch Points

- `skills/_shared/references/commands/spec-design.md`
- `skills/_shared/references/commands/prd-to-tasks.md`
- `skills/_shared/references/commands/spec-improve.md`
- `skills/_shared/references/commands/review-tasks-plan.md`
- `skills/_shared/references/commands/mb-packet.md`
- `skills/_shared/references/protocols/packet-template.json` only if packet
  metadata needs a documented freshness hint; avoid changing schema unless
  necessary.
- `skills/mb-garden/assets/mb-doctor.mjs` only if there is already enough
  deterministic evidence to check freshness or missing T2/T3 contract links
  without false positives.
- `README.md`, `howItWorks.md`, `GREENFIELD_WORKFLOW.md` only for concise docs
  sync after command behavior changes.

Do not edit generated `skills/*/{agents,references,scripts}/shared-*` files.
Shared behavior lives in `skills/_shared/`.

## Acceptance Criteria

- `/spec-design` clearly treats contract areas as routed areas with
  `authoritative|needed_before_tasks|not_applicable|blocked`.
- `/spec-design` does not require full concrete schemas for every area.
- `/prd-to-tasks` cannot create a T2/T3 task that depends on a contract boundary
  unless a linked authoritative spec contains the minimum concrete block.
- `/prd-to-tasks` may write the missing concrete block in the natural existing
  spec location before creating the task.
- `/prd-to-tasks` routes to `/spec-improve FT-<NNN>` when the missing contract
  cannot be truthfully completed without manual repair/clarification.
- `/spec-improve` defaults to updating existing specs and remains a repair pass,
  not a required workflow phase.
- `/prd-to-tasks` and `/spec-improve` both enforce one authoritative owner for
  each concrete contract block.
- Exact concrete ownership is declared in the authoritative spec itself, while
  `spec-index.md` remains a broad registry rather than a deep ownership map.
- `/prd-to-tasks` and `/spec-improve` update existing specs before creating new
  specs, and use feature tech-specs only for genuinely feature-local contracts.
- Shared or multi-feature contract needs route to a shared owner or back to
  `/spec-design`, not duplicate feature-local concrete blocks.
- `/review-tasks-plan` explicitly rejects T2/T3 tasks that require guessing
  contract details.
- `/review-tasks-plan` rejects T2/T3 tasks when duplicated/conflicting contract
  sources make the authoritative owner unclear.
- `/mb-packet` docs state that packets must be refreshed when task records
  change after packet generation.
- Source-only hygiene remains intact: no generated package-local `shared-*`
  files appear in the repo.

## Verification

Run after implementation:

```bash
npm run check:syntax --silent
node -e 'JSON.parse(require("node:fs").readFileSync("skills/_shared/references/protocols/packet-template.json", "utf8")); console.log("packet template ok")'
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
node scripts/install-framework.mjs --skill '*' --yes
```

The `find` command must print `0`.

## Non-Goals

- No mandatory OpenAPI/JSON Schema for every feature.
- No new doctor workflow.
- No new task lifecycle status.
- No separate contract registry unless later evidence proves it is necessary.
- No broad architecture rewrite.
- No generated `shared-*` files committed to source.
