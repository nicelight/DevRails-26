# DevRails Nav 27 — source-проверка архитектуры

**Verdict: REVISED_PLUGIN_ONLY_PROPOSAL_SOURCE_CHECKED; RUNTIME_UNVERIFIED.**
Архитектура и план согласованы с принятыми plugin-only/station settings.
Это актуализация проекта реализации, не новая независимая runtime-приёмка.
Предыдущая source-приёмка не доказывает исполнение изменённого flow.

Основание: [решения пользователя](../../DEVRAILS_NAV_27.md),
[station semantic correction](SEMANTIC_STATION_SETTINGS_RESULT.md),
[autonomy-policy](../../skills/_shared/references/workflows/autonomy-policy.md#runtime-ownership),
[tier-policy](../../skills/_shared/references/workflows/tier-policy.md#selected-work-and-retained-results),
[архитектура](ARCHITECTURE.md), [план](IMPLEMENTATION_PLAN.md).
DSH source baseline: `ce7073d51254c26cd63b22a60835b8f948deb447`.

## Принятые границы

- Nav — отдельный устанавливаемый bundle. Host использует Cordis Loader,
  standalone Svelte — existing webServer/Connection/Gateway, native addon —
  dynamic `dsh.client` delivery. DSH core, hardcoded web-entry и build roster
  не изменяются. Nav package собирает свои assets и Remote descriptors.
- Settings/models/options доступны только initial ready/stopped station.
  Green/admission фиксирует весь следующий перегон, включая ещё не запущенных
  selected peers и local checks. Без red следующая операция допускается
  автоматически без edit window. Freeze целой task attempt не вводится.
- Exe, verify и red — отдельные перегоны. На stopped exe station будущий verify
  можно изменить в той же attempt. Existing results/FAIL/skips сохраняются;
  partial/blocked/error/needs-decision не превращаются в success.
- Pause/red ждут результатов текущего перегона и запрещают следующий admission.
  Nav Stop запрашивает best-effort отмену, сохраняет partial effects и требует
  actual-state reconciliation перед editing/resume, без atomic drain/rollback.
- Native Stop остаётся session cancel, не workflow Stop. Native model selection
  остаётся штатным выбором следующего запроса; Nav не обещает global model gate.
- Один compact feedback и один pending decision сохраняются. Green/main-user
  consent разрешают только актуальный запрос; Side/model text не user permission.
  Autonomous использует тот же decision flow и не снимает manual holds.
- Host сохраняет lifecycle, модели — subject results/proposals. Existing DSH
  tool permissions и role capabilities сохраняются без новой security системы.
- Side create и вызов H разрешены в движении. Timing инспекции H остаётся
  открытой деталью; рекомендация — ближайшая станция без изменения current leg.

## Source evidence и проверки

Pinned links в архитектуре подтверждают native create/setup/spawn/results,
model selection/session cancel, dynamic client modules, plugin installation,
package-mode Typert generation, headless transport и UI extension points.
Это existing APIs, не proposed upstream hooks. Canonical contracts и runtime
код этим архитектурным проходом не изменялись.

Проверены local documentation links, pinned DSH source paths, согласованность
station/admission примеров и absence отменённых hooks/live peer edits;
`git diff --check`, source generated package-local `shared-*` count = 0.
Semantic regression и isolated delivery выполнены в отдельном
[semantic correction](SEMANTIC_STATION_SETTINGS_RESULT.md), не повторялись
для этих документационных изменений. Исторические результаты не переписаны.

## Что ещё не проверено исполнением

Установка отдельного Nav package/client addon в DSH, реальные browser builds и
Remote mounts, HTTP/WS/auth за mount prefix, native model turns/feedback,
cold-resume composition, whole-leg admission, best-effort stop/recovery,
Side lifecycle и native card/link ещё должны пройти outcomes плана.
Визуальная геометрия карты ещё требует согласования перед полной UI реализацией.
Source inspection и semantic delivery tests не заменяют эти проверки.
