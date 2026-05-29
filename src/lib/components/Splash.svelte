<script lang="ts">
	import { onMount } from 'svelte';

	let { show = $bindable(false) } = $props();

	onMount(() => {
		const hasSeenSplash = sessionStorage.getItem('skytterinfo-splash-shown');

		if (!hasSeenSplash) {
			show = true;
			sessionStorage.setItem('skytterinfo-splash-shown', 'true');

			const splashTimer = setTimeout(() => {
				show = false;
			}, 400);

			return () => clearTimeout(splashTimer);
		}
	});
</script>

{#if show}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-surface">
		<div class="flex flex-col items-center gap-6">
			<img
				src="/clubs/stordalen.jpg"
				alt="Skytterinfo"
				class="h-auto w-48 max-w-xs motion-safe:animate-[fadeIn_0.6s_ease-out]"
				height="192"
			/>
			<div class="flex items-center gap-2">
				<div
					class="h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse"
					style="animation-delay: 0ms"
				></div>
				<div
					class="h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse"
					style="animation-delay: 150ms"
				></div>
				<div
					class="h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse"
					style="animation-delay: 300ms"
				></div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
