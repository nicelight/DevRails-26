---
description: Прайминг агента — загрузка контекста проекта из Memory Bank перед работой.
status: active
---
# /get-context — Prime context

<objective>
Стабильно запраймить агента перед работой:
- прочитать Memory Bank
- понять правила
- понять где лежит контекст для текущей задачи
- не изменять рабочее дерево
</objective>

<process>

1) Прочитай `.memory-bank/index.md`.
2) Прочитай `.memory-bank/mbb/index.md`.
3) По аннотированным ссылкам открой релевантные документы:
   - `product.md`, `requirements.md`, нужные `features/FT-XXX`, `architecture/*`, `guides/*`.
   - если присутствуют и релевантны теме: `spec-backbone.md`, `spec-index.md`, `invariants.md`, `glossary.md`, `contracts/*`, `states/*`, `runbooks/*`, `testing/*`.
4) Если контекста не хватает, верни gaps и рекомендуемые следующие reads.
   Используй direct reads по умолчанию. `/context-manifest` можно только
   рекомендовать для действительно широкого discovery, когда оно дешевле
   direct reads и delegation разрешено текущей ролью/operator contract.
5) Перед началом работы сформулируй коротко:
   - что прочитано
   - gaps и рекомендуемые следующие reads
   - цель
   - критерии done
   - применимые quality gates

Если пользователь передал `$ARGUMENTS`, используй их как фокус:
- «Запраймься по теме: $ARGUMENTS»
</process>

<hard_invariants>
- `/get-context` строго read-only во всех ролях и режимах.
- Не создавай и не обновляй `.protocols/*`, task plan или другой artifact.
- Не запускай сабагентов, delegation или `/context-manifest` из `/get-context`.
- Если нужен protocol mutation, назови существующий owning execution/planning
  skill как следующий шаг, но не выполняй mutation.
</hard_invariants>
