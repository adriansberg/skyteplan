<script lang="ts">
	import type { PageData } from './$types';
	import {
		getScheduleDays,
		formatDayLabel,
		composeMorningPost,
		composeResultsPost
	} from '$lib/utils/facebookPost';

	let { data }: { data: PageData } = $props();

	let shooters = $derived(data.shooters);
	let clubName = $derived(data.clubName ?? 'Skytterlaget');
	let error = $derived(data.error);

	let days = $derived(shooters ? getScheduleDays(shooters) : []);
	let defaultIndex = $derived.by(() => {
		const today = new Date();
		const i = days.findIndex((d) => formatDayLabel(d, today) === 'I dag');
		return i >= 0 ? i : 0;
	});
	let chosenIndex = $state<number | null>(null);
	let index = $derived(chosenIndex ?? defaultIndex);
	let selectedDay = $derived(days[index] ?? null);

	let morningText = $derived(
		selectedDay && shooters ? composeMorningPost(shooters, clubName, selectedDay) : ''
	);
	let resultsText = $derived(
		selectedDay && shooters ? composeResultsPost(shooters, clubName, selectedDay) : ''
	);

	let copied = $state<string | null>(null);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	function flagCopied(which: string) {
		copied = which;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = null), 2000);
	}

	async function handleCopy(text: string, which: string) {
		try {
			await navigator.clipboard.writeText(text);
			flagCopied(which);
		} catch {
			// Clipboard blocked (e.g. insecure context) — user can still select the text manually.
		}
	}

	async function handleShare(text: string, which: string) {
		if (navigator.share) {
			try {
				await navigator.share({ title: 'Skyteplan', text });
			} catch {
				// User cancelled the share sheet — no action needed.
			}
		} else {
			handleCopy(text, which);
		}
	}
</script>

<svelte:head>
	<title>Skyteplan - Facebook</title>
</svelte:head>

<div class="container mx-auto px-2 py-4 pt-6 sm:px-4 sm:py-6 sm:pt-8">
	<div class="mb-4 sm:mb-6">
		<h1 class="mb-1 text-2xl font-bold text-gray-900 sm:text-3xl">Facebook</h1>
		<p class="text-sm text-neutral-600">
			Lag ferdig innlegg, kopier eller del — og lim inn på Facebook-siden.
		</p>
	</div>

	{#if error}
		<div class="m-2 rounded-lg border border-red-200 bg-red-50 p-6">
			<h2 class="mb-2 text-xl font-semibold text-red-800">Feil ved lasting av data:</h2>
			<span class="text-red-600">Feil: {error}</span>
		</div>
	{:else if !shooters || days.length === 0}
		<div class="py-8 text-center sm:py-12">
			<p class="text-gray-500">Ingen skytinger funnet</p>
		</div>
	{:else}
		<div class="mb-4">
			<label class="mb-1 block text-sm font-medium text-neutral-700" for="fb-day">Dag</label>
			<select
				id="fb-day"
				value={index}
				onchange={(e) => (chosenIndex = Number(e.currentTarget.value))}
				class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900"
			>
				{#each days as day, i (day.getTime())}
					<option value={i}>{formatDayLabel(day)}</option>
				{/each}
			</select>
		</div>

		<div class="space-y-6">
			<!-- Morning post -->
			<section class="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
				<h2 class="mb-2 text-lg font-semibold text-gray-900">Morgeninnlegg</h2>
				<textarea
					readonly
					rows="10"
					class="w-full resize-y rounded-md border border-neutral-300 bg-white p-3 font-mono text-sm text-neutral-800"
					value={morningText}
				></textarea>
				<button
					type="button"
					onclick={() => handleShare(morningText, 'morning')}
					class="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white active:bg-emerald-700"
				>
					{copied === 'morning' ? 'Kopiert ✓' : 'Del'}
				</button>
			</section>

			<!-- Results post -->
			<section class="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
				<h2 class="mb-2 text-lg font-semibold text-gray-900">Resultatinnlegg</h2>
				<textarea
					readonly
					rows="10"
					class="w-full resize-y rounded-md border border-neutral-300 bg-white p-3 font-mono text-sm text-neutral-800"
					value={resultsText}
				></textarea>
				<button
					type="button"
					onclick={() => handleShare(resultsText, 'results')}
					class="mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white active:bg-emerald-700"
				>
					{copied === 'results' ? 'Kopiert ✓' : 'Del'}
				</button>
			</section>
		</div>
	{/if}
</div>
