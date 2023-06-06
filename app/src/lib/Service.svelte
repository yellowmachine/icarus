<script lang="ts">
    import { env } from '$env/dynamic/public';
	import type { WORKSPACE_EXPOSED } from "./types";
    import { dev } from '$app/environment';

    export let data: WORKSPACE_EXPOSED["services"][number];

    const base = env.PUBLIC_DOMAIN

    function url(port: number|undefined){
        const dev = true;
        const http = dev ? 'http': 'https'
        const endPort = dev ? ":3001" : ""
        
        if(env.PUBLIC_MODE === 'subdomain')
            return `${http}://${port}.${base}${endPort}/`
        else if(env.PUBLIC_MODE === 'path')
            return `${http}://${base}${endPort}/${port}/`
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