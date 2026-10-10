// Public squad list: active players only, limited to the public columns
export default defineEventHandler(async () => {
	const { data, error } = await useSupabaseAdmin()
		.from("players")
		.select(PUBLIC_PLAYER_COLUMNS)
		.eq("is_active", true)
		.order("jersey_number", { ascending: true, nullsFirst: false })
		.order("full_name");
	failOnSupabaseError(error, "Could not load players");
	return data ?? [];
});
