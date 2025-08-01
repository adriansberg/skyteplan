<script lang="ts">
	import type { Event, Shooter } from '$lib/graphql/types';
	import { formatNorwegianDate, formatNorwegianTime, getDateLabel } from '$lib/utils/formatters';
	import type { PageData } from './$types';

	export let data: PageData;
	
	$: shooters = data.shooters;
	$: error = data.error;

	// Helper function to determine event status
	function getEventStatus(event: Event & { shooter: Shooter }) {
		const now = new Date();
		const shootingTime = new Date(event.shootingDateTime);
		const resultTime = event.resultDateTime ? new Date(event.resultDateTime) : null;

		// Check for partial results - sum is a string, so check if it's not empty
		const hasPartialResults =
			event.series &&
			event.series.length > 0 &&
			event.series.some(
				(series) =>
					(series.sum && series.sum.toString().trim() !== '') ||
					(series.shots && series.shots.length > 0)
			);

		// If there's a result timestamp and it's in the past, event is completed
		if (resultTime && resultTime <= now) {
			return 'completed';
		}

		// If there are partial results (any series with non-empty sum), the event has started
		if (hasPartialResults) {
			return 'ongoing';
		}

		// If shooting time has passed but no results yet, it's ongoing
		if (shootingTime <= now) {
			return 'ongoing';
		}

		// Otherwise it's upcoming
		return 'upcoming';
	}

	// Process and group events by date
	$: groupedEvents = shooters
		? (() => {
				// Flatten all events with shooter info and group Felt-related events
				const allEvents: (Event & {
					shooter: Shooter;
					subEvents?: (Event & { shooter: Shooter })[];
				})[] = [];

				shooters.forEach((shooter) => {
					const feltEvent = shooter.events.find((e) => e.name === 'Felt');
					const relatedEvents = shooter.events.filter(
						(e) =>
							['Minne', 'Felthurtig', 'Stang'].includes(e.name) &&
							e.shootingDateTime === feltEvent?.shootingDateTime
					);

					shooter.events.forEach((event) => {
						if (event.name === 'Felt' && relatedEvents.length > 0) {
							// Add Felt event with sub-events
							allEvents.push({
								...event,
								shooter,
								subEvents: relatedEvents.map((e) => ({ ...e, shooter }))
							});
						} else if (
							!['Minne', 'Felthurtig', 'Stang'].includes(event.name) ||
							!feltEvent ||
							event.shootingDateTime !== feltEvent.shootingDateTime
						) {
							// Add standalone events (not part of Felt grouping)
							allEvents.push({ ...event, shooter });
						}
					});
				});

				// Sort by shooting date/time
				allEvents.sort(
					(a, b) => new Date(a.shootingDateTime).getTime() - new Date(b.shootingDateTime).getTime()
				);

				// Group by date
				const grouped: Record<
					string,
					(Event & {
						shooter: Shooter;
						subEvents?: (Event & { shooter: Shooter })[];
					})[]
				> = {};
				allEvents.forEach((event) => {
					const dateKey = formatNorwegianDate(event.shootingDateTime);
					if (!grouped[dateKey]) {
						grouped[dateKey] = [];
					}
					grouped[dateKey].push(event);
				});

				return grouped;
			})()
		: {};
</script>

<svelte:head>
	<title>Skyteplan - Stordalen Skytterlag</title>
</svelte:head>

{#if !shooters && !error}
	<div class="flex min-h-96 items-center justify-center">
		<div class="text-lg text-gray-600">Laster skyteplan...</div>
	</div>
{:else if error}
	<div class="m-6 rounded-lg border border-red-200 bg-red-50 p-6">
		<h2 class="mb-2 text-xl font-semibold text-red-800">Feil ved lasting av data:</h2>
		<span class="text-red-600">Feil: {error}</span>
	</div>
{:else if shooters}
	<div class="container mx-auto px-4 py-6">
		<div class="mb-6">
			<h1 class="mb-2 text-3xl font-bold text-gray-900">Skyteplan</h1>
			<div class="flex items-center gap-4 text-sm text-gray-600">
				<a
					href="/"
					class="rounded-full bg-gray-100 px-3 py-1 text-gray-800 transition-colors hover:bg-gray-200"
				>
					← Tilbake til skytterliste
				</a>
			</div>
		</div>

		<!-- Schedule by Date -->
		{#if Object.keys(groupedEvents).length > 0}
			<div class="space-y-8">
				{#each Object.entries(groupedEvents) as [date, events]}
					<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
						<!-- Date Header -->
						<div
							class="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4"
						>
							<h2 class="text-xl font-semibold text-gray-900">
								{getDateLabel(events[0].shootingDateTime)}
								<span class="ml-2 text-sm font-normal text-gray-600">
									({events.length} skyting{events.length !== 1 ? 'er' : ''})
								</span>
							</h2>
						</div>

						<!-- Events for this date -->
						<div class="p-6">
							<div class="space-y-4">
								{#each events as event}
									{@const status = getEventStatus(event)}
									{@const finalSeries =
										event.series && event.series.length > 0
											? event.series[event.series.length - 1]
											: null}
									{@const finalScore = finalSeries?.sum?.toString() || null}

									<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
										<div class="grid gap-4 md:grid-cols-4">
											<!-- Event & Shooter Info -->
											<div>
												<h3 class="mb-1 font-semibold text-gray-900">
													{event.name}
													{#if event.subEvents && event.subEvents.length > 0}
														<span class="ml-1 text-xs text-gray-500">
															(+ {event.subEvents.length} del{event.subEvents.length !== 1
																? 'er'
																: ''})
														</span>
													{/if}
												</h3>
												<p class="mb-1 text-sm text-gray-600">
													<span class="font-medium">{event.shooter.name}</span>
												</p>
												<p class="text-xs text-gray-500">
													{event.className}
												</p>
												<p class="text-xs text-gray-500">
													Skive {event.targetNumber} | Lag {event.relayNumber}
												</p>
											</div>

											<!-- Timing -->
											<div>
												<div class="space-y-1 text-sm">
													<div>
														<span class="text-gray-500">Opprop:</span>
														<div class="font-mono text-xs">
															kl. {formatNorwegianTime(event.checkinDateTime)}
														</div>
													</div>
													<div>
														<span class="text-gray-500">Skyting:</span>
														<div class="font-mono text-xs font-medium">
															kl. {formatNorwegianTime(event.shootingDateTime)}
														</div>
													</div>
												</div>
											</div>

											<!-- Status -->
											<div class="flex items-center">
												{#if status === 'completed'}
													<span
														class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
													>
														✓ Fullført
													</span>
												{:else if status === 'ongoing'}
													<span
														class="inline-flex animate-pulse items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800"
													>
														🔴 Pågår
													</span>
												{:else}
													<span
														class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
													>
														⏱️ Kommende
													</span>
												{/if}
											</div>

											<!-- Results -->
											<div>
												{#if status === 'completed' && finalScore && finalScore.trim() !== ''}
													<div class="text-right">
														<div class="text-sm text-gray-500">Resultat:</div>
														<div class="text-2xl font-bold text-blue-600">{finalScore}</div>
														{#if finalSeries && finalSeries.sumInner}
															<div class="text-xs text-green-600">
																Inner: {finalSeries.sumInner}
															</div>
														{/if}
													</div>
												{:else if status === 'ongoing'}
													<div class="text-right">
														<div class="text-sm text-yellow-600 italic">Skyting pågår...</div>
														{#if finalScore && finalScore.trim() !== ''}
															<div class="text-lg font-medium text-blue-600">
																Foreløpig: {finalScore}
															</div>
														{/if}
													</div>
												{:else}
													<div class="text-right">
														<div class="text-sm text-gray-400 italic">Ikke startet</div>
													</div>
												{/if}
											</div>
										</div>

										<!-- Sub-events (Minne, Felthurtig, Stang) -->
										{#if event.subEvents && event.subEvents.length > 0}
											<details class="mt-4">
												<summary
													class="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800"
												>
													Vis {event.subEvents.length} del{event.subEvents.length !== 1 ? 'er' : ''}
													av {event.name}
												</summary>
												<div class="mt-3 space-y-3 border-l-2 border-blue-200 pl-4">
													{#each event.subEvents as subEvent}
														{@const subStatus = getEventStatus(subEvent)}
														{@const subFinalSeries =
															subEvent.series && subEvent.series.length > 0
																? subEvent.series.find(
																		(s) =>
																			s.seriesType === 'SUB_SERIES' &&
																			s.sum &&
																			s.sum.toString().trim() !== ''
																	) || subEvent.series[subEvent.series.length - 1]
																: null}
														{@const subFinalScore = subFinalSeries?.sum?.toString() || null}

														<div class="rounded border bg-white p-3">
															<div class="flex items-center justify-between">
																<div>
																	<h4 class="font-medium text-gray-800">{subEvent.name}</h4>
																	<p class="text-xs text-gray-500">{subEvent.className}</p>
																</div>
																<div class="flex items-center gap-3">
																	<!-- Sub-event status -->
																	<div>
																		{#if subStatus === 'completed'}
																			<span
																				class="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
																			>
																				✓ Fullført
																			</span>
																		{:else if subStatus === 'ongoing'}
																			<span
																				class="inline-flex animate-pulse items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700"
																			>
																				🔴 Pågår
																			</span>
																		{:else}
																			<span
																				class="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
																			>
																				⏱️ Kommende
																			</span>
																		{/if}
																	</div>
																	<!-- Sub-event result -->
																	<div class="text-right">
																		{#if subStatus === 'completed' && subFinalScore && subFinalScore.trim() !== ''}
																			<div class="text-lg font-bold text-blue-600">
																				{subFinalScore}
																			</div>
																			{#if subFinalSeries && subFinalSeries.sumInner}
																				<div class="text-xs text-green-600">
																					Inner: {subFinalSeries.sumInner}
																				</div>
																			{/if}
																		{:else if subStatus === 'ongoing' && subFinalScore && subFinalScore.trim() !== ''}
																			<div class="text-sm font-medium text-blue-600">
																				{subFinalScore}
																			</div>
																		{:else}
																			<div class="text-xs text-gray-400 italic">-</div>
																		{/if}
																	</div>
																</div>
															</div>
														</div>
													{/each}
												</div>
											</details>
										{/if}

										<!-- Detailed results for completed main events -->
										{#if status === 'completed' && event.series && event.series.length > 1}
											<details class="mt-4">
												<summary class="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
													Vis detaljerte resultater for {event.name}
												</summary>
												<div class="mt-2 space-y-2">
													{#each event.series as series}
														<div class="rounded border bg-white p-2">
															<div class="flex items-center justify-between">
																<span class="text-sm font-medium">{series.name}</span>
																<div class="flex gap-4 text-sm">
																	<span>Total: <strong>{series.sum}</strong></span>
																	<span>Inner: <strong>{series.sumInner}</strong></span>
																</div>
															</div>
														</div>
													{/each}
												</div>
											</details>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-12 text-center">
				<p class="text-gray-500">Ingen skytinger funnet</p>
			</div>
		{/if}
	</div>
{/if}
