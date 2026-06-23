# KISS Behavior Specs для DevRails

## Цель

Добавить optional JSON-сценарии поведения для важных или неоднозначных фич.

Behavior spec фиксирует конкретный `given / when / then` пример, который агент
может использовать как контекст при реализации.

## Scope

Использовать только когда это реально помогает:

- core happy path важной фичи;
- negative / edge case с риском неверной реализации;
- T2/T3 поведение, где acceptance criteria можно выполнить слишком узко;
- API/state/domain/UI flow, которому нужен конкретный пример поведения.

Не создавать behavior specs для простых T0/T1, механических или очевидных задач.

## Место в workflow

Behavior specs создаются в `/prd-to-tasks`, когда фича уже выбрана и перед
нарезкой task records понятно, какие сценарии нужны.

`/prd` может только добавить секцию `## Behavior specs` в feature template.

## Хранение

```text
.memory-bank/behavior-specs/
  FT-001-BHV-001-login-success.behavior.json
  FT-001-BHV-002-invalid-password.behavior.json
```

Без registry/index.

## Формат

```json
{
  "id": "FT-001-BHV-001",
  "feature_id": "FT-001",
  "title": "Successful login with valid credentials",
  "given": {
    "user": {
      "exists": true,
      "email": "user@example.com",
      "password": "correct-password"
    }
  },
  "when": {
    "action": "login",
    "payload": {
      "email": "user@example.com",
      "password": "correct-password"
    }
  },
  "then": {
    "response": {
      "status": 200
    },
    "session": {
      "authenticated": true
    }
  }
}
```

## Связь с feature

В feature doc добавлять Markdown-секцию:

```md
## Behavior specs
- `.memory-bank/behavior-specs/FT-001-BHV-001-login-success.behavior.json`
- `.memory-bank/behavior-specs/FT-001-BHV-002-invalid-password.behavior.json`
```

## Связь с task records

Новые task fields не добавлять.

Ссылать behavior specs только как source/context:

```json
{
  "source_artifacts": [
    ".memory-bank/behavior-specs/FT-001-BHV-001-login-success.behavior.json"
  ]
}
```

Не добавлять behavior specs в `verification_targets`, `evidence_required`,
`gates`, `constraints` или `invariants`.

## Правила генерации

- Создавать 0-3 сценария на фичу. `0` — нормальный результат для простой фичи.
- Если сценарии нужны, обычно начинать с одного happy path.
- Добавлять negative/edge только для реального риска.
- Один behavior spec = одно независимое поведение.
- Не дублировать весь feature spec в JSON.
- Не выдумывать сценарии без evidence из PRD/feature/specs.

## Использование

`/execute` может читать linked behavior specs из task `source_artifacts` и
учитывать их как concrete examples.

`/verify` не проверяет behavior specs и не блокирует результат из-за их
отсутствия, непокрытия или расхождения с кодом. Если нужна проверка поведения,
она должна быть выражена обычными AC, `verification_targets`, contract/state
specs или тестами.

## Non-goals

На первом этапе не добавлять:

- JSON Schema;
- validator;
- doctor gate;
- behavior registry;
- новый task field;
- новое feature frontmatter поле;
- использование behavior specs как `verification_targets`;
- lint/doctor/link checks для behavior specs;
- Gherkin/Cucumber parser;
- test runner;
- блокировку `done` из-за отсутствия behavior specs.

## Внедрение

Минимальные source touchpoints:

- `skills/_shared/scripts/init-mb.js` — создать `.memory-bank/behavior-specs/`.
- `skills/_shared/references/structure-template.md` — описать папку.
- `skills/mb-from-prd/references/feature-template.md` — добавить секцию.
- `skills/_shared/references/commands/prd-to-tasks.md` — генерация и task links.
- `skills/_shared/references/commands/execute.md` — чтение linked specs.
- `skills/_shared/references/commands/verify.md` — явно не считать behavior specs
  verification gate.
- `README.md`, `howItWorks.md`, `PROJECT_MAP.md` — короткая документация.

## Definition of Done

Фича закрывается по текущим правилам DevRails.

Behavior specs не участвуют в readiness, verification или done gates.
