# DevRails Nav 27 — независимая приёмка архитектуры

**Verdict: READY_FOR_IMPLEMENTATION_SPIKE.** Blockers отсутствуют после
исправлений и согласования с canonical `f757db1`. Это приёмка проекта реализации,
не доказательство работающего DSH plugin/UI. Визуальная схема путей ещё требует
согласования перед построением полной карты.

Основание: [семантика](SEMANTIC_ACCEPTANCE.md),
[live selection correction](SEMANTIC_LIVE_SELECTION_RESULT.md),
[решения пользователя](../../DEVRAILS_NAV_27.md),
[архитектура](ARCHITECTURE.md), [план](IMPLEMENTATION_PLAN.md).
Исходники DSH независимо просмотрены на
`ce7073d51254c26cd63b22a60835b8f948deb447`; research checkout чистый.
Canonical contracts в архитектурном проходе не изменялись.

## Исправления

- Native Stop server hook не делал кнопку доступной при idle main + active
  children: DSH InputBar/shortcut зависят от running/open turn. Tiny native
  extension использует existing `conversation.session.header.utilities`
  для Nav Stop с тем же controller reducer. Третий upstream hook не нужен.
- Непустой Side fork теперь явно передаёт `meta.isSeeded=true` вместе с exact
  inherited count. Без этого Session constructor отклоняет seed.
- Seed сохраняет model selection/request history, имеющие приоритет над
  `agentOptions`. Initial Side setup явно записывает выбранную route через
  `agent.model.select`; cold resume сохраняет Side selection. План проверяет
  различающиеся main/Side models и первый фактический call.

- Устранён freeze целой task attempt и reviewer batch. Pending selected
  меняется в той же attempt; каждая операция/participant фиксирует выбор при
  launch/skip. Embedded local checks сохраняются с exe; будущие verify/red и
  peers изменяемы без approval/repeated exe. History/negative evidence неизменны.

Source anchors и outcomes добавлены непосредственно в архитектуру/план.

## Проверенные границы

- Native create/resume/setup и handle disposal; activation startup cancellation
  отдельно от post-publication dispose; `whenIdle` не receipt одного prompt.
- Два proposed seams обоснованы текущим source: `AgentModel.select` пишет
  selection без gate, `session.cancel` не уведомляет Nav и idle cancel — no-op.
  Pre-step/status listeners не заменяют pre-append admission или user Stop intent;
  remote access owner bypass не закрывает их. Hooks узкие, scheduler остаётся
  в Nav. Existing runMaintenance не даёт готовый model-selection policy hook.
- Main scoped feedback и child outputSchema используют native tools/results;
  ordinary deterministic next не требует дополнительного main call. Один
  pending request/reducer для green/main-chat/autonomous; provenance привязан
  к actual main user input, model proposal не выдаётся за permission.
- Inherited restrictions/guards требуют own child composition и exact-agent
  main guard. Side — root с собственным preset, без scheduler capability.
  Writable executor shell не объявлен защитой host JSON от произвольной записи.
- Standalone transport опирается на Connection/Gateway и native Session streams,
  root token/cookie authentication и document base для HTTP/WS. React extension
  изолирован от Svelte; pending UI читает тот же Nav state, не второй question store.
- Bundle delivery сохраняет command-local references и target Memory Bank;
  существующий installer явно legacy, DSH adapter только запланирован.
- ID-set сравнение TRANSITIONS → ARCHITECTURE: **75/75**, без missing/extra IDs.
  Owners/return points сверены с принятыми transitions. Existing `task.verify`,
  attempt/selected/history, all-off/main-off/red-alone и actual-state recovery
  сохранены; новой task registry/lifecycle нет.
- Local documentation links/DSH pinned source paths проверены; `git diff --check`
  проходит; generated package-local `shared-*` в source — **0**.

## Что ещё не проверено исполнением

Upstream hooks ещё не реализованы и не приняты upstream. Svelte build/import
closure, generated Remote mount, HTTP/WS/auth за mount prefix, настоящие model
turns/feedback capture, cold-resume composition, stop/launch races и native UI
slot/card/link должны пройти isolated spike и последующие outcomes плана.
Source inspection не заменяет эти проверки. Runtime/installer/validator код
в этом проходе не менялся; повторный runtime suite и установка не выполнялись.

## Закрытый semantic blocker

Первый проход выявил противоречие live enablement: прежний tier-policy фиксировал
все проверки до exe. Архитектурная работа была остановлена, затем отдельный
semantic correction `f757db1` принят с regression и isolated delivery checks
([результат](SEMANTIC_LIVE_SELECTION_RESULT.md)). Текущие
[tier-policy](../../skills/_shared/references/workflows/tier-policy.md#selected-work-and-retained-results)
и [autonomy-policy](../../skills/_shared/references/workflows/autonomy-policy.md#runtime-ownership)
фиксируют только запускаемую/пропускаемую работу. Архитектура §5, recovery,
handler/sequence descriptions и plan outcomes согласованы с этой границей.
Blocker закрыт; новой schema, lifecycle, toggle-disposition или execution attempt
для обычного изменения pending settings нет.
