# Durable evidence и продолжение фактической работы

Владелец записи: Nav host. Цель — продолжение после потери session/процесса без
повторной реализации уже сделанного и без превращения отсутствующей проверки
в PASS. Выбран existing Memory Bank, поскольку второй task store потребовал бы
синхронизации двух источников lifecycle.

## Владение данными

| Данные | Единственный canonical owner |
| --- | --- |
| Task identity, dependencies, status, attempts, selected work/results | Indexed task JSON в `.memory-bank/tasks/`; форма [tier policy](../skills/_shared/references/workflows/tier-policy.md#selected-work-and-retained-results). |
| PRD/spec/feature decisions, outputs, evidence artifacts | Existing предметный owner/locator команды. |
| Current run position, holds, settings, session bindings | Один `.memory-bank/nav27/run.json`, host controller. |
| Model/tool transcript, native session events | DSH session log. |

Run record содержит version/run identity и revision, main session, current
operation/resume reference, admitted leg selection/config reference, native
participant bindings, holds, pending decision, blocker с owner, bounded return
point, current main assignment/H correlation и resume reference, settings, Side bindings/anchors и ссылки на принятые
нетасковые boundaries/решения. Он хранит достаточно фактов для recovery,
но не копирует task results, полные reports или transcript. Активные handles,
promises и token streams существуют только в памяти. Pending shape принадлежит
[feedback](feedback.md), selection/admission — [controller](controller.md).

Один host writer владеет target; второй concurrent writer отклоняется, а не
создаёт второй run. Same project reopen возвращает существующий run. Это не
распределённый scheduler. Изменения файлов сохраняются temp + rename; сначала
subject evidence у его owner, затем run position. Межфайловой транзакции нет:
recovery сверяет actual evidence, поэтому stale position безопасно догоняется.
Prepared reference сохраняется до launch, но не считается доказательством effect.

## Принятие результата и closure

Host валидирует subject по active assignment и сохраняет результаты existing
`task.verify`, `stage: workflow`, со стабильной attempt и selected work.
План будущей работы не evidence. Незавершённый result отсутствует; interrupted
не skipped. Модель рекомендует closure/blocker, а host пишет task status только
после применимых gates и actual completion.

All verify off фиксирует `verification: skipped` без отчёта и PASS. Аналогично
отключённый red/local check фиксирует собственное отсутствие. Candidate-only
review сохраняет candidates, не functional PASS и не hidden main verification.
Red-alone сохраняет semantic verdict с честным отсутствием functional proof.
Inline evidence достаточно, если protocol/report не выбран. `done` может означать
implemented без verification; `done_for_prod` сохраняет production remainder,
не доказывая и не разрешая production action.

Actual FAIL/REJECT/semantic failure и material unresolved candidate неизменны.
Перед continuation/closure требуется scoped `disposition` по canonical форме:
`decision: continue|repair`, `source: user|autonomous`, конкретная `reason`.
Toggle не удаляет отрицательный результат. Успешный repair относится к новой
исправленной поверхности, не переписывает прошлый FAIL. Новая execution attempt
начинается только при действительно новом исполнении; debug, уточнение формы,
semantic consultation и resume прежнего work не расходуют execution attempts.
Host считает завершённые неуспешные attempts по existing budget policy.

## Actual-state recovery

При восстановлении host сначала загружает run и task records, восстанавливает
holds/pending до новых launches и заново применяет role composition к native
sessions. Если main session недоступна, новая main получает Memory Bank context,
незавершённого owner и evidence references; точный сетевой запрос не повторяется.

Затем host сопоставляет position с actual task/artifacts/native results:

| Наблюдение | Продолжение |
| --- | --- |
| Evidence/task уже дальше checkpoint | Догнать run position, не повторять completed exe/verify/report. |
| Prepared и подтверждено отсутствие effect | Launch при сохранившемся разрешении. |
| Interrupted/partial work | Осмотр actual effects и продолжение той же attempt с retained snapshot. |
| Неоднозначный unsafe/non-idempotent effect | Blocker с evidence owner; никакого blind replay. |
| Skipped operation | Сохранить skip; новые live settings не включают её задним числом. |
| Task закрыта, selected boundary work остаётся | Продолжить только незавершённый wave/feature/maintenance owner. |

Stranded `in_progress` сверяются до выбора новой task. Если нет runnable work,
сохраняется конкретная причина: completion, missing decision, blocked dependency,
failure budget либо реальный deadlock. Не каждый halt называется deadlock.
Semantic конфликт разрешает main через общий feedback; checkpoint не имеет
права переопределить факты. Existing task/run terminal vocabularies сохраняются.

Late result после Stop/reroute удерживается по исходному operation/attempt,
не продвигает текущий маршрут. Идемпотентно принимается одно решение/результат
по его identity; exactly-once произвольных внешних model effects не обещается.

## Приёмка

1. Exe complete + all checks off закрывается с skipped и без PASS/report;
   существующий doctor принимает record. Main-off candidate-only и red-alone
   сохраняют свои разные виды evidence.
2. После actual FAIL пользователь отключил будущую проверку: FAIL остаётся,
   closure без scoped disposition не проходит. Debug не создаёт новую attempt.
3. Crash после записи task result, но до run position: recovery использует
   результат и не повторяет exe. Partial и ambiguous effect не превращаются
   в complete или автоматический replay.
4. Потеря main session сохраняет manual holds, pending и selected work; новая
   session продолжает первый фактически unfinished owner. Skipped не запускается,
   closed task не скрывает оставшийся selected feature boundary.
