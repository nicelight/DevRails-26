---
description: Two model-pinned independent co-reviews for existing review and verification commands.
status: active
---
# Semantic pack: finding-adjudication

Before the calling skill's verdict:

- Choose two different review focuses most likely to add useful information for
  the current target. This pack does not prescribe them.
- Launch one fresh co-reviewer per focus on model `Codex Luna` with reasoning
  effort `xhigh`.
- Give each the same target, governing evidence, and scope plus its selected
  focus. Do not expose either co-reviewer's findings to the other.
- Ask for evidence-backed candidate findings. Use returned findings at your
  discretion under the calling skill's existing contracts.

If a co-reviewer does not launch, retry it once. After the second failed launch,
continue without it. Do not substitute another model.

The caller owns the final judgment. Agreement is not a vote. This pack creates
no separate artifact, gate, lifecycle, status, verdict, or handoff.
