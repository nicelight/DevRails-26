# DevRails Nav 27 — independent acceptance

**PASS для проверенного базового plugin/UI flow**, с границами ниже.
Проверка выполнена 2026-11-01 в отдельном worktree DevRails Nav 27, baseline
`06ddd92` + исправления этой приёмки. Original DevRails 26 не изменялся.
Карта остаётся разрешённой функциональной схемой; финальный визуальный дизайн
не считается согласованным.

## Среда и доказательства

Chromium/Playwright, desktop 1440 px и narrow 390×844. Проверялись настоящий
packed Nav plugin, native Cordis Loader/DSH agent loop/sessions/tools/Gateway
и отдельный **полный published DSH web `0.2.2-alpha.2`** на Node 24.22.2.
Fixture использует deterministic provider; полноценный host проверялся без
model calls и без пользовательского профиля/credentials.

| Действие | Наблюдаемый результат |
| --- | --- |
| Открыть `/nav27/` без cookie; затем native login | 401 с указанием входа; после token-to-cookie login карта, snapshots и controls доступны. |
| Edit settings, native model catalog, Save | Настройки открываются и сохраняются, catalog показывает реальные fixture routes; defaults H slots больше не бросают DataCloneError. |
| Fit, zoom до detail, pan, затем train-body click | Transform меняется; labels раскрываются; Fit возвращает обзор; новый Side создаётся и после pan. Controls сохраняют экранный размер. |
| Play → активный exe → Red + H + Side | Settings заморожены. H прошёл requested/inspection до complete без ожидания станции. Side отвечает независимо, с актуальным Nav summary. |
| Exe завершён на Red station → заменить main/secondary verify на code-only и включить task red → Green | Запускается verify, настройки снова заморожены; exe не повторяется. Проверенный task сохранил ровно один attempt `988f63a4-65c4-4f32-9094-beae74221579`. |
| Pause во время verify | Текущий выбранный leg завершился, следующий не допущен; настройки доступны на stopped station. |
| Совместить Red + Stop (+ Pause), затем Green и Play | Green сохраняет снятие Red/Pause, возвращая оставшийся Stop; Play снимает Stop и допускает следующий leg. Нет тупика и преждевременного запуска. |
| Candidate-only → red | UI показывает `code 0 candidates (no functional verdict)`; red отображает собственный semantic-pass. Candidate review не превращается в functional PASS. |
| Side Send, native text stream, Stop Side turn, close/reopen | Текст сохраняется в native history, отменённый turn не дописывается; повторное открытие использует ту же session. Native stream test проверяет live frames. |
| Main Stop, reload, снова Side | Marker/session сохраняются, последующий Side вопрос получает новый summary; main Stop не удаляет Side. |
| DEL Side | Native archive подтверждён, marker исчезает. Native regression отдельно проверяет сохранённую историю и archive-error recovery. |
| Browser offline → online Refresh | Без snapshot mutating controls закрыты; ошибка видна. После reconnect приходит актуальный snapshot, error banner снимается, work не replay-ится. |
| Narrow 390 px | Нет горизонтального overflow; controls переносятся строками, Side HTML остаётся читаемым при scroll и не масштабируется вместе с SVG. |
| Full DSH plugin install → `/nav27/` → Main chat | `dsh plugin --profile web add <tarball>` + профильный YAML insert загружают package без upstream build. Native root активируется; addon выбирает сохранённый main ID и убирает fragment. Проверено по native `dsh.sessions.current`, ID совпадает с `run.json`. |

После исправления fixture event source обычный Side flow не выдаёт carrier
errors. При принудительном offline сетевые ошибки ожидаемы; после online
состояние восстанавливается. В финальном native main переходе нет JavaScript
page errors или plugin activation failures.

## Исправлено по фактическим сбоям

- Svelte state snapshots перед `structuredClone` настроек и H defaults.
- Сброс drag latch на новом pointer/keyboard action: pan не блокирует Side.
- Независимое сохранение снятия manual holds до следующего допуска.
- Native API Remotes в fixture: отсутствие `$events` больше не сбрасывает
  browser stream carrier.
- Addon поставляется native registered CJS factory; client graph edges называют
  packages, не Cordis services. Cold navigation ждёт native session baseline,
  потребляет fragment до синхронной публикации retain и очищает subscription.
- Connection error снимается после успешного snapshot, отдельно от action errors.
- Актуализированы metadata и стартовые ссылки документации.

## Проверки и границы

`build:nav27` включает host TypeScript и сборку standalone/addon/typed Remote.
Native suite: **41/41 PASS**, без skips. В него входят packed installation,
role guards/cold resume, resource reads, task evidence/recovery, main consent,
H и Side. Дополнен regression combined holds, native carrier и packed addon
registration/graph/cold navigation/reentrant notification/cleanup.
`git diff --check` — PASS; source package-local `shared-*` — **0**.
Архив содержит **37** command contracts и нужные resources; runtime не требует
Nav checkout. Штатная установка, bootstrap из упакованного generator и запуск
внешнего пакета подтверждены в чистом DSH profile.

По решению приёмки отдельный pending widget и дублирующий Nav Stop внутри
native chat исключены: controls остаются на карте. `nav_feedback` уже выводит
question и Action обычным native tool text; ответ в main использует тот же
consent reducer. Native DSH Stop сохраняет session semantics.

Не проверены реальные provider calls/качество моделей, все 37 команд end-to-end,
proxy deployment, а также reviewer shell с настоящим confinement backend.
Reviewers выполняются последовательно, UI это указывает. Поддержка опубликованной
alpha-базы не означает совместимость с произвольным будущим DSH. Fixture не
подменяет full-host проверку и не доказывает real-provider acceptance.

## Снимки

- [Desktop: состояние и evidence](screenshots/desktop-result.png)
- [Narrow: native Side history и controls](screenshots/narrow-side.png)

[Установка и запуск](QUICKSTART.md).
