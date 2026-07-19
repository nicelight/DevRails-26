# Global skills refactor — findings и план исправлений

## Статус review

- Verdict: `ACCEPT`
- Дата review: 2026-07-19
- Дата closure evidence: 2026-07-20
- Scope: canonical runtime commands, shared workflows/protocols, installer,
  generated target behavior, deterministic validators, documentation и
  agent-run verification
- Источник: три независимых focused review и отдельная сквозная проверка
  packaging/verification/docs
- Этот файл является текущим repair register; статус finding определяется
  разделом ниже, а не самим наличием finding в документе.

## Текущий статус реализации

- Repair status: `implemented_and_validated`; все принятые findings закрыты,
  RF-02 исключён operator decision. Broad refactor plan не переобъявляется
  `complete` этим repair-пакетом.
- Первый пакет: `implemented_and_validated` — RF-06, RF-07, RF-08, RF-09,
  RF-10, RF-11, RF-13, RF-14 и RF-15 закрыты в repair scope и прошли полный
  package validation.
- Второй пакет: `implemented_and_validated` — RF-01, RF-03, RF-04, RF-05 и
  RF-12 реализованы и прошли package integration validation.
- RF-02: `excluded` — fix намеренно удалён как неоправданное расширение
  runtime/Memory Bank surface.
- Blocking deterministic matrix пройдена; prompt-only semantics зафиксированы
  как manual contract-shape evidence, а не model-behavior proof.

## Сводка

- High: 2
- Medium: 10
- Low: 2

Все исправления разделены на два пакета:

1. **Первый пакет — contract hygiene и safety net.** Изменения восстанавливают
   уже принятые правила, устраняют dangling references и добавляют проверки.
   Они не должны выбирать новую installer architecture, task lifecycle или
   product behavior.
2. **Второй пакет — runtime и semantic contract repair.** Изменения закрывают
   существующие противоречия installer/runtime boundary, scheduler terminal
   semantics, делегирования, destructive maintenance и autonomous budgets. Они
   не добавляют новый capability или альтернативный workflow.

Первый пакет должен быть завершён до второго: он создаёт проверки, которые
нужны для безопасной реализации high-impact fixes.

## KISS-ограничения реализации

Эти ограничения обязательны для обоих пакетов и имеют приоритет над более
широкой формулировкой отдельного finding:

- Оба пакета имеют только repair scope: закрыть воспроизводимые contract,
  safety, routing или documentation gaps минимальной правкой существующего
  owner/artifact. Улучшение DevRails, новый capability или удобство без острой
  необходимости не являются целью этих RF и остаются out of scope.
- Finding не является основанием для новой подсистемы. Если дыру нельзя закрыть
  без нового runtime surface, registry, state machine, artifact family или
  installer mode, текущий пакет фиксирует честный blocker/route либо удаляет
  спорный fix из scope вместо проектирования нового функционала.
- Не создавать новые task schemas, lifecycle/status vocabularies, registries,
  Memory Bank directories, families of protocol artifacts или generated public
  subtrees ради этих исправлений.
- Не добавлять target-local bootstrap helper, его assets или вторую реализацию
  Memory Bank initialization. RF-01 использует только внешний
  `scripts/install-framework.mjs` из доступного checkout DevRails.
- RF-02 исключён из плана. Не разворачивать protocol templates в target, не
  добавлять для них ownership markers, sync, overwrite или migration policy.
  Если существующему command недостаёт минимальной output shape, она остаётся
  частью его существующего generated `SKILL.md` и формируется из текущего
  canonical source без нового durable artifact.
- `/get-context` остаётся строго read-only: только прочитанный контекст, gaps и
  рекомендуемые следующие reads. Task protocol создаёт или обновляет его
  существующий owning execution/planning skill, не priming command.
- `/find-skills` не получает отдельный manifest/catalog. Он различает DevRails
  command и внешний package только по уже доступному evidence; при
  неопределённом происхождении сообщает ambiguity и ничего не устанавливает.
- Не вводить blocker classifier, вторую precedence state machine или новое
  persisted blocker field. Сохранять уже записанный specific terminal state;
  `HALT_DEPENDENCY_DEADLOCK` допустим только для доказанного dependency-only
  graph exhaustion.
- Не создавать blocking LLM/model-eval framework. Agent-run verification
  содержит только deterministic syntax, contract, install/bootstrap,
  lint/doctor и compatibility checks. Prompt behavior проверяется компактным
  manual или явно non-blocking probe checklist.
- Не создавать универсальный Markdown parser или отдельный vocabulary artifact
  для `/mb-doctor`. Документировать фактические public finding codes и покрывать
  критичные mode/severity combinations прямыми fixtures.
- RF-12 меняет только canonical `/autonomous`: initial review не считается
  попыткой, на одну review surface разрешены ровно два завершённых цикла
  `repair -> re-review`, а compact counters хранятся в существующем autonomous
  run status. Не менять autonomy policy/run-status template и не добавлять
  config field, task field, registry, schema или новый artifact.
- `/mb-garden` автоматически меняет только mechanical links/indexes/routers.
  Delete/merge и semantic canonical/task/governance decisions требуют
  explicit owner decision. После mutation обязателен lint; doctor остаётся
  conditional. Contract и implementation `/mb-sync` не меняются: broader
  reconciliation получает handoff к этому existing owner.
- По позднему operator override `README.md` и `howItWorks.md` точечно
  синхронизируются в Slice 7 после canonical fixes и integration validation.
- Любой новый durable artifact, target path, workflow branch или повторная
  canonical copy требует отдельного текущего requirement и explicit operator
  approval. Иначе используется существующий artifact/owner или изменение не
  вносится.

# Первый пакет — contract hygiene и safety net

## RF-06 — `/feature-doctor` использует неизвестный terminal state

**Severity:** Medium

**Суть проблемы**

`skills/_shared/references/commands/feature-doctor.md:16-19` использует
`HALT_CLARIFICATION_TARGET_REQUIRED`, когда команда вызвана без
`FT-<NNN>`. Такого состояния нет ни в
`skills/_shared/references/protocols/run-status-template.md`, ни в
`skills/_shared/references/workflows/autonomy-policy.md`.

В результате scheduler или resume logic получает значение, которого нет в
canonical terminal vocabulary. Оно не имеет определённого owner, формата
причины или resume route.

**Как исправить**

- Заменить его на существующий `HALT_CLARIFICATION_REQUIRED`.
- Missing `FT-<NNN>` записывать как `reason`, affected command и exact next
  action, а не кодировать отдельным статусом.
- Добавить agent-run check, который извлекает все `HALT_*` из commands/workflows
  и проверяет их принадлежность canonical set из run-status template.

**Потенциальные опасности**

- Нельзя делать глобальную замену похожих строк без проверки контекста: разные
  `HALT_*` имеют разных owners и resume routes.
- Static check должен читать один canonical vocabulary, а не создавать второй
  вручную поддерживаемый список в verification tooling.

**Готово, когда**

- Undefined `HALT_*` отсутствуют.
- Вызов без feature ID возвращает canonical clarification halt с точной
  причиной и командой возобновления.

## RF-07 — `/discuss` требует decision log, которого может ещё не быть

**Severity:** Medium

**Суть проблемы**

`skills/_shared/references/commands/discuss.md:40-45` безусловно требует
существующий `.protocols/<ID>/decision-log.md`. Но `/spec-init` может
направить в focused discussion до `/prd-to-features`, а именно `/prd-to-features` впервые создаёт
`.protocols/PRD-BOOTSTRAP/decision-log.md`.

Получается ложная развилка: либо `/discuss` не может выполнить собственный
output contract, либо он самовольно создаёт protocol artifact, которым владеет
другой workflow step.

**Как исправить**

- Сделать owning canonical artifact обязательным местом применения принятого
  решения.
- Decision log обновлять только когда он уже существует или его создание явно
  принадлежит текущему owning skill.
- В handoff всегда указывать, где именно решение было применено и какие
  unresolved questions остались.

**Потенциальные опасности**

- Простое удаление требования decision-log может ухудшить traceability.
  Компенсация — обязательная ссылка на изменённый canonical artifact и
  краткий decision summary в результате команды.
- Нельзя создавать общий interview/decision registry: это нарушит KISS и
  исходный refactor plan.

**Готово, когда**

- Pre-PRD discussion работает без placeholder protocol path.
- Принятое решение остаётся durable и однозначно находится через owning
  artifact.

## RF-08 — `/get-context` пишет task protocol и предполагает делегирование при priming

**Severity:** Medium

**Суть проблемы**

`skills/_shared/references/commands/get-context.md:21-23` требует создать
`.protocols/<TASK-ID>/plan.md` и определить работу сабагентов, если контекста
не хватает. При этом `/get-context` может быть вызван без TASK-ID, top-level GENERAL
не имеет права автоматически делегировать работу, а Reviewer/Explorer может
быть read-only.

Обычный context priming поэтому неожиданно превращается в durable mutation и
orchestration step.

**Как исправить**

- Сделать priming строго read-only: вернуть список прочитанного, gaps и
  необходимых следующих reads.
- Предлагать `/context-manifest` только если broad discovery действительно
  дешевле direct reads и текущая роль вправе делегировать.
- Не создавать и не обновлять `.protocols/*`: task/process protocol остаётся у
  существующего owning execution/planning skill.

**Потенциальные опасности**

- Нельзя переносить task planning/resumability в `/get-context`; для этого уже существуют
  task record, `/execute-task` и task-owned protocol.
- Нельзя считать сам вызов `/get-context` разрешением на запуск сабагентов.

**Готово, когда**

- Простое priming не меняет рабочее дерево.
- При необходимости protocol mutation `/get-context` возвращает точный owning next step,
  но сам ничего не записывает.
- Delegation всегда следует role/operator contract.

## RF-09 — `/find-skills` смешивает DevRails commands и внешние packages

**Severity:** Medium

**Суть проблемы**

`skills/_shared/references/commands/find-skills.md:27-36` предлагает
`npx skills add <owner/repo>` для любого отсутствующего skill. Для DevRails
source-only repository этот путь прямо объявлен неподдерживаемым: canonical
commands должны устанавливаться через `scripts/install-framework.mjs`.

Проблема особенно заметна после selective install: отсутствующий DevRails
command выглядит для `/find-skills` как обычный marketplace package. Там же
autonomous recommendation пишется в неопределённый `decision-log.md`.

**Как исправить**

- Определять происхождение отсутствующего skill только по уже доступному
  installed/source evidence; не создавать новый catalog или manifest.
- Для доказанного DevRails command рекомендовать framework installer/sync route и не
  предлагать `npx skills add`.
- Для внешних совместимых skills оставить marketplace route с обязательным
  подтверждением пользователя.
- При неопределённом происхождении сообщать ambiguity и ничего не устанавливать,
  а не угадывать DevRails или marketplace route.
- В autonomous mode указывать существующий
  `.protocols/AUTONOMOUS-RUN/decision-log.md`.

**Потенциальные опасности**

- Runtime target может не знать абсолютный путь к source checkout DevRails.
  Команда должна рекомендовать внешний installer route, но не изображать, что
  способна выполнить его без доступного checkout.
- Не следует встраивать второй вручную поддерживаемый список 29 commands,
  добавлять target manifest или расширять installer metadata ради этого fix.

**Готово, когда**

- Missing DevRails command и missing external skill получают разные routes,
  когда происхождение доказано; неизвестное происхождение остаётся явным
  blocker без mutation.
- Autonomous flow ничего не устанавливает и пишет recommendation в точный
  существующий artifact.

## RF-10 — Публичный `/mb-doctor` contract расходится с implementation

**Severity:** Medium

**Суть проблемы**

`skills/mb-garden/assets/mb-doctor.mjs:171-208` выдаёт strict error
`CONSTITUTION_STRUCTURE_INVALID`, которого нет в Required checks и Findings
command spec.

`skills/mb-garden/assets/mb-doctor.mjs:1210-1228` выдаёт
`FEATURE_RED_VERIFY_VERDICT_MISSING` как default warning и strict error, но
`skills/_shared/references/commands/mb-doctor.md` документирует только strict
форму.

Агент или scheduler поэтому может получить недокументированный blocker/warning
от deterministic tool.

**Как исправить**

- В рамках первого пакета принять текущую реализацию как фактический контракт.
- Добавить обе проверки в Required checks.
- Синхронизировать error/warning vocabularies и условия severity.
- Добавить прямые fixtures для затронутых public finding codes и их
  default/strict severity; не строить отдельный vocabulary/parser subsystem.

**Потенциальные опасности**

- Нельзя одновременно «синхронизировать документацию» и незаметно менять
  validator behavior. Если сама Constitution-проверка спорна, это отдельное
  semantic решение.
- Наивный parser документации может стать хрупким; достаточно проверять
  критичные public codes, а не форматировать весь Markdown под машину.

**Готово, когда**

- Каждый public error/warning doctor имеет документированное условие и severity.
- Изменение docs не меняет результаты текущих doctor fixtures.

## RF-11 — `/autonomous` не проверяет наличие canonical `/mb-sync` workflow

**Severity:** Medium

**Суть проблемы**

`skills/_shared/references/commands/autonomous.md:20-24,45-48` требует
autonomy policy, tier policy и execute loop, но не
`.memory-bank/workflows/mb-sync.md`. При этом на wave boundary команда
обязательно вызывает `/mb-sync`.

В partial или повреждённой установке autonomous run может выполнить
существенные product/task/code mutations и только в конце wave обнаружить, что
sync contract отсутствует.

**Как исправить**

- Добавить `.memory-bank/workflows/mb-sync.md` в preflight и hard invariants.
- При отсутствии reference останавливать run до любых mutations через
  существующий `HALT_POLICY_VIOLATION` с installer/sync repair route.
- Добавить bootstrap fixture, проверяющий все четыре required workflows для
  `/autonomous` и `/autopilot`.

**Потенциальные опасности**

- Старый target с неполной установкой начнёт останавливаться раньше. Это
  желательное fail-fast поведение, но сообщение должно давать точный upgrade
  route.
- Нельзя локально копировать sync rules обратно в `/autonomous`: canonical
  reference должен остаться единственным owner.

**Готово, когда**

- Autonomous preflight симметричен autopilot preflight по required workflows.
- Missing sync reference обнаруживается до первого durable write.

## RF-13 — Verification должна ловить известные contract regressions

**Severity:** Medium

**Суть проблемы**

Одних проверок наличия строк недостаточно: они не обнаруживают undefined
terminal tokens, missing deployed workflow, doctor vocabulary drift и некоторые
RF-01/RF-03 regressions. Проверки должны оставаться воспроизводимыми без
отдельного repository CI workflow.

**Как исправить**

- Добавить только targeted deterministic checks для findings этого register:
  terminal vocabulary, существующие deployed workflows, public doctor codes и
  existing task-card compatibility.
- RF-01/RF-03 regression checks добавлять вместе с соответствующим fix, а не
  оставлять первый пакет красным.
- Для prompt-only поведения, которое нельзя доказать deterministic script,
  выполнить компактный manual probe и записать результат в обычное repair
  evidence. Не создавать model-eval runner, provider integration,
  scoring/retry framework или CI subsystem.

**Потенциальные опасности**

- Static check не должен притворяться behavioral proof; prompt-only проверка
  явно помечается manual evidence.
- Snapshot полного prompt text не нужен: он не доказывает исправление дыры и
  создаёт refactor friction.
- Fixture не должен вводить второй task schema или synthetic lifecycle.

**Готово, когда**

- Каждый targeted regression из этого register имеет минимальное воспроизводимое
  deterministic или явно manual evidence.
- RF-01/RF-03 checks становятся blocking только одновременно с их fixes.
- Новая eval/test infrastructure не добавлена.

### Manual probe evidence — первый пакет

Это один manual model-behavior pass в изолированных generated targets, а не
deterministic proof и не новый blocking eval framework.

| Probe | Сценарий | Наблюдаемый результат | Verdict |
|---|---|---|---|
| P1 / RF-07 `/discuss` | Отсутствует owning `user-scenarios` artifact | Остановка до вопроса/принятия ответа, route в `/spec-init`, без writes | PASS |
| P1b / RF-07 `/discuss` | Существует `.memory-bank/product.md#Audience`, decision log отсутствует; оператор принял audience answer | Ответ применён только к `product.md`; file count не изменился, decision log или другой artifact не создан | PASS |
| P2 / RF-08 `/get-context` | Обнаружен context gap | Только reads, gaps и owning route; без writes, delegation и `/context-manifest` | PASS |
| P3 / RF-09 `/find-skills` | Unknown origin; доказанный DevRails command; autonomous recommendation | Unknown origin остаётся ambiguity без install; DevRails command получает external-installer route; autonomous обновляет только заранее существующий exact decision log | PASS |
| P3b / RF-09 `/find-skills` | Verified external metadata `acme-labs/calendar-skills` | Предложен marketplace route с conflict warning; без explicit confirmation установка не выполнена, tree не изменён | PASS |
| P4 / RF-14 `/mb-sync` | No-op manual sync | Только sync-local inspection, без lint/doctor; post-sync gates возвращены explicit owner | PASS |

## RF-14 — `/mb-sync` и scheduler перекрываются во владении post-sync gates

**Severity:** Low

**Суть проблемы**

`skills/_shared/references/commands/mb-sync.md:81-92` сначала поручает
`/mb-sync` запускать lint/readiness checks, а затем возвращает управление
scheduler, чтобы тот снова выполнил lint и strict doctor. `/autonomous` и
`/autopilot` также явно владеют этими post-wave gates.

Это создаёт лишние повторные запуски и неоднозначность: sync уже успешен до
strict doctor или только после него.

**Как исправить**

Рекомендуемая граница:

- `/mb-sync` владеет reconciliation и sync-local consistency evidence;
- scheduler/explicit top-level owner запускает authoritative post-sync lint и
  applicable doctor gate;
- в manual flow без scheduler handoff явно называет owner следующей проверки.

`/mb-sync` сам не запускает полный `mb-lint` или doctor. Его sync-local
validation ограничена перечитыванием изменённых links/indexes/RTM/spec state;
полные gates принадлежат вызывающему scheduler/explicit top-level owner.

Canonical `.memory-bank/workflows/mb-sync.md` должен зафиксировать эту границу,
а leaf command — только ссылаться на неё.

**Потенциальные опасности**

- Если убрать checks из `/mb-sync` без manual fallback, ручной flow может
  завершиться без проверки.
- Если оставить «локальный lint» и «scheduler lint», нужно чётко объяснить,
  почему это две разные проверки; иначе дублирование сохранится.

**Готово, когда**

- Для manual и scheduler mode существует один явный owner каждого post-sync
  gate.
- Один и тот же strict doctor не запускается дважды без конкретной причины.

## RF-15 — Planning artifacts не отражают текущее состояние refactor

**Severity:** Low

**Суть проблемы**

`IDEAS/global-skills-refactor.md` имел ложный `Status: proposed`.
`IDEAS/global-skills-refactor-stage1-handoff.md` описывает Stage 2 и
behavioral probes как будущую работу, хотя текущий source уже содержит
рефакторинг tasking/execution/scheduler commands. Stage 1 handoff сохранён как
historical snapshot, а основной план указывает current repair register.

Будущий агент не может однозначно понять: refactor принят, частично выполнен или
только предложен.

**Как исправить**

- Пометить Stage 1 handoff как historical snapshot, не переписывая его историю.
- Основному плану дать правдивый статус, например
  `implemented_with_open_findings`.
- Добавить ссылку на этот `_refactor.md` как текущий repair register.
- Не ставить `complete`, пока High findings и required behavioral evidence не
  закрыты.

**Потенциальные опасности**

- Нельзя переписать historical handoff так, будто Stage 1 никогда не был
  отдельным этапом.
- Статус `complete` сейчас будет ложным и скроет RF-01–RF-03.

**Готово, когда**

- Один актуальный документ сообщает текущее состояние и open findings.
- Historical handoff явно не воспринимается как current execution plan.

# Второй пакет — runtime и semantic contract repair

## RF-01 — Install-only оставляет `/mb-init` без способа создать skeleton

**Severity:** High

**Статус:** `implemented_and_validated` — external bootstrap-only router,
selective installs, fresh/sync и custom-`AGENTS.md` fixtures прошли.

**Суть проблемы**

`skills/_shared/references/commands/mb-init.md:16-21` ссылается на
`init-mb.js` и `structure-template.md` и ошибочно утверждает, что если
runtime command виден, skeleton уже создан.

`scripts/install-framework.mjs:952-963` официально поддерживает install-only:
он генерирует runtime skills, но не создаёт Memory Bank и не устанавливает
bootstrap helper/template. Selective `--skill cold-start` дополнительно
устанавливает router без требуемого `/mb-init`.

Фактический advertised route
`install-only -> /mb-init -> /cold-start` поэтому является тупиком.

**Как исправить**

- Зафиксировать единственный public contract: **external bootstrap only**.
- `/mb-init` сделать thin blocker/router: если skeleton отсутствует или требует
  sync, команда не выполняет init сама, а требует запустить существующий
  `scripts/install-framework.mjs --bootstrap|--sync` из доступного checkout
  DevRails.
- Не добавлять target-local helper/assets и не пытаться угадать путь к checkout.
  Если checkout недоступен, вернуть честный blocker и описать требуемое внешнее
  действие.
- Selective `cold-start`/`mb-init` install должен выдавать тот же ясный
  point-of-use route без автоматической установки dependency или нового mode.

**Потенциальные опасности**

- External-only route не работает, если runtime не знает, где находится
  DevRails checkout; сообщение не должно содержать выдуманный executable path.
- Bootstrap затрагивает существующие `AGENTS.md`, Memory Bank и user files;
  нельзя обходить текущую replace/merge/sync policy.
- Нельзя возвращать bootstrap logic в runtime command или дублировать init для
  Codex и Claude.

**Готово, когда**

- Full install-only target имеет честный внешний route к skeleton и не обещает
  выполнить bootstrap без доступного DevRails checkout.
- Selective cold-start/mb-init installs не создают dangling command dependency.
- Fresh, sync и existing-AGENTS fixtures проходят.

## RF-03 — No-ready fallback может заменить реальный blocker на deadlock

**Severity:** High

**Статус:** `implemented_and_validated` — specific halt preservation,
dependency-only deadlock и empty-index quality halt закреплены в canonical
contracts и release assertions.

**Суть проблемы**

Tier policy требует отдельных маршрутов для operator clarification,
semantic concern, review rejection, quality/policy failure и budget exhaustion.
Но `/autopilot` и `/autonomous` позднее сводят любое оставшееся
`planned|blocked` состояние к `HALT_DEPENDENCY_DEADLOCK`.

После resume реальная причина может быть потеряна: пользователь увидит
dependency deadlock вместо вопроса, rejected review, T3 checkpoint или missing
quality evidence.

**Как исправить**

- `HALT_DEPENDENCY_DEADLOCK` не вводится этим fix: token присутствует в
  terminal vocabulary с initial import `bdb8c86` от 2026-06-22. Его удаление
  было бы отдельным public-contract change и не входит в repair scope.
- Зафиксировать в существующем `workflows/autonomy-policy.md` два правила:
  1. уже записанный specific `HALT_*` и его resume route нельзя заменять общим
     deadlock;
  2. `HALT_DEPENDENCY_DEADLOCK` допустим только когда все оставшиеся runnable
     candidates остановлены исключительно незакрытыми task dependencies.
- `/autonomous` и `/autopilot` должны ссылаться на эти два правила. Не добавлять
  blocker classes, precedence table, parser или новое persisted поле.
- Пустой task index нарушает existing non-empty input contract `/autopilot` и
  возвращает `HALT_QUALITY_GATES` с точной причиной. Возобновление возможно
  после того, как существующий planning owner создаст reviewed non-empty queue
  и пройдёт strict readiness; если authoritative planning state отсутствует,
  команда требует queue у оператора, а не угадывает новый route.

**Потенциальные опасности**

- Нельзя синтезировать новый halt из одного `status: blocked`; используется уже
  сохранённая terminal reason/evidence существующего owner.
- Нельзя добавлять task-schema поле или отдельный blocker registry.
- Resume fixture должен доказывать, что terminal reason сохраняется между
  запусками.

**Готово, когда**

- Существующий specific terminal state и owner не перезаписываются fallback-ом.
- `HALT_DEPENDENCY_DEADLOCK` остаётся только для реального graph exhaustion.
- Повторный запуск читает ту же причину и выдаёт точную resume command.

## RF-04 — `/map-codebase` остался со старой фиксированной тактикой

**Severity:** Medium

**Статус:** `implemented_and_validated` — direct reads стали default для малого
repo, bounded delegation условна, supplied delta сохраняется.

**Суть проблемы**

`skills/_shared/references/commands/map-codebase.md:11-59` требует 5–7
сабагентов по заранее заданным зонам, фиксированный fan-out/fan-in и длинную
downstream chain до execution. Это конфликтует с refactor principle, role
constraints и runtimes с меньшим числом concurrency slots.

Команда также безусловно просит PRD delta, даже когда authoritative delta уже
передан вызывающим autonomous/brownfield flow.

**Как исправить**

- Ограничиться локальной правкой существующего command: убрать обязательные
  5–7 worker lanes и fixed fan-out/fan-in, сохранив текущие required baseline
  outputs, facts-vs-inferences validation и PRD-less prohibition.
- Direct reads использовать для малых repos; `/context-manifest` или
  delegation — только когда discovery действительно широкое и оператор/роль
  это разрешает.
- Если authoritative delta уже дан, сохранить его как downstream input и не
  спрашивать повторно.
- Удалить только дублированную downstream chain, оставив непосредственный
  существующий next owner. Не проводить общий prompt refactor вне этих дыр.

**Потенциальные опасности**

- Слишком сильное сокращение может привести к поверхностному brownfield map.
  Нужны обязательные evidence coverage и facts-vs-inferences validation.
- Нельзя сделать delegation default: GENERAL и worker roles имеют разные права.
- Existing baseline docs нельзя переписать inference-ами или превратить
  mapping в roadmap/task generation.

**Готово, когда**

- Малый repository можно корректно mapped одним агентом без искусственных
  workers.
- Большой repository сохраняет возможность bounded delegation.
- PRD-less guard и brownfield evidence quality не ослаблены.

## RF-05 — `/mb-garden` проверяет состояние до основных изменений и может решать за owner

**Severity:** Medium

**Статус:** `implemented_and_validated` — automatic scope ограничен mechanical
links/indexes/routers, final lint обязателен, semantic/destructive work получает
handoff; `/mb-sync` и validators не менялись.

**Суть проблемы**

`skills/_shared/references/commands/mb-garden.md:31-57` запускает lint,
doctor и conditional sync до archive/delete/merge/index/link mutations. После
мутаций обязательная повторная validation отсутствует.

Кроме того, команда предлагает агенту решить, закрыть TODO или превратить его в
task, а также объединять competing canonical material без явного
operator-decision boundary.

**Как исправить**

- Сначала выполнить read-only scan; перед edits назвать exact intended files в
  transient working context без durable write-set artifact или ownership
  matrix.
- Разрешить skill автоматически менять только однозначные mechanical stale
  links, indexes и routers в этих files.
- Archive/delete/merge и material canonical/task/governance decisions возвращать
  оператору или существующему owning planning skill; не добавлять новую
  ownership matrix или maintenance lifecycle.
- После фактических garden mutations обязательно запускать final lint. Doctor
  запускать только на применимой readiness/risk boundary.
- Если нужен broader durable-state reconcile, вернуть handoff существующему
  `/mb-sync`; не менять и не пересказывать его contract внутри garden.
- Handoff должен перечислять реально changed files, updated links и оставшиеся
  blockers. Не выполненные archive/move/delete остаются blockers, а не changes.

**Потенциальные опасности**

- Archive/delete/merge — потенциально destructive operations; ошибочная
  canonical identity может удалить актуальный source.
- Перемещение specs способно разорвать feature/task links и historical
  evidence.
- Без точной границы garden может начать создавать product tasks или менять
  Constitution, что ему не принадлежит.
- Cosmetic cleanup не является основанием для `/mb-sync`; broader reconcile
  остаётся отдельным handoff существующему owner.

**Готово, когда**

- Финальный garden-owned changed state всегда проходит lint; applicable doctor
  не пропускается и не запускается декоративно.
- Mechanical cleanup отделён от operator-owned semantic decisions.
- `/mb-sync`, lint/doctor implementation и validators не изменены.
- User-owned/current canonical artifacts не удаляются без явного основания.

## RF-12 — Review budget `/autonomous` не определён и не сохраняется

**Severity:** Medium

**Статус:** `implemented_and_validated` — ровно два завершённых
`repair -> re-review` цикла на surface, counter сохраняется при resume; новых
artifacts/statuses/schema нет.

**Суть проблемы**

`skills/_shared/references/commands/autonomous.md:122,136-142` одновременно
говорит `within review budget` и `after existing 2-3 repair attempts`.
Сам command не задаёт точное число и не требует сохранять review-attempt
counters в существующем run status.

Разные агенты могут остановиться после двух или трёх циклов, а resume способен
обнулить неявный счётчик.

**Как исправить**

- Изменить только canonical `/autonomous`: разрешить ровно `2` завершённых
  `repair -> re-review` цикла на одну surface. Не добавлять configurability или
  policy field.
- Однозначно определить семантику: initial review не считается repair attempt;
  учитывается завершённый repair + re-review cycle.
- Хранить только компактные counters по реально reviewed surface внутри
  existing Review gates section существующего autonomous run status; не менять
  `autonomy-policy.md` или `run-status-template.md` и не создавать отдельный
  registry, schema, template или artifact.
- При достижении лимита использовать существующий `HALT_REVIEW_REJECT` и
  сохранять latest findings/resume route.

**Потенциальные опасности**

- Не заменять approved exact limit `2` формулировкой `2-3`, configurable default
  или внешним policy mechanism.
- Нельзя добавлять новый lifecycle status или task-schema field только ради
  budget.
- Нужно избежать off-by-one и сброса counters после compaction/resume.
- Не вводить отдельную version/identity model для planning surfaces: в пределах
  одного run тот же feature-plan или `task-plan:FT-<NNN>` продолжает существующий
  counter.

**Готово, когда**

- Один и тот же run останавливается после одинакового числа repair cycles во
  всех runtimes.
- Resume продолжает persisted counter.
- Limit exhaustion всегда даёт `HALT_REVIEW_REJECT` с доказательствами.

# Порядок реализации пакетов

## Первый пакет

Рекомендуемый порядок:

1. RF-13 — добавить минимальные deterministic guards для terminal vocabulary,
   deployed workflows и compatibility fixtures текущего пакета.
2. RF-06, RF-11 — закрыть terminal-token и missing-preflight gaps.
3. RF-07, RF-08, RF-09 — устранить dangling artifacts и role/install routing.
4. RF-10 — синхронизировать doctor docs без изменения implementation.
5. RF-14 — уточнить ownership post-sync gates.
6. RF-15 — актуализировать planning status и связать его с этим register.

Проверки пакета:

- syntax и `git diff --check`;
- terminal vocabulary fixture;
- generated target reference fixture;
- bootstrap/install smoke;
- fresh `mb-lint` и default/strict doctor fixtures;
- source-only `shared-*` count `0`.

## Второй пакет

Все operator decisions этого пакета приняты: для RF-01 действует
`external bootstrap only`, для RF-12 — ровно два `repair -> re-review` цикла на
surface только внутри `/autonomous`; RF-02 исключён. `README.md` и
`howItWorks.md` точечно обновляются в финальном integration slice, `/mb-sync`
не меняется.

Рекомендуемый порядок:

1. RF-01A — исправить `/mb-init` как external-bootstrap blocker/router и
   selective fixture без target-local helper.
2. RF-01B — дать selective `/cold-start` самостоятельный external route без
   dependency на установленный `/mb-init`.
3. RF-04 — убрать forced fan-out, сохранить baseline outputs и reuse supplied
   delta.
4. RF-05 — KISS garden-only fix: mechanical ownership, final lint и handoff к
   unchanged `/mb-sync` только для broader reconciliation.
5. RF-03 — минимально исправить no-ready fallback, не меняя существующий
   terminal vocabulary.
6. RF-12 — зафиксировать ровно две repair/re-review пары только внутри
   `/autonomous` и compact counters в existing status.
7. Прогнать package integration validation и записать фактическое evidence.

Проверки пакета:

- install-only, selective install, bootstrap и sync existing target;
- Codex/Claude generated runtime equality;
- operator blocker, review reject, quality failure и genuine dependency
  deadlock дают разные ожидаемые terminal states;
- resume сохраняет terminal reason и review counters;
- small/large brownfield map fixtures;
- post-garden link/lint/doctor checks;
- отсутствие изменений в `/mb-sync`, `run-status-template.md` и task schema;
- точечная синхронизация `README.md` и `howItWorks.md` с реализованными
  contracts;
- existing JSON task cards остаются compatible;
- source-only дерево не содержит generated package-local `shared-*`.

## Evidence второго пакета — 2026-07-20

- `npm run check:syntax --silent`: PASS.
- `git diff --check`: PASS.
- Existing source/release assertions и first-package guards: PASS.
- Full install-only, selective `cold-start`/`mb-init`, fresh bootstrap, explicit
  sync и custom `AGENTS.md` preservation в isolated targets: PASS.
- Generated Codex/Claude equality, fresh/applicable `mb-lint` и doctor,
  existing JSON task-card compatibility: PASS.
- Source-only package-local `shared-*`: `0`.
- RF-01/RF-03/RF-04/RF-05/RF-12 prompt-only scenarios: manual contract-shape
  inspection PASS; это non-blocking evidence, не model-behavior eval.
- Integration fixes вне documentation/registers не потребовались.
