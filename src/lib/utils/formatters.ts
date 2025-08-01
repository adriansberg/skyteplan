/**
 * Utility functions for formatting dates and times in Norwegian format
 */

/**
 * Format dates with leading zeros in Norwegian format (DD.MM.YYYY)
 * @param date - ISO date string
 * @returns Formatted date string
 */
export function formatNorwegianDate(date: string): string {
	// Parse the date string and format manually since timestamps are already in local time
	const d = new Date(date);
	return d
		.toLocaleDateString('nb-NO', {
			month: 'short',
			day: 'numeric'
		})
		.padStart(2, '0');
}

/**
 * Format dates using local timezone (legacy method - may have timezone offset issues)
 * @param date - ISO date string
 * @returns Formatted date string
 * @deprecated Use formatNorwegianDate instead for consistent timezone handling
 */
export function formatNorwegianDateLocal(date: string): string {
	const d = new Date(date);
	const day = d.getDate().toString().padStart(2, '0');
	const month = (d.getMonth() + 1).toString().padStart(2, '0');
	const year = d.getFullYear();
	return `${day}.${month}.${year}`;
}

/**
 * Format time in Norwegian format (HH:MM)
 * @param date - ISO date string
 * @returns Formatted time string
 */
export function formatNorwegianTime(date: string): string {
	// Parse the date string and format manually since timestamps are already in local time
	const d = new Date(date);
	const hours = d.getUTCHours().toString().padStart(2, '0');
	const minutes = d.getUTCMinutes().toString().padStart(2, '0');
	return `${hours}:${minutes}`;
}

/**
 * Format time using locale string (legacy method - may have timezone offset issues)
 * @param date - ISO date string
 * @returns Formatted time string
 * @deprecated Use formatNorwegianTime instead for consistent timezone handling
 */
export function formatNorwegianTimeLocale(date: string): string {
	return new Date(date).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get relative date label (I dag, I morgen, I går, or formatted date)
 * @param date - ISO date string
 * @returns Relative date label in Norwegian
 */
export function getDateLabel(date: string): string {
	const eventDate = new Date(date);
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(today.getDate() + 1);
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);

	// Reset time for comparison using UTC methods since timestamps are in local time
	const eventDateOnly = new Date(
		eventDate.getUTCFullYear(),
		eventDate.getUTCMonth(),
		eventDate.getUTCDate()
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
