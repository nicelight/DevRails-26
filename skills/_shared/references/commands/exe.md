---
description: Implement one indexed JSON task within its semantic and hard runtime boundaries, then produce tier-routed evidence and handoff.
status: active
---
# /exe - Execute one TASK

<objective>
Implement one selected `TASK-NNN-TN-FT-NNN-WN` and leave reproducible
protocol/evidence for verification and the lifecycle owner. `/exe` is not a
scheduler.
</objective>

<input_contract>
Expected `$ARGUMENTS`: one concrete `TASK-NNN-TN-FT-NNN-WN`.

The caller has already selected this task. `/exe` never scans the queue or
chooses another task.

Require and resolve:
- `.memory-bank/tasks/index.json` and exactly one matching indexed task record;
- `.memory-bank/workflows/tier-policy.md`;
- the task's direct feature/REQ context needed to interpret its outcome;
- direct task-linked canonical SDD specs and executable constraints;
- behavior specs only when linked in `source_artifacts` and useful as
  non-authoritative examples.

For a product task whose feature is not `FT-000`, also require a positive Global
Backbone `Planning Revision` and the latest feature-specific
`/review-tasks-plan` `APPROVE` report with exact standalone
`REVIEWED_PLANNING_REVISION: <N>` equal to it. FT-000 keeps its dedicated
Foundation gate and does not use product task-plan review.

Use task `purpose`, `success_outcome`, `anti_goals`, `source_artifacts`,
`normative_inputs`, `constraints`, `invariants`, `verification_targets`, and
`runtime_context` when present. For T0/T1, do not load broad global planning
docs by default. For T2/T3, direct task-linked applicable canonical specs are
mandatory; feature links and `spec-index.md` alone are not execution context.

Point-of-use preflight must confirm:
- index/file/ID resolution and matching ID tier/feature/wave segments;
- valid `tier: T0|T1|T2|T3` and executable lifecycle state;
- every dependency exists and is `done`;
- no recorded blocker or unresolved required gate in the resolved task context;
- success is observable from AC/REQ/spec/gates/verification targets;
- task, feature, plan, backbone, and linked specs do not contradict;
- for a product task, reviewed and current Planning Revision are equal;
- T2/T3 direct canonical coverage is applicable and concrete enough to avoid
  guessing shape, rules, errors, and verification;
- actual work fits the semantic outcome/AC/REQ/spec boundary, tier, deliberate
  hard allowed/forbidden scopes, and stop conditions;
- when linked rules define architecture boundaries, the tactic keeps state
  changes and cross-module orchestration with their accepted owners, uses
  required public boundaries, preserves source-of-truth and dependency
  direction, creates no unaccepted cross-module contract or forbidden
  command/write bypass, and honors linked orchestration-placement rules;
- before creating, moving, or renaming a project-authored source file, resolve
  its applicable ownership, reuse, or tooling boundary; inspect the nearest
  relevant local pattern and governing manifests, configuration, resolution,
  or registration; preserve framework placement, required or reserved filename
  parts, import/module identity, public path, package export, route, and build
  target; then choose the minimum complete path with sufficient durable context;
- the tier-required existing protocol is coherent, or every missing protocol
  file can be initialized from its framework-owned template before task start.

Stop before implementation if the task is missing/malformed, already
`blocked|failed|done`, has unmet dependencies, lacks required T2/T3 context, is
objectively contradictory, is unverifiable, or is materially under-tiered.

If product planning revision evidence is missing, invalid, or mismatched, every
previous product task-plan approval is stale. Leave all task statuses unchanged
and route `/feature-to-tasks --all`, then `/review-tasks-plan --all`, the
applicable doctor gate, and retry the selected task.

For a selected `planned` task, write `planned -> ready` only when this preflight
proves it runnable; otherwise leave it `planned` and stop. A selected `ready`
task may start. A selected `in_progress` task is resume-only: reconcile its
current Execution Attempt, protocol, handoff, verdicts, and observable work
before acting. If the implementation handoff is already complete, do not replay
implementation; return the existing next handoff. If a possibly completed
unsafe or non-idempotent side effect cannot be reconciled, stop rather than
replay it.
</input_contract>

<hard_invariants>
- Authoritative routing and status ownership come from
  `.memory-bank/workflows/tier-policy.md`; never use legacy `risk` fields.
- `/exe` owns `ready -> in_progress` for the concrete task selected by its
  caller in both manual and scheduler flows. It never selects queue work,
  promotes dependents, or makes final `done|failed|blocked` decisions in
  scheduler mode.
- Scheduler flow selects the task and durably checkpoints
  `current stage: execute` plus `next action: /exe <TASK_ID>` before invocation;
  it does not write `ready -> in_progress` itself.
- Manual mode: T0/T1 fast-lane closure is allowed only when the current agent is
  the explicit manual top-level closure owner, scope stayed task-local, no
  T2/T3 trigger appeared, hard scopes were respected, and compact PASS evidence
  was durably written. Otherwise leave lifecycle unchanged for `/verify`, the
  scheduler, or explicit owner.
- T2/T3 task closure is never owned by `/exe`.
- `touched_files` is advisory and non-exhaustive. Confirm and record the actual
  change surface; extra files are allowed only for the same outcome/spec/tier
  and inside hard scopes.
- A non-empty `runtime_context.write_boundary` is hard. Never touch
  `forbidden_scope`; any needed widening or accidental violation stops work.
- Limit architecture checks to direct task links and the actual change surface;
  do not turn task execution into a broad repository architecture audit. A
  tactic that needs or introduces a departure from an applicable linked rule
  stops work.
- Preserve unrelated user changes and do not edit generated package-local
  `skills/*/{agents,references,scripts}/shared-*` files.
- Do not opportunistically rename brownfield source. A move or rename must be
  required by the selected outcome, remain inside semantic and hard scopes, and
  preserve applicable imports, module declarations, references, exports,
  manifests/resolution, registration, routing, build targets, and
  case-sensitive compatibility.
- Do not change tier in place; tier is embedded in task identity, file path,
  index, and dependencies.
- Selecting or starting a task does not grant an unapproved production,
  destructive, privileged, secret-reading, or other external side effect.
</hard_invariants>

<operator_decisions>
If preflight or implementation uncovers a new material product behavior,
acceptance, architecture, component/API/event/data/state/storage/security/
compatibility, task-boundary, tier, dependency, or verification branch, stop
before choosing or widening work.

- Record the exact decision, alternatives/effect, safe partial changes, and
  affected artifacts in the task protocol/handoff.
- Interactive/manual flow asks the operator; recommendation/default/silence is
  not acceptance. Resume only after the owning PRD/feature/spec/task plan is
  durably updated and revalidated.
- Feature/task repair or tier rebuild routes to
  `/feature-to-tasks FT-<NNN>`; shared/global design routes to `/spec-design`;
  product clarification routes to `/feature-doctor FT-<NNN>`.
- Current implementation drift that the task can handle inside its accepted
  target and semantic boundary is evidence, not a new design choice. If work
  requires changing accepted write authority, public boundary, source of truth,
  orchestration owner, or dependency direction, route it to `/spec-design`.
- Unattended/scheduler flow returns a blocker without choosing, keeps the task
  non-closed, and tells the scheduler to use
  `HALT_CLARIFICATION_REQUIRED` or `HALT_BLOCKING_QUESTIONS` with the exact
  interactive resume route.

Do not stop for an ordinary local implementation tactic already inside the
authoritative task/spec boundary.
</operator_decisions>

<agent_discretion>
Within the selected outcome, applicable specs, tier, and hard scopes, the agent
chooses exploration order, tools, implementation tactic, local decomposition,
actual file set, and the cheapest sufficient project-native checks. No fixed
code-reading order or test-category checklist is required.
</agent_discretion>

<required_outputs>
Create `.tasks/<TASK_ID>/` for substantive evidence/reports.

Protocol by tier:
- T0/T1: `.protocols/<TASK_ID>/run.md` with task/tier, goal/non-goals,
  context, preflight-confirmed change surface, changes, checks, evidence,
  `VERDICT: PASS|FAIL|BLOCKED`, closure owner/decision, and handoff notes.
- T2/T3: `.protocols/<TASK_ID>/{context,plan,progress,verification,handoff}.md`
  where `/exe` fills implementation context/progress and leaves final
  verification to `/verify`.
- T3 handoff records whether the later exact
  `HUMAN_CHECKPOINT: done` marker is present or still required; it does not
  silently satisfy the checkpoint.

Initialize only missing protocol files from these framework-owned shapes:
- T0/T1 `run.md` ->
  `.memory-bank/templates/protocols/compact-run-template.md`;
- T2/T3 `context.md` -> `.memory-bank/templates/protocols/context-template.md`;
- T2/T3 `plan.md` -> `.memory-bank/templates/protocols/plan-template.md`;
- T2/T3 `progress.md` -> `.memory-bank/templates/protocols/progress-template.md`;
- T2/T3 `verification.md` ->
  `.memory-bank/templates/protocols/verification-template.md`;
- T2/T3 `handoff.md` -> `.memory-bank/templates/protocols/handoff-template.md`.

Existing `.protocols/<TASK_ID>/` files are task-owned resume state: update them
in place and never recopy or sync a template over them. Templates define the
initial shape only; this command and tier policy own lifecycle/status rules.
If a required template is absent before file creation, stop and request
framework bootstrap/sync instead of inventing a shape.

Before any implementation or external side-effect write:
1. complete preflight and, when applicable, durably write the selected task's
   `planned -> ready` transition;
2. initialize or reconcile the tier protocol;
3. in `run.md` for T0/T1 or `context.md` for T2/T3, create or reuse one neutral
   `## Execution Attempt` block with `attempt` and `started`;
4. durably write `ready -> in_progress` immediately before the first
   implementation write. Protocol/evidence bookkeeping may precede this
   transition; implementation may not.

Re-entry with `ready` plus a prepared attempt reuses that attempt. Re-entry with
`in_progress` plus an unfinished coherent attempt resumes it. A completed
implementation handoff routes forward without replay. After an eligible
same-task retry decision, create a new attempt and mark older same-claim receipt
blocks `superseded` or `supporting-only`. Do not add owner, invocation-basis, or
mode metadata to the attempt. A legacy `in_progress` protocol without the block
may add it only when durable work/handoff evidence unambiguously identifies the
unfinished attempt and replay is safe; otherwise stop.

Implementation evidence must record:
- actual changed files and any advisory `touched_files` deviation rationale;
- hard allowed-write compliance and whether forbidden scope was touched;
- task/spec outcome compliance;
- exact commands, results, concise output/evidence paths, and unavailable-gate
  blockers;
- linked boundary/spec rules followed, including write owner and public
  boundary when applicable, and any drift discovered;
- next verification targets and recommended owner.

Run task gates, applicable linked-spec verification targets, and the cheapest
credible project-native lint/typecheck/test/integration checks for touched
behavior. Do not run categories merely to fill a template. T0 docs-only work
may use inspected-diff evidence; T1 should use one cheap relevant check when
available or record why none is meaningful.

Reusable execute evidence is optional. When `/exe` proposes one of its
results for reuse by `/verify`, record one complete receipt in the existing
protocol: normally `run.md` for T0/T1 or `progress.md` for T2/T3. The receipt is
a self-attested `reuse candidate`, not independent, cryptographic, or
harness-generated proof that the command ran as reported.

Offer a candidate only for a well-known local deterministic gate whose actual
read surface can be conservatively and unambiguously bounded. Do not offer
reuse when inputs are implicit, broad, or unknown; when relevant untracked,
generated, runtime, toolchain, or environment state cannot be covered; when
the command is flaky or external-state-dependent; when it changes a relevant
input; or when uncontrolled background mutation is observed. Do not treat
`touched_files`, the task change surface, elapsed time, or a claim to cover the
whole applicable project as a substitute for the command read surface.

For each candidate, record one logically connected block containing:
- `attempt` and `receipt_status: current|superseded|supporting-only`;
- `claim`: exact task outcome, AC/REQ, gate, verification target, or concrete
  spec rule the result is offered to support; `tests passed` is insufficient;
- `command`: exact command, filters, and arguments, with secrets redacted;
- `cwd`;
- `exit_code`;
- `input_state_basis`: the declared pre-command input snapshot, including the
  repository revision or equivalent source basis, relevant tracked/staged/
  unstaged/untracked/deleted deviations, relevant generated/runtime inputs,
  and only necessary redacted environment/toolchain qualifiers;
- `completed_at`;
- `evidence`: concise observable output or artifact/report path plus checksum
  when a preserved artifact exists.

Capture the declared snapshot immediately before the command and complete the
receipt immediately afterward. This ordering remains executor self-attestation;
do not describe it as independently proven. Do not persist unredacted secrets
or standalone `VERDICT:` / `SEMANTIC_VERDICT:` lines as raw command output that
could be mistaken for workflow closure evidence.

The implementation handoff must point to the exact current-attempt receipt
location and mark older same-claim receipts from previous execution/retry
attempts `superseded` or supporting-only. Evidence produced directly by
`/add-tests` is supporting-only; after all relevant changes, only a final gate
run owned and recorded by `/exe` may become a reuse candidate.
</required_outputs>

<validation>
Before handoff, confirm:
- no implementation write occurred before durable `in_progress`, and the
  current task status agrees with its tier protocol and Execution Attempt;
- implementation achieves only the selected outcome and respects all
  authoritative specs, constraints, invariants, anti-goals, and hard scopes;
- actual files and local evidence are reproducible and recorded;
- every proposed reuse candidate satisfies the bounded-input rules, is linked
  from the current handoff, and does not claim independent provenance;
- no unresolved material branch was silently decided;
- tier did not need escalation.

Tier escalation handoff records original/required tier, trigger, partial
changes/evidence, and split recommendation; then routes the original task ID to
`/feature-to-tasks FT-<NNN>` for controlled rebuild/split, followed by
`/review-tasks-plan`, applicable doctor gate, and `/exe <replacement-id>`.
</validation>

<handoff_contract>
- Scheduler mode -> return implementation evidence to the scheduler for
  tier-routed `/verify`; do not mutate final lifecycle.
- Manual T0/T1 with valid explicit-owner fast lane -> compact closure may be
  recorded under tier policy; otherwise `/verify` or explicit owner closes.
- T2/T3 -> `/verify <TASK_ID>`; T3 then routes to per-task `/red-verify` after
  functional PASS.
- Blocker/tier/design expansion -> the named planning/design repair owner.

Do not run `/verify`, `/red-verify`, full `/mb-sync`, or dependent promotion
inside this command.
</handoff_contract>
