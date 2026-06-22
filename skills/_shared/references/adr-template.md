# ADR Template

Use this template for `.memory-bank/adrs/ADR-<NNN>-<slug>.md`.

```markdown
---
description: "ADR-<NNN>: <краткое название решения>"
status: draft|active|deprecated|archived
owner: <team-or-person>
last_updated: YYYY-MM-DD
source_of_truth:
  - path/to/spec/or/code
---
# ADR-<NNN>: <Название решения>

## ADR Status
proposed | accepted | deprecated | superseded by ADR-XXX

## Context
Какая проблема или ситуация привела к необходимости принять решение.
Факты, ограничения, движущие силы (drivers).

## Decision
Что решили делать. Формулировка должна быть конкретной и однозначной.

## Consequences

### Positive
- Что стало лучше в результате решения.

### Negative
- Какие компромиссы или trade-offs приняты.
- Какие риски появились.

### Neutral
- Что не изменилось, но стоит отметить.

## Alternatives Considered
| Alternative | Pros | Cons | Why rejected |
|-------------|------|------|-------------|
| ... | ... | ... | ... |
```
