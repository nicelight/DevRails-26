---
description: Maintain concise governing principles and their decision provenance.
status: active
---
# /constitution — Project Constitution

Apply `.memory-bank/workflows/autonomy-policy.md` for decisions, effective
settings, host ownership and recovery.

Own `.memory-bank/constitution.md`: project principles, genuine non-negotiables,
autonomy boundaries, completion meaning and human checkpoints. Keep concrete
domain rules in their existing spec/contract owners. Do not create product scope,
a governance engine or another task/status model.

Use the current Constitution, `.memory-bank/analysis/brief.md` and relevant product sources, AGENTS, MBB and
applicable invariants/contracts/workflows. Missing discovery is context quality,
not a prohibition on discussing principles. If the Constitution is absent,
create the short governing document with `description`, `status: active`,
`version`, `project_principles`, `ratified`, and `last_updated` metadata.

Resolve only material open choices through the common decision flow. Address
applicable simplicity/maintenance priorities, Definition of Done, autonomy and
critical constraints without prescribing an interview shape or project-size label.
Reuse accepted answers. Framework-default checks are configurable; do not elevate
them into immutable project non-negotiables. Changing an explicit project rule
requires a real governing decision, with superseded wording removed.

`project_principles` means:
- `ratified`: applicable governing choices are settled;
- `partial`: remaining choices and the decision to proceed are explicit;
- `framework-default`: only generated defaults exist;
- `skipped`: the decision to skip this discussion is explicit.

Record user or autonomous provenance without inventing user consent. For
ratified/partial decisions set `ratified: YYYY-MM-DD`; defaults/skipped retain
`ratified: null`. Keep unresolved conflicts and their affected scope visible.
Absence of an answer is not an explicit skip in ordinary mode.

Check consistency of changed principles with their canonical owners. Report only
changed decisions, principle state and material gaps. With resolved governing
conflicts, including an accepted skip, hand off to `/write-prd`; otherwise keep
the question at `/constitution`. No interview transcript or per-run report is due.
