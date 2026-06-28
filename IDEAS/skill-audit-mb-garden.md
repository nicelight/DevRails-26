# Skill Audit: /mb-garden

Date: 2026-06-26

## Scope
- Canonical runtime command: `skills/_shared/references/commands/mb-garden.md`
- Package entrypoint/assets: `skills/mb-garden/SKILL.md`, `skills/mb-garden/assets/mb-lint.mjs`, `skills/mb-garden/assets/mb-doctor.mjs`
- Installer behavior: runtime slash-command skills are generated from shared command specs, not package entrypoints.

## Verdict
`/mb-garden` is the most visibly outdated of the audited commands. The canonical runtime command is a short older checklist and does not expose the newer SDD/packet/readiness model. The package entrypoint is stronger, but it is not what `install-framework.mjs` writes as the runtime `/mb-garden` command.

## Findings

### P1 - Runtime `/mb-garden` omits the SDD readiness surface

The runtime command only says to scan indexes, run `mb-lint` if configured, run `/mb-sync`, archive/refactor, and periodically run reviews (`skills/_shared/references/commands/mb-garden.md:16`).

It does not mention:
- `.memory-bank/spec-backbone.md` global backbone status
- `.memory-bank/spec-index.md` registry-only boundary
- feature `spec_design_status` / `spec_design_links`
- Architecture Spine `AD-*` anchors
- T2/T3 SDD spec link readiness
- required packet readiness/staleness
- optional behavior specs and their non-gate semantics
- `mb-doctor` default vs `--strict`

Impact: a user running installed `/mb-garden` after SDD changes can clean generic docs while missing the new critical task-readiness drift.

Suggested fix:
- Expand `skills/_shared/references/commands/mb-garden.md` with an SDD/packet/readiness section.
- Reuse `mb-doctor` terminology rather than duplicating validator logic.

### P1 - Package entrypoint and runtime command have diverged

`skills/mb-garden/SKILL.md` explains `mb-lint`, `mb-doctor`, strict mode timing, and package assets (`skills/mb-garden/SKILL.md:23`). The canonical runtime `/mb-garden` command does not.

Because `install-framework.mjs` generates runtime skills from shared command specs (`scripts/install-framework.mjs:312`, `scripts/install-framework.mjs:424`), the stronger package instructions are not the installed slash-command behavior.

Impact: maintainers can update the package entrypoint and still ship an outdated `/mb-garden`.

Suggested fix:
- Make `commands/mb-garden.md` canonical and either delete/minimize `skills/mb-garden/SKILL.md` or make it explicitly point to the shared command.

### P2 - `/mb-garden` calls `/mb-sync` too broadly

The command says "Запусти `/mb-sync`" as a normal step (`skills/_shared/references/commands/mb-garden.md:26`). Newer `/mb-sync` ownership rules are stricter: sync records already-written state and must not infer closure or scheduler ownership.

Impact: garden can become a broad mutation command instead of a maintenance audit/repair pass.

Suggested fix:
- Reword to "run `/mb-sync` only when durable state changed or drift requires sync; otherwise report no sync needed."

### P2 - Missing behavior-spec maintenance rules

The new behavior-spec model is intentionally light: no registry, schema, doctor gate, or done criteria. `/mb-garden` should preserve that, but still check for broken links from features/tasks and stale examples after feature clarifications or spec changes.

Impact: behavior specs can rot silently because neither the garden checklist nor the generic lint section names them.

Suggested fix:
- Add a lightweight check: behavior specs remain linked only from feature docs/task `source_artifacts`; stale examples are reported as notes unless normal AC/spec verification also fails.

## Recommended Next Patch
Patch `commands/mb-garden.md` first. Keep it KISS: add `mb-doctor` usage, SDD surface checks, packet/behavior-spec drift checks, and sync boundary wording. Then decide whether `skills/mb-garden/SKILL.md` should be a thin package wrapper or removed from the source surface.
