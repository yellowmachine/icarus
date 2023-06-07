<script lang="ts">
    import type { WORKSPACE_EXPOSED } from './types';
    import Workspace from './Workspace.svelte'
    
    export let data: WORKSPACE_EXPOSED[] = []

    let filter = ""
    $: filtered = data.filter(x => x.workspace.toLowerCase().includes(filter.toLowerCase())).sort()

</script>

<div>
    <h3>Filter by name</h3>
    <input
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
        type="text" bind:value={filter} />
    {#each filtered as workspace (workspace.workspace)}
        <Workspace data={workspace} on:state on:edit on:delete />
    {/each}
</div>