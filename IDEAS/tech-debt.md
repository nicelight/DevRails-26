# Handoff: Reviewer-only technical debt review

## Принятое решение

DevRails получает private advisory skill
[`tech-debt-tracker`](https://github.com/bish-x/bx-dev-skill/tree/main/skills/bx-dev/skill-library/general/tech-debt-tracker),
доступный только роли `Reviewer`.

Skill использует общий role-private механизм из
[`FRONT_2skills_add.md`](FRONT_2skills_add.md):

```text
canonical source
  -> skills/_shared/role-skills/reviewer/tech-debt-tracker/

deployed target
  -> .memory-bank/role-skills/reviewer/tech-debt-tracker/
```

Новая public runtime command отсутствует.

Technical debt review остаётся read-only и advisory. Она не меняет:

- task или feature statuses;
- lifecycle ownership;
- task schema и registry;
- required gates и handoffs;
- blockers, stop conditions и resume routes;
- принятые requirements, specs и architecture decisions.

## Canonical bundle

```text
skills/_shared/role-skills/reviewer/
└── tech-debt-tracker/
    ├── SKILL.md
    ├── LICENSE
    └── references/
        ├── classification.md
        ├── prioritization.md
        └── report-guidance.md
```

Bootstrap и sync создают:

```text
.memory-bank/role-skills/reviewer/tech-debt-tracker/SKILL.md
.memory-bank/role-skills/reviewer/tech-debt-tracker/LICENSE
.memory-bank/role-skills/reviewer/tech-debt-tracker/references/**
```

Skill name и description отсутствуют:

- в `.agents/skills/`;
- в `.claude/skills/`;
- в `.memory-bank/skills/index.md`;
- в startup priming других ролей;
- в public runtime command inventory.

## Reviewer routing

Canonical Reviewer contract остаётся в:

```text
skills/_shared/references/roles/reviewer.md
```

Обычный review не загружает private skill. Launch intent, связанный с technical
debt, code health, maintenance burden или refactoring priority, активирует
следующий route:

```text
ROLE: Reviewer
  -> .memory-bank/roles/reviewer.md
  -> tech-debt-tracker/SKILL.md
  -> необходимые references
```

`Reviewer` сохраняет текущие границы роли:

- read-only execution;
- отсутствие fixes и file writes;
- отсутствие subagents;
- отсутствие product, spec, architecture, safety и public-contract decisions;
- evidence-backed findings в назначенном scope.

Отчёт возвращается вызывающему агенту или оператору. Durable debt backlog,
dashboard, registry и task records автоматически не создаются.

## Адаптация upstream

Тематический ориентир и provenance:
[bish-x/bx-dev-skill/tech-debt-tracker](https://github.com/bish-x/bx-dev-skill/tree/main/skills/bx-dev/skill-library/general/tech-debt-tracker).

Upstream описывает scanner, prioritizer, dashboard, trend tracking,
CI-интеграцию, долгосрочный roadmap и фиксированные success metrics.
DevRails-версия сохраняет только evidence review, классификацию и практическую
приоритизацию.

Адаптированный skill исключает:

- автоматическое или фоновое сканирование;
- CI/CD integration;
- dashboard и trend state;
- отдельный debt lifecycle или registry;
- фиксированные quality thresholds без project authority;
- универсальные numeric scores как замену evidence;
- автоматическое создание remediation plan, tasks или requirements;
- изменение кода и документов.

Review scope по умолчанию совпадает с переданной feature/change surface.
Repo-wide review возникает только из явного launch intent.

Finding содержит:

- точный location или evidence route;
- наблюдаемый debt mechanism;
- практическое влияние или подтверждённый риск;
- затронутую change surface;
- относительную remediation cost;
- минимальную достаточную remediation direction;
- uncertainty или owner decision, если evidence недостаточно.

Style preference, размер функции, coverage percentage, возраст dependency или
отсутствие документации сами по себе не образуют finding. Materiality опирается
на accepted project rules, повторяемую стоимость изменений, наблюдаемые
regressions, coupling, reliability risk или maintenance burden.

Архитектурная неопределённость использует `OWNER_DECISION_NEEDED`. Reviewer не
создаёт новое architecture decision от имени оператора.

## Verdict semantics

Skill использует существующий Reviewer report:

```text
verdict:
findings:
evidence_checked:
risks_or_questions:
```

Существующие verdicts сохраняются:

- `APPROVE` — material technical debt в назначенном scope не подтверждён;
- `REQUEST_CHANGES` — отчёт содержит actionable evidence-backed findings;
- `OWNER_DECISION_NEEDED` — оценка зависит от отсутствующего product, spec или
  architecture decision.

Verdict относится только к standalone technical debt review. Он не блокирует
feature, не меняет task status и не подменяет `/verify`, `/red-verify`,
`/review-tasks-plan` или их verdicts.

Принятый оператором finding входит в обычный DevRails planning route. Сам
Reviewer не создаёт requirement, feature или task.

## Event-driven reminder

Периодичность привязана к delivery event, а не ко времени.

Триггером является успешный `/mb-sync`, в котором product feature впервые
переходит в `verified`.

```text
product feature transition -> verified
  -> successful /mb-sync handoff
  -> необязательная рекомендация technical debt review
  -> решение оператора
  -> fresh-context ROLE: Reviewer
  -> private skill
  -> read-only report
```

Текст рекомендации:

> Необязательный следующий шаг для `FT-<NNN>`: fresh-context `ROLE: Reviewer`
> для проверки технического долга в изменённой поверхности feature.

Рекомендация:

- появляется только при фактическом переходе product feature в `verified`;
- отсутствует для `FT-000`;
- отсутствует при повторном sync уже verified feature;
- отсутствует для task closure и wave sync без feature transition;
- не запускает Reviewer автоматически;
- не блокирует manual или unattended flow;
- не меняет terminal state `/autopilot` или `/autonomous`;
- передаётся caller и появляется в ближайшем operator-visible результате.

Отдельный timer, cron, background process, timestamp, counter,
`last_debt_review` marker и persisted scheduler state отсутствуют. Сам feature
transition обеспечивает однократность события.

## Runtime contract changes

`reviewer.md` получает conditional route к private Reviewer skill только для
релевантного launch intent.

`mb-sync` получает одно неблокирующее handoff condition для product feature
transition в `verified`. Scheduler caller сохраняет рекомендацию в
operator-visible результате без нового handoff field или terminal status.

Общий role-private deployment остаётся единственным packaging mechanism.
Reviewer bundle не создаёт отдельную installer branch.

## Acceptance evidence

Deployment regression подтверждает:

- неизменность public runtime inventory;
- отсутствие `tech-debt-tracker` в public runtime surfaces и общем skill index;
- deployment Reviewer private skill, `LICENSE` и bundled references при
  bootstrap/sync;
- отсутствие Reviewer metadata в priming остальных ролей;
- generated-only sync semantics и сохранность unmarked files;
- отсутствие source-only paths.

Role evals подтверждают:

- отсутствие private skill в обычном Reviewer review;
- conditional loading для technical debt launch intent;
- read-only report без fixes, file writes, task creation и status mutation;
- сохранение существующих Reviewer verdicts;
- отсутствие speculative или threshold-only findings.

Workflow evals подтверждают:

- одну рекомендацию при product feature transition в `verified`;
- отсутствие рекомендации для `FT-000`, task closure, unchanged verified state
  и неуспешного sync;
- отсутствие автоматического Reviewer launch;
- одинаковую advisory-семантику в manual и scheduler flows;
- сохранение terminal states, gates и resume routes.

## License и provenance

На проверенном upstream commit
[`dd7fa7a2f65e487e49847394bff6cd5986b5877e`](https://github.com/bish-x/bx-dev-skill/tree/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/general/tech-debt-tracker)
`LICENSE`, `NOTICE`, SPDX identifier и иное разрешение на распространение не
обнаружены. GitHub repository metadata также не определяет лицензию.

Upstream text и references в DevRails bundle не копируются. Skill и его
references получают независимую формулировку общих идей классификации и
приоритизации. Bundle получает собственный MIT `LICENSE`, относящийся только к
`tech-debt-tracker` и его bundled references. `SKILL.md` сохраняет provenance
URL и проверенный upstream commit.

## Product change surface

```text
skills/_shared/role-skills/reviewer/**
skills/_shared/references/roles/reviewer.md
skills/_shared/references/commands/mb-sync.md
skills/_shared/references/workflows/mb-sync.md
skills/_shared/references/commands/autopilot.md
skills/_shared/references/commands/autonomous.md
skills/_shared/references/structure-template.md
skills/_shared/scripts/init-mb.js
scripts/test-install-sync.mjs
PROJECT_MAP.md
README.md
howItWorks.md
```

Generated `skills/*/{agents,references,scripts}/shared-*` и локальные
`.agents/`, `.claude/`, `.memory-bank/`, `.protocols/`, `.tasks/` в source repo
остаются вне change surface.
