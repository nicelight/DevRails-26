---
name: mb-analysis
description: >
  Discovery artifacts before PRD: route raw ideas through facilitated
  brainstorming and clear concepts through a concise product brief without
  creating tasks.
---

# mb-analysis - Discovery artifacts before PRD

- **What it does:** supports lightweight discovery before `/prd` when the idea is vague, unstable, or needs explicit product framing.
- **Use `/brainstorm` when:** the idea is raw and needs facilitated ideation. The AI acts as a coach; the user's product intent and choices remain the source of truth.
- **Use `/brief` when:** the concept is clear enough to produce a concise Product Brief, or after a brainstorming report exists.
- **Output:** optional artifacts under `.memory-bank/analysis/`.

Discovery is optional. Raw PRD text or an existing external PRD should pass `/constitution` first when project principles are not ratified/partial, then be normalized and checked through `/write-prd`, producing `.memory-bank/prd.md` with `type: prd`, `clarification_status: complete`, and `constitution_checked: true`; then `/spec-init` prepares `.memory-bank/spec-backbone.md` as lightweight pre-PRD framing state and keeps `.memory-bank/spec-index.md` as a pure registry before `/prd` decomposes the PRD. After `/prd`, `/review-feat-plan` checks high-risk/large work before mandatory adaptive `/spec-design`: local/simple feature-set pressure may record a minimal backbone, while shared-boundary, contract, state/data/runtime/security, or strict pressure records the needed domain/model/contracts/state/security/runtime design and any Foundation Dev Path decision. Brownfield projects should map the current codebase first with `/map-codebase` before planning deltas.

`/brief` creates the Product Brief as the input contract for `/constitution` and `/write-prd`. It is not a PRD, backlog, research report, or marketing document.

The normal planning path through task handoff is:

```text
/brainstorm -> /brief -> /constitution -> /write-prd -> /spec-init -> /prd -> /review-feat-plan for high-risk/large work -> /spec-design -> /foundation-to-tasks if required -> /prd-to-tasks FT-<NNN> -> /review-tasks-plan FT-<NNN> -> conditional /mb-doctor -> tier-routed /execute TASK
```

Use `/brainstorm` before `/brief` when the idea is raw. `/constitution` should read the Product Brief when present and run the governing-principles interview; if the user explicitly skips it, downstream PRD work may continue with framework-default/skipped principles.

Discovery commands never create task records. `/spec-design` also does not create task records or feature-local implementation design; it updates backbone SDD specs, `spec-index`, and `.memory-bank/foundation.md` when needed. `/foundation-to-tasks` creates normal `FT-000` foundation task records when required, while `/prd-to-tasks FT-<NNN>` performs product feature-level design before task slicing. `/clarify-feature FT-<NNN>` is optional and only for a specific feature that is explicitly pending/blocked or has decomposition-affecting unresolved markers. `/spec-improve FT-<NNN>` is repair/refresh only, not a happy-path prerequisite.

## Artifacts

- `.memory-bank/analysis/index.md`
- `.memory-bank/analysis/product-brief.md`
- `.memory-bank/analysis/brainstorming/BR-<NNN>.md`

Templates in `assets/` are reference shapes for those artifacts. They are intentionally compact and can be adapted during interactive sessions.
