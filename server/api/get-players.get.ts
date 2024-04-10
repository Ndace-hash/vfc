export default defineEventHandler(async () => {
	const { data, error } = await fetchDoc({ collectionRef: "players" });
	if (error) {
		return {
			message: "Error: Something went wrong!",
		};
	}
	return data;
});
