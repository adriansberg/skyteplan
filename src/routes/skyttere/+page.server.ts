import type { PageServerLoad } from './$types';
import { getShootersByClub } from '$lib/server/graphql/queries';
import { DEFAULT_CLUB_ID } from '$lib/constants';

export const load: PageServerLoad = async ({ url }) => {
	const raw = url.searchParams.get('c') || DEFAULT_CLUB_ID;
	const clubId = /^\d+$/.test(raw) ? raw : DEFAULT_CLUB_ID;
	try {
		const shooters = await getShootersByClub(clubId);
		return { shooters, clubId };
	} catch (error) {
		console.error('Error loading shooters:', error);
		return {
			shooters: null,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			clubId
		};
	}
};
