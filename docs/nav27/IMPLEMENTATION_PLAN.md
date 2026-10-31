# DevRails Nav 27 — последовательный план реализации

Основание: [ARCHITECTURE.md](ARCHITECTURE.md), принятая
[семантика](SEMANTIC_ACCEPTANCE.md), [routes](TRANSITIONS.md).
Этот документ планирует будущий код; ничего ниже не выдано за уже работающий
plugin/UI. Semantic baseline — `f757db1` (live selection correction); DSH integration baseline —
`ce7073d51254c26cd63b22a60835b8f948deb447` (remote HEAD сверён 2026-11-01).

Порядок даёт сначала один настоящий headless workflow, затем управление и UI.
Новые task schema/lifecycle/evidence registry, внешний model runner, general
workflow engine и параллельные mutating task branches не нужны. Результат каждого
шага — исполняемый срез с указанными проверками, а не следующая спецификация.

## 1. DSH integration spike и минимальные upstream seams

Создать Nav Cordis package skeleton, host service, generated Typert Remote и
малую standalone Svelte страницу с текстовым status. Подключить его к isolated
DSH checkout/build на pinned baseline; сохранить используемый SHA/package lock.
Использовать existing webServer/Connection/Gateway, а не собственный HTTP/WS
protocol. До дальнейшей разработки собрать browser bundle без React shell.

Добавить узкий scoped model-selection admission до `AgentModel.select` append,
учитывающий actual activity, и session-controller cancel owner hook для Nav main.
Default DSH без Nav остаётся прежним. Никакой реализации scheduler внутри DSH.
Если настоящая сборка обнаружит иной sufficient existing hook, использовать его
и уточнить architecture source evidence; не поддерживать два механизма.

Проверяемый outcome:

- `/nav27/` отдаётся DSH, root token login → same-origin cookie → authenticated
  Nav RPC и stream. Direct unauthenticated request не получает project data.
- Host mount `/` и `/prefix/`: нет ошибочных `/nav27/api` путей; stream reconnect
  даёт current snapshot. Отключение страницы закрывает её streams.
- Browser dependency graph не включает `AppWebEntry`/React shell. Generated
  `/remote` descriptors реально mount-ятся, не только проходят type checking.
- Model switch через native DSH UI и Nav проходит один admission: running,
  draining, maintenance и paused-with-active-call отклоняются **до записи**;
  stopped/quiescent принимается. Другие native sessions не меняют поведение.
- Native main Stop ставит Nav stopped до child launch; Nav Stop не вызывает
  рекурсивный cancel hook. При idle main + active children existing header
  utilities slot показывает Nav Stop, вызывающий тот же controller; обычный
  composer/shortcut в этом состоянии не считается доступным Stop.

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
  сохраняет stable attempt в existing `task.verify`, обновляет pending selected
  и фиксирует выбор каждой операции/участника при launch/skip вместе с results.
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

## 5. Runtime controls и dynamic configuration

Завершить Play/Pause/Stop/red reducer, prompt ownership, stale completion routing
и config CAS. Подключить actual registry provider/model/reasoning options;
snapshot каждого launch/skip сохраняется в existing attempt; pending selection
остаётся изменяемым планом.

Проверяемый outcome:

- Stop одновременно с launch/completion не пропускает новый work. Pending
  Nav prompt удалён по ID, пользовательский chat input сохранён. Late result
  остаётся evidence старой operation и не двигает новую.
- Main свободно обсуждает во время workflow hold, но actual tool execution
  не может менять проект/запускать работу. `whenIdle` не используется как
  completion receipt отдельного prompt и не создаёт deadlock listener.
- Pause допускает завершение active work, не admission следующего child;
  future red запрещает вход, active-edge red отменяет operation. Play не
  подтверждает proposal/не снимает red, green не снимает Pause/Stop.
- Во время exe отключение ещё не начатого verify/red применяется в той же
  attempt без approval/repeated exe; embedded local checks сохраняются. All-off
  записывает skipped без PASS/reports. Model/effort берутся при каждом launch.
- После запуска одного reviewer ещё не запущенный peer можно отключить;
  started participant, его selection/evidence и active snapshot сохраняются.
  Negative→off не стирает FAIL или обязательный disposition; закрытые attempts
  и записанные skips не переоцениваются новыми settings.
- Два settings editor: stale revision rejected, принят один patch; current и
  pending choice показаны честно. Native main model select проходит §1 hook.
- Failure budget считает completed unsuccessful attempts, не debug/clarification/
  interrupted continuation. Budget exhaustion не выдаёт скрытую extra try.

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
  change применяется между консультациями, не посреди actual call.
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
  process restart; native UI model/Stop bypass attempts; independent Side.
- No leaked activations после любого outcome; нет silent skip/error/PASS
  подмены, duplicate decision execution или replay uncertain effect.
- Native main chat/card/link, standalone authenticated transport и agreed map
  проверены в браузере. Source inspection этого архитектурного этапа такой
  проверки не заменяет.

Результат этапа реализации принимается по working isolated target и этим
outcomes. Сам факт наличия package, короткого prompt или красивой SVG-карты
не доказывает сохранение executable workflow contract.
