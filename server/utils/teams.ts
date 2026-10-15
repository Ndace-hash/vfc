import type { H3Event } from "h3";
import type { Team } from "~/types/Team";

export const fetchAllTeams = async () => {
	const { data, error } = await useSupabaseAdmin()
		.from("teams")
		.select("*")
		.order("name");
	failOnSupabaseError(error, "Could not load teams");
	return (data ?? []) as Team[];
};

// Reads and validates a team from the request body, and makes sure no other
// team already has that name. Pass `exceptId` when renaming an existing team.
export const readTeamBody = async (event: H3Event, exceptId?: string) => {
	const result = teamInputSchema.safeParse(await readBody(event));
	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid team",
			message: result.error.issues.map((issue) => issue.message).join(". "),
		});
	}

	const teams = await fetchAllTeams();
	const taken = teams.some(
		(team) =>
			team.id !== exceptId && isSameTeamName(team.name, result.data.name),
	);
	if (taken) {
		throw createError({
			statusCode: 409,
			statusMessage: "Team already exists",
			message: `A team called "${result.data.name}" already exists`,
		});
	}
	return result.data;
};
