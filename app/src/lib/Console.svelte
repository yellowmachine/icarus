<script lang="ts">
    export let lines: string[] = []

</script>

<div class="text-white max-w-prose bg-black">
    <p>
        {#each lines as line}
            {line + "\n"}
        {/each}
    </p>
</div>