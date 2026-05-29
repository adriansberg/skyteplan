<script lang="ts">
	import type { Event, Shooter } from '$lib/graphql/types';
	import { getEventStatus } from '$lib/utils/helpers';
	import { Check, Radio, CircleSlash, Clock } from '@lucide/svelte';

	interface Props {
		event: Event & { shooter: Shooter };
		class?: string;
	}

	let { event, class: className = '' }: Props = $props();

	const status = $derived(getEventStatus(event));
</script>

{#if status === 'completed'}
	<span
		class="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300 {className}"
	>
		<Check size={12} aria-hidden="true" />
		Ferdig
	</span>
{:else if status === 'ongoing'}
	<span
		class="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-sm font-semibold text-red-700 motion-safe:animate-pulse dark:bg-red-950 dark:text-red-400 {className}"
	>
		<Radio size={12} aria-hidden="true" />
		Pågår
	</span>
{:else if status === 'did_not_start'}
	<span
		class="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-400 dark:bg-stone-800 dark:text-stone-500 {className}"
	>
		<CircleSlash size={12} aria-hidden="true" />
		Møtte ikke
	</span>
{:else}
	<span
		class="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-sm font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300 {className}"
	>
		<Clock size={12} aria-hidden="true" />
		Kommende
	</span>
{/if}
