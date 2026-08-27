---
description: Additive Judge supervision for /multiagentic over current autonomous and autopilot contracts.
status: active
---
# Multiagentic Judge overlay

The active `/autonomous` or `/autopilot` contract owns lifecycle, status,
retries, scheduler stages, registries, and durable artifacts. This overlay owns
Judge consultation and route reaction.

## Judge session and consultation

At `/multiagentic` start, launch exactly one `ROLE: JUDGE` subagent on Codex Sol
(`gpt-5.6-sol`) with `xhigh` reasoning effort, requiring
`.memory-bank/roles/judge.md`. `/multiagentic` owns and reuses that subagent for
every consultation, including delegated `/autopilot`; never launch, replace, or
reset it during the run.

Before each consultation, the orchestrator sends one compact `JUDGE_BRIEF` with
decision-relevant facts and exact project-relative `file:line` locators. Judge
does no routine discovery or context assembly:

```text
JUDGE_BRIEF

objective: original objective and applicable success conditions
checkpoint: current phase, owner, and reason for consultation
progress_since_last_judge: material actions and durable outcomes
evidence: decisive facts with exact project-relative file:line locators
trajectory: attempts, repairs, verdicts, blockers, and budget counters
noticed_problems: decision-relevant confirmed or potential signals
proposed_route: one existing skill/owner and expected result
real_alternatives: only material existing alternatives
question: one decision-relevant question
```

Judge returns:

```text
JUDGE_ASSESSMENT

assessment: SUPPORT | REDIRECT | ESCALATE_OPERATOR
basis: concise evidence-based reason
trajectory_signal: progress | repeated_pattern | symptom_repair | owning_layer_drift | none
recommended_route: proposed route or one existing skill/owner
conditions: only required evidence or operator-decision conditions
evidence_checked: decisive file:line locators
```

`SUPPORT` permits the proposed route after its conditions pass. `REDIRECT`
requires the named existing route. `ESCALATE_OPERATOR`, an impossible or
policy-conflicting recommendation, or orchestrator disagreement uses the
existing `HALT_BLOCKING_QUESTIONS` route with both positions and exact resume
owner. A rejected route resumes through the Judge recommendation or an
operator-resolved disagreement.

Record only the compact assessment and accepted route in the existing run
status or decision log when resume/audit needs it. Judge returns a read-only
route assessment; owning workflows retain artifact, state, verdict, and retry
authority.

## autonomous with judge

Consult Judge:

- after the Foundation decision and before `/foundation-to-tasks`, only when
  Foundation is required;
- after product tasking, reviews, lint, and strict doctor, before product
  scheduler handoff;
- when a second consecutive review `REJECT`, proposed owning-layer change,
  contradictory evidence, materially different recovery routes, repeated work
  without progress, or drift from the original objective can change the next
  move;
- whenever the operator explicitly requests consultation.

After product handoff, `#autopilot-with-judge` becomes the active supervision
section.

## autopilot with judge

Consult Judge:

- after verification of any retry attempt, before another correction,
  disposition, or closure;
- at each complete wave boundary after semantic gates, `/mb-sync`, lint,
  strict doctor, applicable re-reviews, and `/tech-debt`, before the next wave
  or terminal success;
- when evidence suggests repeated failure, symptom repair, owning-layer drift,
  competing recovery routes, or loss of progress toward the objective;
- whenever the operator explicitly requests consultation.

For failed retry recovery, Judge may recommend `/debug` when cause is unknown,
`/technical-premortem` for an evidence-backed non-trivial correction, a bounded
retry for a confirmed local safe correction, or the existing upstream owner.
The active scheduler retains every lifecycle and terminal decision.
