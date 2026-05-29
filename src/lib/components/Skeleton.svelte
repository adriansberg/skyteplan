<script lang="ts">
	type Variant = 'list' | 'card' | 'block';

	interface Props {
		lines?: number;
		variant?: Variant;
		class?: string;
	}

	let { lines = 3, variant = 'list', class: className = '' }: Props = $props();

	const widths = ['80%', '65%', '55%', '70%', '60%'];
</script>

<div class="space-y-3 {className}" aria-hidden="true">
	{#each Array.from({ length: lines }, (_, i) => i) as i (i)}
		{#if variant === 'card'}
			<div
				class="h-28 rounded-xl bg-stone-200 motion-safe:animate-pulse dark:bg-stone-800"
				style="animation-delay: {i * 80}ms"
			></div>
		{:else if variant === 'block'}
			<div
				class="h-5 rounded-md bg-stone-200 motion-safe:animate-pulse dark:bg-stone-800"
				style="width: {widths[i % widths.length]}; animation-delay: {i * 80}ms"
			></div>
		{:else}
			<div class="flex gap-3">
				<div
					class="h-16 w-16 shrink-0 rounded-xl bg-stone-200 motion-safe:animate-pulse dark:bg-stone-800"
					style="animation-delay: {i * 60}ms"
				></div>
				<div class="flex-1 space-y-2">
					<div
						class="h-4 rounded-md bg-stone-200 motion-safe:animate-pulse dark:bg-stone-800"
						style="width: {widths[i % widths.length]}; animation-delay: {i * 60 + 30}ms"
					></div>
					<div
						class="h-3 rounded-md bg-stone-200 motion-safe:animate-pulse dark:bg-stone-800"
						style="width: {widths[(i + 2) % widths.length]}; animation-delay: {i * 60 + 60}ms"
					></div>
				</div>
			</div>
		{/if}
	{/each}
</div>
