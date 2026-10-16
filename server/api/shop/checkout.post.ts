// Turns a cart into an order and starts the Paystack payment for it.
// Prices and stock come from the database, never from the browser.
// Rate limited in nuxt.config.ts.
export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	// a field people never see; only bots fill it in
	if (typeof body?.website === "string" && body.website.trim() !== "") {
		throw createError({ statusCode: 400, statusMessage: "Invalid order" });
	}
	const result = checkoutSchema.safeParse(body);
	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid order",
			message: result.error.issues.map((issue) => issue.message).join(". "),
		});
	}
	const checkout = result.data;
	const supabase = useSupabaseAdmin();

	// the same size twice in the cart counts as one line
	const quantities = new Map<number, number>();
	for (const { variant_id, quantity } of checkout.items)
		quantities.set(variant_id, (quantities.get(variant_id) ?? 0) + quantity);

	const { data: variants, error } = await supabase
		.from("product_variants")
		.select("id, label, stock, is_active, product:products(name, price_kobo, is_active)")
		.in("id", [...quantities.keys()]);
	failOnSupabaseError(error, "Could not load the items in your cart");

	type Row = {
		id: number;
		label: string;
		stock: number;
		is_active: boolean;
		product: { name: string; price_kobo: number; is_active: boolean };
	};
	const rows = (variants ?? []) as unknown as Row[];

	const problems: string[] = [];
	const items = [...quantities].map(([variantId, quantity]) => {
		const row = rows.find((variant) => variant.id === variantId);
		if (!row || !row.is_active || !row.product.is_active) {
			problems.push("An item in your cart is no longer for sale");
		} else if (row.stock < quantity) {
			problems.push(
				row.stock === 0
					? `${row.product.name} (${row.label}) has sold out`
					: `Only ${row.stock} of ${row.product.name} (${row.label}) left`,
			);
		}
		return {
			variant_id: variantId,
			product_name: row?.product.name ?? "",
			variant_label: row?.label ?? "",
			unit_price_kobo: row?.product.price_kobo ?? 0,
			quantity,
		};
	});
	if (problems.length) {
		throw createError({
			statusCode: 409,
			statusMessage: "Cart has changed",
			message: `${problems.join(". ")}. Please update your cart.`,
		});
	}

	const settings = await fetchShopSettings();
	const subtotal = items.reduce((sum, item) => sum + item.unit_price_kobo * item.quantity, 0);
	const deliveryFee = checkout.fulfilment === "delivery" ? settings.delivery_fee_kobo : 0;
	if (subtotal + deliveryFee <= 0) {
		throw createError({ statusCode: 400, statusMessage: "Nothing to pay for" });
	}

	const reference = newOrderReference();
	const { data: order, error: orderError } = await supabase
		.from("orders")
		.insert({
			reference,
			customer_name: checkout.customer_name,
			customer_email: checkout.customer_email,
			customer_phone: checkout.customer_phone,
			fulfilment: checkout.fulfilment,
			delivery_address: checkout.fulfilment === "delivery" ? checkout.delivery_address : null,
			subtotal_kobo: subtotal,
			delivery_fee_kobo: deliveryFee,
		})
		.select("id, total_kobo")
		.single();
	failOnSupabaseError(orderError, "Could not create your order");

	const { error: itemsError } = await supabase
		.from("order_items")
		.insert(items.map((item) => ({ ...item, order_id: order.id })));
	if (itemsError) {
		await supabase.from("orders").delete().eq("id", order.id);
		failOnSupabaseError(itemsError, "Could not create your order");
	}

	try {
		const payment = await startPayment({
			email: checkout.customer_email,
			amountKobo: order.total_kobo,
			reference,
			callbackUrl: `${getRequestURL(event).origin}/shop/orders/${reference}`,
		});
		return { reference, payment_url: payment.authorization_url };
	} catch (paymentError) {
		// nothing was paid, so the order can go
		await supabase.from("orders").delete().eq("id", order.id);
		throw paymentError;
	}
});
