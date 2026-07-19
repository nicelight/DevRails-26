# Global skills refactor — handoff второго repair-пакета

## Статус и назначение

- Дата handoff: 2026-07-19.
- Operator clarification: 2026-07-20.
- Статус пакета: `implemented_and_validated`.
- Реализованный scope: RF-01, RF-03, RF-04, RF-05 и RF-12; RF-02 `excluded`.
- Для RF-12 принято ровно `2` завершённых цикла
  `repair -> re-review` на одну review surface.

Это не продолжение широкого Stage 2 refactor и не задача «улучшить DevRails».
Пакет закрывает пять воспроизводимых дыр минимальными изменениями существующих
workflow owners. Новый capability, альтернативный workflow и общая переработка
prompts находятся вне scope.

## Источники и их приоритет

1. [`_refactor.md`](./_refactor.md) — текущий authoritative repair register:
   статусы, KISS-решения, scope и Definition of Done каждого RF.
2. Текущий canonical source в `skills/_shared/`, фактический
   `scripts/install-framework.mjs`, validators и воспроизводимые agent-run
   checks — источник истины о реально существующих owners, путях и generated
   target behavior.
3. [`global-skills-refactor.md`](./global-skills-refactor.md) — только
   сохраняемые workflow-инварианты и исходная граница между outcome contract и
   локальной тактикой.
4. [`global-skills-refactor-stage1-handoff.md`](./global-skills-refactor-stage1-handoff.md)
   — historical evidence: уже сохранённые Product/Design contracts, ограничение
   static assertions и требование проверять доступность references в target.

По позднему operator override Slice 7 включает точечное обновление `README.md`
и `howItWorks.md`. Документы не являются источником design decisions, но после
integration validation должны правдиво описывать изменённые runtime contracts.

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
- refactor `/red-verify`, `/feature-to-tasks`, `/foundation-to-tasks`, `/execute-task`
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
- Для RF-12 принято ровно `2` завершённых `repair -> re-review` цикла на
  review surface без отдельного policy/config field.
- Принятые guards первого пакета в canonical commands, installer и validators
  являются compatibility boundary: второй пакет не должен их откатывать или
  ослаблять.
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
- Не менять contract или implementation `/mb-sync`: RF-05 правится только в
  `/mb-garden` и использует существующий `/mb-sync` как отдельный handoff owner.
- Для RF-12 не менять `autonomy-policy.md`, `run-status-template.md` и task
  schema. Exact limit и работа с compact counter описываются только внутри
  canonical `/autonomous`; counter хранится в уже существующем run status.
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
| Documentation | Slice 7 точечно обновляет `README.md` и `howItWorks.md` без broad rewrite |
| RF-05 sync boundary | `/mb-sync` не меняется; при необходимости garden делает handoff существующему owner |
| Behavioral validation | deterministic agent-run checks плюс manual/non-blocking prompt evidence, без eval subsystem |
| RF-12 limit | ровно 2 завершённых `repair -> re-review` цикла на surface |
| RF-12 storage | compact counters в existing autonomous run status; без нового file/template/schema |
| RF-12 owner | только canonical `/autonomous`; policy/template не меняются |

### Принятое решение RF-12

Operator-approved exact contract:

```text
maximum completed repair -> re-review cycles per surface: 2
```

Отдельная configurability или policy field не добавляется. Initial review не
считается попыткой; counter отражает только завершённые repair/re-review пары.

## Scope map

| RF | Severity | Закрываемая дыра | Минимальный owner |
|---|---:|---|---|
| RF-01 | High | install-only/selective runtime обещает недоступный local `/mb-init` route | canonical `/mb-init` и `/cold-start`; existing external installer |
| RF-03 | High | generic no-ready fallback стирает specific terminal blocker | `workflows/autonomy-policy.md`; leaf references в `/autonomous` и `/autopilot` |
| RF-04 | Medium | `/map-codebase` принуждает 5–7 workers/fan-out и повторно спрашивает уже переданный delta | существующий `/map-codebase` command |
| RF-05 | Medium | `/mb-garden` валидирует до mutation и сам принимает semantic/destructive решения | только существующий `/mb-garden` command; `/mb-sync` без изменений |
| RF-12 | Medium | review repair limit неоднозначен и сбрасывается при resume | только `/autonomous` и existing autonomous run status |

## Slice 1 — RF-01A: honest external `/mb-init`

### Required behavior

- Generated `/mb-init` является thin blocker/router и сам не создаёт skeleton.
- При известном checkout он даёт точную исполнимую команду:

  ```bash
  node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --target <target-repo> --yes
  ```

- Для explicit sync существующего target используется поддерживаемая форма:

  ```bash
  node <devrails-checkout>/scripts/install-framework.mjs --bootstrap-only --sync --target <target-repo> --yes
  ```

- При неизвестном checkout path команда не угадывает executable path, а
  возвращает blocker с требуемым external action и resume через повторный
  `/mb-init`.
- Ручная сборка по template, target-local helper, auto-install dependency и
  новый installer mode запрещены.

### Surfaces and evidence

- `skills/_shared/references/commands/mb-init.md`;
- `skills/mb-init/SKILL.md` как executable package surface, а не общий docs pass;
- минимальные agent-run RF-01A assertions.

Selective `mb-init` target должен содержать только generated command pair без
skeleton/helper, сохранять Codex/Claude parity и выдавать executable external
route либо честный blocker.

## Slice 2 — RF-01B: standalone selective `/cold-start`

### Required behavior

- Selective `/cold-start` не предполагает, что `/mb-init` установлен.
- При отсутствующей `.memory-bank/` он напрямую выдаёт RF-01A external route и
  после bootstrap предлагает повторить исходный `/cold-start`.
- Existing `AGENTS.md` и Memory Bank проходят только через текущую installer
  policy; router её не обходит.

### Surfaces and evidence

- `skills/_shared/references/commands/cold-start.md`;
- `skills/cold-start/SKILL.md` как executable package surface;
- selective `cold-start`, fresh bootstrap, explicit sync и existing-AGENTS
  fixtures в изолированных agent-run targets.

Target не получает dangling `/mb-init` dependency или второй bootstrap surface.
`README.md` и `howItWorks.md` не входят в RF-01 slices и обновляются один раз в
Slice 7 после integration validation.

## Slice 3 — RF-04: proportional `/map-codebase`

### Required behavior

- Убрать mandatory 5–7 workers и fixed fan-out/fan-in.
- Малый repository допускает direct reads одним агентом.
- Для действительно широкого discovery разрешены `/context-manifest` или
  bounded delegation только если текущая роль и operator contract это
  позволяют.
- Сохранить existing evidence-backed baseline outputs, facts-vs-inferences,
  unresolved evidence и PRD-less prohibition на roadmap/tasks.
- Уже переданный authoritative delta сохранить как downstream input и не
  спрашивать повторно. При отсутствующем delta immediate handoff может запросить
  его у оператора.
- Удалить только дублированную дальнюю downstream chain и оставить
  непосредственного existing owner.

### Surfaces and evidence

- основной implementation surface:
  `skills/_shared/references/commands/map-codebase.md`;
- минимальные targeted assertions и manual probes без нового runner.

Small-repo probe не создаёт искусственных workers; large-repo wording допускает,
но не требует bounded delegation; supplied delta не переспрашивается; отсутствие
delta не приводит к созданию EP/FT/TASK.

## Slice 4 — RF-05: KISS `/mb-garden`

### Required behavior

1. Сначала выполнить read-only scan и классифицировать findings.
2. Перед edits назвать точные intended files в transient working context. Не
   создавать write-set artifact, matrix, lifecycle или protocol.
3. Автоматически исправлять только однозначные mechanical stale links, indexes
   и routers.
4. Archive/delete/merge, competing canonical choice, TODO-to-task conversion и
   material canonical/task/governance change не выполнять: вернуть точный
   blocker и handoff существующему owner/operator.
5. После фактических garden edits запустить final lint по изменённому состоянию.
6. Doctor запускать только на уже существующей readiness/risk boundary, без
   новой applicability matrix.
7. Если найден broader durable-state reconciliation, сделать handoff
   существующему `/mb-sync`. Не менять, не дублировать и не пересказывать его
   contract внутри garden.

### Surfaces and evidence

- единственный behavior owner:
  `skills/_shared/references/commands/mb-garden.md`;
- `skills/mb-garden/assets/mb-lint.mjs`, `mb-doctor.mjs`, canonical `/mb-sync`
  command и workflow не меняются;
- agent-run verification получает только минимальные ordering/ownership assertions.

Acceptance относится к garden-owned edits: они остаются в названных intended
files и заканчиваются final lint. Semantic/destructive scenario ничего не
мутирует. Cosmetic cleanup не запускает sync; broader reconciliation получает
handoff к существующему `/mb-sync` как отдельному owner.

## Slice 5 — RF-03: minimal terminal fallback repair

`HALT_DEPENDENCY_DEADLOCK` не вводится этим пакетом: он присутствует в terminal
vocabulary с initial import `bdb8c86` от 2026-06-22. Его удаление было бы
отдельным изменением публичного terminal contract и находится вне этого repair.

### Required behavior

В existing `skills/_shared/references/workflows/autonomy-policy.md` добавить
только два правила:

1. Уже записанный specific `HALT_*`, reason, owner и resume route нельзя
   заменять generic dependency deadlock.
2. `HALT_DEPENDENCY_DEADLOCK` допустим только для genuine dependency-only graph
   exhaustion, когда незакрытые records non-runnable исключительно из-за
   незакрытых task dependencies.

`/autonomous` и `/autopilot` только применяют эту норму, не создавая classifier,
precedence table, parser, registry или persisted blocker field. Пустой task
index нарушает existing non-empty input contract `/autopilot` и возвращает
`HALT_QUALITY_GATES` с точной причиной. Repair идёт через существующий planning
owner, уже определённый authoritative Foundation/product state; если такого
state нет, команда требует от оператора предоставить reviewed non-empty queue,
а не угадывает новый planning route. После review и strict readiness resume —
повторный `/autopilot`.

### Surfaces and evidence

- `skills/_shared/references/workflows/autonomy-policy.md`;
- `skills/_shared/references/commands/autonomous.md`;
- `skills/_shared/references/commands/autopilot.md`;
- targeted agent-run assertions/fixtures.

Specific halt и resume evidence переживают no-ready fallback/resume; empty index
даёт quality halt; genuine dependency-only exhaustion сохраняет existing
deadlock terminal state. Новые statuses или fields не создаются.

## Slice 6 — RF-12: exactly two review repair cycles inside `/autonomous`

### Required behavior

- Contract добавляется только в canonical `/autonomous`.
- Initial review не считается repair attempt.
- Один attempt — завершённый repair плюс последующий re-review той же surface;
  counter увеличивается ровно один раз после этой пары.
- Для одного `feature-plan` или `task-plan:FT-<NNN>` разрешены ровно две такие
  пары. `APPROVE` продолжает flow; повторный `REJECT` после второй пары пишет
  existing `HALT_REVIEW_REJECT`, latest findings и named repair owner.
- Compact counters по реально reviewed surfaces записываются в existing
  `.protocols/AUTONOMOUS-RUN/status.md` внутри existing Review gates section.
  Новый file, template, schema, policy field или registry не создаётся.
- Resume читает existing counter и не сбрасывает его. Exhausted surface не
  входит снова в automatic repair loop; operator-directed repair возвращается
  к тому же review, и только `APPROVE` продолжает recorded flow.

### Surfaces and evidence

- behavior change:
  `skills/_shared/references/commands/autonomous.md`;
- minimal agent-run exact-number/off-by-one assertions;
- `autonomy-policy.md`, `run-status-template.md`, task cards/schema и installer
  не меняются.

Deterministic evidence проверяет точное число `2`, отсутствие `2-3`, отсутствие
новых artifacts и generated Codex/Claude parity. Initial-review, off-by-one и
resume semantics остаются честными manual/non-blocking probes.

## Slice 7 — package integration validation and register closure

- Выполнить полный blocking validation matrix ниже в isolated targets.
- Проверить совместимость existing task cards и first-package guards.
- Обновить `_refactor.md` фактическими статусами и evidence каждого RF.
- Точечно обновить `README.md` и `howItWorks.md` по RF-01, RF-03, RF-04, RF-05
  и RF-12 без broad rewrite или новой documentation architecture.

Slices исполняются строго последовательно. Особенно важно завершить RF-03 до
RF-12, потому что оба меняют `/autonomous`. Каждый slice содержит один bounded
behavior change и собственную минимальную regression evidence; общая abstraction
между ними не создаётся.

## Validation matrix

### Blocking deterministic checks

- `npm run check:syntax --silent`;
- `git diff --check`;
- существующие syntax/source/install/bootstrap checks плюс только минимальные
  targeted assertions, непосредственно закрывающие regression текущего slice;
- install-only всех commands в отдельный temporary target;
- selective install `cold-start` и `mb-init` в отдельных temporary targets;
- fresh bootstrap;
- explicit sync existing target;
- existing `AGENTS.md` safety fixture;
- generated Codex/Claude equality;
- fresh/applicable `mb-lint` и doctor fixtures без изменения их meaning;
- existing JSON task-card compatibility;
- отсутствие изменений в canonical `/mb-sync`, `run-status-template.md` и task
  schema; truthfulness точечно обновлённых `README.md` и `howItWorks.md`;
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
6. broader garden reconciliation возвращает handoff existing `/mb-sync`, не
   расширяя garden mutation;
7. specific halt переживает no-ready fallback и resume;
8. empty index даёт `HALT_QUALITY_GATES`, а genuine dependency-only exhaustion
   сохраняет existing deadlock;
9. review counter соблюдает exact limit `2`, не имеет off-by-one и переживает
   resume без reset.

Если scenario нельзя воспроизвести детерминированно без model-eval system, его
результат остаётся явно manual/non-blocking evidence. Это не основание строить
CI infrastructure.

Для RF-12 deterministic evidence не считается доказательством фактического
runtime counting/resume поведения модели: оно доказывает только contract shape
и generated parity. Off-by-one и resume остаются manual/non-blocking probes.

### Выполненное evidence (2026-07-20)

- Blocking deterministic matrix: `PASS` — syntax, `git diff --check`, existing
  source assertions, full install-only, selective `cold-start`/`mb-init`, fresh
  bootstrap, explicit sync, custom `AGENTS.md` preservation, Codex/Claude
  parity, fresh/applicable lint+doctor fixtures и existing JSON task-card
  compatibility.
- First-package guards: `PASS` в existing release assertions и bootstrap/doctor
  fixtures.
- Source-only `shared-*` count: `0`.
- Prompt-only checklist 1–9: manual contract-shape inspection `PASS`; generated
  parity подтверждена deterministic fixtures. Это не model-behavior proof и не
  отдельный blocking eval.
- Integration fixes вне documentation/registers не потребовались.

## Stop conditions

Немедленно остановить affected slice и вернуть вопрос оператору, если:

- fix требует нового status/schema/task field/registry/artifact family;
- RF-01 требует target-local helper или нового installer mode;
- deployed skill ссылается на source-only path, который нельзя заменить
  существующим external route или доступным target reference;
- RF-04 требует менять public baseline outputs, а не только forced tactic;
- RF-05 требует semantic canonical/destructive decision без owner approval;
- RF-05 требует менять `/mb-sync`, lint/doctor implementation или создавать
  durable write-set/ownership artifact;
- RF-03 нельзя закрыть двумя agreed rules без новой classifier/state machine;
- RF-12 требует менять что-либо кроме canonical `/autonomous` и минимальных
  agent-run assertions;
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
- RF-12 допускает ровно `2` завершённых `repair -> re-review` цикла на surface,
  хранит compact counter в existing run status и не создаёт policy field,
  template, schema или artifact;
- RF-02 не реализован и новый protocol/bootstrap surface не появился;
- specific terminal reasons и review counters переживают resume;
- install-only/selective/bootstrap/sync contracts проверены в изолированных
  targets;
- Codex/Claude runtime outputs согласованы;
- validators, existing task cards и first-package guards не ослаблены;
- canonical `/mb-sync`, `run-status-template.md` и task schema не менялись;
  `README.md` и `howItWorks.md` точечно синхронизированы с runtime contracts;
- source-only tree не содержит tracked/generated package-local `shared-*`;
- `_refactor.md` обновлён фактическими статусами и evidence; общий refactor не
  помечен `complete`, пока его собственные remaining conditions не выполнены.
