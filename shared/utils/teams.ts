import { z } from "zod";
import { blankToNull } from "./players";

// Validates a team as it is written to the Supabase `teams` table.
// Shared by the admin form and the server routes.
export const teamInputSchema = z.object({
	name: z
		.string("Team name is required")
		.trim()
		.min(2, "Team name is required")
		.max(120, "Team name is too long"),
	// optional for now: a team without a crest is shown with a placeholder
	crest_url: z.preprocess(
		blankToNull,
		z.url("Crest must be a full URL starting with http").nullable(),
	),
	// optional: left empty, it is stored as null
	short_name: z.preprocess(
		blankToNull,
		z
			.string()
			.trim()
			.min(2, "Short name must be at least 2 characters")
			.max(20, "Short name is too long")
			.nullable(),
	),
});

export type TeamInput = z.output<typeof teamInputSchema>;

// " Valiant  FC " -> "valiant fc": the form used to compare team names
export const teamNameKey = (name: string) =>
	name.trim().replace(/\s+/g, " ").toLowerCase();

// "Valiant FC" and " valiant  fc " are the same team
export const isSameTeamName = (a: string, b: string) =>
	teamNameKey(a) === teamNameKey(b);

// Finds the team a spreadsheet means by its full name or its short name
export const findTeamByName = <
	T extends { name: string; short_name?: string | null },
>(
	teams: T[],
	name: string,
) =>
	teams.find((team) => isSameTeamName(team.name, name)) ??
	teams.find(
		(team) => team.short_name && isSameTeamName(team.short_name, name),
	);
