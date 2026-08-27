---
description: Tier classification, protocol, verification, closure, and MB-SYNC policy.
status: active
---
# Tier Policy

## Tier Classification and Escalation

Every task record has one authoritative `tier: T0|T1|T2|T3`; do not use a
separate `risk` model.

- `T0` — typos, formatting, broken links, or safe documentation changes with no
  runtime, contract, state, data, security, or test impact.
- `T1` — one local function, small component, local unit test, or contained
  behavior change with low blast radius.
- `T2` — APIs, contracts, events, schemas, state machines, lifecycle changes,
  data behavior, migrations, multiple modules, or meaningful domain logic.
- `T3` — auth, permissions, secrets, security-sensitive behavior, deploy/runtime
  or production impact, irreversible migration, data loss, payments,
  compliance, or destructive operations.

When evidenced scope triggers several tiers, use the highest. `touched_files`
is advisory and non-exhaustive; another file needed for the same outcome does
not raise tier unless actual behavior, boundaries, data/state/security/runtime
impact, dependencies, or blast radius trigger it. A non-empty
`runtime_context.write_boundary` remains hard.

Tier is embedded in task identity. When execution or verification requires a
higher tier, stop scope growth, record original/required tier, trigger, partial
changes/evidence, and split recommendation, then route the original task ID to
`/feature-to-tasks FT-<NNN>` for controlled rebuild or split. Rerun
`/review-tasks-plan`, the applicable doctor gate, and `/exe` with the replacement
task ID. Interactive planning asks the operator when tier is genuinely
ambiguous; unattended planning records the question and uses the existing
clarification/blocking halt instead of choosing.

## Hard Write Boundary

`runtime_context.write_boundary` and its deprecated read alias
`allowed_write_scope` use literal project-root-relative POSIX paths, never
globs. Omitted or empty values add no path allow-list; semantic task scope,
`forbidden_scope`, stop conditions, role permissions, and sandbox policy still
apply.

Each non-empty entry:
- may have one trailing `/`, removed before comparison;
- must not be absolute or drive-qualified, contain `.` / `..` segments, empty
  segments, backslash, ASCII control characters, leading/trailing segment
  whitespace, `*`, or `?`;
- permits the normalized path itself and its lexical subtree.

Comparison is case-sensitive and lexical, without requiring path existence.
Split normalized paths on `/`: a path is inside an entry when the entry's
segment array is its prefix. Two boundaries overlap when any normalized entry
from either boundary is a segment prefix of an entry from the other; string
prefix alone is insufficient. Thus `src` contains `src/a.js`, while `src/a`
and `src/ab` do not overlap. Brackets and braces are literal path characters,
so `app/[id]/page.tsx` is valid.

The boundary covers task-outcome creates, modifications, and deletions; both
sides of a rename must be inside it. Required workflow bookkeeping and evidence
writes already owned by the active skill do not need listing, but retain their
output and lifecycle ownership. This contract grants no external side effect
and does not replace filesystem isolation.

## Task Claim And Dependency Ownership

An exact AC or canonical proof-obligation locator used in a task's proof mapping
assigns that claim's proof to the task. Governing `reqs` and context links do
not. Task proof scope contains only its owned observable outcome and integration
delta: exact task-owned feature ACs, material NFR results not covered by them,
and T3 harm-driving outcomes required by accepted requirements or evidenced
material risk. For `FT-000`, exact task-owned `REQ-000` or canonical proof
obligations replace feature ACs.

`depends_on` keeps dependency outcomes as prerequisites and their proof with the
owning task; execution trusts them only at `done|done_for_prod`.
Regression checks for current changes support only the current task outcome and
never adopt dependency claims, probes, preserved GREEN, or evidence.

REQs and canonical specs remain authority and constraints; links do not adopt
every contained statement as a claim. Planner detail, plausibility, tier, edge
cases, safeguards, fixtures, vectors, or artifact formats do not expand proof
scope without accepted requirements or evidenced material risk. A spec rule is
a claim only when it defines a distinct task-owned acceptance result not covered
by an AC or material NFR. Missing ownership blocks planning. Claim locators must
resolve; a section locator is valid only when the whole section is one
obligation. Invented suffixes are invalid.

## Task-Scoped Acceptance Evidence

Compact protocol changes depth, not acceptance obligations. When any task has
`verification_targets` or `evidence_required`, closure evidence satisfies them.
A newly created or reconciled `planned|ready` T2/T3 task maps its task-owned
proof scope through `verification_targets`; its `evidence_required` follows the
claim-linked contract below.
A newly created or reconciled `planned|ready` task proving a material NFR has
both fields non-empty and linked to its governing REQ and exact feature AC.
Evidence records the observed value or qualitative result, decisive
conditions, pass/fail comparison, and artifact; human/expert review is an
evidence method that names its criterion or rubric, reviewer role, and artifact,
not a T3 checkpoint.

This does not require those fields for every T0/T1 task and adds no gate,
status, lifecycle, or protocol family.

## Claim-Linked RED / GREEN For T2/T3

Each `evidence_required` item must be task-owned, grounded, necessary for an
unambiguous verdict, and non-duplicative. Keep one concise result contract per
probe: claim locators, expected RED/GREEN or accepted alternative proof,
decisive comparison, and artifact. Keep required probe method in
`verification_targets` or a direct testing link; do not repeat canonical prose.
A shared probe must distinguish each claim result. Tier, convenience, or a
missing harness does not justify `RED_NOT_APPLICABLE`; its reason explains why
claim absence cannot or should not be observed without falsifying the task.

After `ready -> in_progress`, initial execution obtains honest
pre-implementation RED for each applicable claim before changing its production
behavior, then claim-equivalent GREEN. Setup, syntax, unrelated, or artificial
failure is not RED. Pre-implementation GREEN is preserved and prevents an
unneeded production change for that claim. `/exe` owns task start, Execution
Attempt, retry execution, resume/replay safety, and evidence-recording mechanics
and returns the ordinary handoff to `/verify`; autonomy policy owns scheduler
retry eligibility and disposition.

`/verify` independently proves the current task outcome. RED/GREEN,
pre-implementation GREEN, and accepted alternative proof remain supporting
execution evidence and do not change verdict semantics; pre-implementation
GREEN alone is neither `PASS` nor `NEEDS-CLARIFICATION`. T3 proof covers every
task-owned harm-driving claim required by accepted requirements or evidenced
material risk, in already authorized isolated/disposable state with safe rerun
and cleanup. `/red-verify` retains its hostile semantic role.

Do not fabricate or backfill this evidence for historical
`in_progress|done|done_for_prod|failed` tasks. A lifecycle owner does not close a task whose
current accepted plan requires it until `/verify` confirms the claim-linked
path. No task field, status, scheduler stage, verdict, protocol family, queue,
registry, or lifecycle is added.

## Tier Obligations

The indexed card is the task-scoped execution and verification handoff. Every
newly created or reconciled `planned|ready` T2/T3 record has non-empty
`purpose`, scalar `success_outcome`, direct task-relevant canonical SDD paths,
grounded scope, concrete REQ linkage, valid dependencies, and at least one real
gate command or non-empty `verification_targets`. Semantic applicability and
sufficiency remain fresh-context review concerns.

- `T0`: compact protocol is allowed; scheduler flow runs `/verify`, while
  separate manual `/verify` is optional. `/red-verify` is not required.
  `VERDICT: PASS` or clear compact evidence is required for closure. Full
  `/mb-sync` is not required when only task `status`, task `verify`, and
  `.protocols/<TASK>/run.md` changed; run it when broader durable Memory Bank
  state changed.
- `T1`: T0 obligations apply, plus the cheapest relevant local
  lint/typecheck/unit check when available, or a recorded reason that no
  meaningful runnable check exists.
- `T2`: full protocol is required; compact-only protocol is invalid. Store any
  substantive artifacts under `.tasks/<TASK_ID>/`. Task closure requires
  applicable task/spec gates and `/verify` `VERDICT: PASS`; per-task
  `/red-verify` is optional. After
  every task for a product feature is implemented, feature completion requires
  `/red-verify --feature FT-<ID>` with
  `SEMANTIC_VERDICT: semantic-pass` recorded in the feature document. `FT-000`
  does not use product feature-completion semantics. Full `/mb-sync` is due at
  the wave/feature boundary, or earlier only for a current-wave dependency on
  reconciled RTM/index/spec/contract/changelog state or an explicit owner
  request.
- `T3`: full protocol and `/verify` `VERDICT: PASS` are required; compact-only
  protocol is invalid. Task closure also requires per-task `/red-verify`
  `SEMANTIC_VERDICT: semantic-pass`. Full `/mb-sync` is due at the end of the
  current wave; the T2 early-sync exception applies.

Only the lifecycle owner below may set `status` to `done|done_for_prod` after obligations pass; use `done_for_prod` only when production acceptance remains.
`/mb-doctor` checks readiness only at its applicable boundaries.

## Closure Authority

Closure authority comes from the active outer workflow; an Execution Attempt
carries no manual/scheduler mode and grants none. No persisted `mode` field is
used.

Scheduler flow:
- `/autonomous` owns promotion, selection, and final lifecycle decisions only
  for its bounded FT-000 Foundation phase; `/autopilot` owns them only for the
  reviewed product queue after the Foundation gate closes.
- `/exe` implements the selected task, `/verify` returns the functional verdict,
  and `/red-verify` returns required semantic verdicts. They do not
  close/fail/block/promote in scheduler flow.
- The scheduler writes its closure/failure/blocking decision, final status, and
  evidence links to the authoritative indexed `.task.json` immediately after
  the task and before `/mb-sync`. `/mb-sync` only reconciles already-written
  state.

Manual flow:
- Closure requires an explicit standalone owner: either the user asked the
  current top-level agent to close the task, or the top-level
  agent/orchestrator recorded ownership of one concrete TASK workflow.
  Subagent prompts do not grant it.
- `/exe` may close T0/T1 only when that agent is the manual top-level executor,
  scope stayed task-local, no hard runtime boundary or T2/T3 trigger appeared,
  hard scopes were respected, and all compact acceptance evidence was written.
  Necessary extra files outside advisory `touched_files` remain valid when
  recorded and inside the same local outcome. It then may update `run.md`,
  append compact PASS evidence to task `verify`, and set `status` to `done|done_for_prod`.
- `/verify PASS` may set T0/T1 `status` to `done|done_for_prod` only with explicit closure
  ownership and completed task `verify` plus tier protocol evidence. Without
  that owner it records `PASS`, evidence, and a closure recommendation while
  leaving status unchanged.
- For T2/T3, `/verify` and `/red-verify` only establish the Tier Obligations;
  the explicit owner writes the lifecycle decision. A T3 semantic issue routes
  to human review/follow-up; the owner may reopen, block, fail, or create
  follow-up work. `semantic-concern` means the existing `done|done_for_prod`
  state is not trusted without that review/follow-up.

When any manual closure condition or owner is missing, keep the task open and
report the exact `/verify`, closure-owner, or tier-escalation route.
