# Улучшение `/red-verify`

Статус: план для обсуждения. Не является разрешением менять runtime skill или
generated target files.

## Проблема

Reviewer-модель может превратить придуманную hostile hypothesis в finding, не
проверив практическую достижимость, материальность и стоимость требуемой защиты.
В результате `/red-verify` способен:

- считать privileged-порчу storage application defect;
- превращать unsupported internal misuse в production invariant;
- требовать дорогой hardening для редкого и восстановимого failure;
- искать findings ради полноты отчёта;
- использовать предыдущие agent-generated probes и regressions как источник
  новых requirements.

Проблема подтверждена прогонами TASK-040 и TASK-041 в проекте
`/home/serg/Projects/agro-intellect`.

В TASK-040 hostile probes против согласованно изменённых PostgreSQL rows
последовательно породили exact replay graph, дополнительные fingerprints,
advisory locks, широкую crash/race matrix и write-once trigger. В TASK-041
direct-DB probes против projection и retained graph породили новые validators и
permanent regressions для состояний, не создаваемых public API или штатным
application path.

Образовался цикл:

```text
hostile probe
  -> finding
  -> same-task repair
  -> permanent invariant/regression
  -> новая поверхность для hostile probe
```

`/autopilot` усиливал цикл: `semantic-fail` с `replan: no` разрешал
автоматический same-task retry вместо operator threat-model decision.

## Цель

Сохранить независимую adversarial-проверку, но отделить внутреннюю генерацию
гипотез от публикации workflow-значимых findings:

```text
hostile hypotheses
  -> внутренняя оценка
  -> admitted findings или необходимые operator questions
  -> semantic verdict
```

Ноль findings является нормальным результатом полноценной проверки.

## KISS-граница

- Не создавать новый protocol, artifact, schema, status, verdict или lifecycle.
- Не сохранять hypotheses, admission-оценки и отклонённые кандидаты.
- Не добавлять scorecards, finding registry или обязательную матрицу оценки.
- Использовать существующие report/protocol paths и handoff.
- Менять только инструкции и существующий red-verification template, если его
  текущая форма требует выводить внутренний brainstorming.

## Внутренняя admission-оценка

До включения finding или operator question в отчёт verifier внутренне проверяет:

1. какой принятый product outcome или обязательная граница нарушены;
2. достижим ли сценарий через supported production, internal, migration,
   concurrency или operational/recovery path;
3. каков материальный ущерб и насколько сценарий реалистичен;
4. достаточно ли retry, restart, rebuild, restore или maintenance;
5. пропорционален ли новый hardening вне accepted contract ожидаемому ущербу;
6. требует ли исправление нового product, architecture, storage, security или
   threat-model решения;
7. доказывает ли evidence production defect, а не только возможность вручную
   создать некорректное состояние.

Внутренний исход:

- `admit` — доказанное материальное нарушение принятого outcome;
- `operator-question` — без решения оператора нельзя определить допустимость
  доказанного реалистичного риска или достижение принятого outcome;
- `discard` — speculative, недостижимый, нематериальный кандидат или
  непропорциональный hardening вне accepted contract.

Эти внутренние исходы не записываются. В отчёт попадают только admitted
findings и необходимые operator questions.

## Requirement authority

- Task и direct task-linked accepted canonical specs остаются source of truth.
- Авторство artifact само по себе не создаёт и не отменяет authority.
- Непринятый agent-generated review, probe, test или recommendation не создаёт
  requirement.
- Если применимость canonical rule к текущему outcome или threat model
  неоднозначна, verifier возвращает `semantic-concern` и существующий
  operator/spec-repair route; он не выбирает трактовку и не запускает
  автоматический hardening.
- Принятое однозначное требование нельзя отбросить только из-за высокой
  стоимости repair: доказанное материальное нарушение остаётся
  `semantic-fail`, а изменение требования принадлежит оператору.

## Direct storage mutation

Direct DB/filesystem mutation может быть setup для reportable finding, только
если:

- состояние достижимо через supported application, migration, concurrency или
  accepted operational/recovery path; либо
- accepted threat model явно требует защиты от privileged storage tampering.

Иначе probe не доказывает application defect. Исключение возможно только для
катастрофического security/data-loss риска с доказанным реалистичным escalation
path; такой новый риск требует operator decision, а не автоматического repair.

## Verdict discipline

- Не задавать и не подразумевать целевое количество findings.
- Не искать дополнительный finding ради симметрии или полноты.
- Объединять findings с одной root cause.
- `semantic-fail` использовать только для доказанного материального нарушения
  принятого outcome.
- `semantic-concern` использовать только для реального operator-owned решения,
  без которого нельзя определить допустимость риска или closure.
- LOW, nit и необязательные improvement observations не выводить.
- `/red-verify` не повторяет обычный search scope `/verify`, но доказанный им
  material supported-path break принятого outcome остаётся reportable и не
  может завершиться `semantic-pass`.

Существующие verdict values, lifecycle/status ownership, T3 closure gate,
blockers, stop conditions и resume routes не менять.

## Search и stop discipline

- Независимость verifier означает независимость от claims Implementer-а, но не
  игнорирование deployment reality и accepted threat model.
- Ограничить search task outcome, фактическим change surface, затронутыми
  boundaries и наиболее тяжёлыми реалистичными failure modes.
- После достаточного покрытия остановиться, даже если findings нет.
- Не превращать probe автоматически в permanent regression.
- Не повторять историческую hostile matrix, если её сценарии больше не
  отображены на актуальный accepted contract.

## Report discipline

- Не выводить hypotheses, admission-разбор или отклонённые кандидаты.
- При `semantic-pass` не требовать findings, risks, counterproposal или список
  возможных улучшений.
- Кратко фиксировать достаточное покрытие, admitted findings, необходимые
  operator questions, evidence, verdict и существующий owner handoff.
- Не создавать новый report shape. Убрать обязанность заполнять секции,
  существующие только для записи внутреннего brainstorming; сохранить
  существующие evidence, verdict и owner handoff.

## План реализации

После отдельного одобрения реализации:

1. Обновить canonical
   `skills/_shared/references/commands/red-verify.md`.
2. Убрать finding bias из существующего
   `skills/_shared/references/protocols/red-verification-template.md`, не
   добавляя новый protocol или artifact.
3. Сохранить существующий resume contract: task-owned
   `.protocols/<TASK_ID>/red-verification.md` обновляется in place и не
   перезаписывается template.
4. Не менять `/autopilot`, tier policy или lifecycle contract, если обновлённая
   классификация уже однозначно маршрутизируется через существующие
   `semantic-pass|semantic-concern|semantic-fail`.

## Проверка будущего изменения

- canonical command и существующий protocol template содержат KISS-правила без
  новых outputs или workflow state;
- generated `.agents/skills/red-verify/SKILL.md` и
  `.claude/skills/red-verify/SKILL.md` корректны в изолированном target;
- deployed `.memory-bank/templates/protocols/red-verification-template.md`
  доступен runtime-агенту;
- существующий task-owned `red-verification.md` сохраняется при sync;
- source-only дерево не содержит generated `shared-*`;
- сохранены inputs, verdicts, lifecycle/status ownership, required gates,
  blockers, stop conditions и resume routes;
- сценарии дают ожидаемый результат:
  - ноль findings после достаточного покрытия → `semantic-pass`;
  - доказанный supported-path material defect → `semantic-fail`;
  - privileged storage corruption вне accepted threat model и без других
    admitted findings → `semantic-pass`;
  - unsupported internal misuse без production path и без других admitted
    findings → `semantic-pass`;
  - доказанный реалистичный риск, требующий нового owner decision →
    `semantic-concern`;
  - accepted canonical requirement остаётся обязательным независимо от
    авторства его текста.
