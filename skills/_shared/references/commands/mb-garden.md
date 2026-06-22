---
description: Регулярное обслуживание Memory Bank: линт, чистка, архивация, устранение drift.
status: active
---
# /mb-garden — Memory Bank maintenance

<objective>
Держать Memory Bank “живым”:
- устранить drift между кодом и доками
- убрать дубли/устаревшее
- поддерживать навигацию/RTM/статусы
</objective>

<process>

## 1) Быстрый чек
- Пробеги `.memory-bank/index.md` и роутеры в подпапках.
- Если есть `.memory-bank/constitution.md`, проверь ссылки и упоминания Constitution в MBB, spec-backbone, spec-index, workflows, AGENTS.md и generated plans.
- Найди stale или contradictory Constitution references: старые пути, alias-команды, legacy task/risk routing, или правила, противоречащие текущей Constitution.
- Найди “Known gaps / TBD / TODO” и реши: закрываем или превращаем в задачи.

## 2) Линт (если настроен)
- Если в репозитории есть `scripts/mb-lint.mjs` — запусти его.
- Иначе пропусти этот шаг.

## 3) MB-SYNC
Запусти `/mb-sync` и пройди чеклист.

## 4) Архив/рефактор
- Разбей слишком большие документы (atomic).
- Удали/объедини дубли.
- Устаревшее перемести в `.memory-bank/archive/` (и обнови ссылки).
- Не архивируй и не переписывай Constitution как часть чистки, если пользователь явно не просил governance amendment.
- Если Constitution устарела или конфликтует с routed docs, flag это как blocking garden finding и предложи `/constitution`; не выдумывай новые domain principles.

## 5) Review (периодически)
Запусти `/review-feat-plan` или `/review-tasks-plan` fresh-context по нужной
поверхности (например, раз в неделю или после большой волны изменений).
</process>
