# Единый Reviewer — предложение

## Цель

Усилить существующий `ROLE: Reviewer` лучшими non-security практиками `bx-dev`,
не перенося его набор отдельных reviewers и review lifecycle.

Целевая форма:

- один существующий `Reviewer`;
- focus задаётся свободным текстом конкретного review brief;
- один общий output contract для code, rules, QA и architecture review;
- никакой классификации `bug|compliance|qa`, named modes или отдельных prompts;
- никакого нового gate, scheduler stage, task status, registry, task field, protocol или report family;
- `/verify`, `/red-verify`, `/review-tasks-plan` и scheduler сохраняют свои текущие verdict и lifecycle ownership.

Оценка основана на текущем DevRails и точном snapshot `bx-dev` `dd7fa7a2f65e487e49847394bff6cd5986b5877e`.

## Источники

### Текущий DevRails

- `AGENTS.md:1-33` — runtime skills, workflows, protocols и validators образуют один executable contract; нельзя неявно менять verdicts, gates, blockers, statuses и handoffs.
- `AGENTS.md:35-57,122-146` — strict relevance, отсутствие scope creep и KISS.
- `AGENTS.md:148-187` — source-only packaging и обязательная проверка развёрнутого target.
- `PROJECT_MAP.md:12-40,67-80` — canonical source находится в `skills/_shared/`; installer разворачивает roles и команды в target.
- `PROJECT_MAP.md:142-205` — architecture review уже является bounded Reviewer review без отдельного lifecycle или artifact family.
- `skills/_shared/references/roles/reviewer.md:7-24` — один read-only Reviewer; launch prompt уже является primary focus; output использует `APPROVE|REQUEST_CHANGES|OWNER_DECISION_NEEDED`.
- `skills/_shared/references/roles/orchestrator.md:19-32,44-49` — делегация уже задаёт role, intent, constraints, boundary, output и адресат; Orchestrator сверяет report с source of truth.
- `skills/_shared/references/commands/architecture-review.md:21-29,58-81` — local Reviewer verdict относится только к architecture review; `/review-tasks-plan` владеет final planning verdict; отдельного artifact нет.
- `skills/_shared/references/commands/review-tasks-plan.md:47-63,89-111,153-177` — fresh Reviewer, fallback, интеграция report и сохранение final `APPROVE|REJECT`.
- `skills/_shared/references/commands/verify.md:7-10,43-65,88-96,98-175,200-238` — `/verify` владеет functional evidence и одним `PASS|FAIL|NEEDS-CLARIFICATION`, выбирает checks, проверяет source/diff, observable behavior и browser evidence.
- `skills/_shared/references/commands/red-verify.md:7-16,46-60,85-149,151-209` — independent semantic verifier со своим exact verdict; Reviewer не может заменить или расширить его.
- `skills/_shared/references/workflows/tier-policy.md:65-80,82-190,201-269` — tier gates, status ownership, retries и fast lane уже заданы.
- `skills/_shared/references/workflows/execute-loop.md:24-29,46-66,68-121`, `commands/autopilot.md:63-89,107-123,165-257`, `commands/autonomous.md:57-87,135-230` — scheduler вызывает canonical child stages и не знает о внутреннем Reviewer.
- `skills/_shared/scripts/init-mb.js:551-563,1141-1151` — canonical role автоматически копируется в `.memory-bank/roles/reviewer.md`.
- `scripts/test-install-sync.mjs:352-487,489-555,784-799,841-879,1105-1155,1217-1305` — bootstrap/sync smoke проверяет role deployment, обе runtime surfaces, verdict ownership и framework-owned sync.

### bx-dev

Источник — snapshot `dd7fa7a2f65e487e49847394bff6cd5986b5877e`:

- Репозиторий: [`bish-x/bx-dev-skill`](https://github.com/bish-x/bx-dev-skill).
- Зафиксированный snapshot: [`dd7fa7a2f65e487e49847394bff6cd5986b5877e`](https://github.com/bish-x/bx-dev-skill/tree/dd7fa7a2f65e487e49847394bff6cd5986b5877e).
- Основной источник reviewer-механик: [`skills/bx-dev/SKILL.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/SKILL.md).
- Runtime-адаптация: [`skills/bx-dev/docs/CODEX-ORCHESTRATION.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/docs/CODEX-ORCHESTRATION.md).
- `skills/bx-dev/SKILL.md:536-595` — skip по масштабу, change surface и review brief с запросом, анализом, implementation report и diff.
- `skills/bx-dev/SKILL.md:1677-1774` — source correctness, targeted checks, diff causality, high-signal filter, exact evidence и read-only handoff.
- `skills/bx-dev/SKILL.md:1874-1958` — scoped project authority, применимость, точная цитата, запрет inferred conventions и pre-existing findings.
- `skills/bx-dev/SKILL.md:1960-2025` — observable acceptance, UI/API/CLI, regression, boundary inputs, reproduction и browser cleanup.
- `skills/bx-dev/docs/CODEX-ORCHESTRATION.md:127-155` — brief, write boundary и structured report.
- `skills/bx-dev/docs/CODEX-ORCHESTRATION.md:194-201` — недоступный browser/URL остаётся непроверенным; source inspection не даёт browser pass.

## Отобранные способности bx-dev

### 1. Review brief как единственный selector focus

Caller передаёт одному Reviewer:

- review target и требуемый результат;
- current basis: task/feature/artifact, execution attempt или planning revision;
- actual change surface и implementation handoff;
- конкретный focus и обязательные coverage questions;
- применимые accepted authorities;
- доступные checks/runtime и ограничения side effects;
- explicit out-of-scope;
- ожидаемый общий report contract.

Reviewer не выбирает named mode. Один brief может совместить несколько
релевантных concern lenses, если это дешевле одного повторного чтения change.

### 2. Source correctness по причинности текущего change

Переносится способность проверять:

- syntax/import/module resolution и фактическую запускаемость;
- гарантированные type/null failures;
- branching, state-transition, off-by-one и loop defects;
- algorithm/data-flow, retry/idempotency и persistence/recovery defects;
- task/spec ↔ implementation mismatch;
- regression, причинно внесённую текущим change;
- результаты релевантных tests, lint и typecheck.

Finding допустим, когда Reviewer может назвать точное место или runnable
evidence, объяснить неправильное observable consequence и связать defect с
reviewed change. Контекст вне diff читается только для доказательства этой
причинности. Failed deterministic check остаётся evidence; Reviewer не
пересказывает style diagnostics как самостоятельные findings, если brief или
explicit authority не делают их материальными.

### 3. Exact explicit authority

Переносится способность:

- находить root и scoped `AGENTS.md`, применимый legacy `CLAUDE.md`, task
  constraints и прямые canonical specs;
- проверять directory/subject scope authority;
- для finding называть точное правило и источник;
- не превращать двусмысленную рекомендацию, inferred convention или
  неприменимую authority в defect;
- не сообщать pre-existing нарушение, если reviewed change его не внёс и не
  сделал материально достижимым.

### 4. Observable QA evidence

Переносится способность:

- отображать acceptance criteria на фактические checks;
- проверять реальное UI/API/CLI behavior, smoke/regression и применимые
  empty/invalid/boundary cases;
- для runtime finding записывать steps, expected, actual и evidence;
- для web использовать переданный runtime/base URL и доступный browser tool;
- записывать URL, relevant viewport/device и redacted artifact;
- закрывать открытые browser sessions после проверки;
- не выводить `APPROVE` из source inspection, когда brief требует observable
  browser behavior.

Если browser/tool/URL или безопасное test state недоступны, Reviewer фиксирует
точный coverage gap и не выдаёт положительный локальный verdict.

### 5. High-signal и read-only discipline

Переносятся:

- findings только в границах brief и actual change;
- отсутствие style/naming/nit/refactor preferences без explicit authority;
- отсутствие speculative improvements и предполагаемых defects без evidence;
- severity только по concrete impact;
- self-check каждого finding: authority, evidence, causality, impact;
- read-only работа без fixes, task/BUG/status/spec edits и без subdelegation;
- checks только без разрушительных или неразрешённых side effects.

`Read-only` не означает, что любая test/browser команда безопасна. Разрешены
non-mutating checks либо явно разрешённые изолированные probes с cleanup. Если
требуемый probe меняет project/external state за пределами brief, Reviewer
возвращает gap вызывающему owner.

### Что не переносится

- отдельные Bug, Compliance и QA roles/prompts или любые named modes;
- Security Reviewer, security checklist, threat/abuse-path analysis и любое
  reviewer security routing;
- обязательный Reviewer для каждой non-trivial task;
- filename/line-count/наличие `AGENTS.md` как автоматический spawn trigger;
- `TRIVIAL|MODERATE|COMPLEX` как второй risk/tier classifier;
- параллельный fan-out нескольких reviewers и merge/dedup lifecycle;
- reviewer agent IDs, teammate slots, waiting state и reviewer registry;
- `--careful`, `dev_server_url` state field и отдельный QA stage;
- automatic fix для MINOR/INFO, commit/amend и review/fix retry loop;
- `BUG-001|COMP-001|QA-001` как глобально выглядящие identifiers;
- bx `Status: DONE|BLOCKED|...` и отдельный reviewer status vocabulary;
- Python-specific tool policy и другие upstream project assumptions.

## Предлагаемая переработка DevRails

### 1. Один role contract

Расширить `skills/_shared/references/roles/reviewer.md`, не создавая других
roles или skills.

Нормативное ядро:

1. Launch brief определяет target, basis, focus, required coverage, authority,
   safe checks, boundary и out-of-scope.
2. Reviewer проверяет только этот brief, но читает минимальный adjacent context,
   необходимый для доказательства.
3. Reviewer может применить source correctness, exact authority и observable
   behavior как concern lenses, а не режимы.
4. Reviewer не исправляет и не создаёт durable artifacts; report возвращается
   caller, который решает, что записать в уже существующий owned artifact.
5. Reviewer verdict локален только assigned review surface. Он никогда не
   является `/verify PASS|FAIL|NEEDS-CLARIFICATION`,
   `/red-verify` semantic verdict, `/review-tasks-plan APPROVE|REJECT` или
   lifecycle decision.

### 2. Единый output contract

Сохранить существующие verdict values, чтобы не ломать architecture review:

```text
REVIEW_REPORT
review_target: <task|feature|artifact and path/id>
review_basis: <attempt/revision/diff/handoff/runtime identity>
review_focus: <brief-defined questions>
verdict: APPROVE|REQUEST_CHANGES|OWNER_DECISION_NEEDED
findings:
- severity: BLOCKER|HIGH|MEDIUM|LOW
  location: <file:line, flow, criterion, or none>
  evidence: <command/result or durable artifact>
  authority: <exact accepted rule or none>
  impact: <concrete consequence>
  recommendation: <smallest correction or next probe>
evidence_checked:
- <source, command/result, flow, artifact>
coverage_gaps:
- <required question/evidence not checked or none>
risks_or_questions:
- <exact owner question or none>
```

Семантика:

- `APPROVE` — весь обязательный focus из brief покрыт, `coverage_gaps: none`,
  material findings и owner questions отсутствуют. Это только bounded local
  approval.
- `REQUEST_CHANGES` — evidence доказывает material violation accepted target
  или exact applicable authority. Missing evidence само по себе не является
  implementation defect.
- `OWNER_DECISION_NEEDED` — review нельзя завершить из-за unresolved authority,
  требуемого owner input/access или отсутствующего обязательного evidence/probe.
  Caller может закрыть gap другим способом; этот marker не предрешает его
  canonical verdict.

Отдельные `NO_FINDINGS`, `BLOCKED`, `UNVERIFIED`, `QA passed` и `QA failed` не
нужны. Отсутствие findings значимо только вместе с полным coverage и
`APPROVE`; неполное coverage всегда видно в `coverage_gaps` и не допускает
`APPROVE`.

### 3. Routing и skip

- `/architecture-review` продолжает всегда получать один fresh Reviewer по
  текущему contract. Его local verdict интегрируется `/review-tasks-plan`.
- `/verify` может вызвать одного fresh Reviewer только когда brief-defined
  source/authority/observable check добавляет независимое evidence дешевле, чем
  повтор всей проверки в основном context.
- В одном вызове `/verify` используется не более одного Reviewer; caller
  объединяет применимые concern lenses в один brief.
- Не запускать Reviewer для safe T0, очевидного малого T1, полностью покрытого
  deterministic checks, отсутствия конкретной uncertainty или уже полученного
  эквивалентного evidence.
- Tier, число файлов/строк и наличие project guide сами по себе не являются
  trigger.
- `/red-verify` в этом патче не меняется и не получает reviewer routing: его
  existing independent semantic coverage и verdict ownership уже достаточны.
- Scheduler не запускает Reviewer напрямую. Для него по-прежнему существуют
  только `execute|verify|red-verify|closure` и текущие run-level stages; optional
  Reviewer является внутренней тактикой owning command.
- При недоступной fresh delegation caller выполняет тот же bounded review
  локально либо использует собственную existing blocker/verdict semantics.

Reviewer report является supporting evidence. `/verify` самостоятельно
проверяет его current basis, evidence и claim mapping перед functional verdict.
Ни `APPROVE`, ни пустой findings list не заменяют verifier-owned proof.

### 4. Correction handoff

- implementation defect → caller фиксирует evidence и передаёт correction в
  `/exe <TASK_ID>`; затем повторяются только tier-required gates;
- planning/spec/authority ambiguity → существующий owner
  `/feature-to-tasks`, `/feature-doctor` или `/spec-design`, затем current review;
- missing runtime/tool/evidence → owning command получает допустимый probe либо
  применяет собственный `NEEDS-CLARIFICATION`/semantic concern contract;
- architecture finding → `/review-tasks-plan` сохраняет текущего repair owner и
  final verdict ownership;
- Reviewer никогда не создаёт BUG/follow-up task и не меняет lifecycle.

### 5. Report identity и freshness

`review_basis` обязателен:

- task review — task ID, current Execution Attempt, implementation handoff и
  actual diff/change surface;
- planning review — feature ID и current positive Planning Revision;
- browser/runtime review — base URL, relevant environment/device/viewport и
  observation time/artifact;
- document review — exact artifact paths/revisions.

После нового execution attempt, material diff, Planning Revision или runtime
basis прежний report не используется как current evidence. Для этого не нужен
новый field или registry: identity живёт в launch/report и при необходимости
цитируется owning command в существующем protocol/report.

### 6. Source-only deployment и tests

`reviewer.md` остаётся canonical в `skills/_shared/references/roles/`.
`init-mb.js` уже разворачивает его в `.memory-bank/roles/`; команды генерируются
в обе runtime surfaces из canonical command sources. Installer logic и
generated package-local `shared-*` менять нельзя.

Минимальные regression assertions:

1. Fresh bootstrap и full sync разворачивают exact canonical Reviewer role.
2. `.agents` и `.claude` получают одинаковые обновлённые owning commands.
3. Role содержит один brief-driven contract и не содержит named reviewer modes.
4. Output сохраняет только три текущих local verdict values и требует basis,
   evidence, coverage gaps и exact authority.
5. `APPROVE` требует полного brief coverage; source-only browser review не может
   его выдать.
6. Reviewer не выдаёт functional/semantic/planning-final/lifecycle verdict и не
   изменяет code, task, BUG, spec или status.
7. `architecture-review` использует общий report, но
   `/review-tasks-plan` сохраняет final ownership и отсутствие отдельного
   artifact.
8. `/verify` delegation optional, максимум один Reviewer, tier не trigger,
   unavailable delegation имеет local fallback.
9. `/red-verify`, tier policy, scheduler stage vocabulary и terminal states не
   изменены.
10. Source-only check возвращает `0`; install-only/bootstrap smoke проходят в
    изолированных targets.

Статические prompt assertions не доказывают фактическую read-only дисциплину
или качество model review. Отдельный agent-runtime harness не нужен для этого
минимального патча; не следует вводить его как новый gate.

## Аргументы за

- Один role contract устраняет prompt proliferation и расхождение между
  отдельными reviewers.
- Brief-driven focus уже соответствует текущему Reviewer и Orchestrator.
- Correctness causality и exact authority заметно снижают false positives.
- Explicit coverage gaps устраняют ложное «no findings = PASS».
- Observable QA evidence усиливает `/verify`, не создавая отдельный QA workflow.
- Существующий architecture-review доказывает совместимость bounded child
  verdict с final ownership вызывающей команды.
- Никаких новых runtime сущностей, scheduler recovery paths или task schema.
- Source-only deployment уже поддерживает изменение role без installer redesign.

## Аргументы против

- `/verify` уже содержит большую часть correctness и QA semantics; неудачный
  brief создаст дублирование и расход context.
- Generic `APPROVE` может быть ошибочно воспринят как workflow PASS, поэтому
  bounded-local semantics и coverage requirement должны быть явными.
- `OWNER_DECISION_NEEDED` покрывает также недостающий обязательный
  input/access; caller обязан отличить такой gap от product decision.
- Prompt не может механически гарантировать read-only checks и browser isolation.
- Fresh agent может не иметь нужного runtime tool или локального контекста;
  fallback должен оставаться дешёвым.
- Избыточное перечисление concern lenses превратит роль в checklist; правила
  должны оставаться coverage criteria, а не обязательным порядком.

## Общая оценка (целесообразность и сложность 1-10)

- **Целесообразность: 8/10.** Высокая ценность у единого high-signal/evidence
  contract; она падает, если Reviewer сделать обязательной фазой.
- **Сложность применения: 4/10.** Schema, lifecycle, protocols и installer не
  меняются; основная сложность — согласовать единый report с architecture review
  и не ослабить `/verify` ownership.

## Затрагиваемые файлы DevRails и примерный объём изменений

| Файл | Изменение | Объём |
|---|---|---:|
| `skills/_shared/references/roles/reviewer.md` | brief, concern lenses, high-signal/read-only rules, единый report | 45–65 строк |
| `skills/_shared/references/commands/verify.md` | optional single-Reviewer routing, skip/fallback, evidence admission | 18–30 строк |
| `skills/_shared/references/commands/architecture-review.md` | общий report и bounded-local verdict | 8–14 строк |
| `skills/_shared/references/commands/review-tasks-plan.md` | basis/coverage integration без смены final owner | 6–12 строк |
| `skills/_shared/references/roles/orchestrator.md` | минимальные обязательные поля Reviewer brief | 4–8 строк |
| `scripts/test-install-sync.mjs` | role source/sync и обе runtime surfaces, contract assertions | 55–90 строк |
| `PROJECT_MAP.md` | unified Reviewer hotspot и ownership boundary | 10–16 строк |

Итого: **7 файлов, примерно 146–235 строк**.

Не менять:

- `skills/_shared/references/commands/red-verify.md`;
- `skills/_shared/references/workflows/{tier-policy,execute-loop,autonomy-policy}.md`;
- `skills/_shared/references/commands/{autopilot,autonomous}.md`;
- task schema, protocol templates, `init-mb.js`, installer, deployable `AGENTS.md`;
- README/howItWorks, пока public workflow и command set не меняются.

Новых файлов runtime не требуется.

## Итоговая рекомендация

Принять минимальный патч: усилить один существующий `ROLE: Reviewer` как
brief-driven read-only reviewer с source correctness, exact authority,
observable QA evidence и high-signal filtering.

Сохранить три текущих local verdict values, добавить обязательные basis и
coverage gaps, а все canonical verdicts и correction/lifecycle decisions
оставить текущим owning commands. Reviewer остаётся optional внутренней тактикой
`/verify` и существующим bounded child для architecture review; scheduler и
`/red-verify` не меняются.

Не переносить bx roles, modes, selection heuristics, fan-out, state, automatic
fix/review loops или любой security reviewer material.
