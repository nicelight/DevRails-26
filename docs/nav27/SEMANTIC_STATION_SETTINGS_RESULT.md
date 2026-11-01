# Station settings — semantic result

Status: READY_FOR_ARCHITECTURE. Scope: semantic contracts and delivery only;
no DSH plugin/UI implementation, architecture rewrite, commit or push.

## Boundary

Station = accepted result/feedback at an existing operation/handoff boundary;
leg = one operation or its agreed native participant group. Results need not
be successful: partial/blocked/error/needs-decision use the existing decision
flow, without synthetic completion. `/exe` and `/verify` are separate legs.

At initial/stopped-ready station, models/options/enablement may change. Green
fixes the whole next leg, including its unstarted participants and local checks.
Manual red/Pause arms a stop after the next station, preventing next admission,
not cancelling current work. Automatic passage without red does not expose an
editing window. Emergency Stop remains best-effort cancel; reconcile actual
outcomes before editing/recovery. No new cancel states or lifecycle are added.

A future verify toggle at the stopped exe station keeps the same task attempt.
Existing `task.verify`, `stage: workflow`, immutable results/FAIL, conditional
reports, main-off, red-alone, no fake PASS and common feedback are preserved.
Controls are Nav plugin/UI-owned, including main-model choice; no DSH core or
global model hook, no policing manual source edits. Side Chat is not consent;
autonomous decisions do not release manual red.

## Changes and checks

Canonical changes: autonomy-policy owns station settings; tier-policy retains
one leg's selected work. Current semantic/entry docs are aligned; architecture
files and historical results are untouched. Doctor regression moves future
verify toggle after exe completion and retains selected-group/FAIL coverage.
Doctor validates recorded evidence, not runtime station admission.

Checks passed:
- `npm run check:syntax --silent`.
- Full `npm run test:mb-doctor --silent`: same-attempt station toggle, missing
  selected peer, retained FAIL, existing main-off/red-alone/legacy coverage.
- Full `npm run test:install-sync --silent`.
- Isolated install-only/bootstrap/full sync at `/tmp/nav27-station.jTVT1P`;
  both command surfaces exist, deployed autonomy/tier are byte-identical to
  canonical source. No required reference was added.
- Deployed doctor `--json`: pass, 0 errors/warnings; fresh empty queue is info.
- `git diff --check`; source generated `shared-*` count: 0.

These checks establish semantic delivery and recorded-evidence compatibility,
not DSH enforcement. Existing architecture files, root WORK_LOG and other
agents' papercuts are preserved. No new papercut arose in this scoped change.

## Architecture handoff

Update the previous architecture/plan/acceptance separately for plugin-only
and station snapshots. No station registry, task schema or extra feedback
contract is needed. DSH/Svelte/Side lifecycle and partial-effect recovery still
need implementation; per-participant live config application/races disappear.

Helicopter/Judge during movement is authorized. Whether it pauses current work
is not decided. Working assumption/recommendation: native read-only consultation
using available evidence and a preselected model, with recommendations returned
through existing feedback/next station, without changing the current leg or
promising cancellation of its network call. This is not a new mandatory flow;
mid-leg interruption/replanning would reintroduce complexity.
