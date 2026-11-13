---
description: Optional deterministic Memory Bank diagnostics.
status: active
---
# /mb-doctor

Inspect structural consistency and incomplete task context without deciding
whether the workflow may continue.
Apply `.memory-bank/workflows/execute-loop.md#working-policy`: consult the operator on substantive choices unless autonomy was explicitly granted; carry out settled decisions without repeated approval.

Use the installed script when diagnostics are useful:

```bash
node .memory-bank/scripts/mb-doctor.mjs [--strict] [--json]
```

`--strict` requests deeper diagnostics; it is not an admission gate for manual
or autonomous work. `--help`/`-h` prints help. Unsupported arguments are errors.
Default mode accepts an empty task index; strict mode reports it as information.

Checks distinguish broken data and references from incomplete planning advice:
- JSON/index/ID/schema consistency, legal statuses, valid dependencies and
  referenced requirements/specs/acceptance locators;
- actual prerequisite/state contradictions and Foundation references when used;
- missing outcome, context or verification guidance as advice;
- recorded terminal results and evidence, without requiring a particular report.

Compact protocols or `task.verify` evidence are valid at every tier. Missing
full protocol files, RED/GREEN, independent reviews, semantic-pass markers or
explicit closure-owner records do not by themselves invalidate completed work.
Guide-only normative sources are not rejected solely because of their directory.

Doctor does not assess semantic sufficiency, run product tests, modify state,
create tasks or require repair through a named command. Interpret findings
against the current request and accepted decisions. Correct actual defects;
consult on substantive choices in manual work. Do not fabricate historical
proof or documents merely to clear a diagnostic.

The JSON interface retains `status`, `summary`, `counts` and `findings` with
severity/code/message and relevant paths/details. Exit 1 means diagnostics
reported errors, not that every project action must halt. Report the applicable
issues and next useful action.
