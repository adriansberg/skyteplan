export type Shot = {
	valueInt: string;
	valueDec: string;
};

export type Series = {
	name: string;
	seriesType: string;
	sum: string;
	sumInner: string;
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
	organizationId: string;
	defaultClassOrganizationId: string;
	events: Event[];
};

export type Distinction = {
	name: string;
	organizationId: string;
	organizationEventId: string;
	organizationEventType: string;
	type: string;
	subType: string;
};

export type ShooterWithDistinctions = {
	name: string;
	organizationId: string;
	clubName: string;
	districtName: string;
	categories: string[];
	clubOrganizationId: string;
	defaultClassName: string;
	defaultClassOrganizationId: string;
	events: Event[];
	distinctions: Distinction[];
};

export type GetShooterByClubResponse = {
	getShooterByClub: Shooter[];
};

export type GetShooterResponse = {
	getShooter: ShooterWithDistinctions[];
};

export type GetShooterByClubVariables = {
	clubOrganizationId: string;
};

export type GetShooterVariables = {
	organizationId: string;
};
