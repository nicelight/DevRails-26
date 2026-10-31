# Nav 27: результат адаптации planning/reviews

Пакет 2 выполнен в `/home/serg/Projects/DevRails Nav 27`, ветка
`devrails-nav-27`, поверх `2d89431`. DSH runtime/API/UI/state engine не создавались.
Root AGENTS и WORK_LOG не изменялись; commit/push не выполнялись.

## Изменённый scope

- Все 12 команд пакета: `spec-init`, `prd-to-features`, `feature-doctor`,
  `spec-design`, `spec-redesign`, `spec-auto`, `foundation-to-tasks`,
  `feature-to-tasks`, `review-feat-plan`, `review-tasks-plan`,
  `architecture-review`, `kiss-architect`.
- Все шесть `skills/_shared/agents/*.md`, оба semantic packs, recovery,
  concept architecture/guide, ADR и deprecated deep-questioning references.
- Installer resource wiring и соответствующие install-sync assertions.
  `map-codebase` и `mb-garden` изменены только для явной навигации к доставленным
  optional prompts/recovery. Основная maintenance семантика остаётся пакету 3.
- Fresh-only inline ADR skeleton в `init-mb.js`: снято требование отдельного ADR
  для каждого значимого решения. Ownership/sync существующего project-owned
  ADR template не менялся; сохранение пользовательского текста проверяется.

## Получившийся контракт

Каждая команда использует доставляемый `autonomy-policy.md`: компактный
структурированный flow feedback обязателен, subject verdict отделён от него.
Host запускает участников и записывает lifecycle; модели выполняют предметную
работу и возвращают решения/факты. Нестандартные routes, repairs и консультации
проходят общий decision flow; autonomous может принимать семантические решения
во всём run с правильным provenance, не снимая ручные остановки и не выдумывая
внешние факты. Точные поля/transport не проектировались.

Старые конфликтующие инструкции заменены в самих leaf-контрактах:

- Нет обязательного предыдущего design/framing/review bundle и фиктивного
  положительного Planning Revision при выключенном global design. Реальный
  недостаток смысла, конфликт authority или невалидная task identity остаётся
  причиной остановить затронутую работу.
- Нет fixed models, обязательных двух co-review focuses, ручного launch/retry
  алгоритма или обязательных REQUEST/report/protocol каскадов. Выключенные
  reviews/Architect/Judge не требуют launch, fallback, отчёта или APPROVE.
- Краткие реальные результаты сохраняются для recovery. Полученный REJECT/FAIL
  остаётся отрицательным evidence; продолжение требует disposition по общему
  flow, а не подмены verdict на skipped/APPROVE.
- Сохранены authority, canonical subject ownership, REQ/FT/AC identity,
  task schema/index, ID/tier/wave/dependency consistency, hard/advisory scope,
  execution cohesion, selected proof coverage и запрет выдуманного backfill.
- Планирование сохраняет существующие task IDs, lifecycle, partial work и
  evidence. Material identity/scope change возвращает `rebuild_required`.
  Существующий global revision меняется только по доказанному global impact;
  bounded impact сохраняет revision и помечает только affected features.
  Когда global design не записывался, global impact не создаёт фиктивный
  revision: existing reconciliation marker удерживает affected tasking repair.
- Foundation остаётся FT-000 в обычной очереди. Integrated proof gate условен
  по выбранной работе/действительной accepted dependency; выключенный proof не
  создаёт отдельную task. Существующая gate identity/negative evidence сохраняется.
  Product tasks удерживают реальные baseline dependencies, не выдуманные gates.

## Сверка переходов и walkthrough

Это семантический walkthrough инструкций, не запуск будущего DSH runtime.
Проверены M09–M16 и R03–R12c из `TRANSITIONS.md`, а recovery references — против
его общего правила восстановления и разрешения отклонений.

| Сценарий | Результат сверки |
| --- | --- |
| Greenfield | Framing → decomposition → выбранные review/design → нужная Foundation либо one-feature tasking. Нет принудительного полного artifact bundle; unresolved meaning идёт владельцу через decision flow. |
| Brownfield | Mapping даёт as-is evidence, не target authority. `--verify-existing` может подтвердить no-queue baseline; недостаток evidence предлагает минимальные probes/disposition, не создаёт очередь автоматически. |
| One feature | Ровно один FT, FT-000 исключён; schema/index и существующая identity сохраняются. Отключённые design/review не требуют фиктивных specs, revision, APPROVE или report. |
| Bounded repair | Revision и unaffected work сохраняются; marker/repair только для affected features; enabled re-review охватывает изменённые claims. |
| Global repair | Доказанное изменение product-wide planning semantics; existing revision повышается один раз, затронутые consumers названы. Нет автоматического replay implementation/evidence. Без recorded revision используется existing feature marker. |
| Reviews/Architect/Judge off | Ни planning handoff, ни packs не включают скрытого reviewer/fallback и не требуют отчёта. Subject review запускается только по settings/явному запросу. |
| Actual REJECT | Finding и governing product basis сохранены; первый реальный owner, optional feature-doctor triage, затем authorized repair/continuation. Doctor не новый обязательный gate. |
| Autonomous/manual stop | Semantic choice разрешён с autonomous provenance; missing external input и manual red/Pause/Stop остаются ограничениями. |

## Delivery и проверки

Все shared prompts имеют реальные installed routes на обеих поверхностях:

| Prompt/resource | Installed owner |
| --- | --- |
| `repo-scanner.md` | `map-codebase/agents/` |
| `mb-reviewer.md`, recovery plan | `mb-garden/agents/`, `mb-garden/references/` |
| `review-scope.md` | `review-feat-plan/agents/` |
| `review-plan.md`, `review-security.md` | `review-tasks-plan/agents/` |
| `review-code.md` | `verify/agents/` |
| ADR/concept templates | `spec-design/references/`; ADR также `spec-redesign/references/` |
| Finding/web packs | прежние review/verify owners, source/deployed parity сохранён |

Deprecated deep-questioning больше не является required runtime dependency.
Optional resource availability сама не включает соответствующую операцию.

Проверки:

- `npm run check:syntax --silent` — pass.
- `npm run test:mb-doctor --silent` — pass существующей regression matrix.
- `npm run test:install-sync --silent` — pass, включая новые resource parity,
  conditional planning assertions, restoration/idempotence, collision safety,
  bootstrap-only границы и сохранение project-owned ADR текста.
- Отдельные install-only/bootstrap и последующий sync:
  `/tmp/nav27-planning.gLdcNT/{install-only,bootstrap}`.
- Scoped audit: 148 command copies (37 × 2 surfaces × 2 targets) совпадают
  с canonical source; 17 resource routes совпадают на обеих поверхностях/targets.
  Required workflow paths/anchors в затронутых командах разрешаются после
  bootstrap; локальные installed agent/reference paths существуют. Нет
  source-only required path в изменённом scope.
- Отдельный deployed doctor: `pass`, 0 errors; старый
  `SPEC_BACKBONE_NOT_READY` warning ожидаемо сохраняется до пакета 3.
- `git diff --check` — pass; generated package-local `shared-*` в source — `0`.

## Оставшиеся зависимости

Пакет завершён; всей миграции и runtime readiness это не означает.

1. Пакет 3 должен согласовать execution/schedulers/maintenance, protocol и inline
   MBB/testing/structure skeletons и validators с conditional inputs/evidence.
   В частности, no-PASS closure, disabled design без positive revision, отсутствие
   обязательного Foundation proof gate, conditional review reports и single-card
   context из имеющихся accepted inputs. Старый doctor ещё может отклонить такую
   новую разрешённую конфигурацию; его прошедшие старые tests не доказывают её.
2. `verify` пока сохраняет старую инструкцию fixed-model code co-review несмотря
   на адаптированный shared prompt/pack. `red-verify`, autonomous/autopilot и
   прочие команды пакета 3 ещё не переписаны. Большая переделка не включена сюда.
3. Независимый red-verify без functional verify и policy локальных execution
   checks здесь не выбирались. RED/GREEN остаётся условным по execution proof
   policy; verify settings не используются для вывода этой политики.
4. Project-wide docs/PROJECT_MAP/inventory descriptions остаются пакету 4;
   например старое описание двух fixed co-review focuses не является новым
   контрактом. Installer по-прежнему проверяет legacy packaging surfaces,
   не подключение/реальный запуск в DSH.
