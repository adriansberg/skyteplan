import type { PageServerLoad } from './$types';
import { getShootersByClub } from '$lib/server/graphql/queries';

export const load: PageServerLoad = async ({ locals }) => {
	const { clubId } = locals.club;
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
