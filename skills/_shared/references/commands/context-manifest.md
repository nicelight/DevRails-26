---
description: Optional read-only routing to the sources needed for a focused task.
status: active
---
# /context-manifest

Return a compact read manifest for the requested workflow, TASK/FT/REQ or goal.
Apply `.memory-bank/workflows/execute-loop.md#working-policy`: consult the operator on substantive choices unless autonomy was explicitly granted; carry out settled decisions without repeated approval.

Use existing indexes, direct task/spec links and relevant code to identify the
smallest useful read set. Read the active instructions and target record; choose
focused ranges or whole documents as appropriate. `source_artifacts`,
`normative_inputs` and feature links help locate context, not replace reading it.

Keep this skill read-only. Return paths, reasons to read them, useful headings
or valid line ranges, and any missing or conflicting sources. Do not produce a
second project summary, persist the manifest or execute the target workflow.
Use `Status: ready|gaps` to describe routing completeness, not permission to work.
The caller reads the sources and expands the set when evidence warrants it.
Delegation is optional and follows the caller's permission.
