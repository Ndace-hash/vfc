export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id") as string;
	const player = await readPlayerBody(event);
	const { data, error } = await useSupabaseAdmin()
		.from("players")
		.update({ ...player, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.maybeSingle();
	failOnSupabaseError(error, "Could not update the player");
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: "Player not found" });
	}
	return data;
});
