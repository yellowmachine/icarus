<script lang="ts">
    import Service from './Service.svelte'
	import type { WORKSPACE } from './types';
    export let data: WORKSPACE["services"] = []
</script>

<div>
    {#each data as service}
        <Service data={service} />
    {/each}
</div>