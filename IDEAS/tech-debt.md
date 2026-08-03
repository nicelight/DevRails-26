# Handoff: advisory technical debt report

## Принятое решение

DevRails получает public runtime skill `/tech-debt` для отдельной проверки
технического долга в заданной change surface.

Skill можно запустить явно в любой момент. После успешного завершения очередной
wave или product feature DevRails предлагает его как необязательный следующий
шаг:

> Необязательный следующий шаг: `/tech-debt <wave, feature или change scope>` —
> собрать отчёт о техническом долге в завершённой поверхности.

Рекомендация не запускает skill автоматически, не является gate и не меняет
результат завершённого workflow.

## Input

Invocation задаёт проверяемую поверхность:

```text
/tech-debt FT-<NNN>
/tech-debt wave <N>
/tech-debt <явный path, diff или change scope>
/tech-debt repo-wide
```

Feature или wave scope разрешается через относящиеся к ней task records,
evidence и фактически изменённые файлы. `touched_files` остаётся advisory и не
считается полным доказательством change surface.

Repo-wide review выполняется только при явном `repo-wide` intent.

## Behavior

Skill анализирует назначенную поверхность и создаёт один новый Markdown-отчёт
в:

```text
PAPERCUTS/TECHDEBTS/
```

Кроме нового отчёта skill не изменяет файлы проекта. Существующие отчёты не
перезаписываются.

Skill не:

- исправляет найденный долг;
- создаёт или меняет requirements, features, tasks и specs;
- меняет task/feature statuses или lifecycle;
- создаёт blocker, gate, verdict или resume route;
- запускает другие skills или agents;
- создаёт dashboard, registry, scheduler state или отдельный debt lifecycle.

## Report contract

Отчёт содержит:

- проверенный scope;
- evidence и точные locations;
- подтверждённые findings;
- практическое влияние каждого finding;
- относительный priority и минимальное remediation direction;
- uncertainty, если evidence недостаточно для уверенного вывода.

Finding включается только при наблюдаемом debt mechanism и материальном влиянии:
повторяемой стоимости изменений, coupling, regressions, reliability risk или
maintenance burden.

Style preference, размер функции, coverage percentage, возраст dependency или
отсутствие документации сами по себе не являются technical debt finding.

Если material findings не подтверждены, skill всё равно создаёт отчёт и явно
фиксирует результат. Отчёт advisory: его наличие и содержимое ничего не
блокируют. Решение о remediation остаётся у оператора и проходит через обычный
DevRails planning flow только после отдельного явного решения.

## Recommendation contract

Успешный operator-visible handoff, который завершает wave или product feature,
содержит одну краткую рекомендацию `/tech-debt` с доступным scope.

Рекомендация:

- не появляется вместо основного результата;
- не запускает skill автоматически;
- не меняет terminal state, gates, handoffs или lifecycle;
- не требует timer, counter, marker, deduplication или persisted scheduler
  state;
- может повториться после следующей успешно завершённой wave или feature.

## Acceptance evidence

- `/tech-debt` установлен в public runtime surfaces Codex и Claude;
- явный запуск создаёт один новый report в `PAPERCUTS/TECHDEBTS/` и не выполняет
  других writes;
- каждый finding связан с проверяемым evidence и location;
- отсутствие material debt отражается report без findings, а не выдуманными
  findings;
- successful wave/feature handoff предлагает skill, но не запускает его;
- запуск и результат не меняют существующие statuses, gates, blockers,
  terminal states и resume routes;
- установленный skill не содержит source-only paths.

## Provenance

Тематический ориентир:
[`bish-x/bx-dev-skill/tech-debt-tracker`](https://github.com/bish-x/bx-dev-skill/tree/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/general/tech-debt-tracker).

DevRails skill формулируется независимо и не копирует upstream text или
references. Scanner infrastructure, dashboard, trend tracking, CI integration,
фиксированные numeric metrics и remediation roadmap не переносятся.

## Product change surface

```text
skills/_shared/references/commands/tech-debt.md
skills/_shared/references/commands/mb-sync.md
skills/_shared/references/commands/autopilot.md
skills/_shared/references/commands/autonomous.md
scripts/test-install-sync.mjs
PROJECT_MAP.md
README.md
howItWorks.md
```

Deployment `PAPERCUTS/TECHDEBTS/` уже обеспечивается отдельно и не входит в
scope этой идеи.

Generated `skills/*/{agents,references,scripts}/shared-*` и локальные
`.agents/`, `.claude/`, `.memory-bank/`, `.protocols/`, `.tasks/` в source repo
остаются вне change surface.
