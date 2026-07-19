# Memory Bank Recovery Plan

Три уровня восстановления в зависимости от масштаба повреждений.

## Level 1: Cosmetic (быстрый фикс)

**Симптомы**: пропущен frontmatter, битые ссылки, устаревшие записи, неактуальный changelog.

**Действие**: запусти `mb-garden`.
1. `node scripts/mb-lint.mjs` — найти ошибки.
2. Добавить пропущенный frontmatter.
3. Исправить битые ссылки.
4. Обновить changelog и index.
5. Архивировать stale docs.

**Время**: 10–30 минут.

## Level 2: Structural (рассинхрон с кодом)

**Симптомы**: MB описывает архитектуру/фичи, которые уже не соответствуют коду. RTM разошёлся. Support docs неполные, противоречивы или врут.

**Действие**: запусти `/map-codebase` (re-scan).
1. Создай `.tasks/TASK-MB-RECOVERY/`.
2. Запусти repo-scanner сабагентов по зонам.
3. Сравни отчёты с текущим MB — найди расхождения.
4. Обнови MB: architecture, guides, spec-index, glossary, invariants, contracts, states, runbooks, features, requirements, RTM — только те слои, которые реально используются и подтверждаются evidence.
5. Запусти MB-SYNC чеклист.
6. Запусти `/review-feat-plan` или `/review-tasks-plan` для нужной поверхности.

**Время**: 1–3 часа.

## Level 3: Full Rebuild (MB утерян или полностью устарел)

**Симптомы**: MB отсутствует, или >80% контента невалидно, или произошла крупная миграция без обновления docs.

**Действие**: запусти `cold-start` заново.
1. Сохрани старый MB в `.memory-bank/archive/pre-rebuild/`.
2. Запусти `mb-init` для создания нового скелета.
3. Для brownfield: запусти `/map-codebase`.
4. Для greenfield: запусти `/prd-to-features` после `/write-prd` и `/spec-init`.
5. Перенеси salvageable контент из archive (ADRs, decision logs).
6. Запусти `/review-feat-plan`, затем `/review-tasks-plan` после task planning.

**Время**: 3–8 часов.

## Как определить уровень

| Признак | Level |
|---------|-------|
| lint errors < 10 | 1 |
| lint errors > 10 + RTM drift | 2 |
| >50% файлов MB stale / MB отсутствует | 3 |
| Крупный рефакторинг без обновления MB | 2 |
| Миграция на новый стек | 3 |
