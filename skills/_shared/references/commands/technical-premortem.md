---
name: technical-premortem
description: >
  Опциональный read-only pre-mortem запланированного технического изменения.
  Представляет изменение уже провалившимся, восстанавливает blast radius,
  отделяет Tiger от Paper Tiger и Elephant и возвращает проверяемые условия
  безопасного продолжения до реализации.
---

# /technical-premortem — Technical pre-mortem

<objective>
Провести bounded pre-mortem конкретного запланированного изменения до его
реализации. Это не общий risk review: считай, что изменение уже внедрено и
привело к провалу, затем работай назад от наблюдаемого сбоя к механизму,
blast radius и условиям, которые могли бы предотвратить этот исход.

Skill advisory и read-only. Он не является workflow gate, не заменяет
`/review-feat-plan`, `/review-tasks-plan`, `/verify`, `/red-verify` или
`/mb-doctor` и не меняет task lifecycle, approvals, ownership или durable
artifacts.

Finding не создаёт requirement и не расширяет accepted target. Если нужная
mitigation меняет product behavior, design, task boundary, tier или proof
contract, направь её существующему owning workflow.
</objective>

<input_contract>
Expected `$ARGUMENTS`: один `TASK-NNN-TN-FT-NNN-WN` либо однозначно названный
implementation plan или planned change. Без аргумента используй текущий
operator context только когда target однозначен.

Прочитай относящиеся к target task/plan, accepted specs, code, tests,
configuration, migrations и доступный operational context. Восстанови:

- что меняется: files, modules, behavior, data/schema/config и contracts;
- кто зависит: callers, consumers, jobs, integrations и operational owners;
- что разделяется: state, cache, sessions, queues, storage и environment;
- intended outcome, compatibility constraints, proof path и accepted limits.

Если material scope, intended behavior или authoritative target не
восстановимы, задай короткие точечные вопросы и остановись без verdict. Не
выдумывай структуру, потребителей, production conditions или требования.
</input_contract>

<failure_frame>
Представь, что изменение уже смёржено и, где применимо, задеплоено. Проверь
каждый относящийся к target путь провала:

1. **Само не сработало** — intended behavior не достигнут из-за логики,
   данных, edge case или неверного допущения.
2. **Сломало соседнее** — регрессировал consumer, contract, shared state или
   скрытая зависимость.
3. **Ухудшило, не сломавшись явно** — деградировали security, performance,
   reliability, operability, maintainability или architecture boundary.
4. **Сработало, но навредило позже** — harm проявился на реальных данных, под
   нагрузкой, при конкуренции, после deploy или rollback.

Не останавливайся на первом очевидном сценарии. Сначала найди конкретные
candidate failures по применимым путям и surfaces, затем отфильтруй их по
evidence, consequence и recoverability. Отклонённые speculative candidates в
ответ не включай.
</failure_frame>

<failure_surfaces>
Используй только относящиеся к target surfaces, но не пропускай применимые:

- correctness и historical/null/partial data;
- callers, contracts, integrations, versions и shared state;
- migrations, irreversible writes, queues, caches и rollback residue;
- security, permissions, secrets и trust boundaries;
- dependency failure, retries, timeouts, idempotency и concurrency;
- production scale, latency, memory, deployment order и config drift;
- observability: как оператор или тест узнает о конкретном сбое;
- architecture/maintainability: какой accepted owner, boundary или invariant
  будет нарушен;
- agent-execution error: где исполнитель может двусмысленно прочитать target,
  выдумать API, затронуть лишнее, нарушить accepted boundary или предъявить
  нерелевантное evidence.

Agent-execution surface проверяется всегда; finding публикуется только при
конкретном material механизме или decision-relevant blind spot.
</failure_surfaces>

<risk_model>
Классифицируй только findings, способные изменить решение или pre-flight:

- **🐅 `Tiger`** — подтверждённый material risk: evidence связывает конкретный
  mechanism с наблюдаемым symptom и affected surface. Игнорирование способно
  сорвать accepted outcome. Укажи urgency `merge_blocker`, `follow_up` или
  `observe`.
- **🐯 `Paper Tiger`** — сценарий выглядит опасно, но inspected evidence,
  ограниченный impact или дешёвая recoverability показывают, почему он не
  blocker. Включай его только когда явное понижение риска предотвращает
  ненужную сложность или влияет на verdict.
- **🐘 `Elephant`** — существенное допущение, blind spot или отсутствие
  evidence, на котором зависит решение. Назови, какое решение от него зависит,
  какой evidence отсутствует и кто может закрыть неизвестность.

Не требуется искусственно заполнять все категории или достигать заданного
числа scenarios. Отсутствующая категория — корректный результат.

Для `Tiger` укажи symptom, mechanism, affected surface, evidence/detection,
mitigation и проверяемый pre-flight check. Если material Tiger нельзя
обнаружить, отсутствие detection является отдельным Elephant. Для `Paper
Tiger` укажи mechanism и evidence понижения. Для `Elephant` укажи assumption,
dependent decision, missing evidence, evidence owner и resolving check.
</risk_model>

<verdict_contract>
- `GO` — нет `merge_blocker` и decision-critical Elephant; текущий target и
  evidence достаточны для обычного owning workflow.
- `GO_WITH_CONDITIONS` — продолжение безопасно только после перечисленных
  проверяемых условий с явными owners.
- `NO_GO` — evidence-backed Tiger или unresolved Elephant делает текущий
  approach materially unsafe либо не позволяет обоснованно решить, безопасен
  ли он. Назови существующий planning, design, decision или evidence owner.

Необратимость сама по себе не означает `NO_GO`, если она принята authoritative
target и имеет достаточные containment/recovery evidence. Advisory verdict не
меняет status и не отменяет verdict owning workflow.
</verdict_contract>

<required_outputs>
В final chat response верни:

1. краткую сводку target, blast radius, reversibility, counts по трём категориям
   и advisory verdict;
2. blast radius как `что меняется -> кто зависит -> что разделяется`;
3. компактный risk register только с material findings;
4. для каждого `merge_blocker` — symptom, mechanism, evidence/detection,
   mitigation и обязательный pre-flight check;
5. для каждого Elephant, влияющего на verdict, — dependent decision, missing
   evidence, owner и resolving check;
6. rollback/recovery route: конкретное действие, необратимый остаток и
   data/queue/cache последствия, если применимо;
7. pre-flight checklist только из проверяемых действий;
8. `GO | GO_WITH_CONDITIONS | NO_GO` и один immediate `Next step`.

Не создавай report artifact и не копируй handoff в durable project state.
</required_outputs>

<validation>
Перед ответом проверь, что:

- blast radius основан на прочитанном контексте, а неизвестное отмечено;
- рассмотрены все применимые failure paths и surfaces, включая agent-execution;
- каждый published finding имеет конкретный symptom или dependent decision и
  соответствует своей evidence category;
- каждый Tiger имеет mechanism и detection либо связанный Elephant;
- каждый Paper Tiger содержит evidence понижения, а не голое успокоение;
- каждый decision-relevant Elephant имеет evidence owner и resolving check;
- rollback/recovery не заявлен без проверяемого route;
- verdict согласован с blockers и conditions;
- mitigation не выдана за принятую authority вне current accepted target;
- не добавлены speculative risks, run history или changed-file report.
</validation>

<handoff_contract>
- `GO` для indexed task -> `Next step: /exe <TASK_ID>`; для другого target ->
  исходный owning implementation route.
- `GO_WITH_CONDITIONS` -> первый unresolved condition owner/action; после
  выполнения условий task-bound target возвращается к `/exe <TASK_ID>`, если
  plan и accepted boundary не изменились.
- `NO_GO` -> конкретный planning/design/decision/evidence owner и resume route;
  implementation не продолжать, lifecycle не менять.

Skill не вызывает следующую команду.
</handoff_contract>
