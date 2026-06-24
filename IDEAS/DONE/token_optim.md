# Token optimization: manual greenfield

Scope:
- Only manual greenfield workflow.
- `autonomous` and `autopilot` are not optimization targets here.
- `/review-tasks-plan` is intentionally out of scope; it will be handled separately.
- Goal: reduce repeated LLM context and workflow gates without weakening T2/T3 safety.

Core rule:

```text
Manual greenfield should be tier-routed, not gate-routed.

T0/T1:
  small execution context
  /execute may finish with compact local evidence
  no standalone /verify by default
  no full /mb-sync by default
  no /mb-doctor by default

T2:
  /execute -> /verify
  full protocol
  required packet/spec gates
  /mb-sync at wave/feature boundary unless broader state must be reconciled earlier
  /red-verify --feature before feature completion

T3:
  /execute -> /verify -> /red-verify -> /mb-sync
```

Non-goals:
- Do not reduce T2/T3 packet, protocol, verify, or semantic safety rules.
- Do not add new workflow commands, registries, schemas, or lifecycle states.
- Do not make `mb-doctor` validate subjective quality.

---

## 1. Fresh execution priming is the largest hidden per-task cost

Current `AGENTS.md` priming pushes broad planning context into every fresh agent session: Constitution, MBB index, `spec-backbone.md`, `spec-index.md`, `.memory-bank/index.md`, role docs, and task/feature docs.

That is useful for planning/design. It is too expensive for manual `/execute TASK`, especially for T0/T1 tasks.

### Change

Split priming by mode.

```text
Planning/design priming:
  AGENTS.md
  constitution.md
  mbb/index.md
  spec-backbone.md
  spec-index.md
  memory-bank/index.md
  relevant planning docs

Manual execution priming:
  AGENTS.md
  selected task record
  tier-policy
  linked feature/REQ only when needed
  required packet only when required by tier/policy
  linked specs only when task/feature actually references them
```

For manual T0/T1 execution, do not load Constitution, MBB, full backbone/index docs, role docs, or the full Memory Bank index by default.

Target rule:

```text
Manual execution agents load the smallest tier-routed context needed to implement the selected task.
Planning/global docs are not default execution context unless the task record, feature, tier, packet, or linked specs route to them.
```

Priority: very high. This repeats on every fresh task session.

---

## 2. T0/T1 should not use standalone `/verify` by default

The current high-level workflow visually anchors `/execute -> /verify`. That is right for T2/T3. For T0/T1 it often costs more than the task.

### Change

Introduce a clear manual T0/T1 fast lane.

```text
T0 manual:
  /execute TASK
  inspect the tiny change or run a trivial check when useful
  may close with compact evidence or a no-runnable-check note
  no standalone /verify by default

T1 manual:
  /execute TASK
  run the cheapest relevant local check when available
  if no runnable check exists, record why
  no standalone /verify by default
```

Minimal closure evidence is enough. Record it in both task `verify` and
`.protocols/<TASK>/run.md` when `/execute` closes a T0/T1 task.

```text
VERDICT: PASS
Evidence: changed file/link/text inspected, or targeted check passed.
Checks: <command> -> pass, or no runnable check exists because <reason>.
```

For T0, no check is acceptable when the change is a typo, formatting, broken link, or safe docs-only edit and the explicit closure owner inspected the diff.

For T1, prefer one cheap local check when available. If there is no meaningful local check, do not create a fake one; record the reason.

KISS closure model:

```text
/execute may close a task only when all conditions are true:
  - task.tier is T0 or T1
  - current agent is the manual top-level executor, not a subagent
  - user request or current manual workflow gives explicit closure ownership
  - no required packet is involved
  - implementation stayed inside task scope
  - no T2/T3 trigger appeared during execution
  - compact evidence was written
```

No new command, flag, task status, owner file, or validator is needed.

When the conditions pass, `/execute` may do only these closure writes:

```text
1. write/update .protocols/<TASK>/run.md
2. append compact PASS evidence to task.verify
3. set task.status = done
```

When any condition is missing, `/execute` leaves the task open and reports the next owner action:

```text
- run /verify
- ask the explicit owner to close
- retier/split the task if scope became T2/T3
```

Standalone `/verify` should run only when:

```text
- task is T2/T3
- user explicitly asks for independent verification
- acceptance criteria are unclear
- implementation scope grew
- /execute cannot produce credible evidence
- public contract, state, data, security, runtime, or cross-module behavior changed
```

Target rule:

```text
For manual T0/T1, /execute may produce compact closure evidence and local verdict.
Standalone /verify is optional and should be used only for uncertainty, widened scope, or explicit request.
```

Priority: very high. This removes one full LLM run from most simple tasks.

---

## 3. `/mb-sync` should be boundary sync, not per-task habit

`/mb-sync` is not a closure command. It must not decide task closure, failure, promotion, blocking, packet status, or dependent task state.

The problem is wording: if every task status, `verify`, evidence link, and protocol link is treated as requiring full sync, manual execution becomes a broad reconcile loop after every small task.

Clarification:

```text
"No full /mb-sync by default" does not mean "leave Memory Bank state stale".
It means local task closure can update the authoritative task record and compact evidence directly.
```

Full `/mb-sync` means broad reconciliation work:

```text
RTM/lifecycle/changelog/index/router/spec/contract/guide consistency.
```

Local task closure means narrow task-local writes:

```text
task.status
task.verify
.protocols/<TASK>/run.md
```

### Change

Manual local T0/T1 closure may update only `task.status`, `task.verify`, and
compact `.protocols/<TASK>/run.md` without invoking full `/mb-sync`.

Full `/mb-sync` runs when the result changes broader durable Memory Bank state or crosses a risk boundary.

```text
No full /mb-sync by default:
  - T0/T1 local code/docs fix
  - only task.status, task.verify, and compact .protocols/<TASK>/run.md changed
  - no RTM, lifecycle, index, changelog, spec, contract, guide, packet, or dependency state changed

Run full /mb-sync:
  - feature lifecycle changes
  - requirements RTM changes
  - changelog/index/router updates are needed
  - architecture/contracts/specs/guides changed
  - dependency or promotion state must be reconciled
  - T2 wave/feature boundary
  - T2 feature completion after feature-level red-verify
  - T3 task closure
  - before handoff to another agent when they must see fresh Memory Bank state
  - before optional review gates when reviewer needs current durable state
  - suspected drift between code, tasks, features, and docs
```

For T2 manual tasks, keep `/verify` and full protocol. Do not force full `/mb-sync` after every task unless the next step depends on reconciled Memory Bank state beyond the task record. Sync at wave/feature boundary is enough for ordinary linear manual work.

For T3, keep `/mb-sync` after closure.

Dependency note:

```text
Skipping full /mb-sync must not silently promote dependents.
If the next task depends on broader reconciled state, run /mb-sync or let the explicit owner update the next task deliberately.
```

Target rule:

```text
/mb-sync reconciles broader Memory Bank state.
It is not required for local manual T0/T1 closure when only task.status,
task.verify, and .protocols/<TASK>/run.md changed.
```

Priority: high. This removes repeated broad Memory Bank reconciliation from small manual work while preserving resumability through task records and compact evidence.

---

## 4. `/mb-doctor` is conditional in manual T0/T1

`mb-doctor` is deterministic and useful, but putting it in the manual happy path turns small manual work into scheduler-style readiness management.

### Change

```text
Manual T0/T1:
  skip /mb-doctor by default

Manual T2:
  run when the queue has dependencies, required packets, foundation, stale docs, or risky links

Manual T3:
  run

Before autonomous/autopilot/handoff:
  run
```

Target rule:

```text
In manual greenfield, /mb-doctor is a conditional readiness check, not a default gate for simple T0/T1 execution.
```

Priority: medium. Main gain is less workflow noise and less forced context expansion.

---

