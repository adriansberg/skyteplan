import { parseAsLocalTime } from './formatters';

/**
 * Check if an event has partial results (some series have results)
 * @param event - Event object with series data
 * @returns True if event has some results but not all
 */
export function hasPartialResults(event: {
	series?: Array<{ sum?: string | number; shots?: Array<unknown> }>;
}): boolean {
	return !!(
		event.series &&
		event.series.length > 0 &&
		event.series.some(
			(series) =>
				(series.sum && series.sum.toString().trim() !== '') ||
				(series.shots && series.shots.length > 0)
		)
	);
}

/**
 * Check if an event has complete results (all series have results)
 * @param event - Event object with series data
 * @returns True if all series in the event have results
 */
export function hasAllResults(event: {
	series?: Array<{ sum?: string | number; shots?: Array<unknown> }>;
}): boolean {
	return !!(
		event.series &&
		event.series.length > 0 &&
		event.series.every(
			(series) =>
				(series.sum && series.sum.toString().trim() !== '') ||
				(series.shots && series.shots.length > 0)
		)
	);
}

const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;
const EIGHT_HOURS_IN_MS = 8 * 60 * 60 * 1000;
/**
 * Determine the status of an event based on its timing and results
 * @param event - Event object with datetime and series data
 * @returns Event status: 'completed', 'ongoing', 'did_not_start', or 'upcoming'
 */
export function getEventStatus(event: {
	checkinDateTime: string;
	series?: Array<{ sum?: string | number; shots?: Array<unknown> }>;
}): 'completed' | 'ongoing' | 'did_not_start' | 'upcoming' {
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

	const timeSinceCheckin = now.getTime() - checkinTime.getTime();
	// If long time has passed since checkin time, and there are no results,
	// it's considered as did not start
	if (timeSinceCheckin > THREE_HOURS_IN_MS) {
		if (!eventHasPartialResults) {
			return 'did_not_start';
		}
	}

	// If long time has passed since checkin time, but there are only partial results,
	// it is considered completed,
	if (timeSinceCheckin > EIGHT_HOURS_IN_MS) {
		if (eventHasPartialResults && !eventHasAllResults) {
			return 'completed';
		}
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
