<script lang="ts">
	import ShooterExternalLink from '$lib/components/ShooterExternalLink.svelte';
	import type { ShooterWithDistinctions } from '$lib/graphql/types';
	import { SvelteMap } from 'svelte/reactivity';

	let { data } = $props();
	let shootersWithDistinctions: ShooterWithDistinctions[] = data.shootersWithDistinctions || [];

	// Function to get event type name from organizationEventId
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

	// Function to categorize prizes
	function categorizePrize(prizeName: string): 'Gavepremie' | 'Beger' | 'Medalje' {
		const nameLower = prizeName.toLowerCase();

		if (nameLower.includes('gavepr')) {
			return 'Gavepremie';
		} else if (nameLower.includes('beger')) {
			return 'Beger';
		} else if (nameLower.includes('medalje')) {
			return 'Medalje';
		}

		return 'Beger';
	}

	// Calculate prize summary
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

					if (!prizeMap.has(key)) {
						prizeMap.set(key, { category, shooters: [] });
					}
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

			// Sort each category by count (descending) then by name
			Object.keys(summary).forEach((category) => {
				summary[category as keyof typeof summary].sort((a, b) => {
					if (a.count !== b.count) return b.count - a.count;
					return a.name.localeCompare(b.name);
				});
			});

			return summary;
		})()
	);
</script>

<svelte:head>
	<title>Premieliste - Stordalen Skytterlag</title>
	<meta name="description" content="Skyttere som har oppnådd premier" />
</svelte:head>

<div class="container mx-auto px-2 py-4 pt-6 sm:px-4 sm:py-6 sm:pt-8">
	<!-- Header -->
	<div class="mb-4 sm:mb-6">
		<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Premieliste</h1>
		<p class="mt-2 text-sm text-gray-600 sm:text-base">Skyttere som har oppnådd premier</p>
	</div>

	<!-- Content -->
	{#if shootersWithDistinctions.length === 0}
		<div class="rounded-lg bg-gray-50 p-6 text-center sm:p-8">
			<div class="mb-4 text-4xl">🎯</div>
			<h2 class="mb-2 text-lg font-semibold text-gray-900">Ingen premier funnet</h2>
			<p class="text-gray-600">Det ser ut som om ingen skyttere har fått premie ennå.</p>
			<p class="mt-2 text-sm text-gray-500">
				Denne funksjonen vil vise skyttere med premier når data blir tilgjengelig.
			</p>
		</div>
	{:else}
		<!-- Shooters with distinctions list -->
		<div class="space-y-4">
			{#each shootersWithDistinctions as shooter (shooter.organizationId)}
				<div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h3 class="text-lg font-semibold text-gray-900">{shooter.name}</h3>
								<ShooterExternalLink shooterName={shooter.name} />
							</div>
							<div class="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
								<span>Klasse {shooter.defaultClassOrganizationId}</span>
							</div>
						</div>
					</div>

					<!-- Distinctions -->
					{#if shooter.distinctions && shooter.distinctions.length > 0}
						<div class="mt-4">
							<h4 class="mb-2 text-sm font-medium text-gray-700">Premier:</h4>
							<div class="flex flex-wrap gap-2">
								{#each shooter.distinctions as distinction (distinction.organizationId)}
									<span
										class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"
									>
										🏆 {distinction.name}
										{#if distinction.organizationEventId}
											<span class="ml-1 text-yellow-600">
												({getEventTypeName(distinction.organizationEventId)})
											</span>
										{/if}
									</span>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Prize Summary Section -->
		<div class="mt-8 border-t border-gray-200 pt-8">
			<h2 class="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">Sammendrag av premier</h2>

			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<!-- Gavepriser -->
				<div class="rounded-lg border border-gray-200 bg-white p-4">
					<div class="mb-4 flex items-center gap-2">
						<span class="text-2xl">🎁</span>
						<h3 class="text-lg font-semibold text-gray-900">Gavepremier</h3>
						<span class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
							{prizeSummary.Gavepremie.length}
							{prizeSummary.Gavepremie.length > 1 ? 'typer' : 'type'}
						</span>
					</div>
					{#if prizeSummary.Gavepremie.length > 0}
						<div class="space-y-2">
							{#each prizeSummary.Gavepremie as prize (prize.name)}
								<div class="flex items-center justify-between text-sm">
									<span class="text-gray-700">{prize.name}</span>
									<span
										class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
									>
										{prize.count}
									</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-gray-500 italic">Ingen gavepremier</p>
					{/if}
				</div>

				<!-- Begere -->
				<div class="rounded-lg border border-gray-200 bg-white p-4">
					<div class="mb-4 flex items-center gap-2">
						<span class="text-2xl">🏆</span>
						<h3 class="text-lg font-semibold text-gray-900">Begere</h3>
						<span class="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
							{prizeSummary.Beger.length}
							{prizeSummary.Beger.length > 1 ? 'typer' : 'type'}
						</span>
					</div>
					{#if prizeSummary.Beger.length > 0}
						<div class="space-y-2">
							{#each prizeSummary.Beger as prize (prize.name)}
								<div class="flex items-center justify-between text-sm">
									<span class="text-gray-700">{prize.name}</span>
									<span
										class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
									>
										{prize.count}
									</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-gray-500 italic">Ingen begere</p>
					{/if}
				</div>

				<!-- Medaljer -->
				<div class="rounded-lg border border-gray-200 bg-white p-4">
					<div class="mb-4 flex items-center gap-2">
						<span class="text-2xl">🥇</span>
						<h3 class="text-lg font-semibold text-gray-900">Medaljer</h3>
						<span class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
							{prizeSummary.Medalje.length}
							{prizeSummary.Medalje.length > 1 ? 'typer' : 'type'}
						</span>
					</div>
					{#if prizeSummary.Medalje.length > 0}
						<div class="space-y-2">
							{#each prizeSummary.Medalje as prize (prize.name)}
								<div class="flex items-center justify-between text-sm">
									<span class="text-gray-700">{prize.name}</span>
									<span
										class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
									>
										{prize.count}
									</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-gray-500 italic">Ingen medaljer</p>
					{/if}
				</div>
			</div>

			<!-- Total Statistics -->
			<div class="mt-6 rounded-lg bg-gray-50 p-4">
				<h4 class="mb-2 font-medium text-gray-900">Totalt</h4>
				<div class="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
					<div class="text-center">
						<div class="text-lg font-bold text-blue-600">
							{prizeSummary.Gavepremie.reduce((sum, p) => sum + p.count, 0)}
						</div>
						<div class="text-gray-600">Gavepremier</div>
					</div>
					<div class="text-center">
						<div class="text-lg font-bold text-yellow-600">
							{prizeSummary.Beger.reduce((sum, p) => sum + p.count, 0)}
						</div>
						<div class="text-gray-600">Begere</div>
					</div>
					<div class="text-center">
						<div class="text-lg font-bold text-green-600">
							{prizeSummary.Medalje.reduce((sum, p) => sum + p.count, 0)}
						</div>
						<div class="text-gray-600">Medaljer</div>
					</div>
					<div class="text-center">
						<div class="text-lg font-bold text-gray-900">
							{Object.values(prizeSummary).reduce(
								(total, category) => total + category.reduce((sum, p) => sum + p.count, 0),
								0
							)}
						</div>
						<div class="text-gray-600">Totalt</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
