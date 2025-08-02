<script lang="ts">
	import '../app.css';
	import stordalenLogo from '$lib/assets/stordalen.jpg';
	import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import PullToRefresh from '$lib/components/PullToRefresh.svelte';

	const queryClient = new QueryClient();

	let { children } = $props();

	// Check if current path matches the given route
	const isSchedulePage = $derived(page.url.pathname === '/');
	const isShootersPage = $derived(page.url.pathname === '/skyttere');
	const isPremielistePage = $derived(page.url.pathname === '/premieliste');

	// Initialize PWA functionality on client side
	if (browser) {
		import('$lib/pwa');
	}
</script>

<svelte:head>
	<!-- Favicon is now handled in app.html -->
</svelte:head>

<header class="sticky top-0 z-40 border-b border-gray-200 bg-white">
	<div class="container mx-auto flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3">
		<a href="/" class="flex items-center space-x-2 transition-opacity hover:opacity-80">
			<img src={stordalenLogo} alt="Stordalen Skytterlag" class="h-8 w-auto sm:h-10" />
			<span class="hidden text-lg font-semibold text-gray-900 sm:inline">
				Stordalen Skytterlag
			</span>
		</a>

		<nav class="flex items-center space-x-2 sm:space-x-4">
			<a
				href="/"
				class="rounded-full px-2 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm {isSchedulePage
					? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
					: 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
			>
				📅 Skyteplan
			</a>
			<a
				href="/skyttere"
				class="rounded-full px-2 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm {isShootersPage
					? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
					: 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
			>
				👥 Skyttere
			</a>
			<a
				href="/premieliste"
				class="rounded-full px-2 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm {isPremielistePage
					? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
					: 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
			>
				🏆 Premier
			</a>
		</nav>
	</div>
</header>

<QueryClientProvider client={queryClient}>
	{@render children?.()}
</QueryClientProvider>

<!-- Pull to refresh functionality -->
<PullToRefresh />

<!-- Install prompt for PWA -->
<InstallPrompt />
