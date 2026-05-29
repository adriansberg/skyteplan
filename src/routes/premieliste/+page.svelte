<script lang="ts">
	import ShooterExternalLink from '$lib/components/ShooterExternalLink.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import Chip from '$lib/components/Chip.svelte';
	import { navigating } from '$app/state';
	import type { ShooterWithDistinctions } from '$lib/graphql/types';
	import { SvelteMap } from 'svelte/reactivity';

	let { data } = $props();
	let shootersWithDistinctions = $derived<ShooterWithDistinctions[]>(
		data.shootersWithDistinctions ?? []
	);

	function getEventTypeName(organizationEventId: string): string {
		const eventTypeMap: Record<string, string> = {
			BA: 'Bane',
			FE: 'Felt',
			MI: 'Minne',
			ST: 'Stang',
			FH: 'Felthurtig'
		};
		return eventTypeMap[organizationEventId] || organizationEventId;
	}

	function categorizePrize(prizeName: string): 'Gavepremie' | 'Beger' | 'Medalje' {
		const nameLower = prizeName.toLowerCase();
		if (nameLower.includes('gavepr')) return 'Gavepremie';
		if (nameLower.includes('beger')) return 'Beger';
		if (nameLower.includes('medalje')) return 'Medalje';
		return 'Beger';
	}

	const prizeSummary = $derived(
		(() => {
			const summary = {
				Gavepremie: [] as Array<{ name: string; count: number; shooters: string[] }>,
				Beger: [] as Array<{ name: string; count: number; shooters: string[] }>,
				Medalje: [] as Array<{ name: string; count: number; shooters: string[] }>
			};

			const prizeMap = new SvelteMap<
				string,
				{ category: 'Gavepremie' | 'Beger' | 'Medalje'; shooters: string[] }
			>();

			shootersWithDistinctions.forEach((shooter) => {
				shooter.distinctions?.forEach((distinction) => {
					const category = categorizePrize(distinction.name);
					const key = distinction.name;
					if (!prizeMap.has(key)) prizeMap.set(key, { category, shooters: [] });
					prizeMap.get(key)!.shooters.push(shooter.name);
				});
			});

			prizeMap.forEach((value, prizeName) => {
				summary[value.category].push({
					name: prizeName,
					count: value.shooters.length,
					shooters: value.shooters
				});
			});

			Object.keys(summary).forEach((category) => {
				summary[category as keyof typeof summary].sort((a, b) => {
					if (a.count !== b.count) return b.count - a.count;
					return a.name.localeCompare(b.name);
				});
			});

			return summary;
		})()
	);

	const totalGavepremier = $derived(prizeSummary.Gavepremie.reduce((s, p) => s + p.count, 0));
	const totalBegere = $derived(prizeSummary.Beger.reduce((s, p) => s + p.count, 0));
	const totalMedaljer = $derived(prizeSummary.Medalje.reduce((s, p) => s + p.count, 0));
	const totalAll = $derived(totalGavepremier + totalBegere + totalMedaljer);
</script>

<svelte:head>
	<title>Premieliste - Skytterinfo</title>
	<meta name="description" content="Skyttere som har oppnådd premier" />
</svelte:head>

{#if navigating.to}
	<div class="px-4 py-6 pt-8">
		<Skeleton lines={4} variant="card" />
	</div>
{:else}
	<PageShell title="Premieliste">
		{#if shootersWithDistinctions.length === 0}
			<div class="rounded-xl bg-surface p-8 text-center">
				<p class="text-lg font-semibold text-fg">Ingen premier funnet</p>
				<p class="mt-2 text-fg-muted">Det ser ut som om ingen skyttere har fått premie ennå.</p>
				<p class="mt-1 text-sm text-fg-muted">
					Denne funksjonen vil vise skyttere med premier når data blir tilgjengelig.
				</p>
			</div>
		{:else}
			<!-- Shooters with distinctions -->
			<div class="space-y-4">
				{#each shootersWithDistinctions as shooter (shooter.organizationId)}
					<div class="rounded-xl bg-surface p-5">
						<div class="flex items-center gap-2">
							<h3 class="font-heading text-xl font-bold text-fg">{shooter.name}</h3>
							<ShooterExternalLink shooterName={shooter.name} />
						</div>
						<p class="mt-0.5 text-sm text-fg-muted">
							Klasse {shooter.defaultClassOrganizationId}
						</p>

						{#if shooter.distinctions && shooter.distinctions.length > 0}
							<div class="mt-3">
								<p class="mb-2 text-sm font-medium text-fg-muted">Premier:</p>
								<div class="flex flex-wrap gap-2">
									{#each shooter.distinctions as distinction (distinction.organizationId)}
										{@const category = categorizePrize(distinction.name)}
										<Chip
											tone={category === 'Gavepremie'
												? 'gold'
												: category === 'Medalje'
													? 'silver'
													: 'bronze'}
											pill
										>
											{distinction.name}{#if distinction.organizationEventId}<span
													class="ml-1 opacity-70"
													>({getEventTypeName(distinction.organizationEventId)})</span
												>{/if}
										</Chip>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Prize summary section -->
			<div class="mt-10 space-y-6">
				<h2 class="font-heading text-2xl font-bold text-fg">Sammendrag av premier</h2>

				<div class="grid gap-4 sm:grid-cols-3">
					<!-- Gavepremier -->
					<div class="rounded-xl bg-surface p-5">
						<div class="mb-3 flex items-center gap-2">
							<h3 class="font-heading text-lg font-bold text-fg">Gavepremier</h3>
							<Chip tone="gold" size="sm" pill
								>{prizeSummary.Gavepremie.length} type{prizeSummary.Gavepremie.length !== 1
									? 'r'
									: ''}</Chip
							>
						</div>
						{#if prizeSummary.Gavepremie.length > 0}
							<div class="space-y-2">
								{#each prizeSummary.Gavepremie as prize (prize.name)}
									<div class="flex items-center justify-between">
										<span class="text-sm text-fg">{prize.name}</span>
										<span class="font-mono text-sm font-semibold text-fg-muted">{prize.count}</span>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-fg-muted italic">Ingen gavepremier</p>
						{/if}
					</div>

					<!-- Begere -->
					<div class="rounded-xl bg-surface p-5">
						<div class="mb-3 flex items-center gap-2">
							<h3 class="font-heading text-lg font-bold text-fg">Begere</h3>
							<Chip tone="bronze" size="sm" pill
								>{prizeSummary.Beger.length} type{prizeSummary.Beger.length !== 1 ? 'r' : ''}</Chip
							>
						</div>
						{#if prizeSummary.Beger.length > 0}
							<div class="space-y-2">
								{#each prizeSummary.Beger as prize (prize.name)}
									<div class="flex items-center justify-between">
										<span class="text-sm text-fg">{prize.name}</span>
										<span class="font-mono text-sm font-semibold text-fg-muted">{prize.count}</span>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-fg-muted italic">Ingen begere</p>
						{/if}
					</div>

					<!-- Medaljer -->
					<div class="rounded-xl bg-surface p-5">
						<div class="mb-3 flex items-center gap-2">
							<h3 class="font-heading text-lg font-bold text-fg">Medaljer</h3>
							<Chip tone="silver" size="sm" pill
								>{prizeSummary.Medalje.length} type{prizeSummary.Medalje.length !== 1
									? 'r'
									: ''}</Chip
							>
						</div>
						{#if prizeSummary.Medalje.length > 0}
							<div class="space-y-2">
								{#each prizeSummary.Medalje as prize (prize.name)}
									<div class="flex items-center justify-between">
										<span class="text-sm text-fg">{prize.name}</span>
										<span class="font-mono text-sm font-semibold text-fg-muted">{prize.count}</span>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-fg-muted italic">Ingen medaljer</p>
						{/if}
					</div>
				</div>

				<!-- Totals strip -->
				<div class="grid grid-cols-2 gap-4 rounded-xl bg-surface p-5 sm:grid-cols-4">
					<div class="text-center">
						<div class="text-gold font-mono text-2xl font-bold">{totalGavepremier}</div>
						<div class="mt-1 text-sm text-fg-muted">Gavepremier</div>
					</div>
					<div class="text-center">
						<div class="text-bronze font-mono text-2xl font-bold">{totalBegere}</div>
						<div class="mt-1 text-sm text-fg-muted">Begere</div>
					</div>
					<div class="text-center">
						<div class="text-silver font-mono text-2xl font-bold">{totalMedaljer}</div>
						<div class="mt-1 text-sm text-fg-muted">Medaljer</div>
					</div>
					<div class="text-center">
						<div class="font-mono text-2xl font-bold text-fg">{totalAll}</div>
						<div class="mt-1 text-sm text-fg-muted">Totalt</div>
					</div>
				</div>
			</div>
		{/if}
	</PageShell>
{/if}
