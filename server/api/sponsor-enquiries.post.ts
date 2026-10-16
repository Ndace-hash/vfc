// The public "Become a sponsor" form. Rate limited in nuxt.config.ts.
export default defineEventHandler(async (event) => {
	const body = await readBody(event);

	// `website` is a field people never see; only bots fill it in. Answer as
	// if it worked, so they don't learn to leave it empty.
	if (typeof body?.website === "string" && body.website.trim() !== "") {
		return { ok: true };
	}

	const result = sponsorEnquirySchema.safeParse(body);
	if (!result.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid enquiry",
			message: result.error.issues.map((issue) => issue.message).join(". "),
		});
	}

	const { error } = await useSupabaseAdmin()
		.from("sponsor_enquiries")
		.insert(result.data);
	failOnSupabaseError(error, "Could not send your enquiry");
	return { ok: true };
});
