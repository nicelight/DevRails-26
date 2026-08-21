# Handoff: third co-reviewer for `/verify`

Add an optional third co-reviewer to `/verify`, using the rewritten
`skills/_shared/agents/review-code.md` prompt.

The goal is to obtain task-relevant implementation-quality findings without
expanding the main `/verify` logic. The verifier retains the only verdict and
decides how to use candidate findings. It does not manage separate focuses or
launch conditions for three co-reviewers.

The third co-reviewer may occasionally run when irrelevant or fail to run. This
must not block verification. Its launch is a single best-effort attempt with no
retry, using model `Codex Luna` with reasoning effort `xhigh`.

`review-code.md` is a read-only co-reviewer prompt scoped to the actual change
surface. It returns only evidence-backed candidate findings and creates no
verdict, artifact, lifecycle, gate, status, or handoff. It does not replace
`/verify` or `/red-verify`.

Keep source-only packaging. Deploy the prompt as
`agents/review-code.md` inside the installed `/verify` runtime skill; do not
create a separate public skill or embed the prompt text in `verify/SKILL.md`.

Validate the installed behavior in an isolated target and confirm that no
generated `shared-*` files appear in the source tree.
