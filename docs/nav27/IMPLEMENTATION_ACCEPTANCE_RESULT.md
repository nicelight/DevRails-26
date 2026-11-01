# Independent acceptance — FINAL

Worktree: DevRails Nav 27, branch devrails-nav-27, baseline 06ddd92.
Original DevRails 26 unchanged. No commit/push; root owns final review/commit.

## Delivered

- Browser acceptance with real Chromium, desktop and 390 px; report in
  ACCEPTANCE.md, two useful screenshots under screenshots/.
- QUICKSTART.md with verified `dsh plugin --profile web add <tarball>` +
  `cordis.patch.yml` insert, pinned runtime, bootstrap/model configuration,
  source build/test/preview commands, persistent artifacts and test boundaries.
- README, PROJECT_MAP, DEVRAILS_NAV_27 status/link corrections; package metadata
  no longer describes a single-task slice.

## Fixed from reproduced defects

- Settings cloned Svelte proxies and threw DataCloneError: snapshot before clone.
- Pan retained moved=true and suppressed next Side click: clear on new input.
- Combined manual holds deadlocked: persist own release, return remaining holds
  without premature admission or false rejection.
- Preview lacked native API Remotes: `$events` unavailable repeatedly reset
  browser carrier. Mount official event source in fixture/dev dependencies.
- Addon delivery used ESM instead of native factory registration; graph inject
  used service name instead of package ID. Corrected native factory and metadata.
- Cold Main navigation attempted retain before native list baseline; now observes
  native list until named session is ready. Consume fragment before reentrant
  retain publication; unsubscribe on disposal.
- Successful reconnect retained stale fetch-error banner: separate connection
  error from action error and clear after successful snapshot.

The source-only scope remained intact. No new provider simulator, sandbox,
workflow state machine, upstream patch or custom transport was added.
Root accepted cost-cut in spec/sessions-ui.md: native addon only navigates;
workflow controls stay on map, native Stop keeps session semantics. Existing
nav_feedback already renders readable question + Action and native main consent
reducer/tests remain intact. No separate chat widget is required.

## Verification

Final build/host typecheck PASS: /tmp/nav27-acceptance-build.log.
Final full native suite 41/41 PASS, zero skips, 55.16s:
/tmp/nav27-acceptance-tests.log. Includes new holds, event carrier, packed factory,
graph metadata, delayed native baseline, reentrant notification and cleanup checks.
`git diff --check` PASS; source package-local shared-* count 0.
Packed artifact has 37 command contracts/required resources (164 files); isolated
runtime uses published dependencies, not a Nav source checkout.

Browser: native auth401/login; settings/catalog; fit/zoom/pan; frozen active
settings; Play/Red→exe station→future code-only+red settings→Green without exe
replay; Pause; combined holds; active H; Side send/stream/cancel/reopen/archive;
Side survives main Stop/reload; narrow no horizontal overflow; offline controls
closed and online refresh recovers without replay or stale error banner.
One main browser scenario retained exactly one task attempt with implementation,
code-only 0 candidates (no functional verdict), and independent red semantic-pass.
Final screenshots also show explicit skipped local/red and candidate-only result.

Actual full published DSH 0.2.2-alpha.2 on local Node 24.22.2 independently booted
in /tmp/nav27-full-host-clean/profile. Native plugin-manager tar install + YAML
insert + packaged bootstrap loaded host and standalone page. Main link activated
native UI without plugin/page errors, removed fragment, and native
`dsh.sessions.current` matched persisted main 9fa1d75e-b5a5-4637-9c44-212ba782a58e.
That full host is stopped. Its setup never used user profile or provider keys.
No real model calls were made. Initial interrupted npm download was retried in
clean /tmp install; no aggregate upstream build.

## Live preview for root/user

Only retained Nav preview: PID 2067685, tool session 97531, freshly initialized
from final build. Map: http://127.0.0.1:41903/nav27/
Login: http://127.0.0.1:41903/?token=Zd2ZwwR9rjeiOFz91OLawSjb4jdp5w_NIttJy5CIc2Y
Log: /tmp/nav27-acceptance-preview.log
Temporary project: /tmp/nav27-native-T1qCAt/project
Native deterministic provider, no API key. Initial ready state; Play exercises
prepared task. Main full-chat link requires actual DSH, not fixture login root.
Ctrl+C/SIGINT disposes preview and deletes its temporary profile/project.
Other own previews/full host stopped. Browser QA process closed after final
login/ready check. No further implementation or verification is pending.

## Explicit limits

Real-provider behavior/quality, all 37 commands end-to-end, proxy deployment and
reviewer shell with actual confinement backend remain unverified. Reviewers are
sequential and UI says so. Schematic draft is not final visual design approval.
Full acceptance evidence and reproducible install instructions are in ACCEPTANCE
and QUICKSTART; no blanket compatibility claim beyond pinned baseline.
