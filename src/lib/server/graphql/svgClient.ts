import { GraphQLClient, gql } from 'graphql-request';
import { AUTH_TOKEN } from '$env/static/private';

// Kongsberg Target Systems SVG generator — renders a target face per series from
// shot coordinates. Same Bearer token as the leonls data API. Introspection is
// disabled on this endpoint, so the query is built inline with numeric-coerced
// values (safe from injection since every value is forced through Number()).
const endpoint = 'https://api.kongsbergtargets.com/target-scoring-generator/graphql';

const svgGraphqlClient = new GraphQLClient(endpoint, {
	headers: {
		Authorization: `Bearer ${AUTH_TOKEN}`,
		'Content-Type': 'application/json'
	}
});

export type ShotCoord = { x: number; y: number };

type GetSvgLSResponse = {
	getSvgLS: {
		svg: string;
	} | null;
};

export async function getScoringSvg(visualId: number, shots: ShotCoord[]): Promise<string | null> {
	const id = Number(visualId);
	if (!Number.isFinite(id) || id <= 0) return null;

	const shotList = shots.map((s) => `{ x: ${Number(s.x)}, y: ${Number(s.y)} }`).join(', ');

	const query = gql`
		query {
			getSvgLS(targetSeries: { visualId: ${id}, shots: [ ${shotList} ] }) {
				svg
			}
		}
	`;

	const { getSvgLS } = await svgGraphqlClient.request<GetSvgLSResponse>(query);
	return getSvgLS?.svg ?? null;
}
