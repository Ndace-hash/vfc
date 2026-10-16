import type { Order } from "~/types/Shop";

// Newest first, with their items
export default defineEventHandler(async () => {
	const { data, error } = await useSupabaseAdmin()
		.from("orders")
		.select(ORDER_COLUMNS)
		.order("created_at", { ascending: false })
		.limit(1000);
	failOnSupabaseError(error, "Could not load orders");
	return (data ?? []) as Order[];
});
