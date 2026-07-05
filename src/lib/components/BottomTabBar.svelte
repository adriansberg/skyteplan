<script lang="ts">
	import { page } from '$app/state';

	const isSchedulePage = $derived(page.url.pathname === '/');
	const isShootersPage = $derived(page.url.pathname === '/skyttere');
	const isPremielistePage = $derived(page.url.pathname === '/premieliste');
	const isFacebookPage = $derived(page.url.pathname === '/facebook');
</script>

<nav
	class="fixed right-0 bottom-0 left-0 z-50 flex h-14 border-t border-neutral-200 bg-neutral-50"
	style="padding-bottom: env(safe-area-inset-bottom)"
>
	<a
		href="/"
		class="flex flex-1 flex-col items-center justify-center border-t-2 text-xs font-medium {isSchedulePage
			? 'border-emerald-600 text-emerald-600'
			: 'border-transparent text-neutral-500'}"
	>
		Skyteplan
	</a>
	<a
		href="/skyttere"
		class="flex flex-1 flex-col items-center justify-center border-t-2 text-xs font-medium {isShootersPage
			? 'border-emerald-600 text-emerald-600'
			: 'border-transparent text-neutral-500'}"
	>
		Skyttere
	</a>
	<a
		href="/premieliste"
		class="flex flex-1 flex-col items-center justify-center border-t-2 text-xs font-medium {isPremielistePage
			? 'border-emerald-600 text-emerald-600'
			: 'border-transparent text-neutral-500'}"
	>
		Premieliste
	</a>
	<a
		href="/facebook"
		class="flex flex-1 flex-col items-center justify-center border-t-2 text-xs font-medium {isFacebookPage
			? 'border-emerald-600 text-emerald-600'
			: 'border-transparent text-neutral-500'}"
	>
		Facebook
	</a>
</nav>
