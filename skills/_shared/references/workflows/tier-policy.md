---
description: Task risk, identity, write boundaries, evidence, and host closure authority.
status: active
---
# Tier Policy

Apply `autonomy-policy.md` for effective settings and decisions.

## Tier Classification and Escalation

The indexed task has one `tier: T0|T1|T2|T3`, not a separate risk model:
- T0: safe documentation/format/link work without runtime or contract impact.
- T1: contained local behavior or test change with low blast radius.
- T2: API/contracts/events/schemas, state/data/migrations, multi-module or
  meaningful domain behavior.
- T3: security/auth/secrets, production/deployment, destructive or irreversible
  operations, data loss, payments or compliance.

Use the highest evidenced tier. Extra files alone do not raise tier. Because
tier is embedded in task identity, an evidenced escalation stops scope growth
and proposes `/feature-to-tasks` rebuild/split, preserving partial work and
original evidence. Never silently rewrite the ID. Ambiguity follows the common
decision flow; enabled review assesses the replacement, without forcing a
review that settings disabled.

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

Proof maps only task-owned claims to accepted REQ/AC and decisive conditions.
Preserve prospective `verification_targets` and `evidence_required` where they
explain the selected proof path, especially material NFR and T3 harm-driving
outcomes. A link to a broad spec does not adopt all its claims. Keep evidence
minimal, grounded and non-duplicative; simple criteria need no separate spec.

Recorded evidence states what was observed, conditions, comparison, and any
artifact. Human/expert evidence identifies its criterion and reviewer type.
Do not fabricate historical evidence or label skipped work verified.

## Claim-Linked RED / GREEN For T2/T3

When the execution proof policy requires RED/GREEN, RED must expose the actual
claim absence before changing its production behavior, followed by equivalent
GREEN. Setup/syntax/unrelated/artificial failure is not RED. Preserve valid
pre-implementation GREEN rather than making an unnecessary change. Alternative
proof explains why observing absence would falsify the task or be unsafe;
missing harness or tier alone is not that reason.

Execution evidence supports an independent selected verification; it is not
itself PASS. Use authorized isolated/disposable state, safe rerun and cleanup
for harmful probes. Do not infer execution-check policy from verify settings
or infer a red-verify prerequisite here; the active execution contract owns
those choices.

## Tier Obligations

Tiers inform the relevant risk and proof depth, not unconditional role launches,
full protocol files or PASS requirements. The indexed card carries sufficient
purpose, outcome, scope, REQ/spec links and dependencies for its selected work.
T2/T3 need direct canonical inputs, not registry-only guesses.

Only enabled checks and selected artifacts are due. All verify off means
`skipped`, with no verification report; implemented work may close without PASS.
Red-verify and feature-level semantic review are conditional. An actual FAIL or
semantic failure remains recorded and follows the common disposition flow.
Disabled evidence cannot be made mandatory through tier, sync or closure.

## Closure Authority

The host owns promotion and every task lifecycle write in manual and autonomous
flows. `/exe` returns the implementation result; enabled `/verify` returns its
functional verdict; enabled `/red-verify` returns its semantic verdict. Models
return evidence and a closure/blocker/disposition recommendation, not status edits.

Closure records actual completion and performed/skipped checks. `done_for_prod`
is used only when production acceptance remains; it neither proves production
success nor authorizes external effects. `/mb-sync` reconciles the already
recorded decision and never grants closure authority. A manual stop or unresolved
operation restriction remains effective even if all checks are disabled.
