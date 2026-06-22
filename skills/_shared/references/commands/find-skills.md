---
description: Поиск релевантных skills: сначала установленные в проекте, потом marketplace.
status: active
---
# /find-skills — Find relevant skills (project-first)

## Цель
Быстро понять, какие skills уже доступны **в этом проекте**, и какие стоит установить дополнительно.

## 1) Сначала проверь project-installed skills
Сканируй:
- `.claude/skills/*/SKILL.md` (Claude Code + OpenCode)
- `.agents/skills/*/SKILL.md` (Codex CLI + OpenCode)

> Note: `.codex/` is for Codex config (e.g. `.codex/config.toml`), not for skills.

Собери таблицу:
| Skill | Source | Description |
|---|---|---|
| `mb-init` | `.claude/skills/mb-init` | ... |

Сопоставь интент задачи с `name/description` и предложи 1–3 лучших:
- “Используй `mb-init` …”
- “Затем `mb-map-codebase` …”
- “Для выполнения `mb-execute` …”

## 2) Если не хватает — предложи установку (но не делай без подтверждения)
Если нужного навыка нет локально:
- предложи команду установки через `npx skills add <owner/repo> ...` (или skill.sh),
- предупреди про возможные конфликты (дубли, несовместимые протоколы),
- после установки добавь/обнови `.memory-bank/skills/index.md` (registry).

## 3) Правило для `/autonomous`
- В полном автономном режиме **не** устанавливай новые skills молча.
- Можно автоматически использовать только уже установленные project skills.
- Отсутствующие skills фиксируй как recommendation в `decision-log.md`.
