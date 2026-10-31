# DevRails Nav 27 — независимая приёмка семантики

**Verdict: READY_FOR_ARCHITECTURE.** Дерево поверх `45ae29e`, 2026-11-01; blockers отсутствуют. DSH runtime/UI/controller не
реализованы; legacy packaging не является DSH adapter.

Live-selection correction проверена отдельно: [SEMANTIC_LIVE_SELECTION_RESULT.md](SEMANTIC_LIVE_SELECTION_RESULT.md).
Freeze всей task attempt устранён; readiness относится к исправленной границе
каждого launch/skip, а не к прежнему замороженному pipeline.

## Покрытие

Source независимо сверён с policy/handoffs/deployment; coverage — [SEMANTIC_INVENTORY.md](SEMANTIC_INVENTORY.md).

| Команды | Проверенная граница |
| --- | --- |
| start, mb-init | Verified bootstrap/sync, реальная availability, unfinished owner. |
| fill, context-manifest, find-skills | Read-only context, origin и capability gaps. |
| creator-vibe, grill-me, constitution, write-prd, discuss, map-codebase | Intent/authority, durable meaning, общий decision flow, as-is ≠ target. |
| spec-init, prd-to-features, feature-doctor | Framing, stable decomposition/AC, bounded triage. |
| spec-design, spec-redesign, spec-auto | Conditional design, accepted owners, affected reconciliation/revision. |
| foundation-to-tasks, feature-to-tasks | FT-000/one-feature identity, dependencies, selected proof, complete task cards. |
| review-feat-plan, review-tasks-plan, architecture-review, kiss-architect | Selected review/KISS, subject verdict, owner repair без launch. |
| exe, add-tests, verify, red-verify | Bounded implementation, independent selected proof, candidates, honest absence. |
| debug, technical-premortem, tech-debt | Scoped supporting/advisory evidence, без lifecycle authority. |
| mb-sync, mb-garden, mb-doctor | Recorded-state reconciliation, mechanical repair, read-only diagnostics. |
| autopilot, autonomous, multiagentic, multipilot | Host scheduling/lifecycle, conditional Judge, autonomous decisions весь run. |

**37/37**; families:

| Family | Coverage |
| --- | --- |
| 6 workflows / 7 roles | DSH-only, один обязательный compact structured feedback, host mechanics, conditional checks, common decisions/recovery. |
| 6 agent prompts / 2 packs | Selected assignments, no fixed models/fanout/immutable Judge; candidates не functional PASS. |
| 7 protocols | Selected files/sections, actual results, partial effects, no synthetic PASS. |
| deployable AGENTS / Constitution / structure | Ownership, configurable defaults, no disabled-artifact gates. |
| recovery / ADR / concept templates / deprecated stub | Реальные installed routes; optional artifacts; deprecated не required. |
| 3 package entrypoints / installer / init generator | Source-only delivery, explicit resources, collision/sync ownership. |
| lint / doctor entry + 7 modules | Identity/dependencies, conditional evidence, attempt selection и legacy compatibility. |
| README / howItWorks / GREENFIELD_WORKFLOW / PROJECT_MAP | Итоговый продукт и readiness; metadata/display Nav 27, compatibility identities сохранены. |

## Подтверждённые findings и исправления

1. Doctor принимал historical repair через промежуточный PASS участника,
   отсутствующего в `selected` той попытки. Regression воспроизвёл
   RED; `terminal-compat.mjs` проверяет selected/result shape самой repair-попытки.
2. Doctor требовал optional Backbone Area Matrix при Nav design complete.
   `foundation-backbone.mjs` допускает отсутствие таблицы; existing matrix и
   legacy rules проверяются. Добавлен regression.
3. Verification template требовал functional verdict от candidate-only review.
   Теперь сохраняет candidates без PASS или replacement main.
4. Общий execute-loop безусловно описывал повышение revision. Согласован
   no-recorded-revision route с spec-redesign: только affected reconciliation.
5. Общий mb-sync предписывал обновлять feature/epic lifecycle. Уточнено отражение
   host-recorded state без записи transitions моделью.
6. Tier policy замораживал все будущие checks перед exe. Теперь pending selection
   обновляется в той же attempt до запуска соответствующей операции/участника;
   local checks входят в exe snapshot, будущие verify/red — нет. Начатая работа,
   skip, interruption и закрытые attempts не переписываются.

## Walkthrough

Read-only walkthrough инструкций:

- Ordinary greenfield/brownfield: supplied input переиспользуется; только
  selected stations, настоящие baseline dependencies и непосредственные owners.
- Repair/retry: implementation correction сохраняет identity; product/design
  change возвращается owner; actual negatives требуют scoped disposition.
- Main-path consultation: тот же question/red/wait; refusal отменяет proposal,
  incomplete answer не разрешает движение, green не создаёт внешние факты.
- Autonomous: semantic choice разрешён во всём run; manual stops/permissions
  остаются, provenance не подменяется user consent.
- Recovery: actual state сильнее checkpoint; completed/partial/skipped work
  сохраняется, unsafe effects не повторяются; sync не backfill-ит историю.
- All-off/main-off/code-only/red-alone/local checks: отсутствие proof честно;
  `done` не `verified`, code candidates не PASS; reports conditional.

Local checks default-on и red-alone — рабочие defaults, не ответы пользователя.
Nav использует existing `task.verify`, `stage: workflow`, attempt/selected,
`protocols: []`; pending — план, не evidence. Diagnostics проверяют retained
choices соответствующей работы, не live config. Toggle будущей работы не требует
новой attempt, повторного exe или отдельного approval и не отменяет actual FAIL.

## Фактическая validation

- `check:syntax`, `test:mb-doctor`, `test:install-sync` — pass.
- Изолированные install-only/bootstrap/sync: `/tmp/nav27-acceptance.kBj1a3/`.
- Parity: 148 command copies, 68 local-resource copies, 6 workflows, 7 roles,
  7 templates, 9 validator files; 3 prepared package routes доступны.
- Required shared paths/anchors и ссылки обновлённых docs разрешаются;
  source-only required paths в commands отсутствуют.
- Deployed strict doctor: T2 done/all-off/no reports — pass; unselected
  historical repair — ожидаемый error; selected repair и optional matrix — pass,
  0 errors/warnings. Diagnostic не изменял task evidence.
- После финального уточнения mb-sync повторены isolated sync и parity audit;
  полный suite без кодовых изменений повторно не запускался.
- `git diff --check` — pass; source generated `shared-*` — **0**.
- Live-selection correction: полный doctor/install-sync и syntax — pass;
  isolated delivery `/tmp/nav27-live.syZfDL/`, deployed strict doctor на active →
  pending-off → done одной attempt — pass, без reports/PASS и изменений evidence
  диагностикой. Отдельный regression сохраняет FAIL при отключении pending peer.
  Fresh empty skeleton даёт ожидаемый strict `TASK_INDEX_EMPTY`.

Root AGENTS/WORK_LOG, исторические результаты, чужие papercuts сохранены.
Без commit/push. Feedback transport и DSH execution/enforcement — следующий этап.
