/**
 * Owns terminal task evidence and failure follow-up diagnostics.
 * Does not prescribe protocol depth, review ceremonies, or lifecycle changes.
 */

export function createTerminalCompatibilityChecks(context) {
  const { addFinding, options } = context;
  const { absolute, listFiles, readText } = context.readers;
  const terminal = new Set(['done', 'done_for_prod', 'failed']);

  function concreteEvidence(value) {
    if (typeof value === 'string') {
      return value.trim().length > 0
        && !/^(?:VERDICT:\s*)?(?:PASS|FAIL|TBD|TODO|none|n\/a)$/i.test(value.trim());
    }
    if (Array.isArray(value)) return value.some(concreteEvidence);
    if (!value || typeof value !== 'object') return false;
    return Object.entries(value).some(([key, child]) =>
      !/^(?:verdict|stage|mode|decision|status)$/i.test(key) && concreteEvidence(child));
  }

  function taskEvidence(taskId) {
    return [
      ...listFiles(absolute('.protocols', taskId)),
      ...listFiles(absolute('.tasks', taskId)),
    ].filter((file) => /\.(md|txt|log|json)$/i.test(file));
  }

  function checkTerminalEvidence({ id, rel, task }) {
    if (!terminal.has(task.status)) return;
    if (concreteEvidence(task.verify)) return;
    const retained = taskEvidence(id).some((file) => {
      try {
        const text = readText(file);
        return /^(?:[-*]\s*)?(?:evidence|checks?|result|output|log|artifact|report)\s*:\s*(?!none\b|tbd\b|todo\b|n\/a\b).+/im.test(text);
      } catch { return false; }
    });
    if (retained) return;
    const failed = task.status === 'failed';
    addFinding(options.strict ? 'error' : 'warning',
      failed ? 'TASK_FAILED_EVIDENCE_MISSING' : 'TASK_DONE_EVIDENCE_MISSING',
      `${rel}: ${task.status} task has no retained result or evidence.`, {
        path: rel, task_id: id,
        suggested_fix: 'Record the actual result and checks, including any checks skipped, in task.verify or existing task evidence. Do not manufacture a passed review.',
      });
  }

  function checkFailedTaskClosure(records) {
    for (const record of records.filter(({ task }) => task.status === 'failed')) {
      const referenced = records.some(({ id, task }) => id !== record.id
        && JSON.stringify(task).includes(record.id));
      const bugNote = listFiles(absolute('.memory-bank', 'bugs')).some((file) => {
        try { return readText(file).includes(record.id); } catch { return false; }
      });
      if (referenced || bugNote || concreteEvidence(record.task.verify)) continue;
      addFinding('warning', 'FAILED_BUG_OR_FOLLOWUP_MISSING',
        `${record.rel}: failed task has no retained follow-up or result.`, {
          path: record.rel, task_id: record.id,
          suggested_fix: 'Record what failed and a useful next action in the task; create follow-up work only if needed.',
        });
    }
  }
  return { checkTerminalEvidence, checkFailedTaskClosure };
}
