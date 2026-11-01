// Families share execution; this inventory describes canonical owners and ordinary handoffs.
const families = {
  'bootstrap/context': ['start', 'mb-init', 'fill', 'context-manifest', 'map-codebase', 'creator-vibe', 'find-skills'],
  'product/planning': ['grill-me', 'constitution', 'write-prd', 'spec-init', 'prd-to-features', 'spec-design', 'spec-redesign', 'spec-auto', 'feature-to-tasks', 'foundation-to-tasks', 'discuss', 'kiss-architect'],
  implementation: ['exe', 'autopilot', 'autonomous', 'multiagentic', 'multipilot', 'add-tests'],
  'review/diagnostics': ['verify', 'red-verify', 'review-feat-plan', 'review-tasks-plan', 'architecture-review', 'feature-doctor', 'mb-doctor', 'technical-premortem', 'debug'],
  maintenance: ['mb-sync', 'mb-garden', 'tech-debt'],
};
export const commands = Object.fromEntries(Object.entries(families).flatMap(([family, names]) => names.map(name => [name, { family, owner: name }])));
export const verdicts = {
  'review-feat-plan': ['APPROVE', 'REJECT'], 'review-tasks-plan': ['APPROVE', 'REJECT'],
  'architecture-review': ['APPROVE', 'REQUEST_CHANGES', 'OWNER_DECISION_NEEDED'],
  'red-verify': ['semantic-pass', 'semantic-concern', 'semantic-fail'],
  'debug': ['CONFIRMED', 'INCONCLUSIVE'], 'technical-premortem': ['GO', 'GO_WITH_CONDITIONS', 'NO_GO'],
};
export const negativeVerdicts = new Set(['REJECT', 'REQUEST_CHANGES', 'OWNER_DECISION_NEEDED', 'semantic-concern', 'semantic-fail', 'NO_GO']);
const text = { type: 'string' }, texts = { type: 'array', items: text };
const object = (properties, required = Object.keys(properties)) => ({ type: 'object', additionalProperties: false, properties, required });
export function commandSchema(command) {
  const properties = { complete: { type: 'boolean' }, summary: text, evidence: texts, outputs: texts };
  if (verdicts[command]) properties.verdict = { type: 'string', enum: verdicts[command] };
  if (command === 'prd-to-features') properties.features = texts;
  if (command === 'spec-design') properties.foundation = { type: 'string', enum: ['required', 'not_required'] };
  if (command === 'spec-redesign') { properties.impact = { type: 'string', enum: ['none', 'bounded', 'global'] }; properties.affectedFeatures = texts; }
  if (['feature-to-tasks', 'foundation-to-tasks'].includes(command)) properties.tasks = { type: 'array', items: { type: 'object' } };
  return object({ feedback: object({ flow: { type: 'string', enum: ['continue', 'needs_decision'] }, message: text }), subject: object(properties) });
}
/** Next command is a host rule; model outputs here are subject facts, not launch instructions. */
export function ordinary(command, flow, settings, subject) {
  if (!flow.pipeline && ['review-feat-plan', 'review-tasks-plan'].includes(command)) return null;
  const checks = settings.planning ?? {};
  const tasking = () => settings.selected.design ? 'spec-auto' : 'feature-to-tasks';
  switch (command) {
    case 'mb-init': return 'start';
    case 'grill-me': return 'constitution';
    case 'constitution': return 'write-prd';
    case 'write-prd': return flow.inputs.update ? 'prd-to-features' : 'spec-init';
    case 'spec-init': return 'prd-to-features';
    case 'prd-to-features': return checks.featureReview ? 'review-feat-plan' : settings.selected.design ? 'spec-design' : tasking();
    case 'review-feat-plan': return settings.selected.design ? 'spec-design' : tasking();
    case 'spec-design': return subject.foundation === 'required' ? 'foundation-to-tasks' : tasking();
    case 'spec-auto': return 'feature-to-tasks';
    case 'feature-to-tasks': return checks.taskReview ? 'review-tasks-plan' : checks.doctor ? 'mb-doctor' : checks.premortem ? 'technical-premortem' : 'exe';
    case 'foundation-to-tasks': return checks.taskReview ? 'review-tasks-plan' : 'exe';
    case 'review-tasks-plan': return checks.doctor ? 'mb-doctor' : checks.premortem ? 'technical-premortem' : 'exe';
    case 'mb-doctor': return flow.pipeline ? checks.premortem ? 'technical-premortem' : 'exe' : null;
    case 'technical-premortem': return flow.pipeline ? 'exe' : null;
    case 'red-verify': return flow.boundary ? 'mb-sync' : null;
    case 'mb-sync': return null;
    default: return null;
  }
}
