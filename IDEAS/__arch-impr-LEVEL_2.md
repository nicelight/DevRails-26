# Agentic-first архитектура DevRails — второй слой

## Предпосылка

Второй слой предполагает, что KISS-версия уже реализована:

* current architecture отделена от accepted target;
* ownership и authority boundaries описываются в существующих canonical artifacts;
* capability slices используются как эвристика, а не обязательный pattern;
* target architecture наследуется последующими design skills;
* новые registries, task fields и workflow-сущности не создаются.

## Цель второго слоя

Сделать принятую архитектуру не только понятной на этапе design, но и устойчиво сохраняемой при планировании, реализации и проверке изменений.

Agent должен получать ровно ту часть архитектурного контекста, которая относится к текущей задаче, и не должен заново исследовать или переосмысливать уже принятые boundaries.

## 1. Architecture-aware handoff

Связанные с задачей ownership, public boundaries, forbidden bypasses и verification rules должны доходить до executor через существующие direct canonical links.

Архитектурные правила не копируются в feature и task без необходимости. Истина остаётся в owning canonical artifact, а task содержит только минимальный task-relevant маршрут к ней.

Главный критерий:

> Fresh agent должен понять архитектурное место изменения без broad repository scan.

## 2. Fresh-agent legibility

Agentic-first архитектура должна оцениваться не только по логической корректности, но и по тому, насколько легко новый агент способен определить:

* где находится owning module;
* кто владеет затронутым state или invariant;
* через какую boundary разрешено взаимодействие;
* какие обходы запрещены;
* каким способом проверить результат.

Если для ответа на эти вопросы требуется читать большую часть системы, архитектура или её документация недостаточно agent-legible.

## 3. Point-of-use boundary protection

Во время реализации агент должен замечать случаи, когда локальная задача фактически требует:

* изменения чужого write authority;
* обхода public boundary;
* создания нового cross-module contract;
* переноса orchestration между modules;
* появления второго source of truth;
* изменения принятого dependency direction.

Такое расширение не должно скрываться внутри implementation tactic. Оно возвращается к design owner как архитектурное изменение.

## 4. Architecture-aware verification

Успешный functional outcome не должен считаться достаточным, если он достигнут через нарушение принятой architecture boundary.

Применимые проверки должны учитывать не только результат, но и допустимый путь его достижения:

* state изменён правильным owner;
* соседний module использован через public boundary;
* не появился альтернативный command/write path;
* не создан скрытый второй источник истины;
* composition root не получил business responsibility.

Это остаётся task-scoped проверкой, а не полным architecture audit.

## 5. Selective mechanical enforcement

Документация и review остаются основным механизмом.

Стабильные и критичные architecture rules могут получать project-native mechanical checks, когда нарушение:

* повторяется;
* имеет высокий blast radius;
* связано с security или safety;
* дёшево и однозначно определяется.

Возможные кандидаты:

* запрещённые import directions;
* direct access к чужому storage;
* обход authorization boundary;
* business logic в composition root;
* несколько write paths для одного invariant;
* нарушение public contract.

DevRails не требует универсального architecture validator. Mechanical enforcement остаётся свойством конкретного target-проекта.

## 6. Reproducible proof path

Для runtime-sensitive проектов cheap proof path может включать не только build и test, но также минимальные условия воспроизводимости:

* известное начальное состояние;
* безопасный повторный запуск;
* наблюдаемый результат;
* отсутствие влияния предыдущих runs.

Это усиливается только там, где обычного Foundation smoke path недостаточно. Простые CLI, libraries и stateless applications не получают дополнительный runtime process.

## 7. Architecture drift propagation

Различие между current implementation и accepted target должно сохраняться на всём пути разработки.

Локальный drift может быть зафиксирован как evidence, если он не влияет на решение задачи.

Material drift, меняющий ownership, public boundary, source of truth или dependency direction, возвращает работу к architecture design и делает зависящее от него planning устаревшим через существующий Planning Revision.

Отдельная Architecture Revision или drift lifecycle не нужны.

## 8. Evidence-driven усиление

Второй слой не должен применяться одинаково ко всем проектам и задачам.

Дополнительное architecture wording, проверки или runtime mechanisms оправданы только при наблюдаемой проблеме:

* агент не находит место изменения;
* ownership трактуется неоднозначно;
* boundaries регулярно обходятся;
* verification пропускает архитектурно неверное решение;
* runtime result невозможно воспроизвести;
* current implementation ошибочно принимается за target architecture.

Local/simple flow должен оставаться практически неизменным.

## Критерий успеха

Второй слой успешен, если fresh agent способен:

1. быстро определить owning boundary;
2. получить только применимый architecture context;
3. реализовать изменение без нарушения чужого authority;
4. остановиться при material architecture expansion;
5. доказать не только outcome, но и допустимость пути его достижения;
6. отличить current implementation от accepted target.

При этом DevRails не получает новую task model, module registry, обязательный validator или дополнительный runtime workflow.
