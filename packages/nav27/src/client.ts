import type { Context } from '@deepseek-ai/cordis';
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client';
import type {} from '@deepseek-ai/dsh-api-session-controller/client';
import { SessionId } from '@deepseek-ai/dsh-session/types';
export const name = 'nav27-client';
export const inject = ['uiWorkspace', 'sessions'];
export function apply(ctx: Context) {
  const open = () => {
    const match = /^#nav27-main=([a-zA-Z0-9-]+)$/.exec(location.hash);
    if (!match) return;
    const sessions = ctx.sessions.list.getSnapshot();
    if (sessions.phase !== 'ready' || !sessions.byId[SessionId(match[1]!)]) return;
    history.replaceState(null, '', location.pathname + location.search);
    ctx.uiWorkspace.openSession(SessionId(match[1]!));
  };
  window.addEventListener('hashchange', open);
  ctx.effect(() => {
    const unsubscribe = ctx.sessions.list.subscribe(open);
    return () => { unsubscribe(); window.removeEventListener('hashchange', open); };
  });
  open();
}
