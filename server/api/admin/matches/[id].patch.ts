export default defineEventHandler(async (event) => {
	const id = Number(getRouterParam(event, "id"));
	if (!Number.isInteger(id)) {
		throw createError({ statusCode: 404, statusMessage: "Fixture not found" });
	}
	const match = await readMatchBody(event);
	// competition and status are left as they are
	const { data, error } = await useSupabaseAdmin()
		.from("matches")
		.update(match)
		.eq("id", id)
		.select()
		.maybeSingle();
	failOnSupabaseError(error, "Could not update the fixture");
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: "Fixture not found" });
	}
	return data;
});
