import type { PageLoad } from './$types';
import { getShootersWithDistinctions } from '$lib/graphql/queries';

export const load: PageLoad = async ({ url }) => {
	// Get club ID from query parameter or use default
	const clubId = url.searchParams.get('c') || '10782';
	try {
		const shootersWithDistinctions = await getShootersWithDistinctions(clubId);

		return {
			shootersWithDistinctions,
			clubId
		};
	} catch (error) {
		console.error('Error loading distinctions:', error);
		return {
			shootersWithDistinctions: [],
			clubId
		};
	}
};
