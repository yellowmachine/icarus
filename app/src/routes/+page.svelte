<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
    import Workspaces from '$lib/Workspaces.svelte';
    import type { WORKSPACE } from '$lib/types';
    import Form from '$lib/Form.svelte';
    import Console from '$lib/Console.svelte';
    import { page } from '$app/stores';
    import { trpc } from '$lib/trpc/client';

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
            lines = lines
        }
		return () => sse.close();
	}

    $: truncatedLines = lines.slice(-20)

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
            //error = ""
        }catch(err){
            //error = JSON.stringify(err)
            console.error(err)
        }
        finally{
            //loading = false;
        }
    }

</script>

<main>
      <button class="link text-orange-500" on:click={refresh}>Manually refresh</button>
      <div class="grid grid-cols-3 gap-4">
        <Workspaces on:edit={onEdit} on:state={onState} data={state} />
        <Form workspace={workspace} on:save={refresh} />
        <Console lines={truncatedLines} />
      </div>
</main>
