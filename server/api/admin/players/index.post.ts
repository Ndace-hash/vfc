export default defineEventHandler(async (event) => {
	const player = await readPlayerBody(event);
	const { data, error } = await useSupabaseAdmin()
		.from("players")
		.insert(player)
		.select()
		.single();
	failOnSupabaseError(error, "Could not add the player");
	return data;
});
