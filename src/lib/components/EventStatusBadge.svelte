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
		class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 {className}"
	>
		✓
	</span>
{:else if status === 'ongoing'}
	<span
		class="inline-flex animate-pulse items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 {className}"
	>
		🎯
	</span>
{:else if status === 'did_not_start'}
	<span
		class="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 {className}"
	>
		✗
	</span>
{:else}
	<span
		class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 {className}"
	>
		⏱️
	</span>
{/if}
