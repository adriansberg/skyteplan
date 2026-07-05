import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScoringSvg, type ShotCoord } from '$lib/server/graphql/svgClient';

type SvgItem = { visualId: number; shots: ShotCoord[] };

// Batch proxy for per-series target SVGs. Keeps the Bearer token server-side and
// collapses N series into a single client round-trip.
export const POST: RequestHandler = async ({ request }) => {
	let body: { items?: SvgItem[] };
	try {
		body = await request.json();
	} catch {
		error(400, 'Invalid JSON');
	}

	const items = body.items;
	if (!Array.isArray(items)) error(400, 'items must be an array');
	if (items.length > 20) error(400, 'Too many items');

	const svgs = await Promise.all(
		items.map(async (item) => {
			const shots = Array.isArray(item.shots) ? item.shots : [];
			try {
				return { svg: await getScoringSvg(item.visualId, shots) };
			} catch {
				return { svg: null };
			}
		})
	);

	return json({ svgs });
};
