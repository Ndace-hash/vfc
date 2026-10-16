import type { Order } from "~/types/Shop";

// Staff move an order along: paid -> ready -> completed, or cancel it
export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id") as string;
	const { status } = await readBodyAs(event, orderUpdateSchema, "Invalid change");
	const supabase = useSupabaseAdmin();

	const { data: current, error: readError } = await supabase
		.from("orders")
		.select("status")
		.eq("id", id)
		.maybeSingle();
	failOnSupabaseError(readError, "Could not load the order");
	if (!current) throw createError({ statusCode: 404, statusMessage: "Order not found" });
	// only Paystack can mark an unpaid order paid; staff can only cancel it
	if (current.status === "pending_payment" && status !== "cancelled") {
		throw createError({
			statusCode: 409,
			statusMessage: "Not paid yet",
			message: "This order hasn’t been paid for yet, so it can only be cancelled.",
		});
	}

	const { data, error } = await supabase
		.from("orders")
		.update({ status, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select(ORDER_COLUMNS)
		.single();
	failOnSupabaseError(error, "Could not update the order");
	return data as Order;
});
