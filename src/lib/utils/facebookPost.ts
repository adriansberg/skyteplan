/**
 * Pure text-composition helpers for Facebook posts.
 *
 * These functions take shooter data and a target day and return ready-to-paste
 * plain text. They hold no UI, DOM, or fetch logic — so a future automation path
 * (Vercel Cron + +server.ts + Page Access Token) can reuse them unchanged.
 */

import { parseAsLocalTime, formatNorwegianTime } from './formatters';
import { groupFeltEvents, getEventStatus, type EventWithShooter } from './helpers';
import type { Shooter } from '$lib/graphql/types';

function isSameLocalDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

/** Local-midnight Date, stripped of time — safe to compare and key on. */
function toLocalDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** All distinct shooting days present in the schedule, ascending. */
export function getScheduleDays(shooters: Shooter[]): Date[] {
	const seen = new Map<string, Date>();
	for (const event of groupFeltEvents(shooters)) {
		const day = toLocalDay(parseAsLocalTime(event.shootingDateTime));
		const key = day.getTime().toString();
		if (!seen.has(key)) seen.set(key, day);
	}
	return [...seen.values()].sort((a, b) => a.getTime() - b.getTime());
}

/** Human date label relative to `now` — "I dag" / "I morgen" / "I går" / weekday+date. */
export function formatDayLabel(day: Date, now: Date = new Date()): string {
	const diffDays = Math.round((toLocalDay(day).getTime() - toLocalDay(now).getTime()) / 86_400_000);
	if (diffDays === 0) return 'I dag';
	if (diffDays === 1) return 'I morgen';
	if (diffDays === -1) return 'I går';
	return day.toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' });
}

function norwegianDay(day: Date): string {
	return day.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' });
}

function eventsForDay(shooters: Shooter[], day: Date): EventWithShooter[] {
	return groupFeltEvents(shooters).filter((event) =>
		isSameLocalDay(parseAsLocalTime(event.shootingDateTime), day)
	);
}

function classOf(event: EventWithShooter): string {
	return event.className || event.shooter.defaultClassOrganizationId || '';
}

function finalScoreOf(event: EventWithShooter): string | null {
	if (!event.series || event.series.length === 0) return null;
	const last = event.series[event.series.length - 1];
	const sum = last?.sum?.toString().trim();
	return sum && sum !== '' ? sum : null;
}

function innerScoreOf(event: EventWithShooter): string | null {
	// "Felt" has no meaningful inner-tens count, matching the schedule page.
	if (event.name === 'Felt' || !event.series || event.series.length === 0) return null;
	const inner = event.series[event.series.length - 1]?.sumInner?.toString().trim();
	return inner && inner !== '' ? inner : null;
}

/**
 * Morning post: everyone competing on `day`, grouped by relay, with start time,
 * class and target. Returns a friendly fallback line when nobody is scheduled.
 */
export function composeMorningPost(shooters: Shooter[], clubName: string, day: Date): string {
	const events = eventsForDay(shooters, day);
	if (events.length === 0) {
		return `Ingen skyttere satt opp ${norwegianDay(day)}.`;
	}

	const byRelay = new Map<number, EventWithShooter[]>();
	for (const event of events) {
		const arr = byRelay.get(event.relayNumber) ?? [];
		arr.push(event);
		byRelay.set(event.relayNumber, arr);
	}
	const relays = [...byRelay.keys()].sort((a, b) => a - b);

	const lines: string[] = [];
	lines.push(`🎯 ${clubName} — skyteplan ${norwegianDay(day)}`);
	lines.push('');
	lines.push(`Dagens skyttere (${events.length}):`);

	for (const relay of relays) {
		const relayEvents = byRelay.get(relay)!.sort((a, b) => a.targetNumber - b.targetNumber);
		lines.push('');
		lines.push(`Lag ${relay} — kl. ${formatNorwegianTime(relayEvents[0].shootingDateTime)}`);
		for (const event of relayEvents) {
			const cls = classOf(event);
			lines.push(
				`• ${event.shooter.name}${cls ? ` (${cls})` : ''} — ${event.name}, skive ${event.targetNumber}`
			);
		}
	}

	lines.push('');
	lines.push('Lykke til! 🎯');
	return lines.join('\n');
}

/**
 * Results post: all completed results on `day`, grouped by discipline and sorted
 * by score descending. Returns a fallback line when no results are in yet.
 */
export function composeResultsPost(shooters: Shooter[], clubName: string, day: Date): string {
	const completed = eventsForDay(shooters, day).filter(
		(event) => getEventStatus(event) === 'completed' && finalScoreOf(event)
	);
	if (completed.length === 0) {
		return `Ingen resultater klare ennå for ${norwegianDay(day)}.`;
	}

	const byDiscipline = new Map<string, EventWithShooter[]>();
	for (const event of completed) {
		const arr = byDiscipline.get(event.name) ?? [];
		arr.push(event);
		byDiscipline.set(event.name, arr);
	}

	const lines: string[] = [];
	lines.push(`🎯 ${clubName} — resultater ${norwegianDay(day)}`);

	for (const [discipline, events] of byDiscipline) {
		events.sort((a, b) => scoreValue(finalScoreOf(b)) - scoreValue(finalScoreOf(a)));
		lines.push('');
		lines.push(`${discipline}:`);
		for (const event of events) {
			const cls = classOf(event);
			const inner = innerScoreOf(event);
			lines.push(
				`• ${event.shooter.name}${cls ? ` (${cls})` : ''}: ${finalScoreOf(event)}${inner ? ` (sentrum ${inner})` : ''}`
			);
		}
	}

	lines.push('');
	lines.push('Gratulerer til alle! 🎉');
	return lines.join('\n');
}

/** Parse a score string to a number for sorting; non-numeric scores sort last. */
function scoreValue(score: string | null): number {
	const n = Number(score);
	return Number.isFinite(n) ? n : -Infinity;
}
