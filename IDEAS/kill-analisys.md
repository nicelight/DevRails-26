# Kill `/analysis` Plan

## Decision basis

Yes: current `/analysis` is a routing command, not a real planning phase.

Evidence:
- `skills/_shared/references/commands/analysis.md` says "`/analysis` is a router only".
- Allowed outputs are limited to creating/updating `.memory-bank/analysis/index.md` and reporting the next command.
- It explicitly must not create Product Brief, brainstorming reports, PRD content, task records, implementation plans, research reports, PRFAQ artifacts, assumptions docs, or command aliases.
- The useful discovery work already lives in `/brainstorm` and `/brief`.
- Scenario routing already belongs naturally in `/cold-start` and in the entry logic of `/brainstorm`, `/brief`, `/constitution`, `/write-prd`, and `/map-codebase`.

Important naming note:
- The command is `/analysis`.
- This file intentionally uses `analisys` in the filename because the request asked for `IDEAS/kill-analisys.md`.

## Goal

Remove `/analysis` as a first-class command/skill from the canonical DevRails workflow while preserving the useful Analysis artifact area:

- keep `.memory-bank/analysis/`
- keep `.memory-bank/analysis/product-brief.md`
- keep `.memory-bank/analysis/brainstorming/BR-*.md`
- keep `/brainstorm`
- keep `/brief`
- keep lint rules for product brief and brainstorming artifacts

The intended replacement is direct routing:

```text
raw idea -> /brainstorm
clear concept -> /brief
existing PRD -> /constitution if needed -> /write-prd
brownfield -> /map-codebase
unknown start -> /cold-start
```

## Non-goals

- Do not remove the `analysis` directory concept from Memory Bank.
- Do not remove Product Brief support.
- Do not remove brainstorming reports.
- Do not merge `/brainstorm` and `/brief`.
- Do not introduce a new replacement router command.
- Do not change task schema, lifecycle statuses, packets, or tier policy.

## Proposed approach

### Phase 1: Deprecate references

Update docs and generated skeleton wording so `/analysis` stops appearing in the canonical happy path.

Primary files:
- `README.md`
- `howItWorks.md`
- `GREENFIELD_WORKFLOW.md`
- `AGENTS_local.md`
- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`
- `skills/_shared/references/workflows/execute-loop.md`
- `skills/_shared/references/commands/cold-start.md`
- `skills/_shared/references/commands/constitution.md`
- `skills/_shared/references/commands/spec-init.md`
- `skills/_shared/references/commands/brief.md`
- `skills/_shared/references/commands/brainstorm.md`
- `skills/mb-analysis/SKILL.md`
- `skills/cold-start/SKILL.md`

Target wording:
- Replace `/analysis -> /brief` with `/brainstorm or /brief`.
- Replace `/analysis or /brief` with `/brainstorm for raw ideas, /brief for clear concepts`.
- In `/cold-start`, route raw idea directly to `/brainstorm` or `/brief`.
- In command references, describe `.memory-bank/analysis/` as an artifact area, not a command phase.

### Phase 2: Remove command spec

Remove the runtime command source:

- delete `skills/_shared/references/commands/analysis.md`

Then remove it from any source-only checks that assert command specs exist.

Likely files:
- `.github/workflows/release-check.yml`
- any docs listing command specs
- any install/smoke expectations if they mention `.agents/skills/analysis/SKILL.md` or `.claude/skills/analysis/SKILL.md`

Expected result:
- installer no longer generates `.agents/skills/analysis/SKILL.md`
- installer no longer generates `.claude/skills/analysis/SKILL.md`
- `/brainstorm` and `/brief` still generate normally

### Phase 3: Rename or narrow `mb-analysis` package wording

`skills/mb-analysis/SKILL.md` currently describes "Optional Analysis before PRD" and mentions `/analysis`, `/brainstorm`, `/brief`.

Options:
- Minimal: keep package name `mb-analysis`, but rewrite it as "Discovery before PRD" and remove `/analysis` references.
- Cleaner later: rename package to `mb-discovery` or split into `brainstorm`/`brief` package ownership. This is broader and should not be part of the first deletion unless the installer/package metadata requires it.

KISS recommendation:
- keep `skills/mb-analysis/` directory for now;
- remove only the `/analysis` command;
- update wording to "Discovery artifacts before PRD".

### Phase 4: Preserve artifact templates

Keep:
- `skills/mb-analysis/assets/analysis-index-template.md`
- `skills/mb-analysis/assets/brainstorming-template.md`
- `skills/mb-analysis/assets/product-brief-template.md`

But update `analysis-index-template.md`:
- remove `/analysis` from `Recommended next step` options;
- keep `Current state: not started|brainstorming|brief draft|brief approved|blocked`;
- route raw ideas to `/brainstorm`;
- route clear concepts to `/brief`;
- route approved brief to `/constitution` or `/write-prd` depending on Constitution state.

### Phase 5: Update docs and command tables

Search and update all direct references:

```bash
rg -n '/analysis|analysis router|Analysis router|mb-analysis|Optional Analysis' \
  README.md howItWorks.md GREENFIELD_WORKFLOW.md AGENTS_local.md PROJECT_MAP.md skills .github scripts
```

Expected handling:
- Remove `/analysis` from canonical chains.
- Remove `/analysis` from command reference tables.
- Keep `.memory-bank/analysis/` as artifact location.
- Keep "Analysis artifacts" wording only when it means durable artifacts, not the command.

### Phase 6: Installer and smoke expectations

Run install smoke and verify that `analysis` skill is not generated:

```bash
tmpdir="$(mktemp -d)"
node scripts/install-framework.mjs --bootstrap --target "$tmpdir" --yes
test ! -e "$tmpdir/.agents/skills/analysis/SKILL.md"
test ! -e "$tmpdir/.claude/skills/analysis/SKILL.md"
test -f "$tmpdir/.agents/skills/brainstorm/SKILL.md"
test -f "$tmpdir/.agents/skills/brief/SKILL.md"
test -f "$tmpdir/.memory-bank/index.md"
```

If release-check currently expects analysis skill output, update that check.

### Phase 7: Verification

Required checks:

```bash
npm run check:syntax --silent
node -e 'JSON.parse(require("node:fs").readFileSync("skills/_shared/references/protocols/packet-template.json", "utf8")); console.log("packet template ok")'
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
git diff --check
```

Bootstrap smoke:

```bash
tmpdir="$(mktemp -d)"
node scripts/install-framework.mjs --bootstrap --target "$tmpdir" --yes
node "$tmpdir/scripts/mb-lint.mjs"
node "$tmpdir/scripts/mb-doctor.mjs"
```

Text checks:

```bash
rg -n '/analysis|Analysis router|analysis router' \
  README.md howItWorks.md GREENFIELD_WORKFLOW.md AGENTS_local.md PROJECT_MAP.md skills .github scripts
```

Expected after deletion:
- no `/analysis` command references in canonical workflow or installed command lists;
- no `skills/_shared/references/commands/analysis.md`;
- allowed remaining matches only when referring to `.memory-bank/analysis/` artifact paths or historical migration notes.

## Risks

- `mb-analysis` package name may remain mildly confusing after deleting `/analysis`; mitigate by rewriting its description to "Discovery artifacts before PRD".
- Existing target projects may still have generated `.agents/skills/analysis` or `.claude/skills/analysis`; installer sync should remove generated obsolete runtime skills only if sync cleanup covers removed command specs.
- Some docs use "Analysis" to mean artifact area, not the command. Avoid deleting useful `.memory-bank/analysis/` support by overmatching.
- If external users already call `/analysis`, removal is a breaking workflow change. Consider one release cycle with docs marking it deprecated before deleting the command spec.

## Recommended final state

Canonical manual entry points:

```text
raw idea -> /brainstorm -> /brief
clear concept -> /brief
existing PRD -> /constitution if needed -> /write-prd
brownfield -> /map-codebase
unknown start -> /cold-start
```

No canonical workflow should start with `/analysis`.
