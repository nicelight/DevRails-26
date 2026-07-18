---
description: Task-scoped добавление risk-based тестов с приоритетом по core value.
status: active
---
# /add-tests — Improve task-scoped test coverage

<objective>
Добавить полезные тесты в scope существующей indexed task так, чтобы они
доказывали конкретный outcome и ловили значимые регрессии.
</objective>

<process>

## 0) Required task context
Require an explicit `TASK-NNN-TN-FT-NNN-WN` that:
- exists in `.memory-bank/tasks/index.json` and has a matching task record;
- has `status: in_progress`;
- has an outcome/AC/REQ/spec boundary that covers the proposed test behavior.

Read the task record and `.memory-bank/workflows/tier-policy.md` before editing.
Test files may fall outside advisory `touched_files` when they remain inside the
same task outcome and hard scopes; record them in evidence.

If post-hoc coverage work is outside the current task outcome/spec scope, stop and route it
through the normal planning/reconciliation path so a follow-up task can be
created. `/add-tests` must not invent task identity, create synthetic testing
task IDs, or introduce a separate lifecycle.

## 1) Choose the cheapest sufficient check
Start from the concrete product behavior and regression risk in the task,
linked requirements/features, and applicable specs. Select the narrowest check
that reliably proves the outcome:
- unit for isolated logic or invariants;
- integration/contract for a real DB, API, component, or protocol boundary;
- e2e for a critical user flow that narrower checks cannot prove;
- an existing project-native gate or one targeted test for a small local change.

Do not require unit, integration, and e2e together merely to fill categories.
Do not put browser/e2e first by default. Browser screenshots, videos, or traces
are evidence only when browser/e2e verification is actually needed.

## 2) Implement and run
- add only tests authorized by the task outcome/spec scope and hard runtime
  boundaries;
- run the added tests and applicable project-native checks;
- check for flakiness in proportion to the risk;
- do not weaken assertions, disable failing checks, or replace meaningful
  verification with a decorative test to obtain a green result.

## 3) Record task evidence
Record touched tests, exact commands, results, and applicable artifacts in the
tier-selected evidence path of the existing task:
- T0/T1: compact `.protocols/<TASK_ID>/run.md`;
- T2/T3: full protocol state plus substantive `.tasks/<TASK_ID>/` artifacts.

Do not create or modify files under `.memory-bank/testing/`. Durable subject
testing specs are created only through the existing SDD routing in
`/spec-design`, `/foundation-to-tasks`, or `/prd-to-tasks` when evidence shows
they are needed.

## 4) Handoff
`/add-tests` does not own task closure. Return control to `/execute`, `/verify`,
the scheduler, or the explicit task owner according to the existing tier policy.
</process>
