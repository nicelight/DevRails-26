const text = { type: 'string' };
const evidence = { type: 'array', items: text };
const feedback = { type: 'object', additionalProperties: false, required: ['flow', 'message'], properties: {
  flow: { type: 'string', enum: ['continue', 'needs_decision'] }, message: text,
} };
export function schemaFor(command, selected, candidate = false) {
  let properties;
  let required;
  if (command === 'exe') {
    properties = { implementation: { type: 'string', enum: ['partial', 'complete'] }, evidence, production_remainder: text,
      ...(selected.local_checks ? { local_checks: { type: 'object', additionalProperties: false, required: ['result', 'evidence'], properties: { result: { type: 'string', enum: ['passed', 'failed'] }, evidence } } } : {}) };
    required = ['implementation', 'evidence'];
  } else if (candidate) {
    properties = { candidate_findings: { oneOf: [{ type: 'string', const: 'none' }, { type: 'array', items: text }] }, evidence }; required = Object.keys(properties);
  } else {
    properties = { verdict: { type: 'string', enum: command === 'verify' ? ['PASS', 'FAIL', 'NEEDS-CLARIFICATION'] : ['semantic-pass', 'semantic-concern', 'semantic-fail'] }, evidence }; required = Object.keys(properties);
  }
  return { type: 'object', additionalProperties: false, required: ['feedback', 'subject'], properties: {
    feedback, subject: { type: 'object', additionalProperties: false, required, properties },
  } };
}
export const replySchema = schemaFor('exe', { local_checks: false });

export function substantive(reply, command, selected) {
  if (command === 'exe' && reply.subject.implementation === 'complete' && selected.local_checks && !reply.subject.local_checks) return false;
  const strings = value => typeof value === 'string' && value.trim() && !/^(tbd|todo|none|n\/a|\.\.\.|<[^>]+>)$/i.test(value.trim());
  const evidence = value => Array.isArray(value) && value.length > 0 && value.every(strings);
  return strings(reply.feedback.message) && evidence(reply.subject.evidence) && (!reply.subject.local_checks || evidence(reply.subject.local_checks.evidence)) && (!Array.isArray(reply.subject.candidate_findings) || evidence(reply.subject.candidate_findings));
}
