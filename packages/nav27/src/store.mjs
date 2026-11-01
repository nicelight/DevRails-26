import { readFile, writeFile, rename, mkdir, rm, realpath } from 'node:fs/promises';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { randomUUID } from 'node:crypto';
import Ajv from 'ajv/dist/2020.js';

export async function json(path) { return JSON.parse(await readFile(path, 'utf8')); }
export async function atomic(path, value) {
  await mkdir(resolve(path, '..'), { recursive: true });
  const temp = `${path}.${randomUUID()}.tmp`;
  await writeFile(temp, JSON.stringify(value, null, 2) + '\n');
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
  saveTask(record) { return atomic(record.path, record.task); }
}
