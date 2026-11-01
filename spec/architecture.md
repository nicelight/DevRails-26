# Подключаемая композиция и граница DSH

Владелец: Nav host plugin. Задача — доставить canonical DevRails contracts и
исполнить их через native DSH, сохранив разделение механики и предметной работы.

## Состав и причина выбора

Один внешний bundle содержит host controller, read-only command resources,
standalone Svelte 5/SVG страницу `/nav27/` и маленькое native client дополнение.
Host загружается штатным Cordis Loader/plugin manager; addon объявляет
`dsh.client` для dynamic delivery. Пакет сам собирает assets и Typert Remote
descriptors. DSH core, hardcoded web entry и upstream build roster не меняются.
Так plugin-only означает проверяемый способ поставки, а не только имя каталога.

```text
Svelte карта/settings/Side ── native Connection/Gateway + typed RPC ── Nav host
Native main chat ─────────── scoped nav_feedback ──────────────────────┤
                                                                    ├─ DSH agents/spawn
                                                                    └─ Memory Bank/tasks
```

| Владелец | Обязанность |
| --- | --- |
| DSH | Provider/model calls, agent loop, tools/permissions, sessions/logs, compaction, HTTP/WS transport. |
| Nav host | Admission, selected configuration, scheduling, handles, budgets, lifecycle/evidence writes, recovery. |
| Main model | Предметная интерпретация, proposals/decisions, формулировка заданий консультации. |
| Assigned child | Bounded subject work и результат; не запуск следующей операции. |
| UI | Команда пользователя и проекция host state; не локальный workflow engine. |

Main имеет read/context/feedback capabilities; он не пишет проект или task
lifecycle и не запускает агентов напрямую. Исполнитель получает нужные для
задания capabilities, reviewer/Judge/Side — read-only. Composition и guards
применяются до publication и заново при cold resume; prompt сам по себе не
является запретом инструментов. Native restrictions плюс scoped guards
охватывают также inherited tools. Direct file tools защищают host-owned paths;
executor shell использует штатные DSH sandbox/permissions и протокольный запрет
записи task/run metadata. Path-level запрет внутри writable project для произвольного
shell не гарантируется; отдельного Nav sandbox/parser нет. DSH permissions продолжают действовать.

## Доставка предметных контрактов

Bundle собирает canonical `skills/_shared/` через существующее resource mapping
[installer](../scripts/install-framework.mjs), без отдельно поддерживаемых копий
37 prompts. Команда получает exact contract, необходимые references и target
inputs; local resource paths разрешаются внутри bundle, `.memory-bank/` —
в целевом проекте. Missing required resource блокирует admission с конкретным
locator. Runtime не зависит от checkout DevRails и от угадывания skill моделью.
Bootstrap/sync использует existing generator; legacy `.agents/.claude` installer
сам по себе DSH adapter не образует.

Operation mapping связывает существующий command ID с owner, handler family,
required inputs, subject output и ordinary handoff. Достаточны общие families:
bootstrap/context, product/planning, implementation, review/diagnostics,
maintenance. Их содержание и альтернативы берутся из
[TRANSITIONS](../docs/nav27/TRANSITIONS.md); новая модель статусов не вводится.
Детерминированный обычный переход не требует отдельного main LLM call.

## Native execution и transport

Host создаёт/resume root main, а для selected work вызывает native
`subagents.startActivation` с `provider: spawn`, `delivery: caller`, preset,
замороженными model options и текущим `outputSchema`. LLM provider/model
задаются в agent options; `spawn` не имя LLM provider. Host принимает результат
по identity запуска и освобождает activation в `finally`, включая error.
Main/Side handles живут до закрытия их owner, не до конца каждого turn.

Страница использует native Connection/Gateway, generated typed Remote и native
session streams. Новый REST/OpenAPI слой, ручные WS frames и второй reconnect
protocol не нужны. Nav index/data проходят `connection.admit`; регистрация
web route сама по себе auth не даёт. Вход выполняется через native root DSH
с token-to-cookie обменом, далее тот же origin/mount/cookie. Root-relative API
resolution сохраняется и за proxy prefix; credentials не копируются в UI store.

Source seams закреплены в [исследовании DSH](../docs/nav27/ARCHITECTURE.md#2-проверенные-dsh-seams):
create/setup/resume, spawn/structured capture, guards, dynamic client modules,
Connection/Gateway и package-mode Typert generator. Это основание выбранной
композиции, не обещание уже работающих integration tests.

## Приёмка

1. В чистый DSH установлен внешний bundle без изменения core и пересборки DSH;
   загружены host, standalone page и dynamic addon. Source checkout DevRails
   отсутствует; required command references доступны из пакета.
2. Main/child/Judge работают через native DSH с выбранными provider/model/effort;
   недоступная конфигурация даёт явную ошибку, без silent fallback. Main и
   resumed main не могут записать lifecycle или напрямую spawn child.
3. Authenticated root и proxy mount открывают Nav/RPC/streams; неавторизованный
   доступ к project data отклоняется native admission. Reconnect восстанавливает
   current snapshot, не создаёт второй run.
4. Representative normal/repair/consultation routes из каталога используют
   общие handlers и правильного owner; disabled operations не запускают модель
   и не требуют отсутствующих optional references/reports.
