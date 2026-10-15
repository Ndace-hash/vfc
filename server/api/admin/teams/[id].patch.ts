export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id") as string;
	const team = await readTeamBody(event, id);
	const { data, error } = await useSupabaseAdmin()
		.from("teams")
		.update(team)
		.eq("id", id)
		.select()
		.maybeSingle();
	failOnSupabaseError(error, "Could not update the team");
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: "Team not found" });
	}
	return data;
});
