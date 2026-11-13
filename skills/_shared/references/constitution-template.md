---
description: Project Constitution — project principles and agent working boundaries.
status: active
version: 1
project_principles: framework-default
ratified: null
last_updated: {{TODAY}}
---
# Project Constitution

## Project principles
These are framework defaults until the operator establishes project-specific
principles. Keep accepted constraints, scope, and intended product experience
explicit. Prefer the simplest sufficient result; do not create requirements or
architecture for hypothetical needs.

`project_principles` is `ratified` when governing choices are settled, `partial`
when proceeding with named open choices is authorized, `skipped` when the
operator skips the interview, or `framework-default` before that. Use a
ratification date for ratified/partial principles; otherwise keep `ratified: null`.

## Agent decisions
Follow `.memory-bank/workflows/execute-loop.md#working-policy`. By default,
consult the operator on material product, technical, and process choices.
Autopilot or an explicit instruction to act autonomously authorizes decisions
within the provided scope and constraints. Do not re-ask settled decisions or
treat silence as permission.

## Working memory
Memory Bank preserves useful requirements, design, task context, and results
across sessions. Update affected knowledge after meaningful changes and link
canonical detail instead of copying it. Use the indexed JSON task model and its
current schema when recording tasks; preserve identities and historical evidence.

## Completion
State what changed, what was checked, and what remains uncertain. Do not claim
an unrun check passed or hide a failed result. Choose proportionate verification;
explicit project requirements and operator constraints still apply.

## Flexible process
Framework commands, reviews, TDD, and protocol templates are tools. Use the depth
that serves the work under the agreed decision authority. The operator may skip
framework ceremony without an exception document. Missing process artifacts alone
do not prevent authorized work. Real missing prerequisites and unresolved choices
outside agent authority pause only dependent work.

## Changes to these principles
Apply an accepted amendment and reconcile affected canonical wording. Keep this
file short; domain rules belong in their relevant specs. Framework defaults do
not override explicit operator instructions.
