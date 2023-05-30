<script lang="ts">
    import 'virtual:uno.css'
    import type { LayoutServerData } from './$types'
    
	export let data: LayoutServerData
    const { user } = data

    //$: console.log('user:', user)
  
</script>

{#if user}
<form method="POST" action="/logout?">
    <button class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
        Logout
    </button>
</form>
{/if}
<slot />
