import type { Load } from '@sveltejs/kit';
import { getShootersByClub } from '$lib';
import { DEFAULT_CLUB_ID } from '$lib/constants';

export const load: Load = async ({ url }) => {
	// Get club ID from query parameter or use default
	const clubId = url.searchParams.get('c') || DEFAULT_CLUB_ID;
	try {
		const shooters = await getShootersByClub(clubId);
		return {
			shooters,
			clubId
		};
	} catch (error) {
		console.error('Error loading shooters:', error);
		return {
			shooters: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			clubId
		};
	}
};
