# Handoff: оптимизация TDD workflow для T2/T3

## Контекст

Текущий TDD-контракт смешивает execution evidence с lifecycle-маршрутизацией:
pre-GREEN получил отдельный handoff, `/verify` местами ожидает именно новую
реализацию, а retry связывает verdict одного gate с прохождением всей цепочки.
Из-за этого обычный случай «outcome уже реализован» становится особым workflow
и расходится с общей моделью `/exe -> /verify`.

## Предлагаемая модель

RED/GREEN остаётся доказательством внутри `/exe`, но не образует отдельную ветку
lifecycle:

```text
/exe
  -> task: in_progress
  -> для каждого claim:
       RED -> implementation -> GREEN
       pre-GREEN -> production changes для claim не требуются
       N/A -> alternative proof
  -> завершение остального принятого task outcome, если оно осталось
  -> единый /exe handoff
  -> /verify

/verify
  -> независимая проверка текущего outcome
  -> PASS | FAIL | NEEDS-CLARIFICATION
```

Такой маршрут одинаково применим в ручном и автоматическом режиме. Наличие или
отсутствие production changes не меняет владельцев lifecycle, порядок gates или
resume route.

## Распределение ответственности

### Planning

Planning сохраняет существующую привязку claim к planned probe либо явному
`N/A` с alternative proof. Новые planning stages, статусы и protocol fields для
pre-GREEN не предполагаются.

### `/exe`

Переход `ready -> in_progress` естественно располагается до первого probe, чтобы
все варианты выполнения использовали один lifecycle route.

Initial RED фиксирует исходное состояние claim. Если probe сразу проходит,
pre-GREEN служит evidence того, что ожидаемый outcome уже существует, и
production changes для этого claim не требуются. Pre-GREEN не отменяет
оставшуюся часть принятого task outcome. После её выполнения RED, pre-GREEN и
`N/A` завершаются одним обычным `/exe` handoff в `/verify`.

Незавершённый запуск `/exe` остаётся текущей Execution Attempt. Новая attempt
создаётся только после подтверждённого `FAIL` или semantic-fail и решения об
eligible retry, а не после прерывания или resume процесса.

### `/verify`

Функциональный verdict основывается на независимо собранном evidence текущего
outcome, а не на обязательном наличии code changes:

- `PASS` соответствует подтверждённому outcome, включая корректный pre-GREEN;
- `FAIL` соответствует наблюдаемому нарушению acceptance criteria;
- `NEEDS-CLARIFICATION` сохраняет существующую семантику: credible verdict
  нельзя получить из-за обязательных inputs/evidence, scope/tier, canonical
  coverage, reproducibility или нерешённого owner decision.

Сам по себе pre-GREEN не является причиной для `NEEDS-CLARIFICATION` и не
возвращает задачу planning owner. `/verify` отвечает за свой функциональный
gate; сохранение порядка последующих gates остаётся обязанностью scheduler.

### Retry

`FAIL` или semantic-fail делает текущую Execution Attempt unsuccessful.
Следующая attempt создаётся только после решения об eligible retry. Она
сохраняет исходный RED, когда он существует, и всегда связывает failed-gate
evidence с минимальной коррекцией. После свежего GREEN повторяются все
tier-required gates: `/verify`, а для T3 — per-task `/red-verify`. Существующий
T2 feature-level `/red-verify` не меняется.

Authority gap сохраняет существующий terminal route `blocked/halt`.
Task-local failure без выбранного безопасного retry получает `failed`. До
третьей unsuccessful attempt inconclusive evidence ведёт к `halt`; после
третьей inconclusive task-local disposition получает `failed`.
`NEEDS-CLARIFICATION`, halt, interruption и resume сами по себе retry не
расходуют.

### Scheduler и recovery

Для `/autopilot` входом в `/verify` служит завершённый forward `/exe` handoff,
который называет `/verify` следующим route. Blocker, tier escalation и design
expansion handoffs сохраняют указанный ими существующий route. Термин
`implementation handoff` полезно унифицировать до `/exe handoff`, чтобы recovery
одинаково распознавал RED/GREEN, pre-GREEN и `N/A`. Остальная gate sequence и
checkpoint/report recovery могут остаться без изменений.

## Предполагаемая поверхность изменений

- `skills/_shared/references/workflows/tier-policy.md` — короткий общий контракт
  initial RED, pre-GREEN, retry и disposition без повторов в T2/T3 summaries;
- `skills/_shared/references/commands/exe.md` — единый lifecycle и handoff для
  всех вариантов execution evidence;
- `skills/_shared/references/commands/verify.md` — verdict по outcome независимо
  от наличия production changes;
- `skills/_shared/references/commands/autopilot.md` — только терминологическая
  синхронизация `/exe handoff`, если она нужна recovery-маршруту;
- `skills/_shared/references/workflows/execute-loop.md` — тот же единый
  execution route в ручном flow;
- `skills/_shared/references/protocols/progress-template.md` — только
  синхронизация формулировки pre-GREEN без изменения protocol shape;
- `scripts/test-install-sync.mjs`, `README.md` и `howItWorks.md` — синхронизация
  prose-зависимых проверок и публичного описания.

Planning skills, `/add-tests`, `/red-verify`, остальные protocol templates,
task schema, validator logic и installer по существу не меняются. Новые
markers, verdicts, lifecycle statuses, stages, registries, protocol fields или
protocol families не требуются.

## Проверка результата

Минимальная regression matrix может охватывать:

1. initial RED, реализацию, GREEN и обычный `/verify`;
2. pre-GREEN с `PASS` без production changes;
3. pre-GREEN, после которого независимый `/verify` обнаруживает `FAIL`;
4. `NEEDS-CLARIFICATION` по существующей семантике required input/evidence,
   scope/tier, canonical coverage, reproducibility и owner decisions;
5. retry с исходным RED, когда он был, failed gate evidence и свежим GREEN;
6. resume после завершённого `/exe` handoff;
7. одинаковые lifecycle owners и gate order в ручном и автоматическом режиме.

Готовность оптимизации подтверждается contract-тестами, prose assertions,
установкой в изолированный target и отсутствием package-local `shared-*` файлов
в source-only дереве.
