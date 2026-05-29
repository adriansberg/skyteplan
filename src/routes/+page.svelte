<script lang="ts">
	import { formatNorwegianDate, formatNorwegianTime, getDateLabel } from '$lib/utils/formatters';
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
	import Skeleton from '$lib/components/Skeleton.svelte';
	import ErrorBlock from '$lib/components/ErrorBlock.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { navigating } from '$app/state';

	let { data }: { data: PageData } = $props();

	let shooters = $derived(data.shooters);
	let error = $derived(data.error);

	let showSplash = $state(false);
	let todaySectionElement = $state<HTMLElement | undefined>(undefined);

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
			if (!shooters) return {} as Record<string, EventWithShooter[]>;
			const allEvents = groupFeltEvents(shooters);
			const seen = new SvelteSet<string>();
			const grouped: Record<string, EventWithShooter[]> = {};
			allEvents.forEach((event) => {
				const key = `${event.shooter.organizationId}-${event.name}-${event.shootingDateTime}-${event.targetNumber}-${event.relayNumber}`;
				if (seen.has(key)) return;
				seen.add(key);
				const dateKey = formatNorwegianDate(event.shootingDateTime);
				if (!grouped[dateKey]) grouped[dateKey] = [];
				grouped[dateKey].push(event);
			});
			return grouped;
		})()
	);

	onMount(() => {
		const checkAndScroll = () => {
			if (!showSplash && todaySectionElement) {
				const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				setTimeout(() => {
					todaySectionElement?.scrollIntoView({
						behavior: reducedMotion ? 'instant' : 'smooth',
						block: 'start'
					});
				}, 300);
			} else {
				setTimeout(checkAndScroll, 100);
			}
		};

		setTimeout(checkAndScroll, 100);
	});
</script>

<svelte:head>
	<title>Skyteplan - Skytterinfo</title>
</svelte:head>

<Splash bind:show={showSplash} />

{#if !showSplash}
	{#if navigating.to}
		<div class="px-4 py-6 pt-8">
			<Skeleton lines={4} variant="card" />
		</div>
	{:else if error}
		<div class="px-4 py-6">
			<ErrorBlock message={String(error)} />
		</div>
	{:else if shooters}
		<PageShell title="Skyteplan">
			{#if Object.keys(groupedEvents).length > 0}
				<div class="space-y-8">
					{#each Object.entries(groupedEvents) as [dateKey, events] (dateKey)}
						{@const dateLabel = getDateLabel(events[0].shootingDateTime)}
						{@const isToday = dateLabel === 'I dag'}
						<div
							use:registerTodaySection={isToday}
							style="scroll-margin-top: var(--top-bar-height)"
						>
							<!-- Date header — distinct bg from top bar -->
							<div
								class="sticky z-30 border-b border-frame bg-bg px-4 py-3"
								style="top: var(--top-bar-height)"
							>
								<h2 class="font-heading text-xl font-bold text-fg">
									{dateLabel}
									<span class="ml-2 text-sm font-normal text-fg-muted">
										({events.length} skytter{events.length !== 1 ? 'e' : ''})
									</span>
								</h2>
							</div>

							<div class="space-y-3 px-4 pt-4 sm:space-y-4">
								{#each events as event (`${event.shooter.organizationId}-${event.name}-${event.shootingDateTime}-${event.targetNumber}-${event.relayNumber}`)}
									{@const status = getEventStatus(event)}
									{@const finalSeries =
										event.series && event.series.length > 0
											? event.series[event.series.length - 1]
											: null}
									{@const finalScore = finalSeries?.sum?.toString() || null}

									<div class="rounded-xl bg-surface p-4 sm:p-5">
										<div class="space-y-3">
											<!-- Event header -->
											<div class="flex items-start justify-between gap-2">
												<div class="min-w-0 flex-1">
													<h3 class="text-base font-semibold text-fg sm:text-lg">
														{event.name}{event.eventType === 'FINALE'
															? ' (Finale)'
															: ''}{#if event.subEvents && event.subEvents.length > 0}<span
																class="ml-1 text-sm font-normal text-fg-muted"
																>(+{event.subEvents.length})</span
															>{/if}
													</h3>
													<div class="flex items-center gap-2">
														<p class="truncate text-base font-medium text-fg-muted">
															{event.shooter.name}
														</p>
														<ShooterExternalLink shooterName={event.shooter.name} />
													</div>
													<div class="flex items-center gap-2 text-sm text-fg-muted">
														<span>{event.shooter.defaultClassOrganizationId}</span>
														<span>·</span>
														<span>Skive {event.targetNumber}</span>
														<span>·</span>
														<span>Lag {event.relayNumber}</span>
													</div>
												</div>
												<div class="ml-2 shrink-0">
													<EventStatusBadge {event} />
												</div>
											</div>

											<!-- Time + result row -->
											<div class="flex items-center justify-between">
												<span class="font-mono text-sm text-fg-muted">
													{formatNorwegianTime(event.checkinDateTime)}
												</span>
												<div class="text-right">
													{#if status === 'completed' && finalScore && finalScore.trim() !== ''}
														<div class="font-mono text-lg font-bold text-primary">
															{finalScore}
														</div>
														{#if finalSeries && finalSeries.sumInner && event.name !== 'Felt'}
															<div class="text-ok text-sm">Sentrum: {finalSeries.sumInner}</div>
														{/if}
													{:else if status === 'ongoing' && finalScore && finalScore.trim() !== ''}
														<div class="font-mono text-base font-medium text-primary">
															{finalScore}
														</div>
													{:else if status === 'ongoing'}
														<div class="text-live text-sm italic">Pågår...</div>
													{:else if status === 'did_not_start'}
														<div class="text-sm text-fg-muted italic">Ikke skutt</div>
													{:else}
														<div class="text-sm text-fg-muted italic">Ikke startet</div>
													{/if}
												</div>
											</div>
										</div>

										<!-- Sub-events -->
										{#if event.subEvents && event.subEvents.length > 0}
											<details class="mt-3">
												<summary
													class="cursor-pointer text-sm text-primary select-none hover:underline active:opacity-70"
												>
													Vis {event.subEvents.length} del{event.subEvents.length !== 1 ? 'er' : ''}
													av {event.name}
												</summary>
												<div class="mt-3 space-y-2 border-l-2 border-frame pl-3">
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
														<div class="rounded-lg bg-bg p-2">
															<div class="flex justify-between">
																<h4 class="truncate text-sm font-medium text-fg">
																	{subEvent.name}
																</h4>
																<div class="shrink-0 text-right">
																	<div class="font-mono text-sm font-bold text-primary">
																		{subFinalScore}
																	</div>
																	{#if subFinalSeries && subFinalSeries.sumInner}
																		<div class="text-ok text-xs">{subFinalSeries.sumInner}</div>
																	{/if}
																</div>
															</div>
														</div>
													{/each}
												</div>
											</details>
										{/if}

										<!-- Detailed series results -->
										{#if hasPartialResults(event)}
											<details class="mt-3">
												<summary
													class="cursor-pointer text-sm text-primary select-none hover:underline active:opacity-70"
												>
													Vis detaljerte resultater
												</summary>
												<div class="mt-3 space-y-1">
													{#each event.series as series, si (`${series.name}-${si}`)}
														<div
															class="rounded-lg p-2 {series.seriesType === 'SUB_SERIES'
																? 'border-2 border-primary/30 bg-primary/5'
																: 'bg-bg'}"
														>
															<div class="flex items-center justify-between">
																<span class="truncate text-sm font-medium text-fg"
																	>{series.name}</span
																>
																<div class="flex shrink-0 gap-3 text-sm">
																	<span class="text-fg-muted"
																		>Total: <strong class="text-fg">{series.sum}</strong></span
																	>
																	{#if event.name !== 'Felt'}
																		<span class="text-fg-muted"
																			>Sentrum: <strong class="text-ok">{series.sumInner}</strong
																			></span
																		>
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
					{/each}
				</div>
			{:else}
				<div class="py-12 text-center">
					<p class="text-fg-muted">Ingen skytinger funnet</p>
				</div>
			{/if}
		</PageShell>
	{/if}
{/if}
