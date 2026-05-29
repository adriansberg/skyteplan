<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone =
		| 'neutral'
		| 'primary'
		| 'live'
		| 'ok'
		| 'warn'
		| 'dns'
		| 'error'
		| 'gold'
		| 'silver'
		| 'bronze';
	type Size = 'sm' | 'md';

	interface Props {
		tone?: Tone;
		size?: Size;
		pill?: boolean;
		class?: string;
		icon?: Snippet;
		children: Snippet;
	}

	let {
		tone = 'neutral',
		size = 'md',
		pill = false,
		class: className = '',
		icon,
		children
	}: Props = $props();

	const toneClasses: Record<Tone, string> = {
		neutral: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
		primary: 'bg-primary text-on-primary',
		live: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
		ok: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
		warn: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
		dns: 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400',
		error: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
		gold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
		silver: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
		bronze: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
	};

	const sizeClasses: Record<Size, string> = {
		sm: 'px-1.5 py-0.5 text-xs',
		md: 'px-2 py-1 text-sm'
	};
</script>

<span
	class="inline-flex items-center gap-1 leading-tight font-medium {pill
		? 'rounded-full'
		: 'rounded-md'} {toneClasses[tone]} {sizeClasses[size]} {className}"
>
	{#if icon}
		<span class="shrink-0 *:size-3">{@render icon()}</span>
	{/if}
	{@render children()}
</span>
