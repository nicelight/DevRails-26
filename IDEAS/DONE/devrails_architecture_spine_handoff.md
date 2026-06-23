# KISS Handoff: Architecture Spine for T2/T3 Work

## Goal

Добавить в DevRails компактный **Architecture Spine** для серьезных задач.

Spine не является новым workflow и не заменяет `/spec-design`. Это короткий
раздел в существующей архитектуре, который фиксирует только те решения и
инварианты, без которых независимые агенты могут построить несовместимые части
системы.

Формула:

```text
Architecture Spine = минимальные executable rules для T2/T3 и shared-boundary работы.
```

## Scope

Внедрять только для:

- `T2` / `T3` tasks;
- shared module/domain boundaries;
- public contracts/API/message envelopes;
- storage/state/security/runtime decisions;
- brownfield changes, где новая работа может конфликтовать с existing baseline.

Не применять как обязательный слой для простых `T0` / `T1` задач.

## Non-Goals

Не делать:

- отдельный BMAD-like workflow;
- отдельную `/architecture` команду;
- `_bmad/`, `architecture-runs/` или новые top-level директории;
- новую task schema;
- обязательный ADR на каждое решение;
- strict doctor gate, который блокирует все T2/T3 без разбора;
- full architecture essay generator.

## Existing Model To Reuse

Использовать текущие DevRails locations:

```text
.memory-bank/architecture/system-architecture.md
.memory-bank/contracts/boundary-map.md
.memory-bank/adrs/
.memory-bank/spec-backbone.md
.memory-bank/spec-index.md
.memory-bank/tasks/*.task.json
```

Использовать существующие task fields:

```json
{
  "normative_inputs": [],
  "constraints": [],
  "invariants": [],
  "verification_targets": []
}
```

Новые task fields не добавлять.

## Behavior

### 1. `/spec-design`

Update:

```text
skills/_shared/references/commands/spec-design.md
skills/_shared/references/structure-template.md
skills/_shared/scripts/init-mb.js
```

`/spec-design` должен создавать или обновлять:

```text
.memory-bank/architecture/system-architecture.md#Architecture Spine
```

только когда есть T2/T3 или shared-boundary pressure.

Minimal section:

```md
## Architecture Spine

### Architecture Decisions

#### AD-001 — <short decision>
- Binds:
- Prevents:
- Rule:
- Verification:
- Source:

### Deferred Decisions

| Decision | Deferred because | Revisit when |
|---|---|---|
```

Rules:

- `AD-*` IDs are stable.
- Do not renumber existing `AD-*`.
- Retire/replace decisions explicitly; do not silently delete them.
- Every active `AD-*` must include `Binds`, `Prevents`, and `Rule`.
- `Rule` must be actionable for `/execute` and checkable by `/verify`.
- Deferred decisions need a concrete revisit condition.
- Rationale may live in ADR or decision log; spine stays short.

### 2. ADR Routing

ADRs remain optional.

Create or update an ADR only when the decision has durable trade-off/rationale
that future agents must not lose, especially:

- architecture style/source-of-truth decision;
- public contract/API/schema/message envelope decision;
- irreversible storage/state/deployment/security decision;
- decision reused by more than one feature.

Do not create ADRs for local feature details, obvious conventions, temporary
assumptions, or details that belong in contracts/states/domains/tech-specs.

Expected relation:

```text
system-architecture.md#AD-003 = executable rule
ADR-003 = rationale/consequences, only when needed
task.normative_inputs = links relevant AD/ADR
```

### 3. Boundary Cards

Update:

```text
.memory-bank/contracts/boundary-map.md template source
skills/_shared/references/structure-template.md
skills/_shared/scripts/init-mb.js
```

Keep `boundary-map.md` lightweight. Add a compact boundary-card format:

```md
## Boundary: <producer> -> <consumer>

- Owner:
- Consumers:
- Allowed calls:
- Forbidden calls:
- Data owner:
- Compatibility rule:
- Verification:
- Linked ADs:
```

Do not duplicate detailed API schemas there. Detailed contracts stay in
`.memory-bank/contracts/*`, `.memory-bank/states/*`, `.memory-bank/domains/*`,
or `.memory-bank/tech-specs/*`.

### 4. `/prd-to-tasks`

Update:

```text
skills/_shared/references/commands/prd-to-tasks.md
```

When slicing T2/T3 or shared-boundary tasks:

- read relevant Architecture Spine decisions and boundary cards;
- copy relevant links into `normative_inputs`;
- copy executable rules into `constraints` or `invariants`;
- add verification expectations into `verification_targets`;
- stop with a design blocker if a required T2/T3 boundary decision is missing
  or contradictory.

Example:

```json
{
  "normative_inputs": [
    ".memory-bank/architecture/system-architecture.md#AD-001",
    ".memory-bank/contracts/boundary-map.md#boundary-api-client"
  ],
  "constraints": [
    "AD-001: Backend owns state mutation; frontend cannot write storage directly."
  ],
  "verification_targets": [
    "Verify implementation does not bypass the service/domain boundary."
  ]
}
```

## Minimal Validation

### `mb-lint`

Update:

```text
skills/mb-garden/assets/mb-lint.mjs
```

Keep checks deterministic and small:

- duplicate active `AD-*` IDs in `system-architecture.md`;
- active `AD-*` missing `Binds`, `Prevents`, or `Rule`;
- task `normative_inputs` / `constraints` / `invariants` / `verification_targets`
  references missing local `.memory-bank/architecture/*`,
  `.memory-bank/contracts/*`, or `.memory-bank/adrs/*` files.

No semantic inference in lint.

### `mb-doctor`

Update only if it stays simple:

```text
skills/mb-garden/assets/mb-doctor.mjs
```

Recommended minimal behavior:

- `--strict` may warn when a `T2` / `T3` task has no architecture/contract/ADR
  references in existing task fields.
- Fail only when the task clearly references a missing architecture/contract/ADR
  path, or when `mb-lint` fails.

Do not make doctor infer whether every T2/T3 task "should have" an AD. That
would add brittle semantics and make the workflow heavier.

## Implementation Plan

1. Update `/spec-design` wording and generated skeleton templates.
2. Add `Architecture Spine` template to `system-architecture.md` generation.
3. Add boundary-card template to `boundary-map.md` generation.
4. Update `/prd-to-tasks` to route relevant AD/boundary links into existing task fields.
5. Add small `mb-lint` checks.
6. Add only minimal `mb-doctor` warning/fail behavior described above.
7. Update README/howItWorks briefly.

## Acceptance Criteria

- Fresh bootstrap creates short guidance for `Architecture Spine` and boundary cards.
- `/spec-design` treats Architecture Spine as the compact output for T2/T3/shared-boundary pressure.
- `/prd-to-tasks` links relevant ADs/boundaries into existing task fields.
- No task schema changes.
- No new workflow command.
- `T0` / `T1` happy path remains lightweight.
- `mb-lint` catches malformed AD blocks and broken architecture/contract/ADR paths.
- `mb-doctor --strict` does not introduce broad semantic blocking for missing ADs.
- Source-only packaging remains clean; generated `shared-*` files are not committed.

## Verification

Run:

```bash
npm run check:syntax --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
node scripts/install-framework.mjs --bootstrap --target "$(mktemp -d)" --yes
```

Expected:

- syntax passes;
- generated `shared-*` count is `0`;
- bootstrap succeeds and generated Memory Bank contains the new short templates.
