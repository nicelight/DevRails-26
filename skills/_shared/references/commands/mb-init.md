---
description: Инициализировать skeleton Memory Bank. По сути это init-mb.js + базовые файлы.
status: active
---
# /mb-init — Initialize Memory Bank skeleton

<objective>
Быстро создать skeleton:
- `.memory-bank/` + базовые файлы/шаблоны
- `.tasks/`, `.protocols/`
- `AGENTS.md` (+ `CLAUDE.md` symlink/copy)
- runtime scripts
</objective>

<process>
Практически это делает `init-mb.js`. Runtime command skills устанавливает
`scripts/install-framework.mjs` напрямую из
`skills/_shared/references/commands/*.md`.

Если ты уже видишь эту команду в проекте — значит skeleton уже создан.
Для нового репозитория создай skeleton (скриптом или вручную по `structure-template.md`), затем используй:
- `/cold-start` (единая точка входа — роутер сценариев)
- `/write-prd` → `/spec-init` → `/prd` → `/review-feat-plan` for high-risk/large work → `/spec-design` → `/foundation-to-tasks` if required → `/prd-to-tasks FT-<NNN>` или `/map-codebase` по ситуации
- `/autonomous`, если нужен full unattended flow от PRD до terminal state
</process>
