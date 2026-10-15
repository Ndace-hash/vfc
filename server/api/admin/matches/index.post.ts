export default defineEventHandler(async (event) => {
	const match = await readMatchBody(event);
	const { data, error } = await useSupabaseAdmin()
		.from("matches")
		.insert(toMatchRow(match))
		.select()
		.single();
	failOnSupabaseError(error, "Could not add the fixture");
	return data;
});
