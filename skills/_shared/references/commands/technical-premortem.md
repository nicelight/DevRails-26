---
description: Bounded advisory pre-mortem for an accepted planned change.
status: active
---
# /technical-premortem — Technical pre-mortem

Apply `.memory-bank/workflows/autonomy-policy.md` for DSH runtime ownership,
effective settings, the required compact structured flow feedback, decisions,
and recovery; subject results remain separate from that feedback.

<objective>
Assess how one planned change could fail, harm affected consumers or violate an
accepted boundary before implementation. Work backward from realistic failure
to mechanism, blast radius and a proportionate remedy. This is read-only advice,
not a new gate, requirement, approval or lifecycle.
</objective>

<input_contract>
Use one explicit indexed task, plan or unambiguous planned change with its
accepted target, actual code/config/data, relevant consumers and operational
facts. Missing material target or external facts require the common decision
flow; never invent production conditions or requirements.
</input_contract>

<assessment>
Choose relevant correctness, contract, state/migration, security, concurrency,
performance, recovery or agent-interpretation surfaces based on actual impact.
No fixed checklist, number of scenarios or mandatory category coverage.

Publish only decision-relevant findings:
- Tiger: evidence connects a realistic mechanism to material harm of the
  accepted outcome; state symptom, affected surface, evidence/detection,
  priority (`merge_blocker|follow_up|observe`) and smallest sufficient remedy.
- Paper Tiger: inspected evidence lowers a risk only when that clarification
  changes the decision or avoids unnecessary complexity.
- Elephant: a material unknown on which a decision depends; name the missing
  fact, evidence owner and resolving check.

Do not publish speculative candidates or create new requirements from findings.
Mitigation that changes meaning/scope belongs to the existing product/design/task
owner. Accepted irreversibility with sufficient containment is not by itself
NO_GO. Recovery claims need an evidenced route and acknowledge residual effects.
</assessment>

<output_and_handoff>
Return a concise target/blast-radius assessment, admitted findings and exactly
one advisory result: GO, GO_WITH_CONDITIONS, or NO_GO. GO means no material
unresolved blocker; GO_WITH_CONDITIONS names concrete conditions/owners; NO_GO
names the evidenced failure or decision-critical unknown and its owner.
No report artifact is required; host retains any material continuation decision
in existing state for recovery.

GO returns to the original implementation owner. Conditions/NO_GO propose the
first unresolved owner/action through the common decision flow; they do not
launch repair or write lifecycle. Disabled pre-mortem needs no output and adds
no closure gate. Include the required common structured feedback separately
from the advisory verdict.
</output_and_handoff>
