<script lang="ts">
  import { onMount } from 'svelte';
  import { SessionEventStream } from '@deepseek-ai/dsh-api-session-controller/client';
  import { joinAssistantStreamText } from '@deepseek-ai/dsh-llm/assistant-stream';
  import type { SideBinding } from './types.js';
  let { side, native, close, remove, deleting, href }: { side: SideBinding; native: any; close: () => void; remove: () => void; deleting: boolean; href: string } = $props();
  let entries = $state<any[]>([]), live = $state(''), input = $state(''), error = $state('');
  let stale = $state(true), sending = $state(false), hasMore = $state(false);
  let journal: SessionEventStream;
  function textOf(event: any) {
    if (event.type === 'user/message' && event.data.source?.kind === 'user') return { who: 'You', text: event.data.content.filter((part: any) => part.type === 'text').map((part: any) => part.text).join('\n') };
    if (event.type === 'assistant/message') return { who: 'Assistant', text: event.data.message?.content?.filter((part: any) => part.type === 'text').map((part: any) => part.text).join('\n') || joinAssistantStreamText(event.data.stream ?? []) };
    if (event.type === 'session/end-seed') return { who: 'Fork boundary', text: 'Later main messages are not copied into this Side.' };
    return null;
  }
  const rows = $derived(entries.map(entry => ({ seq: entry.event.seq, ...textOf(entry.event) })).filter(row => row.text));
  async function send() {
    if (!input.trim() || stale || sending) return;
    sending = true;
    try {
      const result = await native.session.prompt({ sessionId: side.id, requestId: crypto.randomUUID(), mode: 'queue', content: [{ type: 'text', text: input }] });
      if (!result.ok) throw new Error(result.error.message);
      input = ''; error = '';
    } catch (e) { error = `${(e as Error).message}. Refresh before sending again; delivery may already have occurred.`; stale = true; }
    finally { sending = false; }
  }
  async function stop() {
    try { const result = await native.session.cancel({ sessionId: side.id }); if (!result.ok) throw new Error(result.error.message); }
    catch (e) { error = (e as Error).message; stale = true; }
  }
  async function older() { try { await journal.prepend({ maxMessages: 30 }); } catch (e) { error = (e as Error).message; } }
  function refresh() { stale = true; journal.restart(); }
  onMount(() => {
    journal = new SessionEventStream(native, { kind: 'session', sessionId: side.id as any }, {
      publish(change) {
        if (change.type === 'replace' || change.type === 'prepend') {
          entries = change.type === 'replace' ? [...change.entries] : [...change.entries, ...entries];
          hasMore = change.hasMore;
          if (change.type === 'replace') { stale = false; error = ''; live = joinAssistantStreamText(change.page.assistantStream?.activeAttempt?.stream as any ?? []); }
        } else if (change.type === 'append') entries = [...entries, change.entry];
        else if (change.type === 'assistant-stream') {
          const frame = change.frame;
          if (frame.type === 'start' || frame.type === 'end') live = '';
          else if (frame.type === 'chunk' && (frame.chunk as any)?.type === 'text-delta') live += (frame.chunk as any).text;
        }
      },
      carrierFailed() { stale = true; error = 'Connection interrupted. Native session stream is reconnecting…'; },
      failed(e) { stale = true; error = (e as Error).message; },
    });
    void journal.open({ maxMessages: 30 }).catch(e => { error = e.message; });
    return () => { void journal.dispose(); };
  });
</script>
<section class="chat" aria-label="Side conversation">
  <header><div><strong>Side consultation</strong><small>{side.route.model} · read-only</small></div><button onclick={close} aria-label="Close Side panel">×</button></header>
  <p class="note">Forked main context + current Nav summary with every question. This chat never grants main consent.</p>
  <div class="messages" aria-live="polite">
    {#if hasMore}<button onclick={older}>Load earlier native history</button>{/if}
    {#each rows as row (row.seq)}<article><small>{row.who}</small><p>{row.text}</p></article>{/each}
    {#if live}<article><small>Assistant · streaming</small><p>{live}</p></article>{/if}
    {#if !rows.length && !live}<p class="note">{stale ? 'Opening native history…' : 'Ask about the current work.'}</p>{/if}
  </div>
  {#if error || side.error}<p role="alert">{error || side.error}</p>{/if}
  <form onsubmit={event => { event.preventDefault(); void send(); }}>
    <label for="side-question">Question</label><textarea id="side-question" bind:value={input} placeholder="What should I know about this point?" rows="3"></textarea>
    <div class="actions"><button type="submit" disabled={stale || sending || !input.trim()}>Send</button><button type="button" onclick={stop} disabled={stale}>Stop Side turn</button><button type="button" onclick={refresh}>Refresh</button></div>
  </form>
  <footer><a {href}>Open full native chat ↗</a><button class="danger" disabled={deleting} onclick={remove}>DEL · archive Side</button></footer>
</section>
<style>
  .chat { border: 1px solid var(--line); background: var(--surface); padding: 16px; min-width: 0; }
  header, footer, .actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; } header small { display: block; }
  small, .note { color: var(--muted); } .note { font-size: 14px; } .messages { max-height: 50vh; min-height: 100px; overflow: auto; overflow-wrap: anywhere; }
  article { border-top: 1px solid var(--line); padding: 12px 0; } article p { white-space: pre-wrap; margin: 5px 0; }
  textarea { resize: vertical; } form { margin: 16px 0; } .actions { justify-content: start; } footer { border-top: 1px solid var(--line); padding-top: 12px; }
</style>
