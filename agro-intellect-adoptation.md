# План локальной адаптации DevRails в `agro-intellect`

## Цель

Адаптировать свежую развёрнутую версию DevRails в
`/home/serg/Projects/agro-intellect/` без изменения canonical source DevRails и
без переписывания закрытых по старому контракту задач, протоколов и отчётов.

После адаптации:

- `mb-lint` и `mb-doctor --strict` проходят;
- старые terminal task records остаются неизменной историей;
- новые runtime-агенты используют `/exe`, `/feature-to-tasks` и
  `/prd-to-features`;
- Planning Revision и task-plan review применяются к незакрытой очереди, а не
  заставляют повторно ревьюить завершённые features;
- TASK-041, TASK-042 и TASK-043 готовы к новому FT-013 workflow.

## Границы

- Менять только файлы внутри `/home/serg/Projects/agro-intellect/`.
- Не менять `/home/serg/Projects/DevRails 26/`.
- Не менять статусы TASK-000…TASK-040 ради миграции.
- Не добавлять задним числом `HUMAN_CHECKPOINT: done`, `VERDICT: PASS` или
  `SEMANTIC_VERDICT: semantic-pass` без соответствующего фактического решения
  или проверки.
- Не переписывать `.protocols/` и `.tasks/` старых задач.
- Не добавлять новый task status, registry, schema field или отдельный legacy
  lifecycle.
- Считать эти изменения локальным deployment fork: следующий
  `--bootstrap --sync` перезапишет framework-owned файлы и потребует повторного
  применения адаптации.

## Ожидаемый набор локальных правок

Всего 18 файлов после свежего deployment baseline.

### Развёрнутые framework-owned файлы — 13

1. `AGENTS.md`
2. `scripts/mb-lint.mjs`
3. `scripts/mb-doctor.mjs`
4. `.memory-bank/workflows/autonomy-policy.md`
5. `.memory-bank/workflows/execute-loop.md`
6. `.agents/skills/cold-start/SKILL.md`
7. `.agents/skills/exe/SKILL.md`
8. `.agents/skills/autopilot/SKILL.md`
9. `.agents/skills/autonomous/SKILL.md`
10. `.claude/skills/cold-start/SKILL.md`
11. `.claude/skills/exe/SKILL.md`
12. `.claude/skills/autopilot/SKILL.md`
13. `.claude/skills/autonomous/SKILL.md`

### Project-owned/mixed файлы — 5

1. `.memory-bank/spec-backbone.md`
2. `.memory-bank/skills/index.md`
3. `.memory-bank/tasks/TASK-041-T3-FT-013-W1.task.json`
4. `.memory-bank/tasks/TASK-042-T3-FT-013-W2.task.json`
5. `.memory-bank/tasks/TASK-043-T3-FT-013-W3.task.json`

Текущие незавершённые изменения FT-012 не входят в эти 18 файлов.

## Этап 1. Подготовить безопасный baseline

1. Завершить или отдельно зафиксировать текущие незакоммиченные изменения
   TASK-040/FT-012. Не смешивать их с deployment adaptation.
2. Зафиксировать до обновления:
   - `git status --short`;
   - task status distribution;
   - результат текущих `mb-lint` и `mb-doctor --strict`;
   - список установленных `.agents/skills` и `.claude/skills`.
3. Развернуть свежую версию штатным маршрутом:

   ```bash
   node "/home/serg/Projects/DevRails 26/scripts/install-framework.mjs" \
     --bootstrap \
     --sync \
     --target "/home/serg/Projects/agro-intellect" \
     --yes
   ```

4. Сохранить post-sync diff как deployment baseline. Последующие 18 локальных
   правок проверять отдельно от generated sync diff.

Blocker: не продолжать, если sync изменил indexed task records, task statuses,
старые `.protocols/` или `.tasks/`.

## Этап 2. Адаптировать validators

### `scripts/mb-lint.mjs`

Ввести минимальное compatibility-правило:

- terminal record — task со статусом `done|failed`;
- legacy terminal record — terminal record, содержащий deprecated
  `runtime_context.allowed_write_scope`;
- для legacy terminal records принимать `allowed_write_scope` как read alias
  без отдельного warning на каждый файл;
- для незакрытых records сохранять warning о deprecated alias;
- наличие одновременно `write_boundary` и `allowed_write_scope` остаётся
  ошибкой;
- не выдавать router warning для framework-generated `.memory-bank/roles/`,
  потому что роли напрямую маршрутизируются из `AGENTS.md`.

Не ослаблять проверки JSON, ID/tier/feature/wave, path grammar, broken links и
task index consistency.

### `scripts/mb-doctor.mjs`

Для legacy terminal records:

- не повышать до strict error только исторические findings
  `TASK_DONE_EVIDENCE_MISSING`, `TASK_RED_VERIFY_EVIDENCE_MISSING`,
  `TASK_RED_VERIFY_VERDICT_MISSING` и `TASK_T3_CHECKPOINT_MISSING`;
- не печатать их по одному; вернуть одно агрегированное `INFO` с количеством
  принятых legacy terminal records и типами сохранённых historical gaps;
- не считать это новым PASS/verdict/checkpoint и не изменять task records.

Для новых и незакрытых задач сохранить действующий strict-контракт без
послаблений. Schema errors, dependency errors, invalid lifecycle, missing
active protocols и новые T3 closure gaps остаются блокирующими.

`TASK_PLANNED_READY_CANDIDATE` оставить advisory-сигналом, но выводить как
`INFO`, а не как warning.

## Этап 3. Ограничить planning freshness незакрытой очередью

Использовать одно одинаковое определение во всех 11 instruction/runtime
файлах этого этапа:

```text
active product feature = product feature с хотя бы одной indexed task в
planned | ready | in_progress | blocked
```

Правила:

- текущий положительный Planning Revision обязателен для active product
  features;
- `/exe TASK` проверяет review только feature выбранной задачи;
- mismatch выбранной задачи направляет в
  `/feature-to-tasks FT-<NNN> -> /review-tasks-plan FT-<NNN>`, не в `--all`;
- `/autopilot`, `/autonomous` и `/cold-start` требуют current review marker для
  active product features;
- features, у которых все indexed tasks уже `done|failed`, сохраняют
  исторические approvals и не требуют migration re-review;
- task statuses от invalidation не меняются;
- новый материальный global design change продолжает требовать обычной
  reconciliation незакрытых affected features.

Применить это согласованно к:

- `AGENTS.md`;
- `.memory-bank/workflows/autonomy-policy.md`;
- `.memory-bank/workflows/execute-loop.md`;
- четырём skills в `.agents/skills/`;
- тем же четырём skills в `.claude/skills/`.

После правки парные `.agents`/`.claude` версии каждого из четырёх skills должны
иметь одинаковый executable contract.

## Этап 4. Адаптировать project state

### Global Backbone

В `.memory-bank/spec-backbone.md`:

1. Добавить в существующий `## Global Backbone Status`:

   ```text
   - Planning Revision: 1
   ```

2. Считать `1` baseline текущего уже принятого backbone, а не новым изменением
   требований или дизайна.
3. Согласовать упоминания TASK-040 с authoritative task card после завершения
   текущей FT-012 работы. Не менять его исторические verdicts и waivers.

Если завершение текущей FT-012 работы требует согласовать также requirements,
feature или implementation plan, выполнить это как отдельный текущий
`/mb-sync`, а не маскировать под deployment adaptation.

### Skills index

В `.memory-bank/skills/index.md`:

- заменить старые `/execute`, `/prd-to-tasks` и `/prd` на фактически
  установленные `/exe`, `/feature-to-tasks` и `/prd-to-features`;
- зарегистрировать актуальный inventory `.agents/skills` и `.claude/skills`;
- оформить `## Installed` между точными managed markers:

  ```text
  <!-- BEGIN DEVRAILS INSTALLED SKILLS -->
  ...
  <!-- END DEVRAILS INSTALLED SKILLS -->
  ```

Это позволит последующим sync распознавать секцию как framework-owned block.

### Незакрытые task cards

В TASK-041, TASK-042 и TASK-043 выполнить только механическую замену ключа:

```text
runtime_context.allowed_write_scope -> runtime_context.write_boundary
```

Значения массива, IDs, tier, feature, wave, dependencies, status, purpose,
scope, constraints и verification targets не менять.

Закрытые TASK-000…TASK-040 оставить без изменений.

## Этап 5. Проверить migration invariants

Проверки выполнять в `/home/serg/Projects/agro-intellect/`.

1. Синтаксис и JSON:

   ```bash
   node --check scripts/mb-lint.mjs
   node --check scripts/mb-doctor.mjs
   jq empty .memory-bank/tasks/TASK-041-T3-FT-013-W1.task.json
   jq empty .memory-bank/tasks/TASK-042-T3-FT-013-W2.task.json
   jq empty .memory-bank/tasks/TASK-043-T3-FT-013-W3.task.json
   ```

2. Mechanical validation:

   ```bash
   node scripts/mb-lint.mjs
   node scripts/mb-doctor.mjs
   node scripts/mb-doctor.mjs --strict
   git diff --check
   ```

3. Подтвердить неизменность истории:
   - task registry по-прежнему содержит 44 записи;
   - 41 task остаётся `done`, TASK-041…043 остаются `planned` до отдельного
     lifecycle decision;
   - migration diff не содержит TASK-000…TASK-040;
   - старые `.protocols/` и `.tasks/` не изменены;
   - ни в одном историческом artifact не появился синтетический PASS,
     semantic-pass или human checkpoint.
4. Подтвердить runtime consistency:
   - edited `.agents` и `.claude` skill pairs согласованы;
   - managed runtime surfaces не ссылаются на `/execute`, `/prd-to-tasks` или
     старый `/prd` decomposition route;
   - `mb-lint` не печатает 40 legacy alias warnings или roles router warning;
   - strict doctor завершается с exit code `0`, legacy baseline сообщает как
     `INFO`, а не как новый acceptance evidence.

Blocker: если strict PASS достигается только изменением старых task cards,
protocols или verdicts, откатить migration patch и исправить compatibility
логику validators/runtime instructions.

## Этап 6. Вернуть FT-013 в новый workflow

После успешной технической адаптации:

1. Запустить свежий `/review-tasks-plan FT-013`.
2. Новый report должен содержать отдельную строку:

   ```text
   REVIEWED_PLANNING_REVISION: 1
   ```

3. Review не должен повторно ревьюить FT-001…FT-012 и не должен менять task
   lifecycle.
4. После `APPROVE` повторить `mb-lint` и `mb-doctor --strict`.
5. TASK-041 выбирать отдельно через `/exe TASK-041-T3-FT-013-W1`; только
   execution owner выполняет допустимый `planned -> ready -> in_progress`.

## Done condition

Адаптация завершена, когда одновременно выполнено следующее:

- изменены только согласованные 18 migration-файлов плюс новые evidence files
  последующего FT-013 review;
- validators проходят без legacy warning storm и без strict errors;
- старые закрытые task/protocol/report artifacts неизменны;
- Global Backbone имеет `Planning Revision: 1`;
- latest FT-013 review — `APPROVE` с
  `REVIEWED_PLANNING_REVISION: 1`;
- `/cold-start`, manual `/exe` и `/autopilot` одинаково видят только FT-013 как
  active product feature;
- дальнейший runtime flow не требует перепланировать или перепроверять
  завершённые FT-001…FT-012.

## Ограничение поддержки

Локальный deployment fork не переживает следующий framework sync. Перед любым
последующим `--bootstrap --sync` необходимо либо повторно применить этот план,
либо сначала перенести compatibility-изменения в canonical DevRails.
