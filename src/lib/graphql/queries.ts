import { gql } from 'graphql-request';
import type { GetShooterByClubResponse } from './types';
import { graphqlClient } from './client';

export async function getShootersByClub(clubId: unknown) {
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
					#     clubName
					#     categories
					#     countyName
					#     defaultClassName
					defaultClassOrganizationId
					events {
						name
						#       eventType
						#       eventSubType
						className
						checkinDateTime
						shootingDateTime
						resultDateTime
						relayNumber
						targetNumber
						series {
							name
							seriesType
							#         organizationId
							sum
							sumInner
							visualId
							shots {
								valueInt
								valueDec
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
