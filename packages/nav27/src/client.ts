import type { Context } from '@deepseek-ai/cordis';
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client';
import { SessionId } from '@deepseek-ai/dsh-session/types';
export const name = 'nav27-client';
export const inject = ['uiWorkspace'];
export function apply(ctx: Context) {
  const open = () => {
    const match = /^#nav27-main=([a-zA-Z0-9-]+)$/.exec(location.hash);
    if (!match) return;
    history.replaceState(null, '', location.pathname + location.search);
    void ctx.uiWorkspace.openSession(SessionId(match[1]!));
  };
  window.addEventListener('hashchange', open);
  ctx.effect(() => () => window.removeEventListener('hashchange', open));
  open();
}
