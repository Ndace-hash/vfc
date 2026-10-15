import type { H3Event } from "h3";
import type { Match } from "~/types/Match";

const PAGE_SIZE = 1000;

// Supabase returns at most 1000 rows per request, so read in pages
export const fetchAllMatches = async () => {
	const supabase = useSupabaseAdmin();
	const matches: Match[] = [];
	for (let from = 0; ; from += PAGE_SIZE) {
		const { data, error } = await supabase
			.from("matches")
			.select("*")
			.order("start_time", { ascending: false, nullsFirst: false })
			.order("id")
			.range(from, from + PAGE_SIZE - 1);
		failOnSupabaseError(error, "Could not load fixtures");
		matches.push(...((data ?? []) as Match[]));
		if (!data || data.length < PAGE_SIZE) return matches;
	}
};

// `competition_id` defaults to a random id in the database, which would fail
// its link to `competitions`, and `match_status` has no rows yet. Both are
// written as empty until competitions and statuses are set up.
export const toMatchRow = (match: MatchInput) => ({
	...match,
	competition_id: null,
	status: null,
});

const validationError = (message: string) =>
	createError({ statusCode: 400, statusMessage: "Invalid fixture", message });

export const readMatchBody = async (event: H3Event) => {
	const result = matchInputSchema.safeParse(await readBody(event));
	if (!result.success) {
		throw validationError(
			result.error.issues.map((issue) => issue.message).join(". "),
		);
	}
	const teamIds = new Set((await fetchAllTeams()).map((team) => team.id));
	if (
		!teamIds.has(result.data.home_team) ||
		!teamIds.has(result.data.away_team)
	) {
		throw validationError(
			"One of the teams no longer exists. Refresh and try again",
		);
	}
	return result.data;
};
