<script lang="ts">
    import Service from './Service.svelte'
	import type { WORKSPACE_EXPOSED } from './types';
    export let data: WORKSPACE_EXPOSED["services"] = []
</script>

<div>
    {#each data as service}
        <Service data={service} />
    {/each}
</div>