# Global skills refactor — handoff второго repair-пакета

## Статус и назначение

- Дата handoff: 2026-07-19.
- Статус пакета: `ready`.
- Open scope: RF-01, RF-03, RF-04, RF-05 и RF-12.
- Для RF-12 принят точный review budget:
  `max_review_repairs_per_surface: 2`.

Это не продолжение широкого Stage 2 refactor и не задача «улучшить DevRails».
Пакет закрывает пять воспроизводимых дыр минимальными изменениями существующих
workflow owners. Новый capability, альтернативный workflow и общая переработка
prompts находятся вне scope.

## Источники и их приоритет

1. [`_refactor.md`](./_refactor.md) — текущий authoritative repair register:
   статусы, KISS-решения, scope и Definition of Done каждого RF.
2. Текущий canonical source в `skills/_shared/`, фактический
   `scripts/install-framework.mjs`, validators и release checks — источник
   истины о реально существующих owners, путях и generated target behavior.
3. [`global-skills-refactor.md`](./global-skills-refactor.md) — только
   сохраняемые workflow-инварианты и исходная граница между outcome contract и
   локальной тактикой.
4. [`global-skills-refactor-stage1-handoff.md`](./global-skills-refactor-stage1-handoff.md)
   — historical evidence: уже сохранённые Product/Design contracts, ограничение
   static assertions и требование проверять доступность references в target.

`README.md` и `howItWorks.md` могут быть устаревшими и не являются основанием
для design или implementation decisions этого пакета. Их допустимо
синхронизировать только после исправления canonical behavior, если конкретный
публичный drift подтверждён по фактическому source/runtime contract.

При конфликте broad/historical wording с `_refactor.md` действует
`_refactor.md`. При расхождении planning text с кодом сначала фиксируется
фактическое поведение по canonical-to-target chain; новый contract не
додумывается.

## Что выбрано из исходных документов

Из общего refactor plan нужны только следующие инварианты:

- workflow владеет переходами и межшаговыми contracts;
- leaf command владеет только своим outcome, hard boundaries и immediate
  handoff;
- operator-owned decision нельзя заменять recommendation или default;
- existing inputs, outputs, statuses, verdicts, stop conditions, ownership и
  resume routes нельзя менять случайно;
- mechanical gates нельзя ослаблять ради более короткого prompt;
- deployed command обязан иметь доступный target reference либо честно
  остановиться;
- source-only hygiene и Codex/Claude parity обязательны.

Из historical Stage 1 handoff нужны только:

- подтверждение, что task schema, task lifecycle, Foundation rules,
  scheduler ownership и task registry не были частью Stage 1 и не открываются
  этим пакетом;
- правило не переспрашивать уже принятое authoritative решение;
- static prompt assertions не являются доказательством model behavior;
- после изменения canonical command нужно проверять generated target, а не
  только source text.

Не переносить в этот пакет:

- общий Stage 2 inventory/slimming всех remaining skills;
- refactor `/red-verify`, `/prd-to-tasks`, `/foundation-to-tasks`, `/execute`
  или review skills;
- глобальное сокращение prompts и downstream chains вне RF-04;
- новую behavioral-eval infrastructure;
- исторический список потенциальных hotspots как implementation scope.

## Стартовое состояние

- Первый repair-пакет закрыт: RF-06, RF-07, RF-08, RF-09, RF-10, RF-11,
  RF-13, RF-14 и RF-15 реализованы и проверены.
- Второй пакет открыт только для RF-01, RF-03, RF-04, RF-05 и RF-12.
- RF-01 уже имеет operator decision: `external bootstrap only`.
- RF-02 имеет terminal decision: `excluded`.
- Для RF-12 принято `max_review_repairs_per_surface: 2`.
- Принятые guards первого пакета в `autonomous.md` и
  `.github/workflows/release-check.yml` являются compatibility boundary: второй
  пакет не должен их откатывать или ослаблять.
- Worktree может содержать operator-owned changes. Перед каждым slice нужно
  читать текущий diff; неизвестный overlap в затрагиваемом файле является stop
  condition, а не разрешением переписать соседнее изменение.

## Execution/launch contract

- Если оператор ожидает orchestration, `ROLE: ORCHESTRATOR` назначается во
  внешнем первоначальном launch prompt до фиксации роли. Этот handoff сам роль
  не меняет.
- Slices исполняются строго последовательно: один Implementer за раз, без
  параллельной реализации.
- Coordinator сам проверяет обычный компактный slice. Отдельный Reviewer нужен
  только для действительно объёмного или семантически рискованного slice.
- `REQUEST_CHANGES` возвращается тому же Implementer; следующий slice не
  начинается до принятия текущего.
- Это правила запуска существующей работы, не новый workflow или artifact.

## Обязательные KISS-границы

- Только repair scope: минимально закрыть конкретную дыру в существующем owner.
- Не создавать task schema/field, новый lifecycle/status, registry, blocker
  classifier, precedence state machine или persisted blocker field.
- Не создавать новый Memory Bank directory, protocol artifact family,
  generated public subtree, installer mode или durable workflow branch.
- Не создавать target-local bootstrap helper/assets или вторую реализацию
  Memory Bank initialization.
- Не разворачивать protocol templates и не добавлять им ownership/sync/
  migration policy: RF-02 закрыт как `excluded`.
- Не создавать blocking LLM/model-eval framework. Prompt-only semantics
  подтверждаются компактным manual или явно non-blocking probe.
- Не менять task cards, task registry semantics, Foundation contracts, tier
  policy, closure ownership или существующий terminal vocabulary.
- Не проводить попутный prompt cleanup. Формулировка меняется лишь настолько,
  насколько это необходимо для RF и однозначного immediate handoff.
- Любая необходимость нового artifact/path/status/schema является stop
  condition: вернуть вопрос оператору, а не проектировать расширение.

## Decision ledger

### Уже принято

| Decision | Значение |
|---|---|
| Package objective | закрыть явные contract/safety/routing gaps, не развивать framework |
| RF-01 bootstrap model | только внешний `scripts/install-framework.mjs` из доступного checkout DevRails |
| Target-local init | запрещён |
| RF-02 | `excluded`, не реализовывать |
| RF-03 model | два правила в существующем `autonomy-policy.md`, без classifier/state machine |
| RF-04 model | direct reads для малого repo; bounded delegation только по реальной ширине и разрешению роли/оператора |
| RF-05 ownership | автоматичны только mechanical links/indexes/routers; semantic/destructive решения принадлежат owner/operator |
| Behavioral validation | deterministic CI плюс manual/non-blocking prompt evidence, без eval subsystem |
| RF-12 default | `max_review_repairs_per_surface: 2` |
| RF-12 storage | existing autonomous run status: persisted effective limit и компактные counters |

### Принятое решение RF-12

Operator-approved default:

```text
max_review_repairs_per_surface: 2
```

Отдельная configurability не добавляется. Иное значение допустимо только если
оно уже явно задано authoritative run policy конкретного run.

## Scope map

| RF | Severity | Закрываемая дыра | Минимальный owner |
|---|---:|---|---|
| RF-01 | High | install-only/selective runtime обещает недоступный local `/mb-init` route | canonical `/mb-init` и `/cold-start`; existing external installer |
| RF-03 | High | generic no-ready fallback стирает specific terminal blocker | `workflows/autonomy-policy.md`; leaf references в `/autonomous` и `/autopilot` |
| RF-04 | Medium | `/map-codebase` принуждает 5–7 workers/fan-out и повторно спрашивает уже переданный delta | существующий `/map-codebase` command |
| RF-05 | Medium | `/mb-garden` валидирует до mutation и сам принимает semantic/destructive решения | существующий `/mb-garden` command |
| RF-12 | Medium | review repair limit неоднозначен и сбрасывается при resume | `/autonomous`, `autonomy-policy.md`, existing autonomous run status |

## Slice 1 — RF-01: honest external-bootstrap route

### Required behavior

- Generated `/mb-init` становится thin blocker/router и не создаёт skeleton.
- Если `.memory-bank/` отсутствует, команда указывает внешний route из
  доступного checkout DevRails:

  ```bash
  node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --target <target-repo> --yes
  ```

- Для явного sync существующего target используется уже поддерживаемая форма:

  ```bash
  node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --sync --target <target-repo> --yes
  ```

- Если доступный checkout известен, route подставляет его фактический путь и
  даёт точную исполнимую команду. Если checkout недоступен или его путь
  неизвестен, команда не угадывает путь: возвращает честный blocker и требует
  от оператора предоставить доступный checkout либо выполнить external
  installer action, после чего повторить исходную команду.
- Selective `/cold-start` не должен предполагать, что `/mb-init` также
  установлен. При отсутствующем skeleton он даёт тот же point-of-use external
  route напрямую.
- Никакой ручной сборки skeleton по template, auto-install dependency или
  нового installer mode.
- Existing `AGENTS.md` и existing Memory Bank проходят через текущую installer
  policy; command не обходит её.

### Candidate surfaces

- `skills/_shared/references/commands/mb-init.md` — required canonical change;
- `skills/_shared/references/commands/cold-start.md` — required selective-install
  route;
- `skills/mb-init/SKILL.md` и `skills/cold-start/SKILL.md` — required
  package-surface changes: их текущее wording уже противоречит
  external-installer boundary;
- `scripts/install-framework.mjs` — expected validation target, не место для
  новой bootstrap implementation;
- `.github/workflows/release-check.yml` — только targeted regression fixtures.

### Acceptance evidence

- Full install-only target содержит generated commands и не содержит skeleton.
- При известном checkout generated route даёт точную исполнимую external
  command; при неизвестном checkout возвращается blocker с требуемым внешним
  действием без выдуманного пути.
- Selective `cold-start` и selective `mb-init` не имеют dangling dependency.
- Fresh bootstrap, explicit sync и target с existing `AGENTS.md` сохраняют
  текущую безопасную installer policy.
- Generated `.agents/skills/<command>/SKILL.md` и
  `.claude/skills/<command>/SKILL.md` byte-identical.
- В target не добавлен второй bootstrap helper/assets surface.

## Slice 2 — RF-04: proportional `/map-codebase`

### Required behavior

- Убрать mandatory 5–7 workers и fixed fan-out/fan-in.
- Малый repository допускает direct reads одним агентом.
- Для действительно широкого discovery разрешены `/context-manifest` или
  bounded delegation только если текущая роль и operator contract это
  позволяют.
- Сохранить evidence-backed as-is baseline, facts-vs-inferences separation и
  PRD-less prohibition на roadmap/tasks.
- Если authoritative delta уже передан caller-ом, не спрашивать его повторно;
  сохранить его как downstream input.
- Если delta отсутствует, immediate handoff может запросить его у оператора.
- Удалить только дублированную дальнюю downstream chain и оставить
  непосредственного existing owner.
- Не превращать mapping в roadmap/task generation и не ослаблять brownfield
  evidence coverage.

### Candidate surfaces

- `skills/_shared/references/commands/map-codebase.md` — основной и ожидаемый
  implementation surface;
- targeted release assertion/manual probe — только если существующие checks не
  покрывают новые границы.

Не удалять существующий output/artifact как «лишний», пока не доказано, что он
не является частью public contract. RF-04 разрешает убрать forced tactic, но не
переопределить baseline output.

### Acceptance evidence

- Small-repo probe завершается без искусственных workers.
- Large-repo probe допускает bounded delegation, но не требует фиксированного
  количества lanes.
- Уже переданный delta не вызывает повторного вопроса.
- При отсутствующем delta mapping остаётся as-is и не создаёт EP/FT/TASK.
- Facts, inferences и unresolved evidence остаются различимыми.

## Slice 3 — RF-05: safe `/mb-garden` ownership and post-validation

### Required behavior

- До первой записи зафиксировать точный write set только для обнаруженных
  mechanical defects. Любая потребность выйти за него требует остановки и
  owner/operator decision, а не расширения mutation по ходу работы.
- Automatic write scope ограничен mechanical stale links, indexes и routers.
- Archive/delete/merge, competing canonical choice, TODO-to-task conversion и
  material canonical/task/governance change требуют explicit owner/operator
  decision или handoff существующему owning skill.
- Не создавать ownership matrix, maintenance lifecycle или новый artifact.
- После любой фактической mutation запускать final lint по изменённому
  состоянию.
- Doctor запускать только по уже существующим в `/mb-garden` условиям и
  ownership; не создавать новую applicability matrix.
- `/mb-sync` запускать только если изменён broader durable state, который уже
  принадлежит sync contract; cosmetic cleanup сам по себе sync не требует.
- Handoff перечисляет реально changed/moved artifacts, updated links и
  unresolved blockers.

### Candidate surfaces

- `skills/_shared/references/commands/mb-garden.md` — основной и ожидаемый
  implementation surface;
- `skills/mb-garden/assets/mb-lint.mjs` и `mb-doctor.mjs` — не менять, если
  нет отдельного доказанного mechanical-contract defect;
- release checks — только минимальные ordering/ownership assertions и
  применимые existing fixtures.

### Acceptance evidence

- Mechanical cleanup заканчивается lint по final changed state.
- Фактическая mutation не выходит за предварительно зафиксированный write set.
- Semantic/destructive scenario не мутирует owner-controlled artifacts и
  возвращает точный blocker/handoff.
- Applicable doctor выполняется, декоративный doctor не становится новым
  обязательным gate.
- `/mb-sync` вызывается только на реальной durable-state boundary.
- Ни один user-owned/current canonical artifact не удалён без явного решения.

## Slice 4 — RF-03: preserve specific terminal blockers

### Required behavior

В существующем `skills/_shared/references/workflows/autonomy-policy.md`
зафиксировать ровно два правила:

1. Уже записанный specific `HALT_*`, его reason, owner и resume route нельзя
   заменять generic dependency deadlock.
2. `HALT_DEPENDENCY_DEADLOCK` допустим только если все незакрытые task records
   non-runnable исключительно из-за незакрытых task dependencies.

`/autonomous` и `/autopilot` ссылаются на этот canonical rule и не создают
собственную классификацию.

Пустой task index нарушает уже существующий non-empty input/readiness contract
`/autopilot`, а не доказывает dependency deadlock. Для него использовать
существующий `HALT_QUALITY_GATES`, сохранить точную причину и направить repair
к существующему owner планирования исходной очереди: `/foundation-to-tasks`
для уже принятой required `FT-000` queue или `/prd-to-tasks FT-<NNN>` для уже
принятой product feature. После восстановления, review и strict readiness
resume route — повторный `/autopilot`. Новый halt или classifier не добавлять.

### Forbidden expansion

- blocker classes или precedence table;
- parser terminal reasons;
- новое task-schema/status field;
- отдельный blocker registry;
- синтез нового halt только из `status: blocked`.

### Candidate surfaces

- `skills/_shared/references/workflows/autonomy-policy.md` — canonical owner;
- `skills/_shared/references/commands/autonomous.md`;
- `skills/_shared/references/commands/autopilot.md`;
- `.github/workflows/release-check.yml` — targeted deterministic assertions и
  существующие fixtures, расширенные только на эти regressions.

`run-status-template.md` уже содержит terminal vocabulary; RF-03 не требует
нового status или field.

### Acceptance evidence

- Operator clarification, semantic/review rejection, policy/quality failure и
  budget halt сохраняют исходный specific state и owner.
- Genuine dependency-only graph exhaustion возвращает
  `HALT_DEPENDENCY_DEADLOCK`.
- Empty-index fixture возвращает `HALT_QUALITY_GATES` с существующим planning
  owner и точным resume route, а не dependency deadlock.
- Resume читает ту же terminal reason и выдаёт ту же точную resume command.
- Generic no-ready fallback не переписывает persisted evidence.

## Slice 5 — RF-12: exact persisted review budget

Для этого slice принят exact default `2`.

### Required behavior

- В existing autonomy policy появляется один exact
  `max_review_repairs_per_surface: 2`.
- Existing run status сохраняет effective
  `max_review_repairs_per_surface: 2` рядом с компактными counters.
- Initial review не считается repair attempt.
- Один attempt — завершённый repair плюс последующий re-review того же surface;
  counter увеличивается ровно один раз после завершения этой пары.
- Counter хранится компактно в существующем
  `.protocols/AUTONOMOUS-RUN/status.md` по реально reviewed surfaces.
- В пределах одного run тот же `feature-plan` или `task-plan:FT-<NNN>`
  продолжает тот же counter после compaction/resume.
- `APPROVE` после re-review продолжает flow. `REJECT` при `count < limit` разрешает
  следующий repair; при `count >= limit` записывает существующий
  `HALT_REVIEW_REJECT`, latest findings и named repair owner, уже возвращённый
  соответствующим review. Exhausted surface не входит снова в automatic repair
  loop того же run.
- Resume возможен только после operator-directed repair или authoritative input
  update через этот named owner, затем повторяется тот же review. Только
  `APPROVE` позволяет `/autonomous` продолжить с recorded boundary; `REJECT`
  сохраняет halt. Effective limit и persisted counter читаются из existing
  status и не сбрасываются.
- Отличающийся limit применяется только из уже существующей authoritative run
  policy; новую user-config surface не создавать.

### Forbidden expansion

- task field или task schema change;
- budget registry или отдельный status artifact;
- новый terminal/lifecycle status;
- surface version/identity model;
- reset counter при resume;
- неоднозначная формулировка `2-3` или `within budget` без exact owner/value.

### Candidate surfaces

- `skills/_shared/references/workflows/autonomy-policy.md`;
- `skills/_shared/references/commands/autonomous.md`;
- `skills/_shared/references/protocols/run-status-template.md` — только
  минимальные effective limit и counters внутри существующего status artifact;
- `.github/workflows/release-check.yml` — только минимальные structural
  assertions для exact policy/status shape, отсутствия `2-3` и generated
  Codex/Claude parity.

### Acceptance evidence

- Deterministic evidence подтверждает exact policy/status shape, отсутствие
  неоднозначного `2-3` и одинаковый generated contract для Codex/Claude.
- Manual/non-blocking probe подтверждает, что initial review не уменьшает
  budget, counter меняется без off-by-one и resume продолжает persisted state.
- Limit exhaustion всегда даёт `HALT_REVIEW_REJECT` с latest findings и exact
  resume route.
- Existing JSON task cards остаются byte/schema-compatible.

## Рекомендуемый последовательный порядок

1. RF-01 — починить installer/runtime route и его targeted fixtures.
2. RF-04 — убрать forced mapping tactic.
3. RF-05 — закрыть destructive ownership и post-mutation validation.
4. RF-03 — централизовать два terminal fallback rule.
5. RF-12 — добавить approved budget `2` и persisted counters.
6. Выполнить полный package validation в изолированных targets.

Каждый slice должен быть самостоятельным минимальным diff. Нельзя заранее
создавать общую abstraction для RF-03 и RF-12 только потому, что оба затрагивают
autonomy.

## Validation matrix

### Blocking deterministic checks

- `npm run check:syntax --silent`;
- `git diff --check`;
- существующие release checks плюс только минимальные targeted assertions,
  непосредственно закрывающие regression текущего slice;
- install-only всех commands в отдельный temporary target;
- selective install `cold-start` и `mb-init` в отдельных temporary targets;
- fresh bootstrap;
- explicit sync existing target;
- existing `AGENTS.md` safety fixture;
- generated Codex/Claude equality;
- fresh/applicable `mb-lint` и doctor fixtures без изменения их meaning;
- existing JSON task-card compatibility;
- source-only hygiene:

  ```bash
  find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
  ```

  Expected: `0`.

### Prompt-only evidence

Static string checks не выдаются за behavioral proof. Без нового runner
выполнить и записать компактный manual/non-blocking checklist:

1. install-only target без checkout path получает honest external blocker;
2. small repo mapping идёт direct-read route;
3. already supplied delta не переспрашивается;
4. garden mechanical mutation проходит post-lint;
5. garden semantic/delete scenario блокируется до owner decision;
6. specific halt переживает no-ready fallback и resume;
7. genuine dependency-only exhaustion даёт deadlock;
8. review counter соблюдает approved limit `2`, не имеет off-by-one и переживает
   resume без reset.

Если scenario нельзя воспроизвести детерминированно без model-eval system, его
результат остаётся явно manual/non-blocking evidence. Это не основание строить
новую CI infrastructure.

Для RF-12 deterministic evidence не считается доказательством фактического
runtime counting/resume поведения модели: оно доказывает только contract shape
и generated parity. Off-by-one и resume остаются manual/non-blocking probes.

## Stop conditions

Немедленно остановить affected slice и вернуть вопрос оператору, если:

- fix требует нового status/schema/task field/registry/artifact family;
- RF-01 требует target-local helper или нового installer mode;
- deployed skill ссылается на source-only path, который нельзя заменить
  существующим external route или доступным target reference;
- RF-04 требует менять public baseline outputs, а не только forced tactic;
- RF-05 требует semantic canonical/destructive decision без owner approval;
- RF-03 нельзя закрыть двумя agreed rules без новой classifier/state machine;
- изменение затрагивает task lifecycle, Foundation gate, tier routing,
  closure ownership или другой out-of-scope workflow contract;
- текущий diff пересекается с неизвестными operator changes и безопасное merge
  решение неочевидно.

## Handoff evidence каждого slice

Результат slice должен кратко содержать:

- закрытый RF и конкретную воспроизведённую дыру;
- изменённые canonical owners;
- что намеренно не менялось по KISS boundary;
- deterministic checks и их результаты;
- manual/non-blocking probes и честный уровень доказательства;
- generated target evidence, если менялся runtime command/workflow;
- оставшиеся blockers и точную resume action.

## Package Definition of Done

Второй пакет завершён только когда:

- RF-01, RF-03, RF-04, RF-05 и RF-12 удовлетворяют своим acceptance evidence;
- RF-12 основан на operator-approved
  `max_review_repairs_per_surface: 2`;
- RF-02 не реализован и новый protocol/bootstrap surface не появился;
- specific terminal reasons и review counters переживают resume;
- install-only/selective/bootstrap/sync contracts проверены в изолированных
  targets;
- Codex/Claude runtime outputs согласованы;
- validators, existing task cards и first-package guards не ослаблены;
- source-only tree не содержит tracked/generated package-local `shared-*`;
- `_refactor.md` обновлён фактическими статусами и evidence; общий refactor не
  помечен `complete`, пока его собственные remaining conditions не выполнены.
