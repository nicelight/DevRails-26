---
description: Маппинг существующего репозитория в Memory Bank (brownfield → baseline docs).
status: active
---
# /map-codebase — Brownfield mapping

<objective>
Построить evidence-backed as-is baseline текущего состояния существующего
репозитория.
</objective>

<process>

1) Создай `.tasks/TASK-MB-MAP/`.
2) Выбери минимально достаточную тактику discovery по фактическому размеру и
структуре repository:
- для малого repository или очевидного полного read set используй direct reads
  одним агентом;
- для действительно широкого discovery `/context-manifest` или bounded
  delegation допустимы только когда это дешевле direct reads и текущие роль и
  operator contract разрешают delegation;
- delegation не является default; delegated Worker не запускает других
  агентов;
- поисковые globs должны матчиться, а evidence должно покрывать применимые code,
  config, CI/tooling, data/state и test surfaces.

Записывай substantive mapping evidence и отчёты в `.tasks/TASK-MB-MAP/`
независимо от выбранной тактики.

3) Синтезируй evidence-backed as-is current-state baseline `.memory-bank/` по
чеклисту:
- product
- architecture (C4)
- spec-index / spec-backbone / glossary / invariants (только для регистрации
  существующих artifacts и явно обозначенного current-state routing; не
  выводи normative target или Global Backbone decision из кода)
- runbooks
- contracts
- states (если lifecycle/state rules очевидны из кода, workflow или тестов)
- testing
- index

`/map-codebase` владеет только as-is mapping. При наличии evidence он может
фиксировать наблюдаемые current change units/code roots, write paths/writers,
ownership signals, exposed call/API boundaries, runtime entrypoints и
существующие proof paths. Эти observations не устанавливают target authority и
не являются architecture decisions.

> **PRD-less rule (non-negotiable)**: если **нет `prd.md`**, запрещено генерировать roadmap сущности:
> - `.memory-bank/epics/*`
> - `.memory-bank/features/*`
> - `.memory-bank/tasks/*.task.json` task records
> - `.memory-bank/tasks/index.json` task links
>
> Маппинг = **as-is документация** по evidence, а не планирование.

4) Проверь качество baseline:
- отдели facts от inferences и явно привяжи их к evidence;
- противоречия, недоказанные выводы и неполное покрытие запиши как
  `needs verification` / unresolved evidence;
- не заменяй существующие baseline facts догадками.
- помечай as-is claims как current state, чтобы downstream skill не принял их
  за желаемую архитектуру;
- если обновляемый artifact уже содержит accepted target, сохрани его и явно
  отдели от current state; не создавай и не изменяй target `AD-*`, normative
  rules или architecture decisions на основании одного as-is evidence;
- если current отличается от accepted target, зафиксируй оба состояния и уже
  известный reconciliation route в существующем owning artifact. Само отличие
  является delta, а не authority conflict; неизвестную material route оставь
  unresolved для её downstream owner. Не вводи обязательный новый heading или
  artifact для этого разделения.

5) Заверши immediate handoff:
- если authoritative PRD/delta уже передан вызывающим workflow, сохрани его как
  downstream input и не спрашивай повторно; верни invoking workflow/current PRD
  owner ссылки на baseline вместе с тем же переданным PRD/delta;
- если PRD/delta не передан, заверши as-is baseline, запроси его у оператора и
  остановись;
- не воспроизводи дальнюю downstream chain и не переходи к roadmap, task
  generation или execution из `/map-codebase`.
</process>
