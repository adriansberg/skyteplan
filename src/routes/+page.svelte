<script lang="ts">
	import {
		formatNorwegianDate,
		formatNorwegianTime,
		getDateLabel,
		parseAsLocalTime,
		hasPartialResults,
		hasAllResults
	} from '$lib/utils/formatters';
	import type { PageData } from './$types';
	import Splash from '$lib/components/Splash.svelte';
	import ShooterExternalLink from '$lib/components/ShooterExternalLink.svelte';
	import type { Shooter, Event } from '$lib/graphql/types';
	import { onMount } from 'svelte';

	export let data: PageData;

	$: shooters = data.shooters;
	$: error = data.error;

	let showSplash = false;
	let todaySectionElement: HTMLElement | undefined;

	// Svelte action to register the today section element
	function registerTodaySection(element: HTMLElement, isToday: boolean) {
		if (isToday) {
			todaySectionElement = element;
		}

		return {
			update(newIsToday: boolean) {
				if (newIsToday) {
					todaySectionElement = element;
				} else if (todaySectionElement === element) {
					todaySectionElement = undefined;
				}
			}
		};
	}

	// Helper function to determine event status
	function getEventStatus(event: Event & { shooter: Shooter }) {
		const now = new Date();
		// Parse the datetime string as local time by treating it as if it has no timezone
		// This assumes the datetime strings are already in local time
		const checkinTime = parseAsLocalTime(event.checkinDateTime);

		// Use utility functions for checking results
		const eventHasPartialResults = hasPartialResults(event);
		const eventHasAllResults = hasAllResults(event);

		// If there's a result timestamp and it's in the past, event is completed
		if (eventHasAllResults) {
			return 'completed';
		}

		// If there are partial results (any series with non-empty sum), the event has started
		if (eventHasPartialResults) {
			return 'ongoing';
		}

		// If shooting time has passed but no results yet, it's ongoing
		if (checkinTime <= now) {
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
					(a, b) =>
						parseAsLocalTime(a.shootingDateTime).getTime() -
						parseAsLocalTime(b.shootingDateTime).getTime()
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

	// Auto-scroll to today's section when page loads
	onMount(() => {
		// Wait for splash screen to finish and DOM to be ready
		const checkAndScroll = () => {
			if (!showSplash && todaySectionElement) {
				// Small delay to ensure proper rendering
				setTimeout(() => {
					todaySectionElement?.scrollIntoView({
						behavior: 'smooth',
						block: 'start'
					});
				}, 300);
			} else {
				// If splash is still showing, check again after a short delay
				setTimeout(checkAndScroll, 100);
			}
		};

		// Initial check after a short delay
		setTimeout(checkAndScroll, 100);
	});
</script>

<svelte:head>
	<title>Skyteplan - Stordalen Skytterlag</title>
</svelte:head>

<Splash bind:show={showSplash} />

{#if !showSplash}
	{#if error}
		<div class="m-6 rounded-lg border border-red-200 bg-red-50 p-6">
			<h2 class="mb-2 text-xl font-semibold text-red-800">Feil ved lasting av data:</h2>
			<span class="text-red-600">Feil: {error}</span>
		</div>
	{:else if shooters}
		<div class="container mx-auto px-2 py-4 pt-6 sm:px-4 sm:py-6 sm:pt-8">
			<div class="mb-4 sm:mb-6">
				<h1 class="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Skyteplan</h1>
				<div class="flex items-center gap-2 text-sm text-gray-600 sm:gap-4">
					<a
						href="/shooters"
						class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800 transition-colors hover:bg-gray-200 sm:px-3 sm:text-sm"
					>
						Skyttere
					</a>
				</div>
			</div>

			<!-- Schedule by Date -->
			{#if Object.keys(groupedEvents).length > 0}
				<div class="space-y-4 sm:space-y-8">
					{#each Object.entries(groupedEvents) as [date, events]}
						{@const dateLabel = getDateLabel(events[0].shootingDateTime)}
						{@const isToday = dateLabel === 'I dag'}
						<div
							use:registerTodaySection={isToday}
							class="scroll-mt-20 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md sm:rounded-xl sm:shadow-lg"
						>
							<!-- Date Header -->
							<div
								class="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-3 sm:px-6 sm:py-4"
							>
								<h2 class="text-lg font-semibold text-gray-900 sm:text-xl">
									{dateLabel}
									<span class="ml-1 text-xs font-normal text-gray-600 sm:text-sm">
										({events.length} skytter{events.length !== 1 ? 'e' : ''})
									</span>
								</h2>
							</div>

							<!-- Events for this date -->
							<div class="p-3 sm:p-6">
								<div class="space-y-3 sm:space-y-4">
									{#each events as event}
										{@const status = getEventStatus(event)}
										{@const finalSeries =
											event.series && event.series.length > 0
												? event.series[event.series.length - 1]
												: null}
										{@const finalScore = finalSeries?.sum?.toString() || null}

										<div class="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
											<!-- Mobile-first compact layout -->
											<div class="space-y-3">
												<!-- Main event header - always visible -->
												<div class="flex items-start justify-between">
													<div class="min-w-0 flex-1">
														<h3 class="text-sm font-semibold text-gray-900 sm:text-lg">
															{event.name}
															{#if event.subEvents && event.subEvents.length > 0}
																<span class="ml-1 text-xs text-gray-500">
																	(+{event.subEvents.length})
																</span>
															{/if}
														</h3>
														<div class="flex items-center gap-2">
															<p class="truncate text-base font-medium text-gray-600">
																{event.shooter.name}
															</p>
															<ShooterExternalLink shooterName={event.shooter.name} />
														</div>
														<div class="flex items-center gap-2 text-xs text-gray-500">
															<span>{event.shooter.defaultClassOrganizationId}</span>
															<span>•</span>
															<span>Skive {event.targetNumber}</span>
															<span>•</span>
															<span>Lag {event.relayNumber}</span>
														</div>
													</div>
													<!-- Status badge -->
													<div class="ml-2 flex-shrink-0">
														{#if status === 'completed'}
															<span
																class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
															>
																✓
															</span>
														{:else if status === 'ongoing'}
															<span
																class="inline-flex animate-pulse items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
															>
																🎯
															</span>
														{:else}
															<span
																class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
															>
																⏱️
															</span>
														{/if}
													</div>
												</div>

												<!-- Time and result in compact row -->
												<div class="flex items-center justify-between">
													<div class="text-gray-600">
														<span>{formatNorwegianTime(event.checkinDateTime)}</span>
													</div>
													<div class="text-right">
														{#if status === 'completed' && finalScore && finalScore.trim() !== ''}
															<div class="text-lg font-bold text-blue-600">{finalScore}</div>
															{#if finalSeries && finalSeries.sumInner && event.name !== 'Felt'}
																<div class="text-xs text-green-600">
																	Sentrum: {finalSeries.sumInner}
																</div>
															{/if}
														{:else if status === 'ongoing' && finalScore && finalScore.trim() !== ''}
															<div class="text-sm font-medium text-blue-600">
																{finalScore}
															</div>
														{:else if status === 'ongoing'}
															<div class="text-xs text-yellow-600 italic">Pågår...</div>
														{:else}
															<div class="text-xs text-gray-400 italic">Ikke startet</div>
														{/if}
													</div>
												</div>
											</div>

											<!-- Sub-events (Minne, Felthurtig, Stang) -->
											{#if event.subEvents && event.subEvents.length > 0}
												<details class="mt-3">
													<summary
														class="cursor-pointer text-sm text-blue-600 select-none hover:text-blue-800"
													>
														Vis {event.subEvents.length} del{event.subEvents.length !== 1
															? 'er'
															: ''}
														av {event.name}
													</summary>
													<div class="mt-3 space-y-2 border-l-2 border-blue-200 pl-3">
														{#each event.subEvents as subEvent}
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

															<div class="rounded border bg-white p-2">
																<div class="flex justify-between">
																	<div class="min-w-0 flex-1">
																		<h4 class="truncate text-sm font-medium text-gray-800">
																			{subEvent.name}
																		</h4>
																	</div>
																	<div class="flex flex-shrink-0 items-center gap-2">
																		<!-- Sub-event result -->
																		<div class="min-w-0 text-right">
																			<div class="text-sm font-bold text-blue-600">
																				{subFinalScore}
																			</div>
																			{#if subFinalSeries && subFinalSeries.sumInner}
																				<div class="text-xs text-green-600">
																					{subFinalSeries.sumInner}
																				</div>
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
											{#if hasPartialResults(event)}
												<details class="mt-3">
													<summary
														class="cursor-pointer text-sm text-blue-600 select-none hover:text-blue-800"
													>
														Vis detaljerte resultater
													</summary>
													<div class="mt-3 space-y-1">
														{#each event.series as series}
															<div
																class="rounded p-2 {series.seriesType === 'SUB_SERIES'
																	? 'my-2 border-2 border-blue-300 bg-blue-50'
																	: 'border border-gray-200 bg-white'}"
															>
																<div class="flex items-center justify-between">
																	<span class="truncate text-sm font-medium">{series.name}</span>
																	<div class="flex flex-shrink-0 gap-3 text-xs">
																		<span>Total: <strong>{series.sum}</strong></span>
																		{#if event.name !== 'Felt'}
																			<span>Sentrum: <strong>{series.sumInner}</strong></span>
																		{/if}
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
				<div class="py-8 text-center sm:py-12">
					<p class="text-gray-500">Ingen skytinger funnet</p>
				</div>
			{/if}
		</div>
	{/if}
{/if}
