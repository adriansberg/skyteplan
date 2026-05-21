export interface ClubConfig {
	clubId: string
	name: string
	logoPath: string
}

export const clubs: Record<string, ClubConfig> = {
	stordalen: {
		clubId: '10782',
		name: 'Stordalen Skytterlag',
		logoPath: '/clubs/stordalen.jpg'
	}
}
