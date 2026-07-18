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
- Прочитай `.memory-bank/spec-index.md` и проверь, что active specs используют
  `Type | Path | Status | Scope | Change route`, один active canonical path на
  concern и direct feature/task links без `used_by`/file-owner metadata.
- Если есть `.memory-bank/constitution.md`, проверь ссылки и упоминания Constitution в MBB, spec-backbone, spec-index, workflows, AGENTS.md и generated plans.
- Найди stale или contradictory Constitution references: старые пути, alias-команды, legacy task/risk routing, или правила, противоречащие текущей Constitution.
- Найди “Known gaps / TBD / TODO” и реши: закрываем или превращаем в задачи.
- Для linked `.memory-bank/behavior-specs/*.behavior.json` проверь feature links
  и task `source_artifacts`. Stale examples отмечай как notes, если обычный
  AC/spec/verification source не сломан.
- Сверь `.memory-bank/skills/index.md` с реально установленными
  `.agents/skills/*/SKILL.md` и `.claude/skills/*/SKILL.md`. Реестр должен
  использовать canonical runtime command names без второй alias/package surface.

## 2) Линт (если настроен)
- Если в репозитории есть `scripts/mb-lint.mjs` — запусти его.
- Иначе пропусти этот шаг.
- Если есть `scripts/mb-doctor.mjs`, запусти default mode как health check.
  `--strict` используй только после появления executable task queue и перед
  scheduler/autopilot execution.
- Readiness findings принадлежат `mb-doctor`; не дублируй его проверки вручную.

## 3) MB-SYNC (по необходимости)
Запусти `/mb-sync`, только если garden изменил durable Memory Bank state или
нашёл drift, требующий reconciliation уже принятого owner decision. Иначе
сообщи, что sync не нужен. Не выводи closure, promotion или scheduler decision
из результатов garden.

## 4) Архив/рефактор
- Размер документа — только review signal. Разбивай по самостоятельной boundary,
  change cadence, consumers или reuse, а не по числу строк.
- Удали/объедини дубли.
- До создания или split spec выполни registry/folder discovery; не создавай
  default `FT-*` hub или обязательную architecture/guides пару.
- Устаревшее перемести в `.memory-bank/archive/`, обнови `spec-index`, folder
  indexes и feature/task links. Tombstone допустим только как
  `status: deprecated` compatibility route и не должен выглядеть active spec.
- Для obsolete generated runtime skill entries рекомендуй installer sync; не
  удаляй user-owned skills автоматически.
- Не архивируй и не переписывай Constitution как часть чистки, если пользователь явно не просил governance amendment.
- Если Constitution устарела или конфликтует с routed docs, flag это как blocking garden finding и предложи `/constitution`; не выдумывай новые domain principles.

## 5) Review (по finding)
Маршрутизируй в `/review-feat-plan` или `/review-tasks-plan` только concrete
planning/spec/task drift в ownership соответствующего review. Не запускай review
только по расписанию или из-за самого факта garden run.
</process>
