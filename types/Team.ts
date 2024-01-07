export interface TeamStat {
	pos: number;
	club: {
		logo: string | undefined;
		name: string;
	};
	matchesPlayed: number;
	matchesWon: number;
	matchesDrawn: number;
	matchesLost: number;
	goalScored: number;
	goalAgainst: number;
	goalDifference: number;
	points: number;
}
