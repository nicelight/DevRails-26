# Plan: simplify T3 closure and wave synchronization

## Objective

Упростить T3 workflow:

- убрать универсальное требование создавать rollback/recovery note для каждой
  `T3` task и удалить marker;
- выполнять обычный `/mb-sync` в конце wave, а не после каждой task.

Удаляемый marker:

```text
ROLLBACK_RECOVERY_NOTE: present
```

Новый T3 closure contract:

```text
full protocol
+ applicable task/spec gates
+ VERDICT: PASS
+ SEMANTIC_VERDICT: semantic-pass
+ HUMAN_CHECKPOINT: done
+ explicit owner/scheduler closure
+ /mb-sync at the end of the wave
```

## Boundaries

- Сохранить `T3`, full protocol, `/verify`, per-task `/red-verify`, human
  checkpoint, explicit closure ownership и `/mb-sync`.
- Не запускать полный `/mb-sync` после каждой task по умолчанию. Task status и
  evidence записываются сразу, а sync выполняется в конце wave.
- Не запрещать rollback, если он прямо требуется product/spec/task gate.
- Не удалять обычные упоминания rollback из migration/runbook/domain context.
- Не менять task schema, lifecycle statuses или protocol file set.
- Не менять `skills/_shared/references/recovery-plan.md`: это отдельный Memory
  Bank recovery workflow.
- Не менять AI-first slicing формулировки `risk/rollback`: они описывают
  возможную границу task, а не обязательный T3 closure artifact.

## Canonical DevRails changes

### 1. T3 command contracts

Удалить rollback/recovery marker и обязательную rollback-проверку из:

- `skills/_shared/references/commands/autopilot.md`
- `skills/_shared/references/commands/autonomous.md`
- `skills/_shared/references/commands/execute.md`
- `skills/_shared/references/commands/verify.md`
- `skills/_shared/references/commands/red-verify.md`
- `skills/_shared/references/commands/mb-sync.md`
- `skills/_shared/references/commands/mb-doctor.md`

Во всех местах T3 closure должен ссылаться только на functional PASS,
semantic-pass, `HUMAN_CHECKPOINT: done`, closure owner и sync.

### 2. Workflow contracts

Согласовать:

- `skills/_shared/references/workflows/tier-policy.md`
- `skills/_shared/references/workflows/autonomy-policy.md`
- `skills/_shared/references/workflows/mb-sync.md`
- `skills/_shared/references/workflows/execute-loop.md`

Убрать формулировки `human/recovery markers`, оставив только human checkpoint.
Worker/verifier prompts не должны просить rollback marker.

### 3. Wave-boundary MB-SYNC

Упростить scheduler/manual flow:

- после каждой task сразу записывать status, closure decision и evidence в
  authoritative task record;
- не запускать полный `/mb-sync` после обычной task;
- после завершения текущей wave один раз выполнить `/mb-sync`, lint и strict
  doctor, затем продвигать следующую wave;
- ранний `/mb-sync` выполнять только когда продолжение текущей wave реально
  зависит от согласованных RTM/index/spec/contract/changelog state или когда
  sync явно запросил owner.

Согласовать это правило в `autopilot`, `autonomous`, `mb-sync`, `tier-policy`,
`execute-loop`, `autonomy-policy`, generated AGENTS guidance и `howItWorks.md`.
Не добавлять новые task fields, sync statuses или отдельный wave artifact.

### 4. Deterministic doctor

В `skills/mb-garden/assets/mb-doctor.mjs`:

- удалить `T3_ROLLBACK_RECOVERY_MARKER`;
- удалить finding `TASK_T3_ROLLBACK_MISSING`;
- удалить suggested fix для rollback marker;
- сохранить `TASK_T3_CHECKPOINT_MISSING` и проверку точного
  `HUMAN_CHECKPOINT: done`;
- сохранить проверки full protocol, PASS evidence и semantic-pass.

### 5. Generated scaffold

Обновить generated guidance:

- `skills/_shared/scripts/init-mb.js`
- `skills/_shared/references/structure-template.md`

Fresh bootstrap и subsequent sync не должны возвращать rollback/recovery gate
в `AGENTS.md` или `.memory-bank/workflows/*`.

Generated `AGENTS.md` должен содержать раздел `KISS / Avoid overengineering` с
правилами:

```markdown
- Implement the simplest solution that fully satisfies current requirements and specs.
- Prefer existing project patterns over new abstractions, layers, registries, frameworks, or workflow artifacts.
- Do not design for hypothetical future scale, integrations, configurability, or reuse without a concrete current requirement.
- Do not introduce enterprise architecture or additional process merely because it may be useful later.
- Added complexity must be justified by an existing requirement, constraint, risk, or demonstrated duplication.
- KISS does not permit skipping required correctness, security, compatibility, or verification gates.
```

### 6. Documentation

Обновить `howItWorks.md`:

- T3 manual/scheduler flow;
- tier table;
- closure evidence summary;
- `/mb-sync` на wave boundary вместо default per-task sync.

`README.md` менять только если после refactor там обнаружится фактическая
rollback/recovery формулировка.

### 7. Release regression checks

В `.github/workflows/release-check.yml` добавить минимальные проверки:

- generated skills/workflows не содержат `ROLLBACK_RECOVERY_NOTE`;
- generated doctor не содержит `TASK_T3_ROLLBACK_MISSING`;
- корректная completed T3 fixture с human checkpoint, verify PASS и
  semantic-pass проходит без rollback marker;
- generated scheduler guidance выполняет обычный `/mb-sync` в конце wave, а не
  после каждой task;
- generated `AGENTS.md` после fresh bootstrap и sync содержит KISS / Avoid
  overengineering rules.

## Validation

```bash
npm run check:syntax --silent
git diff --check
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

Source-only count должен быть `0`.

Fresh target:

```bash
tmpdir="$(mktemp -d)"
node scripts/install-framework.mjs --bootstrap --target "$tmpdir" --yes
rg -n 'ROLLBACK_RECOVERY_NOTE|TASK_T3_ROLLBACK_MISSING' \
  "$tmpdir/AGENTS.md" \
  "$tmpdir/.agents/skills" \
  "$tmpdir/.claude/skills" \
  "$tmpdir/.memory-bank/workflows" \
  "$tmpdir/scripts/mb-doctor.mjs"
```

`rg` должен вернуть no matches. Затем запустить generated `mb-lint`, default
doctor и T3 fixture через strict doctor.

## Acceptance criteria

- T3 task больше не требует rollback/recovery note или marker только из-за tier.
- `mb-doctor --strict` не создаёт rollback-specific finding.
- `HUMAN_CHECKPOINT: done` остаётся обязательным exact marker.
- `/verify PASS` и per-task `/red-verify semantic-pass` остаются обязательными.
- Scheduler/explicit owner по-прежнему записывает closure до `/mb-sync`.
- Обычный `/mb-sync` выполняется один раз в конце wave; ранний sync допускается
  только при явной зависимости от согласованного durable state.
- Explicit task/spec rollback requirements продолжают работать как обычные
  gates/evidence requirements.
- Generated `AGENTS.md` содержит согласованные KISS / Avoid overengineering
  rules без дополнительных process gates.
- Fresh install и sync не возвращают удалённый механизм.

## Handoff

После зелёных source/release checks применить migration plan из
`IDEAS/agro-T3_optimisation.md`.
