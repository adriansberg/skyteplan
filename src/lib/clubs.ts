export interface ClubConfig {
	clubId: string;
	name: string;
	logoPath: string;
}

const stordalen: ClubConfig = {
	clubId: '10782',
	name: 'Stordalen Skytterlag',
	logoPath: '/clubs/stordalen.jpg'
};

export const clubs: Record<string, ClubConfig> = {
	stordalen,
	// Production domain is ls.stordalen.live → subdomain slug 'ls' resolves to Stordalen
	ls: stordalen
};
