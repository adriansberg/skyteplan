<script lang="ts">
	import { onMount } from 'svelte';
	import ShooterExternalLink from '$lib/components/ShooterExternalLink.svelte';
	import type { ShooterWithDistinctions } from '$lib/graphql/types';

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
								{#each shooter.distinctions as distinction}
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
	{/if}
</div>
