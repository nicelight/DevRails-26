# KISS-план: Acceptance Closure для существенных product outcomes

## Цель

DevRails получает один сквозной инвариант:

```text
material product outcome
  -> accepted REQ / feature AC или authoritative exclusion
  -> task mapping
  -> planned proof
  -> verified evidence
```

Под `material product outcome` понимается наблюдаемый edge/failure outcome либо
нефункциональное качество, отсутствие которого само по себе способно сорвать
приёмку продукта/фичи или реализовать существенный принятый риск.

Такое ограничение охватывает только влияющие на приёмку случаи. Перечисление
каждого технического исключения и каждого фонового качества перегрузило бы PRD,
features и внимание runtime-агентов, не повысив соразмерно надёжность.

Новая сущность для этого не появляется. Используются существующие `REQ-*`,
стабильные `FT-<NNN>-AC-<NNN>`, task records, `verification_targets`,
`evidence_required`, review gates и verification flow.

## 1. Product clarification формирует authoritative acceptance basis

`/write-prd` остаётся владельцем продуктового намерения и недостающих решений.
Для существенного нефункционального качества clarified PRD содержит:

- наблюдаемое качество;
- принятый числовой target либо качественный критерий успеха;
- условия, способные изменить результат приёмки;
- класс verification method, достаточный для последующей декомпозиции.

Числовой target появляется только из authoritative source или явно принятого
ответа оператора. Выбор агентом «разумного» значения выглядел бы проще, но
создавал бы ложную product authority. Поэтому отсутствие существенного target
сохраняет существующий `clarification_status: pending|blocked`, существующий
halt и resume route через `/write-prd`.

Качественный критерий остаётся допустимым, когда число не выражает требуемое
качество. В таком случае в product basis фиксируются наблюдаемый критерий и тип
human/expert review. Техническая форма rubric и evidence уточняется позже,
только если она действительно нетривиальна.

## 2. Декомпозиция создаёт один acceptance surface

`/prd-to-features` превращает принятое product basis в обычный стабильный
`REQ-*` и применяющие его feature AC.

`requirements.md` хранит устойчивое требование: качество, принятый target или
качественный критерий и общие условия, меняющие pass/fail. Feature AC хранит
применение требования к конкретному product outcome, наблюдаемый критерий и
verification method. Небольшое повторение существенной части target в AC
оправдано тем, что точный AC anchor является непосредственной основой task и
verification; полное копирование требования по всем артефактам не требуется.

Пример material NFR:

```markdown
### FT-012-AC-003 — Search latency
- REQ: REQ-014
- Criterion: принятый latency target выполняется для поиска при указанных в REQ-014 условиях.
- Verification: integration performance probe.
```

Если формулировка `не более 500 мс` не определяет, идёт ли речь о максимуме,
percentile или другой статистике, этот выбор остаётся product clarification.
Такой параметр меняет pass/fail и потому не должен незаметно превращаться в
техническую деталь measurement spec.

Для существенного edge/failure outcome feature содержит компактную связь:

```markdown
- Timeout leaves the operation retryable — AC: FT-001-AC-004
```

Несколько связанных outcomes могут ссылаться на один AC, поскольку ценность
заключается в полном acceptance coverage, а не в искусственном соответствии
«один outcome — один AC — один тест».

Когда outcome действительно не входит в принятый scope, вместо AC используется
authoritative disposition:

```markdown
- Unsupported offline recovery
  - Disposition: out_of_scope
  - Source: .memory-bank/requirements.md#out-of-scope
  - Change route: /write-prd
```

Ветка исключения требует source и change route, потому что свободный `deferred`
быстро превратился бы в способ скрывать нерешённое in-scope поведение. Если ни
AC, ни принятое исключение невозможны, outcome остаётся clarification blocker и
task handoff не происходит.

## 3. Feature clarification сохраняет closure

`/feature-doctor` поддерживает тот же инвариант при последующих уточнениях.
Изменение edge/failure behavior сопровождается обновлением его AC/disposition,
а изменение существенного NFR сохраняет принятый target, условия и method.

Feature-local уточнение может конкретизировать применение требования или способ
проверки. Новый либо изменённый product target возвращается в `/write-prd`, а
затем в `/prd-to-features`, поскольку `/feature-doctor` не владеет
`requirements.md`. Запись target только в feature была бы короче, но оставила бы
REQ и RTM противоречивыми.

## 4. Subject spec появляется только для нетривиального measurement contract

Простой способ проверки остаётся в AC и task record. Например, достаточный
`integration performance probe` сам по себе не создаёт testing spec.

Subject spec под `testing/`, `runbooks/` или другим существующим subject-based
path становится полезным, когда воспроизводимость требует нетривиальной
методики: подготовки dataset/state, статистического окна, environment
constraints, warm-up, isolation/cleanup, общей для нескольких AC процедуры или
формализованной expert rubric.

Эта развилка удерживает простые features лёгкими, но сохраняет отдельный
canonical contract там, где без него два агента могут получить разные pass/fail
результаты. Subject spec описывает методику и evidence, но не создаёт
отсутствующий product target.

То же правило отражается в `/spec-auto`, `/feature-to-tasks` и bootstrap testing
strategy. Благодаря этому manual и unattended flow используют один contract,
а fresh target не подталкивает агента создавать spec для каждой простой
проверки.

## 5. Task planning проводит acceptance до proof

Перед созданием или reconciliation task records `/feature-to-tasks` выполняет
один bounded scan material outcomes целевой feature:

- каждый material edge/failure имеет AC или authoritative disposition;
- каждый material NFR имеет принятый REQ/AC target, существенные условия и
  verification method;
- каждый принятый AC покрыт хотя бы одной task через точный feature anchor.

Очевидно отсутствующий locator может быть добавлен при reconciliation. Когда
обнаруживается изменение AC, tier, dependency, task identity или material
scope существующей очереди, используется существующий `rebuild_required`.
Скрытый ремонт был бы дешевле локально, но сделал бы прежний review и task
identity недостоверными.

Task, доказывающая material NFR, использует существующие поля:

```text
source_artifacts     -> exact FT-*-AC-* locator
reqs                 -> governing REQ-*
verification_targets -> concrete probe/review and mapped AC IDs
evidence_required    -> observed value or rubric result, decisive conditions,
                        pass/fail comparison and evidence artifact
```

Один probe может покрывать несколько AC, когда mapping перечислен явно. Это
сохраняет дешёвую проверку без потери legibility.

Само наличие NFR не повышает tier. Tier по-прежнему определяется фактическим
boundary, state/data/security/runtime impact и blast radius. Для `T2/T3`
действует существующий claim-linked RED/GREEN contract. Для `T1` достаточно
compact evidence, однако непустые `verification_targets` и
`evidence_required` остаются условиями честного fast-lane closure. Автоматически
переводить каждый material NFR в `T2` было бы лишним усложнением tier semantics.

## 6. Review разделяет раннюю и финальную защиту

`/review-feat-plan` получает раннюю semantic-проверку: material outcomes
замкнуты в REQ/AC либо authoritative exclusions, а missing product target
возвращается владельцу до SDD/task work. Этот gate остаётся условным для малого
manual flow, поэтому он не является единственной защитой.

Обязательный `/review-tasks-plan` проверяет финальную цепочку:

```text
material outcome -> REQ/AC -> task -> credible proof
```

REJECT называет конкретный незамкнутый outcome и owning repair route:
`/write-prd`, `/prd-to-features`, `/feature-doctor`, `/spec-design` или
`/feature-to-tasks` по фактическому ownership.

`/mb-doctor` сохраняет текущую механическую роль: валидность AC identity,
locators и формально планируемого T2/T3 proof. Материальность outcome и
достаточность qualitative criterion являются semantic judgments; эвристический
NFR/edge parser добавил бы ложные PASS/FAIL и новую стоимость сопровождения.
Поэтому эта часть остаётся у fresh-context reviews.

## 7. Execution и verification используют существующий lifecycle

`/exe` учитывает `evidence_required` вместе с уже читаемыми task inputs. Это
особенно важно для `T1`, где отдельный `/verify` в manual flow может не
запускаться. Compact closure возможен только после записи требуемого
acceptance evidence.

`/verify` уже проверяет mapped AC/REQ, verification targets и evidence
requirements, поэтому новый verification stage ему не требуется.

Human/expert review является способом получения evidence. В task planning
фиксируются применимая rubric, требуемая квалификация/роль reviewer и форма
evidence artifact. Это не новый lifecycle checkpoint и не существующий
`T3 HUMAN_CHECKPOINT`; смешение этих понятий неоправданно усилило бы любой
качественный NFR до критического workflow.

## 8. Совместимость и границы изменения

Правило применяется перспективно к новым и reconciled `planned|ready` work.
Исторические terminal tasks не получают выдуманный backfill, пока feature не
переоткрыта или её accepted behavior не изменилось. Такой режим сохраняет
историю и соответствует существующей prospective RED/GREEN совместимости.

Принятое изменение target, условий или AC запускает обычный reconciliation
затронутых features. Изменение глобального verification contract использует
существующий Planning Revision только тогда, когда оно действительно меняет
global planning surface; отдельная feature revision в рамках этой задачи не
появляется.

В реализации не меняются:

- task schema, registry и lifecycle statuses;
- verdict vocabulary и closure ownership;
- tier assignment rules;
- protocol family;
- `/verify` и `/mb-doctor` semantics;
- Foundation flow;
- installer algorithm.

Также не появляются `EC-*`, `NFR-*`, acceptance registry, quality-contract
artifact, обязательный Given/When/Then, отдельный `not_applicable` status или
новый gate.

## 9. Минимальная implementation surface

Основное runtime-поведение сосредоточено в следующих canonical sources:

- `skills/_shared/references/commands/write-prd.md` — product-owned NFR
  clarification и запрет на invented target;
- `skills/_shared/references/commands/prd-to-features.md` — создание REQ/AC и
  closure edge/failure outcomes;
- `skills/_shared/references/commands/feature-doctor.md` — сохранение closure и
  upstream route для target changes;
- `skills/_shared/references/commands/review-feat-plan.md` — ранняя semantic
  проверка;
- `skills/_shared/references/commands/spec-auto.md` — та же граница subject spec
  в unattended design;
- `skills/_shared/references/commands/feature-to-tasks.md` — bounded closure
  scan, subject-spec decision и task proof mapping;
- `skills/_shared/references/commands/review-tasks-plan.md` — финальный semantic
  verdict;
- `skills/_shared/references/commands/exe.md` — применение `evidence_required`
  в compact fast lane;
- `skills/_shared/references/workflows/execute-loop.md` — краткий общий
  acceptance-closure invariant без дублирования leaf contracts;
- `skills/_shared/scripts/init-mb.js` и
  `skills/_shared/references/structure-template.md` — согласованная fresh-target
  testing strategy;
- `PROJECT_MAP.md` и `howItWorks.md` — source ownership и пользовательское
  объяснение flow;
- `scripts/test-install-sync.mjs` — проверка deployed contract в обеих runtime
  surfaces и bootstrap strategy.

Installer менять не требуется: canonical command specs уже напрямую
генерируются в `.agents/skills/` и `.claude/skills/`. Отсутствие новой schema и
validator semantics также означает, что `mb-doctor.mjs` и его fixture matrix
остаются regression checks, а не частью write set.

## 10. Проверка реализации

Готовность изменения подтверждается следующими наблюдаемыми результатами:

- runtime contracts во fresh install содержат обе material-outcome ветки и
  одинаковы для Codex/Claude surfaces;
- fresh bootstrap testing strategy оставляет простой method в AC/task и
  направляет в subject spec только нетривиальную методику;
- существующие AC/task/RED-GREEN, lifecycle и review-freshness regression tests
  продолжают проходить;
- source-only дерево не содержит generated `shared-*` copies;
- изолированные `--install-only` и `--bootstrap` targets проходят smoke
  inspection.

Проверочный набор остаётся существующим:

```bash
npm run check:syntax --silent
npm run test:mb-doctor --silent
npm run test:install-sync --silent
find skills -path 'skills/_shared' -prune -o -type f -name 'shared-*' -print | wc -l
```

## Источники

### Методические

- [spec-driven-workflow/SKILL.md, строки 154–177](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/general/spec-driven-workflow/SKILL.md#L154-L177) связывает requirements, AC, edge cases и test cases.
- [spec_format_guide.md, строки 242–268](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/general/spec-driven-workflow/references/spec_format_guide.md#L242-L268) описывает edge/error scenarios и coverage внешних зависимостей.
- [acceptance_criteria_patterns.md, строки 327–383](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/general/spec-driven-workflow/references/acceptance_criteria_patterns.md#L327-L383) показывает failure и negative outcomes как acceptance criteria.
- [spec_format_guide.md, строки 142–182](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/general/spec-driven-workflow/references/spec_format_guide.md#L142-L182) требует measurable thresholds для существенных NFR.
- [acceptance_criteria_patterns.md, строки 387–417](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/general/spec-driven-workflow/references/acceptance_criteria_patterns.md#L387-L417) связывает quality targets с operating conditions и measurement period.
- [spec-driven-workflow/SKILL.md, строки 208–219](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/general/spec-driven-workflow/SKILL.md#L208-L219) требует verification evidence для NFR до завершения implementation.

### Текущий DevRails contract

- `skills/_shared/references/commands/write-prd.md:40-63,79-89,104-112` — product-level ambiguity, NFR/verification coverage и clarification blocker.
- `skills/_shared/references/commands/prd-to-features.md:50-52,55-72,78-100,134-145` — stable AC identity, upstream decision route, REQ/RTM и observable criterion с verification method.
- `skills/_shared/references/commands/feature-doctor.md:42-47,50-88,99-118` — stable AC preservation, NFR/verification clarification и design repair routes.
- `skills/_shared/references/commands/spec-auto.md:38-50,103-162` — unattended target authority и минимальные subject-based specs.
- `skills/_shared/references/commands/feature-to-tasks.md:96-120,180-221,255-321,324-343` — operator decision ownership, canonical spec boundary, `rebuild_required`, AC-to-task и proof mapping.
- `skills/_shared/references/commands/review-tasks-plan.md:118-167` — обязательный semantic review AC/REQ/task/proof readiness.
- `skills/_shared/references/commands/exe.md:33-52,246-252` — task inputs, observable success preflight и execution evidence.
- `skills/_shared/references/commands/verify.md:106-121,195-217` — независимая проверка mapped AC/REQ, verification targets и evidence requirements.
- `skills/_shared/references/commands/mb-doctor.md:142-168` — механическая AC/task/proof проверка и явная граница semantic applicability.
- `skills/_shared/scripts/init-mb.js:1086-1122` и `skills/_shared/references/structure-template.md:692-726` — текущая bootstrap testing strategy и ownership evidence.
- `scripts/install-framework.mjs:633-652,749-778` — direct generation canonical command specs в обе runtime surfaces.
