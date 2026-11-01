<script lang="ts">
  import { onMount } from 'svelte';
  import type { View, Control } from './types.js';
  let { remote }: { remote: { snapshot(): Promise<any>; control(request: Control): Promise<any> } } = $props();
  let view = $state<View | null>(null);
  let task = $state('');
  let error = $state('');
  let busy = $state(false);
  const root = new URL('../', location.href);
  async function refresh() {
    const result = await remote.snapshot();
    if (result.ok) { view = result.value; error = ''; }
    else { view = null; error = result.error.message; }
  }
  async function control(action: Control['action']) {
    if (!view || busy) return;
    busy = true;
    const result = await remote.control({ runId: view.runId, revision: view.revision, action, ...(task ? { taskId: task } : {}) });
    if (result.ok) { view = result.value; error = ''; }
    else { error = result.error.message; view = result.error.details?.current ?? null; }
    busy = false;
  }
  onMount(() => {
    void refresh();
    const timer = setInterval(() => { if (!busy) void refresh(); }, 1500);
    return () => clearInterval(timer);
  });
</script>
<svelte:head><title>DevRails Nav 27 — status</title></svelte:head>
<main>
  <p class="eyebrow">DevRails Nav 27 · execution slice</p>
  <h1>Project run</h1>
  <p>One prepared T0/T1 task. Native file tools; local checks, verify and red are off.</p>
  {#if view}
    <dl>
      <dt>State</dt><dd>{view.phase}{view.hold ? ` · ${view.hold}` : ''}</dd>
      <dt>Task</dt><dd>{view.taskId ?? 'Not selected'}</dd>
      <dt>Verification</dt><dd>{view.verification}</dd>
      {#if view.blocker}<dt>Blocked</dt><dd>{view.blocker}</dd>{/if}
    </dl>
    {#if !view.taskId}<label>Indexed task ID<input bind:value={task} placeholder="TASK-001-T1-FT-001-W1" /></label>{/if}
    <nav aria-label="Run controls">
      {#each ['play', 'pause', 'red', 'green', 'stop'] as action}
        <button disabled={busy || view.phase === 'done'} onclick={() => control(action as Control['action'])}>{action}</button>
      {/each}
    </nav>
    {#if view.mainSession}<a href={`${root.href}#nav27-main=${view.mainSession}`}>Open native main chat ↗</a>{/if}
  {:else}<p>Connecting to the authenticated DSH host…</p>{/if}
  {#if error}<p role="alert">{error}</p>{/if}
</main>
<style>
  :global(body) { margin: 0; background: #f5f4f0; color: #202d35; font: 16px/1.5 system-ui, sans-serif; }
  main { max-width: 740px; margin: 8vh auto; padding: 32px; }
  .eyebrow { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }
  h1 { font-size: 42px; line-height: 1.1; margin: 18px 0; }
  dl { display: grid; grid-template-columns: 120px 1fr; gap: 14px; border-block: 1px solid #bcc6c9; padding: 24px 0; margin: 28px 0; }
  dt { color: #5d6b72; } dd { margin: 0; overflow-wrap: anywhere; }
  label { display: block; } input { display: block; width: 100%; box-sizing: border-box; margin-top: 8px; padding: 12px; font: inherit; }
  nav { display: flex; flex-wrap: wrap; gap: 10px; margin: 24px 0; }
  button { border: 1px solid #8a9b9f; border-radius: 5px; padding: 9px 18px; font: inherit; background: white; text-transform: capitalize; cursor: pointer; }
  button:disabled { opacity: .5; cursor: default; } a { color: #155a72; } [role=alert] { color: #a13028; }
</style>
