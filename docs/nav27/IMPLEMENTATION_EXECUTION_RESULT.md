# Indexed execution slice

Implementation is in `packages/nav27` on `devrails-nav-27`, based on foundation
HEAD `fb9df40`. No commit or push. Original DevRails 26 worktree was not changed.
This is an execution slice, not complete Nav readiness.

## Implemented

- Native exe with DSH file tools and host-provided native bash, selected local
  checks, separate verify and red legs, independent functional/candidate roles.
  Local checks default on; optional participants and reports remain disableable.
- One whole-leg snapshot freezes all selected peers and routes, including peers
  launched later. Settings save validates native provider/model/effort and both
  run/settings revisions. Settings are available only at initial/stopped-ready
  stations. Main route changes use native session model selection.
- Red/Pause finish the admitted group; future verify/red can change at the exe
  station without another attempt. All-off records skipped without synthetic
  PASS. Candidate-only and red-alone preserve their distinct evidence.
- Native participant outcomes are accounted individually, including interrupted
  or unlaunched-after-Stop peers. Pending decisions and negative results block
  departure. Green/Play can release their own holds without removing a blocker.
- Stop persists its hold before best-effort native cancellation. Resume inspects
  actual effects and continues unfinished peers in the same attempt with retained
  selection/routes; completed peers are not replayed. Previous session bindings
  remain on resumed peers. Results retain their operation/attempt identities.
- Recovery reconciles task evidence ahead of run position, preserves holds and
  pending decisions, resumes the native main with role restrictions, and creates
  a replacement main if its stored session no longer exists. Stranded indexed
  workflow attempts are selected for inspection before new work.
- Host selects ready tasks from the existing index/dependencies. Scoped retained
  `continue` dispositions preserve negative evidence; scoped `repair` starts a
  new attempt. `attemptLimit` defaults to 3 completed unsuccessful execution
  attempts; resume does not consume another attempt. Exhaustion remains blocked.
- Conditional reports use installed templates only when selected, preserve
  existing text, and retain actual task evidence in bounded operation sections.
  Partial execution leaves unfinished selected local checks absent. Explicit
  production remainder closes as `done_for_prod`, without a production action.
- Typed Remote and Svelte expose station settings, role routes, selected checks
  and reports, participant outcomes, pending/blocker facts and Resume/Repair.
  Snapshots publish only committed reducer state.

Packaged command references are readable through a command-scoped read-only
resource root. Main remains read/context/feedback only. Reviewers have read-only
file tools; a native shell is exposed to reviewers only when the host supplies
confinement and sandbox policy, and the child is restricted to native read-only
mode without escalation. Exe shell uses native host permissions/sandbox and a
protocol prohibition on task/run metadata writes. Direct file tools retain the
cheap path guard. Arbitrary shell does not promise a path-level metadata deny
inside a writable project; `spec/architecture.md` now states that boundary.

## Validation

Reproduce from repository root:

```sh
npm run build:nav27
npm run test:nav27
git diff --check
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Tests extract `npm pack` into isolated temporary installations and use the real
native Loader, agent loop, structured capture, file tools, session persistence,
HTTP/Remote transport, and (selected cases) native bash/subprocess. The LLM
provider is a deterministic fixture, not a real provider.

Covered scenarios: foundation all-off closure and lineage; authenticated page
and typed Remote/stale revision; write-boundary denial; required gate conflict;
actual native local command plus verify/red; stopped future toggles; frozen
sequential peers and packaged reference read; candidate-only/red-alone;
negative retention; evidence-ahead reload; Stop/reload/same-attempt Resume;
conditional reports; scoped repair and budget; dependency queue; scoped continue;
decision-needed plus unfinished peer accounting/persistence; partial checks and
production remainder. Actual completed records are also checked by the packaged
canonical terminal workflow validator. No doctor/schema modification was needed.

## Remaining boundaries / next slice

- Pending decision resolution, autonomous semantic feedback/rerouting, main
  assignment/H, Side, planning/maintenance command families and feature-boundary
  ownership remain the next semantic/routing slice. This UI consumes existing
  scoped dispositions; it does not manufacture them or implement another consent
  engine. Design and feature review settings are explicitly unavailable here.
- A real provider, full deployed DSH application and browser-driven interaction
  have not been exercised. The optional reviewer shell confinement branch is
  composed from native APIs but was not exercised by the local-shell fixtures.
- Main-loss replacement and stranded-attempt inspection are implemented; native
  regression coverage specifically exercises preserved-main reload,
  evidence-ahead reconciliation and interrupted same-attempt recovery.
- No legacy installer/canonical resource-delivery change was made in this slice;
  packed resource delivery was exercised. Aggregate upstream DSH build was not run.

Final validation: `build:nav27` (including host TypeScript) passed; 18 top-level
native scenarios / 22 Node tests passed, zero failures/skips; `git diff --check`
passed; source package-local `shared-*` count is 0. No further execution check
is pending. Next work is the semantic/routing slice above.
