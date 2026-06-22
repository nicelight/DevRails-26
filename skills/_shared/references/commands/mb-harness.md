---
description: Хелпер по harness-настройкам: чистые сессии, профили Codex, детерминированные гейты.
status: active
---
# /mb-harness — Harness setup (Codex/Claude)

<objective>
Сделать выполнение задач более детерминированным:
- “чистые сессии” на TASK
- понятные quality gates
- профили/настройки Codex (если применимо)
</objective>

<process>

## 1) Принцип
- Реализация и верификация одной задачи должны быть воспроизводимы.
- Для критичных задач используй отдельные “чистые” сессии (см. `/execute` и `/autopilot`).

## 2) Gates
Зафиксируй в `.memory-bank/testing/index.md`:
- lint/typecheck/build
- unit/integration/e2e (если применимо)
- как собирать evidence

## 3) Codex профиль (опционально)
Если ты используешь Codex CLI и хочешь закрепить модели/режимы — создай/обнови `.codex/config.toml`.
В этом пакете есть пример в skill `mb-harness` (assets).
</process>

