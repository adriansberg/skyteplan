import type { Event, Series } from '$lib/graphql/types';

// Event name -> lsres discipline code used in the PNG card URL.
const DISCIPLINE_BY_NAME: Record<string, string> = {
	Bane: 'BA',
	Felt: 'FE',
	Minne: 'MI',
	Stang: 'ST',
	Felthurtig: 'FH',
	Samlagsskyting: 'SM',
	Lagskyting: 'LA'
};

export function disciplineCode(eventName: string): string | null {
	return DISCIPLINE_BY_NAME[eventName] ?? null;
}

export function roundCode(eventType: Event['eventType']): 'IN' | 'FI' {
	return eventType === 'FINALE' ? 'FI' : 'IN';
}

// Competition year from the event timestamps (year-scoped lsres host).
export function cardYear(event: Event): string | null {
	const raw = event.shootingDateTime || event.checkinDateTime || '';
	const match = raw.match(/^(\d{4})/);
	return match ? match[1] : null;
}

// Whole-card PNG URL via our proxy. null when the event can't be addressed.
export function pngCardUrl(event: Event, shooterOrgId: string): string | null {
	const year = cardYear(event);
	const disc = disciplineCode(event.name);
	if (!year || !disc) return null;
	const params = new URLSearchParams({
		year,
		org: shooterOrgId,
		disc,
		round: roundCode(event.eventType)
	});
	return `/api/card/png?${params.toString()}`;
}

// Series that can be rendered as an SVG target (has shots with coordinates and a
// valid visualId — visualId 0 is rejected by the generator).
export function svgEligibleSeries(event: Event): Series[] {
	return event.series.filter(
		(s) =>
			Number(s.visualId) > 0 &&
			Array.isArray(s.shots) &&
			s.shots.some((shot) => shot.x != null && shot.y != null)
	);
}

// Does this event have any renderable card at all?
export function hasCard(event: Event, shooterOrgId: string): boolean {
	if (event.svgScoringCard) return svgEligibleSeries(event).length > 0;
	// PNG side: only worth offering once results exist.
	const hasResults = event.series.some((s) => s.sum !== '');
	return hasResults && pngCardUrl(event, shooterOrgId) !== null;
}
