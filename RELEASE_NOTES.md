# DevRails 26 v0.1.1

Первый публичный beta-релиз DevRails — framework агентной разработки для Codex
и Claude Code.

## Что вошло

- source-only installer, разворачивающий 33 runtime-команды;
- Memory Bank, JSON task registry, протоколы выполнения и проверки;
- greenfield и brownfield workflow;
- ручное выполнение, `/autopilot` и `/autonomous`;
- безопасный sync framework-owned файлов с сохранением project-owned state;
- `mb-lint` и `mb-doctor` для проверки структуры и готовности.

## Установка

Из release checkout DevRails:

```bash
git clone --branch v0.1.1 --depth 1 https://github.com/nicelight/DevRails-26.git
cd DevRails-26
node scripts/install-framework.mjs
```

После установки откройте целевой проект в Codex или Claude Code и запустите
`/cold-start`.

## Статус

Это beta-релиз. Установка через прямой `npx skills add` не поддерживается:
используйте `scripts/install-framework.mjs`.
