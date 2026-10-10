import { z } from "zod";

const bodySchema = z.object({ ids: z.array(z.uuid()).min(1).max(1000) });

// Deletes one or many players: { ids: [...] }
export default defineEventHandler(async (event) => {
	const body = bodySchema.safeParse(await readBody(event));
	if (!body.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Send the ids of the players to delete",
		});
	}
	const { data, error } = await useSupabaseAdmin()
		.from("players")
		.delete()
		.in("id", body.data.ids)
		.select("id");
	failOnSupabaseError(error, "Could not delete the players");
	return { deleted: (data ?? []).map((player) => player.id as string) };
});
