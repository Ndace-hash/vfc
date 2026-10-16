// How many enquiries nobody has handled yet, for the sidebar badge
export default defineEventHandler(async () => {
	const { count, error } = await useSupabaseAdmin()
		.from("sponsor_enquiries")
		.select("id", { count: "exact", head: true })
		.eq("status", "new");
	failOnSupabaseError(error, "Could not count enquiries");
	return { count: count ?? 0 };
});
