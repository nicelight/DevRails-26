  Главное:

  1. skills/_shared/scripts/init-mb.js:397 генерирует AGENTS.md из собственного inline-шаблона, и он уже расходится с skills/_shared/
     references/structure-template.md:1.
     В structure-template есть более правильный блок Manual execution priming, где для /execute TASK... агент читает task record/tier/
     packet selectively. В фактическом generated AGENTS.md этого нет, и prime list заставляет всегда читать Constitution/MBB/spec-
     backbone/spec-index/roles. Это конфликтует с текущей идеей clean/minimal context для T0/T1.

  2. В generated AGENTS.md stale manual closure rule:
     skills/_shared/scripts/init-mb.js:456 говорит, что manual T0/T1 may close after /verify PASS only. Но текущий workflow допускает T0/
     T1 fast-lane closure прямо в /execute при explicit owner и compact evidence. structure-template.md уже формулирует это корректнее.

  3. В generated AGENTS.md stale core manual chain:
     skills/_shared/scripts/init-mb.js:493 цепочка идёт примерно /spec-design -> /foundation-to-tasks -> /mb-doctor -> /execute -> /verify
     -> /mb-sync, то есть пропускает /prd-to-tasks FT-* и /review-tasks-plan FT-*. Это явная ошибка после текущих изменений.

  4. Docs First в generated AGENTS.md говорит “Then commit code changes” skills/_shared/scripts/init-mb.js:433. Это слишком императивно:
     агент может начать коммитить без явного запроса. Лучше “then code changes / commit when explicitly requested or workflow-owned”.

  5. В execute prompts generated AGENTS.md всё ещё шире, чем structure-template: “packet context when present or expected” skills/_shared/
     scripts/init-mb.js:464. В structure-template уже лучше: packet/spec context only when required by tier/policy or linked.

  Итого: да, разворачиваемый AGENTS.md сейчас надо синхронизировать с structure-template.md и последними контрактами /execute, /prd-to-
  tasks, /review-tasks-plan FT-*. Самая явная ошибка — stale core manual chain и устаревшее правило закрытия T0/T1.
