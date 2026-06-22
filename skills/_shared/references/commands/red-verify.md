---
description: Adversarial semantic verification задачи (TASK-NNN-FT-NNN-W-N) для поиска "дисциплинированно, но по существу неверно".
status: active
---
# /red-verify — Adversarial semantic verification

<objective>
Проверить, что реализованная задача правильна **по существу**, а не только по process/evidence surface.

Этот проход должен ловить ситуации:
- acceptance criteria формально выполнены, но решена не та проблема
- локально всё выглядит корректно, но решение вредит системе целиком
- реализация переоптимизирована под локальную task interpretation и игнорирует соседние ограничения
- появляются drift, state inconsistency, operational risks или скрытая стоимость сопровождения

Разделение ролей:
- `/verify` → "выполнено ли по AC/REQ и есть ли evidence?"
- `/review-feat-plan` / `/review-tasks-plan` → "достаточно ли качественен feature plan или task planning surface?"
- `/red-verify` → "это вообще хорошее и правильное решение в substance?"
- scheduler (`/autopilot` / `/autonomous`) → task status transitions, closure, failure handling, and dependent block/unblock in scheduler mode
</objective>

<when-to-use>
## Status Transition Modes

Status transitions have two modes.

Scheduler mode:
- `/autopilot` and `/autonomous` own task status transitions.
- Scheduler decides closure/failure/blocking eligibility.
- `/execute` returns scoped implementation handoff; it does not close tasks.
- `/verify` gives functional verdict/evidence; in scheduler mode it does not close/fail/block/promote.
- `/red-verify` gives semantic verdict for per-task T3 checks and T2 feature-completion checks; in scheduler mode it does not close/fail/block/promote.
- Scheduler must write the closure/failure/blocking decision, final task status, and evidence links to the authoritative indexed `.memory-bank/tasks/TASK-*.task.json` record before `/mb-sync`.
- `/mb-sync` records/reconciles already-written task state. It does not decide closure/failure/blocking/promotion and must not sync a decision that exists only in scheduler context.
- T0/T1 scheduler closure may use compact evidence / functional PASS according to tier policy.
- T2 scheduler task closure requires full protocol, required packet/spec gates, and `VERDICT: PASS`; per-task `/red-verify` is not required for T2 task closure.
- T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` with `SEMANTIC_VERDICT: semantic-pass` after all tasks for that feature are implemented, and the verdict must be recorded in the feature doc itself.
- `FT-000` is the Foundation Dev Path pseudo-feature and does not participate in product feature-completion semantics.
- T3 scheduler task closure requires full protocol, required packet/spec gates, `VERDICT: PASS`, and per-task `SEMANTIC_VERDICT: semantic-pass` before scheduler marks `done`.
- T3 scheduler closure also requires exact markers `HUMAN_CHECKPOINT: done` and `ROLLBACK_RECOVERY_NOTE: present`.

Manual mode:
- Expected T0/T1 simple flow: `/execute -> /verify` for one TASK.
- Manual closure is allowed only when an explicit closure owner exists.
- `explicit standalone owner` means either the user directly asked the current top-level agent to close the task, or the top-level agent/orchestrator explicitly runs a manual workflow for one TASK and records that it owns closure. Subagents/worker prompts do not silently become closure owners.
- `/verify PASS` may mark `T0` / `T1` `status: done` only when explicit closure ownership is present and completed evidence has been written to the task record `verify` field and the compact/full protocol required by tier.
- If explicit closure owner is absent, `/verify` records `VERDICT: PASS`, evidence, and a closure recommendation, leaves `status` unchanged, and tells the scheduler/owner to close.
- `T2` manual task closure requires `/verify PASS` plus full protocol and required packet/spec gates; per-task `/red-verify` is optional, while T2 feature completion requires feature-level `/red-verify --feature FT-<ID>` `SEMANTIC_VERDICT: semantic-pass` recorded in the feature doc.
- `T3` manual task closure requires `/verify PASS` plus per-task `/red-verify` `SEMANTIC_VERDICT: semantic-pass` before `status: done` or `/mb-sync`; if semantic-pass is absent, leave closure pending or blocked, not done.
- `semantic-concern` in manual mode means do not trust the existing `done` state without human review / follow-up.
- Do not mix scheduler mode and manual mode inside one task run.
- No persisted `mode` field is used.

Required by tier and mode:
- In scheduler mode, `T2` tasks do not require per-task `/red-verify` before
  scheduler marks the task `done`; the feature still requires feature-level
  `/red-verify --feature FT-<ID>` and a recorded feature-doc semantic verdict
  before feature completion.
- In scheduler mode, `T3` tasks require per-task `/red-verify` before scheduler
  marks the task `done`.
- In manual mode, per-task `/red-verify` is optional for `T2` task closure but
  required for `T3` task closure; feature-level `/red-verify --feature FT-<ID>`
  plus a recorded feature-doc semantic verdict is required before T2 feature
  completion.
- `T0` and `T1` usually do not need `/red-verify` unless their real scope grew
  beyond the recorded tier; in that case update `task.tier` first.

Status ownership:
- `/red-verify` owns semantic evidence and `SEMANTIC_VERDICT: semantic-pass|semantic-concern|semantic-fail`.
- In scheduler mode (`/autopilot` / `/autonomous`), `/red-verify` must not independently close the task, write `status: done`, write `status: failed`, block dependents, or promote dependents. It returns the semantic verdict and recommended next status to the scheduler.
- In standalone/manual mode, `/red-verify` may change `done -> blocked`, `done -> failed`, or create/recommend a bug/follow-up task when semantic issues are found only under explicit closure ownership.

Особенно полезно, если:
- менялись `contracts/*`, `states/*`, миграции, схемы, data behavior
- задача затрагивает несколько feature/module boundaries
- меняется runtime/API behavior
- задача доменно-нагруженная или business-rule-heavy
- AC можно выполнить узко и при этом промахнуться мимо true intent
- изменение архитектурно рискованное или может создать скрытую future cost
</when-to-use>

<when-not-to-use>
Обычно не нужно для:
- typo-only изменений
- formatting-only изменений
- изолированных механических рефакторингов без behavioral impact
</when-not-to-use>

<process>

0) Вход
Ожидается `$ARGUMENTS`:
- `TASK-<NNN>-FT-<NNN>-W-<N>` for per-task semantic verification
- `--feature FT-<ID>` for T2 feature-completion semantic verification

Do not use `--feature FT-000`; foundation is closed through normal `FT-000`
task dependencies and the final foundation gate task.

Modes:
- Per-task mode is required for `T3` task closure.
- Per-task mode is optional/manual for `T2` task closure.
- Feature mode is required before a `T2` feature is treated as complete, after
  all tasks for that feature are implemented.
- `T0` and `T1` usually do not need `/red-verify` unless their real scope grew
  beyond the recorded tier; in that case update `task.tier` first.

1) Не anchor слишком рано на full spec surface
Сначала прочитай в таком порядке:
- task intent из `.memory-bank/tasks/TASK-<NNN>-FT-<NNN>-W-<N>.task.json` через `.memory-bank/tasks/index.json`
- packet intent/scope from `.memory-bank/packets/<TASK_ID>.packet.json` when
  required by tier/policy: all `T2` / `T3`, and `T0` / `T1` only when
  `runtime_context.packet_required` is true
- linked FT/REQ и `.protocols/TASK-<NNN>-FT-<NNN>-W-<N>/plan.md`
- `.protocols/TASK-<NNN>-FT-<NNN>-W-<N>/progress.md`
- `.protocols/TASK-<NNN>-FT-<NNN>-W-<N>/verification.md`, если уже есть
- реальный change surface:
  - изменённые файлы / diff
  - тесты
  - логи, screenshots, traces и другие artifacts в `.tasks/TASK-<NNN>-FT-<NNN>-W-<N>/`

Только после этого подтягивай the smallest sufficient provenance-linked context:
- `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, and linked SDD specs for `T2` / `T3`
- docs linked through existing task fields: `source_artifacts`,
  `normative_inputs`, `constraints`, `invariants`, or `verification_targets`
- feature `spec_design_links`
- docs used to populate `runtime_context` fields
- `requirements.md` only for referenced `REQ-*` reconciliation

Do not discover boundary-map/contracts implicitly. Read
`.memory-bank/contracts/boundary-map.md`, other `contracts/*`, `states/*`,
`guides/*`, `runbooks/*`, or `invariants.md` only when they are linked through
the provenance fields above, feature spec links, or runtime_context evidence.

Важно:
- if the task record has no `tier`, stop with an explicit error
- authoritative red-verification routing is only `task.tier`; the old `risk` / `risk.level` model is invalid and must not be used
- if a packet is required by tier/policy and it is missing, malformed, stale,
  blocked, or inconsistent with the current task record, stop with
  `semantic-concern` and record the packet blocker
- for `T2` / `T3`, `runtime_context.packet_required: false` is a policy
  violation, not permission to skip the packet
- if `task.tier` is `T2` or `T3` and no linked SDD specs are present in task richer fields, feature `spec_design_links`, or `spec-index.md`, stop with a blocker; semantic verification must not bless serious work against AC alone
- if the task record, implementation, or verify verdict conflicts with linked SDD specs or the global backbone in `.memory-bank/spec-backbone.md`, stop with `semantic-concern` or `semantic-fail` instead of choosing locally
- не начинай с предположения, что task record и verify verdict уже доказывают correctness
- сначала сформируй независимую hostile модель риска
- затем сравни её со specs и кодом

2) Построй hostile hypothesis list
Проверь как минимум:
- решена ли реальная задача, а не её удобная локальная интерпретация
- не создала ли реализация false success: local AC passed, but
  `purpose` / `success_outcome` is still not actually achieved
- не нарушены ли `anti_goals`
- не вышла ли реализация за допустимую autonomy/scope boundary from task or
  packet `allowed_write_scope`
- не был ли затронут `forbidden_scope`
- не сдвинула ли реализация responsibility boundary from linked
  `.memory-bank/contracts/boundary-map.md` or contracts without an explicit spec
  update
- не спрятан ли boundary drift behind passing tests or narrow AC
- не скрывает ли weak task/packet context semantic problem, который нельзя
  честно принять без уточнения
- нет ли local optimization с системным вредом
- не нарушены ли linked boundaries, invariants, contracts, or state transitions
- не стал ли код хрупче, сложнее или дороже в сопровождении без достаточной причины
- не создаёт ли решение ложную уверенность за счёт слишком узких тестов/AC

3) Проверь cross-boundary substance
Отдельно оцени:
- cross-feature/module impact
- responsibility/boundary drift against linked boundary-map/contracts
- architectural drift
- state/data consistency
- operational behavior (retries, observability, migrations, failure modes)
- future maintenance cost

Для `T3` обязательно добавь отдельную проверку:
- critical/security concerns
- deploy/runtime/production failure modes
- irreversible/data-loss, compliance, payments, or secrets exposure concerns when relevant
- exact marker `ROLLBACK_RECOVERY_NOTE: present` is present and credible
- exact marker `HUMAN_CHECKPOINT: done` is present before autonomous closure

4) Заполни `.protocols/TASK-<NNN>-FT-<NNN>-W-<N>/red-verification.md`
Используй шаблон проекта, если он есть.
Отчёт должен быть коротким, но содержать:
- semantic verdict
- top substance risks
- false-success / purpose-fit assessment
- anti-goal and scope/autonomy assessment
- weak-context questions that could change the verdict
- hidden assumptions
- cross-boundary impact
- architectural concerns
- state/data consistency concerns
- operational concerns
- future maintenance cost
- "how this could still be wrong"
- counterproposal / escalation path

Do not create a separate Failure Packet. When a packet/spec/task gap blocks a
credible semantic verdict, use the existing report plus this block:

```md
## Failure / Blocker
- Status: blocked|failed
- Where: command/protocol/file
- Expected:
- Observed:
- Likely category: code|spec|task|packet|verification|tool|unknown
- Recommended next action:
- Requires replan: yes/no
```

5) Сохрани короткий артефакт
Per-task mode:
- `.tasks/TASK-<NNN>-FT-<NNN>-W-<N>/<TASK_ID>-S-RED-VERIFY-final-report-docs-01.md`

Feature mode:
- `.tasks/FT-<ID>/FT-<ID>-S-RED-VERIFY-final-report-docs-01.md`
- update the matching `.memory-bank/features/FT-<ID>-*.md` with a durable
  `## Semantic Verification` section containing an exact standalone line:
  `SEMANTIC_VERDICT: semantic-pass|semantic-concern|semantic-fail`, plus a link
  to the `.tasks/FT-<ID>/...` report.

6) Вердикт
- `semantic-pass`:
  - substantive concerns не обнаружены
  - per-task mode: T3 scheduler closure-eligible for normal `done` when `/verify` also has `PASS`
  - per-task mode: T2 result is optional evidence and does not make normal T2 task closure stricter
  - feature mode: T2 feature completion is eligible when all feature tasks are implemented, required task-level gates are satisfied, and the feature doc records `SEMANTIC_VERDICT: semantic-pass`
  - manual T3 closure is eligible when `/verify` also has `PASS`; voluntary `T0` / `T1` / `T2` per-task red-verify does not make their normal verify-based closure stricter
  - recommend `/mb-sync` and closure by the scheduler or explicit standalone owner

- `semantic-concern`:
  - есть серьёзные сомнения или hidden assumptions, но не доказан прямой semantic break
  - scheduler mode: not closure-eligible for normal `done`
  - manual mode: do not trust the existing `done` state without human review / follow-up
  - до продолжения wave требуется явное решение by scheduler/explicit standalone owner: block task/dependents, reopen from `done`, or leave task `in_progress` pending human review
  - если human review принимает concern, зафиксируй owner/reason, обнови work/evidence as needed и повтори `/red-verify`; scheduler normal `done` разрешён только после `semantic-pass`
  - если выбран follow-up, recommend or create it only according to the active workflow ownership
  - recommend not promoting dependents until the task receives `semantic-pass`

- `semantic-fail`:
  - решение по существу неверно, вредно или слишком рискованно
  - заведи or recommend bug doc в `.memory-bank/bugs/BUG-<short>.md` according to active workflow ownership
  - recommend follow-up task as JSON task record
  - scheduler mode: recommend current task `status: failed`
  - manual mode: may change `done -> failed` or create a bug/follow-up task according to the explicit local workflow and closure ownership
  - recommend downstream dependents remain unpromoted/blocked by scheduler

7) Место в normal loop
Рекомендуемый порядок:
- `/execute TASK-<NNN>-FT-<NNN>-W-<N>`
- `/verify TASK-<NNN>-FT-<NNN>-W-<N>`
- `/red-verify TASK-<NNN>-FT-<NNN>-W-<N>` for `T3` task closure; optional for `T2` task closure
- `/red-verify --feature FT-<ID>` after all `T2` feature tasks are implemented,
  before treating the feature as complete; record the verdict in the feature
  doc itself under `## Semantic Verification`
- `/mb-sync`

</process>
