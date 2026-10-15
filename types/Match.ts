// A row of the Supabase `matches` table
export interface Match {
	id: number;
	created_at: string;
	competition_id: string | null;
	home_team: string;
	away_team: string;
	// both null until the match has been played
	home_score: number | null;
	away_score: number | null;
	start_time: string | null;
	status: number | null;
}

// A fixture as the public site gets it from /api/get-fixtures
export interface PublicFixture {
	id: number;
	start_time: string;
	// in club time, ready to show: "Sat, 18 Oct 2026" and "15:00"
	kickoff: { day: string; time: string };
	played: boolean;
	home: { name: string; crest_url: string | null };
	away: { name: string; crest_url: string | null };
	goals: { home: number; away: number };
}
