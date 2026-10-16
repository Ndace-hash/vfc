// Staff change an enquiry's status and notes
export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id") as string;
	const update = await readBodyAs(event, enquiryUpdateSchema, "Invalid change");
	const { data, error } = await useSupabaseAdmin()
		.from("sponsor_enquiries")
		.update({ ...update, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.maybeSingle();
	failOnSupabaseError(error, "Could not update the enquiry");
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: "Enquiry not found" });
	}
	return data;
});
