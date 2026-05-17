// Vercel env var: AUTH_TOKEN (NOT VITE_AUTH_TOKEN — rename in Vercel dashboard before deploy)
import { GraphQLClient } from 'graphql-request';
import { AUTH_TOKEN } from '$env/static/private';

const endpoint = 'https://leonls.kongsberg-ts.no/api';

export const graphqlClient = new GraphQLClient(endpoint, {
	headers: {
		Authorization: `Bearer ${AUTH_TOKEN}`,
		'Content-Type': 'application/json'
	}
});
