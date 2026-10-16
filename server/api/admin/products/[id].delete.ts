export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id") as string;
	const { data, error } = await useSupabaseAdmin()
		.from("products")
		.delete()
		.eq("id", id)
		.select("id")
		.maybeSingle();

	if (error?.code === FOREIGN_KEY_VIOLATION) {
		throw createError({
			statusCode: 409,
			statusMessage: "Product has been ordered",
			message:
				"This product has been ordered, so it can’t be deleted. Turn off “Published” to take it out of the shop instead.",
		});
	}
	failOnSupabaseError(error, "Could not delete the product");
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: "Product not found" });
	}
	return { deleted: data.id as number };
});
