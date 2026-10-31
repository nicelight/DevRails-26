---
description: Find available project capabilities and verified missing-skill routes.
status: active
---
# /find-skills — Find relevant skills

Apply `.memory-bank/workflows/autonomy-policy.md` for decisions, effective
settings, host ownership and recovery.

Match the current intent to project skills actually exposed by DSH. Inspect
available metadata and relevant project installation evidence; `.agents/skills/`
and `.claude/skills/` are current packaging outputs, not a universal availability
registry. Return only useful candidates with their origin and availability.

For a missing skill, establish origin from known metadata, canonical project
docs, a verified DevRails checkout, or external package metadata. Do not guess
origin from its name or create a registry.

- Proven DevRails command: propose coherent installation/sync from a verified
  checkout, using `/mb-init`'s installer boundary. Do not use `npx skills add`
  on the source-only repository. With verified paths the full route is
  `node <checkout>/scripts/install-framework.mjs --bootstrap --sync --target <target> --yes`.
- Proven external package: propose the specific installation supported by DSH
  and identify actual collisions/permissions. Installation follows the common
  decision flow and host permissions; no external agent CLI is introduced.
- Unknown origin or unavailable source: report the evidence gap and obtain the
  missing facts instead of installing an assumed package.

Return to the invoking operation only after the needed capability is genuinely
available. Autonomous may decide the semantic route but cannot fabricate
availability, provenance or permission. Update an existing skills index only
when an actual installation changed its facts.
