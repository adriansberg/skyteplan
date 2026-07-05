import { gql } from 'graphql-request';
import type {
	GetShooterByClubResponse,
	GetShooterResponse,
	ShooterWithDistinctions
} from '$lib/graphql/types';
import { graphqlClient } from './client';

export async function getShootersByClub(clubId: string) {
	const { getShooterByClub: data } = await graphqlClient.request<GetShooterByClubResponse>(
		gql`
			query GetShooterByClub($clubId: String!) {
				getShooterByClub(
					clubOrganizationId: $clubId
					includeShootersWithoutResults: true
					limit: 100
					fromDate: "2017-01-01"
					toDate: "2030-12-31"
				) {
					name
					organizationId
					defaultClassOrganizationId
					events {
						name
						eventType
						svgScoringCard
						className
						checkinDateTime
						shootingDateTime
						resultDateTime
						relayNumber
						targetNumber
						series {
							name
							seriesType
							sum
							sumInner
							visualId
							shots {
								valueInt
								valueDec
								x
								y
								visualId
							}
						}
					}
				}
			}
		`,
		{ clubId }
	);

	return data;
}

export async function getShooterWithDistinctions(
	organizationId: string
): Promise<ShooterWithDistinctions> {
	const { getShooter: data } = await graphqlClient.request<GetShooterResponse>(
		gql`
			query GetShooter($organizationId: String!) {
				getShooter(organizationId: $organizationId) {
					name
					organizationId
					clubName
					districtName
					categories
					clubOrganizationId
					defaultClassName
					defaultClassOrganizationId
					distinctions {
						name
						organizationId
						organizationEventId
						organizationEventType
						type
						subType
					}
				}
			}
		`,
		{ organizationId }
	);

	return data[0];
}

export async function getShootersWithDistinctions(clubId: string) {
	try {
		// First get all shooters from the club
		const shooters = await getShootersByClub(clubId);

		// Then get detailed information for each shooter to check for distinctions
		const shootersWithDistinctions: ShooterWithDistinctions[] = [];

		// Process shooters in parallel for better performance
		const promises = shooters.map(async (shooter) => {
			try {
				const shooterWithDistinctions = await getShooterWithDistinctions(shooter.organizationId);
				if (
					shooterWithDistinctions.distinctions &&
					shooterWithDistinctions.distinctions.length > 0
				) {
					return shooterWithDistinctions;
				}
			} catch (error) {
				console.warn(`Failed to get distinctions for shooter ${shooter.name}:`, error);
			}
			return null;
		});

		// Wait for all promises to resolve and filter out null results
		const results = await Promise.all(promises);
		shootersWithDistinctions.push(
			...results.filter((shooter): shooter is ShooterWithDistinctions => shooter !== null)
		);

		return shootersWithDistinctions;
	} catch (error) {
		console.error('Error getting shooters with distinctions:', error);
		return [];
	}
}
