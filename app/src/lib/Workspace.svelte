<script lang="ts">
    import yaml from "svelte-highlight/languages/yaml";
    import md from "svelte-highlight/languages/markdown";
    import type { WORKSPACE } from "./types";
    import Services from "./Services.svelte";
	import Actions from './Actions.svelte';
    import H from "./H.svelte";
    import { page } from '$app/stores';
    import { trpc } from '$lib/trpc/client';

    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{ 
        state:{state:WORKSPACE[]}
    }>()


    export let data: WORKSPACE;
    let loading = false;
    let error = ""

    async function cmd(c: "up"|"down"|"delete", workspace: string){
        try{
            loading = true;
            const state = await trpc($page)[c].mutate({workspace});
            dispatch('state', {
                state
            });
            error = ""
        }catch(err){
            error = JSON.stringify(err)
        }
        finally{
            loading = false;
        }
    }

    async function onUp(event: CustomEvent<{workspace:string}>){
        await cmd("up", event.detail.workspace)
    }

    async function onDown(event: CustomEvent<{workspace:string}>){
        await cmd("down", event.detail.workspace)
    }

    async function onDelete(event: CustomEvent<{workspace:string}>){
        await cmd("delete", event.detail.workspace)
    }

</script>

<h3>{data.workspace}</h3>
<H code={data.readme} language={md} />
<H code={data.specification} language={yaml} />
<Services data={data.services} />
<Actions on:edit on:up={onUp} on:down={onDown} on:delete={onDelete} {loading} {data} />
<div class="bg-red-500 text-white">{error}</div>