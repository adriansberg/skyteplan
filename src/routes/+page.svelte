<script lang="ts">
	import { useQuery } from '@sveltestack/svelte-query';
	import { getShootersByClub } from '$lib';

	// Use svelte-query with the GraphQL client that has built-in auth headers
	const shooters = useQuery('shooters', () => getShootersByClub('10782'));


	// Helper function to format dates with leading zeros
	function formatNorwegianDate(date: string) {
		const d = new Date(date);
		const day = d.getDate().toString().padStart(2, '0');
		const month = (d.getMonth() + 1).toString().padStart(2, '0');
		const year = d.getFullYear();
		return `${day}.${month}.${year}`;
	}

	// Helper function to format time in Norwegian format
	function formatNorwegianTime(date: string) {
		return new Date(date).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
	}
</script>

{#if $shooters.status === 'loading'}
	<div class="flex min-h-96 items-center justify-center">
		<div class="text-lg text-gray-600">Loading shooters data...</div>
	</div>
{:else if $shooters.status === 'error'}
	<div class="m-6 rounded-lg border border-red-200 bg-red-50 p-6">
		<h2 class="mb-2 text-xl font-semibold text-red-800">Error loading data:</h2>
		<span class="text-red-600">Error: {$shooters.error}</span>
	</div>
{:else if $shooters.data}
	<div class="container mx-auto px-4 py-6">
		<div class="mb-6">
			<h1 class="mb-2 text-3xl font-bold text-gray-900">Stordalen Skytterlag</h1>
			<div class="flex items-center gap-4 text-sm text-gray-600">
				<span class="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
					Skyttere: {$shooters.data.length || 'N/A'}
				</span>
				<a
					href="/schedule"
					class="rounded-full bg-gray-100 px-3 py-1 text-gray-800 transition-colors hover:bg-gray-200"
				>
					📅 Skyteplan
				</a>
				{#if $shooters.isFetching}
					<span class="animate-pulse rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
						Oppdaterer...
					</span>
				{/if}
			</div>
		</div>

		<!-- Shooters List -->
		{#if $shooters.data.length > 0}
			<div class="grid gap-6">
				{#each $shooters.data as shooter}
					{@const eventsWithResults = shooter.events.filter((e) => e.series && e.series.length > 0)}
					{@const upcomingEvents = shooter.events.filter(
						(e) => !e.resultDateTime && new Date(e.shootingDateTime) > new Date()
					)}
					{@const eventScores = eventsWithResults
						.map((event) => {
							const lastSeries = event.series[event.series.length - 1];
							return lastSeries.sum > 0
								? { eventName: event.name, score: lastSeries.sum }
								: undefined;
						})
						.filter(Boolean)}

					<details
						class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg [&_summary::-webkit-details-marker]:hidden [&_summary::marker]:hidden"
					>
						<!-- Shooter Header -->
						<summary
							class="cursor-pointer border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 transition-colors hover:from-blue-100 hover:to-indigo-100"
						>
							<div class="flex items-center justify-between">
								<div class="flex-1">
									<div class="flex items-center gap-3">
										<h2 class="text-xl font-semibold text-gray-900">{shooter.name}</h2>
										<span class="rounded bg-gray-100 px-2 py-1 font-mono"
											>{shooter.defaultClassOrganizationId}</span
										>
									</div>
									<div class="mt-2 flex flex-col flex-wrap gap-3">
										<!-- Upcoming Events -->
										{#if upcomingEvents.length > 0}
											<div class="flex flex-col gap-2">
												<div class="flex flex-wrap gap-2">
													{#each upcomingEvents as upcomingEvent}
														<div class="rounded-lg border border-orange-200 bg-orange-50 p-2">
															<div class="text-sm font-medium text-orange-800">
																{upcomingEvent.name}
															</div>
															<div class="text-xs text-orange-600">
																{formatNorwegianDate(upcomingEvent.shootingDateTime)} kl. {formatNorwegianTime(
																	upcomingEvent.shootingDateTime
																)}
															</div>
														</div>
													{/each}
												</div>
											</div>
										{/if}
										<!-- Results Summary -->
										{#if eventsWithResults.length > 0}
											<div class="flex items-center gap-2">
												{#if eventScores.length > 1}
													<div class="flex flex-wrap gap-1">
														{#each eventScores as eventScore}
															<span
																class="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700"
															>
																{eventScore?.eventName}: {eventScore?.score}
															</span>
														{/each}
													</div>
												{/if}
											</div>
										{/if}
									</div>
								</div>
								<div class="flex items-center gap-3">
									<div class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
										{shooter.events.length} skyting{shooter.events.length !== 1 ? 'er' : ''}
									</div>
									<div class="flex h-6 w-6 items-center justify-center">
										<span class="arrow text-gray-400 transition-transform duration-200"> ▼ </span>
									</div>
								</div>
							</div>
						</summary>

						<!-- Events List -->
						{#if shooter.events.length > 0}
							<div class="p-6">
								<h3 class="mb-4 text-lg font-medium text-gray-900">Events & Results</h3>
								<div class="space-y-4">
									{#each shooter.events as event}
										<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
											<div class="grid gap-4 md:grid-cols-3">
												<!-- Event Info -->
												<div>
													<h4 class="mb-2 font-medium text-gray-900">{event.name}</h4>
													<p class="mb-1 text-sm text-gray-600">
														<span class="font-medium">{event.className}</span>
													</p>
													<p class="text-sm text-gray-600">
														Skive: <span class="font-medium">{event.targetNumber}</span> | Lag:
														<span class="font-medium">{event.relayNumber}</span>
													</p>
												</div>

												<!-- Timing Info -->
												<div class="space-y-2">
													<div class="text-sm">
														<div class="text-gray-500">Oppropstid:</div>
														<div class="rounded border bg-white px-2 py-1 font-mono text-xs">
															{formatNorwegianDate(event.checkinDateTime)}, kl. {formatNorwegianTime(
																event.checkinDateTime
															)}
														</div>
													</div>
													<div class="text-sm">
														<div class="text-gray-500">Skytetid:</div>
														<div class="rounded border bg-white px-2 py-1 font-mono text-xs">
															{formatNorwegianDate(event.shootingDateTime)}, kl. {formatNorwegianTime(
																event.shootingDateTime
															)}
														</div>
													</div>
													{#if event.resultDateTime}
														<div class="text-sm">
															<div class="text-gray-500">Results:</div>
															<div
																class="rounded border border-green-200 bg-green-50 px-2 py-1 font-mono text-xs"
															>
																{formatNorwegianDate(event.resultDateTime)} kl. {formatNorwegianTime(
																	event.resultDateTime
																)}
															</div>
														</div>
													{/if}
												</div>

												<!-- Results -->
												<div>
													{#if event.series && event.series.length > 0}
														<h5 class="mb-2 text-sm font-medium text-gray-900">Series Results</h5>
														<div class="space-y-2">
															{#each event.series as series}
																<div class="rounded border border-gray-200 bg-white p-3">
																	<div class="mb-2 flex items-center justify-between">
																		<span class="text-sm font-medium">{series.name}</span>
																	</div>
																	<div class="grid grid-cols-2 gap-2 text-sm">
																		<div>
																			<span class="text-gray-500">Total:</span>
																			<span class="text-lg font-bold text-blue-600"
																				>{series.sum}</span
																			>
																		</div>
																		<div>
																			<span class="text-gray-500">Inner:</span>
																			<span class="font-semibold text-green-600"
																				>{series.sumInner}</span
																			>
																		</div>
																	</div>
																	{#if series.shots && series.shots.length > 0}
																		<div class="mt-2 border-t border-gray-100 pt-2">
																			<div class="mb-1 text-xs text-gray-500">Shots:</div>
																			<div class="flex flex-wrap gap-1">
																				{#each series.shots as shot}
																					<span
																						class="inline-block rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700"
																					>
																						{shot.valueInt}.{shot.valueDec}
																					</span>
																				{/each}
																			</div>
																		</div>
																	{/if}
																</div>
															{/each}
														</div>
													{:else}
														<div class="text-sm text-gray-500 italic">No results yet</div>
													{/if}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="p-6 text-center text-gray-500">
								<p>No events scheduled</p>
							</div>
						{/if}
					</details>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	details[open] summary .arrow {
		transform: rotate(180deg);
	}

	/* Hide default details markers across all browsers */
	details summary::-webkit-details-marker {
		display: none;
	}

	details summary::marker {
		display: none;
	}

	/* Firefox specific - hide the details marker */
	details summary::-moz-list-bullet {
		list-style-type: none;
		display: none;
	}

	/* Additional fallback for Firefox */
	details summary {
		list-style: none;
	}
</style>
