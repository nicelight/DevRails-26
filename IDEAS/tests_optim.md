# Оптимизация `test-install-sync.mjs`

## Проблема

`scripts/test-install-sync.mjs` содержит много brittle assertions, которые
проверяют наличие отдельных предложений canonical prompts в generated runtime
`SKILL.md` через `includes(...)` и `normalizeProse(...)`.

Для runtime commands installer напрямую помещает canonical command source в
`.agents/skills/*/SKILL.md` и `.claude/skills/*/SKILL.md`. Поэтому проверки
каждой отдельной фразы дублируют исходник, не проверяют самостоятельное
поведение и требуют менять тест после обычного редактирования prompt.

Последний пример — assertion для `/spec-design`, добавленный рядом с проверкой
Planning Revision: он повторяет новые фразы про final chat response и запрет
per-run history. Его нужно удалить вместе с остальными проверками того же типа.

## Цель

Оставить `test-install-sync.mjs` интеграционным тестом installer/sync, а не
копией semantic contracts из Markdown prompts.

## Scope

- Удалить assertions, которые ищут конкретную prose-формулировку runtime skill
  или другого canonical Markdown только ради фиксации его смысла.
- В первую очередь удалить большой runtime prose-блок для `.agents/skills` и
  `.claude/skills`, включая проверки `normalized*Skill.includes(...)`.
- Удалить добавленную проверку текста `/spec-design` о durable backbone и final
  chat response.
- Удалить ставшие неиспользуемыми переменные, source-path constants и
  `normalizeProse`, если после очистки он больше нигде не нужен.
- Не менять canonical skills, workflows, protocols или их публичные контракты в
  рамках этой задачи.

## Что сохранить

- наличие полного runtime skill inventory на обеих поверхностях;
- collision preflight и отсутствие partial install;
- миграцию/замену распознаваемых generated skills и generated ownership marker;
- source-only и target-safe path checks, когда они проверяют доступность runtime
  reference, а не повторяют произвольную prose-фразу;
- bootstrap/sync, idempotence, preservation пользовательского/project state и
  managed-asset ownership;
- JSON/schema parsing, реальные lint/doctor executions и проверки их поведения;
- структурные protocol markers/shapes, если они являются parseable workflow
  contract, а не копией описательного текста.

## Критерий различения

Проверка остаётся, если изменение destination behavior, ownership, структуры,
пути, parseable значения или observable результата может сломать её независимо
от обычного редактирования prompt. Проверка удаляется, если она падает только
потому, что автор переформулировал canonical prose без изменения контракта или
installer behavior.

## Проверки после очистки

```bash
npm run check:syntax
npm run test:install-sync
git diff --check
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Последняя команда должна вернуть `0`.

## Текущее состояние

На момент создания задания `scripts/test-install-sync.mjs` уже изменён: в нём
присутствует новый prose-assertion для `/spec-design`, который и нужно включить
в очистку. Попытка массового удаления в текущей сессии завершилась до
`apply_patch`; дополнительных частичных правок от неё не появилось.
