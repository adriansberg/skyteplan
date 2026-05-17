import type { PageServerLoad } from './$types';
import { getShootersWithDistinctions } from '$lib/server/graphql/queries';
import { DEFAULT_CLUB_ID } from '$lib/constants';

export const load: PageServerLoad = async ({ url }) => {
	const raw = url.searchParams.get('c') || DEFAULT_CLUB_ID;
	const clubId = /^\d+$/.test(raw) ? raw : DEFAULT_CLUB_ID;
	try {
		const shootersWithDistinctions = await getShootersWithDistinctions(clubId);
		return { shootersWithDistinctions, clubId, error: null };
	} catch (error) {
		console.error('Error loading distinctions:', error);
		return {
			shootersWithDistinctions: [],
			clubId,
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
};
