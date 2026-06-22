# RU

`memobank_BMAD_SDD` — это система агентной разработки с памятью для AI-first подхода. Она включает старт с нуля(greenfield) или внедрение в текущий проект(brownfield), постоянную модель памяти проекта и skill pack для таких агентных рантаймов, как Codex CLI, Claude Code, OpenCode и другие.

Он превращает репозиторий в удобное для агентов рабочее пространство с:
- `.memory-bank/` для долговременного знания о проекте
- `.protocols/` для возобновляемого состояния выполнения
- `.tasks/` для runtime-артефактов

[Полная документация тут](README.ru.md)

Актуальный основной workflow: `/review-feat-plan` for risky/large work ->
`/spec-design` -> `/foundation-to-tasks` if required -> close the `FT-000`
foundation gate -> `/prd-to-tasks` -> `/review-tasks-plan`.

---

﻿# EN

`memobank_BMAD_SDD` is a memory-based agentic workflow system for AI-first development. It includes greenfield and brownfield workflows, a persistent project memory model, and a skill pack for agents as Codex CLI, Claude Code, OpenCode, etc.

It turns a repository into an agent-friendly workspace with:
- `.memory-bank/` for durable project knowledge
- `.protocols/` for resumable execution state
- `.tasks/` for runtime artifacts


[Full documentation here](README.en.md)

Current main workflow includes `/review-feat-plan` for risky/large work ->
`/spec-design` -> `/foundation-to-tasks` if required -> close the `FT-000`
foundation gate -> `/prd-to-tasks` -> `/review-tasks-plan`.
