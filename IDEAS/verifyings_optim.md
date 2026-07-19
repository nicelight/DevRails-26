# Provenance-aware оптимизация `/execute` и `/verify`

Reassessed: 2026-07-19
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

Разрешить `/verify` принимать доказанно актуальные, claim-bound результаты
`/execute`, сохранив независимую оценку outcome/spec compliance и право на
новые risk-based probes.

Оптимизируется повтор команд, а не ответственность verifier.

## Evidence receipt от `/execute`

Receipt обязателен только для результата, предлагаемого к reuse. Он хранится в
существующем protocol/evidence. Receipt не имеет отдельного файла или
JSON Schema: это логически связанный блок полей в существующем
`run.md`, `progress.md`, `handoff.md` или implementation evidence. Конкретное
размещение выбирает `/execute`, но handoff должен позволять `/verify`
однозначно найти все поля одного result.

Receipt содержит:

- `claim` — конкретный task outcome, AC/REQ, gate, verification target или
  spec rule, который подтверждает result. `Tests passed` недостаточно:
  verifier должен видеть границу доказанного поведения.
- `command` — точная выполненная command с filters/arguments, чтобы verifier
  мог оценить фактический scope и воспроизвести проверку. Secret values
  redacted; имя required qualifier может остаться.
- `cwd` — working directory запуска, потому что relative paths, project config
  и test discovery могут зависеть от неё.
- `exit_code` — механический результат process. Нулевой code не является
  доказательством claim без command scope и observable evidence.
- `input_state_basis` — snapshot фактических inputs на входе command:
  - repository revision или другой доступный source-state basis;
  - status/digest relevant tracked, staged, unstaged, untracked и deleted paths;
  - relevant generated/runtime inputs, если command от них зависит;
  - только релевантные redacted runtime/toolchain/environment qualifiers.
- `completed_at` — точное время завершения для audit trail, explicit
  freshness policy и сопоставления с логами. Timestamp не заменяет
  state equality и сам по себе не доказывает актуальность.
- `evidence` — observable result: concise output, log/report/artifact paths и
  checksum сохранённого artifact, когда он есть. Checksum защищает от
  последующего drift artifact, но не заменяет независимую оценку verifier.

`input_state_basis` фиксирует state, который command фактически получила
на входе. Для result, предлагаемого к reuse, snapshot делается до
запуска, а receipt завершается сразу после command. Если command сама
изменила relevant source/runtime input, result не reusable без сохранённого
pre-run snapshot и доказанного совпадения с текущим проверяемым state.

Не вводить универсальный fingerprint для каждого запуска. State binding
формируется только для результата, предлагаемого к reuse, и должен покрывать
фактические inputs этого result. Если такое покрытие нельзя подтвердить
консервативно, результат не переиспользуется.

Не вводить новый task field, registry, cache service, status, artifact family
или lifecycle.

## Freshness

Reusable result должен быть получен на state, совпадающем с текущим
проверяемым state. State equality, а не timestamp, является основным
доказательством того, что command проверяла актуальные inputs.

- Deterministic local result с совпадающим source/runtime state не устаревает
  только из-за прошедшего времени.
- Freshness window применяется только когда он задан project/task/spec/gate
  policy либо evidence по природе зависит от изменчивого runtime/external state.
- Verifier не придумывает TTL по tier или собственному усмотрению.
- Изменение relevant code, config, dependencies, generated/runtime state или
  environment qualifier инвалидирует evidence независимо от его возраста.

## Политика `/verify`

Verifier независимо:

1. Сопоставляет task outcome, AC/REQ, specs, gates и actual change surface.
2. Проверяет provenance, state binding, порядок выполнения и применимую
   freshness policy каждого принятого result.
3. Решает, создаст ли идентичный rerun новую информацию.
4. Выполняет targeted probe, когда evidence не закрывает claim или риск требует
   независимого наблюдения.

Независимость `/verify` означает отдельную verifier-оценку task/spec/diff/
evidence и самостоятельное решение о достаточности proof. Verifier сам
инспектирует текущие source/diff и не принимает reasoning исполнителя
как proof. Независимость не требует идентичного повтора command, если
state-bound observable result даёт достаточный functional proof по tier policy.

Execute-result можно принять без повтора только когда:

- state binding совпадает с текущим проверяемым состоянием;
- input snapshot создан до command, receipt завершён сразу после неё,
  и result не нарушает явную freshness policy, если она применима;
- command, cwd, relevant environment и result однозначны;
- evidence полное, непротиворечивое и связано с нужным claim;
- проверка deterministic и не зависит от изменчивого external state;
- tier policy не требует более сильного независимого proof.

Verifier повторяет gate или выполняет заменяющий probe, если:

- provenance отсутствует либо source/runtime state изменился;
- нарушена явная freshness policy или evidence зависит от изменчивого state;
- evidence неполное, противоречивое или формальное;
- command flaky, nondeterministic либо зависит от external state;
- input snapshot не совпадает с финальным текущим relevant state;
- observed behavior вызывает сомнение;
- высокий риск требует независимого runtime evidence.

Непригодный receipt сначала ведёт к rerun или replacement probe. Verifier
возвращает `NEEDS-CLARIFICATION` только когда обязательное evidence невозможно
безопасно получить или воспроизвести из доступного состояния.

`/verify` не выдаёт PASS только потому, что `/execute` сообщил PASS.

## Tier policy

- T0/T1 manual fast lane не меняется: отдельный `/verify` не становится
  обязательным.
- T0/T1 scheduler verification может принимать compact current-state evidence, если
  оно достаточно для task outcome.
- T2 допускает reuse current-state deterministic gates. Verifier независимо проверяет
  contract/outcome mapping и добавляет probe только при evidence gap или риске.
- T3 не допускает reuse-only PASS. Verifier самостоятельно получает evidence
  для наиболее рискованного применимого runtime/integration/security claim;
  supporting evidence можно переиспользовать.

## Отчёт `/verify`

Verification evidence разделяет:

- `reused execute evidence` — что принято, какой claim закрывает, state binding,
  completed_at и применимая freshness basis;
- `repeated checks` — что повторено и почему;
- `new targeted probes` — что добавлено и какой claim закрывает;

В task `verify` попадает краткий итог. Полный receipt остаётся в существующем
protocol/artifacts.

## `/add-tests`

Provenance-logic не добавляется в `/add-tests`. Receipt создаёт только
`/execute`:

- после `/add-tests` provenance-aware route возвращается в `/execute`;
- `/execute` запускает финальный применимый gate после всех relevant
  изменений и при необходимости оформляет receipt;
- result, записанный самим `/add-tests`, остаётся supporting evidence,
  но сам по себе не разрешает `/verify` пропустить запуск;
- если `/add-tests` передал evidence прямо в `/verify`, verifier оценивает
  его как non-reusable и запускает свою проверку или replacement probe.

`add-tests.md` не меняется в рамках этой идеи.

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

Runtime contract:

- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/workflows/tier-policy.md`

Source-template alignment:

- `skills/_shared/references/protocols/compact-run-template.md`
- `skills/_shared/references/protocols/progress-template.md`
- `skills/_shared/references/protocols/handoff-template.md`
- `skills/_shared/references/protocols/verification-template.md`

Public workflow note:

- `howItWorks.md`

Canonical installer генерирует target runtime skills напрямую из
`commands/*.md` и не разворачивает protocol templates. Поэтому mandatory receipt
и verifier policy должны быть полностью определены в `execute.md` и `verify.md`;
templates только поддерживают source consistency и не являются runtime
dependency. Installer не меняется в рамках этой идеи.

`red-verify.md`, scheduler commands, task schema, `mb-lint` и `mb-doctor` не
меняются без concrete contract defect. `add-tests.md` также не
меняется: reusable receipt остаётся ownership `/execute`.

## Non-goals

- no trust in executor self-report without current-state evidence;
- no removal of independent functional verification for T2/T3;
- no universal exact-replay requirement;
- no registry, cache service, task field, status or artifact family;
- no separate receipt file, JSON Schema, validator or doctor gate;
- no provenance/freshness logic inside `/add-tests`;
- no mandatory full suite for every task or wave;
- no scheduler or `/red-verify` redesign.

## Evaluation cases

- deterministic result + matching state + valid execution order → reuse allowed;
- relevant source/config/dependency/runtime change → rerun or replacement probe;
- explicit freshness-policy violation или volatile external state → independent
  observation required;
- elapsed time alone for deterministic current-state result → reuse remains
  allowed;
- command changed a relevant input without a preserved pre-run snapshot → reuse
  denied;
- missing untracked/generated input coverage → reuse denied;
- direct `/add-tests` evidence without execute receipt → supporting evidence
  only, rerun or replacement probe required;
- flaky/external-state command → independent observation required;
- incomplete receipt → reuse denied;
- T3 reused-only evidence → PASS denied.

## Acceptance criteria

- deterministic commands are not repeated solely because workflow moved from
  `/execute` to `/verify`;
- accepted evidence is bound to a pre-command input snapshot matching current
  verified state, reproducible and claim-bound;
- verifier independently inspects current source/diff and decides proof
  sufficiency without treating executor reasoning as evidence;
- identical rerun is not required solely to make verifier assessment independent;
- stale, ambiguous or high-risk evidence triggers rerun or probe;
- `NEEDS-CLARIFICATION` is used only when required proof cannot be safely
  obtained or reproduced;
- T3 cannot pass using reused execute evidence alone;
- reports make reused, repeated and new checks auditable.

Ожидаемый результат: меньше бессодержательных reruns и ниже latency без
ослабления functional verification.
