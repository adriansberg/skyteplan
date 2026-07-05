<script lang="ts">
	import type { Event } from '$lib/graphql/types';
	import { hasCard, svgEligibleSeries, pngCardUrl } from '$lib/utils/cards';

	let { event, shooterOrgId }: { event: Event; shooterOrgId: string } = $props();

	let open = $state(false);
	let loading = $state(false);
	let failed = $state(false);
	// SVG mode: one rendered svg string per eligible series (aligned by index).
	let svgs = $state<(string | null)[] | null>(null);

	const isSvg = $derived(event.svgScoringCard);
	const eligible = $derived(isSvg ? svgEligibleSeries(event) : []);
	const pngUrl = $derived(!isSvg ? pngCardUrl(event, shooterOrgId) : null);
	const available = $derived(hasCard(event, shooterOrgId));

	async function loadSvgs() {
		if (svgs || loading) return;
		loading = true;
		failed = false;
		try {
			const items = eligible.map((s) => ({
				visualId: Number(s.visualId),
				shots: s.shots
					.filter((shot) => shot.x != null && shot.y != null)
					.map((shot) => ({ x: shot.x as number, y: shot.y as number }))
			}));
			const res = await fetch('/api/card/svg', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items })
			});
			if (!res.ok) throw new Error('svg fetch failed');
			const data = (await res.json()) as { svgs: { svg: string | null }[] };
			svgs = data.svgs.map((d) => d.svg);
		} catch {
			failed = true;
		} finally {
			loading = false;
		}
	}

	function toggle() {
		open = !open;
		if (open && isSvg) loadSvgs();
	}

	function svgSrc(svg: string): string {
		return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
	}
</script>

{#if available}
	<div class="mt-3 border-t border-gray-100 pt-3">
		<button
			type="button"
			onclick={toggle}
			class="text-xs font-medium text-blue-600 hover:text-blue-800"
		>
			{open ? 'Skjul grafisk skytekort' : 'Vis grafisk skytekort'}
		</button>

		{#if open}
			<div class="mt-3">
				{#if isSvg}
					{#if loading}
						<div class="text-xs text-gray-400 italic">Laster skyteskiver…</div>
					{:else if failed}
						<div class="text-xs text-red-500 italic">Kunne ikke laste skyteskiver</div>
					{:else if svgs}
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
							{#each eligible as series, i (`${series.name}-${i}`)}
								{@const svg = svgs[i]}
								{#if svg}
									<figure class="rounded border border-gray-200 bg-white p-2">
										<img
											class="mx-auto w-full max-w-[160px]"
											src={svgSrc(svg)}
											alt="Skive {series.name}"
										/>
										<figcaption class="mt-1 text-center text-xs text-gray-600">
											{series.name}
											{#if series.sum}<span class="font-mono font-semibold text-blue-600"
													>· {series.sum}</span
												>{/if}
										</figcaption>
									</figure>
								{/if}
							{/each}
						</div>
					{/if}
				{:else if pngUrl}
					<img
						class="mx-auto w-full max-w-md rounded border border-gray-200 bg-white"
						src={pngUrl}
						loading="lazy"
						alt="Skyteskive {event.name}"
						onerror={() => (failed = true)}
					/>
					{#if failed}
						<div class="mt-1 text-xs text-red-500 italic">Skyteskive ikke tilgjengelig</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
{/if}
