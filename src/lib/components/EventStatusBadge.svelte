<script lang="ts">
	import type { Event, Shooter } from '$lib/graphql/types';
	import { getEventStatus } from '$lib/utils/helpers';

	interface Props {
		event: Event & { shooter: Shooter };
		class?: string;
	}

	let { event, class: className = '' }: Props = $props();

	const status = $derived(getEventStatus(event));
</script>

{#if status === 'completed'}
	<span
		class="inline-flex items-center rounded-full bg-slate-600 px-2 py-1 text-xs font-medium text-white {className}"
		>Ferdig</span
	>
{:else if status === 'ongoing'}
	<span
		class="inline-flex animate-pulse items-center rounded-full bg-emerald-600 px-2 py-1 text-xs font-medium text-white {className}"
		>Pågår</span
	>
{:else if status === 'did_not_start'}
	<span
		class="inline-flex items-center rounded-full bg-gray-400 px-2 py-1 text-xs font-medium text-white {className}"
		>Møtte ikke</span
	>
{:else}
	<span
		class="inline-flex items-center rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white {className}"
		>Kommende</span
	>
{/if}
