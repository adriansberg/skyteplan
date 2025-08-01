import type { Load } from '@sveltejs/kit';
import { getShootersByClub } from '$lib';

export const load: Load = async () => {
	try {
		const shooters = await getShootersByClub('10782');
		return {
			shooters
		};
	} catch (error) {
		console.error('Error loading shooters:', error);
		return {
			shooters: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
};
