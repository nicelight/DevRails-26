# Skill Audit: /mb-verify and /verify

Date: 2026-06-26

## Scope
- Canonical runtime command: `skills/_shared/references/commands/verify.md`
- Legacy package entrypoint: `skills/mb-verify/SKILL.md`
- Installer behavior: runtime commands are generated from `skills/_shared/references/commands/*.md`; legacy aliases such as `mb-verify` are filtered by `LEGACY_ALIAS_COMMANDS`.

## Verdict
The canonical `/verify` command is largely updated for the stronger SDD layer. The risk is the still-present legacy `mb-verify` package/installed skill surface, which diverges from `/verify` and can be discovered or used by agents even though fresh runtime command installs should prefer `/verify`.

## Findings

### P1 - Legacy `mb-verify` is stale relative to `/verify`

`/verify` includes current rules for:
- advisory vs required packets (`skills/_shared/references/commands/verify.md:67`)
- `.memory-bank/guides/` as a possible authoritative SDD link when appropriate (`skills/_shared/references/commands/verify.md:78`)
- optional behavior specs as context, not gates (`skills/_shared/references/commands/verify.md:87`)
- T2/T3 blocking when linked SDD specs are absent (`skills/_shared/references/commands/verify.md:94`)

`skills/mb-verify/SKILL.md` lacks at least the behavior-spec guidance and omits `.memory-bank/guides/` from authoritative SDD paths (`skills/mb-verify/SKILL.md:74`). It also carries package-local template wording (`skills/mb-verify/SKILL.md:91`) that is not the canonical runtime command model.

Impact: an agent routed to `mb-verify` can verify against an older context model, miss behavior-spec drift, or reject a legitimate guide-backed UI/operational spec path.

Suggested fix:
- Retire `skills/mb-verify` if legacy aliases are no longer installed.
- Or replace its body with a thin pointer to the canonical `/verify` command source and keep no separate logic.

### P2 - Old local generated `mb-verify` skills may survive sync cleanup

`install-framework.mjs` generates runtime skills from shared command specs (`scripts/install-framework.mjs:312`, `scripts/install-framework.mjs:424`). It filters legacy aliases, including `mb-verify`, from runtime command specs. Cleanup only removes obsolete runtime skill directories when the existing `SKILL.md` is generated or a legacy proxy (`scripts/install-framework.mjs:413`).

Impact: old dogfood or target repos can retain a non-generated `.agents/skills/mb-verify/SKILL.md`, leaving two verification skills with different semantics.

Suggested fix:
- Add an explicit migration note or cleanup rule for known legacy package skills if they are safe to remove.
- At minimum, document that `/verify` is canonical and `mb-verify` is deprecated.

### P2 - `mb-verify` does not mirror the behavior-spec non-gate rule

The newer `/verify` is explicit that behavior specs are implementation examples and must not be verification gates unless normal verification sources also require that behavior (`skills/_shared/references/commands/verify.md:87`).

Impact: legacy verification can either ignore useful examples or over-treat them as done criteria, both of which are wrong under the new behavior-spec model.

Suggested fix:
- Copy the `/verify` behavior-spec paragraph into any retained alias wrapper.

## Recommended Next Patch
Prefer deletion/deprecation of `skills/mb-verify` over maintaining two verifier specs. If keeping it, regenerate it mechanically from `skills/_shared/references/commands/verify.md` to avoid future drift.
