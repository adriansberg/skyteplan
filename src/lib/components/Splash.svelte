<script lang="ts">
	import { onMount } from 'svelte';
	import stordalenLogo from '$lib/assets/stordalen.jpg';

	export let show = false;
	let minimumSplashTime = 1500; // Show splash for at least 1.5 seconds

	onMount(() => {
		// Check if this is the first visit of this session
		const hasSeenSplash = sessionStorage.getItem('stordalen-splash-shown');

		if (!hasSeenSplash) {
			show = true;
			// Mark that user has seen the splash screen in this session
			sessionStorage.setItem('stordalen-splash-shown', 'true');

			// Hide splash after minimum time
			const splashTimer = setTimeout(() => {
				show = false;
			}, minimumSplashTime);

			return () => clearTimeout(splashTimer);
		}
	});
</script>

{#if show}
	<!-- Splash Screen -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-white">
		<div class="flex flex-col items-center space-y-6">
			<img
				src={stordalenLogo}
				alt="Stordalen Skytterlag"
				class="animate-fade-in h-auto w-64 max-w-sm"
			/>
			<div class="flex items-center space-x-2">
				<div class="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
				<div class="animation-delay-200 h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
				<div class="animation-delay-400 h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
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

	.animate-fade-in {
		animation: fadeIn 0.8s ease-out;
	}

	.animation-delay-200 {
		animation-delay: 0.2s;
	}

	.animation-delay-400 {
		animation-delay: 0.4s;
	}

	/* Loading dots animation */
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 1.5s ease-in-out infinite;
	}
</style>
