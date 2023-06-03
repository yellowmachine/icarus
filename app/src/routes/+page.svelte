<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
    import Workspaces from '$lib/Workspaces.svelte';
    import type { WORKSPACE } from '$lib/types';
    import Form from '$lib/Form.svelte';
    import Console from '$lib/Console.svelte';
    import { page } from '$app/stores';
    import { trpc } from '$lib/trpc/client';
    import Modal from '$lib/Modal.svelte';

    let showModal = false;

    export let data: PageData;
    
    let state: WORKSPACE[];
    
    $: {
        state = data.ps;
    }

    let lines: string[] = [];

	function subscribe() {
		const sse = new EventSource('/');
		sse.onmessage = (ev) => {
            lines.push(ev.data)
            if(lines.length > 20) lines.shift()
            lines = lines
        }
		return () => sse.close();
	}

	onMount(subscribe);

    let workspace: WORKSPACE | null = null

    function onEdit(event: CustomEvent<{workspace:string}>){
        workspace =  {...state.filter(x => x.workspace === event.detail.workspace)[0]}
    }

    function onState(event: CustomEvent<{state:WORKSPACE[]}>){
        state = event.detail.state
    }

    async function refresh(){
        try{
            //loading = true;
            state = await trpc($page).states.query();
            console.log(state)
            //error = ""
        }catch(err){
            //error = JSON.stringify(err)
            console.error(err)
        }
        finally{
            //loading = false;
        }
    }

    let _delete: () => Promise<void>

    function onDelete(event: CustomEvent<()=>Promise<void>>){
        _delete = event.detail
        showModal = true
    }

</script>

<main>
      <button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded absolute top-0 right-0" on:click={refresh}>Manually refresh</button>
      <div class="grid grid-cols-3 gap-4">
        <Workspaces on:edit={onEdit} on:state={onState} data={state} on:delete={onDelete} />
        <Form workspace={workspace} on:save={refresh} />
        <Console {lines} />
      </div>
</main>

<Modal bind:showModal doIt={_delete}>
    <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
            <div class="mt-2">
                <p class="text-sm text-gray-500">Are you sure you want to delete workspace? It will `docker compose down -v`.</p>
            </div>
        </div>
    </div>
</Modal>