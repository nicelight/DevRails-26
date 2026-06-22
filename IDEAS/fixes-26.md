# Fixes 26

## Architecture Spine Follow-Ups

### `/review-tasks-plan` should check Spine/boundary routing

Source finding: 5

Keep this as a small documentation/workflow fix.

Add one reviewer check to `skills/_shared/references/commands/review-tasks-plan.md`:

- for T2/T3 or shared-boundary tasks, verify that relevant Architecture Spine
  `AD-*`, boundary-map, contract, or ADR constraints are present when they
  constrain implementation or verification.

Reason:

- `/prd-to-tasks` already tells agents to route those links into existing task
  fields.
- `/review-tasks-plan` currently checks generic T2/T3 SDD links, but does not
  explicitly check that shared-boundary tasks got the AD/boundary constraints
  that make execution and verification unambiguous.
