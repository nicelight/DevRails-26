<script lang="ts">
  import { onMount } from 'svelte';
  import type { View, Control, Settings, SettingsRequest } from './types.js';
  let { remote }: { remote: { snapshot(): Promise<any>; control(request: Control): Promise<any>; settings(request: SettingsRequest): Promise<any> } } = $props();
  let view = $state<View | null>(null);
  let draft = $state<Settings | null>(null);
  let task = $state('');
  let command = $state('start');
  let source = $state('');
  let feature = $state('');
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
    const result = await remote.control({ runId: view.runId, revision: view.revision, action, ...(action === 'start-command' ? { command, inputs: { source, feature: feature || undefined, taskId: task || undefined } } : {}), ...(action === 'green' && view.requestId ? { requestId: view.requestId } : {}), ...(task ? { taskId: task } : {}) });
    if (result.ok) { view = result.value; error = ''; }
    else { error = result.error.message; view = result.error.details?.current ?? null; }
    busy = false;
  }
  async function saveSettings() {
    if (!view || !draft || busy) return;
    busy = true;
    const result = await remote.settings({ runId: view.runId, revision: view.revision, settingsRevision: view.settingsRevision, settings: draft });
    if (result.ok) { view = result.value; draft = null; error = ''; }
    else { error = result.error.message; view = result.error.details?.current ?? null; }
    busy = false;
  }
  function editSettings() {
    if (!view) return;
    draft = structuredClone(view.settings);
    draft.planning ??= { featureReview: false, taskReview: false, doctor: false, premortem: false };
    for (const role of ['main', 'exe', 'verify_main', 'verify_secondary', 'verify_code', 'red', 'judge']) draft.routes[role] ??= { provider: '', model: '' };
  }
  onMount(() => {
    void refresh();
    const timer = setInterval(() => { if (!busy) void refresh(); }, 1500);
    return () => clearInterval(timer);
  });
</script>
<svelte:head><title>DevRails Nav 27 — status</title></svelte:head>
<main>
  <p class="eyebrow">DevRails Nav 27 · semantic routing</p>
  <h1>Project run</h1>
  <p>Indexed task execution with selected local checks, independent reviewers and semantic review.</p>
  {#if view}
    <dl>
      <dt>State</dt><dd>{view.phase}{view.hold ? ` · ${view.hold}` : ''}</dd>
      <dt>Task</dt><dd>{view.taskId ?? 'Not selected'}</dd>
      <dt>Verification</dt><dd>{view.verification}</dd>
      {#each view.participants as participant}<dt>{participant.role}</dt><dd>{participant.state}{participant.diagnostic ? ` — ${participant.diagnostic}` : ''}</dd>{/each}
      {#if view.mainError}<dt>Main</dt><dd>{view.mainError}</dd>{/if}
      {#if view.blocker}<dt>Blocked</dt><dd>{view.blocker}</dd>{/if}
    </dl>
    <details><summary>Start a DevRails command</summary>
      <label>Command<select bind:value={command}>{#each view.commands as name}<option value={name}>{name}</option>{/each}</select></label>
      <label>Subject input<textarea bind:value={source} placeholder="Accepted product source, change, or bounded question"></textarea></label>
      <label>Feature (when applicable)<input bind:value={feature} placeholder="FT-001" /></label>
      <button disabled={busy || !['ready', 'stopped', 'done'].includes(view.phase) || !!view.pending || !!view.blocker || !!view.hold} onclick={() => control('start-command')}>Start command</button>
    </details>
    {#if !view.taskId}<label>Indexed task ID<input bind:value={task} placeholder="TASK-001-T1-FT-001-W1" /></label>{/if}
    <nav aria-label="Run controls">
      {#each ['play', 'pause', 'red', 'green', 'stop', 'resume', 'repair', 'inspect', 'autonomous'] as action}
        <button disabled={busy} onclick={() => control(action as Control['action'])}>{action}</button>
      {/each}
    </nav>
    <p>Autonomous: {view.autonomous ? 'on' : 'off'} · H: {view.inspection ?? 'idle'}</p>
    {#if view.pending}<p>Pending owner decision: {view.pending}</p>{/if}
    <button disabled={busy || !view.editable} onclick={editSettings}>Edit station settings</button>
    {#if draft}
      <fieldset disabled={busy || !view.editable}>
        <legend>Next unstarted work</legend>
        <label><input type="checkbox" bind:checked={draft.selected.design} /> Subject design</label>
        <label><input type="checkbox" bind:checked={draft.selected.feature_red_verify} /> Feature semantic review</label>
        {#if draft.planning}
          <label><input type="checkbox" bind:checked={draft.planning.featureReview} /> Feature plan review</label>
          <label><input type="checkbox" bind:checked={draft.planning.taskReview} /> Task plan review</label>
          <label><input type="checkbox" bind:checked={draft.planning.doctor} /> Readiness diagnostics</label>
          <label><input type="checkbox" bind:checked={draft.planning.premortem} /> Pre-mortem</label>
        {/if}
        <label><input type="checkbox" bind:checked={draft.selected.local_checks} /> Local execution checks</label>
        <label><input type="checkbox" bind:checked={draft.selected.red_verify} /> Semantic red review</label>
        {#each ['main', 'secondary', 'code'] as participant}
          <label><input type="checkbox" value={participant} bind:group={draft.selected.verify} /> Verify: {participant}</label>
        {/each}
        {#each ['run.md', 'context.md', 'plan.md', 'progress.md', 'handoff.md', 'verification.md', 'red-verification.md'] as protocol}
          <label><input type="checkbox" value={protocol} bind:group={draft.selected.protocols} /> Report: {protocol}</label>
        {/each}
        {#each ['main', 'exe', 'verify_main', 'verify_secondary', 'verify_code', 'red', 'judge'] as role}
          <label>{role} provider<input bind:value={draft.routes[role].provider} /></label>
          <label>Model<input bind:value={draft.routes[role].model} /></label>
          <label>Reasoning effort (empty = provider default)<input bind:value={draft.routes[role].reasoningEffort} /></label>
        {/each}
        <button onclick={saveSettings}>Save settings</button>
      </fieldset>
    {/if}
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
  label { display: block; } textarea, select, input { display: block; width: 100%; box-sizing: border-box; margin-top: 8px; padding: 12px; font: inherit; }
  input[type=checkbox] { display: inline; width: auto; } fieldset { margin: 20px 0; }
  nav { display: flex; flex-wrap: wrap; gap: 10px; margin: 24px 0; }
  button { border: 1px solid #8a9b9f; border-radius: 5px; padding: 9px 18px; font: inherit; background: white; text-transform: capitalize; cursor: pointer; }
  button:disabled { opacity: .5; cursor: default; } a { color: #155a72; } [role=alert] { color: #a13028; }
</style>
