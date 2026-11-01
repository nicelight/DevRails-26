# Admission, станция и конфигурация

Владелец: один Nav controller на target project. Run — текущее прохождение
существующего workflow; leg — одна операция или её выбранная группа участников;
станция — принятие результатов всех участников leg, включая partial/error.
Эти понятия не добавляют task statuses.

## Один допуск

Все Nav controls, model feedback и native completions входят в один короткий
сериализованный reducer. Он проверяет текущие identities/revisions, сохраняет
решение и выдаёт host действие. Network/model await выполняется вне reducer;
результат возвращается отдельным событием исходного запуска. Поэтому Pause/Stop
не ждут завершения HTTP, а два окна не запускают один leg дважды.

Admission допустим, когда нет pending decision, manual hold, неразрешённого
blocker/permission, исчерпанного budget или незавершённой предшествующей работы.
Controller сверяет inputs/dependencies с existing registry и canonical contract.
Он фиксирует whole-leg snapshot, сохраняет prepared reference, затем запускает
назначенных участников. Host не выводит готовность из анимации или текста «готово».

Принятие результата означает: identity совпала, форма валидна, actual outcome
сохранён. Оно **не** означает success. Error, partial, blocked и needs_decision
закрывают ожидание соответствующего участника, сохраняя blocker/resume owner;
незапущенные выбранные peers также получают явный accounted outcome, если их
launch стал невозможен. Станция не возникает, пока результаты/причины отсутствия
всех selected peers не учтены. Interrupted работа не становится skipped.

При полном результате группы host применяет ordinary handoff либо
[decision flow](feedback.md). Без hold следующая операция допускается
автоматически; промежуточного окна редактирования нет. Обычное прохождение
станции и stopped-ready станция — разные условия UI, не новый task lifecycle.

## Настройки и whole-leg snapshot

Settings содержат enabled операции/участников/checks/reports и выбранные native
provider/model/reasoning для ролей. Snapshot включает весь leg, в том числе
selected peers, которых host запустит позже. Его выбор неизменен до результата
или reconciliation этой работы. Новый leg получает новый snapshot.

`/exe` с embedded local checks, `/verify` и `/red-verify` — отдельные legs.
Task-related selection хранится в existing `task.verify`; run ссылается на неё,
а model routes/launch options удерживает как конфигурацию admitted leg.
Settings меняются только в initial ready или stopped-ready после принятия всех
результатов leg. Host отклоняет edit в движении даже от устаревшего UI.

На остановке после exe разрешено изменить **будущие незапущенные** verify/red
в той же attempt. Toggle не требует отдельного approval, повторного exe или
новой attempt; green нужен для отправления. Started/skipped/interrupted work,
closed attempts и actual FAIL сохраняются. Local checks default-on и red-alone
остаются изменяемыми defaults, а не новым обязательным gate.

Save требует expected settings revision, доступных model/effort и допустимой
станции. Успех сохраняет итоговые settings и новую revision; конфликт возвращает
current value, не применяя часть patch. UI не переотправляет stale edit молча.
Не вводятся отдельные task-engine или переоценка исторических verdicts по live settings.

## Управление движением

| Команда | Эффект |
| --- | --- |
| Play | Снять Pause/Stop latch и выполнить reconciliation/admission; pending decision и отдельный red не снимаются. |
| Pause / red в движении | Завершить текущий admitted leg и остановиться после следующей станции. Current participants не отменяются. |
| Green | Разрешить указанный pending request либо снять указанный red/станционный Pause; остальные holds сохраняются. При допустимом отправлении фиксируется весь следующий leg. |
| Nav Stop | Сначала сохранить stop hold, затем best-effort cancel/dispose owned main и work/Judge handles, убрать только ожидающие Nav prompts. Не останавливать независимые Side. |

Stop не является ready станцией: до редактирования и нового допуска host
сверяет actual outcomes/partial effects. Отмена не обещает rollback или атомарную
остановку всех tool calls. Late result сохраняется по старому operation ID и
не продвигает новый маршрут. Native DSH Stop отменяет turn своей session;
workflow hold создаётся Nav controls, а не перехватом всех native кнопок.

Side и явно запрошенная H-инспекция доступны в движении по отдельным границам
[sessions](sessions-ui.md) и [feedback](feedback.md). Они не меняют snapshot
текущего leg. Nav ограничивает свои model controls; native выбор модели
сохраняет штатный смысл для следующего native запроса.

## Приёмка

1. Два selected reviewers запускаются последовательно. Между их запуском edit
   отклонён; оба используют snapshot зелёного, а не live настройки.
2. Red во время exe дожидается всех результатов; stopped-ready позволяет
   отключить будущий verify в той же attempt. Green продолжает без повторного
   exe; all-off фиксируется как skipped. Без red edit window не появляется.
3. Один peer вернул partial, другой error. Станция отражает оба outcomes и
   blocker/owner, не synthetic complete; следующий leg не проходит gate.
4. Stop во время tool call быстро сохраняет hold, запрашивает отмену и сохраняет
   поздние эффекты. Editing закрыт до reconciliation; native session Stop
   отдельно не выдаётся за глобальный workflow Stop.
5. Повторный/stale control и completion старой operation не запускают новый
   leg. Autonomous не отменяет Pause/red/Stop или реальные restrictions.
