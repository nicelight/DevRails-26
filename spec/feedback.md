# Один feedback, решения и инспекция в движении

Владелец формы и attribution: Nav host. Владелец предметного смысла: assigned
model/main. Это единственная спецификация model feedback и pending decision;
[controller](controller.md) владеет admission, не интерпретацией prose.

## Минимальная граница модели

```ts
type Reply<Subject, CurrentDetail> = {
  feedback: {
    flow: 'continue' | 'needs_decision';
    message: string;
    detail?: CurrentDetail;
  };
  subject: Subject;
};
```

`Subject` — actual result/evidence выбранного задания, с существующим предметным
verdict vocabulary. Он не содержит launch/status/permission authority.
`continue` означает готовность результата к обычной обработке **текущего
контекста**, не PASS и не универсальную команду движения. Identity run/leg/
attempt/session и purpose ответа добавляет host, модель их не выбирает.

Обычной операции достаточно компактного feedback плюс её subject. Только при
конкретной потребности host даёт одну текущую detail shape и нужный контекст:
proposal, интерпретацию ответа пользователя либо задание инспекции. Нет 37 model
control tools, общего каталога repair-схем или обязательного отчёта на каждый
внутренний tool call. Достаточный первый ответ не требует второго уточнения.

Native children получают текущий envelope через `outputSchema`; DSH
`structured_output` обеспечивает validation/capture. Persistent root main
использует один scoped `nav_feedback` с тем же envelope, не child outputSchema.
Main capture принимается после authoritative successful `tools/result`,
привязывается к host assignment и вызывает `concludeTurn`. Это запрос завершить
turn после обработки уже queued steering, не гарантия новой turn boundary.
Неуспех tool result не фиксирует capture. Main использует штатный scoped native
tool executor: прямой `nav_feedback` не зависит от inherited PTC executor.
Capture и terminal guard ограничены assignment, не всей жизнью main или номером turn.
Main feedback не закрывает child participant: его terminal result принимает
только host по исходной native activation. Missing structured output/error не заменяется prose;
ошибка формы возвращается в ту же работу, без новой execution attempt.
Невозможность получить результат становится technical blocker, не бесконечным retry.

### Однозначный purpose main

Host хранит один active main assignment: ID, purpose, exact subject/detail shape
и resume reference. `nav_feedback` имеет стабильный внешний envelope; точная
текущая форма сообщается в logged prompt и проверяется host при execute.
Изменять tool registration/schema посреди выполняющегося model call не требуется.

Scoped `agent/pre-step` после `next()` связывает допущенный step с assignment
по host-owned message ID/source; rejected step assignment не активирует.
Если batch содержит H steering, новый purpose — inspection request; прежний
незавершённый semantic assignment сохраняется для продолжения. Текущая detail
shape добавляется к admitted messages. Уже начатый step сохраняет старый purpose:
сам click/постановка steer в inbox его не меняет. Capture на execute замораживает
эту привязку вместе с execution token; successful `tools/result` принимает
именно её, даже если current run уже изменился. Guard не допускает второй capture
того же assignment. У нового assignment новый capture, даже внутри того же turn.

Одновременно обрабатывается один H request; повторный click возвращает текущий
request до его результата/ошибки. Это не очередь инспекций и не stack main задач.
После consultation host передаёт результат через native followup с назначением
его интерпретации и сохранённым resume reference. Завершённый прежний assignment
не исполняется повторно; незавершённый продолжается с actual facts. Pending user
input сохраняет native origin и отдельно интерпретируется для актуального request.

## Предложение и разрешение

`needs_decision` основной операции удерживает основной путь. Если деталей ещё
недостаточно, main получает текущие facts, допустимых owners и resume point.
Ситуационная форма proposal содержит `question`, конкретный `action`, `scope`,
optional `target` command и `missingFacts`. Без target это консультация у текущего
owner. Host не выбирает маршрут по ключевым словам message.

Готовое предложение создаёт один pending request: host ID, origin operation,
proposal и resume reference. В native main chat виден вопрос/action; карта
показывает red, а для reroute — предложенный tunnel до consent. Tool/model call
не висит до человеческого ответа. Замена proposal получает новый request ID.

Green и явное согласие в main chat разрешают **тот же текущий request** один раз.
Green работает только при отсутствии missing facts. Для chat main получает
actual новое user message и текущий request; временный detail возвращает
`requestId`, `answer: approve|reject|discuss`, `reason`. Host проверяет реальное
происхождение consumed user input из main, порядок и актуальность request.
При появлении более нового необработанного main user input commit ждёт его
интерпретации. Модель оценивает смысл согласия; код — attribution и свежесть.

Неоднозначное/условное согласие, вопрос и facts-only ответ не разрешают новый
маршрут. Reject снимает proposal, но не придумывает новый путь. Side/assistant/
plugin text не user consent. Ранее принятое разрешение того же bounded action
переиспользуется. Решение сохраняет source `user` с origin green/main-chat и
reference либо `autonomous`; затем admission всё равно проверяет manual holds.
Autonomous принимает semantic choice без user-wait, но не создаёт неизвестные
факты, permissions или право снять ручную остановку.

Actual negative/unresolved material candidate требует scoped disposition даже
при ошибочном `flow: continue`. Предметный verdict сохраняется независимо от
решения продолжать или исправлять; формат записи принадлежит
[evidence](evidence.md).

## H во время текущего leg

Нажатие H — уже явный запрос ограниченной инспекции, не предложение ещё раз
спросить разрешение. Host сохраняет контекст этого запроса с текущим run/leg,
выбранной ранее Judge configuration и user origin. Это обычная correlation
запроса и native activation, не второй decision engine или отдельный workflow.

1. Host направляет main prompt «обратись сейчас к судье для инспекции своих
   действий» через native `agent.steer(UserMessage)`. Running main увидит его
   на ближайшей step boundary; idle main начнёт turn. Текущий HTTP/tool call
   не прерывается. Работа selected children и station accounting продолжаются.
2. Main получает краткий current Nav context и только detail для инспекции:
   `question`, `scope`, `contextRefs`. Он формулирует задание Judge тем же
   `nav_feedback`. Host-bound purpose этого capture — inspection request,
   а не terminal feedback текущего leg. При нехватке контекста уточняется
   именно задание; обычный pending user approval не создаётся.
3. После успешного capture host запускает native read-only Judge по сохранённой
   Judge configuration. Main не вызывает spawn. Три UI slots — варианты выбора,
   не обязательные три agents. Дополнительный green не требуется.
4. Judge result принимается по identity этой консультации и передаётся main
   и пользователю в native main chat. Он не закрывает participant активного
   leg, не меняет его subject и не вызывает ordinary-next. Продолжение main
   использует assignment binding выше, а не предположение о новом turn.
5. Если инспекция предлагает новый маршрут/repair, main создаёт обычный pending
   proposal; в autonomous решает по общей policy. До этого leg не переписывается.
   Уже admitted работа не откатывается; hold запрещает следующий admission.

Steer — best effort delivery до ближайшей допустимой границы, не обещание
мгновенной реакции: cancellation может удалить pending steering. Host показывает
неполученный/прерванный запрос честно, не рисует состоявшийся Judge result.
Nav Stop охватывает эту owned consultation; независимый Side остаётся отдельно.

Native основание: [steer](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/agent/src/runtime-types.ts#L253-L260),
[structured capture](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/subagent/subagent/src/structured.ts#L74-L146),
[concludeTurn](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/tools/src/contracts.ts#L243-L260),
[pre-step и queued steering](https://github.com/deepseek-ai/deepseek-harness/blob/ce7073d51254c26cd63b22a60835b8f948deb447/packages/core/agent/src/runtime-types.ts#L334-L417).

## Приёмка

1. Continue + subject FAIL сохраняет FAIL и требует disposition; prose без
   authoritative capture не завершает работу. Неуспех tools/result не даёт launch.
2. Green и main-chat «да» на один request дают один переход; stale ID, Side «да»,
   условное согласие и новое противоречащее main сообщение не дают разрешения.
3. Needs_decision получает только актуальную detail shape. Autonomous сохраняет
   своё provenance; Pause остаётся, даже если semantic decision принят.
4. H во время running main доставляется на ближайшей step boundary; H при idle
   main и active child будит main сразу. Host запускает Judge без station wait
   и второго green, а текущий leg сохраняет snapshot и participant accounting.
5. Judge `continue` не завершает leg; route recommendation становится общим
   proposal. После Stop поздний Judge result не возобновляет workflow.
6. H нажат после старта model call: его поздний capture остаётся ответом старого
   assignment; inspection purpose начинается только со step, принявшего H.
   Queued H после `concludeTurn` обрабатывается и внутри того же native turn.
