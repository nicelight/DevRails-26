# ADR Template

Use `.memory-bank/adrs/ADR-<NNN>-<slug>.md` only for a selected durable decision
record whose rationale has lasting value. No ADR is required merely because
Architect/review ran. Apply the common decision flow before changing accepted
targets; record user or autonomous provenance truthfully. Reuse existing canonical
owners and include only applicable sections, without invented alternatives.

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
Источник принятия: пользователь / autonomous / существующий authoritative source.
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
