export default defineEventHandler(async (event) => {
	const team = await readTeamBody(event);
	const { data, error } = await useSupabaseAdmin()
		.from("teams")
		.insert(team)
		.select()
		.single();
	failOnSupabaseError(error, "Could not add the team");
	return data;
});
