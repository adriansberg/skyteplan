<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import PullToRefresh from '$lib/components/PullToRefresh.svelte';
	import RefreshButton from '$lib/components/RefreshButton.svelte';
	import BottomTabBar from '$lib/components/BottomTabBar.svelte';

	let { children, data } = $props();

	if (browser) {
		import('$lib/pwa');
	}
</script>

<svelte:head>
	<!-- Favicon is handled in app.html -->
</svelte:head>

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-fg focus:ring-2 focus:ring-primary"
>
	Hopp til innhold
</a>

<header
	class="sticky top-0 z-40 flex items-center justify-between border-b border-frame bg-surface px-4"
	style="height: calc(2.5rem + env(safe-area-inset-top)); padding-top: env(safe-area-inset-top)"
>
	<a href="/">
		<img src={data.club.logoPath} alt={data.club.name} class="h-8 w-auto" height="32" />
	</a>
	<RefreshButton />
</header>

<main id="main" class="min-h-dvh bg-bg pb-[calc(4rem+env(safe-area-inset-bottom))]">
	{@render children?.()}
</main>

<PullToRefresh />
<BottomTabBar />
<InstallPrompt />
