<script lang="ts">
  import { onMount } from 'svelte';
  import type { View, Control, Settings } from './types.js';
  import type { ModelCatalog } from '@deepseek-ai/dsh-api-session-controller/types';
  import Scene from './Scene.svelte';
  import SideChat from './SideChat.svelte';
  import ModelRoute from './ModelRoute.svelte';
  import { driverColors, meter } from './scene.mjs';
  let { remote, native }: { remote: any; native: any } = $props();
  let view = $state<View | null>(null), draft = $state<Settings | null>(null), catalog = $state<ModelCatalog | null>(null);
  let task = $state(''), command = $state('start'), source = $state(''), sourceRef = $state(''), feature = $state('');
  let error = $state(''), catalogError = $state(''), busy = $state(false), openedSide = $state<string | null>(null);
  const root = new URL('../', location.href);
  const nativeLink = (id: string | null) => `${root.href}${id ? `#nav27-main=${id}` : ''}`;
  const side = $derived(view?.sides.find(side => side.id === openedSide));
  function accept(next: View) { if (!view || next.runId !== view.runId || next.revision >= view.revision) view = next; }
  async function refresh() {
    try { const result = await remote.snapshot(); if (result.ok) accept(result.value); else { view = null; error = result.error.message; } }
    catch (e) { view = null; error = (e as Error).message; }
  }
  async function mutate(action: () => Promise<any>) {
    if (!view || busy) return false;
    busy = true;
    try {
      const result = await action();
      if (result.ok) { accept(result.value); error = ''; return true; }
      error = result.error.message; view = result.error.details?.current ?? null;
    } catch (e) { view = null; error = `${(e as Error).message}. Refreshing current state; the action is not retried.`; await refresh(); }
    finally { busy = false; }
    return false;
  }
  async function control(action: Control['action']) {
    if (!view) return;
    const request = { runId: view.runId, revision: view.revision, action, ...(action === 'start-command' ? { command, inputs: { source, sourceRef: sourceRef || undefined, feature: feature || undefined, taskId: task || undefined } } : {}), ...(action === 'green' && view.requestId ? { requestId: view.requestId } : {}), ...(task ? { taskId: task } : {}) };
    await mutate(() => remote.control(request));
  }
  async function createSide(anchor: {x: number; y: number}) {
    if (!view) return;
    const ids = new Set(view.sides.map(side => side.id));
    const request = { runId: view.runId, revision: view.revision, anchor };
    if (await mutate(() => remote.createSide(request))) openedSide = view?.sides.find(side => !ids.has(side.id))?.id ?? null;
  }
  async function deleteSide() {
    if (!view || !side) return;
    const request = { runId: view.runId, revision: view.revision, sessionId: side.id };
    if (await mutate(() => remote.deleteSide(request))) openedSide = null;
  }
  async function loadCatalog() {
    try { const result = await native.session.modelCatalog(); if (!result.ok) throw new Error(result.error.message); catalog = result.value; catalogError = ''; }
    catch (e) { catalog = null; catalogError = (e as Error).message; }
  }
  function editSettings() {
    if (!view) return;
    draft = structuredClone(view.settings);
    draft.planning ??= { featureReview: false, taskReview: false, doctor: false, premortem: false };
    draft.driverColor ??= 'blue';
    for (const role of ['main', 'exe', 'verify_main', 'verify_secondary', 'verify_code', 'red', 'judge', 'side']) draft.routes[role] ??= { provider: '', model: '' };
    draft.judgeSlot ??= 0;
    draft.judgeSlots ??= Array.from({ length: 3 }, () => structuredClone(draft!.routes.judge.provider ? draft!.routes.judge : draft!.routes.main));
    void loadCatalog();
  }
  async function saveSettings() {
    if (!view || !draft) return;
    const request = { runId: view.runId, revision: view.revision, settingsRevision: view.settingsRevision, settings: draft };
    if (await mutate(() => remote.settings(request))) draft = null;
  }
  onMount(() => {
    void refresh(); void loadCatalog();
    const timer = setInterval(() => { if (!busy) void refresh(); }, 1500);
    return () => clearInterval(timer);
  });
</script>
<svelte:head><title>DevRails Nav 27</title></svelte:head>
<main>
  <header class="page-head"><div><p class="eyebrow">DevRails Nav 27</p><h1>Project route</h1></div><span class="draft-label">Functional schematic · draft layout</span></header>
  <nav class="controls" aria-label="Run controls">
    <button disabled={!view || busy} onclick={() => control('play')}>▶ Play</button>
    <button disabled={!view || busy} onclick={() => control('pause')}>Ⅱ Pause</button>
    <button class="danger" disabled={!view || busy} onclick={() => control('stop')}>■ Stop</button>
    <button disabled={!view || busy} onclick={() => control('green')}>Green{view?.requestId ? ' · approve proposal' : ''}</button>
    <button disabled={!view || busy} onclick={() => control('red')}>Red</button>
    <button disabled={!view || busy} onclick={() => control('inspect')}>H · inspect now</button>
    {#if view?.mainSession}<a href={nativeLink(view.mainSession)}>Main chat ↗</a>{/if}
    <button class="quiet" onclick={refresh} disabled={busy}>Refresh</button>
  </nav>
  {#if error}<p class="notice negative" role="alert">{error}</p>{/if}
  {#if view}
    <section class="run-summary" aria-live="polite">
      <strong>{view.phase}{view.hold ? ` · ${view.hold}` : ''}</strong><span>/{view.verification}</span><span>{view.taskId ?? 'No task selected'}</span>
      <span>Main context {meter(view.facts[view.mainSession ?? ''])}{view.facts[view.mainSession ?? '']?.compactions ? ` · ↻ ${view.facts[view.mainSession ?? ''].compactions}` : ''}</span>
    </section>
    {#if view.pending}<p class="notice negative">Pending decision: {view.pending}</p>{/if}
    {#if view.blocker}<p class="notice negative">Blocked: {view.blocker}</p>{/if}
    {#if view.mainError}<p class="notice negative">Main: {view.mainError}</p>{/if}
    <div class:with-chat={!!side} class="workspace">
      <section class="map-panel"><Scene {view} {busy} {createSide} openSide={id => openedSide = id} inspect={() => control('inspect')} mainHref={nativeLink(view.mainSession)} /></section>
      {#if side}{#key side.id}<SideChat {side} {native} close={() => openedSide = null} remove={deleteSide} deleting={busy} href={nativeLink(side.id)} />{/key}{/if}
    </div>
    <div class="evidence">
      {#each view.proof as proof}<span class:skipped={proof.includes('skipped')}>{proof}</span>{/each}
      {#if !view.proof.length}<span>Evidence appears after host accounting. Stations are outcomes, not a PASS claim.</span>{/if}
    </div>
    {#if view.participants.length}<div class="participants">{#each view.participants as participant}<span><strong>{participant.role}</strong> {participant.state === 'prepared' ? 'queued' : participant.state === 'complete' ? 'done' : participant.state}{participant.diagnostic ? ` — ${participant.diagnostic}` : ''} · context {meter(view.facts[participant.session])}</span>{/each}</div>{/if}
    <section class="work-options">
      <details><summary>Start command or prepared task</summary>
        <div class="fields"><label>Command<select bind:value={command}>{#each view.commands as name}<option value={name}>{name}</option>{/each}</select></label><label>Indexed task ID<input bind:value={task} placeholder="TASK-001-T1-FT-001-W1" /></label></div>
        <label>Subject input<textarea bind:value={source} placeholder="Accepted product source, change, or bounded question" rows="3"></textarea></label>
        <div class="fields"><label>Source reference<input bind:value={sourceRef} placeholder="Path to accepted project source" /></label><label>Feature<input bind:value={feature} placeholder="FT-001" /></label></div>
        <button disabled={busy || !['ready', 'stopped', 'done'].includes(view.phase) || !!view.pending || !!view.blocker || !!view.hold} onclick={() => control('start-command')}>Start command</button>
        <small>For an indexed task, enter its ID and press Play.</small>
      </details>
      <details><summary>Run policy and recovery</summary><div class="actions">
        <button disabled={busy} onclick={() => control('autonomous')}>Autonomous: {view.autonomous ? 'on' : 'off'}</button><button disabled={busy} onclick={() => control('resume')}>Resume unfinished work</button><button disabled={busy} onclick={() => control('repair')}>Repair</button>
      </div><p>H: {view.inspection ?? 'idle'}. Requested/delivered is not a running Judge. Main Stop preserves Side sessions.</p></details>
    </section>
    <section class="settings-panel">
      <div class="section-head"><h2>Station settings</h2><button disabled={busy || !view.editable} onclick={editSettings}>Edit settings</button></div>
      <p class="muted">{view.editable ? 'Ready for changes to future work.' : 'Frozen until an initial or stopped-ready station.'} Green freezes the entire next leg, including queued participants.</p>
      {#if draft}
        {#if catalogError}<p role="alert">Native model catalog: {catalogError}</p>{/if}
        <fieldset disabled={busy || !view.editable}>
          <legend>Next unstarted work</legend>
          <div class="toggles"><label><input type="checkbox" bind:checked={draft.selected.design} /> Subject design</label><label><input type="checkbox" bind:checked={draft.selected.local_checks} /> Local exe checks</label><label><input type="checkbox" bind:checked={draft.selected.red_verify} /> Task red review</label><label><input type="checkbox" bind:checked={draft.selected.feature_red_verify} /> Feature red review</label>
            {#each ['main', 'secondary', 'code'] as participant}<label><input type="checkbox" value={participant} bind:group={draft.selected.verify} /> Verify: {participant}</label>{/each}
          </div>
          <ModelRoute bind:route={draft.routes.main} {catalog} label="Main"/><ModelRoute bind:route={draft.routes.exe} {catalog} label="Executor"/><ModelRoute bind:route={draft.routes.side} {catalog} label="New Side"/>
          <label>Driver color<select bind:value={draft.driverColor}>{#each Object.keys(driverColors) as color}<option value={color}>{color}</option>{/each}</select></label>
          <details><summary>Reviewers and H model variants</summary>
            {#each ['verify_main', 'verify_secondary', 'verify_code', 'red'] as role}<ModelRoute bind:route={draft.routes[role]} {catalog} label={role}/>{/each}
            <label>Selected H variant<select bind:value={draft.judgeSlot}>{#each [0, 1, 2] as slot}<option value={slot}>Slot {slot + 1}</option>{/each}</select></label>
            {#if draft.judgeSlots}{#each [0, 1, 2] as slot}<ModelRoute bind:route={draft.judgeSlots[slot]} {catalog} label={`H slot ${slot + 1}`}/>{/each}{/if}
            <p class="muted">Three choices for one requested consultation, not three permanent agents.</p>
          </details>
          <details><summary>Planning checks and reports</summary><div class="toggles">
            {#if draft.planning}<label><input type="checkbox" bind:checked={draft.planning.featureReview} /> Feature plan review</label><label><input type="checkbox" bind:checked={draft.planning.taskReview} /> Task plan review</label><label><input type="checkbox" bind:checked={draft.planning.doctor} /> Readiness diagnostics</label><label><input type="checkbox" bind:checked={draft.planning.premortem} /> Pre-mortem</label>{/if}
            {#each ['run.md', 'context.md', 'plan.md', 'progress.md', 'handoff.md', 'verification.md', 'red-verification.md'] as protocol}<label><input type="checkbox" value={protocol} bind:group={draft.selected.protocols} /> {protocol}</label>{/each}
          </div></details>
          <div class="actions"><button disabled={!catalog} onclick={saveSettings}>Save settings</button><button onclick={() => draft = null}>Cancel edit</button></div>
        </fieldset>
      {/if}
    </section>
  {:else}<p class="notice">Connecting to the authenticated DSH host. Controls stay closed until a current snapshot arrives.</p>{/if}
</main>
<style>
  :global(:root) { color-scheme: light dark; --background: #f3f4f0; --surface: #fafbf7; --ink: #26343b; --muted: #5f7078; --line: #c4cdcd; --accent: #207c98; --negative: #b44334; }
  @media (prefers-color-scheme: dark) { :global(:root) { --background: #1b2226; --surface: #222c31; --ink: #e3e9e7; --muted: #a6b7bc; --line: #49595f; --accent: #7ac4dc; --negative: #ed9989; } }
  :global([data-theme="dark"]) { --background: #1b2226; --surface: #222c31; --ink: #e3e9e7; --muted: #a6b7bc; --line: #49595f; --accent: #7ac4dc; --negative: #ed9989; }
  :global(body) { margin: 0; background: var(--background); color: var(--ink); font: 16px/1.5 system-ui, sans-serif; }
  :global(*) { box-sizing: border-box; } main { padding: 16px; max-width: 1800px; margin: auto; }
  .page-head, .section-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }.eyebrow { margin: 0; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); } h1 { font-size: 32px; letter-spacing: -.03em; margin: 3px 0 16px; } h2 { font-size: 20px; margin: 0; }.draft-label { color: var(--muted); font-size: 13px; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; position: sticky; top: 0; background: var(--background); padding: 12px 0; z-index: 2; border-bottom: 1px solid var(--line); }
  :global(button), :global(select), :global(input), :global(textarea) { font: inherit; color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 3px; min-height: 44px; padding: 8px 12px; }
  :global(button) { cursor: pointer; } :global(button:disabled) { opacity: .5; cursor: default; } :global(a) { color: var(--accent); } :global(a:focus-visible), :global(button:focus-visible), :global(input:focus-visible), :global(textarea:focus-visible), :global(select:focus-visible) { outline: 2px solid var(--accent); outline-offset: 3px; }
  :global(label) { display: block; } :global(input), :global(textarea), :global(select) { width: 100%; display: block; margin: 4px 0 12px; } :global(input[type=checkbox]) { display: inline; width: 18px; height: 18px; min-height: 0; margin: 0 8px 0 0; vertical-align: middle; }
  .danger, :global(.danger), .negative, :global([role=alert]) { color: var(--negative); } .quiet { background: transparent; }.muted, small { color: var(--muted); }
  .run-summary, .evidence, .participants { display: flex; flex-wrap: wrap; gap: 8px 24px; padding: 14px 0; }.run-summary strong { text-transform: capitalize; }.evidence, .participants { font-size: 14px; color: var(--muted); }.skipped { border-bottom: 1px dashed var(--muted); }
  .workspace { display: grid; gap: 12px; min-width: 0; }.map-panel { border: 1px solid var(--line); min-width: 0; }.notice { padding: 12px 16px; border-left: 3px solid currentColor; background: var(--surface); }
  .work-options { display: grid; gap: 12px; margin: 16px 0; } details { border: 1px solid var(--line); padding: 12px 16px; } summary { cursor: pointer; min-height: 32px; } details[open] summary { margin-bottom: 16px; }
  .fields, .toggles { display: grid; gap: 8px 16px; }.toggles label { min-height: 44px; padding: 8px 0; }.actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }fieldset { border: 1px solid var(--line); padding: 16px; }fieldset details { margin: 16px 0; }.settings-panel { border-top: 1px solid var(--line); padding-top: 20px; }small { display: inline-block; padding: 6px 0; }
  @media (min-width: 700px) { main { padding: 24px; }.fields, .toggles { grid-template-columns: repeat(2, minmax(0, 1fr)); }.work-options { grid-template-columns: 1fr 1fr; } }
  @media (min-width: 1200px) { .with-chat { grid-template-columns: minmax(0, 1fr) 400px; }.toggles { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
  @media (prefers-reduced-motion: reduce) { :global(*) { scroll-behavior: auto !important; transition: none !important; animation: none !important; } }
</style>
