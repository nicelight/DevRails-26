# Загрязнение canonical Memory Bank

## Закрытая проблема: run report в `spec-backbone.md`

Статус: **закрыта на уровне framework**.

`/spec-design` одновременно требовал обновлять durable
`.memory-bank/spec-backbone.md` и `Report ...`, не уточняя, что отчёт относится
к финальному ответу в чат. Агент мог записать в backbone дату и охват запуска,
reconciliation history, changed/reused specs, before/after, task/feature
inventory и immediate handoff. Эти данные описывают запуск команды, а не
текущее нормативное состояние.

Canonical `/spec-design` исправлен:

- backbone теперь требуется `Ensure`, а не безусловно `Update`;
- edit разрешён только при изменении durable state или repair существующего
  contract;
- per-run reconciliation/history и копия final chat handoff запрещены;
- durable routing sections `Handoff To ...` сохранены;
- status, changed specs, before/after, blockers и next command явно направлены
  в final chat response.

`scripts/test-install-sync.mjs` проверяет эти правила на обеих deployed runtime
surfaces. Новые report artifacts, statuses или workflow-модель не вводились.

## Новые findings

Следующие проявления связаны с той же общей границей durable knowledge, но не
сводятся к report-channel ambiguity. Здесь смешиваются semantic ownership,
устойчивое нормативное состояние, временный implementation status и
неочищенный design backlog.

### Volatile snapshots в root router

В `face_moment/.memory-bank/index.md` описание `spec-backbone.md` содержит
Planning Revision, feature blockers и Foundation handoff. Фраза `feature
blockers` появилась в commit `1f29a332`, а номер revision затем менялся в
`3d630c29`. Это подтверждает, что router копирует изменяемое состояние вместо
стабильного назначения документа. Текущий mismatch сам по себе не доказывает
сбой `/mb-sync`: пользовательская очистка backbone ещё не была синхронизирована.

Источник допуска находится в `/mb-sync`, который reconciles routers без
ограничения на содержание annotations, и в `/prd-to-features`, который требует
только `annotated links`. Bootstrap template уже использует корректное
стабильное описание.

Исправление: router annotations должны описывать только purpose/scope/owner
документа. Запретить в них revisions, lifecycle/status snapshots, blockers,
queue inventory и текущий handoff. Закрепить правило в `/mb-sync` и
`/prd-to-features`; `/mb-garden` может исправлять такое описание только когда
стабильный target однозначен.

### Design backlog в glossary

В историческом `glossary.md` определения `correlation_id`, `Annotation` и
`Balance` содержали будущую унификацию field name, normalized storage
vocabulary и нерешённую formula. Это не определения терминов. Текущая очистка
корректна; `Balance` blocker теперь принадлежит FT-011.

`/brief` уже ограничивает glossary принятыми терминами. Пробел остаётся в
`/spec-init`: формулировка `Keep only evidenced definitions` явно не запрещает
TODO/design backlog. `/spec-auto` дополнительно разрешает записывать вопрос в
`backbone, feature, spec ... as appropriate`, не фиксируя semantic owner.

Исправление: glossary хранит только принятое значение термина и disambiguation.
Open questions, будущие field names/formulas/storage choices, blockers, TODO и
resume routes направляются в owning feature, backbone или contract. Это правило
нужно добавить в `/spec-init` и унаследовать в `/spec-auto`.

### Чужой и stale backlog в lifecycle spec

В `states/lifecycle-map.md` есть два разных дефекта:

- unresolved machine outcome name относится к API contract и FT-003; lifecycle
  владеет только принятой state consequence;
- `requiring later audit design` был создан предварительным `/spec-init` в
  commit `695c81c2`, но остался после того, как audited manual command был
  определён в `boundary-map.md` в commit `50a28f36`. Тот же commit менял
  lifecycle-map, поэтому это подтверждённый reconciliation miss.

`/spec-init` разрешает preliminary lifecycle transitions needing later detail.
`/spec-design` требует удалить conflicting normative wording, но не stale
`later/unresolved` markers. `/spec-auto` допускает сохранение blockers в
произвольно выбранном canonical spec. При закрытии feature-level detail тот же
риск существует в `/feature-to-tasks`.

Исправление: state spec хранит только принятые states, transitions, guards,
recovery и их последствия. Interface names, serialization и contract backlog
остаются в owning contract/feature. Когда решение закрывает deferred detail,
`/spec-design`, `/spec-auto` или `/feature-to-tasks` удаляет obsolete marker из
непосредственно затронутых linked specs в том же run; глобальный speculative
scan не нужен.

### Временный runnability status в Architecture Spine

В `system-architecture.md` 12 из 13 `AD-* / Verification` содержат `not
currently runnable`. Stable proof target в этих строках полезен, но текущая
готовность реализации быстро устаревает и принадлежит feature/task planning и
verification evidence.

Причинная связь прямая: `/spec-design` требует `Verification:` и предлагает
`Record a required missing check as accepted work, not a runnable gate`.
`/spec-auto` наследует правила Architecture Spine. Наблюдаемая формулировка
точно соответствует этому разрешению.

Исправление: `AD-* / Verification` должен содержать только стабильный claim и
proof target; существующий project-native check можно указать ссылкой или
командой. Текущий implementation/runnability status запрещается. Если mechanism
ещё отсутствует, accepted work маршрутизируется в feature/task plan, а в
архитектуре остаётся проверяемое требование без несуществующего runnable gate.

### Дублирование Foundation Queue

`foundation.md#Foundation Queue` фактически верен, но дублирует authoritative
task index, FT-000 и plan. Раздел был добавлен с planning state в commit
`1386527f`, затем переписан в `done` в `9f5b3532`, то есть хранит изменяемый task
snapshot. Нормативный `Foundation Gate Task` в Gate Anchors при этом нужен и
должен остаться.

Наиболее очевидный источник совпадает с исходной закрытой проблемой:
`/foundation-to-tasks` меняет Foundation anchors и требует `Report queue
action, specs reused/extended/created, task IDs...` без указания output channel.

Исправление: отправить queue action и task list в final command response.
`foundation.md` обновлять только в принадлежащих ему Gate Anchors, принятом
Foundation decision, minimal path и durable evidence; не зеркалировать полный
queue inventory или текущие task statuses.

## Handoff для правки skills

Минимальный scope:

1. `/spec-design` — stable `Verification`, semantic ownership state/contract
   details и cleanup затронутых deferred markers.
2. `/spec-init` — glossary-only definitions и отсутствие design backlog в
   preliminary lifecycle artifacts.
3. `/spec-auto` — те же ownership/cleanup правила и точный blocker owner.
4. `/feature-to-tasks` — cleanup obsolete markers при закрытии
   `needed_before_tasks` detail.
5. `/mb-sync` и `/prd-to-features` — stable-purpose router annotations.
6. `/foundation-to-tasks` — explicit final response channel и запрет queue
   mirror в `foundation.md`.

После правок нужны install-sync assertions для deployed skills. Новый общий
artifact, registry, status model или workflow не требуется.
