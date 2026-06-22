---
description: Прайминг агента — загрузка контекста проекта из Memory Bank перед работой.
status: active
---
# /mb — Prime context

<objective>
Стабильно запраймить агента перед работой:
- прочитать Memory Bank
- понять правила
- понять где лежит контекст для текущей задачи
</objective>

<process>

1) Прочитай `.memory-bank/index.md`.
2) Прочитай `.memory-bank/mbb/index.md`.
3) По аннотированным ссылкам открой релевантные документы:
   - `product.md`, `requirements.md`, нужные `features/FT-XXX`, `architecture/*`, `guides/*`.
   - если присутствуют и релевантны теме: `spec-backbone.md`, `spec-index.md`, `invariants.md`, `glossary.md`, `contracts/*`, `states/*`, `runbooks/*`, `testing/*`.
4) Если видишь, что контекста не хватает — создай `.protocols/<TASK-ID>/plan.md` и зафиксируй:
   - что ты считаешь неизвестным
   - какие сабагенты и что должны выяснить
5) Перед началом кода сформулируй коротко:
   - цель
   - критерии done
   - quality gates

Если пользователь передал `$ARGUMENTS`, используй их как фокус:
- «Запраймься по теме: $ARGUMENTS»
</process>
