<script lang="ts">
    import yaml from "svelte-highlight/languages/yaml";
    import md from "svelte-highlight/languages/markdown";
    import type { WORKSPACE_EXPOSED } from "./types";
    import Services from "./Services.svelte";
	import Actions from './Actions.svelte';
    import H from "./H.svelte";
    import { page } from '$app/stores';
    import { trpc } from '$lib/trpc/client';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{ 
        state:{state:WORKSPACE_EXPOSED[]}
    }>()

    const dispatchDelete = createEventDispatcher<{ 
        delete: () => Promise<void>
    }>()

    export let data: WORKSPACE_EXPOSED;
    let loading = false;
    let error = ""

    function polling(){
        const interval = setInterval(async ()=>{
            let state = await trpc($page).states.query();
            
            const w = state.filter(s => s.workspace === data.workspace)[0]
            if(w.services.length > 0){
                dispatch('state', {
                    state
                })
                clearInterval(interval)
                loading = false
            }
        }, 3000);
    }

    async function cmd(c: "up"|"down"|"delete"|"cloneAndUp", workspace: string){
        try{
            loading = true;
            if(c === 'up') polling()
            const state = await trpc($page)[c].mutate({workspace});

            dispatch('state', {
                state
            });
            error = ""
        }catch(err){
            console.log(err)
            error = JSON.stringify(err)
        }
        finally{
            loading = false;
        }
    }

    async function onUp(event: CustomEvent<{workspace:string}>){
        await cmd("up", event.detail.workspace)
    }

    async function onCloneAndUp(event: CustomEvent<{workspace:string}>){
        await cmd("cloneAndUp", event.detail.workspace)
    }

    async function onDown(event: CustomEvent<{workspace:string}>){
        await cmd("down", event.detail.workspace)
    }

    async function onDelete(event: CustomEvent<{workspace:string}>){
        dispatchDelete('delete', () => cmd("delete", event.detail.workspace))
        //await cmd("delete", event.detail.workspace)
    }

</script>

<h3>{data.workspace}</h3>
<H code={data.readme} language={md} />
<H code={data.specification} language={yaml} />
<Services data={data.services} />
<Actions on:edit on:up={onUp} on:down={onDown} on:delete={onDelete} on:cloneAndUp={onCloneAndUp} {loading} {data} />
<div class="bg-red-500 text-white">{error}</div>