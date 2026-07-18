---
name: mb-garden
description: Package deterministic Memory Bank lint, readiness, and optional CI assets for DevRails installation. Use for packaging or installing mb-garden assets; runtime maintenance behavior is defined by the canonical shared command.
---

# mb-garden package entrypoint

Keep this file as the package surface for deterministic maintenance assets, not
as a second runtime workflow.

## Canonical runtime behavior

Use `../_shared/references/commands/mb-garden.md` as the only source for the
installed `/mb-garden` instructions. The installer generates target
`.agents/skills/mb-garden/` and `.claude/skills/mb-garden/` from that command.

## Packaged assets

- `assets/mb-lint.mjs` — structural and mechanical Memory Bank lint.
- `assets/mb-doctor.mjs` — deterministic readiness gate over `mb-lint`.
- `assets/memory-bank-lint.yml` — optional CI workflow asset.

`mb-lint` and `mb-doctor` keep their separate responsibilities. Asset packaging
does not make this entrypoint the owner of readiness policy.

## Packaging rules

- Preserve the asset paths expected by `skills/_shared/scripts/init-mb.js` and
  installer vendoring.
- Change runtime maintenance guidance only in the canonical shared command.
- Do not duplicate weekly checklists, report paths, doctor timing, or the
  `/mb-garden` process here.
