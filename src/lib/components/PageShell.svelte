<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		count?: number | null;
		children: Snippet;
	}

	let { title, count = null, children }: Props = $props();
</script>

<div class="container mx-auto max-w-2xl px-4 py-6 pt-8">
	<div class="mb-8 flex items-baseline gap-3">
		<h1 class="font-heading text-3xl font-bold text-fg sm:text-4xl">{title}</h1>
		{#if count !== null}
			<span class="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-on-primary">
				{count}
			</span>
		{/if}
	</div>
	{@render children()}
</div>
