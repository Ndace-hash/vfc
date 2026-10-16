export default defineEventHandler(async (event) => {
	const product = await readProductBody(event);
	const { data, error } = await useSupabaseAdmin()
		.from("products")
		.insert(toProductRow(product))
		.select("id")
		.single();
	failOnProductError(error, "Could not add the product");

	try {
		await saveVariants(data.id, product.variants);
	} catch (variantError) {
		// don't leave a product without sizes behind
		await useSupabaseAdmin().from("products").delete().eq("id", data.id);
		throw variantError;
	}
	return fetchAdminProduct(data.id);
});
