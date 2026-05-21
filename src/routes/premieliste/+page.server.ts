import type { PageServerLoad } from './$types';
import { getShootersWithDistinctions } from '$lib/server/graphql/queries';

export const load: PageServerLoad = async ({ locals }) => {
	const { clubId } = locals.club;
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
