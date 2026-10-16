// Orders staff need to act on (paid and waiting to be prepared, or needing
// attention), for the sidebar badge
export default defineEventHandler(async () => {
	const { count, error } = await useSupabaseAdmin()
		.from("orders")
		.select("id", { count: "exact", head: true })
		.in("status", ["paid", "needs_attention"]);
	failOnSupabaseError(error, "Could not count orders");
	return { count: count ?? 0 };
});
