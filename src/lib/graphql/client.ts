import { GraphQLClient } from 'graphql-request';

const endpoint = 'https://leonls.kongsberg-ts.no/api';

// Create a GraphQL client with default headers
export const graphqlClient = new GraphQLClient(endpoint, {
	headers: {
		Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
		'Content-Type': 'application/json'
	}
});
