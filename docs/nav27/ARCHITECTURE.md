# DevRails Nav 27 — архитектура DSH-плагина

Статус: **проект реализации**, 2026-11-01. Семантика принята отдельно:
[SEMANTIC_ACCEPTANCE.md](SEMANTIC_ACCEPTANCE.md) и
[station settings correction](SEMANTIC_STATION_SETTINGS_RESULT.md). Здесь не
изменяются task schema, statuses, verdicts или canonical runtime contracts.
Плагин, transport adapter и UI ещё не реализованы.

DSH исследован по исходникам `ce7073d51254c26cd63b22a60835b8f948deb447`;
`git ls-remote origin HEAD` при исходном исследовании вернул тот же SHA. Сохранённый
research checkout не изменялся. Ссылки ниже закреплены на этом commit.
Source inspection подтверждает точки интеграции, но не заменяет запуск
собранного плагина. Build order и проверки: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## 1. Выбранное решение и границы

Один Cordis host-плагин Nav внутри DSH, самостоятельная Svelte 5 + SVG страница
`/nav27/` на сервере DSH и маленькое дополнение штатного клиента DSH.
DSH исполняет все модельные вызовы, tools, main/child/Side sessions, provider
routing, permissions, журналы и compaction. Nav вызывает native API, без
App Server, внешнего agent CLI, второго model loop и workflow-script engine.

```text
Svelte map/settings/Side chat ── DSH Connection + Typert Remote ── Nav host
Native DSH main chat ────────── native Session + nav_feedback ─────┤
                                                               ├─ controller
                                                               ├─ native spawn activations
                                                               ├─ native root main/Side agents
                                                               └─ Memory Bank + indexed tasks
```

| Модуль (предлагаемое размещение) | Ответственность |
| --- | --- |
| `packages/nav27/src/controller.ts` | Один сериализованный допуск команд/событий одного проекта; selection, operation transitions, holds, pending decision, budgets, active handles. Не держит очередь заблокированной на model/network await. |
| `operations.ts` | Данные операций: command, handler family, context sources, output shape, ordinary next, selected roles. 37 command identities, не 37 engines. |
| `dsh.ts` | Main create/resume, native spawn, cancellation/dispose, model catalog, session observations. Никаких обращений к provider API в обход DSH. |
| `feedback.ts` | Общая компактная схема, только текущее уточнение, привязка к operation и реальному user message; проверки формы/актуальности. Смысл оценивает модель. |
| `state.ts` | Одна run-запись Memory Bank, existing task writes/evidence, атомарная замена файлов и reconciliation. |
| `remote.ts` | Узкий UI API, generated Typert descriptors и snapshot stream; auth принадлежит DSH. |
| `roles.ts` | Preset/setup main, work, review, Side; scoped tools/guards до первого вызова. |
| `web/` | Svelte stores, отдельная scene projection/layout, SVG и HTML Side chat/settings. |
| `native-client/` | Открыть main session по ссылке; показать pending proposal и Nav Stop при idle main/active workflow. Использует existing DSH UI extension points, не переносится в Svelte bundle. |

Это границы ответственности внутри одного пакета, не отдельные сервисы.
Main — постоянный семантический оркестратор и собеседник. Предметные операции
исполняют назначенные native children. Main не пишет проект и не запускает
агентов инструментами: даже во время обсуждения остановки он не может обойти
контроллер. Детерминированный обычный переход не требует main LLM call.

Nav не создаёт вторую task registry. Единственный task lifecycle — existing
`.memory-bank/tasks/index.json` и indexed JSON records. Операции planning
возвращают task drafts; host сохраняет предметные поля и сам пишет lifecycle.
PRD/spec/code остаются у соответствующих предметных owners. Nav не принимает
семантическую достаточность файла по одному наличию или по словам в прозе.

## 2. Проверенные DSH seams

Все URL в таблице относятся к указанному выше SHA.

| Область | Подтверждённое API / ограничение |
| --- | --- |
| Agent ownership | [`agents.create/resume`, `setup`, `AgentHandle.dispose`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/agent/src/index.ts#L67-L191): setup исполняется до publication; handle принадлежит создавшему owner. Resume требует повторной scoped composition. |
| Native children | [`startActivation`, `delivery: caller`, result/dispose](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/subagent/subagent/src/types.ts#L31-L62); [`spawn` capabilities](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/subagent/subagent-spawn-in-process/src/index.ts#L34): independent preset, agentOptions, outputSchema. `provider: spawn` — backend DSH, а LLM provider/model — `request.agentOptions`. |
| Child structured output | [`structured.ts`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/subagent/subagent/src/structured.ts#L74-L146): scoped `structured_output`, schema validation, concludeTurn, capture после authoritative tool result и terminal guard. `structured` может отсутствовать при error; проза не заменяет его. |
| Main feedback / guards | [`tools.restrict`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/tools/src/index.ts#L149-L226), [`tools.guard`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/tools/src/index.ts#L377-L402), [`concludeTurn`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/tools/src/contracts.ts#L243-L260). Restrictions относятся к global capabilities; guard нужен также для scoped/inherited tools. |
| Inbox / stop | [`send/followup/steer`, `cancel`, `whenIdle`, inbox remove](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/agent/src/runtime-types.ts#L74-L116), [activity semantics](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/agent/src/runtime-types.ts#L189-L259). `whenIdle` следует за всей активностью, не квитанция одного prompt; `cancel` сам не запрещает будущие wakeups. |
| Fork | [`session.fork`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/api/session-controller/src/commands.ts#L207-L295) использует `buildForkSeed` и preset источника. Без `atSeq` берётся completed turn; explicit seq допускает текущий committed log prefix. Для Side нужна собственная create/setup composition. |
| Model selection | [`AgentModel.select`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/agent/src/model-selection.ts#L98-L128) просто пишет событие; [`session.selectModel`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/api/session-controller/src/commands.ts#L144-L181) проверяет модель, но не Nav train state. Nav ограничивает свои controls (§5); native выбор сохраняет штатный смысл следующего запроса DSH. |
| Model capabilities | [`buildModelCatalog`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/api/session-controller/src/catalog.ts#L20-L74): registry providers/models, actual reasoning efforts/default, отдельные provider failures. Нет универсального списка reasoning. |
| Web delivery / auth | [`webServer.register`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/host/webserver/src/index.ts#L48-L83), [`connection.admit`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/client/connection/src/rpc-host.ts#L128-L139), [root token → cookie](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/client/connection/src/browser-auth.ts#L279-L339). Nav route автоматически не получает auth только от регистрации. |
| Headless browser transport | [`installConnection`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/client/connection/src/client/index.ts#L122-L231), [`gateway/client`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/api/gateway/src/client/index.ts#L137-L238): Cordis services без React shell; HTTP RPC + WS mux. |
| Native chat navigation | [`uiWorkspace.openSession`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/client/ui-workspace/src/client/navigation.ts#L293-L295); общий session deep link не найден. Plugin-owned link adapter нужен. |
| Native chat presentation | [`tool.call.toolview` slot](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/client/ui-tool/src/client/apply.ts#L23-L55) позволяет показать вопрос в tool row `nav_feedback`. Это UI pending-запроса Nav, не второй lifecycle userQuestions. |
| Meter / compaction | [`contextPressure`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/llm/token-meter/src/projection.ts#L19-L48), [`compaction/end.error`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/compaction/compaction/src/types.ts#L16-L82): приблизительная occupancy; успешные compactions считать отдельно от prune/ошибок. |
| Archive | [`workspace archive`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/workspace/workspace/src/index.ts#L97-L143), [`turn cancellation on archive`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/agent/src/archive-admission.ts#L17): native archive с stopActivity; это не физическое удаление logs. |

## 3. Доставка canonical contracts в DSH

Nav поставляется отдельным bundle, устанавливаемым штатным DSH plugin manager
или profile configuration; DSH исходники и hardcoded web-entry не меняются.
[Plugin manager](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/boot/plugin-manager/README.md#use-this-package)
поддерживает внешние package/path/link bundles. Host загружается Cordis Loader.
Native addon объявляет `dsh.client` (`platform: web`), `./client` и зависимости;
[client modules](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/client/modules/README.md#declaring-a-client-plugin)
обнаруживает его по Loader entry и доставляет динамически. Addon собирается
в формате DSH client bundles; standalone Svelte имеет собственную Vite-сборку.
Generated Nav Remote выпускается сборкой Nav через package-mode
[Typert generator](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/typert/generator/README.md#running-generation-inside-a-tsdown-build);
требуемые generator workspace configs принадлежат Nav repository.

Существующий installer — проверенная legacy delivery, не готовый DSH adapter.
Новый пакет собирает resources из `skills/_shared/`, используя существующий
список command resources в `scripts/install-framework.mjs`; source не копируется
в 37 отдельно поддерживаемых prompts. Сборка создаёт package-owned read-only
bundle: commands, workflows, roles, agent prompts, semantic packs, templates.
Bootstrap/sync Memory Bank продолжает выполнять existing generator.

Operation context включает только выбранную command, общую autonomy/tier policy
когда применима, её required references и конкретные task/project inputs.
Пути command-local `agents/` и `references/` разрешаются относительно bundled
command resource directory; `.memory-bank/...` — target project. Manifest bundle
сохраняет эти routes. Loader проверяет required resources перед запуском,
а не надеется на canonical checkout у runtime-агента. Необязательная availability
не включает review/report. DSH skill discovery можно подключить к этому bundle,
но controller передаёт exact command contract независимо от угадывания skill
моделью. Native human commands регистрируются через DSH `commands.register` и
ведут в тот же controller, а не отправляют scheduler prompt в LLM.

M01/M02: bootstrap остаётся host installer действием с проверенным source/target;
это не внешний agent runner. Missing checkout/collision — реальный blocker.
В этом проектировании installer/канонические skills не меняются.

## 4. Один compact feedback и уточнение по необходимости

Общая модельная часть во всех операциях:

```ts
type Feedback = {
  flow: 'continue' | 'needs_decision';
  message: string;             // краткий outcome или причина решения
  detail?: CurrentDetail;     // только схема текущего уточнения, обычно отсутствует
};
type OperationReply<Subject> = { feedback: Feedback; subject: Subject };
```

`Subject` — предметные факты выбранной операции: implementation/evidence,
functional verdict, candidates, semantic verdict, draft tasks, design impact
или blocker/next owner. Он не содержит authority на launch/status/consent.
Existing verdict vocabulary не перекодируется в новый универсальный verdict.
Task results принимаются в форме, пригодной для existing `task.verify`, §6.
Для операции с частичным результатом subject сохраняет partial effects.
`continue` не означает PASS, безопасность или положительную проверку.

**Transport:** native child получает `outputSchema` для этого envelope и
только своего subject. Persistent main имеет один scoped tool **`nav_feedback`**
с тем же `feedback` и ситуационным subject. Он не получает child outputSchema
и не превращается в одноразовый structured child. Handler валидирует данные,
возвращает tool result и вызывает `exec.concludeTurn()`; main остаётся доступен
следующему native chat turn. Tool принадлежит main setup, Side его не получает.
Capture привязывается к exact operation/turn, фиксируется после успешного
`tools/result`; для первой версии capability вызывается напрямую, не через
PTC nested transport. Child использует уже реализованный capture DSH.

Host сам связывает session, operation instance, attempt и config snapshot;
эти identity не выбирает модель. После ошибки DSH/missing structured output
нет автопродвижения по prose. Некорректная форма возвращает конкретную ошибку
схемы в ту же операцию; повторный model call для исправления формата не является
новой execution attempt. Невозможность получить корректный ответ сохраняется
как technical blocker, без безграничного repair loop.

### Staged clarification

1. При `continue` host принимает subject, применяет mechanical validation и
   ordinary next. Если subject содержит negative/unresolved material candidate,
   его сохраняют и запрашивают disposition, даже когда flow ошибочно `continue`.
2. `needs_decision` ставит workflow hold. Если конкретного предложения нет,
   main получает результат и только нужную схему уточнения:

   ```ts
   type Proposal = {
     question: string;
     action: string;                 // конкретное предлагаемое изменение/ответ
     target?: CommandId;             // отсутствует = consultation у current owner
     scope: string;                  // affected task/feature/claims
     missingFacts: string[];         // [] когда предложение можно разрешить
   };
   ```

   `detail` этого хода имеет именно форму Proposal. Host передаёт небольшой
   список допустимых сейчас owners и текущий resume point. Он не выбирает
   owner по keyword в `message`, не выдаёт 37 tools и каталог всех repair schemas.
   Уже достаточное предложение повторного clarification call не требует.
3. Main может запросить дополнительный bounded context тем же feedback;
   разрешённое чтение доступно сразу. Новая предметная операция/дополнительный
   агент вне selected work — proposal, не обход decision flow. Детализация
   продолжается только пока есть конкретный missing input; неизвестный внешний
   факт не подменяется default даже в autonomous.
4. Готовое предложение формирует **один** pending request. Детальная схема
   убирается из следующих обычных операций. Replacement proposal получает
   новый request ID; старое нельзя подтвердить поздним кликом.

### Pending decision и согласие

```ts
type PendingDecision = {
  id: string;
  operationId: string;
  proposal: Proposal;
  resume: OperationRef;      // та же незавершённая работа после решения
  askedAt?: { sessionId: string; toolCallId: string };
};
```

В ordinary main возвращает понятный вопрос и `nav_feedback`; native plugin
показывает question/action в штатной main conversation tool row открыто, а не
только спрятанный JSON. Карта одновременно показывает красный; proposed tunnel
появляется **до** consent только для actual reroute. Consultation держит красный
на обычном пути. Model request и tool call не висят до ответа человека.

Green вызывает `decide(requestId, approve)` у host. Он разрешён только при
`missingFacts=[]`. Согласие в main chat интерпретирует тот же main, получая
текущий request и actual user message; временная `detail` схема:
`{ requestId, answer: approve|reject|discuss, reason }`. Host связывает результат
с новым consumed main user message ID, а не верит model-authored provenance.
DSH [`session.prompt`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/api/session-controller/src/index.ts#L464-L489)
создаёт `source.kind=user` из RPC, в отличие от plugin context/assistant/Side.
При нескольких репликах интерпретируется их актуальный порядок в этом turn;
позднее уточнение/отрицание не теряется за ранним «да». Перед commit host
проверяет, что после интерпретированного user message не появился новый
необработанный main-user input; иначе сохраняет hold до его рассмотрения.

Approval — только явное безусловное согласие с конкретным предложением.
Неоднозначное «ну возможно», вопрос, условие, дополнительный неизвестный факт
оставляют pending. Отказ снимает proposal, но не придумывает новый разрешённый
путь; main может предложить следующий. Facts-only ответ обогащает контекст,
но не разрешает новое отличающееся предложение. Уже принятое решение в прежнем
scope переиспользуется; новый material delta требует нового request.

Оба канала входят в один reducer: verify current ID → persist решение с
`source=user`, origin green/main-chat и reference → clear pending → schedule
только при отсутствии остальных holds. Двойной ответ не выполняет переход
дважды. Chat interpretation — semantic judgement модели; code доказывает
происхождение и актуальность, не смысл естественного языка. Это проверяется
диалоговыми сценариями в плане, без отдельного consent-agent.

В autonomous main принимает semantic decision; тот же reducer записывает
`source=autonomous` и сразу разрешает готовое предложение. Вопрос человеку и
pending user-wait не создаются. Missing facts/permissions и manual holds остаются.
При отрицательном check решение записывается также в existing scoped disposition.

## 5. Minimal state, settings и сериализация

**Долговременный Nav state:** один JSON-файл
`.memory-bank/nav27/run.json` для текущего main run данного target project.
Один controller владеет им в одном DSH host; второй writer того же target
отклоняется явным already-owned при подключении (простая process ownership
проверка, не распределённый scheduler). Одновременные main runs одного проекта
не входят в эту реализацию; Side sessions не являются main runs.

```ts
type RunRecord = {
  format: 1;
  runId: string;
  revision: number;                   // UI/reducer concurrency
  mode: 'ordinary' | 'autonomous';
  mainSessionId: string;
  position: OperationRef;             // command, task/feature при наличии
  operation?: {
    id: string; phase: 'prepared'|'running'|'interrupted';
    attempt?: string;                 // reference existing task.verify attempt
    selection: OperationSelection;   // entire admitted leg; task choices — reference task.verify
    configRevision: number;
    children: { sessionId: string; role: string; configRevision: number }[];
  };
  hold: { paused: boolean; stopped: boolean; redEdges: string[] };
  pending?: PendingDecision;
  blocker?: { reason: string; owner: string; resume: OperationRef };
  returnTo?: OperationRef;            // bounded detour, не копия всего graph
  settings: Settings;
  settingsHistory: ConfigChange[];    // короткие actual deltas, не каждый request
  decisions: DecisionRef[];           // concise outcome/provenance + canonical locator
  completed: BoundaryResultRef[];     // only non-task boundaries, evidence locators
  sides: { sessionId: string; anchor: { x: number; y: number }; sourceSeq: number | null }[];
  terminalReason?: string;            // existing run vocabulary, не task status
};
```

Активные AbortControllers, handles, promises и текущий streaming buffer — только
в памяти. RunRecord не дублирует task.verify results, task statuses, transcript,
provider requests или полные артефакты. `completed` хранит лишь нетасковые
boundaries, для которых иначе не сохранится resume fact, и ссылку на owner.
Материальное решение сохраняется у existing canonical owner; в run — reference
и достаточно кратких фактов для восстановления. Native DSH logs остаются
единственной полной историей model/tool turns. Нет второго DSH storage/export
цикла, журнала исходящих запросов и replay очереди модельных вызовов.

Файлы пишутся host через temp + rename. Сначала сохраняется task evidence/owner
result, затем позиция run. Межфайловой транзакции нет: recovery сверяет task
и actual files, поэтому crash между двумя writes не требует event-sourced DB.
Перед внешним/model запуском сохраняется prepared operation; это не proof
исполнения и не разрешение повторить неоднозначный side effect.

Settings имеют `revision`, mode defaults, выбор операций/checks/reports,
role definitions (`id`, assignment, enabled, provider/model/reasoning), optional
operation overrides и instance overrides. Precedence: defaults → role → operation
→ selected instance; одинаковые поля перекрываются справа. Дополнительный
reviewer — instance существующего assignment, а не новый lifecycle.

Станция — принятый результат/feedback операции или handoff; перегон — одна
операция либо её согласованная группа участников. `/exe`, `/verify` и red —
отдельные перегоны. Partial/blocked/error/needs-decision также являются outcomes,
а не успешным завершением; existing blocker/decision flow сохраняется.

- Все flow settings, models/options/enablement/reports меняются только в initial
  ready или на остановленной станции после результатов всего перегона. Во время
  движения controls недоступны, host отклоняет settings write. Без red переход
  автоматический и окна редактирования между перегонами нет.
- Green/admission фиксирует один snapshot всего следующего перегона: все selected
  participants, ещё не запущенные peers, модели, reports и embedded local checks.
  Последовательный launch использует этот snapshot, не перечитывает settings.
- Red/Pause во время движения ставит остановку сразу за следующей станцией.
  Участники текущего перегона дорабатывают. На остановке после exe можно изменить
  будущий verify/red в той же task attempt без повторного exe или approval.
- В existing `task.verify` host обновляет только будущую работу на разрешённой
  остановке. Started/skipped/interrupted work сохраняет свой выбор и evidence;
  closed attempts неизменны, off не стирает FAIL или required disposition.
- `saveSettings(expectedRevision, patch)` проверяет остановку, revision и model
  availability; stale edit возвращает conflict. История содержит принятые deltas.
  Настройки передаются ролям в launch context, без LLM confirmation на toggles.
- Main model control принадлежит Nav UI. Native DSH model selection остаётся
  штатным выбором для следующего запроса; глобальная блокировка не обещается.
- Judge slots на H настраиваются на остановке; три слота не означают fanout.
  Side create и вызов вертолёта доступны в движении.

Открытая деталь: timing вертолёта; рекомендация — вызов в движении заказывает
инспекцию на ближайшей станции, без изменения текущего перегона.

Default local checks on и возможность red-alone сохраняются как изменяемые
рабочие defaults, не новое immutable пользовательское решение. Отсутствующая
model/effort в registry — validation error, не silent fallback на другую модель.

## 6. Evidence, closure и recovery

Task schema уже определён [tier-policy](../../skills/_shared/references/workflows/tier-policy.md#selected-work-and-retained-results).
Его не заменяет RunRecord или feedback envelope:

```json
{
  "stage": "workflow",
  "attempt": "attempt-17",
  "selected": {
    "design": false, "local_checks": false,
    "verify": [], "red_verify": false, "feature_red_verify": false,
    "protocols": []
  },
  "implementation": "complete",
  "evidence": ["Реализован принятый исход; изменения и handoff: <actual locator>"],
  "local_checks": "skipped",
  "verification": "skipped",
  "red_verification": "skipped"
}
```

Это illustration формы, не готовое evidence. Host добавляет запись в existing
`task.verify`, а task status меняет отдельно на `done`, когда actual implementation
и остальные применимые ограничения это допускают. Здесь нет PASS и report.
`done_for_prod` сохраняет production remainder, не разрешает production действие.

Enabled participants дают свои `{participant, verdict, evidence}` либо
`{participant, candidate_findings, evidence}`. Main-off + code-only не создаёт
functional result и не запускает hidden main/adjudicator. Material unresolved
candidate требует решения; candidate `none` не становится functional PASS.
Red-alone сохраняет свой semantic result и явно отсутствующий functional proof.
Fields unfinished checks отсутствуют; crash/error не записывается как skipped.
Protocol files создаются только если выбраны; inline evidence допустимо.

Каждый actual negative сохраняется вместе с scoped `disposition` по canonical
форме (`decision: continue|repair`, `source: user|autonomous`, concrete reason).
Repair создаёт следующую attempt только когда действительно начинается новое
исполнение; debug, clarification, format repair и resume прежнего work не
увеличивают execution attempts. Неудачная завершённая attempt расходует budget.
Новый selected успешный результат относится к исправленной поверхности;
старый FAIL не переписывается. Feature semantic result хранится в existing
feature surface или разрешённом `stage: feature_red_verify`, не в новом store.

Recovery запускается после открытия проекта, а не после каждого reconnect UI:

1. Поднять RunRecord, indexed tasks, selected attempts и доступные canonical
   artifacts; восстановить manual holds и pending request до допуска модели.
2. Подключить существующую DSH main session с Nav preset либо создать новую,
   если она недоступна. Во втором случае передать минимальный Memory Bank context,
   незавершённый owner и references, не историю provider requests.
3. Сверить checkpoint с actual state: закрытая task/сохранённый result сильнее
   старой position. Сначала reconcile stranded `in_progress`; затем выбирать
   новую runnable task. При конфликте смысл выясняет main через общий feedback.
4. Prepared без effect — допустим launch; interrupted implementation — осмотр
   partial effects и continuation той же attempt. Completed exe/verify/report
   не повторять из-за потерянной session. Ambiguous non-idempotent effect —
   blocked до evidence/owner решения, а не автоматический replay.
5. Продолжить первый реально unfinished шаг: started/interrupted work сохраняет
   snapshot всего admitted перегона; будущая работа получает новый snapshot
   при следующем admission в той же attempt. Skipped не missing и не включается повторно новым toggle. Closed task не отменяет
   незавершённый выбранный wave sync/feature review. Нет runnable — различить
   completed, blocked, missing decision, failure budget и actual dependency deadlock.

Late child completion после Stop/reroute может дать полезное evidence прежней
operation. Оно сохраняется с её identity, но не двигает новый маршрут. Никакой
повторной записи side effect только ради достижения «exactly once»: exactly-once
гарантируется для принятия pending decision в controller, не для произвольного
внешнего действия модели.

## 7. Native session execution и управление остановкой

Main создаётся `ctx.agents.create({ sessionId, meta: {cwd, agentPreset}, setup })`
как root без `parentAgent`, подключается к project workspace. Setup монтирует
Nav main preset, read/feedback tools и run context.
MainSessionId хранится в run. Возобновление использует тот же preset/setup;
открытие cold session из native UI также должно восстановить guard до первого
turn. Preset не может зависеть только от UI страницы, которая может быть закрыта.

Child запуск всегда host-owned:

```ts
const activation = await ctx.subagents.startActivation({
  provider: 'spawn', label: roleInstance.id, delivery: 'caller',
  request: {
    parent: main, prompt: operationContext,
    agentPreset: rolePreset, agentOptions: frozenModel,
    outputSchema: currentOperationOutputSchema,
  },
  signal: startupSignal,
});
try {
  const result = await activation.result;
  controller.acceptResult(operationId, activation.childId, result);
} finally {
  await activation.dispose();
}
```

Это API sketch, не уже компилируемый код. `signal` владеет startup до publication;
после неё Stop вызывает именно activation.dispose. Result DSH ожидает teardown,
но владелец всё равно освобождает handle в finally, включая error/abort/capture
failure. Disposal error сохраняется отдельно и не выдаётся за skipped check.
`AgentHandle` main/Side имеет plugin/project lifetime; его dispose выполняется
при закрытии owner, не после каждого chat turn. Loading/unloading plugin также
дренирует owned activations. Side не включается в child cancellation main.

Read-only reviewers могут выполняться параллельно, когда selected. Реализация
sequential по умолчанию. Experimental concurrent mutation доступна только при
явном opt-in и уже предусмотренных canonical isolation/disjoint hard boundaries;
это не механизм, необходимый для первой реализации Nav.

### Один admission reducer

Nav UI/command, feedback, child completion и
settings edit поступают в один короткий сериализованный reducer. Он проверяет
current operation/decision/config revision и сохраняет намерение. DSH await
идёт вне reducer; completion возвращается отдельным событием с исходным ID.
Так controls не ждут network request; hold запрещает следующий admission.
Промежуточное состояние «останавливается» выводится из незавершённых handles.

| Действие | Поведение |
| --- | --- |
| Play | Снимает только paused/stopped latch, запускает reconciliation/admission; не подтверждает pending proposal и не снимает manual red. |
| Pause | Остановиться сразу за следующей станцией: завершить admitted перегон со всеми selected participants, не допускать следующий. |
| Nav Stop | Persist hold, убрать pending Nav prompts, запросить best-effort cancel/dispose owned main/children. Нет мгновенной/атомарной остановки или rollback. До editing/resume reconcile actual outcomes; partial effects сохраняются. |
| Future manual red | Persist запрет конкретного edge. Доехать до границы, не войти; один context notice main, без poll LLM. |
| Red во время перегона | Остановка сразу за следующей станцией; текущий перегон дорабатывает, следующий не допускается. |
| Green | Разрешить конкретный pending request либо снять конкретный manual edge red. Другие red/Pause/Stop остаются; при разрешённом admission фиксируется весь следующий перегон. |
| Main chat во время hold | Обсуждение/чтение разрешены; work/delegation tools отсутствуют. Явное «продолжить» может через feedback снять конкретный manual red; Pause/Stop требуют явного Play intent. Неоднозначный ответ ничего не снимает. |

Controller не забивает inbox последовательностью будущих operations. Он держит
не более одного своего scheduled semantic prompt; его MessageId известен.
На Stop/reroute удаляется только этот pending item через inbox.remove, а не
`inbox.clear()` пользовательских вопросов. `cancel(...,{keepInbox:true})`
сохраняет человеческие сообщения; scoped pre-step admission отклоняет stale
Nav operation input. Уже начавшийся cancellation не исключает новый native
user turn: он останется обсуждением под тем же read-only guard.

`whenIdle()` не используется как доказательство ответа конкретного prompt и
не awaited из `agent/created`/turn listener, который блокирует сам driver.
Ответ связывается с feedback/child result. Editing после Stop доступен после
reconciliation результатов, а не по одному `status=idle` main.

Native DSH Stop отменяет текущий turn одной session и не является Nav Stop:
он не ставит workflow hold и не обещает остановить host-owned children.
Управление workflow доступно в Nav; tiny native plugin также показывает
**Nav Stop** через existing session-scoped
[`conversation.session.header.utilities`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/client/ui-conversation/src/client/contract/slots.ts#L252-L257).
Кнопка вызывает тот же controller, независимо от наличия main turn. Source native
cancel: [`commands.ts`](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/api/session-controller/src/commands.ts#L464-L477).

## 8. Роли и штатные DSH permissions

### Tools и роли

Nav main и Side получают явный allow-list read capabilities (`read`, project
search, read-only Nav context) и, только main, `nav_feedback`. Guard deny-by-default
проверяет exact capability name после tool policy/approval, включая scoped tools;
`restrict` уменьшает видимый global tool list. В их composition нет bash,
filesystem write, mutating MCP, arbitrary network-execution, plugin/skill installer,
subagent spawn/control, generic host API tool и инструментов изменения permissions.
PTC transport не является способом обхода: разрешены только admitted end-capabilities.
Main feedback может лишь предложить действие; reducer допускает его по current
authority. Guard main проверяет `exec.agent === exactMain` и для другого agent
возвращает abstain: guards наследуются и иначе запретили бы executor. Каждый
child preset монтирует свои capabilities в **собственном** scope; own registrations
не маскируются ancestor restrict. Child guard допускает native `structured_output`,
но запрещает inherited `nav_feedback` и самостоятельную delegation. Это проверяется
через actual DSH tool registry, не только по YAML списку. Main read-only достигается
tools composition; принудительный read-only sandbox override main не ставится,
поскольку native child наследует его и потерял бы разрешённые project writes. Side не имеет ни feedback/control capability, ни main user identity.

Так hold не основан на prompt и не блокирует разговор. Main никогда не получает
executor powers временно, поэтому между hold/release нет окна переустановки tools.
Side guard сохраняется и при cold resume собственного preset. Generic fork
наследует preset источника; им **не** создаётся Nav Side. Даже fork main из
native UI остаётся без mutating/spawn powers; он не становится owner run.

Subject writer/reviewer presets получают возможности своего assignment.
Task hard write boundaries и lifecycle ownership сохраняются: planner отдаёт
host drafts, host пишет task lifecycle. Existing DSH permissions продолжают
действовать; green, tier и autonomous не расширяют scope/permissions.
Native child inherits delegated policy:
[child policy](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/subagent/subagent/src/child-agent.ts#L218-L275).
При недостающем доступе child сообщает restriction через existing feedback;
host не выдаёт себе доступ. Новая security subsystem не вводится.

Model/settings controls и workflow Stop принадлежат Nav. DSH core, native
`model.select` и `session.cancel` не модифицируются. Native выбор модели
отражается из authoritative selection event; повторный select/rollback не нужен.

## 9. Routes → шесть handler families

`OperationSpec` содержит `id`, `family`, required context routes, role assignment,
subject schema, ordinary successor resolver. Это внутренние executable данные
плагина, не новый публичный task/transition DSL. `Decision` — общий перехват
всех families, а не отдельный engine на каждую ветку. Данные условий/owners
берутся из [TRANSITIONS.md](TRANSITIONS.md), не распознаются regex по output.

| Family | Механика | Полное покрытие основного пути |
| --- | --- | --- |
| BOOT | Availability/bootstrap/reconcile actual state → unfinished owner | M01, M02, M03, M04 (mapping через SUBJECT после решения) |
| SUBJECT | Один назначенный owner, scoped subject result → ordinary next | M05, M06, M07, M08, M09, M10, M12, M13, M14, M15 |
| EXEC | Indexed runnable task, stable attempt, exe launch snapshot/local proof | M17 |
| CHECK | Selected independent participants, own results, aggregate без synthetic verdict | M11, M16, M18, M19 |
| QUEUE | Selection/dependencies/closure/wave sync, modes без prompt scheduler | M20, M21, M22, M23 |
| SUPPORT | Bounded context, diagnosis/advisory/Judge, return to caller | Helpers из R/J ниже; не отдельная main queue |

Для M12–M15 choice Foundation/design/tasking принадлежит модели; code лишь
применяет accepted choice, пропускает disabled work и сохраняет actual dependencies.
M23 добавляет selected Judge SUPPORT к тому же QUEUE. `spec-auto` — mode/subject
variant, а не второй scheduling loop. `creator-vibe`, `kiss-architect`, `fill`,
`context-manifest` — context/support assignments, не обязательные станции.

Точная привязка каждого repair/consultation ID; `D` означает общий decision
flow §4, `B` — технический blocker с actual repair, не consent-only bypass:

| IDs | Dispatcher / target / resume |
| --- | --- |
| R01 | D → SUBJECT grill-me либо missing product source; resume write-prd. |
| R02 | D → SUBJECT constitution/write-prd; сохранить независимое готовое. |
| R03 | D → SUBJECT first product/decomposition/framing owner или SUPPORT feature-doctor; затем selected CHECK той же поверхности. |
| R04 | D consultation у spec-init либо SUBJECT write-prd; resume framing/decomposition. |
| R05 | D → SUBJECT write-prd для product delta; decomposition-only остаётся current. |
| R06 | SUPPORT feature-doctor → D к write-prd/feature-to-tasks/spec-redesign либо implementation caller. |
| R07 | D → SUBJECT map-codebase либо accepted bounded design basis; resume spec-design. |
| R08 | D consultation SUBJECT spec-design; поздний shared delta → spec-redesign. |
| R09 | D → SUBJECT spec-design/spec-redesign; resume Foundation tasking/product. |
| R10 | D → SUBJECT write-prd/prd-to-features либо SUPPORT feature-doctor; resume same feature. |
| R11 | D → SUBJECT controlled rebuild/split; host сохраняет identity/history; selected CHECK → executable replacement. |
| R12 | D → SUBJECT spec-redesign; none → caller, bounded/global → только evidenced affected SUBJECT tasking/design. Revision по canonical policy. |
| R12a | D consultation/SUPPORT evidence у spec-redesign; без guessed global/reset. |
| R12b | D → SUPPORT triage если owner неизвестен, иначе SUBJECT owner; selected re-CHECK. |
| R12c | D или already-selected SUPPORT architecture-review → caller CHECK сохраняет verdict ownership. |
| R13 | B + D при новом repair выборе → SUBJECT tasking; resume тот же task после реального исправления. |
| R14 | D → SUBJECT rebuild/split higher tier; не rewrite task ID. |
| R15 | B на affected EXEC + D scope/authority owner; permissions устраняются реально; resume partial. |
| R16 | D → SUBJECT feature tasking/spec-redesign; resume affected EXEC. |
| R17 | D → SUBJECT product/task/shared owner или SUPPORT triage; resume unfinished operation. |
| R18 | CHECK retains NEEDS-CLARIFICATION → D evidence/meaning owner; тот же selected CHECK после устранения. |
| R19 | CHECK retains FAIL → D same-task EXEC correction или SUPPORT debug. |
| R20 | D → SUPPORT triage/SUBJECT owner; affected selected CHECK после repair. |
| R21 | CHECK semantic concern/fail → D consultation/EXEC/SUBJECT repair; без target redefinition ради pass. |
| R22 | D → EXEC new attempt в existing budget; уже разрешённый bounded retry не спрашивается снова. |
| R23 | D → SUPPORT debug; diagnosis не attempt; confirmed → correction owner, inconclusive → decision/evidence. |
| R24 | D или selected SUPPORT technical-premortem → EXEC/owner. |
| R25 | D → EXEC только внутри accepted task scope, иначе SUBJECT owner prevention; не auto new task. |
| R26 | SUPPORT GO → caller; conditions/NO_GO → D одного реального owner/action. |
| R27 | D или already-authorized SUPPORT add-tests внутри active task → caller; changed scope → SUBJECT. |
| R27a | QUEUE budget/unsafe retry blocker → D failure/owner disposition; без дополнительной скрытой attempt. |
| R27b | QUEUE development closure done_for_prod → actual permission/input B для production remainder. |
| R28 | QUEUE sync conflict → D recorded owner; unfinished sync после repair. |
| R29 | D → SUBJECT feature tasking/spec-redesign; затем QUEUE sync. |
| R30 | SUPPORT mb-garden выполняет уже разрешённый bounded mechanical repair → caller. |
| R31 | SUPPORT garden → D canonical/archive/task owner; нет auto destructive action. |
| R32 | SUPPORT garden → QUEUE mb-sync по accepted state → caller. |
| R33 | B → BOOT coherent installer sync; исходная operation после availability check. |
| R34 | SUPPORT find-skills → D proven install либо B unknown origin; native host install только после actual authorization. |
| R35 | SUPPORT doctor read-only result → D/B mechanical/subject/evidence owner; не full restart. |
| R36 | BOOT recovery выбирает SUPPORT garden, SUBJECT mapping/reconcile либо bootstrap; destructive choice через D. |
| R37 | SUPPORT fill/context-manifest/Explorer → D только missing fact/authority; return owner, no manifest gate. |
| R38 | D consultation того же owner → ordinary successor после ответа. |
| R39 | SUPPORT KISS reasoning → current SUBJECT owner; material new choice через D. |
| R40 | Selected SUPPORT tech-debt → caller; report unavailable advisory, adoption только новым D. |
| J01, J02 | Selected SUPPORT Judge в Foundation/queue/retry/wave boundary → caller; not immutable gate. |
| J03 | SUPPORT/REDIRECT/ESCALATE result → D; SUPPORT не permission, disagreement не vote. |
| J04 | Explicit requested SUPPORT Judge → original owner. |
| J05 | B unavailable Judge/policy → D repair/change selected route; не silent replacement. |
| J06 | CHECK independent candidate results → D только material unresolved finding; main-off без hidden main. |
| J07 | CHECK/SUPPORT rendered evidence при actual browser/route/safe state → active verifier. |

Recovery table раздела 6 TRANSITIONS реализуется BOOT + EXEC/CHECK/QUEUE state
reconciliation (§6); manual stops — общий admission (§7), Side session loss —
root session recovery (§11). Исторические vocabularies остаются у subject/task,
`skipped` не становится task status. Наличие строки D не требует повторного
согласия на уже явно порученный тот же bounded action.

## 10. Standalone Svelte: HTTP, RPC, streams и auth

Host регистрирует prefix `/nav27` через `ctx.webServer.register`. Handler
редиректит `/nav27` → `/nav27/`, отдаёт bundled index/assets только внутри package
root. Для index и данных вызывает `ctx.connection.admit(req)`; отказ 401/403
сохраняет native смысл. API/data не реализуются отдельными unauthenticated
маршрутами. Public assets не содержат project/session/credential data.

**Bootstrap authentication:** сначала пользователь открывает URL, напечатанный
`dsh web`, на root DSH с launch token. Native `authorizeIndex` обменивает token
на HttpOnly/SameSite cookie и чистый root URL. Token exchange проверяет именно
`pathname='/'`, поэтому `/nav27/?token=...` не обещается рабочим login.
Из authenticated native UI ссылка открывает `/nav27/` на том же origin/mount.
При expired cookie Nav показывает native authentication instruction, не просит
вставить API key и не копирует token в localStorage. HTTP и WS используют тот
же browser cookie, Host/Origin checks и DSH gateway permissions.

Навигационная страница располагается под DSH mount. В index устанавливается
`<base href="../">`: из `/nav27/` это `/`, из proxy `/prefix/nav27/` — `/prefix/`.
Assets имеют URL `nav27/assets/...` относительно этого base. Это важно:
[RPC route](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/client/connection/src/client/rpc.ts#L37-L80)
и [WebSocket resolution](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/client/connection/src/client/socket.ts#L49)
используют document-relative paths. Без base запрос уйдёт в
`/nav27/api/...`, где native API нет. Proxy mount должен быть одинаков для
DSH root/Nav/API; произвольный cross-origin deployment не вводится.

Client bundle собирается обычным Vite/Svelte, статически импортируя только:

- Cordis Context;
- `@deepseek-ai/dsh-typert-registry/client`;
- `@deepseek-ai/dsh-client-connection/client`;
- `@deepseek-ai/dsh-api-gateway/client`;
- generated Nav `/remote`, DSH session `/remote`, commands `/remote` и
  subagent `/remote` descriptors (последние два удовлетворяют SessionRemotes);
- `SessionEventStream` / `createSessionControlStream` из DSH session `/client`
  для Side history/control, без установки всего Session object-layer plugin.

Bootstrap: создать Context → установить registry/Connection → gateway →
`await ctx.remote.$mount(TYPERT_REMOTE)` для указанных contributions →
создать SessionEventStream для открытого Side и control stream → mount Svelte.
Не вызывать `session/client.apply`: полный object-layer требует также fileUpload,
commands/subagents services и Agent context projection; для выбранного
journal/prompt UI он не нужен. `SessionEventStream` напрямую использует native
`follow/page/$stream`, composer — `remote.session.prompt`, Stop — native cancel.
Это сохраняет native history/reconnect и не тянет неиспользуемый upload worker.
Generated export действительно называется `TYPERT_REMOTE`:
[emitter](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/typert/generator/src/emitter.ts#L248-L268).
`installConnection` получает `location` и `interactions:'answer'`, чтобы native
Gateway владел readiness/reconnect generations и `$stream`. Nav не регистрирует
answerer native permissions/questions: они остаются native main UI. Наличие
event carrier не означает собственный permission UX.

Unary вызовы идут как DSH Connection envelope POST `api/<namespace>/<method>`;
generated descriptors задают аргументы и codecs. Stream carrier — native
`api/remote.mux` (WebSocket). Gateway владеет mux, cancellation и generations,
а Nav предоставляет typed `@Remote({mode:'stream'}) watch`. Никаких вручную
изобретённых WS frames, polling LLM или второго reconnect protocol.

| Nav Remote method | Контракт |
| --- | --- |
| `open(projectRoot)` | Проверенный target → current/new run snapshot; повторное открытие того же project не создаёт второй main. |
| `watch(runId, signal)` | Сначала полный текущий view, затем replacement snapshots; AbortSignal закрывает subscription. View включает ephemeral activity/meter, не пишет их в MB на каждый token. |
| `control(runId, expectedRevision, action)` | `play|pause|stop|setRed|clearRed`, edge ID где нужен; human transport, не model tool. |
| `decide(runId, requestId, answer)` | Green/reject текущего request; duplicate/stale не запускает работу. |
| `saveSettings(runId, expectedConfigRevision, patch)` | Validation + accepted revision либо conflict/current value. |
| `createSide(runId, anchor)` | Проверить main/source cut, создать guarded independent root, вернуть session ID; preserve main. |
| `removeSide(runId, sessionId)` | Только mapped Side; native stop/archive, затем убрать marker. |

`session.modelCatalog`, `session.prompt`, `session.follow/page`, `session.control`
и projections используются из native remote API, не дублируются в Nav.
Svelte adapters превращают `getSnapshot/subscribe` или native stream frames
в stores; не импортируют `AppWebEntry`, React renderer, dock/layout или UI shell.
`watch` на reconnect отдаёт fresh baseline. Client выключает mutating controls,
пока состояние неизвестно; не переотправляет неоднозначно завершившуюся команду
как новую. Current revision/pending ID достаточно для reconciliation UI.
Session history использует DSH sequence/cursor и gap-free follow, включая
transient assistant-stream frames; не сливается со своим copy chat log:
[session transport](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/api/session-controller/src/client/transport.ts#L1-L91),
[follow API](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/api/session-controller/src/index.ts#L597-L613).

**Driver click:** обычная ссылка в root native DSH
`<hostRoot>#nav27-session=<encoded-mainSessionId>`. Это новый plugin-owned format,
не существующая upstream возможность. Малый native client plugin после ready
проверяет session ID, вызывает `ctx.uiWorkspace.openSession(id)` и убирает fragment.
Открывается именно main, без fork/stop. Native plugin также регистрирует
`nav_feedback` tool view и читает current pending из Nav watch; при восстановлении
новой main session показывает pending в её текущем context/card. Переиспользуются
native conversation и composer; тот же extension добавляет Nav Stop через
existing header utilities slot (§7). Только этот маленький client extension живёт
в React-based DSH shell; Svelte bundle от него не зависит.

## 11. Side Chat

Клик по корпусу создаёт независимую **root** DSH-сессию, не `subagents/fork`
и не child owned by main. Алгоритм:

1. Через `sessionQuery.observeSession(mainSessionId)` взять consistent current
   committed events; highest existing seq — inclusive cut. Streaming куски,
   ещё не committed в log, не являются fork context.
2. `buildForkSeed(events, seq)` закрывает open tail только в копии. Передать
   seed, `meta.isSeeded=true` и `inheritedEventCount=seq+1` в
   `ctx.agents.create`; без `parentAgent`.
   При пустой истории seed отсутствует, sourceSeq=null, текущий Nav context
   всё равно доступен; `isSeeded`/inherited count тогда не передаются. Это не
   требует остановки main или completed turn.
3. `meta.agentPreset=nav27-side`; setup монтирует собственный read-only preset,
   exact-role guards и Side model snapshot **до publication**. Seed сохраняет
   `model/selection` и request headers: они имеют приоритет над `agentOptions`
   fallback. Поэтому setup явно применяет выбранную Side route через
   `agent.model.select` после seed, а cold resume сохраняет уже записанный Side
   выбор. Одного `agentOptions` недостаточно
   ([selection precedence](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/agent/src/model-selection.ts#L105-L125)). Lineage source
   main ID/seq хранится в side binding; он не создаёт live parent ownership.
   Не копировать runtime controllers/ownership из transcript.
4. Attach к тому же workspace; после успешного создания persist binding и
   world-space anchor. На ошибке attach/persist владелец dispose созданный
   handle, не оставляя активный неучтённый Side.

При каждом новом Side вопросе scoped context builder добавляет текущий краткий
Nav state и его references. Fork не подписывает историю Side на будущие main
turns. Нормальные чтения файлов актуальны на момент чтения. Side не принимает
решений за main и не имеет lifecycle/control tools; собственные `source=user`
реплики не проходят main-session attribution check.

Несколько Side работают независимо: Stop, completion или reroute main их не
останавливают и не удаляют. Plugin shutdown освобождает live handles, DSH logs
и bindings сохраняются; cold resume применяет side preset заново. Если session
утеряна, marker показывает недоступность, а новый Side может получить context
из Memory Bank; exact восстановление исчезнувшего transcript не обещается.

Marker живёт в мировых координатах ниже позиции поезда при создании. В свёрнутом
виде только `%` собственной context occupancy либо `—`; при far zoom текст
скрыт. Expanded HTML chat имеет нормальный экранный размер, history, streaming
ответ, composer и Stop своей сессии; collapse возвращает marker. Чат не масштабирует
шрифт вместе с SVG картой. DEL вызывает native archive с `stopActivity:true`,
дожидается owned Side drain/dispose и только после успешной архивации удаляет
binding. При crash после archive до удаления binding recovery убирает уже
archived marker. История остаётся в native DSH archive; физическое удаление
не обещается. Это не затрагивает соседние Side и main.

## 12. Scene projection, не workflow state

Svelte получает factual view. `scene.ts` выводит stations/edges, current train,
local loops, parallel selected reviewers, proposed/approved tunnels, Judge
и Side anchors. Layout хранит geometry, labels и zoom thresholds отдельно от
controller; анимация никогда не authorizes operation или пишет lifecycle.
Нельзя начать работу по событию «поезд доехал» — движение отражает уже допущенный
host transition. После reconnect позиция восстанавливается из state без replay
всех animations.

- Основной маршрут слева направо; fit-to-map показывает всю сцену. Semantic
  zoom скрывает подписи/settings на дальнем плане, затем раскрывает детали.
  Play/Pause/Stop остаются вне трансформируемого SVG и всегда читаемы.
- Implementation/check loop возвращается к **входу в реализацию той же task**.
  Selected независимые reviewers — параллельные паровозики. Skip отличается
  от success; candidate-only completion не изображается как functional PASS.
- Reroute proposal сразу рисует short turnback + tunnel/red перед целевой
  станцией; пока нет consent поезд стоит. После принятия камера отдаляется,
  вход/примерно секундный выход/приближение — presentation sequence. Consultation
  без reroute показывает red на main path, без искусственного тоннеля.
- Главный поезд — main orchestrator. Пять цветов машиниста: голубой, оранжевый,
  фиолетовый, белый, чёрный; имя модели отдельно. Driver click открывает native
  main chat, body click создаёт Side; hit regions не пересекаются.
- База Judge с H рядом с путём, три model slots; один выбранный pilot/вертолёт.
  Настройки меняются только на остановленной станции. Между calls old
  pilot идёт на базу, new — к вертолёту; полёт только при фактической consultation.
- Груз соответствующего train/helicopter — собственный session context, не
  суммарные tokens и не progress. Показывать примерно
  `100*(projectedTokens ?? pressureTokens)/contextWindow`; если числитель или
  capacity неизвестны — `—`. После model switch возможна прежняя pressure,
  это native approximate meter, не gate и не «точный остаток».
- Compaction count — unique successful `compaction/end` без error, matched
  compactionId в отображаемой session. Failed attempt/prune не увеличивает.
  У fork count собственных compactions начинается после inheritedEventCount;
  у resumed той же session не обнуляется. Ноль скрыт.

Под сценой фактический статус агентов. Persistent Side anchors относятся к карте,
а expanded chat — к viewport. Геометрия, размещение loops/H/тunnel exits и
точные zoom thresholds **ещё требуют согласования схемы перед UI implementation**.
[Визуальный референс](railway-reference-01.png) — направление оформления,
не утверждённый graph. Новая картинка на этом этапе не генерируется.

## 13. Сквозные sequences и границы проверки

| Sequence | Исполняемый порядок |
| --- | --- |
| Start | Native command/Nav Play → BOOT availability/actual-state → main create/resume + holds → whole-leg snapshot → native child → subject/evidence → ordinary next. Clear PRD не проходит grill повторно; brownfield mapping только по actual need/decision. |
| Normal | Admission → persist prepared/attempt и snapshot всех participants перегона → launch native role → await result/finally dispose → validate/retain subject → record lifecycle/check/skip → next. Disabled operation не запускает LLM и не создаёт report. |
| Main-path consultation | Child/main needs_decision → current owner hold → при необходимости small clarification → one pending/question native main + red main edge → answer/green → same unfinished owner → ordinary next. |
| Reroute/repair | Retain partial/negative → main proposal owner/affected scope → proposed tunnel/red → approve one ID → reconcile old work at station → repair owner → affected selected rechecks/return point. Не reset всего downstream. |
| Autonomous | Тот же proposal → model semantic decision → persist autonomous provenance → admission; без вопроса/ожидания user, но с manual/technical holds. |
| Recovery | Load MB/tasks/native logs → restore stops/pending → actual-state reconciliation → preserved selected work/results → resume unfinished; без blind replay model requests. |
| Stop race | Persist stop before next admission → remove only Nav pending prompt → best-effort cancel/dispose → retain late results → reconcile at station. Play не removes unresolved decision/red. |
| Side | Body click → observe committed main cut → native create own root/setup → persist anchor → Side native prompt/follow; main продолжает. DEL → archive/drain → remove marker. |
| Station settings | Red/Pause during exe → all exe results → stopped station → CAS edit future verify in same attempt → green snapshots whole verify group, including unstarted peers → automatic next unless held. Native model/Stop keep DSH session semantics. |

Source-proven сегодня: перечисленные DSH primitives, отсутствие Nav guards у
native model selection/cancel, inheritance и формы actual evidence contracts.
Предлагается реализовать: Nav controller/resources/feedback/run/settings/UI,
role composition и отдельный подключаемый bundle без DSH core changes. Не проверены запуском:
сборка standalone browser imports/generated descriptors, реальные model turns,
external package/client delivery, cold-resume composition, best-effort cancellation, native
chat card/link, visual layout. Их проверяемые outcomes находятся в плане;
документ не объявляет их готовыми native features.
