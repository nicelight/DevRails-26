# Side and schematic UI implementation — FINAL

Worktree: DevRails Nav 27, branch devrails-nav-27, starting HEAD 30a3ead.

## Checkpoint 1 — reference

Created `nav27-map-reference.svg`: artifact stations, command rails, selected
review branches, same-task repair, proposed return tunnel, persistent Side
anchor and H model variants. Functional schematic; no decorative redesign.
Reviewed sessions/UI, controller, feedback and architecture contracts. Existing
Svelte status page, typed Remote and native adapter are the integration points.

Implementation and validation remain pending. No commit/push.

## Checkpoint 2 — native Side integration

Added independent root Side setup/fork/resume/archive methods, read-only Side
role (read only, no bash/feedback/spawn), current-summary injection at admitted
user steps, selected model override after inherited seed, and native workspace
attachment/flush. Controller owns durable Side bindings/anchors and reconciles
native archive on reopen; main Stop leaves Side handles intact. New typed Remote
create/delete actions preserve run/revision checks and retain archive errors.

Extracted the existing external-package native fixture for preview reuse and
mounted native Workspace storage, query and Session Remote services. The fixture
uses a deterministic model adapter and text-only attachment intake; no second
frontend/controller engine. First existing native execution check passed.
Side-specific tests are being debugged against npm API. Build/typecheck passed
before the last added service injection. Map geometry remains a working draft,
not user-approved final design. Actual reviewer lane will be below the map.

## Checkpoint 3 — Side native checks passed

`node --test packages/nav27/tests/side.test.mjs`: **2/2 PASS**, 3.17s.
`node --test --test-name-pattern='external package uses' packages/nav27/tests/native.test.mjs`:
**1/1 PASS**, 2.34s. Logs: `/tmp/nav27-side-test.log` (latest targeted run).
Proven: active main exact prefix is unchanged, Side is an independent root,
selected Side model beats inherited main selection, write/bash/nav_feedback
calls denied, fresh summary on questions, survives main Stop, empty-prefix
summary, native archive error retains marker, archive/binding recovery, logs
preserved after DEL.

Added optional native occupancy/unique successful own compaction projection for
scene snapshots, currently pending build verification. Last build failed only
on TypeScript optional projection-key declaration; cast fixed, rerun pending.
Judge model-slot settings and five driver colors now have stopped-ready host
validation. Functional map/Side chat UI and isolated preview remain in progress.

## Checkpoint 4 — functional UI and preview launcher

Svelte scene now projects host snapshots with fixed controls, Fit/pan/wheel and
button zoom, overview/tactical/detail, lower participant lane, main/Side clicks,
proposed return tunnel and H flight gated by actual native running state.
Native model catalog drives provider/model/effort selectors. Side panel uses
native SessionEventStream, history pagination, streaming, prompt and cancellation.
No durable transcript store or permission UI was added. Native successful own
compaction IDs and optional context pressure supply meters; absent pressure is ?.

`npm run build:nav27` passed including host typecheck after native client transport
alias fix. Latest one-line H state projection adjustment pending final rerun.
Preview launcher: `npm run preview:nav27` (run build first). It reuses the external
package fixture, allocates a temporary native profile/project and deterministic
provider, prints authentication/map URLs and removes temp state on Ctrl+C.
Prepared-task execution/review, H and Side are supported; arbitrary command
families and full native DSH chat root are not simulated. Full-chat link requires
an actual DSH host with its native UI/addon. Preview launch verification and the
full native regression suite are next; no browser acceptance run by this agent.

## Checkpoint 5 — full regression and preview boot

`npm run build:nav27 && npm run test:nav27`: **38/38 PASS**, 52.81s,
zero failures/skips. `/tmp/nav27-side-build.log`, `/tmp/nav27-side-all-tests.log`.
Preview successfully started with a native authenticated `/nav27/` page at an
isolated ephemeral port. Added final focused checks for cold Side guard recovery,
own successful compaction counts/unknown occupancy, active DEL cancellation,
and the exact native SessionEventStream + authenticated Remote used by Side UI.
These targeted checks and the final rebuild are pending. The running preview is
an earlier package snapshot and will be restarted after final build for QA.

## Checkpoint 6 — exact Side transport and final checks

Authenticated native SessionEventStream/catalog/prompt/cancel headless test:
**PASS** (`node --test --test-name-pattern='standalone Side' packages/nav27/tests/side.test.mjs`).
Cold-resume guards, anchor persistence, active DEL and valid native compaction
success/failure event accounting also passed in the targeted run. Fixture model
catalog metadata now includes the provider ID required by native validation.
True empty-log creation is checked separately (initial fixture settings skipped).

The schematic reference now places the actual reviewer lane below the map.
Final build + full test suite are about to run after this checkpoint; no further
UI expansion is planned. Preview will restart from this final build.

## Final handoff

Side and schematic UI implementation is complete for the accepted slice.
Final full regression: **40/40 PASS**, zero failures/skips, 53.87s
(`/tmp/nav27-side-all-tests.log`). After the final display fix mapping
`candidate_findings: 'none'` to zero candidates, the package was rebuilt with
host typecheck successfully (`/tmp/nav27-side-build.log`), and the existing
candidate-only/red-alone native assertion passed **3/3**, zero failures/skips
(`/tmp/nav27-side-display-test.log`). `git diff --check` passes; source-only
package-local `shared-*` count is **0**.

Fresh preview runs from the final built package: PID **2042260**, tool session
**8417**, origin `http://127.0.0.1:32995`, map `/nav27/`. Authentication URL is
printed in `/tmp/nav27-preview.log`. Temporary native project:
`/tmp/nav27-native-D77cVp/project`. The prior preview was stopped.

The map remains an authorized functional schematic; the reference is not a
user-approved final visual design. Browser acceptance is handed to the root
agent. The preview uses the real native host/session transport with a
deterministic provider; native full-chat root requires a full DSH installation.
No commit or push was made.
