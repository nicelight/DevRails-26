# Conservative receipt-aware оптимизация `/execute` и `/verify`

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

Разрешить `/verify` условно переиспользовать актуальные, claim-bound результаты
`/execute`, сохранив независимую оценку outcome/spec compliance и обязательное
independent observation там, где его требует tier policy.

Оптимизируется повтор команд, а не ответственность verifier.

## Trust boundary prompt-only реализации

Receipt остаётся self-attestation агента. `/verify` может пересчитать текущее
состояние и проверить внутреннюю согласованность записи, но не способен
независимо доказать, что `/execute` действительно сделал snapshot до command и
получил указанный result. Поэтому receipt является `reuse candidate`, а не
криптографическим, harness-generated или независимым доказательством
provenance.

Строгая provenance потребовала бы trusted runner или защищённый runtime trace и
не входит в эту идею. Prompt-only reuse допустим только как часть
verifier-owned proof по правилам ниже.

## Reuse candidate от `/execute`

Receipt обязателен только для результата, предлагаемого к reuse. Он хранится в
существующем protocol/evidence. Receipt не имеет отдельного файла или
JSON Schema: это логически связанный блок полей в существующем
`run.md`, `progress.md`, `handoff.md` или implementation evidence. Конкретное
размещение выбирает `/execute`, но handoff должен позволять `/verify`
однозначно найти все поля одного result.

К reuse допускаются только хорошо известные local deterministic gates, для
которых `/execute` может консервативно и однозначно ограничить inputs. Receipt
сам по себе не является independent observation.

Receipt содержит:

- `claim` — конкретный task outcome, AC/REQ, gate, verification target или
  spec rule, который подтверждает result. `Tests passed` недостаточно:
  verifier должен видеть границу поведения, которое result заявлен
  подтверждать.
- `command` — точная выполненная command с filters/arguments, чтобы verifier
  мог оценить фактический scope и воспроизвести проверку. Secret values
  redacted; имя required qualifier может остаться.
- `cwd` — working directory запуска, потому что relative paths, project config
  и test discovery могут зависеть от неё.
- `exit_code` — механический результат process. Нулевой code не является
  доказательством claim без command scope и observable evidence.
- `input_state_basis` — snapshot inputs, которые `/execute` считает фактическим
  command read surface:
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

`input_state_basis` описывает заявленный state, который command получила на
входе. По контракту `/execute` для result, предлагаемого к reuse, snapshot
делается до запуска, а receipt завершается сразу после command. Prompt-only
verifier проверяет согласованность этой записи, но не может независимо доказать
порядок действий.

Input coverage определяется command read surface, а не task change surface,
`touched_files` или списком изменённых файлов. Repository revision
связывает committed repository state; все отклонения от него внутри
command read surface и relevant non-repository inputs фиксируются
отдельно. Если read surface неявна, широка или не может быть
консервативно ограничена, result не предлагается к reuse. Попытка связать
«весь применимый state» не заменяет знания фактических inputs.

Policy предполагает canonical sequential execution с одним активным
worker. Обязательная pre/post state comparison не вводится. Если
command сама изменила relevant source/runtime input, либо `/execute`
наблюдает uncontrolled background mutation или volatile external state,
result не предлагается к reuse. Experimental parallel flow не получает
дополнительных reuse guarantees в рамках этой идеи.

Не вводить универсальный fingerprint для каждого запуска. State binding
формируется только для результата, предлагаемого к reuse, и должен покрывать
заявленный command read surface этого result. Если такое покрытие нельзя
подтвердить консервативно, результат не переиспользуется.

Не вводить новый task field, registry, cache service, status, artifact family
или lifecycle.

## Freshness

Reusable result должен быть получен на state, совпадающем с текущим
проверяемым state. State equality, а не timestamp, является обязательным
условием reuse candidate. Оно помогает обнаружить drift, но не доказывает
сам факт или порядок выполнения command.

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
2. Проверяет receipt, state binding, заявленный порядок выполнения и применимую
   freshness policy каждого принятого result, не считая self-attestation
   независимым доказательством.
3. Решает, создаст ли идентичный rerun новую информацию.
4. Выполняет targeted probe, когда evidence не закрывает claim или риск требует
   независимого наблюдения.

Независимость `/verify` означает отдельную verifier-оценку task/spec/diff/
evidence и самостоятельное решение о достаточности proof. Verifier сам
инспектирует текущие source/diff и не принимает reasoning исполнителя или
receipt как independent observation. Независимость не требует идентичного
повтора каждой command, если eligible reuse candidate вместе с новым
verifier-owned evidence даёт достаточный functional proof по tier policy.

Execute-result можно принять без повтора только когда:

- это хорошо известный local deterministic gate с явно и консервативно
  ограниченным command read surface;
- state binding совпадает с текущим проверяемым состоянием;
- input snapshot создан до command, receipt завершён сразу после неё,
  и result не нарушает явную freshness policy, если она применима;
- command, cwd, relevant environment и result однозначны;
- evidence полное, непротиворечивое и связано с нужным claim;
- проверка deterministic и не зависит от изменчивого external state;
- tier policy не требует более сильного независимого proof.

Verifier повторяет gate или выполняет заменяющий probe, если:

- receipt отсутствует либо source/runtime state изменился;
- command read surface неявен, широк или не может быть консервативно ограничен;
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
- T2 допускает reuse supporting или дорогих current-state deterministic gates,
  но не reuse-only PASS. Verifier независимо проверяет contract/outcome mapping
  и получает хотя бы один новый outcome-level probe, достаточный для
  независимого наблюдения material task outcome.
- T3 не допускает reuse-only PASS. Verifier самостоятельно получает evidence
  для набора claims, каждый из которых независимо определяет T3
  harm/closure risk. Один probe достаточен, только если он покрывает весь
  risk-driving claim set; supporting и lower-risk evidence можно
  переиспользовать.

## Отчёт `/verify`

Verification evidence разделяет:

- `reused execute evidence` — какой reuse candidate принят как supporting
  evidence, какой claim закрывает, state binding, completed_at и применимая
  freshness basis;
- `repeated checks` — что повторено и почему;
- `new targeted probes` — что добавлено и какой claim закрывает;

В task `verify` попадает краткий итог. Полный receipt остаётся в существующем
protocol/artifacts.

## `/add-tests`

Provenance-logic не добавляется в `/add-tests`. Receipt создаёт только
`/execute`:

- после `/add-tests` receipt-aware route возвращается в `/execute`;
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

- no representation of self-attested receipt as independent or cryptographic
  provenance proof;
- no trusted runner, protected trace or mechanical attestation;
- no removal of independent functional verification for T2/T3;
- no reuse for implicit, broad or conservatively unbounded command read surface;
- no reuse-only PASS for T2/T3;
- no universal exact-replay requirement;
- no registry, cache service, task field, status or artifact family;
- no separate receipt file, JSON Schema, validator or doctor gate;
- no receipt/freshness logic inside `/add-tests`;
- no mandatory pre/post state comparison in canonical sequential execution;
- no additional reuse guarantees for experimental parallel execution;
- no mandatory full suite for every task or wave;
- no scheduler or `/red-verify` redesign.

## Evaluation cases

- well-known local deterministic gate + bounded inputs + matching state +
  complete receipt → eligible reuse candidate; verifier still owns PASS;
- self-attested receipt → never counted as independent observation;
- relevant source/config/dependency/runtime change → rerun or replacement probe;
- explicit freshness-policy violation или volatile external state → independent
  observation required;
- elapsed time alone for deterministic current-state result → reuse remains
  allowed;
- implicit/broad command read surface cannot be conservatively bound → reuse
  denied;
- command changed a relevant input, observed uncontrolled background mutation,
  or volatile external state → reuse denied;
- missing untracked/generated input coverage → reuse denied;
- direct `/add-tests` evidence without execute receipt → supporting evidence
  only, rerun or replacement probe required;
- flaky/external-state command → independent observation required;
- incomplete receipt → reuse denied;
- T2 has only reused execute evidence and no new outcome-level probe → PASS
  denied;
- T3 reused-only evidence → PASS denied;
- T3 has several independent harm-driving claims → new verifier evidence
  covers the full risk-driving claim set.

## Acceptance criteria

- eligible deterministic commands are not repeated solely because workflow
  moved from `/execute` to `/verify`;
- every reuse candidate is claim-bound and bound to a declared pre-command
  input snapshot matching current verified state, without presenting that
  self-attestation as independent proof;
- state binding follows command read surface rather than `touched_files` or
  task change surface; implicit, broad or unbounded read surface denies reuse;
- verifier independently inspects current source/diff and decides proof
  sufficiency without treating executor reasoning as evidence;
- identical rerun is not required solely to make verifier assessment independent;
- stale, ambiguous or high-risk evidence triggers rerun or probe;
- `NEEDS-CLARIFICATION` is used only when required proof cannot be safely
  obtained or reproduced;
- T2 cannot pass without at least one new verifier-owned outcome-level probe;
- T3 cannot pass using reused execute evidence alone;
- T3 new verifier evidence covers every independently harm-driving claim, while
  one probe remains sufficient when it covers the complete risk-driving set;
- reports make reused, repeated and new checks auditable.

Ожидаемый результат: меньше бессодержательных reruns и ниже latency без
ослабления functional verification и без ложного обещания строгой provenance в
prompt-only реализации.
