# Workflow Consistency Fix Plan

Цель: синхронизировать flow/next-step формулировки во всех source-файлах DevRails, не меняя модель workflow.

Актуальный happy path:

```text
/analysis or /brief
-> /constitution if project_principles is not ratified|partial
-> /write-prd
-> /spec-init
-> /prd
-> /review-feat-plan for high-risk/large work
-> /spec-design
-> /foundation-to-tasks if required
-> /mb-doctor at foundation/task-queue boundary
-> execute/verify FT-000 until foundation gate done
-> /prd-to-tasks FT-<NNN>
-> /review-tasks-plan FT-<NNN>
-> conditional /mb-doctor at feature/task-queue boundary
-> tier-routed /execute TASK
-> /verify TASK for T2/T3 or uncertainty
-> /red-verify TASK for T3
-> /red-verify --feature FT-<NNN> before T2 feature completion
-> /mb-sync at boundary when broader durable state must reconcile
```

## Finding 1: Analysis index template routes through stale `/spec-improve`

File:
- `skills/mb-analysis/assets/analysis-index-template.md`

Problem:
- The template says: after `/write-prd`, run `/spec-init`, `/prd`, `/spec-improve FT-<NNN>`, then `/prd-to-tasks FT-<NNN>`.
- This makes `/spec-improve` look like a normal happy-path step.

Fix plan:
- Replace that line with the current planning route:
  `/spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /prd-to-tasks FT-<NNN>`.
- Add `/review-tasks-plan FT-<NNN>` after `/prd-to-tasks`.
- State that `/spec-improve FT-<NNN>` is repair/refresh only.

## Finding 2: Feature template requires `/spec-improve` before `/prd-to-tasks`

File:
- `skills/mb-from-prd/references/feature-template.md`

Problem:
- `## SDD Design Gate` says to run `/spec-improve FT-XXX` before `/prd-to-tasks FT-XXX`.
- Current model: `/prd-to-tasks` owns feature-level SDD design before task slicing; `/spec-improve` is standalone repair/advanced.

Fix plan:
- Replace the section with:
  - run mandatory `/spec-design` after `/prd`;
  - if foundation is required, close `/foundation-to-tasks` final gate first;
  - run `/prd-to-tasks FT-XXX`, which sets `spec_design_status: complete|not_required|blocked`;
  - use `/spec-improve FT-XXX` only to repair/refresh feature design outside the happy path.
- Keep notes about `spec_design_links`, `not_required` rationale, and blocked design, but attribute them to `/prd-to-tasks` or repair `/spec-improve` as appropriate.

## Finding 3: Legacy package execution skills still imply required `/verify` for T0/T1

Files:
- `skills/mb-execute/SKILL.md`
- `skills/mb-verify/SKILL.md`
- `skills/mb-red-verify/SKILL.md`

Problem:
- They say `Expected T0/T1 simple flow: /execute -> /verify`.
- Current tier policy allows manual T0/T1 fast-lane closure directly in `/execute` when explicit top-level owner conditions and compact evidence are met.

Fix plan:
- Replace the stale line with:
  `Expected T0/T1 simple flow: /execute TASK, compact evidence or no-runnable-check note, and optional closure by the explicit manual top-level owner.`
- Add or sync:
  `Standalone /verify is optional for manual T0/T1 when requested, uncertainty exists, scope widened, /execute cannot produce credible evidence, or public contract/state/data/security/runtime/cross-module behavior changed.`
- Keep T2/T3 closure rules unchanged.

## Finding 4: Greenfield Mermaid workflow makes `/mb-doctor` and `/verify` too unconditional

File:
- `GREENFIELD_WORKFLOW.md`

Problem:
- After `/review-tasks-plan`, the diagram always routes through `/mb-doctor`.
- Manual branch always routes `/execute -> /verify`, which hides T0/T1 fast-lane closure.

Fix plan:
- Change feature/task-queue doctor node to a conditional decision:
  `T3, autonomous/autopilot handoff, or complex T2/foundation/dependency/packet/stale-doc/risky-link?`
- Route simple manual T0/T1 directly from `/review-tasks-plan` to `/execute`.
- Add T0/T1 fast-lane branch after `/execute`: compact evidence/no-runnable-check note can close when explicit owner conditions pass.
- Keep `/verify` required path for T2/T3 and uncertainty.
- Keep `/red-verify TASK` for T3 and `/red-verify --feature FT-<NNN>` before T2 feature completion.

## Finding 5: `execute-loop.md` interactive sequence skips `/review-feat-plan`

File:
- `skills/_shared/references/workflows/execute-loop.md`

Problem:
- Interactive mode sequence goes from `/prd` to `/spec-design`.
- Current flow requires `/review-feat-plan` for high-risk/large work before `/spec-design`.

Fix plan:
- Insert an explicit step after `/prd`:
  `/review-feat-plan` for high-risk, large, or autonomous-boundary work; optional/recommended for small manual flows.
- Renumber following steps if needed.
- Keep the autonomous sequence unchanged if it already includes `/review-feat-plan`.

## Finding 6: Upstream planning docs stop at `/prd-to-tasks` without post-tasking gates

Files:
- `skills/mb-analysis/SKILL.md`
- `skills/_shared/references/commands/brief.md`
- `skills/_shared/references/commands/brainstorm.md`

Problem:
- These files show planning chains that end at `/prd-to-tasks FT-<NNN>`.
- That may be acceptable for "planning until task decomposition", but it can be read as the full workflow and omit `/review-tasks-plan`, conditional `/mb-doctor`, and tier-routed execution.

Fix plan:
- Either rename the chain wording to "planning path until task decomposition", or extend it with:
  `/review-tasks-plan FT-<NNN> -> conditional /mb-doctor -> tier-routed /execute`.
- Prefer concise wording so discovery commands do not become full workflow encyclopedias.
- Ensure `/spec-improve` is mentioned only as repair/refresh, not happy path.

## Finding 7: Project map references missing README files

File:
- `PROJECT_MAP.md`

Problem:
- It references `README.en.md` and `README.ru.md`, but the current repository contains `README.md` and `howItWorks.md`.
- This is not a workflow sequencing bug, but it makes the project map stale.

Fix plan:
- Replace `README.en.md`, `README.ru.md` references with current docs:
  `README.md`, `howItWorks.md`, and `GREENFIELD_WORKFLOW.md` where relevant.
- Do not invent split language docs unless the repo actually restores them.

## Verification Plan

After fixes:

```bash
npm run check:syntax --silent
node -e 'JSON.parse(require("node:fs").readFileSync("skills/_shared/references/protocols/packet-template.json", "utf8")); console.log("packet template ok")'
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Expected source-only count: `0`.

If generated skeleton/source templates are changed, also run:

```bash
tmpdir="$(mktemp -d)"
node scripts/install-framework.mjs --bootstrap --target "$tmpdir" --yes
test -f "$tmpdir/AGENTS.md"
test -f "$tmpdir/.memory-bank/workflows/execute-loop.md"
```
