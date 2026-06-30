---
description: Маппинг существующего репозитория в Memory Bank (brownfield → baseline docs).
status: active
---
# /map-codebase — Brownfield mapping

<objective>
Построить baseline Memory Bank по существующему репозиторию.
</objective>

<process>

1) Создай `.tasks/TASK-MB-MAP/`.
2) Запусти сабагентов по зонам (до 5–7 параллельно):
- tooling/CI
- backend
- frontend
- data
- tests

Каждый сабагент:
- smart calling (глобы должны матчиться)
- пишет отчёт в `.tasks/TASK-MB-MAP/...`

3) Синтезируй `.memory-bank/` по чеклисту:
- product
- architecture (C4)
- spec-index / spec-backbone / glossary / invariants (если есть достаточно evidence для явного normative routing или backbone state)
- runbooks
- contracts
- states (если lifecycle/state rules очевидны из кода, workflow или тестов)
- testing
- index

> **PRD-less rule (non-negotiable)**: если **нет `prd.md`**, запрещено генерировать roadmap сущности:
> - `.memory-bank/epics/*`
> - `.memory-bank/features/*`
> - `.memory-bank/tasks/*.task.json` task records
> - `.memory-bank/tasks/index.json` task links
>
> Маппинг = **as-is документация** по evidence, а не планирование.

4) Сделай fan-in:
- сведи отчёты сабагентов
- устрани противоречия (или запиши как “needs verification”)
- раздели facts vs inferences

5) Попроси у пользователя PRD delta (что хотим изменить).
   - Если delta уже оформлена как PRD — `/constitution`, если principles не ratified/partial, затем `/write-prd --delta`, `/spec-init`, `/prd`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks --verify-existing` only if baseline proof is still needed, `/mb-doctor --strict` and execute/verify `FT-000` until its gate is done only if that command creates probe tasks, `/prd-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>`, conditional `/mb-doctor`, и tier-routed `/execute TASK`.
   - Если delta ясна, но PRD нет — сначала `/brief`, затем `/constitution`, если principles не ratified/partial, затем `/write-prd`, `/spec-init`, `/prd`, `/review-feat-plan for high-risk/large work`, `/spec-design`, `/foundation-to-tasks --verify-existing` only if baseline proof is still needed, `/mb-doctor --strict` and execute/verify `FT-000` until its gate is done only if that command creates probe tasks, `/prd-to-tasks FT-<NNN>`, `/review-tasks-plan FT-<NNN>`, conditional `/mb-doctor`, и tier-routed `/execute TASK`.
   - Если delta сырая / направление нестабильно — сначала `/brainstorm`.
   - Не переходи напрямую к `/prd-to-tasks`; для planning delta сначала нужен `/write-prd`, `/spec-init`, `/prd`, `/review-feat-plan` for high-risk/large work, `/spec-design` и foundation gate when required.
6) После оформления PRD/delta и `/prd` запусти `/review-feat-plan` for high-risk,
large, or autonomous flows before `/spec-design`.
7) In brownfield, do not create `FT-000` by default. If `/spec-design` records
`Foundation Required: false` because the existing baseline is already verified,
continue to `/prd-to-tasks`, `/review-tasks-plan`, conditional `/mb-doctor`,
and tier-routed `/execute`; run `/foundation-to-tasks --verify-existing` only
when baseline proof/probe tasks are still needed.
</process>
