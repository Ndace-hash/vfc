// A customer looks up their own order with its reference and their email.
// While the order is still awaiting payment, Paystack is asked whether it has
// been paid, so the confirmation page works even if the webhook is slow.
// Rate limited in nuxt.config.ts.
export default defineEventHandler(async (event) => {
	const reference = (getRouterParam(event, "reference") as string).toUpperCase();
	const email = String(getQuery(event).email ?? "").trim().toLowerCase();

	const notFound = () =>
		createError({
			statusCode: 404,
			statusMessage: "Order not found",
			message: "We couldn’t find an order with that number and email.",
		});

	let order = await fetchOrderByReference(reference);
	// same answer for a wrong email as for a missing order
	if (!order || order.customer_email.toLowerCase() !== email) throw notFound();

	if (order.status === "pending_payment") {
		try {
			const transaction = await checkPayment(reference);
			if (transaction && (await recordPayment(transaction)))
				order = (await fetchOrderByReference(reference)) ?? order;
		} catch (error) {
			// Paystack unreachable: show the order as it stands; the next look will retry
			console.error("[shop] checking payment for", reference, error);
		}
	}

	return toPublicOrder(order, await fetchShopSettings());
});
