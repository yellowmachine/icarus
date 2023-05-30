<script lang="ts">
    import { PUBLIC_MODE, PUBLIC_HTTP } from '$env/static/public';
	import type { WORKSPACE } from "./types";
    import { page } from '$app/stores';

    export let data: WORKSPACE["services"][number];

    const base = $page.url.hostname

    function url(port: number|undefined){
        if(PUBLIC_MODE === 'subdomain')
            return `${PUBLIC_HTTP}://${port}.${base}/`
        else if(PUBLIC_MODE === 'path')
            return `${PUBLIC_HTTP}://${base}/${port}/`
        else
            return `${PUBLIC_HTTP}://${base}:${port}/`
    }
</script>

<div>{data.name}</div>
<ul>
{#each data.ports as port}
    <li><a target="_blank" href={ url(port.mapped?.port) }>Open {port.mapped?.port}:{port.exposed.port}</a></li>
{/each}
</ul>