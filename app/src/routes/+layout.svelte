<script lang="ts">
    import 'virtual:uno.css'
    import type { LayoutServerData } from './$types'
    
	export let data: LayoutServerData

    const { user } = data
  
</script>

{#if user}
    <slot />
{/if}