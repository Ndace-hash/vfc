import { z } from "zod";
import type { Match } from "~/types/Match";

const MAX_ROWS = 1000;

const bodySchema = z.object({
	// `row` is the spreadsheet row number, echoed back so the admin can find it
	matches: z
		.array(z.looseObject({ row: z.number().int() }))
		.min(1)
		.max(MAX_ROWS),
});

interface RowReport {
	row: number;
	reason: string;
}

// Bulk add fixtures. Team names were already turned into team ids in the
// browser; any new teams were created there first, after the admin agreed.
// Fixtures that already exist (same teams, same day) are skipped.
export default defineEventHandler(async (event) => {
	const body = bodySchema.safeParse(await readBody(event));
	if (!body.success) {
		throw createError({
			statusCode: 400,
			statusMessage: `Send between 1 and ${MAX_ROWS} fixtures`,
		});
	}

	const [existing, teams] = await Promise.all([
		fetchAllMatches(),
		fetchAllTeams(),
	]);
	const teamIds = new Set(teams.map((team) => team.id));

	const skipped: RowReport[] = [];
	const failed: RowReport[] = [];
	const accepted: { row: number; match: MatchInput }[] = [];

	for (const { row, ...values } of body.data.matches) {
		const result = matchInputSchema.safeParse(values);
		if (!result.success) {
			failed.push({
				row,
				reason: result.error.issues.map((issue) => issue.message).join(". "),
			});
			continue;
		}
		const match = result.data;
		if (!teamIds.has(match.home_team) || !teamIds.has(match.away_team)) {
			failed.push({ row, reason: "One of the teams no longer exists" });
		} else if (
			existing.some(
				(other) =>
					other.start_time &&
					isSameFixture({ ...other, start_time: other.start_time }, match),
			)
		) {
			skipped.push({ row, reason: "Already in the database" });
		} else if (accepted.some((other) => isSameFixture(other.match, match))) {
			skipped.push({ row, reason: "Appears more than once in the file" });
		} else {
			accepted.push({ row, match });
		}
	}

	const supabase = useSupabaseAdmin();
	const inserted: Match[] = [];
	if (accepted.length) {
		const { data, error } = await supabase
			.from("matches")
			.insert(accepted.map(({ match }) => toMatchRow(match)))
			.select();
		if (!error) {
			inserted.push(...(data as Match[]));
		} else {
			// A batch insert is all or nothing. Retry one row at a time so a single
			// bad row does not block the rest, and report exactly which rows failed.
			for (const { row, match } of accepted) {
				const single = await supabase
					.from("matches")
					.insert(toMatchRow(match))
					.select()
					.single();
				if (single.error) {
					failed.push({ row, reason: single.error.message });
				} else {
					inserted.push(single.data as Match);
				}
			}
		}
	}

	return { inserted, skipped, failed };
});
