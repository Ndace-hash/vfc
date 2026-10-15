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

// A row of the Supabase `teams` table
export interface Team {
	id: string;
	name: string;
	// empty or null until a crest is added
	crest_url: string | null;
	created_at: string;
	short_name: string | null;
}
