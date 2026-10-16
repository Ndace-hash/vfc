import type { PaystackTransaction } from "../../utils/paystack";

// Paystack calls this when a payment succeeds. Set its URL in the Paystack
// dashboard (Settings > API Keys & Webhooks) to https://<site>/api/paystack/webhook.
// It can't reach localhost; there the confirmation page records payments instead.
export default defineEventHandler(async (event) => {
	const rawBody = (await readRawBody(event, "utf8")) ?? "";
	if (!isPaystackSignature(rawBody, getHeader(event, "x-paystack-signature"))) {
		throw createError({ statusCode: 401, statusMessage: "Bad signature" });
	}

	const payload = JSON.parse(rawBody) as { event: string; data: PaystackTransaction };
	if (payload.event === "charge.success") {
		const status = await recordPayment(payload.data);
		console.info(`[paystack] ${payload.data.reference}: ${status}`);
	}
	// anything else is acknowledged and ignored, so Paystack doesn't keep retrying
	return { received: true };
});
