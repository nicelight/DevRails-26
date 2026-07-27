# ТЗ: адаптация execution-механизмов `bx-dev-skill` в DevRails 26

**Статус документа:** source of truth для повторного review и реализации Wave 1 + Wave 2  
**Целевой проект:** [`nicelight/DevRails-26`](https://github.com/nicelight/DevRails-26)  
**Рабочая ветка:** [`bx-integration`](https://github.com/nicelight/DevRails-26/tree/bx-integration)  
**Референсный проект:** [`bish-x/bx-dev-skill`](https://github.com/bish-x/bx-dev-skill)  
**Зафиксированный snapshot `bx-dev-skill`:** [`dd7fa7a2f65e487e49847394bff6cd5986b5877e`](https://github.com/bish-x/bx-dev-skill/tree/dd7fa7a2f65e487e49847394bff6cd5986b5877e)  
**База DevRails, указанная для review:** [`80720b535ad174fa0a634203c7fcd95af9ec0b92`](https://github.com/nicelight/DevRails-26/commit/80720b535ad174fa0a634203c7fcd95af9ec0b92)

> Это ТЗ описывает **ожидаемый результат**, а не подтверждает корректность уже
> находящихся в `bx-integration` изменений. Перед продолжением необходимо
> сравнить ветку с этим документом и исправить расхождения.

---

## 1. Суть идеи

DevRails и `bx-dev` решают разные задачи.

- **DevRails** сильнее как control plane полного цикла:
  Product/PRD → SDD → feature/task decomposition → tier policy → `/exe` →
  `/verify` → `/red-verify` → lifecycle → `/autopilot`.
- **`bx-dev`** содержит более развитые execution-механики:
  управление subagents, восстановление после interruption, узкие reviewers,
  systematic debugging и lazy routing специализированных engineering skills.

Поэтому цель — **не мигрировать DevRails на `bx-dev`**, а усилить execution-layer
DevRails отдельными проверенными механизмами `bx-dev`, сохранив его собственные
task model, workflow ownership и sequential scheduler.

Целевой результат:

1. делегированные агенты имеют минимальное восстанавливаемое task-scoped state;
2. реализация может проходить узкое независимое review без смешивания ownership;
3. observed failures диагностируются через root-cause workflow, а не случайными
   исправлениями;
4. специализированная инженерная guidance загружается лениво, только когда она
   действительно нужна;
5. для дорогих T3-equivalent design decisions применяется ограниченный
   adversarial doubt cycle.

---

## 2. Важное уточнение: ранний черновик идеи больше не действует

Первоначальная широкая идея переноса execution-layer включала:

- task/session branches;
- `git worktree`;
- PR/merge lifecycle;
- Merger role;
- отдельный Merge Protocol;
- параллельных reviewers.

После KISS-review эти элементы были **явно исключены**.

Настоящее ТЗ заменяет ранний черновик. Реализуется только:

- **Wave 1:** task-scoped agent runtime + специализированные read-only reviewers;
- **Wave 2:** `/debug` + lazy routing специализированных engineering skills +
  bounded doubt-driven design + отдельное решение по интеграции кандидатов
  DDD, UI/UX, Security и Performance.

---

## 3. Референсные файлы `bx-dev-skill`

### 3.1. Wave 1: runtime state и reviewers

#### Основные источники

1. [`skills/bx-dev/SKILL.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/SKILL.md)

   Использовать разделы:

   - `Codex Runtime Contract`;
   - `State Files`;
   - `Delegation rule`;
   - `Spawn lifecycle transaction`;
   - `Liveness Doctrine`;
   - `Interrupted waits and late notifications`;
   - `Close is explicit`;
   - `Smart Reviewer Selection`;
   - inline prompts:
     - `Bug Reviewer`;
     - `Security Reviewer`;
     - `Compliance Reviewer`;
     - `QA`.

   Из этого файла берутся идеи:

   - хранить настоящий `agent_id`;
   - сохранять состояние **до wait**;
   - явно фиксировать `waiting_for`;
   - сначала потреблять late final notification, а не respawn;
   - сохранять отчёт до закрытия агента;
   - явно закрывать завершённого агента;
   - разделять reviewers по области ответственности;
   - не запускать дорогие review-процедуры для trivial work.

2. [`skills/bx-dev/docs/CODEX-ORCHESTRATION.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/docs/CODEX-ORCHESTRATION.md)

   Использовать разделы:

   - `Runtime Mapping`;
   - `Lead Contract`;
   - `Spawn lifecycle rule`;
   - `Hard lifecycle rule`;
   - `Spawn Policy`;
   - `Report Contract`;
   - `Waiting And Liveness`;
   - `QA Browser Caveat`.

   Этот файл является главным референсом для runtime-neutral адаптации:

   - `spawn → persist id → wait`;
   - `final report → persist → close → mark closed`;
   - live agent можно продолжить;
   - completed/closed/stale agent нельзя считать persistent panel;
   - browser QA без реального browser runtime возвращает `BLOCKED/UNVERIFIED`,
     а не выдуманный PASS.

### 3.2. Wave 2: debugging и lazy guidance

3. [`skill-library/engineering/systematic-debugging/SKILL.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/engineering/systematic-debugging/SKILL.md)

   Использовать:

   - root cause before fix;
   - reproduce consistently;
   - check recent changes;
   - trace data through component boundaries;
   - one explicit hypothesis at a time;
   - smallest experiment;
   - failing regression test before final fix, когда это практически применимо;
   - после трёх неудачных fix attempts остановиться и проверить architecture/spec
     mismatch.

4. [`skill-library/engineering/systematic-debugging/root-cause-tracing.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/engineering/systematic-debugging/root-cause-tracing.md)

   Использовать backward tracing: symptom → immediate cause → caller → source of
   invalid state/value → root trigger.

5. [`skill-library/engineering/systematic-debugging/condition-based-waiting.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/engineering/systematic-debugging/condition-based-waiting.md)

   Использовать для async/flaky failures: ждать наблюдаемое условие, а не
   произвольный `sleep`.

6. [`skill-library/system/skill-finder/SKILL.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/system/skill-finder/SKILL.md)

   Использовать:

   - routing по intent;
   - category-first discovery;
   - читать только один подходящий skill;
   - не загружать guidance «на всякий случай»;
   - ограничивать суммарный context budget;
   - compound task обрабатывать последовательно по фазам.

7. [`skill-library/INDEX.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/INDEX.md)  
   [`skill-library/MANIFEST.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/MANIFEST.md)

   Использовать только как референс организации lazy routing.

   **Не переносить** полный каталог из 105 skills и не создавать его копию в
   DevRails.

8. [`skill-library/engineering/doubt-driven-development/SKILL.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/engineering/doubt-driven-development/SKILL.md)

   Использовать ограниченный цикл:

   `CLAIM → EXTRACT → DOUBT → RECONCILE → STOP`.

   Важные свойства:

   - fresh-context reviewer получает artifact + authoritative contract;
   - reviewer не получает авторский вывод и цепочку аргументации;
   - reviewer ищет проблемы, а не подтверждает решение;
   - findings являются input, а не verdict;
   - максимум три цикла;
   - external/cross-model CLI не запускается без отдельного разрешения.

### 3.3. Wave 2: кандидаты для анализа и lazy-интеграции

Следующие upstream skills являются **обязательными кандидатами для анализа**, но
не предписывают заранее конкретную форму интеграции.

До изменения DevRails для каждого кандидата нужно определить:

1. к каким commands и этапам DevRails он действительно применим;
2. какие trigger conditions должны его активировать;
3. что уже покрыто существующими DevRails contracts;
4. можно ли использовать original skill целиком;
5. какие зависимости и context cost несёт original skill;
6. какая из форм интеграции минимальна:
   - использовать уже установленный original skill;
   - поставлять original/adapted skill как optional DevRails skill;
   - добавить thin adapter/routing reference к установленному skill;
   - встроить только небольшой обязательный invariant в существующий owning
     command;
   - признать candidate неприменимым и ничего не внедрять;
7. как избежать дублирования и ручной синхронизации сокращённой копии.

**Отдельная сущность `compact packs` не является требованием и не должна
создаваться по умолчанию.** Предпочитать original skill или тонкую интеграцию,
когда они совместимы с ownership и KISS DevRails.

9. [`skill-library/architecture/ddd/SKILL.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/architecture/ddd/SKILL.md)

   Проверить применимость к `/spec-design`, `/feature-to-tasks`, `/exe` и
   architecture-sensitive review.

   Полезные upstream-механизмы, которые нельзя потерять при выбранной интеграции:

   - classification:
     `DDD-new | DDD-existing | legacy-preserve | non-domain | too-small`;
   - default: наследовать стиль существующей области;
   - `DDD-new` — редкое исключение;
   - legacy нельзя перепроектировать в DDD внутри соседней task;
   - ACL нужен только при реальной semantic/ownership boundary.

   DDD не должен становиться обязательным workflow или task field.

10. [`skill-library/frontend/ui-ux-pro-max/SKILL.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/frontend/ui-ux-pro-max/SKILL.md)

    Проверить применимость к UI implementation, UI review и observable QA.

    При анализе учесть две разные части upstream skill:

    - полезные universal rules: accessibility, keyboard/focus, interaction,
      loading/error feedback, responsive layout, layout stability, reduced
      motion, typography/readability;
    - тяжёлая optional часть: searchable design database, Python CLI, palettes,
      styles, font pairings и persistent design-system artifacts.

    Нельзя автоматически переносить тяжёлую часть или навязывать design system
    каждой UI task. Если original skill используется целиком, его зависимости
    должны быть реально установлены и проверены.

11. [`skill-library/review-qa/code-review-expert/references/security-checklist.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/review-qa/code-review-expert/references/security-checklist.md)

    Проверить, достаточно ли существующего Security Reviewer Wave 1 или нужен
    дополнительный lazily loaded source-review skill/reference.

    Релевантные области:

    - attacker-controlled input;
    - injection/XSS/SSRF/path traversal;
    - AuthN/AuthZ и tenancy/ownership;
    - secrets/PII;
    - unsafe deserialization;
    - resource exhaustion;
    - race/TOCTOU;
    - transaction and idempotency risks.

    Не создавать второй security verdict owner и не превращать это в live
    pentest.

12. [`skill-library/backend/ai-security/SKILL.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/backend/ai-security/SKILL.md)

    Рассматривать отдельно и только для AI/LLM scope:

    - prompt injection;
    - unsafe tool use;
    - untrusted model output;
    - data leakage across agent/tool boundaries.

    Не загружать для обычной application security task.

13. [`skill-library/backend/performance-profiler/SKILL.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/backend/performance-profiler/SKILL.md)  
    [`skill-library/review-qa/performance-audit/SKILL.md`](https://github.com/bish-x/bx-dev-skill/blob/dd7fa7a2f65e487e49847394bff6cd5986b5877e/skills/bx-dev/skill-library/review-qa/performance-audit/SKILL.md)

    Эти skills покрывают разные surfaces:

    - `performance-profiler`: backend, CPU, memory, I/O, database, load;
    - `performance-audit`: browser, loading, bundle и Core Web Vitals.

    Router должен выбирать только релевантный skill. Общие обязательные свойства:

    - baseline before optimization;
    - profile/measure before changing;
    - одна optimization variable за раз;
    - повторное измерение в тех же условиях;
    - никакого production load test без явного разрешения.

## 4. Жёсткие ограничения интеграции

### 4.1. Не внедрять из `bx-dev`

- `.bx-dev/`;
- session state;
- session branches;
- task branches;
- `git worktree`;
- Merger role;
- PR/merge lifecycle;
- squash/merge policy;
- push/exit commands из `bx-dev`;
- параллельное выполнение tasks;
- параллельных task-scoped reviewers;
- отдельный task registry;
- отдельный scheduler;
- новые task lifecycle statuses;
- новый risk model поверх `T0|T1|T2|T3`;
- вторую систему task protocols;
- полный `skill-library/`;
- обязательный DDD;
- обязательную UI design-system генерацию;
- автоматический external/cross-model CLI;
- Codex-only публичный контракт.

### 4.2. Сохранить ownership DevRails

- `/exe` реализует выбранную task;
- `/verify` владеет functional verdict;
- `/red-verify` владеет semantic/adversarial verdict;
- `/autopilot` выбирает product tasks и закрывает lifecycle;
- `/autonomous` владеет только своим существующим outer flow и FT-000 phase;
- reviewers возвращают findings и не меняют task status;
- `/debug` устанавливает root cause, но не становится вторым implementer;
- `/spec-design` и `/spec-auto` остаются владельцами design decisions;
- Memory Bank остаётся durable knowledge base;
- `.protocols/` остаётся operational resume state;
- `.tasks/` остаётся evidence/report storage.

---

# WAVE 1 — Task-scoped runtime и специализированные reviewers

## 5. Task-scoped runtime state

### 5.1. Сначала проверить существующие artifacts

Перед созданием нового файла проверить, можно ли достоверно хранить runtime
identity и `waiting_for` в существующем machine-readable task protocol.

Добавлять новый artifact допустимо только потому, что существующие
`run.md/context.md/progress.md` являются prose-oriented и не дают надёжно
восстанавливать opaque runtime identity.

Разрешён ровно один новый task-owned operational artifact:

```text
.protocols/<TASK_ID>/runtime.json
```

Он:

- не входит в Memory Bank;
- не входит в task schema;
- не индексируется;
- не является source of truth task lifecycle;
- создаётся только при реальном делегировании;
- не создаётся для обычной single-agent `/exe` или `/verify`.

### 5.2. Минимальная модель

```json
{
  "task_id": "TASK-NNN-TN-FT-NNN-WN",
  "waiting_for": "",
  "agents": {
    "implementer": null,
    "bug_reviewer": null,
    "security_reviewer": null,
    "compliance_reviewer": null,
    "qa": null
  }
}
```

Непустой slot:

```json
{
  "agent_id": "<opaque runtime-specific id>",
  "role": "implementer|bug_reviewer|security_reviewer|compliance_reviewer|qa",
  "status": "running|waiting|completed|closed|failed",
  "waiting_for": "<exact expected durable output or empty>"
}
```

### 5.3. Инварианты

1. `task_id` совпадает с directory и authoritative task ID.
2. `agent_id` opaque; его формат не имеет workflow-семантики.
3. Одновременно не более одного slot со статусом `running|waiting`.
4. Top-level `waiting_for`:
   - пустой; или
   - равен имени единственного активного slot.
5. Agent status не является task status.
6. `completed|closed` с durable final report запрещает повторный запуск того же
   stage.
7. Runtime state не выдаёт permission на production/destructive action.
8. Runtime state не заменяет existing `Execution Attempt`.
9. Filled `.protocols/<TASK_ID>/runtime.json` является task-owned и никогда не
   перезаписывается bootstrap/sync.

### 5.4. Lifecycle transaction

Для каждой delegation:

1. Прочитать `runtime.json` и существующий durable report.
2. Если предыдущий stage уже завершён — использовать report, не spawn.
3. Spawn через native mechanism текущего runtime.
4. Немедленно сохранить:
   - `agent_id`;
   - `role`;
   - `status: running`.
5. До любого wait:
   - поставить slot `status: waiting`;
   - заполнить slot `waiting_for`;
   - заполнить top-level `waiting_for`.
6. Дождаться final response или обработать late final notification.
7. Сначала сохранить полный handoff/findings в существующий protocol/report.
8. Затем:
   - `status: completed`;
   - очистить оба `waiting_for`.
9. Если runtime поддерживает explicit close/terminate:
   - закрыть agent;
   - записать `status: closed`.
10. Если explicit close отсутствует:
    - `completed` считается terminal;
    - не считать agent активным;
    - не spawn повторно.

### 5.5. Recovery matrix

| Runtime state | Durable final report | Действие |
|---|---|---|
| slot `null` | нет | spawn только если stage требуется |
| `running|waiting` | нет | inspect/resume тот же `agent_id`; сначала проверить late notification |
| `running|waiting` | есть | report побеждает stale wait; сохранить completion, close/finalize, продолжить |
| `completed|closed` | есть | consume report, не rerun |
| `completed|closed` | нет | evidence gap; не rerun unsafe/non-idempotent stage автоматически |
| `failed` | нет | replacement допустим только при safe replay и всё ещё требуемом stage |
| stale/missing id | нет | новый spawn только после записи причины replacement |
| stale/missing id | есть | использовать report, не respawn |

### 5.6. Runtime neutrality

Документы DevRails должны описывать semantic operations:

- spawn;
- continue/correct live agent;
- wait/resume;
- consume final notification;
- close/finalize.

Допускаются runtime-specific примеры, но нельзя требовать от Claude Code буквальные
Codex tools `wait_agent`, `send_input`, `close_agent`.

---

## 6. Specialized read-only reviewers

### 6.1. Архитектурная форма

Не создавать четыре новые top-level role systems.

Использовать существующий:

```text
ROLE: Reviewer
```

с четырьмя specialization modes:

- Bug Reviewer;
- Security Reviewer;
- Compliance Reviewer;
- QA Reviewer.

### 6.2. Общий контракт

Каждый reviewer:

- read-only;
- работает только по переданному task/change surface;
- может запускать read-only checks;
- не исправляет код;
- не меняет task record;
- не создаёт BUG/task;
- не выдаёт `/verify` или `/red-verify` verdict;
- возвращает только high-signal findings;
- отличает отсутствие evidence от PASS.

Рекомендуемый единый формат:

```text
REVIEW_FINDINGS
reviewer: bug|security|compliance|qa
task_id: TASK-...
result: NO_FINDINGS|FINDINGS|BLOCKED
findings:
- id: BUG-001|SEC-001|COMP-001|QA-001
  severity: BLOCKER|HIGH|MEDIUM|LOW
  evidence: <file:line, command/result, or durable artifact>
  impact: <concrete impact>
  recommendation: <smallest sufficient correction or next probe>
checks_run:
- <check or none>
gaps:
- <missing evidence or none>
```

`NO_FINDINGS` не является approval.  
`BLOCKED` не является FAIL; это отсутствие достаточного review evidence.

### 6.3. Bug Reviewer

Источник: inline `Bug Reviewer` prompt в `skills/bx-dev/SKILL.md`.

Проверяет:

- syntax/import/module resolution;
- гарантированные type/null failures;
- branching и state transition errors;
- off-by-one/infinite loop;
- incorrect algorithm/data flow;
- retry/idempotency defects;
- mismatch task/spec ↔ implementation;
- regression, вызванную текущим diff.

Не проверяет:

- style;
- naming;
- общую refactoring quality;
- speculative improvements;
- security, если она не является непосредственной correctness-причиной.

### 6.4. Security Reviewer

Источник: inline `Security Reviewer` prompt и security checklist.

Проверяет только concrete attack surface текущей task:

- AuthN/AuthZ;
- injection;
- XSS;
- SSRF;
- path traversal;
- unsafe parsing/deserialization;
- secrets/PII exposure;
- privilege escalation;
- security-relevant races;
- unsafe defaults.

Каждый finding обязан содержать:

- attacker/precondition;
- exploit/abuse path;
- concrete impact;
- smallest mitigation.

Не выдавать theoretical hardening без доказуемого пути эксплуатации.

### 6.5. Compliance Reviewer

Источник: inline `Compliance Reviewer` prompt.

Проверяет только explicit authority:

- root и scoped `AGENTS.md`;
- legacy `CLAUDE.md`, если применяется;
- task constraints/invariants;
- direct canonical specs;
- Constitution/policy/privacy/licensing/regulatory rules только при явной
  применимости.

Finding допустим только если reviewer может назвать или процитировать точное
нарушенное правило.

### 6.6. QA Reviewer

Источник: inline `QA` prompt и `QA Browser Caveat`.

Проверяет:

- acceptance criteria;
- реальное observable behavior;
- smoke/regression;
- empty/invalid/boundary inputs;
- persistence/recovery;
- UI/API/CLI flow.

Для web:

- использовать реальный browser runtime и переданный dev-server URL;
- если browser или URL недоступен — `BLOCKED/UNVERIFIED`;
- запрещено выводить PASS только из чтения source.

### 6.7. Routing reviewers

Reviewers запускаются **последовательно**.

- Safe T0:
  - reviewer не обязателен.
- T1:
  - reviewer только при конкретной неопределённости/риске.
- `/verify`:
  - Bug Reviewer, когда independent correctness review действительно усиливает
    functional proof;
  - QA Reviewer, когда outcome требует реального runtime/acceptance exercise.
- `/red-verify`:
  - Security Reviewer при фактическом security surface;
  - Compliance Reviewer при фактическом explicit rule surface.
- T2/T3:
  - tier сам по себе не означает запуск всех четырёх reviewers;
  - выбираются только применимые специализации.

После reviewer findings:

- owning command самостоятельно проверяет finding;
- `/verify` сам принимает functional verdict;
- `/red-verify` сам принимает semantic verdict;
- scheduler/explicit owner принимает lifecycle decision;
- correction передаётся `/exe`, затем требуемые gates выполняются снова.

---

## 7. Target files DevRails для Wave 1

### Новые canonical source files

```text
skills/_shared/references/protocols/runtime-template.md
scripts/test-agent-runtime.mjs
```

### Изменяемые canonical contracts

```text
skills/_shared/references/roles/orchestrator.md
skills/_shared/references/roles/reviewer.md
skills/_shared/references/commands/exe.md
skills/_shared/references/commands/verify.md
skills/_shared/references/commands/red-verify.md
skills/_shared/references/commands/autopilot.md
skills/_shared/references/commands/autonomous.md
skills/_shared/references/workflows/execute-loop.md
skills/_shared/references/workflows/tier-policy.md
skills/_shared/references/deployable/AGENTS.md
PROJECT_MAP.md
package.json
scripts/test-install-sync.mjs
```

### Проверить, но не менять без необходимости

```text
scripts/install-framework.mjs
scripts/vendor-shared.mjs
skills/_shared/scripts/init-mb.js
skills/_shared/references/structure-template.md
skills/_shared/references/workflows/autonomy-policy.md
```

`init-mb.js` уже должен generic-копировать protocol templates. Не добавлять
специальную ветку только для `runtime-template.md`, если generic enumeration
работает.

---

## 8. Acceptance criteria Wave 1

- [ ] Fresh bootstrap разворачивает `runtime-template.md`.
- [ ] `.agents` и `.claude` получают одинаковые contracts.
- [ ] `runtime.json` создаётся только после реального delegation.
- [ ] Agent ID сохраняется до wait.
- [ ] Late notification потребляется до respawn.
- [ ] Completed stage с final report не запускается снова.
- [ ] Agent закрывается явно, когда runtime это поддерживает.
- [ ] Один task-scoped agent активен одновременно.
- [ ] Reviewers read-only и findings-only.
- [ ] Safe T0 не требует reviewer.
- [ ] `/verify`, `/red-verify`, `/autopilot` сохраняют ownership.
- [ ] Task schema не изменён.
- [ ] Task lifecycle vocabulary не изменён.
- [ ] Bootstrap/sync не перезаписывает task-owned `runtime.json`.
- [ ] Нет `.bx-dev`, worktree, session branch, Merger или PR lifecycle.
- [ ] Existing install/sync и doctor tests проходят.

---

# WAVE 2 — Debugging и lazy engineering guidance

Wave 2 начинается только после того, как Wave 1 прошла review и isolated-target
tests.

## 9. `/debug`: systematic root-cause workflow

### 9.1. Новый command

Canonical source:

```text
skills/_shared/references/commands/debug.md
```

Установка создаёт:

```text
.agents/skills/debug/SKILL.md
.claude/skills/debug/SKILL.md
```

### 9.2. Когда использовать

Использовать только при observed failure:

- failing test/build/lint;
- unexpected output;
- regression;
- flaky behavior;
- runtime failure;
- confirmed performance problem.

Не использовать для:

- planned feature work;
- routine `/verify`;
- speculative optimization;
- общего code review.

### 9.3. Ownership

`/debug` владеет **диагнозом**, а не task implementation.

- Он не выбирает task.
- Он не меняет task status.
- Он не закрывает lifecycle.
- Он не редактирует product/spec.
- Он не становится вторым `/exe`.

В task flow:

```text
observed failure
→ /debug <TASK_ID>
→ confirmed root cause + reproduction + recommended minimal correction
→ /exe <TASK_ID>
→ /verify
→ /red-verify, если требуется tier policy
```

Если current top-level `/exe` уже выполняет task, он может применить тот же
debugging contract внутри task без отдельного nested command, но обязан записать
evidence/root cause до исправления.

### 9.4. Debug phases

#### Phase 1 — Reproduce and collect evidence

- прочитать полную ошибку/stack trace;
- воспроизвести;
- записать exact command/input/environment;
- проверить recent diff;
- определить component boundary, где состояние ломается;
- если не воспроизводится — собирать evidence, не угадывать.

#### Phase 2 — Trace root cause

- symptom;
- immediate cause;
- caller/source;
- origin of invalid value/state;
- first violated invariant.

Исправление в месте симптома запрещено, пока не доказано, что это и есть source.

#### Phase 3 — One hypothesis

Записать:

```text
HYPOTHESIS:
EVIDENCE:
MINIMAL EXPERIMENT:
EXPECTED RESULT:
OBSERVED RESULT:
```

Менять одну переменную за раз.

#### Phase 4 — Handoff correction

Выдать:

- reproduction;
- confirmed root cause;
- disproved hypotheses;
- smallest sufficient correction;
- regression check;
- residual uncertainty.

После трёх неудачных correction hypotheses:

- остановиться;
- проверить architecture/spec/task mismatch;
- не делать четвёртый случайный fix;
- передать решение соответствующему owner.

### 9.5. Evidence storage

Не создавать debug registry или новый lifecycle.

Использовать существующие:

```text
.protocols/<TASK_ID>/run.md
.protocols/<TASK_ID>/progress.md
.protocols/<TASK_ID>/handoff.md
.tasks/<TASK_ID>/
```

---

## 10. Lazy routing специализированных engineering skills

### 10.1. Адаптировать существующий `/find-skills`

Изменить:

```text
skills/_shared/references/commands/find-skills.md
```

Порядок routing:

1. проверить project-installed skills в `.agents/skills` и `.claude/skills`;
2. проверить, покрывает ли задачу существующий DevRails command;
3. сопоставить intent только с теми upstream candidates, для которых Wave 2
   приняла явное integration decision;
4. если candidate уже установлен — загрузить его lazily;
5. если candidate не установлен — показать точный verified origin и выбранный
   install/integration route, но ничего не устанавливать автоматически;
6. external install — только после explicit approval;
7. `/autonomous` никогда не устанавливает external skills.

Router не должен превращаться в копию upstream `MANIFEST.md` или новый глобальный
registry. Достаточен небольшой список фактически поддержанных integrations и их
trigger descriptions.

### 10.2. Lazy loading rules

- trivial/mechanical T0 — не запускать skill search;
- сначала читать только `name`/`description` и краткий routing metadata;
- загружать один наиболее специфичный `SKILL.md`;
- второй skill допустим только для реально compound scope;
- общий рекомендуемый budget — не более 1500 строк `SKILL.md` на одну task;
- compound task загружает skills последовательно по текущей фазе;
- не читать все candidate skills заранее;
- не загружать skill «на всякий случай»;
- selected skill не создаёт requirement, tier, status, task или architecture
  authority;
- explicit DevRails command/role/tier ownership всегда имеет приоритет над
  imported guidance.

### 10.3. Допустимые integration modes

Для каждого candidate выбрать ровно один результат:

| Mode | Когда использовать |
|---|---|
| `use-installed-original` | original skill уже установлен и совместим с DevRails ownership |
| `optional-skill` | original/adapted skill целесообразно поставлять как отдельный optional skill |
| `thin-adapter` | нужен короткий DevRails router/adapter к установленному original skill |
| `inline-invariant` | от большого skill нужен только небольшой обязательный invariant в owning command |
| `not-integrated` | overlap, dependency cost или complexity выше доказанной пользы |

Нельзя автоматически выбирать `inline-invariant` только ради уменьшения файла:
ручная сокращённая копия создаёт drift. Когда original skill пригоден, предпочитать
его или thin adapter.

### 10.4. Routing examples

| Task pressure | Candidate route |
|---|---|
| observed failure | `/debug` |
| DDD-shaped domain или legacy-domain decision | selected route для upstream `ddd`, если интеграция одобрена |
| UI implementation/review | installed/optional `ui-ux-pro-max` либо выбранный thin route |
| auth/input/secrets/trust boundary | Wave 1 Security Reviewer + selected security skill только при дополнительной пользе |
| backend/DB slowness | `performance-profiler`, если установлен/подключён |
| browser loading/Core Web Vitals | `performance-audit`, если установлен/подключён |
| high-stakes uncertain design claim | bounded `doubt-driven-development` adaptation |

---

## 11. Candidate-by-candidate integration analysis

### 11.1. Обязательная decision matrix

Перед реализацией routing по DDD, UI/UX, Security и Performance агент должен
сформировать в implementation report следующую таблицу:

| Candidate | DevRails stages | Trigger | Existing overlap | Dependencies | Modes considered | Selected mode | Rationale | Verification |
|---|---|---|---|---|---|---|---|---|

Это не новый registry и не постоянный framework artifact. Таблица нужна для
review конкретной Wave 2 implementation и может находиться в существующем
task/report/handoff.

Для каждого решения проверить:

- не дублируется ли уже существующий command/role;
- не вводится ли второй owner;
- не требуется ли тяжёлая runtime dependency;
- доступен ли original skill обеим runtime surfaces;
- можно ли обновлять integration без ручной синхронизации форка;
- действительно ли context экономится за счёт lazy loading;
- что произойдёт, если skill отсутствует.

### 11.2. DDD candidate

Ожидаемый результат анализа:

- DDD включается только при domain pressure;
- local/legacy style наследуется по умолчанию;
- DDD не становится обязательным для infrastructure/UI/migration/T0;
- classification не добавляется в task schema;
- original `ddd` skill предпочтителен, если его можно подключить без conflict;
- если выбирается inline rule, он должен быть минимальным и не дублировать весь
  upstream skill.

### 11.3. UI/UX candidate

Ожидаемый результат анализа:

- отделить universal accessibility/interaction guidance от optional searchable
  design intelligence;
- не объявлять Python CLI и design database обязательными без установки и smoke;
- не навязывать Tailwind, React, component library или новый design-system
  lifecycle;
- выбрать original skill целиком только если dependencies действительно
  поставляются и полезны;
- иначе использовать thin route или ограниченный existing-command invariant.

### 11.4. Security candidates

Ожидаемый результат анализа:

- Wave 1 Security Reviewer остаётся findings-only helper `/red-verify`;
- дополнительный skill подключается только для scope, которого Reviewer contract
  недостаточно покрывает;
- general app security и AI security маршрутизируются отдельно;
- concrete abuse path обязателен;
- live scan, pentest и production probing не входят в default integration;
- не создаётся второй security verdict.

### 11.5. Performance candidates

Ожидаемый результат анализа:

- backend и browser performance не смешиваются;
- router выбирает `performance-profiler` или `performance-audit` по surface;
- baseline и same-condition before/after evidence обязательны;
- optimization без измерения запрещена;
- production load test требует explicit approval;
- если original skills не поставляются, `/find-skills` должен честно сообщать
  unavailable route, а не имитировать их наличие.

## 12. Bounded doubt-driven design

### 12.1. Где применяется

Интегрировать в:

```text
skills/_shared/references/commands/spec-design.md
skills/_shared/references/commands/spec-auto.md
```

Не применять ко всем design decisions.

Trigger только для уже авторизованного, но нетривиального claim:

- security/safety;
- irreversible migration;
- public contract;
- data ownership;
- cross-module invariant;
- ordering/idempotency;
- production-critical runtime boundary;
- высокое влияние ошибки при неполной уверенности.

Unresolved operator decision сначала блокируется обычным DevRails route.
Doubt cycle не может превратить assumption в accepted decision.

### 12.2. Цикл

1. **CLAIM**
   - сформулировать проверяемое утверждение;
   - объяснить стоимость ошибки.

2. **EXTRACT**
   - минимальный artifact;
   - authoritative contract;
   - не передавать reviewer авторский CLAIM и chain of thought.

3. **DOUBT**
   - fresh read-only Reviewer;
   - issues-only prompt;
   - искать assumptions, edge cases, hidden coupling, failure modes,
     contract violations.

4. **RECONCILE**
   - owning design command классифицирует каждый finding:
     - contract misread;
     - valid/actionable;
     - accepted trade-off;
     - noise.
   - reviewer не принимает решение за owner.

5. **STOP**
   - остановиться при отсутствии новых substantive findings;
   - максимум три цикла;
   - после трёх циклов unresolved issue передаётся operator/design owner.

### 12.3. State и interruption

Это не task implementation и не использует task-scoped `runtime.json`.

- Не создавать design-agent registry.
- Не создавать feature-level runtime.
- Review не имеет external side effects, поэтому после interruption его можно
  безопасно повторить из текущего canonical artifact.
- В `/spec-auto` external/cross-model CLI запрещён без отдельного user consent.
- Если fresh reviewer runtime недоступен, записать degraded local adversarial
  review; не выдавать его за independent fresh-context proof.

---

## 13. Интеграция Wave 2 в execution layer

### `/exe`

- при нетривиальной реализации может лениво загрузить один selected installed
  skill или thin adapter;
- при observed failure применяет `/debug` contract;
- imported guidance не расширяет task scope;
- DDD classification не заменяет canonical architecture/spec;
- отсутствие optional skill не разрешает имитировать его выполнение.

### `/verify`

- может лениво загрузить релевантный installed skill только для построения
  task-scoped functional proof;
- performance claim требует baseline и before/after evidence;
- UI claim требует observable acceptance;
- security guidance не превращает `/verify` в `/red-verify`;
- skill output остаётся supporting evidence.

### `/red-verify`

- использует только выбранные и реально доступные DDD/UI/Security/Performance
  skills для hostile model по фактической task surface;
- сохраняет собственный semantic verdict;
- не превращает external skills в обязательные reviewer categories;
- Wave 1 Security/Compliance Reviewers сохраняют свой findings-only contract.

### `/spec-design` и `/spec-auto`

- могут использовать upstream `ddd` только при реальном domain architecture
  pressure и только через выбранный integration mode;
- используют bounded `doubt-driven` только для high-stakes uncertain claims;
- сохраняют существующий operator-decision boundary;
- external skill/CLI не запускается автоматически в unattended flow.

### `ORCHESTRATOR`

- использует `/find-skills` как routing aid;
- не загружает все candidates;
- не создаёт новый skill registry или abstraction layer;
- не меняет ownership команд;
- сообщает, когда optional skill отсутствует, вместо скрытой деградации.

## 14. Target files DevRails для Wave 2

### Обязательный новый файл

```text
skills/_shared/references/commands/debug.md
```

Focused regression test допустимо добавить как:

```text
scripts/test-wave2.mjs
```

### Обязательные изменяемые files

```text
skills/_shared/references/commands/find-skills.md
skills/_shared/references/commands/exe.md
skills/_shared/references/commands/verify.md
skills/_shared/references/commands/red-verify.md
skills/_shared/references/commands/spec-design.md
skills/_shared/references/commands/spec-auto.md
skills/_shared/references/roles/orchestrator.md
skills/_shared/references/deployable/AGENTS.md
PROJECT_MAP.md
README.md
howItWorks.md
package.json
scripts/test-install-sync.mjs
```

### Условные files

Новые skill packages, adapters или references добавлять **только** если
candidate decision matrix выбрала соответствующий mode.

Возможные touchpoints определяются выбранной формой:

```text
skills/<selected-skill>/SKILL.md
skills/_shared/references/<existing-owner-specific-reference>.md
skills/_shared/scripts/init-mb.js
skills/_shared/references/structure-template.md
```

`init-mb.js` и `structure-template.md` менять только если действительно
появляется framework-owned target asset. Не создавать target asset ради самого
routing.

В рамках этого ТЗ не создавать обязательную структуру:

```text
skills/_shared/references/packs/
.memory-bank/skills/packs/
```

`autopilot.md` и `autonomous.md` менять только там, где требуется:

- запретить external auto-install;
- не дублировать `/debug`, `/verify` или `/red-verify`;
- сохранить scheduler stage vocabulary;
- корректно сообщать отсутствие optional skill.

## 15. Acceptance criteria Wave 2

### `/debug`

- [ ] Установлен в `.agents` и `.claude`.
- [ ] Не используется для planned work.
- [ ] Запрещает fix до root-cause evidence.
- [ ] Записывает reproduction и hypothesis.
- [ ] Не меняет task status.
- [ ] Handoff возвращается `/exe`.
- [ ] Не создаёт новый registry/protocol family.

### Lazy skill routing

- [ ] `/find-skills` сначала проверяет installed project skills.
- [ ] Existing DevRails command имеет приоритет перед external candidate.
- [ ] Trivial T0 не запускает skill routing.
- [ ] Загружается один наиболее специфичный skill; второй только для compound
      scope.
- [ ] Full upstream skill library не скопирована.
- [ ] Нет обязательной `packs/` subsystem.
- [ ] External install требует explicit approval.
- [ ] `/autonomous` не устанавливает external skills.
- [ ] Отсутствующий optional skill явно помечается unavailable, а не
      симулируется.

### Candidate integration decisions

- [ ] Для DDD, UI/UX, general Security, AI Security, backend Performance и web
      Performance заполнена decision matrix.
- [ ] Для каждого candidate выбран и обоснован один mode:
      `use-installed-original|optional-skill|thin-adapter|inline-invariant|not-integrated`.
- [ ] Original skill предпочитается сокращённой копии, когда он совместим и
      self-contained.
- [ ] Inline adaptation не дублирует большой upstream contract.
- [ ] DDD не стал обязательным и сохраняет legacy-first/KISS default.
- [ ] UI integration не навязывает framework/design-system и не заявляет
      отсутствующие Python/data dependencies.
- [ ] Security integration требует concrete abuse path и не создаёт второй
      verdict owner.
- [ ] Performance routing разделяет backend и browser surfaces и требует
      baseline/before-after evidence.

### Doubt-driven

- [ ] Trigger ограничен high-stakes design claims.
- [ ] Reviewer получает artifact + contract без авторского вывода.
- [ ] Findings не становятся verdict автоматически.
- [ ] Максимум три цикла.
- [ ] Unresolved operator branch не решается агентом.
- [ ] External/cross-model CLI не запускается автоматически.
- [ ] Feature/task runtime не создаётся.

### Packaging

- [ ] Fresh bootstrap разворачивает `/debug`.
- [ ] Любой optional DevRails-shipped skill/adaptor устанавливается одинаково в
      `.agents` и `.claude`.
- [ ] Sync сохраняет project-owned files.
- [ ] Existing `test:install-sync` и `test:mb-doctor` проходят.
- [ ] Source tree не содержит generated `shared-*`.
- [ ] Task schema не получил новых полей.
- [ ] Task statuses не изменились.
- [ ] Fresh target не содержит `.memory-bank/skills/packs/`.

## 16. Последовательность реализации

### Phase 0 — Preflight

1. Обновить `bx-integration` относительно актуального `main`.
2. Проверить `git status`.
3. Сравнить current diff с этим ТЗ.
4. Удалить временные CI/patch/download files, не являющиеся product changes.
5. Не начинать Wave 2 до закрытия Wave 1 findings.

### Wave 1A — Runtime contract

1. Добавить `runtime-template.md`.
2. Обновить `execute-loop.md`.
3. Обновить `orchestrator.md`.
4. Подключить Implementer lifecycle в `/exe`.
5. Подключить recovery в `/autopilot` и FT-000 recovery в `/autonomous`.

### Wave 1B — Reviewer contract

1. Добавить specialization modes в `reviewer.md`.
2. Подключить Bug/QA к `/verify`.
3. Подключить Security/Compliance к `/red-verify`.
4. Обновить `tier-policy.md`.
5. Проверить, что reviewers не меняют lifecycle.

### Wave 1C — Packaging and tests

1. Проверить generic template deployment.
2. Добавить isolated-target runtime test.
3. Запустить existing install/sync + doctor tests.
4. Сделать отдельный Wave 1 commit.

### Wave 2A — `/debug`

1. Добавить command contract.
2. Подключить к installer автоматически через command enumeration.
3. Добавить syntax и isolated install test.
4. Не смешивать с candidate skill analysis и не создавать лишнюю routing subsystem.

### Wave 2B — Candidate analysis и lazy skill routing

1. Полностью прочитать релевантные sections upstream DDD, UI/UX, Security и
   Performance skills.
2. Заполнить decision matrix по каждому candidate.
3. Для каждого candidate выбрать минимальный integration mode или
   `not-integrated`.
4. Расширить `/find-skills` только фактически поддержанными routes.
5. Подключить selected installed skills/adapters к owning commands без изменения
   ownership.
6. Не создавать `packs/` subsystem и не копировать полный upstream library.
7. Проверить отсутствие скрытой деградации при unavailable optional skill.
8. Проверить обе runtime surfaces и sync preservation.

### Wave 2C — Doubt-driven design

1. Добавить bounded contract.
2. Подключить к `/spec-design`.
3. Подключить к `/spec-auto` с unattended restrictions.
4. Не создавать runtime/artifact system.
5. Добавить contract regression tests.

### Wave 2D — Documentation and final validation

1. Обновить `PROJECT_MAP.md`.
2. Обновить `README.md` и `howItWorks.md`.
3. Выполнить все checks.
4. Сделать отдельные reviewable commits.
5. Push только в `bx-integration`.
6. Не merge в `main`.

---

## 17. Обязательные проверки

```bash
npm run check:syntax --silent
npm run test:install-sync --silent
npm run test:mb-doctor --silent
npm run test:agent-runtime --silent
npm run test:wave2 --silent

git diff --check

find skills \
  -path 'skills/_shared' -prune \
  -o -type f -name 'shared-*' -print
```

Дополнительно fresh target:

```bash
target="$(mktemp -d)"

node scripts/install-framework.mjs \
  --bootstrap \
  --target "$target" \
  --yes

test -f "$target/.agents/skills/exe/SKILL.md"
test -f "$target/.claude/skills/exe/SKILL.md"
test -f "$target/.agents/skills/debug/SKILL.md"
test -f "$target/.claude/skills/debug/SKILL.md"

test -f "$target/.memory-bank/templates/protocols/runtime-template.md"

# Wave 2 no longer requires a compact-pack subsystem.
test ! -d "$target/.memory-bank/skills/packs"

# Add explicit tests here for every optional skill/adapter actually selected by
# the candidate decision matrix. Each shipped runtime skill must exist in both:
#   "$target/.agents/skills/<name>/SKILL.md"
#   "$target/.claude/skills/<name>/SKILL.md"
```

---

## 18. Definition of Done

Интеграция завершена, когда:

1. DevRails сохранил собственный control plane и ownership.
2. Wave 1 runtime переживает interruption без duplicate execution.
3. Каждый завершённый agent закрывается или корректно считается terminal.
4. Reviewer findings узкие, evidence-backed и не меняют lifecycle.
5. Safe T0 не обложен обязательными review/guidance процедурами.
6. `/debug` запрещает guess-and-fix и возвращает подтверждённый root cause.
7. Специализированные skills маршрутизируются лениво; отдельная обязательная `packs` subsystem не создана.
8. Doubt-driven review ограничен high-stakes design claims и тремя циклами.
9. Полный `bx-dev` session/branch/merge/skill-library слой не перенесён.
10. Fresh bootstrap, sync, Codex и Claude runtime surfaces проверены.
11. Ветка `bx-integration` содержит только целевые изменения.
12. В `main` ничего не слито.
