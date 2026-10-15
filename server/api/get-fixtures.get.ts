import type { PublicFixture } from "~/types/Match";

const COLUMNS =
	"id, start_time, home_score, away_score, home:teams!matches_home_team_fkey(name, crest_url), away:teams!matches_away_team_fkey(name, crest_url)";

interface FixtureRow {
	id: number;
	start_time: string;
	home_score: number | null;
	away_score: number | null;
	home: { name: string; crest_url: string | null };
	away: { name: string; crest_url: string | null };
}

const toPublicFixture = (row: FixtureRow): PublicFixture => ({
	id: row.id,
	start_time: row.start_time,
	kickoff: {
		day: formatKickoffDay(row.start_time),
		time: kickoffParts(row.start_time).time,
	},
	played: row.home_score !== null && row.away_score !== null,
	home: row.home,
	away: row.away,
	goals: { home: row.home_score ?? 0, away: row.away_score ?? 0 },
});

// [upcoming fixtures, soonest first; past fixtures, most recent first]
export default defineEventHandler(async () => {
	const supabase = useSupabaseAdmin();
	const now = new Date().toISOString();
	const [upcoming, past] = await Promise.all([
		supabase
			.from("matches")
			.select(COLUMNS)
			.gte("start_time", now)
			.order("start_time", { ascending: true })
			.limit(20),
		supabase
			.from("matches")
			.select(COLUMNS)
			.lt("start_time", now)
			.order("start_time", { ascending: false })
			.limit(20),
	]);
	failOnSupabaseError(upcoming.error, "Could not load fixtures");
	failOnSupabaseError(past.error, "Could not load results");

	const toFixtures = (rows: unknown) =>
		((rows ?? []) as FixtureRow[]).map(toPublicFixture);
	return [toFixtures(upcoming.data), toFixtures(past.data)];
});
