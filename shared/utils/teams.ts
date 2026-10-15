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

// "Valiant FC" and " valiant  fc " are the same team
export const isSameTeamName = (a: string, b: string) => {
	const normalize = (name: string) =>
		name.trim().replace(/\s+/g, " ").toLowerCase();
	return normalize(a) === normalize(b);
};
