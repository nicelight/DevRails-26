# Semantic/routing implementation — FINAL

Worktree: `/home/serg/Projects/DevRails Nav 27`, branch `devrails-nav-27`, base
`75e359f`. Changes remain uncommitted. Original DevRails 26 and root WORK_LOG
were not changed by this slice.

## Delivered

- Native main feedback uses a scoped stable envelope, pre-step assignment binding
  and successful native tool-result capture. Nav prompts have their own source
  and cannot impersonate actual user approval. Stale assignments, failed tools
  and newer actual user input cannot commit an older approval.
- Pending proposals, actual-user consent, scoped autonomous decisions and H share
  the existing controller/run record. Green admits one accepted request. H can
  steer idle or running main, deduplicates consultation and freezes the selected
  Judge route; Judge evidence cannot close the child's leg.
- Missing facts require an actual answer. A no-target current-owner question
  uses read-only main interpretation and resumes unfinished owner work in the
  same attempt. Subject `complete` distinguishes finished work from capture.
- Pause and Stop retain their control semantics. Stop retains owned late results,
  prevents main prompt delivery/new admission, and preserves actual user input.
  Cold subject Resume keeps operation identity and actual outputs. Pending main
  assignments wait for Stop to be cleared through existing controls.
- All 37 canonical command IDs are mapped to five shared families with packaged
  contracts and reference availability checks. Subject owners use the existing
  native loop; host code owns admission, ordinary handoffs and task import.
  The bundled generator supplies bootstrap/sync resources in external delivery.
- Product/planning handoffs, selected planning checks, feature boundaries and
  bounded owning repair/re-review are wired. Native task drafts are validated
  before host-owned registry import. UI/Remote expose command, source, feature,
  planning settings and semantic pending/H controls.

## Validation

Final `npm run build:nav27`: PASS, including host typecheck and generated build.
Final `npm run test:nav27`: **36/36 PASS** (32 top-level tests), zero failures,
cancellations or skips, 46.95 seconds. Build/test logs:
`/tmp/nav27-semantic-build.log`, `/tmp/nav27-semantic-test.log`.
Both completed after the final Stop delivery guard.

Native tests use deterministic providers with the real DSH loop and external
packed delivery. They cover the preceding execution suite plus native main
proposal/consent, H during idle/running main and child work, failed tool capture,
new-user freshness, autonomous disposition with Pause, Stop/late Judge results,
missing facts and same-attempt current-owner continuation.

Tested command routes include the PRD → framing → decomposition → task import →
exe → feature red → sync chain; review REJECT → proposal/green → owning repair →
re-review; bundled bootstrap/sync → start → indexed work; and interrupted subject
Stop/reload/Resume. These tests establish representative shared-family behavior,
not individual end-to-end certification of all 37 command IDs. Standalone and
optional branches outside these tested routes remain unverified individually.

`git diff --check`: PASS. Source package-local generated `shared-*` count: **0**.

## Remaining scope

Side orchestration and the map UI remain subsequent slices. A command inventory
entry for `map-codebase` does not establish completion of the map experience.
Real-provider behavior, browser interaction and full-host deployment were not
validated. No commit or push was performed.
