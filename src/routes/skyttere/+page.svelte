<script lang="ts">
	import {
		formatNorwegianDate,
		formatNorwegianTime,
		parseAsLocalTime
	} from '$lib/utils/formatters';
	import ShooterExternalLink from '$lib/components/ShooterExternalLink.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';
	import ErrorBlock from '$lib/components/ErrorBlock.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import { ChevronDown } from '@lucide/svelte';
	import type { PageData } from './$types';
	import { navigating } from '$app/state';

	let { data }: { data: PageData } = $props();

	let shooters = $derived(data.shooters);
	let error = $derived(data.error);
</script>

<svelte:head>
	<title>Skyttere - Skytterinfo</title>
</svelte:head>

{#if navigating.to || (!shooters && !error)}
	<div class="px-4 py-6 pt-8">
		<Skeleton lines={5} variant="card" />
	</div>
{:else if error}
	<div class="px-4 py-6">
		<ErrorBlock message={String(error)} />
	</div>
{:else if shooters}
	<PageShell title="Skyttere" count={shooters.length}>
		{#if shooters.length > 0}
			<div class="grid gap-4 sm:gap-6">
				{#each shooters as shooter (shooter.organizationId)}
					{@const eventsWithResults = shooter.events.filter((e) =>
						e.series.every((s) => s.sum !== '')
					)}
					{@const upcomingEvents = shooter.events.filter(
						(e) => !e.resultDateTime && parseAsLocalTime(e.checkinDateTime) > new Date()
					)}
					{@const nextEvent = upcomingEvents.sort(
						(a, b) =>
							parseAsLocalTime(a.checkinDateTime).getTime() -
							parseAsLocalTime(b.checkinDateTime).getTime()
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
						class="group overflow-hidden rounded-xl bg-surface [&_summary::-webkit-details-marker]:hidden [&_summary::marker]:hidden"
					>
						<!-- Shooter header -->
						<summary class="cursor-pointer px-4 py-4 sm:px-6 sm:py-5">
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0 flex-1">
									<div class="flex flex-wrap items-center gap-2">
										<h2 class="truncate font-heading text-xl font-bold text-fg sm:text-2xl">
											{shooter.name}
										</h2>
										<ShooterExternalLink shooterName={shooter.name} />
										<span
											class="shrink-0 rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300"
										>
											Klasse {shooter.defaultClassOrganizationId}
										</span>
									</div>

									<div class="mt-2 flex flex-col gap-2">
										{#if nextEvent}
											<div
												class="inline-flex w-fit gap-2 rounded-lg bg-amber-50 px-3 py-1.5 dark:bg-amber-950"
											>
												<span class="text-sm font-medium text-amber-800 dark:text-amber-300">
													Neste: {nextEvent.name}{nextEvent.eventType === 'FINALE'
														? ' (Finale)'
														: ''}
												</span>
												<span class="font-mono text-sm text-amber-700 dark:text-amber-400">
													{formatNorwegianDate(nextEvent.checkinDateTime)} kl. {formatNorwegianTime(
														nextEvent.checkinDateTime
													)}
												</span>
											</div>
										{/if}

										<div class="flex flex-wrap gap-1.5">
											{#if eventScores.length > 0}
												{#each eventScores as eventScore, esi (`${eventScore?.eventName}-${esi}`)}
													<span
														class="rounded-md bg-green-100 px-2 py-0.5 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-400"
													>
														{eventScore?.eventName}: {eventScore?.score}
													</span>
												{/each}
											{:else}
												<span class="text-sm text-fg-muted italic">Ingen resultater enda</span>
											{/if}
										</div>

										<div class="text-sm text-fg-muted">
											{shooter.events.length} skyting{shooter.events.length !== 1 ? 'er' : ''} totalt
										</div>
									</div>
								</div>

								<span
									class="chevron mt-1 shrink-0 text-fg-muted motion-safe:transition-transform motion-safe:duration-200"
									aria-hidden="true"
								>
									<ChevronDown size={20} />
								</span>
							</div>
						</summary>

						<!-- Events list -->
						{#if shooter.events.length > 0}
							<div class="border-t border-frame px-4 py-4 sm:px-6 sm:py-5">
								<div class="space-y-3 sm:space-y-4">
									{#each shooter.events as event (`${event.name}-${event.shootingDateTime}-${event.targetNumber}-${event.relayNumber}`)}
										<div class="rounded-xl bg-bg p-4">
											<div class="grid gap-4 sm:grid-cols-3">
												<!-- Event info -->
												<div>
													<h4 class="font-medium text-fg">
														{event.name}{event.eventType === 'FINALE' ? ' (Finale)' : ''}
													</h4>
													<p class="mt-0.5 text-sm text-fg-muted">
														Skive {event.targetNumber} · Lag {event.relayNumber}
													</p>
												</div>

												<!-- Timing -->
												<div>
													<p class="text-sm text-fg-muted">Oppropstid</p>
													<p class="mt-0.5 font-mono text-sm text-fg">
														{formatNorwegianDate(event.checkinDateTime)}, kl. {formatNorwegianTime(
															event.checkinDateTime
														)}
													</p>
												</div>

												<!-- Results -->
												<div>
													{#if event.series && event.series.length > 0}
														<p class="mb-2 text-sm text-fg-muted">Serier</p>
														<div class="space-y-2">
															{#each event.series as series, si (`${series.name}-${si}`)}
																<div
																	class="rounded-lg p-2 {series.seriesType === 'SUB_SERIES'
																		? 'border-2 border-primary/30 bg-primary/5'
																		: 'bg-surface'}"
																>
																	<div class="flex items-center justify-between">
																		<span class="text-sm font-medium text-fg">{series.name}</span>
																	</div>
																	<div class="mt-1 grid grid-cols-2 gap-2 text-sm">
																		<div class="flex items-center gap-1">
																			<span class="text-fg-muted">Total:</span>
																			<span class="font-mono font-bold text-primary"
																				>{series.sum}</span
																			>
																		</div>
																		{#if event.name !== 'Felt'}
																			<div class="flex items-center gap-1">
																				<span class="text-fg-muted">Sentrum:</span>
																				<span class="text-ok font-semibold">{series.sumInner}</span>
																			</div>
																		{/if}
																	</div>
																	{#if series.shots && series.shots.length > 0}
																		<div class="mt-2 border-t border-frame pt-2">
																			<p class="mb-1 text-xs text-fg-muted">Skudd:</p>
																			<div class="flex flex-wrap gap-1">
																				{#each series.shots as shot, shi (`${shot.valueInt}.${shot.valueDec}-${shi}`)}
																					<span
																						class="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-fg"
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
														<p class="text-sm text-fg-muted italic">Ingen resultater enda</p>
													{/if}
												</div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="border-t border-frame p-4 text-center text-fg-muted sm:p-6">
								<p>Ingen skytinger planlagt</p>
							</div>
						{/if}
					</details>
				{/each}
			</div>
		{/if}
	</PageShell>
{/if}

<style>
	details[open] summary .chevron {
		transform: rotate(180deg);
	}

	details summary::-webkit-details-marker {
		display: none;
	}

	details summary::marker {
		display: none;
	}

	details summary {
		list-style: none;
	}
</style>
