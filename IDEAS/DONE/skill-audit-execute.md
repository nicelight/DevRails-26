# Skill Audit: /execute

Date: 2026-06-26

Fix status: canonical `/execute` findings applied in
`skills/_shared/references/commands/execute.md` on 2026-06-27. The legacy
`skills/mb-execute` drift remains a separate follow-up.

## Scope
- Canonical runtime command: `skills/_shared/references/commands/execute.md`
- Legacy package entrypoint checked for drift: `skills/mb-execute/SKILL.md`

## Verdict
`/execute` was one of the better-updated commands: it read linked SDD specs,
respected behavior specs as context, and kept packets derivative. The canonical
command now also has hard preflight boundaries for required packet presence,
guide-only SDD context, and concrete contract readiness in direct/manual
execution.

## Applied Patch
- Required canonical packet absence now blocks `T2` / `T3` and explicit
  packet-required `T0` / `T1` execution without moving freshness/hash/status
  validation into `/execute`.
- Guides remain valid normative inputs for frontend behavior and operating
  procedures, but guide-only context cannot satisfy unrelated T2/T3 design
  concerns.
- T2/T3 concrete boundaries now require an authoritative owner with `shape`,
  `rules`, `edge cases/errors`, and a `verification target`.
- Feature-local readiness gaps route to `/spec-improve`; shared/global gaps
  route to `/spec-design`.

## Findings

### P1 - Required packet absence is not an explicit preflight stop

The command says T2/T3 should load required packet/spec context (`skills/_shared/references/commands/execute.md:71`) and that `/execute` should not validate packet freshness/status (`skills/_shared/references/commands/execute.md:90`). That division is good.

But it also says if packet context is absent, continue from authoritative inputs unless semantically unsafe (`skills/_shared/references/commands/execute.md:94`). The preflight stop list does not explicitly stop when a T2/T3 or `runtime_context.packet_required: true` task has no canonical packet.

Impact: manual `/execute TASK` can proceed on serious T2/T3 work without the required derivative packet, contrary to the framework invariant that T2/T3 require `.memory-bank/packets/<task.id>.packet.json` before implementation handoff.

Suggested fix:
- Add a preflight stop for missing required packet only.
- Keep the current rule that `/execute` does not validate `source_task_hash`, packet status, or freshness; that remains `/mb-doctor`/`/mb-packet` ownership.

### P2 - Guide-only or weak SDD links can satisfy the direct preflight too easily

`/execute` treats paths under `.memory-bank/guides/` as authoritative SDD links (`skills/_shared/references/commands/execute.md:111`) and blocks T2/T3 only when no concrete linked SDD spec exists in richer fields (`skills/_shared/references/commands/execute.md:133`).

The newer planning/review layer distinguishes guide-backed UI/ops behavior from serious API/state/schema/domain/security design. `mb-doctor` warns when T2/T3 tasks link only guides and no architecture/contract/domain/state/testing/runbook/ADR/tech-spec path.

Impact: a direct manual executor may proceed with guide-only context for a T2/T3 task that actually needs a concrete contract block.

Suggested fix:
- Add a short preflight clarification: guides can be normative only for UI/operating behavior; they do not replace architecture/contract/domain/state/testing/runbook/ADR/tech-spec links when those concerns are in scope.

### P2 - Concrete contract readiness is implied, not named

`/execute` stops when success cannot be verified or public-contract/state/data/security decisions are unsettled (`skills/_shared/references/commands/execute.md:138`). It does not name the minimum concrete contract block used by `/prd-to-tasks`: `shape`, `rules`, `edge cases/errors`, and `verification target`.

Impact: implementers may accept a linked spec that exists but still requires guessing key API/state/schema/message/storage/domain details.

Suggested fix:
- Add one sentence to the T2/T3 preflight: if the task depends on a concrete boundary, the linked owner must contain at least shape/rules/errors-or-edge-cases/verification target; otherwise route to `/spec-improve` or `/spec-design`.

### P2 - Legacy `mb-execute` is a second stale execution surface

`skills/mb-execute/SKILL.md` exists as a package entrypoint and does not fully match canonical `/execute` behavior, especially behavior-spec handling and newer direct runtime command wording.

Impact: skill discovery can route agents to `mb-execute` even though fresh runtime slash-command installs use `/execute`.

Suggested fix:
- Deprecate `skills/mb-execute` or convert it into a thin alias to `/execute`.

## Positive Notes
- `/execute` correctly treats behavior specs as optional context, not authoritative specs (`skills/_shared/references/commands/execute.md:102`).
- It correctly prevents `/execute` from repairing packets or owning scheduler transitions.
