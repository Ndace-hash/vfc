import type { H3Event } from "h3";
import type { AdminProduct } from "~/types/Shop";

export const readProductBody = (event: H3Event) =>
	readBodyAs(event, productInputSchema, "Invalid product");

// the product's own columns, with the price in kobo
export const toProductRow = ({ variants: _variants, price, ...product }: ProductInput) => ({
	...product,
	price_kobo: toKobo(price),
});

export const failOnProductError = (
	error: { code?: string; message: string } | null,
	action: string,
) => {
	if (error?.code === UNIQUE_VIOLATION) {
		throw createError({
			statusCode: 409,
			statusMessage: "Already taken",
			message: error.message.includes("slug")
				? "Another product already uses that web address"
				: "Each size name can only be used once",
		});
	}
	failOnSupabaseError(error, action);
};

export const fetchAdminProduct = async (id: number | string) => {
	const { data, error } = await useSupabaseAdmin()
		.from("products")
		.select("*, variants:product_variants(*)")
		.eq("id", id)
		.maybeSingle();
	failOnSupabaseError(error, "Could not load the product");
	if (!data) throw createError({ statusCode: 404, statusMessage: "Product not found" });
	const product = data as AdminProduct;
	product.variants.sort((a, b) => a.display_order - b.display_order);
	return product;
};

// Makes the product's sizes match the form: updates the ones that are kept,
// adds new ones, and removes the rest. A size that has been ordered can't be
// removed (order history points at it), so it is hidden instead.
export const saveVariants = async (productId: number, variants: VariantInput[]) => {
	const supabase = useSupabaseAdmin();
	const { data: existing, error } = await supabase
		.from("product_variants")
		.select("id")
		.eq("product_id", productId);
	failOnSupabaseError(error, "Could not load the sizes");

	const keep = new Set(variants.flatMap((variant) => (variant.id ? [variant.id] : [])));
	for (const { id } of existing ?? []) {
		if (keep.has(id)) continue;
		const removed = await supabase.from("product_variants").delete().eq("id", id);
		if (removed.error?.code === FOREIGN_KEY_VIOLATION) {
			const hidden = await supabase
				.from("product_variants")
				.update({ is_active: false })
				.eq("id", id);
			failOnSupabaseError(hidden.error, "Could not hide a size");
		} else {
			failOnSupabaseError(removed.error, "Could not remove a size");
		}
	}

	for (const [display_order, { id, ...variant }] of variants.entries()) {
		const row = { ...variant, display_order, product_id: productId };
		const { error } = id
			? await supabase.from("product_variants").update(row).eq("id", id).eq("product_id", productId)
			: await supabase.from("product_variants").insert(row);
		failOnProductError(error, "Could not save a size");
	}
};
