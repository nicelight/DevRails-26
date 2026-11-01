<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { View } from './types.js';
  import { stations, operations, worldWidth, positionFor, driverColors, meter } from './scene.mjs';
  let { view, busy, createSide, openSide, inspect, mainHref }: { view: View; busy: boolean; createSide: (anchor: {x: number; y: number}) => void; openSide: (id: string) => void; inspect: () => void; mainHref: string } = $props();
  let viewport: HTMLDivElement;
  let width = $state(1000), height = $state(500), zoom = $state(.4), x = $state(0), y = $state(0);
  let dragging: { px: number; py: number; x: number; y: number } | null = null;
  let moved = false;
  let reduced = false;
  const level = $derived(zoom < .65 ? 'overview' : zoom < 1 ? 'tactical' : 'detail');
  const trainX = $derived(positionFor(view.verification));
  const worldHeight = $derived(Math.max(700, ...view.sides.map(side => side.anchor.y + 90)));
  function fit() { zoom = Math.min(width / worldWidth, height / worldHeight); x = (width - worldWidth * zoom) / 2; y = (height - worldHeight * zoom) / 2; }
  function changeZoom(factor: number, px = width / 2, py = height / 2) { const next = Math.max(.15, Math.min(2, zoom * factor)); x = px - (px - x) * next / zoom; y = py - (py - y) * next / zoom; zoom = next; }
  function wheel(event: WheelEvent) { event.preventDefault(); const r = viewport.getBoundingClientRect(); changeZoom(Math.exp(-event.deltaY * .0015), event.clientX - r.left, event.clientY - r.top); }
  function down(event: PointerEvent) { if ((event.target as Element).closest('[data-action]')) return; moved = false; dragging = { px: event.clientX, py: event.clientY, x, y }; (event.currentTarget as SVGElement).setPointerCapture(event.pointerId); }
  function move(event: PointerEvent) { if (!dragging) return; const dx = event.clientX - dragging.px, dy = event.clientY - dragging.py; moved ||= Math.abs(dx) + Math.abs(dy) > 4; x = dragging.x + dx; y = dragging.y + dy; }
  function newSide() { if (busy || moved) return; const count = view.sides.filter(side => Math.abs(side.anchor.x - trainX) < 80).length; createSide({ x: trainX, y: 490 + count * 70 }); }
  function activate(event: KeyboardEvent, action: () => void) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action(); } }
  let previousTarget: string | null = null;
  $effect(() => {
    const target = view.proposedTarget;
    if (previousTarget && !target && view.phase === 'running') {
      const focus = trainX;
      if (!reduced) untrack(fit);
      const timer = setTimeout(() => { zoom = Math.min(1, width / 900); x = width / 2 - focus * zoom; y = height / 2 - 290 * zoom; }, reduced ? 0 : 350);
      previousTarget = target;
      return () => clearTimeout(timer);
    }
    previousTarget = target;
  });
  onMount(() => {
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = new ResizeObserver(([entry]) => { width = entry.contentRect.width; height = entry.contentRect.height; fit(); });
    resize.observe(viewport); return () => resize.disconnect();
  });
</script>
<div class="map-tools">
  <span>Route schematic <small>· {level} · draft layout</small></span>
  <div><button onclick={fit}>Fit</button><button aria-label="Zoom out" onclick={() => changeZoom(.8)}>−</button><button aria-label="Zoom in" onclick={() => changeZoom(1.25)}>+</button></div>
</div>
<div class="viewport" bind:this={viewport}>
  <svg aria-label="DevRails route map. Drag to pan, wheel to zoom." role="img" onwheel={wheel} onpointerdown={down} onpointermove={move} onpointerup={() => dragging = null} onpointercancel={() => dragging = null}>
    <g transform={`translate(${x} ${y}) scale(${zoom})`}>
      <path class="rail" d="M100 290H2340" />
      <path class="rail conditional" d="M720 290V180H1030V290M1340 290V180H1650V290" />
      {#if level !== 'overview'}
        <text x="875" y="160" text-anchor="middle">Selected feature review</text>
        <text x="1495" y="160" text-anchor="middle">Selected task review / diagnostics</text>
      {/if}
      {#each stations as [sx, label], i}
        <g><rect class="station" x={sx - 65} y="307" width="130" height="52" rx="3"/><circle class="station" cx={sx} cy="290" r="11"/>
          {#if level !== 'overview'}<text x={sx} y="338" text-anchor="middle">{label}</text>{:else}<text class="station-number" x={sx} y="341" text-anchor="middle">{String(i + 1).padStart(2, '0')}</text>{/if}
        </g>
      {/each}
      {#if level !== 'overview'}
        {#each operations as [ox, names]}<text x={ox} y="215" text-anchor="middle">{#each names as name, i}<tspan x={ox} dy={i ? 22 : 0}>{name}</tspan>{/each}</text>{/each}
      {/if}
      <path class="rail return" d="M1960 362V402H1435V294"/><path class="rail" d="m1427 307 8-13 8 13"/>
      {#if level !== 'overview'}<text x="1680" y="392" text-anchor="middle">Repair → exe · same task</text>{/if}
      {#if view.proposedTarget}
        <path class="tunnel" d={`M${trainX} 290V450H${positionFor(view.proposedTarget)}V290`} />
        <circle class="red-signal" cx={trainX + 85} cy="280" r="13"/>
        {#if level !== 'overview'}<text class="negative" x={(trainX + positionFor(view.proposedTarget)) / 2} y="440" text-anchor="middle">Proposed → {view.proposedTarget} · awaiting consent</text>{/if}
      {/if}
      <g transform={`translate(${trainX - 65} 265)`}>
        <g data-action role="button" tabindex={busy ? -1 : 0} aria-label="Create independent Side chat" onclick={newSide} onkeydown={event => activate(event, newSide)}>
          <rect class="body" width="83" height="42" rx="3"/><rect class="cargo" x="8" y="10" width={view.mainSession && view.facts[view.mainSession]?.occupancy != null ? 65 * view.facts[view.mainSession].occupancy! : 0} height="22"/>
          <text class="cargo-label" x="40" y="29" text-anchor="middle">{meter(view.facts[view.mainSession ?? ''])}</text>
        </g>
        <a data-action href={mainHref} aria-label="Open native main chat"><rect class="driver" x="88" y="-8" width="45" height="50" rx="3" fill={driverColors[view.settings.driverColor ?? 'blue']}/><path d="M96 0H123V15H96Z" fill="var(--surface)"/></a>
        <circle cx="18" cy="48" r="8" class="wheel"/><circle cx="110" cy="48" r="8" class="wheel"/>
        {#if level !== 'overview'}<text x="67" y="-23" text-anchor="middle">/{view.verification} · {view.participants.find(peer => peer.state === 'running')?.role ?? 'main'} · {view.phase}</text>{/if}
        {#if level === 'detail'}<text x="67" y="86" text-anchor="middle">Main: {view.settings.routes.main.model}{view.facts[view.mainSession ?? '']?.compactions ? ` · ↻ ${view.facts[view.mainSession ?? ''].compactions}` : ''}</text>{/if}
      </g>
      <g transform="translate(100 70)" data-action role="button" tabindex={busy ? -1 : 0} aria-label="Request H inspection now" onclick={() => !busy && inspect()} onkeydown={event => activate(event, () => !busy && inspect())}>
        <rect class="h-base" width="185" height="70" rx="3"/><text class="h" x="28" y="46">H</text>
        {#if level !== 'overview'}<text x="65" y="28">{view.inspection ?? 'idle'}</text><text x="65" y="51">{meter(view.facts[view.judgeSession ?? ''])}{view.facts[view.judgeSession ?? '']?.compactions ? ` · ↻ ${view.facts[view.judgeSession ?? ''].compactions}` : ''}</text>{/if}
        {#each [0, 1, 2] as slot}<rect x={slot * 58} y="80" width="48" height="22" class:selected-slot={(view.settings.judgeSlot ?? 0) === slot} class="slot"/>{/each}
        {#if level === 'detail'}<text x="0" y="128">{view.settings.routes.judge?.model ?? 'Judge model not set'}</text>{/if}
      </g>
      {#if view.inspection === 'running'}<g class="helicopter" transform={`translate(${trainX + 150} 90)`}><path d="M-40 0H40M0 0V12M-28 42H28M-16 30V42M16 30V42"/><ellipse cy="22" rx="28" ry="15"/><text x="0" y="28" text-anchor="middle">H</text></g>{/if}
      {#each view.participants as peer, i}
        <g transform={`translate(${1600 + i * 260} 550)`}><rect class="peer" class:active={peer.state === 'running'} class:partial={peer.state === 'interrupted'} width="210" height="48" rx="3"/>
          {#if level !== 'overview'}<text x="12" y="21">{peer.role}: {peer.state === 'prepared' ? 'queued' : peer.state === 'complete' ? 'done' : peer.state}</text><text class="muted" x="12" y="40">Context {meter(view.facts[peer.session])}{view.facts[peer.session]?.compactions ? ` · ↻ ${view.facts[peer.session].compactions}` : ''}</text>{/if}
        </g>
      {/each}
      {#if view.participants.length && level !== 'overview'}<text x="1600" y="630">Actual participants · selected peers run sequentially</text>{/if}
      {#each view.sides as side, i}
        <g data-action role="button" tabindex="0" aria-label={`Open Side ${i + 1}`} onclick={() => openSide(side.id)} onkeydown={event => activate(event, () => openSide(side.id))} transform={`translate(${side.anchor.x} ${side.anchor.y})`}>
          <rect class="side" class:partial={!!side.error} x="-42" y="-22" width="84" height="44" rx="22"/><text text-anchor="middle" y="5">{meter(view.facts[side.id])}</text>
          {#if level !== 'overview'}<text x="55" y="5">Side {i + 1}{view.facts[side.id]?.compactions ? ` · ↻ ${view.facts[side.id].compactions}` : ''}</text>{/if}
        </g>
      {/each}
    </g>
  </svg>
</div>
<style>
  .map-tools { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--line); }
  .map-tools div { display: flex; gap: 4px; } small { color: var(--muted); }
  .viewport { height: min(60vh, 620px); min-height: 350px; overflow: hidden; background: var(--surface); }
  svg { width: 100%; height: 100%; touch-action: none; user-select: none; } text { fill: var(--ink); font: 16px system-ui, sans-serif; pointer-events: none; }
  .rail { stroke: var(--muted); stroke-width: 3; fill: none; } .conditional { stroke-dasharray: 6 6; } .return { opacity: .6; }
  .station, .side { fill: var(--surface); stroke: var(--muted); stroke-width: 2; } .station-number { font-size: 28px; fill: var(--muted); }
  .body { fill: var(--ink); stroke: var(--ink); stroke-width: 2; } .cargo { fill: var(--accent); opacity: .65; }.cargo-label { fill: var(--surface); font-weight: 650; }
  .driver { stroke: var(--ink); stroke-width: 2; } .wheel { fill: var(--ink); }
  [data-action] { cursor: pointer; } [data-action]:focus { outline: 3px solid var(--accent); outline-offset: 5px; }
  .h-base, .peer { fill: var(--background); stroke: var(--muted); stroke-width: 2; }.h { font-size: 34px; font-weight: 650; }
  .slot { fill: var(--surface); stroke: var(--muted); stroke-width: 2; }.selected-slot, .active { stroke: var(--accent); stroke-width: 4; }
  .helicopter { stroke: var(--ink); stroke-width: 3; fill: var(--surface); }
  .tunnel { fill: none; stroke: var(--negative); stroke-width: 4; stroke-dasharray: 10 7; }.red-signal { fill: var(--negative); }.negative { fill: var(--negative); }.partial { stroke: var(--negative); stroke-width: 3; }.muted { fill: var(--muted); }
</style>
