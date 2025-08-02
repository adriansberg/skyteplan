import type { Load } from '@sveltejs/kit';
import { getShootersByClub } from '$lib';

export const load: Load = async ({ url }) => {
	// Get club ID from query parameter or use default
	const clubId = url.searchParams.get('c') || '10782';
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
