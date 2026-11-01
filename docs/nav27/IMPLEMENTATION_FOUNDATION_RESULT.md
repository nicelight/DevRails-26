# Implementation foundation result

First executable slice is in `packages/nav27`; no full Nav readiness is claimed.
No DSH core changes, provider CLI/API adapter, or private agent loop were added.

## Implemented

- External ESM Cordis package with native Loader entrypoint, scoped role plugin,
  native workspace addon, authenticated Svelte status/control page at `/nav27/`,
  and generated Typert host/client descriptors.
- One durable project controller: revision-checked admission, Play/Pause/Red/
  Green/Stop, prepared task identity, one child activation, explicit interrupted
  execution blocker, and existing task-card evidence ownership.
- Persistent native main session with read/feedback capability; native exe child
  uses DSH read/write/edit, bounded writes and structured output. Native session
  lineage and persistence remain DSH-owned.
- File-only T0/T1, all optional checks off: actual implementation evidence is
  retained; local checks/verify/red are `skipped`, never functional PASS. Partial
  effects/decisions block closure. Required gates, T2/T3, retained negative or
  unfinished workflow evidence and unresolved dependencies reject admission.
- Shared `scripts/command-resources.mjs` inventory supplies both the legacy
  installer and package resources. `npm pack` includes commands, references,
  bootstrap source/assets, host/client artifacts and declarations; runtime tests
  extract that archive into a temporary installation without Nav source.

## Reproduce

From the repository root, with Node 22+ and the committed npm lockfile:

```sh
npm ci
npm run build:nav27
npm run test:nav27
npm run test:install-sync
```

Build includes host TypeScript declaration/type checking, native Typert
artifacts, host/addon bundles and Svelte compilation. Generated `lib/` and
`resources/` are package-local ignored build output. Runtime uses one published
DSH `0.2.2-alpha.2` baseline, plus its declared Cordis version. The source research
pin remains `ce7073d51254c26cd63b22a60835b8f948deb447`; its source is not required
by this build. Aggregate upstream typecheck was not repeated after its earlier
out-of-memory failure.

The native Typert generator needs a registered workspace protocol to recognize
Remote symbols. Build stages Nav source and the installed protocol's public
`.d.ts` files as workspace packages, generates normal descriptors, then removes
the stage. No upstream file or runtime implementation is patched.

Native Loader configuration for this package is `{ project, main: { provider,
model }, exe: { provider, model } }`; routes must be explicit. The surrounding
DSH host supplies agents, subagents/spawn, presets, tools/filesystem, persistence,
Connection/WebServer, Typert, RemoteAccess and Gateway. The fixture in
`packages/nav27/tests/native.test.mjs` is the executable minimal composition.

## Verified

- Package build and host tsc: pass. Host index 23.67 KB / 7.26 KB gzip; addon
  1.64 KB / 0.84 KB gzip; Svelte bundle 856.09 KB / 177.83 KB gzip. Browser bundle
  contains Svelte and native Connection/Gateway/Typert clients.
- Four native integration tests: real file write, native child lineage, all-off
  truthful closure; authenticated page/assets and generated typed Remote with
  stale revision refusal; denied out-of-bound write with partial evidence;
  required-gate rejection before model execution. Each uses an extracted npm
  archive and the real native agent loop with a deterministic provider fixture.
- Legacy installer/bootstrap/sync smoke: pass after inventory extraction.
- `git diff --check`: pass; source `skills/*/.../shared-*` count: zero.

## Remaining slices / limits

A real provider, browser interaction/native addon navigation and a full deployed
DSH application have not been exercised. HTTP serving and typed Remote are
verified headlessly. General process/check execution, selected reviews/protocols,
full actual-state recovery, semantic main/H/consent routing, Side sessions and
map UI remain subsequent slices. The foundation refuses unsupported task gates;
it is not the completed feature. No commit or push was performed.
