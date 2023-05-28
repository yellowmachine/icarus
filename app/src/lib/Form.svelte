<script lang="ts">
    import type { WORKSPACE } from './types';
    import { trpc } from '$lib/trpc/client';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{ 
        save:{}
    }>()

    export let workspace: WORKSPACE|null;

    let loading = false;

    let data = empty() 
    let error: string|null = null

    async function onSave(){
        try{
            loading = true;
            await trpc().save.mutate(data);
            error = null
        }catch(err){
            error = "Errors: " + JSON.stringify(err)
        }finally{
            loading = false;
            dispatch('save')
        }
    }

    function empty(){
        return {
            workspace: "",
            readme: "",
            specification: ""
        }
    }

    function onClear(){
        data = empty()
    }

    $: if(workspace !== null){
        data = workspace
    }

</script>

{#if loading}
<div>Saving...</div>
{:else}
<div>
    <h3>Create or edit a workspace</h3>
    <input 
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        type="text" name="workspace" bind:value={data.workspace} placeholder="Workspace name" required />
    <textarea 
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        rows="5" name="readme" bind:value={data.readme} placeholder="Description" required />
    <textarea 
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        rows="10" name="specification" bind:value={data.specification} placeholder="docker-compose.yml content" required />
    {#if data.workspace !== ""}
    <button on:click={onSave} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Save
    </button>
    {/if}
    <button on:click={onClear} class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
        Clear
    </button>
    {#if error}
    <span class="bg-red-500 text-white">{error}</span>
    {/if}
</div>
{/if}