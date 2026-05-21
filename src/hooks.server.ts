import type { Handle } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { clubs } from '$lib/clubs';

export const handle: Handle = async ({ event, resolve }) => {
	const hostname = event.url.hostname;
	let slug: string;

	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		const devClub = import.meta.env.VITE_DEV_CLUB;
		if (!devClub) {
			throw new Error('VITE_DEV_CLUB must be set in .env.local for local development');
		}
		slug = devClub;
	} else {
		slug = hostname.split('.')[0];
	}

	const club = clubs[slug];
	if (!club) {
		error(404, 'Siden finnes ikke');
	}

	event.locals.club = club;
	return resolve(event);
};
