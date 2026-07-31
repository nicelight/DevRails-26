# mb-doctor module ownership

This directory is the canonical implementation behind deployed
`scripts/mb-doctor.mjs`. Preserve finding codes, severities, messages, payload
shape and order, CLI output, exit codes, strict/default semantics, lifecycle
ownership, blockers, and remediation unless the public workflow contract is
explicitly changed.

## Change routing

- `../mb-doctor.mjs`: CLI entrypoint and top-level check order only.
- `cli-reporting.mjs`: flags, finding collection, text/JSON rendering, and exit.
- `readers.mjs`: raw filesystem, path, JSON, and text access only.
- `preflight.mjs`: `mb-lint` invocation and obsolete-backlog preflight.
- `foundation-backbone.mjs`: constitution, spec index/backbone, Foundation
  anchors, Foundation gates, waves, and dependencies.
- `task-readiness.mjs`: task records, tiers, dependencies, feature
  clarification, SDD linkage, handoff completeness, and queue state.
- `acceptance-trace.mjs`: AC identity, REQ linkage, task coverage, and retained
  acceptance proof/evidence.
- `terminal-compat.mjs`: compact/full protocol evidence, terminal closure,
  RED/T3 closure, failed-task artifacts, and legacy brownfield compatibility.

Do not add a generic utils module, check registry, plugin layer, or new status
vocabulary here. If a check crosses ownership boundaries, keep the finding in
the module that owns its contract and pass only the narrow callback it needs.

## Required validation

Run syntax checks for every canonical module, the full `test-mb-doctor`
matrix, `test-install-sync`, and an isolated deployed doctor smoke. Any new
runtime module must be added to the explicit installer asset list and sync
coverage in the same change.
