/**
 * Owns mb-doctor CLI parsing, finding collection, report rendering, and exit.
 * Does not read project state or decide workflow findings.
 * Output bytes, JSON key order, finding order, and exit semantics are public.
 */

export function parseArgs(args) {
  const parsed = {
    strict: false,
    json: false,
    help: false,
    errors: [],
  };

  for (const arg of args) {
    if (arg === '--strict') {
      parsed.strict = true;
    } else if (arg === '--json') {
      parsed.json = true;
    } else if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else {
      parsed.errors.push(`Unknown flag: ${arg}`);
    }
  }

  return parsed;
}

export function printHelp() {
  console.log(`mb-doctor

Usage:
  node .memory-bank/scripts/mb-doctor.mjs [--strict] [--json]

Flags:
  --strict  Require an executable autonomous/autopilot task queue.
  --json    Emit stable machine-readable JSON findings.
`);
}

export function createReporter(options) {
  const findings = [];

  function addFinding(severity, code, message, extra = {}) {
    const finding = { severity, code, message };
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined) finding[key] = value;
    }
    findings.push(finding);
  }

  function finish() {
    const counts = findings.reduce(
      (acc, finding) => {
        acc[finding.severity] += 1;
        return acc;
      },
      { error: 0, warning: 0, info: 0 }
    );

    const status = counts.error > 0 ? 'fail' : 'pass';
    const summary = {
      errors: counts.error,
      warnings: counts.warning,
      infos: counts.info,
    };
    const report = {
      version: 1,
      tool: 'mb-doctor',
      strict: options.strict,
      status,
      summary,
      counts,
      findings,
    };

    if (options.json) {
      console.log(`${JSON.stringify(report, null, 2)}\n`);
    } else {
      printTextReport(report);
    }

    process.exit(status === 'pass' ? 0 : 1);
  }

  return { addFinding, finish };
}

function printTextReport(report) {
  console.log(`mb-doctor ${report.status.toUpperCase()} (${report.counts.error} errors, ${report.counts.warning} warnings, ${report.counts.info} info)`);
  for (const finding of report.findings) {
    const location = finding.path ? ` ${finding.path}` : '';
    const task = finding.task_id ? ` ${finding.task_id}` : '';
    console.log(`[${finding.severity.toUpperCase()}] ${finding.code}${location}${task}: ${finding.message}`);
    printCapturedStream('stdout', finding.details?.stdout);
    printCapturedStream('stderr', finding.details?.stderr);
  }
}

function printCapturedStream(label, lines) {
  if (!Array.isArray(lines) || !lines.length) return;
  console.log(`  ${label}:`);
  for (const line of lines) {
    console.log(`    ${line}`);
  }
}
