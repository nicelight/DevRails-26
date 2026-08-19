# Volatile snapshots в root router

Статус: расследование завершено, framework ещё не исправлен.

В `face_moment/.memory-bank/index.md` аннотация ссылки на
`spec-backbone.md` используется как копия текущего design state. Сейчас в ней
остались `accepted complete` и конкретный `Planning Revision 4`. Ранее эта же
строка содержала `blocked until /spec-design`, `current Foundation handoff`,
`feature blockers` и `verified Foundation handoff`. После частичной очистки
слова про blockers и handoff были удалены, но сам volatile-паттерн сохранился.

Git history подтверждает систематическое поведение. Аннотация последовательно
менялась вместе с backbone из Revision 2 в 3, затем в Revision 0 с blocker,
снова в Revision 2 с Foundation handoff и далее в Revision 3 и 4. Foundation
запуски аналогично переписывали соседние router entries из `pending` в
`concrete`, затем в `verified`. Агент воспринимает root router не только как
карту документов, но и как кэшированный dashboard их текущего состояния. Это
создаёт churn и stale assertions, хотя authoritative state уже находится в
самих linked artifacts.

Проблема отличается от закрытой неоднозначности chat handoff в
`/spec-design`. Здесь нет смешения output channels. Не определена projection
boundary для router annotation. MBB требует лишь короткие `annotated links`.
`/prd-to-features` владеет созданием product map и также требует только
`annotated links`. `/mb-sync` владеет reconciliation root/subfolder routers и
требует их согласия с authoritative state. В совокупности это подсказывает
агенту копировать в описание ссылки текущую revision, status, blockers и
handoff как способ сделать router «актуальным».

Основной системный распространитель pollution — `/mb-sync` и его runtime
workflow. `/prd-to-features` задаёт исходную форму root index. `/spec-design`
меняет authoritative backbone и тем самым создаёт повод для reconciliation,
но его контракт не требует обновлять root index; правка только этого skill не
закроет проблему. `/mb-garden` pollution не создаёт, однако текущий контракт не
позволяет уверенно классифицировать фактически верный, но volatile snapshot как
router defect. История commit связывает отдельные мутации с design и Foundation
runs, но не доказывает, какой внутренний command физически записал каждую
строку. Уверенность высокая в системной причине и средняя в атрибуции
конкретного запуска.

Нормативная граница должна быть общей: router annotation описывает только
устойчивые purpose, scope или owner linked artifact. Она может назвать тип
хранимого state, например `Planning Revision`, но не копирует его текущее
значение, lifecycle/status, blockers, task или queue inventory и активный
handoff. За текущим состоянием агент переходит в owning artifact. Поэтому в
текущей строке `explicit Foundation decision` допустимо как постоянная часть
backbone contract, а `accepted complete` и `Planning Revision 4` недопустимы
как значения текущего запуска.

Исправление следует закрепить в canonical MBB одновременно в
`skills/_shared/references/structure-template.md` и generated skeleton в
`skills/_shared/scripts/init-mb.js`. Тот же boundary должен появиться в Index
checklist `skills/_shared/references/workflows/mb-sync.md` и в required output
`skills/_shared/references/commands/prd-to-features.md`. `/mb-sync` leaf уже
загружает runtime workflow, поэтому отдельное повторение полного правила в нём
не требуется. `/mb-garden` должен считать volatile router snapshot automatic
finding только когда стабильное назначение ссылки однозначно следует из
linked artifact или canonical template; иначе он сообщает blocker без
семантической правки.

Для защиты от подтверждённого повторения достаточно узкой механической
проверки: `mb-lint` предупреждает о `Planning Revision <N>` в root router.
Широкий regex по словам `current`, `complete` или `verified` не подходит из-за
ложных срабатываний; остальные semantic snapshots защищаются нормативным
router contract. Install-sync regression должен подтвердить, что правило
доступно в generated MBB, deployed `/mb-sync` workflow и обеих runtime
поверхностях затронутых command skills. Новые artifacts, lifecycle, status
model или registry для исправления не нужны.
