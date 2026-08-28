/**
 * Owns mb-lint execution and general preflight findings.
 * Does not interpret Foundation, task, acceptance, or terminal state.
 * Keep preflight call order and captured lint payloads stable.
 */

import { spawnSync } from 'node:child_process';
import { splitLines } from './readers.mjs';

const TASK_INDEX_REL = '.memory-bank/tasks/index.json';
const TASK_BACKLOG_REL = '.memory-bank/tasks/backlog.md';
const LINT_REL = '.memory-bank/scripts/mb-lint.mjs';

export function runPreflight(context) {
  const ROOT = context.root;
  const { options, addFinding } = context;
  const { absolute, isFile } = context.readers;

  runMbLint();
  checkObsoleteBacklog();

  function runMbLint() {
    const lintAbs = absolute(LINT_REL);
    if (!isFile(lintAbs)) {
      const severity = options.strict ? 'error' : 'warning';
      addFinding(severity, 'MB_LINT_SCRIPT_MISSING', `${LINT_REL} not found. Install/copy mb-lint before running mb-doctor.`, {
        path: LINT_REL,
        suggested_fix: 'Create .memory-bank/scripts/mb-lint.mjs from the mb-garden asset and rerun mb-doctor.',
      });
      return;
    }
  
    const result = spawnSync(process.execPath, [lintAbs], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
  
    if (result.error) {
      addFinding('error', 'MB_LINT_FAILED', `Failed to run ${LINT_REL}: ${result.error.message}`, {
        path: LINT_REL,
        details: { error: result.error.message },
      });
      return;
    }
  
    if (result.status !== 0) {
      addFinding('error', 'MB_LINT_FAILED', `${LINT_REL} failed. Fix lint errors before autonomous/autopilot execution.`, {
        path: LINT_REL,
        details: {
          exit_code: result.status,
          stdout: splitLines(result.stdout),
          stderr: splitLines(result.stderr),
        },
        suggested_fix: `Run node ${LINT_REL} and fix reported errors.`,
      });
      return;
    }
  
    addFinding('info', 'MB_LINT_PASSED', `${LINT_REL} passed.`, {
      path: LINT_REL,
    });
  }
  
  function checkObsoleteBacklog() {
    if (!isFile(absolute(TASK_BACKLOG_REL))) return;
  
    addFinding(
      'error',
      'TASK_BACKLOG_MD_PRESENT',
      `${TASK_BACKLOG_REL} is obsolete. Task execution must use JSON task records only.`,
      {
        path: TASK_BACKLOG_REL,
        suggested_fix: `Remove ${TASK_BACKLOG_REL} and use ${TASK_INDEX_REL} plus indexed TASK-*.task.json records.`,
      }
    );
  }
}
