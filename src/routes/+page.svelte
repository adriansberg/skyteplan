<script lang="ts">
	import {
		formatNorwegianDate,
		formatNorwegianTime,
		getDateLabel
	} from '$lib/utils/formatters';
	import {
		hasPartialResults,
		getEventStatus,
		groupFeltEvents,
		type EventWithShooter
	} from '$lib/utils/helpers';
	import type { PageData } from './$types';
	import Splash from '$lib/components/Splash.svelte';
	import ShooterExternalLink from '$lib/components/ShooterExternalLink.svelte';
	import EventStatusBadge from '$lib/components/EventStatusBadge.svelte';
	import { onMount } from 'svelte'
	import { navigating } from '$app/state';

	let { data }: { data: PageData } = $props()

	let shooters = $derived(data.shooters)
	let error = $derived(data.error)

	let showSplash = $state(false)
	let todaySectionElement = $state<HTMLElement | undefined>(undefined)

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

	let groupedEvents = $derived(
		(() => {
			if (!shooters) return {} as Record<string, EventWithShooter[]>
			const allEvents = groupFeltEvents(shooters)
			const seen = new Set<string>()
			const grouped: Record<string, EventWithShooter[]> = {}
			allEvents.forEach((event) => {
				const key = `${event.shooter.organizationId}-${event.name}-${event.shootingDateTime}-${event.targetNumber}-${event.relayNumber}`
				if (seen.has(key)) return
				seen.add(key)
				const dateKey = formatNorwegianDate(event.shootingDateTime)
				if (!grouped[dateKey]) grouped[dateKey] = []
				grouped[dateKey].push(event)
			})
			return grouped
		})()
	)

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
	<title>Skyteplan - Skytterinfo</title>
</svelte:head>

<Splash bind:show={showSplash} />

{#if !showSplash}
	{#if navigating.to}
		<div class="container mx-auto px-2 py-4 pt-6">
			<div class="mb-4 h-7 w-40 animate-pulse rounded bg-neutral-200"></div>
			{#each Array(4) as _, i (i)}
				<div class="mb-3 h-24 w-full animate-pulse rounded bg-neutral-200"></div>
			{/each}
		</div>
	{:else if error}
		<div class="m-6 rounded-lg border border-red-200 bg-red-50 p-6">
			<h2 class="mb-2 text-xl font-semibold text-red-800">Feil ved lasting av data:</h2>
			<span class="text-red-600">Feil: {error}</span>
		</div>
	{:else if shooters}
		<div class="container mx-auto px-2 py-4 pt-6 sm:px-4 sm:py-6 sm:pt-8">
			<div class="mb-4 sm:mb-6">
				<h1 class="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Skyteplan</h1>
			</div>

			<!-- Schedule by Date -->
			{#if Object.keys(groupedEvents).length > 0}
				<div class="space-y-4 sm:space-y-8">
					{#each Object.entries(groupedEvents) as [dateKey, events] (dateKey)}
						{@const dateLabel = getDateLabel(events[0].shootingDateTime)}
						{@const isToday = dateLabel === 'I dag'}
						<div
							use:registerTodaySection={isToday}
							style="scroll-margin-top: var(--top-bar-height)"
						>
							<!-- Date Header -->
							<div
								class="sticky z-30 bg-neutral-50 border-b border-neutral-200 px-3 py-3 sm:px-6 sm:py-4"
								style="top: var(--top-bar-height)"
							>
								<h2 class="text-xl font-bold text-neutral-900">
									{dateLabel}
									<span class="ml-1 text-xs font-normal text-neutral-600">
										({events.length} skytter{events.length !== 1 ? 'e' : ''})
									</span>
								</h2>
							</div>

							<!-- Events for this date -->
							<div class="p-3 sm:p-6">
								<div class="space-y-3 sm:space-y-4">
									{#each events as event (`${event.shooter.organizationId}-${event.name}-${event.shootingDateTime}-${event.targetNumber}-${event.relayNumber}`)}
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
														<h3 class="text-base font-semibold text-gray-900 sm:text-lg">
															{event.name}
															{event.eventType === 'FINALE' ? ' (Finale)' : ''}
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
														<EventStatusBadge {event} />
													</div>
												</div>

												<!-- Time and result in compact row -->
												<div class="flex items-center justify-between">
													<div class="text-gray-600">
														<span class="font-mono">{formatNorwegianTime(event.checkinDateTime)}</span>
													</div>
													<div class="text-right">
														{#if status === 'completed' && finalScore && finalScore.trim() !== ''}
															<div class="text-lg font-bold text-blue-600 font-mono">{finalScore}</div>
															{#if finalSeries && finalSeries.sumInner && event.name !== 'Felt'}
																<div class="text-xs text-green-600">
																	Sentrum: {finalSeries.sumInner}
																</div>
															{/if}
														{:else if status === 'ongoing' && finalScore && finalScore.trim() !== ''}
															<div class="text-sm font-medium text-blue-600 font-mono">
																{finalScore}
															</div>
														{:else if status === 'ongoing'}
															<div class="text-xs text-yellow-600 italic">Pågår...</div>
														{:else if status === 'did_not_start'}
															<div class="text-xs text-gray-400 italic">Ikke skutt</div>
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
														{#each event.subEvents as subEvent (`${subEvent.name}-${subEvent.shootingDateTime}-${subEvent.targetNumber}-${subEvent.relayNumber}`)}
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
																			<div class="text-sm font-bold text-blue-600 font-mono">
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
														{#each event.series as series (series.name)}
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
