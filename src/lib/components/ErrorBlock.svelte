<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { AlertCircle, RotateCcw } from '@lucide/svelte';

	interface Props {
		message: string;
		retry?: () => void;
	}

	let { message, retry }: Props = $props();

	function handleRetry() {
		if (retry) {
			retry();
		} else {
			invalidateAll();
		}
	}
</script>

<div
	class="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950"
	role="alert"
>
	<div class="mb-2 flex items-center gap-2 text-red-700 dark:text-red-400">
		<AlertCircle size={18} aria-hidden="true" />
		<p class="font-semibold">Feil ved lasting av data</p>
	</div>
	<p class="mb-4 text-sm text-red-600 dark:text-red-300">{message}</p>
	<button
		onclick={handleRetry}
		class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 active:bg-red-800 dark:bg-red-700 dark:hover:bg-red-600"
	>
		<RotateCcw size={14} aria-hidden="true" />
		Prøv igjen
	</button>
</div>
