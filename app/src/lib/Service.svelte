<script lang="ts">
    import { PUBLIC_MODE, PUBLIC_DOMAIN } from '$env/static/public';
	import type { WORKSPACE } from "./types";
    import { dev } from '$app/environment';

    export let data: WORKSPACE["services"][number];

    const base = PUBLIC_DOMAIN

    function url(port: number|undefined){
        const http = dev ? 'http': 'https'
        if(PUBLIC_MODE === 'subdomain')
            return `${http}://${port}.${base}/`
        else if(PUBLIC_MODE === 'path')
            return `${http}://${base}/${port}/`
        else
            return `${http}://${base}:${port}/`
    }
</script>

<div>{data.name}</div>
<ul>
{#each data.ports as port}
    <li><a target="_blank" href={ url(port.mapped?.port) }>Open {port.mapped?.port}:{port.exposed.port}</a></li>
{/each}
</ul>