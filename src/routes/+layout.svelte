<script lang="ts">
	import '../app.css';
	import stordalenLogo from '$lib/assets/stordalen.jpg';
	import { browser } from '$app/environment';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import PullToRefresh from '$lib/components/PullToRefresh.svelte';
	import RefreshButton from '$lib/components/RefreshButton.svelte';
	import BottomTabBar from '$lib/components/BottomTabBar.svelte';

	let { children } = $props();

	// Initialize PWA functionality on client side
	if (browser) {
		import('$lib/pwa');
	}
</script>

<svelte:head>
	<!-- Favicon is now handled in app.html -->
</svelte:head>

<header
	class="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-4"
	style="height: calc(2.5rem + env(safe-area-inset-top)); padding-top: env(safe-area-inset-top)"
>
	<a href="/"><img src={stordalenLogo} alt="Skytterappen" class="h-8 w-auto" /></a>
	<RefreshButton />
</header>

<div class="pb-16">
	{@render children?.()}
</div>

<!-- Pull to refresh functionality -->
<PullToRefresh />
<BottomTabBar />

<!-- Install prompt for PWA -->
<InstallPrompt />
