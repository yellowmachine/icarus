<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
    import Workspaces from '$lib/Workspaces.svelte';
    import type { WORKSPACE } from '$lib/types';
    import Form from '$lib/Form.svelte';
	import { invalidateAll } from '$app/navigation';

    export let data: PageData;
    
    let state: WORKSPACE[];
    
    $: {
        state = data.ps;
    }

	function subscribe() {
		const sse = new EventSource('/');
		sse.onmessage = (ev) => {
            state = ev.data.ps;
        }
		return () => sse.close();
	}

	onMount(subscribe);

    function onEdit(event: CustomEvent<{workspace:string}>){
        workspace = event.detail.workspace
    }

    function onState(event: CustomEvent<{state:WORKSPACE[]}>){
        state = event.detail.state
        invalidateAll()
    }

    function onSave(){
        invalidateAll()
    }

    // this is necessary because this is still not receiving state events from server and the state
    // from up or down actions is done server side before up or down is completed 
    const interval = setInterval(invalidateAll, 5000);
	onDestroy(() => {
		clearInterval(interval);
	});

    let workspace: string|null = null
    $: editWorkspace = workspace === null ? null : state.filter(x => x.workspace === workspace)[0]

</script>

<main>
      <div class="grid grid-cols-3 gap-4">
        <Workspaces on:edit={onEdit} on:state={onState} data={state} />
        <Form workspace={editWorkspace} on:save={onSave} />
      </div>
</main>
