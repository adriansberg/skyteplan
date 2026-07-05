import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const DISCIPLINES = new Set(['BA', 'FE', 'MI', 'ST', 'FH', 'SM', 'LA']);
const ROUNDS = new Set(['IN', 'FI']);

// Proxy for lsres whole-card PNGs. Adds the Referer header the upstream requires
// (direct <img> hotlinking is blocked with 403) and hides it from the client.
// Upstream is also rate-limited, so responses are cached aggressively.
export const GET: RequestHandler = async ({ url, fetch }) => {
	const year = url.searchParams.get('year') ?? '';
	const org = url.searchParams.get('org') ?? '';
	const disc = url.searchParams.get('disc') ?? '';
	const round = url.searchParams.get('round') ?? '';

	if (!/^\d{4}$/.test(year)) error(400, 'Invalid year');
	if (!/^\d+$/.test(org)) error(400, 'Invalid org');
	if (!DISCIPLINES.has(disc)) error(400, 'Invalid discipline');
	if (!ROUNDS.has(round)) error(400, 'Invalid round');

	const host = `https://${year}.lsres.no`;
	const upstream = `${host}/shooter/${org}/graphics/${disc}/${round}`;

	const res = await fetch(upstream, {
		headers: {
			Referer: `${host}/`,
			'User-Agent': 'Mozilla/5.0'
		}
	});

	if (!res.ok) {
		// 404 = no card for this shooter/discipline (normal). Surface as 404.
		error(res.status === 404 ? 404 : 502, 'Card unavailable');
	}

	const body = await res.arrayBuffer();
	return new Response(body, {
		headers: {
			'Content-Type': res.headers.get('content-type') ?? 'image/png',
			'Cache-Control': 'public, max-age=300, s-maxage=3600'
		}
	});
};
