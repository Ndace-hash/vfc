export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id") as string;
	const { data, error } = await useSupabaseAdmin()
		.from("sponsors")
		.delete()
		.eq("id", id)
		.select("id")
		.maybeSingle();
	failOnSupabaseError(error, "Could not delete the sponsor");
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: "Sponsor not found" });
	}
	return { deleted: data.id as number };
});
