---
description: Facilitated ideation report before Product Brief; AI coaches, user intent drives.
status: active
---
# /brainstorm - Facilitated ideation

<objective>
Facilitate product ideation and create a compact brainstorming report under `.memory-bank/analysis/brainstorming/`.

The AI is a facilitator and coach. The user is the source of product intent, priorities, and decisions. Raw ideas do not become requirements directly.
</objective>

<process>

## 0) Scope
Use `/brainstorm` when the idea is raw, the problem space is unclear, or there are too many possible directions.

Do not create:
- PRD
- Product Brief, unless the user separately invokes `/brief`
- task records
- implementation plans
- research reports
- PRFAQ
- `.memory-bank/analysis/assumptions.md`
- command aliases

No research mode. If research is needed, record it as an open question or risk.

## 1) Prepare artifacts
Create if missing:
- `.memory-bank/analysis/index.md`
- `.memory-bank/analysis/brainstorming/`

When creating `.memory-bank/analysis/index.md`, include:

```yaml
---
description: Analysis artifact index.
status: active
---
```

Create a new report:

```text
.memory-bank/analysis/brainstorming/BR-001.md
```

If `BR-001.md` exists, use the next available ID: `BR-002.md`, `BR-003.md`, and so on.

Update `.memory-bank/analysis/index.md` with the latest report link and:

```text
Recommended next step: /brief
```

## 2) Facilitate, do not invent
Start by asking for or confirming:
- problem space
- target users
- user goals
- constraints
- what the user already believes or wants to avoid

Use lightweight ideation only as needed:
- alternative user journeys
- pain points
- solution directions
- constraints-first thinking
- risk-first thinking
- MVP slicing

Default target is 20-40 useful ideas or directions only when expansion is useful. If the user already has a clear direction, keep the session short.

## 3) Report structure
Write the report with these sections:

```md
---
description: Brainstorming report BR-<NNN>.
status: active
type: brainstorming-report
id: BR-<NNN>
---
# Brainstorming Report - BR-<NNN>

## Status
- Date: YYYY-MM-DD
- Facilitator: AI
- Source of product intent: user
- Recommended next step: /brief

## Problem Space

## Goals

## Constraints

## Techniques Used

## Raw Ideas

## Clusters / Themes

## Selected Directions

## Rejected Directions

## Assumptions

## Open Questions

## Recommended Next Step
/brief
```

Assumptions and open questions stay inside the report. Do not create a separate `assumptions.md`.

The report frontmatter is required. `type` must be `brainstorming-report`, and `id` must match the filename ID such as `BR-001`.

## 4) Finish
End with:

```text
Recommended next step: /brief
```

Do not recommend `/prd-to-tasks` directly from brainstorming. If planning continues, route through `/brief`, `/constitution`, `/write-prd`, `/spec-init`, `/prd`, `/review-feat-plan` for high-risk/large work, `/spec-design`, `/foundation-to-tasks` when required, then `/prd-to-tasks FT-<NNN>`. Recommend `/clarify-feature FT-<NNN>` only for a specific pending/blocked feature.
</process>
