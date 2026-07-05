<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	// Handle refresh button click
	function handleRefresh() {
		invalidateAll();
	}
</script>

<button
	onclick={handleRefresh}
	class="mr-4 flex cursor-pointer items-center justify-center rounded-full border-none bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-200 sm:px-3 sm:text-sm"
	title="Oppdater data"
	aria-label="Oppdater data"
>
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="h-3 w-3 sm:h-4 sm:w-4"
	>
		<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
		<path d="M21 3v5h-5" />
		<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
		<path d="M3 21v-5h5" />
	</svg>
</button>
