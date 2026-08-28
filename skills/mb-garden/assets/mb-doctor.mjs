#!/usr/bin/env node
/**
 * Canonical mb-doctor entrypoint.
 *
 * Owns CLI entry and the public high-level finding order only. Route check
 * changes through mb-doctor/AGENTS.md; deployed entry remains
 * .memory-bank/scripts/mb-doctor.mjs.
 */

import {
  createReporter,
  parseArgs,
  printHelp,
} from './mb-doctor/cli-reporting.mjs';
import { createReaders } from './mb-doctor/readers.mjs';
import { runPreflight } from './mb-doctor/preflight.mjs';
import { createFoundationBackboneChecks } from './mb-doctor/foundation-backbone.mjs';
import { createTaskReadinessChecks } from './mb-doctor/task-readiness.mjs';
import { createAcceptanceTraceChecks } from './mb-doctor/acceptance-trace.mjs';
import { createTerminalCompatibilityChecks } from './mb-doctor/terminal-compat.mjs';

const options = parseArgs(process.argv.slice(2));
const reporter = createReporter(options);

if (options.help) {
  printHelp();
  process.exit(0);
}

if (options.errors.length) {
  for (const message of options.errors) {
    reporter.addFinding('error', 'CLI_INVALID_ARGUMENT', message, {
      suggested_fix: 'Use only --strict and/or --json.',
    });
  }
  reporter.finish();
}

const context = {
  root: process.cwd(),
  options,
  addFinding: reporter.addFinding,
};
context.readers = createReaders(context.root);

const foundation = createFoundationBackboneChecks(context);
const acceptance = createAcceptanceTraceChecks(context);
const terminal = createTerminalCompatibilityChecks(context);
const taskReadiness = createTaskReadinessChecks({
  ...context,
  foundation,
  acceptance,
  terminal,
});

runPreflight(context);
foundation.checkConstitutionStructure();
foundation.checkBackboneReadiness();
taskReadiness.checkFeatureClarificationReadiness();
taskReadiness.checkTaskReadiness();
reporter.finish();
