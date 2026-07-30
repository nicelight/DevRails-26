# Проверка adequacy доказательств внутри `/verify`

## Идея

Усилить существующий `/verify`, не вызывая дополнительного Reviewer и не
создавая новый review mode.

Перед использованием test/probe/evidence в verdict `/verify` проверяет,
действительно ли наблюдение подтверждает конкретный task/spec claim или
observable outcome, для которого оно приведено, а не только исполняет код или
проверяет implementation detail.

Это часть обычного claim-to-evidence mapping, а не отдельная review phase или
обязательный checklist.

## Семантика

- Неадекватное evidence само по себе не является implementation failure.
- Если текущего proof недостаточно, `/verify` выполняет минимальный credible
  replacement check/probe, когда это безопасно.
- Если обязательный proof нельзя безопасно получить, применяется существующий
  `VERDICT: NEEDS-CLARIFICATION`.
- Если полученное наблюдение доказывает нарушение task-scoped normative basis,
  применяется существующий `VERDICT: FAIL`.
- `VERDICT: PASS` по-прежнему требует credible evidence для каждого
  обязательного task-scoped claim.

Новый verdict, lifecycle branch, role contract, report schema, protocol,
artifact или scheduler stage не создаётся.

## Минимальный write set

```text
skills/_shared/references/commands/verify.md
scripts/test-install-sync.mjs
```

`Reviewer`, `/red-verify`, tier policy, scheduler contracts, task schema и
installer не меняются.

## Проверки

- canonical `/verify` содержит evidence-adequacy rule;
- правило разворачивается одинаково в `.agents` и `.claude`;
- verdict и lifecycle ownership не меняются;
- отдельный Reviewer или review phase не появляется;
- install/sync smoke проходит;
- source-only tree не получает generated `shared-*`.

## Не входит в идею

- Reviewer delegation;
- findings-only Reviewer contract;
- дополнительные проверки `/red-verify`;
- обязательная lens matrix или checklist;
- новые statuses, gates или durable artifacts.
