import { z } from "zod";
import { blankToNull } from "./players";

// Money is stored as whole kobo (₦1 = 100 kobo), the unit Paystack uses.
export const toKobo = (naira: number) => Math.round(naira * 100);
export const toNaira = (kobo: number) => kobo / 100;

// 2500000 -> "₦25,000"; 250050 -> "₦2,500.50"
export const formatNaira = (kobo: number) =>
	new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: kobo % 100 ? 2 : 0,
		maximumFractionDigits: 2,
	}).format(kobo / 100);

// "Home jersey 2026" -> "home-jersey-2026"
export const slugify = (text: string) =>
	text
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

// how many of one item a customer can buy in one order
export const MAX_QUANTITY = 20;
// show "Only N left" at or below this
export const LOW_STOCK = 3;

export const ORDER_STATUSES = [
	{ value: "needs_attention", label: "Needs attention" },
	{ value: "paid", label: "Paid" },
	{ value: "ready", label: "Ready" },
	{ value: "completed", label: "Completed" },
	{ value: "pending_payment", label: "Awaiting payment" },
	{ value: "cancelled", label: "Cancelled" },
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];

export const orderStatusLabel = (status: OrderStatus) =>
	ORDER_STATUSES.find((item) => item.value === status)?.label ?? status;

export const FULFILMENTS = [
	{ value: "pickup", label: "Pickup" },
	{ value: "delivery", label: "Delivery within Lagos" },
] as const;
export type Fulfilment = (typeof FULFILMENTS)[number]["value"];

const naira = (label: string) =>
	z
		.number(`${label} must be a number`)
		.min(0, `${label} cannot be negative`)
		.max(10_000_000, `${label} is too high`)
		.refine(
			(value) => Number.isInteger(Math.round(value * 100 * 1e6) / 1e6),
			`${label} can have at most 2 decimal places`,
		);

/* ---------- admin: products ---------- */

export const variantInputSchema = z.object({
	// set for sizes that already exist, left out for new ones
	id: z.number().int().positive().optional(),
	label: z
		.string("Each size needs a name")
		.trim()
		.min(1, "Each size needs a name")
		.max(40, "Size name is too long"),
	stock: z
		.number("Stock must be a number")
		.int("Stock must be a whole number")
		.min(0, "Stock cannot be negative")
		.max(100_000, "Stock is too high"),
	is_active: z.boolean().default(true),
});

export type VariantInput = z.output<typeof variantInputSchema>;

// Validates a product with its sizes. Shared by the admin form and the server
// routes. The price is in naira here; the server stores it as kobo.
export const productInputSchema = z.object({
	name: z
		.string("Product name is required")
		.trim()
		.min(1, "Product name is required")
		.max(120, "Product name is too long"),
	slug: z
		.string("Web address is required")
		.trim()
		.regex(
			/^[a-z0-9]+(-[a-z0-9]+)*$/,
			"Web address can only use lowercase letters, numbers and single dashes",
		)
		.max(80, "Web address is too long"),
	description: z.string().trim().max(5000, "Description is too long").default(""),
	price: naira("Price"),
	option_name: z
		.string("Option name is required")
		.trim()
		.min(1, "Option name is required")
		.max(30, "Option name is too long"),
	// the first image is the cover
	image_urls: z
		.array(z.url({ protocol: /^https?$/ }))
		.max(8, "Up to 8 images")
		.default([]),
	is_active: z.boolean().default(false),
	is_featured: z.boolean().default(false),
	display_order: z.preprocess(
		(value) => (value === "" || value == null ? 0 : value),
		z
			.number("Order must be a number")
			.int("Order must be a whole number")
			.min(0, "Order cannot be negative")
			.max(999, "Order is too high"),
	),
	variants: z
		.array(variantInputSchema)
		.min(1, "Add at least one size, or “One size”")
		.max(30, "Too many sizes")
		.refine(
			(variants) =>
				new Set(variants.map((variant) => variant.label.toLowerCase())).size ===
				variants.length,
			"Each size name can only be used once",
		),
});

export type ProductInput = z.output<typeof productInputSchema>;

/* ---------- admin: settings and orders ---------- */

export const shopSettingsSchema = z.object({
	pickup_address: z
		.string("Pickup address is required")
		.trim()
		.min(1, "Pickup address is required")
		.max(500, "Pickup address is too long"),
	delivery_fee: naira("Delivery fee"),
	outside_lagos_message: z
		.string("Message is required")
		.trim()
		.min(1, "Message is required")
		.max(500, "Message is too long"),
});

export type ShopSettingsInput = z.output<typeof shopSettingsSchema>;

// staff can't put an order back to "awaiting payment"
export const orderUpdateSchema = z.object({
	status: z.enum(
		["needs_attention", "paid", "ready", "completed", "cancelled"],
		"Choose a status",
	),
});

/* ---------- public: checkout ---------- */

// the customer's details, without the cart
const checkoutDetails = z.object({
		customer_name: z
			.string("Your name is required")
			.trim()
			.min(1, "Your name is required")
			.max(200, "Name is too long"),
		customer_email: z
			.string("Your email is required")
			.trim()
			.min(1, "Your email is required")
			.pipe(z.email("Enter a valid email address").max(320, "Email is too long")),
		customer_phone: z
			.string("Your phone number is required")
			.trim()
			.min(7, "Enter a phone number we can reach you on")
			.max(40, "Phone number is too long"),
		fulfilment: z.enum(["pickup", "delivery"], "Choose pickup or delivery"),
		delivery_address: z.preprocess(
			blankToNull,
			z.string().trim().max(500, "Address is too long").nullable(),
		),
	});

// delivery needs somewhere to deliver to
const hasAddress = (order: { fulfilment: string; delivery_address: string | null }) =>
	order.fulfilment === "pickup" || !!order.delivery_address;
const addressMissing = { message: "Enter the delivery address", path: ["delivery_address"] };

// the checkout form in the browser
export const checkoutFormSchema = checkoutDetails.refine(hasAddress, addressMissing);

// the whole order as the server receives it
export const checkoutSchema = checkoutDetails
	.extend({
		items: z
			.array(
				z.object({
					variant_id: z.number().int().positive(),
					quantity: z
						.number()
						.int()
						.min(1)
						.max(MAX_QUANTITY, `At most ${MAX_QUANTITY} of one item`),
				}),
			)
			.min(1, "Your cart is empty")
			.max(30, "Too many different items"),
	})
	.refine(hasAddress, addressMissing);

export type CheckoutInput = z.output<typeof checkoutSchema>;
