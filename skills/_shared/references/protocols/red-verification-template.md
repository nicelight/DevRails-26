---
description: Template for .protocols/TASK-NNN-TN-FT-NNN-WN/red-verification.md (adversarial semantic verification).
status: active
---
# Red Verification — <TASK_ID>

Use only when this artifact is selected. Keep only applicable sections; its
presence creates no check, role or lifecycle requirement. Existing task-owned
state is updated in place, never replaced from this template. Host owns
lifecycle; retain actual and skipped work under tier-policy, not inferred PASS.


## Semantic target
- Task/feature outcome: ...
- Accepted contract and boundaries: ...

## Evidence and adversarial coverage
- Existing functional evidence, or explicitly absent/skipped: ...
- No functional PASS inferred from semantic review:
- Changed files / diff / runtime evidence: ...
- Accepted-outcome surfaces covered: ...
- Supported paths exercised: ...

## Admitted findings
Only evidenced material breaks of an accepted outcome. Use `none` when no
finding is admitted.
- ...

## Material decisions
Only questions required to judge a proved realistic material risk or accepted
outcome. Use `none` when no operator decision is required.
- ...

## Verdict
Replace the placeholder with one exact standalone marker:
SEMANTIC_VERDICT: <semantic-pass|semantic-concern|semantic-fail>

## Owner handoff
- Evidence/report paths: ...
- Recommended owner action: ...
- Negative verdict disposition: decision / user-or-autonomous source / reason
- Resume route or `n/a`: ...
