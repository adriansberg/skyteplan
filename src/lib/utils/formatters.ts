/**
 * Utility functions for formatting dates and times in Norwegian format
 */

/**
 * Parse a date string as local time, avoiding UTC interpretation issues.
 * Removes timezone indicators to ensure the date is interpreted in local time.
 * @param dateString - ISO date string that might have UTC timezone indicator
 * @returns Date object parsed in local time
 */
export function parseAsLocalTime(dateString: string): Date {
	// Remove timezone indicators (Z, +00:00, etc.) to force local time interpretation
	return new Date(dateString.replace(/Z$|[+-]\d{2}:\d{2}$/, ''));
}

/**
 * Format dates with leading zeros in Norwegian format (DD.MM.YYYY)
 * @param date - ISO date string
 * @returns Formatted date string
 */
export function formatNorwegianDate(date: string): string {
	const d = parseAsLocalTime(date);
	return d
		.toLocaleDateString('nb-NO', {
			month: 'short',
			day: 'numeric'
		})
		.padStart(2, '0');
}

/**
 * Format time in Norwegian format (HH:MM)
 * @param date - ISO date string
 * @returns Formatted time string
 */
export function formatNorwegianTime(date: string): string {
	const d = parseAsLocalTime(date);
	const hours = d.getHours().toString().padStart(2, '0');
	const minutes = d.getMinutes().toString().padStart(2, '0');
	return `${hours}:${minutes}`;
}

/**
 * Get relative date label (I dag, I morgen, I går, or formatted date)
 * @param date - ISO date string
 * @returns Relative date label in Norwegian
 */
export function getDateLabel(date: string): string {
	const eventDate = parseAsLocalTime(date);
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);

	// Reset time for comparison using local time methods
	const eventDateOnly = new Date(
		eventDate.getFullYear(),
		eventDate.getMonth(),
		eventDate.getDate()
	);
	const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
	const yesterdayOnly = new Date(
		yesterday.getFullYear(),
		yesterday.getMonth(),
		yesterday.getDate()
	);

	if (eventDateOnly.getTime() === todayOnly.getTime()) {
		return 'I dag';
	} else if (eventDateOnly.getTime() === tomorrowOnly.getTime()) {
		return 'I morgen';
	} else if (eventDateOnly.getTime() === yesterdayOnly.getTime()) {
		return 'I går';
	} else {
		return formatNorwegianDate(date);
	}
}
