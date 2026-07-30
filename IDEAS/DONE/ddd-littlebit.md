# Минимальная DDD-интеграция в DevRails

## Решение

Не интегрировать полный DDD workflow или upstream DDD skill.

Добавить только два условных guardrail:

1. Если authoritative target не требует архитектурной миграции, существующая
   область по умолчанию сохраняет свой domain-modeling style. Текущий стиль
   остаётся as-is evidence, а не target authority.
2. Если authoritative target не предписывает translation boundary, её
   обосновывает только конкретное semantic, ownership,
   compatibility/stability или transport/persistence isolation pressure.
   Стилистическое различие само по себе недостаточно.

Рекомендуемый integration mode: `inline-invariant`.

## Ожидаемая польза

- предотвращение локальных DDD-островов, незапрошенных repository interfaces,
  aggregates, domain events, новых слоёв и сопутствующего scope creep;
- сохранение стиля и совместимости brownfield/legacy-кода;
- защита разных семантических моделей от скрытого смешивания через формально
  совместимый интерфейс;
- более точный architecture review без требования «сделать код более DDD».

## Минимальный decision check

1. Authoritative target оставляет domain-modeling style открытым:
   локальный стиль существующей области используется как default.
2. Нужна новая shared/domain boundary, меняется semantic/write ownership или
   dependency direction: решение принадлежит `/spec-design`.
3. Неясен feature-scoped invariant, task scope или product behavior:
   используется существующий owning route.
4. Translation boundary не нужна:
   прямой вызов или небольшой mapper остаётся execution discretion.

Decision check не сохраняется как новый task field, classification или
workflow state.

## Изменяемые canonical files

### Workflow contracts

- `skills/_shared/references/commands/spec-design.md`
  - зафиксировать legacy/style inheritance;
  - оставить новую domain boundary обычным operator decision;
  - разрешать translation/ACL только при доказанной boundary.
- `skills/_shared/references/commands/exe.md`
  - запретить DDD-остров и соседний legacy-refactor;
  - направлять новую domain boundary или нетривиальный ACL в `/spec-design`.

### Сопровождение

- `PROJECT_MAP.md`
  - кратко отразить guards в существующем Architecture Spine hotspot без
    отдельного DDD-раздела.
- `scripts/test-install-sync.mjs`
  - проверить одинаковое развёртывание изменённых contracts в `.agents` и
    `.claude`.

## Не изменять без нового основания

- `skills/_shared/references/commands/feature-to-tasks.md`;
- `skills/_shared/references/commands/review-tasks-plan.md`;
- `skills/_shared/references/commands/spec-auto.md`;
- `skills/_shared/references/commands/architecture-review.md`;
- `skills/_shared/references/commands/find-skills.md`;
- `skills/_shared/references/deployable/AGENTS.md`;
- task schema и protocol templates;
- `package.json`;
- installer.

## Не внедрять

- обязательные classifications
  `DDD-new|DDD-existing|legacy-preserve|non-domain|too-small`;
- новый task field, registry, status, artifact или review gate;
- полный tactical DDD contract;
- обязательные aggregates, repositories, value objects или domain events;
- обязательный DDD skill package или lazy route;
- glossary, bounded-context artifacts или ACL по умолчанию.

## Проверка результата

- local/simple и legacy tasks не получают новых обязательных стадий;
- `/spec-design` сохраняет ownership новых material boundaries;
- `/exe` не расширяет task scope ради DDD-refactor;
- task schema, statuses и protocol family не изменены;
- generated Codex и Claude contracts эквивалентны;
- source-only дерево не содержит generated `shared-*`.
