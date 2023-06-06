<script lang="ts">
    import { env } from '$env/dynamic/public';
	import type { WORKSPACE_EXPOSED } from "./types";
    import { dev } from '$app/environment';

    export let data: WORKSPACE_EXPOSED["services"][number];

    const base = env.PUBLIC_DOMAIN

    function url(port: string|number|undefined){
        const endPort = dev ? ":3001" : ""
        
        if(dev){
            if(env.PUBLIC_MODE === 'subdomain')
                return `${port}.${base}${endPort}/`
            else if(env.PUBLIC_MODE === 'path')
                return `${base}${endPort}/${port}/`
            else
                return `${base}:${port}/`
        }else{
            if(env.PUBLIC_MODE === 'subdomain')
                return `https://${port}.${base}${endPort}/`
            else if(env.PUBLIC_MODE === 'path')
                return `https://${base}${endPort}/${port}/`
            else
                return `https://${base}:${port}/`
        }

        
    }
</script>

<div>{data.name}</div>
<ul>
{#each data.ports as port}
    <li><a target="_blank" href={ url(port.exposed.port) }>Open {port.mapped?.port}</a></li>
{/each}
</ul>