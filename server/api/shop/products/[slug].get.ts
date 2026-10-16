export default defineEventHandler(async (event) => {
	const slug = getRouterParam(event, "slug") as string;
	const [product] = await fetchPublicProducts({ slug });
	if (!product) {
		throw createError({ statusCode: 404, statusMessage: "Product not found" });
	}
	return product;
});
