export default defineEventHandler(async (event) => {
	const id = Number(getRouterParam(event, "id"));
	const product = await readProductBody(event);
	const { data, error } = await useSupabaseAdmin()
		.from("products")
		.update({ ...toProductRow(product), updated_at: new Date().toISOString() })
		.eq("id", id)
		.select("id")
		.maybeSingle();
	failOnProductError(error, "Could not update the product");
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: "Product not found" });
	}
	await saveVariants(id, product.variants);
	return fetchAdminProduct(id);
});
