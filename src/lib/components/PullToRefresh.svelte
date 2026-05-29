<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { ArrowDown, ArrowUp, RefreshCw } from '@lucide/svelte';

	let isRefreshing = $state(false);
	let pullDistance = $state(0);
	let isPulling = $state(false);
	let canRefresh = $state(false);

	const PULL_THRESHOLD = 80;
	const MAX_PULL = 150;

	onMount(() => {
		if (!browser) return;

		let touchStartY = 0;
		let scrollElement: HTMLElement | null = null;

		function handleTouchStart(e: TouchEvent) {
			scrollElement = document.documentElement || document.body;
			if (scrollElement.scrollTop <= 0) {
				touchStartY = e.touches[0].clientY;
				isPulling = false;
				canRefresh = false;
			}
		}

		function handleTouchMove(e: TouchEvent) {
			if (!scrollElement || scrollElement.scrollTop > 0) return;
			const distance = Math.max(0, Math.min(MAX_PULL, e.touches[0].clientY - touchStartY));
			if (distance > 10) {
				isPulling = true;
				pullDistance = distance;
				canRefresh = distance >= PULL_THRESHOLD;
				e.preventDefault();
			}
		}

		function handleTouchEnd() {
			if (isPulling && canRefresh && !isRefreshing) {
				performRefresh();
			}
			isPulling = false;
			canRefresh = false;
			pullDistance = 0;
		}

		async function performRefresh() {
			isRefreshing = true;
			try {
				await invalidateAll();
				if ('serviceWorker' in navigator) {
					const registration = await navigator.serviceWorker.getRegistration();
					if (registration?.waiting) {
						registration.waiting.postMessage({ type: 'SKIP_WAITING' });
					}
				}
				await new Promise((resolve) => setTimeout(resolve, 800));
			} catch (error) {
				console.error('Refresh failed:', error);
			} finally {
				isRefreshing = false;
			}
		}

		document.addEventListener('touchstart', handleTouchStart, { passive: true });
		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleTouchEnd, { passive: true });

		return () => {
			document.removeEventListener('touchstart', handleTouchStart);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	});
</script>

{#if isPulling || isRefreshing}
	<div
		class="fixed top-0 right-0 left-0 z-50 flex justify-center"
		style="transform: translateY({Math.min(pullDistance * 0.5, 50)}px); transition: {isPulling
			? 'none'
			: 'transform 0.3s ease-out'}"
	>
		<div class="mt-4 flex items-center gap-2 rounded-full bg-surface px-4 py-2 shadow-sm">
			{#if isRefreshing}
				<RefreshCw size={16} class="text-primary motion-safe:animate-spin" aria-hidden="true" />
				<span class="text-sm font-medium text-fg">Oppdaterer...</span>
			{:else if canRefresh}
				<ArrowUp size={16} class="text-ok" aria-hidden="true" />
				<span class="text-ok text-sm font-medium">Slipp for å oppdatere</span>
			{:else}
				<ArrowDown size={16} class="text-fg-muted" aria-hidden="true" />
				<span class="text-sm font-medium text-fg-muted">Dra ned for å oppdatere</span>
			{/if}
		</div>
	</div>
{/if}
