---
description: Регулярное обслуживание Memory Bank: линт, чистка, архивация, устранение drift.
status: active
---
# /mb-garden — Memory Bank maintenance

<objective>
Находить Memory Bank drift и безопасно исправлять только однозначные
mechanical links, indexes и routers. Semantic, destructive и owner-owned
решения возвращать ответственному owner/operator.
</objective>

<process>

## 1) Read-only scan и classification

- Сначала проведи read-only scan. До классификации findings ничего не меняй.
- Пробеги `.memory-bank/index.md` и роутеры в подпапках.
- Прочитай `.memory-bank/spec-index.md` и проверь, что active specs используют
  `Type | Path | Status | Scope | Change route`, один active canonical path на
  concern и direct feature/task links без `used_by`/file-owner metadata.
- Если есть `.memory-bank/constitution.md`, проверь ссылки и упоминания Constitution в MBB, spec-backbone, spec-index, workflows, AGENTS.md и generated plans.
- Найди stale или contradictory Constitution references: старые пути, alias-команды, legacy task/risk routing, или правила, противоречащие текущей Constitution.
- Найди `Known gaps / TBD / TODO`, но не закрывай их и не превращай в задачи от
  имени garden.
- Для linked `.memory-bank/behavior-specs/*.behavior.json` проверь feature links
  и task `source_artifacts`. Stale examples классифицируй как notes в findings,
  если обычный AC/spec/verification source не сломан.
- Сверь `.memory-bank/skills/index.md` с реально установленными
  `.agents/skills/*/SKILL.md` и `.claude/skills/*/SKILL.md`. Реестр должен
  использовать canonical runtime command names без второй alias/package surface.
- Если есть `scripts/mb-lint.mjs`, initial lint можно использовать как
  read-only источник findings. Он не заменяет final lint после edits.
- Раздели findings на две группы:
  - automatic: только stale/broken links и несогласованные index/router entries,
    для которых существует один однозначный target и не требуется менять смысл;
  - blockers: archive/delete/merge, выбор между competing canonical material,
    TODO/gap-to-task conversion и любые material canonical, task, lifecycle,
    product, design, contract, security или governance decisions.

## 2) Transient write boundary

- До первого edit назови в текущем transient working context точные paths всех
  intended files. Не создавай для этого artifact, write-set file, ownership
  matrix, lifecycle, protocol или registry.
- Автоматически меняй только названные files и только их однозначные mechanical
  links, indexes и routers. Список можно расширять в любой момент: до edit
  каждого дополнительного file явно назови его path в transient context.
- Не архивируй, не удаляй и не объединяй документы; не выбирай canonical
  трактовку; не создавай tasks и не меняй material meaning.
- Для blocker назови finding, затронутые files, отсутствующее owner decision и
  existing handoff: operator для destructive/canonical choice,
  `/constitution` для governance amendment, `/spec-design` или
  `/feature-to-tasks FT-<NNN>` для принадлежащего им design/task решения.
- Obsolete generated runtime skill entry не удаляй автоматически: верни
  recommendation использовать installer sync. User-owned skills не меняй.

## 3) Broader reconciliation boundary

- Cosmetic или mechanical garden cleanup сам по себе не запускает `/mb-sync`.
- Если finding требует broader durable-state reconciliation уже принятого owner
  decision, останови дальнейшую garden mutation и верни handoff существующему
  `/mb-sync` как отдельному owner. Не вызывай и не пересказывай его contract.
- Если до такого handoff garden уже сделал mechanical edits, всё равно выполни
  final lint по итоговому garden-owned state.

## 4) Final validation

- После любого фактического garden edit запусти final
  `node scripts/mb-lint.mjs` по полностью изменённому final state, если script
  доступен. Если он недоступен, явно укажи это в handoff. Initial lint не
  считается final validation.
- `mb-doctor` запускай только на уже существующей readiness/risk boundary:
  default mode как health check, когда он релевантен; `--strict` — только после
  появления реальной executable queue и перед scheduler/autopilot execution.
  Readiness findings принадлежат doctor; не дублируй его checks и не создавай
  applicability matrix.
- Не запускай review по расписанию или только из-за garden run. Concrete
  planning/spec/task drift направляй существующему `/review-feat-plan` или
  `/review-tasks-plan`, когда finding принадлежит их review scope.

## 5) Handoff

- Перечисли только фактически changed files, реально updated links/indexes/
  routers и выполненные validations с результатами.
- Отдельно перечисли unresolved blockers и точный owner/resume route.
- Невыполненные archive/move/delete/merge items являются blockers, а не
  reported changes.
- Для чисто cosmetic/mechanical cleanup явно укажи, что `/mb-sync` не нужен.
</process>
