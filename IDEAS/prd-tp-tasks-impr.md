# /prd-to-tasks Improvement: Task-by-Task Design Loop

Date: 2026-06-28
Status: implemented

## Objective

Strengthen `/prd-to-tasks` so every provisional task is considered separately
before its final JSON task record is written. The agent must identify the
existing authoritative design specs needed by that task, find missing or weak
specs, resolve meaningful design choices with the user when necessary, update
the natural spec owners, and only then create the task card.

## Approved Flow

1. Build a concise ordered outline of provisional tasks for the feature.
2. Store the outline and current iteration checkpoint in the existing
   `.protocols/FT-<NNN>/plan.md`.
3. Process provisional tasks in dependency/wave order.
4. Before each task record:
   - reread `spec-index`, backbone routes, feature `spec_design_links`, and
     specs created earlier in the same run;
   - identify relevant existing authoritative specs;
   - identify missing or insufficient specs and unresolved design decisions;
   - ask `0-3` focused questions only when a meaningful choice cannot be
     resolved from existing evidence;
   - record accepted decisions in the existing feature `decision-log.md`;
   - create or update the minimum necessary authoritative design specs;
   - write the task record with relevant spec links, constraints, invariants,
     and verification targets.
5. Reuse a shared decision for every affected task instead of asking the same
   question again or duplicating its contract.
6. After all task records are written, run one consistency pass over the whole
   feature, then build required Execution Packets.

## Question Gate

Questions are conditional, not mandatory. Ask only about choices that can
materially change API/interface shape, component ownership, event semantics,
data/storage behavior, state transitions, compatibility, security, or the
verification contract. Ask at most three questions in one pass. If a decision
affects several tasks, ask once before the first affected task and reuse it.

## KISS Boundaries

- No new command, task status, task field, registry, or artifact family.
- No separate design spec file per task by default.
- T0/T1 tasks still receive a quick design-needs check, but do not require
  artificial specs or questions.
- Concrete contracts keep one authoritative owner and may serve several tasks.
- Task records link to specs and copy only task-relevant executable rules.
- Packets remain derivative and are generated after the feature task/spec loop.

## Acceptance Criteria

- `/prd-to-tasks` explicitly performs the approved loop for every provisional
  task.
- The agent refreshes its spec inventory before each task instead of relying on
  an earlier mental snapshot.
- Missing T2/T3 contract details are resolved before the corresponding task
  record is written.
- User questions are bounded to `0-3` and only appear at meaningful branches.
- A final consistency pass catches late shared-spec changes before packet
  generation and handoff.
- Existing source-only packaging and task schema remain unchanged.

## Implementation Result

Implemented in
`skills/_shared/references/commands/prd-to-tasks.md` on 2026-06-28.

Validation:
- repository syntax check passed
- Markdown diff/whitespace check passed
- source-only generated `shared-*` count remained `0`
- full runtime install projection passed for 31 `.agents` and 31 `.claude`
  command skills
- generated `.agents/skills/prd-to-tasks/SKILL.md` passed skill validation and
  matched the `.claude` projection
