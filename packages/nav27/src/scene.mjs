// Display geometry only. No position or animation admits workflow work.
export const worldWidth = 2500;
export const stations = [
  [100, 'Context'], [410, 'Accepted PRD'], [720, 'Features'], [1030, 'Design / baseline'],
  [1340, 'Task cards'], [1650, 'Implementation'], [1960, 'Selected evidence'], [2340, 'Synced outcome'],
];
export const operations = [
  [255, ['grill-me', 'constitution', 'write-prd']], [565, ['spec-init', 'prd-to-features']],
  [875, ['spec-design', 'spec-auto']], [1185, ['foundation-to-tasks', 'feature-to-tasks']],
  [1495, ['exe', 'local checks']], [1805, ['verify', 'red-verify']], [2150, ['feature red', 'mb-sync']],
];
const positions = Object.fromEntries(operations.flatMap(([x, names]) => names.map(name => [name, x])));
Object.assign(positions, { 'review-feat-plan': 875, 'review-tasks-plan': 1495, 'mb-doctor': 1495, 'technical-premortem': 1495, 'spec-redesign': 875, 'feature-doctor': 1185, 'architecture-review': 1030, 'debug': 1495, 'add-tests': 1495, 'autopilot': 1495, 'autonomous': 1495, 'multiagentic': 1495, 'multipilot': 1495, 'mb-garden': 2340, 'tech-debt': 2340, 'discuss': 565, 'kiss-architect': 875 });
export const positionFor = command => positions[command] ?? 100;
export const driverColors = { blue: '#65bada', orange: '#db9149', purple: '#a28bc4', white: '#f9faf8', black: '#273038' };
export function meter(facts) { return facts?.occupancy == null ? '?' : `~${Math.round(facts.occupancy * 100)}%`; }
