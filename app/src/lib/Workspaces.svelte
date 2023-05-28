<script lang="ts">
    import type { WORKSPACE } from './types';
    import Workspace from './Workspace.svelte'
    export let data: WORKSPACE[] = []

    let filter = ""
    $: filtered = data.filter(x => x.workspace.startsWith(filter)).sort()

</script>

<div>
    <h3>Filter by name</h3>
    <input type="text" bind:value={filter} />
    {#each filtered as workspace (workspace.workspace)}
        <Workspace data={workspace} on:state on:edit />
    {/each}
</div>