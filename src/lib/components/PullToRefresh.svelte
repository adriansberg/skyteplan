<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	let isRefreshing = $state(false);
	let pullDistance = $state(0);
	let isPulling = $state(false);
	let canRefresh = $state(false);

	const PULL_THRESHOLD = 200; // Distance needed to trigger refresh
	const MAX_PULL = 300; // Maximum pull distance

	onMount(() => {
		if (!browser) return;

		let touchStartY = 0;
		let scrollElement: HTMLElement | null = null;

		function handleTouchStart(e: TouchEvent) {
			// Only trigger if we're at the top of the page
			scrollElement = document.documentElement || document.body;
			if (scrollElement.scrollTop <= 0) {
				touchStartY = e.touches[0].clientY;
				isPulling = false;
				canRefresh = false;
			}
		}

		function handleTouchMove(e: TouchEvent) {
			if (!scrollElement || scrollElement.scrollTop > 0) return;

			const touchY = e.touches[0].clientY;
			const pullDistance = Math.max(0, Math.min(MAX_PULL, touchY - touchStartY));

			if (pullDistance > 10) {
				isPulling = true;
				setPullDistance(pullDistance);
				canRefresh = pullDistance >= PULL_THRESHOLD;

				// Prevent default scrolling when pulling
				e.preventDefault();
			}
		}

		function handleTouchEnd() {
			if (isPulling && canRefresh && !isRefreshing) {
				performRefresh();
			}

			// Reset pull state
			isPulling = false;
			canRefresh = false;
			setPullDistance(0);
		}

		function setPullDistance(distance: number) {
			pullDistance = distance;
		}

		async function performRefresh() {
			isRefreshing = true;

			try {
				// Invalidate all data to trigger fresh loads
				await invalidateAll();

				// Also try to update the service worker cache
				if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
					navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
				}

				// Add a small delay for better UX
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch (error) {
				console.error('Refresh failed:', error);
			} finally {
				isRefreshing = false;
			}
		}

		// Add event listeners
		document.addEventListener('touchstart', handleTouchStart, { passive: false });
		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleTouchEnd, { passive: true });

		// Cleanup
		return () => {
			document.removeEventListener('touchstart', handleTouchStart);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	});
</script>

<!-- Pull to refresh indicator -->
{#if isPulling || isRefreshing}
	<div
		class="fixed top-0 right-0 left-0 z-50 flex justify-center"
		style="transform: translateY({Math.min(pullDistance * 0.5, 60)}px); transition: {isPulling
			? 'none'
			: 'transform 0.3s ease-out'}"
	>
		<div class="mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
			{#if isRefreshing}
				<div
					class="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
				></div>
				<span class="text-sm font-medium text-gray-700">Oppdaterer...</span>
			{:else if canRefresh}
				<div class="h-5 w-5 text-green-600">
					<svg fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<span class="text-sm font-medium text-green-700">Slipp for å oppdatere</span>
			{:else}
				<div
					class="h-5 w-5 text-gray-400"
					style="transform: rotate({(pullDistance / PULL_THRESHOLD) * 180}deg)"
				>
					<svg fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<span class="text-sm font-medium text-gray-500">Dra ned for å oppdatere</span>
			{/if}
		</div>
	</div>
{/if}
