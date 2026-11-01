import { readFile, writeFile, rename, mkdir, rm, realpath } from 'node:fs/promises';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import Ajv from 'ajv/dist/2020.js';

export async function json(path) { return JSON.parse(await readFile(path, 'utf8')); }
export async function atomic(path, value) { return atomicText(path, JSON.stringify(value, null, 2) + '\n'); }
export async function atomicText(path, value) {
  await mkdir(resolve(path, '..'), { recursive: true });
  const temp = `${path}.${randomUUID()}.tmp`;
  await writeFile(temp, value);
  await rename(temp, path);
}
export async function projectPath(root, locator, write = false) {
  if (!locator || isAbsolute(locator) || locator.includes('\\') || locator.split('/').includes('..')) throw new Error('Expected a project-relative POSIX path');
  const path = resolve(root, locator);
  let physical;
  try { physical = await realpath(path); } catch (error) {
    if (!write || error.code !== 'ENOENT') throw error;
    let ancestor = resolve(path, '..');
    while (true) {
      try { physical = resolve(await realpath(ancestor), relative(ancestor, path)); break; }
      catch (error) { if (error.code !== 'ENOENT') throw error; ancestor = resolve(ancestor, '..'); }
    }
  }
  const rel = relative(root, physical);
  if (rel.startsWith('../') || isAbsolute(rel)) throw new Error('Path leaves project');
  return physical;
}
export class Store {
  constructor(root) { this.root = root; this.path = join(root, '.memory-bank/nav27/run.json'); }
  async acquire() {
    this.root = await realpath(this.root);
    this.lock = join(this.root, '.memory-bank/nav27/writer');
    await mkdir(resolve(this.lock, '..'), { recursive: true });
    try { await mkdir(this.lock); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const owner = await json(join(this.lock, 'owner.json')).catch(() => undefined);
      if (!owner) throw new Error('Nav writer lock has no owner; reconcile it before reopening');
      try { process.kill(owner.pid, 0); throw new Error('Another Nav writer owns this project'); }
      catch (error) { if (error.code !== 'ESRCH') throw error; }
      await rm(this.lock, { recursive: true });
      await mkdir(this.lock);
    }
    await atomic(join(this.lock, 'owner.json'), { pid: process.pid });
  }
  async release() { await rm(this.lock, { recursive: true, force: true }); }
  async readRun() { return json(this.path).catch(error => { if (error.code === 'ENOENT') return null; throw error; }); }
  saveRun(run) { return atomic(this.path, run); }
  async task(id) {
    const index = await json(join(this.root, '.memory-bank/tasks/index.json'));
    const entries = index.tasks.filter(row => row.id === id);
    if (entries.length !== 1) throw new Error('Task must resolve exactly once through tasks/index.json');
    const path = await projectPath(this.root, `.memory-bank/tasks/${entries[0].file}`);
    const task = await json(path);
    const schema = await json(join(this.root, '.memory-bank/schemas/task.schema.json'));
    const validate = new Ajv({ strict: false }).compile(schema);
    if (!validate(task)) throw new Error(`Invalid task card: ${JSON.stringify(validate.errors)}`);
    const match = /^TASK-\d{3}-(T[0-3])-(FT-\d{3})-(W\d+)$/.exec(id);
    if (!match || task.id !== id || task.tier !== match[1] || task.feature !== match[2] || task.wave !== match[3]) throw new Error('Task identity/tier/feature/wave mismatch');
    return { task, path };
  }
  async importTasks(drafts, feature) {
    if (!Array.isArray(drafts)) throw new Error('Planning must return task drafts');
    const indexPath = join(this.root, '.memory-bank/tasks/index.json');
    const index = await json(indexPath);
    const schema = await json(join(this.root, '.memory-bank/schemas/task.schema.json'));
    const validate = new Ajv({ strict: false }).compile(schema);
    const existing = new Map(await Promise.all(index.tasks.map(async row => [row.id, await this.task(row.id)])));
    const imported = new Map();
    for (const draft of drafts) {
      const task = structuredClone(draft);
      const match = /^TASK-\d{3}-(T[0-3])-(FT-\d{3})-(W\d+)$/.exec(task.id);
      if (!match || task.tier !== match[1] || task.feature !== match[2] || task.wave !== match[3] || task.feature !== feature || (feature !== 'FT-000' && task.wave === 'W0') || imported.has(task.id)) throw new Error('Planning task identity/feature/wave conflict');
      const prior = existing.get(task.id);
      if (prior) {
        for (const key of ['status', 'verify']) task[key] = prior.task[key];
        const protectedFields = ['id', 'feature', 'tier', 'wave', 'purpose', 'success_outcome', 'depends_on', 'reqs', 'constraints', 'invariants'];
        if (protectedFields.some(key => !isDeepStrictEqual(task[key], prior.task[key]))) throw new Error(`Controlled rebuild required for ${task.id}`);
        if (!['planned', 'ready'].includes(prior.task.status) && !isDeepStrictEqual(task, prior.task)) throw new Error(`Preserve active/historical planning basis for ${task.id}`);
      } else { task.status = 'planned'; task.verify = []; }
      if (!validate(task)) throw new Error(`Invalid planned task: ${JSON.stringify(validate.errors)}`);
      imported.set(task.id, { task, path: prior?.path ?? await projectPath(this.root, `.memory-bank/tasks/${task.id}.task.json`, true) });
    }
    const all = new Map([...existing, ...imported]);
    const visiting = new Set(), done = new Set();
    const visit = id => {
      if (done.has(id)) return;
      if (visiting.has(id)) throw new Error('Task dependency cycle');
      const record = all.get(id); if (!record) throw new Error(`Missing task dependency ${id}`);
      visiting.add(id); for (const dependency of record.task.depends_on) visit(dependency);
      visiting.delete(id); done.add(id);
    };
    for (const id of imported.keys()) visit(id);
    for (const [id, record] of imported) {
      if (!existing.has(id)) {
        record.task.status = record.task.depends_on.every(dep => ['done', 'done_for_prod'].includes(all.get(dep).task.status)) ? 'ready' : 'planned';
        index.tasks.push({ id, file: `${id}.task.json` });
      }
      await this.saveTask(record);
    }
    await atomic(indexPath, index);
    return [...imported.keys()];
  }
  async reports(task, operation) {
    const evidence = task.verify.find(item => item.stage === 'workflow' && item.attempt === operation.attempt);
    for (const filename of operation.selected.protocols) {
      const belongs = filename === 'run.md' || (operation.command === 'verify' ? filename === 'verification.md' : operation.command === 'red-verify' ? filename === 'red-verification.md' : !['verification.md', 'red-verification.md'].includes(filename));
      if (!belongs) continue;
      const path = await projectPath(this.root, `.protocols/${task.id}/${filename}`, true);
      let content = await readFile(path, 'utf8').catch(async error => {
        if (error.code !== 'ENOENT') throw error;
        const template = filename === 'run.md' ? 'compact-run-template.md' : filename.replace('.md', '-template.md');
        return readFile(await projectPath(this.root, `.memory-bank/templates/protocols/${template}`), 'utf8');
      });
      const marker = `<!-- nav27:${operation.id} -->`;
      const endMarker = `<!-- end nav27:${operation.id} -->`;
      const start = content.indexOf(marker), end = content.indexOf(endMarker);
      const section = `\n${marker}\n## Retained ${operation.command} result — ${task.id}\n\nAttempt: ${operation.attempt}\n\n\`\`\`json\n${JSON.stringify(evidence, null, 2)}\n\`\`\`\n${endMarker}\n`;
      content = start >= 0 && end >= start ? content.slice(0, start) + section + content.slice(end + endMarker.length) : content + section;
      await atomicText(path, content);
    }
  }
  async runnable(feature) {
    const index = await json(join(this.root, '.memory-bank/tasks/index.json'));
    const records = await Promise.all(index.tasks.map(row => this.task(row.id)));
    const candidates = feature ? records.filter(row => row.task.feature === feature) : records;
    const stranded = candidates.find(row => row.task.status === 'in_progress');
    if (stranded) return stranded;
    const ready = candidates.find(row => ['ready', 'planned'].includes(row.task.status) && row.task.depends_on.every(id => records.some(dep => dep.task.id === id && ['done', 'done_for_prod'].includes(dep.task.status))));
    if (!ready && candidates.some(row => !['done', 'done_for_prod'].includes(row.task.status))) throw new Error('No runnable task: blocked dependency or task owner decision');
    return ready;
  }
  saveTask(record) { return atomic(record.path, record.task); }
}
