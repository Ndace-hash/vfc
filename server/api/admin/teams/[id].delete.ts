// Postgres error code for "another row still points at this one"
const FOREIGN_KEY_VIOLATION = "23503";

export default defineEventHandler(async (event) => {
	const id = getRouterParam(event, "id") as string;
	const { data, error } = await useSupabaseAdmin()
		.from("teams")
		.delete()
		.eq("id", id)
		.select("id")
		.maybeSingle();

	if (error?.code === FOREIGN_KEY_VIOLATION) {
		throw createError({
			statusCode: 409,
			statusMessage: "Team is in use",
			message:
				"This team still has players or matches, so it cannot be deleted",
		});
	}
	failOnSupabaseError(error, "Could not delete the team");
	if (!data) {
		throw createError({ statusCode: 404, statusMessage: "Team not found" });
	}
	return { deleted: data.id as string };
});
