---
description: Прояснение неизвестных и противоречий перед реализацией — вопросы и decision log.
status: active
---
# /discuss — Clarify before coding

<objective>
Снизить риск неправильной реализации: выявить неизвестные, противоречия и скрытые требования.
</objective>

<process>

1) Прочитай релевантные документы Memory Bank + PRD.
2) Составь список:
- ambiguities
- decisions needed
- risks
3) Задай пользователю вопросы (раунд 3–5).
4) Зафиксируй ответы в `.protocols/<ID>/decision-log.md`.
5) Обнови `requirements.md`/`feature.md` при необходимости.

Если после обсуждения всё ясно:
- предложи `/write-prd`, `/prd`, `/brief` или `/clarify-feature FT-<NNN>` по текущему состоянию материалов;
- предлагай `/spec-init` после clarified `/write-prd` и до `/prd`, если SDD route map еще не готов;
- после `/prd` всегда предлагай mandatory `/spec-design`; для simple T0/T1 scope он записывает minimal status с explicit `not_applicable` areas;
- предлагай `/spec-design`, затем `/foundation-to-tasks` if required, затем `/prd-to-tasks FT-<NNN>`; standalone `/spec-improve` предлагай только для repair/refresh feature design;
- предлагай `/prd-to-tasks FT-<NNN>` только если PRD complete, feature exists, feature is not explicitly pending/blocked, and SDD design status is complete/not_required;
- предлагай `/execute TASK-<NNN>-FT-<NNN>-W-<N>` только для существующего JSON task record `.memory-bank/tasks/TASK-<NNN>-FT-<NNN>-W-<N>.task.json`, проиндексированного в `.memory-bank/tasks/index.json`.
</process>
