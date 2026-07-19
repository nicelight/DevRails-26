---
description: Поиск релевантных skills: сначала установленные в проекте, потом marketplace.
status: active
---
# /find-skills — Find relevant skills (project-first)

## Цель
Быстро понять, какие skills уже доступны в этом проекте и какой безопасный
route применим к отсутствующему skill.

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
- «Используй `mb-init` …»
- «Затем `/map-codebase` …»
- «Для выполнения `/execute` …»

## 2) Если skill отсутствует — сначала докажи его происхождение
Используй только уже доступное evidence, которое явно подтверждает origin:
installed skill metadata/generated markers, canonical project docs или
canonical command source в verified local DevRails checkout, либо marketplace
metadata с package owner/repo. Не создавай manifest, command catalog или новый
registry и не угадывай происхождение по одному имени.

- **Доказанный DevRails command.** Не используй `npx skills add` или
  marketplace route. Сообщи, что установка/синхронизация выполняется внешним
  DevRails installer из доступного checkout. Если checkout и target path
  проверены, предложи точную команду
  `node scripts/install-framework.mjs --skill <command> --target <project-path> --yes`;
  если нужен framework/Memory Bank sync —
  `node scripts/install-framework.mjs --bootstrap --target <project-path> --yes --sync`.
  Не выдумывай путь к checkout и не утверждай, что route можно выполнить, когда
  checkout недоступен.
- **Доказанный внешний package.** Предложи marketplace install route и предупреди
  о возможных конфликтах. Устанавливай только после явного подтверждения
  пользователя. Если `.memory-bank/skills/index.md` уже существует, обновляй
  его только после фактической установки; не создавай новый registry.
- **Происхождение не доказано.** Сообщи ambiguity, перечисли проверенное
  evidence и ничего не устанавливай.

## 3) Правило для `/autonomous`
- Не устанавливай никакие отсутствующие skills.
- Автоматически используй только уже установленные project skills.
- Записывай recommendation только в существующий
  `.protocols/AUTONOMOUS-RUN/decision-log.md`; не создавай его из
  `/find-skills` и не используй неопределённый `decision-log.md`.
