# Main, Side и карта как проекция

Владелец native sessions/истории — DSH; Nav владеет bindings и scene projection.
Цель — видеть и обсуждать процесс, не превращая каждый UI элемент в отдельный
workflow или копию native чата.

## Main и узкий client adapter

Main остаётся в штатном DSH chat. Клик по машинисту открывает его session через
маленький dynamic native addon и `uiWorkspace.openSession`. Plugin-owned link
передаёт session ID в native root, addon проверяет его и убирает навигационный
fragment; это не обещание существующего upstream deep-link API.

Pending question/action из [feedback](feedback.md) читается в обычном native
`nav_feedback` tool output; ответ пользователя обрабатывается в main conversation.
Workflow controls, включая Nav Stop, находятся на карте; native DSH Stop сохраняет
свой обычный session смысл. Addon отвечает только за navigation, без второго
composer, permission UI или журнала. Открытие main не создаёт fork и не останавливает
работу. При cold resume guards устанавливаются до первого turn независимо от
того, открыта ли карта.

## Side во время движения

Клик по корпусу создаёт независимую root DSH session, read-only, без lifecycle/
control/feedback tools. Это fork контекста, не owned child основного run.

Host берёт согласованный committed prefix main log с inclusive sequence и
строит native fork seed; незаписанные streaming куски не включаются. Seed
закрывает незавершённый tail только в копии. Source session не изменяется и не
ждёт станции/completed turn. При пустой истории достаточно Nav summary.
До publication Side получает собственный preset/guards и явно выбранную model
route: у inherited seed model selection может быть сильнее agentOptions fallback.
Attach к project workspace и сохранение binding завершают создание; ошибку
создания host компенсирует освобождением ещё неучтённого handle.

При каждом Side вопросе добавляется актуальная краткая Nav summary и ссылки на
Memory Bank; дальнейшие main turns автоматически в Side не копируются. Такая
осведомлённость достаточна для консультации и честно ограничена моментом fork
и последующими чтениями. Side ответ и Side user message не разрешают действия main.

Marker сохраняет session ID и world-space anchor ниже места создания поезда.
Он живёт до DEL; main Stop/reroute/completion не удаляют Side. DEL выполняет
native archive с остановкой Side activity, затем удаляет binding/marker.
Если archive не подтверждён, marker остаётся с ошибкой; crash между archive и
удалением binding сверяется при recovery. Native archive сохраняет историю,
физическое уничтожение logs не обещается. Expanded chat использует native
session history/streams/composer/Stop, а не собственный transcript storage.

## Typed UI boundary

Nav предоставляет небольшой typed Remote: открыть current project/run,
наблюдать replacement snapshots, отправить control/decision/settings change,
создать/архивировать mapped Side и запросить H-инспекцию. Это действия тех же
host contracts, не новая семантика или универсальный command bus.

Mutations несут current run/revision, а approval — pending request ID.
Settings дополнительно проверяют settings revision. Неверный ID/revision,
недопустимая станция или недоступная модель возвращают причину и current view
без частичной записи. После неоднозначного ответа/reconnect UI получает fresh
snapshot перед повторным действием; неизвестное состояние закрывает mutating
controls. Повторное открытие проекта не создаёт main повторно. Native session
model catalog, prompt/history/control и context projections используются прямо
из DSH Remote, не переопределяются Nav.

## Сцена и отображаемые факты

Svelte stores получают host snapshot; scene строит stations/edges/train/loops/
reviewers/tunnels/Judge/Side. Layout и анимация не пишут lifecycle. Событие «поезд
доехал» никогда не допускает работу; движение отражает уже принятое host действие.
Reconnect восстанавливает позицию без replay всей анимации.

Основной маршрут слева направо. Fit показывает всю карту; pan и semantic zoom
имеют overview/tactical/detail: на overview скрыты labels/settings, затем
раскрываются детали. Play/Pause/Stop остаются читаемыми вне масштабируемой SVG
сцены. Expanded HTML Side chat сохраняет экранный размер текста.

Implementation loop возвращается ко входу в реализацию **той же task**;
selected reviewers видны параллельно. Proposed reroute рисует tunnel/red до
consent, разрешённое движение — после host admission. Consultation без смены
маршрута не выдумывает tunnel. Skipped визуально отличается от success;
partial/error и отсутствие functional proof не изображаются как PASS.

Пять цветов машиниста (голубой, оранжевый, фиолетовый, белый, чёрный) отделены
от подписи модели. База H содержит три настраиваемых Judge slots, не три
постоянно работающих agents. Полёт означает фактическую consultation;
ожидание delivery запроса не выдаётся за запущенную инспекцию.

Груз train/helicopter и Side meter — собственная native context occupancy,
приближённо `(projectedTokens ?? pressureTokens) / contextWindow`, не сумма
agents или процент готовности. Нет данных — неизвестное значение. Счётчик
compaction считает unique успешные `compactionId` этой session; failed/prune
не учитываются, ноль скрыт. Side не наследует счётчик compactions скопированного
prefix. Точная геометрия/пороги zoom согласуются отдельно до оформления;
проверки семантики не зависят от pixel coordinates.

## Приёмка

1. Driver click открывает native main; pending request читаем в chat, ответ
   попадает в тот же decision reducer. Закрытая карта не отключает guards.
2. Side создаётся во время active main/child без остановки; seed соответствует
   committed cut, выбранная Side model не заменяется inherited main model.
   Side не пишет проект, не spawn-ит работу и не даёт main consent.
3. Несколько Side переживают main Stop/reroute; DEL архивирует только выбранный
   Side и удаляет его marker. После crash archive/binding согласуются.
4. Reconnect/stale UI не повторяют launch/approval; snapshot восстанавливает
   сцену. Анимация, fit/zoom и перемещение камеры не меняют state.
5. All-off/candidate-only/error показываются честно; meter относится к нужной
   session, failed compaction не увеличивает count. Overview помещает карту,
   controls и открытый чат остаются читаемы.
