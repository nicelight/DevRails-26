# Provenance-aware оптимизация `/execute` и `/verify`

Reassessed: 2026-07-18
Status: implementation-ready

## Проблема

DevRails уже разделяет роли:

- `/execute` реализует задачу и запускает минимально достаточные local gates;
- `/verify` независимо проверяет functional outcome, AC/REQ и canonical specs;
- `/red-verify` ищет adversarial semantic false-success.

`/verify` вправе выбирать минимальные независимые проверки, но не имеет явного
контракта, когда свежий deterministic результат `/execute` можно принять без
идентичного повторного запуска. Это создаёт либо бессодержательный rerun, либо
небезопасное доверие текстовому PASS исполнителя.

## Цель

Разрешить `/verify` принимать доказанно свежие, claim-bound результаты
`/execute`, сохранив независимую оценку outcome/spec compliance и право на
новые risk-based probes.

Оптимизируется повтор команд, а не ответственность verifier.

## Evidence receipt от `/execute`

Receipt обязателен только для результата, предлагаемого к reuse. Он хранится в
существующем protocol/evidence и содержит:

- source-state binding:
  - base revision, если доступна;
  - digest task-relevant diff или проверяемого artifact;
  - relevant staged, untracked, generated и runtime inputs;
- точную command, cwd и exit code;
- релевантные redacted runtime/toolchain/environment qualifiers;
- точное время завершения;
- log/artifact paths и checksum, когда artifact сохраняется;
- gates, verification targets или spec claims, подтверждаемые результатом.

Не вводить универсальный fingerprint для каждого запуска. Если проверяемое
состояние нельзя надёжно связать с receipt, результат не переиспользуется.

Не вводить новый task field, registry, cache service, status, artifact family
или lifecycle.

## Freshness

Время завершения является обязательной частью freshness decision.

- Verifier учитывает возраст evidence вместе с совпадением source/runtime state.
- Evidence, вышедшее за применимое freshness window, повторяется даже при
  неизменном source state.
- Freshness window определяется природой command, tier, project policy и
  изменчивостью runtime; единого глобального TTL не вводится.
- Изменение relevant code, config, dependencies, generated/runtime state или
  environment qualifier инвалидирует evidence независимо от его возраста.

## Политика `/verify`

Verifier независимо:

1. Сопоставляет task outcome, AC/REQ, specs, gates и actual change surface.
2. Проверяет provenance, state binding и freshness каждого принятого result.
3. Решает, создаст ли идентичный rerun новую информацию.
4. Выполняет targeted probe, когда evidence не закрывает claim или риск требует
   независимого наблюдения.

Execute-result можно принять без повтора только когда:

- state binding совпадает с текущим проверяемым состоянием;
- evidence остаётся внутри применимого freshness window;
- command, cwd, relevant environment и result однозначны;
- evidence полное, непротиворечивое и связано с нужным claim;
- проверка deterministic и не зависит от изменчивого external state;
- tier policy не требует более сильного независимого proof.

Verifier повторяет gate или выполняет заменяющий probe, если:

- provenance отсутствует либо source/runtime state изменился;
- freshness window истекло;
- evidence неполное, противоречивое или формальное;
- command flaky, nondeterministic либо зависит от external state;
- проверка выполнялась до финального relevant изменения;
- observed behavior вызывает сомнение;
- высокий риск требует независимого runtime evidence.

`/verify` не выдаёт PASS только потому, что `/execute` сообщил PASS.

## Tier policy

- T0/T1 manual fast lane не меняется: отдельный `/verify` не становится
  обязательным.
- T0/T1 scheduler verification может принимать compact fresh evidence, если
  оно достаточно для task outcome.
- T2 допускает reuse fresh deterministic gates. Verifier независимо проверяет
  contract/outcome mapping и добавляет probe только при evidence gap или риске.
- T3 не допускает reuse-only PASS. Требуется хотя бы одно независимое
  risk-relevant runtime/integration/security наблюдение; supporting evidence
  можно переиспользовать.

## Отчёт `/verify`

Verification evidence разделяет:

- `accepted execute evidence` — что принято, state binding, completed_at и
  freshness basis;
- `repeated checks` — что повторено и почему;
- `new targeted probes` — что добавлено и какой claim закрывает;
- `not repeated` — что не повторялось и почему.

В task `verify` попадает краткий итог. Полный receipt остаётся в существующем
protocol/artifacts.

## Full-suite ownership

- Task-level suite запускается там, где его требует task/spec gate.
- `/verify` не повторяет suite только из-за перехода между skills.
- Wave/feature integration gate не добавляется этой задачей.
- Scheduler/CI ownership рассматривается отдельно в
  `IDEAS/autopi-impr.md` и не меняет verifier contract.

## `/red-verify`

Изменения не требуются. `/red-verify` принимает functional PASS как
precondition, но самостоятельно строит hostile model. Он не становится вторым
functional verifier и не повторяет штатные gates без adversarial причины.

## Expected implementation surface

Primary:

- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/protocols/compact-run-template.md`
- `skills/_shared/references/protocols/progress-template.md`
- `skills/_shared/references/protocols/handoff-template.md`
- `skills/_shared/references/protocols/verification-template.md`
- `skills/_shared/references/workflows/tier-policy.md`

`red-verify.md`, scheduler commands, task schema, `mb-lint` и `mb-doctor` не
меняются без concrete contract defect.

## Non-goals

- no trust in executor self-report without current-state evidence;
- no removal of independent functional verification for T2/T3;
- no universal exact-replay requirement;
- no registry, cache service, task field, status or artifact family;
- no mandatory full suite for every task or wave;
- no scheduler or `/red-verify` redesign.

## Evaluation cases

- deterministic result + matching state + valid freshness → reuse allowed;
- relevant source/config/dependency/runtime change → rerun or replacement probe;
- expired freshness window → rerun even when source is unchanged;
- missing untracked/generated input coverage → reuse denied;
- flaky/external-state command → independent observation required;
- incomplete receipt → reuse denied;
- T3 reused-only evidence → PASS denied.

## Acceptance criteria

- deterministic commands are not repeated solely because workflow moved from
  `/execute` to `/verify`;
- accepted evidence is state-bound, timely, reproducible and claim-bound;
- verifier still produces independent functional confidence;
- stale, ambiguous or high-risk evidence triggers rerun, probe or
  `NEEDS-CLARIFICATION`;
- T3 cannot pass using reused execute evidence alone;
- reports make accepted, repeated, new and skipped checks auditable.

Ожидаемый результат: меньше бессодержательных reruns и ниже latency без
ослабления functional verification.
