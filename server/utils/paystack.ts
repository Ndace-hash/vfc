import { createHmac, timingSafeEqual } from "node:crypto";

// Paystack's API: https://paystack.com/docs/api/
// Test mode until the club's account is approved: the key starts with sk_test_.
const PAYSTACK_API = "https://api.paystack.co";

const secretKey = () => {
	const key =
		useRuntimeConfig().paystackSecretKey || process.env.PAYSTACK_SECRET_KEY;
	if (!key) {
		console.error(
			"[paystack] Payments are not set up: set PAYSTACK_SECRET_KEY in .env (the test key starts with sk_test_)",
		);
		throw createError({
			statusCode: 503,
			statusMessage: "Payments are not set up",
			message: "Online payment isn’t available right now. Please try again later.",
		});
	}
	return key;
};

interface PaystackResponse<T> {
	status: boolean;
	message: string;
	data: T;
}

const paystack = async <T>(
	path: string,
	options: { method?: "GET" | "POST"; body?: object } = {},
) => {
	try {
		const response = await $fetch<PaystackResponse<T>>(PAYSTACK_API + path, {
			method: options.method ?? "GET",
			body: options.body,
			headers: { Authorization: `Bearer ${secretKey()}` },
			timeout: 20_000,
		});
		return response.data;
	} catch (error) {
		const failure = error as { data?: { message?: string }; statusCode?: number };
		if (failure.statusCode === 503) throw error;
		console.error("[paystack]", path, failure.data?.message ?? error);
		throw createError({
			statusCode: 502,
			statusMessage: "Payment service error",
			message:
				"We couldn’t reach the payment service. Please try again in a moment.",
		});
	}
};

// Starts a payment and returns the Paystack page to send the customer to
export const startPayment = (payment: {
	email: string;
	amountKobo: number;
	reference: string;
	callbackUrl: string;
}) =>
	paystack<{ authorization_url: string; reference: string }>(
		"/transaction/initialize",
		{
			method: "POST",
			body: {
				email: payment.email,
				amount: payment.amountKobo,
				currency: "NGN",
				reference: payment.reference,
				callback_url: payment.callbackUrl,
			},
		},
	);

export interface PaystackTransaction {
	id: number;
	status: string; // "success", "failed", "abandoned", ...
	reference: string;
	amount: number; // kobo
	currency: string;
}

// Asks Paystack how a payment went. Returns null if Paystack has no such payment.
export const checkPayment = async (reference: string) => {
	try {
		return await paystack<PaystackTransaction>(
			`/transaction/verify/${encodeURIComponent(reference)}`,
		);
	} catch (error) {
		// the customer may have left before paying: Paystack doesn't know the reference
		if ((error as { statusCode?: number }).statusCode === 502) return null;
		throw error;
	}
};

// Paystack signs each webhook with HMAC-SHA512 of the raw body, keyed with the secret key
export const isPaystackSignature = (rawBody: string, signature: string | undefined) => {
	if (!signature) return false;
	const expected = createHmac("sha512", secretKey()).update(rawBody).digest("hex");
	const given = Buffer.from(signature, "utf8");
	const wanted = Buffer.from(expected, "utf8");
	return given.length === wanted.length && timingSafeEqual(given, wanted);
};

// Records a successful payment against its order: checks the amount, takes the
// stock and marks the order paid, or flags it needs_attention (see
// mark_order_paid in supabase/migrations/0002_shop.sql). Safe to repeat.
export const recordPayment = async (transaction: PaystackTransaction) => {
	if (transaction.status !== "success" || transaction.currency !== "NGN") return null;
	const { data, error } = await useSupabaseAdmin().rpc("mark_order_paid", {
		p_reference: transaction.reference,
		p_transaction_id: transaction.id,
		p_amount_kobo: transaction.amount,
	});
	failOnSupabaseError(error, "Could not record the payment");
	return data as string;
};
