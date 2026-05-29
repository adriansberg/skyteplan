<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { RefreshCw } from '@lucide/svelte';

	function handleRefresh() {
		invalidateAll();
	}
</script>

<button
	onclick={handleRefresh}
	class="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full bg-stone-100 text-fg-muted transition-colors duration-200 hover:bg-stone-200 active:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 dark:active:bg-stone-600"
	title="Oppdater data"
	aria-label="Oppdater data"
>
	<RefreshCw size={18} aria-hidden="true" />
</button>
