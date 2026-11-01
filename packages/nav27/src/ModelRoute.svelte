<script lang="ts">
  import type { Route } from './types.js';
  import type { ModelCatalog } from '@deepseek-ai/dsh-api-session-controller/types';
  let { route = $bindable(), catalog, label }: { route: Route; catalog: ModelCatalog | null; label: string } = $props();
  const group = $derived(catalog?.groups.find(group => group.id === route.provider));
  const model = $derived(group?.models.find(model => model.id === route.model));
  function providerChanged(event: Event) { const provider = (event.target as HTMLSelectElement).value; route = { provider, model: catalog?.groups.find(group => group.id === provider)?.models[0]?.id ?? '' }; }
  function modelChanged(event: Event) { route = { provider: route.provider, model: (event.target as HTMLSelectElement).value }; }
</script>
<div class="route">
  <strong>{label}</strong>
  <label>Provider<select value={route.provider} onchange={providerChanged} disabled={!catalog}>
    {#if !group}<option value={route.provider}>{route.provider || 'Choose provider'}{route.provider ? ' (unavailable)' : ''}</option>{/if}
    {#each catalog?.groups ?? [] as group}<option value={group.id}>{group.name}</option>{/each}
  </select></label>
  <label>Model<select value={route.model} onchange={modelChanged} disabled={!group}>
    {#if !model}<option value={route.model}>{route.model || 'Choose model'}{route.model ? ' (unavailable)' : ''}</option>{/if}
    {#each group?.models ?? [] as model}<option value={model.id}>{model.name}</option>{/each}
  </select></label>
  {#if model?.reasoning?.efforts.length}<label>Effort<select value={route.reasoningEffort ?? ''} onchange={event => route = { ...route, reasoningEffort: event.currentTarget.value || undefined }}>
    <option value="">Provider default</option>{#each model.reasoning.efforts as effort}<option value={effort.id}>{effort.name}</option>{/each}
  </select></label>{/if}
</div>
<style>
  .route { display: grid; gap: 8px; padding: 12px 0; border-bottom: 1px solid var(--line); } strong { align-self: center; } label { font-size: 14px; }
  @media (min-width: 700px) { .route { grid-template-columns: 130px 1fr 1fr 1fr; align-items: end; } }
</style>
