<script lang="ts">
	import { page } from '$app/state';
	import { Calendar, Users, Trophy } from '@lucide/svelte';

	const isSchedulePage = $derived(page.url.pathname === '/');
	const isShootersPage = $derived(page.url.pathname === '/skyttere');
	const isPremielistePage = $derived(page.url.pathname === '/premieliste');
</script>

<nav
	class="fixed right-0 bottom-0 left-0 z-50 flex h-14 border-t border-frame bg-surface"
	style="padding-bottom: env(safe-area-inset-bottom)"
>
	<a
		href="/"
		aria-current={isSchedulePage ? 'page' : undefined}
		class="flex flex-1 flex-col items-center justify-center gap-0.5 border-t-2 text-xs font-medium transition-colors duration-200 {isSchedulePage
			? 'border-primary text-primary'
			: 'border-transparent text-fg-muted hover:text-fg active:text-primary'}"
	>
		<Calendar size={18} aria-hidden="true" />
		Skyteplan
	</a>
	<a
		href="/skyttere"
		aria-current={isShootersPage ? 'page' : undefined}
		class="flex flex-1 flex-col items-center justify-center gap-0.5 border-t-2 text-xs font-medium transition-colors duration-200 {isShootersPage
			? 'border-primary text-primary'
			: 'border-transparent text-fg-muted hover:text-fg active:text-primary'}"
	>
		<Users size={18} aria-hidden="true" />
		Skyttere
	</a>
	<a
		href="/premieliste"
		aria-current={isPremielistePage ? 'page' : undefined}
		class="flex flex-1 flex-col items-center justify-center gap-0.5 border-t-2 text-xs font-medium transition-colors duration-200 {isPremielistePage
			? 'border-primary text-primary'
			: 'border-transparent text-fg-muted hover:text-fg active:text-primary'}"
	>
		<Trophy size={18} aria-hidden="true" />
		Premieliste
	</a>
</nav>
