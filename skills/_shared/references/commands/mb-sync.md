---
description: Синхронизация Memory Bank после изменения: обновить индексы, RTM/task records и changelog.
status: active
---
# /mb-sync — Memory Bank sync

Используй на boundary where broader Memory Bank state must be reconciled.
The normal scheduler/manual boundary is the end of the current wave, after each
task has already written authoritative status, closure decision, and evidence.
Manual `T0` / `T1` local closure does not require full `/mb-sync` when only
task `status`, task `verify`, and compact `.protocols/<TASK>/run.md` changed.

Follow: `.memory-bank/workflows/mb-sync.md`

## Status ownership

Status transitions have two modes.

Scheduler mode:
- `/autopilot` and `/autonomous` own task status transitions.
- Scheduler decides closure/failure/blocking eligibility.
- `/execute` returns scoped implementation handoff; it does not close tasks.
- `/verify` gives functional verdict/evidence; in scheduler mode it does not close/fail/block/promote.
- `/red-verify` gives semantic verdict for per-task T3 checks and T2 feature-completion checks; in scheduler mode it does not close/fail/block/promote.
- Scheduler must write the closure/failure/blocking decision, final task status, and evidence links to the authoritative indexed `.memory-bank/tasks/TASK-*.task.json` record immediately after each task and before the next `/mb-sync` boundary.
- `/mb-sync` records/reconciles already-written task state. It does not decide closure/failure/blocking/promotion and must not sync a decision that exists only in scheduler context.
- T0/T1 scheduler closure may use compact evidence / functional PASS according to tier policy.
- T2 scheduler task closure requires full protocol, applicable task/spec gates, and `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, recorded in the feature doc.
- `FT-000` is the Foundation Dev Path pseudo-feature and does not participate in product feature-completion semantics.
- T3 scheduler task closure requires full protocol, applicable task/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires the exact marker `HUMAN_CHECKPOINT: done`.

Manual mode:
- Expected T0/T1 simple flow: `/execute TASK`, compact local evidence, and optional closure by the explicit manual top-level owner.
- Manual closure is allowed only when an explicit closure owner exists.
- `explicit standalone owner` means either the user directly asked the current top-level agent to close the task, or the top-level agent/orchestrator explicitly runs a manual workflow for one TASK and records that it owns closure. Subagents/worker prompts do not silently become closure owners.
- `/execute` may close `T0` / `T1` only under the tier-policy fast-lane conditions; otherwise closure remains with `/verify`, scheduler, or explicit owner.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- `T2` manual task closure requires full protocol, applicable task/spec gates, and `/verify PASS`; per-task `/red-verify` is optional, while T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc.
- `T3` manual task closure requires `/red-verify` `SEMANTIC_VERDICT: semantic-pass` after `/verify PASS`; if semantic issues are found, the scheduler or explicit owner may reopen/block/fail or create follow-up work.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Do not mix scheduler mode and manual mode inside one task run.
- No persisted `mode` field is used.

- `/mb-sync` synchronizes Memory Bank docs, RTM/lifecycle notes, changelog, evidence links, and task-record consistency after a closure/failure/blocking decision already exists in the authoritative task record.
- `/mb-sync` does not independently decide task closure, failure, blocking, promotion, `planned -> ready`, dependent unblock, or dependent block.
- Local task closure may update only `task.status`, task `verify`, and
  `.protocols/<TASK>/run.md` without invoking full `/mb-sync` when no RTM,
  lifecycle, index, changelog, spec, contract, guide, dependency, or
  feature state changed.
- Run full `/mb-sync` once at the end of the current wave for
  RTM/lifecycle/changelog/index/router/spec/contract/guide consistency,
  dependency or promotion reconciliation, T2 feature completion after
  feature-level red-verify, T3 closure, handoff/review freshness, or suspected
  drift.
- Do not run full `/mb-sync` after every ordinary task. Run an early sync only
  when continuation of the current wave depends on reconciled
  RTM/index/spec/contract/changelog state or when the explicit owner requests
  sync. An early sync does not replace the end-of-wave sync.
- Skipping full `/mb-sync` must not silently promote dependents. If the next
  task depends on broader reconciled state, run `/mb-sync` or have the explicit
  owner update the next task deliberately.
- In `/autopilot` / `/autonomous`, the scheduler owns task status transitions, closure, failure handling, and dependent block/unblock. `/mb-sync` records already-written scheduler decisions and reports consistency problems.
- If a closure/failure/blocking decision is only present in the current agent/scheduler context and is not written to the indexed `.task.json`, `/mb-sync` must report a consistency gap and stop for an explicit scheduler or standalone owner decision.
- In standalone/manual mode, `/mb-sync` may sync a manual closure only if the explicit owner decision is already recorded in the task record or supplied as a direct instruction for this sync. Otherwise it must report a consistency gap and must not infer closure.
- `/mb-sync` must not silently claim scheduler ownership, become the closure owner, or advance dependents on its own.
- If boundary responsibilities or guide-level HOW changed materially, recommend
  updating existing `.memory-bank/contracts/boundary-map.md`, related
  `.memory-bank/contracts/*`, or `.memory-bank/guides/*`. Do not create a new
  boundary lifecycle, status model, or artifact family.
- If SDD design docs changed, reconcile existing design state only:
  `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, feature
  `spec_design_status`, feature `spec_design_links`, linked canonical
  `.memory-bank/architecture/`,
  `.memory-bank/contracts/`, `.memory-bank/domains/`, `.memory-bank/states/`,
  `.memory-bank/adrs/`, `.memory-bank/testing/`, `.memory-bank/guides/`, and
  `.memory-bank/runbooks/`. Do not move decision bodies into
  `.memory-bank/spec-index.md`; it remains a registry.
- If behavior specs were added, removed, or made stale by clarification/spec
  changes, reconcile only their feature links and task `source_artifacts` links.
  Behavior specs remain optional examples, not gates, registries, schemas,
  verification targets, or done criteria.

Минимальный чеклист:
- [ ] Обновить релевантные `.memory-bank/*` (WHY/WHERE, без псевдокода)
- [ ] Если есть `.memory-bank/analysis/*`, синхронизировать durable discovery artifacts как часть Memory Bank; если их нет, не создавать их автоматически
- [ ] Обновить `.memory-bank/index.md` и подпапочные роутеры
- [ ] Если менялись governance/workflow/routing/agent instructions/tier policy, проверить consistency с `.memory-bank/constitution.md`
- [ ] If SDD design state changed, reconcile `.memory-bank/spec-backbone.md`
      Global Backbone Status and Backbone Area Matrix, including stale
      `needed_before_tasks` rows, without inventing new design decisions.
- [ ] Keep `.memory-bank/spec-index.md` as a pure registry/planned-spec index
      using `Type | Path | Status | Scope | Change route` for active specs;
      add or remove registry links for changed specs, but do not write
      backbone status, feature status maps, decision bodies, contract rules,
      feature ownership, or `used_by` there.
- [ ] Reconcile feature frontmatter `spec_design_status` and
      `spec_design_links` with actual linked specs. If a design is stale or
      contradictory, mark/report it as `blocked` and route feature-level
      canonical spec repair
      to `/prd-to-tasks` or shared/global repair to `/spec-design`; do not invent
      a `stale` lifecycle value.
- [ ] Ensure changed SDD docs are routed from the relevant feature, registry, or
      backbone: `.memory-bank/architecture/`,
      `.memory-bank/contracts/`, `.memory-bank/domains/`,
      `.memory-bank/states/`, `.memory-bank/adrs/`, `.memory-bank/testing/`,
      `.memory-bank/guides/`, and `.memory-bank/runbooks/`.
- [ ] If task records or verification targets reference Architecture Spine
      `AD-*` anchors, verify the anchors still exist after sync.
- [ ] Обновить RTM/REQ lifecycle в `.memory-bank/requirements.md`
- [ ] Если у EP/FT есть `lifecycle`, синхронизировать его отдельно от document `status`
- [ ] Проверить, что task records не ссылаются на features с `clarification_status: pending|blocked`
- [ ] Reconcile authoritative task records in `.memory-bank/tasks/index.json` and indexed `*.task.json`; write/sync status only when an explicit standalone owner decision is already recorded or supplied as a direct instruction, or synchronize status already written by the scheduler
- [ ] For local manual `T0` / `T1` closure, do not expand into full sync if only
      task `status`, task `verify`, and compact `.protocols/<TASK>/run.md`
      changed
- [ ] If boundary/guide docs were materially affected, update or recommend
      updates to existing contracts/guides only; no new boundary status/lifecycle
- [ ] If behavior specs are linked from feature docs or task `source_artifacts`,
      verify the files exist and report stale examples as notes unless an
      ordinary acceptance/spec/verification source also fails.
- [ ] Записать changelog `.memory-bank/changelog.md`
- [ ] Run `/mb-doctor --strict` after sync for `/autonomous` and `/autopilot`
      handoff. Also run it for T3, complex T2, foundation/dependency/
      stale-doc/risky-link cases before execution handoff. Do not require
      strict mode for a bare skeleton or simple manual T0/T1 closure.

Task synchronization rule:
- Discovery artifacts in `.memory-bank/analysis/` are durable Memory Bank artifacts, but optional.
- If `.memory-bank/analysis/product-brief.md` exists, keep downstream docs consistent with it or record explicit deltas / override notes.
- If brainstorming artifacts exist without a product brief, preserve them and warn that `/brief` is the expected bridge before `/prd` unless an existing PRD was intentionally used.
- When governance, workflow, routing, AGENTS.md, MBB, spec-backbone, spec-index, invariants, task schema, or tier policy changes, compare affected docs with `.memory-bank/constitution.md`.
- If the change contradicts the Constitution, stop sync and require either a minimal doc correction or explicit `/constitution` amendment.
- Do not use `/mb-sync` to invent new governing principles; only reconcile documented changes and evidence.
- `.memory-bank/spec-backbone.md` stores global backbone/readiness state.
  `.memory-bank/spec-index.md` stores canonical registry/planned-spec links only. Feature
  `spec_design_status` and `spec_design_links` live in feature frontmatter.
- `/mb-sync` may reconcile these fields after an already-made design/task
  decision, but unresolved or contradictory design state must route to
  `/prd-to-tasks` feature reconciliation or `/spec-design` shared/global repair
  rather than being guessed during sync.
- JSON task records are authoritative for task status, dependencies, tier, gates, verification targets, and evidence markers.
- Authoritative routing is only `task.tier`; the old `risk` / `risk.level` model is invalid and must not be used.
- RTM and changelog should be reconciled from JSON task records.
- During sync, validate and report whether scheduler-owned promotions/blocking changes would be legal; do not write `planned -> ready`, dependent unblock, or dependent block from `/mb-sync` alone.
- Report tasks whose `feature` points to `clarification_status: pending|blocked` as not promotion-eligible. Missing clarification metadata is allowed.
- Report tasks with failed/blocked upstream dependencies, open blocking bugs, or unresolved semantic concern decisions as not promotion-eligible.
- In scheduler mode, `T2` tasks may close when full protocol closure expectations, applicable task/spec gates, and `/verify` `VERDICT: PASS` are present; per-task `/red-verify` is not required. `T2` feature completion separately requires feature-level `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc.
- In scheduler mode, `T3` tasks may close only when full protocol closure expectations, applicable task/spec gates, `/verify` `VERDICT: PASS`, per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass`, and the exact marker line `HUMAN_CHECKPOINT: done` are present.
- In manual mode, `T0` / `T1` may close through `/execute` fast-lane evidence or `/verify PASS`, and `T2` may close when full protocol plus applicable task/spec gates are satisfied, only with explicit closure ownership; `T3` requires per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass` before final closure. Full `/mb-sync` runs at the wave boundary.
- `mb-doctor` is the readiness gate over `mb-lint`; in autonomous/autopilot runs, the scheduler may promote dependents only after strict doctor passes.
