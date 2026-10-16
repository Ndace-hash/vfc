import { randomInt } from "node:crypto";
import type {
	AdminProduct,
	Order,
	PublicOrder,
	PublicProduct,
	ShopSettings,
} from "~/types/Shop";

// Postgres error code for "another row still points at this one"
export const FOREIGN_KEY_VIOLATION = "23503";
// Postgres error code for a unique rule refusing a row
export const UNIQUE_VIOLATION = "23505";

const byDisplayOrder = (a: { display_order: number }, b: { display_order: number }) =>
	a.display_order - b.display_order;

/* ---------- products ---------- */

// every product with every size, for the admin
export const fetchAdminProducts = async () => {
	const { data, error } = await useSupabaseAdmin()
		.from("products")
		.select("*, variants:product_variants(*)")
		.order("display_order")
		.order("name");
	failOnSupabaseError(error, "Could not load products");
	return ((data ?? []) as AdminProduct[]).map((product) => ({
		...product,
		variants: product.variants.sort(byDisplayOrder),
	}));
};

// Published products with their available sizes. Pass a slug for just one.
export const fetchPublicProducts = async ({
	slug,
	featured,
}: { slug?: string; featured?: boolean } = {}) => {
	let query = useSupabaseAdmin()
		.from("products")
		.select(
			"id, slug, name, description, price_kobo, option_name, image_urls, is_featured, display_order, variants:product_variants(id, label, stock, display_order, is_active)",
		)
		.eq("is_active", true)
		.order("display_order")
		.order("name");
	if (slug) query = query.eq("slug", slug);
	if (featured) query = query.eq("is_featured", true);

	const { data, error } = await query;
	failOnSupabaseError(error, "Could not load products");
	return ((data ?? []) as unknown as (PublicProduct & {
		display_order: number;
		variants: { id: number; label: string; stock: number; display_order: number; is_active: boolean }[];
	})[]).map(
		({ display_order: _order, variants, ...product }): PublicProduct => ({
			...product,
			variants: variants
				.filter((variant) => variant.is_active)
				.sort(byDisplayOrder)
				.map(({ id, label, stock }) => ({ id, label, stock })),
		}),
	);
};

/* ---------- settings ---------- */

export const fetchShopSettings = async () => {
	const { data, error } = await useSupabaseAdmin()
		.from("shop_settings")
		.select("pickup_address, delivery_fee_kobo, outside_lagos_message, updated_at")
		.single();
	failOnSupabaseError(error, "Could not load shop settings");
	return data as ShopSettings;
};

/* ---------- orders ---------- */

// no 0/O or 1/I, so a reference read out over the phone can't be misheard
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// "VFC-7K2M9QXA": about a trillion possibilities, so it can't be guessed
export const newOrderReference = () =>
	"VFC-" +
	Array.from(
		{ length: 8 },
		() => REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)],
	).join("");

export const ORDER_COLUMNS = "*, items:order_items(*)";

export const fetchOrderByReference = async (reference: string) => {
	const { data, error } = await useSupabaseAdmin()
		.from("orders")
		.select(ORDER_COLUMNS)
		.eq("reference", reference.toUpperCase())
		.maybeSingle();
	failOnSupabaseError(error, "Could not load the order");
	return data as Order | null;
};

// what the customer may see of their own order
export const toPublicOrder = (
	order: Order,
	settings: Pick<ShopSettings, "pickup_address">,
): PublicOrder => ({
	reference: order.reference,
	status: order.status,
	created_at: order.created_at,
	customer_name: order.customer_name,
	fulfilment: order.fulfilment,
	delivery_address: order.delivery_address,
	pickup_address: order.fulfilment === "pickup" ? settings.pickup_address : null,
	subtotal_kobo: order.subtotal_kobo,
	delivery_fee_kobo: order.delivery_fee_kobo,
	total_kobo: order.total_kobo,
	items: order.items.map(({ product_name, variant_label, unit_price_kobo, quantity }) => ({
		product_name,
		variant_label,
		unit_price_kobo,
		quantity,
	})),
});
