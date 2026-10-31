---
description: Clarify product intent, scope and acceptance in the canonical PRD.
status: active
---
# /write-prd — Product source to PRD

Apply `.memory-bank/workflows/autonomy-policy.md` for decisions, effective
settings, host ownership and recovery.

Own `.memory-bank/prd.md` as the product source; do not create epics/features,
tasks, implementation plans or architecture specs. Inputs are `.memory-bank/analysis/brief.md`,
explicit product/PRD text, or an existing PRD. Legacy brief/brainstorming records
are migration evidence. Read the Constitution and relevant current sources.
Apply installed `creator-vibe` when intent or human experience materially matters;
it supplies no independent authority or invented requirement.

If the product source is missing, request it or propose `/grill-me`. Missing
principles or a genuine governing conflict returns to `/constitution` through
the common decision flow. Distinguish a new PRD from an update before writing.

## Product decisions

Clarify material behavior/scope, users, data, integrations, non-functional
qualities, failure outcomes and acceptance. Use only relevant coverage, not a
mandatory stack of sections. A material NFR names an observable quality,
accepted numeric target or qualitative criterion, decisive conditions, and a
proof-method class. Human/expert proof is valid with a criterion and reviewer
type; non-trivial measurement procedure belongs to its downstream subject owner.

Unresolved choices use the common flow. Ordinary recommendations are not
acceptance; autonomous choices identify their provenance. Missing facts do not
become guessed truth. Reuse supplied authoritative input without another interview.

Apply each accepted decision at its PRD owner, remove contradictory wording,
and retain only provenance needed for future work. An amendment proposal names
the current Constitution rule, conflict and change; dependent work waits for
its governing resolution. Never silently override a higher accepted authority.

## Durable result and handoff

Keep `type: prd`, `status: draft|active`, `clarification_status: pending|complete|blocked`
and `constitution_checked: true|false`. Complete means no material ambiguity
blocks decomposition; true means the current content was checked against the
actual governing principles. Do not initialize true without that check.
Keep remaining blockers explicit with affected scope and owner. A dated
clarification log is unnecessary when the decision is already durable.

Acceptance describes the desired product result. Implemented-but-unverified
completion does not prove that acceptance; selected/skipped checks remain honest.
Check source consistency of changed content before handoff.

A complete, Constitution-consistent new PRD hands off to `/spec-init`; an updated
PRD hands off to `/prd-to-features`. Preserve unaffected downstream state. Otherwise
continue the recorded question at this owner or resolve the Constitution conflict.
