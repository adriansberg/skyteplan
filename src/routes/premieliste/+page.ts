import type { PageLoad } from './$types';
import { getShootersWithDistinctions } from '$lib/graphql/queries';

export const load: PageLoad = async () => {
	try {
		// Using the same club ID as in other pages
		const clubId = '10782';
		const shootersWithDistinctions = await getShootersWithDistinctions(clubId);

		return {
			shootersWithDistinctions
		};
	} catch (error) {
		console.error('Error loading distinctions:', error);
		return {
			shootersWithDistinctions: []
		};
	}
};
