export default defineEventHandler(async (event) => {
	const sponsor = await readBodyAs(event, sponsorInputSchema, "Invalid sponsor");
	const { data, error } = await useSupabaseAdmin()
		.from("sponsors")
		.insert(sponsor)
		.select()
		.single();
	failOnSponsorError(error, "Could not add the sponsor");
	return data;
});
