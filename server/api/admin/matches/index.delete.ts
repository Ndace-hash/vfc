import { z } from "zod";

const bodySchema = z.object({
	ids: z.array(z.number().int()).min(1).max(1000),
});

// Deletes one or many fixtures: { ids: [...] }
export default defineEventHandler(async (event) => {
	const body = bodySchema.safeParse(await readBody(event));
	if (!body.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Send the ids of the fixtures to delete",
		});
	}
	const { data, error } = await useSupabaseAdmin()
		.from("matches")
		.delete()
		.in("id", body.data.ids)
		.select("id");
	failOnSupabaseError(error, "Could not delete the fixtures");
	return { deleted: (data ?? []).map((match) => match.id as number) };
});
