export type Shot = {
	valueInt: number;
	valueDec: number;
};

export type Series = {
	name: string;
	seriesType: string;
	sum: number;
	sumInner: number;
	visualId: string;
	shots: Shot[];
};

export type Event = {
	name: string;
	className: string;
	checkinDateTime: string;
	shootingDateTime: string;
	resultDateTime: string;
	relayNumber: number;
	targetNumber: number;
	series: Series[];
};

export type Shooter = {
	name: string;
	defaultClassOrganizationId: string;
	events: Event[];
};

export type GetShooterByClubResponse = {
	getShooterByClub: Shooter[];
};

export type GetShooterByClubVariables = {
	clubOrganizationId: string;
};
