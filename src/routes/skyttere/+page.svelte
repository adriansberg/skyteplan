<script lang="ts">
	import {
		formatNorwegianDate,
		formatNorwegianTime,
		parseAsLocalTime
	} from '$lib/utils/formatters';
	import ShooterExternalLink from '$lib/components/ShooterExternalLink.svelte';
	import type { PageData } from '../skyttere/$types';

	export let data: PageData;

	$: shooters = data.shooters;
	$: error = data.error;
</script>

<svelte:head>
	<title>Skyttere - Stordalen Skytterlag</title>
</svelte:head>

{#if !shooters && !error}
	<div class="flex min-h-96 items-center justify-center">
		<div class="text-lg text-gray-600">Loading shooters data...</div>
	</div>
{:else if error}
	<div class="m-6 rounded-lg border border-red-200 bg-red-50 p-6">
		<h2 class="mb-2 text-xl font-semibold text-red-800">Error loading data:</h2>
		<span class="text-red-600">Error: {error}</span>
	</div>
{:else if shooters}
	<div class="container mx-auto px-2 py-4 pt-6 sm:px-4 sm:py-6 sm:pt-8">
		<div class="mb-4 sm:mb-6">
			<h1 class="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Skyttere</h1>
			<div class="flex items-center gap-2 text-sm text-gray-600 sm:gap-4">
				<span class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 sm:px-3 sm:text-sm">
					Skyttere: {shooters.length || 'N/A'}
				</span>
				<a
					href="/"
					class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800 transition-colors hover:bg-gray-200 sm:px-3 sm:text-sm"
				>
					← Tilbake til skyteplan
				</a>
			</div>
		</div>

		<!-- Shooters List -->
		{#if shooters.length > 0}
			<div class="grid gap-4 sm:gap-6">
				{#each shooters as shooter}
					{@const eventsWithResults = shooter.events.filter((e) =>
						e.series.every((s) => s.sum !== '')
					)}
					{@const upcomingEvents = shooter.events.filter(
						(e) => !e.resultDateTime && parseAsLocalTime(e.shootingDateTime) > new Date()
					)}
					{@const nextEvent = upcomingEvents.sort(
						(a, b) =>
							parseAsLocalTime(a.shootingDateTime).getTime() -
							parseAsLocalTime(b.shootingDateTime).getTime()
					)[0]}
					{@const eventScores = eventsWithResults
						.map((event) => {
							const lastSeries = event.series[event.series.length - 1];
							return lastSeries.sum !== ''
								? { eventName: event.name, score: lastSeries.sum }
								: undefined;
						})
						.filter(Boolean)}

					<details
						class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md sm:rounded-xl sm:shadow-lg [&_summary::-webkit-details-marker]:hidden [&_summary::marker]:hidden"
					>
						<!-- Shooter Header -->
						<summary
							class="cursor-pointer border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-3 transition-colors hover:from-blue-100 hover:to-indigo-100 sm:px-6 sm:py-4"
						>
							<div class="flex items-start justify-between">
								<div class="min-w-0 flex-1">
									<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
										<div class="flex items-center gap-2">
											<h2 class="text-lg font-semibold text-gray-900 sm:text-xl">{shooter.name}</h2>
											<ShooterExternalLink shooterName={shooter.name} />
										</div>
										<span class="w-fit rounded bg-gray-100 px-2 py-1 text-xs sm:text-sm"
											>Klasse {shooter.defaultClassOrganizationId}</span
										>
									</div>

									<!-- Mobile: Compact info display -->
									<div class="mt-2 flex flex-col items-start space-y-2">
										<!-- Next event info - compact at top -->
										{#if nextEvent}
											<div
												class="flex gap-2 rounded border border-orange-200 bg-orange-50 px-2 py-1"
											>
												<span class="text-xs font-medium text-orange-800">
													Neste: {nextEvent.name}
												</span>
												<span class="text-xs text-orange-600">
													{formatNorwegianDate(nextEvent.shootingDateTime)} kl. {formatNorwegianTime(
														nextEvent.shootingDateTime
													)}
												</span>
											</div>
										{/if}

										<!-- Always show all results -->
										<div class="flex flex-wrap items-center gap-1">
											{#if eventScores.length > 0}
												{#each eventScores as eventScore}
													<span
														class="rounded border border-green-300 bg-green-100 px-2 py-1 text-xs text-green-700"
													>
														{eventScore?.eventName}: {eventScore?.score}
													</span>
												{/each}
											{:else}
												<span class="px-2 text-xs text-gray-400 italic">Ingen resultater enda</span>
											{/if}
										</div>

										<!-- Desktop: Full info display -->
										<div class="hidden sm:block">
											<!-- Other upcoming events if any -->
											{#if upcomingEvents.length > 1}
												<div>
													<div class="mb-1 px-2 text-xs text-gray-600">Andre kommende:</div>
													<div class="flex flex-wrap gap-1">
														{#each upcomingEvents.slice(1) as upcomingEvent}
															<span
																class="ml-2 rounded border border-orange-100 bg-orange-50 px-2 py-1 text-xs text-orange-600"
															>
																{upcomingEvent.name}: {formatNorwegianDate(
																	upcomingEvent.shootingDateTime
																)} kl. {formatNorwegianTime(upcomingEvent.shootingDateTime)}
															</span>
														{/each}
													</div>
												</div>
											{/if}
										</div>

										<!-- Event count at bottom -->
										<div class="px-2 text-xs text-gray-500">
											{shooter.events.length} skyting{shooter.events.length !== 1 ? 'er' : ''} totalt
										</div>
									</div>
								</div>
								<div class="flex flex-shrink-0 items-center gap-2 sm:gap-3">
									<div
										class="hidden rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 sm:block"
									>
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
							<div class="p-3 sm:p-6">
								<div class="space-y-3 sm:space-y-4">
									{#each shooter.events as event}
										<div class="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
											<!-- Mobile: Compact layout -->
											<div class="space-y-3 sm:hidden">
												<!-- Event header -->
												<div>
													<h4 class="text-sm font-medium text-gray-900">{event.name}</h4>
													<p class="text-xs text-gray-500">
														Skive {event.targetNumber} • Lag {event.relayNumber}
													</p>
												</div>

												<!-- Compact timing -->
												<div class="text-xs text-gray-600">
													<span>{formatNorwegianTime(event.checkinDateTime)}</span>
													<span class="text-gray-400"> • </span>
													<span>{formatNorwegianDate(event.checkinDateTime)}</span>
												</div>

												<!-- Results summary -->
												{#if event.series && event.series.length > 0}
													{@const lastSeries = event.series[event.series.length - 1]}
													{#if lastSeries.sum !== ''}
														<div class="flex items-center justify-between">
															<span class="text-xs text-gray-500">Resultat:</span>
															<div class="text-right">
																<div class="text-sm font-bold text-blue-600">{lastSeries.sum}</div>
																{#if event.name !== 'Felt'}
																	<div class="text-xs text-green-600">
																		Sentrum: {lastSeries.sumInner}
																	</div>
																{/if}
															</div>
														</div>
													{/if}
												{:else}
													<div class="px-2 text-xs text-gray-400 italic">Ingen resultater enda</div>
												{/if}

												<!-- Expandable full details -->
												<details class="mt-2">
													<summary
														class="cursor-pointer text-xs text-blue-600 select-none hover:text-blue-800"
													>
														Vis alle detaljer
													</summary>
													<div class="mt-3 space-y-3 border-t border-gray-200 pt-3">
														<!-- Full timing info -->
														<div class="space-y-2 text-xs">
															<div>
																<span class="text-gray-500">Oppropstid:</span>
																<div>
																	{formatNorwegianDate(event.checkinDateTime)}, kl. {formatNorwegianTime(
																		event.checkinDateTime
																	)}
																</div>
															</div>
														</div>

														<!-- Series results -->
														{#if event.series && event.series.length > 0}
															<div>
																<h5 class="mb-2 text-xs font-medium text-gray-900">Serier</h5>
																<div class="space-y-2">
																	{#each event.series as series}
																		<div
																			class="rounded p-2 {series.seriesType === 'SUB_SERIES'
																				? 'my-4 border-2 border-blue-300 bg-blue-50'
																				: 'border border-gray-200 bg-white'}"
																		>
																			<div class="mb-1 flex items-center justify-between">
																				<span class="text-xs font-medium">{series.name}</span>
																			</div>
																			<div class="grid grid-cols-2 gap-2 text-xs">
																				<div class="flex items-center gap-1">
																					<span class="text-gray-500">Total:</span>
																					<span class="font-bold text-blue-600">{series.sum}</span>
																				</div>
																				{#if event.name !== 'Felt'}
																					<div class="flex items-center gap-1">
																						<span class="text-gray-500">Sentrum:</span>
																						<span class="font-semibold text-green-600"
																							>{series.sumInner}</span
																						>
																					</div>
																				{/if}
																			</div>
																			{#if series.shots && series.shots.length > 0}
																				<div class="mt-2 border-t border-gray-100 pt-2">
																					<div class="mb-1 text-xs text-gray-500">Skudd:</div>
																					<div class="flex flex-wrap gap-1">
																						{#each series.shots as shot}
																							<span
																								class="inline-block rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-700"
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
															</div>
														{/if}
													</div>
												</details>
											</div>

											<!-- Desktop: Original layout -->
											<div class="hidden sm:block">
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
															<div>
																{formatNorwegianDate(event.checkinDateTime)}, kl. {formatNorwegianTime(
																	event.checkinDateTime
																)}
															</div>
														</div>
													</div>

													<!-- Results -->
													<div>
														{#if event.series && event.series.length > 0}
															<h5 class="mb-2 text-sm font-medium text-gray-900">Serier</h5>
															<div class="space-y-2">
																{#each event.series as series}
																	<div
																		class="rounded p-3 {series.seriesType === 'SUB_SERIES'
																			? 'my-4 border-2 border-blue-300 bg-blue-50'
																			: 'border border-gray-200 bg-white'}"
																	>
																		<div class="mb-2 flex items-center justify-between">
																			<span class="text-sm font-medium">{series.name}</span>
																		</div>
																		<div class="grid grid-cols-2 justify-center gap-2 text-sm">
																			<div class="flex items-center gap-2">
																				<span class="text-gray-500">Total:</span>
																				<span class="text-lg font-bold text-blue-600"
																					>{series.sum}</span
																				>
																			</div>
																			{#if event.name !== 'Felt'}
																				<div class="flex items-center gap-2">
																					<span class="text-gray-500">Sentrum:</span>
																					<span class="font-semibold text-green-600"
																						>{series.sumInner}</span
																					>
																				</div>
																			{/if}
																		</div>
																		{#if series.shots && series.shots.length > 0}
																			<div class="mt-2 border-t border-gray-100 pt-2">
																				<div class="mb-1 text-xs text-gray-500">Skudd:</div>
																				<div class="flex flex-wrap gap-1">
																					{#each series.shots as shot}
																						<span
																							class="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
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
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="p-4 text-center text-gray-500 sm:p-6">
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
