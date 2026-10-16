export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id") as string;
	const sponsor = await readBodyAs(event, sponsorInputSchema, "Invalid sponsor");
	const { data, error } = await useSupabaseAdmin()
		.from("sponsors")
		.update({ ...sponsor, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.maybeSingle();
	failOnSponsorError(error, "Could not update the sponsor");
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: "Sponsor not found" });
	}
	return data;
});
