---
description: Optional Judge guidance for multiagentic and multipilot runs.
status: active
---
# Judge supervision overlay

The base `/autonomous` or `/autopilot` owns task states, recovery, retries, and
run results. Judge adds advice under Working policy; it is not another gate.

## Judge session and consultation

Reuse one Judge context when available. Choose model and context depth to suit
the work; unavailable delegation does not prevent the base workflow. Send a
compact `JUDGE_BRIEF` with objective, current situation, decisive evidence,
progress/failure history, proposed route, and the question to assess.

Judge returns `JUDGE_ASSESSMENT` with `assessment: SUPPORT|REDIRECT|ESCALATE_OPERATOR`,
a brief basis, trajectory signal, recommended route, conditions, and evidence
checked. Advice informs the caller's judgment; it neither grants new authority
nor changes lifecycle. Record a material accepted decision in existing run state.
Consult the operator when the route exceeds delegated authority.

## autonomous with judge

Judge is useful for materially different design paths, repeated review failures,
loss of progress, or an operator-requested consultation. The caller chooses
useful points without a fixed consultation count or mandatory phase boundary.

## autopilot with judge

Judge is useful after repeated unsuccessful attempts, ambiguous recovery, or a
wave whose results call the next route into question. A routine successful task
or wave does not require consultation. The scheduler retains closure and retry
ownership, including its existing budget.
