Да. Убираем JSON Schema, doctor-gates, обязательные проверки связности. Оставляем только полезный слой: **JSON behavior specs как рабочие сценарии для агента и будущего harness**.

# ТЗ: KISS-слой Behavior Specs для DevRails

## Цель

Добавить в DevRails простой слой JSON-спеков поведения.

Задача слоя: фиксировать ожидаемое поведение фичи в формате `given / when / then`, чтобы агент мог писать код не только по текстовой спеки, но и по конкретным проверяемым сценариям.

## Место в пайплайне

Behavior specs генерируются на этапе разложения PRD:

```text
prd.md
  → epics
  → features
  → behavior specs
  → tasks
  → implementation
```

То есть сначала из `prd.md` выделяются фичи, затем для важных фичей создаются behavior specs, потом уже задачи на реализацию.

## Формат

Использовать простой JSON.

Пример:

```json
{
  "id": "AUTH_LOGIN_SUCCESS",
  "feature_id": "AUTH_LOGIN",
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

## Хранение

Добавить директорию:

```text
.memory-bank/behavior-specs/
```

Структура простая:

```text
.memory-bank/behavior-specs/
  AUTH_LOGIN_SUCCESS.behavior.json
  AUTH_LOGIN_INVALID_PASSWORD.behavior.json
```

Без вложенных схем, реестров и сложной иерархии на первом этапе.

## Связь с фичами

В feature spec можно добавить список связанных behavior specs:

```json
{
  "id": "AUTH_LOGIN",
  "behavior_specs": [
    "AUTH_LOGIN_SUCCESS",
    "AUTH_LOGIN_INVALID_PASSWORD"
  ]
}
```

Это не строгий контракт, а навигационная связь для агента.

## Связь с задачами

В task spec можно добавить поле:

```json
{
  "verifies_behavior": [
    "AUTH_LOGIN_SUCCESS"
  ]
}
```

Смысл: задача должна реализовать или проверить указанное поведение.

## Правила генерации

При разложении `prd.md` агент должен:

1. Создать behavior specs только для важных фичей.
2. Для каждой основной фичи создать минимум один happy-path сценарий.
3. Для рискованных мест добавить negative/edge сценарии.
4. Не плодить сценарии ради количества.
5. Не смешивать несколько независимых поведений в одном сценарии.
6. Писать сценарии так, чтобы по ним позже можно было сделать тест или harness.

## Что НЕ делать

На первом этапе не добавлять:

* JSON Schema;
* отдельный validator;
* обязательную doctor-проверку;
* сложный registry;
* Gherkin;
* Cucumber/JBehave-подобный парсер;
* обязательный test runner;
* блокировку `done` из-за отсутствия behavior specs.

## Использование агентом

Агент при реализации фичи должен читать:

```text
feature spec
+ связанные behavior specs
+ task spec
```

И реализовывать код так, чтобы поведение из behavior specs было выполнено.

## Будущий harness

Позже можно добавить harness, который будет запускать behavior specs как проверки.

Но на первом этапе behavior specs — это просто строгие JSON-сценарии, которые:

* помогают агенту точнее понять поведение;
* уменьшают размытость feature spec;
* дают основу для будущих автотестов;
* остаются рядом с фичами как живые сценарии поведения.

## Definition of Done на первом этапе

Фича считается готовой по текущим правилам DevRails.

Behavior specs не блокируют `done`, пока нет полноценного harness.

Рекомендуемое правило для агента:

```text
Если у задачи есть verifies_behavior, агент должен явно указать в отчёте, как реализован каждый связанный behavior spec.
```

## Ожидаемый результат

DevRails получает лёгкий слой:

```text
feature
  → behavior json
  → task
  → implementation
```

Без лишней бюрократии.

Главная ценность: behavior specs становятся мостом между текстовым SDD и будущим исполняемым harness.

