<script lang="ts">
    import { env } from '$env/dynamic/public';
	import type { WORKSPACE_EXPOSED } from "./types";
    import { dev } from '$app/environment';

    export let data: WORKSPACE_EXPOSED["services"][number];

    const base = env.PUBLIC_DOMAIN

    type PORT = {
        exposed: {
            port: string,
            subdomain: string
        },
        mapped?: {
            port: number
        }
    }

    function url(port: PORT){
        if(dev){
            return `http://${base}:${port.mapped?.port}/`
        }else{
            if(env.PUBLIC_MODE === 'subdomain')
                return `https://${port.exposed.subdomain}.${base}/`
            else if(env.PUBLIC_MODE === 'path')
                return `https://${base}/${port.exposed.subdomain}/`
        }

        
    }
</script>

<div>{data.name}</div>
<ul>
{#each data.ports as port}
    <li><a target="_blank" href={ url(port) }>Open {port.exposed.port}</a></li>
{/each}
</ul>