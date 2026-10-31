---
description: Verify selected task claims using only enabled participants and preserve the actual functional result.
status: active
---
# /verify — Selected functional verification

Apply `.memory-bank/workflows/autonomy-policy.md` for DSH runtime ownership,
effective settings, the required compact structured flow feedback, decisions,
and recovery; subject results remain separate from that feedback.

<objective>
Independently prove or disprove the selected task outcome against its accepted
basis. Each enabled functional verifier returns evidence and
`VERDICT: PASS|FAIL|NEEDS-CLARIFICATION`. Selected code co-review returns its
scoped candidate findings, not a final functional verdict. The required flow
feedback remains separate. All participants, including the main reviewer, are disableable.
All off means `skipped`, no verification report and no functional PASS.
</objective>

<input_contract>
Require one indexed `TASK-NNN-TN-FT-NNN-WN`, valid ID/tier/feature/wave,
reqs/depends_on/gates/verify shapes, actual implementation evidence and selected
claim scope. Apply `.memory-bank/workflows/tier-policy.md` for ownership,
claim/dependency scope, boundaries and evidence. Use concrete direct canonical
inputs: task/REQ/feature meaning and applicable accepted specs, not a forced
full SDD bundle when design is disabled. Missing material meaning returns
NEEDS-CLARIFICATION; malformed identity is never repaired by skip.

Use retained actual execution/handoff, changes and artifacts, not a mandatory
protocol file set. Normal input is an implemented in-progress attempt; explicit
re-verification may inspect another state without changing it. A planned task
is not executed merely because its card exists. A missing or unusable optional
receipt permits a safe rerun/replacement probe and is not itself a blocker.
</input_contract>

<hard_invariants>
- Apply installed `references/finding-adjudication.md`. Host launches only
  selected DSH participants; `agents/review-code.md` is available for selected
  code review. No fixed model/effort, mandatory co-review, main fallback or
  hidden adjudicator launch. Each assigned verifier adjudicates its own findings;
  a material disagreement uses the common decision flow. Candidate-only review
  without a functional verifier cannot synthesize functional PASS; its scoped
  completion is still a valid selected result.
- Verify task-owned claims and integration delta, not dependency-owned proof or
  the whole feature. Dependency `done|done_for_prod` is a prerequisite, not proof
  that its acceptance was independently verified.
- Accepted canonical rules outrank secondary prose. Missing/conflicting
  applicable coverage is a planning gap, not an implementation failure.
- No implementation, spec, task meaning, tier/dependency, BUG or lifecycle edits.
  Return evidence for the host to retain in task.verify and selected artifacts.
- Local GREEN, executor receipts and `/add-tests` results are supporting evidence;
  they never become independent functional PASS by relabelling.
- Hard scope and actual permissions remain effective. A required unsafe probe
  not executed yields NEEDS-CLARIFICATION; an observed unauthorized/destructive
  action is FAIL, not missing evidence. Redact secrets in evidence.
</hard_invariants>

<verification>
Functional proof instructions below apply only to an assigned functional verifier;
code co-review keeps its installed candidate-only output contract.

Map every selected task-owned outcome, AC/REQ, material NFR and accepted
harm-driving claim to credible observations. Gates/targets state obligations,
not proof. A probe must establish the claimed behavior rather than merely run
code. Choose the smallest sufficient independent checks and flows; do not fill
a fixed test-category checklist. Missing evidence calls for a safe replacement
probe or NEEDS-CLARIFICATION, not a fabricated FAIL.

For linked architecture, assess actual change scope, accepted state/orchestration
owner, public boundaries, registered Consumer -> Provider contract, dependency
direction and source of truth. Observed violation is FAIL; missing/conflicting
canonical meaning is NEEDS-CLARIFICATION. Unrelated pre-existing drift remains
out of scope unless it invalidates the result. Reproducibility constraints come
from accepted task rules, not a new ceremony.

Execution RED/GREEN is assessed only when selected for that attempt. Disabled
local checks do not block independently enabled verification. Historical proof
is not backfilled. At T2, PASS needs at least one new verifier-owned outcome
probe and independent grounding for every selected claim; at T3, new functional
evidence covers each selected task-owned harm-driving claim. One probe may
cover several claims when mapped explicitly. T3 never has reuse-only PASS.
Selected proof sufficiency does not silently add disabled checks/participants.

Receipt reuse is optional: direct rerun is suitable when cheaper. Reuse only a
current, unambiguous attempt/receipt_status/claim/command/cwd/exit_code/
input_state_basis/completed_at/evidence block for a known deterministic local
gate. Independently inspect and compare its complete relevant source/config/
dependency/generated/runtime/redacted environment inputs before a probe changes
them. Reject reuse for ambiguity, drift, broad implicit input scope, flaky or
external state, input mutation, background changes or conflicting evidence.
Elapsed time alone does not invalidate deterministic current-state evidence
unless accepted freshness policy or volatile state requires it. Reused receipts
remain self-attested support, never an independent observation. Their absence
or rejection requires a safe rerun/replacement only for selected proof.

For selected UI behavior use reproducible project-native evidence and record
runtime/route/viewport as relevant. Optional installed
`references/web-design-reviewer.md` is available when UI, browser and safe state
are accessible; it adds no compulsory participant or browser ceremony.
</verification>

<outputs_and_handoff>
Retain each selected participant's own verdict or candidate-only result, its
inspected scope/evidence, executor claim path when selected,
reused evidence with state basis, repeated checks and new verifier-owned probes.
Use selected `run.md` or `verification.md` and substantive `.tasks/<TASK_ID>/`
artifacts only when reports are enabled. Initialize a selected protocol from
`.memory-bank/templates/protocols/` only when absent; never overwrite resume
state. With reports off, retain concise result/evidence in existing task state.
Raw output with verdict-like text is not a workflow verdict.

A candidate-only result never asserts functional acceptance. PASS means all
selected task-scoped functional obligations have credible proof;
FAIL means an observed breach of the accepted outcome/rule; NEEDS-CLARIFICATION
means missing/conflicting/unsafe basis, evidence or reproducibility. Preserve
actual negative results with explicit repair/continue disposition through the
common flow. Disabling later work cannot turn a performed FAIL into skipped.

Return to the host for the next selected red-verify or closure; T2 feature and
T3 task semantic review are conditional, never implicit gates. A material
interpretation goes to its product/feature/spec owner, tier escalation to a
controlled task rebuild, unclear implementation cause optionally to `/debug`.
Do not invoke repair, semantic review, sync, or lifecycle transitions here.
</outputs_and_handoff>
