# DevRails Nav 27: запуск

Внешний пакет `devrails-nav27` подключает controller, `/nav27/` и native client
addon к существующему DSH. Карта — функциональная схема, не финальный дизайн.
Проверенная runtime-база: **DSH `0.2.2-alpha.2`, Cordis `4.0.6-alpha.1`**;
для DSH CLI нужен **Node.js ≥24.9**. Сборка Nav и native tests также проверены
на Node.js 22.22.1. Не смешивайте разные alpha-версии DSH.

## Собрать пакет

В корне этого репозитория:

```sh
npm ci
npm run build:nav27
npm run test:nav27
npm pack --workspace devrails-nav27 --pack-destination /absolute/output-directory
```

Архив `devrails-nav27-0.1.0.tgz` содержит host/addon, standalone assets,
37 command contracts, references и bootstrap generator. Checkout DevRails
в runtime не требуется; DSH пересобирать не нужно.

## Подключить к DSH

Используйте уже настроенный web-профиль DSH. Здесь его имя — `web`; замените
его своим. `DSH_HOME`, если задан, должен быть одинаковым при установке и запуске.
Остановите этот host перед изменением его plugin dependencies.

```sh
dsh plugin --profile web add /absolute/output-directory/devrails-nav27-0.1.0.tgz
```

CLI устанавливает пакет через штатный profile package manager. Сообщение
`declares no dsh.bundle ... plain dependency` ожидаемо: entry добавляется явно.
В `$DSH_HOME/profiles/web/cordis.patch.yml` (обычно
`~/.dsh/profiles/web/cordis.patch.yml`) добавьте элемент в существующий YAML
список, сохранив остальные настройки:

```yaml
- insert:
    - id: nav27
      name: devrails-nav27
      config:
        project: /absolute/path/to/your-project
        main: { provider: YOUR_PROVIDER_ID, model: YOUR_MODEL_ID }
        exe: { provider: YOUR_PROVIDER_ID, model: YOUR_MODEL_ID }
```

Provider/model — ID из native DSH catalog, не имя внешнего CLI. Настройте
provider и credentials штатными средствами DSH; Nav не хранит API keys.
Укажите существующую директорию проекта. Для одного проекта нужен один Nav
writer. При повторном запуске используются сохранённые run/settings и sessions.

Если в проекте ещё нет Memory Bank, запустите упакованный generator **из
директории целевого проекта**, подставив реальный профиль:

```sh
node /absolute/DSH_HOME/profiles/web/node_modules/devrails-nav27/resources/skills/_shared/scripts/init-mb.js
```

Generator создаёт skeleton; он не придумывает PRD, задачи или доказательства.
Для работы с подготовленной задачей нужен валидный indexed task card в
`.memory-bank/tasks/`. Предметные команды доступны в `Start command or prepared
task`; передайте их реальный input. Уже существующие project-owned artifacts
сохраняются по контракту generator/sync.

```sh
dsh --profile web --no-open
```

Откройте напечатанный DSH login URL, затем `/nav27/` на **том же origin**.
Без native cookie карта возвращает 401. Main chat/машинист открывает штатную
main session через addon; это не второй чат Nav.

На начальной или остановленной станции откройте **Edit settings**: проверьте
модели Main/Executor/Side, выбранных reviewers/H и checks. Для выбранных ролей
нужны доступные модели. **Green** фиксирует весь следующий leg. Red/Pause
запрещают следующий допуск после текущего leg; Stop прерывает текущую работу.
Green снимает Red/Pause, Play — Pause/Stop; при совместных holds их снимают
последовательно. Для незавершённых эффектов используйте **Resume unfinished
work**, сохраняя attempt. H запрашивает немедленную инспекцию; корпус поезда
создаёт независимый read-only Side. DEL архивирует Side, сохраняя native history.
Reviewers сейчас выполняются последовательно; схема не обещает параллелизм.

## Локальная проверка без provider credentials

```sh
npm run build:nav27
npm run preview:nav27
```

Preview печатает login URL и `/nav27/`, создаёт изолированный временный проект
и использует **deterministic provider** с настоящими native Loader, agent loop,
sessions, file tools, Gateway и Nav controller. Play выполняет подготовленную
задачу; доступны station settings, H и Side. `Ctrl+C` удаляет временный профиль
и проект. После изменения кода пересоберите пакет и перезапустите preview.

Это проверяет доставку/управление и UI, но не качество реальной модели,
не все 37 команд end-to-end и не native main UI: fixture root содержит только
native login. Main navigation проверяется в полном DSH. Результаты проверки —
[ACCEPTANCE.md](ACCEPTANCE.md).

## Где остаётся состояние

В целевом проекте: `.memory-bank/nav27/run.json` — run/settings/bindings;
`.memory-bank/tasks/index.json` и task cards — задачи/attempts/evidence;
`.protocols/<TASK-ID>/` — только выбранные отчёты. Native sessions и архивы
принадлежат DSH; в проверенном web-профиле это `$DSH_HOME/sessions`, workspace
storage — `$DSH_HOME/storages`. Browser не ведёт отдельный durable chat log.
