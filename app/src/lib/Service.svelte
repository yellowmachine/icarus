<script lang="ts">
	import type { WORKSPACE } from "./types";
    import { page } from '$app/stores';

    export let data: WORKSPACE["services"][number];

    const base = $page.url.hostname

    function domain(port: string){
        return `https://${base}/${port}/`
    }
</script>

<div>{data.name}</div>
<ul>
{#each data.ports as port}
    <li><a target="_blank" href={ domain(port.mapped?.port) }>Open {port.mapped?.port}:{port.exposed.port}</a></li>
{/each}
</ul>