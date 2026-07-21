# Agentic-first architecture — LEVEL 2

## Статус

Implemented in canonical runtime commands, deployed-surface regression checks,
and project documentation.

## Scope

Этот файл фиксирует реализованное усиление архитектурного runtime-контракта.

Уже реализованные direct task links, fresh-agent legibility, наследование
accepted architecture и invalidation через существующий `Planning Revision`
не входят в этот change set.

Цель этого слоя — не позволить реализации получить функциональный
`PASS`, если задача выполнена через нарушение применимой accepted architecture.

## 1. Point-of-use boundary protection в `/exe`

Когда direct task-linked specs задают ownership или module/slice boundaries,
`/exe` должен оценивать выбранную implementation tactic относительно этих
правил.

Архитектурным расширением считаются необходимость или фактическая попытка:

* изменить state вне принятого write owner;
* обойти public boundary или обратиться напрямую к чужому storage;
* создать альтернативный command/write path или второй source of truth;
* создать новый cross-module contract;
* изменить accepted dependency direction;
* перенести business orchestration в другой owner, transport handler, generic
  helper или composition root.

Если работа укладывается в accepted target, `/exe` продолжает обычное
task-scoped выполнение. Локальное расхождение current implementation с target,
не меняющее решение задачи, фиксируется как evidence.

Если выполнить задачу можно только изменив accepted ownership, public boundary,
source of truth, orchestration owner или dependency direction, `/exe` не
маскирует это как implementation tactic: он останавливается и использует
существующий handoff в `/spec-design`.

Проверка ограничена direct task links и фактическим change surface. Broad
repository architecture audit не требуется.

## 2. Architecture-aware `/verify`

Когда для задачи применимы linked architecture/boundary rules, функционального
outcome недостаточно для `VERDICT: PASS`. Verifier должен также подтвердить,
что результат достигнут разрешённым путём:

* state изменяет принятый owner;
* соседний module используется через public boundary;
* не появился альтернативный command/write path;
* не появился второй source of truth;
* composition root, transport handler или generic helper не получили business
  responsibility.

Это task-scoped проверка actual change surface и прямых canonical rules, а не
полный architecture audit.

Наблюдаемое нарушение применимой accepted rule является implementation
`FAIL`. Отсутствующая, противоречивая или неоднозначная canonical rule остаётся
`NEEDS-CLARIFICATION` с существующим design repair route.

## 3. Selective mechanical enforcement

Стабильная critical architecture rule может ссылаться на project-native check
через существующие `AD-* Verification`, task `gates` или
`verification_targets`, когда нарушение:

* повторяется или имеет высокий blast radius;
* связано с security/safety; либо
* дёшево и однозначно обнаруживается.

Возможные примеры: запрещённое import direction, direct access к чужому
storage, обход authorization boundary или business logic в composition root.

DevRails не создаёт универсальный architecture validator и не требует
mechanical check для каждой boundary.

## 4. Reproducible proof для runtime-sensitive задач

Если обычного Foundation smoke path недостаточно, owning spec или task
verification может требовать минимальный воспроизводимый flow:

* известное начальное состояние;
* безопасный повторный запуск;
* наблюдаемый результат;
* изоляцию или cleanup, исключающие влияние предыдущих runs.

Это применяется только при подтверждённом runtime/state risk. Простые CLI,
libraries и stateless applications не получают дополнительный runtime process.

## Ограничения реализации

Этот слой не добавляет новую command, task field, registry, status, verdict,
revision, validator или workflow step. Он уточняет существующие обязанности
`/exe`, `/verify`, design verification rules и task-scoped handoff.
