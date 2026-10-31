# Nav 27: результат execution / maintenance семантики

Пакет 3 выполнен в `DevRails Nav 27`, ветка `devrails-nav-27`, поверх
`d02b4f3`. Основное дерево DevRails 26, AGENTS, WORK_LOG и чужие PAPERCUTS не
изменялись. Commit/push не выполнялись. DSH runtime, UI и scheduler не создавались.

## Изменения

- Переработаны все 14 execution/maintenance/autonomous commands пакета и все
  семь protocol templates. Убраны model-owned scheduler algorithms/lifecycle,
  fixed co-review/model/effort, неизменяемый Judge, unconditional APPROVE/PASS,
  обязательные полные protocols и blanket strict gates.
- Каждый leaf использует общий обязательный compact structured feedback,
  host ownership и decision flow. Autonomous policy действует после product
  handoff; manual stops, permissions и неизвестные внешние факты сохраняются.
- Verify участники отключаются независимо, включая main. All-off — skipped,
  без отчёта/PASS; реализованная задача может быть done. Code-only review
  возвращает собственные candidate findings и inspected evidence: он **не**
  превращается в functional PASS и не запускает replacement main.
- Red-verify независимо выключаем. Принятый configurable default разрешает red
  alone по доступной реализации с явным отсутствием functional proof. Второй
  default: local exe checks/RED-GREEN включены, но отключаемы независимо от verify.
- Реальные отрицательные результаты сохраняются. Repair/continue требует
  scoped disposition; последующий skipped не закрывает прежний FAIL.
- Сохранены task identity, accepted scope/authority, hard boundaries, dependency
  ownership, truthful claim evidence, optional receipt reuse, частичные эффекты,
  production remainder и recovery по фактическому состоянию.
- Согласованы init-mb/structure MBB/testing defaults, tier policy, planning
  handoff references, lint и четыре doctor domain modules. Новых runtime
  modules нет: прежний explicit asset list доставляет изменённые validators,
  workflows и templates; существующая resource wiring сохранена и проверена.

## Минимальные data decisions

Top-level task schema и lifecycle не расширены. Используется уже свободный
`task.verify` с typed `stage: workflow`:

1. `attempt` и `selected` сохраняют фактическую applicability: design,
   local_checks, verify participant names, task/feature red и protocol filenames.
   Это необходимо, чтобы отличать disabled от потерянного evidence и не
   пересчитывать историю по live settings. `protocols: []` допустим; tier не
   создаёт обязательный bundle. Disabled design читается из task card и не
   требует пустого backbone/spec файла.
2. Implementation/partial effects и результаты выбранных операций заполняются
   по факту; unfinished поля отсутствуют, disabled получает skipped. Inline
   evidence достаточно без отдельного report. Functional verdict и candidate-only
   result различаются. Это позволяет диагностировать закрытие без выдуманного PASS.
3. Negative result содержит только scoped disposition: decision, user/autonomous
   provenance и reason. Feature semantic result может жить отдельной existing
   verify entry на одной задаче feature. Это сохраняет отрицательный результат
   при принятом продолжении без новой lifecycle/registry.

Новые Nav-записи явно отличаются marker от legacy. Старые записи читаются по
историческим evidence rules; sync не выдумывает им snapshot и не backfill-ит
proof. Foundation использует существующий `Gate Task: not_required`, в том числе
при required implementation без отдельного integrated proof gate. Некорректные
identity/dependency/anchors не становятся допустимыми через skip.

## Проверки

- `npm run check:syntax --silent` — pass.
- `npm run test:mb-doctor --silent` — pass полной старой и новой matrix.
- `npm run test:install-sync --silent` — pass: parity, collisions, restoration,
  idempotence, ownership и byte-for-byte сохранение historical/user evidence.
- Matrix: all-off на T0–T3 без reports/PASS; secondary-only и code-only;
  red off/red alone; local checks независимо on/off; actual FAIL и candidates
  с user/autonomous disposition; failure→skip rejection и repair→proof;
  interruption после implementation/review и partial effects; selected-report
  gap; disabled design без backbone/spec bundle; optional Foundation proof;
  feature red inline/disabled/negative. Настоящий lint проверяет malformed
  identity и missing dependency несмотря на all-off.
- Отдельные install-only/bootstrap+sync: `/tmp/nav27-execution.lELVGm/`.
  Deployed strict doctor для T2 done/all-off/no reports: pass, 0 errors/warnings.
- 62 deployed workflow/resource references проверены на обеих поверхностях.
- `git diff --check` — pass; source generated `shared-*` = `0`.

## Границы результата

Блокеров пакета нет. Проверены semantics, deterministic diagnostics и legacy
installer delivery; тест recovery проверяет сохранение/read-only интерпретацию
evidence, а не ещё не созданный DSH resume engine. Feedback transport, native
launch/settings/session mechanics и UI остаются следующими этапами. Project-wide
документация/inventory относятся к пакету 4.
