<script lang="ts">
    import type { WORKSPACE } from "./types";
    import { createEventDispatcher } from 'svelte';
    
    export let data: WORKSPACE;
    export let loading: boolean;

    const dispatch = createEventDispatcher<{ 
        up:{workspace:string},
        down:{workspace:string},
        delete:{workspace:string}, 
        edit:{workspace:string}
    }>()

    function edit(workspace: string){
        dispatch('edit', {
			workspace
		});
    }

    function up(){
        dispatch('up', {
			workspace: data.workspace
		});
    }

    function down(){
        dispatch('down', {
			workspace: data.workspace
		});
    }

    function delete_(){
        dispatch('delete', {
			workspace: data.workspace
		});
    }
</script>

{#if loading}
    Waiting...
{:else}
    <div class="grid grid-rows-1 grid-flow-col gap-4">
        {#if data.isValid}
            <button on:click={up} class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Up
            </button>
        {:else}
            <div class="text-red font-bold">Errors in config file</div>
        {/if}
        
        {#if data.services.length > 0}
            <button on:click={down} class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                Down
            </button>
        {/if}
        
        {#if data.services.length === 0}
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={() => edit(data.workspace)}>
                Edit
            </button>
        {/if}
        
        {#if data.services.length === 0}
            <button on:click={delete_} class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Delete
            </button>
        {/if}
    </div>
{/if}

