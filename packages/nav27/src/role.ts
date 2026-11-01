import type { Context } from '@deepseek-ai/cordis';
import * as NativeExecutor from '@deepseek-ai/dsh-tool-executor-native';
import * as FileTools from '@deepseek-ai/dsh-tool-fs';
import { realpathSync } from 'node:fs';
import { dirname, relative, resolve, isAbsolute } from 'node:path';

export const name = 'nav27-role';
export const inject = ['tools', 'systemPrompt', 'fs', 'workingDirectory'];
export interface RoleConfig { role: 'main' | 'exe'; project: string; boundary?: string[]; forbidden?: string[] }
const within = (path: string, root: string) => path === root || path.startsWith(root.replace(/\/$/, '') + '/');
function canonical(path: string): string {
  try { return realpathSync(path); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    const parent = dirname(path);
    if (parent === path) throw error;
    return resolve(canonical(parent), relative(parent, path));
  }
}
export async function apply(ctx: Context, config: RoleConfig) {
  await ctx.plugin(NativeExecutor);
  await ctx.plugin(FileTools, { read: true, readImage: false, write: config.role === 'exe', edit: config.role === 'exe' });
  const allowed = new Set(config.role === 'exe' ? ['read', 'write', 'edit', 'structured_output'] : ['read', 'nav_feedback']);
  const denied = ctx.tools.definitions().map(tool => tool.name).filter(name => !allowed.has(name));
  if (denied.length) ctx.tools.restrict({ deny: denied });
  // Monotone dispatch guard also covers inherited capabilities and direct calls.
  ctx.tools.guard(exec => {
    if (!allowed.has(exec.name)) return 'Capability outside this Nav assignment';
    if (!['read', 'write', 'edit'].includes(exec.name)) return;
    const args = exec.arguments as { file_path?: unknown };
    if (typeof args.file_path !== 'string') return 'Expected file_path';
    try {
      const path = canonical(resolve(config.project, args.file_path));
      const locator = relative(config.project, path).split('\\').join('/');
      if (locator === '..' || locator.startsWith('../') || isAbsolute(locator)) return 'Path leaves assigned project';
      if (exec.name === 'read') return;
      if (['.memory-bank/tasks', '.memory-bank/nav27', '.git'].some(root => within(locator, root))) return 'Host-owned path';
      if (config.boundary?.length && !config.boundary.some(root => within(locator, root))) return 'Outside write_boundary';
      if (config.forbidden?.some(root => within(locator, root))) return 'Inside forbidden_scope';
    } catch (error) { return (error as Error).message; }
  });
  ctx.systemPrompt.section({ name: 'nav27-role', order: 10, text: config.role === 'main'
    ? 'You are the persistent DevRails main session. Read project context and discuss the current run at .memory-bank/nav27/run.json. You cannot implement, launch agents, or change task lifecycle. nav_feedback reports only your current conversation result; it never completes an executor.'
    : 'You are a bounded DevRails executor. Implement the supplied task using its exact contract. The host owns task lifecycle, attempts and next operations. This slice exposes native read/write/edit only; if another capability is required return partial and needs_decision. Do not claim checks you did not perform.' });
}
