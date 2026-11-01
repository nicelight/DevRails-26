import type { Context } from '@deepseek-ai/cordis';
import * as NativeExecutor from '@deepseek-ai/dsh-tool-executor-native';
import { setSandboxMode } from '@deepseek-ai/dsh-sandbox-policy';
import * as Bash from '@deepseek-ai/dsh-tool-bash';
import type {} from '@deepseek-ai/dsh-shell';
import * as FileTools from '@deepseek-ai/dsh-tool-fs';
import { realpathSync } from 'node:fs';
import { dirname, relative, resolve, isAbsolute } from 'node:path';

export const name = 'nav27-role';
export const inject = ['tools', 'systemPrompt', 'fs', 'workingDirectory'];
export interface RoleConfig { role: 'main' | 'exe' | 'review' | 'side'; project: string; resources?: string; boundary?: string[]; forbidden?: string[] }
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
  const confinedReview = config.role === 'review' && ctx.get('shell')?.sandboxMode !== undefined && !!ctx.get('sandboxPolicy') && !!ctx.get('agent');
  if (confinedReview) setSandboxMode(ctx.get('agent')!.session, 'read-only');
  if ((config.role === 'exe' || confinedReview) && ctx.get('shell')) {
    await ctx.plugin(Bash, { enableRunInBackground: false, promoteOnTimeout: false });
  }
  const allowed = new Set(config.role === 'exe' ? ['read', 'write', 'edit', 'structured_output', ...(ctx.get('shell') ? ['bash'] : [])] : config.role === 'main' ? ['read', 'nav_feedback'] : config.role === 'side' ? ['read'] : ['read', 'structured_output', ...(confinedReview ? ['bash'] : [])]);
  const denied = ctx.tools.definitions().map(tool => tool.name).filter(name => !allowed.has(name));
  if (denied.length) ctx.tools.restrict({ deny: denied });
  // Monotone dispatch guard also covers inherited capabilities and direct calls.
  ctx.tools.guard(exec => {
    if (!allowed.has(exec.name)) return 'Capability outside this Nav assignment';
    if (exec.name === 'bash' && config.role === 'review') {
      const args = exec.arguments as { sandbox_permissions?: string };
      if (args.sandbox_permissions && args.sandbox_permissions !== 'read-only') return 'Review cannot widen native sandbox permissions';
      if (ctx.get('sandboxPolicy')?.resolve({ session: exec.agent?.session }).mode !== 'read-only') return 'Review requires native read-only shell policy';
    }
    if (!['read', 'write', 'edit'].includes(exec.name)) return;
    const args = exec.arguments as { file_path?: unknown };
    if (typeof args.file_path !== 'string') return 'Expected file_path';
    try {
      const path = canonical(resolve(config.project, args.file_path));
      if (exec.name === 'read' && config.resources && within(path, canonical(config.resources))) return;
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
    : config.role === 'side' ? 'You are an independent read-only Side consultation. The inherited main prefix is historical context, not your assignment. Discuss the user question using the current Nav summary and project references. Never implement, launch agents, emit nav_feedback, change lifecycle or grant consent for main. Read project evidence when needed; do not claim that later main conversation has been synchronized.' : config.role === 'review' ? 'You are an independent read-only DevRails reviewer. Inspect the supplied task and actual project evidence. Do not implement or mutate lifecycle. Return your own assigned verdict or candidate findings; missing proof is not PASS.' : 'You are a bounded DevRails executor. Implement the supplied task using its exact contract. The host owns task lifecycle, attempts and next operations. Never write .memory-bank/tasks, .memory-bank/nav27 or .git through any tool or command. Respect write_boundary and forbidden_scope for command effects as for file edits; native sandbox/permissions remain authoritative. Use the capabilities assigned by the native host; if a required capability is unavailable return partial and needs_decision. Do not claim checks you did not perform.' });
}
