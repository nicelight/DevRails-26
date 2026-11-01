# DevRails Nav 27 — последовательный план реализации

Основание: [ARCHITECTURE.md](ARCHITECTURE.md), принятая
[семантика](SEMANTIC_ACCEPTANCE.md), [routes](TRANSITIONS.md).
Этот документ планирует будущий код; ничего ниже не выдано за уже работающий
plugin/UI. Semantic baseline — [station settings correction](SEMANTIC_STATION_SETTINGS_RESULT.md); DSH integration baseline —
`ce7073d51254c26cd63b22a60835b8f948deb447` (remote HEAD сверён 2026-11-01).

Порядок даёт сначала один настоящий headless workflow, затем управление и UI.
Новые task schema/lifecycle/evidence registry, внешний model runner, general
workflow engine и параллельные mutating task branches не нужны. Результат каждого
шага — исполняемый срез с указанными проверками, а не следующая спецификация.

## 1. Отдельный plugin bundle и integration spike

Создать Nav Cordis package skeleton, host service, generated Typert Remote и
малую standalone Svelte страницу с текстовым status. Установить bundle штатным plugin manager/profile config в isolated DSH на pinned
baseline, без изменения DSH source/web-entry/build roster; сохранить SHA/lock.
Использовать existing webServer/Connection/Gateway. Собрать standalone Svelte
без React shell и Nav Remote через package-mode Typert generator в Nav repo.
Native addon с `dsh.client`, `./client` и declared dependencies доставляется
динамически existing client modules; его bundle формат соответствует DSH.

Проверяемый outcome:

- `/nav27/` отдаётся DSH, root token login → same-origin cookie → authenticated
  Nav RPC и stream. Direct unauthenticated request не получает project data.
- Host mount `/` и `/prefix/`: нет ошибочных `/nav27/api` путей; stream reconnect
  даёт current snapshot. Отключение страницы закрывает её streams.
- Browser dependency graph не включает `AppWebEntry`/React shell. Generated
  `/remote` descriptors реально mount-ятся, не только проходят type checking.
- Отдельный installed package активирует host и native client addon без rebuild
  DSH. Native card/link/Nav Stop подключаются через existing extension points.
- Native model selection и Stop сохраняют DSH session semantics: не являются
  глобальным settings gate или workflow Stop. Nav controls проверяет controller.

## 2. Delivery и роли до первого turn

Собрать canonical resource bundle из `skills/_shared/` с exact command-local
routes. Добавить DSH human command entrypoints, ведущие в общий controller.
Переиспользовать existing bootstrap/sync generator для target Memory Bank.
Реализовать main/subject/review/Side presets и setup при create/cold resume.
Main persistent root; все work children — native spawn с explicit role preset,
agentOptions, `delivery: caller`, outputSchema.

Проверяемый outcome:

- Isolated target без source checkout имеет все required contracts/templates
  выбранных command owners; bundle parity проверяется с canonical sources.
  Optional resource existence не запускает роль.
- Хотя бы два реально доступных registry model routes запускаются одинаковым
  native spawn API; нет model-name→external CLI routing.
- Main не пишет/не spawn-ит; child executor может пользоваться своим authorized
  scoped tool set несмотря на parent guard; child не получает main feedback
  authority. Native structured output tool не заблокирован own guard.
- Side и cold-resumed Side не имеют write/bash/delegation/plugin-admin/MCP mutation
  capabilities. Scope inheritance test использует настоящий DSH registry.
- Success/error/abort/schema-capture failure/unload освобождают все activation
  handles в finally. Startup rejection не оставляет published orphan.

## 3. Один controller, task adapter и обычный путь

Реализовать шесть handler families и маленькие OperationSpec записи для
37 команд. Добавить one-project serialized admission, RunRecord atomic writes,
existing task registry reader/writer, mode persistence, selected settings.
Baseline sequential implementation; selected read-only reviewers могут parallel.
Начальный сквозной срез: runnable indexed task → exe → selected checks →
host closure → next task, затем Product/Design/Foundation entry paths.

Проверяемый outcome:

- Host, а не model conversation, выбирает runnable task, пишет lifecycle,
  сохраняет stable attempt в existing `task.verify`; на station admission фиксирует
  весь перегон, включая unstarted peers и local checks, затем сохраняет results.
- All-off даёт skipped/no reports/done без PASS; code-only/main-off сохраняет
  candidates без hidden verifier; red-alone не создаёт functional proof;
  local checks независимо on/off. Использовать existing doctor regression
  matrix для проверки generated records, не вводить parallel evidence schema.
- Disabled design/reviews не требуют placeholder revision/APPROVE; actual
  Foundation dependencies и accepted gates сохраняются.
- Source→bundle→isolated target coverage всех command resources; existing
  `check:syntax`, `test:mb-doctor`, `test:install-sync` остаются зелёными, если
  delivery/validators затронуты. Generated package-local shared-* в source = 0.
- По ID из TRANSITIONS проверяется полнота M01–M23/R01–R40 (включая suffixes)/
  J01–J07 и recovery situations. Route tests проверяют семейства/owners/resume,
  не делают 70 отдельных engines и не дублируют prose assertions.

## 4. Общий feedback, решения и actual-state recovery

Ввести compact Feedback и operation-specific subject schemas, main scoped
`nav_feedback`, staged clarification и один pending decision. Native tool row
показывает конкретный вопрос в main chat. Green и main user interpretation
входят в один reducer. Autonomous использует тот же proposal/disposition path
без вопроса. Добавить recovery из run + task/evidence + actual artifacts.

Проверяемый outcome:

- Continue на обычном пути не вызывает лишнюю main consultation. Needs_decision
  с достаточным proposal не вызывает повторный clarification; короткий сигнал
  получает только relevant schema/context, не каталог всех commands/tools.
- Consultation останавливает current owner; reroute создаёт proposed tunnel
  до approval, target не запускается. Refusal, «может быть», вопрос, условное
  согласие и недостающие facts не разрешают dependent work.
- Явное новое main-user согласие и green принимают один current ID один раз.
  Assistant text, Side message, stale request и duplicate reply не разрешают.
  New contradictory user message не теряется за ранним согласием.
- Autonomous сохраняет provenance и действует без question; ручной red/Pause/
  Stop и actual permission gaps остаются. Model-selected repair scope не
  расширяет requirements и не стирает negative evidence.
- Сохранённый FAIL/candidates + continue/repair disposition проходят existing
  validators; failed output/schema не становится skip или successful attempt.
- Crash между evidence write и run write продолжает следующий unfinished шаг.
  Completed exe/verify/report и disabled checks не replay-ятся; interrupted
  partial implementation сохраняет attempt; ambiguous unsafe effect блокируется.
- Потеря main DSH session восстанавливает meaningful context из Memory Bank,
  не replay provider request log. Нет второго persistent controller store.

## 5. Station controls и settings

Завершить existing Play/Pause/Stop/red reducer, prompt ownership и config CAS.
Подключить actual model catalog; один snapshot на admitted перегон передаётся
ролям через launch context. Новые settings messages/LLM confirmations не нужны.

Проверяемый outcome:

- Initial ready/stopped station допускает settings write; движение отклоняет
  models/options/enablement/report edits. Без red auto admission следующего
  перегона не открывает edit window. Два editor: stale revision rejected.
- Red/Pause во время exe допускает весь текущий перегон до результатов и
  останавливает перед следующим. Partial/blocked/failed/needs-decision outcomes
  сохраняют реальный смысл и existing blocker/consent, не дают fake success.
- На остановке после exe toggle будущего verify/red применяется в той же attempt
  без repeated exe. Green фиксирует весь следующий verify group; ещё не
  запущенного peer после этого отключить нельзя. Local checks frozen с exe.
- Negative→off не стирает FAIL/disposition; completed/skipped results и closed
  attempts не переоцениваются. All-off даёт skipped без PASS/reports.
- Nav Stop запрещает next admission и запрашивает best-effort cancel owned work;
  late results сохраняются с исходным ID. Нет rollback/atomic drain guarantee.
  Pending Nav prompt удалён по ID, человеческий input сохранён. Editing/resume
  ждёт reconciliation actual outcomes, а не одного main idle.
- Play не подтверждает pending proposal и не снимает red; green не снимает
  независимый Pause/Stop. Autonomous также сохраняет manual holds.
- Main может обсуждать hold со своими read/feedback tools; `whenIdle` не receipt
  отдельного prompt и не awaited в блокирующем driver listener.
- Failure budget считает completed unsuccessful attempts, не debug/clarification/
  interrupted continuation. Budget exhaustion не выдаёт extra try.

## 6. Side sessions и native main navigation

Добавить own-root Side create из current committed main cut через buildForkSeed,
independent preset/setup, bindings/anchors и native archive removal. Добавить
plugin-owned `#nav27-session=` handler в native клиенте. В Svelte использовать
native headless session journal/stream для Side transcript/composer.

Проверяемый outcome:

- Driver открывает exact main session без fork/stop; body создаёт новый Side,
  в том числе при текущем незавершённом main turn. Source не изменяется.
- Side seed имеет `isSeeded=true` и exact inherited count; пустая история
  создаёт unseeded root. Side preset установлен до первого call; generic fork
  inheritance не даёт tools main/executor. Выбранная Side route отличается от
  main в regression: первый call использует Side selection, а не inherited
  request/selection из seed. Cold resume сохраняет route и restriction.
- Несколько Side общаются одновременно; main Stop/reroute/completion не
  прекращают их. Новый вопрос видит fresh Nav context, старый transcript
  остаётся исходным fork, а user reply Side не становится main approval.
- DEL делает native stop/archive/drain, затем remove binding. Archive error
  оставляет marker; crash после успешного archive reconciles marker. DSH history
  остаётся архивной, никакой физической delete гарантии.
- Session follow reconnect не удваивает messages; pending/transient stream
  settlement следует native sequence semantics.

## 7. Согласованная схема и Svelte/SVG scene

До построения полной карты согласовать **схему расположения**, отдельно от
рабочей архитектуры: main left→right, loop у входа в exe, parallel review trains,
proposed tunnel exits, H base/slots, Side anchors и semantic zoom. Согласование
не требует сейчас генерировать картинку и не переоткрывает принятые contracts.
После этого реализовать чистую projection из runtime view и согласованный layout.

Проверяемый outcome:

- Far zoom fit всей карты без нечитаемого текста; controls остаются доступны;
  zoom раскрывает нужную детализацию без смены workflow state.
- Pending proposed tunnel/red существует до consent; animation только после
  host admission. Manual holds/скipped/candidates/failure визуально различимы.
- H имеет три configuration slots, а не три обязательных Judge. Pilot/model
  change доступен только на stopped station. Вызов H в движении доступен;
  timing инспекции остаётся открытой деталью (§5 архитектуры).
- Context — приблизительный native meter каждой session, unknown = `—`;
  compaction count только successful own events, скрыт при нуле. Модельная
  смена не превращает старый meter в обещание точного остатка.
- Side anchors переживают reload/pan/zoom и main movement; expanded chat
  читается в screen coordinates; main-driver/body hit regions не конфликтуют.

## 8. Сквозная приёмка поставки

В новом временном target установить bootstrap + Nav package в DSH и пройти
ordinary greenfield, prepared brownfield queue и autonomous run. Проверить
реальные model/tool interactions вместе с детерминированными simulated failures,
не заявлять live model proof по одним mocks. Проверки ограничены accepted routes
и выявленными source gaps; новые controls/features не добавляются ради тестов.

Acceptance outcomes:

- Все выбранные модели/children/Side работают native DSH; source-only references
  отсутствуют в runtime context. Controller действительно владеет scheduler.
- Минимум: ordinary normal; main consultation; PRD reroute с сохранением partial
  work; same-task repair; autonomous + manual Stop; all-off/code-only/red-alone;
  process restart; station snapshot всего verify group; native session controls
  отдельно от Nav workflow controls; independent Side в движении.
- No leaked activations после любого outcome; нет silent skip/error/PASS
  подмены, duplicate decision execution или replay uncertain effect.
- Native main chat/card/link, standalone authenticated transport и agreed map
  проверены в браузере. Source inspection этого архитектурного этапа такой
  проверки не заменяет.

Результат этапа реализации принимается по working isolated target и этим
outcomes. Сам факт наличия package, короткого prompt или красивой SVG-карты
не доказывает сохранение executable workflow contract.
