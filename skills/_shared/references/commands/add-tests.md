---
description: Добавление тестов — unit/integration/e2e с приоритезацией по core value.
status: active
---
# /add-tests — Improve test coverage

<objective>
Добавить тесты так, чтобы они реально ловили регрессии и поддерживали качество.
</objective>

<process>

1) Определи типы тестов:
- unit: чистая логика
- integration: границы (DB/API)
- e2e: критические user flows

Если есть UI:
- browser e2e через Playwright / agent-browser / CDP
- обязательно сохраняй screenshots/videos/traces как evidence

2) Выбери приоритет:
- сначала e2e на core value
- потом unit на критические инварианты
- для сервисов/API добавь integration/contract tests раньше “декоративных” UI-тестов

3) Реализуй
- добавь тесты
- убедись, что они не flaky

4) Обнови `.memory-bank/testing/index.md`
- какие тесты добавлены
- как их запускать

5) Артефакты (логи/скриншоты) → `.tasks/TASK-TESTS-.../`
</process>
